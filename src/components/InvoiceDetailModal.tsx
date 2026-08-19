import React from 'react';
import { 
  X, 
  Printer, 
  MessageSquare, 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Truck, 
  Building, 
  Share2, 
  QrCode,
  IndianRupee
} from 'lucide-react';
import { Invoice, UserProfile } from '../lib/types.ts';
import { InvoiceRenderer } from './InvoiceRenderer.tsx';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  profile: UserProfile | null;
  onSendReminder: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  profile,
  onSendReminder,
  onRecordPayment,
}) => {
  if (!isOpen || !invoice) return null;

  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';
  const isPartial = invoice.status === 'partial';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Controls Bar (No Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Invoice #{invoice.invoiceNumber}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isOverdue
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : isPartial
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendReminder(invoice)}
              id="detail-whatsapp-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Alert</span>
            </button>

            {!isPaid && (
              <button
                onClick={() => onRecordPayment(invoice)}
                id="detail-record-pay-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Settle</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              id="detail-print-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              id="detail-close-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Printable Invoice Sheet */}
        <div id="printable-invoice" className="overflow-y-auto flex-1 bg-white">
          <InvoiceRenderer invoice={invoice} profile={profile} />
        </div>
      </div>
    </div>
  );
};

