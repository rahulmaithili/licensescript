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
  AlertCircle,
} from 'lucide-react';
import {
  getIntegrationSettings,
  saveIntegrationSettings,
} from '@/services/settingsService';
import { supabase } from '@/lib/supabase';
import { copyToClipboard } from '@/lib/utils';
import type { IntegrationSettings } from '@/types';

type ValidationResult = { ok: boolean; message: string } | null;

const inputClass =
  'w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-[#0A1330] dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-(--brand)/40 focus:border-(--brand)';
const labelClass = 'block font-semibold text-slate-700 dark:text-slate-300 mb-1';
const cardClass =
  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4';

function ConfigBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
      Configured
    </span>
  ) : (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-400/30 dark:border-slate-600">
      Not configured
    </span>
  );
}

export const Integrations: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingToggle, setSavingToggle] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Connection / validation states
  const [supabaseTest, setSupabaseTest] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [supabaseMsg, setSupabaseMsg] = useState('');
  const [razorpayCheck, setRazorpayCheck] = useState<ValidationResult>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    getIntegrationSettings()
      .then((data) => setSettings(data))
      .finally(() => setIsLoading(false));
  }, []);

  const flashSaved = () => {
    setSavedSuccess(true);
    setSaveError('');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChange = (field: keyof IntegrationSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setSavedSuccess(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSaveError('');
    const { success, error } = await saveIntegrationSettings(settings);
    setIsSaving(false);
    if (success) {
      flashSaved();
    } else {
      setSaveError(error || 'Could not save integration settings. Please check your connection and try again.');
    }
  };

  // Gateway enable/disable switches persist immediately; local state only
  // flips permanently when the save succeeds, otherwise it reverts.
  const handleToggleGateway = async (
    field: 'razorpay_enabled',
    checked: boolean
  ) => {
    if (!settings || savingToggle) return;
    const next = { ...settings, [field]: checked };
    setSettings(next);
    setSavingToggle(field);
    setSaveError('');
    const { success, error } = await saveIntegrationSettings(next);
    setSavingToggle(null);
    if (success) {
      flashSaved();
    } else {
      setSettings(settings);
      setSaveError(error || 'Could not update the gateway switch. Your change was not saved.');
    }
  };

  // Real check: issues an actual lightweight query against Supabase.
  const handleTestSupabase = async () => {
    setSupabaseTest('testing');
    try {
      const { error } = await supabase.from('products').select('id').limit(1);
      if (error) throw error;
      setSupabaseTest('success');
      setSupabaseMsg('Live query succeeded — Supabase responded and the products table is reachable.');
    } catch (err: any) {
      setSupabaseTest('failed');
      setSupabaseMsg(err?.message || 'Connection failed');
    }
  };

  // Honest local checks: these validate format/presence only and are
  // labelled as such — they do NOT call the gateway's live API.
  const handleValidateRazorpay = () => {
    const key = (settings?.razorpay_key_id || '').trim();
    if (!key) {
      setRazorpayCheck({ ok: false, message: 'No Razorpay Key ID entered yet — nothing to validate.' });
      return;
    }
    if (/^rzp_(test|live)_[A-Za-z0-9]{8,}$/.test(key)) {
      setRazorpayCheck({
        ok: true,
        message: `Format looks valid (${key.startsWith('rzp_live_') ? 'live' : 'test'} key). Local format check only — this does not call Razorpay's API, so it cannot confirm the key is active.`,
      });
    } else {
      setRazorpayCheck({
        ok: false,
        message: 'Key ID does not match the expected Razorpay format (rzp_test_… or rzp_live_…). Local format check only.',
      });
    }
  };

  const handleCopyWebhook = async () => {
    const webhookUrl = `${window.location.origin}/api/payment-webhook`;
    await copyToClipboard(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16" aria-busy="true">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-2/3 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading integration settings…
        </p>
      </div>
    );
  }

  const razorpayConfigured = Boolean(settings.razorpay_key_id?.trim());
  const webhookConfigured = Boolean(settings.webhook_secret?.trim());

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
            <Cpu className="w-8 h-8 text-(--brand)" />
            Supabase & Razorpay Integrations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure live payment gateway switches, webhook secrets, and PostgreSQL database connections.
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
              <span>{isSaving ? 'Saving...' : 'Save Integrations'}</span>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Supabase PostgreSQL Integration */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                SB
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0A1330] dark:text-white">Supabase Cloud Database & Auth</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">PostgreSQL with Row Level Security & Realtime subscriptions</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={supabaseTest === 'testing'}
              className="px-3.5 py-1.5 rounded-full bg-(--brand-soft) dark:bg-slate-800 hover:bg-(--brand-soft-hover) dark:hover:bg-slate-700 text-xs font-semibold text-[#0A1330] dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              {supabaseTest === 'testing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span>Test Connection (live query)</span>
            </button>
          </div>

          {supabaseTest === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{supabaseMsg}</span>
            </div>
          )}

          {supabaseTest === 'failed' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{supabaseMsg}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Supabase Project URL</label>
              <input
                type="text"
                value={settings.supabase_url}
                onChange={(e) => handleChange('supabase_url', e.target.value)}
                placeholder="https://your-project.supabase.co"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Supabase Anon Key</label>
              <div className="relative">
                <input
                  type={showAnonKey ? 'text' : 'password'}
                  value={settings.supabase_anon_key}
                  onChange={(e) => handleChange('supabase_anon_key', e.target.value)}
                  placeholder="Not configured"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowAnonKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-(--brand)"
                  aria-label={showAnonKey ? 'Hide anon key' : 'Show anon key'}
                >
                  {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Stored as the connection record for this project. The running app connects with its build-time Supabase configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Razorpay Gateway */}
        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-(--brand)/10 text-(--brand) flex items-center justify-center font-bold">
                RZ
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0A1330] dark:text-white">Razorpay Payment Gateway</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Accept UPI, Credit/Debit cards, Netbanking and Wallets</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ConfigBadge configured={razorpayConfigured} />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rzpActive"
                  checked={settings.razorpay_enabled}
                  disabled={savingToggle === 'razorpay_enabled'}
                  onChange={(e) => handleToggleGateway('razorpay_enabled', e.target.checked)}
                  className="w-4 h-4 rounded accent-(--brand) disabled:opacity-50"
                />
                <label htmlFor="rzpActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {savingToggle === 'razorpay_enabled'
                    ? 'Saving…'
                    : settings.razorpay_enabled
                      ? 'Active Gateway'
                      : 'Disabled'}
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className={labelClass}>Razorpay Key ID</label>
              <input
                type="text"
                value={settings.razorpay_key_id}
                onChange={(e) => { handleChange('razorpay_key_id', e.target.value); setRazorpayCheck(null); }}
                placeholder="Not configured — e.g. rzp_live_…"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Webhook Secret <span className="ml-1 align-middle"><ConfigBadge configured={webhookConfigured} /></span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.webhook_secret || ''}
                  onChange={(e) => handleChange('webhook_secret', e.target.value)}
                  placeholder="Not configured — paste your webhook secret"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-(--brand)"
                  aria-label={showSecret ? 'Hide webhook secret' : 'Show webhook secret'}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleValidateRazorpay}
              className="px-3.5 py-1.5 rounded-full bg-(--brand-soft) dark:bg-slate-800 hover:bg-(--brand-soft-hover) dark:hover:bg-slate-700 text-xs font-semibold text-[#0A1330] dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-(--brand)" />
              <span>Validate Key Format (local check)</span>
            </button>
            {razorpayCheck && (
              <span className={`text-xs flex items-start gap-1.5 ${razorpayCheck.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {razorpayCheck.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                {razorpayCheck.message}
              </span>
            )}
          </div>
          {!razorpayConfigured && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Razorpay is not configured yet — add your Key ID and webhook secret, then use Save Integrations.
            </p>
          )}
        </div>

        {/* Global Webhook URL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-[#0A1330] dark:text-white">Payment Webhook URL</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste this URL in your Razorpay Dashboard webhook settings:
          </p>
          <div className="flex items-center gap-2 bg-(--brand-soft) dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-mono text-xs text-(--brand) dark:text-(--brand-ink) flex-1 truncate">
              {window.location.origin}/api/payment-webhook
            </span>
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="p-1.5 rounded-lg text-slate-400 hover:text-(--brand) hover:bg-white dark:hover:bg-slate-700"
              aria-label="Copy webhook URL"
            >
              {copiedWebhook ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
