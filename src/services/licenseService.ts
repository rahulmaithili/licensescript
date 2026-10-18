import { supabase } from '@/lib/supabase';
import type { License, LicenseStatus, LicensePriority } from '@/types';
import { generateCryptoRandomKey } from './keyGeneratorService';

// Default mock licenses for immediate demonstration if database is empty
export const DEFAULT_LICENSES: License[] = [
  {
    id: 'lic-demo-1',
    license_key: 'LW-WAPRO-7K9A-4M2X-88PL',
    user_id: 'user-1',
    product_id: 'prod-whatsapp-pro',
    plan_id: 'plan-wa-6m',
    status: 'active',
    issue_date: '2026-03-01T10:00:00Z',
    expiry_date: '2026-09-01T10:00:00Z',
    max_devices: 2,
    current_devices: 1,
    is_locked: false,
    priority: 'high',
    notes: 'Paid via Razorpay. Customer requested urgent activation.',
    created_at: '2026-03-01T10:00:00Z',
    product: {
      id: 'prod-whatsapp-pro',
      name: 'WhatsApp Bulk Sender & Filter Extension',
      slug: 'whatsapp-bulk-sender',
      category: 'Browser Extension',
      sort_order: 1,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    plan: {
      id: 'plan-wa-6m',
      product_id: 'prod-whatsapp-pro',
      name: 'Professional (6 Months)',
      price: 1999,
      billing_period: 'semi_annual',
      duration_days: 180,
      max_devices: 2,
      is_active: true,
      sort_order: 2,
      created_at: '2026-01-01T00:00:00Z',
    },
    user: {
      id: 'user-1',
      email: 'amit.patel@gmail.com',
      full_name: 'Amit Patel',
      phone: '+91 98200 12345',
      company_name: 'Apex Digitech Solutions',
      role: 'customer',
      is_blocked: false,
      created_at: '2026-02-15T10:00:00Z',
    },
  },
  {
    id: 'lic-demo-2',
    license_key: 'LW-TGPRO-3B8Q-9X7R-12KW',
    user_id: 'user-2',
    product_id: 'prod-telegram-scraper',
    plan_id: 'plan-tg-1m',
    status: 'expiring_soon',
    issue_date: '2026-03-20T11:00:00Z',
    expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days left
    max_devices: 1,
    current_devices: 1,
    is_locked: false,
    priority: 'normal',
    notes: 'Pending renewal notice.',
    created_at: '2026-03-20T11:00:00Z',
    product: {
      id: 'prod-telegram-scraper',
      name: 'Telegram Group Member Scraper & Adder',
      slug: 'telegram-scraper-adder',
      category: 'Automation Script',
      sort_order: 2,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    plan: {
      id: 'plan-tg-1m',
      product_id: 'prod-telegram-scraper',
      name: 'Monthly License',
      price: 799,
      billing_period: 'monthly',
      duration_days: 30,
      max_devices: 1,
      is_active: true,
      sort_order: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
    user: {
      id: 'user-2',
      email: 'rohit.sharma@outlook.com',
      full_name: 'Rohit Sharma',
      phone: '+91 99341 87654',
      company_name: 'LeadBoosters Media',
      role: 'customer',
      is_blocked: false,
      created_at: '2026-03-01T00:00:00Z',
    },
  },
  {
    id: 'lic-demo-3',
    license_key: 'LW-B2BLD-9Z4P-5V1N-99QQ',
    user_id: 'user-3',
    product_id: 'prod-justdial-extractor',
    plan_id: 'plan-b2b-life',
    status: 'active',
    issue_date: '2026-01-10T12:00:00Z',
    expiry_date: '9999-12-31T23:59:59Z', // Lifetime
    max_devices: 3,
    current_devices: 2,
    is_locked: false,
    priority: 'vip',
    notes: 'VIP customer. Lifetime unlimited.',
    created_at: '2026-01-10T12:00:00Z',
    product: {
      id: 'prod-justdial-extractor',
      name: 'JustDial & Google Maps B2B Leads Extractor',
      slug: 'b2b-leads-extractor',
      category: 'Browser Extension',
      sort_order: 3,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    plan: {
      id: 'plan-b2b-life',
      product_id: 'prod-justdial-extractor',
      name: 'Lifetime License',
      price: 2999,
      billing_period: 'lifetime',
      duration_days: 36500,
      max_devices: 3,
      is_active: true,
      sort_order: 2,
      created_at: '2026-01-01T00:00:00Z',
    },
    user: {
      id: 'user-3',
      email: 'vikas.verma@gmail.com',
      full_name: 'Vikas Verma',
      phone: '+91 91234 56789',
      company_name: 'Smart Solutions Inc',
      role: 'customer',
      is_blocked: false,
      created_at: '2026-01-05T00:00:00Z',
    },
  },
  {
    id: 'lic-demo-4',
    license_key: 'LW-WAPRO-1M2N-3P4Q-5R6S',
    user_id: 'user-4',
    product_id: 'prod-whatsapp-pro',
    plan_id: 'plan-wa-1m',
    status: 'expired',
    issue_date: '2026-02-01T10:00:00Z',
    expiry_date: '2026-03-03T10:00:00Z',
    max_devices: 1,
    current_devices: 1,
    is_locked: true,
    priority: 'normal',
    notes: 'Expired license. User contacted on WhatsApp.',
    created_at: '2026-02-01T10:00:00Z',
    product: {
      id: 'prod-whatsapp-pro',
      name: 'WhatsApp Bulk Sender & Filter Extension',
      slug: 'whatsapp-bulk-sender',
      category: 'Browser Extension',
      sort_order: 1,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    plan: {
      id: 'plan-wa-1m',
      product_id: 'prod-whatsapp-pro',
      name: 'Starter (1 Month)',
      price: 499,
      billing_period: 'monthly',
      duration_days: 30,
      max_devices: 1,
      is_active: true,
      sort_order: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
    user: {
      id: 'user-4',
      email: 'priya.sharma@yahoo.com',
      full_name: 'Priya Sharma',
      phone: '+91 97654 32109',
      role: 'customer',
      is_blocked: false,
      created_at: '2026-02-01T00:00:00Z',
    },
  }
];

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function getLicenses(userId?: string): Promise<License[]> {
  try {
    if (userId && !isUUID(userId)) {
      return DEFAULT_LICENSES.filter((l) => l.user_id === userId);
    }
    let query = supabase.from('licenses').select(`
      *,
      product:products(*),
      plan:plans(*),
      user:profiles(*),
      invoice:invoices(*)
    `).order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (userId) {
        return DEFAULT_LICENSES.filter((l) => l.user_id === userId);
      }
      return DEFAULT_LICENSES;
    }
    return data as License[];
  } catch {
    if (userId) {
      return DEFAULT_LICENSES.filter((l) => l.user_id === userId);
    }
    return DEFAULT_LICENSES;
  }
}

export async function createManualLicense(params: {
  userId: string;
  productId: string;
  planId?: string;
  durationDays: number;
  maxDevices: number;
  priority: LicensePriority;
  notes?: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
}): Promise<{ success: boolean; license?: License; error?: string }> {
  try {
    const key = generateCryptoRandomKey({ prefix: 'LW' });
    const now = new Date();
    const expiry = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000);
    const expiryStr = params.durationDays >= 3650 ? '9999-12-31T23:59:59Z' : expiry.toISOString();

    const licensePayload = {
      license_key: key,
      user_id: params.userId,
      product_id: params.productId,
      plan_id: params.planId || null,
      status: 'active' as LicenseStatus,
      issue_date: now.toISOString(),
      expiry_date: expiryStr,
      max_devices: params.maxDevices || 1,
      current_devices: 0,
      is_locked: false,
      priority: params.priority || 'normal',
      notes: params.notes || 'Manually issued by Super Admin RM Rahul',
      created_at: now.toISOString(),
    };

    const { data, error } = await supabase.from('licenses').insert([licensePayload]).select(`
      *,
      product:products(*),
      plan:plans(*),
      user:profiles(*)
    `).single();

    if (error) {
      console.warn('DB license insert failed, fallback to in-memory:', error);
      const fallback: License = {
        id: `lic-${Date.now()}`,
        ...licensePayload,
      };
      return { success: true, license: fallback };
    }

    return { success: true, license: data as License };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLicense(
  id: string,
  updates: Partial<License>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('licenses').update(updates).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteLicense(id: string): Promise<boolean> {
  const { error } = await supabase.from('licenses').delete().eq('id', id);
  return !error;
}

export async function updateLicenseStatus(
  id: string,
  status: LicenseStatus
): Promise<boolean> {
  const { error } = await supabase.from('licenses').update({ status }).eq('id', id);
  return !error;
}

export async function toggleLicenseLock(id: string, isLocked: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('licenses')
    .update({
      is_locked: isLocked,
      status: isLocked ? 'locked' : 'active',
    })
    .eq('id', id);
  return !error;
}

export async function extendLicenseDays(id: string, currentExpiry: string, additionalDays: number): Promise<boolean> {
  try {
    let baseTime = new Date().getTime();
    if (currentExpiry && !currentExpiry.startsWith('9999')) {
      const parsed = new Date(currentExpiry).getTime();
      if (parsed > baseTime) baseTime = parsed;
    }
    const newExpiry = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('licenses')
      .update({
        expiry_date: newExpiry,
        status: 'active',
      })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function resetLicenseDevices(id: string): Promise<boolean> {
  try {
    await supabase.from('license_activations').delete().eq('license_id', id);
    const { error } = await supabase
      .from('licenses')
      .update({ current_devices: 0 })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function regenerateLicenseKey(id: string): Promise<{ success: boolean; newKey?: string }> {
  try {
    const newKey = generateCryptoRandomKey({ prefix: 'LW' });
    const { error } = await supabase
      .from('licenses')
      .update({ license_key: newKey })
      .eq('id', id);
    if (error) throw error;
    return { success: true, newKey };
  } catch {
    return { success: false };
  }
}

export async function getLicenseActivations(licenseId: string) {
  try {
    const { data, error } = await supabase
      .from('license_activations')
      .select('*')
      .eq('license_id', licenseId)
      .order('activated_at', { ascending: false });
    if (error) return [];
    return data;
  } catch {
    return [];
  }
}
