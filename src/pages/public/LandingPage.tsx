import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Check,
  Star,
  Download,
  IndianRupee,
} from 'lucide-react';
import { getProducts, getPlans } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Product, Plan } from '@/types';

export const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    getProducts().then((p) => setProducts(p));
    getPlans().then((pl) => setPlans(pl));
  }, []);

  const faqs = [
    {
      q: 'How quickly do I receive my license key after payment?',
      a: 'Instantly! As soon as your Razorpay or Cashfree transaction completes, our cryptographic engine generates your unique key on screen and emails your activation certificate & tax invoice immediately.',
    },
    {
      q: 'How does Hardware Device Binding work?',
      a: 'When you paste your key into our extension or script, it binds to your machine fingerprint. This stops unauthorized account sharing and protects your license. You can reset activations from your customer portal anytime.',
    },
    {
      q: 'What payment modes are supported?',
      a: 'We accept all Indian UPI apps (Google Pay, PhonePe, Paytm, BHIM), all Debit & Credit cards (Visa, MasterCard, RuPay), Netbanking across 50+ banks, and Cashfree checkout.',
    },
    {
      q: 'Do you provide software updates and support?',
      a: 'Yes! All plans include automatic software updates to combat third-party API changes, anti-ban protection algorithms, and direct WhatsApp / AnyDesk priority support.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 pb-16 overflow-hidden">
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Next-Gen Software Licensing & Extension Protection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Monetize & License Your{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
              Browser Extensions
            </span>{' '}
            with Zero Friction.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The complete automated licensing engine for Chrome extensions, Python scripts, and desktop tools. Instant Razorpay & Cashfree checkout, hardware binding, and renewal billing.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Explore Software Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-base hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>View Pricing Plans</span>
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-center gap-2 font-medium">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Key Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-medium">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Hardware Anti-Cloning</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Razorpay & Cashfree</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-medium">
              <RefreshCw className="w-4 h-4 text-purple-500" />
              <span>1-Click Auto Renewals</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
            Effortless Flow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            Get Up & Running in 3 Steps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-indigo-500/50 transition-all">
            <span className="text-5xl font-black text-indigo-500/20 absolute top-6 right-6 font-mono">01</span>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Choose Extension & Plan</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Select from WhatsApp bulk automation, Telegram group scraper, or B2B lead extractor tailored to your scale.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-indigo-500/50 transition-all">
            <span className="text-5xl font-black text-indigo-500/20 absolute top-6 right-6 font-mono">02</span>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-6">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Secure Online Payment</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Pay in seconds using Razorpay or Cashfree. Zero delays, full GST invoice generated on receipt.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-indigo-500/50 transition-all">
            <span className="text-5xl font-black text-indigo-500/20 absolute top-6 right-6 font-mono">03</span>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-6">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Key & Activation</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your license key appears immediately. Paste it in your extension, bind your PC, and start automating!
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED EXTENSIONS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
              Tested & Verified
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              Popular Software Extensions
            </h3>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
          >
            <span>View All Extensions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p) => {
            const productPlans = plans.filter((pl) => pl.product_id === p.id);
            const lowestPrice = productPlans.length > 0 ? Math.min(...productPlans.map((pl) => pl.price)) : 499;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={p.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop'}
                      alt={p.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {p.category}
                      </span>
                      <h4 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                        {p.name}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                    {p.short_description || p.description}
                  </p>

                  <div className="space-y-2 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    {p.features?.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Starts from</span>
                    <div className="font-black text-xl text-slate-900 dark:text-white">
                      {formatCurrency(lowestPrice)}
                    </div>
                  </div>

                  <Link
                    to={`/products/${p.slug}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Get License
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
            Transparent Pricing
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            Plans for Individuals & Scaling Agencies
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            No hidden charges. 18% GST invoice automatically provided with input tax credit credit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.slice(0, 3).map((plan, index) => {
            const isPopular = index === 1;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                  isPopular
                    ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {plan.billing_period.replace('_', ' ')}
                    </span>
                    <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 my-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {plan.duration_days >= 3650 ? 'Lifetime' : `${plan.duration_days}d`}
                    </span>
                  </div>

                  <div className="space-y-3 py-6 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
                      <Lock className="w-4 h-4" />
                      <span>{plan.max_devices} PC Hardware Lock</span>
                    </div>
                    {plan.features?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/checkout/${plan.id}`}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm text-center shadow-lg transition-all ${
                    isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  Buy License Now
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
            Got Questions?
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-base hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-extrabold">
              Ready to Upgrade Your Marketing?
            </h3>
            <p className="text-sm sm:text-base text-indigo-200">
              Get an instant license key delivered directly to your screen in under 60 seconds.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="px-8 py-3.5 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm shadow-xl hover:bg-indigo-50 transition-all hover:scale-105"
              >
                Browse Software Catalog
              </Link>
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-sm border border-indigo-400/30 transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
