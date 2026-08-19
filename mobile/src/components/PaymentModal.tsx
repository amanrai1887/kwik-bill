import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, CheckCircle, IndianRupee } from 'lucide-react-native';
import { Invoice } from '../types/index.ts';
import { api } from '../api/endpoints.ts';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  invoice,
  onSuccess,
}) => {
  if (!invoice) return null;

  const due = parseFloat(invoice.balanceDue || invoice.totalAmount);
  const [amount, setAmount] = useState(due.toString());
  const [paymentMode, setPaymentMode] = useState<'upi' | 'bank_transfer' | 'cash' | 'cheque'>('upi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid received amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.recordPayment({
        invoiceId: invoice.id,
        amount: numAmount.toFixed(2),
        paymentMethod: paymentMode,
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber,
        notes: `Recorded via Mobile App (${paymentMode.toUpperCase()})`,
      });
      Alert.alert('Payment Recorded', `Recorded payment of ₹${numAmount.toLocaleString('en-IN')}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Record Payment Settlement</Text>
              <Text style={styles.headerSub}>{invoice.invoiceNumber} • Due: ₹{due.toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.label}>Amount Received (₹) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
            />

            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.modesRow}>
              {[
                { id: 'upi', label: 'UPI / QR' },
                { id: 'bank_transfer', label: 'NEFT / RTGS' },
                { id: 'cash', label: 'Cash' },
                { id: 'cheque', label: 'Cheque' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setPaymentMode(m.id as any)}
                  style={[styles.modeBtn, paymentMode === m.id && styles.modeBtnActive]}
                >
                  <Text style={[styles.modeText, paymentMode === m.id && styles.modeTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Transaction / UTR Reference No (Optional)</Text>
            <TextInput
              style={styles.input}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              placeholder="e.g. UPI Ref 384918239 or IMPS12938"
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <CheckCircle size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Confirm Settlement</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  body: {
    padding: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 16,
  },
  modesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modeBtnActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modeTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
