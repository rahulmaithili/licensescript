import { supabase } from '@/lib/supabase';
import type { Product, Plan, Coupon } from '@/types';

// Default starter products if database has no rows yet
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-whatsapp-pro',
    name: 'WhatsApp Bulk Sender & Filter Extension',
    slug: 'whatsapp-bulk-sender',
    description: 'High-speed WhatsApp marketing extension with multi-account rotation, anti-ban algorithms, smart delay, button sender, and group contact extractor.',
    short_description: 'Automate WhatsApp marketing with anti-ban filters and CSV import.',
    category: 'Browser Extension',
    logo_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=120&h=120&fit=crop',
    version: 'v4.2.0',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 1,
    features: [
      'Chrome Extension (.crx & source)',
      'Multi-device Hardware Binding',
      'Anti-ban delay algorithm',
      'Extract contacts from groups & chats',
      'Custom template personalization',
      'Auto message report in Excel'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-telegram-scraper',
    name: 'Telegram Group Member Scraper & Adder',
    slug: 'telegram-scraper-adder',
    description: 'Scrape active members from rival Telegram groups by last seen date and automatically invite them to your VIP community without flood bans.',
    short_description: 'Scrape and invite active members to your Telegram channels.',
    category: 'Automation Script',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop',
    version: 'v3.1.2',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 2,
    features: [
      'Python / Node.js Standalone Script',
      'Filtered by online status & last seen',
      'Multiple session account rotation',
      'Export to CSV, JSON, TXT',
      'API proxy support'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-justdial-extractor',
    name: 'JustDial & Google Maps B2B Leads Extractor',
    slug: 'b2b-leads-extractor',
    description: '1-click B2B lead generation tool. Scrapes business name, phone number, email, website, ratings, and addresses directly into Excel.',
    short_description: 'Extract verified B2B phone numbers & addresses directly to Excel.',
    category: 'Browser Extension',
    logo_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&h=120&fit=crop',
    version: 'v5.0.1',
    download_url: 'https://github.com/rahulmaithili/licensescript/releases',
    is_active: true,
    sort_order: 3,
    features: [
      'Google Maps + JustDial scraper',
      'Unlimited leads extraction',
      'Phone & Email validator',
      'Instant Excel/CSV export',
      'Lifetime automatic updates'
    ],
    created_at: new Date().toISOString(),
  }
];

export const DEFAULT_PLANS: Plan[] = [
  // WhatsApp Bulk Sender Plans
  {
    id: 'plan-wa-1m',
    product_id: 'prod-whatsapp-pro',
    name: 'Starter (1 Month)',
    description: 'Perfect for small business campaigns and testing.',
    price: 499,
    billing_period: 'monthly',
    duration_days: 30,
    max_devices: 1,
    is_active: true,
    sort_order: 1,
    features: ['1 Device activation', 'All core features', '30 Days validity', 'Community support'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-wa-6m',
    product_id: 'prod-whatsapp-pro',
    name: 'Professional (6 Months)',
    description: 'Best value for marketing agencies & active sellers.',
    price: 1999,
    billing_period: 'semi_annual',
    duration_days: 180,
    max_devices: 2,
    is_active: true,
    sort_order: 2,
    features: ['2 Devices simultaneous', 'Priority Anti-Ban protection', '6 Months validity', 'Priority WhatsApp support'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-wa-life',
    product_id: 'prod-whatsapp-pro',
    name: 'Agency Lifetime',
    description: 'Never pay again! Unlimited updates and top-tier support.',
    price: 3999,
    billing_period: 'lifetime',
    duration_days: 36500, // lifetime
    max_devices: 5,
    is_active: true,
    sort_order: 3,
    features: ['5 Devices activation', 'Lifetime updates included', 'No monthly renewal', 'VIP 1-on-1 AnyDesk setup'],
    created_at: new Date().toISOString(),
  },
  // Telegram Scraper Plans
  {
    id: 'plan-tg-1m',
    product_id: 'prod-telegram-scraper',
    name: 'Monthly License',
    description: 'Full scraper + adder access for 30 days.',
    price: 799,
    billing_period: 'monthly',
    duration_days: 30,
    max_devices: 1,
    is_active: true,
    sort_order: 1,
    features: ['1 PC license', 'Multi-account support', '30 Days validity'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-tg-year',
    product_id: 'prod-telegram-scraper',
    name: 'Annual VIP',
    description: '1 full year of scraping and automated community building.',
    price: 2499,
    billing_period: 'yearly',
    duration_days: 365,
    max_devices: 3,
    is_active: true,
    sort_order: 2,
    features: ['3 PC licenses', 'Proxy manager', '1 Year updates', 'Private group access'],
    created_at: new Date().toISOString(),
  },
  // B2B Leads Extractor Plans
  {
    id: 'plan-b2b-1m',
    product_id: 'prod-justdial-extractor',
    name: '1 Month Access',
    description: 'Unlimited extraction from Google Maps & JustDial.',
    price: 599,
    billing_period: 'monthly',
    duration_days: 30,
    max_devices: 1,
    is_active: true,
    sort_order: 1,
    features: ['1 PC license', 'Unlimited export to Excel', '30 Days validity'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-b2b-life',
    product_id: 'prod-justdial-extractor',
    name: 'Lifetime License',
    description: 'One-time payment for lifetime lead extraction.',
    price: 2999,
    billing_period: 'lifetime',
    duration_days: 36500,
    max_devices: 3,
    is_active: true,
    sort_order: 2,
    features: ['3 PC licenses', 'Lifetime updates', 'Never expires', 'High-speed multi-threading'],
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
    return data.map((p: any) => ({
      ...p,
      sort_order: p.display_order ?? p.sort_order ?? 1,
    })) as Plan[];
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
    return {
      ...(data as any),
      sort_order: (data as any).display_order ?? (data as any).sort_order ?? 1,
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
