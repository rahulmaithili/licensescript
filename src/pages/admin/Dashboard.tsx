import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  XCircle,
  PauseCircle,
  Users,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Download,
  Receipt,
  Package,
} from 'lucide-react';
import { getLicenses } from '@/services/licenseService';
import { getUsers } from '@/services/userService';
import { getInvoices } from '@/services/invoiceService';
import { getProducts } from '@/services/productService';
import { formatCurrency, formatDate, calculateDaysLeft } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { getAccent } from '@/lib/accents';
import type { License, Profile, Invoice, Product } from '@/types';

type DateRange = '7d' | '30d' | '90d' | 'all';

interface RevenueBucket {
  label: string;
  revenue: number;
}

function invoiceDate(inv: Invoice): Date | null {
  const raw = inv.issued_at || inv.created_at;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/** Group real invoice totals into time buckets for the selected range. No invented data. */
function buildRevenueBuckets(invoices: Invoice[], range: DateRange): RevenueBucket[] {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (range === 'all') {
    const byMonth = new Map<string, { label: string; revenue: number; sort: number }>();
    invoices.forEach((inv) => {
      const d = invoiceDate(inv);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = byMonth.get(key) || {
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: 0,
        sort: d.getFullYear() * 12 + d.getMonth(),
      };
      entry.revenue += inv.total_amount || 0;
      byMonth.set(key, entry);
    });
    return Array.from(byMonth.values())
      .sort((a, b) => a.sort - b.sort)
      .map(({ label, revenue }) => ({ label, revenue }));
  }

  if (range === '90d') {
    // 13 weekly buckets ending today
    const buckets: RevenueBucket[] = [];
    const starts: Date[] = [];
    for (let i = 12; i >= 0; i--) {
      const s = startOfDay(now);
      s.setDate(s.getDate() - i * 7 - 6);
      starts.push(s);
      buckets.push({
        label: s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        revenue: 0,
      });
    }
    invoices.forEach((inv) => {
      const d = invoiceDate(inv);
      if (!d) return;
      for (let i = starts.length - 1; i >= 0; i--) {
        if (d >= starts[i]) {
          if (i === starts.length - 1 || d < new Date(starts[i].getTime() + 7 * 86400000)) {
            buckets[i].revenue += inv.total_amount || 0;
          }
          break;
        }
      }
    });
    return buckets;
  }

  const days = range === '7d' ? 7 : 30;
  const buckets: RevenueBucket[] = [];
  const starts: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const s = startOfDay(now);
    s.setDate(s.getDate() - i);
    starts.push(s);
    buckets.push({
      label: s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: 0,
    });
  }
  invoices.forEach((inv) => {
    const d = invoiceDate(inv);
    if (!d) return;
    const idx = starts.findIndex(
      (s) => d >= s && d < new Date(s.getTime() + 86400000)
    );
    if (idx >= 0) buckets[idx].revenue += inv.total_amount || 0;
  });
  return buckets;
}

function invoicesInRange(invoices: Invoice[], range: DateRange): Invoice[] {
  if (range === 'all') return invoices;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoff = Date.now() - days * 86400000;
  return invoices.filter((inv) => {
    const d = invoiceDate(inv);
    return d ? d.getTime() >= cutoff : false;
  });
}

export const AdminDashboard: React.FC = () => {
  const { accentColor } = useTheme();
  const accent = getAccent(accentColor);
  // Donut palette: lead + fifth slots follow the active accent (brand/hover),
  // the remaining slots are fixed categorical colours.
  const gatewayColors = [accent.brand, '#10b981', '#0ea5e9', '#64748b', accent.hover, '#94a3b8'];
  const [licenses, setLicenses] = useState<License[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [lics, usrs, invs, prods] = await Promise.all([
        getLicenses(),
        getUsers(),
        getInvoices(),
        getProducts(),
      ]);
      setLicenses(lics);
      setUsers(usrs);
      setInvoices(invs);
      setProducts(prods);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load dashboard data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  // KPIs — all computed from real service data
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

  const totalRevenue = invoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const paidInvoices = invoices.filter((i) => i.payment_status === 'paid');
  const paidRevenue = paidInvoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  const rangeInvoices = useMemo(() => invoicesInRange(invoices, dateRange), [invoices, dateRange]);
  const rangeRevenue = rangeInvoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  const revenueData = useMemo(
    () => buildRevenueBuckets(invoices, dateRange),
    [invoices, dateRange]
  );
  const hasChartData = revenueData.some((d) => d.revenue > 0);

  // Gateway distribution — real share of invoices by payment method
  const gatewayData = useMemo(() => {
    const counts = new Map<string, number>();
    invoices.forEach((inv) => {
      const name = (inv.payment_method || 'unknown').replace(/_/g, ' ');
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    const total = invoices.length || 1;
    return Array.from(counts.entries())
      .map(([name, count], i) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        value: Math.round((count / total) * 100),
        color: gatewayColors[i % gatewayColors.length],
      }))
      .sort((a, b) => b.count - a.count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, accentColor]);

  // SVG Chart Geometry
  const chartHeight = 220;
  const chartWidth = 560;
  const maxVal = Math.max(...revenueData.map((d) => d.revenue), 1);
  const pointX = (i: number) =>
    revenueData.length <= 1
      ? chartWidth / 2
      : (i / (revenueData.length - 1)) * (chartWidth - 40) + 20;
  const pointY = (v: number) => chartHeight - (v / maxVal) * (chartHeight - 40) - 20;

  const revenuePoints = revenueData.map((d, i) => `${pointX(i)},${pointY(d.revenue)}`).join(' ');
  const revenueArea =
    revenueData.length > 1
      ? `20,${chartHeight - 10} ${revenuePoints} ${chartWidth - 20},${chartHeight - 10}`
      : '';

  const upcomingExpirations = licenses
    .map((lic) => ({ lic, ...calculateDaysLeft(lic.expiry_date) }))
    .filter((item) => !item.isExpired && !item.isLifetime && item.days <= 45)
    .sort((a, b) => a.days - b.days)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12" aria-busy="true">
        <div className="h-36 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-slate-700 border-t-(--brand) rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {loadError && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 px-5 py-3 text-sm font-medium flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button onClick={loadData} className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold shrink-0">
            Retry
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0A1330] p-6 sm:p-8 border border-(--brand)/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--brand)/15 text-(--brand-ink) text-xs font-semibold mb-3 border border-(--brand)/30">
              <Sparkles className="w-3.5 h-3.5 text-(--brand-ink)" />
              Live Super Admin Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-(--brand-ink)">RM Rahul</span>!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Real-time software licensing metrics, automated key activations, subscription renewals, and live payment settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/licenses"
              className="px-4 py-2.5 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white text-sm font-semibold shadow-lg shadow-(--brand)/30 transition-all flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Issue New License</span>
            </Link>
            <Link
              to="/admin/keys"
              className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Bulk Keys</span>
            </Link>
          </div>
        </div>

        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-(--brand)/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Licenses</span>
            <ShieldCheck className="w-4 h-4 text-(--brand-ink)" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{totalLicenses}</span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">All created</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-400">{activeLicenses}</span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Currently valid</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Expiring &le; 30d</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-400">{expiringSoon}</span>
            <span className="block text-[11px] text-amber-300/80 font-medium mt-0.5">Renewals pending</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Expiring Today</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-400">{expiringToday}</span>
            <span className="block text-[11px] text-rose-300/80 font-medium mt-0.5">Urgent renewal</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Expired</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-300">{expiredLicenses}</span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Inactive keys</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Paused / Locked</span>
            <PauseCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{pausedLicenses}</span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">Admin hold</span>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards — real invoice data only (no profit estimate: no cost source exists) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Invoiced Revenue</span>
            <div className="p-2 rounded-xl bg-(--brand)/10 text-(--brand-ink)">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{formatCurrency(totalRevenue)}</span>
            <div className="text-xs text-slate-400 font-medium mt-1">
              {formatCurrency(paidRevenue)} collected from {paidInvoices.length} paid invoice{paidInvoices.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              Revenue — {dateRange === 'all' ? 'All Time' : `Last ${dateRange.replace('d', ' Days')}`}
            </span>
            <div className="p-2 rounded-xl bg-(--brand)/10 text-(--brand-ink)">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{formatCurrency(rangeRevenue)}</span>
            <div className="text-xs text-slate-400 font-medium mt-1">
              From {rangeInvoices.length} invoice{rangeInvoices.length === 1 ? '' : 's'} in this period
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Registered Users</span>
            <div className="p-2 rounded-xl bg-(--brand)/10 text-(--brand-ink)">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{users.length}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
              <Package className="w-3.5 h-3.5" />
              <span>{products.length} product{products.length === 1 ? '' : 's'} in catalog</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
              <p className="text-xs text-slate-400">Invoice totals (INR) grouped from real invoices</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-(--brand-ink) font-semibold mr-1">
                <span className="w-2.5 h-2.5 rounded-full bg-(--brand)"></span> Revenue
              </span>
              {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => { setDateRange(r); setHoveredPoint(null); }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase transition-all ${
                    dateRange === r
                      ? 'bg-(--brand) hover:bg-(--brand-hover) text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {!hasChartData ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <Receipt className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-400">No invoice revenue in this period</p>
              <p className="text-xs mt-1 max-w-xs">Revenue appears here once invoices exist. Try a wider date range.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden" onMouseLeave={() => setHoveredPoint(null)}>
              {hoveredPoint !== null && revenueData[hoveredPoint] && (
                <div
                  className="absolute -top-1 z-10 -translate-x-1/2 bg-[#0A1330] border border-(--brand)/40 text-white text-[11px] font-semibold rounded-xl px-2.5 py-1.5 pointer-events-none whitespace-nowrap shadow-xl"
                  style={{ left: `${(pointX(hoveredPoint) / chartWidth) * 100}%` }}
                >
                  {revenueData[hoveredPoint].label}: {formatCurrency(revenueData[hoveredPoint].revenue)}
                </div>
              )}
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 16}`} className="w-full h-64 overflow-visible">
                <defs>
                  <linearGradient id="svgRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent.brand} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={accent.brand} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = chartHeight - pct * (chartHeight - 40) - 20;
                  return (
                    <g key={idx}>
                      <line x1="20" y1={y} x2={chartWidth - 20} y2={y} stroke="#1e293b" strokeDasharray="4 4" />
                      <text x="0" y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">
                        ₹{Math.round((pct * maxVal) / 1000)}k
                      </text>
                    </g>
                  );
                })}

                {revenueArea && <polygon points={revenueArea} fill="url(#svgRevGrad)" />}
                {revenueData.length > 1 && (
                  <polyline fill="none" stroke={accent.brand} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={revenuePoints} />
                )}

                {revenueData.map((d, i) => {
                  const showLabel = revenueData.length <= 12 || i % 5 === 0 || i === revenueData.length - 1;
                  return (
                    <g key={i}>
                      <circle
                        cx={pointX(i)}
                        cy={pointY(d.revenue)}
                        r={hoveredPoint === i ? '6.5' : '4.5'}
                        fill={accent.brand}
                        stroke="#0f172a"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredPoint(i)}
                        style={{ cursor: 'pointer' }}
                      />
                      {showLabel && (
                        <text x={pointX(i)} y={chartHeight + 12} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
                          {d.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Payment Method Distribution Donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-white">Payment Method Distribution</h3>
            <p className="text-xs text-slate-400">Share of invoices by payment method</p>
          </div>

          {invoices.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-10">
              <Receipt className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-400">No invoices yet</p>
              <p className="text-xs mt-1">Payment methods will appear once invoices are issued.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center py-6">
                <svg width="180" height="180" viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="12" fill="none" />
                  {(() => {
                    const circumference = 2 * Math.PI * 38;
                    let offset = 0;
                    return gatewayData.map((g) => {
                      const len = (g.count / invoices.length) * circumference;
                      const el = (
                        <circle
                          key={g.name}
                          cx="50"
                          cy="50"
                          r="38"
                          stroke={g.color}
                          strokeWidth="12"
                          strokeDasharray={`${Math.max(len - 1, 0)} ${circumference}`}
                          strokeDashoffset={-offset}
                          fill="none"
                        />
                      );
                      offset += len;
                      return el;
                    });
                  })()}
                </svg>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                {gatewayData.map((g) => (
                  <div key={g.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }}></span>
                      <span className="text-slate-300 font-medium capitalize">{g.name}</span>
                      <span className="text-slate-500">({g.count})</span>
                    </div>
                    <span className="font-bold text-white">{g.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Purchases & Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent License Purchases</h3>
            <Link to="/admin/licenses" className="text-xs font-semibold text-(--brand-ink) hover:underline">
              View All
            </Link>
          </div>

          {licenses.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center text-slate-500">
              <ShieldCheck className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-400">No licenses yet</p>
              <p className="text-xs mt-1 mb-4">Issue the first license to see it here.</p>
              <Link to="/admin/licenses" className="px-4 py-2 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white text-xs font-bold transition-colors">
                Issue License
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {licenses.slice(0, 4).map((lic) => (
                <div key={lic.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-white">{lic.user?.full_name || 'Customer'}</div>
                    <div className="text-xs text-slate-400">{lic.product?.name || '—'}</div>
                    <div className="font-mono text-[11px] text-(--brand-ink) mt-0.5">{lic.license_key}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${
                      lic.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : lic.status === 'paused' || lic.status === 'locked'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {lic.status}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">{formatDate(lic.issue_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Upcoming Expirations</h3>
              {upcomingExpirations.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                  Action Required
                </span>
              )}
            </div>
            <Link to="/admin/licenses" className="text-xs font-semibold text-amber-400 hover:underline">
              Manage
            </Link>
          </div>

          {upcomingExpirations.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-400">Nothing expiring in the next 45 days</p>
              <p className="text-xs mt-1">All active licenses are comfortably within their term.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {upcomingExpirations.map(({ lic, text, days }) => (
                <div key={lic.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-white">{lic.user?.full_name || 'Customer'}</div>
                    <div className="text-xs text-slate-400">{lic.product?.name || '—'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{lic.user?.phone || lic.user?.email || ''}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      days <= 7
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {text}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">Expires {formatDate(lic.expiry_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
