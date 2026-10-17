import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Download,
  Copy,
  Check,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Play,
  Pause,
  RefreshCw,
  Printer,
  Mail,
  RotateCcw,
  Monitor,
  Eye,
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  X,
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
} from '@/services/licenseService';
import { getProducts, getPlans } from '@/services/productService';
import { getUsers } from '@/services/userService';
import { generateLicenseCertificatePDF } from '@/services/invoiceService';
import {
  formatCurrency,
  formatDate,
  calculateDaysLeft,
  maskLicenseKey,
  copyToClipboard,
} from '@/lib/utils';
import type {
  License,
  Product,
  Plan,
  Profile,
  LicenseStatus,
  LicensePriority,
  PaymentMethod,
} from '@/types';

export const UserLicenses: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editLicense, setEditLicense] = useState<License | null>(null);
  const [detailsLicense, setDetailsLicense] = useState<License | null>(null);
  const [renewLicense, setRenewLicense] = useState<License | null>(null);
  const [renewDays, setRenewDays] = useState<number>(30);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Add License
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [maxDevices, setMaxDevices] = useState(1);
  const [amountPaid, setAmountPaid] = useState(999);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<LicensePriority>('normal');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
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
    if (prods.length > 0) setSelectedProduct(prods[0].id);
    setIsLoading(false);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopy = async (key: string) => {
    await copyToClipboard(key);
    setCopiedKey(key);
    showToast(`License key copied: ${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered list
  const filteredLicenses = licenses.filter((lic) => {
    const matchesSearch =
      lic.license_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'expiring_soon'
        ? calculateDaysLeft(lic.expiry_date).days <= 30 && !calculateDaysLeft(lic.expiry_date).isExpired
        : lic.status === statusFilter;

    const matchesProduct = productFilter === 'all' ? true : lic.product_id === productFilter;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLicenses.length / pageSize) || 1;
  const paginatedLicenses = filteredLicenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Actions
  const handleToggleLock = async (lic: License) => {
    const updated = await toggleLicenseLock(lic.id, !lic.is_locked);
    if (updated) {
      showToast(`License ${lic.is_locked ? 'Unlocked' : 'Locked'} successfully!`);
      loadAll();
    }
  };

  const handleTogglePause = async (lic: License) => {
    const nextStatus = lic.status === 'paused' ? 'active' : 'paused';
    const updated = await updateLicenseStatus(lic.id, nextStatus);
    if (updated) {
      showToast(`License set to ${nextStatus.toUpperCase()}`);
      loadAll();
    }
  };

  const handleRevoke = async (lic: License) => {
    if (!window.confirm(`Revoke license permanently: ${lic.license_key}?`)) return;
    await updateLicenseStatus(lic.id, 'revoked');
    showToast('License permanently revoked');
    loadAll();
  };

  const handleDelete = async (lic: License) => {
    if (!window.confirm(`Delete license record: ${lic.license_key}?`)) return;
    await deleteLicense(lic.id);
    showToast('License record deleted');
    loadAll();
  };

  const handleResetHWID = async (lic: License) => {
    if (!window.confirm(`Reset device activations for ${lic.license_key}?`)) return;
    await resetLicenseDevices(lic.id);
    showToast('Device activations reset to 0 devices');
    loadAll();
  };

  const handleRegenerateKey = async (lic: License) => {
    if (!window.confirm(`Generate a brand new key for this customer?`)) return;
    const res = await regenerateLicenseKey(lic.id);
    if (res.success) {
      showToast(`New key generated: ${res.newKey}`);
      loadAll();
    }
  };

  const handleRenewSubmit = async () => {
    if (!renewLicense) return;
    const success = await extendLicenseDays(renewLicense.id, renewLicense.expiry_date, renewDays);
    if (success) {
      showToast(`License extended by ${renewDays} days!`);
      setRenewLicense(null);
      loadAll();
    }
  };

  const handleCreateManualLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    let customer = users.find((u) => u.email.toLowerCase() === newCustomerEmail.toLowerCase());
    const customerId = customer ? customer.id : `user-manual-${Date.now()}`;

    const res = await createManualLicense({
      userId: customerId,
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

    if (res.success) {
      showToast(`License created! Key: ${res.license?.license_key}`);
      setAddModalOpen(false);
      loadAll();
    }
  };

  const handleBulkLock = async (lock: boolean) => {
    for (const id of selectedIds) {
      await toggleLicenseLock(id, lock);
    }
    showToast(`Bulk ${lock ? 'locked' : 'unlocked'} ${selectedIds.length} licenses.`);
    setSelectedIds([]);
    loadAll();
  };

  const handleExportCSV = () => {
    const headers = 'SL,Customer Name,Customer Email,Product,License Key,Issue Date,Expiry Date,Days Left,Status,Max Devices\n';
    const rows = filteredLicenses
      .map((l, i) => {
        const { text } = calculateDaysLeft(l.expiry_date);
        return `"${i + 1}","${l.user?.full_name || ''}","${l.user?.email || ''}","${l.product?.name || ''}","${l.license_key}","${formatDate(l.issue_date)}","${formatDate(l.expiry_date)}","${text}","${l.status}","${l.max_devices}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Licenses-Export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            User Licenses Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage software activations, customer keys, device locks, renewals, and offline sales.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Issue License</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban Board
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search key, name, email..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none"
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

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none"
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
        <div className="bg-indigo-950/80 border border-indigo-700/60 rounded-2xl p-3 px-5 flex items-center justify-between text-sm animate-pulse">
          <span className="text-indigo-200 font-semibold">
            {selectedIds.length} licenses selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkLock(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
            >
              Lock Selected
            </button>
            <button
              onClick={() => handleBulkLock(false)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              Unlock Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Table View */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
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
                  <th className="p-4">Product & License Key</th>
                  <th className="p-4">Validity & Days Left</th>
                  <th className="p-4">Devices</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {paginatedLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No licenses found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedLicenses.map((lic) => {
                    const daysInfo = calculateDaysLeft(lic.expiry_date);
                    const isSelected = selectedIds.includes(lic.id);

                    return (
                      <tr
                        key={lic.id}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          isSelected ? 'bg-indigo-950/20' : ''
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
                          <div className="font-semibold text-white">{lic.user?.full_name || 'Customer'}</div>
                          <div className="text-xs text-slate-400">{lic.user?.email || 'N/A'}</div>
                          {lic.user?.phone && (
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{lic.user?.phone}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-200 text-xs mb-1">{lic.product?.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/60">
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
                          <div className="text-xs text-slate-300">
                            Expires: <span className="font-medium text-white">{formatDate(lic.expiry_date)}</span>
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              daysInfo.isExpired
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : daysInfo.isLifetime
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : daysInfo.days <= 7
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : daysInfo.days <= 30
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {daysInfo.text}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Monitor className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-white">
                              {lic.current_devices} / {lic.max_devices}
                            </span>
                          </div>
                          <button
                            onClick={() => handleResetHWID(lic)}
                            className="text-[10px] text-indigo-400 hover:underline mt-1 block"
                          >
                            Reset Activations
                          </button>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              lic.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : lic.status === 'locked'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                : lic.status === 'paused'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {lic.status}
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800"
                            >
                              {lic.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => generateLicenseCertificatePDF(lic)}
                              title="Print Certificate PDF"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRegenerateKey(lic)}
                              title="Regenerate Key"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800"
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
          <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredLicenses.length)} of{' '}
              {filteredLicenses.length} licenses
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(['active', 'expiring_soon', 'paused', 'locked', 'expired'] as const).map((col) => {
            const colLicenses = licenses.filter((l) => {
              if (col === 'expiring_soon') {
                const { days, isExpired } = calculateDaysLeft(l.expiry_date);
                return !isExpired && days <= 30 && days > 0;
              }
              return l.status === col;
            });

            return (
              <div key={col} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    {col.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-white">
                    {colLicenses.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {colLicenses.map((lic) => (
                    <div
                      key={lic.id}
                      className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-xl border border-slate-700/80 shadow-md space-y-2 cursor-pointer transition-all"
                      onClick={() => setDetailsLicense(lic)}
                    >
                      <div className="font-semibold text-xs text-white truncate">
                        {lic.user?.full_name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{lic.product?.name}</div>
                      <div className="font-mono text-[11px] text-indigo-400 font-bold bg-slate-950/50 p-1.5 rounded-lg">
                        {lic.license_key}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{formatDate(lic.expiry_date)}</span>
                        <span>{lic.current_devices}/{lic.max_devices} Dev</span>
                      </div>
                    </div>
                  ))}
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
              <Plus className="w-5 h-5 text-indigo-400" />
              Issue License (Manual / Offline Sale)
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Create an instant license key for cash, direct bank deposit or UPI payments.
            </p>

            <form onSubmit={handleCreateManualLicense} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="upi">Direct UPI</option>
                    <option value="bank_transfer">NEFT / Bank</option>
                    <option value="cash">Cash / Offline</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="cashfree">Cashfree</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Salesperson</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Referred by RM Rahul / WhatsApp direct sale"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Generate & Activate
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
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        renewDays === d
                          ? 'bg-indigo-600 text-white'
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="text-xs text-slate-400 bg-slate-800/60 p-3 rounded-xl">
                Current Expiry: <strong>{formatDate(renewLicense.expiry_date)}</strong>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRenewLicense(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenewSubmit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setDetailsLicense(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">License Record Details</h3>
            <p className="text-xs text-slate-400 mb-6">Full audit details, hardware device limits and customer profile.</p>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-slate-400 block mb-1">License Key</span>
                <span className="font-mono text-sm font-bold text-indigo-400 block">
                  {detailsLicense.license_key}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Product</span>
                  <span className="font-semibold text-white">{detailsLicense.product?.name}</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Licensee</span>
                  <span className="font-semibold text-white">{detailsLicense.user?.full_name}</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Issue Date</span>
                  <span className="font-semibold text-white">{formatDate(detailsLicense.issue_date)}</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Expiry Date</span>
                  <span className="font-semibold text-white">{formatDate(detailsLicense.expiry_date)}</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Current Devices</span>
                  <span className="font-semibold text-white">{detailsLicense.current_devices} / {detailsLicense.max_devices} PC</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Status</span>
                  <span className="font-semibold uppercase text-emerald-400">{detailsLicense.status}</span>
                </div>
              </div>

              {detailsLicense.notes && (
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Admin Notes</span>
                  <p className="text-slate-300">{detailsLicense.notes}</p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={() => generateLicenseCertificatePDF(detailsLicense)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2"
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
