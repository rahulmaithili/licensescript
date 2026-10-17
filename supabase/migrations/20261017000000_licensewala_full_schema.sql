-- ============================================================================
-- LicenseWala — Full Production Database Schema
-- Supabase PostgreSQL with RLS, Triggers, Views & Functions
-- Super Admin: RM Rahul (super_admin)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'staff', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'disabled', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE license_status AS ENUM ('active', 'paused', 'expired', 'cancelled', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'unpaid', 'partial', 'refunded', 'pending', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_gateway AS ENUM ('razorpay', 'cashfree', 'manual', 'upi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop legacy/conflicting tables if they exist with obsolete types (e.g. bigint id)
DROP TABLE IF EXISTS public.license_activations CASCADE;
DROP TABLE IF EXISTS public.license_keys_pool CASCADE;
DROP TABLE IF EXISTS public.licenses CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.salespersons CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.integration_settings CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.company_profile CASCADE;

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company TEXT,
    tax_id TEXT,
    city TEXT,
    country TEXT DEFAULT 'India',
    role user_role NOT NULL DEFAULT 'customer',
    status user_status NOT NULL DEFAULT 'active',
    permissions JSONB DEFAULT '{"can_view_licenses": true, "can_edit_licenses": false, "can_view_invoices": true}'::jsonb,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Browser Extension',
    image_url TEXT,
    version TEXT DEFAULT '1.0.0',
    download_url TEXT,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 999.00,
    purchase_price NUMERIC(12, 2) DEFAULT 0.00,
    color TEXT DEFAULT '#f59e0b',
    display_order INT DEFAULT 0,
    features JSONB DEFAULT '["Hardware Machine Lock", "Auto-Updates", "24/7 Support"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_days INT NOT NULL DEFAULT 30,
    is_lifetime BOOLEAN NOT NULL DEFAULT false,
    price NUMERIC(12, 2) NOT NULL DEFAULT 499.00,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) DEFAULT 18.00,
    max_devices INT NOT NULL DEFAULT 1,
    features JSONB DEFAULT '["Instant Key Delivery", "1 Workstation License", "Email Support"]'::jsonb,
    badge TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'flat'
    value NUMERIC(10, 2) NOT NULL,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_email TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status payment_status NOT NULL DEFAULT 'paid',
    due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LICENSES TABLE
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    license_key TEXT UNIQUE NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    status license_status NOT NULL DEFAULT 'active',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    payment_status payment_status NOT NULL DEFAULT 'paid',
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    priority TEXT DEFAULT 'Standard',
    max_devices INT NOT NULL DEFAULT 1,
    salesperson_id UUID,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LICENSE ACTIVATIONS (Hardware Device Fingerprints)
CREATE TABLE IF NOT EXISTS public.license_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    ip TEXT,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(license_id, device_fingerprint)
);

-- 8. LICENSE KEYS POOL (Unassigned / Pre-generated keys)
CREATE TABLE IF NOT EXISTS public.license_keys_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'unused', -- 'unused', 'assigned', 'revoked'
    assigned_license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    gateway payment_gateway NOT NULL DEFAULT 'razorpay',
    gateway_order_id TEXT,
    status order_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    gateway payment_gateway NOT NULL DEFAULT 'razorpay',
    gateway_payment_id TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    method TEXT DEFAULT 'UPI / Card',
    status payment_status NOT NULL DEFAULT 'paid',
    raw_payload JSONB,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. COMPANY PROFILE TABLE (Single row)
CREATE TABLE IF NOT EXISTS public.company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'LicenseWala Technologies',
    brand_name TEXT DEFAULT 'LicenseWala',
    tagline TEXT DEFAULT 'Instant Software & Extension Licensing Platform',
    logo_url TEXT,
    favicon_url TEXT,
    address TEXT DEFAULT 'Cyber City, Gurugram, Haryana - 122002, India',
    gstin TEXT DEFAULT '07AAAAA0000A1Z5',
    pan TEXT DEFAULT 'ABCDE1234F',
    email TEXT DEFAULT 'support@licensewala.com',
    phone TEXT DEFAULT '+91 98765 43210',
    website TEXT DEFAULT 'https://licensescript.netlify.app',
    bank_name TEXT DEFAULT 'HDFC Bank',
    bank_account TEXT DEFAULT '50200012345678',
    bank_ifsc TEXT DEFAULT 'HDFC0001234',
    upi_id TEXT DEFAULT 'licensewala@okaxis',
    invoice_prefix TEXT DEFAULT 'INV-2026-',
    invoice_footer TEXT DEFAULT 'Thank you for choosing LicenseWala. Software licenses are bound to device HWID.',
    terms_conditions TEXT DEFAULT 'All digital license keys are non-refundable once activated.',
    social_links JSONB DEFAULT '{"twitter": "", "github": "", "telegram": "", "whatsapp": "+919876543210"}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INTEGRATION SETTINGS
CREATE TABLE IF NOT EXISTS public.integration_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway payment_gateway UNIQUE NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    mode TEXT DEFAULT 'test', -- 'test' or 'live'
    public_key TEXT,
    webhook_url TEXT,
    currency TEXT DEFAULT 'INR',
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SETTINGS TABLE (Key/Value JSONB)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SALESPERSONS TABLE
CREATE TABLE IF NOT EXISTS public.salespersons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ACTIVITY LOGS TABLE (Append-Only)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email TEXT,
    user_role TEXT DEFAULT 'system',
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    old_value JSONB,
    new_value JSONB,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Check if current user is admin/super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('super_admin', 'admin') AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin' AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_first_user BOOLEAN;
BEGIN
    -- Check if first user in system
    SELECT NOT EXISTS(SELECT 1 FROM public.profiles) INTO is_first_user;

    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        company,
        role,
        status
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'company',
        CASE WHEN is_first_user THEN 'super_admin'::user_role ELSE 'customer'::user_role END,
        'active'::user_status
    );

    -- Log activity
    INSERT INTO public.activity_logs (
        user_id,
        user_email,
        user_role,
        action,
        target_type,
        target_id
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN is_first_user THEN 'super_admin' ELSE 'customer' END,
        'USER_REGISTERED',
        'profiles',
        NEW.id::text
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    CREATE TRIGGER set_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    CREATE TRIGGER set_licenses_updated_at BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    CREATE TRIGGER set_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Atomic sequential invoice generator: INV-2026-0001
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE OR REPLACE FUNCTION public.next_invoice_no()
RETURNS TEXT AS $$
DECLARE
    curr_prefix TEXT;
    seq_val INT;
BEGIN
    SELECT COALESCE(invoice_prefix, 'INV-2026-') INTO curr_prefix FROM public.company_profile LIMIT 1;
    IF curr_prefix IS NULL THEN
        curr_prefix := 'INV-2026-';
    END IF;
    seq_val := nextval('invoice_seq');
    RETURN curr_prefix || LPAD(seq_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Cryptographically secure license key generator
CREATE OR REPLACE FUNCTION public.generate_license_key(prefix TEXT DEFAULT 'LW')
RETURNS TEXT AS $$
DECLARE
    k1 TEXT;
    k2 TEXT;
    k3 TEXT;
    k4 TEXT;
    full_key TEXT;
    key_exists BOOLEAN;
BEGIN
    LOOP
        k1 := UPPER(SUBSTRING(encode(gen_random_bytes(3), 'hex') FROM 1 FOR 4));
        k2 := UPPER(SUBSTRING(encode(gen_random_bytes(3), 'hex') FROM 1 FOR 4));
        k3 := UPPER(SUBSTRING(encode(gen_random_bytes(3), 'hex') FROM 1 FOR 4));
        k4 := UPPER(SUBSTRING(encode(gen_random_bytes(3), 'hex') FROM 1 FOR 4));
        full_key := prefix || '-' || k1 || '-' || k2 || '-' || k3 || '-' || k4;

        SELECT EXISTS(SELECT 1 FROM public.licenses WHERE license_key = full_key) INTO key_exists;
        IF NOT key_exists THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN full_key;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salespersons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles can be viewed by anyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Products & Plans: Public can view active; admins have full access
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins full access products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active plans" ON public.plans FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins full access plans" ON public.plans FOR ALL USING (public.is_admin());

-- Coupons: Public can view active; admins full
CREATE POLICY "Public can read active coupons" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins full access coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- Licenses Policies
CREATE POLICY "Users view own licenses" ON public.licenses FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());
CREATE POLICY "Admins full access licenses" ON public.licenses FOR ALL USING (public.is_admin());

-- License Activations
CREATE POLICY "Users view own activations" ON public.license_activations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.licenses l WHERE l.id = license_id AND (l.customer_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admins full activations" ON public.license_activations FOR ALL USING (public.is_admin());

-- Invoices Policies
CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());
CREATE POLICY "Admins full access invoices" ON public.invoices FOR ALL USING (public.is_admin());

-- Orders & Payments Policies
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Admins full access orders" ON public.orders FOR ALL USING (public.is_admin());

CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admins full access payments" ON public.payments FOR ALL USING (public.is_admin());

-- Company Profile & Settings
CREATE POLICY "Public read company profile" ON public.company_profile FOR SELECT USING (true);
CREATE POLICY "Admins update company profile" ON public.company_profile FOR ALL USING (public.is_admin());

CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins full access settings" ON public.settings FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full access integrations" ON public.integration_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access keys pool" ON public.license_keys_pool FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access salespersons" ON public.salespersons FOR ALL USING (public.is_admin());

-- Activity Logs: Append-only
CREATE POLICY "System and auth can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read activity logs" ON public.activity_logs FOR SELECT USING (public.is_admin());
-- NO UPDATE or DELETE on activity_logs!

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Company Profile
INSERT INTO public.company_profile (
    company_name,
    brand_name,
    tagline,
    address,
    gstin,
    email,
    phone,
    website,
    bank_name,
    bank_account,
    bank_ifsc,
    upi_id
) VALUES (
    'LicenseWala Technologies Pvt Ltd',
    'LicenseWala',
    'Premium Browser Extensions & Automated Software Licensing',
    'Connaught Place, Central Delhi, New Delhi - 110001, India',
    '07AAAAA0000A1Z5',
    'support@licensewala.com',
    '+91 98765 43210',
    'https://licensescript.netlify.app',
    'HDFC Bank',
    '50200012345678',
    'HDFC0001234',
    'licensewala@okaxis'
) ON CONFLICT DO NOTHING;

-- Products
INSERT INTO public.products (id, name, slug, description, category, version, selling_price, features, color) VALUES
('11111111-1111-1111-1111-111111111111', 'CDCMS Multi-Tool Suite (PRO)', 'cdcms-pro', 'Ultimate workflow automation suite for Google Chrome, Edge, and Chromium browsers.', 'Browser Extension', 'v4.2.0', 999.00, '["Strict HWID Machine Lock", "Background Task Automation", "Cloud License Sync", "Auto-Updates"]'::jsonb, '#10b981'),
('22222222-2222-2222-2222-222222222222', 'CDC Tools Multi Extension', 'cdc-tools', 'High-performance extension for bulk data extraction, tab management and automated form filling.', 'Browser Extension', 'v2.8.5', 1499.00, '["Multi-Tab Concurrency", "CSV/Excel Export", "Proxy Binding", "Priority Support"]'::jsonb, '#3b82f6'),
('33333333-3333-3333-3333-333333333333', 'Ultimate All-in-One Master Bundle', 'all-in-one-master', 'Access every single script, tool, extension, and future releases with VIP priority server access.', 'Master Bundle', 'v2026.1', 4999.00, '["All Current Extensions", "Future Tools Included", "Unlimited Device Transfers", "VIP WhatsApp Support"]'::jsonb, '#f59e0b')
ON CONFLICT (slug) DO NOTHING;

-- Plans
INSERT INTO public.plans (product_id, name, duration_days, is_lifetime, price, discount_percent, badge) VALUES
('11111111-1111-1111-1111-111111111111', '1 Month Starter', 30, false, 499.00, 0, 'Starter'),
('11111111-1111-1111-1111-111111111111', '3 Months Pro', 90, false, 1299.00, 15, 'Popular'),
('11111111-1111-1111-1111-111111111111', '1 Year Enterprise', 365, false, 4999.00, 30, 'Best Value'),

('22222222-2222-2222-2222-222222222222', '1 Month Single', 30, false, 799.00, 0, 'Starter'),
('22222222-2222-2222-2222-222222222222', '3 Months Quarterly', 90, false, 1999.00, 15, 'Popular'),
('22222222-2222-2222-2222-222222222222', '1 Year Annual', 365, false, 7999.00, 25, 'Best Value'),

('33333333-3333-3333-3333-333333333333', '1 Year VIP Access', 365, false, 4999.00, 20, 'Recommended'),
('33333333-3333-3333-3333-333333333333', 'Lifetime Master Access', 36500, true, 12999.00, 40, 'VIP Lifetime')
ON CONFLICT DO NOTHING;

-- Coupons
INSERT INTO public.coupons (code, type, value, usage_limit, is_active) VALUES
('WELCOME50', 'percentage', 50.00, 500, true),
('PROMO100', 'flat', 100.00, 1000, true)
ON CONFLICT (code) DO NOTHING;

-- Integration Settings
INSERT INTO public.integration_settings (gateway, is_enabled, mode, public_key) VALUES
('razorpay', true, 'test', 'rzp_test_1DP5mmOlF5G5ag'),
('cashfree', true, 'test', 'TEST_CF_APP_ID_DEMO')
ON CONFLICT (gateway) DO NOTHING;

-- Settings (Theme & System)
INSERT INTO public.settings (key, value) VALUES
('theme', '{"mode": "dark", "accent": "amber", "radius": "round", "font": "outfit"}'::jsonb),
('system', '{"site_name": "LicenseWala", "currency": "INR", "currency_symbol": "₹", "tax_percent": 18, "maintenance_mode": false, "registration_enabled": true, "email_verification": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
