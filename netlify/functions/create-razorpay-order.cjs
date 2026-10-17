// Netlify Serverless Function: Create Razorpay Order
// Endpoint: POST /.netlify/functions/create-razorpay-order OR /api/create-razorpay-order

exports.handler = async (event, context) => {
  // CORS Preflight
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
    const amountInINR = parseFloat(data.amount || 0);
    const currency = data.currency || "INR";
    const receipt = data.receipt || `rcpt_${Date.now()}`;
    const notes = data.notes || {};

    if (!amountInINR || amountInINR <= 0) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: false, message: "Invalid amount specified." })
      };
    }

    // Key ID and Secret can come from Environment variables (preferred) or request body
    const keyId = process.env.RAZORPAY_KEY_ID || data.razorpayKeyId || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || data.razorpayKeySecret || "";

    if (!keyId || !keySecret) {
      // Return order info for client-side direct payment mode
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          mode: "client_checkout",
          amount: Math.round(amountInINR * 100),
          currency: currency,
          key_id: keyId || "rzp_test_placeholder",
          receipt: receipt,
          notes: notes,
          message: "Razorpay environment keys not set in Netlify; proceeding with direct checkout mode."
        })
      };
    }

    // Amount in Razorpay is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amountInINR * 100);

    // Call Razorpay API using Basic Auth
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency,
        receipt: receipt,
        notes: notes
      })
    });

    const orderResult = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: orderResult.error ? orderResult.error.description : "Razorpay order creation failed",
          error: orderResult
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        order_id: orderResult.id,
        amount: orderResult.amount,
        currency: orderResult.currency,
        key_id: keyId,
        receipt: orderResult.receipt
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, message: "Server error: " + err.message })
    };
  }
};
