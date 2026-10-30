import { supabase } from '@/lib/supabase';
import type { Product, Plan, Coupon } from '@/types';

// Plans have no billing_period column in the DB — derive it from
// is_lifetime / duration_days so every consumer gets a consistent value.
function deriveBillingPeriod(row: any): Plan['billing_period'] {
  if (row.billing_period) return row.billing_period;
  if (row.is_lifetime || row.duration_days >= 3650) return 'lifetime';
  if (row.duration_days >= 365) return 'yearly';
  if (row.duration_days >= 180) return 'semi_annual';
  if (row.duration_days >= 90) return 'quarterly';
  return 'monthly';
}

function normalizeProduct(row: any): Product {
  return {
    ...row,
    // The products table's image column is `image_url` — there is NO
    // `logo_url` column. Expose the value under both names so every
    // consumer reading `logo_url` gets the uploaded image.
    image_url: row.image_url ?? row.logo_url ?? null,
    logo_url: row.image_url ?? row.logo_url ?? null,
    // There is NO `short_description` column — the single real column
    // is `description`. Expose it under both names so consumers reading
    // `short_description || description` keep working.
    short_description: row.short_description ?? row.description ?? null,
    sort_order: row.display_order ?? row.sort_order ?? 1,
  } as Product;
}

function normalizePlan(row: any): Plan {
  return {
    ...row,
    // Joined product rows bypass normalizeProduct — normalize them too so
    // plan.product.logo_url (e.g. on CheckoutPage) resolves to image_url.
    product: row.product ? normalizeProduct(row.product) : row.product,
    billing_period: deriveBillingPeriod(row),
    sort_order: row.display_order ?? row.sort_order ?? 1,
  } as Plan;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load products:', error.message);
      return [];
    }
    return (data || []).map(normalizeProduct);
  } catch (err) {
    console.error('Failed to load products:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return normalizeProduct(data);
  } catch {
    return null;
  }
}

export async function getPlans(productId?: string): Promise<Plan[]> {
  try {
    let query = supabase.from('plans').select('*, product:products(*)').order('created_at', { ascending: true });
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Failed to load plans:', error.message);
      return [];
    }
    return (data || []).map(normalizePlan);
  } catch (err) {
    console.error('Failed to load plans:', err);
    return [];
  }
}

export async function getPlanById(planId: string): Promise<Plan | null> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*, product:products(*)')
      .eq('id', planId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return normalizePlan(data);
  } catch {
    return null;
  }
}

export async function saveProduct(product: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    const payload: any = { ...product };
    if ('sort_order' in payload) {
      payload.display_order = payload.sort_order;
      delete payload.sort_order;
    }
    // The DB column is `image_url`, not `logo_url` — translate before
    // sending so the admin form's Logo URL actually persists and
    // PostgREST never receives the non-existent column.
    payload.image_url = payload.image_url ?? payload.logo_url;
    delete payload.logo_url;
    // There is NO `short_description` column — the single real column
    // is `description`. Fold a short value into it only when description
    // is empty, then always drop the key so PostgREST never sees it.
    if (!payload.description && payload.short_description) {
      payload.description = payload.short_description;
    }
    delete payload.short_description;

    if (payload.id) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', payload.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return { success: true, data: data as Product };
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select()
        .maybeSingle();
      if (error) throw error;
      return { success: true, data: data as Product };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  return !error;
}

export async function savePlan(plan: Partial<Plan>): Promise<{ success: boolean; data?: Plan; error?: string }> {
  try {
    const payload: any = { ...plan };
    delete payload.sort_order;
    // billing_period is derived, not a real column — never send it to the DB.
    delete payload.billing_period;
    // Never send joined data back to the table.
    delete payload.product;
    // Keep the real is_lifetime column in sync with the chosen period.
    if ((plan as any).billing_period === 'lifetime') {
      payload.is_lifetime = true;
    } else if ((plan as any).billing_period) {
      payload.is_lifetime = false;
    }

    if (payload.id) {
      const { data, error } = await supabase
        .from('plans')
        .update(payload)
        .eq('id', payload.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return { success: true, data: data as Plan };
    } else {
      const { data, error } = await supabase
        .from('plans')
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select()
        .maybeSingle();
      if (error) throw error;
      return { success: true, data: data as Plan };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deletePlan(planId: string): Promise<boolean> {
  const { error } = await supabase.from('plans').delete().eq('id', planId);
  return !error;
}

export async function validateCoupon(code: string, orderAmount: number): Promise<{
  valid: boolean;
  discount: number;
  message?: string;
  coupon?: Coupon;
}> {
  try {
    const normalized = code.toUpperCase().trim();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', normalized)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }

    const coupon = data as Coupon;
    const now = new Date();

    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { valid: false, discount: 0, message: 'This coupon has expired' };
    }
    if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    }
    // min_order_amount may be absent pre-migration — with select('*') it
    // simply won't be on the object, so read it defensively.
    if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
      return { valid: false, discount: 0, message: `Minimum order of ₹${coupon.min_order_amount} required` };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, orderAmount);

    return {
      valid: true,
      discount: Math.round(discount),
      coupon,
    };
  } catch (err: any) {
    return { valid: false, discount: 0, message: err.message };
  }
}
