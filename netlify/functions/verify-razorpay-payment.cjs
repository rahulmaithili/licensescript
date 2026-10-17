// Netlify Serverless Function: Verify Razorpay Payment & Activate License
// Endpoint: POST /.netlify/functions/verify-razorpay-payment OR /api/verify-razorpay-payment

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class {};
}
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, message: "Method Not Allowed" })
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      licenseKey,
      planId,
      toolId,
      email,
      name,
      companyName,
      durationDays = 30
    } = data;

    if (!razorpay_payment_id || !licenseKey) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: false, message: "Missing required payment details." })
      };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || data.razorpayKeySecret || "";

    // If order ID and secret are present, verify HMAC SHA256 signature
    if (razorpay_order_id && razorpay_signature && keySecret) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return {
          statusCode: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ success: false, message: "Invalid payment signature verification!" })
        };
      }
    }

    // Calculate Expiry Date
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + (parseInt(durationDays, 10) || 30));
    const expiryStr = expiry.toISOString().split("T")[0];

    // Supabase client initialization
    const supabaseUrl = process.env.SUPABASE_URL || data.supabaseUrl || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || data.supabaseAnonKey || "";

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      // 1. Update user license status to Active
      const { error: userError } = await supabase
        .from("users")
        .update({
          status: "Active",
          plan_id: planId,
          expiry_date: expiryStr,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id || "",
          updated_at: new Date().toISOString()
        })
        .eq("license_key", licenseKey);

      if (userError) {
        console.error("Supabase user update error:", userError);
      }

      // 2. Record payment
      await supabase.from("payments").insert([
        {
          license_key: licenseKey,
          email: email || "",
          amount_inr: parseFloat(data.amount || 0),
          razorpay_order_id: razorpay_order_id || "",
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature || "",
          payment_method: "razorpay",
          status: "success",
          tool_id: toolId || "cdcms_helper",
          plan_id: planId || "default"
        }
      ]);
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        licenseKey: licenseKey,
        expiryDate: expiryStr,
        status: "Active",
        paymentId: razorpay_payment_id,
        message: "Payment successfully verified and license activated!"
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, message: "Payment verification error: " + err.message })
    };
  }
};
