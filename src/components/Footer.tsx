import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Wallet,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { GasAgencyMasterLogo } from './GasLogos';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 3) {
      setSubscribed(true);
    }
  };

  const socials = [
    { icon: MessageCircle, label: 'WhatsApp Support', href: 'https://wa.me/917564948617' },
    { icon: Mail, label: 'Email Support', href: 'mailto:support@licensewala.com' },
    { icon: Phone, label: 'Call Support', href: 'tel:+917564948617' },
  ];

  const badges = [
    { icon: ShieldCheck, label: 'Razorpay Secured' },
    { icon: Wallet, label: 'UPI Accepted' },
    { icon: Database, label: 'Supabase PostgreSQL' },
  ];

  return (
    <footer className="bg-[#0A1330] text-slate-300 relative overflow-hidden">
      {/* subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[160px] bg-[#1E40FF]/15 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-2.5">
              <GasAgencyMasterLogo size={40} />
              <span className="font-extrabold text-2xl tracking-tight text-white">
                License<span className="text-[#7d92ff]">Wala</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's premier LPG gas agency automation and licensing software platform. Instant license activation, 1-click cash memo printing, and 24/7 AnyDesk remote assistance for IndianOil, HP Gas, and Bharat Petroleum distributors.
            </p>

            {/* Newsletter pill */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Agency automation tips, monthly
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>You're on the list. Welcome aboard!</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/15 focus-within:border-[#1E40FF]/60 transition-colors"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gasagency.com"
                    className="flex-1 min-w-0 bg-transparent px-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 pl-4 pr-3 py-2 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] text-white text-sm font-bold transition-colors shrink-0"
                  >
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
                    aria-label={s.label}
                    title={s.label}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-[#1E40FF] hover:border-[#1E40FF] transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white tracking-widest uppercase">
                LPG Software Suites
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link to="/products/cdcms-pro" className="hover:text-[#7d92ff] transition-colors">
                    CDCMS Multi-Tool Suite (PRO)
                  </Link>
                </li>
                <li>
                  <Link to="/products/cdc-tools" className="hover:text-[#7d92ff] transition-colors">
                    CDC Tools Multi Extension
                  </Link>
                </li>
                <li>
                  <Link to="/products/all-in-one-master" className="hover:text-[#7d92ff] transition-colors">
                    Ultimate All-in-One Master Bundle
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-[#7d92ff] transition-colors">
                    All Tools & Extensions
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-[#7d92ff] transition-colors">
                    Plans & Pricing
                  </Link>
                </li>
                <li>
                  <a href="/#services" className="hover:text-[#7d92ff] transition-colors">
                    Tools &amp; Services
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white tracking-widest uppercase">
                Platform & Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link to="/pricing" className="hover:text-[#7d92ff] transition-colors">
                    Transparent Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="hover:text-[#7d92ff] transition-colors">
                    Customer Portal & Invoices
                  </Link>
                </li>
                <li>
                  <a href="/#faq" className="hover:text-[#7d92ff] transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#7d92ff] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#7d92ff] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-[#7d92ff] transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white tracking-widest uppercase">
                Support
              </h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#1E40FF]/15 border border-[#1E40FF]/25 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-[#7d92ff]" />
                  </span>
                  <span>support@licensewala.com</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#1E40FF]/15 border border-[#1E40FF]/25 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-[#7d92ff]" />
                  </span>
                  <span>+91 7564948617</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#1E40FF]/15 border border-[#1E40FF]/25 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#7d92ff]" />
                  </span>
                  <span>Tech Park, Mumbai &amp; Patna, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment / security badges */}
        <div className="mt-12 flex flex-wrap items-center gap-3">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <span
                key={b.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/12 text-xs font-bold text-slate-300"
              >
                <Icon className="w-3.5 h-3.5 text-[#7d92ff]" />
                {b.label}
              </span>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} LicenseWala Technologies. Designed &amp; Managed by{' '}
            <strong className="text-slate-200">RM Rahul</strong>. All rights reserved.
          </p>
          <p className="font-mono">256-bit encrypted license delivery</p>
        </div>
      </div>
    </footer>
  );
};
