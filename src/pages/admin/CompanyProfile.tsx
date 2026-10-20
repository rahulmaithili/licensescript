import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Check,
  CreditCard,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  getCompanyProfile,
  saveCompanyProfile,
} from '@/services/settingsService';
import type { CompanyProfile as ICompanyProfile } from '@/types';

type Banner = { type: 'success' | 'error'; message: string } | null;

const inputCls =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#1E40FF]';

// Key fields that appear on PDF invoices — used only to tell the admin
// which of *their own* fields are still blank, never to fill them in.
const KEY_FIELDS: { field: keyof ICompanyProfile; label: string }[] = [
  { field: 'gst_number', label: 'GSTIN' },
  { field: 'pan_number', label: 'PAN' },
  { field: 'address', label: 'Address' },
  { field: 'bank_name', label: 'Bank name' },
  { field: 'bank_account_no', label: 'Bank account number' },
  { field: 'bank_ifsc', label: 'IFSC' },
  { field: 'upi_id', label: 'UPI ID' },
];

export const CompanyProfile: React.FC = () => {
  const [profile, setProfile] = useState<ICompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getCompanyProfile();
        if (!cancelled) setProfile(data);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field: keyof ICompanyProfile, value: string) => {
    // Functional update: consecutive changes (e.g. city + state) must
    // compose instead of overwriting each other from a stale snapshot.
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
    setBanner(null);
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!profile || isSaving) return;
    setBanner(null);
    setIsSaving(true);
    try {
      const success = await saveCompanyProfile(profile);
      if (success) {
        setBanner({ type: 'success', message: 'Company profile saved. New invoices will use these details.' });
      } else {
        setBanner({
          type: 'error',
          message: 'Could not save the company profile. Your changes are still in the form but were NOT stored — please try again.',
        });
      }
    } catch (err: any) {
      setBanner({
        type: 'error',
        message: err?.message || 'Could not save the company profile. Your changes were NOT stored — please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16" aria-label="Loading company profile">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="w-6 h-6 animate-spin text-[#8fa0ff]" />
          <span className="text-sm font-semibold">Loading company profile…</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-pulse space-y-4">
          <div className="h-5 w-48 bg-slate-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-9 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-pulse space-y-4">
          <div className="h-5 w-56 bg-slate-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-9 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const missingKeyFields = KEY_FIELDS.filter(({ field }) => !(profile[field] || '').toString().trim());

  const saveButtonContent = isSaving ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Saving...</span>
    </>
  ) : banner?.type === 'success' ? (
    <>
      <Check className="w-4 h-4 text-emerald-300" />
      <span>Saved Successfully</span>
    </>
  ) : (
    <>
      <Save className="w-4 h-4" />
      <span>Save Profile</span>
    </>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-[#8fa0ff]" />
            Company & Business Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your brand identity, GST legal details, bank transfer coordinates, and default invoice notes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-[#1E40FF]/30 transition-all flex items-center gap-2"
        >
          {saveButtonContent}
        </button>
      </div>

      {banner && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
          role={banner.type === 'error' ? 'alert' : 'status'}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{banner.message}</span>
        </div>
      )}

      {missingKeyFields.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#1E40FF]/30 bg-[#EEF1FF] px-4 py-3 text-sm text-[#0A1330]">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#1E40FF]" />
          <span>
            <strong>Profile incomplete:</strong> {missingKeyFields.map((f) => f.label).join(', ')}{' '}
            {missingKeyFields.length === 1 ? 'is' : 'are'} still blank. Invoices generated before you fill{' '}
            {missingKeyFields.length === 1 ? 'it' : 'them'} in will show those fields as empty — nothing is
            auto-filled for you.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Brand Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8fa0ff]" />
            Brand & Legal Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company Display Name</label>
              <input
                type="text"
                value={profile.company_name || ''}
                onChange={(e) => handleChange('company_name', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Legal Entity Name</label>
              <input
                type="text"
                value={profile.legal_name || ''}
                onChange={(e) => handleChange('legal_name', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Official Support Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Support Email (shown to customers)</label>
              <input
                type="email"
                value={profile.support_email || ''}
                onChange={(e) => handleChange('support_email', e.target.value)}
                placeholder="Defaults to the official email if left blank in invoices"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phone / WhatsApp Number</label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Website</label>
              <input
                type="url"
                value={profile.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Logo URL</label>
              <input
                type="url"
                value={profile.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://… (optional)"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={profile.gst_number || ''}
                onChange={(e) => handleChange('gst_number', e.target.value.toUpperCase())}
                placeholder="Leave blank if not registered"
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">PAN Number</label>
              <input
                type="text"
                value={profile.pan_number || ''}
                onChange={(e) => handleChange('pan_number', e.target.value.toUpperCase())}
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
          </div>

          <div className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={profile.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={profile.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={profile.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  value={profile.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking & UPI Settlement Coordinates */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#8fa0ff]" />
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
                placeholder="e.g. HDFC Bank / ICICI Bank"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Account Number</label>
              <input
                type="text"
                value={profile.bank_account_no || ''}
                onChange={(e) => handleChange('bank_account_no', e.target.value)}
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">IFSC Code</label>
              <input
                type="text"
                value={profile.bank_ifsc || ''}
                onChange={(e) => handleChange('bank_ifsc', e.target.value.toUpperCase())}
                className={`${inputCls} font-mono uppercase`}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Official UPI ID</label>
              <input
                type="text"
                value={profile.upi_id || ''}
                onChange={(e) => handleChange('upi_id', e.target.value)}
                placeholder="yourname@okhdfcbank"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>
        </div>

        {/* Invoice Customization & Terms */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8fa0ff]" />
            Invoice Terms & Notes
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={profile.invoice_prefix || ''}
                onChange={(e) => handleChange('invoice_prefix', e.target.value.toUpperCase())}
                placeholder="INV-"
                className="w-48 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#1E40FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Invoice Footer Note</label>
              <textarea
                rows={2}
                value={profile.invoice_notes || ''}
                onChange={(e) => handleChange('invoice_notes', e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Standard Terms & Conditions</label>
              <textarea
                rows={3}
                value={profile.terms_conditions || ''}
                onChange={(e) => handleChange('terms_conditions', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-[#1E40FF]/30 transition-all flex items-center gap-2"
          >
            {saveButtonContent}
          </button>
        </div>
      </form>
    </div>
  );
};
