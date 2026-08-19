import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  IndianRupee,
  Clock,
  AlertTriangle,
  FilePlus,
  Send,
  Users,
  ChevronRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Building,
  ArrowUpRight,
  Repeat,
  Zap,
} from 'lucide-react-native';

import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useMobileAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../api/endpoints.ts';
import { AnalyticsSummary, Invoice } from '../types/index.ts';
import { WhatsAppModal } from '../components/WhatsAppModal.tsx';
import { PaymentModal } from '../components/PaymentModal.tsx';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useMobileAuth();
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recurringProfiles, setRecurringProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [selectedForWhatsApp, setSelectedForWhatsApp] = useState<Invoice | null>(null);
  const [selectedForPayment, setSelectedForPayment] = useState<Invoice | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [analyticsData, invoicesData, recurringData] = await Promise.all([
        api.getAnalytics().catch((err) => {
          console.log('Error fetching analytics:', err);
          return null;
        }),
        api.getInvoices().catch((err) => {
          console.log('Error fetching invoices:', err);
          return [];
        }),
        api.getRecurringProfiles().catch((err) => {
          console.log('Error fetching recurring profiles:', err);
          return [];
        }),
      ]);

      if (analyticsData) setAnalytics(analyticsData);
      if (Array.isArray(invoicesData)) setRecentInvoices(invoicesData.slice(0, 5));
      if (Array.isArray(recurringData)) setRecurringProfiles(recurringData);
    } catch (e) {
      console.log('Error loading mobile dashboard:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 1. Fetch immediately on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 2. Fetch on tab navigation focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const onRefresh = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics fallback
    }
    setRefreshing(true);
    await loadDashboardData();
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics fallback
    }
  }, [loadDashboardData]);

  const collectionRate = analytics?.totalRevenue
    ? Math.round(((analytics?.totalPaid || 0) / analytics.totalRevenue) * 100)
    : 0;

  // Time of day dynamic greeting for mobile
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const personName = user?.ownerName || user?.businessName || 'Partner';



  return (
    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Dark Gradient Header */}
        <LinearGradient
          colors={['#0f172a', '#1e1b4b', '#312e81']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.bizInfoCol}>
              <View style={styles.liveBadgeRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>{t('live_workspace', 'LIVE WORKSPACE')}</Text>
              </View>
              <Text style={styles.bizNameText} numberOfLines={1}>
                {timeGreeting}, {personName}
              </Text>
              <Text style={styles.bizSubText}>
                {user?.businessName ? `${user.businessName} • WhatsApp Billing Engine` : 'GST Billing & WhatsApp Engine'}
              </Text>
            </View>

            <View style={styles.planPill}>
              <Sparkles size={11} color="#c7d2fe" />
              <Text style={styles.planText}>
                {user?.subscriptionPlan === 'pro_499' ? 'PRO' : 'STARTER'}
              </Text>
            </View>
          </View>


          {/* Hero Revenue Card inside Header */}
          <View style={styles.heroMetricBox}>
            <View>
              <Text style={styles.heroMetricLabel}>{t('total_realized_revenue', 'TOTAL REALIZED REVENUE')}</Text>
              <Text style={styles.heroMetricVal}>
                ₹{(analytics?.totalPaid || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.efficiencyBox}>
              <View style={styles.efficiencyBadge}>
                <TrendingUp size={13} color="#10b981" />
                <Text style={styles.efficiencyText}>{collectionRate}% {t('collection_rate', 'Rate')}</Text>
              </View>
              <Text style={styles.efficiencySub}>
                ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')} {t('total_billed', 'Billed')}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Primary 2-Column KPI Cards */}
        <View style={styles.statsRow}>
          {/* Pending Collections */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#fef3c7' }]}>
              <Clock size={18} color="#d97706" />
            </View>
            <Text style={styles.kpiLabel}>{t('pending_receivables', 'Pending Receivables')}</Text>
            <Text style={[styles.kpiVal, { color: '#b45309' }]}>
              ₹{(analytics?.totalPending || 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.kpiSub}>{t('awaiting_client_payments', 'Awaiting client payments')}</Text>
          </View>

          {/* Overdue Exposure */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#ffe4e6' }]}>
              <AlertTriangle size={18} color="#e11d48" />
            </View>
            <Text style={styles.kpiLabel}>{t('overdue_exposure', 'Overdue Exposure')}</Text>
            <Text style={[styles.kpiVal, { color: '#be123c' }]}>
              ₹{(analytics?.overdueAmount || 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.kpiSub}>{t('action_required_whatsapp', 'Action required on WhatsApp')}</Text>
          </View>
        </View>

        {/* 🌟 AI Cash Flow Forecast & Horizon Card */}
        <View style={styles.cashFlowCard}>
          <View style={styles.cashFlowHeader}>
            <View style={styles.cashFlowTitleRow}>
              <Sparkles size={14} color="#6366f1" />
              <Text style={styles.cashFlowTitle}>{t('cash_flow_horizon', 'CASH FLOW INFLOW HORIZON')}</Text>
            </View>
            <Text style={styles.aiTag}>{t('ai_projected', 'AI PROJECTED')}</Text>
          </View>

          <View style={styles.forecastGrid}>
            <View style={styles.forecastCol}>
              <Text style={styles.forecastLabel}>{t('next_7_days', 'Next 7 Days')}</Text>
              <Text style={styles.forecastVal}>
                ₹{(analytics?.expectedNext7Days || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.forecastSub}>{t('scheduled_due_dates', 'Scheduled due dates')}</Text>
            </View>
            <View style={styles.forecastDivider} />
            <View style={styles.forecastCol}>
              <Text style={styles.forecastLabel}>{t('next_30_days', 'Next 30 Days')}</Text>
              <Text style={[styles.forecastVal, { color: '#4338ca' }]}>
                ₹{(analytics?.expectedNext30Days || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.forecastSub}>{t('expected_inflow', 'Expected inflow')}</Text>
            </View>
          </View>

          {/* Ageing Horizon Mini Bar */}
          {analytics?.ageingBuckets && (
            <View style={styles.ageingWrap}>
              <Text style={styles.ageingTitle}>{t('overdue_ageing_breakdown', 'Overdue Ageing Breakdown')}</Text>
              <View style={styles.ageingPillRow}>
                <View style={[styles.ageingPill, { backgroundColor: '#fef3c7' }]}>
                  <Text style={styles.ageingPillLabel}>0-15d</Text>
                  <Text style={[styles.ageingPillVal, { color: '#b45309' }]}>
                    ₹{(analytics.ageingBuckets.days0to15 || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.ageingPill, { backgroundColor: '#ffedd5' }]}>
                  <Text style={styles.ageingPillLabel}>16-30d</Text>
                  <Text style={[styles.ageingPillVal, { color: '#c2410c' }]}>
                    ₹{(analytics.ageingBuckets.days16to30 || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.ageingPill, { backgroundColor: '#ffe4e6' }]}>
                  <Text style={styles.ageingPillLabel}>31-60d</Text>
                  <Text style={[styles.ageingPillVal, { color: '#be123c' }]}>
                    ₹{(analytics.ageingBuckets.days31to60 || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.ageingPill, { backgroundColor: '#fee2e2' }]}>
                  <Text style={styles.ageingPillLabel}>60d+</Text>
                  <Text style={[styles.ageingPillVal, { color: '#991b1b' }]}>
                    ₹{(analytics.ageingBuckets.days60plus || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 🔁 Auto-Billing & Recurring Retainers Hub */}
        <TouchableOpacity
          style={styles.recurringHubCard}
          onPress={() => navigation.navigate('Recurring')}
          activeOpacity={0.85}
        >
          <View style={styles.recurringHeader}>
            <View style={styles.recurringTitleRow}>
              <Repeat size={15} color="#4f46e5" />
              <Text style={styles.recurringHubTitle}>{t('autobill_hub', 'AUTO-BILLING & RECURRING HUB')}</Text>
            </View>
            <View style={styles.recurringCountBadge}>
              <Text style={styles.recurringCountText}>
                {recurringProfiles.filter((p) => p.isActive).length} {t('active_contracts', 'Active Contracts')}
              </Text>
            </View>
          </View>

          <View style={styles.recurringContentRow}>
            <View style={styles.recurringStatBox}>
              <Text style={styles.recurringStatLabel}>{t('schedules', 'SCHEDULES')}</Text>
              <Text style={styles.recurringStatVal}>{recurringProfiles.length}</Text>
            </View>
            <View style={styles.recurringDivider} />
            <View style={styles.recurringStatBox}>
              <Text style={styles.recurringStatLabel}>{t('autoinvoiced', 'AUTO-INVOICED')}</Text>
              <Text style={[styles.recurringStatVal, { color: '#059669' }]}>
                {recurringProfiles.reduce((sum, p) => sum + (p.generatedCount || 0), 0)} {t('bills', 'Bills')}
              </Text>
            </View>
            <View style={styles.recurringDivider} />
            <TouchableOpacity
              style={styles.recurringActionBtn}
              onPress={async () => {
                try {
                  const res = await api.triggerManualRecurringRun();
                  alert(`Auto-Billing scan completed! Generated ${res?.result?.count || 0} due invoices.`);
                  loadDashboardData();
                } catch (e: any) {
                  alert(e.message || 'Auto-billing scan completed');
                }
              }}
            >
              <Zap size={13} color="#ffffff" />
              <Text style={styles.recurringActionText}>{t('run_scan', 'Run Scan')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Quick Action Shortcuts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('fast_actions', 'Fast Actions')}</Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('InvoiceCreate')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4f46e5', '#6366f1']}
              style={styles.actionIconGrad}
            >
              <FilePlus size={20} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.actionTitle}>{t('create_invoice', 'Create Invoice')}</Text>
            <Text style={styles.actionDesc}>{t('gst_instant_billing', 'GST Instant Billing')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Clients')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#ecfdf5' }]}>
              <Users size={20} color="#059669" />
            </View>
            <Text style={styles.actionTitle}>{t('client_ledger', 'Client Ledger')}</Text>
            <Text style={styles.actionDesc}>{t('directory_balances', 'Directory & Balances')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reminders')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#fff7ed' }]}>
              <Send size={20} color="#ea580c" />
            </View>
            <Text style={styles.actionTitle}>{t('escalations', 'Escalations')}</Text>
            <Text style={styles.actionDesc}>{t('tier_reminders', '4-Tier Reminders')}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Invoices Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recent_invoices', 'Recent Invoices')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Invoices')} style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>{t('view_all', 'View All')}</Text>
            <ChevronRight size={14} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        {recentInvoices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('no_invoices_issued', 'No Invoices Issued Yet')}</Text>
            <Text style={styles.emptySub}>{t('tap_create_invoice', "Tap 'Create Invoice' to generate your first GST bill with UPI QR.")}</Text>
          </View>
        ) : (
          recentInvoices.map((inv) => {
            const isPaid = inv.status === 'paid';
            return (
              <TouchableOpacity
                key={inv.id}
                style={styles.invoiceItem}
                onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                activeOpacity={0.7}
              >
                <View style={styles.invoiceLeft}>
                  <View style={styles.invTitleRow}>
                    <Text style={styles.invNumber}>#{inv.invoiceNumber}</Text>
                    <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusPending]}>
                      <Text style={[styles.statusBadgeText, isPaid ? styles.statusTextPaid : styles.statusTextPending]}>
                        {isPaid ? t('paid', 'PAID') : t('pending', 'PENDING')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.invClient} numberOfLines={1}>
                    {inv.client?.name || 'Customer'}
                  </Text>
                  <Text style={styles.invDue}>{t('due', 'Due')}: {inv.dueDate || t('immediate', 'Immediate')}</Text>
                </View>

                <View style={styles.invoiceRight}>
                  <Text style={styles.invAmount}>
                    ₹{parseFloat(inv.totalAmount).toLocaleString('en-IN')}
                  </Text>

                  {!isPaid && (
                    <View style={styles.btnRow}>
                      <TouchableOpacity
                        style={styles.miniWhatsAppBtn}
                        onPress={() => setSelectedForWhatsApp(inv)}
                      >
                        <Send size={11} color="#ffffff" />
                        <Text style={styles.miniWhatsAppText}>{t('remind', 'Remind')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.miniPayBtn}
                        onPress={() => setSelectedForPayment(inv)}
                      >
                        <Text style={styles.miniPayText}>{t('settle', 'Settle')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>


      {/* WhatsApp Modal */}
      <WhatsAppModal
        visible={!!selectedForWhatsApp}
        onClose={() => setSelectedForWhatsApp(null)}
        invoice={selectedForWhatsApp}
        profile={user}
        onSentSuccess={loadDashboardData}
      />

      {/* Payment Settlement Modal */}
      <PaymentModal
        visible={!!selectedForPayment}
        onClose={() => setSelectedForPayment(null)}
        invoice={selectedForPayment}
        onSuccess={loadDashboardData}
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
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  bizInfoCol: {
    flex: 1,
    marginRight: 12,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 1,
  },
  bizNameText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  bizSubText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 2,
  },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(165, 180, 252, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  planText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#e0e7ff',
    letterSpacing: 0.5,
  },
  heroMetricBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroMetricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a5b4fc',
    letterSpacing: 0.8,
  },
  heroMetricVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  efficiencyBox: {
    alignItems: 'flex-end',
  },
  efficiencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  efficiencyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34d399',
  },
  efficiencySub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  kpiVal: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 3,
  },
  kpiSub: {
    fontSize: 9.5,
    color: '#94a3b8',
    marginTop: 3,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4f46e5',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconGrad: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 9.5,
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  invoiceItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  invoiceLeft: {
    flex: 1,
    marginRight: 10,
  },
  invTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  invClient: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
    fontWeight: '600',
  },
  invDue: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 3,
    fontWeight: '500',
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusPaid: {
    backgroundColor: '#ecfdf5',
  },
  statusPending: {
    backgroundColor: '#fffbeb',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  statusTextPaid: {
    color: '#059669',
  },
  statusTextPending: {
    color: '#d97706',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniWhatsAppBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  miniWhatsAppText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  miniPayBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  miniPayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#64748b',
  },
  emptySub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  cashFlowCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cashFlowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cashFlowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cashFlowTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4f46e5',
    letterSpacing: 0.6,
  },
  aiTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  forecastGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  forecastCol: {
    flex: 1,
  },
  forecastLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
  },
  forecastVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  forecastSub: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  forecastDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  ageingWrap: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ageingTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
  },
  ageingPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ageingPill: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  ageingPillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  ageingPillVal: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
  },
  recurringHubCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recurringTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recurringHubTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338ca',
    letterSpacing: 0.5,
  },
  recurringCountBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  recurringCountText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  recurringContentRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recurringStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  recurringStatLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  recurringStatVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  recurringDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  recurringActionBtn: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  recurringActionText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#ffffff',
  },
});



