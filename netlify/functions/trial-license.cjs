// Netlify Serverless Function: Trial License Generator
// Endpoint: POST /api/trial-license OR /.netlify/functions/trial-license
// Auth: header x-api-key === process.env.LICENSE_API_KEY

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

  // ---- Auth ----
  const headers = event.headers || {};
  const providedKey = headers["x-api-key"] || headers["X-Api-Key"] || headers["X-API-KEY"];
  if (!process.env.LICENSE_API_KEY || providedKey !== process.env.LICENSE_API_KEY) {
    return respond(401, { success: false, message: "Unauthorized" });
  }

  // ---- Supabase client (service role preferred, anon fallback) ----
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !supabaseKey) {
    return respond(500, { success: false, message: "Supabase environment variables not set." });
  }
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    const data = JSON.parse(event.body || "{}");
    const email = (data.email || "").trim();
    const productId = data.product_id || null;
    let days = parseInt(data.days, 10);
    if (isNaN(days)) days = 7;
    days = Math.min(30, Math.max(1, days));

    // ---- Validate ----
    if (!EMAIL_RE.test(email)) {
      return respond(400, { success: false, message: "A valid email is required." });
    }
    if (productId) {
      const { data: product, error: prodErr } = await supabase
        .from("products")
        .select("id")
        .eq("id", productId)
        .maybeSingle();
      if (prodErr) throw prodErr;
      if (!product) {
        return respond(400, { success: false, message: "Product not found." });
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

    // ---- Lookup profile for customer_id (nullable) ----
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    const customerId = profile ? profile.id : null;

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
      trial: true
    });
  } catch (err) {
    return respond(500, { success: false, message: err.message });
  }
};
