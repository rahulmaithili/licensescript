import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Download,
  Copy,
  Check,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Play,
  Pause,
  RefreshCw,
  Printer,
  RotateCcw,
  Monitor,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  getLicenses,
  createManualLicense,
  updateLicense,
  deleteLicense,
  toggleLicenseLock,
  extendLicenseDays,
  resetLicenseDevices,
  regenerateLicenseKey,
  updateLicenseStatus,
  getLicenseActivations,
} from '@/services/licenseService';
import { getProducts, getPlans } from '@/services/productService';
import { getUsers } from '@/services/userService';
import { generateLicenseCertificatePDF } from '@/services/invoiceService';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateDaysLeft,
  copyToClipboard,
  getPlanDisplay,
  getEffectiveLicenseStatus,
} from '@/lib/utils';
import type {
  License,
  Product,
  Plan,
  Profile,
  LicensePriority,
  PaymentMethod,
  LicenseActivation,
} from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export const UserLicenses: React.FC = () => {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';

  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters & Search — initialised from ?q= (AdminLayout header search navigates here)
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Keep the search box in sync when the ?q= param changes (e.g. a new header search)
  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);

  // Any filter change returns to page 1 — otherwise a later page can look empty
  // even though matches exist on earlier pages.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, productFilter, pageSize]);

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editLicense, setEditLicense] = useState<License | null>(null);
  const [detailsLicense, setDetailsLicense] = useState<License | null>(null);
  const [renewLicense, setRenewLicense] = useState<License | null>(null);
  const [renewDays, setRenewDays] = useState<number>(30);
  const [notification, setNotification] = useState<ToastState>(null);

  // Edit form state
  const [editMaxDevices, setEditMaxDevices] = useState(1);
  const [editPriority, setEditPriority] = useState<LicensePriority>('normal');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<License['status']>('active');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Details: device activations
  const [activations, setActivations] = useState<LicenseActivation[]>([]);
  const [isLoadingActivations, setIsLoadingActivations] = useState(false);

  // Form State for Add License — customer/product/plan are REAL ids from services
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [maxDevices, setMaxDevices] = useState(1);
  const [amountPaid, setAmountPaid] = useState(999);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<LicensePriority>('normal');
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [lics, prods, plns, usrs] = await Promise.all([
        getLicenses(),
        getProducts(),
        getPlans(),
        getUsers(),
      ]);
      setLicenses(lics);
      setProducts(prods);
      setPlans(plns);
      setUsers(usrs);
      if (prods.length > 0) setSelectedProduct((prev) => prev || prods[0].id);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load licenses. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load activations whenever a license's details are opened
  useEffect(() => {
    if (!detailsLicense) {
      setActivations([]);
      return;
    }
    let cancelled = false;
    setIsLoadingActivations(true);
    getLicenseActivations(detailsLicense.id)
      .then((rows) => {
        if (!cancelled) setActivations((rows || []) as LicenseActivation[]);
      })
      .catch(() => {
        if (!cancelled) setActivations([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingActivations(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detailsLicense]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopy = async (key: string) => {
    await copyToClipboard(key);
    setCopiedKey(key);
    showToast('License key copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Effective status — an ACTIVE license past its expiry reads as expired
  // everywhere (badge, filter, kanban, details), without mutating raw status.
  const effectiveStatusOf = (lic: License): string =>
    getEffectiveLicenseStatus({
      status: lic.status,
      expiry_date: lic.expiry_date,
      is_lifetime: lic.plan ? getPlanDisplay(lic.plan).isLifetime : undefined,
    });

  // Filtered list
  const filteredLicenses = licenses.filter((lic) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      lic.license_key.toLowerCase().includes(q) ||
      lic.user?.full_name?.toLowerCase().includes(q) ||
      lic.user?.email?.toLowerCase().includes(q) ||
      lic.product?.name?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'expiring_soon'
        ? calculateDaysLeft(lic.expiry_date).days <= 30 && !calculateDaysLeft(lic.expiry_date).isExpired
        : statusFilter === 'locked'
        ? lic.status === 'locked' || lic.is_locked
        : effectiveStatusOf(lic) === statusFilter;

    const matchesProduct = productFilter === 'all' ? true : lic.product_id === productFilter;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLicenses.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLicenses = filteredLicenses.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const plansForSelectedProduct = plans.filter(
    (p) => !selectedProduct || p.product_id === selectedProduct
  );
  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Actions — every one checks the service result and surfaces failures
  const handleToggleLock = async (lic: License) => {
    const updated = await toggleLicenseLock(lic.id, !lic.is_locked);
    if (updated) {
      showToast(`License ${lic.is_locked ? 'unlocked' : 'locked'} successfully!`);
      loadAll();
    } else {
      showToast('Could not update the license lock. Please try again.', 'error');
    }
  };

  const handleTogglePause = async (lic: License) => {
    const nextStatus = lic.status === 'paused' ? 'active' : 'paused';
    const updated = await updateLicenseStatus(lic.id, nextStatus);
    if (updated) {
      showToast(`License set to ${nextStatus.toUpperCase()}`);
      loadAll();
    } else {
      showToast('Could not change the license status. Please try again.', 'error');
    }
  };

  const handleRevoke = async (lic: License) => {
    if (!window.confirm(`Revoke license permanently: ${lic.license_key}?`)) return;
    const updated = await updateLicenseStatus(lic.id, 'revoked');
    if (updated) {
      showToast('License permanently revoked');
      loadAll();
    } else {
      showToast('Could not revoke this license. Please try again.', 'error');
    }
  };

  const handleDelete = async (lic: License) => {
    if (!window.confirm(`Delete license record: ${lic.license_key}?`)) return;
    const deleted = await deleteLicense(lic.id);
    if (deleted) {
      showToast('License record deleted');
      loadAll();
    } else {
      showToast('Could not delete this license. Please try again.', 'error');
    }
  };

  const handleResetHWID = async (lic: License) => {
    if (!window.confirm(`Reset device activations for ${lic.license_key}?`)) return;
    const ok = await resetLicenseDevices(lic.id);
    if (ok) {
      showToast('Device activations reset to 0 devices');
      loadAll();
    } else {
      showToast('Could not reset device activations. Please try again.', 'error');
    }
  };

  const handleRegenerateKey = async (lic: License) => {
    if (!window.confirm(`Generate a brand new key for this customer?`)) return;
    const res = await regenerateLicenseKey(lic.id);
    if (res.success) {
      showToast(`New key generated: ${res.newKey}`);
      loadAll();
    } else {
      showToast('Could not regenerate the license key. Please try again.', 'error');
    }
  };

  const handleRenewSubmit = async () => {
    if (!renewLicense) return;
    const success = await extendLicenseDays(renewLicense.id, renewLicense.expiry_date, renewDays);
    if (success) {
      showToast(`License extended by ${renewDays} days!`);
      setRenewLicense(null);
      loadAll();
    } else {
      showToast('Could not extend this license. Please try again.', 'error');
    }
  };

  const openEdit = (lic: License) => {
    setEditLicense(lic);
    setEditMaxDevices(lic.max_devices || 1);
    setEditPriority(lic.priority || 'normal');
    setEditNotes(lic.notes || '');
    setEditStatus(lic.status);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLicense) return;
    setIsSavingEdit(true);
    setEditError(null);
    const res = await updateLicense(editLicense.id, {
      max_devices: Number(editMaxDevices),
      priority: editPriority,
      notes: editNotes,
      status: editStatus,
    });
    setIsSavingEdit(false);
    if (res.success) {
      showToast('License updated successfully!');
      setEditLicense(null);
      loadAll();
    } else {
      setEditError(res.error || 'Could not update this license. Please try again.');
    }
  };

  const handleCreateManualLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedUserId) {
      setFormError('Select an existing customer. Licenses can only be issued to a registered user account.');
      return;
    }
    if (!selectedProduct) {
      setFormError('Select a product. Create a product first if none exist.');
      return;
    }
    setIsCreating(true);
    const res = await createManualLicense({
      userId: selectedUserId,
      productId: selectedProduct,
      planId: selectedPlan || undefined,
      durationDays: Number(durationDays),
      maxDevices: Number(maxDevices),
      priority,
      notes,
      amountPaid: Number(amountPaid),
      paymentMethod,
      paymentStatus: 'paid',
    });
    setIsCreating(false);

    if (res.success) {
      showToast(`License created! Key: ${res.license?.license_key}`);
      setAddModalOpen(false);
      setFormError(null);
      loadAll();
    } else {
      // DB failure — surface it, keep the modal open, do NOT pretend it was created
      setFormError(res.error || 'License could not be saved. Please try again.');
      showToast(`License creation failed: ${res.error || 'unknown error'}`, 'error');
    }
  };

  const handleBulkLock = async (lock: boolean) => {
    let failed = 0;
    for (const id of selectedIds) {
      const ok = await toggleLicenseLock(id, lock);
      if (!ok) failed++;
    }
    if (failed > 0) {
      showToast(
        `${lock ? 'Locked' : 'Unlocked'} ${selectedIds.length - failed} of ${selectedIds.length} licenses — ${failed} failed.`,
        'error'
      );
    } else {
      showToast(`Bulk ${lock ? 'locked' : 'unlocked'} ${selectedIds.length} licenses.`);
    }
    setSelectedIds([]);
    loadAll();
  };

  const handleExportCSV = () => {
    if (filteredLicenses.length === 0) {
      showToast('No licenses to export for the current filters.', 'error');
      return;
    }
    const headers = 'SL,Customer Name,Customer Email,Product,Plan,License Key,Issue Date,Expiry Date,Days Left,Status,Max Devices\n';
    const rows = filteredLicenses
      .map((l, i) => {
        const { text } = calculateDaysLeft(l.expiry_date);
        return `"${i + 1}","${l.user?.full_name || ''}","${l.user?.email || ''}","${l.product?.name || ''}","${l.plan?.name || ''}","${l.license_key}","${formatDate(l.issue_date)}","${formatDate(l.expiry_date)}","${text}","${l.status}","${l.max_devices}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Licenses-Export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const detailsEffectiveStatus = detailsLicense ? effectiveStatusOf(detailsLicense) : null;
  const detailsDaysInfo = detailsLicense ? calculateDaysLeft(detailsLicense.expiry_date) : null;

  const inputCls =
    'w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-(--brand)';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 ${
            notification.type === 'error' ? 'bg-rose-600' : 'bg-(--brand)'
          }`}
          role="status"
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-white shrink-0" />
          ) : (
            <Check className="w-5 h-5 text-emerald-300 shrink-0" />
          )}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {loadError && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 px-5 py-3 text-sm font-medium flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button onClick={loadAll} className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold shrink-0">
            Retry
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-(--brand-ink)" />
            User Licenses Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage software activations, customer keys, device locks, renewals, and offline sales.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => { setAddModalOpen(true); setFormError(null); }}
            className="px-4 py-2.5 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white text-sm font-semibold shadow-lg shadow-(--brand)/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Issue License</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded-full p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-(--brand) text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-(--brand) text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban Board
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search key, name, email..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-(--brand)"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--brand)"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon (≤30d)</option>
              <option value="expired">Expired</option>
              <option value="paused">Paused</option>
              <option value="locked">Locked</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--brand)"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="bg-[#0A1330] border border-(--brand)/40 rounded-2xl p-3 px-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-slate-200 font-semibold">
            {selectedIds.length} licenses selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkLock(true)}
              className="px-3 py-1.5 bg-(--brand) hover:bg-(--brand-hover) text-white rounded-full text-xs font-semibold"
            >
              Lock Selected
            </button>
            <button
              onClick={() => handleBulkLock(false)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold"
            >
              Unlock Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-semibold"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-xl" aria-busy="true">
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
            <span className="w-8 h-8 border-2 border-slate-700 border-t-(--brand) rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading licenses…</p>
          </div>
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedLicenses.length && paginatedLicenses.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(paginatedLicenses.map((l) => l.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-slate-700 bg-slate-800"
                    />
                  </th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product, Plan & License Key</th>
                  <th className="p-4">Validity & Days Left</th>
                  <th className="p-4">Devices</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center">
                      <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                      {licenses.length === 0 ? (
                        <>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">No licenses yet</p>
                          <p className="text-xs text-slate-500 mt-1 mb-4">Issue the first license for a registered customer.</p>
                          <button
                            onClick={() => { setAddModalOpen(true); setFormError(null); }}
                            className="px-4 py-2 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white text-xs font-bold"
                          >
                            Issue License
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">No licenses match your filters</p>
                          <p className="text-xs text-slate-500 mt-1 mb-4">Try a different search term or clear the filters.</p>
                          <button
                            onClick={() => { setSearchQuery(''); setStatusFilter('all'); setProductFilter('all'); }}
                            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                          >
                            Clear Filters
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedLicenses.map((lic) => {
                    const daysInfo = calculateDaysLeft(lic.expiry_date);
                    const effectiveStatus = effectiveStatusOf(lic);
                    const displayStatus =
                      lic.is_locked && effectiveStatus === 'active' ? 'locked' : effectiveStatus;
                    const isSelected = selectedIds.includes(lic.id);

                    return (
                      <tr
                        key={lic.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isSelected ? 'bg-(--brand)/5' : ''
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, lic.id]);
                              } else {
                                setSelectedIds(selectedIds.filter((id) => id !== lic.id));
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-800"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{lic.user?.full_name || 'Customer'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{lic.user?.email || 'N/A'}</div>
                          {lic.user?.phone && (
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{lic.user?.phone}</div>
                          )}
                          {lic.user?.company_name && (
                            <div className="text-xs text-slate-500 mt-0.5">{lic.user.company_name}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-700 dark:text-slate-200 text-xs">{lic.product?.name || '—'}</div>
                          {lic.plan && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                              {lic.plan.name} · {getPlanDisplay(lic.plan).periodLabel}
                              {getPlanDisplay(lic.plan).isLifetime ? '' : ` (${getPlanDisplay(lic.plan).durationLabel})`}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs font-bold text-(--brand-ink) bg-[#0A1330] px-2.5 py-1 rounded-lg border border-(--brand)/30">
                              {lic.license_key}
                            </span>
                            <button
                              onClick={() => handleCopy(lic.license_key)}
                              title="Copy Key"
                              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                            >
                              {copiedKey === lic.license_key ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-slate-600 dark:text-slate-300">
                            Expires: <span className="font-medium text-slate-900 dark:text-white">{formatDate(lic.expiry_date)}</span>
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              daysInfo.isExpired
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                : daysInfo.isLifetime
                                ? 'bg-(--brand)/15 text-(--brand) dark:text-(--brand-ink) border-(--brand)/30'
                                : daysInfo.days <= 7
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : daysInfo.days <= 30
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {daysInfo.text}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Monitor className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {lic.current_devices} / {lic.max_devices}
                            </span>
                          </div>
                          <button
                            onClick={() => handleResetHWID(lic)}
                            className="text-[10px] text-(--brand-ink) hover:underline mt-1 block"
                          >
                            Reset Activations
                          </button>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              displayStatus === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : displayStatus === 'locked'
                                ? 'bg-(--brand)/10 text-(--brand) dark:text-(--brand-ink) border-(--brand)/30'
                                : displayStatus === 'paused'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : displayStatus === 'expired' || displayStatus === 'revoked'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                            }`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setDetailsLicense(lic)}
                              title="View Details"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEdit(lic)}
                              title="Edit License"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRenewLicense(lic);
                                setRenewDays(30);
                              }}
                              title="Extend / Renew"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleLock(lic)}
                              title={lic.is_locked ? 'Unlock' : 'Lock'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                            >
                              {lic.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleTogglePause(lic)}
                              title={lic.status === 'paused' ? 'Resume' : 'Pause'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                            >
                              {lic.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleRevoke(lic)}
                              title="Revoke License"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => generateLicenseCertificatePDF(lic)}
                              title="Print Certificate PDF"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-(--brand-ink) hover:bg-slate-800"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRegenerateKey(lic)}
                              title="Regenerate Key"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-(--brand-ink) hover:bg-slate-800"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lic)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                {filteredLicenses.length === 0
                  ? 'Showing 0 of 0 licenses'
                  : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filteredLicenses.length)} of ${filteredLicenses.length} licenses`}
              </span>
              <label className="flex items-center gap-1.5">
                Rows:
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-(--brand)"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={safePage === 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-200">
                Page {safePage} of {totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Kanban View — respects the same search/filters as the table */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(['active', 'expiring_soon', 'paused', 'locked', 'expired'] as const).map((col) => {
            const colLicenses = filteredLicenses.filter((l) => {
              if (col === 'expiring_soon') {
                const { days, isExpired } = calculateDaysLeft(l.expiry_date);
                return !isExpired && days <= 30 && days > 0 && effectiveStatusOf(l) === 'active';
              }
              if (col === 'locked') return l.status === 'locked' || l.is_locked;
              return effectiveStatusOf(l) === col;
            });

            return (
              <div key={col} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {col.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                    {colLicenses.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {colLicenses.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-6">No licenses in this column.</p>
                  ) : (
                    colLicenses.map((lic) => {
                      const cardDays = calculateDaysLeft(lic.expiry_date);
                      const cardEffective = effectiveStatusOf(lic);
                      const cardDisplay =
                        lic.is_locked && cardEffective === 'active' ? 'locked' : cardEffective;
                      return (
                      <div
                        key={lic.id}
                        className="bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-md space-y-2 cursor-pointer transition-all"
                        onClick={() => setDetailsLicense(lic)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {lic.user?.full_name || 'Customer'}
                          </div>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              cardDisplay === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : cardDisplay === 'locked'
                                ? 'bg-(--brand)/10 text-(--brand) dark:text-(--brand-ink) border-(--brand)/30'
                                : cardDisplay === 'paused'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {cardDisplay}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{lic.product?.name || '—'}</div>
                        <div className="font-mono text-[11px] text-(--brand) dark:text-(--brand-ink) font-bold bg-slate-100 dark:bg-slate-950/50 p-1.5 rounded-lg break-all">
                          {lic.license_key}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                          <span>{formatDate(lic.expiry_date)}</span>
                          <span>{lic.current_devices}/{lic.max_devices} Dev</span>
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            cardDays.isExpired
                              ? 'text-rose-600 dark:text-rose-400'
                              : cardDays.isLifetime
                              ? 'text-(--brand) dark:text-(--brand-ink)'
                              : cardDays.days <= 7
                              ? 'text-amber-600 dark:text-amber-400'
                              : cardDays.days <= 30
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {cardDays.text}
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Issue New License (Manual Sale) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-(--brand-ink)" />
              Issue License (Manual / Offline Sale)
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Create an instant license key for cash, direct bank deposit or UPI payments.
            </p>

            {formError && (
              <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateManualLicense} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer (existing account)</label>
                {users.length === 0 ? (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 text-xs">
                    No registered users found. A license can only be issued to an existing customer account —{' '}
                    <Link to="/admin/users" className="underline font-bold">check Users Control</Link>{' '}
                    or ask the customer to register first.
                  </div>
                ) : (
                  <>
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select a customer…</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || u.email} — {u.email}
                        </option>
                      ))}
                    </select>
                    {selectedUser && (
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        {selectedUser.full_name} · {selectedUser.email}
                        {selectedUser.phone ? ` · ${selectedUser.phone}` : ''}
                        {selectedUser.company_name ? ` · ${selectedUser.company_name}` : ''}
                        {selectedUser.is_blocked ? ' · BLOCKED' : ''}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product</label>
                  {products.length === 0 ? (
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 text-xs">
                      No products exist yet. <Link to="/admin/products" className="underline font-bold">Create a product</Link> first.
                    </div>
                  ) : (
                    <select
                      required
                      value={selectedProduct}
                      onChange={(e) => { setSelectedProduct(e.target.value); setSelectedPlan(''); }}
                      className={inputCls}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plan (optional)</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => {
                      const planId = e.target.value;
                      setSelectedPlan(planId);
                      const plan = plans.find((p) => p.id === planId);
                      if (plan) {
                        const display = getPlanDisplay(plan);
                        if (!display.isLifetime && plan.duration_days) setDurationDays(plan.duration_days);
                        if (plan.max_devices) setMaxDevices(plan.max_devices);
                      }
                    }}
                    className={inputCls}
                  >
                    <option value="">No plan — custom duration below</option>
                    {plansForSelectedProduct.map((p) => {
                      const display = getPlanDisplay(p);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} — {display.periodLabel} ({display.durationLabel}) · {formatCurrency(p.price)}
                        </option>
                      );
                    })}
                  </select>
                  {plansForSelectedProduct.length === 0 && (
                    <p className="text-[11px] text-slate-500 mt-1">No plans for this product; the custom duration below will be used.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    min={1}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as LicensePriority)}
                    className={inputCls}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="vip">VIP</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Devices</label>
                  <input
                    type="number"
                    value={maxDevices}
                    onChange={(e) => setMaxDevices(Number(e.target.value))}
                    min={1}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    min={0}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className={inputCls}
                  >
                    <option value="upi">Direct UPI</option>
                    <option value="bank_transfer">NEFT / Bank</option>
                    <option value="cash">Cash / Offline</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="cashfree">Cashfree</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Salesperson</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. WhatsApp direct sale"
                  className={inputCls}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || users.length === 0 || products.length === 0}
                  className="px-5 py-2 rounded-full bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-(--brand)/30"
                >
                  {isCreating ? 'Creating…' : 'Generate & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit License */}
      {editLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditLicense(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Edit className="w-5 h-5 text-(--brand-ink)" />
              Edit License
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">{editLicense.license_key}</p>

            {editError && (
              <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as License['status'])} className={inputCls}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="locked">Locked</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as LicensePriority)} className={inputCls}>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="vip">VIP</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Max Devices</label>
                <input type="number" min={1} value={editMaxDevices} onChange={(e) => setEditMaxDevices(Number(e.target.value))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Notes</label>
                <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditLicense(null)} className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingEdit} className="px-5 py-2 rounded-full bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-(--brand)/30">
                  {isSavingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Extend / Renew Days */}
      {renewLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setRenewLicense(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
              Extend / Renew License
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              {renewLicense.license_key}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Additional Days to Add:
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[30, 90, 180, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setRenewDays(d)}
                      className={`py-2 rounded-full text-xs font-bold transition-all ${
                        renewDays === d
                          ? 'bg-(--brand) text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      +{d} Days
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={renewDays}
                  onChange={(e) => setRenewDays(Number(e.target.value))}
                  min={1}
                  className={inputCls}
                />
              </div>

              <div className="text-xs text-slate-400 bg-slate-800/60 p-3 rounded-xl">
                Current Expiry: <strong className="text-slate-200">{formatDate(renewLicense.expiry_date)}</strong>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRenewLicense(null)}
                  className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenewSubmit}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Confirm Renewal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View License Details */}
      {detailsLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setDetailsLicense(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">License Record Details</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Full audit details, hardware device limits and customer profile.</p>

            <div className="space-y-4 text-xs">
              <div className="bg-(--brand-soft) dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">License Key</span>
                <span className="font-mono text-sm font-bold text-(--brand) dark:text-(--brand-ink) block break-all">
                  {detailsLicense.license_key}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Product</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{detailsLicense.product?.name || '—'}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Plan</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {detailsLicense.plan
                      ? `${detailsLicense.plan.name} · ${getPlanDisplay(detailsLicense.plan).periodLabel}`
                      : 'Custom / No plan'}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Licensee</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{detailsLicense.user?.full_name || '—'}</span>
                  {detailsLicense.user?.email && <span className="block text-slate-400 mt-0.5">{detailsLicense.user.email}</span>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Company / GST</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{detailsLicense.user?.company_name || '—'}</span>
                  {detailsLicense.user?.gst_number && <span className="block text-slate-400 mt-0.5">GST: {detailsLicense.user.gst_number}</span>}
                  {detailsLicense.user?.is_blocked && <span className="block text-rose-400 mt-0.5 font-bold">Account blocked</span>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Issue Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatDate(detailsLicense.issue_date)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Expiry Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatDate(detailsLicense.expiry_date)}</span>
                  {detailsDaysInfo && (
                    <span
                      className={`block mt-1 font-bold ${
                        detailsDaysInfo.isExpired
                          ? 'text-rose-600 dark:text-rose-400'
                          : detailsDaysInfo.isLifetime
                          ? 'text-(--brand) dark:text-(--brand-ink)'
                          : detailsDaysInfo.days <= 7
                          ? 'text-amber-600 dark:text-amber-400'
                          : detailsDaysInfo.days <= 30
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {detailsDaysInfo.text}
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Current Devices</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{detailsLicense.current_devices} / {detailsLicense.max_devices} PC</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block">Status</span>
                  <span
                    className={`font-semibold uppercase ${
                      detailsEffectiveStatus === 'expired' || detailsEffectiveStatus === 'revoked'
                        ? 'text-rose-600 dark:text-rose-400'
                        : detailsEffectiveStatus === 'active'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : detailsEffectiveStatus === 'paused'
                        ? 'text-amber-600 dark:text-amber-400'
                        : detailsEffectiveStatus === 'locked'
                        ? 'text-(--brand) dark:text-(--brand-ink)'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {detailsEffectiveStatus || detailsLicense.status}
                  </span>
                  {detailsEffectiveStatus === 'expired' && detailsLicense.status === 'active' && (
                    <span className="block text-rose-600 dark:text-rose-400 mt-0.5 normal-case font-medium">
                      Raw status is ACTIVE but expiry has passed
                    </span>
                  )}
                  {detailsLicense.invoice?.total_amount != null && (
                    <span className="block text-slate-500 dark:text-slate-400 mt-0.5 normal-case">
                      Invoice: {formatCurrency(detailsLicense.invoice.total_amount)}
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2">
                  <span className="text-slate-500 block">Created</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatDateTime(detailsLicense.created_at)}</span>
                </div>
              </div>

              {detailsLicense.notes && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block mb-1">Admin Notes</span>
                  <p className="text-slate-600 dark:text-slate-300">{detailsLicense.notes}</p>
                </div>
              )}

              {/* Device activations — real rows from getLicenseActivations */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block mb-2 font-semibold">Device Activations</span>
                {isLoadingActivations ? (
                  <div className="flex items-center gap-2 text-slate-400 py-2">
                    <span className="w-4 h-4 border-2 border-slate-600 border-t-(--brand) rounded-full animate-spin" />
                    Loading activations…
                  </div>
                ) : activations.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No device activations recorded for this license yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activations.map((a) => (
                      <div key={a.id} className="flex items-start justify-between gap-3 bg-slate-900/60 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{a.device_name || 'Unknown device'}</div>
                          <div className="font-mono text-[10px] text-slate-500 break-all">{a.device_fingerprint}</div>
                          <div className="text-slate-400 mt-0.5">
                            {[a.os, a.browser].filter(Boolean).join(' · ') || '—'}
                            {a.ip_address ? ` · ${a.ip_address}` : ''}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            a.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
                          }`}>
                            {a.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <div className="text-slate-500 mt-1">{formatDateTime(a.activated_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => { const lic = detailsLicense; setDetailsLicense(null); handleResetHWID(lic); }}
                  className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  Reset Devices
                </button>
                <button
                  onClick={() => generateLicenseCertificatePDF(detailsLicense)}
                  className="px-4 py-2 rounded-full bg-(--brand) hover:bg-(--brand-hover) text-white font-semibold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
