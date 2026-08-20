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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, Filter, Send, CheckCircle, IndianRupee } from 'lucide-react-native';
import { api } from '../api/endpoints.ts';
import { useFocusEffect } from '@react-navigation/native';
import { useMobileAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Invoice } from '../types/index.ts';
import { WhatsAppModal } from '../components/WhatsAppModal.tsx';
import { PaymentModal } from '../components/PaymentModal.tsx';

export const InvoicesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useMobileAuth();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedForWhatsApp, setSelectedForWhatsApp] = useState<Invoice | null>(null);
  const [selectedForPayment, setSelectedForPayment] = useState<Invoice | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      const data = await api.getInvoices();
      if (Array.isArray(data)) setInvoices(data);
    } catch (e) {
      console.log('Error fetching invoices:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [loadInvoices])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.client?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const isCancelled = inv.status === 'cancelled' || inv.isCancelled;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && inv.status === 'paid' && !isCancelled) ||
      (statusFilter === 'pending' && inv.status !== 'paid' && !isCancelled) ||
      (statusFilter === 'cancelled' && isCancelled);

    return matchesSearch && matchesStatus;
  });

  const pendingCount = invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled' && !i.isCancelled).length;
  const paidCount = invoices.filter((i) => i.status === 'paid' && !i.isCancelled).length;
  const cancelledCount = invoices.filter((i) => i.status === 'cancelled' || i.isCancelled).length;

  return (
    <View style={styles.container}>
      {/* Dark Hero Header Matching Workplace */}
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroSubText}>{t('tax_invoices_ledger', 'TAX INVOICES & LEDGER')}</Text>
            <Text style={styles.heroTitle}>{t('invoice_management', 'Invoice Management')}</Text>
          </View>
          <TouchableOpacity
            style={styles.heroCreateBtn}
            onPress={() => navigation.navigate('InvoiceCreate')}
            activeOpacity={0.85}
          >
            <Plus size={16} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.heroCreateText}>{t('new_invoice', 'New Invoice')}</Text>
          </TouchableOpacity>
        </View>

        {/* Translucent Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_invoice_placeholder', 'Search invoice number or client name...')}
            placeholderTextColor="#64748b"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { id: 'all', label: `${t('all', 'All')} (${invoices.length})` },
          { id: 'pending', label: `${t('pending', 'Pending')} (${pendingCount})` },
          { id: 'paid', label: `${t('paid', 'Paid')} (${paidCount})` },
          { id: 'cancelled', label: `Cancelled (${cancelledCount})` },
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setStatusFilter(f.id)}
            style={[styles.filterChip, statusFilter === f.id && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, statusFilter === f.id && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Invoices List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={filteredInvoices}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCancelled = item.status === 'cancelled' || item.isCancelled;
            const isPaid = item.status === 'paid' && !isCancelled;
            const total = parseFloat(item.totalAmount);
            const paid = parseFloat(item.paidAmount || '0');
            const balance = Math.max(0, total - paid);

            return (
              <TouchableOpacity
                style={[styles.invoiceCard, isCancelled && styles.invoiceCardCancelled]}
                onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
                activeOpacity={0.75}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Text style={[styles.invoiceNum, isCancelled && styles.invoiceNumCancelled]}>
                      #{item.invoiceNumber}
                    </Text>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {item.client?.name || 'Customer'}
                    </Text>
                  </View>
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

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.dateText}>{t('due', 'Due')}: {item.dueDate || t('immediate', 'Immediate')}</Text>
                    <Text style={[styles.amountText, isCancelled && styles.amountTextCancelled]}>
                      ₹{total.toLocaleString('en-IN')}
                    </Text>
                    {isCancelled ? (
                      <Text style={styles.cancelledSubText}>Voided for GST Audit</Text>
                    ) : isPaid ? (
                      <Text style={styles.paidSubText}>{t('settled_100', 'Settled 100%')}</Text>
                    ) : balance < total && balance > 0 ? (
                      <Text style={styles.balanceSubText}>{t('bal', 'Bal')}: ₹{balance.toLocaleString('en-IN')}</Text>
                    ) : null}
                  </View>

                  {!isPaid && !isCancelled && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.whatsAppActionBtn}
                        onPress={() => setSelectedForWhatsApp(item)}
                      >
                        <Send size={13} color="#ffffff" />
                        <Text style={styles.actionBtnText}>WhatsApp</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.payActionBtn}
                        onPress={() => setSelectedForPayment(item)}
                      >
                        <CheckCircle size={13} color="#0f172a" />
                        <Text style={styles.payActionText}>{t('settle', 'Settle')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isCancelled && (
                    <View style={styles.cancelledBadgeBox}>
                      <Text style={styles.cancelledBadgeText}>VOID</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('no_matching_invoices', 'No invoices matching your filter')}</Text>
              <Text style={styles.emptySubText}>{t('tap_plus_create', 'Tap the + button to create a new GST invoice')}</Text>
            </View>
          }
        />

      )}

      {/* WhatsApp Reminder Modal */}
      <WhatsAppModal
        visible={!!selectedForWhatsApp}
        onClose={() => setSelectedForWhatsApp(null)}
        invoice={selectedForWhatsApp}
        profile={user}
        onSentSuccess={loadInvoices}
      />

      {/* Payment Settlement Modal */}
      <PaymentModal
        visible={!!selectedForPayment}
        onClose={() => setSelectedForPayment(null)}
        invoice={selectedForPayment}
        onSuccess={loadInvoices}
      />
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
  heroCreateBtn: {
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
  heroCreateText: {
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
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },

  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  clientName: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  invoiceCardCancelled: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    opacity: 0.85,
  },
  invoiceNumCancelled: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  amountTextCancelled: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPaid: {
    backgroundColor: '#ecfdf5',
  },
  statusPending: {
    backgroundColor: '#fffbeb',
  },
  statusCancelled: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextPaid: {
    color: '#059669',
  },
  statusTextPending: {
    color: '#d97706',
  },
  statusTextCancelled: {
    color: '#dc2626',
  },
  cancelledSubText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '700',
    marginTop: 2,
  },
  cancelledBadgeBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelledBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#dc2626',
    letterSpacing: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  whatsAppActionBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  payActionBtn: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  payActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  paidSubText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  balanceSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '800',
  },
  emptySubText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});

