import { supabase } from '@/lib/supabase';
import type { Invoice, CompanyProfile, License } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getCompanyProfile } from './settingsService';
import { getStoredAccentPalette } from '@/lib/accents';

// Brand RGB for PDF rendering, resolved when the document is generated
// from the accent stored by ThemeContext.
const brandRgb = (): [number, number, number] => getStoredAccentPalette().rgb;

// The LIVE invoices table is shaped differently from the app's Invoice
// type: invoice_no (not invoice_number), customer_id (not user_id),
// subtotal/tax/discount/total (not amount/tax_amount/...) and the
// product/plan/billing detail lives in the `items` JSONB. Map rows in
// both directions here so every consumer (account page, admin billing
// center, PDF generator) works against real stored records.
function normalizeInvoice(row: any): Invoice {
  if (!row) return row;
  const item = Array.isArray(row.items) ? row.items[0] || {} : {};
  const inv: any = {
    ...row,
    id: row.id,
    invoice_number: row.invoice_number ?? row.invoice_no,
    user_id: row.user_id ?? row.customer_id,
    product_name: row.product_name ?? item.product_name ?? '',
    plan_name: row.plan_name ?? item.plan_name ?? '',
    amount: row.amount ?? row.subtotal ?? 0,
    tax_rate: row.tax_rate ?? item.tax_rate ?? 18,
    tax_amount: row.tax_amount ?? row.tax ?? 0,
    discount_amount: row.discount_amount ?? row.discount ?? 0,
    total_amount: row.total_amount ?? row.total ?? 0,
    currency: row.currency ?? 'INR',
    payment_status: row.payment_status ?? row.status ?? 'paid',
    payment_method: row.payment_method ?? item.payment_method ?? 'razorpay',
    payment_id: row.payment_id ?? item.payment_id,
    billing_name: row.billing_name ?? row.customer_name ?? '',
    billing_email: row.billing_email ?? row.customer_email ?? '',
    billing_phone: row.billing_phone ?? item.billing_phone,
    billing_address: row.billing_address ?? item.billing_address,
    billing_gst: row.billing_gst ?? item.billing_gst,
    issued_at: row.issued_at ?? row.created_at,
    paid_at: row.paid_at ?? item.paid_at ?? row.created_at,
    created_at: row.created_at,
  };
  // Normalize a joined profiles row: real DB columns are company / tax_id / status.
  if (row.user) {
    inv.user = {
      ...row.user,
      company_name: row.user.company_name ?? row.user.company ?? undefined,
      gst_number: row.user.gst_number ?? row.user.tax_id ?? undefined,
      is_blocked: row.user.is_blocked ?? row.user.status === 'blocked',
    };
  }
  return inv as Invoice;
}

export async function getInvoices(userId?: string): Promise<Invoice[]> {
  try {
    let query = supabase.from('invoices').select('*, user:profiles(*)').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('customer_id', userId);
    }
    let { data, error } = await query;
    if (error) {
      // Fall back to a plain select if the profiles embed is unavailable.
      let retry = supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (userId) {
        retry = retry.eq('customer_id', userId);
      }
      const second = await retry;
      data = second.data;
      error = second.error;
    }
    if (error) {
      console.error('Failed to load invoices:', error.message);
      return [];
    }
    return (data || []).map(normalizeInvoice);
  } catch (err) {
    console.error('Failed to load invoices:', err);
    return [];
  }
}

export async function createInvoice(invoice: Partial<Invoice>): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = invoice.invoice_number || `INV-${year}-${randomSeq}`;

    // Translate the app-shaped invoice into the LIVE table's columns.
    const row: Record<string, any> = {
      invoice_no: invoiceNumber,
      customer_id: invoice.user_id || null,
      customer_name: invoice.billing_name || '',
      customer_email: invoice.billing_email || '',
      items: [
        {
          product_name: invoice.product_name || '',
          plan_name: invoice.plan_name || '',
          quantity: 1,
          unit_price: invoice.amount ?? 0,
          tax_rate: invoice.tax_rate ?? 18,
          tax_amount: invoice.tax_amount ?? 0,
          discount: invoice.discount_amount ?? 0,
          total: invoice.total_amount ?? 0,
          payment_method: invoice.payment_method || 'razorpay',
          payment_id: invoice.payment_id,
          billing_phone: invoice.billing_phone,
          billing_address: invoice.billing_address,
          billing_gst: invoice.billing_gst,
          paid_at: invoice.paid_at,
        },
      ],
      subtotal: invoice.amount ?? 0,
      tax: invoice.tax_amount ?? 0,
      discount: invoice.discount_amount ?? 0,
      total: invoice.total_amount ?? 0,
      status: invoice.payment_status || 'paid',
    };

    const { data, error } = await supabase.from('invoices').insert([row]).select().single();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, invoice: normalizeInvoice(data) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateInvoicePDF(invoice: Invoice, company?: CompanyProfile) {
  const profile = company || (await getCompanyProfile());
  const doc = new jsPDF();

  // Primary Accent Color (Royal Blue / Dark Slate)
  doc.setFillColor(10, 19, 48);
  doc.rect(0, 0, 210, 38, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text((profile.company_name || 'LicenseWala').toUpperCase(), 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL TAX INVOICE', 14, 28);
  doc.text(`GSTIN: ${profile.gst_number || 'N/A'}  |  PAN: ${profile.pan_number || 'N/A'}`, 14, 34);

  // Invoice Meta (Right side header)
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoice_number}`, 145, 18);
  doc.text(`Date: ${formatDate(invoice.issued_at)}`, 145, 24);
  doc.text(`Status: ${(invoice.payment_status || 'PAID').toUpperCase()}`, 145, 30);

  // Bill From & Bill To
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED BY (SELLER):', 14, 48);
  doc.text('BILLED TO (BUYER):', 110, 48);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(profile.legal_name || profile.company_name || '', 14, 55);
  doc.text(profile.address || '', 14, 61);
  doc.text(`${profile.city || ''}, ${profile.state || ''} - ${profile.pincode || ''}`, 14, 67);
  doc.text(`Email: ${profile.email || ''}`, 14, 73);
  doc.text(`Phone: ${profile.phone || 'N/A'}`, 14, 79);

  doc.text(invoice.billing_name || 'Valued Customer', 110, 55);
  doc.text(invoice.billing_email || '', 110, 61);
  if (invoice.billing_phone) doc.text(`Phone: ${invoice.billing_phone}`, 110, 67);
  if (invoice.billing_address) doc.text(invoice.billing_address.slice(0, 45), 110, 73);
  if (invoice.billing_gst) doc.text(`GSTIN: ${invoice.billing_gst}`, 110, 79);

  // Items Table
  const tableData = [
    [
      '1',
      `${invoice.product_name}\nPlan: ${invoice.plan_name}`,
      '1 Unit',
      formatCurrency(invoice.amount, invoice.currency),
      formatCurrency(invoice.discount_amount, invoice.currency),
      `${invoice.tax_rate}% (GST)`,
      formatCurrency(invoice.total_amount, invoice.currency),
    ],
  ];

  autoTable(doc, {
    startY: 88,
    head: [['#', 'Item Description', 'Qty', 'Base Rate', 'Discount', 'Tax', 'Net Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: brandRgb(), textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Financial Summary
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Gateway / Mode: ${(invoice.payment_method || 'Online').toUpperCase()}`, 14, finalY);
  if (invoice.payment_id) {
    doc.text(`Transaction / Order ID: ${invoice.payment_id}`, 14, finalY + 6);
  }

  // Bank & UPI Details
  if (profile.bank_account_no || profile.upi_id) {
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Receipt Details:', 14, finalY + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${profile.bank_name || 'N/A'} | A/C: ${profile.bank_account_no || 'N/A'} | IFSC: ${profile.bank_ifsc || 'N/A'}`, 14, finalY + 22);
    doc.text(`UPI ID: ${profile.upi_id || 'N/A'}`, 14, finalY + 28);
  }

  // Totals Box (Right Side)
  const boxX = 135;
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', boxX, finalY);
  doc.text(formatCurrency(invoice.amount, invoice.currency), 195, finalY, { align: 'right' });

  doc.text(`GST (${invoice.tax_rate}%):`, boxX, finalY + 6);
  doc.text(formatCurrency(invoice.tax_amount, invoice.currency), 195, finalY + 6, { align: 'right' });

  if (invoice.discount_amount > 0) {
    doc.text('Discount:', boxX, finalY + 12);
    doc.text(`-${formatCurrency(invoice.discount_amount, invoice.currency)}`, 195, finalY + 12, { align: 'right' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Grand Total:', boxX, finalY + 20);
  doc.text(formatCurrency(invoice.total_amount, invoice.currency), 195, finalY + 20, { align: 'right' });

  // Notes & Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  const notes = profile.invoice_notes || 'This is a computer-generated tax invoice. No physical signature required.';
  doc.text(notes, 14, 275);
  doc.text(`Authorized by: ${profile.legal_name || 'LicenseWala'} | ${profile.website || ''}`, 14, 280);

  doc.save(`${invoice.invoice_number}.pdf`);
}

export function generateLicenseCertificatePDF(license: License, company?: CompanyProfile) {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Elegant border
  const [br, bg, bb] = brandRgb();
  doc.setDrawColor(br, bg, bb);
  doc.setLineWidth(4);
  doc.rect(8, 8, 281, 194);
  doc.setLineWidth(1);
  doc.rect(12, 12, 273, 186);

  // Header
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(br, bg, bb);
  doc.text('SOFTWARE LICENSE CERTIFICATE', 148, 38, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('This official certificate certifies that the license key below is legitimately registered & active.', 148, 48, { align: 'center' });

  // Product Name
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(license.product?.name || 'Software Product', 148, 70, { align: 'center' });

  // License Key Box
  doc.setFillColor(238, 241, 255);
  doc.rect(48, 80, 201, 24, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(48, 80, 201, 24, 'D');

  doc.setFontSize(18);
  doc.setFont('courier', 'bold');
  doc.setTextColor(23, 64, 214);
  doc.text(license.license_key, 148, 96, { align: 'center' });

  // License Details Table
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);

  const leftCol = 48;
  const rightCol = 158;
  let currY = 120;

  doc.text(`Licensee (Owner): ${license.user?.full_name || 'Registered Customer'}`, leftCol, currY);
  doc.text(`Plan Edition: ${license.plan?.name || 'Standard'}`, rightCol, currY);

  currY += 10;
  doc.text(`Registered Email: ${license.user?.email || 'N/A'}`, leftCol, currY);
  doc.text(`Maximum Devices: ${license.max_devices} PC / Extension`, rightCol, currY);

  currY += 10;
  doc.text(`Issue Date: ${formatDate(license.issue_date)}`, leftCol, currY);
  doc.text(`Valid Until: ${formatDate(license.expiry_date)}`, rightCol, currY);

  currY += 10;
  doc.text(`Status: ${license.status.toUpperCase()}`, leftCol, currY);
  doc.text(`Hardware Binding: Active (Anti-Cloning Enabled)`, rightCol, currY);

  // Signatures
  doc.line(48, 175, 100, 175);
  doc.setFontSize(9);
  doc.text('Customer Verification', 48, 180);

  doc.line(196, 175, 248, 175);
  doc.text('Authorized Signature (RM Rahul)', 196, 180);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('LicenseWala Certification Authority • Authenticity verified at licensewala.netlify.app/verify', 148, 192, { align: 'center' });

  doc.save(`License-Certificate-${license.license_key}.pdf`);
}
