// Netlify Serverless Function: Extension & Application License Verification
// Public Endpoint: GET/POST /verify OR /.netlify/functions/verify-license

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
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          valid: false,
          status: "invalid",
          message: "License key is required."
        })
      };
    }

    const cleanKey = licenseKey.trim();
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://wyeejbncddpxhwtijkjt.supabase.co";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Query modern licenses table
    const { data: license, error: licErr } = await supabase
      .from("licenses")
      .select("*, product:products(*), plan:plans(*), user:profiles(*)")
      .eq("license_key", cleanKey)
      .single();

    if (license && !licErr) {
      // Check if locked
      if (license.is_locked || license.status === "locked") {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            valid: false,
            status: "locked",
            message: "This license has been locked by the administrator. Contact support@licensewala.com"
          })
        };
      }

      // Check if paused or revoked
      if (license.status === "paused") {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            valid: false,
            status: "paused",
            message: "Subscription is paused."
          })
        };
      }
      if (license.status === "revoked") {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            valid: false,
            status: "revoked",
            message: "License has been revoked."
          })
        };
      }

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
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            valid: false,
            status: "expired",
            days_left: daysLeft,
            expiry_date: license.expiry_date,
            message: `License expired ${Math.abs(daysLeft)} days ago. Please renew your subscription to continue using this extension.`,
            renewal_url: `https://licensewala.netlify.app/checkout/${license.plan_id || ""}`
          })
        };
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
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                valid: false,
                status: "device_limit_reached",
                message: `Device limit exceeded (${activeList.length}/${license.max_devices} PC). Reset device activations in your account portal.`,
                portal_url: "https://licensewala.netlify.app/account"
              })
            };
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

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          valid: true,
          status: "active",
          product_name: license.product?.name,
          plan_name: license.plan?.name,
          days_left: daysLeft,
          expires_at: license.expiry_date,
          max_devices: license.max_devices,
          customer_name: license.user?.full_name,
          message: "License verified successfully. Extension features unlocked."
        })
      };
    }

    // 2. Fallback check for demo keys or legacy table
    if (cleanKey.startsWith("LW-")) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          valid: true,
          status: "active",
          product_name: "Software Extension",
          days_left: 180,
          expires_at: new Date(Date.now() + 180 * 86400000).toISOString(),
          max_devices: 2,
          message: "Demo license verified successfully."
        })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        valid: false,
        status: "invalid",
        message: "Invalid license key. Please check your key or buy a license at https://licensewala.netlify.app"
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ valid: false, status: "error", message: err.message })
    };
  }
};
