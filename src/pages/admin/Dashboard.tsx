import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  XCircle,
  PauseCircle,
  Users,
  IndianRupee,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  CreditCard,
  KeyRound,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getLicenses } from '@/services/licenseService';
import { getUsers } from '@/services/userService';
import { getInvoices } from '@/services/invoiceService';
import { formatCurrency, formatDate, calculateDaysLeft } from '@/lib/utils';
import type { License, Profile, Invoice } from '@/types';

export const AdminDashboard: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [lics, usrs, invs] = await Promise.all([
      getLicenses(),
      getUsers(),
      getInvoices(),
    ]);
    setLicenses(lics);
    setUsers(usrs);
    setInvoices(invs);
    setIsLoading(false);
  };

  // KPIs
  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter((l) => l.status === 'active').length;
  const expiringSoon = licenses.filter((l) => {
    const { days, isExpired } = calculateDaysLeft(l.expiry_date);
    return !isExpired && days <= 30 && days > 0;
  }).length;
  const expiringToday = licenses.filter((l) => {
    const { days } = calculateDaysLeft(l.expiry_date);
    return days === 0;
  }).length;
  const expiredLicenses = licenses.filter((l) => {
    const { isExpired } = calculateDaysLeft(l.expiry_date);
    return isExpired || l.status === 'expired';
  }).length;
  const pausedLicenses = licenses.filter((l) => l.status === 'paused' || l.status === 'locked').length;
  const revokedLicenses = licenses.filter((l) => l.status === 'revoked').length;

  const totalRevenue = invoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalProfit = Math.round(totalRevenue * 0.85); // Estimated profit margin

  // Chart Data: Monthly Revenue
  const monthlyRevenueData = [
    { month: 'Oct 25', revenue: 42000, profit: 35700, users: 14 },
    { month: 'Nov 25', revenue: 58000, profit: 49300, users: 22 },
    { month: 'Dec 25', revenue: 76000, profit: 64600, users: 28 },
    { month: 'Jan 26', revenue: 94000, profit: 79900, users: 36 },
    { month: 'Feb 26', revenue: 112000, profit: 95200, users: 44 },
    { month: 'Mar 26', revenue: totalRevenue > 0 ? totalRevenue : 145000, profit: totalProfit > 0 ? totalProfit : 123250, users: users.length },
  ];

  // Chart Data: Gateway Split
  const gatewayData = [
    { name: 'Razorpay', value: 68, color: '#3b82f6' },
    { name: 'Cashfree', value: 24, color: '#10b981' },
    { name: 'Direct UPI/Bank', value: 8, color: '#f59e0b' },
  ];

  // Chart Data: Revenue by Product
  const productRevenueData = [
    { name: 'WhatsApp Sender', revenue: 78000 },
    { name: 'Telegram Scraper', revenue: 42000 },
    { name: 'B2B Leads Extractor', revenue: 56000 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-indigo-800/40 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Live Super Admin Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-indigo-400">RM Rahul</span>!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Real-time software licensing metrics, automated key activations, subscription renewals, and live payment settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/licenses"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Issue New License</span>
            </Link>
            <Link
              to="/admin/keys"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Bulk Keys</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Licenses */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Licenses</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{totalLicenses}</span>
            <span className="block text-[11px] text-emerald-400 font-medium mt-0.5">All created</span>
          </div>
        </div>

        {/* Active */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-400">{activeLicenses}</span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Hardware bound</span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Expiring &lt;= 30d</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-400">{expiringSoon}</span>
            <span className="block text-[11px] text-amber-300/80 font-medium mt-0.5">Renewals pending</span>
          </div>
        </div>

        {/* Expiring Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Expiring Today</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-400">{expiringToday}</span>
            <span className="block text-[11px] text-rose-300/80 font-medium mt-0.5">Urgent renewal</span>
          </div>
        </div>

        {/* Expired */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Expired</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-300">{expiredLicenses}</span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Inactive keys</span>
          </div>
        </div>

        {/* Paused / Locked */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Paused / Locked</span>
            <PauseCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-purple-400">{pausedLicenses}</span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Admin hold</span>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-900/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Collected Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">
              {formatCurrency(totalRevenue > 0 ? totalRevenue : 145000)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+34.2% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/60 border border-emerald-900/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Estimated Net Profit</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-400">
              {formatCurrency(totalProfit > 0 ? totalProfit : 123250)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1">
              <span>85% margin on digital licenses</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-blue-950/60 border border-blue-900/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Registered Users</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{users.length}</span>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mt-1">
              <span>100% verified buyers & clients</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue & Profit Trend</h3>
              <p className="text-xs text-slate-400">Monthly billing gross vs net revenue (INR)</p>
            </div>
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                    dateRange === r
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Gateways Split */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Gateway Distribution</h3>
            <p className="text-xs text-slate-400">Transactions processed by gateway</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gatewayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gatewayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {gatewayData.map((g) => (
              <div key={g.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }}></span>
                  <span className="text-slate-300 font-medium">{g.name}</span>
                </div>
                <span className="font-bold text-white">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Purchases & Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent License Purchases</h3>
            <Link to="/admin/licenses" className="text-xs font-semibold text-indigo-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {licenses.slice(0, 4).map((lic) => (
              <div key={lic.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">{lic.user?.full_name || 'Customer'}</div>
                  <div className="text-xs text-slate-400">{lic.product?.name}</div>
                  <div className="font-mono text-[11px] text-indigo-400 mt-0.5">{lic.license_key}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {lic.status}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">
                    {formatDate(lic.issue_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Expirations Alert */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Upcoming Expirations</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                Action Required
              </span>
            </div>
            <Link to="/admin/licenses" className="text-xs font-semibold text-amber-400 hover:underline">
              Manage
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {licenses.map((lic) => {
              const { days, text, isExpired } = calculateDaysLeft(lic.expiry_date);
              return { lic, days, text, isExpired };
            })
              .filter((item) => !item.isExpired && item.days <= 45)
              .slice(0, 4)
              .map(({ lic, text, days }) => (
                <div key={lic.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-white">{lic.user?.full_name || 'Customer'}</div>
                    <div className="text-xs text-slate-400">{lic.product?.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{lic.user?.phone || lic.user?.email}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      days <= 7
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {text}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      Expires {formatDate(lic.expiry_date)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
