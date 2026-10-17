// Netlify Serverless Function: Unified Portal API Router
// Endpoint: POST /.netlify/functions/portal-api OR /api/portal-api

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event, context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        message: "Supabase environment variables not set in Netlify. Please set SUPABASE_URL and SUPABASE_ANON_KEY."
      })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

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

    // 1. Get Portal Data (Products + Plans + Settings)
    if (action === "get_portal_data") {
      const { data: products } = await supabase.from("products").select("*").eq("status", "Active");
      const { data: plans } = await supabase.from("plans").select("*");
      const { data: settingsRows } = await supabase.from("settings").select("*");

      const settings = {};
      if (settingsRows) {
        settingsRows.forEach(s => { settings[s.key] = s.value; });
      }

      const productsWithPlans = (products || []).map(prod => ({
        toolId: prod.tool_id,
        name: prod.name,
        description: prod.description,
        features: prod.features ? prod.features.split(",").map(f => f.trim()) : [],
        downloadUrl: prod.download_url,
        plans: (plans || [])
          .filter(p => p.tool_id === prod.tool_id)
          .map(p => ({
            id: p.plan_id,
            name: p.plan_name,
            duration: p.duration_days,
            price: parseFloat(p.price_inr)
          }))
      }));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          products: productsWithPlans,
          settings: settings
        })
      };
    }

    // 2. Get Reviews
    if (action === "get_reviews") {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "Active")
        .order("created_at", { ascending: false });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          reviews: (reviews || []).map(r => ({
            id: r.id,
            name: r.name,
            company: r.company,
            photoUrl: r.photo_url,
            stars: r.stars,
            reviewText: r.review_text,
            timestamp: r.created_at
          }))
        })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message: `Unknown action '${action}'` })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message: err.message })
    };
  }
};
