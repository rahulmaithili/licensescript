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
13. **Coupons & Discounts** (`/admin/coupons`): Create and manage discount codes (percentage % or flat ₹), optional minimum order amount, usage limits, expiry dates and active/inactive toggles. Codes are validated live at checkout against the `coupons` table, and each successful paid order records a redemption (`used_count`).

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
`/verify` (public) needs no auth. `trial-license` additionally accepts the signed-in user's own Supabase JWT (`Authorization: Bearer <access_token>`) for the automatic in-app free trial — see **Tool Integration API** below.

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

## 🖥 Tool Integration API (for the desktop-tool developer)

The desktop tool activates against the **same account and licenses** as the website. Two paths are supported — both read the same `licenses` table, share the same expiry / grace / HWID-binding rules, and are rate-limited to 60 req/min per IP. Re-check activation on every tool start (and periodically while running); never trust a locally stored "days left" — always ask the server.

### Path A (recommended): Google sign-in — `POST /api/google-verify`

The customer signs in to the tool with the **same Google account** they used on the website. The tool runs a standard Google sign-in using the website's OAuth client ID (`17079355400-krquge8l14g0vjp3tbsqmjrkdmh2repk.apps.googleusercontent.com`), receives an **ID token**, and posts it to the API. The server verifies the token with Google (audience + `email_verified` are enforced server-side), finds the account by email, picks its best license — **active paid first, then active trial** — applies HWID binding, and answers.

```http
POST https://licensescript.netlify.app/api/google-verify
Content-Type: application/json

{ "id_token": "<google id token>", "hwid": "<machine fingerprint>", "product_slug": "cdcms-pro" }
```
`product_slug` is optional; omit it to accept a license for any product. Trial licenses are suite-wide and match any product.

Active:
```json
{
  "active": true, "status": "active", "type": "paid",
  "email": "customer@gmail.com", "customer_name": "Ramesh Kumar",
  "product_name": "CDCMS Multi-Tool Suite (PRO)", "plan_name": "3 Months Pro",
  "license_key": "LW-XXXX-XXXX-XXXX", "expiry_date": "2027-01-15",
  "days_left": 87, "max_devices": 1,
  "message": "License activated via Google sign-in."
}
```
For a trial, `"type": "trial"` (plus `"trial": true, "trial_ends_at": "<date>"`). A paid license inside its 3-day grace window returns `"active": true, "status": "grace"` with a renew reminder in `message`.

Not active — always show `message` to the user and offer the `renew_url` link:
```json
{ "active": false, "reason": "expired",       "expiry_date": "2026-10-01", "renew_url": "https://licensescript.netlify.app/pricing" }
{ "active": false, "reason": "trial_expired", "expiry_date": "2026-10-12", "renew_url": "https://licensescript.netlify.app/pricing" }
{ "active": false, "reason": "no_license",    "renew_url": "https://licensescript.netlify.app/pricing" }
{ "active": false, "reason": "no_account",    "renew_url": "https://licensescript.netlify.app/pricing" }
{ "active": false, "reason": "device_mismatch", "portal_url": "https://licensescript.netlify.app/account" }
```
`reason` can also be `locked` / `paused` / `revoked` (tell the user to contact support), `invalid_token` / `email_unverified` (HTTP 401 — ask the user to sign in again), or `rate_limited` (HTTP 429 — back off and retry).

**HWID rules (identical on both paths):** first machine to check in is bound automatically; the same machine always passes; a different machine is rejected once the license's device slots (`max_devices`, 1 by default) are full — the customer can free slots from the website's `/account` page ("Reset devices").

### Path B: license key — `POST /verify`

The classic flow (see *Extension Integration Example* above): the customer pastes the key shown in their website account (`/account`) into the tool.

```json
{ "key": "LW-XXXX-XXXX-XXXX", "hwid": "<machine fingerprint>", "deviceName": "Desktop Tool" }
```
→ `{ "valid": true, "status": "active", "days_left": 87, "expires_at": "...", "product_name": "...", "plan_name": "..." }`. Trial keys (`LW-TRIAL-…`) verify here too and add `"trial": true, "trial_ends_at": "..."`. Expired-beyond-grace → `"valid": false, "status": "expired"` with a `renewal_url`.

### The 7-day free trial (automatic)

1. A customer registers or signs in on the website (email **or** Google). The site then calls `POST /api/trial-license` once with the user's own Supabase access token (`Authorization: Bearer …`); the function verifies the token, so no API key ever reaches the browser.
2. The function is **idempotent**: if the account already has a trial it returns `{ "success": true, "already_issued": true, "license_key": "LW-TRIAL-…", "expires_at": "...", "days_left": n }` instead of minting a second one. Exactly one 7-day trial per account, ever.
3. The trial is attached to the first active product, has `max_devices: 1`, and appears in the customer's `/account` page with a **"Free Trial · Nd left"** badge (then "Trial Ended").
4. The trial binds to the machine HWID on its first verification through either path above. Trials get **no grace period** — at expiry the tool receives `trial_expired` and must stop and prompt for a plan.
5. Admins/backends can still mint trials with the API-key mode: `POST /api/trial-license` + `x-api-key` + `{"email": "...", "product_id": "<optional>", "days": 7}`.

### Renew behavior (what the tool must do)

- On `expired` / `trial_expired`: stop premium features, show the message, and open `renew_url` (`https://licensescript.netlify.app/pricing`) when the user clicks **Renew**.
- Renewal needs **no re-install and no new key entry** for Path A: once the customer buys/renews on the website under the same Google account, the next `google-verify` call returns `active: true` again. For Path B, an extended license keeps the same key, so the next `/verify` call succeeds.
- Paid licenses get a **3-day grace** after expiry (`status: "grace"`, still active) — use it to warn, not to block.

---
© 2026 LicenseWala Technologies. Designed & Managed by **RM Rahul**.
