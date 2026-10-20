import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Check,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Clock,
} from 'lucide-react';
import { getPlans, getProducts } from '@/services/productService';
import { formatCurrency, getPlanDisplay } from '@/lib/utils';
import type { Plan, Product } from '@/types';
import { GasBrandsShowcase } from '@/components/GasLogos';

export const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlans(), getProducts()]).then(([pl, pr]) => {
      setPlans(pl);
      setProducts(pr);
      setIsLoading(false);
    });
  }, []);

  const durations = [
    { id: 'all', label: 'All Durations' },
    { id: 'monthly', label: '1 Month' },
    { id: 'quarterly', label: '3 Months' },
    { id: 'semi_annual', label: '6 Months' },
    { id: 'yearly', label: '1 Year' },
    { id: 'lifetime', label: 'Lifetime' },
  ];

  const filteredPlans = plans.filter((p) => {
    const matchesProduct = selectedProductId === 'all' || p.product_id === selectedProductId;
    const matchesDuration = selectedDuration === 'all' || p.billing_period === selectedDuration;
    return matchesProduct && matchesDuration;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E40FF]/10 text-[#1E40FF] dark:text-[#7d92ff] text-xs font-bold border border-[#1E40FF]/25">
          <Sparkles className="w-3.5 h-3.5 text-[#1E40FF] dark:text-[#7d92ff]" />
          <span>Flexible Plans for Every Tool: Monthly • Quarterly • Annual • Lifetime</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          Transparent Gas Agency License Plans
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Transparent per-product plans with GST invoice included. Choose the duration that fits your agency — instant automated license key delivery upon checkout.
        </p>

        {/* Product Filter Tabs */}
        <div className="pt-4 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedProductId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedProductId === 'all'
                ? 'bg-[#1E40FF] text-white shadow-md shadow-[#1E40FF]/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#1E40FF]/40'
            }`}
          >
            All Products
          </button>
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedProductId === p.id
                  ? 'bg-[#1E40FF] text-white shadow-md shadow-[#1E40FF]/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#1E40FF]/40'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Duration Filter Pill Switcher */}
        <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
          {durations.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDuration(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDuration === d.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Logos Compact Showcase */}
      <div className="py-2">
        <GasBrandsShowcase compact={true} />
      </div>

      {/* Pricing Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-pulse"
            >
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4" />
              <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-6" />
              <div className="space-y-2.5">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
              </div>
              <div className="h-11 bg-slate-200 dark:bg-slate-800 rounded-2xl mt-7" />
            </div>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl max-w-2xl mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No plans for this selection</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
            This duration is not offered for the selected product right now. Try another duration or view all plans.
          </p>
          <button
            onClick={() => {
              setSelectedProductId('all');
              setSelectedDuration('all');
            }}
            className="mt-5 px-5 py-2.5 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] text-white text-xs font-bold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => {
            const prod = products.find((p) => p.id === plan.product_id);
            const d = getPlanDisplay(plan);

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all relative bg-white dark:bg-slate-900 border ${
                  d.isPopular
                    ? 'border-2 border-[#1E40FF] shadow-[#1E40FF]/15'
                    : d.isLifetime
                    ? 'border-2 border-violet-500/70 shadow-violet-500/10'
                    : d.isYearly
                    ? 'border-2 border-sky-500/60 shadow-sky-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-[#1E40FF]/40'
                }`}
              >
                {d.badge && (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap ${
                      d.isLifetime
                        ? 'bg-gradient-to-r from-violet-600 to-purple-500'
                        : d.isPopular
                        ? 'bg-gradient-to-r from-[#1E40FF] to-blue-500'
                        : 'bg-gradient-to-r from-sky-600 to-cyan-500'
                    }`}
                  >
                    {d.badge}
                    {d.isPopular || d.isYearly ? ` (${d.periodLabel})` : ''}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E40FF] dark:text-[#7d92ff]">
                      {d.periodLabel} Plan
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {d.durationLabel}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {prod?.name || 'LPG Agency Tool'}
                  </p>

                  <div className="flex items-baseline gap-1 my-5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-slate-400">/ {d.priceSuffix}</span>
                  </div>

                  <div className="space-y-2.5 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-semibold text-[#1E40FF] dark:text-[#7d92ff]">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>{plan.max_devices} PC Hardware Lock</span>
                    </div>
                    {plan.features?.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/checkout/${plan.id}`}
                  className={`w-full mt-6 py-3 rounded-2xl font-bold text-xs text-center shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                    d.isPopular
                      ? 'bg-[#1E40FF] hover:bg-[#1740D6] text-white shadow-[#1E40FF]/30'
                      : d.isLifetime
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30'
                      : d.isYearly
                      ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Buy License</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
