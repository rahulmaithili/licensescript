import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Save,
  Check,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Zap,
} from 'lucide-react';
import {
  getIntegrationSettings,
  saveIntegrationSettings,
} from '@/services/settingsService';
import { supabase } from '@/lib/supabase';
import { copyToClipboard } from '@/lib/utils';
import type { IntegrationSettings } from '@/types';

export const Integrations: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Connection Test States
  const [supabaseTest, setSupabaseTest] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [supabaseMsg, setSupabaseMsg] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    getIntegrationSettings().then((data) => setSettings(data));
  }, []);

  const handleChange = (field: keyof IntegrationSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    const success = await saveIntegrationSettings(settings);
    setIsSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleTestSupabase = async () => {
    setSupabaseTest('testing');
    try {
      const { data, error } = await supabase.from('products').select('count', { count: 'exact' });
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setSupabaseTest('success');
      setSupabaseMsg('Connected to PostgreSQL successfully! Realtime & RLS active.');
    } catch (err: any) {
      setSupabaseTest('failed');
      setSupabaseMsg(err.message || 'Connection failed');
    }
  };

  const handleCopyWebhook = async () => {
    const webhookUrl = `${window.location.origin}/api/payment-webhook`;
    await copyToClipboard(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Cpu className="w-8 h-8 text-indigo-400" />
            Supabase, Razorpay & Cashfree Integrations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure live payment gateway switches, webhook secrets, and PostgreSQL database connections.
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
              <span>{isSaving ? 'Saving...' : 'Save Integrations'}</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Supabase PostgreSQL Integration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                SB
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Supabase Cloud Database & Auth</h2>
                <p className="text-xs text-slate-400">PostgreSQL with Row Level Security & Realtime subscriptions</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={supabaseTest === 'testing'}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5"
            >
              {supabaseTest === 'testing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Test Connection</span>
            </button>
          </div>

          {supabaseTest === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{supabaseMsg}</span>
            </div>
          )}

          {supabaseTest === 'failed' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{supabaseMsg}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Supabase Project URL</label>
              <input
                type="text"
                value={settings.supabase_url}
                onChange={(e) => handleChange('supabase_url', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Supabase Anon Key</label>
              <input
                type="password"
                value={settings.supabase_anon_key}
                onChange={(e) => handleChange('supabase_anon_key', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Razorpay Gateway */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                RZ
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Razorpay Payment Gateway</h2>
                <p className="text-xs text-slate-400">Accept UPI, Credit/Debit cards, Netbanking and Wallets</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rzpActive"
                checked={settings.razorpay_enabled}
                onChange={(e) => handleChange('razorpay_enabled', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600"
              />
              <label htmlFor="rzpActive" className="text-xs font-bold text-slate-300 cursor-pointer">
                {settings.razorpay_enabled ? 'Active Gateway' : 'Disabled'}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={settings.razorpay_key_id}
                onChange={(e) => handleChange('razorpay_key_id', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Webhook Secret</label>
              <input
                type="text"
                value={settings.webhook_secret || 'whsec_lw_sample_secret_key_2026'}
                onChange={(e) => handleChange('webhook_secret', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Cashfree Gateway */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                CF
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Cashfree Payment Gateway</h2>
                <p className="text-xs text-slate-400">High-speed instant checkout & auto settlements</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cfActive"
                checked={settings.cashfree_enabled}
                onChange={(e) => handleChange('cashfree_enabled', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600"
              />
              <label htmlFor="cfActive" className="text-xs font-bold text-slate-300 cursor-pointer">
                {settings.cashfree_enabled ? 'Active Gateway' : 'Disabled'}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Cashfree App ID</label>
              <input
                type="text"
                value={settings.cashfree_app_id}
                onChange={(e) => handleChange('cashfree_app_id', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mode Environment</label>
              <select
                value={settings.cashfree_mode}
                onChange={(e) => handleChange('cashfree_mode', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
              >
                <option value="sandbox">Sandbox (Test Mode)</option>
                <option value="production">Production (Live Payments)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Webhook URL */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white">Payment Webhook URL</h3>
          <p className="text-xs text-slate-400">
            Paste this URL in your Razorpay Dashboard & Cashfree Webhook settings:
          </p>
          <div className="flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="font-mono text-xs text-indigo-300 flex-1 truncate">
              {window.location.origin}/api/payment-webhook
            </span>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
            >
              {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
