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
  Flame,
  Printer,
  FileCheck2,
  Headphones,
  ShieldAlert,
  Clock,
  Award,
} from 'lucide-react';
import { getProducts, getPlans } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Product, Plan } from '@/types';
import {
  IndianOilLogo,
  HpGasLogo,
  BharatGasLogo,
  GasAgencyMasterLogo,
  GasBrandsShowcase,
} from '@/components/GasLogos';

export const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    getProducts().then((p) => setProducts(p));
    getPlans().then((pl) => setPlans(pl));
  }, []);

  const faqs = [
    {
      q: 'Which LPG distributor portals are supported by the software suite?',
      a: 'The suite is fully compatible with official distributor portals of IndianOil (Indane SDMS Portal), HP Gas (HPCL CMS / WebPortal), and Bharat Gas (EBharat / BPCL Portal). It works seamlessly in Google Chrome and Microsoft Edge without any portal lag.',
    },
    {
      q: 'How fast do I receive my license key after payment?',
      a: 'Instant Key Delivery in under 60 seconds! The moment your payment succeeds via UPI, QR code, debit/credit card, or net banking, your 256-bit cryptographically verified license key is revealed on screen and sent to your email with a GST tax invoice.',
    },
    {
      q: 'How does Hardware Device Binding (Anti-Clone Machine Lock) work?',
      a: 'When you activate your license inside your gas agency counter PC browser extension, it securely hashes and binds to that specific motherboard and CPU hardware ID. This prevents unauthorized copying and ensures your agency license remains 100% exclusive to your authorized counter PCs.',
    },
    {
      q: 'What features are included for cash memo printing and refill bookings?',
      a: 'You get 1-Click Fast Bulk Cash Memo Printing, Automated Refill Booking, Ujjwala PMUY 2.0 KYC batch verification, delivery reconciliation, and automated WhatsApp delivery invoice dispatch to customers.',
    },
    {
      q: 'What happens if a gas company portal updates or I change my agency computer?',
      a: 'Our team pushes instant cloud auto-updates at zero additional cost whenever IndianOil, HPCL, or BPCL updates their web portals. If you ever upgrade or replace your agency computer, you can easily perform a device reset from your customer dashboard or get instant 1-on-1 assistance via WhatsApp and AnyDesk.',
    },
  ];

  const stats = [
    { value: '1,200+', label: 'Active Gas Agencies' },
    { value: '500K+', label: 'Monthly Cash Memos Printed' },
    { value: '< 60s', label: 'Instant Key Delivery' },
    { value: '99.98%', label: 'Cloud Uptime Guarantee' },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-8 sm:pt-16 lg:pt-20 pb-16 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-orange-500/20 via-amber-500/20 to-blue-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-orange-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-blue-500/10 border border-orange-500/30 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold mb-6 shadow-sm backdrop-blur-md">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>India's #1 LPG Gas Agency Automation & Licensing Portal</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
              2026 Verified
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.12]">
            Complete Automation Suite for{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 bg-clip-text text-transparent">
              IndianOil, HP Gas & Bharat Gas
            </span>{' '}
            Distributors
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate hours of manual portal work. Experience <strong>1-Click Cash Memo Auto-Printing</strong>, <strong>Bulk Refill Booking</strong>, <strong>Ujjwala PMUY 2.0 KYC</strong>, and automated <strong>Customer WhatsApp Invoices</strong> with hardware-locked security.
          </p>

          {/* Real Logos Showcase Cards */}
          <div className="mt-12">
            <GasBrandsShowcase compact={false} />
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2.5"
            >
              <GasAgencyMasterLogo size={24} />
              <span>Explore Agency Tools & Packages</span>
              <ArrowRight className="w-5 h-5 ml-0.5" />
            </Link>

            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>View Transparent Pricing</span>
            </Link>
          </div>

          {/* Trust Highlights Strip */}
          <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Key Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Hardware PC Binding (Anti-Clone)</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Printer className="w-4 h-4 text-blue-500" />
              <span>1-Click Fast Cash Memo</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Headphones className="w-4 h-4 text-purple-500" />
              <span>AnyDesk 1-on-1 Remote Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS RIBBON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {stats.map((stat, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-4 md:pt-0' : ''}>
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
            Seamless 3-Step Setup
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            Get Your Agency Counter Running in Under 2 Minutes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-orange-500/50 transition-all">
            <span className="text-5xl font-black text-orange-500/20 absolute top-6 right-6 font-mono">01</span>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold mb-6">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Select Your Agency Tool</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose between <strong>CDCMS Pro Multi-Tool</strong>, IndianOil SDMS extension, HP Gas assistant, or the All-in-One Master Bundle.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-blue-500/50 transition-all">
            <span className="text-5xl font-black text-blue-500/20 absolute top-6 right-6 font-mono">02</span>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-6">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Secure UPI / Card Checkout</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Pay securely via Google Pay, PhonePe, Paytm QR, net banking, or debit/credit cards with 256-bit encryption and instant GST invoice.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative shadow-lg hover:border-emerald-500/50 transition-all">
            <span className="text-5xl font-black text-emerald-500/20 absolute top-6 right-6 font-mono">03</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-6">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Key & Counter Lock</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your license key is instantly displayed. Enter it into your counter PC extension to bind to hardware and start lightning-fast operations!
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Tested & Verified Software Packages</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              LPG Gas Agency Tools & Extensions
            </h3>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1.5"
          >
            <span>View All Packages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p, idx) => {
            const productPlans = plans.filter((pl) => pl.product_id === p.id);
            const lowestPrice = productPlans.length > 0 ? Math.min(...productPlans.map((pl) => pl.price)) : 499;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:shadow-2xl hover:border-orange-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <div className="flex items-center -space-x-2">
                          <IndianOilLogo size={36} />
                          <HpGasLogo size={36} />
                          <BharatGasLogo size={36} />
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="flex items-center -space-x-2">
                          <HpGasLogo size={36} />
                          <IndianOilLogo size={36} />
                        </div>
                      )}
                      {idx >= 2 && (
                        <div className="flex items-center -space-x-2">
                          <GasAgencyMasterLogo size={36} />
                          <BharatGasLogo size={34} />
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      {p.category || 'Gas Agency'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xl text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-orange-500 transition-colors">
                    {p.name}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                    {p.short_description || p.description}
                  </p>

                  <div className="space-y-2.5 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {p.features?.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Starts from</span>
                    <div className="font-black text-2xl text-slate-900 dark:text-white">
                      {formatCurrency(lowestPrice)}
                    </div>
                  </div>

                  <Link
                    to={`/products/${p.slug}`}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Get License</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 mb-2">
            <IndianRupee className="w-4 h-4" />
            <span>Transparent Agency Rates</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Distributorship License Plans
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            No hidden costs. 18% GST tax invoice and Input Tax Credit (ITC) generated automatically.
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
                    ? 'bg-gradient-to-b from-orange-950/40 via-slate-900 to-slate-900 border-2 border-orange-500 shadow-2xl shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    Most Popular • Best Value
                  </span>
                )}

                <div>
                  <div className="mb-4">
                    <span className="text-xs font-extrabold uppercase text-orange-600 dark:text-orange-400">
                      {(plan.billing_period || (plan.is_lifetime ? 'lifetime' : 'monthly')).replace('_', ' ')}
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
                    <span className="text-xs text-slate-400 font-medium">
                      / {plan.duration_days >= 3650 ? 'Lifetime' : `${plan.duration_days} days`}
                    </span>
                  </div>

                  <div className="space-y-3 py-6 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-semibold text-orange-600 dark:text-orange-400">
                      <Lock className="w-4 h-4" />
                      <span>{plan.max_devices} Counter PC Hardware Lock</span>
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
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-sm text-center shadow-lg transition-all ${
                    isPopular
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
                      : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  Buy License (Instant Key)
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY CHOOSE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold mb-4 border border-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Trusted LPG Distributorship Partner</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Turn Hours of Cash Memo & Booking Drudgery into Seconds
              </h3>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                No more sluggish server delays, session timeouts, or printing cash memos one-by-one. Our specialized browser extension runs directly on official IndianOil, HPCL, and Bharat Gas distributor portals with zero lag.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Click Bulk Cash Memo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No Portal Ban / Safe Extension</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PMUY Ujjwala 2.0 Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Delivery Receipts</span>
                </div>
              </div>
            </div>

            {/* Official Logos Display Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-6">
              <div className="text-sm font-bold text-slate-300">
                All-in-One Multi-Network LPG Compatibility
              </div>
              <div className="flex items-center justify-center gap-6 sm:gap-8 py-2">
                <div className="flex flex-col items-center gap-2">
                  <IndianOilLogo size={64} className="shadow-lg rounded-2xl" />
                  <span className="text-xs font-extrabold text-orange-400">IndianOil (Indane)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <HpGasLogo size={64} className="shadow-lg rounded-2xl" />
                  <span className="text-xs font-extrabold text-blue-400">HP Gas (HPCL)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BharatGasLogo size={64} className="shadow-lg rounded-2xl" />
                  <span className="text-xs font-extrabold text-amber-400">Bharat Gas (BPCL)</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 max-w-sm">
                As soon as your license activates, the extension automatically hooks into each distributor portal without complex configurations.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400">
            Frequently Asked Questions
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Everything You Need to Know
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
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-base hover:text-orange-600 dark:hover:text-orange-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-orange-500' : ''
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
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-blue-700 p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-extrabold">
              Digitize Your Gas Agency Counter Today!
            </h3>
            <p className="text-sm sm:text-base text-orange-100">
              Complete your checkout in under 60 seconds and receive your active license key instantly.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm shadow-xl hover:bg-orange-50 transition-all hover:scale-105"
              >
                Explore Gas Agency Tools
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 text-white font-bold text-sm border border-white/20 transition-all"
              >
                View Plans & Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
