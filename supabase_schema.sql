-- ============================================================================
-- Supabase Schema for Mr.Rahul Scripts / LicenseVault SaaS Portal
-- ============================================================================
-- Run this SQL in your Supabase Project -> SQL Editor
-- This creates all required tables, indexes, RLS policies, and seed data.
-- ============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    tool_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    features TEXT, -- Comma-separated or bullet list
    download_url TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. PLANS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
    id BIGSERIAL PRIMARY KEY,
    tool_id VARCHAR(100) NOT NULL REFERENCES products(tool_id) ON UPDATE CASCADE ON DELETE CASCADE,
    plan_id VARCHAR(100) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    price_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tool_id, plan_id)
);

-- ----------------------------------------------------------------------------
-- 3. USERS & LICENSES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    license_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    company_name VARCHAR(255),
    gst_number VARCHAR(100),
    mobile_number VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    plan_id VARCHAR(100),
    utr_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending Payment', -- 'Active', 'Pending Payment', 'Expired', 'Blocked'
    expiry_date DATE,
    device_id VARCHAR(255),
    tool_id VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. PAYMENTS TABLE (Razorpay and UPI records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    license_key VARCHAR(100),
    email VARCHAR(255),
    amount_inr NUMERIC(10, 2) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    payment_method VARCHAR(100) DEFAULT 'razorpay',
    status VARCHAR(50) DEFAULT 'success',
    tool_id VARCHAR(100),
    plan_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. SETTINGS TABLE (Key-Value Store)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. REVIEWS / TESTIMONIALS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    photo_url TEXT,
    stars INTEGER DEFAULT 5,
    review_text TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY SPEED
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_license_key ON users(license_key);
CREATE INDEX IF NOT EXISTS idx_users_tool_id ON users(tool_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_plans_tool_id ON plans(tool_id);
CREATE INDEX IF NOT EXISTS idx_payments_license_key ON payments(license_key);

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- ----------------------------------------------------------------------------

-- Insert default products
INSERT INTO products (tool_id, name, description, features, download_url, status)
VALUES
(
    'cdcms_helper',
    'CDCMS Allocation Helper',
    'Automates cylinder allocation mapping inside HP Gas DCMS portal. Save time and eliminate errors with auto-matching.',
    'Automated Area Matching, Mapping Lock System, Multi-Agency Support, Live Allocation Tracking',
    'https://script.google.com/macros/library/d/1lXTywULI_ig6Id6yvdKnwRAq4NDMJAFpbh---74-SL0fcn-D18m0PgjX/5',
    'Active'
),
(
    'cdcms_canceller',
    'CDCMS Booking Canceller',
    'Bulk booking cancellation utility for HP Gas DCMS. Filter, select, and batch cancel pending bookings instantly.',
    'Bulk Booking Filter, Batch Speed Cancellation, Live Status Log, Export Reports',
    'https://script.google.com/macros/library/d/1lXTywULI_ig6Id6yvdKnwRAq4NDMJAFpbh---74-SL0fcn-D18m0PgjX/5',
    'Active'
)
ON CONFLICT (tool_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    features = EXCLUDED.features;

-- Insert default plans
INSERT INTO plans (tool_id, plan_id, plan_name, duration_days, price_inr)
VALUES
('cdcms_helper', '7_days', '7 Days Activation', 7, 100.00),
('cdcms_helper', '3_months', '3 Months Plan', 90, 999.00),
('cdcms_helper', '6_months', '6 Months Plan', 180, 2999.00),
('cdcms_helper', '1_year', '1 Year Activation', 365, 5999.00),
('cdcms_canceller', '7_days', '7 Days Activation', 7, 150.00),
('cdcms_canceller', '3_months', '3 Months Plan', 90, 1299.00),
('cdcms_canceller', '6_months', '6 Months Plan', 180, 3499.00),
('cdcms_canceller', '1_year', '1 Year Activation', 365, 6999.00)
ON CONFLICT (tool_id, plan_id) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    duration_days = EXCLUDED.duration_days,
    price_inr = EXCLUDED.price_inr;

-- Insert default settings
INSERT INTO settings (key, value)
VALUES
('company_name', 'Mr.Rahul Scripts'),
('company_logo_url', ''),
('company_about', 'Complete platform for selling software with automatic license key generation, device binding, expiry management, and a powerful admin panel.'),
('merchant_upi_id', 'your-upi-id@okaxis'),
('merchant_name', 'Mr.Rahul Scripts Payment'),
('support_email', 'support@licensevault.com'),
('support_mobile', '+91 98765 43210'),
('support_whatsapp', '+919876543210'),
('company_location', 'New Delhi, India'),
('razorpay_key_id', 'rzp_test_placeholder'),
('supabase_url', ''),
('supabase_anon_key', '')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value;

-- Insert default reviews
INSERT INTO reviews (id, name, company, photo_url, stars, review_text, status)
VALUES
('rev_001', 'Rajesh Kumar', 'Shiv Kripa HP Gas Agency', '', 5, 'Bahut acha tool hai! Area generation ka kaam 10 minutes mein ho jaata hai jo pehle 2 ghante leta tha.', 'Active'),
('rev_002', 'Priya Sharma', 'Durga Gas Service', '', 5, 'Automatic licence system se bahut asaani ho gayi. Payment ke saath hi key activate ho jaati hai!', 'Active'),
('rev_003', 'Amit Patel', 'Jai Ambe Gas Agency', '', 4, 'Admin panel se sab manage karna bahut easy hai. Support bhi bahut acha hai.', 'Active')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products, plans, settings, and reviews
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view plans" ON plans FOR SELECT USING (true);
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can view active reviews" ON reviews FOR SELECT USING (true);

-- Allow public to query and insert into users & payments
CREATE POLICY "Allow public insert into users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public insert payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select payments" ON payments FOR SELECT USING (true);

-- Allow admin operations (full access)
CREATE POLICY "Allow full access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow full access to plans" ON plans FOR ALL USING (true);
CREATE POLICY "Allow full access to settings" ON settings FOR ALL USING (true);
CREATE POLICY "Allow full access to reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow full access to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow full access to payments" ON payments FOR ALL USING (true);

-- ============================================================================
-- Setup Complete!
-- ============================================================================
