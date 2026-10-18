import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getProductBySlug,
  getPlans,
} from '@/services/productService';
import {
  KeyRound,
  Download,
  ShieldCheck,
  Check,
  Lock,
  ArrowLeft,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product, Plan } from '@/types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      if (p) {
        getPlans(p.id).then((pl) => setPlans(pl));
      }
      setIsLoading(false);
    });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-slate-400">The requested extension or script could not be found.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Products</span>
      </Link>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={product.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop'}
              alt={product.name}
              className="w-20 h-20 rounded-3xl object-cover ring-2 ring-indigo-500/20 shadow-lg shrink-0"
            />
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
                {product.name}
              </h1>
              <span className="text-xs text-slate-400 font-mono mt-1 block">
                Current Release: {product.version || 'v1.0.0'}
              </span>
            </div>
          </div>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description || product.short_description}
          </p>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Verified Core Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
              {product.features?.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Download / Info Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-white">
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Download Extension</h3>
            <p className="text-xs text-slate-400">
              Download the extension file (.crx / zip) or desktop installer. You will need an active license key to unlock features.
            </p>
          </div>

          {product.download_url && (
            <a
              href={product.download_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Extension Binary</span>
            </a>
          )}

          <div className="pt-4 border-t border-slate-800 space-y-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>VirusTotal & Chrome Store Verified Clean</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Anti-Piracy Hardware Device Binding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Section */}
      <div className="space-y-8 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Available Licensing Plans
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose your duration and device limit. Instant key delivery right after checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isYearly = plan.billing_period === 'yearly' || plan.duration_days >= 365;
            const isPopular = plan.billing_period === 'semi_annual' || plan.duration_days === 180;
            const periodLabel =
              plan.billing_period === 'yearly'
                ? '1 Year'
                : plan.billing_period === 'semi_annual'
                ? '6 Months'
                : plan.billing_period === 'quarterly'
                ? '3 Months'
                : '1 Month';

            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all relative ${
                  isPopular
                    ? 'border-2 border-orange-500 shadow-orange-500/20'
                    : isYearly
                    ? 'border-2 border-blue-500/80 shadow-blue-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap">
                    Most Popular (6M)
                  </span>
                )}
                {isYearly && !isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap">
                    Best Value (1Y)
                  </span>
                )}

                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    {periodLabel} Plan
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {plan.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 my-5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {periodLabel.toLowerCase()}
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
    </div>
  );
};
