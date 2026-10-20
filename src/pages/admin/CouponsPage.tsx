import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type CouponInput,
} from '@/services/couponService';
import type { Coupon } from '@/types';

type Banner = { type: 'success' | 'error'; message: string } | null;

const inputCls =
  'w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-(--brand)';
const primaryBtn =
  'px-4 py-2.5 rounded-full bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-(--brand)/30 transition-all flex items-center gap-2';

function isExpired(coupon: Coupon): boolean {
  return !!coupon.expires_at && new Date(coupon.expires_at) < new Date();
}

function formatExpiry(coupon: Coupon): string {
  if (!coupon.expires_at) return 'No expiry';
  return new Date(coupon.expires_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toDateInputValue(expiresAt?: string | null): string {
  if (!expiresAt) return '';
  // expires_at is a timestamptz — the date input only needs YYYY-MM-DD.
  return expiresAt.slice(0, 10);
}

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState<number | string>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | string>(0);
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getCoupons();
      if (!res.success) {
        setLoadError(res.error || 'Failed to load coupons.');
        setCoupons([]);
        return;
      }
      setCoupons(res.data || []);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load coupons.');
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setModalError(null);
    setCode('');
    setType('percentage');
    setValue(10);
    setMinOrderAmount(0);
    setUsageLimit('');
    setExpiryDate('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setModalError(null);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value);
    setMinOrderAmount(coupon.min_order_amount ?? 0);
    setUsageLimit(coupon.usage_limit != null ? String(coupon.usage_limit) : '');
    setExpiryDate(toDateInputValue(coupon.expires_at));
    setIsActive(coupon.is_active);
    setModalOpen(true);
  };

  const handleCopy = async (couponCode: string) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCode(couponCode);
      window.setTimeout(() => {
        setCopiedCode((prev) => (prev === couponCode ? null : prev));
      }, 1500);
    } catch {
      setBanner({ type: 'error', message: `Could not copy code “${couponCode}”.` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const normalizedCode = code.toUpperCase().trim();
    if (!normalizedCode) {
      setModalError('Coupon code is required.');
      return;
    }
    if (normalizedCode.length < 3 || normalizedCode.length > 24) {
      setModalError('Coupon code must be 3–24 characters long.');
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
      setModalError('Coupon code can only contain letters A–Z, numbers, hyphens and underscores.');
      return;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setModalError('Discount value must be greater than 0.');
      return;
    }
    if (type === 'percentage' && numericValue > 100) {
      setModalError('Percentage discount cannot exceed 100%.');
      return;
    }

    const numericMinOrder = minOrderAmount === '' ? 0 : Number(minOrderAmount);
    if (!Number.isFinite(numericMinOrder) || numericMinOrder < 0) {
      setModalError('Minimum order amount cannot be negative.');
      return;
    }

    let parsedUsageLimit: number | null = null;
    if (usageLimit.trim() !== '') {
      parsedUsageLimit = Number(usageLimit);
      if (!Number.isFinite(parsedUsageLimit) || parsedUsageLimit < 1) {
        setModalError('Usage limit must be at least 1, or leave it empty for unlimited.');
        return;
      }
      parsedUsageLimit = Math.floor(parsedUsageLimit);
    }

    if (!editingCoupon && expiryDate) {
      const expiry = new Date(`${expiryDate}T23:59:59`);
      if (expiry < new Date()) {
        setModalError('Expiry date cannot be in the past.');
        return;
      }
    }

    const input: CouponInput = {
      code: normalizedCode,
      type,
      value: numericValue,
      min_order_amount: numericMinOrder,
      usage_limit: parsedUsageLimit,
      expires_at: expiryDate ? new Date(`${expiryDate}T23:59:59`).toISOString() : null,
      is_active: isActive,
    };

    setIsSaving(true);
    try {
      const res = editingCoupon
        ? await updateCoupon(editingCoupon.id, input)
        : await createCoupon(input);
      if (!res.success) {
        setModalError(res.error || 'Could not save this coupon. Please try again.');
        return;
      }
      setModalOpen(false);
      setBanner({
        type: 'success',
        message: editingCoupon
          ? `Coupon “${normalizedCode}” updated.`
          : `Coupon “${normalizedCode}” created.`,
      });
      await loadCoupons();
    } catch (err: any) {
      setModalError(err?.message || 'Could not save this coupon. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setBanner(null);
    setTogglingId(coupon.id);
    try {
      const input: CouponInput = {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_order_amount: coupon.min_order_amount ?? 0,
        usage_limit: coupon.usage_limit ?? null,
        expires_at: coupon.expires_at ?? null,
        is_active: !coupon.is_active,
      };
      const res = await updateCoupon(coupon.id, input);
      if (!res.success) {
        setBanner({
          type: 'error',
          message: res.error || `Could not ${coupon.is_active ? 'deactivate' : 'activate'} coupon “${coupon.code}”.`,
        });
        return;
      }
      setBanner({
        type: 'success',
        message: `Coupon “${coupon.code}” ${coupon.is_active ? 'deactivated' : 'activated'}.`,
      });
      await loadCoupons();
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || `Could not update coupon “${coupon.code}”.` });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon “${coupon.code}”? This cannot be undone.`)) return;
    setBanner(null);
    try {
      const res = await deleteCoupon(coupon.id);
      if (!res.success) {
        setBanner({
          type: 'error',
          message: res.error || `Could not delete coupon “${coupon.code}”. It is still listed.`,
        });
        return;
      }
      setBanner({ type: 'success', message: `Coupon “${coupon.code}” deleted.` });
      await loadCoupons();
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || `Could not delete coupon “${coupon.code}”.` });
    }
  };

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.is_active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  const stats = [
    { label: 'Total Coupons', value: totalCoupons },
    { label: 'Active', value: activeCoupons },
    { label: 'Total Redemptions', value: totalRedemptions },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
            <Tag className="w-8 h-8 text-(--brand) dark:text-(--brand-ink)" />
            Coupons &amp; Discounts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create percentage and flat discount codes, set minimum orders, usage limits and expiry dates.
          </p>
        </div>

        <button onClick={openCreateModal} className={primaryBtn}>
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {banner && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
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

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl px-5 py-4 shadow-sm dark:shadow-xl"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-extrabold text-[#0A1330] dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-14 text-center shadow-sm dark:shadow-xl"
          aria-label="Loading coupons"
        >
          <Loader2 className="w-8 h-8 animate-spin text-(--brand) mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading coupons…</p>
        </div>
      ) : loadError ? (
        <div className="bg-white dark:bg-slate-900 border border-rose-500/30 rounded-3xl p-10 sm:p-14 text-center shadow-sm dark:shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-[#0A1330] dark:text-white">Could not load coupons</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">{loadError}</p>
          <button onClick={loadCoupons} className={`${primaryBtn} mx-auto mt-6`}>
            <span>Retry</span>
          </button>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 sm:p-14 text-center shadow-sm dark:shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-(--brand-soft) flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-(--brand)" />
          </div>
          <h2 className="text-lg font-bold text-[#0A1330] dark:text-white">No coupons yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
            Create your first discount code so customers can save at checkout.
          </p>
          <button onClick={openCreateModal} className={`${primaryBtn} mx-auto mt-6`}>
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4 font-bold">Code</th>
                  <th className="px-5 py-4 font-bold">Discount</th>
                  <th className="px-5 py-4 font-bold">Min Order</th>
                  <th className="px-5 py-4 font-bold">Usage</th>
                  <th className="px-5 py-4 font-bold">Expiry</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon);
                  const usagePercent =
                    coupon.usage_limit != null && coupon.usage_limit > 0
                      ? Math.min(100, ((coupon.used_count || 0) / coupon.usage_limit) * 100)
                      : 0;
                  return (
                    <tr
                      key={coupon.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#0A1330] dark:text-white">{coupon.code}</span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="p-1 rounded-lg text-slate-400 hover:text-[#0A1330] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Copy code"
                            aria-label={`Copy coupon code ${coupon.code}`}
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-(--brand) dark:text-(--brand-ink)">
                          {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-600 dark:text-slate-300 font-mono text-xs">
                          {coupon.used_count || 0} / {coupon.usage_limit != null ? coupon.usage_limit : '∞'}
                        </div>
                        {coupon.usage_limit != null && (
                          <div className="w-24 h-1.5 mt-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-(--brand)"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className={`px-5 py-4 ${expired ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                        {formatExpiry(coupon)}
                        {expired && <span className="block text-[10px] font-bold uppercase tracking-wider">Expired</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                              coupon.is_active
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            disabled={togglingId === coupon.id}
                            role="switch"
                            aria-checked={coupon.is_active}
                            aria-label={`${coupon.is_active ? 'Deactivate' : 'Activate'} coupon ${coupon.code}`}
                            title={coupon.is_active ? 'Deactivate coupon' : 'Activate coupon'}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                              coupon.is_active ? 'bg-(--brand)' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            {togglingId === coupon.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-white mx-auto" />
                            ) : (
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  coupon.is_active ? 'translate-x-[18px]' : 'translate-x-[2px]'
                                }`}
                              />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#0A1330] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Coupon"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Coupon */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#0A1330] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#0A1330] dark:text-white mb-1">
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Set the code, discount type and value, and any order, usage or expiry limits.
            </p>

            {modalError && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 mb-4" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE50"
                  className={`${inputCls} font-mono uppercase`}
                  maxLength={24}
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">3–24 characters: A–Z, 0–9, hyphen or underscore.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount Type</label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setType('percentage')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      type === 'percentage'
                        ? 'bg-(--brand) text-white shadow-md shadow-(--brand)/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-[#0A1330] dark:hover:text-white'
                    }`}
                  >
                    Percentage %
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('flat')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      type === 'flat'
                        ? 'bg-(--brand) text-white shadow-md shadow-(--brand)/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-[#0A1330] dark:hover:text-white'
                    }`}
                  >
                    Flat ₹
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Value {type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    min={0}
                    step="any"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    min={0}
                    step="any"
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    min={1}
                    placeholder="Unlimited"
                    className={inputCls}
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Leave empty for unlimited.</p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expiry Date (optional)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="couponIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 accent-(--brand)"
                />
                <label htmlFor="couponIsActive" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Coupon is Active &amp; redeemable at checkout
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-full bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-50 text-white font-semibold shadow-lg shadow-(--brand)/30 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving…' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
