import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Sparkles,
  IndianRupee,
} from 'lucide-react';
import {
  getPlans,
  getProducts,
  savePlan,
  deletePlan,
} from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Plan, Product } from '@/types';

export const PricingPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form State
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(999);
  const [billingPeriod, setBillingPeriod] = useState<any>('monthly');
  const [durationDays, setDurationDays] = useState(30);
  const [maxDevices, setMaxDevices] = useState(1);
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [pList, prList] = await Promise.all([getPlans(), getProducts()]);
    setPlans(pList);
    setProducts(prList);
    if (prList.length > 0) setProductId(prList[0].id);
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setDescription('Full access with hardware binding and updates.');
    setPrice(999);
    setBillingPeriod('monthly');
    setDurationDays(30);
    setMaxDevices(1);
    setFeatures('1 PC License\nFree Updates\nAnti-ban support');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Plan) => {
    setEditingPlan(p);
    setProductId(p.product_id);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    setBillingPeriod(p.billing_period);
    setDurationDays(p.duration_days);
    setMaxDevices(p.max_devices);
    setFeatures(p.features ? p.features.join('\n') : '');
    setIsActive(p.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Plan> = {
      id: editingPlan?.id,
      product_id: productId,
      name,
      description,
      price: Number(price),
      billing_period: billingPeriod,
      duration_days: Number(durationDays),
      max_devices: Number(maxDevices),
      features: features.split('\n').filter((f) => f.trim() !== ''),
      is_active: isActive,
      sort_order: editingPlan ? editingPlan.sort_order : plans.length + 1,
    };

    const res = await savePlan(payload);
    if (res.success) {
      setModalOpen(false);
      loadAll();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this plan edition?')) return;
    await deletePlan(id);
    loadAll();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-indigo-400" />
            Pricing & License Plans
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure subscription intervals, lifetime access pricing, device hardware slots, and customer perks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const prod = products.find((p) => p.id === plan.product_id);

          return (
            <div
              key={plan.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    {prod?.name || 'General Product'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    plan.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {plan.billing_period}
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-xl">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-4">
                  <span className="text-3xl font-black text-white">{formatCurrency(plan.price)}</span>
                  <span className="text-xs text-slate-400">
                    / {plan.duration_days >= 3650 ? 'Lifetime' : `${plan.duration_days} days`}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-2xl mb-4 text-xs text-slate-300 flex items-center justify-between">
                  <span>Hardware Slots</span>
                  <strong className="text-white font-mono">{plan.max_devices} PC / Extension</strong>
                </div>

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
                  onClick={() => handleDelete(plan.id)}
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

      {/* Modal: Add/Edit Plan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Billing Interval</label>
                  <select
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-[11px]"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Devices</label>
                  <input
                    type="number"
                    value={maxDevices}
                    onChange={(e) => setMaxDevices(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
