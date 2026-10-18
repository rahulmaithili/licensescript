# LicenseWala — Premium Software License Selling Platform
### Complete Production-Ready SaaS for Chrome Extensions, Automation Scripts & Desktop Applications

---

## 🚀 Overview

**LicenseWala** is an enterprise-grade software license generation, hardware binding, and subscription billing platform created and managed by **Super Admin RM Rahul**.

- **Public Storefront**: Modern high-converting SaaS landing page, dynamic product & extension catalog, transparent pricing, customer registration, and self-service portal.
- **Admin Command Center** (`/admin`): Complete control across 12 dedicated modules (Dashboard, User Licenses, Key Generator, Product Catalog, Pricing & Plans, Invoices, Company Profile, Integrations, Users Control, Activity Logs, System Settings, Theme).
- **Extension Anti-Piracy API**: Hardware fingerprint verification (`/verify`) with automatic device lock enforcement, renewal notice alerts, and remote pause/lock/revocation.
- **Dual Payment Gateways**: Built-in test & live modes for **Razorpay** and **Cashfree**.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Recharts, jsPDF, canvas-confetti |
| **Backend & Database** | Supabase (PostgreSQL, Auth, RLS Policies, Realtime, Triggers) |
| **Serverless API** | Netlify Edge Functions (`/verify` for Chrome extensions and scripts) |
| **Payments** | Razorpay SDK + Cashfree Payments Checkout |
| **Hosting** | Netlify (`publish = "dist"`, SPA redirect `/* -> /index.html 200`) |

---

## ⚡ Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Login & Roles

We have a **unified single login screen** at `/login` for both Administrators and Customers:

| Role | Email | Password | Destination |
|---|---|---|---|
| **Super Admin (RM Rahul)** | `admin@licensewala.com` | `Admin@12345` | `/admin` (Full Control) |
| **Verified Customer** | `amit.patel@gmail.com` | `Customer@123` | `/account` (Customer Portal) |

*(Quick demo 1-click pre-fill buttons are provided directly on the `/login` screen).*

---

## 📂 Admin Panel Modules (`/admin`)

The sidebar matches the exact order requested:

1. **Dashboard**: Animated KPI counters (Total, Active, Expiring in 30d, Expiring Today, Expired, Paused, Revoked), monthly revenue trends, payment gateway split charts, and upcoming expiration alerts.
2. **User Licenses**: Searchable & filterable table + Kanban board view. Actions: View activations, Extend/Renew days, Pause/Resume, Lock/Unlock, Revoke, Reset HWID devices, Regenerate key, Print license certificate PDF, Bulk lock/export.
3. **Key Generator**: Cryptographically secure keys using `crypto.getRandomValues`. Custom prefixes, segment counts, ambiguity filters (excludes 0/O/1/I), batch generation up to 1,000 keys, CSV export, and live key tester.
4. **Product Catalog**: Add and edit browser extensions, automation scripts, version tags, download binaries, and marketing feature lists.
5. **Pricing & Plans**: Configure monthly, quarterly, annual, and lifetime tiers linked to products with custom hardware PC limits.
6. **Invoice Generator**: Automated GST invoices (`INV-YYYY-XXXX`), manual billing generator, and client-side PDF download using `jspdf-autotable`.
7. **Company Profile**: Business identity, legal entity name, GSTIN, PAN, bank account details, and official UPI ID.
8. **Supabase & Razorpay**: Live API keys for Supabase PostgreSQL, Razorpay Key ID, Cashfree App ID, test connection buttons, and webhook URLs.
9. **Users Control**: Manage user profiles, promote staff to administrators, and toggle block/unblock statuses.
10. **Activity Logs**: Append-only security audit trail of logins, payments, activations, and key alterations.
11. **System Settings**: Platform currency (INR default), tax rates (18% GST default), device binding enforcement, and maintenance mode toggle.
12. **Theme**: Light / Dark / System mode with instant accent color presets (Indigo, Emerald, Rose, Amber, Sky, Violet).

---

## 🔌 Extension Integration Example (Anti-Piracy Check)

In your Chrome extension (`background.js` or `popup.js`):

```javascript
async function checkLicense(licenseKey, machineFingerprint) {
  try {
    const res = await fetch("https://licensewala.netlify.app/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: licenseKey,
        hwid: machineFingerprint,
        deviceName: "Chrome Extension"
      })
    });
    
    const data = await res.json();
    
    if (data.valid) {
      console.log(`License active! Days left: ${data.days_left}`);
      enableExtensionFeatures();
    } else {
      alert(data.message); // Prompts user to renew at https://licensewala.netlify.app/checkout/...
      disableExtensionFeatures();
    }
  } catch (err) {
    console.error("Verification failed:", err);
  }
}
```

---

## 🗄 Database Setup (Supabase)

The complete SQL migration script is located at:
`supabase/migrations/20261017000000_licensewala_full_schema.sql`

To apply:
1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Paste the contents of `20261017000000_licensewala_full_schema.sql` and run.
3. This creates all 15 tables (`profiles`, `products`, `plans`, `coupons`, `invoices`, `licenses`, `license_activations`, `license_keys_pool`, `orders`, `payments`, `company_profile`, `integration_settings`, `settings`, `salespersons`, `activity_logs`), triggers, sequential invoice numbering functions, RLS policies, and seed data.

---

## 🌐 Netlify Deployment

1. Connect your GitHub repository to **Netlify**.
2. Netlify will auto-detect settings from `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Functions**: `netlify/functions`
3. Add Environment Variables in Netlify Dashboard:
   - `VITE_SUPABASE_URL` = `https://wyeejbncddpxhwtijkjt.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u`
   - `VITE_RAZORPAY_KEY_ID` = `rzp_test_1DP5mmOlF5G5ag`
   - `VITE_CASHFREE_APP_ID` = `TEST10375628`
4. Deploy! Your site will be live with full SPA routing and serverless verification endpoints.

---

## ⚡ Premium Backend APIs

Three new admin endpoints plus hardened license verification. All new functions live in `netlify/functions/*.cjs` (CommonJS) and are auto-mapped by `netlify.toml`'s `/api/*` → `/.netlify/functions/:splat` redirect — no redirect changes needed.

### Auth
`license-analytics`, `webhooks`, and `trial-license` require the admin key header:
`x-api-key: <LICENSE_API_KEY env var>` — missing/mismatch → `401 {"success":false,"message":"Unauthorized"}`.
`/verify` (public) needs no auth.

### POST /api/trial-license — issue a trial key
Body: `{"email":"user@example.com","product_id":"<uuid, optional>","days":7}` (days default 7, clamped 1–30).
```json
{ "success": true, "license_key": "LW-TRIAL-AB3F-9K2Q", "expires_at": "2026-10-25", "days": 7, "trial": true }
```
Keys use the unambiguous alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789`. If `is_trial` isn't migrated yet, insert retries without it.

### GET /api/license-analytics (or POST `{"action":"summary"}`)
```json
{
  "success": true,
  "data": {
    "license_counts": { "active": 120, "expired": 34 },
    "expiring_7_days": 12,
    "activations_today": 45,
    "revenue_by_month": [ { "month": "2026-10", "total": 45230.50 } ],
    "top_products": [ { "product_id": "<uuid>", "product_name": "Pro Ext", "count": 88 } ]
  },
  "meta": { "server_time": "2026-10-18T13:00:00.000Z" }
}
```

### /api/webhooks — register / dispatch / list
- `POST {"action":"register","event":"payment.succeeded","url":"https://..."}`
  → `{"success":true,"webhook":{"id":"<uuid>","event":"payment.succeeded","url":"https://..."}}`
  (URL must start with `https://`; `http://localhost` allowed for dev. Allowed events: `license.activated`, `license.expired`, `license.revoked`, `payment.succeeded`.)
- `POST {"action":"dispatch","event":"license.expired","payload":{"license_key":"LW-..."}}`
  → `{"success":true,"dispatched":2,"results":[{"url":"https://...","ok":true,"status":200}]}`
  (5s per-target timeout, best-effort; dispatches are logged to `api_logs`.)
- `GET ?action=list` (or POST `{"action":"list"}`) → `{"success":true,"webhooks":[...]}`

### verify-license additions (`/verify` — existing fields unchanged)
- **Rate limit:** 60 req/min per IP (in-memory). On exceed → `429 {"valid":false,"status":"rate_limited","message":"Too many requests. Please retry shortly."}`.
- **Every** JSON response now carries `meta: { server_time, rate_limit: { limit: 60, remaining } }`.
- **Grace period:** expired ≤ `grace_days` (per-license, default 3) → `valid:true, status:"grace"`, negative `days_left`, `expires_at`, `product_name`, `plan_name`, `max_devices`, `customer_name`, `renewal_url`, message `"License expired — you are in a X-day grace period. Please renew soon."` Overdue beyond grace → existing `expired` response.
- **Trial licenses:** when `is_trial` is true, both `active` and `grace` responses include `trial:true` and `trial_ends_at` (the expiry date).
- **Logging:** each decision is fire-and-forget inserted into `api_logs` (`verify-license`, key truncated to 64 chars, ip, status, `{device_name, days_left}`) — logging failures never break the response.

### Migration
Run `supabase/migrations/20261018000000_premium_features.sql` in the Supabase SQL editor: creates `webhooks` + `api_logs`, adds `licenses.is_trial`, `licenses.grace_days`, `licenses.current_devices`, `license_activations.last_seen_at` (existing `last_seen` untouched), indexes, and RLS (admin-only `api_logs`, read-active `webhooks`).

---
© 2026 LicenseWala Technologies. Designed & Managed by **RM Rahul**.
