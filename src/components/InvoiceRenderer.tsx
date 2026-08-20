import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  Briefcase, 
  Layers, 
  Sparkles, 
  Zap,
  Scale
} from 'lucide-react';
import { Invoice, UserProfile, InvoiceTemplate } from '../lib/types.ts';
import { 
  calculateGstBreakdown, 
  getStateNameOrFormatted, 
  STATUTORY_INVOICE_DISCLAIMER, 
  STATUTORY_RCM_DISCLAIMER 
} from '../lib/gstCompliance.ts';
import { generateLocalQrDataUrl } from '../lib/qrCode.ts';

interface InvoiceRendererProps {
  invoice: Invoice;
  profile: UserProfile | null;
  templateOverride?: InvoiceTemplate;
  brandColorOverride?: string;
  logoUrlOverride?: string;
  customFooterOverride?: string;
  isPrint?: boolean;
}

export const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({
  invoice,
  profile,
  templateOverride,
  brandColorOverride,
  logoUrlOverride,
  customFooterOverride,
  isPrint = false,
}) => {
  const template: InvoiceTemplate = templateOverride || profile?.invoiceTemplate || 'modern';
  const brandColor: string = brandColorOverride || profile?.brandColor || '#4f46e5';
  const logoUrl: string = logoUrlOverride || profile?.logoUrl || '';
  const customFooter: string = customFooterOverride || profile?.customFooter || '';

  const subtotal = parseFloat(invoice.subtotal) || 0;
  const taxRateNum = parseFloat(invoice.taxRate) || 0;
  const tdsAmount = parseFloat(invoice.tdsAmount) || 0;
  const discountAmount = parseFloat(invoice.discountAmount) || 0;
  const totalAmount = parseFloat(invoice.totalAmount) || 0;
  const paidAmount = parseFloat(invoice.paidAmount) || 0;
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';
  const isPartial = invoice.status === 'partial';

  const upiId = profile?.upiId || 'merchant@okaxis';
  const businessName = profile?.businessName || 'Business Enterprise';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${balanceDue}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}`;

  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    generateLocalQrDataUrl(upiUrl).then((dataUrl) => {
      if (isMounted) {
        setQrCodeImageUrl(dataUrl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [upiUrl]);

  // GST Calculation Breakdown
  const gstBreakdown = calculateGstBreakdown(
    taxRateNum,
    subtotal,
    profile?.gstin,
    invoice.placeOfSupply || invoice.client?.gstin,
    invoice.taxType ? invoice.taxType === 'inter_state' : undefined
  );

  const placeOfSupplyFormatted = getStateNameOrFormatted(invoice.placeOfSupply || invoice.client?.gstin?.substring(0, 2) || profile?.gstin?.substring(0, 2));
  const isRcm = invoice.isRcm === true;

  // ==========================================
  // TEMPLATE 1: MODERN MINIMALIST (DEFAULT)
  // ==========================================
  if (template === 'modern') {
    return (
      <div className="space-y-6 bg-white text-slate-800 font-sans p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-200 gap-6">
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-xl border border-slate-100 p-1" />
            ) : (
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                {businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{businessName}</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">{profile?.address || 'Official Registered Supplier Address'}</p>
              <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                {profile?.phone && <p>Phone: <strong className="text-slate-800 font-mono">{profile.phone}</strong></p>}
                {profile?.gstin && <p>GSTIN: <strong className="text-slate-800 font-mono">{profile.gstin}</strong></p>}
                <p>UPI ID: <strong className="font-mono" style={{ color: brandColor }}>{upiId}</strong></p>
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-2xl font-extrabold uppercase tracking-wider block" style={{ color: brandColor }}>
              TAX INVOICE
            </span>
            <div className="mt-2 space-y-1 text-xs">
              <p><span className="text-slate-500">Invoice No:</span> <strong className="font-mono text-slate-900">{invoice.invoiceNumber}</strong></p>
              <p><span className="text-slate-500">Issue Date:</span> <strong className="text-slate-800">{invoice.issueDate}</strong></p>
              <p><span className="text-slate-500">Due Date:</span> <strong className="text-slate-800 font-bold">{invoice.dueDate}</strong></p>
            </div>
          </div>
        </div>

        {/* Billed To & Place of Supply */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Billed To (Client / Consignee)
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              {invoice.client?.companyName || invoice.client?.name}
            </h3>
            {invoice.client?.companyName && <p className="text-slate-600">Attn: {invoice.client?.name}</p>}
            <p className="text-slate-500 mt-1">{invoice.client?.address || 'Client Address'}</p>
            <p className="mt-1 font-mono text-slate-600">Phone: {invoice.client?.phone}</p>
            {invoice.client?.gstin ? (
              <p className="font-mono text-slate-800 font-bold">GSTIN: {invoice.client.gstin}</p>
            ) : (
              <p className="text-slate-400 italic">GSTIN: Unregistered Person (URP)</p>
            )}
          </div>

          <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2 sm:pt-0">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Statutory Tax Compliance
            </span>
            <p><span className="text-slate-500">Place of Supply:</span> <strong className="text-slate-900 font-mono">{placeOfSupplyFormatted}</strong></p>
            <p><span className="text-slate-500">Supply Type:</span> <strong className="text-slate-800">{gstBreakdown.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</strong></p>
            <p><span className="text-slate-500">{STATUTORY_RCM_DISCLAIMER}</span> <strong className={isRcm ? 'text-amber-700 font-bold' : 'text-slate-700'}>{isRcm ? 'YES' : 'NO'}</strong></p>

            {invoice.industryDetails?.vehicleNo ? (
              <div className="pt-1 mt-1 border-t border-slate-200">
                <p><span className="text-slate-500">Vehicle No:</span> <strong className="font-mono text-slate-900">{invoice.industryDetails.vehicleNo}</strong></p>
                <p><span className="text-slate-500">LR No:</span> <strong className="font-mono text-slate-900">{invoice.industryDetails.lrNumber || 'N/A'}</strong></p>
              </div>
            ) : (
              <div className="pt-1 mt-1 border-t border-slate-200 text-[11px] text-slate-600">
                <p>Bank: <strong>{profile?.bankName || 'HDFC Bank'}</strong> | A/C: <strong className="font-mono">{profile?.bankAccountNo || '50200084729103'}</strong></p>
                <p>IFSC: <strong className="font-mono">{profile?.bankIfsc || 'HDFC0001244'}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-hidden border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4 w-1/12 text-center">#</th>
                <th className="py-2.5 px-4 w-5/12">Item / Service Description</th>
                <th className="py-2.5 px-4 w-2/12 text-center">HSN/SAC</th>
                <th className="py-2.5 px-4 w-1/12 text-center">Qty</th>
                <th className="py-2.5 px-4 w-2/12 text-right">Rate (₹)</th>
                <th className="py-2.5 px-4 w-2/12 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {invoice.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.description}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600 font-medium">{item.hsnCode || '9983'}</td>
                  <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & QR */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
          <div className="sm:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Instant UPI QR Code
              </span>
              <p className="text-[10px] text-slate-500 mb-2">GPay / PhonePe / Paytm / BHIM</p>
              <div className="bg-white p-2 rounded-xl border border-slate-200 inline-block shadow-2xs">
                <img src={qrCodeImageUrl} alt="UPI QR Code" className="w-28 h-28 object-contain" />
              </div>
            </div>
            <div className="mt-2 text-[11px] font-mono font-bold px-2 py-1 rounded border bg-white text-slate-800">
              {upiId}
            </div>
          </div>

          <div className="sm:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value (Subtotal):</span>
              <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* GST Breakdown: CGST + SGST or IGST */}
            {gstBreakdown.isInterState ? (
              <div className="flex justify-between text-slate-600">
                <span>Integrated GST / IGST ({gstBreakdown.igstRate}%):</span>
                <span>+ ₹{gstBreakdown.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Central GST / CGST ({gstBreakdown.cgstRate}%):</span>
                  <span>+ ₹{gstBreakdown.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>State GST / SGST ({gstBreakdown.sgstRate}%):</span>
                  <span>+ ₹{gstBreakdown.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {tdsAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Less TDS ({invoice.tdsRate}%):</span>
                <span>- ₹{tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Total Bill Value:</span>
              <span className="text-base font-black" style={{ color: brandColor }}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-300 text-sm font-black text-slate-900">
              <span>Balance Payable:</span>
              <span className={`text-base ${balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Legal Statutory Disclaimer */}
        <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-2">
          <div>
            <p><strong>Notes:</strong> {invoice.notes || 'Payment due as per agreed terms.'}</p>
            {customFooter ? (
              <p className="text-slate-600 font-medium pt-0.5">{customFooter}</p>
            ) : (
              <p><strong>Terms:</strong> {invoice.terms || 'Payment is due within the stipulated days.'}</p>
            )}
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Statutory Notice: </span>
            {STATUTORY_INVOICE_DISCLAIMER}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 2: CORPORATE EXECUTIVE (SLATE / FORMAL)
  // ==========================================
  if (template === 'corporate') {
    return (
      <div className="space-y-6 bg-white text-slate-900 font-serif p-6 sm:p-10 border-t-8" style={{ borderTopColor: brandColor }}>
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
          <div>
            {logoUrl && <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain mb-2" />}
            <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">{businessName}</h1>
            <p className="text-xs text-slate-600 max-w-sm mt-1">{profile?.address}</p>
            <p className="text-xs font-mono text-slate-700 mt-1">GSTIN: {profile?.gstin || 'N/A'}</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-4 py-1.5 text-white font-sans text-xs font-extrabold uppercase tracking-widest rounded-md" style={{ backgroundColor: brandColor }}>
              Official Tax Invoice
            </div>
            <div className="mt-3 font-mono text-xs space-y-1">
              <p>INV NO: <strong>{invoice.invoiceNumber}</strong></p>
              <p>DATE: <strong>{invoice.issueDate}</strong></p>
              <p>DUE: <strong className="text-rose-700">{invoice.dueDate}</strong></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-100/70 border border-slate-300 font-sans text-xs">
          <div>
            <span className="font-bold uppercase text-[10px] text-slate-500 block mb-1">CLIENT / CONSIGNEE</span>
            <h3 className="font-bold text-sm text-slate-900">{invoice.client?.companyName || invoice.client?.name}</h3>
            <p className="text-slate-600">{invoice.client?.address}</p>
            <p className="font-mono text-slate-700 mt-1">GSTIN: {invoice.client?.gstin || 'Unregistered Person'}</p>
            <p className="font-mono text-slate-700">Place of Supply: <strong>{placeOfSupplyFormatted}</strong></p>
          </div>
          <div className="border-l border-slate-300 pl-4">
            <span className="font-bold uppercase text-[10px] text-slate-500 block mb-1">WIRE TRANSFER DETAILS</span>
            <p>Beneficiary: <strong>{businessName}</strong></p>
            <p>Bank: <strong>{profile?.bankName || 'State Bank of India'}</strong></p>
            <p className="font-mono">A/C No: <strong>{profile?.bankAccountNo || '10293847561'}</strong></p>
            <p className="font-mono">IFSC: <strong>{profile?.bankIfsc || 'SBIN0001234'}</strong></p>
            <p className="mt-1 text-[10px] text-slate-500">{STATUTORY_RCM_DISCLAIMER} <strong>{isRcm ? 'YES' : 'NO'}</strong></p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left font-sans text-xs border border-slate-300">
          <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
            <tr>
              <th className="p-2.5 border-r border-slate-700 text-center w-12">SR</th>
              <th className="p-2.5 border-r border-slate-700">DESCRIPTION</th>
              <th className="p-2.5 border-r border-slate-700 text-center w-20">HSN</th>
              <th className="p-2.5 border-r border-slate-700 text-center w-16">QTY</th>
              <th className="p-2.5 border-r border-slate-700 text-right w-28">RATE</th>
              <th className="p-2.5 text-right w-28">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {invoice.items?.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                <td className="p-2.5 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                <td className="p-2.5 border-r border-slate-300 font-semibold">{item.description}</td>
                <td className="p-2.5 border-r border-slate-300 text-center font-mono">{item.hsnCode || '9983'}</td>
                <td className="p-2.5 border-r border-slate-300 text-center font-mono">{item.quantity}</td>
                <td className="p-2.5 border-r border-slate-300 text-right font-mono">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-right font-mono font-bold">₹{(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom */}
        <div className="flex justify-between items-end pt-4 font-sans text-xs">
          <div className="max-w-sm space-y-2">
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {customFooter || 'All payments to be made by account payee cheque or electronic wire transfer only. Subject to local jurisdiction.'}
            </p>
            <p className="text-[10px] text-slate-400 italic">
              {STATUTORY_INVOICE_DISCLAIMER}
            </p>
          </div>
          <div className="w-80 bg-slate-900 text-white p-4 rounded-lg space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Taxable Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {gstBreakdown.isInterState ? (
              <div className="flex justify-between text-slate-300">
                <span>IGST ({gstBreakdown.igstRate}%):</span>
                <span>₹{gstBreakdown.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-300">
                  <span>CGST ({gstBreakdown.cgstRate}%):</span>
                  <span>₹{gstBreakdown.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>SGST ({gstBreakdown.sgstRate}%):</span>
                  <span>₹{gstBreakdown.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-slate-700 pt-2 text-emerald-400">
              <span>NET PAYABLE:</span>
              <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 3: EMERALD LOGISTICS (FREIGHT FOCUS)
  // ==========================================
  if (template === 'logistics') {
    return (
      <div className="space-y-6 bg-white text-slate-900 font-sans p-6 sm:p-8 border-2 border-emerald-500 rounded-3xl">
        <div className="flex justify-between items-start pb-4 border-b border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">TRANSPORT FREIGHT MANIFEST BILL</span>
              <h1 className="text-2xl font-black text-slate-900">{businessName}</h1>
              <p className="text-xs text-slate-500 font-mono">GSTIN: {profile?.gstin || '27AABCU9603R1ZN'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black font-mono text-emerald-700">#{invoice.invoiceNumber}</span>
            <p className="text-xs text-slate-500 mt-0.5">LR DATE: <strong>{invoice.issueDate}</strong></p>
            <p className="text-[10px] font-mono text-slate-600">POS: {placeOfSupplyFormatted}</p>
          </div>
        </div>

        {/* Transport Corridor Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">VEHICLE NUMBER</span>
            <strong className="font-mono text-slate-900 text-sm">{invoice.industryDetails?.vehicleNo || 'MH-04-GP-8842'}</strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">BILTY / LR NO.</span>
            <strong className="font-mono text-slate-900 text-sm">{invoice.industryDetails?.lrNumber || 'LR-994201'}</strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">FROM (ORIGIN)</span>
            <span className="font-semibold text-slate-800">{invoice.industryDetails?.routeFrom || 'Origin Hub'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">TO (DESTINATION)</span>
            <span className="font-semibold text-slate-800">{invoice.industryDetails?.routeTo || 'Destination'}</span>
          </div>
        </div>

        {/* Consignee */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">CONSIGNEE / PARTY:</span>
            <h4 className="font-bold text-slate-900 text-sm">{invoice.client?.companyName || invoice.client?.name}</h4>
            <p className="text-slate-500 text-[11px] font-mono">GSTIN: {invoice.client?.gstin || 'URP'}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{STATUTORY_RCM_DISCLAIMER}</span>
            <p className="font-bold text-slate-800">{isRcm ? 'YES (GTA)' : 'NO'}</p>
          </div>
        </div>

        {/* Freight Line Items */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-700 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="p-2.5">FREIGHT DESCRIPTION</th>
                <th className="p-2.5 text-center w-20">SAC</th>
                <th className="p-2.5 text-center w-16">TRIPS</th>
                <th className="p-2.5 text-right w-28">FREIGHT RATE</th>
                <th className="p-2.5 text-right w-28">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-semibold text-slate-900">{item.description}</td>
                  <td className="p-3 text-center font-mono">{item.hsnCode || '9965'}</td>
                  <td className="p-3 text-center font-mono">{item.quantity}</td>
                  <td className="p-3 text-right font-mono">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">UPI INSTANT SETTLE VPA</span>
            <p className="font-mono font-bold text-sm text-white">{upiId}</p>
            <p className="text-[10px] text-slate-400">{STATUTORY_INVOICE_DISCLAIMER}</p>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-slate-400 block">TOTAL FREIGHT CHARGES (GST INCL)</span>
            <span className="text-2xl font-black text-emerald-400">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 4: CREATIVE GRADIENT (AGENCY & TECH)
  // ==========================================
  if (template === 'creative') {
    return (
      <div className="space-y-6 bg-white text-slate-900 font-sans p-6 sm:p-8">
        {/* Gradient Header Banner */}
        <div 
          className="p-6 rounded-3xl text-white shadow-lg flex justify-between items-center"
          style={{ background: `linear-gradient(135deg, ${brandColor}, #312e81)` }}
        >
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain bg-white rounded-2xl p-1" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">DIGITAL DELIVERABLES INVOICE</span>
              <h1 className="text-2xl font-black text-white">{businessName}</h1>
              <p className="text-xs text-indigo-200 font-mono">GSTIN: {profile?.gstin || 'N/A'}</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-indigo-200 block">INV REF</span>
            <span className="text-xl font-black text-white">#{invoice.invoiceNumber}</span>
            <span className="text-[10px] text-indigo-200 block mt-0.5">POS: {placeOfSupplyFormatted}</span>
          </div>
        </div>

        {/* 2-Col Agency Meta */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-1">CLIENT PARTNER</span>
            <h3 className="font-bold text-slate-900 text-sm">{invoice.client?.companyName || invoice.client?.name}</h3>
            <p className="text-slate-500 mt-0.5">{invoice.client?.email || invoice.client?.phone}</p>
            {invoice.client?.gstin && <p className="text-slate-700 font-mono mt-1">GSTIN: {invoice.client.gstin}</p>}
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CAMPAIGN / SOW</span>
            <h3 className="font-bold text-slate-900 text-sm">{invoice.industryDetails?.campaignName || 'Sprint Deliverables'}</h3>
            <p className="text-slate-500 mt-0.5">{invoice.industryDetails?.milestone || 'Phase 1 Completed'}</p>
          </div>
        </div>

        {/* Deliverables Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">SCOPE / DELIVERABLE</th>
                <th className="p-3 text-center w-20">SAC CODE</th>
                <th className="p-3 text-center w-20">UNITS</th>
                <th className="p-3 text-right w-28">RATE</th>
                <th className="p-3 text-right w-28">FEE (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-semibold text-slate-900">{item.description}</td>
                  <td className="p-3.5 text-center font-mono text-slate-500">{item.hsnCode || '998311'}</td>
                  <td className="p-3.5 text-center font-mono">{item.quantity}</td>
                  <td className="p-3.5 text-right font-mono">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">₹{(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Total */}
        <div className="flex justify-between items-center p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">SETTLEMENT METHOD</span>
            <p className="text-xs font-mono font-bold text-indigo-700 mt-0.5">{upiId}</p>
            <p className="text-[10px] text-slate-400 mt-1">{STATUTORY_INVOICE_DISCLAIMER}</p>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-slate-500 block">TOTAL DUE</span>
            <span className="text-2xl font-black" style={{ color: brandColor }}>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 5: CLASSIC CA STANDARD (GST SHEET)
  // ==========================================
  if (template === 'classic') {
    return (
      <div className="space-y-4 bg-white text-slate-900 font-sans p-6 border border-slate-300 text-xs">
        <div className="text-center pb-3 border-b-2 border-slate-900">
          <h1 className="text-2xl font-black uppercase tracking-tight">{businessName}</h1>
          <p className="text-[11px] text-slate-600">{profile?.address}</p>
          <p className="text-[11px] font-mono">GSTIN: {profile?.gstin || '27AABCU9603R1ZN'}</p>
        </div>

        <div className="flex justify-between border-b border-slate-300 pb-3">
          <div>
            <p><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
            <p><strong>Invoice Date:</strong> {invoice.issueDate}</p>
            <p><strong>Due Date:</strong> {invoice.dueDate}</p>
          </div>
          <div className="text-right">
            <p><strong>Customer Name:</strong> {invoice.client?.companyName || invoice.client?.name}</p>
            <p><strong>Customer GSTIN:</strong> {invoice.client?.gstin || 'URP'}</p>
            <p><strong>Place of Supply:</strong> {placeOfSupplyFormatted}</p>
            <p><strong>Reverse Charge (RCM):</strong> {isRcm ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* GST Tax Slab Breakdown Table */}
        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead>
            <tr className="bg-slate-100 text-center font-bold">
              <th className="border border-slate-400 p-2">Item Description</th>
              <th className="border border-slate-400 p-2 w-16">HSN/SAC</th>
              <th className="border border-slate-400 p-2 w-12">Qty</th>
              <th className="border border-slate-400 p-2 w-20">Rate</th>
              <th className="border border-slate-400 p-2 w-20">Taxable</th>
              {gstBreakdown.isInterState ? (
                <th className="border border-slate-400 p-2 w-24">IGST ({gstBreakdown.igstRate}%)</th>
              ) : (
                <>
                  <th className="border border-slate-400 p-2 w-16">CGST ({gstBreakdown.cgstRate}%)</th>
                  <th className="border border-slate-400 p-2 w-16">SGST ({gstBreakdown.sgstRate}%)</th>
                </>
              )}
              <th className="border border-slate-400 p-2 w-24">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, idx) => {
              const itemTaxable = Number(item.quantity) * Number(item.rate);
              const itemTaxAmount = (itemTaxable * taxRateNum) / 100;
              const itemTotal = itemTaxable + itemTaxAmount;

              return (
                <tr key={idx} className="text-center font-mono">
                  <td className="border border-slate-400 p-2 text-left font-sans font-semibold">{item.description}</td>
                  <td className="border border-slate-400 p-2">{item.hsnCode || '9983'}</td>
                  <td className="border border-slate-400 p-2">{item.quantity}</td>
                  <td className="border border-slate-400 p-2 text-right">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                  <td className="border border-slate-400 p-2 text-right">₹{itemTaxable.toLocaleString('en-IN')}</td>
                  {gstBreakdown.isInterState ? (
                    <td className="border border-slate-400 p-2 text-right">₹{itemTaxAmount.toFixed(2)}</td>
                  ) : (
                    <>
                      <td className="border border-slate-400 p-2 text-right">₹{(itemTaxAmount / 2).toFixed(2)}</td>
                      <td className="border border-slate-400 p-2 text-right">₹{(itemTaxAmount / 2).toFixed(2)}</td>
                    </>
                  )}
                  <td className="border border-slate-400 p-2 text-right font-bold">₹{itemTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Classic GST Summary */}
        <div className="flex justify-between pt-2">
          <div className="text-[11px] text-slate-600 max-w-sm space-y-2">
            <p>Certified that the particulars given above are true and correct.</p>
            <p className="text-[10px] text-slate-500 italic">{STATUTORY_INVOICE_DISCLAIMER}</p>
            <p className="mt-4">Authorized Signatory For <strong>{businessName}</strong></p>
          </div>
          <div className="w-72 space-y-1 font-mono text-xs text-right">
            <p>Total Taxable Amount: <strong>₹{subtotal.toFixed(2)}</strong></p>
            {gstBreakdown.isInterState ? (
              <p>IGST ({gstBreakdown.igstRate}%): <strong>₹{gstBreakdown.igstAmount.toFixed(2)}</strong></p>
            ) : (
              <>
                <p>CGST ({gstBreakdown.cgstRate}%): <strong>₹{gstBreakdown.cgstAmount.toFixed(2)}</strong></p>
                <p>SGST ({gstBreakdown.sgstRate}%): <strong>₹{gstBreakdown.sgstAmount.toFixed(2)}</strong></p>
              </>
            )}
            <p className="text-sm font-bold border-t border-slate-400 pt-1 text-indigo-900">GRAND TOTAL: ₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 6: DARK NEON PRO (TECH / MODERN)
  // ==========================================
  return (
    <div className="space-y-6 bg-slate-950 text-slate-100 font-sans p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-start pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-xl bg-slate-900 border border-slate-800 p-1" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/25">
              {businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mb-1">
              <Zap className="w-3 h-3 fill-current" /> Verified GST Invoice
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{businessName}</h1>
          </div>
        </div>
        <div className="text-right font-mono">
          <span className="text-xs text-indigo-400 block font-bold">INVOICE #{invoice.invoiceNumber}</span>
          <span className="text-[11px] text-slate-400">Due: {invoice.dueDate}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">POS: {placeOfSupplyFormatted}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">BILLED TO</span>
          <h3 className="font-bold text-white text-sm">{invoice.client?.companyName || invoice.client?.name}</h3>
          <p className="text-slate-400 font-mono mt-1">+91 {invoice.client?.phone}</p>
          {invoice.client?.gstin && <p className="text-slate-400 font-mono">GSTIN: {invoice.client.gstin}</p>}
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">PAYABLE AMOUNT</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
          <p className="text-[10px] text-slate-500 mt-1">Tax: {gstBreakdown.isInterState ? `IGST (${gstBreakdown.igstRate}%)` : `CGST+SGST (${gstBreakdown.taxRate}%)`}</p>
        </div>
      </div>

      {/* Dark Items Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">ITEM DESCRIPTION</th>
              <th className="p-3 text-center w-20">HSN</th>
              <th className="p-3 text-center w-16">QTY</th>
              <th className="p-3 text-right w-28">RATE</th>
              <th className="p-3 text-right w-28">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {invoice.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="p-3.5 font-semibold text-white">{item.description}</td>
                <td className="p-3.5 text-center font-mono text-slate-400">{item.hsnCode || '9983'}</td>
                <td className="p-3.5 text-center font-mono">{item.quantity}</td>
                <td className="p-3.5 text-right font-mono">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                <td className="p-3.5 text-right font-mono font-bold text-emerald-400">₹{(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UPI QR pill & statutory disclaimer */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs font-mono">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block">Instant UPI VPA</span>
            <strong className="text-emerald-400">{upiId}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[10px] uppercase block">Status</span>
            <strong className="text-white uppercase">{invoice.status}</strong>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 font-sans pt-1 border-t border-slate-800">
          {STATUTORY_INVOICE_DISCLAIMER}
        </p>
      </div>
    </div>
  );
};
