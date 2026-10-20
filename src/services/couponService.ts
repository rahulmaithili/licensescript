import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';

export interface CouponInput {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  min_order_amount?: number;
  usage_limit?: number | null;
  expires_at?: string | null;
  is_active: boolean;
}

function buildPayload(input: CouponInput): Record<string, unknown> {
  return {
    code: input.code.toUpperCase().trim(),
    type: input.type,
    value: input.value,
    min_order_amount: input.min_order_amount ?? 0,
    usage_limit: input.usage_limit ?? null,
    expires_at: input.expires_at || null,
    is_active: input.is_active,
  };
}

function isMinOrderAmountError(error: { message?: string } | null | undefined): boolean {
  return !!error?.message && error.message.includes('min_order_amount');
}

export async function getCoupons(): Promise<{ success: boolean; data?: Coupon[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: (data || []) as Coupon[] };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to load coupons' };
  }
}

export async function createCoupon(
  input: CouponInput,
): Promise<{ success: boolean; data?: Coupon; error?: string }> {
  try {
    const payload = buildPayload(input);

    let result = await supabase.from('coupons').insert([payload]).select().single();

    if (result.error && isMinOrderAmountError(result.error)) {
      delete payload.min_order_amount;
      result = await supabase.from('coupons').insert([payload]).select().single();
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true, data: result.data as Coupon };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create coupon' };
  }
}

export async function updateCoupon(
  id: string,
  input: CouponInput,
): Promise<{ success: boolean; data?: Coupon; error?: string }> {
  try {
    const payload = buildPayload(input);

    let result = await supabase
      .from('coupons')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (result.error && isMinOrderAmountError(result.error)) {
      delete payload.min_order_amount;
      result = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true, data: result.data as Coupon };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update coupon' };
  }
}

export async function deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete coupon' };
  }
}

/**
 * Best-effort redemption counter increment. NEVER throws — a failure here
 * must not break checkout. Tries the redeem_coupon RPC first (from
 * migration 20261020010000); falls back to read-then-update on older DBs.
 */
export async function redeemCoupon(code: string): Promise<void> {
  const normalized = code.toUpperCase().trim();
  if (!normalized) return;

  try {
    const { error } = await supabase.rpc('redeem_coupon', { p_code: normalized });
    if (!error) return;

    console.warn('redeem_coupon RPC failed, falling back to direct update:', error.message);

    try {
      const { data, error: selectError } = await supabase
        .from('coupons')
        .select('id, used_count')
        .eq('code', normalized)
        .single();

      if (selectError || !data) {
        if (selectError) console.warn('redeemCoupon fallback lookup failed:', selectError.message);
        return;
      }

      const { error: updateError } = await supabase
        .from('coupons')
        .update({ used_count: (data.used_count ?? 0) + 1 })
        .eq('id', data.id);

      if (updateError) {
        console.warn('redeemCoupon fallback update failed:', updateError.message);
      }
    } catch (fallbackErr) {
      console.warn('redeemCoupon fallback failed:', fallbackErr);
    }
  } catch (err) {
    console.warn('redeemCoupon failed:', err);
  }
}
