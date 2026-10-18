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
} from 'lucide-react';
import { getProducts, getPlans } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Product, Plan } from '@/types';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    getProducts().then((p) => setProducts(p));
    getPlans().then((pl) => setPlans(pl));
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>Indane • HP Gas • Bharat Gas Verified Tools</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          गैस एजेंसी सॉफ्टवेयर और टूल्स कैटलॉग
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          LPG डिस्ट्रीब्यूटरों के लिए विशेष रूप से डिज़ाइन किए गए CDCMS Pro Multi-Tool, फास्ट कैश मेमो प्रिंटर और बल्क रीफिल एक्सटेंशन।
        </p>
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
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Tools' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((p) => {
          const productPlans = plans.filter((pl) => pl.product_id === p.id);
          const lowestPrice = productPlans.length > 0 ? Math.min(...productPlans.map((pl) => pl.price)) : 499;

          return (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all group"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={p.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop'}
                    alt={p.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {p.category}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                      {p.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">{p.version || 'v1.0.0'}</span>
                  </div>
                </div>

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
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Starts from</span>
                    <div className="font-black text-xl text-slate-900 dark:text-white">
                      {formatCurrency(lowestPrice)}
                    </div>
                  </div>

                  <Link
                    to={`/products/${p.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
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
    </div>
  );
};
