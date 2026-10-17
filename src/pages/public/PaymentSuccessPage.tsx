import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  KeyRound,
  Copy,
  Check,
  Download,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { copyToClipboard, formatCurrency } from '@/lib/utils';
import { getInvoices, generateInvoicePDF } from '@/services/invoiceService';

export const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    licenseKey?: string;
    invoiceNumber?: string;
    productName?: string;
    amount?: number;
  } | null;

  const [copied, setCopied] = useState(false);
  const licenseKey = state?.licenseKey || 'LW-DEMO-9912-K782-X901';
  const invoiceNumber = state?.invoiceNumber || 'INV-2026-00109';
  const productName = state?.productName || 'Software License';
  const amount = state?.amount || 1999;

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handleCopy = async () => {
    await copyToClipboard(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadInvoice = async () => {
    const invs = await getInvoices();
    const found = invs.find((i) => i.invoice_number === invoiceNumber);
    if (found) {
      generateInvoicePDF(found);
    } else {
      generateInvoicePDF({
        id: 'inv-temp',
        invoice_number: invoiceNumber,
        user_id: 'user',
        product_name: productName,
        plan_name: 'License Edition',
        amount: Math.round(amount / 1.18),
        tax_rate: 18,
        tax_amount: Math.round(amount - amount / 1.18),
        discount_amount: 0,
        total_amount: amount,
        currency: 'INR',
        payment_status: 'paid',
        payment_method: 'razorpay',
        billing_name: 'Valued Customer',
        billing_email: 'customer@email.com',
        issued_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-center">
      {/* Success Badge */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          Payment Successful!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Thank you for purchasing <strong>{productName}</strong>. Your license key has been generated and activated.
        </p>
      </div>

      {/* Prominent License Key Card */}
      <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Your Official License Key
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
            Active Status
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
          <span className="font-mono text-base sm:text-2xl font-black text-white tracking-widest break-all">
            {licenseKey}
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 shrink-0 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Key</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Hardware Anti-Binding: Copy and paste this key into the extension settings popup or script environment.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={handleDownloadInvoice}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Tax Invoice (PDF)</span>
        </button>

        <Link
          to="/account"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span>Go to Customer Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
