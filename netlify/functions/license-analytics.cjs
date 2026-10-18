// Netlify Serverless Function: Admin License Analytics
// Endpoint: GET/POST /api/license-analytics OR /.netlify/functions/license-analytics
// Auth: header x-api-key === process.env.LICENSE_API_KEY

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class {};
}
const { createClient } = require("@supabase/supabase-js");

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
    if (event.httpMethod === "GET") {
      action = event.queryStringParameters?.action || "";
    } else {
      const data = JSON.parse(event.body || "{}");
      action = data.action || "";
    }

    if (action && action !== "summary") {
      return respond(400, { success: false, message: `Unknown action '${action}'` });
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const in7Days = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // 1. License counts grouped by status
    const { data: licenses, error: licErr } = await supabase.from("licenses").select("status, product_id, expiry_date");
    if (licErr) throw licErr;
    const licenseCounts = {};
    for (const l of licenses || []) {
      licenseCounts[l.status] = (licenseCounts[l.status] || 0) + 1;
    }

    // 2. Licenses expiring within next 7 days (active, not lifetime)
    let expiring7 = 0;
    for (const l of licenses || []) {
      if (l.status !== "active" || !l.expiry_date || String(l.expiry_date).startsWith("9999")) continue;
      if (l.expiry_date >= todayStr && l.expiry_date <= in7Days) expiring7++;
    }

    // 3. Activations today
    const { count: activationsToday, error: actErr } = await supabase
      .from("license_activations")
      .select("id", { count: "exact", head: true })
      .gte("activated_at", startOfToday);
    if (actErr) throw actErr;

    // 4. Revenue by month (last 6 months, paid payments)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
    const { data: payments, error: payErr } = await supabase
      .from("payments")
      .select("amount, paid_at, created_at")
      .eq("status", "paid")
      .gte("paid_at", sixMonthsAgo);
    if (payErr) throw payErr;
    const revenueMap = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueMap[key] = 0;
    }
    for (const p of payments || []) {
      const dt = new Date(p.paid_at || p.created_at);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      if (key in revenueMap) revenueMap[key] += Number(p.amount) || 0;
    }
    const revenueByMonth = Object.keys(revenueMap).sort().map((month) => ({
      month,
      total: Math.round(revenueMap[month] * 100) / 100
    }));

    // 5. Top 5 products by license count
    const productCounts = {};
    for (const l of licenses || []) {
      if (!l.product_id) continue;
      productCounts[l.product_id] = (productCounts[l.product_id] || 0) + 1;
    }
    const topIds = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    let productNames = {};
    if (topIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", topIds.map(([id]) => id));
      for (const p of products || []) productNames[p.id] = p.name;
    }
    const topProducts = topIds.map(([product_id, count]) => ({
      product_id,
      product_name: productNames[product_id] || "Unknown",
      count
    }));

    return respond(200, {
      success: true,
      data: {
        license_counts: licenseCounts,
        expiring_7_days: expiring7,
        activations_today: activationsToday || 0,
        revenue_by_month: revenueByMonth,
        top_products: topProducts
      },
      meta: { server_time: now.toISOString() }
    });
  } catch (err) {
    return respond(500, { success: false, message: err.message });
  }
};
