import { supabase } from '@/lib/supabase';
import type { CompanyProfile, IntegrationSettings, SystemSettings } from '@/types';

// Neutral starting values used ONLY when no settings row exists yet in the DB.
// No fabricated business/financial data — the admin fills these in from the
// Company Profile / Integrations / System Settings pages and they are saved
// to Supabase. (Supabase URL + publishable key are the project's real public
// config values, shown so the integrations page can display the connection.)
export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  company_name: 'LicenseWala Technologies',
  brand_name: 'LicenseWala',
  tagline: '',
  legal_name: '',
  email: 'support@licensewala.com',
  phone: '',
  website: 'https://licensewala.netlify.app',
  gst_number: '',
  pan_number: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  logo_url: '',
  bank_name: '',
  bank_account_no: '',
  bank_ifsc: '',
  upi_id: '',
  invoice_prefix: 'INV-',
  invoice_notes: 'Thank you for choosing LicenseWala! For instant support or API integration, reach out on WhatsApp.',
  terms_conditions: '',
  support_email: 'support@licensewala.com',
};

export const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  razorpay_enabled: false,
  razorpay_key_id: '',
  cashfree_enabled: false,
  cashfree_app_id: '',
  cashfree_mode: 'sandbox',
  supabase_url: 'https://wyeejbncddpxhwtijkjt.supabase.co',
  supabase_anon_key: 'sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u',
  webhook_secret: '',
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  site_name: 'LicenseWala',
  site_url: 'https://licensewala.netlify.app',
  default_currency: 'INR',
  currency_symbol: '₹',
  default_tax_rate: 18,
  enable_coupons: true,
  enable_registration: true,
  enable_device_binding: true,
  maintenance_mode: false,
  theme_mode: 'dark',
  accent_color: 'indigo',
};

// The company_profile table's real columns differ from the app type:
// gstin (not gst_number), pan (not pan_number), bank_account (not
// bank_account_no) and invoice_footer (not invoice_notes). Translate in
// both directions here so no non-existent column is ever sent to
// PostgREST and loaded values actually populate the form.
function mapCompanyProfileRow(row: any): CompanyProfile {
  return {
    ...DEFAULT_COMPANY_PROFILE,
    id: row.id ?? DEFAULT_COMPANY_PROFILE.id,
    company_name: row.company_name ?? DEFAULT_COMPANY_PROFILE.company_name,
    brand_name: row.brand_name ?? DEFAULT_COMPANY_PROFILE.brand_name,
    tagline: row.tagline ?? DEFAULT_COMPANY_PROFILE.tagline,
    logo_url: row.logo_url ?? DEFAULT_COMPANY_PROFILE.logo_url,
    favicon_url: row.favicon_url ?? '',
    address: row.address ?? DEFAULT_COMPANY_PROFILE.address,
    email: row.email ?? DEFAULT_COMPANY_PROFILE.email,
    phone: row.phone ?? DEFAULT_COMPANY_PROFILE.phone,
    website: row.website ?? DEFAULT_COMPANY_PROFILE.website,
    gst_number: row.gstin ?? '',
    pan_number: row.pan ?? '',
    bank_name: row.bank_name ?? DEFAULT_COMPANY_PROFILE.bank_name,
    bank_account_no: row.bank_account ?? '',
    bank_ifsc: row.bank_ifsc ?? DEFAULT_COMPANY_PROFILE.bank_ifsc,
    upi_id: row.upi_id ?? DEFAULT_COMPANY_PROFILE.upi_id,
    invoice_prefix: row.invoice_prefix ?? DEFAULT_COMPANY_PROFILE.invoice_prefix,
    invoice_notes: row.invoice_footer ?? DEFAULT_COMPANY_PROFILE.invoice_notes,
    terms_conditions: row.terms_conditions ?? DEFAULT_COMPANY_PROFILE.terms_conditions,
    social_links: row.social_links ?? undefined,
    updated_at: row.updated_at,
  };
}

function buildCompanyProfilePayload(profile: Partial<CompanyProfile>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (profile.company_name !== undefined) payload.company_name = profile.company_name;
  if (profile.brand_name !== undefined) payload.brand_name = profile.brand_name;
  if (profile.tagline !== undefined) payload.tagline = profile.tagline;
  if (profile.logo_url !== undefined) payload.logo_url = profile.logo_url;
  if (profile.favicon_url !== undefined) payload.favicon_url = profile.favicon_url;
  if (profile.address !== undefined) payload.address = profile.address;
  if (profile.gst_number !== undefined) payload.gstin = profile.gst_number;
  if (profile.pan_number !== undefined) payload.pan = profile.pan_number;
  if (profile.email !== undefined) payload.email = profile.email;
  if (profile.phone !== undefined) payload.phone = profile.phone;
  if (profile.website !== undefined) payload.website = profile.website;
  if (profile.bank_name !== undefined) payload.bank_name = profile.bank_name;
  if (profile.bank_account_no !== undefined) payload.bank_account = profile.bank_account_no;
  if (profile.bank_ifsc !== undefined) payload.bank_ifsc = profile.bank_ifsc;
  if (profile.upi_id !== undefined) payload.upi_id = profile.upi_id;
  if (profile.invoice_prefix !== undefined) payload.invoice_prefix = profile.invoice_prefix;
  if (profile.invoice_notes !== undefined) payload.invoice_footer = profile.invoice_notes;
  if (profile.terms_conditions !== undefined) payload.terms_conditions = profile.terms_conditions;
  if (profile.social_links !== undefined) payload.social_links = profile.social_links;
  payload.updated_at = new Date().toISOString();
  return payload;
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  try {
    const { data, error } = await supabase.from('company_profile').select('*').limit(1).maybeSingle();
    if (error || !data) {
      return DEFAULT_COMPANY_PROFILE;
    }
    return mapCompanyProfileRow(data);
  } catch {
    return DEFAULT_COMPANY_PROFILE;
  }
}

export async function saveCompanyProfile(profile: Partial<CompanyProfile>): Promise<boolean> {
  try {
    const { data } = await supabase.from('company_profile').select('id').limit(1).maybeSingle();
    if (data?.id) {
      const { error } = await supabase
        .from('company_profile')
        .update(buildCompanyProfilePayload(profile))
        .eq('id', data.id);
      return !error;
    } else {
      const merged: CompanyProfile = { ...DEFAULT_COMPANY_PROFILE, ...profile };
      const { error } = await supabase
        .from('company_profile')
        .insert([buildCompanyProfilePayload(merged)]);
      return !error;
    }
  } catch {
    return false;
  }
}

// The integration_settings table is per-gateway, NOT one row with flat
// columns: rows { gateway (UNIQUE), is_enabled, mode ('test'/'live'),
// public_key, webhook_url, currency, settings JSONB, updated_at }.
// The app's IntegrationSettings type is a flat view over the razorpay +
// cashfree rows, with the shared Supabase/webhook fields tucked into the
// razorpay row's settings JSONB. Translate in both directions here so no
// non-existent column is ever sent to PostgREST (that is what used to make
// every save fail with a misleading "check your connection" error).
type IntegrationRow = {
  gateway: string;
  is_enabled: boolean;
  mode: string | null;
  public_key: string | null;
  settings: Record<string, any> | null;
};

function parseIntegrationSettings(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof raw === 'object' ? raw : {};
}

function mapIntegrationRows(rows: IntegrationRow[]): IntegrationSettings {
  const razorpay = rows.find((r) => r.gateway === 'razorpay');
  const cashfree = rows.find((r) => r.gateway === 'cashfree');
  const rzSettings = parseIntegrationSettings(razorpay?.settings);
  return {
    ...DEFAULT_INTEGRATION_SETTINGS,
    id: (razorpay as any)?.id ?? DEFAULT_INTEGRATION_SETTINGS.id,
    razorpay_enabled: razorpay?.is_enabled ?? DEFAULT_INTEGRATION_SETTINGS.razorpay_enabled,
    razorpay_key_id: razorpay?.public_key ?? DEFAULT_INTEGRATION_SETTINGS.razorpay_key_id,
    cashfree_enabled: cashfree?.is_enabled ?? DEFAULT_INTEGRATION_SETTINGS.cashfree_enabled,
    cashfree_app_id: cashfree?.public_key ?? DEFAULT_INTEGRATION_SETTINGS.cashfree_app_id,
    cashfree_mode:
      cashfree?.mode === 'live' ? 'production' : DEFAULT_INTEGRATION_SETTINGS.cashfree_mode,
    supabase_url: rzSettings.supabase_url ?? DEFAULT_INTEGRATION_SETTINGS.supabase_url,
    supabase_anon_key:
      rzSettings.supabase_anon_key ?? DEFAULT_INTEGRATION_SETTINGS.supabase_anon_key,
    webhook_secret: rzSettings.webhook_secret ?? DEFAULT_INTEGRATION_SETTINGS.webhook_secret,
  };
}

export async function getIntegrationSettings(): Promise<IntegrationSettings> {
  try {
    const { data, error } = await supabase
      .from('integration_settings')
      .select('id, gateway, is_enabled, mode, public_key, settings')
      .limit(10);
    if (error || !data || data.length === 0) {
      return DEFAULT_INTEGRATION_SETTINGS;
    }
    return mapIntegrationRows(data as IntegrationRow[]);
  } catch {
    return DEFAULT_INTEGRATION_SETTINGS;
  }
}

export async function saveIntegrationSettings(
  settings: Partial<IntegrationSettings>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Read existing rows first so partial saves (e.g. a gateway toggle)
    // never clobber fields the caller didn't pass, and so the razorpay
    // mode — which the UI has no field for — is preserved as-is.
    const { data: existing, error: readError } = await supabase
      .from('integration_settings')
      .select('id, gateway, is_enabled, mode, public_key, settings')
      .limit(10);
    if (readError) throw readError;
    const rows = (existing ?? []) as IntegrationRow[];
    const razorpay = rows.find((r) => r.gateway === 'razorpay');
    const cashfree = rows.find((r) => r.gateway === 'cashfree');

    const rzSettings = {
      ...parseIntegrationSettings(razorpay?.settings),
      ...(settings.webhook_secret !== undefined ? { webhook_secret: settings.webhook_secret } : {}),
      ...(settings.supabase_url !== undefined ? { supabase_url: settings.supabase_url } : {}),
      ...(settings.supabase_anon_key !== undefined
        ? { supabase_anon_key: settings.supabase_anon_key }
        : {}),
    };
    const razorpayRow = {
      gateway: 'razorpay',
      is_enabled: settings.razorpay_enabled ?? razorpay?.is_enabled ?? false,
      mode: razorpay?.mode ?? 'test',
      public_key: settings.razorpay_key_id ?? razorpay?.public_key ?? '',
      settings: rzSettings,
      updated_at: new Date().toISOString(),
    };
    const cashfreeRow = {
      gateway: 'cashfree',
      is_enabled: settings.cashfree_enabled ?? cashfree?.is_enabled ?? false,
      mode:
        settings.cashfree_mode !== undefined
          ? settings.cashfree_mode === 'production'
            ? 'live'
            : 'test'
          : cashfree?.mode ?? 'test',
      public_key: settings.cashfree_app_id ?? cashfree?.public_key ?? '',
      settings: parseIntegrationSettings(cashfree?.settings),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('integration_settings')
      .upsert([razorpayRow, cashfreeRow], { onConflict: 'gateway' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

// The settings table is key-value: rows {key, value(jsonb)}. The system
// settings live in the row with key='system', whose value uses different
// field names than the app type (currency, tax_percent,
// registration_enabled). Translate in both directions here.
function parseSettingsValue(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof raw === 'object' ? raw : {};
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'system')
      .maybeSingle();
    if (error || !data) {
      return DEFAULT_SYSTEM_SETTINGS;
    }
    const value = parseSettingsValue((data as any).value);
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      id: (data as any).id ?? DEFAULT_SYSTEM_SETTINGS.id,
      site_name: value.site_name ?? DEFAULT_SYSTEM_SETTINGS.site_name,
      site_url: value.site_url ?? DEFAULT_SYSTEM_SETTINGS.site_url,
      default_currency: value.currency ?? DEFAULT_SYSTEM_SETTINGS.default_currency,
      currency_symbol: value.currency_symbol ?? DEFAULT_SYSTEM_SETTINGS.currency_symbol,
      default_tax_rate: value.tax_percent ?? DEFAULT_SYSTEM_SETTINGS.default_tax_rate,
      enable_registration:
        value.registration_enabled ?? DEFAULT_SYSTEM_SETTINGS.enable_registration,
      maintenance_mode: value.maintenance_mode ?? DEFAULT_SYSTEM_SETTINGS.maintenance_mode,
      ...(value.smtp_host !== undefined ? { smtp_host: value.smtp_host } : {}),
      ...(value.smtp_port !== undefined ? { smtp_port: value.smtp_port } : {}),
      ...(value.smtp_user !== undefined ? { smtp_user: value.smtp_user } : {}),
      ...(value.smtp_pass !== undefined ? { smtp_pass: value.smtp_pass } : {}),
      ...(value.smtp_from !== undefined ? { smtp_from: value.smtp_from } : {}),
      ...(value.enable_coupons !== undefined ? { enable_coupons: value.enable_coupons } : {}),
      ...(value.enable_device_binding !== undefined
        ? { enable_device_binding: value.enable_device_binding }
        : {}),
      ...(value.theme_mode !== undefined ? { theme_mode: value.theme_mode } : {}),
      ...(value.accent_color !== undefined ? { accent_color: value.accent_color } : {}),
    };
  } catch {
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

export async function saveSystemSettings(settings: Partial<SystemSettings>): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'system')
      .maybeSingle();
    // Preserve unknown existing keys (e.g. email_verification).
    const value: Record<string, any> = { ...parseSettingsValue((data as any)?.value) };
    if (settings.site_name !== undefined) value.site_name = settings.site_name;
    if (settings.site_url !== undefined) value.site_url = settings.site_url;
    if (settings.default_currency !== undefined) value.currency = settings.default_currency;
    if (settings.currency_symbol !== undefined) value.currency_symbol = settings.currency_symbol;
    if (settings.default_tax_rate !== undefined) value.tax_percent = settings.default_tax_rate;
    if (settings.maintenance_mode !== undefined) value.maintenance_mode = settings.maintenance_mode;
    if (settings.enable_registration !== undefined)
      value.registration_enabled = settings.enable_registration;
    if (settings.smtp_host !== undefined) value.smtp_host = settings.smtp_host;
    if (settings.smtp_port !== undefined) value.smtp_port = settings.smtp_port;
    if (settings.smtp_user !== undefined) value.smtp_user = settings.smtp_user;
    if (settings.smtp_pass !== undefined) value.smtp_pass = settings.smtp_pass;
    if (settings.smtp_from !== undefined) value.smtp_from = settings.smtp_from;
    if (settings.enable_coupons !== undefined) value.enable_coupons = settings.enable_coupons;
    if (settings.enable_device_binding !== undefined)
      value.enable_device_binding = settings.enable_device_binding;

    if (data) {
      const { error } = await supabase
        .from('settings')
        .update({ value })
        .eq('key', 'system');
      return !error;
    } else {
      const { error } = await supabase.from('settings').insert([{ key: 'system', value }]);
      return !error;
    }
  } catch {
    return false;
  }
}
