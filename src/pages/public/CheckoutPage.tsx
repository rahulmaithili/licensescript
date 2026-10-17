import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPlanById, validateCoupon } from '@/services/productService';
import { getIntegrationSettings, getSystemSettings } from '@/services/settingsService';
import {
  openRazorpayCheckout,
  openCashfreeCheckout,
  processPaymentSuccess,
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
        else if (intg.cashfree_enabled) setSelectedGateway('cashfree');
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
        <div className="animate-pulse text-slate-400">Loading checkout session...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Plan Not Found</h2>
        <Link to="/pricing" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">
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

    setIsProcessing(true);

    const checkoutPayload = {
      product: plan.product || {
        id: plan.product_id,
        name: 'Software License',
        slug: 'software-license',
        category: 'Extension',
        sort_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      plan,
      user: profile || {
        id: user?.id || `usr-${Date.now()}`,
        email,
        full_name: name,
        phone,
        role: 'customer' as const,
        is_blocked: false,
        created_at: new Date().toISOString(),
      },
      billingDetails: {
        name,
        email,
        phone,
        address,
        gst,
      },
      couponCode: appliedDiscount > 0 ? couponCode : undefined,
      discountAmount: appliedDiscount,
      taxAmount,
      totalAmount: grandTotal,
      paymentGateway: selectedGateway,
    };

    if (selectedGateway === 'razorpay') {
      openRazorpayCheckout(
        checkoutPayload,
        integrations?.razorpay_key_id || 'rzp_test_1DP5mmOlF5G5ag',
        async (response) => {
          const result = await processPaymentSuccess(
            checkoutPayload,
            response.razorpay_payment_id || `pay_${Date.now()}`
          );
          navigate('/payment-success', {
            state: {
              licenseKey: result.licenseKey,
              invoiceNumber: result.invoiceNumber,
              productName: plan.product?.name || 'Software License',
              amount: grandTotal,
            },
          });
        },
        (error) => {
          setIsProcessing(false);
          setErrorMsg(error.message || 'Razorpay checkout cancelled or failed');
        }
      );
    } else if (selectedGateway === 'cashfree') {
      openCashfreeCheckout(
        checkoutPayload,
        integrations?.cashfree_app_id || 'TEST10375628',
        async (response) => {
          const result = await processPaymentSuccess(
            checkoutPayload,
            response.paymentId || `cf_${Date.now()}`
          );
          navigate('/payment-success', {
            state: {
              licenseKey: result.licenseKey,
              invoiceNumber: result.invoiceNumber,
              productName: plan.product?.name || 'Software License',
              amount: grandTotal,
            },
          });
        },
        (error) => {
          setIsProcessing(false);
          setErrorMsg(error.message || 'Cashfree checkout failed');
        }
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-indigo-500" />
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
                <User className="w-4 h-4 text-indigo-500" />
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Select Gateway Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razorpay Option */}
                <div
                  onClick={() => setSelectedGateway('razorpay')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    selectedGateway === 'razorpay'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
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

                {/* Cashfree Option */}
                <div
                  onClick={() => setSelectedGateway('cashfree')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    selectedGateway === 'cashfree'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black">
                    CF
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      Cashfree Payments
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Instant Payment Gateway
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Launching Secure Gateway...</span>
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
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
                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 space-y-2">
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
