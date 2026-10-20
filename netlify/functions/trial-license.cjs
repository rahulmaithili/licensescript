// Netlify Serverless Function: Trial License Generator
// Endpoint: POST /api/trial-license OR /.netlify/functions/trial-license
// Auth: header x-api-key === process.env.LICENSE_API_KEY
//   OR Authorization: Bearer <supabase-user-JWT> (automatic in-app trial;
//   identity comes from the verified token only, days fixed at 7)

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class {};
}
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const KEY_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // uppercase, no ambiguous chars
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function randomSegment(len) {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += KEY_ALPHABET[bytes[i] % KEY_ALPHABET.length];
  }
  return out;
}

function daysLeftUntil(expiryDate) {
  if (!expiryDate) return 0;
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (isNaN(diff)) return 0;
  return Math.max(0, Math.ceil(diff / 86400000));
}

exports.handler = async (event, context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  const respond = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  });

  if (event.httpMethod !== "POST") {
    return respond(405, { success: false, message: "Use POST." });
  }

  // ---- Supabase client (service role preferred, anon fallback) ----
  // Env resolution mirrors verify-license.cjs, with the service-role key
  // preferred so the server-side insert bypasses RLS.
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://wyeejbncddpxhwtijkjt.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u";
  if (!supabaseUrl || !supabaseKey) {
    return respond(500, { success: false, message: "Supabase environment variables not set." });
  }
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    const data = JSON.parse(event.body || "{}");

    // ---- Auth ----
    // Mode 1: x-api-key (existing flow, unchanged).
    // Mode 2: Authorization: Bearer <user JWT> — verify with Supabase and
    // trust only the token's identity (body email/product/days are ignored).
    const headers = event.headers || {};
    const providedKey = headers["x-api-key"] || headers["X-Api-Key"] || headers["X-API-KEY"];
    const apiKeyValid = !!process.env.LICENSE_API_KEY && providedKey === process.env.LICENSE_API_KEY;

    let authMode = null;
    let jwtUser = null;

    if (apiKeyValid) {
      authMode = "api-key";
    } else {
      const authHeader = headers["authorization"] || headers["Authorization"] || "";
      const bearerToken =
        typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
      if (bearerToken) {
        const { data: userData, error: userErr } = await supabase.auth.getUser(bearerToken);
        if (!userErr && userData && userData.user) {
          jwtUser = userData.user;
          authMode = "jwt";
        }
      }
      if (!authMode) {
        return respond(401, { success: false, message: "Unauthorized" });
      }
    }

    let email = "";
    let productId = null;
    let days = 7;
    let profile = null;

    if (authMode === "jwt") {
      // Identity comes from the verified token only.
      days = 7;
      email = (jwtUser.email || "").trim();

      // Profile lookup by id (profiles.id === auth.users.id)
      const { data: profileById } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("id", jwtUser.id)
        .maybeSingle();
      profile = profileById || null;
      if (!email && profile && profile.email) {
        email = (profile.email || "").trim();
      }
      // productId stays null here — JWT mode always uses the default product.
    } else {
      email = (data.email || "").trim();
      productId = data.product_id || null;
      days = parseInt(data.days, 10);
      if (isNaN(days)) days = 7;
      days = Math.min(30, Math.max(1, days));

      // ---- Lookup profile for customer_id (nullable) ----
      const { data: profileByEmail } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      profile = profileByEmail || null;
    }

    // ---- Validate ----
    if (!EMAIL_RE.test(email)) {
      return respond(400, { success: false, message: "A valid email is required." });
    }
    if (authMode === "api-key" && productId) {
      const { data: product, error: prodErr } = await supabase
        .from("products")
        .select("id")
        .eq("id", productId)
        .maybeSingle();
      if (prodErr) throw prodErr;
      if (!product) {
        return respond(400, { success: false, message: "Product not found." });
      }
    } else {
      // Default product: first active product (also used for every JWT call
      // and for API-key calls without an explicit product_id).
      const { data: defaultProduct } = await supabase
        .from("products")
        .select("id")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      productId = defaultProduct ? defaultProduct.id : null;
    }

    const customerId = profile ? profile.id : authMode === "jwt" ? jwtUser.id : null;

    // ---- Idempotency: never issue a second trial to the same account ----
    if (profile) {
      let existingTrial = null;

      const { data: trialByPrefix } = await supabase
        .from("licenses")
        .select("license_key, expiry_date")
        .eq("customer_id", profile.id)
        .like("license_key", "LW-TRIAL-%")
        .limit(1)
        .maybeSingle();
      if (trialByPrefix) {
        existingTrial = trialByPrefix;
      }

      // Second check: is_trial flag. The column may not exist in the live DB
      // yet (pre-migration), so any error from this query is ignored.
      try {
        const { data: trialByFlag, error: flagErr } = await supabase
          .from("licenses")
          .select("license_key, expiry_date")
          .eq("customer_id", profile.id)
          .eq("is_trial", true)
          .limit(1)
          .maybeSingle();
        if (!flagErr && trialByFlag && !existingTrial) {
          existingTrial = trialByFlag;
        }
      } catch (e) {
        // is_trial column missing — ignore, prefix check above is authoritative.
      }

      if (existingTrial) {
        return respond(200, {
          success: true,
          already_issued: true,
          license_key: existingTrial.license_key,
          expires_at: existingTrial.expiry_date,
          trial: true,
          days_left: daysLeftUntil(existingTrial.expiry_date)
        });
      }
    }

    // ---- Generate a unique trial key (max 5 tries) ----
    let trialKey = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `LW-TRIAL-${randomSegment(4)}-${randomSegment(4)}`;
      const { data: existing } = await supabase
        .from("licenses")
        .select("id")
        .eq("license_key", candidate)
        .maybeSingle();
      if (!existing) {
        trialKey = candidate;
        break;
      }
    }
    if (!trialKey) {
      return respond(500, { success: false, message: "Could not generate a unique trial key. Please retry." });
    }

    const today = new Date().toISOString().slice(0, 10);
    const expiry = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

    const baseRow = {
      license_key: trialKey,
      customer_id: customerId,
      product_id: productId,
      plan_id: null,
      issue_date: today,
      expiry_date: expiry,
      status: "active",
      max_devices: 1,
      amount: 0,
      notes: `Trial via API for ${email}`
    };

    // ---- Insert (retry without is_trial if the column doesn't exist yet) ----
    let { data: license, error: insertErr } = await supabase
      .from("licenses")
      .insert([{ ...baseRow, is_trial: true }])
      .select("id, license_key, expiry_date")
      .single();

    if (insertErr && /is_trial/i.test(insertErr.message || "")) {
      const retry = await supabase
        .from("licenses")
        .insert([baseRow])
        .select("id, license_key, expiry_date")
        .single();
      license = retry.data;
      insertErr = retry.error;
    }
    if (insertErr) throw insertErr;

    return respond(200, {
      success: true,
      license_key: license.license_key,
      expires_at: license.expiry_date,
      days,
      days_left: days,
      trial: true
    });
  } catch (err) {
    return respond(500, { success: false, message: err.message });
  }
};
