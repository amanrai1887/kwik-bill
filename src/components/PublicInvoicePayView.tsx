import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check, 
  Building, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileText, 
  Zap, 
  Printer,
  QrCode,
  Share2,
  ChevronRight
} from 'lucide-react';
import { InvoiceRenderer } from './InvoiceRenderer.tsx';
import { generateLocalQrDataUrl } from '../lib/qrCode.ts';

export const PublicInvoicePayView: React.FC<{ invoiceNumberFromProp?: string }> = ({ invoiceNumberFromProp }) => {
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => {
    if (invoiceNumberFromProp) return invoiceNumberFromProp;
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1] || '';
  });

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');

  useEffect(() => {
    if (!invoiceNumber) return;

    async function fetchPublicInvoice() {
      try {
        const res = await fetch(`/api/invoices/public/${invoiceNumber}`);
        const data = await res.json();
        if (res.ok && data.invoice) {
          setInvoice(data.invoice);
        } else {
          setError(data.error || 'Invoice not found');
        }
      } catch (err: any) {
        setError('Failed to connect to billing server.');
      } finally {
        setLoading(false);
      }
    }

    fetchPublicInvoice();
  }, [invoiceNumber]);

  const isPaid = invoice ? invoice.status === 'paid' : false;
  const total = invoice ? parseFloat(invoice.totalAmount || '0') : 0;
  const paid = invoice ? parseFloat(invoice.paidAmount || '0') : 0;
  const balanceDue = Math.max(0, total - paid);
  const upiId = invoice?.merchant?.upiId || 'merchant@okhdfcbank';
  const businessName = invoice?.merchant?.businessName || 'Merchant Billing';
  const merchantPhone = invoice?.merchant?.phone || '';
  const merchantGstin = invoice?.merchant?.gstin || '';
  const bankAccount = invoice?.merchant?.bankAccountNo || '50200084729103';
  const bankIfsc = invoice?.merchant?.bankIfsc || 'HDFC0001244';
  const bankName = invoice?.merchant?.bankName || 'HDFC Bank';

  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${isPaid ? total : balanceDue}&cu=INR&tn=Invoice%20${invoice?.invoiceNumber || ''}`;

  useEffect(() => {
    if (invoice && upiDeepLink) {
      let isMounted = true;
      generateLocalQrDataUrl(upiDeepLink).then((url) => {
        if (isMounted) {
          setQrImageUrl(url);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [invoice, upiDeepLink]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Securing GST invoice data...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invoice Not Available</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'This invoice link may have expired or is invalid.'}</p>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl text-sm transition shadow-lg shadow-indigo-500/25 w-full"
          >
            Go to KwikBill Home
          </a>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, type: 'upi' | 'ifsc') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedIfsc(true);
      setTimeout(() => setCopiedIfsc(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 1. SCREEN VIEW (Interactive Dark Portal) */}
      <div className="no-print min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        {/* Top Ambient Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

        {/* Main Payment Container */}
        <main className="relative z-10 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
          {/* Top Header Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-800/80 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/30">
                {businessName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                  {businessName}
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    GST Verified
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Official GST Tax Invoice & Settlement Portal</p>
              </div>
            </div>

            {/* Quick Actions Header: Download & Print PDF */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                id="public-download-pdf-btn"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-600/30 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download / Print GST Invoice</span>
              </button>
            </div>
          </div>

          {/* 2-Column Hero Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Settlement & UPI QR Card */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Billing Card */}
              <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Status Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 font-bold text-xs px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fully Settled & Reconciled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 font-bold text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20">
                        <Clock className="w-4 h-4 text-amber-400" /> Payment Pending
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Due Date</span>
                    <span className="text-xs font-bold text-slate-200">{invoice.dueDate || 'Immediate'}</span>
                  </div>
                </div>

                {/* Outstanding Amount Showcase */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 mb-6">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                    {isPaid ? 'TOTAL SETTLED AMOUNT' : 'OUTSTANDING BALANCE DUE'}
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      ₹{(isPaid ? total : balanceDue).toLocaleString('en-IN')}
                    </span>
                    {balanceDue < total && !isPaid && (
                      <span className="text-xs text-slate-400">
                        (Total Bill: ₹{total.toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>
                </div>

                {/* Instant 1-Tap Mobile UPI Intent Button */}
                <div className="space-y-3">
                  <a
                    href={upiDeepLink}
                    className={`flex items-center justify-center gap-3 text-white font-extrabold py-4 px-6 rounded-2xl text-base transition shadow-xl w-full active:scale-[0.99] ${
                      isPaid 
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/25'
                    }`}
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    {isPaid ? 'Payment Complete (Open UPI)' : 'Pay via GPay / PhonePe / Paytm'}
                  </a>

                  {/* Copy UPI ID Pill */}
                  <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Merchant UPI ID:</span>
                      <strong className="text-emerald-400 font-mono text-xs sm:text-sm">{upiId}</strong>
                    </div>
                    <button
                      onClick={() => copyToClipboard(upiId, 'upi')}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUpi ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Direct Bank Wire Transfer / IMPS Section */}
                <div className="mt-6 pt-6 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Direct Bank Transfer (NEFT / RTGS / IMPS)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/70">
                      <span className="text-slate-500 block text-[10px]">Beneficiary Bank</span>
                      <strong className="text-slate-200">{bankName}</strong>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/70">
                      <span className="text-slate-500 block text-[10px]">Account Number</span>
                      <strong className="text-slate-200 font-mono">{bankAccount}</strong>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/70 col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 block text-[10px]">IFSC Code</span>
                        <strong className="text-slate-200 font-mono text-sm">{bankIfsc}</strong>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankIfsc, 'ifsc')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedIfsc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedIfsc ? 'Copied IFSC' : 'Copy IFSC'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed To Customer Card */}
              <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Billed To (Client / Customer)
                </span>
                <h3 className="text-base font-bold text-white mb-1">
                  {invoice.client?.name || 'Customer'}
                </h3>
                {invoice.client?.companyName && (
                  <p className="text-xs text-slate-400 mb-1">{invoice.client.companyName}</p>
                )}
                {invoice.client?.phone && (
                  <p className="text-xs text-slate-400 font-mono">WhatsApp Phone: +91 {invoice.client.phone}</p>
                )}
                {invoice.client?.gstin && (
                  <p className="text-xs text-indigo-400 font-mono mt-1">GSTIN: {invoice.client.gstin}</p>
                )}
              </div>
            </div>

            {/* Right Column: Dynamic UPI QR Code & Itemized Bill */}
            <div className="lg:col-span-5 space-y-6">
              {/* Dynamic UPI QR Code */}
              <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4 flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  Scan to Pay with Any UPI App
                </span>
                <div className="inline-block p-3.5 bg-white rounded-2xl shadow-2xl">
                  <img 
                    src={qrImageUrl}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 rounded-xl object-contain mx-auto"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                  Scan with <strong>Google Pay, PhonePe, Paytm, or BHIM</strong> to settle invoice #{invoice.invoiceNumber}.
                </p>
              </div>

              {/* Itemized Line Items Breakdown */}
              <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Itemized Line Items
                </h3>

                <div className="space-y-3 mb-4 text-xs divide-y divide-slate-800/80">
                  {Array.isArray(invoice.items) && invoice.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center pt-2.5 first:pt-0">
                      <div>
                        <span className="font-semibold text-slate-200 block">{item.description}</span>
                        <span className="text-slate-500 text-[11px]">{item.quantity} × ₹{Number(item.rate).toLocaleString('en-IN')}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-200">
                        ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{parseFloat(invoice.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  {parseFloat(invoice.taxAmount || '0') > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>GST ({invoice.taxRate}%)</span>
                      <span className="font-mono">₹{parseFloat(invoice.taxAmount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-white pt-2.5 border-t border-slate-800 text-sm">
                    <span>Total Bill Amount</span>
                    <span className="font-mono text-emerald-400 text-base">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Trust Footer */}
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              256-Bit SSL Encrypted Financial Portal
            </span>
            <span>
              Powered by <strong className="text-indigo-400">KwikBill GST Invoicing Platform</strong>
            </span>
          </div>
        </footer>
      </div>

      {/* 2. DEDICATED PRINT / PDF SHEET (Targets #printable-invoice for print media) */}
      <div id="printable-invoice" className="hidden print:block bg-white">
        <InvoiceRenderer

          invoice={invoice}
          profile={{
            id: invoice.merchant?.id || 1,
            uid: '',
            email: '',
            businessName: businessName,
            phone: merchantPhone,
            upiId: upiId,
            gstin: merchantGstin,
            address: invoice.merchant?.address || '',
            bankName: bankName,
            bankAccountNo: bankAccount,
            bankIfsc: bankIfsc,
            industryType: invoice.merchant?.industryType || 'general',
            subscriptionPlan: 'pro_499',
            subscriptionStatus: 'active',
            logoUrl: invoice.merchant?.logoUrl || '',
            invoiceTemplate: invoice.merchant?.invoiceTemplate || 'modern',
            brandColor: invoice.merchant?.brandColor || '#4f46e5',
            customFooter: invoice.merchant?.customFooter || '',
          }}
        />
      </div>
    </>
  );
};

