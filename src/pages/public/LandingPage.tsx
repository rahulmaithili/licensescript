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
  Upload,
  IndianRupee,
  Flame,
  Printer,
  FileCheck2,
  Headphones,
  MapPin,
  XCircle,
  FileSpreadsheet,
  FileText,
  Clock,
  Layers,
  CheckCheck,
  Truck,
  Database,
  ArrowDownToLine,
  ArrowUpFromLine,
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

  const coreFeatures = [
    {
      id: 'area-booking',
      title: '1-Click Area-Wise Booking Generator',
      badge: 'Beat & Route Automation',
      icon: MapPin,
      gradient: 'from-orange-500 to-amber-500',
      description:
        'Instantly sort and generate refill bookings grouped by delivery beat, village, or urban ward. Eliminates hours of manual address sorting and gives delivery boys perfectly structured routes in one click.',
      bullets: [
        'Automatic grouping by delivery area & ward',
        'Assigns designated delivery-boy routes instantly',
        'Eliminates manual portal address searching',
      ],
    },
    {
      id: 'cashmemo-print',
      title: 'High-Speed Cash Memo Batch Printing',
      badge: 'Instant 1-Click Print',
      icon: Printer,
      gradient: 'from-blue-600 to-cyan-500',
      description:
        'Print hundreds of cash memos in continuous high-speed batches without opening individual records. Fully compatible with thermal receipt rolls, dot-matrix, and standard desktop laser printers.',
      bullets: [
        '1-Click continuous bulk printing',
        'Thermal, dot-matrix & laser printer ready',
        'Zero portal lag or page reload delays',
      ],
    },
    {
      id: 'booking-canceller',
      title: 'Smart Booking Cancellation Automation Tool',
      badge: 'Batch Auto-Canceller',
      icon: XCircle,
      gradient: 'from-rose-500 to-red-600',
      description:
        'Bulk-cancel duplicate, non-serviceable, or customer-cancelled bookings with a single click. Bypasses tedious multi-step confirmation dialogues on official gas portals and saves 20+ clicks per record.',
      bullets: [
        'Bulk cancellation without repetitive confirmation clicks',
        'Prevents backlog buildup in agency queues',
        'Instant reconciliation of unserviced refills',
      ],
    },
    {
      id: 'download-upload',
      title: '1-Click All Booking Download & Portal Upload',
      badge: 'Instant Portal Sync',
      icon: ArrowDownToLine,
      gradient: 'from-emerald-500 to-teal-600',
      description:
        'One-click download of the complete active refill queue from SDMS, HPCL CMS, or EBharat. Modify statuses offline or batch upload completed delivery confirmation files back into the portal in seconds.',
      bullets: [
        'Instant Excel & CSV data download',
        '1-Click bulk upload for delivery confirmation',
        'Anti-session timeout keep-alive technology',
      ],
    },
    {
      id: 'a4-delivery-sheet',
      title: 'Quick Print Sheet: A4 Cash Memo & Delivery Sheet System',
      badge: '70% Paper Cost Savings',
      icon: FileSpreadsheet,
      gradient: 'from-purple-600 to-indigo-600',
      description:
        'Generate compact multi-up cash memos neatly arranged on standard A4 paper, slashing paper and ribbon expenses. Automatically prints delivery-boy run-sheets complete with customer details and cash collection totals.',
      bullets: [
        'Multi-cashmemo layout on single A4 pages',
        'Organized delivery run-sheets for route drivers',
        'Cash collection summary & cylinder return log',
      ],
    },
    {
      id: 'hardware-lock',
      title: 'Anti-Clone Hardware Machine Lock (HWID)',
      badge: 'Tamper-Proof Security',
      icon: Lock,
      gradient: 'from-amber-600 to-orange-600',
      description:
        'Each agency license is cryptographically bound to your counter computer motherboard and CPU ID. Prevents unauthorized software copying while offering 1-click self-service hardware migration.',
      bullets: [
        'Hardware-level PC binding protection',
        '256-bit encrypted tamper-proof license keys',
        'Self-service counter PC transfer & reset',
      ],
    },
  ];

  const dailyWorkflow = [
    {
      step: '01',
      time: '8:00 AM',
      title: '1-Click Portal Download',
      desc: 'Connect to IndianOil, HP Gas, or Bharat Gas portal and download all pending bookings in 1 click.',
      icon: ArrowDownToLine,
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    },
    {
      step: '02',
      time: '8:15 AM',
      title: 'Area-Wise Refill Generation',
      desc: 'The tool automatically categorizes bookings by delivery areas, beats, and assigned drivers.',
      icon: MapPin,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      step: '03',
      time: '8:30 AM',
      title: 'A4 Cash Memo & Run-Sheet Print',
      desc: 'Batch print multi-up A4 cash memos and route delivery sheets for delivery boys to load vehicles.',
      icon: Printer,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      step: '04',
      time: '6:00 PM',
      title: 'Evening Sync & Auto-Cancellation',
      desc: '1-Click upload completed deliveries and bulk cancel unserviced refills with zero manual entry.',
      icon: CheckCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const faqs = [
    {
      q: 'How does the 1-Click Area-Wise Booking Generator work?',
      a: 'The tool automatically analyzes consumer addresses in your daily booking queue and groups them by pre-configured delivery areas, beats, or wards. With a single click, it prepares organized delivery batches for your drivers without requiring manual Excel filtering.',
    },
    {
      q: 'What is the Quick Print Sheet (A4 Cash Memo & Delivery Sheet System)?',
      a: 'Instead of printing one receipt per slip, the A4 Quick Print engine packs multiple cash memos onto standard A4 sheets, saving up to 70% on thermal paper and stationery costs. It simultaneously generates driver route run-sheets with customer names, mobile numbers, cylinder counts, and exact cash-to-collect totals.',
    },
    {
      q: 'How does the Smart Booking Cancellation Automation Tool save time?',
      a: 'In gas company portals (like SDMS or CMS), cancelling unserviced or duplicate refills usually requires clicking through multiple dialogs and reason dropdowns for each consumer. Our auto-cancellation tool lets you select multiple bookings and cancels them in bulk with one click, saving 30+ clicks per record.',
    },
    {
      q: 'Can I download all bookings to Excel and upload delivery statuses back?',
      a: 'Yes! The 1-Click Download & Upload feature allows you to export all pending or processed bookings into clean Excel/CSV formats. Once delivery is complete, you can upload reconciliation data back to the portal in seconds, maintaining perfect stock and cash synchronization.',
    },
    {
      q: 'Which LPG distributor portals are supported by this suite?',
      a: 'The suite is fully compatible with official distributor portals of IndianOil (Indane SDMS), HP Gas (HPCL CMS / WebPortal), and Bharat Gas (EBharat / BPCL). It runs inside Google Chrome or Microsoft Edge with zero lag.',
    },
    {
      q: 'How fast do I receive my license key after payment?',
      a: 'Instant Key Delivery in under 60 seconds! The moment your payment succeeds via UPI, QR code, debit/credit card, or net banking, your 256-bit cryptographically verified license key is revealed on screen and sent to your email with a GST tax invoice.',
    },
  ];

  const stats = [
    { value: '1,200+', label: 'Active Gas Agencies' },
    { value: '500K+', label: 'Monthly Cash Memos Printed' },
    { value: '70%', label: 'Stationery Cost Saved with A4' },
    { value: '< 60s', label: 'Instant License Delivery' },
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
            1-Click Area Booking, Bulk Cash Memo &{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 bg-clip-text text-transparent">
              A4 Delivery Sheet Automation
            </span>{' '}
            Suite
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The all-in-one daily operational powerhouse for <strong>IndianOil (Indane)</strong>, <strong>HP Gas</strong> & <strong>Bharat Petroleum</strong> distributors. Fast-track <strong>1-Click Area-Wise Booking</strong>, <strong>Batch Cash Memo Auto-Print</strong>, <strong>1-Click Booking Canceller</strong>, <strong>Instant Download & Upload</strong>, and <strong>A4 Multi-Cashmemo Delivery Run-Sheets</strong>.
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
              <span>1-Click Area Booking</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Printer className="w-4 h-4 text-blue-500" />
              <span>A4 Cash Memo & Run-Sheet</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>1-Click Auto-Canceller</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Anti-Clone PC Machine Lock</span>
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

      {/* CORE AUTOMATION CAPABILITIES (USER'S EXACT SUITE FEATURES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-orange-600 dark:text-orange-400 mb-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Built For Real Gas Agency Counter Workflows</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Supercharge Your Agency Operations
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Everything your counter staff and delivery fleet need — from 1-click area segregation and bulk memo printing to automated cancellations and A4 delivery sheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl hover:shadow-2xl hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feat.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 group-hover:text-orange-500 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {feat.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {feat.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DAILY AGENCY WORKFLOW TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/20 mb-3">
              Automated Daily Routine
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              How Your Agency Runs in 4 Automated Steps
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              Save 4+ hours daily for your billing counter and delivery staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dailyWorkflow.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-6 relative flex flex-col justify-between hover:border-orange-500/50 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black font-mono text-slate-500 group-hover:text-orange-400 transition-colors">
                        {item.step}
                      </span>
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {item.time}
                      </span>
                    </div>

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h4 className="font-extrabold text-base text-white mb-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS & EXTENSIONS */}
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
                  <span>A4 Delivery Run-Sheet Generator</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Click Area-Wise Sorter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Batch Booking Auto-Canceller</span>
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
