import { supabase } from '@/lib/supabase';
import { getStoredAccentPalette } from '@/lib/accents';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface BillingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  gst?: string;
}

export interface ServerOrder {
  orderId: string; // Razorpay order id (goes into the widget)
  internalOrderId: string; // our orders-table row id
  keyId: string;
  amount: number; // paise, computed server-side
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number; // ₹ grand total, computed server-side
}

export interface VerifiedPayment {
  licenseKey: string;
  invoiceNumber: string;
  expiryDate: string;
  orderId: string;
  total: number;
}

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Please sign in to complete your purchase.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

/**
 * Ask the server to create the Razorpay order. The server computes the
 * amount from the plan (and validates the coupon) — the client never sets
 * the price. Throws with a user-facing message on any failure.
 */
export async function createRazorpayOrder(input: {
  planId: string;
  couponCode?: string;
  billing: BillingDetails;
}): Promise<ServerOrder> {
  const headers = await authHeaders();
  const res = await fetch('/.netlify/functions/create-razorpay-order', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      plan_id: input.planId,
      coupon_code: input.couponCode || undefined,
      billing: input.billing,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Could not start the payment. Please try again.');
  }
  return {
    orderId: data.order_id,
    internalOrderId: data.internal_order_id,
    keyId: data.key_id,
    amount: data.amount,
    currency: data.currency || 'INR',
    subtotal: data.subtotal,
    discount: data.discount,
    tax: data.tax,
    total: data.total,
  };
}

/**
 * After the Razorpay widget reports success, the SERVER verifies the
 * payment signature and only then issues the license + invoice. The
 * license key returned here is the only one the customer ever sees.
 */
export async function verifyRazorpayPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  billing: BillingDetails;
}): Promise<VerifiedPayment> {
  const headers = await authHeaders();
  const res = await fetch('/.netlify/functions/verify-razorpay-payment', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      razorpay_order_id: input.razorpay_order_id,
      razorpay_payment_id: input.razorpay_payment_id,
      razorpay_signature: input.razorpay_signature,
      billing: input.billing,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Payment could not be verified.');
  }
  return {
    licenseKey: data.license_key,
    invoiceNumber: data.invoice_number,
    expiryDate: data.expiry_date,
    orderId: data.order_id,
    total: data.total,
  };
}

/**
 * Open the Razorpay widget for a SERVER-CREATED order. The widget is bound
 * to the server order id and the server-computed amount — the success
 * handler receives Razorpay's (order_id, payment_id, signature) triple,
 * which must still be verified server-side before anything is issued.
 */
export function openRazorpayCheckout(
  options: {
    keyId: string;
    orderId: string;
    amountPaise: number;
    productName: string;
    planName: string;
    logoUrl?: string;
    billing: BillingDetails;
  },
  onSuccess: (response: any) => void,
  onFailure: (err: any) => void
) {
  if (!options.keyId) {
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
    const rzpOptions = {
      key: options.keyId,
      order_id: options.orderId,
      amount: options.amountPaise, // in paise — server-computed
      currency: 'INR',
      name: 'LicenseWala',
      description: `${options.productName} — ${options.planName}`,
      image: options.logoUrl || '',
      handler: function (response: any) {
        onSuccess(response);
      },
      prefill: {
        name: options.billing.name,
        email: options.billing.email,
        contact: options.billing.phone,
      },
      notes: {
        product_name: options.productName,
        plan_name: options.planName,
      },
      theme: {
        // Resolved at click time from the accent stored by ThemeContext.
        color: getStoredAccentPalette().brand,
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error('Payment window was closed by user'));
        },
      },
    };

    try {
      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', function (response: any) {
        onFailure(response.error);
      });
      rzp.open();
    } catch (err) {
      onFailure(err);
    }
  }
}
