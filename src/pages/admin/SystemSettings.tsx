import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  Sliders,
  Lock,
  Mail,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getSystemSettings,
  saveSystemSettings,
} from '@/services/settingsService';
import type { SystemSettings as ISystemSettings } from '@/types';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

const inputClass =
  'w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-[#0A1330] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-(--brand)/40 focus:border-(--brand)';
const labelClass = 'block font-semibold text-slate-700 dark:text-slate-300 mb-1';
const cardClass =
  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4';

type ToggleField = 'enable_device_binding' | 'enable_registration' | 'enable_coupons' | 'maintenance_mode';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<ISystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingToggle, setSavingToggle] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  useEffect(() => {
    getSystemSettings()
      .then((s) => setSettings(s))
      .finally(() => setIsLoading(false));
  }, []);

  const flashSaved = () => {
    setSavedSuccess(true);
    setSaveError('');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChange = (field: keyof ISystemSettings, value: any) => {
    if (!settings) return;
    setSavedSuccess(false);
    if (field === 'default_currency') {
      // Keep currency_symbol in sync — it is a real saved field and a
      // stale symbol (e.g. ₹ with USD) would print wrong invoices.
      setSettings({
        ...settings,
        default_currency: value,
        currency_symbol: CURRENCY_SYMBOLS[value] ?? settings.currency_symbol,
      });
      return;
    }
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!settings) return;
    const tax = Number(settings.default_tax_rate);
    if (Number.isNaN(tax) || tax < 0 || tax > 100) {
      setSaveError('Default tax rate must be a number between 0 and 100.');
      return;
    }
    setIsSaving(true);
    setSaveError('');
    const success = await saveSystemSettings({ ...settings, default_tax_rate: tax });
    setIsSaving(false);
    if (success) {
      flashSaved();
    } else {
      setSaveError('Could not save system settings. Please check your connection and try again.');
    }
  };

  // Policy switches persist immediately; the switch reverts if the
  // save fails so the UI never shows a state the DB doesn't have.
  const handleToggle = async (field: ToggleField, checked: boolean) => {
    if (!settings || savingToggle) return;
    const next = { ...settings, [field]: checked };
    setSettings(next);
    setSavingToggle(field);
    setSaveError('');
    const success = await saveSystemSettings(next);
    setSavingToggle(null);
    if (success) {
      flashSaved();
    } else {
      setSettings(settings);
      setSaveError('Could not update that policy switch. Your change was not saved.');
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16" aria-busy="true">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-2/3 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading system settings…
        </p>
      </div>
    );
  }

  const toggleRow = (
    field: ToggleField,
    title: string,
    description: string,
    danger = false
  ) => (
    <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-(--brand-soft) dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
      <div>
        <span className={`font-semibold text-xs block ${danger ? 'text-rose-600 dark:text-rose-400' : 'text-[#0A1330] dark:text-white'}`}>
          {title}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{description}</span>
      </div>
      <input
        type="checkbox"
        checked={Boolean(settings[field])}
        disabled={savingToggle === field}
        onChange={(e) => handleToggle(field, e.target.checked)}
        aria-label={title}
        className={`w-4 h-4 rounded shrink-0 disabled:opacity-50 ${danger ? 'accent-rose-600' : 'accent-(--brand)'}`}
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
            <Settings className="w-8 h-8 text-(--brand)" />
            System & Billing Configuration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global currency rules, tax rates, device hardware binding enforcement, and portal policies.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-full bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-(--brand)/30 transition-all flex items-center gap-2 shrink-0"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Settings Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </>
          )}
        </button>
      </div>

      {saveError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}
      {settings.maintenance_mode && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Maintenance mode is ON — customer purchases are currently blocked.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className={cardClass}>
          <h2 className="text-base font-bold text-[#0A1330] dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-(--brand)" />
            Platform Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className={labelClass}>Platform Portal Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Production URL</label>
              <input
                type="url"
                value={settings.site_url}
                onChange={(e) => handleChange('site_url', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Default Currency</label>
              <select
                value={settings.default_currency}
                onChange={(e) => handleChange('default_currency', e.target.value)}
                className={inputClass}
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ United States Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Currency Symbol (saved with currency)</label>
              <input
                type="text"
                value={settings.currency_symbol}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Default GST / Tax Rate (%)</label>
              <input
                type="number"
                value={settings.default_tax_rate}
                onChange={(e) =>
                  handleChange('default_tax_rate', e.target.value === '' ? 0 : Number(e.target.value))
                }
                min={0}
                max={100}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-base font-bold text-[#0A1330] dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-(--brand)" />
            Security & Feature Policies
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-2">
            Switches save immediately — no need to press Save Configuration.
          </p>

          <div className="space-y-3">
            {toggleRow(
              'enable_device_binding',
              'Hardware Device Binding',
              'Lock licenses strictly to verified hardware machines (anti-piracy)'
            )}
            {toggleRow(
              'enable_registration',
              'Public Customer Registration',
              'Allow new clients to sign up directly at /register'
            )}
            {toggleRow(
              'enable_coupons',
              'Promotional Coupons',
              'Enable discount code box at checkout'
            )}
            {toggleRow(
              'maintenance_mode',
              'Maintenance Mode',
              'Temporarily block customer purchases during upgrades',
              true
            )}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-base font-bold text-[#0A1330] dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-(--brand)" />
            Email (SMTP)
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-2">
            Optional. Leave blank if email is not configured — these fields save with Save Configuration.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className={labelClass}>SMTP Host</label>
              <input
                type="text"
                value={settings.smtp_host || ''}
                onChange={(e) => handleChange('smtp_host', e.target.value)}
                placeholder="Not configured"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>SMTP Port</label>
              <input
                type="number"
                value={settings.smtp_port ?? ''}
                onChange={(e) =>
                  handleChange('smtp_port', e.target.value === '' ? undefined : Number(e.target.value))
                }
                placeholder="Not configured — e.g. 587"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>SMTP Username</label>
              <input
                type="text"
                value={settings.smtp_user || ''}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
                placeholder="Not configured"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>SMTP Password</label>
              <div className="relative">
                <input
                  type={showSmtpPass ? 'text' : 'password'}
                  value={settings.smtp_pass || ''}
                  onChange={(e) => handleChange('smtp_pass', e.target.value)}
                  placeholder="Not configured"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPass((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-(--brand)"
                  aria-label={showSmtpPass ? 'Hide SMTP password' : 'Show SMTP password'}
                >
                  {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>From Address</label>
              <input
                type="email"
                value={settings.smtp_from || ''}
                onChange={(e) => handleChange('smtp_from', e.target.value)}
                placeholder="Not configured"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
