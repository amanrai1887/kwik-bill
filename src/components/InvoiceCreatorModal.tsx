import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Truck, 
  Megaphone, 
  Laptop, 
  Briefcase, 
  IndianRupee, 
  Calculator, 
  FileText,
  UserPlus,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { Client, IndustryType, InvoiceItem, UserProfile } from '../lib/types.ts';
import { INDIAN_STATES, calculateGstBreakdown, getStateCodeFromGstin } from '../lib/gstCompliance.ts';

interface InvoiceCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  profile: UserProfile | null;
  onSubmit: (invoiceData: any) => Promise<void>;
  onQuickAddClient: () => void;
}

export const InvoiceCreatorModal: React.FC<InvoiceCreatorModalProps> = ({
  isOpen,
  onClose,
  clients,
  profile,
  onSubmit,
  onQuickAddClient,
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const dueDefault = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [clientId, setClientId] = useState<number>(clients[0]?.id || 0);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState<string>(today);
  const [dueDate, setDueDate] = useState<string>(dueDefault);
  const [industryType, setIndustryType] = useState<IndustryType>(profile?.industryType || 'transport');

  // GST Compliance Fields
  const supplierState = getStateCodeFromGstin(profile?.gstin) || '27';
  const [placeOfSupply, setPlaceOfSupply] = useState<string>(supplierState);
  const [isRcm, setIsRcm] = useState<boolean>(false);
  const [taxType, setTaxType] = useState<'intra_state' | 'inter_state'>('intra_state');

  // Recurring Schedule Opt-in State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);

  // Ensure clientId is valid when clients array loads or changes
  useEffect(() => {
    if (clients.length > 0) {
      if (!clientId || !clients.some(c => c.id === clientId)) {
        setClientId(clients[0].id);
      }
    }
  }, [clients, clientId]);


  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Transport Freight: Mumbai JNPT to Ahmedabad (18T)', quantity: 1, rate: 42000, amount: 42000, hsnCode: '9965' },
  ]);

  // Tax & Discounts
  const [taxRate, setTaxRate] = useState<number>(12); // Default 12% GST
  const [tdsRate, setTdsRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Transport specific
  const [vehicleNo, setVehicleNo] = useState('MH-04-GP-8842');
  const [lrNumber, setLrNumber] = useState('LR-994201');
  const [routeFrom, setRouteFrom] = useState('JNPT Port, Navi Mumbai');
  const [routeTo, setRouteTo] = useState('Sanand GIDC, Ahmedabad');
  const [driverName, setDriverName] = useState('Suresh Yadav');

  // Agency specific
  const [campaignName, setCampaignName] = useState('Q3 Performance Marketing Sprint');
  const [milestone, setMilestone] = useState('Phase 1 Deliverables & Creatives');

  // Gym & Fitness specific
  const [memberId, setMemberId] = useState('GYM-MB-104');
  const [planDuration, setPlanDuration] = useState('Quarterly (3 Months)');
  const [trainerName, setTrainerName] = useState('Rahul Fitness Trainer');

  // Coaching & Tuition specific
  const [studentRollNo, setStudentRollNo] = useState('STU-2026-89');
  const [batchName, setBatchName] = useState('Class 12th Physics & Math Batch A');
  const [installmentNo, setInstallmentNo] = useState('Term 2 Fee (Installment 2/3)');

  // Retail Shop specific
  const [billCounter, setBillCounter] = useState('Counter POS-01');
  const [warrantyPeriod, setWarrantyPeriod] = useState('1 Year Manufacturer Warranty');

  // Notes
  const [notes, setNotes] = useState('Thank you for your business. Please pay via UPI or Bank Transfer.');
  const [terms, setTerms] = useState('Payment due within agreed terms. 2% interest per month on delayed payment.');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected client default industry and state if changed
  useEffect(() => {
    const selected = clients.find((c) => c.id === clientId);
    if (selected) {
      if (selected.industryType) {
        setIndustryType(selected.industryType);
      }
      const clientState = getStateCodeFromGstin(selected.gstin);
      if (clientState) {
        setPlaceOfSupply(clientState);
      }
    }
  }, [clientId, clients]);

  // Auto detect intra vs inter state
  useEffect(() => {
    const suppCode = getStateCodeFromGstin(profile?.gstin);
    if (suppCode && placeOfSupply) {
      setTaxType(suppCode === placeOfSupply ? 'intra_state' : 'inter_state');
    }
  }, [placeOfSupply, profile?.gstin]);

  // Calculation Math
  const subtotal = items.reduce((sum, it) => sum + (it.quantity * it.rate || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const tdsAmount = (subtotal * tdsRate) / 100;
  const totalAmount = Math.max(0, subtotal + taxAmount - tdsAmount - discountAmount);

  // GST Breakdown
  const gstBreakdown = calculateGstBreakdown(
    taxRate,
    subtotal,
    profile?.gstin,
    placeOfSupply,
    taxType === 'inter_state'
  );

  const handleItemChange = (index: number, field: keyof InvoiceItem, val: any) => {
    const next = [...items];
    const item = { ...next[index], [field]: val };
    if (field === 'quantity' || field === 'rate') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }
    next[index] = item;
    setItems(next);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { description: 'Additional Service / Item', quantity: 1, rate: 2000, amount: 2000, hsnCode: '9983' },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveClientId = clientId || clients[0]?.id;
    if (!effectiveClientId) {
      alert('Please add a client first by clicking "+ Add" next to Client / Party');
      onQuickAddClient();
      return;
    }

    // Rule 46(b) validation for GST Invoice Number format (max 16 characters)
    if (invoiceNumber.trim().length > 16) {
      alert('GST Compliance Warning: As per Rule 46(b) of CGST Rules, Invoice Number must be 16 characters or less.');
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

      await onSubmit({
        clientId: effectiveClientId,
        invoiceNumber,
        issueDate,
        dueDate,
        placeOfSupply,
        isRcm,
        taxType,
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
        isRecurring,
        recurringFrequency,
        autoSendWhatsApp,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error creating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create New Invoice</h2>
              <p className="text-xs text-slate-500">GST-ready billing with WhatsApp reminder presets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-invoice-creator-btn"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Client & Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Client Picker */}
            <div className="sm:col-span-1">
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Client / Party *</label>
                <button
                  type="button"
                  onClick={onQuickAddClient}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              {clients.length === 0 ? (
                <button
                  type="button"
                  onClick={onQuickAddClient}
                  className="w-full p-2.5 bg-indigo-50 border border-dashed border-indigo-300 rounded-xl font-bold text-indigo-700 flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Your First Client</span>
                </button>
              ) : (
                <select
                  value={clientId || clients[0]?.id}
                  onChange={(e) => setClientId(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.phone}
                    </option>
                  ))}
                </select>
              )}
            </div>


            {/* Invoice Number */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Invoice Number *
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Max 16 Chars (Rule 46)</span>
              </div>
              <input
                type="text"
                maxLength={16}
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1.5">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* GST Statutory Compliance Bar */}
          <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Place of Supply (State) *
              </label>
              <select
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-500/20"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Tax Type (Auto-detected)
              </label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value as any)}
                className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-slate-900 font-bold text-xs"
              >
                <option value="intra_state">Intra-State (CGST + SGST)</option>
                <option value="inter_state">Inter-State (IGST)</option>
              </select>
            </div>

            <div className="pt-2 sm:pt-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-indigo-200">
                <input
                  type="checkbox"
                  checked={isRcm}
                  onChange={(e) => setIsRcm(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] font-bold text-slate-800">
                  Reverse Charge (RCM) Applicable
                </span>
              </label>
            </div>
          </div>

          {/* Industry Preset Selector */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Select Industry Workflow
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['transport', 'agency', 'gym', 'coaching', 'retail', 'freelancer', 'consultant'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIndustryType(type)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      industryType === type
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Transport specific fields */}
            {industryType === 'transport' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Vehicle No.</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="MH-04-GP-8842"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">LR / Bilty No.</label>
                  <input
                    type="text"
                    value={lrNumber}
                    onChange={(e) => setLrNumber(e.target.value)}
                    placeholder="LR-994201"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">From Route</label>
                  <input
                    type="text"
                    value={routeFrom}
                    onChange={(e) => setRouteFrom(e.target.value)}
                    placeholder="JNPT Navi Mumbai"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">To Destination</label>
                  <input
                    type="text"
                    value={routeTo}
                    onChange={(e) => setRouteTo(e.target.value)}
                    placeholder="Sanand Ahmedabad"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Agency specific fields */}
            {industryType === 'agency' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Q3 Performance Campaign"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Milestone Description</label>
                  <input
                    type="text"
                    value={milestone}
                    onChange={(e) => setMilestone(e.target.value)}
                    placeholder="Phase 1 Deliverables Completed"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Gym & Fitness specific fields */}
            {industryType === 'gym' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Member ID</label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="GYM-MB-104"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Plan Duration</label>
                  <input
                    type="text"
                    value={planDuration}
                    onChange={(e) => setPlanDuration(e.target.value)}
                    placeholder="Quarterly (3 Months)"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assigned Trainer</label>
                  <input
                    type="text"
                    value={trainerName}
                    onChange={(e) => setTrainerName(e.target.value)}
                    placeholder="Rahul Fitness Coach"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Coaching & Tuition specific fields */}
            {industryType === 'coaching' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Student Roll / Reg No.</label>
                  <input
                    type="text"
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value)}
                    placeholder="STU-2026-89"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Batch / Course</label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="Class 12th JEE / NEET Batch"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Installment / Term</label>
                  <input
                    type="text"
                    value={installmentNo}
                    onChange={(e) => setInstallmentNo(e.target.value)}
                    placeholder="Term 2 Fee (Installment 2/3)"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Retail Shop & Kirana specific fields */}
            {industryType === 'retail' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Billing Counter / POS</label>
                  <input
                    type="text"
                    value={billCounter}
                    onChange={(e) => setBillCounter(e.target.value)}
                    placeholder="Counter POS-01"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Warranty / Return Policy</label>
                  <input
                    type="text"
                    value={warrantyPeriod}
                    onChange={(e) => setWarrantyPeriod(e.target.value)}
                    placeholder="1 Year Manufacturer Warranty"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>


          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Line Items & Deliverables *
              </label>
              <button
                type="button"
                onClick={addItemRow}
                id="creator-add-row-btn"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-5/12">Description / Service</th>
                    <th className="py-2.5 px-3 w-2/12">HSN/SAC</th>
                    <th className="py-2.5 px-3 w-1/12 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-1/12 text-center">Unit (UQC)</th>
                    <th className="py-2.5 px-3 w-2/12 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-1/12 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 w-1/12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Service or freight description"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.hsnCode || ''}
                          onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                          placeholder="9965"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-center"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.uqc || 'NOS'}
                          onChange={(e) => handleItemChange(idx, 'uqc', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-bold font-mono text-center"
                        >
                          <option value="NOS">NOS (Units)</option>
                          <option value="KGS">KGS</option>
                          <option value="MTR">MTR (Metres)</option>
                          <option value="BOX">BOX</option>
                          <option value="HRS">HRS (Hours)</option>
                          <option value="DAYS">DAYS</option>
                          <option value="TRIP">TRIP</option>
                          <option value="MONTH">MONTH</option>
                          <option value="QTL">QTL (Quintal)</option>
                          <option value="BAG">BAG</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-right font-mono"
                          required
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax, Discounts & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
            {/* Tax / TDS rates */}
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  GST Slab
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 5, 12, 18, 28].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTaxRate(rate)}
                      className={`py-1.5 rounded-lg font-bold text-[11px] border transition-all ${
                        taxRate === rate
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    TDS Rate (Sec 194J/C)
                  </label>
                  <select
                    value={tdsRate}
                    onChange={(e) => setTdsRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="0">0% (None)</option>
                    <option value="2">2% (Contractor 194C)</option>
                    <option value="10">10% (Professional 194J)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Recurring Auto-Billing Opt-in */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-indigo-950 text-xs">
                    🔁 Also Save as Automated Recurring Schedule
                  </span>
                </label>

                {isRecurring && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-indigo-900 uppercase block mb-1">
                        Billing Frequency
                      </label>
                      <select
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value)}
                        className="w-full p-1.5 bg-white border border-indigo-200 rounded-lg text-xs text-indigo-900 font-semibold"
                      >
                        <option value="weekly">Weekly (Every 7 Days)</option>
                        <option value="monthly">Monthly Retainer</option>
                        <option value="quarterly">Quarterly (3 Months)</option>
                        <option value="yearly">Yearly Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-indigo-900 uppercase block mb-1">
                        Auto WhatsApp
                      </label>
                      <select
                        value={autoSendWhatsApp ? 'true' : 'false'}
                        onChange={(e) => setAutoSendWhatsApp(e.target.value === 'true')}
                        className="w-full p-1.5 bg-white border border-indigo-200 rounded-lg text-xs text-indigo-900 font-semibold"
                      >
                        <option value="true">Yes (Instant Alert)</option>
                        <option value="false">No (Silent)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Calculations Breakdown Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount (Subtotal):</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {gstBreakdown.isInterState ? (
                <div className="flex justify-between text-slate-600">
                  <span>IGST ({gstBreakdown.igstRate}%):</span>
                  <span>+ ₹{gstBreakdown.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST ({gstBreakdown.cgstRate}%):</span>
                    <span>+ ₹{gstBreakdown.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST ({gstBreakdown.sgstRate}%):</span>
                    <span>+ ₹{gstBreakdown.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              {tdsAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>TDS ({tdsRate}%):</span>
                  <span>- ₹{tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base text-indigo-600">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            id="cancel-create-invoice-btn"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            id="save-invoice-submit-btn"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isSubmitting ? 'Generating Invoice...' : 'Save & Prepare WhatsApp Alert'}
          </button>
        </div>
      </div>
    </div>
  );
};
