import { apiClient } from './client.ts';
import { UserProfile, Client, Invoice, AnalyticsSummary, ReminderLog } from '../types/index.ts';

export const api = {
  // Profile
  getProfile: async () => {
    const res = await apiClient<{ success: boolean; user: UserProfile }>('/user/profile');
    return res.user;
  },
  updateProfile: async (data: Partial<UserProfile>) => {
    const res = await apiClient<{ success: boolean; user: UserProfile }>('/user/profile', {
      method: 'PUT',
      body: data,
    });
    return res.user;
  },

  // Invoices
  getInvoices: async () => {
    const res = await apiClient<{ success: boolean; invoices: Invoice[] }>('/invoices');
    return res.invoices;
  },
  createInvoice: async (data: any) => {
    const res = await apiClient<{ success: boolean; invoice: Invoice }>('/invoices', {
      method: 'POST',
      body: data,
    });
    return res.invoice;
  },
  updateInvoiceStatus: async (id: number, status: string, paidAmount?: string) => {
    const res = await apiClient<{ success: boolean; invoice: Invoice }>(`/invoices/${id}/status`, {
      method: 'PUT',
      body: { status, paidAmount },
    });
    return res.invoice;
  },
  deleteInvoice: async (id: number) => {
    return await apiClient(`/invoices/${id}`, { method: 'DELETE' });
  },

  // Clients
  getClients: async () => {
    const res = await apiClient<{ success: boolean; clients: Client[] }>('/clients');
    return res.clients;
  },
  createClient: async (data: Partial<Client>) => {
    const res = await apiClient<{ success: boolean; client: Client }>('/clients', {
      method: 'POST',
      body: data,
    });
    return res.client;
  },
  updateClient: async (id: number, data: Partial<Client>) => {
    const res = await apiClient<{ success: boolean; client: Client }>(`/clients/${id}`, {
      method: 'PUT',
      body: data,
    });
    return res.client;
  },
  deleteClient: async (id: number) => {
    return await apiClient(`/clients/${id}`, { method: 'DELETE' });
  },

  // Payments
  recordPayment: async (data: {
    invoiceId: number;
    amount: string | number;
    paymentMethod: string;
    paymentDate: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    return await apiClient('/payments', {
      method: 'POST',
      body: data,
    });
  },


  // WhatsApp Reminders
  sendWhatsAppReminder: async (data: {
    invoiceId: number;
    clientId: number;
    templateType: string;
    messageContent: string;
    recipientPhone: string;
  }) => {
    return await apiClient('/reminders/send', {
      method: 'POST',
      body: data,
    });
  },
  getReminderLogs: async () => {
    const res = await apiClient<{ success: boolean; logs: ReminderLog[] }>('/reminders/logs');
    return res.logs;
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsSummary> => {
    const res = await apiClient<any>('/analytics');
    const m = res.metrics || {};
    return {
      totalRevenue: m.totalInvoiced || 0,
      totalPaid: m.totalCollected || 0,
      totalPending: m.totalPending || 0,
      overdueAmount: m.totalOverdue || 0,
      invoicesCount: m.totalInvoicesCount || 0,
      paidCount: m.collectionRate || 0,
      pendingCount: m.totalInvoicesCount ? Math.max(0, m.totalInvoicesCount - (m.collectionRate ? 1 : 0)) : 0,
      overdueCount: m.totalOverdue > 0 ? 1 : 0,
      expectedNext7Days: m.expectedNext7Days || 0,
      expectedNext30Days: m.expectedNext30Days || 0,
      ageingBuckets: m.ageingBuckets || {
        days0to15: 0,
        days16to30: 0,
        days31to60: 0,
        days60plus: 0,
      },
      clientRiskMap: res.clientRiskMap || {},
    };
  },

  // Tax Summary / GSTR-1
  getGstr1Summary: async () => {
    return await apiClient('/analytics/gstr1');
  },

  // Recurring Invoices
  getRecurringProfiles: async () => {
    const res = await apiClient<{ success: boolean; profiles: any[] }>('/recurring');
    return res.profiles;
  },
  createRecurringProfile: async (data: any) => {
    const res = await apiClient<{ success: boolean; profile: any }>('/recurring', {
      method: 'POST',
      body: data,
    });
    return res.profile;
  },
  toggleRecurringProfile: async (id: number) => {
    return await apiClient(`/recurring/${id}/toggle`, { method: 'PUT' });
  },
  deleteRecurringProfile: async (id: number) => {
    return await apiClient(`/recurring/${id}`, { method: 'DELETE' });
  },
  triggerManualRecurringRun: async () => {
    return await apiClient<{ success: boolean; result?: { count: number; generated: any[] } }>('/recurring/trigger-run', { method: 'POST' });
  },
};



