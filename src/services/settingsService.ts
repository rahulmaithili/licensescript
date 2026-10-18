import { supabase } from '@/lib/supabase';
import type { CompanyProfile, IntegrationSettings, SystemSettings } from '@/types';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  company_name: 'LicenseWala Technologies',
  legal_name: 'LicenseWala Solutions Private Limited',
  email: 'support@licensewala.com',
  phone: '+91 98765 43210',
  website: 'https://licensewala.netlify.app',
  gst_number: '27AABCL1234D1ZM',
  pan_number: 'AABCL1234D',
  address: 'Level 4, Cyber City, Tech Park',
  city: 'Patna / Mumbai',
  state: 'Maharashtra',
  pincode: '400051',
  country: 'India',
  logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop',
  bank_name: 'HDFC Bank Ltd',
  bank_account_no: '50200012345678',
  bank_ifsc: 'HDFC0001234',
  upi_id: 'rahulmaithili@okhdfcbank',
  invoice_prefix: 'LW-',
  invoice_notes: 'Thank you for choosing LicenseWala! For instant support or API integration, reach out on WhatsApp.',
  terms_conditions: 'Licenses are non-transferable without admin approval. One license key is valid for designated devices only as per selected plan.',
  support_email: 'support@licensewala.com',
};

export const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  razorpay_enabled: true,
  razorpay_key_id: 'rzp_test_1DP5mmOlF5G5ag',
  cashfree_enabled: true,
  cashfree_app_id: 'TEST10375628',
  cashfree_mode: 'sandbox',
  supabase_url: 'https://wyeejbncddpxhwtijkjt.supabase.co',
  supabase_anon_key: 'sb_publishable_VfUVN_NPMbe9OudO5ZonPw_kMKaub_u',
  webhook_secret: 'whsec_lw_sample_secret_key_2026',
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
