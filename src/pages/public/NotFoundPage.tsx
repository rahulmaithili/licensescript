import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Package, IndianRupee, MessageCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[280px] bg-(--brand)/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-(--brand)/10 text-(--brand) dark:text-(--brand-ink) text-xs font-bold border border-(--brand)/25 mb-7">
          <Compass className="w-3.5 h-3.5" />
          Page Not Found
        </span>

        <div className="text-[110px] sm:text-[160px] leading-none font-black tracking-tighter bg-gradient-to-br from-(--brand) via-blue-500 to-sky-400 bg-clip-text text-transparent select-none">
          404
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          This page took a wrong delivery route
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or may have moved. Let's get you back to the counter.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white font-extrabold text-sm shadow-[0_14px_30px_-10px_rgba(var(--brand-rgb),0.6)] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm hover:border-(--brand)/50 transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4 text-(--brand)" />
            Explore Tools
          </Link>
          <Link
            to="/pricing"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm hover:border-(--brand)/50 transition-all flex items-center justify-center gap-2"
          >
            <IndianRupee className="w-4 h-4 text-(--brand)" />
            View Pricing
          </Link>
        </div>

        <p className="mt-10 text-xs text-slate-400 dark:text-slate-500">
          Still stuck?{' '}
          <a
            href="https://wa.me/917564948617"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-bold text-(--brand) dark:text-(--brand-ink) hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chat with support on WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
};
