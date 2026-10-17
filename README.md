<div align="center">

  # ⚡ LicenseVault & CDCMS SaaS Portal
  ### *Next-Gen Software Licensing, Billing & Extension Management Platform*

  <p align="center">
    <b>A complete, turnkey platform for selling, licensing, and protecting Chrome extensions and software applications. Powered by Supabase PostgreSQL, Razorpay Instant Checkout, and Netlify Serverless Functions.</b>
  </p>

  <p align="center">
    <a href="https://licensescript.netlify.app/"><img src="https://img.shields.io/badge/Live_Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://razorpay.com"><img src="https://img.shields.io/badge/Payments-Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=blue" alt="Razorpay" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Security-256--bit_AES-blueviolet?style=for-the-badge&logo=shield" alt="Encryption" /></a>
    <a href="#"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>
  </p>

  <br />

  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" alt="LicenseVault SaaS Banner" width="100%" style="border-radius: 12px; max-height: 400px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);" />

</div>

---

## 🚀 Key Highlights & What's Inside

<table>
  <tr>
    <td width="50%">
      <h3>💳 Razorpay Instant Activation</h3>
      <ul>
        <li><b>Zero Wait Time:</b> 1-Click checkout with Google Pay, PhonePe, Paytm, Cards, and NetBanking.</li>
        <li><b>Instant Key Delivery:</b> License automatically turns <code>Active</code> within 2 seconds of payment.</li>
        <li><b>Automatic Downloads:</b> Customer receives an encrypted credentials file and itemized PDF invoice instantly.</li>
        <li><b>Manual UPI Fallback:</b> Supports dynamic QR codes and 12-digit UTR verification.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🗄️ Supabase PostgreSQL Cloud DB</h3>
      <ul>
        <li><b>Lightning-Fast:</b> Replaces slow spreadsheets with real-time relational PostgreSQL.</li>
        <li><b>Row Level Security (RLS):</b> Protects sensitive customer keys and license records.</li>
        <li><b>1-Click Migration:</b> Pre-built <code>supabase_schema.sql</code> script with default plans & products.</li>
        <li><b>Live Health Check:</b> Real-time connection tester directly inside Admin Dashboard.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔒 Hardware Device Binding & Expiry</h3>
      <ul>
        <li><b>Single-PC Locking:</b> Locks license key to the user's computer on first extension run.</li>
        <li><b>Device Mismatch Detection:</b> Prevents unauthorized license sharing across agencies.</li>
        <li><b>Auto-Expiry Engine:</b> Dynamically tracks 7 days, 90 days, 180 days, and 365 days durations.</li>
        <li><b>1-Click Device Reset:</b> Admin can unlock and transfer devices effortlessly.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📊 Unified Admin Control Center</h3>
      <ul>
        <li><b>Real-Time Analytics:</b> Total Revenue in ₹ INR, Active Users, Pending Verifications, Blocked.</li>
        <li><b>Search & Filtering:</b> Instant filtering by Tool ID, status, name, company, or UTR.</li>
        <li><b>Manual Trial Generator:</b> Generate custom trials or guest keys with custom expiry.</li>
        <li><b>Catalog & Pricing Setup:</b> Dynamically add new extensions, features, and pricing tiers.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🖥️ Platform Showcase

### 1. High-Converting Public Storefront
- **Dynamic Pricing Engine:** Multi-product tab switchers with customized durations (7 Days, 3 Months, 6 Months, 1 Year).
- **Interactive License Validator:** Real-time terminal for customers to test their license keys live.
- **Client Testimonials:** Verified customer reviews carousel with ratings and company details.
- **Dark & Light Mode:** Seamless glassmorphic visual aesthetic with radiant glowing borders.

### 2. Customer Dashboard & Self-Service Portal
- **License Status Chip:** 🟢 Active, 🔴 Expired, 🟡 Pending status.
- **Remaining Days Counter:** Real-time visual countdown bar (e.g., *"45 days remaining"*).
- **Hardware Binding Chip:** Displays current bound Device ID with transfer indicator.
- **1-Click Renewal:** Direct Razorpay checkout button to renew expired plans instantly without re-registration.

### 3. Full-Featured Admin Panel (`/admin`)
- **Users & Licenses Management:** Approve, block, unblock, delete, reset hardware locks, or edit expiry dates.
- **Database & Razorpay Config:** Test your live Supabase connection and verify Razorpay keys in real time.
- **Review Moderator:** Approve, edit, or remove customer reviews.
- **GST Invoice Generator:** Print itemized, GST-compliant tax invoices with printable CSS.

---

## 📂 Project Architecture

```plaintext
├── index.html                           # Modern SaaS Landing, Storefront, User & Admin Panels
├── style.css                            # Glassmorphism design system, responsive styles & animations
├── portal.js                            # Frontend controller, Razorpay checkout, event handlers
├── supabase-client.js                   # Client-side Supabase data access layer & fallback engine
├── supabase_schema.sql                  # 1-Click PostgreSQL schema, tables, seed data & RLS policies
├── netlify.toml                         # Netlify build configuration, redirects & CORS headers
├── package.json                         # Node dependencies (@supabase/supabase-js, razorpay)
├── SETUP_GUIDE.md                       # Comprehensive deployment & integration guide
└── netlify/
    └── functions/
        ├── create-razorpay-order.js     # Serverless Razorpay order creation
        ├── verify-razorpay-payment.js   # HMAC SHA256 signature verification & Supabase sync
        ├── verify-license.js            # High-speed verification API for Chrome extensions
        └── portal-api.js                # Serverless unified data router
```

---

## ⚡ 3-Minute Quick Setup

### Step 1: Database Setup (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** &rarr; **New query**.
3. Copy the entire contents of [`supabase_schema.sql`](./supabase_schema.sql) and click **Run**.
4. Go to **Project Settings** &rarr; **API** and copy your **Project URL** and **`anon public` API key**.

### Step 2: Payment Gateway Setup (Razorpay)
1. Log into your [razorpay.com](https://razorpay.com) Dashboard.
2. Go to **Settings** &rarr; **API Keys** and generate your **Key ID** (`rzp_test_...` or `rzp_live_...`).

### Step 3: Connect Credentials in Admin Panel
1. Open the website, click the user profile icon (top right) &rarr; switch to **Admin Panel**.
2. Sign in using the default token: `admin@123`.
3. Open the **⚡ Supabase & Razorpay** tab.
4. Paste your **Supabase URL**, **Anon Key**, and **Razorpay Key ID**.
5. Click **Save** and test the live connection!

---

## 🔌 Chrome Extension Verification Code

Add this lightweight snippet into your Chrome Extension's `background.js` or `popup.js`:

```javascript
// Verify license key and bind device ID
async function verifyLicense(licenseKey, deviceId) {
  try {
    const url = `https://YOUR-SITE.netlify.app/api/verify-license?licenseKey=${encodeURIComponent(licenseKey)}&deviceId=${encodeURIComponent(deviceId)}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.status === "active") {
      console.log(`✅ License verified! Valid until: ${result.expiry}`);
      return { success: true, expiry: result.expiry, name: result.name };
    } else if (result.status === "device_mismatch") {
      alert("⚠️ License is locked to another computer! Contact support.");
      return { success: false, error: "device_mismatch" };
    } else if (result.status === "expired") {
      alert("⌛ Your license has expired. Please renew on the billing portal.");
      return { success: false, error: "expired" };
    } else {
      alert("❌ Invalid license key!");
      return { success: false, error: "invalid" };
    }
  } catch (err) {
    console.error("Network validation error:", err);
    return { success: false, error: "network_error" };
  }
}
```

---

## 🌐 Netlify Deployment Environment Variables

When deploying to Netlify, set these under **Site Settings** &rarr; **Environment variables**:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Your Supabase project URL | `https://xyzcompany.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase public anonymous key | `eyJhbGciOi...` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (Test or Live) | `rzp_live_1234567890` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `5xXABC123XYZ...` |

---

## 🔒 Security Best Practices
- **HMAC SHA-256 Signature Verification:** Payments verified server-side to prevent spoofing.
- **Hardware Footprint Matching:** Device IDs validated on every session check.
- **CORS Restricted Endpoints:** Cross-origin security policies on API routes.
- **Password Protection:** MD5 customer password hashing with OTP reset capability.

---

## 📄 License
This project is licensed under the **MIT License**. Free for commercial and private use.

<br />

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/rahulmaithili">Mr.Rahul Scripts</a> · Powered by Supabase & Razorpay</sub>
</div>
