import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { refreshProfile, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Instant 1-Click Login
  const handleQuickDemoLogin = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setEmail('admin@licensewala.com');
      setPassword('Admin@12345');
      loginAsDemo('admin');
      const from = (location.state as any)?.from?.pathname;
      navigate(from || '/admin');
    } else {
      setEmail('amit.patel@gmail.com');
      setPassword('Customer@123');
      loginAsDemo('customer');
      const from = (location.state as any)?.from?.pathname;
      navigate(from || '/account');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. If customer email is typed
    if (cleanEmail.includes('customer') || cleanEmail.includes('amit')) {
      loginAsDemo('customer');
      const from = (location.state as any)?.from?.pathname;
      navigate(from || '/account');
      return;
    }

    // 2. Try Supabase Auth first if valid email format
    if (cleanEmail.includes('@') && cleanPass.length >= 6) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!error && data?.user) {
          await refreshProfile();
          const from = (location.state as any)?.from?.pathname;
          navigate(from || '/admin');
          return;
        }
      } catch {
        // Fallback below
      }
    }

    // 3. Fallback: Always grant Super Admin access to RM Rahul
    loginAsDemo('admin');
    const from = (location.state as any)?.from?.pathname;
    navigate(from || '/admin');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 transition-colors">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <KeyRound className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Welcome to LicenseWala
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Super Admin & Customer Command Portal
          </p>
        </div>

        {/* 1-Click Instant Access Card */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
          <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
            ⚡ One-Click Direct Access
          </div>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Login Instantly as Super Admin (RM Rahul)</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@licensewala.com or 'admin'"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin@12345 (or any password)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Access Pill */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-2 font-medium">
            Demo Credentials Pre-fill:
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20"
            >
              Super Admin: RM Rahul
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer')}
              className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold hover:bg-indigo-500/20"
            >
              Customer: Amit Patel
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
