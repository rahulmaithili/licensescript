// Netlify Serverless Function: Create Razorpay Order (SERVER-SIDE amounts)
// Endpoint: POST /.netlify/functions/create-razorpay-order  (or /api/create-razorpay-order)
//
// Security contract:
// - The caller must be a signed-in website user (Authorization: Bearer
//   <supabase-user-JWT>); the customer identity comes ONLY from the token.
// - The amount is computed HERE from the plans table (+ coupon validated
//   against the coupons table). A client-sent amount/discount is NEVER
//   trusted — the request body carries only plan_id + optional coupon_code.
// - The Razorpay Key SECRET is read ONLY from env RAZORPAY_KEY_SECRET.
//   If it is missing the function fails closed with `payment_not_configured`
//   — there is no client-side fallback mode anymore.
// - A `pending` row is written to the live `orders` table first; its id is
//   the Razorpay receipt, and the Razorpay order id is stored back on it
//   (gateway_order_id) so verify-razorpay-payment can find it later.

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class {};
}
const { createClient } = require("@supabase/supabase-js");

// ---------- In-memory per-IP rate limiting (same as verify-license) ----------
const RATE_LIMIT = 60; // requests
const RATE_WINDOW_MS = 60 * 1000; // per 60 seconds
const ipHits = new Map();

function getClientIp(event) {
  const headers = event.headers || {};
  const forwarded = headers["x-forwarded-for"] || headers["X-Forwarded-For"] || "";
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers["client-ip"] || headers["Client-Ip"] || headers["x-real-ip"] || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  let hits = ipHits.get(ip) || [];
  hits = hits.filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    ipHits.set(ip, hits);
    return { allowed: false, remaining: 0 };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 2000) {
    for (const [k, v] of ipHits) {
      if (v.length === 0 || now - v[v.length - 1] >= RATE_WINDOW_MS) ipHits.delete(k);
    }
  }
  return { allowed: true, remaining: RATE_LIMIT - hits.length };
}

const round2 = (n) => Math.round(n * 100) / 100;

exports.handler = async (event, context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  const ip = getClientIp(event);
  const rl = checkRateLimit(ip);
  const meta = {
    server_time: new Date().toISOString(),
    rate_limit: { limit: RATE_LIMIT, remaining: rl.remaining }
  };
  const respond = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ ...body, meta })
  });

  if (event.httpMethod !== "POST") {
    return respond(405, { success: false, message: "Method Not Allowed" });
  }

  // ---- Fail closed: no secret, no orders. The secret NEVER comes from the
  // request body and is never accepted from the client. ----
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!keySecret) {
    return respond(500, {
      success: false,
      error: "payment_not_configured",
      message: "Payments are not configured yet. Please contact support."
    });
  }

  // ---- Supabase client (service role preferred — mirrors trial-license) ----
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://wyeejbncddpxhwtijkjt.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u";
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const fireLog = (payload) => {
    try {
      const q = supabase.from("api_logs").insert([payload]);
      if (q && typeof q.then === "function") q.then(() => {}).catch(() => {});
    } catch (e) { /* api_logs may not exist yet — silently ignore */ }
  };

  if (!rl.allowed) {
    fireLog({ function_name: "create-razorpay-order", license_key: "", ip, status: "rate_limited", meta: { days_left: null } });
    return respond(429, { success: false, status: "rate_limited", message: "Too many requests. Please retry shortly." });
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const planId = typeof data.plan_id === "string" ? data.plan_id.trim() : "";
    const couponCode = typeof data.coupon_code === "string" ? data.coupon_code.toUpperCase().trim() : "";

    if (!planId) {
      return respond(400, { success: false, message: "plan_id is required." });
    }

    // ---- Auth: identity comes from the verified user JWT only ----
    const headers = event.headers || {};
    const authHeader = headers["authorization"] || headers["Authorization"] || "";
    const bearerToken =
      typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : "";
    if (!bearerToken) {
      return respond(401, { success: false, message: "Please sign in to complete your purchase." });
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser(bearerToken);
    if (userErr || !userData || !userData.user) {
      return respond(401, { success: false, message: "Your session has expired. Please sign in again." });
    }
    const user = userData.user;

    // ---- Plan (server-side truth for price/duration/devices) ----
    const { data: plan, error: planErr } = await supabase
      .from("plans")
      .select("id, product_id, name, price, duration_days, max_devices, tax_percent, is_lifetime, is_active")
      .eq("id", planId)
      .maybeSingle();
    if (planErr) throw planErr;
    if (!plan || plan.is_active === false) {
      return respond(404, { success: false, message: "This plan is not available for purchase." });
    }
    const { data: product } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", plan.product_id)
      .maybeSingle();

    const price = Number(plan.price) || 0;
    if (!(price > 0)) {
      return respond(400, { success: false, message: "This plan has no valid price configured." });
    }

    // ---- Coupon: validated exactly like the storefront checkout does
    // (productService.validateCoupon against the plan price) ----
    let couponRow = null;
    let discount = 0;
    if (couponCode) {
      // select('*') on purpose: coupons.min_order_amount only exists once
      // migration 20261020010000 has been run — naming it here would make
      // PostgREST error the whole query on databases without it. It is
      // read defensively below, exactly like the storefront checkout.
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("is_active", true)
        .maybeSingle();

      if (!coupon) {
        return respond(400, { success: false, error: "invalid_coupon", message: "Invalid or expired coupon code" });
      }
      const now = new Date();
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return respond(400, { success: false, error: "invalid_coupon", message: "This coupon has expired" });
      }
      if (coupon.usage_limit != null && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) {
        return respond(400, { success: false, error: "invalid_coupon", message: "Coupon usage limit reached" });
      }
      if (coupon.min_order_amount && price < Number(coupon.min_order_amount)) {
        return respond(400, { success: false, error: "invalid_coupon", message: `Minimum order of ₹${coupon.min_order_amount} required` });
      }
      const rawDiscount = coupon.type === "percentage" ? (price * Number(coupon.value)) / 100 : Number(coupon.value);
      discount = Math.round(Math.min(rawDiscount, price));
      couponRow = coupon;
    }

    // ---- Tax: system settings (settings['system'].tax_percent) first,
    // then the plan's own tax_percent, then the 18% storefront default ----
    let taxRate = 18;
    const { data: settingsRow } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "system")
      .maybeSingle();
    const sysVal = settingsRow && typeof settingsRow.value === "object" ? settingsRow.value : null;
    if (sysVal && Number.isFinite(Number(sysVal.tax_percent))) {
      taxRate = Number(sysVal.tax_percent);
    } else if (plan.tax_percent != null && Number.isFinite(Number(plan.tax_percent))) {
      taxRate = Number(plan.tax_percent);
    }

    const taxable = Math.max(0, price - discount);
    const taxRaw = (taxable * taxRate) / 100;
    const tax = round2(taxRaw);
    const total = Math.round(taxable + taxRaw); // grand total in ₹ (mirrors checkout)
    const amountPaise = total * 100;

    // ---- Persist the pending order FIRST (live `orders` schema). Its id
    // becomes the Razorpay receipt so the two are linked from the start. ----
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          plan_id: plan.id,
          coupon_id: couponRow ? couponRow.id : null,
          subtotal: price,
          tax,
          discount,
          total,
          currency: "INR",
          gateway: "razorpay",
          status: "pending"
        }
      ])
      .select()
      .single();
    if (orderErr) throw orderErr;

    // ---- Key ID (public): Admin → Integrations stores it on the
    // integration_settings row for gateway='razorpay' (public_key).
    // Env RAZORPAY_KEY_ID is the fallback. ----
    let keyId = process.env.RAZORPAY_KEY_ID || "";
    const { data: intRow } = await supabase
      .from("integration_settings")
      .select("public_key")
      .eq("gateway", "razorpay")
      .maybeSingle();
    if (intRow && intRow.public_key) {
      keyId = String(intRow.public_key).trim();
    }
    if (!keyId) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", orderRow.id);
      return respond(500, {
        success: false,
        error: "payment_not_configured",
        message: "Payments are not configured yet. Please contact support."
      });
    }

    // ---- Create the Razorpay order (server-to-server, Basic auth) ----
    const basicAuth = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: basicAuth
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: orderRow.id,
        notes: {
          lw_order_id: orderRow.id,
          lw_user_id: user.id,
          lw_plan_id: plan.id,
          lw_product: product ? product.name : "",
          lw_coupon: couponCode || ""
        }
      })
    });
    const orderResult = await rzpResponse.json().catch(() => ({}));

    if (!rzpResponse.ok || !orderResult.id) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", orderRow.id);
      fireLog({ function_name: "create-razorpay-order", license_key: "", ip, status: "razorpay_error", meta: { days_left: null } });
      return respond(502, {
        success: false,
        message: (orderResult.error && orderResult.error.description) || "Payment gateway could not create the order. Please try again."
      });
    }

    await supabase
      .from("orders")
      .update({ gateway_order_id: orderResult.id })
      .eq("id", orderRow.id);

    fireLog({ function_name: "create-razorpay-order", license_key: "", ip, status: "order_created", meta: { days_left: null } });

    return respond(200, {
      success: true,
      order_id: orderResult.id, // Razorpay order id — the widget needs this
      internal_order_id: orderRow.id,
      amount: amountPaise, // paise, computed server-side
      currency: "INR",
      key_id: keyId,
      subtotal: price,
      discount,
      tax,
      tax_rate: taxRate,
      total // ₹ — same grand total the checkout summary shows
    });
  } catch (err) {
    fireLog({ function_name: "create-razorpay-order", license_key: "", ip, status: "error", meta: { days_left: null } });
    return respond(500, { success: false, message: "Server error: " + err.message });
  }
};
