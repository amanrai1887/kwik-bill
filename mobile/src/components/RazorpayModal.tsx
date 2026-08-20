import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { X, ShieldCheck, Lock } from 'lucide-react-native';
import { api } from '../api/endpoints.ts';

interface RazorpayModalProps {
  visible: boolean;
  orderId: string;
  keyId: string;
  amountInPaise: number;
  planName: string;
  planId: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onClose: () => void;
  onSuccess: (verifyResult: any) => void;
  onError?: (err: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  visible,
  orderId,
  keyId,
  amountInPaise,
  planName,
  planId,
  userEmail = '',
  userName = '',
  userPhone = '',
  onClose,
  onSuccess,
  onError,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);

  if (!visible || !orderId || !keyId) return null;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>KwikBill Razorpay Checkout</title>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #f8fafc;
        }
        .container {
          text-align: center;
          padding: 24px;
        }
        .spinner {
          width: 44px;
          height: 44px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        h2 { font-size: 17px; margin-bottom: 6px; font-weight: 700; color: #fff; }
        p { font-size: 13px; color: #94a3b8; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h2>Launching Payment Gateway</h2>
        <p>Connecting to Razorpay secure checkout...</p>
      </div>

      <script>
        function initRazorpay() {
          const options = {
            key: "${keyId}",
            amount: ${amountInPaise},
            currency: "INR",
            name: "KwikBill Pro",
            description: "${planName}",
            image: "https://cdn-icons-png.flaticon.com/512/3135/3135706.png",
            order_id: "${orderId}",
            prefill: {
              name: "${userName.replace(/"/g, '\\"')}",
              email: "${userEmail.replace(/"/g, '\\"')}",
              contact: "${userPhone.replace(/"/g, '\\"')}"
            },
            theme: {
              color: "#4f46e5"
            },
            modal: {
              ondismiss: function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: "DISMISSED" }));
                }
              }
            },
            handler: function(response) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: "PAYMENT_SUCCESS",
                  data: response
                }));
              }
            }
          };

          const rzp = new Razorpay(options);

          rzp.on("payment.failed", function(response) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "PAYMENT_FAILED",
                error: response.error ? response.error.description : "Payment failed"
              }));
            }
          });

          rzp.open();
        }

        // Trigger after DOM is ready
        setTimeout(initRazorpay, 300);
      </script>
    </body>
    </html>
  `;

  const handleMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'DISMISSED') {
        onClose();
        return;
      }

      if (message.type === 'PAYMENT_FAILED') {
        const errorText = message.error || 'Payment failed or was cancelled.';
        if (onError) onError(errorText);
        else Alert.alert('Payment Failed', errorText);
        onClose();
        return;
      }

      if (message.type === 'PAYMENT_SUCCESS') {
        const paymentData = message.data;
        setIsVerifying(true);

        try {
          // Call backend to verify HMAC signature
          const verifyResult = await api.verifyRazorpayPayment({
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature,
            planId,
          });

          setIsVerifying(false);
          onSuccess(verifyResult);
          onClose();
        } catch (verifyErr: any) {
          setIsVerifying(false);
          const verifyErrorMsg = verifyErr.message || 'Signature verification failed';
          if (onError) onError(verifyErrorMsg);
          else Alert.alert('Verification Error', verifyErrorMsg);
          onClose();
        }
      }
    } catch (e: any) {
      console.error('[Razorpay WebView Message Parse Error]:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.lockBadge}>
              <Lock size={12} color="#059669" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Razorpay Checkout</Text>
              <Text style={styles.headerSubtitle}>256-bit SSL Encrypted</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Verification Loader overlay */}
        {isVerifying ? (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.verifyingTitle}>Verifying Payment...</Text>
            <Text style={styles.verifyingSub}>Please do not close the app while we activate your plan.</Text>
          </View>
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent, baseUrl: 'https://checkout.razorpay.com' }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Connecting to Razorpay...</Text>
              </View>
            )}
            style={styles.webView}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    height: 56,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  verifyingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  verifyingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  verifyingSub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
