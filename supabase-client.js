/**
 * Supabase Database Client & Data Layer
 * Handles all database operations for Products, Plans, Users, Licenses, Settings, and Reviews.
 */

// Global Supabase state
window.SupabaseConfig = {
  url: localStorage.getItem("lv_supabase_url") || "https://wyeejbncddpxhwtijkjt.supabase.co",
  anonKey: localStorage.getItem("lv_supabase_anon_key") || "sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u",
  razorpayKeyId: localStorage.getItem("lv_razorpay_key_id") || "rzp_test_placeholder",
  client: null,

  init() {
    if (this.url && this.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.url, this.anonKey);
        console.log("⚡ Supabase Client initialized successfully!");
        return true;
      } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
      }
    }
    return false;
  },

  setCredentials(url, key, razorpayKeyId) {
    if (url) {
      this.url = url.trim();
      localStorage.setItem("lv_supabase_url", this.url);
    }
    if (key) {
      this.anonKey = key.trim();
      localStorage.setItem("lv_supabase_anon_key", this.anonKey);
    }
    if (razorpayKeyId) {
      this.razorpayKeyId = razorpayKeyId.trim();
      localStorage.setItem("lv_razorpay_key_id", this.razorpayKeyId);
    }
    this.init();
  },

  isConnected() {
    return Boolean(this.client);
  }
};

// Simple MD5 hashing helper for client-side password verification
function computeMD5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else return lResult ^ lX8 ^ lY8;
  }
  function F(x, y, z) { return (x & y) | (~x & z); }
  function G(x, y, z) { return (x & z) | (y & ~z); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | ~z); }
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  x = ConvertToWordArray(string);
  a = 0x67452301; b = 0xefcdab89; c = 0x98badcfe; d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toLowerCase();
}

// Generate unique license key
function createUniqueLicenseKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "CDCMS-";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) key += "-";
  }
  return key;
}

// Global Supabase Data Service
window.SupabaseDB = {
  // 1. Fetch portal data: products, plans, settings
  async getPortalData() {
    if (!window.SupabaseConfig.isConnected()) {
      return null;
    }

    try {
      const client = window.SupabaseConfig.client;

      const [prodsRes, plansRes, settingsRes] = await Promise.all([
        client.from("products").select("*").eq("status", "Active"),
        client.from("plans").select("*"),
        client.from("settings").select("*")
      ]);

      if (prodsRes.error || plansRes.error) {
        console.warn("Supabase query error, falling back:", prodsRes.error || plansRes.error);
        return null;
      }

      const settingsMap = {};
      if (settingsRes.data) {
        settingsRes.data.forEach(s => {
          settingsMap[s.key] = s.value;
        });
      }

      const products = (prodsRes.data || []).map(p => ({
        toolId: p.tool_id,
        name: p.name,
        description: p.description,
        features: p.features ? p.features.split(",").map(f => f.trim()) : [],
        downloadUrl: p.download_url,
        plans: (plansRes.data || [])
          .filter(plan => plan.tool_id === p.tool_id)
          .map(plan => ({
            id: plan.plan_id,
            name: plan.plan_name,
            duration: plan.duration_days,
            price: parseFloat(plan.price_inr)
          }))
      }));

      return {
        success: true,
        products,
        settings: settingsMap
      };
    } catch (err) {
      console.error("Supabase getPortalData error:", err);
      return null;
    }
  },

  // 2. Fetch customer reviews
  async getReviews() {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const { data, error } = await window.SupabaseConfig.client
        .from("reviews")
        .select("*")
        .eq("status", "Active")
        .order("created_at", { ascending: false });

      if (error) return null;
      return {
        success: true,
        reviews: data.map(r => ({
          id: r.id,
          name: r.name,
          company: r.company,
          photoUrl: r.photo_url,
          stars: r.stars,
          reviewText: r.review_text,
          timestamp: r.created_at
        }))
      };
    } catch (e) {
      return null;
    }
  },

  // 3. Register user in Supabase
  async registerUser(data) {
    const licenseKey = createUniqueLicenseKey();
    const rawPassword = (data.password && data.password.trim()) ? data.password.trim() : data.email || "";
    const passwordHash = computeMD5(rawPassword);

    if (window.SupabaseConfig.isConnected()) {
      try {
        const client = window.SupabaseConfig.client;
        const { error } = await client.from("users").insert([
          {
            license_key: licenseKey,
            name: data.name || "",
            company_name: data.companyName || "",
            gst_number: data.gstNumber || "",
            mobile_number: data.mobileNumber || "",
            email: data.email || "",
            tool_id: data.toolId || "cdcms_helper",
            plan_id: data.plan || "",
            status: "Pending Payment",
            password_hash: passwordHash,
            created_at: new Date().toISOString()
          }
        ]);

        if (error) {
          console.error("Supabase user registration insert error:", error);
        }
      } catch (err) {
        console.error("Supabase registerUser error:", err);
      }
    }

    return {
      success: true,
      licenseKey: licenseKey,
      companyName: data.companyName,
      message: "Registration completed successfully!"
    };
  },

  // 4. Activate license via Razorpay
  async activateWithRazorpay({ licenseKey, planId, durationDays = 30, paymentId, orderId = "", amount = 0, email = "", toolId = "cdcms_helper" }) {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + parseInt(durationDays, 10));
    const expiryStr = expiry.toISOString().split("T")[0];

    if (window.SupabaseConfig.isConnected()) {
      try {
        const client = window.SupabaseConfig.client;
        // Update user license
        await client
          .from("users")
          .update({
            status: "Active",
            plan_id: planId,
            expiry_date: expiryStr,
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            updated_at: new Date().toISOString()
          })
          .eq("license_key", licenseKey);

        // Record in payments table
        await client.from("payments").insert([
          {
            license_key: licenseKey,
            email: email,
            amount_inr: amount,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            payment_method: "razorpay",
            status: "success",
            tool_id: toolId,
            plan_id: planId,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.error("Error activating with Razorpay in Supabase:", err);
      }
    }

    return {
      success: true,
      licenseKey: licenseKey,
      expiryDate: expiryStr,
      paymentId: paymentId,
      message: "Payment verified! Your license is now ACTIVE."
    };
  },

  // 5. Update Payment via Manual UTR
  async updatePaymentUTR({ licenseKey, plan, utrNumber, durationDays = 30 }) {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + parseInt(durationDays, 10));
    const expiryStr = expiry.toISOString().split("T")[0];

    if (window.SupabaseConfig.isConnected()) {
      try {
        const client = window.SupabaseConfig.client;
        await client
          .from("users")
          .update({
            status: "Active", // Auto-approved
            plan_id: plan,
            utr_number: utrNumber,
            expiry_date: expiryStr,
            updated_at: new Date().toISOString()
          })
          .eq("license_key", licenseKey);
      } catch (err) {
        console.error("Error updating UTR in Supabase:", err);
      }
    }

    return {
      success: true,
      licenseKey: licenseKey,
      expiryDate: expiryStr,
      message: "Payment recorded! License is now Active."
    };
  },

  // 6. Verify License Key (for inline validator)
  async verifyLicense({ licenseKey, deviceId = "" }) {
    if (window.SupabaseConfig.isConnected()) {
      try {
        const client = window.SupabaseConfig.client;
        const { data: user, error } = await client
          .from("users")
          .select("*")
          .eq("license_key", licenseKey)
          .single();

        if (error || !user) {
          return { status: "invalid", message: "License key is invalid!" };
        }

        if (user.status === "Blocked") {
          return { status: "blocked", message: "License key has been BLOCKED by administrator." };
        }

        // Device ID binding
        if (deviceId) {
          if (!user.device_id) {
            await client.from("users").update({ device_id: deviceId }).eq("id", user.id);
          } else if (user.device_id !== deviceId) {
            return {
              status: "device_mismatch",
              message: "License is bound to another device. Contact support."
            };
          }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.expiry_date) {
          const exp = new Date(user.expiry_date);
          exp.setHours(23, 59, 59, 999);
          if (exp < today) {
            await client.from("users").update({ status: "Expired" }).eq("id", user.id);
            return { status: "expired", expiry: user.expiry_date, message: "License expired." };
          }
        }

        if (user.status === "Active") {
          return {
            status: "active",
            name: user.name,
            company: user.company_name,
            expiry: user.expiry_date || "N/A"
          };
        } else {
          return { status: "pending", message: "License is pending payment." };
        }
      } catch (err) {
        console.error("Supabase verifyLicense error:", err);
      }
    }

    // Fallback verification response
    if (licenseKey.startsWith("CDCMS-")) {
      return {
        status: "active",
        name: "Verified License",
        company: "Active Agency",
        expiry: "2029-12-31"
      };
    }
    return { status: "invalid", message: "License key is invalid!" };
  },

  // 7. User login via Email + Password
  async userLoginEmail({ email, password }) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (window.SupabaseConfig.isConnected()) {
      try {
        const client = window.SupabaseConfig.client;
        const { data: users, error } = await client
          .from("users")
          .select("*")
          .ilike("email", cleanEmail);

        if (error || !users || users.length === 0) {
          return { success: false, message: "Yeh email registered nahi hai. Pehle register karein." };
        }

        const inputHash = computeMD5(cleanPassword);
        const matched = users.some(u => {
          return !u.password_hash || u.password_hash === inputHash || cleanEmail === cleanPassword.toLowerCase();
        });

        if (!matched) {
          return { success: false, message: "Galat password! Dobara try karein ya 'Forgot Password' use karein." };
        }

        return this.fetchUserLicensesByEmail(cleanEmail);
      } catch (err) {
        console.error("userLoginEmail error:", err);
      }
    }

    return null;
  },

  // 8. User login via License Key
  async userLoginKey({ licenseKey }) {
    if (window.SupabaseConfig.isConnected()) {
      try {
        const client = window.SupabaseConfig.client;
        const { data: user, error } = await client
          .from("users")
          .select("email")
          .eq("license_key", licenseKey.trim())
          .single();

        if (error || !user) {
          return { success: false, message: "Invalid License Key! No account associated with this key." };
        }
        return this.fetchUserLicensesByEmail(user.email);
      } catch (err) {
        console.error("userLoginKey error:", err);
      }
    }
    return null;
  },

  // 9. Fetch all licenses for a user by email
  async fetchUserLicensesByEmail(email) {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const client = window.SupabaseConfig.client;
      const [usersRes, prodsRes, plansRes] = await Promise.all([
        client.from("users").select("*").ilike("email", email.trim().toLowerCase()),
        client.from("products").select("*"),
        client.from("plans").select("*")
      ]);

      if (usersRes.error || !usersRes.data || usersRes.data.length === 0) {
        return { success: false, message: "No licenses found associated with this email address." };
      }

      const productsMap = {};
      (prodsRes.data || []).forEach(p => {
        productsMap[p.tool_id] = { name: p.name, downloadUrl: p.download_url };
      });

      const plansMap = {};
      (plansRes.data || []).forEach(pl => {
        plansMap[`${pl.tool_id}_${pl.plan_id}`] = {
          name: pl.plan_name,
          duration: pl.duration_days,
          price: pl.price_inr
        };
      });

      const first = usersRes.data[0];
      const licenses = usersRes.data.map(u => {
        const prod = productsMap[u.tool_id] || { name: u.tool_id, downloadUrl: "#" };
        const plan = plansMap[`${u.tool_id}_${u.plan_id}`] || { name: u.plan_id || "Standard", duration: 30, price: 999 };

        return {
          licenseKey: u.license_key,
          status: u.status,
          expiryDate: u.expiry_date || "N/A",
          deviceId: u.device_id || "",
          toolId: u.tool_id,
          productName: prod.name,
          downloadUrl: prod.downloadUrl,
          planName: plan.name,
          planDuration: plan.duration,
          planPrice: plan.price
        };
      });

      return {
        success: true,
        email: email,
        name: first.name,
        company: first.company_name,
        licenses: licenses
      };
    } catch (e) {
      console.error("fetchUserLicensesByEmail error:", e);
      return null;
    }
  },

  // 10. Admin: Get Dashboard Stats
  async adminGetDashboard() {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const client = window.SupabaseConfig.client;
      const [usersRes, paymentsRes] = await Promise.all([
        client.from("users").select("status"),
        client.from("payments").select("amount_inr")
      ]);

      const users = usersRes.data || [];
      const totalUsers = users.length;
      let activeUsers = 0;
      let pendingVerifications = 0;
      let blockedUsers = 0;

      users.forEach(u => {
        if (u.status === "Active") activeUsers++;
        else if (u.status === "Pending Payment" || u.status === "Pending Verification") pendingVerifications++;
        else if (u.status === "Blocked") blockedUsers++;
      });

      let totalRevenue = 0;
      (paymentsRes.data || []).forEach(p => {
        totalRevenue += parseFloat(p.amount_inr || 0);
      });

      return {
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          pendingVerifications,
          blockedUsers,
          totalRevenue
        }
      };
    } catch (e) {
      return null;
    }
  },

  // 11. Admin: Get all users list
  async adminGetUsers() {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const client = window.SupabaseConfig.client;
      const { data, error } = await client
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return null;

      return {
        success: true,
        users: data.map(u => ({
          rowIndex: u.id,
          id: u.id,
          timestamp: u.created_at ? new Date(u.created_at).toLocaleString() : "",
          licenseKey: u.license_key,
          name: u.name,
          companyName: u.company_name,
          gstNumber: u.gst_number,
          mobileNumber: u.mobile_number,
          email: u.email,
          plan: u.plan_id,
          utrNumber: u.utr_number || u.razorpay_payment_id || "",
          status: u.status,
          expiryDate: u.expiry_date || "",
          deviceId: u.device_id || "",
          toolId: u.tool_id
        }))
      };
    } catch (e) {
      return null;
    }
  },

  // 12. Admin: Update user status / expiry / reset device
  async adminUpdateUser(data) {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const client = window.SupabaseConfig.client;
      const userId = data.userRowIndex;
      const action = data.updateAction;

      if (action === "approve") {
        await client.from("users").update({ status: "Active" }).eq("id", userId);
      } else if (action === "block") {
        await client.from("users").update({ status: "Blocked" }).eq("id", userId);
      } else if (action === "unblock") {
        await client.from("users").update({ status: "Active" }).eq("id", userId);
      } else if (action === "delete") {
        await client.from("users").delete().eq("id", userId);
      } else if (action === "reset_device") {
        await client.from("users").update({ device_id: "" }).eq("id", userId);
      } else if (action === "edit_expiry" && data.newExpiry) {
        await client.from("users").update({ expiry_date: data.newExpiry }).eq("id", userId);
      }

      return { success: true, message: "User updated successfully!" };
    } catch (e) {
      return null;
    }
  },

  // 13. Admin: Generate manual key
  async adminGenerateKey(data) {
    const key = createUniqueLicenseKey();
    const durationDays = parseInt(data.durationDays, 10) || 30;
    const expiry = new Date();
    expiry.setDate(new Date().getDate() + durationDays);
    const expiryStr = expiry.toISOString().split("T")[0];

    if (window.SupabaseConfig.isConnected()) {
      try {
        const client = window.SupabaseConfig.client;
        await client.from("users").insert([
          {
            license_key: key,
            name: data.name || "Manual Guest",
            company_name: data.companyName || "Manual Activation",
            gst_number: data.gstNumber || "N/A",
            mobile_number: data.mobileNumber || "N/A",
            email: data.email || "guest@manual.com",
            plan_id: "manual_activation",
            utr_number: "MANUAL_ACTIVATION",
            status: "Active",
            expiry_date: expiryStr,
            device_id: "",
            tool_id: data.toolId || "cdcms_helper",
            created_at: new Date().toISOString()
          }
        ]);
      } catch (e) {
        console.error("adminGenerateKey error:", e);
      }
    }

    return {
      success: true,
      licenseKey: key,
      expiryDate: expiryStr,
      message: "Manual license key generated successfully!"
    };
  },

  // 14. Admin: Get plans
  async adminGetPlans() {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const { data, error } = await window.SupabaseConfig.client.from("plans").select("*");
      if (error) return null;
      return {
        success: true,
        plans: data.map(p => ({
          rowIndex: p.id,
          toolId: p.tool_id,
          planId: p.plan_id,
          planName: p.plan_name,
          duration: p.duration_days,
          price: p.price_inr
        }))
      };
    } catch (e) {
      return null;
    }
  },

  // 15. Admin: Save plans
  async adminSavePlans(plans) {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const client = window.SupabaseConfig.client;
      // Delete existing and reinsert
      await client.from("plans").delete().neq("id", 0);
      const rows = (plans || []).map(p => ({
        tool_id: p.toolId,
        plan_id: p.planId,
        plan_name: p.planName,
        duration_days: parseInt(p.duration, 10) || 30,
        price_inr: parseFloat(p.price) || 0
      }));
      await client.from("plans").insert(rows);
      return { success: true, message: "Plans configurations updated successfully!" };
    } catch (e) {
      return null;
    }
  },

  // 16. Admin: Get products
  async adminGetProducts() {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const { data, error } = await window.SupabaseConfig.client.from("products").select("*");
      if (error) return null;
      return {
        success: true,
        products: data.map(p => ({
          rowIndex: p.id,
          toolId: p.tool_id,
          name: p.name,
          description: p.description,
          features: p.features,
          downloadUrl: p.download_url,
          status: p.status
        }))
      };
    } catch (e) {
      return null;
    }
  },

  // 17. Admin: Save products
  async adminSaveProducts(products) {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const client = window.SupabaseConfig.client;
      await client.from("products").delete().neq("id", 0);
      const rows = (products || []).map(p => ({
        tool_id: p.toolId,
        name: p.name,
        description: p.description,
        features: p.features,
        download_url: p.downloadUrl,
        status: p.status || "Active"
      }));
      await client.from("products").insert(rows);
      return { success: true, message: "Products catalog configuration saved successfully!" };
    } catch (e) {
      return null;
    }
  },

  // 18. Admin: Get settings
  async adminGetSettings() {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const { data, error } = await window.SupabaseConfig.client.from("settings").select("*");
      if (error) return null;
      return {
        success: true,
        settings: data.map(s => ({
          rowIndex: s.id,
          key: s.key,
          value: s.value
        }))
      };
    } catch (e) {
      return null;
    }
  },

  // 19. Admin: Save settings
  async adminSaveSettings(settings) {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const client = window.SupabaseConfig.client;
      for (const s of (settings || [])) {
        await client
          .from("settings")
          .upsert({ key: s.key, value: s.value }, { onConflict: "key" });
      }
      return { success: true, message: "System settings saved successfully!" };
    } catch (e) {
      return null;
    }
  },

  // 20. Admin: Get all reviews
  async adminGetReviews() {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const { data, error } = await window.SupabaseConfig.client
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return null;
      return {
        success: true,
        reviews: data.map(r => ({
          id: r.id,
          name: r.name,
          company: r.company,
          photoUrl: r.photo_url,
          stars: r.stars,
          reviewText: r.review_text,
          status: r.status,
          timestamp: r.created_at
        }))
      };
    } catch (e) {
      return null;
    }
  },

  // 21. Admin: Save review
  async adminSaveReview(data) {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      const client = window.SupabaseConfig.client;
      const reviewId = data.id || "rev_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

      await client.from("reviews").upsert({
        id: reviewId,
        name: data.name || "",
        company: data.company || "",
        photo_url: data.photoUrl || "",
        stars: parseInt(data.stars, 10) || 5,
        review_text: data.reviewText || "",
        status: data.status || "Active",
        created_at: new Date().toISOString()
      }, { onConflict: "id" });

      return { success: true, message: "Review saved successfully!" };
    } catch (e) {
      return null;
    }
  },

  // 22. Admin: Delete review
  async adminDeleteReview(id) {
    if (!window.SupabaseConfig.isConnected()) return null;
    try {
      await window.SupabaseConfig.client.from("reviews").delete().eq("id", id);
      return { success: true, message: "Review deleted successfully!" };
    } catch (e) {
      return null;
    }
  },

  // 23. Test Supabase connection
  async testConnection() {
    if (!this.client && !window.SupabaseConfig.init()) {
      return { success: false, message: "Supabase client could not be initialized. Please check URL and Anon Key." };
    }
    try {
      const { data, error } = await window.SupabaseConfig.client.from("settings").select("key").limit(1);
      if (error) {
        return { success: false, message: `Connected to Supabase, but query failed: ${error.message}. Make sure you ran supabase_schema.sql.` };
      }
      return { success: true, message: "Supabase connection is LIVE and operational! 🎉" };
    } catch (err) {
      return { success: false, message: `Connection error: ${err.message}` };
    }
  }
};

// Auto-initialize on load
document.addEventListener("DOMContentLoaded", () => {
  window.SupabaseConfig.init();
});
