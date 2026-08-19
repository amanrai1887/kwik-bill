import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CreditCard, 
  Check, 
  Sparkles, 
  Save, 
  IndianRupee, 
  ShieldCheck, 
  MessageSquare,
  Zap,
  CheckCircle2,
  Palette,
  Upload,
  Eye,
  X,
  FileText,
  Truck,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { IndustryType, SubscriptionPlan, UserProfile, InvoiceTemplate } from '../lib/types.ts';
import { InvoiceRenderer } from './InvoiceRenderer.tsx';

interface SettingsViewProps {
  profile: UserProfile | null;
  onUpdateProfile: (data: any) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onUpdateProfile }) => {
  const [businessName, setBusinessName] = useState(profile?.businessName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [upiId, setUpiId] = useState(profile?.upiId || '');
  const [gstin, setGstin] = useState(profile?.gstin || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [bankName, setBankName] = useState(profile?.bankName || '');
  const [bankAccountNo, setBankAccountNo] = useState(profile?.bankAccountNo || '');
  const [bankIfsc, setBankIfsc] = useState(profile?.bankIfsc || '');
  const [industryType, setIndustryType] = useState<IndustryType>(profile?.industryType || 'transport');
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(profile?.subscriptionPlan || 'pro_499');
  
  // Custom Invoice Templates & Branding State
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl || '');
  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplate>(profile?.invoiceTemplate || 'modern');
  const [brandColor, setBrandColor] = useState(profile?.brandColor || '#4f46e5');
  const [customFooter, setCustomFooter] = useState(profile?.customFooter || '');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // WhatsApp Direct API Gateway Config
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState(profile?.whatsappPhoneNumberId || '');
  const [whatsappApiToken, setWhatsappApiToken] = useState(profile?.whatsappApiToken || '');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || '');
      setPhone(profile.phone || '');
      setUpiId(profile.upiId || '');
      setGstin(profile.gstin || '');
      setAddress(profile.address || '');
      setBankName(profile.bankName || '');
      setBankAccountNo(profile.bankAccountNo || '');
      setBankIfsc(profile.bankIfsc || '');
      setIndustryType(profile.industryType || 'transport');
      setSubscriptionPlan(profile.subscriptionPlan || 'pro_499');
      setLogoUrl(profile.logoUrl || '');
      setInvoiceTemplate(profile.invoiceTemplate || 'modern');
      setBrandColor(profile.brandColor || '#4f46e5');
      setCustomFooter(profile.customFooter || '');
      setWhatsappPhoneNumberId(profile.whatsappPhoneNumberId || '');
      setWhatsappApiToken(profile.whatsappApiToken || '');
    }
  }, [profile]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image file smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        businessName,
        phone,
        upiId,
        gstin,
        address,
        bankName,
        bankAccountNo,
        bankIfsc,
        industryType,
        subscriptionPlan,
        logoUrl,
        invoiceTemplate,
        brandColor,
        customFooter,
        whatsappPhoneNumberId,
        whatsappApiToken,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  const templatesList: Array<{ id: InvoiceTemplate; name: string; tag: string; desc: string; icon: any }> = [
    {
      id: 'modern',
      name: 'Modern Minimalist',
      tag: 'Default & Clean',
      desc: 'Sleek rounded badges, prominent UPI QR code, and crisp typography for modern businesses.',
      icon: Sparkles,
    },
    {
      id: 'corporate',
      name: 'Corporate Executive',
      tag: 'Formal Serif',
      desc: 'Top brand accent bar, structured client table, and high-trust enterprise layout.',
      icon: Building,
    },
    {
      id: 'logistics',
      name: 'Emerald Logistics',
      tag: 'Transport & Cargo',
      desc: 'Prominent LR/Bilty container, truck vehicle numbers, and cargo route corridors.',
      icon: Truck,
    },
    {
      id: 'creative',
      name: 'Creative Gradient',
      tag: 'Agencies & Tech',
      desc: 'Vibrant dual-color header card with milestones, sprint deliverables, and modern aesthetics.',
      icon: Palette,
    },
    {
      id: 'classic',
      name: 'Classic CA Standard',
      tag: 'GST Audit Ready',
      desc: 'Traditional Indian GST layout with CGST, SGST, IGST tax breakdown tables.',
      icon: FileText,
    },
    {
      id: 'dark_neon',
      name: 'Dark Neon Pro',
      tag: 'Cyber & Premium',
      desc: 'High-contrast dark mode billing with emerald accent totals for studios and digital brands.',
      icon: Zap,
    },
  ];

  const presetColors = [
    { label: 'Indigo', hex: '#4f46e5' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Sapphire', hex: '#0284c7' },
    { label: 'Violet', hex: '#7c3aed' },
    { label: 'Rose', hex: '#e11d48' },
    { label: 'Slate Dark', hex: '#0f172a' },
    { label: 'Amber Gold', hex: '#d97706' },
  ];

  // Dummy Invoice for Live Template Preview
  const sampleInvoice: any = {
    id: 999,
    invoiceNumber: 'INV-2026-DEMO',
    issueDate: '2026-08-19',
    dueDate: '2026-08-26',
    status: 'pending',
    currency: 'INR',
    subtotal: '42000.00',
    taxRate: '18.00',
    taxAmount: '7560.00',
    tdsRate: '0.00',
    tdsAmount: '0.00',
    discountAmount: '0.00',
    totalAmount: '49560.00',
    paidAmount: '0.00',
    items: [
      { description: 'Transport Freight Corridors (Mumbai to Ahmedabad)', hsnCode: '9965', quantity: 1, rate: 30000, amount: 30000 },
      { description: 'Loading & Transit Insurance Handling', hsnCode: '9967', quantity: 1, rate: 12000, amount: 12000 },
    ],
    industryDetails: {
      vehicleNo: 'MH-04-GP-8842',
      lrNumber: 'LR-994201',
      routeFrom: 'JNPT Port Mumbai',
      routeTo: 'Sanand Industrial Estate, Gujarat',
    },
    notes: 'Thank you for your business! Please settle the dues promptly via UPI or bank transfer.',
    terms: 'Payment is due within 7 days. 2% late interest applicable on delayed settlement.',
    client: {
      name: 'Rajesh Sharma',
      companyName: 'Rajesh Logistics & Supply Corp',
      phone: '9820098200',
      gstin: '24AABCS1429B1ZX',
      address: 'Plot 48, GIDC Industrial Estate, Sanand, Ahmedabad, Gujarat 382110',
    },
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white dark:text-white tracking-tight">
            Business Settings, Branding & Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">
            Configure your business profile, customize 6 professional invoice templates, upload your logo & set brand colors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Live Template Preview</span>
          </button>

          {savedSuccess && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* ==================================================== */}
        {/* SECTION 1: INVOICE BRANDING & TEMPLATE STUDIO        */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Invoice Branding & Template Studio</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pick from 6 high-conversion invoice styles and personalize with your brand identity</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
              6 Pro Templates
            </span>
          </div>

          {/* Logo Upload & Brand Color */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Logo Upload */}
            <div className="sm:col-span-6 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block">
                Company Brand Logo
              </label>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Upload Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Logo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">PNG, JPG, SVG up to 2MB. Appears on invoice headers & public links.</p>
                </div>
              </div>
            </div>

            {/* Brand Color Selector */}
            <div className="sm:col-span-6 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block">
                Brand Accent Color
              </label>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setBrandColor(color.hex)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        brandColor.toLowerCase() === color.hex.toLowerCase()
                          ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {brandColor.toLowerCase() === color.hex.toLowerCase() && (
                        <Check className="w-4 h-4 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      placeholder="#4f46e5"
                      className="w-20 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center font-mono text-[11px]"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">Highlights headers, total amounts, buttons, and printable sheets.</p>
              </div>
            </div>
          </div>

          {/* 6 Template Selector Grid */}
          <div className="space-y-3 pt-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block">
              Choose Active Invoice Template
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesList.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = invoiceTemplate === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setInvoiceTemplate(tpl.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-indigo-200 text-indigo-900 font-extrabold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {tpl.tag}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{tpl.name}</h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed mb-3">{tpl.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-indigo-600">
                        {isSelected ? '✓ Active Template' : 'Select Template'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInvoiceTemplate(tpl.id);
                          setIsPreviewOpen(true);
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Footer & Terms */}
          <div className="pt-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
              Custom Invoice Footer / Disclaimer / Bank Mandate
            </label>
            <textarea
              rows={2}
              value={customFooter}
              onChange={(e) => setCustomFooter(e.target.value)}
              placeholder="e.g. All payments to be settled via Bank Transfer or UPI. 2% late fee applicable after 7 days. Thank you for your business!"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 2: SUBSCRIPTION PLAN TIER                    */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Subscription Tier Plan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch between Starter (₹299/mo) and Pro (₹499/mo)</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
              Active Plan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Starter ₹299 */}
            <div
              onClick={() => setSubscriptionPlan('starter_299')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                subscriptionPlan === 'starter_299'
                  ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 dark:text-white">Starter Plan</span>
                <span className="font-bold font-mono text-indigo-600">₹299 / month</span>
              </div>
              <p className="text-slate-500 text-[11px] mb-3">
                Standard GST invoicing, UPI QR codes & 1-click wa.me reminders.
              </p>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited GST Invoices + Direct UPI QR
              </div>
            </div>

            {/* Pro ₹499 */}
            <div
              onClick={() => setSubscriptionPlan('pro_499')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                subscriptionPlan === 'pro_499'
                  ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 dark:text-white">Pro Growth Plan</span>
                <span className="font-bold font-mono text-indigo-600">₹499 / month</span>
              </div>
              <p className="text-slate-500 text-[11px] mb-3">
                All 6 custom templates, Auto-Billing Recurring Cron, 4-Tier WhatsApp escalations.
              </p>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> 6 Pro Templates + Auto WhatsApp & Recurring
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 3: BUSINESS PROFILE & CONTACT                */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Business Profile & Settlement Account</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Business / Trade Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Speedy Transport Logistics"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Business Phone (WhatsApp) *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* UPI ID */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Default Business UPI ID (For Instant QR Code) *
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="speedytrans@okaxis"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-700"
                required
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="27AABCU9603R1ZN"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 uppercase"
              />
            </div>
          </div>

          {/* Bank Wire Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="HDFC Bank"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value)}
                placeholder="50200084729103"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value)}
                placeholder="HDFC0001244"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 uppercase"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
              Registered Business / Depot Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Corridor Cargo Complex, JNPT Port Highway, Navi Mumbai, MH 400707"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900"
            />
          </div>

          {/* Industry Type */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
              Default Industry Segment
            </label>
            <select
              value={industryType}
              onChange={(e) => setIndustryType(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 font-medium"
            >
              <option value="transport">Small Transport & Logistics Fleet (LR/Vehicle No)</option>
              <option value="agency">Marketing & Creative Agency (Retainers/TDS)</option>
              <option value="freelancer">Independent Freelancer & Developer (Instant UPI)</option>
              <option value="consultant">Business & Financial Consultant (Advisory/Audit)</option>
              <option value="gym">Gym & Fitness Center (Membership/Trainer Fee)</option>
              <option value="coaching">Coaching & Tuition Institute (Batches/Installments)</option>
              <option value="retail">Retail Shop & Kirana / Traders (Counter POS/Warranty)</option>
              <option value="general">General Commercial Enterprise</option>
            </select>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 4: WHATSAPP DIRECT API GATEWAY               */}
        {/* ==================================================== */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Direct 1-Click WhatsApp API Gateway</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Send WhatsApp reminders directly without opening any browser or mobile app</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
              Meta Cloud API
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                WhatsApp Phone Number ID
              </label>
              <input
                type="text"
                value={whatsappPhoneNumberId}
                onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                placeholder="e.g. 104829104928102"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
                Meta WhatsApp Permanent Token / Access Token
              </label>
              <input
                type="password"
                value={whatsappApiToken}
                onChange={(e) => setWhatsappApiToken(e.target.value)}
                placeholder="EAAB..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Preview Template</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            id="save-settings-btn"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings & Branding'}</span>
          </button>
        </div>
      </form>

      {/* ==================================================== */}
      {/* LIVE TEMPLATE PREVIEW MODAL                          */}
      {/* ==================================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Live Preview: {templatesList.find(t => t.id === invoiceTemplate)?.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                  {invoiceTemplate}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-900">
              <InvoiceRenderer
                invoice={sampleInvoice}
                profile={profile}
                templateOverride={invoiceTemplate}
                brandColorOverride={brandColor}
                logoUrlOverride={logoUrl}
                customFooterOverride={customFooter}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



