import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  ArrowUpRight,
} from 'lucide-react';
import { GasAgencyMasterLogo } from '@/components/GasLogos';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const navLinks: { label: string; to?: string; href?: string; active: boolean }[] = [
    { label: 'Home', to: '/', active: location.pathname === '/' },
    { label: 'Products & Extensions', to: '/products', active: location.pathname.startsWith('/products') },
    { label: 'Pricing Plans', to: '/pricing', active: location.pathname.startsWith('/pricing') },
    { label: 'Services', href: '/#services', active: false },
    { label: 'How It Works', href: '/#how-it-works', active: false },
    { label: 'FAQ', href: '/#faq', active: false },
  ];

  const linkClass = (active: boolean) =>
    active
      ? 'whitespace-nowrap px-2 xl:px-3 2xl:px-4 py-1.5 rounded-full bg-(--brand) text-white text-[13px] 2xl:text-sm font-bold shadow-[0_6px_16px_-6px_rgba(var(--brand-rgb),0.6)] transition-all'
      : 'whitespace-nowrap px-2 xl:px-3 2xl:px-4 py-1.5 rounded-full text-[13px] 2xl:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-(--brand) dark:hover:text-white transition-colors';

  return (
    <header className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-3">
        {/* Floating pill bar */}
        <div className="rounded-full bg-white/80 dark:bg-[#0A1330]/80 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-brand px-3 xl:px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <GasAgencyMasterLogo size={38} className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg xl:text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  License<span className="text-gradient-brand">Wala</span>
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-(--brand)/10 text-(--brand) dark:text-(--brand-ink) border border-(--brand)/25 whitespace-nowrap">
                  LPG Suite
                </span>
              </div>
              <span className="hidden xl:block text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide whitespace-nowrap">
                IndianOil • HP Gas • Bharat Petroleum
              </span>
            </div>
          </Link>

          {/* Center pill nav */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 rounded-full bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 p-1">
            {navLinks.map((link) =>
              link.to ? (
                <Link key={link.label} to={link.to} className={linkClass(link.active)}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className={linkClass(link.active)}>
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 xl:w-10 xl:h-10 shrink-0 rounded-full flex items-center justify-center border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:text-(--brand) dark:hover:text-(--brand-ink) transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-1.5 xl:gap-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    title="Admin Panel"
                    className="flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-bold hover:bg-amber-500/20 transition-colors whitespace-nowrap"
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline">Admin Panel</span>
                  </Link>
                )}
                <Link
                  to="/account"
                  className="flex items-center gap-2 pl-1.5 pr-2.5 xl:pr-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm font-bold hover:border-(--brand)/40 transition-colors whitespace-nowrap"
                >
                  <span className="w-7 h-7 shrink-0 rounded-full bg-(--brand) text-white flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="max-w-[72px] xl:max-w-[140px] truncate">{profile?.full_name?.split(' ')[0] || 'My Account'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="w-9 h-9 xl:w-10 xl:h-10 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2">
                <Link
                  to="/login"
                  className="px-2 xl:px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-(--brand) dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-brand btn-brand-nav text-sm whitespace-nowrap">
                  <span>Get Started</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-3xl bg-white/95 dark:bg-[#0A1330]/95 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-brand p-4 space-y-1">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-2xl font-semibold text-sm transition-colors ${
                    link.active
                      ? 'bg-(--brand) text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </a>
              )
            )}

            <div className="pt-3 mt-2 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-sm"
                  >
                    <User className="w-4 h-4 text-(--brand)" />
                    My Licenses & Account
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="py-2.5 text-center text-rose-500 font-bold text-sm"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-full border border-slate-300 dark:border-white/15 font-bold text-sm text-slate-700 dark:text-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-brand w-full text-sm"
                  >
                    <span>Create Account</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
