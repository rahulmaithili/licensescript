import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPlanById, validateCoupon } from '@/services/productService';
import { getIntegrationSettings, getSystemSettings } from '@/services/settingsService';
import {
  openRazorpayCheckout,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '@/services/paymentService';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Tag,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CreditCard,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Plan, PaymentMethod, IntegrationSettings, SystemSettings } from '@/types';

export const CheckoutPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationSettings | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Billing Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGst] = useState('');

  // Payment Selection
  const [selectedGateway, setSelectedGateway] = useState<PaymentMethod>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    setIsLoading(true);

    Promise.all([
      getPlanById(planId),
      getIntegrationSettings(),
      getSystemSettings(),
    ]).then(([p, intg, sys]) => {
      setPlan(p);
      setIntegrations(intg);
      setSystemSettings(sys);

      if (intg) {
        if (intg.razorpay_enabled) setSelectedGateway('razorpay');
      }

      setIsLoading(false);
    });
  }, [planId]);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setGst(profile.gst_number || '');
      setAddress(profile.city ? `${profile.city}, ${profile.country || 'India'}` : '');
    } else if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <span className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-(--brand) rounded-full animate-spin" />
          Loading checkout session...
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Plan Not Found</h2>
        <Link to="/pricing" className="inline-block px-5 py-2.5 bg-(--brand) hover:bg-(--brand-hover) text-white rounded-full font-bold transition-colors">
          View Pricing Plans
        </Link>
      </div>
    );
  }

  // Financial Calculations
  const basePrice = plan.price;
  const taxableSubtotal = Math.max(0, basePrice - appliedDiscount);
  const taxRate = systemSettings?.default_tax_rate || 18;
  const taxAmount = (taxableSubtotal * taxRate) / 100;
  const grandTotal = Math.round(taxableSubtotal + taxAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!couponCode.trim()) return;

    const res = await validateCoupon(couponCode, basePrice);
    if (res.valid) {
      setAppliedDiscount(res.discount);
      setCouponSuccess(`Coupon applied! Saved ${formatCurrency(res.discount)}`);
    } else {
      setCouponError(res.message || 'Invalid coupon code');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email) {
      setErrorMsg('Please provide your full name and email address for license issuance.');
      return;
    }

    if (selectedGateway !== 'razorpay') return;

    setIsProcessing(true);

    const billing = { name, email, phone, address, gst };

    // 1. The SERVER creates the Razorpay order — it computes the amount
    // from the plan and validates the coupon. Nothing about the price is
    // trusted from this browser.
    let serverOrder;
    try {
      serverOrder = await createRazorpayOrder({
        planId: plan.id,
        couponCode: appliedDiscount > 0 ? couponCode.trim() : undefined,
        billing,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Could not start the payment. Please try again.');
      return;
    }

    // 2. Open the widget bound to that server order.
    openRazorpayCheckout(
      {
        keyId: serverOrder.keyId || integrations?.razorpay_key_id || '',
        orderId: serverOrder.orderId,
        amountPaise: serverOrder.amount,
        productName: plan.product?.name || 'Software License',
        planName: plan.name,
        logoUrl: (plan.product as any)?.logo_url,
        billing,
      },
      async (response) => {
        // 3. The widget's success is NOT proof of payment — the server
        // verifies the Razorpay signature and only then issues the
        // license + invoice. No key exists anywhere before this passes.
        setIsVerifying(true);
        try {
          const verified = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            billing,
          });
          navigate('/payment-success', {
            state: {
              licenseKey: verified.licenseKey,
              invoiceNumber: verified.invoiceNumber,
              productName: plan.product?.name || 'Software License',
              amount: verified.total,
            },
          });
        } catch (err: any) {
          setIsProcessing(false);
          setIsVerifying(false);
          setErrorMsg(
            'Payment could not be verified. If money was deducted from your account, please contact support on WhatsApp with your payment ID — do not pay again.'
          );
        }
      },
      (error) => {
        setIsProcessing(false);
        setIsVerifying(false);
        setErrorMsg(error.message || 'Razorpay checkout cancelled or failed');
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-(--brand)" />
          Complete Your License Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Instant key generation and automatic GST tax billing on successful checkout.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm text-rose-600 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form: Billing Details & Payment Gateway */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            {/* Billing Information Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-(--brand)" />
                Licensee & Billing Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-(--brand)"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address * (For Key & Invoice)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-(--brand)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-(--brand)"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN / Tax ID (Optional for GST Credit)
                  </label>
                  <input
                    type="text"
                    value={gst}
                    onChange={(e) => setGst(e.target.value.toUpperCase())}
                    placeholder="27AABCL1234D1ZM"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-(--brand)"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Street Address / City
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Office 402, Tech Park, Mumbai"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-(--brand)"
                />
              </div>
            </div>

            {/* Select Gateway Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-(--brand)" />
                Select Payment Method
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {/* Razorpay Option */}
                <div
                  onClick={() => setSelectedGateway('razorpay')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    selectedGateway === 'razorpay'
                      ? 'bg-(--brand-soft) dark:bg-(--brand)/10 border-(--brand) ring-2 ring-(--brand)/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
                    RZ
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      Razorpay Checkout
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      UPI, Cards, Netbanking, Wallets
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-(--brand) hover:bg-(--brand-hover) text-white font-extrabold text-base shadow-xl shadow-(--brand)/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>{isVerifying ? 'Verifying Payment Securely...' : 'Launching Secure Gateway...'}</span>
              ) : (
                <>
                  <span>Pay {formatCurrency(grandTotal)} Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Summary Column */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Order Summary</h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-(--brand) dark:text-(--brand-ink)">
                {plan.product?.name || 'Software Extension'}
              </span>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                {plan.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{plan.max_devices} PC Hardware Lock</span>
                <span>•</span>
                <span>{plan.duration_days >= 3650 ? 'Lifetime' : `${plan.duration_days} Days`}</span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="pt-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon (e.g. WELCOME50)"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  Apply
                </button>
              </form>

              {couponSuccess && (
                <div className="text-[11px] text-emerald-500 font-semibold mt-1.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{couponSuccess}</span>
                </div>
              )}
              {couponError && (
                <div className="text-[11px] text-rose-500 font-semibold mt-1.5">
                  {couponError}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Base License Price</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(basePrice)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(appliedDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST Tax ({taxRate}%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(taxAmount)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
                <span>Total Due</span>
                <span className="text-(--brand) dark:text-(--brand-ink)">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-(--brand-soft)0/10 border border-(--brand)/20 text-xs text-(--brand-hover) dark:text-(--brand-ink) space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant Key Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Your unique license key is generated cryptographically on the confirmation page immediately upon payment verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
