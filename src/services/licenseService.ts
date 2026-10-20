import { supabase } from '@/lib/supabase';
import type { License, LicenseStatus, LicensePriority } from '@/types';
import { generateCryptoRandomKey } from './keyGeneratorService';

// Normalize a joined profiles row to the app Profile shape:
// real DB columns are company / tax_id / status (not company_name / gst_number / is_blocked).
function normalizeUser(row: any) {
  if (!row) return row;
  return {
    ...row,
    company_name: row.company_name ?? row.company ?? undefined,
    gst_number: row.gst_number ?? row.tax_id ?? undefined,
    is_blocked: row.is_blocked ?? row.status === 'blocked',
  };
}

// Plans have no billing_period column in the DB — derive it like productService does.
function normalizePlan(row: any) {
  if (!row || row.billing_period) return row;
  let bp = 'monthly';
  if (row.is_lifetime || row.duration_days >= 3650) bp = 'lifetime';
  else if (row.duration_days >= 365) bp = 'yearly';
  else if (row.duration_days >= 180) bp = 'semi_annual';
  else if (row.duration_days >= 90) bp = 'quarterly';
  return { ...row, billing_period: bp };
}

function normalizeLicense(row: any): License {
  return {
    ...row,
    // The real licenses table links users via customer_id; the app type
    // calls it user_id. Keep both in sync so filters/cards work everywhere.
    user_id: row.user_id ?? row.customer_id ?? undefined,
    customer_id: row.customer_id ?? row.user_id ?? undefined,
    // Trial detection that also works before the premium migration adds
    // licenses.is_trial: trial keys always carry the LW-TRIAL- prefix.
    is_trial:
      row.is_trial === true ||
      (typeof row.license_key === 'string' && row.license_key.startsWith('LW-TRIAL')),
    // current_devices only exists after the premium migration; default 0.
    current_devices: row.current_devices ?? 0,
    user: normalizeUser(row.user),
    plan: normalizePlan(row.plan),
  } as License;
}

export async function getLicenses(userId?: string): Promise<License[]> {
  try {
    let query = supabase.from('licenses').select(`
      *,
      product:products(*),
      plan:plans(*),
      user:profiles(*),
      invoice:invoices(*)
    `).order('created_at', { ascending: false });

    if (userId) {
      // Real column is customer_id (licenses has no user_id column).
      query = query.eq('customer_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to load licenses:', error.message);
      return [];
    }
    return (data || []).map(normalizeLicense);
  } catch (err) {
    console.error('Failed to load licenses:', err);
    return [];
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
      customer_id: params.userId,
      product_id: params.productId,
      plan_id: params.planId || null,
      status: 'active' as LicenseStatus,
      issue_date: now.toISOString(),
      expiry_date: expiryStr,
      max_devices: params.maxDevices || 1,
      // current_devices omitted: column only exists after the premium
      // migration; its DB default (0) applies when present.
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
      return { success: false, error: error.message };
    }

    return { success: true, license: normalizeLicense(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLicense(
  id: string,
  updates: Partial<License>
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = { ...updates };
    // Never send joined/derived objects back to the table
    delete payload.product;
    delete payload.plan;
    delete payload.user;
    delete payload.invoice;
    const { error } = await supabase.from('licenses').update(payload).eq('id', id);
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
