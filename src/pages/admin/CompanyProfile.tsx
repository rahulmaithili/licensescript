import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Check,
  CreditCard,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  getCompanyProfile,
  saveCompanyProfile,
} from '@/services/settingsService';
import type { CompanyProfile as ICompanyProfile } from '@/types';

export const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<ICompanyProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getCompanyProfile().then((data) => setProfile(data));
  }, []);

  const handleChange = (field: keyof ICompanyProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    const success = await saveCompanyProfile(profile);
    setIsSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-indigo-400" />
            Company & Business Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your brand identity, GST legal details, bank transfer coordinates, and default invoice notes.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Brand Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Brand & Legal Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company Display Name</label>
              <input
                type="text"
                value={profile.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Legal Entity Name</label>
              <input
                type="text"
                value={profile.legal_name || ''}
                onChange={(e) => handleChange('legal_name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Official Support Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phone / WhatsApp Number</label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={profile.gst_number || ''}
                onChange={(e) => handleChange('gst_number', e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">PAN Number</label>
              <input
                type="text"
                value={profile.pan_number || ''}
                onChange={(e) => handleChange('pan_number', e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">City & State</label>
              <input
                type="text"
                value={`${profile.city || ''}, ${profile.state || ''}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  handleChange('city', parts[0] ? parts[0].trim() : '');
                  if (parts[1]) handleChange('state', parts[1].trim());
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Banking & UPI Settlement Coordinates */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Banking & Offline Payment Coordinates
          </h2>
          <p className="text-xs text-slate-400">
            These coordinates automatically appear on PDF invoices and manual customer checkout receipts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Bank Name</label>
              <input
                type="text"
                value={profile.bank_name || ''}
                onChange={(e) => handleChange('bank_name', e.target.value)}
                placeholder="HDFC Bank / ICICI Bank"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Account Number</label>
              <input
                type="text"
                value={profile.bank_account_no || ''}
                onChange={(e) => handleChange('bank_account_no', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">IFSC Code</label>
              <input
                type="text"
                value={profile.bank_ifsc || ''}
                onChange={(e) => handleChange('bank_ifsc', e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Official UPI ID</label>
              <input
                type="text"
                value={profile.upi_id || ''}
                onChange={(e) => handleChange('upi_id', e.target.value)}
                placeholder="yourname@okhdfcbank"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Invoice Customization & Terms */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Invoice Terms & Notes
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={profile.invoice_prefix || 'LW-'}
                onChange={(e) => handleChange('invoice_prefix', e.target.value.toUpperCase())}
                className="w-48 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Invoice Footer Note</label>
              <textarea
                rows={2}
                value={profile.invoice_notes || ''}
                onChange={(e) => handleChange('invoice_notes', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Standard Terms & Conditions</label>
              <textarea
                rows={3}
                value={profile.terms_conditions || ''}
                onChange={(e) => handleChange('terms_conditions', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
