// Netlify Serverless Function: Verify Razorpay Payment & Issue License
// Endpoint: POST /.netlify/functions/verify-razorpay-payment  (or /api/verify-razorpay-payment)
//
// Security contract:
// - The browser's "payment success" is NEVER trusted. A license is issued
//   ONLY after the Razorpay signature verifies server-side:
//   HMAC-SHA256(`${razorpay_order_id}|${razorpay_payment_id}`) keyed with
//   env RAZORPAY_KEY_SECRET, compared timing-safely.
// - The order/amount/plan/coupon all come from the `orders` row that
//   create-razorpay-order wrote BEFORE the widget opened — never from the
//   request body. Billing name/email are display data for the invoice and
//   are the only client-supplied values persisted.
// - The caller must be the signed-in user who owns the order (user JWT).
// - IDEMPOTENT: the `payments` row keyed by gateway_payment_id is written
//   FIRST during issuance and anchors every retry — the same payment
//   submitted twice returns the already-issued license, never a duplicate.
// - Invalid signature → 400 and NOTHING is written.

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class {};
}
const crypto = require("crypto");
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

// Same key format the storefront generator produces:
// LW-XXXX-XXXX-XXXX-XXXX from the unambiguous alphanumeric alphabet.
const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateLicenseKey() {
  const parts = [];
  for (let s = 0; s < 4; s++) {
    const bytes = crypto.randomBytes(4);
    let seg = "";
    for (let i = 0; i < 4; i++) seg += KEY_ALPHABET[bytes[i] % KEY_ALPHABET.length];
    parts.push(seg);
  }
  return `LW-${parts.join("-")}`;
}

function newInvoiceNumber() {
  const year = new Date().getFullYear();
  return `INV-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
}

const isUniqueViolation = (err) =>
  !!err && (err.code === "23505" || /duplicate|unique/i.test(err.message || ""));

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

  // ---- Fail closed: without the secret nothing can be verified or issued.
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
    fireLog({ function_name: "verify-razorpay-payment", license_key: "", ip, status: "rate_limited", meta: { days_left: null } });
    return respond(429, { success: false, status: "rate_limited", message: "Too many requests. Please retry shortly." });
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const razorpayOrderId = typeof data.razorpay_order_id === "string" ? data.razorpay_order_id.trim() : "";
    const razorpayPaymentId = typeof data.razorpay_payment_id === "string" ? data.razorpay_payment_id.trim() : "";
    const razorpaySignature = typeof data.razorpay_signature === "string" ? data.razorpay_signature.trim() : "";
    const billing = data.billing && typeof data.billing === "object" ? data.billing : {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return respond(400, {
        success: false,
        message: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required."
      });
    }

    // ---- Auth: only the order's owner may claim its license ----
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

    // ---- Signature verification (timing-safe). NOTHING is written before
    // this passes. ----
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const expectedBuf = Buffer.from(expected, "utf8");
    const givenBuf = Buffer.from(razorpaySignature, "utf8");
    const signatureValid =
      expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);
    if (!signatureValid) {
      fireLog({ function_name: "verify-razorpay-payment", license_key: "", ip, status: "invalid_signature", meta: { days_left: null } });
      return respond(400, {
        success: false,
        error: "invalid_signature",
        message: "Payment could not be verified."
      });
    }

    // ---- The order written by create-razorpay-order is the only truth ----
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("gateway_order_id", razorpayOrderId)
      .maybeSingle();
    if (orderErr) throw orderErr;
    if (!order) {
      return respond(404, { success: false, message: "Order not found for this payment." });
    }
    if (order.user_id !== user.id) {
      return respond(403, { success: false, message: "This order belongs to a different account." });
    }

    const successPayload = (license, invoice) => ({
      success: true,
      license_key: license.license_key,
      expiry_date: license.expiry_date,
      invoice_number: invoice ? invoice.invoice_no : null,
      order_id: order.id,
      total: Number(order.total)
    });

    const loadIssued = async (paymentRow) => {
      if (!paymentRow || !paymentRow.license_id) return null;
      const { data: license } = await supabase
        .from("licenses")
        .select("license_key, expiry_date")
        .eq("id", paymentRow.license_id)
        .maybeSingle();
      if (!license) return null;
      let invoice = null;
      if (paymentRow.invoice_id) {
        const { data: inv } = await supabase
          .from("invoices")
          .select("invoice_no")
          .eq("id", paymentRow.invoice_id)
          .maybeSingle();
        invoice = inv || null;
      }
      return { license, invoice };
    };

    // ---- Idempotency anchor: an existing payments row for THIS payment ----
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("gateway_payment_id", razorpayPaymentId)
      .maybeSingle();

    if (existingPayment) {
      const issued = await loadIssued(existingPayment);
      if (issued) {
        // Heal a half-finished earlier attempt: order should read paid.
        if (order.status !== "paid") {
          await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
        }
        return respond(200, successPayload(issued.license, issued.invoice));
      }
      // Payment row exists but issuance crashed before the license was
      // linked — fall through and RESUME issuance reusing this row.
    } else if (order.status === "paid") {
      // Order already fulfilled by a DIFFERENT payment (e.g. the customer
      // paid twice on the same Razorpay order). Return the license that was
      // issued; the duplicate payment is a support/refund case, not a
      // second license.
      const { data: priorPayments } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", order.id)
        .not("license_id", "is", null)
        .limit(1);
      const issued = priorPayments && priorPayments[0] ? await loadIssued(priorPayments[0]) : null;
      if (issued) {
        return respond(200, successPayload(issued.license, issued.invoice));
      }
    }

    // ---- Plan + product (server truth for what is being issued) ----
    const { data: plan, error: planErr } = await supabase
      .from("plans")
      .select("id, product_id, name, price, duration_days, max_devices, is_lifetime")
      .eq("id", order.plan_id)
      .maybeSingle();
    if (planErr) throw planErr;
    if (!plan) {
      return respond(500, { success: false, message: "The plan for this order no longer exists. Please contact support." });
    }
    const { data: product } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", plan.product_id)
      .maybeSingle();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const price = Number(order.subtotal) || 0;
    const discount = Number(order.discount) || 0;
    const tax = Number(order.tax) || 0;
    const total = Number(order.total) || 0;
    const taxable = Math.max(0, price - discount);
    const taxRate = taxable > 0 ? Math.round((tax / taxable) * 10000) / 100 : 18;

    // ---- Issuance step 1: anchor the payment row FIRST ----
    let paymentRow = existingPayment || null;
    if (!paymentRow) {
      const { data: inserted, error: payErr } = await supabase
        .from("payments")
        .insert([
          {
            order_id: order.id,
            gateway: "razorpay",
            gateway_payment_id: razorpayPaymentId,
            amount: total,
            method: "UPI / Card",
            status: "paid",
            raw_payload: {
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: razorpayPaymentId,
              signature_verified: true
            },
            paid_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      if (payErr) throw payErr;
      paymentRow = inserted;
    }

    // ---- Issuance step 2: the tax invoice (live invoices schema) ----
    const customerName = (billing.name || (profile && profile.full_name) || "").trim();
    const customerEmail = (billing.email || (profile && profile.email) || user.email || "").trim();
    let invoice = null;
    for (let attempt = 0; attempt < 5 && !invoice; attempt++) {
      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .insert([
          {
            invoice_no: newInvoiceNumber(),
            customer_id: order.user_id,
            customer_name: customerName,
            customer_email: customerEmail,
            items: [
              {
                product_id: plan.product_id,
                product_name: product ? product.name : "Software License",
                plan_id: plan.id,
                plan_name: plan.name,
                quantity: 1,
                unit_price: price,
                tax_rate: taxRate,
                tax_amount: tax,
                discount,
                total,
                payment_method: "razorpay",
                payment_id: razorpayPaymentId,
                billing_phone: billing.phone || undefined,
                billing_address: billing.address || undefined,
                billing_gst: billing.gst || undefined,
                paid_at: new Date().toISOString()
              }
            ],
            subtotal: price,
            tax,
            discount,
            total,
            status: "paid",
            notes: `Razorpay order ${razorpayOrderId} / payment ${razorpayPaymentId}`
          }
        ])
        .select()
        .single();
      if (!invErr && inv) {
        invoice = inv;
      } else if (!isUniqueViolation(invErr)) {
        throw invErr;
      }
    }
    if (!invoice) {
      return respond(500, { success: false, message: "Could not generate the invoice. Please contact support." });
    }

    // ---- Issuance step 3: the license (same fields the old client flow
    // created; HWID stays unbound until the tool first verifies) ----
    const now = new Date();
    const durationDays = Number(plan.duration_days) || 30;
    const expiryDate =
      plan.is_lifetime || durationDays >= 3650
        ? "9999-12-31T23:59:59Z"
        : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    let license = null;
    for (let attempt = 0; attempt < 5 && !license; attempt++) {
      const { data: lic, error: licErr } = await supabase
        .from("licenses")
        .insert([
          {
            license_key: generateLicenseKey(),
            customer_id: order.user_id,
            product_id: plan.product_id,
            plan_id: plan.id,
            invoice_id: invoice.id,
            status: "active",
            issue_date: now.toISOString(),
            expiry_date: expiryDate,
            max_devices: plan.max_devices || 1,
            is_locked: false,
            priority: "normal",
            amount: total,
            payment_status: "paid",
            notes: `Purchased via RAZORPAY (${razorpayPaymentId})`
          }
        ])
        .select()
        .single();
      if (!licErr && lic) {
        license = lic;
      } else if (!isUniqueViolation(licErr)) {
        throw licErr;
      }
    }
    if (!license) {
      return respond(500, { success: false, message: "Could not generate the license key. Please contact support." });
    }

    // ---- Issuance step 4: link payment → license/invoice, redeem the
    // coupon, and only then flip the order to paid ----
    await supabase
      .from("payments")
      .update({ license_id: license.id, invoice_id: invoice.id })
      .eq("id", paymentRow.id);

    if (order.coupon_id) {
      try {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("code, used_count")
          .eq("id", order.coupon_id)
          .maybeSingle();
        if (coupon && coupon.code) {
          const { error: rpcErr } = await supabase.rpc("redeem_coupon", { p_code: coupon.code });
          if (rpcErr) {
            await supabase
              .from("coupons")
              .update({ used_count: Number(coupon.used_count || 0) + 1 })
              .eq("id", order.coupon_id);
          }
        }
      } catch (e) { /* redemption is best-effort — never fail a paid order over it */ }
    }

    await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);

    fireLog({ function_name: "verify-razorpay-payment", license_key: license.license_key, ip, status: "license_issued", meta: { days_left: null } });

    return respond(200, successPayload(license, invoice));
  } catch (err) {
    fireLog({ function_name: "verify-razorpay-payment", license_key: "", ip, status: "error", meta: { days_left: null } });
    return respond(500, { success: false, message: "Server error: " + err.message });
  }
};
