// Netlify Serverless Function: License Verification Endpoint (Used by Chrome Extensions & Apps)
// Endpoint: GET or POST /.netlify/functions/verify-license OR /api/verify-license

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

  try {
    let licenseKey = "";
    let deviceId = "";

    if (event.httpMethod === "GET") {
      licenseKey = event.queryStringParameters?.licenseKey || event.queryStringParameters?.key || "";
      deviceId = event.queryStringParameters?.deviceId || "";
    } else {
      const data = JSON.parse(event.body || "{}");
      licenseKey = data.licenseKey || data.key || "";
      deviceId = data.deviceId || "";
    }

    if (!licenseKey) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ status: "invalid", message: "License key is required." })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: "mock_active",
          name: "Test User",
          company: "Demo Agency",
          expiry: "2029-12-31",
          message: "Supabase credentials not configured in Netlify env. Running in demo mode."
        })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query user by license key
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("license_key", licenseKey)
      .single();

    if (error || !user) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: "invalid", message: "License key is invalid or does not exist." })
      };
    }

    // Check if blocked
    if (user.status === "Blocked") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: "blocked", message: "Your license key has been BLOCKED by the administrator." })
      };
    }

    // Check device binding
    if (deviceId) {
      if (!user.device_id) {
        // Bind device ID on first use
        await supabase
          .from("users")
          .update({ device_id: deviceId, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      } else if (user.device_id !== deviceId) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            status: "device_mismatch",
            message: "License active on another device. Contact support to transfer devices."
          })
        };
      }
    }

    // Check Expiry
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isExpired = false;
    if (user.expiry_date) {
      const expiryDate = new Date(user.expiry_date);
      expiryDate.setHours(23, 59, 59, 999);
      if (expiryDate < today) {
        isExpired = true;
        await supabase
          .from("users")
          .update({ status: "Expired", updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }
    }

    if (user.status === "Active" && !isExpired) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: "active",
          name: user.name,
          company: user.company_name,
          expiry: user.expiry_date,
          toolId: user.tool_id
        })
      };
    } else if (isExpired || user.status === "Expired") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: "expired", expiry: user.expiry_date, message: "License expired." })
      };
    } else {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: "pending_payment", message: "Payment pending or unverified." })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ status: "error", message: "Internal server error: " + err.message })
    };
  }
};
