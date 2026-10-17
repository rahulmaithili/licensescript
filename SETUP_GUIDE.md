# Mr.Rahul Scripts — SaaS Licensing & Billing Portal Setup Guide
### (Supabase Database + Netlify Hosting + Razorpay Payment Integration)

---

## 🌟 Overview & Kya Kya Setup Kiya Gaya Hai:

1. **Supabase Database (PostgreSQL Cloud DB):**
   - Google Sheets backend ko replace karke **Supabase** cloud database setup kiya gaya hai.
   - `supabase_schema.sql` me complete database structure (tables: `products`, `plans`, `users`, `payments`, `settings`, `reviews`), RLS security policies, aur sample data ready hai.
   - `supabase-client.js` client-side direct queries & updates handle karta hai.

2. **Razorpay Payment Gateway Integration:**
   - Real-time **Razorpay Checkout modal** integrate kiya gaya hai.
   - User kisi bhi UPI App (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Card, NetBanking, ya Wallets se 1-click me payment kar sakta hai.
   - Payment hote hi license key **INSTANT AUTO-ACTIVATE** ho jati hai, confetti animation aati hai, aur PDF invoice + credentials download ho jate hain.
   - Backup ke liye **Manual UPI QR + 12-digit UTR** accordion option bhi available rakha gaya hai.

3. **Netlify Ready Frontend & Serverless Functions:**
   - Static frontend `netlify.toml` ke sath configured hai.
   - Netlify Serverless Functions in `netlify/functions/`:
     - `create-razorpay-order.js` (Razorpay order create karne ke liye)
     - `verify-razorpay-payment.js` (HMAC SHA256 signature verify karne aur Supabase me save karne ke liye)
     - `verify-license.js` (Chrome Extensions & External tools ke liye verification API)
     - `portal-api.js` (Unified portal data & reviews API)

4. **World-Class SaaS UI/UX Design:**
   - **Frontend:** Modern dark/light mode toggle, glowing glassmorphic cards, hero banner with trust badges, product catalog, pricing tabs, live key validator, testimonials.
   - **User Panel:** Account dashboard me active license cards, days remaining countdown, hardware device lock status, 1-click key copy, "Renew with Razorpay" button, aur software download button.
   - **Admin Panel:** Real-time stats (Total Revenue in ₹, Active Users, Pending, Blocked), filterable users table, manual trial key generator, reviews manager, pricing manager, aur dedicated **⚡ Supabase & Razorpay Configuration** tab jisme live connection test button available hai.

---

## 🛠️ Step-by-Step Setup Instructions:

### Step 1: Supabase Database Setup (Sirf 2 Minute)
1. [supabase.com](https://supabase.com) pe jayein aur ek free project banayein.
2. Dashboard me left menu me **SQL Editor** par click karein.
3. **New Query** par click karein.
4. Project root folder me `supabase_schema.sql` file ko open karein, sara code copy karke Supabase SQL Editor me paste karein aur **Run** dabayein.
5. Saare tables (`products`, `plans`, `users`, `payments`, `settings`, `reviews`) turant create ho jayenge aur default plans seed ho jayenge.
6. Supabase Dashboard me **Project Settings** &rarr; **API** par jayein aur ye dono cheezein copy karein:
   - **Project URL** (e.g. `https://xyzabc.supabase.co`)
   - **Project API Keys** &rarr; `anon public` key.

---

### Step 2: Razorpay Payment Gateway Setup
1. [razorpay.com](https://razorpay.com) pe login karein.
2. Dashboard me **Settings** &rarr; **API Keys** par jayein.
3. **Generate Key** par click karein:
   - Pehle testing ke liye **Test Mode Key** use karein (`rzp_test_...`).
   - Jab live payments lene ho to **Live Mode Key** use karein (`rzp_live_...`).

---

### Step 3: Admin Panel me Credentials Dalna
1. Website open karein (`index.html`).
2. Top right user icon par click karein aur **Admin Panel** tab me jayein.
3. Default admin token `admin@123` enter karein.
4. Left sidebar me **⚡ Supabase & Razorpay** tab par click karein:
   - Supabase Project URL paste karein.
   - Supabase Anon Public Key paste karein.
   - Razorpay Key ID (`rzp_test_...` ya `rzp_live_...`) paste karein.
   - "Save Database & Razorpay Credentials" par click karein.
5. **Test Connection** button dabakar check karein — screen par green status aayega: `Supabase connection is LIVE and operational! 🎉`

---

### Step 4: Netlify Deployment
1. Ye project folder Netlify pe deploy karne ke liye bilkul ready hai.
2. **Method A (GitHub):** GitHub repository banakar is folder ko push karein aur Netlify me import karein.
3. **Method B (Drag & Drop):** Netlify Dashboard me jakar is pure folder ko seedha Drag & Drop karein.
4. (Optional) Netlify Dashboard me **Site Settings** &rarr; **Environment Variables** me ye add kar sakte hain:
   - `SUPABASE_URL` = `https://yourproject.supabase.co`
   - `SUPABASE_ANON_KEY` = `your_anon_key`
   - `RAZORPAY_KEY_ID` = `rzp_live_...`
   - `RAZORPAY_KEY_SECRET` = `your_secret`

---

## 🔌 Chrome Extension Verification Code:
Aapki Chrome Extension license check karne ke liye ab direct aapki Netlify site ko call karegi:

```javascript
// Inside your Chrome Extension background.js or popup.js
async function verifyExtensionLicense(licenseKey, deviceId) {
  try {
    const response = await fetch(`https://YOUR-SITE.netlify.app/api/verify-license?licenseKey=${encodeURIComponent(licenseKey)}&deviceId=${encodeURIComponent(deviceId)}`);
    const data = await response.json();
    
    if (data.status === 'active') {
      console.log('✅ License Active! Expiry:', data.expiry);
      return { success: true, expiry: data.expiry, name: data.name };
    } else if (data.status === 'device_mismatch') {
      alert('License is locked to another computer!');
      return { success: false, reason: 'device_mismatch' };
    } else if (data.status === 'expired') {
      alert('Your subscription has expired! Please renew on portal.');
      return { success: false, reason: 'expired' };
    } else {
      alert('Invalid license key!');
      return { success: false, reason: 'invalid' };
    }
  } catch (err) {
    console.error('Validation error:', err);
    return { success: false, reason: 'network_error' };
  }
}
```

---

## 📁 File Structure:
```
├── index.html                    <- Modern SaaS Landing, Products, Pricing, User & Admin Panels
├── style.css                     <- Premium design, glassmorphism, responsive, animations
├── portal.js                     <- Core UI controllers, Razorpay checkout, event handlers
├── supabase-client.js            <- Supabase PostgreSQL data layer & client SDK
├── supabase_schema.sql           <- 1-Click PostgreSQL database schema & initial seed data
├── netlify.toml                  <- Netlify build configuration, redirects, & CORS headers
├── package.json                  <- Dependencies (@supabase/supabase-js, razorpay)
└── netlify/
    └── functions/
        ├── create-razorpay-order.js   <- Secure Razorpay order generation
        ├── verify-razorpay-payment.js <- Payment signature verification & license activation
        ├── verify-license.js          <- Chrome Extension live verification endpoint
        └── portal-api.js              <- Serverless REST API router
```
