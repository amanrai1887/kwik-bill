import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Send, Zap, MessageSquare, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Invoice, UserProfile, ClientRiskInfo } from '../types/index.ts';
import { api } from '../api/endpoints.ts';

interface WhatsAppModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  profile: UserProfile | null;
  riskInfo?: ClientRiskInfo;
  onSentSuccess?: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  visible,
  onClose,
  invoice,
  profile,
  riskInfo,
  onSentSuccess,
}) => {
  const [templateType, setTemplateType] = useState<'friendly' | 'due_today' | 'urgent' | 'final_legal'>(
    riskInfo?.riskLevel === 'high' ? 'urgent' : 'friendly'
  );
  const [sendMode, setSendMode] = useState<'wa_me' | 'direct'>(
    profile?.whatsappPhoneNumberId && profile?.whatsappApiToken ? 'direct' : 'wa_me'
  );
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const clientName = invoice.client?.name || 'Valued Customer';
  const clientCompany = invoice.client?.businessName ? ` (${invoice.client.businessName})` : '';
  const businessName = profile?.businessName || 'Our Business';
  const totalAmount = `₹${parseFloat(invoice.balanceDue || invoice.totalAmount).toLocaleString('en-IN')}`;
  const dueDate = invoice.dueDate || 'Immediate';

  // Instant Deep-link UPI URI Protocol
  const upiDeepLink = profile?.upiId
    ? `upi://pay?pa=${profile.upiId}&pn=${encodeURIComponent(businessName)}&am=${invoice.balanceDue || invoice.totalAmount}&cu=INR&tn=Invoice%20${invoice.invoiceNumber}`
    : '';

  // Online Web Portal URL for public client view
  const webBaseUrl = process.env.EXPO_PUBLIC_WEB_URL || 'http://10.0.5.65:3000';
  const publicWebUrl = `${webBaseUrl.replace(/\/+$/, '')}/pay/${invoice.invoiceNumber}`;

  const generateMessage = () => {
    switch (templateType) {
      case 'friendly':
        return `Hello *${clientName}*${clientCompany},\n\nGreetings from *${businessName}*! ✨\n\nThis is a friendly courtesy note that Invoice *#${invoice.invoiceNumber}* for *${totalAmount}* is scheduled for settlement on *${dueDate}*.\n\n📲 *1-Tap Instant UPI Payment:*\n${upiDeepLink || 'UPI ID: ' + profile?.upiId}\n\n🌐 *View & Download PDF Invoice Online:*\n${publicWebUrl}\n\nThank you for your valued partnership!`;
      case 'due_today':
        return `Dear *${clientName}*,\n\nInvoice *#${invoice.invoiceNumber}* for *${totalAmount}* is due for settlement *TODAY* (${dueDate}).\n\n📲 *Instant UPI Link:*\n${upiDeepLink}\n\n🌐 *View Invoice Online:*\n${publicWebUrl}\n\nPlease share transaction UTR once completed. Thanks! - *${businessName}*`;
      case 'urgent':
        return `⚠️ *PAYMENT OVERDUE NOTICE*\n\nDear *${clientName}*,\nInvoice *#${invoice.invoiceNumber}* (${totalAmount}) is past due date (${dueDate}).\n\nKindly remit dues immediately via direct UPI:\n📲 ${upiDeepLink}\n\n🌐 *Online Invoice Portal:*\n${publicWebUrl}\n\nAccounts & Collections - *${businessName}*`;
      case 'final_legal':
        return `🚨 *FINAL RECOVERY NOTICE*\n\nAttention: *${clientName}*,\nInvoice *#${invoice.invoiceNumber}* balance of *${totalAmount}* is severely overdue.\n\nPlease remit immediately:\n📲 ${upiDeepLink}\n\n🌐 *View Bill:*\n${publicWebUrl}\n\nFailure to settle may impact GST credit and credit rating. - *${businessName}*`;
    }
  };

  const messageText = generateMessage();
  const rawPhone = invoice.client?.phone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!cleanPhone) {
      Alert.alert('Missing Phone', 'Client has no valid phone number.');
      return;
    }

    setIsSending(true);
    try {
      if (sendMode === 'direct') {
        const res: any = await api.sendWhatsAppReminder({
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          templateType,
          messageContent: messageText,
          recipientPhone: formattedPhone,
          sendMethod: 'direct',
        });
        if (res?.directApiSent) {
          Alert.alert('Success', 'Automated WhatsApp reminder sent via Meta Cloud Gateway!');
        } else {
          Alert.alert('API Notice', res?.error || res?.apiResponse?.error?.message || 'Meta API credentials check failed. Please check token permissions.');
        }
        if (onSentSuccess) onSentSuccess();
        onClose();
      } else {
        await api.sendWhatsAppReminder({
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          templateType,
          messageContent: messageText,
          recipientPhone: formattedPhone,
          sendMethod: 'wa_me',
        }).catch(() => {});

        const encodedMsg = encodeURIComponent(messageText);
        const waNativeUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMsg}`;
        const waWebUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

        const canOpen = await Linking.canOpenURL(waNativeUrl);
        if (canOpen) {
          await Linking.openURL(waNativeUrl);
        } else {
          await Linking.openURL(waWebUrl);
        }

        if (onSentSuccess) onSentSuccess();
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Send Failed', err.message || 'Could not send WhatsApp message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>1-Click WhatsApp Engine</Text>
              <Text style={styles.headerSub}>#{invoice.invoiceNumber} • {totalAmount}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* AI Risk Score Pill if available */}
            {riskInfo && (
              <View style={[
                styles.aiRiskBadge,
                riskInfo.riskLevel === 'high' ? styles.aiRiskHigh : riskInfo.riskLevel === 'medium' ? styles.aiRiskMed : styles.aiRiskLow
              ]}>
                <Sparkles size={12} color={riskInfo.riskLevel === 'high' ? '#ef4444' : riskInfo.riskLevel === 'medium' ? '#f59e0b' : '#10b981'} />
                <Text style={styles.aiRiskText}>
                  AI Risk Rating: {riskInfo.label} ({riskInfo.score}/100)
                </Text>
              </View>
            )}

            {/* Tone Selector */}
            <Text style={styles.label}>Select Escalation Tone</Text>
            <View style={styles.toneGrid}>
              {[
                { id: 'friendly', title: 'Gentle / Polite', desc: 'Courtesy pre-due note' },
                { id: 'due_today', title: 'Due Today', desc: 'Settlement today' },
                { id: 'urgent', title: 'Overdue (Urgent)', desc: 'Immediate reminder' },
                { id: 'final_legal', title: 'Final Notice', desc: 'Credit impact notice' },
              ].map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  onPress={() => setTemplateType(tone.id as any)}
                  style={[
                    styles.toneCard,
                    templateType === tone.id && styles.toneCardActive,
                  ]}
                >
                  <Text style={[styles.toneTitle, templateType === tone.id && styles.toneTextActive]}>
                    {tone.title}
                  </Text>
                  <Text style={styles.toneDesc}>{tone.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Delivery Gateway Toggle */}
            <Text style={styles.label}>Delivery Channel</Text>
            <View style={styles.channelRow}>
              <TouchableOpacity
                onPress={() => setSendMode('wa_me')}
                style={[styles.channelBtn, sendMode === 'wa_me' && styles.channelBtnActive]}
              >
                <MessageSquare size={16} color={sendMode === 'wa_me' ? '#ffffff' : '#475569'} />
                <Text style={[styles.channelText, sendMode === 'wa_me' && styles.channelTextActive]}>
                  Native WhatsApp App
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSendMode('direct')}
                style={[styles.channelBtn, sendMode === 'direct' && styles.channelBtnActive]}
              >
                <Zap size={16} color={sendMode === 'direct' ? '#ffffff' : '#475569'} />
                <Text style={[styles.channelText, sendMode === 'direct' && styles.channelTextActive]}>
                  1-Click Direct API
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preview Bubble */}
            <View style={styles.previewHeader}>
              <Text style={styles.label}>Live Message & Payment Link Preview</Text>
              <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
                {copied ? <Check size={14} color="#059669" /> : <Copy size={14} color="#4f46e5" />}
                <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy Text'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewText}>{messageText}</Text>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSend}
              disabled={isSending}
              style={styles.sendButton}
            >
              {isSending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Send size={18} color="#ffffff" />
                  <Text style={styles.sendButtonText}>
                    {sendMode === 'direct' ? '1-Click Send via Cloud Gateway' : 'Open in WhatsApp App'}
                  </Text>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 17,
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
    padding: 20,
  },
  aiRiskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  aiRiskLow: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  aiRiskMed: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  aiRiskHigh: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  aiRiskText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  toneCard: {
    width: '48%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  toneCardActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  toneTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  toneTextActive: {
    color: '#059669',
  },
  toneDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  channelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  channelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  channelBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  channelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  channelTextActive: {
    color: '#ffffff',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
  },
  previewCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  previewText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  footer: {
    paddingHorizontal: 20,
  },
  sendButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
