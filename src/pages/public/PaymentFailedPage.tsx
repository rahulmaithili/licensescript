import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, MessageSquare, ArrowLeft } from 'lucide-react';

export const PaymentFailedPage: React.FC = () => {
  const location = useLocation();
  const reason = (location.state as any)?.reason || 'Transaction could not be completed by your bank.';

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xl">
        <XCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Payment Unsuccessful
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {reason}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-left space-y-1">
        <p className="font-bold text-slate-800 dark:text-slate-200">What happened?</p>
        <p>No money was charged. You can retry with Google Pay, PhonePe, UPI, or an alternate debit/credit card.</p>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Link
          to="/products"
          className="w-full py-3.5 rounded-2xl bg-[#1E40FF] hover:bg-[#1740D6] text-white font-bold text-sm shadow-lg shadow-[#1E40FF]/30 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Link>

        <a
          href="https://wa.me/919876543210?text=Hi%20Rahul,%20my%20payment%20failed%20on%20LicenseWala"
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span>Pay via Direct WhatsApp UPI</span>
        </a>
      </div>
    </div>
  );
};
