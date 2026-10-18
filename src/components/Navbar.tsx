import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  KeyRound,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { GasAgencyMasterLogo } from '@/components/GasLogos';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <GasAgencyMasterLogo size={38} className="group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 bg-clip-text text-transparent">
                License<span className="text-slate-900 dark:text-white">Wala</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                LPG Suite
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
              IndianOil • HP Gas • Bharat Petroleum
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link to="/" className="hover:text-orange-500 transition-colors">
            Home
          </Link>
          <Link to="/products" className="hover:text-orange-500 transition-colors">
            Products & Extensions
          </Link>
          <Link to="/pricing" className="hover:text-orange-500 transition-colors">
            Pricing Plans
          </Link>
          <a href="/#how-it-works" className="hover:text-orange-500 transition-colors">
            How It Works
          </a>
          <a href="/#faq" className="hover:text-orange-500 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Actions: Theme Toggle + Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              <Link
                to="/account"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <User className="w-4 h-4 text-orange-500" />
                <span>{profile?.full_name?.split(' ')[0] || 'My Account'}</span>
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-slate-500 dark:text-slate-400"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 dark:text-slate-200 font-semibold"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 dark:text-slate-200 font-semibold"
          >
            Products & Extensions
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 dark:text-slate-200 font-semibold"
          >
            Pricing Plans
          </Link>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 font-semibold"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <User className="w-4 h-4 text-orange-500" />
                  My Licenses & Account
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="py-2.5 text-center text-rose-500 font-semibold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-md shadow-orange-500/25"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
