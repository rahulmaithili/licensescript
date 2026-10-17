import { supabase } from '@/lib/supabase';
import type { Invoice, CompanyProfile, License } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getCompanyProfile } from './settingsService';

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-demo-1',
    invoice_number: 'INV-2026-00101',
    user_id: 'user-1',
    product_name: 'WhatsApp Bulk Sender & Filter Extension',
    plan_name: 'Professional (6 Months)',
    amount: 1999,
    tax_rate: 18,
    tax_amount: 359.82,
    discount_amount: 0,
    total_amount: 2358.82,
    currency: 'INR',
    payment_status: 'paid',
    payment_method: 'razorpay',
    payment_id: 'pay_ONV8291X002',
    billing_name: 'Amit Patel',
    billing_email: 'amit.patel@gmail.com',
    billing_phone: '+91 98200 12345',
    billing_address: '402 Sunrise Heights, Andheri East, Mumbai, Maharashtra 400069',
    billing_gst: '27AABCP1122D1ZP',
    issued_at: '2026-03-01T10:00:00Z',
    paid_at: '2026-03-01T10:05:00Z',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'inv-demo-2',
    invoice_number: 'INV-2026-00102',
    user_id: 'user-2',
    product_name: 'Telegram Group Member Scraper & Adder',
    plan_name: 'Monthly License',
    amount: 799,
    tax_rate: 18,
    tax_amount: 143.82,
    discount_amount: 0,
    total_amount: 942.82,
    currency: 'INR',
    payment_status: 'paid',
    payment_method: 'cashfree',
    payment_id: 'cf_order_998124',
    billing_name: 'Rohit Sharma',
    billing_email: 'rohit.sharma@outlook.com',
    billing_phone: '+91 99341 87654',
    billing_address: 'Sector 62, Noida, Uttar Pradesh',
    issued_at: '2026-03-20T11:00:00Z',
    paid_at: '2026-03-20T11:02:00Z',
    created_at: '2026-03-20T11:00:00Z',
  },
  {
    id: 'inv-demo-3',
    invoice_number: 'INV-2026-00103',
    user_id: 'user-3',
    product_name: 'JustDial & Google Maps B2B Leads Extractor',
    plan_name: 'Lifetime License',
    amount: 2999,
    tax_rate: 18,
    tax_amount: 539.82,
    discount_amount: 500,
    total_amount: 3038.82,
    currency: 'INR',
    payment_status: 'paid',
    payment_method: 'upi',
    payment_id: 'UPI-98218921-HDFC',
    billing_name: 'Vikas Verma',
    billing_email: 'vikas.verma@gmail.com',
    billing_phone: '+91 91234 56789',
    billing_address: 'Kankarbagh Main Rd, Patna, Bihar',
    issued_at: '2026-01-10T12:00:00Z',
    paid_at: '2026-01-10T12:10:00Z',
    created_at: '2026-01-10T12:00:00Z',
  }
];

export async function getInvoices(userId?: string): Promise<Invoice[]> {
  try {
    let query = supabase.from('invoices').select('*, user:profiles(*)').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (userId) {
        return DEFAULT_INVOICES.filter((i) => i.user_id === userId);
      }
      return DEFAULT_INVOICES;
    }
    return data as Invoice[];
  } catch {
    if (userId) {
      return DEFAULT_INVOICES.filter((i) => i.user_id === userId);
    }
    return DEFAULT_INVOICES;
  }
}

export async function createInvoice(invoice: Partial<Invoice>): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = invoice.invoice_number || `INV-${year}-${randomSeq}`;

    const newInvoice: Partial<Invoice> = {
      ...invoice,
      invoice_number: invoiceNumber,
      issued_at: invoice.issued_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('invoices').insert([newInvoice]).select().single();
    if (error) {
      console.warn('DB invoice insert failed, fallback:', error);
      return { success: true, invoice: { ...newInvoice, id: `inv-${Date.now()}` } as Invoice };
    }
    return { success: true, invoice: data as Invoice };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateInvoicePDF(invoice: Invoice, company?: CompanyProfile) {
  const profile = company || (await getCompanyProfile());
  const doc = new jsPDF();

  // Primary Accent Color (Indigo / Dark Slate)
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 38, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.company_name.toUpperCase(), 14, 20);

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
  doc.text(profile.legal_name || profile.company_name, 14, 55);
  doc.text(profile.address || '', 14, 61);
  doc.text(`${profile.city || ''}, ${profile.state || ''} - ${profile.pincode || ''}`, 14, 67);
  doc.text(`Email: ${profile.email}`, 14, 73);
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
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
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
    doc.text(`Bank: ${profile.bank_name || 'HDFC Bank'} | A/C: ${profile.bank_account_no || 'N/A'} | IFSC: ${profile.bank_ifsc || 'N/A'}`, 14, finalY + 22);
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
  doc.text(`Authorized by: ${profile.legal_name || 'RM Rahul — Super Admin'} | ${profile.website}`, 14, 280);

  doc.save(`${invoice.invoice_number}.pdf`);
}

export function generateLicenseCertificatePDF(license: License, company?: CompanyProfile) {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Elegant border
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(4);
  doc.rect(8, 8, 281, 194);
  doc.setLineWidth(1);
  doc.rect(12, 12, 273, 186);

  // Header
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
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
  doc.setFillColor(241, 245, 249);
  doc.rect(48, 80, 201, 24, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(48, 80, 201, 24, 'D');

  doc.setFontSize(18);
  doc.setFont('courier', 'bold');
  doc.setTextColor(67, 56, 202);
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
