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
  Bell,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const ADMIN_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { id: 'user-licenses', label: 'User Licenses', path: '/admin/licenses', icon: ShieldCheck },
  { id: 'key-generator', label: 'Key Generator', path: '/admin/keys', icon: KeyRound },
  { id: 'product-catalog', label: 'Product Catalog', path: '/admin/products', icon: Package },
  { id: 'pricing-plans', label: 'Pricing & Plans', path: '/admin/pricing', icon: Layers },
  { id: 'invoice-generator', label: 'Invoice Generator', path: '/admin/invoices', icon: Receipt },
  { id: 'company-profile', label: 'Company Profile', path: '/admin/company', icon: Building2 },
  { id: 'integrations', label: 'Supabase & Razorpay', path: '/admin/integrations', icon: Cpu },
  { id: 'users-control', label: 'Users Control', path: '/admin/users', icon: Users },
  { id: 'activity-logs', label: 'Activity Logs', path: '/admin/logs', icon: Activity },
  { id: 'system-settings', label: 'System Settings', path: '/admin/settings', icon: Settings },
  { id: 'theme', label: 'Theme', path: '/admin/theme', icon: Palette },
];

export const AdminLayout: React.FC = () => {
  const { user, profile, isSuperAdmin, signOut } = useAuth();
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 lg:hidden text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg text-white">LicenseWala</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Admin Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search licenses, keys, customers, invoices..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions & Super Admin Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Super Admin Badge Menu */}
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                  alt="RM Rahul"
                  className="w-9 h-9 rounded-full ring-2 ring-amber-500/50 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  RM Rahul
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </span>
                <span className="text-[10px] text-amber-400 font-semibold tracking-wide">
                  Super Admin
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (Collapsible) */}
        <aside
          className={`hidden lg:flex flex-col border-r border-slate-800 bg-slate-900/95 transition-all duration-300 select-none ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse / Expand Toggle Button */}
          <div className="p-3 border-b border-slate-800 flex justify-end">
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {ADMIN_MENU_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-400">LicenseWala Core v2.0</p>
              <p>Node v24 • Supabase DB</p>
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
            <div className="relative w-72 max-w-[80vw] bg-slate-900 border-r border-slate-800 h-full flex flex-col p-4 shadow-2xl z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white">LicenseWala</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Super Admin: RM Rahul</span>
                <button onClick={handleSignOut} className="text-rose-400 hover:underline">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
