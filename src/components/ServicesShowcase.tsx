import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Printer,
  XCircle,
  Truck,
  EyeOff,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

/* Lightweight scroll-reveal wrapper (IntersectionObserver, no libraries) */
const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out will-change-transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
};

const WHATSAPP_LINK = 'https://wa.me/917564948617';

const toolCards = [
  {
    id: 'cash-memo-tool',
    title: 'Pending Booking Cash Memo Tool',
    badge: '1-Click Print Ready',
    icon: Printer,
    chip: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    glow: 'group-hover:shadow-[0_28px_55px_-20px_rgba(var(--brand-rgb),0.45)]',
    description:
      'Your counter starts every morning with a pile of pending bookings. This tool pulls them straight from your agency system in a single click and generates clean, area-wise cash memos — ready to print and hand over to your delivery team. No manual sorting, no copy-paste, no waiting.',
    bullets: [
      'One-click cash memo generation',
      'Area-wise sorted output',
      'Print-ready memo format',
      'Handles bulk pending bookings with ease',
    ],
  },
  {
    id: 'auto-canceller-tool',
    title: 'Auto Booking Cancellation Tool',
    badge: 'Bulk Auto-Cancel',
    icon: XCircle,
    chip: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    glow: 'group-hover:shadow-[0_28px_55px_-20px_rgba(244,63,94,0.4)]',
    description:
      'Cancelling bookings one by one on the portal eats up hours of counter time. Just give this tool an Excel sheet or a simple list of the bookings to cancel — it cancels every single one automatically in the background, so your staff never has to repeat the same clicks again.',
    bullets: [
      'Cancel from an Excel sheet or a simple list',
      'Fully automatic bulk cancellation',
      'Saves hours of manual portal work',
      'Error-free, verified processing',
    ],
  },
  {
    id: 'delivery-sheet-maker',
    title: 'Vendor Delivery Sheet Maker',
    badge: 'Hindi Translation Built-In',
    icon: Truck,
    chip: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    glow: 'group-hover:shadow-[0_28px_55px_-20px_rgba(16,185,129,0.4)]',
    description:
      'Download your pending bookings to Excel, feed the file to this tool, and get a perfectly formatted, ready-to-print delivery sheet grouped by vendor and area. Customer names and addresses are translated into Hindi automatically — plus many more smart functions working under the hood.',
    bullets: [
      'Ready-to-print delivery sheets',
      'Vendor & area-wise grouping',
      'Built-in Hindi translation system',
      'Many more smart functions included',
    ],
  },
];

const customServices = [
  {
    id: 'custom-private-tools',
    title: 'Custom Private Tools',
    icon: EyeOff,
    tag: 'Private • On Request',
    description:
      'Some agency workflows are unique — and some tools are best kept private. We design and build hidden, custom tools exclusively for your agency\u2019s software, shaped around your exact requirement and shared with no one else.',
    cta: 'Discuss Your Requirement',
  },
  {
    id: 'custom-excel-design',
    title: 'Custom Excel Sheet Designing',
    icon: FileSpreadsheet,
    tag: 'Custom • On Request',
    description:
      'Need a specially designed Excel sheet for billing, stock, delivery tracking or any other custom agency work? We craft clean, professional, ready-to-use Excel sheets and templates designed precisely around the way your agency works.',
    cta: 'Contact for Custom Work',
  },
];

export const ServicesShowcase: React.FC = () => {
  return (
    <section id="services" className="relative overflow-x-clip max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
      {/* ambient glows */}
      <div className="absolute top-10 -left-24 w-[320px] h-[320px] bg-(--brand)/10 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute bottom-24 -right-24 w-[320px] h-[320px] bg-(--brand)/10 blur-[110px] rounded-full pointer-events-none" />

      {/* ============ HEADING ============ */}
      <Reveal className="relative text-center max-w-3xl mx-auto mb-14">
        <span className="pill-badge mb-4">
          <Wrench className="w-3.5 h-3.5" />
          Tools &amp; Services
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Specialist <span className="text-gradient-brand">Tools &amp; Services</span> We Provide
        </h2>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Real, working tools built for IndianOil, HP Gas and Bharat Petroleum agency counters —
          from one-click cash memos and bulk cancellations to fully private, custom-built software.
        </p>
      </Reveal>

      {/* ============ PRIMARY TOOL CARDS ============ */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolCards.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <Reveal key={tool.id} delay={idx * 120} className="h-full">
              <div
                className={`card-premium group relative overflow-hidden p-7 sm:p-8 shadow-brand h-full flex flex-col hover:-translate-y-1.5 hover:border-(--brand)/40 transition-all duration-300 ${tool.glow}`}
              >
                {/* gradient top accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-(--brand) via-(--brand-mid) to-(--brand-hover) opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* soft hover glow */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-(--brand)/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative flex items-start justify-between gap-3 mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${tool.chip} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="pill-badge">{tool.badge}</span>
                </div>

                <h3 className="relative text-xl font-extrabold text-slate-900 dark:text-white mb-3 group-hover:text-(--brand) dark:group-hover:text-(--brand-ink) transition-colors">
                  {tool.title}
                </h3>

                <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {tool.description}
                </p>

                <div className="relative mt-auto space-y-2.5 pt-5 border-t border-slate-100 dark:border-slate-800">
                  {tool.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/products"
                  className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-(--brand) dark:text-(--brand-ink) hover:gap-2.5 transition-all"
                >
                  <span>Explore Software Suites</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* ============ CUSTOM SERVICES BANNER ============ */}
      <Reveal delay={120} className="relative mt-8">
        <div className="relative rounded-[28px] bg-gradient-to-br from-(--brand) via-(--brand) to-(--brand-hover) p-8 sm:p-12 shadow-brand overflow-hidden">
          {/* giant outlined background text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
            <span className="outline-text text-[22vw] lg:text-[9rem] font-black tracking-tight whitespace-nowrap leading-none">
              CUSTOM
            </span>
          </div>
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold border border-white/25 mb-5">
                <Sparkles className="w-4 h-4" />
                Made-to-Order Services
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                Need Something Built Just for Your Agency?
              </h3>
              <p className="mt-4 text-sm sm:text-base text-blue-100 leading-relaxed">
                Beyond our standard suites, we also take up exclusive custom work for gas agencies.
                Pricing is shared on request — tell us what you need, and we will design it for you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.id}
                    className="rounded-[24px] bg-white/10 border border-white/20 backdrop-blur-sm p-6 sm:p-8 flex flex-col hover:bg-white/[0.14] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap">
                        {service.tag}
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
                      {service.title}
                    </h4>

                    <p className="text-sm text-blue-100 leading-relaxed mb-7">
                      {service.description}
                    </p>

                    <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-3">
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-(--brand) font-extrabold text-sm shadow-xl hover:bg-blue-50 transition-all hover:-translate-y-0.5"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{service.cta}</span>
                      </a>
                      <span className="text-xs font-semibold text-blue-100 text-center sm:text-left">
                        Prices on request — chat with us
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
