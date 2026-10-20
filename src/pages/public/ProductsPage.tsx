import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Check,
  Download,
  ArrowRight,
  Sparkles,
  PackageSearch,
} from 'lucide-react';
import { getProducts, getPlans } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Product, Plan } from '@/types';
import { GasBrandsShowcase } from '@/components/GasLogos';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getPlans()]).then(([p, pl]) => {
      setProducts(p);
      setPlans(pl);
      setIsLoading(false);
    });
  }, []);

  const categories = ['all', 'Browser Extension', 'Automation Script', 'Desktop Application'];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--brand)/10 text-(--brand) dark:text-(--brand-ink) text-xs font-bold border border-(--brand)/25">
          <Sparkles className="w-3.5 h-3.5 text-(--brand) dark:text-(--brand-ink)" />
          <span>Indane • HP Gas • Bharat Petroleum Official Support</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          Gas Agency Software & Tools Catalog
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Engineered specifically for LPG agency distributors: CDCMS Pro Multi-Tool, fast cash memo generator, and bulk refill extensions.
        </p>
      </div>

      {/* Brand Logos Strip */}
      <div className="py-4">
        <GasBrandsShowcase compact={true} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions, scripts..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-(--brand)"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-(--brand) text-white shadow-md shadow-(--brand)/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Tools' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
              </div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
          <PackageSearch className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No tools found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
            No products match {searchQuery ? `"${searchQuery}"` : 'this filter'} right now. Try a
            different search term or category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-5 px-5 py-2.5 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white text-xs font-bold transition-colors"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => {
            const productPlans = plans.filter((pl) => pl.product_id === p.id);
            const lowestPrice =
              productPlans.length > 0 ? Math.min(...productPlans.map((pl) => pl.price)) : 499;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:shadow-2xl hover:border-(--brand)/40 transition-all group"
              >
                <div>
                  <Link to={`/products/${p.slug}`} className="flex items-center gap-4 mb-4">
                    <img
                      src={p.logo_url || '/images/logos/hp-gas.png'}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-(--brand)/20 group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-(--brand) dark:text-(--brand-ink)">
                        {p.category}
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-(--brand) dark:group-hover:text-(--brand-ink) transition-colors">
                        {p.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">{p.version || 'v1.0.0'}</span>
                    </div>
                  </Link>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                    {p.short_description || p.description}
                  </p>

                  <div className="space-y-2 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    {p.features?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Starts from
                      </span>
                      <div className="font-black text-xl text-slate-900 dark:text-white">
                        {formatCurrency(lowestPrice)}
                      </div>
                    </div>

                    <Link
                      to={`/products/${p.slug}`}
                      className="px-4 py-2.5 rounded-xl bg-(--brand) hover:bg-(--brand-hover) text-white font-bold text-xs shadow-md shadow-(--brand)/25 transition-all flex items-center gap-1.5"
                    >
                      <span>View Plans</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
