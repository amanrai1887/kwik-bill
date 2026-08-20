import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Send,
  CheckCircle,
  QrCode,
  Building,
  Calendar,
  IndianRupee,
  Share2,
  Trash2,
  ArrowLeft,
  Download,
  Printer,
  AlertCircle,
  XCircle,
} from 'lucide-react-native';

import { api } from '../api/endpoints.ts';
import { useMobileAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Invoice } from '../types/index.ts';
import { UpiQrCode } from '../components/UpiQrCode.tsx';
import { WhatsAppModal } from '../components/WhatsAppModal.tsx';
import { PaymentModal } from '../components/PaymentModal.tsx';
import { 
  calculateGstBreakdown, 
  getStateNameOrFormatted, 
  STATUTORY_INVOICE_DISCLAIMER 
} from '../utils/gstCompliance.ts';

export const InvoiceDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { invoiceId } = route.params;
  const { user } = useMobileAuth();
  const { t } = useLanguage();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showQrModal, setShowQrModal] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const loadInvoice = useCallback(async () => {
    try {
      const allInvoices = await api.getInvoices();
      const found = allInvoices.find((i) => i.id === invoiceId);
      if (found) setInvoice(found);
    } catch (e) {
      console.log('Error loading invoice details:', e);
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleCancelInvoice = async () => {
    Alert.alert(
      'Cancel Invoice (GST Void)',
      'Are you sure you want to cancel this invoice? Under GST Rule 46, cancelling marks the invoice void in your sales register while keeping statutory audit integrity.',
      [
        { text: 'Keep Active', style: 'cancel' },
        {
          text: 'Yes, Cancel Invoice',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteInvoice(invoiceId);
              Alert.alert('Invoice Cancelled', 'The invoice has been successfully marked as void/cancelled.');
              loadInvoice();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel invoice');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !invoice) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const isCancelled = invoice.status === 'cancelled' || invoice.isCancelled;
  const isPaid = invoice.status === 'paid' && !isCancelled;
  const balance = parseFloat(invoice.balanceDue || invoice.totalAmount);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Full Bleed Dark Hero Header */}
        <LinearGradient
          colors={isCancelled ? ['#1e293b', '#334155', '#475569'] : ['#0f172a', '#1e1b4b', '#312e81']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.heroTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <ArrowLeft size={18} color="#ffffff" />
              </TouchableOpacity>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.heroSubText}>
                    {isCancelled ? 'CANCELLED / VOIDED INVOICE' : t('tax_invoice_details', 'TAX INVOICE DETAILS')}
                  </Text>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, color: '#f8fafc', fontWeight: '800', textTransform: 'uppercase' }}>
                      {user?.invoiceTemplate || 'modern'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.heroTitle, isCancelled && styles.heroTitleCancelled]}>
                  #{invoice.invoiceNumber}
                </Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const { generateAndShareInvoicePdf } = await import('../utils/invoicePdf.ts');
                    await generateAndShareInvoicePdf(invoice, user);
                  } catch (e: any) {
                    Alert.alert('PDF Error', e.message || 'Failed to export invoice PDF');
                  }
                }}
                style={styles.pdfDownloadBtn}
                activeOpacity={0.8}
              >
                <Download size={14} color="#ffffff" />
                <Text style={styles.pdfDownloadText}>{t('pdf', 'PDF')}</Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.statusBadge,
                  isCancelled
                    ? styles.statusCancelled
                    : isPaid
                    ? styles.statusPaid
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isCancelled
                      ? styles.statusTextCancelled
                      : isPaid
                      ? styles.statusTextPaid
                      : styles.statusTextPending,
                  ]}
                >
                  {isCancelled ? 'CANCELLED' : isPaid ? t('paid', 'PAID') : t('pending', 'PENDING')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.heroAmountBox}>
            <View>
              <Text style={styles.heroAmountLabel}>{t('total_invoice_amount', 'Total Invoice Amount')}</Text>
              <Text style={[styles.heroAmountVal, isCancelled && styles.heroAmountValCancelled]}>
                ₹{parseFloat(invoice.totalAmount).toLocaleString('en-IN')}
              </Text>
            </View>
            {!isPaid && !isCancelled && (
              <View style={styles.heroDueBox}>
                <Text style={styles.heroDueLabel}>{t('balance_due', 'Balance Due')}</Text>
                <Text style={styles.heroDueVal}>₹{balance.toLocaleString('en-IN')}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Cancelled Notice Banner */}
        {isCancelled && (
          <View style={styles.cancelledNoticeCard}>
            <AlertCircle size={20} color="#dc2626" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cancelledNoticeTitle}>Invoice Voided (Rule 46)</Text>
              <Text style={styles.cancelledNoticeSub}>
                {invoice.cancelReason || 'This invoice has been cancelled for GST Table 13 compliance and cannot accept payments.'}
              </Text>
            </View>
          </View>
        )}

        {/* Client Details */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('billed_to', 'Billed To (Party Details)')}</Text>
          <Text style={styles.clientName}>{invoice.client?.name || 'Customer'}</Text>
          {invoice.client?.businessName ? (
            <Text style={styles.clientCompany}>{invoice.client.businessName}</Text>
          ) : null}
          <Text style={styles.clientPhone}>Phone: {invoice.client?.phone || 'N/A'}</Text>
          {invoice.client?.gstin ? (
            <Text style={styles.clientGstin}>GSTIN: {invoice.client.gstin}</Text>
          ) : (
            <Text style={[styles.clientGstin, { color: '#94a3b8', fontStyle: 'italic' }]}>GSTIN: Unregistered Person (URP)</Text>
          )}

          <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
            <Text style={{ fontSize: 11, color: '#64748b' }}>
              Place of Supply: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{getStateNameOrFormatted(invoice.placeOfSupply || invoice.client?.gstin?.substring(0, 2))}</Text>
            </Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              Tax Payable on Reverse Charge (RCM): <Text style={{ fontWeight: '700', color: invoice.isRcm ? '#d97706' : '#0f172a' }}>{invoice.isRcm ? 'YES' : 'NO'}</Text>
            </Text>
          </View>
        </View>

        {/* Dynamic UPI Payment QR Card */}
        {user?.upiId && (
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>{t('spot_upi_qr', 'Spot Counter UPI Payment QR')}</Text>
            <Text style={styles.qrSub}>{t('spot_upi_sub', 'Show this QR code to client for instant UPI settlement')}</Text>
            <UpiQrCode
              upiId={user.upiId}
              businessName={user.businessName}
              amount={balance > 0 ? balance : parseFloat(invoice.totalAmount)}
              invoiceNumber={invoice.invoiceNumber}
              size={180}
            />
          </View>
        )}

        {/* Industry Specific Metadata Parameters */}
        {(invoice.industryDetails || invoice.transportDetails || invoice.gymDetails || invoice.coachingDetails || invoice.retailDetails) && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>{t('industry_params', 'Industry Workflow Parameters')}</Text>
            {invoice.industryDetails?.vehicleNo || invoice.transportDetails?.vehicleNumber ? (
              <View style={styles.metaParamRow}>
                <Text style={styles.metaParamKey}>Vehicle No:</Text>
                <Text style={styles.metaParamVal}>
                  {invoice.industryDetails?.vehicleNo || invoice.transportDetails?.vehicleNumber}
                </Text>
              </View>
            ) : null}
            {invoice.industryDetails?.lrNumber || invoice.transportDetails?.lrNumber ? (
              <View style={styles.metaParamRow}>
                <Text style={styles.metaParamKey}>LR / Bilty No:</Text>
                <Text style={styles.metaParamVal}>
                  {invoice.industryDetails?.lrNumber || invoice.transportDetails?.lrNumber}
                </Text>
              </View>
            ) : null}
            {invoice.industryDetails?.routeFrom ? (
              <View style={styles.metaParamRow}>
                <Text style={styles.metaParamKey}>Route:</Text>
                <Text style={styles.metaParamVal}>
                  {invoice.industryDetails?.routeFrom} → {invoice.industryDetails?.routeTo}
                </Text>
              </View>
            ) : null}
            {invoice.industryDetails?.campaignName ? (
              <View style={styles.metaParamRow}>
                <Text style={styles.metaParamKey}>Campaign:</Text>
                <Text style={styles.metaParamVal}>{invoice.industryDetails.campaignName}</Text>
              </View>
            ) : null}
            {invoice.industryDetails?.memberId || invoice.gymDetails?.memberId ? (
              <View style={styles.metaParamRow}>
                <Text style={styles.metaParamKey}>Member ID:</Text>
                <Text style={styles.metaParamVal}>
                  {invoice.industryDetails?.memberId || invoice.gymDetails?.memberId}
                </Text>
              </View>
            ) : null}
            {invoice.industryDetails?.studentRollNo || invoice.coachingDetails?.studentRollNo ? (
              <View style={styles.metaParamRow}>
                <Text style={styles.metaParamKey}>Student Roll:</Text>
                <Text style={styles.metaParamVal}>
                  {invoice.industryDetails?.studentRollNo || invoice.coachingDetails?.studentRollNo}
                </Text>
              </View>
            ) : null}
            {invoice.industryDetails?.billCounter || invoice.retailDetails?.counterPosNumber ? (
              <View style={styles.metaParamRow}>
                <Text style={styles.metaParamKey}>POS Counter:</Text>
                <Text style={styles.metaParamVal}>
                  {invoice.industryDetails?.billCounter || invoice.retailDetails?.counterPosNumber}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Billing Items Table */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('items_deliverables', 'Invoice Items & Deliverables')}</Text>
          {invoice.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <Text style={styles.itemSub}>
                  {item.hsnCode ? `HSN ${item.hsnCode} • ` : ''}
                  {item.quantity} Qty × ₹{item.rate.toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={styles.itemAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>{t('subtotal', 'Taxable Subtotal')}</Text>
            <Text style={styles.calcVal}>₹{parseFloat(invoice.subtotal).toLocaleString('en-IN')}</Text>
          </View>
          
          {(() => {
            const taxRateNum = parseFloat(invoice.taxRate || '18') || 0;
            const subtotalNum = parseFloat(invoice.subtotal) || 0;
            const gstBreakdown = calculateGstBreakdown(
              taxRateNum,
              subtotalNum,
              user?.gstin,
              invoice.placeOfSupply || invoice.client?.gstin,
              invoice.taxType === 'inter_state'
            );

            if (gstBreakdown.isInterState) {
              return (
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>IGST ({gstBreakdown.igstRate}%)</Text>
                  <Text style={styles.calcVal}>+ ₹{gstBreakdown.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
              );
            } else {
              return (
                <>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>CGST ({gstBreakdown.cgstRate}%)</Text>
                    <Text style={styles.calcVal}>+ ₹{gstBreakdown.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>SGST ({gstBreakdown.sgstRate}%)</Text>
                    <Text style={styles.calcVal}>+ ₹{gstBreakdown.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </View>
                </>
              );
            }
          })()}

          {invoice.tdsAmount && parseFloat(invoice.tdsAmount) > 0 ? (
            <View style={styles.calcRow}>
              <Text style={[styles.calcLabel, { color: '#e11d48' }]}>{t('tds_withholding', 'TDS Withholding')} ({invoice.tdsRate}%)</Text>
              <Text style={[styles.calcVal, { color: '#e11d48' }]}>
                - ₹{parseFloat(invoice.tdsAmount).toLocaleString('en-IN')}
              </Text>
            </View>
          ) : null}
          {invoice.discountAmount && parseFloat(invoice.discountAmount) > 0 ? (
            <View style={styles.calcRow}>
              <Text style={[styles.calcLabel, { color: '#059669' }]}>{t('special_discount', 'Special Discount')}</Text>
              <Text style={[styles.calcVal, { color: '#059669' }]}>
                - ₹{parseFloat(invoice.discountAmount).toLocaleString('en-IN')}
              </Text>
            </View>
          ) : null}
          <View style={styles.calcRow}>
            <Text style={styles.grandLabel}>{t('grand_total', 'Grand Total')}</Text>
            <Text style={styles.grandVal}>₹{parseFloat(invoice.totalAmount).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Statutory Legal Disclaimer Card */}
        <View style={[styles.card, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
            Statutory Legal Compliance
          </Text>
          <Text style={{ fontSize: 10, color: '#64748b', lineHeight: 14 }}>
            {STATUTORY_INVOICE_DISCLAIMER}
          </Text>
        </View>

        {/* Cancel Invoice Action */}
        {!isCancelled ? (
          <TouchableOpacity style={styles.cancelInvoiceBtn} onPress={handleCancelInvoice} activeOpacity={0.8}>
            <XCircle size={16} color="#e11d48" />
            <Text style={styles.cancelInvoiceText}>Cancel Invoice (GST Void)</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.alreadyCancelledBox}>
            <Text style={styles.alreadyCancelledText}>Invoice status is permanently Void / Cancelled</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Bar */}
      {!isCancelled ? (
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.whatsAppBtn}
            onPress={() => setShowWhatsApp(true)}
          >
            <Send size={16} color="#ffffff" />
            <Text style={styles.whatsAppText}>{t('whatsapp_reminder', 'WhatsApp Reminder')}</Text>
          </TouchableOpacity>

          {!isPaid && (
            <TouchableOpacity
              style={styles.settleBtn}
              onPress={() => setShowPayment(true)}
            >
              <CheckCircle size={16} color="#ffffff" />
              <Text style={styles.settleText}>{t('record_settlement', 'Record Settlement')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.cancelledFooterBar}>
          <Text style={styles.cancelledFooterText}>VOIDED INVOICE • PRESERVED FOR GST AUDIT</Text>
        </View>
      )}


      {/* WhatsApp Modal */}
      <WhatsAppModal
        visible={showWhatsApp}
        onClose={() => setShowWhatsApp(false)}
        invoice={invoice}
        profile={user}
        onSentSuccess={loadInvoice}
      />

      {/* Payment Modal */}
      <PaymentModal
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        invoice={invoice}
        onSuccess={loadInvoice}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pdfDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(165, 180, 252, 0.4)',
  },
  pdfDownloadText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  heroSubText: {

    fontSize: 9.5,
    fontWeight: '800',
    color: '#818cf8',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  heroAmountBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroAmountLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#a5b4fc',
    letterSpacing: 0.5,
  },
  heroAmountVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  heroDueBox: {
    alignItems: 'flex-end',
  },
  heroDueLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  heroDueVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fef08a',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextPaid: {
    color: '#34d399',
  },
  statusTextPending: {
    color: '#fbbf24',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  clientCompany: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  clientPhone: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  clientGstin: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },

  qrSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemDesc: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  itemSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  metaParamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metaParamKey: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  metaParamVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },

  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  calcLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  grandLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  grandVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  heroTitleCancelled: {
    color: '#cbd5e1',
    textDecorationLine: 'line-through',
  },
  heroAmountValCancelled: {
    color: '#cbd5e1',
    textDecorationLine: 'line-through',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  statusTextCancelled: {
    color: '#f87171',
  },
  cancelledNoticeCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cancelledNoticeTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#dc2626',
  },
  cancelledNoticeSub: {
    fontSize: 11,
    color: '#991b1b',
    marginTop: 2,
    lineHeight: 15,
  },
  cancelInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  cancelInvoiceText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#e11d48',
  },
  alreadyCancelledBox: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  alreadyCancelledText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94a3b8',
  },
  cancelledFooterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fef2f2',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
    alignItems: 'center',
  },
  cancelledFooterText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#dc2626',
    letterSpacing: 0.8,
  },
  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    gap: 10,
  },
  whatsAppBtn: {
    flex: 1,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  whatsAppText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  settleBtn: {
    flex: 1,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  settleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
