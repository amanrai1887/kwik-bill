import { createRazorpayOrderApi, verifyRazorpayPaymentApi } from './api.ts';
import { toast } from '../context/ToastContext.tsx';

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Ensures the Razorpay checkout script is loaded into the DOM
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface LaunchCheckoutOptions {
  amountInPaise: number;
  planId: string;
  planName: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (verifyRes: any) => void;
  onError?: (errMsg: string) => void;
  onDismiss?: () => void;
}

/**
 * Launches the native Razorpay checkout overlay
 */
export async function launchRazorpayCheckout({
  amountInPaise,
  planId,
  planName,
  userEmail = '',
  userName = '',
  userPhone = '',
  onSuccess,
  onError,
  onDismiss,
}: LaunchCheckoutOptions): Promise<void> {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    // 1. Create order on backend (Serverless API)
    const orderData = await createRazorpayOrderApi(amountInPaise, planId, {
      planName,
      customerEmail: userEmail,
    });

    const viteEnvKey = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_RAZORPAY_KEY_ID : undefined;
    const keyId = orderData.key_id || viteEnvKey || 'rzp_test_TReZcmt9KLYGJB';

    if (!orderData || !orderData.order_id) {
      throw new Error('Could not initialize payment order with gateway');
    }

    // 2. Configure Razorpay Standard Checkout options
    const options = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'KwikBill Pro',
      description: `Subscription for ${planName}`,
      image: '/logo.png',
      order_id: orderData.order_id,
      prefill: {
        name: userName || '',
        email: userEmail || '',
        contact: userPhone || '',
      },
      theme: {
        color: '#4f46e5', // KwikBill Indigo Brand Color
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        try {
          // 4. Send signature to backend for HMAC verification
          const verificationResult = await verifyRazorpayPaymentApi({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId,
          });

          if (onSuccess) {
            onSuccess(verificationResult);
          }
        } catch (verifyErr: any) {
          console.error('[Payment Verification Failed]:', verifyErr);
          const errorMsg = verifyErr.message || 'Payment signature verification failed';
          if (onError) onError(errorMsg);
          else toast.error(`Payment Error: ${errorMsg}`, 'Verification Failed');
        }
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (response: any) {
      console.error('[Razorpay payment.failed]:', response.error);
      const errMsg = response.error?.description || 'Payment transaction failed';
      if (onError) onError(errMsg);
      else toast.error(`Payment Failed: ${errMsg}`, 'Transaction Error');
    });

    // Open Modal
    rzp.open();
  } catch (error: any) {
    console.error('[Razorpay Launch Error]:', error);
    const msg = error.message || 'Failed to initiate payment checkout';
    if (onError) onError(msg);
    else toast.error(`Error: ${msg}`, 'Payment Gateway Error');
  }
}
