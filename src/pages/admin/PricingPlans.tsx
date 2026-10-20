import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import {
  getPlans,
  getProducts,
  savePlan,
  deletePlan,
} from '@/services/productService';
import { formatCurrency, getPlanDisplay } from '@/lib/utils';
import type { Plan, Product } from '@/types';

type Banner = { type: 'success' | 'error'; message: string } | null;
type BillingPeriod = Plan['billing_period'];

const PERIOD_DAYS: Record<BillingPeriod, number> = {
  monthly: 30,
  quarterly: 90,
  semi_annual: 180,
  yearly: 365,
  lifetime: 3650,
};

// Features are edited one-per-line in the form, but also accept
// comma-separated input — always store a clean string[].
function parseFeatures(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((f) => f.trim())
    .filter((f) => f !== '');
}

function featuresToText(features?: string[] | string): string {
  if (Array.isArray(features)) return features.join('\n');
  return features || '';
}

const inputCls =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#1E40FF]';
const primaryBtn =
  'px-4 py-2.5 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-[#1E40FF]/30 transition-all flex items-center gap-2';

export const PricingPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form State
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(999);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [durationDays, setDurationDays] = useState(30);
  const [maxDevices, setMaxDevices] = useState(1);
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [pList, prList] = await Promise.all([getPlans(), getProducts()]);
      setPlans(pList);
      setProducts(prList);
      if (prList.length > 0) {
        setProductId((prev) =>
          prev && prList.some((p) => p.id === prev) ? prev : prList[0].id,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setModalError(null);
    setProductId(products[0]?.id || '');
    setName('');
    setDescription('');
    setPrice(999);
    setBillingPeriod('monthly');
    setDurationDays(30);
    setMaxDevices(1);
    setFeatures('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Plan) => {
    setEditingPlan(p);
    setModalError(null);
    setProductId(p.product_id);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    // billing_period is derived by the service from is_lifetime/duration —
    // it is the correct current label for the form's period selector.
    setBillingPeriod(p.billing_period);
    setDurationDays(p.duration_days);
    setMaxDevices(p.max_devices);
    setFeatures(featuresToText(p.features));
    setIsActive(p.is_active);
    setModalOpen(true);
  };

  const handlePeriodChange = (period: BillingPeriod) => {
    setBillingPeriod(period);
    // Keep duration in sync with the chosen period (lifetime => 3650 days,
    // which the service maps to the real is_lifetime column).
    setDurationDays(PERIOD_DAYS[period]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!productId) {
      setModalError('No product selected. Create a product in the Product Catalog first, then add its plans here.');
      return;
    }
    // NOTE: billing_period is sent as-is on purpose — productService.savePlan
    // strips it before saving and syncs the real is_lifetime column from it.
    const payload: Partial<Plan> = {
      id: editingPlan?.id,
      product_id: productId,
      name: name.trim(),
      description,
      price: Number(price),
      billing_period: billingPeriod,
      duration_days: Number(durationDays),
      max_devices: Number(maxDevices),
      features: parseFeatures(features),
      is_active: isActive,
      sort_order: editingPlan ? editingPlan.sort_order : plans.length + 1,
    };

    setIsSaving(true);
    try {
      const res = await savePlan(payload);
      if (!res.success) {
        setModalError(res.error || 'Could not save this plan. Please try again.');
        return;
      }
      setModalOpen(false);
      setBanner({
        type: 'success',
        message: editingPlan ? `Plan “${payload.name}” updated.` : `Plan “${payload.name}” created.`,
      });
      await loadAll();
    } catch (err: any) {
      setModalError(err?.message || 'Could not save this plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, planName: string) => {
    if (!window.confirm('Delete this plan edition?')) return;
    setBanner(null);
    try {
      const ok = await deletePlan(id);
      if (!ok) {
        setBanner({ type: 'error', message: `Could not delete plan “${planName}”. It is still listed.` });
        return;
      }
      setBanner({ type: 'success', message: `Plan “${planName}” deleted.` });
      await loadAll();
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || `Could not delete plan “${planName}”.` });
    }
  };

  const noProducts = !isLoading && products.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-[#8fa0ff]" />
            Pricing & License Plans
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure subscription intervals, lifetime access pricing, device hardware slots, and customer perks.
          </p>
        </div>

        <button onClick={openCreateModal} disabled={noProducts} className={primaryBtn}>
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </button>
      </div>

      {banner && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
          role={banner.type === 'error' ? 'alert' : 'status'}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{banner.message}</span>
          <button onClick={() => setBanner(null)} className="text-current opacity-70 hover:opacity-100" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {noProducts && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#1E40FF]/30 bg-[#1E40FF]/10 px-4 py-3 text-sm text-slate-200">
          <Package className="w-4 h-4 shrink-0 mt-0.5 text-[#8fa0ff]" />
          <span>
            No products exist yet, so there is nothing to attach a plan to. Add a product in the{' '}
            <strong className="text-white">Product Catalog</strong> first, then come back to create its pricing plans.
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading plans">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-pulse">
              <div className="h-4 w-28 bg-slate-800 rounded mb-3" />
              <div className="h-6 w-2/3 bg-slate-800 rounded mb-3" />
              <div className="h-8 w-1/2 bg-slate-800 rounded mb-4" />
              <div className="h-10 w-full bg-slate-800 rounded-2xl mb-4" />
              <div className="h-3 w-full bg-slate-800 rounded mb-2" />
              <div className="h-3 w-2/3 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-3xl p-10 sm:p-14 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF1FF] flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-[#1E40FF]" />
          </div>
          <h2 className="text-lg font-bold text-white">No pricing plans yet</h2>
          <p className="text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
            {noProducts
              ? 'Plans belong to a product, and your catalog is empty. Add a product first, then create its plans.'
              : 'Create your first plan — monthly, yearly, or lifetime — so customers can buy a license.'}
          </p>
          {!noProducts && (
            <button onClick={openCreateModal} className={`${primaryBtn} mx-auto mt-6`}>
              <Plus className="w-4 h-4" />
              <span>Create Your First Plan</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const prod = products.find((p) => p.id === plan.product_id);
            const display = getPlanDisplay(plan);

            return (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className="text-xs text-[#8fa0ff] font-bold uppercase tracking-wider truncate">
                      {prod?.name || plan.product?.name || 'Unassigned Product'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                        plan.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-white text-xl">{plan.name}</h3>
                    {display.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#1E40FF]/10 text-[#8fa0ff] border border-[#1E40FF]/25">
                        {display.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                    <span className="text-3xl font-black text-white">{formatCurrency(plan.price)}</span>
                    <span className="text-xs text-slate-400">/ {display.priceSuffix}</span>
                  </div>

                  <div className="bg-slate-800/60 p-3 rounded-2xl mb-4 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Billing Period</span>
                      <strong className="text-white">{display.periodLabel}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <strong className="text-white font-mono">{display.durationLabel}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hardware Slots</span>
                      <strong className="text-white font-mono">{plan.max_devices} PC / Extension</strong>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{plan.description}</p>
                  )}

                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2 py-2 border-t border-slate-800 text-xs text-slate-400">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit Plan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id, plan.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add/Edit Plan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              {editingPlan ? 'Edit Plan' : 'Create Pricing Plan'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">Set duration, hardware activations and INR price.</p>

            {modalError && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 mb-4" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Product</label>
                <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputCls} disabled={products.length === 0}>
                  {products.length === 0 ? (
                    <option value="">No products available — create one first</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Plan Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. VIP Lifetime"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={0}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What this edition includes…"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Billing Interval</label>
                  <select
                    value={billingPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value as BillingPeriod)}
                    className={`${inputCls} px-2 text-[11px]`}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi_annual">6 Months</option>
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Days Valid</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    min={1}
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Devices</label>
                  <input
                    type="number"
                    value={maxDevices}
                    onChange={(e) => setMaxDevices(Number(e.target.value))}
                    min={1}
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Features (One per line, or comma-separated)</label>
                <textarea
                  rows={3}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder={'Free updates\nPriority support'}
                  className={`${inputCls} font-mono`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="planIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 accent-[#1E40FF]"
                />
                <label htmlFor="planIsActive" className="text-slate-300 font-semibold cursor-pointer">
                  Plan is Active & available for purchase
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || products.length === 0}
                  className="px-5 py-2 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white font-semibold shadow-lg shadow-[#1E40FF]/30 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving…' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
