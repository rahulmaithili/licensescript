import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { GoogleIcon } from '@/components/GoogleIcon';
import { GasAgencyMasterLogo } from '@/components/GasLogos';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Zap,
  FileCheck2,
  BadgeCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { user, profile, isAdmin, isLoading: authLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname as string | undefined;

  // Already signed in? Send the user to their dashboard
  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate(from || (isAdmin ? '/admin' : '/account'), { replace: true });
    }
  }, [authLoading, user, profile, isAdmin, from, navigate]);

  const friendlyError = (message: string) => {
    if (/invalid login credentials/i.test(message)) {
      return 'Invalid email or password. Please check your details and try again.';
    }
    if (/email not confirmed/i.test(message)) {
      return 'Your email is not verified yet. Please click the verification link sent to your inbox.';
    }
    if (/too many requests|rate limit/i.test(message)) {
      return 'Too many login attempts. Please wait a minute and try again.';
    }
    return message;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMsg(friendlyError(error.message));
        return;
      }

      if (data?.user) {
        // Decide destination from the real profile role
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('role, status, is_blocked')
          .eq('id', data.user.id)
          .maybeSingle();

        const blocked =
          (profileRow as any)?.is_blocked === true ||
          (profileRow as any)?.status === 'blocked' ||
          (profileRow as any)?.status === 'disabled';
        if (blocked) {
          await supabase.auth.signOut();
          setErrorMsg('This account has been blocked. Please contact support@licensewala.com');
          return;
        }

        const role = (profileRow as any)?.role;
        const admin = role === 'super_admin' || role === 'admin' || role === 'staff';
        navigate(from || (admin ? '/admin' : '/account'), { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    const err = await signInWithGoogle();
    if (err) {
      setErrorMsg(err);
      setGoogleLoading(false);
    }
    // On success the browser redirects to Google; Supabase restores the session on return.
  };

  const brandFeatures = [
    {
      icon: Zap,
      title: 'Instant License Delivery',
      desc: 'Your license key is generated and emailed within 60 seconds of payment.',
    },
    {
      icon: ShieldCheck,
      title: 'HWID Machine Lock Security',
      desc: 'Every license is bound to your counter PC — no piracy, no key sharing.',
    },
    {
      icon: FileCheck2,
      title: 'GST Invoices & Self-Service Portal',
      desc: 'Download invoices, reset devices and renew plans anytime, yourself.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-[1.05fr_1fr]">
      {/* LEFT — Brand Panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1E40FF] via-[#1a35d6] to-[#0A1330] text-white p-10 xl:p-14">
        {/* Decorations */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="bg-white rounded-2xl p-1.5 shadow-lg">
              <GasAgencyMasterLogo size={34} />
            </span>
            <span className="text-xl font-black tracking-tight">
              License<span className="text-sky-300">Wala</span>
            </span>
          </Link>
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold uppercase tracking-wider mb-6">
            <BadgeCheck className="w-3.5 h-3.5" />
            Trusted by 1,200+ LPG Agencies
          </span>
          <h2 className="text-4xl xl:text-5xl font-black leading-[1.08] tracking-tight">
            Welcome back to India's smartest agency counter.
          </h2>
          <p className="mt-4 text-blue-100/90 text-base leading-relaxed">
            Sign in to manage your licenses, download GST invoices, reset devices and renew plans — all in one place.
          </p>

          <div className="mt-10 space-y-5">
            {brandFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-4">
                  <span className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-extrabold text-sm">{f.title}</div>
                    <div className="text-blue-100/80 text-xs leading-relaxed mt-0.5">{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4 max-w-lg">
          {[
            { v: '1,200+', l: 'Active Agencies' },
            { v: '500K+', l: 'Memos / Month' },
            { v: '< 60s', l: 'Key Delivery' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 backdrop-blur-sm">
              <div className="text-xl font-black">{s.v}</div>
              <div className="text-[11px] text-blue-100/80 font-semibold">{s.l}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT — Login Form */}
      <section className="relative flex items-center justify-center px-4 sm:px-8 py-12 bg-[#F4F6FF] dark:bg-slate-950 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#1E40FF]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <GasAgencyMasterLogo size={38} />
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                License<span className="text-[#1E40FF]">Wala</span>
              </span>
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[28px] shadow-[0_24px_60px_-24px_rgba(10,19,48,0.25)] p-8 sm:p-10">
            <div className="mb-7">
              <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Sign in with your registered email to continue.
              </p>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[#1E40FF]/60 hover:shadow-[0_10px_30px_-10px_rgba(30,64,255,0.4)] text-slate-700 dark:text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {googleLoading ? (
                <span className="w-5 h-5 border-2 border-slate-300 border-t-[#1E40FF] rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                or sign in with email
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-[13px] font-medium text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@youragency.com"
                    autoComplete="email"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40FF] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#1E40FF] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-11 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40FF] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="p-1.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-2 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] text-white font-extrabold text-sm shadow-[0_14px_30px_-10px_rgba(30,64,255,0.55)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-[13px] text-slate-500 dark:text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-[#1E40FF] hover:underline">
                Create account
              </Link>
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Protected by Supabase Auth — passwords are encrypted, never stored in plain text.
          </p>
        </div>
      </section>
    </div>
  );
};
