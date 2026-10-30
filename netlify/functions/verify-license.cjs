// Netlify Serverless Function: Extension & Application License Verification
// Public Endpoint: GET/POST /verify OR /.netlify/functions/verify-license
// Hardened: per-IP rate limiting (60 req/min), grace period, trial flags,
// best-effort api_logs logging. All legacy response fields preserved.

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class {};
}
const { createClient } = require("@supabase/supabase-js");

// ---------- In-memory per-IP rate limiting (module scope, persists across warm invocations) ----------
const RATE_LIMIT = 60; // requests
const RATE_WINDOW_MS = 60 * 1000; // per 60 seconds
const ipHits = new Map(); // ip -> array of epoch-ms timestamps

function getClientIp(event) {
  const headers = event.headers || {};
  const forwarded = headers["x-forwarded-for"] || headers["X-Forwarded-For"] || "";
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers["client-ip"] || headers["Client-Ip"] || headers["x-real-ip"] || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  let hits = ipHits.get(ip) || [];
  // Prune timestamps older than the window
  hits = hits.filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    ipHits.set(ip, hits);
    return { allowed: false, remaining: 0 };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  // Occasional cleanup of stale entries so the Map doesn't grow forever
  if (ipHits.size > 2000) {
    for (const [k, v] of ipHits) {
      if (v.length === 0 || now - v[v.length - 1] >= RATE_WINDOW_MS) ipHits.delete(k);
    }
  }
  return { allowed: true, remaining: RATE_LIMIT - hits.length };
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

  // Rate limit state, computed early so every response carries it
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

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://wyeejbncddpxhwtijkjt.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u";

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Best-effort, fire-and-forget logging. Never breaks the response.
  const fireLog = (payload) => {
    try {
      const q = supabase.from("api_logs").insert([payload]);
      if (q && typeof q.then === "function") q.then(() => {}).catch(() => {});
    } catch (e) { /* table may not exist yet — silently ignore */ }
  };

  if (!rl.allowed) {
    fireLog({
      function_name: "verify-license",
      license_key: "",
      ip,
      status: "rate_limited",
      meta: { days_left: null }
    });
    return respond(429, {
      valid: false,
      status: "rate_limited",
      message: "Too many requests. Please retry shortly."
    });
  }

  try {
    let licenseKey = "";
    let deviceId = "";
    let deviceName = "";

    if (event.httpMethod === "GET") {
      licenseKey = event.queryStringParameters?.licenseKey || event.queryStringParameters?.key || "";
      deviceId = event.queryStringParameters?.deviceId || event.queryStringParameters?.hwid || "";
      deviceName = event.queryStringParameters?.deviceName || "Browser Extension";
    } else {
      const data = JSON.parse(event.body || "{}");
      licenseKey = data.licenseKey || data.key || data.license_key || "";
      deviceId = data.deviceId || data.hwid || data.device_fingerprint || "";
      deviceName = data.deviceName || data.device_name || "Browser Extension";
    }

    if (!licenseKey) {
      fireLog({ function_name: "verify-license", license_key: "", ip, status: "invalid", meta: { device_name: deviceName, days_left: null } });
      return respond(400, {
        valid: false,
        status: "invalid",
        message: "License key is required."
      });
    }

    const cleanKey = licenseKey.trim();

    // 1. Query modern licenses table
    const { data: license, error: licErr } = await supabase
      .from("licenses")
      .select("*, product:products(*), plan:plans(*), user:profiles(*)")
      .eq("license_key", cleanKey)
      .single();

    const logDecision = (status, daysLeft) =>
      fireLog({
        function_name: "verify-license",
        license_key: cleanKey.slice(0, 64),
        ip,
        status,
        meta: { device_name: deviceName, days_left: daysLeft ?? null }
      });

    if (license && !licErr) {
      // Check if locked
      if (license.is_locked || license.status === "locked") {
        logDecision("locked", null);
        return respond(200, {
          valid: false,
          status: "locked",
          message: "This license has been locked by the administrator. Contact support@licensewala.com"
        });
      }

      // Check if paused or revoked
      if (license.status === "paused") {
        logDecision("paused", null);
        return respond(200, {
          valid: false,
          status: "paused",
          message: "Subscription is paused."
        });
      }
      if (license.status === "revoked") {
        logDecision("revoked", null);
        return respond(200, {
          valid: false,
          status: "revoked",
          message: "License has been revoked."
        });
      }

      // Admin-disabled license (same rule as google-verify)
      if (license.is_enabled === false) {
        logDecision("disabled", null);
        return respond(200, {
          valid: false,
          status: "disabled",
          message: "This license has been disabled by the administrator."
        });
      }

      // Blocked account: when the owning user's profile is blocked, none of
      // their licenses validate — even ones that are otherwise active.
      const owner = license.user || {};
      if (owner.status === "blocked" || owner.is_blocked === true) {
        logDecision("account_blocked", null);
        return respond(200, {
          valid: false,
          status: "account_blocked",
          message: "This account has been blocked by the administrator. Contact support@licensewala.com"
        });
      }

      // Trial marker shared by the active and grace responses
      const trialFields = license.is_trial === true
        ? { trial: true, trial_ends_at: license.expiry_date }
        : {};

      // Expiry Check
      const now = new Date();
      const isLifetime = !license.expiry_date || license.expiry_date.startsWith("9999");
      let isExpired = false;
      let daysLeft = 9999;

      if (!isLifetime) {
        const expiryDate = new Date(license.expiry_date);
        const diff = expiryDate.getTime() - now.getTime();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) {
          isExpired = true;
        }
      }

      if (isExpired) {
        const overdue = Math.abs(daysLeft);
        const graceDays = (license.grace_days === undefined || license.grace_days === null)
          ? 3
          : Number(license.grace_days);

        if (overdue <= graceDays) {
          // Within grace period: treat as valid
          logDecision("grace", daysLeft);
          return respond(200, {
            valid: true,
            status: "grace",
            days_left: daysLeft,
            expires_at: license.expiry_date,
            product_name: license.product?.name,
            plan_name: license.plan?.name,
            max_devices: license.max_devices,
            customer_name: license.user?.full_name,
            ...trialFields,
            message: `License expired — you are in a ${graceDays}-day grace period. Please renew soon.`,
            renewal_url: `https://licensewala.netlify.app/checkout/${license.plan_id || ""}`
          });
        }

        logDecision("expired", daysLeft);
        return respond(200, {
          valid: false,
          status: "expired",
          days_left: daysLeft,
          expiry_date: license.expiry_date,
          message: `License expired ${overdue} days ago. Please renew your subscription to continue using this extension.`,
          renewal_url: `https://licensewala.netlify.app/checkout/${license.plan_id || ""}`
        });
      }

      // Device Binding Verification
      if (deviceId) {
        // Check activation table
        const { data: activations } = await supabase
          .from("license_activations")
          .select("*")
          .eq("license_id", license.id);

        const activeList = activations || [];
        const existingDevice = activeList.find((a) => a.device_fingerprint === deviceId);

        if (!existingDevice) {
          if (activeList.length >= license.max_devices) {
            logDecision("device_limit_reached", daysLeft);
            return respond(200, {
              valid: false,
              status: "device_limit_reached",
              message: `Device limit exceeded (${activeList.length}/${license.max_devices} PC). Reset device activations in your account portal.`,
              portal_url: "https://licensewala.netlify.app/account"
            });
          }

          // Register new device
          await supabase.from("license_activations").insert([
            {
              license_id: license.id,
              device_fingerprint: deviceId,
              device_name: deviceName,
              activated_at: now.toISOString(),
              last_seen_at: now.toISOString(),
              is_active: true
            }
          ]);

          await supabase
            .from("licenses")
            .update({ current_devices: activeList.length + 1 })
            .eq("id", license.id);
        } else {
          // Update last seen
          await supabase
            .from("license_activations")
            .update({ last_seen_at: now.toISOString() })
            .eq("id", existingDevice.id);
        }
      }

      logDecision("active", daysLeft);
      return respond(200, {
        valid: true,
        status: "active",
        product_name: license.product?.name,
        plan_name: license.plan?.name,
        days_left: daysLeft,
        expires_at: license.expiry_date,
        max_devices: license.max_devices,
        customer_name: license.user?.full_name,
        ...trialFields,
        message: "License verified successfully. Extension features unlocked."
      });
    }

    // 2. No demo fallback: a key not found in the licenses table is invalid.
    // Real trials are DB rows created by trial-license.cjs and are found by
    // the query above, so genuine trials keep working.

    logDecision("invalid", null);
    return respond(200, {
      valid: false,
      status: "invalid",
      message: "Invalid license key. Please check your key or buy a license at https://licensewala.netlify.app"
    });
  } catch (err) {
    fireLog({ function_name: "verify-license", license_key: "", ip, status: "error", meta: { days_left: null } });
    return respond(500, { valid: false, status: "error", message: err.message });
  }
};
