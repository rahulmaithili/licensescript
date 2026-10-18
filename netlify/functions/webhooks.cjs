// Netlify Serverless Function: Webhook Dispatcher
// Endpoint: POST/GET /api/webhooks OR /.netlify/functions/webhooks
// Auth: header x-api-key === process.env.LICENSE_API_KEY

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class {};
}
const { createClient } = require("@supabase/supabase-js");

const ALLOWED_EVENTS = ["license.activated", "license.expired", "license.revoked", "payment.succeeded"];
const DISPATCH_TIMEOUT_MS = 5000;

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
    let action = "";
    let data = {};
    if (event.httpMethod === "GET") {
      action = event.queryStringParameters?.action || "";
      data = event.queryStringParameters || {};
    } else {
      data = JSON.parse(event.body || "{}");
      action = data.action || "";
    }

    // ---------- REGISTER ----------
    if (action === "register") {
      const ev = data.event || "";
      const url = data.url || "";
      if (!ALLOWED_EVENTS.includes(ev)) {
        return respond(400, { success: false, message: `Invalid event. Allowed: ${ALLOWED_EVENTS.join(", ")}` });
      }
      const isLocalDev = url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1");
      if (!url.startsWith("https://") && !isLocalDev) {
        return respond(400, { success: false, message: "URL must start with https:// (http://localhost allowed for dev)." });
      }
      const { data: row, error } = await supabase
        .from("webhooks")
        .insert([{ event: ev, url, is_active: true }])
        .select("id, event, url")
        .single();
      if (error) throw error;
      return respond(200, { success: true, webhook: row });
    }

    // ---------- DISPATCH ----------
    if (action === "dispatch") {
      const ev = data.event || "";
      const payload = data.payload || {};
      if (!ALLOWED_EVENTS.includes(ev)) {
        return respond(400, { success: false, message: `Invalid event. Allowed: ${ALLOWED_EVENTS.join(", ")}` });
      }
      const { data: hooks, error } = await supabase
        .from("webhooks")
        .select("url")
        .eq("event", ev)
        .eq("is_active", true);
      if (error) throw error;

      const results = [];
      for (const hook of hooks || []) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS);
        try {
          const res = await fetch(hook.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: ev, ...payload }),
            signal: controller.signal
          });
          results.push({ url: hook.url, ok: res.ok, status: res.status });
        } catch (e) {
          results.push({ url: hook.url, ok: false, status: "error" });
        } finally {
          clearTimeout(timer);
        }
      }

      // Best-effort dispatch logging — never breaks the response
      try {
        const q = supabase.from("api_logs").insert([{
          function_name: "webhooks",
          status: "dispatch:" + ev,
          meta: { event: ev, results }
        }]);
        if (q && typeof q.then === "function") q.then(() => {}).catch(() => {});
      } catch (e) { /* silently ignore */ }

      return respond(200, { success: true, dispatched: results.length, results });
    }

    // ---------- LIST ----------
    if (action === "list" || action === "") {
      const { data: hooks, error } = await supabase
        .from("webhooks")
        .select("id, event, url, is_active, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return respond(200, { success: true, webhooks: hooks || [] });
    }

    return respond(400, { success: false, message: `Unknown action '${action}'` });
  } catch (err) {
    return respond(500, { success: false, message: err.message });
  }
};
