import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Building, QrCode, Key, LogOut, Check, Shield, Sparkles, User, CreditCard, Send, ArrowRight, Languages, Globe, Lock } from 'lucide-react-native';
import { useMobileAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../api/endpoints.ts';
import { getPlanLimits } from '../utils/planConfig.ts';
import { PlanSelectionModal } from '../components/PlanSelectionModal.tsx';
import { LegalComplianceModal } from '../components/LegalComplianceModal.tsx';

export const SettingsScreen: React.FC = () => {
  const { user, logout, refreshProfile } = useMobileAuth();
  const { language, setLanguage, t } = useLanguage();
  const planLimits = getPlanLimits(user);
  const isPro = planLimits.canUseAllTemplates;

  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [ownerName, setOwnerName] = useState(user?.ownerName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gstin, setGstin] = useState(user?.gstin || '');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [bankName, setBankName] = useState(user?.bankName || '');
  const [bankAccountNo, setBankAccountNo] = useState(user?.bankAccountNo || '');
  const [bankIfsc, setBankIfsc] = useState(user?.bankIfsc || '');

  // Custom Invoice Templates & Branding
  const [invoiceTemplate, setInvoiceTemplate] = useState<'modern' | 'corporate' | 'logistics' | 'creative' | 'classic' | 'dark_neon'>(user?.invoiceTemplate || 'modern');
  const [brandColor, setBrandColor] = useState(user?.brandColor || '#4f46e5');
  const [customFooter, setCustomFooter] = useState(user?.customFooter || '');

  // Meta Cloud API Gateway credentials
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState(user?.whatsappPhoneNumberId || '');
  const [whatsappApiToken, setWhatsappApiToken] = useState(user?.whatsappApiToken || '');

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalTab, setLegalTab] = useState<'gst' | 'payments' | 'terms' | 'privacy'>('gst');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setBusinessName(user.businessName || '');
      setOwnerName(user.ownerName || '');
      setPhone(user.phone || '');
      setGstin(user.gstin || '');
      setUpiId(user.upiId || '');
      setBankName(user.bankName || '');
      setBankAccountNo(user.bankAccountNo || '');
      setBankIfsc(user.bankIfsc || '');
      setInvoiceTemplate(user.invoiceTemplate || 'modern');
      setBrandColor(user.brandColor || '#4f46e5');
      setCustomFooter(user.customFooter || '');
      setWhatsappPhoneNumberId(user.whatsappPhoneNumberId || '');
      setWhatsappApiToken(user.whatsappApiToken || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({
        businessName,
        ownerName,
        phone,
        gstin,
        upiId,
        bankName,
        bankAccountNo,
        bankIfsc,
        invoiceTemplate,
        brandColor,
        customFooter,
        whatsappPhoneNumberId,
        whatsappApiToken,
      });
      await refreshProfile();
      Alert.alert('Saved', t('settings_saved_alert', 'Business settings & branding updated successfully!'));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const templatesList: Array<{ id: 'modern' | 'corporate' | 'logistics' | 'creative' | 'classic' | 'dark_neon'; label: string }> = [
    { id: 'modern', label: '✨ Modern' },
    { id: 'corporate', label: '🏛️ Corporate' },
    { id: 'logistics', label: '🚚 Logistics' },
    { id: 'creative', label: '🎨 Creative' },
    { id: 'classic', label: '📋 Classic CA' },
    { id: 'dark_neon', label: '⚡ Dark Neon' },
  ];

  const presetColors = ['#4f46e5', '#059669', '#0284c7', '#7c3aed', '#e11d48', '#0f172a', '#d97706'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Full Bleed Dark Indigo Hero Header */}
        <LinearGradient
          colors={['#0f172a', '#1e1b4b', '#312e81']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{(businessName || 'B').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.heroSubText}>{t('merchant_profile', 'MERCHANT WORKSPACE PROFILE')}</Text>
              <Text style={styles.heroTitle} numberOfLines={1}>{businessName || 'My Business'}</Text>
              <Text style={styles.heroEmail}>{user?.email || 'owner@domain.com'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.planPill}
            onPress={() => setShowPlanModal(true)}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Sparkles size={13} color="#34d399" />
              <Text style={styles.planBadgeText}>
                {user?.subscriptionPlan === 'pro_499'
                  ? 'PRO PLAN (₹499/MO)'
                  : user?.subscriptionPlan === 'trial_15_days'
                    ? '15-DAY TRIAL (₹0)'
                    : 'STARTER (₹299/MO)'}{' '}
                • ACTIVE
              </Text>
            </View>
            <Text style={styles.upgradePlanText}>{t('upgrade_change', 'Upgrade / Change >')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* 🌐 Multi-Language Selector Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#e0f2fe' }]}>
              <Languages size={16} color="#0284c7" />
            </View>
            <Text style={styles.cardTitle}>{t('app_language', 'App Language / भाषा')}</Text>
          </View>
          <Text style={styles.cardSub}>{t('select_language_sub', 'Select your preferred interface language')}</Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* English */}
            <TouchableOpacity
              onPress={() => setLanguage('en')}
              style={[
                styles.langChip,
                language === 'en' && styles.langChipActive
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
                🇬🇧 English
              </Text>
              {language === 'en' && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </TouchableOpacity>

            {/* Hindi */}
            <TouchableOpacity
              onPress={() => setLanguage('hi')}
              style={[
                styles.langChip,
                language === 'hi' && styles.langChipActive
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.langText, language === 'hi' && styles.langTextActive]}>
                🇮🇳 हिन्दी (Hindi)
              </Text>
              {language === 'hi' && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Invoice Branding & Templates */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#fdf4ff' }]}>
              <Sparkles size={16} color="#c026d3" />
            </View>
            <Text style={styles.cardTitle}>{t('templates_branding', 'Invoice Templates & Branding')}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={styles.label}>{t('active_invoice_template', 'Active Invoice Template')}</Text>
            {!isPro && (
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#c026d3' }}>
                2 of 6 Unlocked
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {templatesList.map((tpl) => {
              const isSelected = invoiceTemplate === tpl.id;
              const isUnlocked = isPro || tpl.id === 'modern' || tpl.id === 'classic';

              return (
                <TouchableOpacity
                  key={tpl.id}
                  onPress={() => {
                    if (!isUnlocked) {
                      Alert.alert(
                        'Pro Plan Template',
                        `The "${tpl.label}" template is exclusively available on the Pro Growth Plan (₹499/mo). Upgrade to Pro to unlock all 6 designer templates.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Upgrade to Pro', onPress: () => setShowPlanModal(true) },
                        ]
                      );
                      return;
                    }
                    setInvoiceTemplate(tpl.id);
                  }}
                  style={[
                    styles.templateChip,
                    isSelected && { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
                    !isUnlocked && { opacity: 0.7, backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {!isUnlocked && <Lock size={10} color="#a855f7" />}
                    <Text
                      style={[
                        styles.templateChipText,
                        isSelected && { color: '#ffffff', fontWeight: '900' },
                        !isUnlocked && { color: '#64748b' },
                      ]}
                    >
                      {tpl.label} {!isUnlocked ? '(PRO)' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t('brand_accent_color', 'Brand Accent Color')}</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            {presetColors.map((hex) => {
              const isSelected = brandColor.toLowerCase() === hex.toLowerCase();
              return (
                <TouchableOpacity
                  key={hex}
                  onPress={() => setBrandColor(hex)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: hex },
                    isSelected && { borderWidth: 3, borderColor: '#ffffff', shadowOpacity: 0.4 }
                  ]}
                  activeOpacity={0.8}
                >
                  {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t('custom_invoice_footer', 'Custom Invoice Disclaimer / Footer')}</Text>
          <TextInput
            style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
            multiline
            value={customFooter}
            onChangeText={setCustomFooter}
            placeholder="e.g. 2% late payment fee applicable after 7 days."
          />
        </View>

        {/* Business Profile */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#e0e7ff' }]}>
              <Building size={16} color="#4f46e5" />
            </View>
            <Text style={styles.cardTitle}>{t('company_identity', 'Company Identity')}</Text>
          </View>

          <Text style={styles.label}>{t('company_name', 'Company / Trade Name')}</Text>
          <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="Business Name" />

          <Text style={styles.label}>{t('owner_name', 'Owner / Proprietor Name')}</Text>
          <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} placeholder="Full Name" />

          <Text style={styles.label}>{t('business_phone', 'Business Contact Phone')}</Text>
          <TextInput style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholder="Phone" />

          <Text style={styles.label}>{t('gstin', 'GSTIN')}</Text>
          <TextInput style={styles.input} autoCapitalize="characters" value={gstin} onChangeText={setGstin} placeholder="GST Number" />
        </View>

        {/* UPI & Banking */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#ecfdf5' }]}>
              <CreditCard size={16} color="#059669" />
            </View>
            <Text style={styles.cardTitle}>{t('upi_settlement', 'UPI & Settlement Account')}</Text>
          </View>

          <Text style={styles.label}>{t('default_upi_id', 'Default Business UPI ID (for QR codes)')}</Text>
          <TextInput
            style={[styles.input, { color: '#059669', fontWeight: '800' }]}
            placeholder="e.g. business@okhdfcbank"
            value={upiId}
            onChangeText={setUpiId}
          />

          <Text style={styles.label}>{t('bank_name', 'Bank Name')}</Text>
          <TextInput style={styles.input} placeholder="e.g. HDFC Bank" value={bankName} onChangeText={setBankName} />

          <Text style={styles.label}>{t('account_number', 'Account Number')}</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={bankAccountNo} onChangeText={setBankAccountNo} placeholder="A/C Number" />

          <Text style={styles.label}>{t('ifsc_code', 'IFSC Code')}</Text>
          <TextInput style={styles.input} autoCapitalize="characters" value={bankIfsc} onChangeText={setBankIfsc} placeholder="IFSC Code" />
        </View>

        {/* Direct WhatsApp API Gateway */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#fff7ed' }]}>
              <Send size={16} color="#ea580c" />
            </View>
            <Text style={styles.cardTitle}>{t('meta_cloud_gateway', 'Meta WhatsApp Cloud Gateway')}</Text>
          </View>
          <Text style={styles.cardSub}>{t('meta_gateway_sub', 'Configure for automated background WhatsApp message delivery')}</Text>

          <Text style={styles.label}>{t('whatsapp_phone_id', 'WhatsApp Phone Number ID')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 104829104829104"
            value={whatsappPhoneNumberId}
            onChangeText={setWhatsappPhoneNumberId}
          />

          <Text style={styles.label}>{t('meta_access_token', 'Meta Access Token')}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="EAA..."
            value={whatsappApiToken}
            onChangeText={setWhatsappApiToken}
          />
        </View>

        {/* Government & Legal Compliance Center Card */}
        <View style={[styles.card, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#4f46e5' }]}>
              <Shield size={16} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Legal & Statutory Compliance</Text>
              <Text style={styles.cardSub}>CGST Rule 46 • IT Act 2000 • DPDP 2023</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <TouchableOpacity
              onPress={() => {
                setLegalTab('gst');
                setShowLegalModal(true);
              }}
              style={{ flex: 1, minWidth: '45%', backgroundColor: '#ffffff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}
            >
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' }}>Tax Mandate</Text>
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0f172a', marginTop: 2 }}>GST Rule 46</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setLegalTab('payments');
                setShowLegalModal(true);
              }}
              style={{ flex: 1, minWidth: '45%', backgroundColor: '#ffffff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}
            >
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' }}>Payments</Text>
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0f172a', marginTop: 2 }}>NPCI Direct UPI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setLegalTab('privacy');
                setShowLegalModal(true);
              }}
              style={{ flex: 1, minWidth: '45%', backgroundColor: '#ffffff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}
            >
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' }}>Data Privacy</Text>
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0f172a', marginTop: 2 }}>DPDP Act 2023</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setLegalTab('terms');
                setShowLegalModal(true);
              }}
              style={{ flex: 1, minWidth: '45%', backgroundColor: '#ffffff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}
            >
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' }}>SaaS Terms</Text>
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#0f172a', marginTop: 2 }}>Service Terms</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button with Gradient */}
        <TouchableOpacity
          onPress={handleSaveProfile}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#4f46e5', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGrad}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Check size={18} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.saveBtnText}>{t('save_profile_settings', 'Save Profile Settings')}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Logout Action */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={16} color="#e11d48" />
          <Text style={styles.logoutText}>{t('disconnect_session', 'Disconnect Mobile Session')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Legal & Compliance Modal */}
      <LegalComplianceModal
        visible={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalTab}
      />

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onPlanUpdated={refreshProfile}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
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
    alignItems: 'center',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroSubText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#818cf8',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  heroEmail: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  planBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#e0e7ff',
    letterSpacing: 0.5,
  },
  upgradePlanText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#818cf8',
    textDecorationLine: 'underline',
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

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 12,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 12,
  },
  langChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  langChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  langText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  langTextActive: {
    color: '#ffffff',
  },
  templateChip: {

    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  templateChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  saveBtnGrad: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e11d48',
  },
});

