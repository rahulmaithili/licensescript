import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  Check,
  Flame,
  Printer,
  MapPin,
  XCircle,
  ArrowDownToLine,
  FileSpreadsheet,
  Clock,
  IndianRupee,
  CheckCheck,
  Building2,
  CreditCard,
  Plus,
} from 'lucide-react';
import { ServicesShowcase } from '@/components/ServicesShowcase';
import { getProducts, getPlans } from '@/services/productService';
import { formatCurrency, getPlanDisplay } from '@/lib/utils';
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
  const [selectedPricingProductId, setSelectedPricingProductId] = useState<string>('11111111-1111-1111-1111-111111111111');

  useEffect(() => {
    getProducts().then((p) => {
      setProducts(p);
      if (p.length > 0) {
        setSelectedPricingProductId(p[0].id);
      }
    });
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
      gradient: 'from-purple-600 to-blue-600',
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

  const partners = [
    { name: 'IndianOil', img: '/images/logos/indianoil.jpg', icon: null },
    { name: 'HP Gas', img: '/images/logos/hp-gas.png', icon: null },
    { name: 'Bharat Petroleum', img: '/images/logos/bharat-petroleum.png', icon: null },
    { name: 'Razorpay', img: null, icon: CreditCard },
  ];

  const pastelChips = [
    'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  ];

  const avatarPeople = [
    { initials: 'RS', bg: 'bg-blue-500' },
    { initials: 'PK', bg: 'bg-emerald-500' },
    { initials: 'AM', bg: 'bg-amber-500' },
    { initials: 'DV', bg: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-20 sm:space-y-24 pb-20">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* grid pattern + ambient glows */}
        <div className="absolute inset-0 grid-pattern [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)] pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-[420px] h-[420px] bg-(--brand)/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-48 right-[10%] w-[300px] h-[300px] bg-(--brand)/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-10 sm:pt-16 lg:pt-20 pb-14">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-8 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <div className="pill-badge mb-6">
                <Flame className="w-3.5 h-3.5" />
                <span>India&apos;s #1 LPG Gas Agency Automation</span>
              </div>

              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                Book. Print. Deliver.{' '}
                <span className="text-gradient-brand">All in One Click.</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The premium automation suite crafted exclusively for <strong>IndianOil</strong>, <strong>HP Gas</strong> &amp; <strong>Bharat Petroleum</strong> distributors. Area-wise bookings, batch cash memos, A4 delivery run-sheets and bulk cancellations — your entire day&apos;s counter work, finished in minutes.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                <Link to="/products" className="btn-brand w-full sm:w-auto">
                  <span>Get Started Free</span>
                  <span className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link
                  to="/pricing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-sm hover:border-(--brand)/50 hover:text-(--brand) dark:hover:text-(--brand-ink) transition-all shadow-sm"
                >
                  View Pricing
                </Link>
              </div>

              {/* Avatar cluster + social proof */}
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
                <div className="flex -space-x-2.5">
                  {avatarPeople.map((a) => (
                    <span
                      key={a.initials}
                      className={`w-9 h-9 rounded-full ${a.bg} text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-950`}
                    >
                      {a.initials}
                    </span>
                  ))}
                  <span className="w-9 h-9 rounded-full bg-(--brand) text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-950">
                    1.2k
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 text-left">
                  Trusted by <strong className="text-slate-900 dark:text-white">1,200+</strong> gas agencies
                </p>
              </div>

              {/* Feature chips */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {[
                  '1-Click Area-Wise Booking',
                  'Bulk Cash Memo Print',
                  'A4 Delivery Run-Sheets',
                  '1-Click Booking Canceller',
                  'Instant Download & Upload',
                ].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--brand-soft) dark:bg-(--brand)/10 border border-(--brand)/15 dark:border-(--brand)/25 text-(--brand) dark:text-(--brand-ink) text-xs font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: floating license-key mockup */}
            <div className="relative flex justify-center lg:justify-end px-4">
              <span className="plus-decor absolute top-0 left-6 sm:left-14" aria-hidden="true" />
              <span className="plus-decor absolute bottom-6 left-0 sm:left-8" aria-hidden="true" />
              <Plus className="absolute top-10 right-2 sm:right-10 w-6 h-6 text-(--brand)/30 dark:text-(--brand-ink)/30" aria-hidden="true" />

              <div className="relative">
                <div className="float-y card-premium shadow-brand p-6 sm:p-7 w-[320px] lg:w-[300px] xl:w-[360px] relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-(--brand)/10 dark:bg-(--brand)/20 flex items-center justify-center">
                      <KeyRound className="w-6 h-6 text-(--brand) dark:text-(--brand-ink)" />
                    </div>
                    <span className="pill-badge">28 days left</span>
                  </div>
                  <div className="mt-5">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      License Key
                    </div>
                    <div className="mt-1.5 font-mono text-2xl font-bold tracking-wider text-slate-900 dark:text-white">
                      LW-7X2K-9QPD
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Verified
                    </span>
                    <span className="text-xs font-semibold text-slate-400">HWID locked</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-(--brand) to-(--brand-hover)" />
                  </div>
                </div>

                {/* Floating stat chips */}
                <div className="float-y-slow hidden sm:flex absolute -left-6 xl:-left-24 top-6 card-premium shadow-brand px-4 py-3 items-center gap-2.5 z-20">
                  <span className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-900 dark:text-white leading-none">70% saved</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">stationery cost</span>
                  </span>
                </div>
                <div className="float-y hidden sm:flex absolute -right-4 xl:-right-6 bottom-8 card-premium shadow-brand px-4 py-3 items-center gap-2.5 z-20">
                  <span className="w-9 h-9 rounded-full bg-(--brand)/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-(--brand) dark:text-(--brand-ink)" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-900 dark:text-white leading-none">{'<60s'}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">key delivery</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Brand logos showcase */}
          <div className="mt-14">
            <GasBrandsShowcase compact={false} />
          </div>
        </div>
      </section>

      {/* ============ PARTNER BAND ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] bg-gradient-to-br from-(--brand) to-(--brand-hover) overflow-hidden py-14 sm:py-16 shadow-brand">
          {/* giant outlined background text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
            <span className="outline-text text-[24vw] lg:text-[10.5rem] font-black tracking-tight whitespace-nowrap leading-none">
              AUTOMATION
            </span>
          </div>
          <div className="relative z-10 text-center px-6">
            <p className="text-white/95 text-lg sm:text-2xl font-bold max-w-2xl mx-auto leading-snug">
              Partnering with top tiers to revolutionize agency services
            </p>
            <div className="mt-9 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="marquee-track">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex items-center gap-12 pr-12" aria-hidden={copy === 1}>
                    {partners.map((partner) => {
                      const Icon = partner.icon;
                      return (
                        <span
                          key={partner.name}
                          className="flex items-center gap-2.5 text-white/90 font-bold text-lg whitespace-nowrap"
                        >
                          {partner.img ? (
                            <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              <img src={partner.img} alt={partner.name} className="w-full h-full object-contain p-0.5" />
                            </span>
                          ) : Icon ? (
                            <Icon className="w-5 h-5" />
                          ) : null}
                          {partner.name}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="card-premium shadow-brand p-6 sm:p-8 text-center hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="text-3xl sm:text-4xl font-black text-gradient-brand">
                {stat.value}
              </div>
              <div className="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="pill-badge mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Experience the Future of <span className="text-gradient-brand">Agency Automation</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Everything your counter staff and delivery fleet need — from 1-click area segregation and bulk memo printing to automated cancellations and A4 delivery sheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, fi) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="card-premium group p-7 sm:p-8 shadow-brand hover:-translate-y-1.5 hover:border-(--brand)/40 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${pastelChips[fi % pastelChips.length]} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="pill-badge">{feat.badge}</span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 group-hover:text-(--brand) dark:group-hover:text-(--brand-ink) transition-colors">
                  {feat.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {feat.description}
                </p>

                <div className="mt-auto space-y-2.5 pt-5 border-t border-slate-100 dark:border-slate-800">
                  {feat.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ DAILY WORKFLOW ============ */}
      <section id="how-it-works" className="bg-(--brand-soft) dark:bg-[#0A1330] py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="pill-badge mb-4">
              <Clock className="w-3.5 h-3.5" />
              Automated Daily Routine
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              How Your Agency Runs in 4 Automated Steps
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Save 4+ hours daily for your billing counter and delivery staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dailyWorkflow.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="card-premium p-6 shadow-brand hover:-translate-y-1 hover:border-(--brand)/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black font-mono text-slate-300 dark:text-slate-600 group-hover:text-(--brand) transition-colors">
                      {item.step}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-(--brand)/10 text-(--brand) dark:text-(--brand-ink) text-[11px] font-extrabold font-mono border border-(--brand)/20">
                      {item.time}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ PRODUCTS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="pill-badge mb-3">
              <Flame className="w-3.5 h-3.5" />
              Tested &amp; Verified Software Packages
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              LPG Gas Agency Tools &amp; Extensions
            </h3>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-(--brand) dark:text-(--brand-ink) hover:underline flex items-center gap-1.5 shrink-0"
          >
            <span>View All Packages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p, idx) => {
            const productPlans = plans.filter((pl) => pl.product_id === p.id);
            const lowestPrice = productPlans.length > 0 ? Math.min(...productPlans.map((pl) => pl.price)) : 499;

            return (
              <div
                key={p.id}
                className="card-premium p-6 sm:p-7 shadow-brand flex flex-col hover:-translate-y-1.5 hover:border-(--brand)/50 hover:shadow-[0_24px_50px_-18px_rgba(var(--brand-rgb),0.4)] transition-all duration-300 group"
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
                    <span className="pill-badge">{p.category || 'Gas Agency'}</span>
                  </div>

                  <h4 className="font-extrabold text-xl text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-(--brand) dark:group-hover:text-(--brand-ink) transition-colors">
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

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Starts from</span>
                    <div className="font-black text-2xl text-slate-900 dark:text-white">
                      {formatCurrency(lowestPrice)}
                    </div>
                  </div>

                  <Link
                    to={`/products/${p.slug}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white font-extrabold text-xs shadow-[0_10px_25px_-8px_rgba(var(--brand-rgb),0.5)] transition-all hover:-translate-y-0.5"
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

      {/* ============ PRICING ============ */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="pill-badge mb-3">
            <IndianRupee className="w-3.5 h-3.5" />
            Transparent Distributorship Rates
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Choose Your Agency Plan
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
            Flexible plans for every product — monthly, quarterly, annual and even lifetime options. Instant key delivery with GST invoice on every plan.
          </p>

          {/* Product switcher pill tabs */}
          <div className="pt-7 flex items-center justify-center gap-2 flex-wrap">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPricingProductId(p.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedPricingProductId === p.id
                    ? 'bg-(--brand) text-white shadow-[0_10px_25px_-8px_rgba(var(--brand-rgb),0.55)]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-(--brand)/40 hover:text-(--brand) dark:hover:text-(--brand-ink)'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Plans of the selected product only, sorted by duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans
            .filter((p) => p.product_id === selectedPricingProductId)
            .sort((a, b) => a.duration_days - b.duration_days)
            .slice(0, 4)
            .map((plan) => {
            const d = getPlanDisplay(plan);
            const isPopular = d.isPopular;
            const isYearly = d.isYearly;
            const isLifetime = d.isLifetime;
            const periodLabel = d.periodLabel;

            return (
              <div
                key={plan.id}
                className={`rounded-[28px] p-6 sm:p-7 flex flex-col transition-all hover:-translate-y-1 relative ${
                  isPopular
                    ? 'bg-white dark:bg-slate-900 border-2 border-(--brand) shadow-[0_24px_50px_-16px_rgba(var(--brand-rgb),0.45)]'
                    : isLifetime
                    ? 'bg-white dark:bg-slate-900 border-2 border-violet-500/60 shadow-brand'
                    : isYearly
                    ? 'bg-white dark:bg-slate-900 border-2 border-sky-400/60 shadow-brand'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-brand'
                }`}
              >
                {d.badge && (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap ${
                      isLifetime
                        ? 'bg-gradient-to-r from-violet-600 to-purple-500'
                        : isPopular
                        ? 'bg-(--brand)'
                        : 'bg-sky-500'
                    }`}
                  >
                    {d.badge}
                    {isPopular || isYearly ? ` (${periodLabel})` : ''}
                  </span>
                )}

                <div>
                  <div className="mb-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-(--brand) dark:text-(--brand-ink)">
                      {periodLabel} Plan
                    </span>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 my-5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / {d.priceSuffix}
                    </span>
                  </div>

                  <div className="space-y-2.5 py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-semibold text-(--brand) dark:text-(--brand-ink)">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>{plan.max_devices} Counter PC Lock</span>
                    </div>
                    {plan.features?.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/checkout/${plan.id}`}
                  className={`w-full mt-6 py-3 rounded-full font-extrabold text-xs text-center transition-all ${
                    isPopular
                      ? 'bg-(--brand) hover:bg-(--brand-hover) text-white shadow-[0_14px_30px_-10px_rgba(var(--brand-rgb),0.6)]'
                      : isLifetime
                      ? 'bg-violet-600 hover:bg-violet-700 text-white'
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

      {/* ============ TOOLS & SERVICES SHOWCASE ============ */}
      <ServicesShowcase />

      {/* ============ WHY CHOOSE BANNER ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] bg-gradient-to-br from-(--brand) via-(--brand) to-(--brand-hover) p-8 sm:p-12 shadow-brand overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold border border-white/25 mb-5">
                <Flame className="w-4 h-4" />
                Trusted LPG Distributorship Partner
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                Turn Hours of Cash Memo &amp; Booking Drudgery into Seconds
              </h3>
              <p className="mt-4 text-sm sm:text-base text-blue-100 leading-relaxed">
                No more sluggish server delays, session timeouts, or printing cash memos one-by-one. Our specialized browser extension runs directly on official IndianOil, HPCL, and Bharat Gas distributor portals with zero lag.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3.5 text-sm font-semibold text-white">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span>1-Click Bulk Cash Memo</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span>A4 Delivery Run-Sheet Generator</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span>1-Click Area-Wise Sorter</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span>Batch Booking Auto-Canceller</span>
                </div>
              </div>
            </div>

            {/* Official logos display card */}
            <div className="rounded-[24px] bg-white/10 border border-white/20 backdrop-blur-sm p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-6">
              <div className="text-sm font-bold text-white">
                All-in-One Multi-Network LPG Compatibility
              </div>
              <div className="flex items-center justify-center gap-6 sm:gap-8 py-2">
                <div className="flex flex-col items-center gap-2">
                  <IndianOilLogo size={64} className="shadow-lg rounded-2xl" />
                  <span className="text-xs font-extrabold text-white">IndianOil (Indane)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <HpGasLogo size={64} className="shadow-lg rounded-2xl" />
                  <span className="text-xs font-extrabold text-white">HP Gas (HPCL)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BharatGasLogo size={64} className="shadow-lg rounded-2xl" />
                  <span className="text-xs font-extrabold text-white">Bharat Gas (BPCL)</span>
                </div>
              </div>
              <div className="text-xs text-blue-100 max-w-sm">
                As soon as your license activates, the extension automatically hooks into each distributor portal without complex configurations.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="pill-badge mb-3">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                key={index}
                className={`card-premium overflow-hidden transition-all ${
                  isOpen ? 'border-(--brand)/40 shadow-brand' : 'hover:border-(--brand)/30'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-base hover:text-(--brand) dark:hover:text-(--brand-ink) transition-colors"
                >
                  <span>{faq.q}</span>
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isOpen
                        ? 'bg-(--brand) border-(--brand) text-white rotate-180'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] bg-gradient-to-br from-(--brand) to-(--brand-hover) p-8 sm:p-14 text-center text-white overflow-hidden shadow-brand">
          <div className="absolute -top-20 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <span className="plus-decor absolute top-8 left-10" style={{ color: 'rgba(255,255,255,0.4)' }} aria-hidden="true" />
          <span className="plus-decor absolute bottom-10 right-12" style={{ color: 'rgba(255,255,255,0.4)' }} aria-hidden="true" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight">
              Digitize Your Gas Agency Counter Today!
            </h3>
            <p className="mt-4 text-sm sm:text-base text-blue-100">
              Complete your checkout in under 60 seconds and receive your active license key instantly.
            </p>
            <div className="pt-7 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-(--brand) font-extrabold text-sm shadow-xl hover:bg-blue-50 transition-all hover:-translate-y-0.5"
              >
                <span>Explore Gas Agency Tools</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-white/40 text-white font-bold text-sm hover:bg-white/10 transition-all"
              >
                View Plans &amp; Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
