import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, type LucideIcon } from 'lucide-react';

interface LegalShellProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}

/**
 * Shared premium shell for the public legal pages (Privacy, Terms, Refund).
 * Matches the public-page treatment: ambient brand glow, pill badge,
 * readable prose width and a dual-mode content card.
 */
export const LegalShell: React.FC<LegalShellProps> = ({ icon: Icon, badge, title, intro, children }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[240px] bg-[#1E40FF]/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E40FF]/10 text-[#1E40FF] dark:text-[#8fa0ff] text-xs font-bold border border-[#1E40FF]/25 mb-6">
          <Icon className="w-3.5 h-3.5" />
          {badge}
        </span>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500">
          Last updated: 20 October 2026 &nbsp;•&nbsp; LicenseWala Technologies Pvt Ltd
        </p>
        <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {intro}
        </p>

        <div className="mt-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-[0_18px_45px_-25px_rgba(10,19,48,0.35)]">
          {children}
        </div>

        {/* Contact strip */}
        <div className="mt-8 rounded-3xl bg-[#EEF1FF] dark:bg-[#1E40FF]/10 border border-[#1E40FF]/20 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Questions about this policy?</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our support team replies within one business day. Reach us any time at{' '}
              <a href="mailto:support@licensewala.com" className="font-bold text-[#1E40FF] dark:text-[#8fa0ff] hover:underline">
                support@licensewala.com
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <a
              href="mailto:support@licensewala.com"
              className="px-5 py-3 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm hover:border-[#1E40FF]/50 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#1E40FF]" />
              WhatsApp Us
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          See also our{' '}
          <Link to="/terms" className="font-bold text-[#1E40FF] dark:text-[#8fa0ff] hover:underline">
            Terms of Service
          </Link>
          ,{' '}
          <Link to="/privacy" className="font-bold text-[#1E40FF] dark:text-[#8fa0ff] hover:underline">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link to="/refund-policy" className="font-bold text-[#1E40FF] dark:text-[#8fa0ff] hover:underline">
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-9 first:mt-0">
    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
    <div className="mt-3 space-y-3">{children}</div>
  </section>
);

export const LegalP: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">{children}</p>
);

export const LegalList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2.5 text-sm sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
        <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-[#1E40FF] shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);
