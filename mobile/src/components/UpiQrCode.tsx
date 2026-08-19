import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface UpiQrCodeProps {
  upiId: string;
  businessName: string;
  amount?: number | string;
  invoiceNumber?: string;
  size?: number;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  upiId,
  businessName,
  amount,
  invoiceNumber,
  size = 200,
}) => {
  if (!upiId) {
    return (
      <View style={[styles.emptyContainer, { width: size, height: size }]}>
        <Text style={styles.emptyText}>No UPI ID configured</Text>
      </View>
    );
  }

  // Construct UPI deep-link URL (NPCI Standard)
  const encodedName = encodeURIComponent(businessName || 'Business');
  const amountStr = amount ? `&am=${parseFloat(amount.toString()).toFixed(2)}` : '';
  const noteStr = invoiceNumber ? `&tn=Payment%20for%20Invoice%20${invoiceNumber}` : '';
  
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodedName}&cu=INR${amountStr}${noteStr}`;

  return (
    <View style={styles.container}>
      <View style={styles.qrWrapper}>
        <QRCode
          value={upiUrl}
          size={size}
          color="#0f172a"
          backgroundColor="#ffffff"
        />
      </View>
      <Text style={styles.upiIdText}>UPI ID: {upiId}</Text>
      <Text style={styles.scanText}>Scan with any UPI App (GPay, PhonePe, Paytm)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  upiIdText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    fontFamily: 'monospace',
  },
  scanText: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748b',
  },
  emptyContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
