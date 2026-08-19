import React, { useState } from 'react';
import { CreditCard, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { launchRazorpayCheckout } from '../lib/razorpay.ts';
import { useAuth } from '../lib/AuthContext.tsx';

interface RazorpayCheckoutButtonProps {
  planId: 'starter_299' | 'pro_499';
  planName: string;
  amountInRupees: number;
  className?: string;
  buttonText?: string;
  onPaymentSuccess?: (result: any) => void;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  planId,
  planName,
  amountInRupees,
  className = '',
  buttonText,
  onPaymentSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const amountInPaise = amountInRupees * 100;

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage(null);

    await launchRazorpayCheckout({
      amountInPaise,
      planId,
      planName,
      userEmail: user?.email || '',
      userName: user?.displayName || user?.email?.split('@')[0] || 'Subscriber',
      onSuccess: (res) => {
        setLoading(false);
        setSuccess(true);
        if (onPaymentSuccess) {
          onPaymentSuccess(res);
        }
      },
      onError: (errMsg) => {
        setLoading(false);
        setErrorMessage(errMsg);
      },
      onDismiss: () => {
        setLoading(false);
      },
    });
  };

  if (success) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Plan Activated!</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        id={`razorpay-btn-${planId}`}
        onClick={handleCheckout}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          className || 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Opening Gateway...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-3.5 h-3.5" />
            <span>{buttonText || `Pay ₹${amountInRupees} via Razorpay`}</span>
          </>
        )}
      </button>

      {errorMessage && (
        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
          {errorMessage}
        </span>
      )}
    </div>
  );
};
