import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  Shield,
  Sliders,
  DollarSign,
  Lock,
} from 'lucide-react';
import {
  getSystemSettings,
  saveSystemSettings,
} from '@/services/settingsService';
import type { SystemSettings as ISystemSettings } from '@/types';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<ISystemSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getSystemSettings().then((s) => setSettings(s));
  }, []);

  const handleChange = (field: keyof ISystemSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    const success = await saveSystemSettings(settings);
    setIsSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Settings className="w-8 h-8 text-indigo-400" />
            System & Billing Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global currency rules, tax rates, device hardware binding enforcement, and portal policies.
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

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Platform Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Platform Portal Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Production URL</label>
              <input
                type="url"
                value={settings.site_url}
                onChange={(e) => handleChange('site_url', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Default Currency</label>
              <select
                value={settings.default_currency}
                onChange={(e) => handleChange('default_currency', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ United States Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                value={settings.default_tax_rate}
                onChange={(e) => handleChange('default_tax_rate', Number(e.target.value))}
                min={0}
                max={100}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            Security & Feature Policies
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <span className="font-semibold text-white text-xs block">Hardware Device Binding</span>
                <span className="text-[11px] text-slate-400">Lock licenses strictly to verified hardware machines (anti-piracy)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_device_binding}
                onChange={(e) => handleChange('enable_device_binding', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <span className="font-semibold text-white text-xs block">Public Customer Registration</span>
                <span className="text-[11px] text-slate-400">Allow new clients to sign up directly at /register</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_registration}
                onChange={(e) => handleChange('enable_registration', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <span className="font-semibold text-white text-xs block">Promotional Coupons</span>
                <span className="text-[11px] text-slate-400">Enable discount code box at checkout</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_coupons}
                onChange={(e) => handleChange('enable_coupons', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div>
                <span className="font-semibold text-rose-400 text-xs block">Maintenance Mode</span>
                <span className="text-[11px] text-slate-400">Temporarily block customer purchases during upgrades</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-rose-600"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
