export type IndustryType = 'transport' | 'agency' | 'freelancer' | 'consultant' | 'gym' | 'coaching' | 'retail' | 'general';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'partial';
export type SubscriptionPlan = 'trial_15_days' | 'starter_299' | 'pro_499';

export type InvoiceTemplate = 'modern' | 'corporate' | 'logistics' | 'creative' | 'classic' | 'dark_neon';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  role?: string;
  businessName: string;
  phone: string;
  upiId: string;
  gstin: string;
  address: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  industryType: IndustryType;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: string;
  trialEndsAt?: string;
  whatsappProvider?: string;
  whatsappPhoneNumberId?: string;
  whatsappApiToken?: string;
  logoUrl?: string;
  invoiceTemplate?: InvoiceTemplate;
  brandColor?: string;
  customFooter?: string;
}


export interface Client {
  id: number;
  userId: number;
  name: string;
  phone: string;
  email?: string;
  companyName?: string;
  address?: string;
  gstin?: string;
  industryType: IndustryType;
  paymentTermDays: number;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  uqc?: string; // Unit Quantity Code (e.g. NOS, KGS, MTR, BOX, HRS, DAYS, TRIP, MONTH)
  rate: number;
  gstRate?: number; // Optional line-item specific GST %
  amount: number;
  hsnCode?: string;
}

export interface TransportDetails {
  vehicleNo?: string;
  lrNumber?: string;
  routeFrom?: string;
  routeTo?: string;
  driverName?: string;
  ewayBillNo?: string;
}

export interface AgencyDetails {
  milestone?: string;
  hoursBilled?: number;
  ratePerHour?: number;
  campaignName?: string;
}

export interface FreelanceDetails {
  projectGithub?: string;
  hours?: number;
  deliverableLink?: string;
}

export interface ConsultantDetails {
  sessionDates?: string;
  advisoryDomain?: string;
  hoursSpent?: number;
}

export interface GymDetails {
  planDuration?: string; // Monthly, Quarterly, Annual
  trainerName?: string;
  memberId?: string;
  renewalDueDate?: string;
}

export interface CoachingDetails {
  batchName?: string;
  subjectCourse?: string;
  studentRollNo?: string;
  installmentNo?: string;
}

export interface RetailDetails {
  billCounter?: string;
  warrantyPeriod?: string;
  barcodeScan?: string;
  deliveryMethod?: string;
}


export interface Invoice {
  id: number;
  userId: number;
  clientId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus | 'cancelled';
  currency: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  tdsRate: string;
  tdsAmount: string;
  discountAmount: string;
  totalAmount: string;
  paidAmount: string;
  placeOfSupply?: string;
  isRcm?: boolean;
  taxType?: 'intra_state' | 'inter_state';
  shareToken?: string;
  isCancelled?: boolean;
  cancelReason?: string;
  items: InvoiceItem[];
  industryDetails?: TransportDetails | AgencyDetails | FreelanceDetails | ConsultantDetails | any;
  notes: string;
  terms: string;
  reminderSentCount: number;
  lastReminderSentAt?: string;
  createdAt?: string;
  updatedAt?: string;
  client?: Client;
  merchant?: UserProfile;
  payments?: Payment[];
  reminderLogs?: ReminderLog[];
}

export interface Payment {
  id: number;
  userId: number;
  invoiceId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: 'upi' | 'bank_transfer' | 'cash' | 'cheque';
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
}

export interface ReminderLog {
  id: number;
  userId: number;
  invoiceId: number;
  clientId: number;
  channel: 'whatsapp' | 'sms' | 'email';
  templateType: 'polite' | 'standard' | 'urgent' | 'overdue';
  messageContent: string;
  recipientPhone: string;
  status: string;
  sentAt: string;
  clientName?: string;
  companyName?: string;
  invoiceNumber?: string;
  invoiceAmount?: string;
}

export interface AnalyticsData {
  metrics: {
    totalInvoiced: number;
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    totalInvoicesCount: number;
    totalClientsCount: number;
    collectionRate: number;
  };
  trendData: Array<{
    month: string;
    invoiced: number;
    collected: number;
    pending: number;
  }>;
  industryBreakdown: {
    transport: number;
    agency: number;
    freelancer: number;
    consultant: number;
  };
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringProfile {
  id: number;
  userId: number;
  clientId: number;
  title: string;
  frequency: RecurringFrequency;
  interval: number;
  startDate: string;
  nextRunDate: string;
  endDate?: string;
  isActive: boolean;
  autoSendWhatsApp: boolean;
  currency: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  tdsRate: string;
  tdsAmount: string;
  discountAmount: string;
  totalAmount: string;
  items: InvoiceItem[];
  industryDetails?: any;
  notes: string;
  terms: string;
  generatedCount: number;
  lastGeneratedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  client?: Client;
}

