import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Scale, 
  Lock, 
  FileText, 
  IndianRupee, 
  CheckCircle2, 
  HelpCircle,
  AlertTriangle,
  Building2
} from 'lucide-react';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'gst' | 'terms' | 'privacy' | 'payments';
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'gst',
}) => {
  const [activeTab, setActiveTab] = useState<'gst' | 'terms' | 'privacy' | 'payments'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Legal & Regulatory Compliance</h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Gov. of India Aligned
                </span>
              </div>
              <p className="text-xs text-slate-500">CGST Rules 2017 • IT Act 2000 • DPDP Act 2023 • NPCI UPI Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('gst')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'gst'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🧾 GST Rule 46 Compliance
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            💳 RBI & UPI Payments
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            📜 Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🔒 Privacy (DPDP Act 2023)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs leading-relaxed">
          {/* TAB 1: GST */}
          {activeTab === 'gst' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Full Compliance with Rule 46 of Central Goods & Services Tax (CGST) Rules, 2017
                </h3>
                <p className="text-xs text-emerald-900 mt-1">
                  KwikBill Pro invoices are engineered to fulfill all statutory requirements mandated by the Government of India for valid Tax Invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Mandatory Fields Checklist</h4>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    <li><strong>Supplier & Client GSTIN:</strong> 15-digit alphanumeric identifier verified.</li>
                    <li><strong>Consecutive Serial Number:</strong> Unique alphanumeric identifier (Max 16 characters per Financial Year).</li>
                    <li><strong>HSN / SAC Code:</strong> 4 or 6-digit Harmonized System of Nomenclature code per item.</li>
                    <li><strong>Place of Supply:</strong> 2-digit official state code & state name.</li>
                    <li><strong>Tax Split:</strong> Intra-State (CGST + SGST) vs Inter-State (IGST).</li>
                    <li><strong>Reverse Charge (RCM):</strong> Explicit declaration on each document.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Digital Validity & IT Act, 2000</h4>
                  <p className="text-slate-600">
                    As per Section 65B of the Indian Evidence Act, 1872 and Section 4 of the Information Technology Act, 2000, electronic tax invoices generated with complete audit metadata do not mandate physical wet ink signatures when accompanied by standard electronic statutory declarations.
                  </p>
                  <p className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-800">
                    &ldquo;This is a computer-generated Tax Invoice issued in compliance with Rule 46 of CGST Rules, 2017.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-indigo-600" />
                  NPCI UPI Protocol & RBI Intermediary Guidelines
                </h3>
                <p className="text-xs text-indigo-900 mt-1">
                  KwikBill Pro facilitates direct merchant settlement and does not hold or escrow client funds.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">1. Direct Peer-to-Merchant (P2M / P2P) UPI Settlement</h4>
                  <p className="text-slate-600">
                    All dynamic QR codes generated by KwikBill Pro use official NPCI deep-linking parameters (<code className="bg-white px-1 py-0.5 rounded border font-mono">upi://pay?pa=...&pn=...&am=...</code>). When your client scans the QR code, payments transfer <strong>immediately and directly into your own bank account / UPI VPA</strong>. KwikBill Pro does not act as an escrow agent.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">2. RBI Payment Aggregator (PA) Non-Applicability</h4>
                  <p className="text-slate-600">
                    Because client payments flow directly between payer and payee bank accounts without intermediate pooling, KwikBill Pro operates as a pure software billing utility and is exempted from RBI Payment Aggregator licensing constraints.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Software as a Service (SaaS) Agreement</h3>
                <p className="text-slate-600">
                  By using KwikBill Pro, you acknowledge that KwikBill Pro provides billing, CRM, and automated communication software tools.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">1. User Responsibility for Tax Filings</h4>
                  <p className="text-slate-600">
                    Users are solely responsible for ensuring the accuracy of GST rates, HSN codes, Place of Supply designations, and timely filing of GSTR-1 and GSTR-3B with the GST Network (GSTN). KwikBill Pro does not provide certified tax consultancy.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">2. WhatsApp Messaging & Anti-Spam Policy</h4>
                  <p className="text-slate-600">
                    Users agree to utilize automated WhatsApp payment reminders strictly for genuine commercial transactions and legitimate receivables. Transmission of unsolicited promotional spam or harassment is strictly prohibited.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">3. Subscription Billing & Refunds</h4>
                  <p className="text-slate-600">
                    KwikBill Pro offers a 15-day free trial. Paid subscriptions (Starter ₹299 / Pro ₹499) are billed on a recurring monthly or annual basis. Cancellations take effect at the conclusion of the current billing cycle.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  Digital Personal Data Protection (DPDP) Act, 2023 Compliance
                </h3>
                <p className="text-xs text-indigo-900 mt-1">
                  We implement industry-standard encryption, role-based access control, and strict data residency controls.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">1. Data Collected & Purpose</h4>
                  <p className="text-slate-600">
                    We collect business profile details (business name, address, GSTIN, UPI ID) and client transaction records solely for generating tax invoices, tracking receivable aging, and dispatching requested payment reminders.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">2. No Third-Party Data Selling</h4>
                  <p className="text-slate-600">
                    Your customer contact lists, financial statements, and invoice records are strictly private. We never monetize, share, or sell tenant business data to third-party advertisers.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">3. Data Principal Rights</h4>
                  <p className="text-slate-600">
                    In compliance with the DPDP Act 2023, users maintain full rights to access, export, modify, or permanently purge their data records upon request.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            KwikBill Pro Compliance Policy v2.0 • Updated August 2026
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
