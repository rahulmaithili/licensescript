import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Download,
  Eye,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  getInvoices,
  createInvoice,
  generateInvoicePDF,
} from '@/services/invoiceService';
import { getProducts } from '@/services/productService';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice, Product, PaymentMethod } from '@/types';

type Banner = { type: 'success' | 'error'; message: string } | null;

const round2 = (n: number) => Math.round(n * 100) / 100;

const inputCls =
  'w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-[#0A1330] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40FF]';
const primaryBtn =
  'px-4 py-2.5 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-[#1E40FF]/30 transition-all flex items-center gap-2';

function statusPill(status: string) {
  if (status === 'paid') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
  if (status === 'failed' || status === 'refunded') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
}

export const InvoiceGenerator: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  // Only ever set from the invoice createInvoice() actually returned —
  // this is what enables the "download last created invoice" PDF action.
  const [lastCreated, setLastCreated] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGst, setCustomerGst] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [planName, setPlanName] = useState('');
  const [amount, setAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [invs, prods] = await Promise.all([getInvoices(), getProducts()]);
      setInvoices(invs);
      setProducts(prods);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalError(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerGst('');
    setSelectedProduct(products[0]?.name || '');
    setPlanName('');
    setAmount(0);
    setTaxRate(18);
    setDiscountAmount(0);
    setPaymentMethod('upi');
    setPaymentId('');
    setModalOpen(true);
  };

  // Totals: total = amount + tax − discount, with GST charged on the
  // discounted (taxable) amount. One shared computation for the live
  // preview below and for the invoice actually submitted.
  const subtotal = Math.max(0, Number(amount) || 0);
  const discount = Math.min(Math.max(0, Number(discountAmount) || 0), subtotal);
  const taxableAmount = round2(subtotal - discount);
  const taxAmount = round2((taxableAmount * (Number(taxRate) || 0)) / 100);
  const totalAmount = round2(taxableAmount + taxAmount);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!selectedProduct) {
      setModalError('No product selected. Add a product in the Product Catalog first, then generate an invoice for it.');
      return;
    }
    if (subtotal <= 0) {
      setModalError('Base price must be greater than zero.');
      return;
    }

    setIsCreating(true);
    try {
      // No invoice_number, user_id or payment ref is invented here:
      // createInvoice() generates the real sequential invoice number,
      // and a blank transaction ref stays blank instead of a fake OFFLINE-* id.
      const res = await createInvoice({
        product_name: selectedProduct,
        plan_name: planName,
        amount: subtotal,
        tax_rate: Number(taxRate),
        tax_amount: taxAmount,
        discount_amount: discount,
        total_amount: totalAmount,
        currency: 'INR',
        payment_status: 'paid',
        payment_method: paymentMethod,
        payment_id: paymentId.trim() || undefined,
        billing_name: customerName,
        billing_email: customerEmail,
        billing_phone: customerPhone,
        billing_address: customerAddress,
        billing_gst: customerGst,
        paid_at: new Date().toISOString(),
      });

      if (!res.success) {
        // Surface the DB failure and keep the form open — no invoice is
        // added to the list and nothing is presented as created.
        setModalError(res.error || 'Could not create this invoice. Nothing was saved — please try again.');
        return;
      }

      setModalOpen(false);
      setLastCreated(res.invoice || null);
      setBanner({
        type: 'success',
        message: res.invoice?.invoice_number
          ? `Invoice ${res.invoice.invoice_number} created for ${customerName} — ${formatCurrency(totalAmount)} total.`
          : `Invoice created for ${customerName} — ${formatCurrency(totalAmount)} total.`,
      });
      await loadAll();
    } catch (err: any) {
      setModalError(err?.message || 'Could not create this invoice. Nothing was saved — please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadPDF = async (inv: Invoice | null) => {
    if (!inv?.id || !inv?.invoice_number) {
      setBanner({
        type: 'error',
        message: 'No saved invoice selected. Create or open a real invoice from the list before downloading a PDF.',
      });
      return;
    }
    try {
      await generateInvoicePDF(inv);
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || `Could not generate the PDF for ${inv.invoice_number}.` });
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (inv.invoice_number || '').toLowerCase().includes(q) ||
      (inv.billing_name || '').toLowerCase().includes(q) ||
      (inv.billing_email || '').toLowerCase().includes(q) ||
      (inv.product_name || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const noProducts = !isLoading && products.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
            <Receipt className="w-8 h-8 text-[#1E40FF] dark:text-[#8fa0ff]" />
            Invoice & Tax Billing Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated GST invoices, manual tax billing generator, and instant PDF downloads.
          </p>
        </div>

        <button onClick={openCreateModal} className={primaryBtn}>
          <Plus className="w-4 h-4" />
          <span>Generate Tax Invoice</span>
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
          {banner.type === 'success' && lastCreated && (
            <button
              onClick={() => handleDownloadPDF(lastCreated)}
              className="shrink-0 px-3 py-1 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          )}
          <button onClick={() => setBanner(null)} className="text-current opacity-70 hover:opacity-100 shrink-0" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice no, buyer..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E40FF] w-full md:w-auto"
        >
          <option value="all">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Invoice No</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product & Plan</th>
                <th className="p-4">Net Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1E40FF] dark:text-[#8fa0ff]" />
                    Loading invoices…
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 dark:text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-3 text-[#1E40FF] dark:text-[#8fa0ff]" />
                    {invoices.length === 0 ? (
                      <>
                        <div className="font-bold text-[#0A1330] dark:text-white text-base">No invoices generated yet</div>
                        <p className="text-xs mt-1.5 mb-5">
                          When you issue a tax invoice it will appear here with its real invoice number.
                        </p>
                        <button onClick={openCreateModal} className={`${primaryBtn} mx-auto`}>
                          <Plus className="w-4 h-4" />
                          <span>Generate Your First Invoice</span>
                        </button>
                      </>
                    ) : (
                      'No invoices match your search or status filter.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#1E40FF] dark:text-[#8fa0ff]">
                      {inv.invoice_number}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#0A1330] dark:text-white">{inv.billing_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{inv.billing_email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700 dark:text-slate-200 text-xs">{inv.product_name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{inv.plan_name}</div>
                    </td>
                    <td className="p-4 font-bold text-[#0A1330] dark:text-white">
                      {formatCurrency(inv.total_amount, inv.currency)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          {inv.payment_method}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusPill(inv.payment_status)}`}>
                          {inv.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(inv.issued_at)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownloadPDF(inv)}
                          disabled={!inv.id || !inv.invoice_number}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#1E40FF] dark:hover:text-[#8fa0ff] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Manual Invoice */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#0A1330] dark:text-white mb-1">Generate Official Tax Invoice</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Create compliant tax invoice with sequential numbering and GST breakdown.</p>

            {modalError && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 mb-4" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {noProducts && (
              <div className="flex items-start gap-2 rounded-2xl border border-[#1E40FF]/30 bg-[#1E40FF]/10 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#1E40FF] dark:text-[#8fa0ff]" />
                <span>No products exist yet. Add one in the Product Catalog before generating an invoice.</span>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Customer / Company Name</label>
                  <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Customer Email</label>
                  <input type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">GSTIN Number (Optional)</label>
                  <input
                    type="text"
                    value={customerGst}
                    onChange={(e) => setCustomerGst(e.target.value.toUpperCase())}
                    placeholder="27AABCL1234D1ZM"
                    className={`${inputCls} font-mono uppercase`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street, City, State, PIN"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className={inputCls}
                    disabled={products.length === 0}
                  >
                    {products.length === 0 ? (
                      <option value="">No products available</option>
                    ) : (
                      products.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Plan Title</label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. Professional Edition"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Base Price (₹)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={0} className={inputCls} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Discount (₹)</label>
                  <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} min={0} className={inputCls} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Tax Rate (%)</label>
                  <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} min={0} max={100} className={inputCls} />
                </div>
              </div>

              {/* Live totals preview — same math that is submitted */}
              <div className="bg-[#EEF1FF] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="text-[#0A1330] dark:text-white font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Discount</span>
                  <span className="text-[#0A1330] dark:text-white font-semibold">− {formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Taxable Amount</span>
                  <span className="text-[#0A1330] dark:text-white font-semibold">{formatCurrency(taxableAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">GST ({Number(taxRate) || 0}% on taxable)</span>
                  <span className="text-[#0A1330] dark:text-white font-semibold">+ {formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm">
                  <span className="font-bold text-[#0A1330] dark:text-white">Grand Total (Amount + Tax − Discount)</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className={inputCls}>
                    <option value="upi">Direct UPI</option>
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="cash">Cash / Offline</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="cashfree">Cashfree</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Transaction Ref ID (Optional)</label>
                  <input
                    type="text"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    placeholder="UPI Ref / Bank UTR"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isCreating}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || products.length === 0}
                  className="px-5 py-2 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white font-semibold shadow-lg shadow-[#1E40FF]/30 flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating ? 'Creating…' : 'Create & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Invoice */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewInvoice(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#0A1330] dark:text-white mb-1">Invoice {viewInvoice.invoice_number}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Issued on {formatDate(viewInvoice.issued_at)}</p>

            <div className="space-y-3 text-xs bg-[#EEF1FF] dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Billed To:</span>
                <span className="font-bold text-[#0A1330] dark:text-white text-right">{viewInvoice.billing_name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Email:</span>
                <span className="text-[#0A1330] dark:text-white text-right">{viewInvoice.billing_email}</span>
              </div>
              {viewInvoice.billing_phone && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                  <span className="text-[#0A1330] dark:text-white text-right">{viewInvoice.billing_phone}</span>
                </div>
              )}
              {viewInvoice.billing_address && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 dark:text-slate-400">Address:</span>
                  <span className="text-[#0A1330] dark:text-white text-right">{viewInvoice.billing_address}</span>
                </div>
              )}
              {viewInvoice.billing_gst && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500 dark:text-slate-400">Buyer GSTIN:</span>
                  <span className="text-[#0A1330] dark:text-white font-mono text-right">{viewInvoice.billing_gst}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Item:</span>
                <span className="text-[#0A1330] dark:text-white text-right">{viewInvoice.product_name} ({viewInvoice.plan_name})</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Payment:</span>
                <span className="text-[#0A1330] dark:text-white text-right uppercase">
                  {viewInvoice.payment_method} · {viewInvoice.payment_status}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Subtotal:</span>
                <span className="text-[#0A1330] dark:text-white">{formatCurrency(viewInvoice.amount, viewInvoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Discount:</span>
                <span className="text-[#0A1330] dark:text-white">− {formatCurrency(viewInvoice.discount_amount || 0, viewInvoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">GST ({viewInvoice.tax_rate}%):</span>
                <span className="text-[#0A1330] dark:text-white">+ {formatCurrency(viewInvoice.tax_amount, viewInvoice.currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm">
                <span className="font-bold text-[#0A1330] dark:text-white">Grand Total:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(viewInvoice.total_amount, viewInvoice.currency)}</span>
              </div>
              <p className="text-[11px] text-slate-500">Total = Subtotal + GST − Discount, with GST charged on the discounted amount.</p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                onClick={() => handleDownloadPDF(viewInvoice)}
                disabled={!viewInvoice.id || !viewInvoice.invoice_number}
                className="px-4 py-2 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
