export type IndustryType = 'transport' | 'agency' | 'freelancer' | 'consultant' | 'gym' | 'coaching' | 'retail' | 'general';
export type SubscriptionPlan = 'trial_15_days' | 'starter_299' | 'pro_499';
export type InvoiceTemplate = 'modern' | 'corporate' | 'logistics' | 'creative' | 'classic' | 'dark_neon';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  role?: string;
  businessName: string;
  ownerName?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  upiId?: string;
  industryType: IndustryType;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'inactive';
  whatsappPhoneNumberId?: string;
  whatsappApiToken?: string;
  logoUrl?: string;
  invoiceTemplate?: 'modern' | 'corporate' | 'logistics' | 'creative' | 'classic' | 'dark_neon';
  brandColor?: string;
  customFooter?: string;
  createdAt: string;
}


export interface Client {
  id: number;
  userId: number;
  name: string;
  businessName?: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  preferredPaymentMethod?: string;
  industryData?: any;
  totalInvoiced?: number;
  totalPaid?: number;
  totalPending?: number;
  isActive?: boolean;
  createdAt: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  uqc?: string;
  rate: number;
  gstRate?: number; // 0, 5, 12, 18, 28
  amount: number;
}

export interface Invoice {
  id: number;
  userId: number;
  clientId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: string;
  taxRate?: string;
  taxAmount?: string;
  tdsRate?: string;
  tdsAmount?: string;
  discountAmount?: string;
  cgst?: string;
  sgst?: string;
  igst?: string;
  totalAmount: string;
  paidAmount: string;
  balanceDue: string;
  placeOfSupply?: string;
  isRcm?: boolean;
  taxType?: 'intra_state' | 'inter_state';
  shareToken?: string;
  isCancelled?: boolean;
  cancelReason?: string;
  upiId?: string;
  qrCodeUrl?: string;
  notes?: string;
  terms?: string;
  industryDetails?: any;
  transportDetails?: {
    lrNumber?: string;
    vehicleNumber?: string;
    fromLocation?: string;
    toLocation?: string;
    driverMobile?: string;
  };
  gymDetails?: {
    memberId?: string;
    membershipPlan?: string;
    validityMonths?: number;
    trainerName?: string;
  };
  coachingDetails?: {
    studentRollNo?: string;
    batchName?: string;
    courseName?: string;
    installmentNumber?: number;
  };
  retailDetails?: {
    counterPosNumber?: string;
    cashierName?: string;
    warrantyDuration?: string;
  };
  client?: Client;
  createdAt: string;
}


export interface ClientRiskInfo {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  label: string;
  avgDelayDays: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  overdueAmount: number;
  invoicesCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  expectedNext7Days?: number;
  expectedNext30Days?: number;
  ageingBuckets?: {
    days0to15: number;
    days16to30: number;
    days31to60: number;
    days60plus: number;
  };
  clientRiskMap?: Record<number, ClientRiskInfo>;
}


export interface ReminderLog {
  id: number;
  userId: number;
  invoiceId: number;
  clientId: number;
  channel: 'whatsapp' | 'email';
  templateType: 'friendly' | 'due_today' | 'urgent' | 'final_legal';
  messageContent: string;
  recipientPhone: string;
  status: 'sent' | 'failed';
  sentAt: string;
  client?: Client;
  invoice?: Invoice;
}

export interface RecurringProfile {
  id: number;
  userId: number;
  clientId: number;
  title: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  startDate: string;
  nextRunDate: string;
  endDate?: string;
  isActive: boolean;
  autoSendWhatsApp: boolean;
  currency: string;
  subtotal: string;
  taxRate?: string;
  taxAmount?: string;
  totalAmount: string;
  items: InvoiceItem[];
  generatedCount: number;
  lastGeneratedAt?: string;
  client?: Client;
}

