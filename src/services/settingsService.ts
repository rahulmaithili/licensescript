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

export async function getCompanyProfile(): Promise<CompanyProfile> {
  try {
    const { data, error } = await supabase.from('company_profile').select('*').limit(1).maybeSingle();
    if (error || !data) {
      return DEFAULT_COMPANY_PROFILE;
    }
    return data as CompanyProfile;
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
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('id', data.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('company_profile')
        .insert([{ ...DEFAULT_COMPANY_PROFILE, ...profile, updated_at: new Date().toISOString() }]);
      return !error;
    }
  } catch {
    return false;
  }
}

export async function getIntegrationSettings(): Promise<IntegrationSettings> {
  try {
    const { data, error } = await supabase.from('integration_settings').select('*').limit(1).maybeSingle();
    if (error || !data) {
      return DEFAULT_INTEGRATION_SETTINGS;
    }
    return data as IntegrationSettings;
  } catch {
    return DEFAULT_INTEGRATION_SETTINGS;
  }
}

export async function saveIntegrationSettings(settings: Partial<IntegrationSettings>): Promise<boolean> {
  try {
    const { data } = await supabase.from('integration_settings').select('id').limit(1).maybeSingle();
    if (data?.id) {
      const { error } = await supabase
        .from('integration_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', data.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('integration_settings')
        .insert([{ ...DEFAULT_INTEGRATION_SETTINGS, ...settings, updated_at: new Date().toISOString() }]);
      return !error;
    }
  } catch {
    return false;
  }
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
    if (error || !data) {
      return DEFAULT_SYSTEM_SETTINGS;
    }
    return data as SystemSettings;
  } catch {
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

export async function saveSystemSettings(settings: Partial<SystemSettings>): Promise<boolean> {
  try {
    const { data } = await supabase.from('settings').select('id').limit(1).maybeSingle();
    if (data?.id) {
      const { error } = await supabase
        .from('settings')
        .update(settings)
        .eq('id', data.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('settings')
        .insert([{ ...DEFAULT_SYSTEM_SETTINGS, ...settings }]);
      return !error;
    }
  } catch {
    return false;
  }
}
