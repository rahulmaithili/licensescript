// Netlify Serverless Function: Google-Login Tool Activation
// Endpoint: POST /.netlify/functions/google-verify  (or /api/google-verify)
// Lets the desktop tool activate with the SAME Google account the customer
// used on the website: the tool sends the Google ID token it received from
// its own "Sign in with Google" flow; this function verifies the token with
// Google, finds the account's best license (paid first, then trial), applies
// the same HWID binding rules as verify-license, and reports activation.
//
// Request JSON:  { id_token, hwid, product_slug? }
// Success:       { active: true, type: 'paid'|'trial', plan_name,
//                  license_key, expiry_date, days_left, ... }
// Inactive:      { active: false, reason: 'no_license'|'expired'|
//                  'trial_expired'|'device_mismatch'|..., renew_url }

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class {};
}
const { createClient } = require("@supabase/supabase-js");

// The website's Google OAuth client (Supabase Google provider). An ID token
// minted for any other client must never activate a license.
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_OAUTH_CLIENT_ID ||
  "17079355400-krquge8l14g0vjp3tbsqmjrkdmh2repk.apps.googleusercontent.com";
const RENEW_URL = "https://licensescript.netlify.app/pricing";

// ---------- In-memory per-IP rate limiting (same as verify-license) ----------
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;
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

function isTrialLicense(lic) {
  return (
    lic.is_trial === true ||
    (typeof lic.license_key === "string" && lic.license_key.startsWith("LW-TRIAL"))
  );
}

// Returns { state: 'active'|'grace'|'expired', daysLeft, isLifetime }
function evaluateExpiry(lic) {
  const isLifetime = !lic.expiry_date || String(lic.expiry_date).startsWith("9999");
  if (isLifetime) return { state: "active", daysLeft: 9999, isLifetime: true };
  const now = new Date();
  const expiryDate = new Date(lic.expiry_date);
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / 86400000);
  if (daysLeft >= 0) return { state: "active", daysLeft, isLifetime: false };
  const trial = isTrialLicense(lic);
  const graceDays =
    lic.grace_days === undefined || lic.grace_days === null ? 3 : Number(lic.grace_days);
  // Grace applies to paid licenses only — an ended trial ends immediately.
  if (!trial && Math.abs(daysLeft) <= graceDays) {
    return { state: "grace", daysLeft, isLifetime: false };
  }
  return { state: "expired", daysLeft, isLifetime: false };
}

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

  // Same env resolution as verify-license.cjs
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://wyeejbncddpxhwtijkjt.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u";

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const fireLog = (payload) => {
    try {
      const q = supabase.from("api_logs").insert([payload]);
      if (q && typeof q.then === "function") q.then(() => {}).catch(() => {});
    } catch (e) { /* api_logs may not exist yet — silently ignore */ }
  };
  const logDecision = (status, licenseKey, daysLeft) =>
    fireLog({
      function_name: "google-verify",
      license_key: (licenseKey || "").slice(0, 64),
      ip,
      status,
      meta: { days_left: daysLeft ?? null }
    });

  if (event.httpMethod !== "POST") {
    return respond(405, { active: false, reason: "method_not_allowed", message: "Use POST." });
  }

  if (!rl.allowed) {
    logDecision("rate_limited", "", null);
    return respond(429, {
      active: false,
      reason: "rate_limited",
      message: "Too many requests. Please retry shortly."
    });
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const idToken = data.id_token || data.idToken || "";
    const hwid = (data.hwid || data.deviceId || data.device_fingerprint || "").trim();
    const productSlug = (data.product_slug || data.productSlug || "").trim();

    if (!idToken) {
      logDecision("missing_token", "", null);
      return respond(400, {
        active: false,
        reason: "missing_token",
        message: "A Google ID token (id_token) is required."
      });
    }

    // ---- 1. Verify the Google ID token ----
    let tokenInfo;
    try {
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (!res.ok) {
        logDecision("invalid_token", "", null);
        return respond(401, {
          active: false,
          reason: "invalid_token",
          message: "Google sign-in could not be verified. Please sign in again."
        });
      }
      tokenInfo = await res.json();
    } catch (e) {
      return respond(502, {
        active: false,
        reason: "google_unreachable",
        message: "Could not reach Google to verify the sign-in. Please retry."
      });
    }

    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
      logDecision("wrong_audience", "", null);
      return respond(401, {
        active: false,
        reason: "invalid_token",
        message: "This Google sign-in was not issued for LicenseWala."
      });
    }
    const emailVerified = tokenInfo.email_verified === true || tokenInfo.email_verified === "true";
    const email = (tokenInfo.email || "").trim().toLowerCase();
    if (!email || !emailVerified) {
      logDecision("email_unverified", "", null);
      return respond(401, {
        active: false,
        reason: "email_unverified",
        message: "A verified Google email is required to activate."
      });
    }

    // ---- 2. Find the website account for this email ----
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, status")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      logDecision("no_account", "", null);
      return respond(200, {
        active: false,
        reason: "no_account",
        message: "No LicenseWala account exists for this Google email. Please register on the website first.",
        renew_url: RENEW_URL
      });
    }

    // ---- 2b. Blocked account: no license of a blocked user activates ----
    if (profile.status === "blocked") {
      logDecision("account_blocked", "", null);
      return respond(200, {
        active: false,
        reason: "account_blocked",
        message: "This account has been blocked by the administrator. Contact support@licensewala.com",
        renew_url: RENEW_URL
      });
    }

    // ---- 3. Resolve the product (optional) ----
    let productId = null;
    let productName = null;
    if (productSlug) {
      const { data: product } = await supabase
        .from("products")
        .select("id, name")
        .eq("slug", productSlug)
        .maybeSingle();
      if (!product) {
        return respond(400, {
          active: false,
          reason: "unknown_product",
          message: `Unknown product_slug: ${productSlug}`
        });
      }
      productId = product.id;
      productName = product.name;
    }

    // ---- 4. Load the account's licenses and pick the best one ----
    const { data: licenses, error: licErr } = await supabase
      .from("licenses")
      .select("*, product:products(id, name, slug), plan:plans(id, name)")
      .eq("customer_id", profile.id)
      .order("created_at", { ascending: false });
    if (licErr) throw licErr;

    const all = licenses || [];
    // When a product is requested: paid licenses must match it; trial
    // licenses are suite-wide and match any product.
    const candidates = all.filter((lic) => {
      if (!productId) return true;
      if (lic.product_id === productId) return true;
      return isTrialLicense(lic);
    });

    if (candidates.length === 0) {
      logDecision("no_license", "", null);
      return respond(200, {
        active: false,
        reason: "no_license",
        message: "No license found for this account. Please buy a plan or start your free trial on the website.",
        renew_url: RENEW_URL
      });
    }

    // Rank: usable paid (active/grace) > usable trial > expired trial >
    // expired paid > blocked states. First match in each tier wins.
    const usable = [];
    let expiredTrial = null;
    let expiredPaid = null;
    let blocked = null;
    for (const lic of candidates) {
      const trial = isTrialLicense(lic);
      if (lic.is_locked || lic.status === "locked") { blocked = blocked || { lic, reason: "locked" }; continue; }
      if (lic.status === "paused") { blocked = blocked || { lic, reason: "paused" }; continue; }
      if (lic.status === "revoked") { blocked = blocked || { lic, reason: "revoked" }; continue; }
      if (lic.is_enabled === false) { blocked = blocked || { lic, reason: "disabled" }; continue; }
      const ev = evaluateExpiry(lic);
      if (ev.state === "active" || ev.state === "grace") {
        usable.push({ lic, trial, ...ev });
      } else if (trial) {
        expiredTrial = expiredTrial || lic;
      } else {
        expiredPaid = expiredPaid || lic;
      }
    }

    if (usable.length === 0) {
      if (expiredTrial) {
        logDecision("trial_expired", expiredTrial.license_key, null);
        return respond(200, {
          active: false,
          reason: "trial_expired",
          expiry_date: expiredTrial.expiry_date,
          message: "Your free trial has ended. Please buy a plan to continue using the tool.",
          renew_url: RENEW_URL
        });
      }
      if (expiredPaid) {
        logDecision("expired", expiredPaid.license_key, null);
        return respond(200, {
          active: false,
          reason: "expired",
          expiry_date: expiredPaid.expiry_date,
          message: "Your license has expired. Please renew to continue using the tool.",
          renew_url: RENEW_URL
        });
      }
      const reason = blocked ? blocked.reason : "no_license";
      logDecision(reason, blocked?.lic?.license_key || "", null);
      return respond(200, {
        active: false,
        reason,
        message: "This license is not usable. Please contact support@licensewala.com",
        renew_url: RENEW_URL
      });
    }

    // Paid beats trial; within a tier, the longest remaining time wins.
    usable.sort((a, b) => {
      if (a.trial !== b.trial) return a.trial ? 1 : -1;
      return b.daysLeft - a.daysLeft;
    });
    const chosen = usable[0];
    const license = chosen.lic;
    const trial = chosen.trial;

    // ---- 5. HWID binding (same rules as verify-license) ----
    if (hwid) {
      const { data: activations } = await supabase
        .from("license_activations")
        .select("*")
        .eq("license_id", license.id);
      const activeList = activations || [];
      const existingDevice = activeList.find((a) => a.device_fingerprint === hwid);
      const nowIso = new Date().toISOString();

      if (!existingDevice) {
        const maxDevices = license.max_devices || 1;
        if (activeList.length >= maxDevices) {
          logDecision("device_mismatch", license.license_key, chosen.daysLeft);
          return respond(200, {
            active: false,
            reason: "device_mismatch",
            message: "This license is already activated on a different machine. Reset device activations in your account portal.",
            portal_url: "https://licensescript.netlify.app/account",
            renew_url: RENEW_URL
          });
        }
        // First sight of this machine: bind it now. The insert is attempted
        // with the premium columns first (last_seen_at / is_active, added by
        // the premium migration), then retried with only the base-schema
        // columns so binding also works before that migration is applied.
        const { error: actErr } = await supabase.from("license_activations").insert([
          {
            license_id: license.id,
            device_fingerprint: hwid,
            device_name: "Desktop Tool",
            ip,
            activated_at: nowIso,
            last_seen_at: nowIso,
            is_active: true
          }
        ]);
        if (actErr) {
          const { error: retryErr } = await supabase.from("license_activations").insert([
            {
              license_id: license.id,
              device_fingerprint: hwid,
              device_name: "Desktop Tool",
              ip,
              activated_at: nowIso,
              last_seen: nowIso
            }
          ]);
          if (retryErr) throw retryErr;
        }
        // current_devices exists only after the premium migration — best effort.
        const { error: devErr } = await supabase
          .from("licenses")
          .update({ current_devices: activeList.length + 1 })
          .eq("id", license.id);
        if (devErr) { /* column not migrated yet — ignore */ }
      } else {
        const { error: seenErr } = await supabase
          .from("license_activations")
          .update({ last_seen_at: nowIso })
          .eq("id", existingDevice.id);
        if (seenErr) {
          // Older schema only has last_seen — retry with that column.
          await supabase
            .from("license_activations")
            .update({ last_seen: nowIso })
            .eq("id", existingDevice.id);
        }
      }
    }

    logDecision(chosen.state === "grace" ? "grace" : "active", license.license_key, chosen.daysLeft);
    return respond(200, {
      active: true,
      status: chosen.state,
      type: trial ? "trial" : "paid",
      email,
      customer_name: profile.full_name || undefined,
      product_name: license.product?.name || productName || undefined,
      plan_name: license.plan?.name || (trial ? "Free Trial" : undefined),
      license_key: license.license_key,
      expiry_date: license.expiry_date,
      days_left: chosen.daysLeft,
      max_devices: license.max_devices,
      ...(trial ? { trial: true, trial_ends_at: license.expiry_date } : {}),
      ...(chosen.state === "grace"
        ? { message: "License expired — you are in the grace period. Please renew soon.", renew_url: RENEW_URL }
        : { message: "License activated via Google sign-in." })
    });
  } catch (err) {
    fireLog({ function_name: "google-verify", license_key: "", ip, status: "error", meta: { days_left: null } });
    return respond(500, { active: false, reason: "error", message: err.message });
  }
};
