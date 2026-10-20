import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  ShieldCheck,
  KeyRound,
  Package,
  Layers,
  Receipt,
  Building2,
  Cpu,
  Users,
  Activity,
  Settings,
  Palette,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  ExternalLink,
  Tag,
} from 'lucide-react';

export const ADMIN_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { id: 'user-licenses', label: 'User Licenses', path: '/admin/licenses', icon: ShieldCheck },
  { id: 'key-generator', label: 'Key Generator', path: '/admin/keys', icon: KeyRound },
  { id: 'product-catalog', label: 'Product Catalog', path: '/admin/products', icon: Package },
  { id: 'pricing-plans', label: 'Pricing & Plans', path: '/admin/pricing', icon: Layers },
  { id: 'coupons', label: 'Coupons', path: '/admin/coupons', icon: Tag },
  { id: 'invoice-generator', label: 'Invoice Generator', path: '/admin/invoices', icon: Receipt },
  { id: 'company-profile', label: 'Company Profile', path: '/admin/company', icon: Building2 },
  { id: 'integrations', label: 'Supabase & Razorpay', path: '/admin/integrations', icon: Cpu },
  { id: 'users-control', label: 'Users Control', path: '/admin/users', icon: Users },
  { id: 'activity-logs', label: 'Activity Logs', path: '/admin/logs', icon: Activity },
  { id: 'system-settings', label: 'System Settings', path: '/admin/settings', icon: Settings },
  { id: 'theme', label: 'Theme', path: '/admin/theme', icon: Palette },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
  customer: 'Customer',
};

export const AdminLayout: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  // Global search jumps to User Licenses pre-filtered by the query.
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/admin/licenses?q=${encodeURIComponent(q)}` : '/admin/licenses');
    setMobileSidebarOpen(false);
  };

  const displayName = profile?.full_name || profile?.email || 'Admin';
  const roleLabel = ROLE_LABELS[profile?.role || ''] || 'Admin';
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menuLinkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#1E40FF] text-white shadow-lg shadow-[#1E40FF]/30'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
    }`;

  return (
    <div className="h-screen overflow-hidden bg-[#EEF1FF] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1E40FF] to-sky-500 flex items-center justify-center text-white shadow-md shadow-[#1E40FF]/25">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">LicenseWala</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1E40FF]/10 text-[#1E40FF] dark:text-[#8fa0ff] border border-[#1E40FF]/25">
                Admin Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search (jumps to User Licenses, pre-filtered) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search licenses, keys, customers, invoices..."
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40FF] transition-all"
            />
          </form>
        </div>

        {/* Right: Actions & Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin identity — real signed-in profile */}
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-9 h-9 rounded-full ring-2 ring-[#1E40FF]/40 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full ring-2 ring-[#1E40FF]/40 bg-[#1E40FF] text-white flex items-center justify-center text-xs font-extrabold">
                    {initials || 'A'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-[#1E40FF] dark:text-[#8fa0ff] font-semibold tracking-wide">
                  {roleLabel}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Desktop Sidebar (Collapsible) */}
        <aside
          className={`hidden lg:flex flex-col h-full shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 transition-all duration-300 select-none ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse / Expand Toggle Button */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {ADMIN_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  title={item.label}
                  className={`${menuLinkClasses(isActive)} ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
              <p className="font-semibold text-slate-500 dark:text-slate-400">LicenseWala Core v2.0</p>
              <p>Powered by Supabase</p>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay & Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            ></div>
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col p-4 shadow-2xl z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1E40FF] flex items-center justify-center text-white">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">LicenseWala</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-1">
                {ADMIN_MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={menuLinkClasses(isActive)}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">
                  {roleLabel}: {displayName}
                </span>
                <button onClick={handleSignOut} className="text-rose-500 hover:underline shrink-0 ml-2">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#EEF1FF] dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
