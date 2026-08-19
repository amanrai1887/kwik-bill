import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, Phone, MessageSquare, Building, Mail, X, Check, Users, ShieldCheck, ArrowUpRight } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/endpoints.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Client } from '../types/index.ts';

export const ClientsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [riskMap, setRiskMap] = useState<Record<number, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add/Edit Client Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const [clientsData, analyticsData] = await Promise.all([
        api.getClients(),
        api.getAnalytics().catch(() => null),
      ]);
      if (Array.isArray(clientsData)) setClients(clientsData);
      if (analyticsData?.clientRiskMap) setRiskMap(analyticsData.clientRiskMap);
    } catch (e) {
      console.log('Error fetching clients:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [loadClients])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadClients();
  };

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setBusinessName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditId(c.id);
    setName(c.name);
    setBusinessName(c.businessName || '');
    setPhone(c.phone);
    setEmail(c.email || '');
    setGstin(c.gstin || '');
    setIsModalOpen(true);
  };

  const handleSaveClient = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required', 'Please enter Client Name and Phone number.');
      return;
    }

    setIsSaving(true);
    try {
      if (editId) {
        await api.updateClient(editId, { name, businessName, phone, email, gstin });
      } else {
        await api.createClient({ name, businessName, phone, email, gstin });
      }
      setIsModalOpen(false);
      loadClients();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save client');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCall = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum.replace(/[^0-9+]/g, '')}`);
  };

  const handleWhatsApp = (phoneNum: string, clientName: string) => {
    const clean = phoneNum.replace(/[^0-9]/g, '');
    const formatted = clean.length === 10 ? `91${clean}` : clean;
    const msg = encodeURIComponent(`Hello ${clientName}, greetings from our billing department!`);
    Linking.openURL(`whatsapp://send?phone=${formatted}&text=${msg}`).catch(() => {
      Linking.openURL(`https://wa.me/${formatted}?text=${msg}`);
    });
  };

  const filteredClients = clients.filter((c) => {
    return (
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm)
    );
  });

  return (
    <View style={styles.container}>
      {/* Dark Indigo Hero Header Matching Workplace */}
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroSubText}>{t('client_ledger_crm', 'CLIENT LEDGER & CRM')}</Text>
            <Text style={styles.heroTitle}>{t('party_directory', 'Party Directory')}</Text>
          </View>
          <TouchableOpacity
            style={styles.heroAddBtn}
            onPress={openAddModal}
            activeOpacity={0.85}
          >
            <Plus size={16} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.heroAddText}>{t('add_party', 'Add Party')}</Text>
          </TouchableOpacity>
        </View>

        {/* Translucent Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_party_placeholder', 'Search party by name, trade or phone...')}
            placeholderTextColor="#64748b"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </LinearGradient>

      {/* Directory Meta Ribbon */}
      <View style={styles.metaRibbon}>
        <Text style={styles.metaRibbonText}>
          {t('client_ledger_crm', 'CLIENT LEDGER DIRECTORY')} • <Text style={styles.metaHighlight}>{filteredClients.length} {t('parties_onboarded', 'PARTIES ONBOARDED')}</Text>
        </Text>
      </View>



      {/* Clients FlatList */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.clientCard} onPress={() => openEditModal(item)} activeOpacity={0.8}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>
                    {(item.name || 'C').charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.clientName}>{item.name}</Text>
                  {item.businessName ? (
                    <Text style={styles.bizName}>{item.businessName}</Text>
                  ) : null}
                  <Text style={styles.phoneText}>+91 {item.phone}</Text>

                  {/* AI Risk Score Badge */}
                  {riskMap[item.id] && (
                    <View style={[
                      styles.riskBadge,
                      riskMap[item.id].riskLevel === 'high' ? styles.riskHigh : riskMap[item.id].riskLevel === 'medium' ? styles.riskMed : styles.riskLow
                    ]}>
                      <Text style={[
                        styles.riskBadgeText,
                        riskMap[item.id].riskLevel === 'high' ? styles.riskHighText : riskMap[item.id].riskLevel === 'medium' ? styles.riskMedText : styles.riskLowText
                      ]}>
                        {riskMap[item.id].label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Direct Action Dial / Chat Buttons */}
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(item.phone)}
                    activeOpacity={0.7}
                  >
                    <Phone size={15} color="#4f46e5" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.waBtn}
                    onPress={() => handleWhatsApp(item.phone, item.name)}
                    activeOpacity={0.7}
                  >
                    <MessageSquare size={15} color="#059669" />
                  </TouchableOpacity>
                </View>
              </View>

              {item.gstin ? (
                <View style={styles.gstinBox}>
                  <Text style={styles.gstinLabel}>GSTIN</Text>
                  <Text style={styles.gstinText}>{item.gstin}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          )}

          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{t('no_clients_found', 'No clients found')}</Text>
              <Text style={styles.emptySub}>{t('tap_add_client', "Tap '+' to add your first business customer to the ledger.")}</Text>
            </View>
          }
        />
      )}

      {/* Add / Edit Client Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? t('edit_party_profile', 'Edit Party Profile') : t('add_party_directory', 'Add Party to Directory')}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>{t('contact_person_name', 'Contact Person Name *')}</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rajesh Sharma"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.label}>{t('business_trade_name', 'Business / Trade Name')}</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Apex Roadlines or Gold Gym"
                value={businessName}
                onChangeText={setBusinessName}
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.label}>{t('whatsapp_phone_number', 'WhatsApp Phone Number *')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="9820012345"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.label}>{t('gstin_optional', 'GSTIN (Optional)')}</Text>
              <TextInput
                style={styles.input}
                placeholder="27AAAAA0000A1Z5"
                value={gstin}
                onChangeText={setGstin}
                autoCapitalize="characters"
                placeholderTextColor="#94a3b8"
              />

              <TouchableOpacity
                onPress={handleSaveClient}
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
                      <Text style={styles.saveBtnText}>{t('save_party_ledger', 'Save Party to Ledger')}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
  heroAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroAddText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  metaRibbon: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 4,
  },
  metaRibbonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  metaHighlight: {
    color: '#4f46e5',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },

  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  clientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4f46e5',
  },
  clientName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  bizName: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  phoneText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskLow: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  riskMed: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  riskHigh: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  riskBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  riskLowText: {
    color: '#059669',
  },
  riskMedText: {
    color: '#d97706',
  },
  riskHighText: {
    color: '#dc2626',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },

  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gstinBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gstinLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gstinText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  emptyBox: {
    padding: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  emptySub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  modalBody: {
    padding: 18,
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
  saveBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
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
});

