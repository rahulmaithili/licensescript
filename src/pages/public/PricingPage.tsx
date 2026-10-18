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
import { formatCurrency } from '@/lib/utils';
import type { Plan, Product } from '@/types';
import { GasBrandsShowcase } from '@/components/GasLogos';

export const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  useEffect(() => {
    Promise.all([getPlans(), getProducts()]).then(([pl, pr]) => {
      setPlans(pl);
      setProducts(pr);
    });
  }, []);

  const durations = [
    { id: 'all', label: 'All Durations' },
    { id: 'monthly', label: '1 Month' },
    { id: 'quarterly', label: '3 Months' },
    { id: 'semi_annual', label: '6 Months' },
    { id: 'yearly', label: '1 Year' },
  ];

  const filteredPlans = plans.filter((p) => {
    const matchesProduct = selectedProductId === 'all' || p.product_id === selectedProductId;
    const matchesDuration = selectedDuration === 'all' || p.billing_period === selectedDuration;
    return matchesProduct && matchesDuration;
  });

  const getDurationLabel = (bp?: string, days?: number) => {
    if (bp === 'yearly' || (days && days >= 365)) return '1 Year Plan';
    if (bp === 'semi_annual' || (days && days >= 180)) return '6 Months Plan';
    if (bp === 'quarterly' || (days && days >= 90)) return '3 Months Plan';
    return '1 Month Plan';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>Standardized Pricing Across All Products: 1 Month • 3 Months • 6 Months • 1 Year</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          Transparent Gas Agency License Plans
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Every tool comes with identical, transparent subscription tiers — 1 Month, 3 Months, 6 Months, or 1 Year. Instant automated license key delivery upon checkout.
        </p>

        {/* Product Filter Tabs */}
        <div className="pt-4 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedProductId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedProductId === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-500/30'
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
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-500/30'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlans.map((plan) => {
          const prod = products.find((p) => p.id === plan.product_id);
          const isYearly = plan.billing_period === 'yearly' || plan.duration_days >= 365;
          const isPopular = plan.billing_period === 'semi_annual' || plan.duration_days === 180;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all relative ${
                isPopular
                  ? 'bg-gradient-to-b from-orange-950/40 via-slate-900 to-slate-900 border-2 border-orange-500 shadow-orange-500/20'
                  : isYearly
                  ? 'bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border-2 border-blue-500/80 shadow-blue-500/10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/40'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap">
                  Most Popular (6 Months)
                </span>
              )}
              {isYearly && !isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap">
                  Best Value (1 Year)
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    {getDurationLabel(plan.billing_period, plan.duration_days)}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {plan.duration_days} Days
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
                  <span className="text-xs text-slate-400">
                    / {plan.billing_period === 'yearly' ? '1 year' : plan.billing_period === 'semi_annual' ? '6 months' : plan.billing_period === 'quarterly' ? '3 months' : '1 month'}
                  </span>
                </div>

                <div className="space-y-2.5 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-semibold text-orange-600 dark:text-orange-400">
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
                  isPopular
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/30'
                    : isYearly
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
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
    </div>
  );
};
