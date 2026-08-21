import React, { useState } from 'react';
import { X, CreditCard, IndianRupee, AlertCircle, Sparkles } from 'lucide-react';
import { Invoice } from '../lib/types.ts';
import { triggerPaymentCelebration } from '../utils/confetti.ts';
import { toast } from '../context/ToastContext.tsx';

interface PaymentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSubmit: (paymentData: any) => Promise<void>;
}

export const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSubmit,
}) => {
  if (!isOpen || !invoice) return null;

  const total = parseFloat(invoice.totalAmount) || 0;
  const alreadyPaid = parseFloat(invoice.paidAmount) || 0;
  const balanceDue = Math.max(0, total - alreadyPaid);

  const [amount, setAmount] = useState<number>(balanceDue);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer' | 'cash' | 'cheque' | 'card'>('upi');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState<string>(`UPI-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [notes, setNotes] = useState<string>('Received via UPI transaction');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Please enter a valid payment amount greater than ₹0.';
    } else if (amount > balanceDue + 0.01) {
      errors.amount = `Payment amount (₹${amount.toLocaleString('en-IN')}) cannot exceed the balance due (₹${balanceDue.toLocaleString('en-IN')}).`;
    }

    if (!paymentDate) {
      errors.paymentDate = 'Payment date is required.';
    } else {
      const selected = new Date(paymentDate);
      const maxFutureDate = new Date();
      maxFutureDate.setDate(maxFutureDate.getDate() + 30);
      if (selected > maxFutureDate) {
        errors.paymentDate = 'Payment date cannot be more than 30 days in the future.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Please fix the errors before recording the payment.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        invoiceId: invoice.id,
        amount: Number(amount.toFixed(2)),
        paymentMethod,
        paymentDate,
        notes: (referenceNumber ? `Ref: ${referenceNumber.trim()} | ` : '') + notes.trim(),
      });
      // 🎉 Trigger celebratory confetti on payment recording!
      triggerPaymentCelebration();
      toast.success(`Recorded ₹${amount.toLocaleString('en-IN')} payment for #${invoice.invoiceNumber}`, 'Payment Recorded');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment', 'Payment Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full my-8 overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Record Settlement</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-payment-modal-btn"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs" noValidate>
          {/* Outstanding Balance Banner */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Due</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAmount(balanceDue);
                setFieldErrors(prev => ({ ...prev, amount: '' }));
              }}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
            >
              Fill Full Amount
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
              Received Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              max={balanceDue}
              step="any"
              value={amount || ''}
              onChange={(e) => {
                setAmount(parseFloat(e.target.value) || 0);
                if (fieldErrors.amount) setFieldErrors(prev => ({ ...prev, amount: '' }));
              }}
              className={`w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl font-bold font-mono text-sm text-slate-900 dark:text-white focus:outline-none transition-colors ${
                fieldErrors.amount ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.amount && (
              <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.amount}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'upi', label: 'UPI / QR' },
                { id: 'bank_transfer', label: 'NEFT / RTGS / IMPS' },
                { id: 'cheque', label: 'Cheque' },
                { id: 'cash', label: 'Cash' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => {
                  setPaymentDate(e.target.value);
                  if (fieldErrors.paymentDate) setFieldErrors(prev => ({ ...prev, paymentDate: '' }));
                }}
                className={`w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-slate-900 dark:text-white font-medium transition-colors ${
                  fieldErrors.paymentDate ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                }`}
              />
              {fieldErrors.paymentDate && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {fieldErrors.paymentDate}
                </p>
              )}
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                UTR / Reference No.
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="UPI-40918842"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via Google Pay"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="confirm-payment-record-btn"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSubmitting ? 'Recording...' : 'Confirm & Celebrate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
