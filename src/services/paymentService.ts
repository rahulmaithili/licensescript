import { supabase } from '@/lib/supabase';
import type { Plan, Product, Profile, PaymentMethod } from '@/types';
import { generateCryptoRandomKey } from './keyGeneratorService';
import { createInvoice } from './invoiceService';
import { redeemCoupon } from './couponService';

declare global {
  interface Window {
    Razorpay: any;
    Cashfree: any;
  }
}

export interface CheckoutPayload {
  product: Product;
  plan: Plan;
  user: Profile;
  billingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    gst?: string;
  };
  couponCode?: string;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentGateway: PaymentMethod;
}

export async function processPaymentSuccess(payload: CheckoutPayload, paymentId: string): Promise<{
  success: boolean;
  licenseKey: string;
  invoiceNumber: string;
  orderId: string;
}> {
  // 1. Generate unique license key
  const licenseKey = generateCryptoRandomKey({ prefix: 'LW' });

  // 2. Calculate expiry
  const now = new Date();
  const durationDays = payload.plan.duration_days;
  const expiryDate = durationDays >= 3650 
    ? '9999-12-31T23:59:59Z' 
    : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  // 3. Create invoice
  const year = now.getFullYear();
  const invoiceNumber = `INV-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    const { invoice } = await createInvoice({
      invoice_number: invoiceNumber,
      user_id: payload.user.id,
      product_name: payload.product.name,
      plan_name: payload.plan.name,
      amount: payload.plan.price,
      tax_rate: 18,
      tax_amount: payload.taxAmount,
      discount_amount: payload.discountAmount,
      total_amount: payload.totalAmount,
      currency: 'INR',
      payment_status: 'paid',
      payment_method: payload.paymentGateway,
      payment_id: paymentId,
      billing_name: payload.billingDetails.name,
      billing_email: payload.billingDetails.email,
      billing_phone: payload.billingDetails.phone,
      billing_address: payload.billingDetails.address,
      billing_gst: payload.billingDetails.gst,
      issued_at: now.toISOString(),
      paid_at: now.toISOString(),
    });

    // 4. Create license record
    const { error: licenseError } = await supabase.from('licenses').insert([
      {
        license_key: licenseKey,
        customer_id: payload.user.id,
        product_id: payload.product.id,
        plan_id: payload.plan.id,
        invoice_id: invoice?.id || null,
        status: 'active',
        issue_date: now.toISOString(),
        expiry_date: expiryDate,
        max_devices: payload.plan.max_devices || 1,
        is_locked: false,
        priority: 'normal',
        notes: `Purchased via ${payload.paymentGateway.toUpperCase()} (${paymentId})`,
        created_at: now.toISOString(),
      },
    ]);
    if (licenseError) {
      console.error('Payment succeeded but license record failed to save:', licenseError.message);
    }

    // 5. Redeem coupon (best-effort — redeemCoupon never throws, and this
    // guard ensures a coupon failure can never break checkout).
    if (!licenseError && payload.couponCode) {
      try {
        await redeemCoupon(payload.couponCode);
      } catch (redeemErr) {
        console.warn('Coupon redemption failed after payment success:', redeemErr);
      }
    }
  } catch (err) {
    console.error('Payment recording failed:', err);
  }

  return {
    success: true,
    licenseKey,
    invoiceNumber,
    orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
  };
}

export function openRazorpayCheckout(
  payload: CheckoutPayload,
  keyId: string,
  onSuccess: (response: any) => void,
  onFailure: (err: any) => void
) {
  if (!keyId) {
    onFailure(new Error('Razorpay is not configured yet. Add your Razorpay Key ID in Admin → Integrations.'));
    return;
  }
  if (typeof window.Razorpay === 'undefined') {
    // If Razorpay SDK not loaded, dynamically inject it
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => launchRazorpay();
    script.onerror = () => onFailure(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  } else {
    launchRazorpay();
  }

  function launchRazorpay() {
    const options = {
      key: keyId,
      amount: Math.round(payload.totalAmount * 100), // in paise
      currency: 'INR',
      name: 'LicenseWala',
      description: `${payload.product.name} — ${payload.plan.name}`,
      image: payload.product.logo_url || '',
      handler: function (response: any) {
        onSuccess(response);
      },
      prefill: {
        name: payload.billingDetails.name,
        email: payload.billingDetails.email,
        contact: payload.billingDetails.phone,
      },
      notes: {
        product_id: payload.product.id,
        plan_id: payload.plan.id,
      },
      theme: {
        color: '#1E40FF',
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error('Payment window was closed by user'));
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        onFailure(response.error);
      });
      rzp.open();
    } catch (err) {
      onFailure(err);
    }
  }
}

export function openCashfreeCheckout(
  payload: CheckoutPayload,
  appId: string,
  onSuccess: (res: any) => void,
  onFailure: (err: any) => void
) {
  // Cashfree has no live checkout integration yet (it requires a server-side
  // order/session created with the secret key). Never simulate a successful
  // payment — fail honestly so no unpaid order can mint a license.
  void payload;
  void appId;
  void onSuccess;
  onFailure(
    new Error(
      'Cashfree checkout is not live yet. Please pay with Razorpay, or contact support@licensewala.com to complete your order.'
    )
  );
}
