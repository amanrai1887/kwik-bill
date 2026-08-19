import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Sparkles,
  Check,
  Zap,
  Building,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  User,
} from 'lucide-react-native';
import { api } from '../api/endpoints.ts';
import { useMobileAuth } from '../context/AuthContext.tsx';

interface PlanSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanUpdated?: () => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  visible,
  onClose,
  onPlanUpdated,
}) => {
  const { user, refreshProfile } = useMobileAuth();
  const [selectedPlan, setSelectedPlan] = useState<'trial_15_days' | 'starter_299' | 'pro_499'>(
    (user?.subscriptionPlan as any) || 'trial_15_days'
  );
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [contactName, setContactName] = useState(user?.ownerName || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [industry, setIndustry] = useState('transport');
  const [businessNeeds, setBusinessNeeds] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (selectedPlan === 'trial_15_days') {
      setIsSubmitting(true);
      try {
        await api.updateProfile({ subscriptionPlan: 'trial_15_days' });
        await refreshProfile();
        Alert.alert('Activated', '15-Day Free Trial activated successfully!');
        if (onPlanUpdated) onPlanUpdated();
        onClose();
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to activate trial');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!showBusinessForm) {
      setShowBusinessForm(true);
      return;
    }

    if (!businessName.trim() || !contactName.trim() || !contactPhone.trim()) {
      Alert.alert('Required Fields', 'Please fill Company Name, Contact Name, and WhatsApp Phone.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit plan request to Admin
      await api.updateProfile({
        businessName,
        ownerName: contactName,
        phone: contactPhone,
        subscriptionPlan: selectedPlan,
      });
      await refreshProfile();
      Alert.alert(
        '🚀 Plan Activated',
        `Your ${selectedPlan === 'pro_499' ? 'Pro Growth (₹499/mo)' : 'Starter (₹299/mo)'} workspace is now configured!`
      );
      if (onPlanUpdated) onPlanUpdated();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.headerPill}>
                <Sparkles size={11} color="#6366f1" />
                <Text style={styles.headerPillText}>
                  {showBusinessForm ? 'COMPANY SETUP' : 'SUBSCRIPTION & TIERS'}
                </Text>
              </View>
              <Text style={styles.title}>
                {showBusinessForm ? 'Setup Your Workspace' : 'Choose Subscription Plan'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {!showBusinessForm ? (
              <>
                {/* 15 Days Free Trial */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'trial_15_days' && styles.planCardActiveEmerald,
                  ]}
                  onPress={() => setSelectedPlan('trial_15_days')}
                  activeOpacity={0.85}
                >
                  <View style={styles.planTopRow}>
                    <View style={styles.planBadgeEmerald}>
                      <Clock size={11} color="#059669" />
                      <Text style={styles.planBadgeTextEmerald}>15-Day Free Trial</Text>
                    </View>
                    <Text style={styles.planPrice}>₹0</Text>
                  </View>
                  <Text style={styles.planDesc}>
                    Full exploratory access to test GST invoicing, client directory & WhatsApp reminders.
                  </Text>
                  <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#059669" />
                      <Text style={styles.featureText}>15 Days Full Access</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#059669" />
                      <Text style={styles.featureText}>Instant ₹0 Activation</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#059669" />
                      <Text style={styles.featureText}>Direct UPI QR + Invoicing</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Starter Plan (₹299/mo) */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'starter_299' && styles.planCardActiveIndigo,
                  ]}
                  onPress={() => setSelectedPlan('starter_299')}
                  activeOpacity={0.85}
                >
                  <View style={styles.planTopRow}>
                    <View style={styles.planBadgeIndigo}>
                      <Building size={11} color="#4f46e5" />
                      <Text style={styles.planBadgeTextIndigo}>Starter Plan</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.planPrice}>₹299</Text>
                      <Text style={styles.planPeriod}>/ month</Text>
                    </View>
                  </View>
                  <Text style={styles.planDesc}>
                    Ideal for small transport fleets, tuition centers, gyms, and retail traders.
                  </Text>
                  <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#4f46e5" />
                      <Text style={styles.featureText}>Unlimited Invoices & Client Ledger</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#4f46e5" />
                      <Text style={styles.featureText}>WhatsApp Payment Reminders</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#4f46e5" />
                      <Text style={styles.featureText}>Spot UPI QR Code Generation</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Pro Growth Plan (₹499/mo) */}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === 'pro_499' && styles.planCardActiveIndigo,
                  ]}
                  onPress={() => setSelectedPlan('pro_499')}
                  activeOpacity={0.85}
                >
                  <View style={styles.recommendedPill}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                  <View style={styles.planTopRow}>
                    <View style={styles.planBadgePro}>
                      <Zap size={11} color="#ffffff" />
                      <Text style={styles.planBadgeTextPro}>Pro Growth Plan</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.planPrice}>₹499</Text>
                      <Text style={styles.planPeriod}>/ month</Text>
                    </View>
                  </View>
                  <Text style={styles.planDesc}>
                    Full automation suite with 1-Click Meta Cloud API gateway & priority CA support.
                  </Text>
                  <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#4f46e5" />
                      <Text style={styles.featureText}>Everything in Starter Plan</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#4f46e5" />
                      <Text style={styles.featureText}>1-Click Direct WhatsApp API</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={12} color="#4f46e5" />
                      <Text style={styles.featureText}>Multi-Segment Industry Presets</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <Text style={styles.formSelectedPlan}>
                    Plan Selected:{' '}
                    {selectedPlan === 'pro_499' ? 'Pro Growth (₹499/mo)' : 'Starter (₹299/mo)'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowBusinessForm(false)}>
                    <Text style={styles.changePlanLink}>Change</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Company / Trade Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mahavir Freight or FitZone Gym"
                  value={businessName}
                  onChangeText={setBusinessName}
                />

                <Text style={styles.inputLabel}>Contact Person Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rajesh Sharma"
                  value={contactName}
                  onChangeText={setContactName}
                />

                <Text style={styles.inputLabel}>WhatsApp Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="+91 98200 12345"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                />

                <Text style={styles.inputLabel}>Specific Needs / Daily Volume (Optional)</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="e.g. 50 truck clients daily, automatic TDS computation..."
                  value={businessNeeds}
                  onChangeText={setBusinessNeeds}
                />
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4f46e5', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {showBusinessForm
                        ? 'Confirm & Launch Workspace'
                        : selectedPlan === 'trial_15_days'
                        ? 'Start 15-Day Free Trial'
                        : 'Continue to Setup'}
                    </Text>
                    <ArrowRight size={16} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  headerPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4338ca',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  scrollBody: {
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  planCardActiveEmerald: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  planCardActiveIndigo: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
  },
  recommendedPill: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planBadgeEmerald: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeTextEmerald: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065f46',
  },
  planBadgeIndigo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeTextIndigo: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#3730a3',
  },
  planBadgePro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeTextPro: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  planPeriod: {
    fontSize: 10,
    color: '#64748b',
  },
  planDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginBottom: 10,
    lineHeight: 16,
  },
  featureList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
    paddingTop: 8,
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  formContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  formSelectedPlan: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#4f46e5',
  },
  changePlanLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textDecorationLine: 'underline',
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 9,
    fontSize: 12.5,
    color: '#0f172a',
  },
  footer: {
    paddingTop: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
