import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  KeyRound,
  ShieldCheck,
  Receipt,
  User,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  Monitor,
  Download,
  ExternalLink,
  MessageSquare,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { getLicenses, resetLicenseDevices } from '@/services/licenseService';
import { getInvoices, generateInvoicePDF } from '@/services/invoiceService';
import {
  formatCurrency,
  formatDate,
  calculateDaysLeft,
  maskLicenseKey,
  copyToClipboard,
} from '@/lib/utils';
import type { License, Invoice } from '@/types';

export const AccountDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [revealedKeys, setRevealedKeys] = useState<{ [id: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'licenses' | 'invoices' | 'profile'>('licenses');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    const [lics, invs] = await Promise.all([
      getLicenses(user?.id),
      getInvoices(user?.id),
    ]);
    setLicenses(lics);
    setInvoices(invs);
    setIsLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (key: string) => {
    await copyToClipboard(key);
    setCopiedKey(key);
    showToast('License key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResetHWID = async (lic: License) => {
    if (!window.confirm('Reset hardware device bindings for this key?')) return;
    await resetLicenseDevices(lic.id);
    showToast('Device activations reset to 0/1 PC');
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Profile Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-600/25">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {profile?.full_name || 'Valued Customer'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                Verified Account
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {profile?.email || user?.email} {profile?.phone ? `• ${profile.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'licenses'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Licenses ({licenses.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'invoices'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'licenses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              Active Software Licenses & Extensions
            </h2>
            <a
              href="https://wa.me/919876543210?text=Hi%20Rahul,%20need%20help%20with%20my%20license"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Priority WhatsApp Support</span>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {licenses.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                <p className="text-slate-400 text-sm">You do not own any active licenses yet.</p>
                <a
                  href="/products"
                  className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Browse Extensions Catalog
                </a>
              </div>
            ) : (
              licenses.map((lic) => {
                const daysInfo = calculateDaysLeft(lic.expiry_date);
                const isRevealed = revealedKeys[lic.id] || false;

                return (
                  <div
                    key={lic.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 hover:border-indigo-500/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {lic.product?.category || 'Software Tool'}
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                          {lic.product?.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{lic.plan?.name}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            daysInfo.isExpired
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          {lic.status}
                        </span>
                      </div>
                    </div>

                    {/* License Key Box */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wider">
                          {isRevealed ? lic.license_key : maskLicenseKey(lic.license_key)}
                        </span>
                        <button
                          onClick={() => toggleReveal(lic.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title={isRevealed ? 'Hide Key' : 'Reveal Key'}
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(lic.license_key)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                        >
                          {copiedKey === lic.license_key ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Key</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Stats & Device Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Hardware Binding</span>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Monitor className="w-4 h-4 text-indigo-500" />
                          <span>{lic.current_devices} / {lic.max_devices} PC</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Expiry Date</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatDate(lic.expiry_date)}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Validity</span>
                        <span className="font-bold text-emerald-500">{daysInfo.text}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResetHWID(lic)}
                          className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
                        >
                          Reset Devices
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-500" />
              Tax Invoices & Billing Receipts
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase text-slate-400">
                <tr>
                  <th className="p-4">Invoice Number</th>
                  <th className="p-4">Product Purchased</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">PDF Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {inv.invoice_number}
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {inv.product_name}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inv.total_amount, inv.currency)}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {formatDate(inv.issued_at)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => generateInvoicePDF(inv)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
