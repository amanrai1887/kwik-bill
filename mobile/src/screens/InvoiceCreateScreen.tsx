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
import {
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  Building,
  Calendar,
  IndianRupee,
  Truck,
  Sparkles,
  Layers,
  Dumbbell,
  GraduationCap,
  Store,
  FileText,
  Percent,
  Lock,
} from 'lucide-react-native';
import { api } from '../api/endpoints.ts';
import { useMobileAuth } from '../context/AuthContext.tsx';
import { getPlanLimits } from '../utils/planConfig.ts';
import { Client, InvoiceItem } from '../types/index.ts';
import { 
  INDIAN_STATES, 
  calculateGstBreakdown, 
  getStateCodeFromGstin 
} from '../utils/gstCompliance.ts';

type IndustryType = 'transport' | 'agency' | 'gym' | 'coaching' | 'retail' | 'freelancer' | 'consultant';

export const InvoiceCreateScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useMobileAuth();
  const planLimits = getPlanLimits(user);
  const isPro = planLimits.canUseRecurringBilling;
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [dueDate, setDueDate] = useState(nextWeek);

  // GST Compliance States
  const [placeOfSupply, setPlaceOfSupply] = useState<string>('27');
  const [isRcm, setIsRcm] = useState<boolean>(false);
  const [taxType, setTaxType] = useState<'intra_state' | 'inter_state'>('intra_state');

  // Industry Workflow Selector
  const [industryType, setIndustryType] = useState<IndustryType>('transport');

  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: 'Transport Freight: Mumbai JNPT to Ahmedabad (18T)',
      hsnCode: '9965',
      quantity: 1,
      rate: 42000,
      gstRate: 12,
      amount: 42000,
    },
  ]);

  // Tax, TDS & Discounts
  const [taxRate, setTaxRate] = useState<number>(12);
  const [tdsRate, setTdsRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Industry Specific Parameters
  // 1. Transport
  const [vehicleNo, setVehicleNo] = useState('MH-04-GP-8842');
  const [lrNumber, setLrNumber] = useState('LR-994201');
  const [routeFrom, setRouteFrom] = useState('JNPT Port, Navi Mumbai');
  const [routeTo, setRouteTo] = useState('Sanand GIDC, Ahmedabad');
  const [driverName, setDriverName] = useState('Suresh Yadav');

  // 2. Digital Agency
  const [campaignName, setCampaignName] = useState('Q3 Performance Marketing');
  const [milestone, setMilestone] = useState('Phase 1 Deliverables & Creatives');

  // 3. Gym & Fitness
  const [memberId, setMemberId] = useState('GYM-MB-104');
  const [planDuration, setPlanDuration] = useState('Quarterly (3 Months)');
  const [trainerName, setTrainerName] = useState('Rahul Coach');

  // 4. Coaching & Tuition
  const [studentRollNo, setStudentRollNo] = useState('STU-2026-89');
  const [batchName, setBatchName] = useState('Class 12th JEE Batch A');
  const [installmentNo, setInstallmentNo] = useState('Term 2 Fee (Installment 2/3)');

  // 5. Retail / Kirana
  const [billCounter, setBillCounter] = useState('Counter POS-01');
  const [warrantyPeriod, setWarrantyPeriod] = useState('1 Year Manufacturer Warranty');

  // Notes & Terms
  const [notes, setNotes] = useState('Thank you for your business. Please pay via UPI QR code or Bank Transfer.');
  const [terms, setTerms] = useState('Payment due within agreed terms. 2% monthly interest applicable on delay.');

  // Recurring Billing State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api
      .getClients()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setClients(res);
          setSelectedClientId(res[0].id);
          const stateCode = getStateCodeFromGstin(res[0].gstin);
          if (stateCode) setPlaceOfSupply(stateCode);
        }
      })
      .catch(() => {});
  }, []);

  // When selected client changes, update state and tax type
  useEffect(() => {
    if (selectedClientId) {
      const cl = clients.find(c => c.id === selectedClientId);
      if (cl?.gstin) {
        const sc = getStateCodeFromGstin(cl.gstin);
        if (sc) setPlaceOfSupply(sc);
      }
    }
  }, [selectedClientId, clients]);

  // Auto detect intra vs inter state
  useEffect(() => {
    const suppCode = getStateCodeFromGstin(user?.gstin) || '27';
    if (suppCode && placeOfSupply) {
      setTaxType(suppCode === placeOfSupply ? 'intra_state' : 'inter_state');
    }
  }, [placeOfSupply, user?.gstin]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: 'Additional Service / Item',
        hsnCode: '9983',
        quantity: 1,
        rate: 2000,
        gstRate: taxRate,
        amount: 2000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : updated[index].quantity;
      const r = field === 'rate' ? parseFloat(value) || 0 : updated[index].rate;
      updated[index].amount = q * r;
    }
    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const tdsAmount = (subtotal * tdsRate) / 100;
  const totalAmount = Math.max(0, subtotal + taxAmount - tdsAmount - discountAmount);

  // GST Breakdown
  const gstBreakdown = calculateGstBreakdown(
    taxRate,
    subtotal,
    user?.gstin || '27',
    placeOfSupply,
    taxType === 'inter_state'
  );

  const handleCreate = async () => {
    if (!selectedClientId) {
      Alert.alert('Required', 'Please select or add a client.');
      return;
    }

    if (invoiceNumber.trim().length > 16) {
      Alert.alert('GST Rule 46', 'Invoice number must be 16 characters or less.');
      return;
    }

    setIsSubmitting(true);
    try {
      const industryDetails: any = {};
      if (industryType === 'transport') {
        industryDetails.vehicleNo = vehicleNo;
        industryDetails.lrNumber = lrNumber;
        industryDetails.routeFrom = routeFrom;
        industryDetails.routeTo = routeTo;
        industryDetails.driverName = driverName;
      } else if (industryType === 'agency') {
        industryDetails.campaignName = campaignName;
        industryDetails.milestone = milestone;
      } else if (industryType === 'gym') {
        industryDetails.memberId = memberId;
        industryDetails.planDuration = planDuration;
        industryDetails.trainerName = trainerName;
      } else if (industryType === 'coaching') {
        industryDetails.studentRollNo = studentRollNo;
        industryDetails.batchName = batchName;
        industryDetails.installmentNo = installmentNo;
      } else if (industryType === 'retail') {
        industryDetails.billCounter = billCounter;
        industryDetails.warrantyPeriod = warrantyPeriod;
      }

      await api.createInvoice({
        clientId: selectedClientId,
        invoiceNumber,
        issueDate,
        dueDate,
        placeOfSupply,
        isRcm,
        taxType,
        status: 'sent',
        items,
        subtotal: subtotal.toFixed(2),
        taxRate: taxRate.toString(),
        taxAmount: taxAmount.toFixed(2),
        tdsRate: tdsRate.toString(),
        tdsAmount: tdsAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        balanceDue: totalAmount.toFixed(2),
        paidAmount: '0',
        industryDetails,
        notes,
        terms,
      });

      if (isRecurring) {
        try {
          await api.createRecurringProfile({
            clientId: selectedClientId,
            title: `Recurring: ${items[0]?.description || 'Retainer Billing'}`,
            frequency: recurringFrequency,
            startDate: issueDate,
            nextRunDate: issueDate,
            autoSendWhatsApp,
            currency: 'INR',
            subtotal: subtotal.toFixed(2),
            taxRate: taxRate.toString(),
            taxAmount: taxAmount.toFixed(2),
            tdsRate: tdsRate.toString(),
            tdsAmount: tdsAmount.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            items,
            industryDetails,
            notes,
            terms,
          });
        } catch (err: any) {
          console.error('Failed to create recurring profile on mobile:', err);
        }
      }

      Alert.alert(
        'Success',
        isRecurring
          ? `GST Invoice #${invoiceNumber} & Auto-Billing Schedule created!`
          : `GST Invoice #${invoiceNumber} created!`
      );
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Full Bleed Dark Hero Header */}
        <LinearGradient
          colors={['#0f172a', '#1e1b4b', '#312e81']}
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
                <Text style={styles.heroSubText}>TAX COMPLIANT BILLING</Text>
                <Text style={styles.heroTitle}>Create GST Invoice</Text>
              </View>
            </View>
            <View style={styles.heroGstPill}>
              <Sparkles size={11} color="#34d399" />
              <Text style={styles.heroGstText}>GST READY</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Invoice Header Details */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconWrapIndigo}>
              <FileText size={16} color="#4f46e5" />
            </View>
            <Text style={styles.sectionTitle}>Invoice & Party Selection</Text>
          </View>


          <Text style={styles.label}>Select Client / Party *</Text>
          {clients.length === 0 ? (
            <TouchableOpacity
              style={styles.noClientBtn}
              onPress={() => navigation.navigate('Directory')}
            >
              <Text style={styles.noClientText}>+ Add your first client in Directory</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
              {clients.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedClientId(c.id)}
                  style={[styles.clientChip, selectedClientId === c.id && styles.clientChipActive]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.clientChipText,
                      selectedClientId === c.id && styles.clientChipTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                  {c.businessName ? (
                    <Text
                      style={[
                        styles.clientSubText,
                        selectedClientId === c.id && styles.clientSubTextActive,
                      ]}
                    >
                      {c.businessName}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Invoice Number *</Text>
              <TextInput
                style={[styles.input, { fontFamily: 'monospace', fontWeight: '800' }]}
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Issue Date</Text>
              <TextInput style={styles.input} value={issueDate} onChangeText={setIssueDate} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Due Date</Text>
              <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} />
            </View>
          </View>
        </View>

        {/* GST Statutory Compliance Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconWrapEmerald}>
              <Sparkles size={16} color="#059669" />
            </View>
            <Text style={styles.sectionTitle}>GST Statutory Compliance (Rule 46)</Text>
          </View>

          <Text style={styles.label}>Place of Supply (State / UT) *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
            {INDIAN_STATES.slice(0, 15).map((s) => (
              <TouchableOpacity
                key={s.code}
                onPress={() => setPlaceOfSupply(s.code)}
                style={[styles.clientChip, placeOfSupply === s.code && styles.clientChipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.clientChipText,
                    placeOfSupply === s.code && styles.clientChipTextActive,
                  ]}
                >
                  {s.code} - {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>Supply Type</Text>
              <Text style={{ fontSize: 11, color: '#64748b' }}>
                {taxType === 'inter_state' ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setTaxType(taxType === 'intra_state' ? 'inter_state' : 'intra_state')}
              style={[styles.gstChip, { backgroundColor: '#f1f5f9' }]}
            >
              <Text style={[styles.gstChipText, { color: '#4f46e5' }]}>
                Switch to {taxType === 'intra_state' ? 'IGST' : 'CGST+SGST'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}
            onPress={() => setIsRcm(!isRcm)}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                backgroundColor: isRcm ? '#d97706' : '#ffffff',
                borderWidth: 1.5,
                borderColor: isRcm ? '#d97706' : '#94a3b8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isRcm && <Check size={12} color="#ffffff" strokeWidth={3} />}
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>
              Tax Payable on Reverse Charge (RCM): {isRcm ? 'YES' : 'NO'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Industry Workflow Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconWrapEmerald}>
              <Sparkles size={16} color="#059669" />
            </View>
            <Text style={styles.sectionTitle}>Select Industry Workflow</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.industryScroll}>
            {[
              { id: 'transport', label: 'Transport & Logistics' },
              { id: 'agency', label: 'Digital Agency' },
              { id: 'gym', label: 'Gym & Fitness' },
              { id: 'coaching', label: 'Coaching Institute' },
              { id: 'retail', label: 'Retail & POS' },
              { id: 'freelancer', label: 'Freelancer' },
              { id: 'consultant', label: 'Consultant' },
            ].map((ind) => (
              <TouchableOpacity
                key={ind.id}
                onPress={() => setIndustryType(ind.id as IndustryType)}
                style={[styles.indChip, industryType === ind.id && styles.indChipActive]}
              >
                <Text style={[styles.indChipText, industryType === ind.id && styles.indChipTextActive]}>
                  {ind.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dynamic Industry Fields */}
          {industryType === 'transport' && (
            <View style={styles.indFieldsWrap}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Vehicle Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MH-04-GP-8842"
                    value={vehicleNo}
                    onChangeText={setVehicleNo}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>LR / Bilty Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="LR-994201"
                    value={lrNumber}
                    onChangeText={setLrNumber}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Origin Route</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="JNPT Port"
                    value={routeFrom}
                    onChangeText={setRouteFrom}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Destination Route</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Sanand GIDC"
                    value={routeTo}
                    onChangeText={setRouteTo}
                  />
                </View>
              </View>
            </View>
          )}

          {industryType === 'agency' && (
            <View style={styles.indFieldsWrap}>
              <Text style={styles.label}>Campaign Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Q3 Performance Marketing"
                value={campaignName}
                onChangeText={setCampaignName}
              />
              <Text style={styles.label}>Milestone Deliverable</Text>
              <TextInput
                style={styles.input}
                placeholder="Phase 1 Deliverables Completed"
                value={milestone}
                onChangeText={setMilestone}
              />
            </View>
          )}

          {industryType === 'gym' && (
            <View style={styles.indFieldsWrap}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Member ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="GYM-MB-104"
                    value={memberId}
                    onChangeText={setMemberId}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Plan Duration</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Quarterly (3 Months)"
                    value={planDuration}
                    onChangeText={setPlanDuration}
                  />
                </View>
              </View>
              <Text style={styles.label}>Assigned Personal Trainer</Text>
              <TextInput
                style={styles.input}
                placeholder="Rahul Coach"
                value={trainerName}
                onChangeText={setTrainerName}
              />
            </View>
          )}

          {industryType === 'coaching' && (
            <View style={styles.indFieldsWrap}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Student Roll No.</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="STU-2026-89"
                    value={studentRollNo}
                    onChangeText={setStudentRollNo}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Batch Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Class 12th JEE"
                    value={batchName}
                    onChangeText={setBatchName}
                  />
                </View>
              </View>
              <Text style={styles.label}>Installment Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Term 2 Fee (Installment 2/3)"
                value={installmentNo}
                onChangeText={setInstallmentNo}
              />
            </View>
          )}

          {industryType === 'retail' && (
            <View style={styles.indFieldsWrap}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>POS Billing Counter</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Counter POS-01"
                    value={billCounter}
                    onChangeText={setBillCounter}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Warranty Terms</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1 Year Manufacturer"
                    value={warrantyPeriod}
                    onChangeText={setWarrantyPeriod}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Line Items Table */}
        <View style={styles.card}>
          <View style={styles.itemsHeader}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconWrapAmber}>
                <Layers size={16} color="#d97706" />
              </View>
              <Text style={styles.sectionTitle}>Line Items & HSN</Text>
            </View>
            <TouchableOpacity style={styles.addItemBtn} onPress={handleAddItem}>
              <Plus size={13} color="#4f46e5" strokeWidth={2.5} />
              <Text style={styles.addItemText}>Add Row</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.itemBox}>
              <View style={styles.itemRowTop}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Service or freight description"
                  value={item.description}
                  onChangeText={(val) => handleUpdateItem(index, 'description', val)}
                />
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.trashBtn}>
                    <Trash2 size={16} color="#e11d48" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.col, { flex: 1.1 }]}>
                  <Text style={styles.label}>HSN/SAC</Text>
                  <TextInput
                    style={[styles.input, { fontFamily: 'monospace' }]}
                    placeholder="9965"
                    value={item.hsnCode || ''}
                    onChangeText={(val) => handleUpdateItem(index, 'hsnCode', val)}
                  />
                </View>

                <View style={[styles.col, { flex: 0.9 }]}>
                  <Text style={styles.label}>Qty</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={item.quantity.toString()}
                    onChangeText={(val) => handleUpdateItem(index, 'quantity', val)}
                  />
                </View>

                <View style={[styles.col, { flex: 1 }]}>
                  <Text style={styles.label}>Unit (UQC)</Text>
                  <TextInput
                    style={[styles.input, { textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '700' }]}
                    placeholder="NOS"
                    value={item.uqc || 'NOS'}
                    onChangeText={(val) => handleUpdateItem(index, 'uqc', val.toUpperCase())}
                  />
                </View>

                <View style={[styles.col, { flex: 1.4 }]}>
                  <Text style={styles.label}>Rate (₹)</Text>
                  <TextInput
                    style={[styles.input, { fontFamily: 'monospace', fontWeight: '800' }]}
                    keyboardType="numeric"
                    value={item.rate.toString()}
                    onChangeText={(val) => handleUpdateItem(index, 'rate', val)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* GST Slab & TDS Deductions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>GST Slab & Tax Deductions</Text>

          <Text style={styles.label}>Select GST Tax Rate</Text>
          <View style={styles.gstSlabRow}>
            {[0, 5, 12, 18, 28].map((rate) => (
              <TouchableOpacity
                key={rate}
                onPress={() => setTaxRate(rate)}
                style={[styles.gstChip, taxRate === rate && styles.gstChipActive]}
              >
                <Text style={[styles.gstChipText, taxRate === rate && styles.gstChipTextActive]}>
                  {rate}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>TDS Rate (Sec 194)</Text>
              <View style={styles.tdsPillRow}>
                {[
                  { r: 0, l: 'None (0%)' },
                  { r: 2, l: '2% 194C' },
                  { r: 10, l: '10% 194J' },
                ].map((tds) => (
                  <TouchableOpacity
                    key={tds.r}
                    onPress={() => setTdsRate(tds.r)}
                    style={[styles.tdsChip, tdsRate === tds.r && styles.tdsChipActive]}
                  >
                    <Text style={[styles.tdsChipText, tdsRate === tds.r && styles.tdsChipTextActive]}>
                      {tds.l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Special Discount (₹)</Text>
              <TextInput
                style={[styles.input, { fontFamily: 'monospace' }]}
                keyboardType="numeric"
                placeholder="0"
                value={discountAmount.toString()}
                onChangeText={(val) => setDiscountAmount(parseFloat(val) || 0)}
              />
            </View>
          </View>
        </View>

        {/* Recurring Auto-Billing Opt-in */}
        <View style={[styles.card, { backgroundColor: isPro ? '#eef2ff' : '#f8fafc', borderColor: isPro ? '#c7d2fe' : '#e2e8f0' }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            onPress={() => {
              if (!isPro) {
                Alert.alert(
                  'Pro Plan Feature',
                  'Automated recurring billing schedules are exclusively available on the Pro Growth Plan (₹499/mo). Upgrade to Pro in Settings to unlock recurring billing.'
                );
                setIsRecurring(false);
                return;
              }
              setIsRecurring(!isRecurring);
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  backgroundColor: isRecurring ? '#4f46e5' : '#ffffff',
                  borderWidth: 1.5,
                  borderColor: isRecurring ? '#4f46e5' : '#94a3b8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isRecurring && <Check size={13} color="#ffffff" strokeWidth={3} />}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {!isPro && <Lock size={12} color="#f59e0b" />}
                <Text style={{ fontSize: 13, fontWeight: '900', color: isPro ? '#1e1b4b' : '#64748b' }}>
                  🔁 Save as Automated Recurring Schedule
                </Text>
              </View>
            </View>

            {!isPro && (
              <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: '900', color: '#7e22ce' }}>PRO ONLY</Text>
              </View>
            )}
          </TouchableOpacity>

          {isRecurring && isPro && (
            <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#c7d2fe' }}>
              <Text style={styles.label}>Billing Frequency</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                {[
                  { id: 'weekly', l: 'Weekly' },
                  { id: 'monthly', l: 'Monthly' },
                  { id: 'quarterly', l: 'Quarterly' },
                  { id: 'yearly', l: 'Yearly' },
                ].map((freq) => (
                  <TouchableOpacity
                    key={freq.id}
                    onPress={() => setRecurringFrequency(freq.id as any)}
                    style={[
                      styles.gstChip,
                      { backgroundColor: recurringFrequency === freq.id ? '#4f46e5' : '#ffffff' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gstChipText,
                        { color: recurringFrequency === freq.id ? '#ffffff' : '#334155' },
                      ]}
                    >
                      {freq.l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                onPress={() => setAutoSendWhatsApp(!autoSendWhatsApp)}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    backgroundColor: autoSendWhatsApp ? '#059669' : '#ffffff',
                    borderWidth: 1,
                    borderColor: autoSendWhatsApp ? '#059669' : '#94a3b8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {autoSendWhatsApp && <Check size={11} color="#ffffff" strokeWidth={3} />}
                </View>
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#0f172a' }}>
                  Auto-send WhatsApp alert to client on generation
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>


        {/* Summary Breakdown Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxable Subtotal</Text>
            <Text style={styles.summaryVal}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {gstBreakdown.isInterState ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IGST ({gstBreakdown.igstRate}%)</Text>
              <Text style={styles.summaryVal}>+ ₹{gstBreakdown.igstAmount.toLocaleString('en-IN')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>CGST ({gstBreakdown.cgstRate}%)</Text>
                <Text style={styles.summaryVal}>+ ₹{gstBreakdown.cgstAmount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SGST ({gstBreakdown.sgstRate}%)</Text>
                <Text style={styles.summaryVal}>+ ₹{gstBreakdown.sgstAmount.toLocaleString('en-IN')}</Text>
              </View>
            </>
          )}
          {tdsAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TDS Deducted ({tdsRate}%)</Text>
              <Text style={[styles.summaryVal, { color: '#f87171' }]}>
                - ₹{tdsAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount Applied</Text>
              <Text style={[styles.summaryVal, { color: '#34d399' }]}>
                - ₹{discountAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalLabel}>Grand Total Amount</Text>
            <Text style={styles.grandTotalVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Submit Button with Gradient */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#4f46e5', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createSubmitGrad}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Check size={18} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.createSubmitText}>Generate & Issue GST Invoice</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 22,
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
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  heroGstPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  heroGstText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.5,
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
    marginBottom: 12,
  },
  iconWrapIndigo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapEmerald: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapAmber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0f172a',
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
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  clientScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  clientChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clientChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  clientChipText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  clientChipTextActive: {
    color: '#ffffff',
  },
  clientSubText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  clientSubTextActive: {
    color: '#c7d2fe',
  },
  noClientBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    marginBottom: 12,
  },
  noClientText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4f46e5',
  },
  industryScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  indChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  indChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  indChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  indChipTextActive: {
    color: '#ffffff',
  },
  indFieldsWrap: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 4,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#e0e7ff',
  },
  addItemText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4f46e5',
  },
  itemBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  itemRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trashBtn: {
    padding: 8,
    marginBottom: 10,
  },
  gstSlabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  gstChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  gstChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  gstChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  gstChipTextActive: {
    color: '#ffffff',
  },
  tdsPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
  },
  tdsChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tdsChipActive: {
    backgroundColor: '#4338ca',
    borderColor: '#4338ca',
  },
  tdsChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  tdsChipTextActive: {
    color: '#ffffff',
  },
  summaryCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#ffffff',
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#34d399',
    fontFamily: 'monospace',
  },
  createSubmitGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  createSubmitText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#ffffff',
  },
});

