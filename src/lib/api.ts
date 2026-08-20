import { auth } from './firebase.ts';

/**
 * Standardized HTTP error class containing HTTP status, error code and server message
 */
export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status = 500, code = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('Could not retrieve Firebase token, proceeding with demo headers', e);
    }
  } else {
    // Fallback demo user headers for preview testing
    headers['x-demo-user-id'] = 'demo-business-owner-101';
    headers['x-demo-email'] = 'owner@speedytrans.in';
  }

  return headers;
}

/**
 * Centralized fetch helper for type-safe requests and structured error handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorMsg =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      `HTTP Error ${res.status}: ${res.statusText}`;
    const errorCode = data?.error?.code || `HTTP_${res.status}`;
    throw new ApiClientError(errorMsg, res.status, errorCode, data?.error?.details);
  }

  return data as T;
}

// User & Workspace Profile
export async function fetchProfile() {
  return request<{ success: boolean; user: any }>('/api/user/profile');
}

export async function updateProfile(data: any) {
  return request<{ success: boolean; user: any }>('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function resetWorkspace() {
  return request<{ success: boolean; message: string }>('/api/user/reset', {
    method: 'POST',
  });
}

// Clients Directory
export async function fetchClients() {
  return request<{ success: boolean; clients: any[] }>('/api/clients');
}

export async function createClient(data: any) {
  return request<{ success: boolean; client: any }>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: number, data: any) {
  return request<{ success: boolean; client: any }>(`/api/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function toggleClientStatus(id: number, isActive?: boolean) {
  return request<{ success: boolean; client: any }>(`/api/clients/${id}/toggle-status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}

export async function deleteClient(id: number) {
  return request<{ success: boolean; message?: string }>(`/api/clients/${id}`, {
    method: 'DELETE',
  });
}

// Invoices
export async function fetchInvoices(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  let url = '/api/invoices';
  if (params) {
    const q = new URLSearchParams();
    if (params.page) q.append('page', params.page.toString());
    if (params.limit) q.append('limit', params.limit.toString());
    if (params.status && params.status !== 'all') q.append('status', params.status);
    if (params.search) q.append('search', params.search);
    const qs = q.toString();
    if (qs) url += `?${qs}`;
  }
  return request<{ success: boolean; invoices: any[]; pagination?: any }>(url);
}

export async function fetchInvoiceById(id: number) {
  return request<{ success: boolean; invoice: any }>(`/api/invoices/${id}`);
}

export async function createInvoice(data: any) {
  return request<{ success: boolean; invoice: any }>('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInvoiceStatus(id: number, status: string, paidAmount?: string) {
  return request<{ success: boolean; invoice: any }>(`/api/invoices/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, paidAmount }),
  });
}

export async function deleteInvoice(id: number, reason?: string) {
  return request<{ success: boolean; message?: string }>(`/api/invoices/${id}`, {
    method: 'DELETE',
    body: reason ? JSON.stringify({ reason }) : undefined,
  });
}

// Payments
export async function fetchPayments() {
  return request<{ success: boolean; payments: any[] }>('/api/payments');
}

export async function recordPayment(data: any) {
  return request<{ success: boolean; payment: any }>('/api/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// WhatsApp & Reminders
export async function sendWhatsAppReminder(data: {
  invoiceId: number;
  clientId: number;
  templateType: string;
  templateName?: string;
  recipientName?: string;
  invoiceNumber?: string;
  totalAmount?: string | number;
  dueDate?: string;
  messageContent: string;
  recipientPhone: string;
  sendMethod?: string;
  pdfUrl?: string;
  sendAsDocument?: boolean;
}) {
  return request<{
    success: boolean;
    directApiSent: boolean;
    deliveryStatus: string;
    log: any;
    whatsappUrl: string;
    apiResponse?: any;
  }>('/api/reminders/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchReminderLogs() {
  return request<{ success: boolean; logs: any[] }>('/api/reminders/logs');
}

// Analytics
export async function fetchAnalytics() {
  return request<any>('/api/analytics');
}

// Admin Console
export async function fetchAdminTenants() {
  return request<{ success: boolean; tenants: any[] }>('/api/admin/tenants');
}

export async function createAdminTenant(data: {
  businessName: string;
  email: string;
  phone: string;
  industryType: string;
  subscriptionPlan: string;
  upiId?: string;
}) {
  return request<{ success: boolean; tenant: any }>('/api/admin/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminTenantSubscription(tenantId: number, plan: string, status: string) {
  return request<{ success: boolean; tenant: any }>(`/api/admin/tenants/${tenantId}/subscription`, {
    method: 'PUT',
    body: JSON.stringify({ plan, status }),
  });
}

export async function submitPlanRequestApi(data: {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industryType: string;
  requestedPlan: string;
  businessNeeds?: string;
}) {
  return request<{ success: boolean; request: any }>('/api/user/plan-request', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAdminPlanRequests() {
  return request<{ success: boolean; requests: any[] }>('/api/admin/plan-requests');
}

export async function updateAdminPlanRequestStatus(id: number, data: {
  status: 'approved' | 'rejected';
  approveAsSubscriber?: boolean;
  userId?: number;
  requestedPlan?: string;
}) {
  return request<{ success: boolean; request: any }>(`/api/admin/plan-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Recurring Invoices
export async function fetchRecurringProfiles() {
  return request<{ success: boolean; profiles: any[] }>('/api/recurring');
}

export async function createRecurringProfile(data: any) {
  return request<{ success: boolean; profile: any }>('/api/recurring', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function toggleRecurringProfile(id: number) {
  return request<{ success: boolean; profile: any }>(`/api/recurring/${id}/toggle`, {
    method: 'PUT',
  });
}

export async function deleteRecurringProfile(id: number) {
  return request<{ success: boolean; message: string }>(`/api/recurring/${id}`, {
    method: 'DELETE',
  });
}

export async function triggerManualRecurringRun() {
  return request<{ success: boolean; result: any }>('/api/recurring/trigger-run', {
    method: 'POST',
  });
}

// Razorpay Checkout
export async function createRazorpayOrderApi(amountInPaise: number, planId?: string, notes?: Record<string, any>) {
  return request<{
    success: boolean;
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
    receipt: string;
  }>('/api/create-order', {
    method: 'POST',
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      planId,
      notes,
    }),
  });
}

export async function verifyRazorpayPaymentApi(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId?: string;
}) {
  return request<{
    success: boolean;
    message: string;
    payment_id: string;
    order_id: string;
    planId?: string;
    user?: any;
  }>('/api/verify-payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
