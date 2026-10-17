import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Download,
  Printer,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';
import {
  getInvoices,
  createInvoice,
  generateInvoicePDF,
} from '@/services/invoiceService';
import { getProducts } from '@/services/productService';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice, Product, PaymentMethod } from '@/types';

export const InvoiceGenerator: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
  const [planName, setPlanName] = useState('Professional Edition');
  const [amount, setAmount] = useState(1999);
  const [taxRate, setTaxRate] = useState(18);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [invs, prods] = await Promise.all([getInvoices(), getProducts()]);
    setInvoices(invs);
    setProducts(prods);
    if (prods.length > 0) setSelectedProduct(prods[0].name);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = Number(amount);
    const discount = Number(discountAmount);
    const taxable = Math.max(0, subtotal - discount);
    const tax = (taxable * Number(taxRate)) / 100;
    const total = taxable + tax;

    const res = await createInvoice({
      user_id: `user-manual-${Date.now()}`,
      product_name: selectedProduct || 'Software License',
      plan_name: planName,
      amount: subtotal,
      tax_rate: Number(taxRate),
      tax_amount: tax,
      discount_amount: discount,
      total_amount: total,
      currency: 'INR',
      payment_status: 'paid',
      payment_method: paymentMethod,
      payment_id: paymentId || `OFFLINE-${Date.now().toString(36).toUpperCase()}`,
      billing_name: customerName,
      billing_email: customerEmail,
      billing_phone: customerPhone,
      billing_address: customerAddress,
      billing_gst: customerGst,
      paid_at: new Date().toISOString(),
    });

    if (res.success) {
      setModalOpen(false);
      loadAll();
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.billing_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.billing_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.product_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Receipt className="w-8 h-8 text-indigo-400" />
            Invoice & Tax Billing Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated GST invoices, manual tax billing generator, and instant PDF downloads.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Tax Invoice</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice no, buyer..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto"
        >
          <option value="all">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Invoice No</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product & Plan</th>
                <th className="p-4">Net Total</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-400">
                      {inv.invoice_number}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{inv.billing_name}</div>
                      <div className="text-xs text-slate-400">{inv.billing_email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200 text-xs">{inv.product_name}</div>
                      <div className="text-[11px] text-slate-400">{inv.plan_name}</div>
                    </td>
                    <td className="p-4 font-bold text-white">
                      {formatCurrency(inv.total_amount, inv.currency)}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-800 border border-slate-700 text-slate-300">
                        {inv.payment_method}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {formatDate(inv.issued_at)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => generateInvoicePDF(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Generate Official Tax Invoice</h2>
            <p className="text-xs text-slate-400 mb-6">Create compliant tax invoice with sequential numbering and GST breakdown.</p>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Customer / Company Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">GSTIN Number (Optional)</label>
                  <input
                    type="text"
                    value={customerGst}
                    onChange={(e) => setCustomerGst(e.target.value.toUpperCase())}
                    placeholder="27AABCL1234D1ZM"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street, City, State, PIN"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Plan Title</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    min={0}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="upi">Direct UPI</option>
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="cash">Cash / Offline</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="cashfree">Cashfree</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Transaction Ref ID</label>
                  <input
                    type="text"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    placeholder="UPI Ref / Bank UTR"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
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
                  Create & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Invoice */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setViewInvoice(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Invoice {viewInvoice.invoice_number}</h3>
            <p className="text-xs text-slate-400 mb-4">Issued on {formatDate(viewInvoice.issued_at)}</p>

            <div className="space-y-3 text-xs bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Billed To:</span>
                <span className="font-bold text-white">{viewInvoice.billing_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white">{viewInvoice.billing_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>
                <span className="text-white">{viewInvoice.product_name} ({viewInvoice.plan_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="text-white">{formatCurrency(viewInvoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GST ({viewInvoice.tax_rate}%):</span>
                <span className="text-white">{formatCurrency(viewInvoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700 text-sm">
                <span className="font-bold text-white">Grand Total:</span>
                <span className="font-extrabold text-emerald-400">{formatCurrency(viewInvoice.total_amount)}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                onClick={() => generateInvoicePDF(viewInvoice)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2"
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
