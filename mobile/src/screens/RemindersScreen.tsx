import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Sparkles, MessageSquare, Search, ArrowLeft } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/endpoints.ts';
import { ReminderLog } from '../types/index.ts';


export const RemindersScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const data = await api.getReminderLogs();
      if (Array.isArray(data)) setLogs(data);
    } catch (e) {
      console.log('Error fetching reminder logs:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const getToneBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'friendly':
        return { bg: '#eff6ff', color: '#2563eb', label: 'Tier 1 • Gentle Due Notice' };
      case 'due_today':
        return { bg: '#fef3c7', color: '#b45309', label: 'Tier 2 • Due Today Urgent' };
      case 'urgent':
        return { bg: '#fff1f2', color: '#be123c', label: 'Tier 3 • Overdue Warning' };
      case 'final_legal':
        return { bg: '#fdf2f8', color: '#9d174d', label: 'Tier 4 • Final Formal Demand' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: 'Custom Reminder' };
    }
  };

  const filteredLogs = logs.filter((log) => {
    return (
      (log.recipientPhone || '').includes(searchTerm) ||
      (log.messageContent || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.templateType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {navigation?.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <ArrowLeft size={18} color="#ffffff" />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.heroSubText}>WHATSAPP AUTOMATION AUDIT</Text>
              <Text style={styles.heroTitle}>Delivery Logs</Text>
            </View>
          </View>
          <View style={styles.heroCounterBadge}>
            <Text style={styles.heroCounterText}>{logs.length} Sent</Text>
          </View>
        </View>


        {/* Translucent Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by phone, tone or message content..."
            placeholderTextColor="#64748b"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </LinearGradient>

      {/* Meta Audit Ribbon */}
      <View style={styles.metaRibbon}>
        <View style={styles.metaLeft}>
          <MessageSquare size={13} color="#059669" />
          <Text style={styles.metaRibbonText}>
            CLOUD & NATIVE DISPATCH • <Text style={styles.metaHighlight}>{filteredLogs.length} LOGS FOUND</Text>
          </Text>
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const toneStyle = getToneBadgeStyle(item.templateType);

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.channelBadge}>
                    <Send size={11} color="#059669" />
                    <Text style={styles.channelText}>WhatsApp Direct / Cloud</Text>
                  </View>
                  <Text style={styles.timeText}>
                    {new Date(item.sentAt).toLocaleDateString()} {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.recipientRow}>
                  <Text style={styles.phoneLabel}>Recipient Party:</Text>
                  <Text style={styles.phoneText}>{item.recipientPhone}</Text>
                </View>

                {/* Tone Pill */}
                <View style={[styles.toneBadge, { backgroundColor: toneStyle.bg }]}>
                  <Sparkles size={11} color={toneStyle.color} />
                  <Text style={[styles.toneText, { color: toneStyle.color }]}>
                    {toneStyle.label}
                  </Text>
                </View>

                {/* Chat Preview Bubble */}
                <View style={styles.chatBubble}>
                  <Text style={styles.chatText} numberOfLines={4}>
                    {item.messageContent}
                  </Text>
                  <View style={styles.bubbleFooter}>
                    <CheckCircle2 size={12} color="#059669" />
                    <Text style={styles.bubbleSentText}>Delivered via UPI Link</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Send size={24} color="#6366f1" />
              </View>
              <Text style={styles.emptyTitle}>No Reminders Found</Text>
              <Text style={styles.emptySub}>
                Navigate to 'Invoices' tab and tap 'WhatsApp' to send 1-click payment escalation alerts to your clients.
              </Text>
            </View>
          }
        />
      )}
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
  heroCounterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroCounterText: {
    fontSize: 11.5,
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
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaRibbonText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  metaHighlight: {
    color: '#059669',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },

  listContent: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  channelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  timeText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  phoneLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  phoneText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  toneBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    marginBottom: 10,
  },
  toneText: {
    fontSize: 10,
    fontWeight: '800',
  },
  chatBubble: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  chatText: {
    fontSize: 11.5,
    color: '#166534',
    lineHeight: 17,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  bubbleSentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});

