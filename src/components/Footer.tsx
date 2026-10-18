import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Zap, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                License<span className="text-orange-500">Wala</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              भारत का प्रमुख गैस एजेंसी ऑटोमेशन व लाइसेंस सॉफ्टवेयर पोर्टल। IndianOil (Indane), HP Gas व Bharat Gas डिस्ट्रीब्यूटरों के लिए इंस्टेंट एक्टिवेशन, ऑटो कैश मेमो और 24/7 AnyDesk सपोर्ट।
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Razorpay & Cashfree Verified Gateway</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase">
              गैस एजेंसी सॉफ्टवेयर पैकेज
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/products" className="hover:text-orange-500 transition-colors">
                  CDCMS Pro Multi-Tool Suite
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-orange-500 transition-colors">
                  IndianOil Indane SDMS Tool
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-orange-500 transition-colors">
                  HP Gas (HPCL) CMS Assistant
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-orange-500 transition-colors">
                  Bharat Gas (BPCL) Refill Tool
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-orange-500 transition-colors">
                  Agency Lifetime Distributorship Deal
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Transparent Pricing
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Customer Portal & Invoices
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <span className="text-xs text-slate-400">GST: 27AABCL1234D1ZM</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase">
              Direct Support
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>support@licensewala.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500" />
                <span>+91 98765 43210 (WhatsApp)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>Tech Park, Mumbai & Patna, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} LicenseWala Technologies. Founded & Managed by <strong>RM Rahul</strong>. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
              Razorpay Secured
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
              Cashfree Verified
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
              Supabase PostgreSQL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
