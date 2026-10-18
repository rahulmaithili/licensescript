import { supabase } from '@/lib/supabase';
import type { Product, Plan, Coupon } from '@/types';

// Official Gas Agency Automation & License Selling Tools (Indane, HP Gas, Bharat Gas, CDCMS)
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'CDCMS Gas Agency Multi-Tool Suite (PRO)',
    slug: 'cdcms-gas-agency-suite',
    description: 'The complete daily operational engine for IndianOil (Indane), HP Gas & Bharat Gas distributors. Features 1-click area-wise booking generation, high-speed batch cash memo printing, automated booking cancellation, 1-click booking download/upload, and A4 multi-cashmemo delivery sheet systems.',
    short_description: '1-Click Area Booking, Bulk Cash Memo, Auto-Cancellation, and A4 Delivery Run-Sheet System.',
    category: 'Gas Agency Extension',
    logo_url: '/images/logos/hp-gas.png',
    version: 'v4.5.2',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 1,
    features: [
      '1-Click Area-Wise Booking Generator (Beat & Route Sorting)',
      'High-Speed Batch Cash Memo Printing (Thermal & Laser)',
      'Smart Booking Cancellation Tool (Bulk Cancel in 1-Click)',
      '1-Click All Booking Download & Portal Re-Upload',
      'Quick Print Sheet: A4 Multi-Cashmemo & Delivery Run-Sheets',
      'Anti-Clone Hardware Machine Lock (HWID Binding)'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'HP & Indane Auto Refill & Quick Print Suite',
    slug: 'hp-indane-refill-booking-tool',
    description: 'Ultra-fast automation tool for high-volume domestic & commercial LPG agency counters. Download full booking lists in 1 click, auto-generate area-wise distribution sheets, and batch cancel failed bookings without repetitive portal clicking.',
    short_description: 'Fast booking download/upload, automated area categorization, and A4 delivery printing.',
    category: 'Agency Script',
    logo_url: '/images/logos/indianoil.jpg',
    version: 'v3.2.0',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 2,
    features: [
      '1-Click Booking Area-Wise Filter & Grouping Engine',
      'A4 Multi-Cashmemo Print Layout (Saves 70% Paper Cost)',
      'Automated Bulk Booking Cancellation Workflow',
      'Instant Excel/CSV Booking Download & Portal Upload',
      'Keep-Alive Session Engine (No Portal Auto-Logout)'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Master Gas Distributorship Complete Package',
    slug: 'all-in-one-gas-master-package',
    description: 'Unlimited agency license package covering all tools: 1-Click Area Booking, A4 Cash Memo Printer, Delivery Run-Sheet Generator, Automated Booking Canceller, and WhatsApp Receipts across all counter computers.',
    short_description: 'All 3 agency portals supported, unlimited counter licenses, A4 sheet generator & VIP support.',
    category: 'Agency Master Bundle',
    logo_url: '/images/logos/bharat-petroleum.png',
    version: 'v2026.4',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 3,
    features: [
      'All Agency Tools: Area Generator, Canceller & A4 Sheets',
      '1-Click All Booking Bulk Download & Upload Sync',
      'Multi-Counter PC Licenses with HWID Anti-Clone Binding',
      'Free Remote AnyDesk Setup & Installation Support',
      'Lifetime Free Cloud Updates on Any Gas Portal Changes'
    ],
    created_at: new Date().toISOString(),
  }
];

export const DEFAULT_PLANS: Plan[] = [
  // Product 1: CDCMS Gas Agency Multi-Tool Suite (PRO)
  {
    id: '6768b255-fb25-4a65-89e7-fb72936ce237',
    product_id: '11111111-1111-1111-1111-111111111111',
    name: '1 Month Starter Plan',
    description: 'Full counter license for 1 workstation valid for 30 days.',
    price: 499,
    billing_period: 'monthly',
    duration_days: 30,
    max_devices: 1,
    is_active: true,
    sort_order: 1,
    features: [
      '1 Counter PC HWID Machine Lock',
      '1-Click Area-Wise Booking Generator',
      'High-Speed Cash Memo Batch Printing',
      'A4 Delivery Run-Sheet System',
      'Smart Booking Auto-Canceller Tool',
      'Standard WhatsApp Support',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-cdcms-3m',
    product_id: '11111111-1111-1111-1111-111111111111',
    name: '3 Months Agency Pass',
    description: 'Quarterly discounted license with route segregation and multi-PC support.',
    price: 1199,
    billing_period: 'quarterly',
    duration_days: 90,
    max_devices: 2,
    is_active: true,
    sort_order: 2,
    features: [
      '2 Counter Workstations Simultaneous',
      '1-Click Area-Wise Booking Generator',
      'A4 Multi-Cashmemo & Run-Sheet System',
      '1-Click All Booking Download & Upload',
      'Quarterly Free Portal Auto-Updates',
      'Priority WhatsApp Support',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-cdcms-6m',
    product_id: '11111111-1111-1111-1111-111111111111',
    name: '6 Months Agency Pro',
    description: 'Most popular 6-month package for busy LPG agency billing counters.',
    price: 1999,
    billing_period: 'semi_annual',
    duration_days: 180,
    max_devices: 2,
    is_active: true,
    sort_order: 3,
    features: [
      '2 Counter Workstations Simultaneous',
      'Continuous Batch Cash Memo Printing',
      'A4 Multi-Cashmemo Paper Saver Engine',
      'Automated Bulk Booking Cancellation',
      '6 Months Portal Updates Guarantee',
      'AnyDesk 1-on-1 Remote Setup Assistance',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-cdcms-year',
    product_id: '11111111-1111-1111-1111-111111111111',
    name: '1 Year Distributor Master',
    description: 'Full year uninterrupted license with maximum savings and priority service.',
    price: 3499,
    billing_period: 'yearly',
    duration_days: 365,
    max_devices: 3,
    is_active: true,
    sort_order: 4,
    features: [
      '3 Counter Workstations Simultaneous',
      'Complete All-in-One LPG Tool Access',
      '1-Click Area Booking & A4 Delivery Sheet',
      '1 Year Guaranteed Free Cloud Updates',
      'VIP Direct Support with RM Rahul',
      'Free Remote AnyDesk Workstation Installation',
    ],
    created_at: new Date().toISOString(),
  },

  // Product 2: HP & Indane Auto Refill & Quick Print Suite
  {
    id: '3226ab84-d41b-4045-9180-b2b23cea67ff',
    product_id: '22222222-2222-2222-2222-222222222222',
    name: '1 Month Starter Plan',
    description: 'High-speed refill booking and A4 print tool for 30 days.',
    price: 499,
    billing_period: 'monthly',
    duration_days: 30,
    max_devices: 1,
    is_active: true,
    sort_order: 1,
    features: [
      '1 Counter Workstation License',
      '1-Click All Booking Download & Upload',
      'A4 Multi-Cashmemo Print Layout',
      'High-Speed Booking Engine',
      '30 Days Cloud Validity',
      'WhatsApp Customer Support',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '87e04157-e491-4397-9801-e4f1d35a2131',
    product_id: '22222222-2222-2222-2222-222222222222',
    name: '3 Months Agency Pass',
    description: '3 months discounted package with area sorting and multi-tab booking.',
    price: 1199,
    billing_period: 'quarterly',
    duration_days: 90,
    max_devices: 2,
    is_active: true,
    sort_order: 2,
    features: [
      '2 Counter Workstations Simultaneous',
      '1-Click Area-Wise Route Sorter',
      'A4 Cash Memo & Delivery Sheet Generator',
      'Anti-Session Expire Keep-Alive Engine',
      '90 Days Free Portal Updates',
      'Priority WhatsApp Assistance',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-refill-6m',
    product_id: '22222222-2222-2222-2222-222222222222',
    name: '6 Months Agency Pro',
    description: 'Half-yearly package for streamlined counter & delivery management.',
    price: 1999,
    billing_period: 'semi_annual',
    duration_days: 180,
    max_devices: 2,
    is_active: true,
    sort_order: 3,
    features: [
      '2 Counter Workstations Simultaneous',
      'Bulk Cash Memo Continuous Auto-Print',
      'Automated Booking Cancellation Workflow',
      'Instant Excel & CSV Data Export/Import',
      '180 Days Continuous Updates',
      'AnyDesk 1-on-1 Remote Setup',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'd3320db1-3528-45ac-81a0-5a7ada4cbc71',
    product_id: '22222222-2222-2222-2222-222222222222',
    name: '1 Year Distributor Master',
    description: 'Annual license with multi-PC access and VIP phone support.',
    price: 3499,
    billing_period: 'yearly',
    duration_days: 365,
    max_devices: 3,
    is_active: true,
    sort_order: 4,
    features: [
      '3 Counter Workstations Simultaneous',
      'Unlimited Bookings & Quick Print Sheets',
      '1-Click Area Booking & Auto-Canceller',
      '1 Year Guaranteed Free Cloud Updates',
      'VIP Phone & WhatsApp Support',
      'Free Remote AnyDesk Training',
    ],
    created_at: new Date().toISOString(),
  },

  // Product 3: Master Gas Distributorship Complete Package
  {
    id: 'plan-master-1m',
    product_id: '33333333-3333-3333-3333-333333333333',
    name: '1 Month Starter Plan',
    description: 'Complete multi-portal master package valid for 30 days across all counters.',
    price: 999,
    billing_period: 'monthly',
    duration_days: 30,
    max_devices: 3,
    is_active: true,
    sort_order: 1,
    features: [
      '3 Counter Workstations Simultaneous',
      'All 3 Portals: Indane, HP Gas, Bharat Gas',
      '1-Click Area Booking & Batch Printing',
      'A4 Cash Memo & Delivery Run-Sheet System',
      'Smart Booking Cancellation Tool',
      'Standard WhatsApp Support',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-master-3m',
    product_id: '33333333-3333-3333-3333-333333333333',
    name: '3 Months Agency Pass',
    description: 'Quarterly master license covering all agency tools and workstations.',
    price: 2499,
    billing_period: 'quarterly',
    duration_days: 90,
    max_devices: 5,
    is_active: true,
    sort_order: 2,
    features: [
      'Up to 5 Counter Workstations',
      'Complete Multi-Tool Suite for All Portals',
      '1-Click Area Booking & Auto-Cancellation',
      'A4 Multi-Cashmemo & Run-Sheet System',
      '90 Days Free Portal Updates',
      'Priority WhatsApp & AnyDesk Assistance',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-master-6m',
    product_id: '33333333-3333-3333-3333-333333333333',
    name: '6 Months Agency Pro',
    description: 'Half-yearly master package with full remote setup and priority updates.',
    price: 4499,
    billing_period: 'semi_annual',
    duration_days: 180,
    max_devices: 5,
    is_active: true,
    sort_order: 3,
    features: [
      'Up to 5 Counter Workstations',
      'All Agency Extensions & Automation Scripts',
      '1-Click All Booking Download & Upload',
      'Full AnyDesk Remote Workstation Setup',
      '180 Days Continuous Cloud Updates',
      'VIP Calling & WhatsApp Support',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '07807098-a975-4bb8-9462-81eb387bcc29',
    product_id: '33333333-3333-3333-3333-333333333333',
    name: '1 Year Distributor Master',
    description: 'Ultimate annual master package covering all counters with VIP support.',
    price: 7999,
    billing_period: 'yearly',
    duration_days: 365,
    max_devices: 5,
    is_active: true,
    sort_order: 4,
    features: [
      '5 Counter Workstations License',
      'All 3 Agency Portals & Future Tools',
      'Complete A4 Cash Memo & Delivery Sheet System',
      'Full Remote AnyDesk Setup on All PCs',
      '1 Year Guaranteed Free Cloud Updates',
      'Direct VIP Calling & WhatsApp with RM Rahul',
    ],
    created_at: new Date().toISOString(),
  },
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
