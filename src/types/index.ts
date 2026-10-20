export type UserRole = 'super_admin' | 'admin' | 'staff' | 'customer';

export type LicenseStatus = 'active' | 'expiring_soon' | 'expiring_today' | 'expired' | 'paused' | 'locked' | 'revoked';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'cashfree' | 'upi' | 'bank_transfer' | 'cash' | 'manual';
export type LicensePriority = 'normal' | 'high' | 'vip' | 'urgent';
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  gst_number?: string;
  city?: string;
  country?: string;
  role: UserRole;
  is_blocked: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category: string;
  logo_url?: string;
  banner_url?: string;
  version?: string;
  download_url?: string;
  is_active: boolean;
  features?: string[];
  sort_order: number;
  created_at: string;
}

export interface Plan {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price: number; // in INR or main currency
  billing_period: 'monthly' | 'quarterly' | 'semi_annual' | 'yearly' | 'lifetime';
  duration_days: number;
  max_devices: number;
  is_active: boolean;
  sort_order: number;
  features?: string[];
  created_at: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  /** Real coupons table columns: type is 'percentage' | 'flat' (₹ off). */
  type: 'percentage' | 'flat';
  value: number;
  /** Added by migration 20261020010000 — may be absent on older DBs. */
  min_order_amount?: number;
  usage_limit?: number | null;
  used_count: number;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  order_id?: string;
  product_name: string;
  plan_name: string;
  amount: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_id?: string;
  billing_name: string;
  billing_email: string;
  billing_phone?: string;
  billing_address?: string;
  billing_gst?: string;
  issued_at: string;
  paid_at?: string;
  created_at: string;
  user?: Profile;
}

export interface License {
  id: string;
  license_key: string;
  user_id: string;
  product_id: string;
  plan_id?: string | null;
  invoice_id?: string | null;
  status: LicenseStatus;
  issue_date: string;
  expiry_date: string; // ISO string or '9999-12-31' for lifetime
  max_devices: number;
  current_devices: number;
  is_locked: boolean;
  /** True for free-trial licenses (licenses.is_trial, premium migration).
   *  Frontend also treats LW-TRIAL-* keys as trials when the column is absent. */
  is_trial?: boolean;
  priority: LicensePriority;
  notes?: string;
  salesperson_id?: string;
  created_at: string;
  updated_at?: string;
  product?: Product;
  plan?: Plan;
  user?: Profile;
  invoice?: Invoice;
  activations?: LicenseActivation[];
}

export interface LicenseActivation {
  id: string;
  license_id: string;
  device_fingerprint: string;
  device_name?: string;
  ip_address?: string;
  browser?: string;
  os?: string;
  activated_at: string;
  last_seen_at: string;
  is_active: boolean;
}

export interface LicenseKeyPool {
  id: string;
  license_key: string;
  product_id: string;
  plan_id?: string;
  status: 'unused' | 'assigned' | 'revoked';
  batch_id?: string;
  created_at: string;
  assigned_to_user_id?: string;
  assigned_at?: string;
  product?: Product;
  plan?: Plan;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  plan_id: string;
  amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  status: PaymentStatus;
  payment_gateway: PaymentMethod;
  gateway_order_id?: string;
  coupon_code?: string;
  created_at: string;
  product?: Product;
  plan?: Plan;
  user?: Profile;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  gateway: PaymentMethod;
  gateway_payment_id: string;
  gateway_signature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  raw_response?: any;
  created_at: string;
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  brand_name?: string;
  tagline?: string;
  favicon_url?: string;
  social_links?: Record<string, string>;
  legal_name?: string;
  email: string;
  phone?: string;
  website?: string;
  gst_number?: string;
  pan_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  logo_url?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_ifsc?: string;
  upi_id?: string;
  invoice_prefix?: string;
  invoice_notes?: string;
  terms_conditions?: string;
  support_email?: string;
  updated_at?: string;
}

export interface IntegrationSettings {
  id: string;
  razorpay_enabled: boolean;
  razorpay_key_id: string;
  cashfree_enabled: boolean;
  cashfree_app_id: string;
  cashfree_mode: 'sandbox' | 'production';
  supabase_url: string;
  supabase_anon_key: string;
  webhook_secret?: string;
  updated_at?: string;
}

export interface SystemSettings {
  id: string;
  site_name: string;
  site_url: string;
  default_currency: string;
  currency_symbol: string;
  default_tax_rate: number;
  enable_coupons: boolean;
  enable_registration: boolean;
  enable_device_binding: boolean;
  maintenance_mode: boolean;
  theme_mode: 'light' | 'dark' | 'system';
  accent_color: AccentColor;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_from?: string;
}

export interface Salesperson {
  id: string;
  name: string;
  email: string;
  phone?: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
  user?: Profile;
}
