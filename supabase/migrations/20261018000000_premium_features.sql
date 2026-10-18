-- LicenseWala Premium Features Migration
-- Adds webhooks + api_logs tables, and premium columns on licenses / license_activations.
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS everywhere.

-- 1. WEBHOOKS TABLE (outbound event subscriptions)
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. API LOGS TABLE (best-effort request logging from serverless functions)
CREATE TABLE IF NOT EXISTS public.api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name TEXT,
    license_key TEXT,
    ip TEXT,
    status TEXT,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PREMIUM COLUMNS
-- licenses.is_trial: marks trial licenses (trial-license.cjs, verify-license.cjs)
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;
-- licenses.grace_days: per-license grace period after expiry (verify-license.cjs, default 3)
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS grace_days INT DEFAULT 3;
-- licenses.current_devices: mirrors live device count; base migration lacked it
-- (verify-license.cjs updates it on new device registration)
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS current_devices INT DEFAULT 0;
-- license_activations.last_seen_at: aligns with verify-license.cjs writes.
-- Base migration has last_seen (kept untouched); this column is new.
ALTER TABLE public.license_activations ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_api_logs_function_created ON public.api_logs (function_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_license_key ON public.api_logs (license_key);
CREATE INDEX IF NOT EXISTS idx_webhooks_event_active ON public.webhooks (event, is_active);
CREATE INDEX IF NOT EXISTS idx_licenses_is_trial ON public.licenses (is_trial);

-- 5. RLS (same policy style as 20261017000000_licensewala_full_schema.sql)
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access webhooks" ON public.webhooks;
CREATE POLICY "Admins full access webhooks" ON public.webhooks FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read active webhooks" ON public.webhooks;
CREATE POLICY "Public read active webhooks" ON public.webhooks FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins full access api_logs" ON public.api_logs;
CREATE POLICY "Admins full access api_logs" ON public.api_logs FOR ALL USING (public.is_admin());
-- NOTE: no anon policy on api_logs — logs are admin-only. Service role bypasses RLS.
