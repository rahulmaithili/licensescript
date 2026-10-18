import { supabase } from '@/lib/supabase';
import type { Product, Plan, Coupon } from '@/types';

// Official Gas Agency Automation & License Selling Tools (Indane, HP Gas, Bharat Gas, CDCMS)
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'CDCMS Gas Agency Multi-Tool Suite (PRO)',
    slug: 'cdcms-gas-agency-suite',
    description: 'All-in-one automation package for IndianOil (Indane), HP Gas & Bharat Gas distributors. Includes 1-click cash memo printing, bulk refill booking, consumer KYC verification, cylinder delivery tracking, and WhatsApp consumer invoice messaging.',
    short_description: 'Indane, HP Gas & Bharat Gas bulk booking, KYC & cash memo automation suite.',
    category: 'Gas Agency Extension',
    logo_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=120&h=120&fit=crop',
    version: 'v4.5.2',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 1,
    features: [
      'Indane (SDMS / IndianOil) 1-Click Fast Connect',
      'HP Gas (CMS / HPCL) Cash Memo & Bulk Booking',
      'Bharat Gas (EBharat / BPCL) Delivery Sync',
      'Strict Machine HWID Binding (1-3 Workstations)',
      'Automated WhatsApp Receipt & Delivery Confirmation',
      'Daily Sales, Stock & Cylinder Reconciliation Report'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'HP & Indane Auto Refill Booking & KYC Extractor',
    slug: 'hp-indane-refill-booking-tool',
    description: 'High-speed automated script for commercial & domestic gas distributors. Instantly book bulk refill requests, fetch pending delivery slips, verify Aadhaar/Bank details, and bypass slow portal loading during peak hours.',
    short_description: 'Fast refill booking & bulk KYC verification tool for HP Gas & Indane distributors.',
    category: 'Agency Script',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop',
    version: 'v3.2.0',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 2,
    features: [
      'High-Speed Multi-Tab Background Booking',
      'Ujjwala (PMUY) 2.0 Bulk Verification Helper',
      'Consumer Contact Sync with WhatsApp Sender',
      'Anti-Session Expire Auto-Relogin Keep-Alive',
      'Instant Excel & CSV Data Export'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Master Gas Distributorship Complete Package',
    slug: 'all-in-one-gas-master-package',
    description: 'Complete commercial package including CDCMS Pro, Indane SDMS Tool, HPCL Portal Assistant, Bharat Gas Sync, and WhatsApp Bulk Notification Extension with lifetime updates and AnyDesk installation support.',
    short_description: 'Unlimited access to all gas agency extensions, priority support, and multi-PC licenses.',
    category: 'Agency Master Bundle',
    logo_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&h=120&fit=crop',
    version: 'v2026.4',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 3,
    features: [
      'All 3 Agency Softwares & Future Tools Included',
      'Up to 5 Agency Counter Workstations',
      'Free Remote Setup via AnyDesk/TeamViewer',
      'Direct VIP WhatsApp Support with RM Rahul',
      'Lifetime Free Updates on Portal Changes'
    ],
    created_at: new Date().toISOString(),
  }
];

export const DEFAULT_PLANS: Plan[] = [
  // CDCMS Gas Agency Multi-Tool Suite Plans
  {
    id: '6768b255-fb25-4a65-89e7-fb72936ce237',
    product_id: '11111111-1111-1111-1111-111111111111',
    name: 'Single Counter (1 Month)',
    description: 'Ideal for trial and monthly agency counter operations.',
    price: 499,
    billing_period: 'monthly',
    duration_days: 30,
    max_devices: 1,
    is_active: true,
    sort_order: 1,
    features: ['1 Counter Workstation License', 'All Gas Portals (Indane, HP, Bharat)', 'Instant Key Activation', 'Standard WhatsApp Support'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-cdcms-6m',
    product_id: '11111111-1111-1111-1111-111111111111',
    name: 'Agency Pro (6 Months)',
    description: 'Most popular package for busy LPG agency billing counters.',
    price: 1999,
    billing_period: 'semi_annual',
    duration_days: 180,
    max_devices: 2,
    is_active: true,
    sort_order: 2,
    features: ['2 Counter PCs Simultaneous', 'Bulk Cash Memo Auto-Print', '6 Months Updates Guarantee', 'Priority WhatsApp Support'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-cdcms-year',
    product_id: '11111111-1111-1111-1111-111111111111',
    name: 'Distributor Annual (1 Year)',
    description: 'Full year uninterrupted license with zero downtime.',
    price: 3499,
    billing_period: 'yearly',
    duration_days: 365,
    max_devices: 3,
    is_active: true,
    sort_order: 3,
    features: ['3 Counter Workstations', 'Free AnyDesk Setup & Training', '1 Year All Portal Updates', 'Dedicated Support Line'],
    created_at: new Date().toISOString(),
  },
  // HP & Indane Auto Refill Booking Plans
  {
    id: '3226ab84-d41b-4045-9180-b2b23cea67ff',
    product_id: '22222222-2222-2222-2222-222222222222',
    name: '1 Month Refill Access',
    description: 'Full automated refill booking and customer KYC tool.',
    price: 799,
    billing_period: 'monthly',
    duration_days: 30,
    max_devices: 1,
    is_active: true,
    sort_order: 1,
    features: ['1 Workstation license', 'Unlimited Refill Bookings', 'Excel/CSV Export', '30 Days validity'],
    created_at: new Date().toISOString(),
  },
  {
    id: '87e04157-e491-4397-9801-e4f1d35a2131',
    product_id: '22222222-2222-2222-2222-222222222222',
    name: 'Quarterly Agency Pass (3 Months)',
    description: '3 months discounted package with multi-tab support.',
    price: 1999,
    billing_period: 'quarterly',
    duration_days: 90,
    max_devices: 2,
    is_active: true,
    sort_order: 2,
    features: ['2 Workstations license', 'High-Speed Booking Engine', 'Ujjwala PMUY helper', 'Priority Bug Fixes'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'd3320db1-3528-45ac-81a0-5a7ada4cbc71',
    product_id: '22222222-2222-2222-2222-222222222222',
    name: '1 Year Distributor Pass',
    description: 'Annual license with premium updates and phone support.',
    price: 4999,
    billing_period: 'yearly',
    duration_days: 365,
    max_devices: 3,
    is_active: true,
    sort_order: 3,
    features: ['3 Counter PCs', 'Unlimited Bookings & KYC', 'VIP Phone & WhatsApp Support', '1 Year Free Portal Updates'],
    created_at: new Date().toISOString(),
  },
  // Master Gas Distributorship Plans
  {
    id: '07807098-a975-4bb8-9462-81eb387bcc29',
    product_id: '33333333-3333-3333-3333-333333333333',
    name: 'Annual Agency VIP Package (1 Year)',
    description: 'All agency tools unlocked for entire staff with 1-on-1 setup.',
    price: 4999,
    billing_period: 'yearly',
    duration_days: 365,
    max_devices: 5,
    is_active: true,
    sort_order: 1,
    features: ['5 Workstations License', 'CDCMS Pro + HP + Indane + Bharat', 'Full Remote AnyDesk Setup', 'Direct Support with RM Rahul'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'a9bb9da6-c59d-49fa-9f0e-0f95763a2437',
    product_id: '33333333-3333-3333-3333-333333333333',
    name: 'Lifetime Distributor Master License',
    description: 'Never pay renewal fees again! Unlimited updates and lifetime priority support.',
    price: 12999,
    billing_period: 'lifetime',
    duration_days: 36500,
    max_devices: 5,
    is_active: true,
    sort_order: 2,
    features: ['5 Counter Workstations', 'Never Expires (Lifetime)', 'All Future Portal Upgrades Free', 'VIP 24/7 WhatsApp & Calling Access'],
    created_at: new Date().toISOString(),
  }
];

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_PRODUCTS;
    }
    return data.map((p: any) => ({
      ...p,
      sort_order: p.display_order ?? p.sort_order ?? 1,
    })) as Product[];
  } catch {
    return DEFAULT_PRODUCTS;
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
      return DEFAULT_PRODUCTS.find((p) => p.slug === slug) || null;
    }
    return {
      ...(data as any),
      sort_order: (data as any).display_order ?? (data as any).sort_order ?? 1,
    } as Product;
  } catch {
    return DEFAULT_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

export async function getPlans(productId?: string): Promise<Plan[]> {
  try {
    let query = supabase.from('plans').select('*, product:products(*)').order('created_at', { ascending: true });
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (productId) {
        return DEFAULT_PLANS.filter((p) => p.product_id === productId);
      }
      return DEFAULT_PLANS;
    }
    return data.map((p: any) => {
      let bp = p.billing_period;
      if (!bp) {
        if (p.is_lifetime || p.duration_days >= 3650) bp = 'lifetime';
        else if (p.duration_days >= 365) bp = 'yearly';
        else if (p.duration_days >= 180) bp = 'semi_annual';
        else if (p.duration_days >= 90) bp = 'quarterly';
        else bp = 'monthly';
      }
      return {
        ...p,
        billing_period: bp,
        sort_order: p.display_order ?? p.sort_order ?? 1,
      };
    }) as Plan[];
  } catch {
    if (productId) {
      return DEFAULT_PLANS.filter((p) => p.product_id === productId);
    }
    return DEFAULT_PLANS;
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
      const fallback = DEFAULT_PLANS.find((p) => p.id === planId);
      if (fallback) {
        const prod = DEFAULT_PRODUCTS.find((p) => p.id === fallback.product_id);
        return { ...fallback, product: prod };
      }
      return null;
    }
    const raw: any = data;
    let bp = raw.billing_period;
    if (!bp) {
      if (raw.is_lifetime || raw.duration_days >= 3650) bp = 'lifetime';
      else if (raw.duration_days >= 365) bp = 'yearly';
      else if (raw.duration_days >= 180) bp = 'semi_annual';
      else if (raw.duration_days >= 90) bp = 'quarterly';
      else bp = 'monthly';
    }
    return {
      ...raw,
      billing_period: bp,
      sort_order: raw.display_order ?? raw.sort_order ?? 1,
    } as Plan;
  } catch {
    const fallback = DEFAULT_PLANS.find((p) => p.id === planId);
    if (fallback) {
      const prod = DEFAULT_PRODUCTS.find((p) => p.id === fallback.product_id);
      return { ...fallback, product: prod };
    }
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
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Fallback demo coupon WELCOME50
      if (code.toUpperCase().trim() === 'WELCOME50' || code.toUpperCase().trim() === 'RAHUL50') {
        const discount = Math.round(orderAmount * 0.5);
        return {
          valid: true,
          discount,
          message: '50% VIP discount applied!',
        };
      }
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }

    const coupon = data as Coupon;
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { valid: false, discount: 0, message: 'Coupon is not yet active' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, discount: 0, message: 'Coupon has expired' };
    }
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    }
    if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
      return { valid: false, discount: 0, message: `Minimum order of ₹${coupon.min_order_amount} required` };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderAmount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }

    return {
      valid: true,
      discount: Math.round(discount),
      coupon,
    };
  } catch (err: any) {
    return { valid: false, discount: 0, message: err.message };
  }
}
