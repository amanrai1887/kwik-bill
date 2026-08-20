import { auth } from './firebase.ts';

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

export async function fetchProfile() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/user/profile', { headers });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function updateProfile(data: any) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function resetWorkspace() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/user/reset', {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to reset workspace data');
  return res.json();
}


export async function fetchClients() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/clients', { headers });
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function createClient(data: any) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/clients', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

export async function updateClient(id: number, data: any) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update client');
  return res.json();
}

export async function deleteClient(id: number) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete client');
  return res.json();
}

export async function fetchInvoices(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  const headers = await getAuthHeaders();
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
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function fetchInvoiceById(id: number) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/invoices/${id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch invoice');
  return res.json();
}

export async function createInvoice(data: any) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
}

export async function updateInvoiceStatus(id: number, status: string, paidAmount?: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/invoices/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status, paidAmount }),
  });
  if (!res.ok) throw new Error('Failed to update invoice status');
  return res.json();
}

export async function deleteInvoice(id: number) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/invoices/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete invoice');
  return res.json();
}

export async function recordPayment(data: any) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to record payment');
  return res.json();
}

export async function sendWhatsAppReminder(data: {
  invoiceId: number;
  clientId: number;
  templateType: string;
  messageContent: string;
  recipientPhone: string;
}) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/reminders/send', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send WhatsApp reminder');
  return res.json();
}

export async function fetchReminderLogs() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/reminders/logs', { headers });
  if (!res.ok) throw new Error('Failed to fetch reminder logs');
  return res.json();
}

export async function fetchAnalytics() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/analytics', { headers });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchAdminTenants() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/admin/tenants', { headers });
  if (!res.ok) throw new Error('Failed to fetch tenants');
  return res.json();
}

export async function createAdminTenant(data: {
  businessName: string;
  email: string;
  phone: string;
  industryType: string;
  subscriptionPlan: string;
  upiId?: string;
}) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/admin/tenants', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to onboard business client');
  return res.json();
}

export async function updateAdminTenantSubscription(tenantId: number, plan: string, status: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/admin/tenants/${tenantId}/subscription`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ plan, status }),
  });
  if (!res.ok) throw new Error('Failed to update tenant subscription');
  return res.json();
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
  const headers = await getAuthHeaders();
  const res = await fetch('/api/user/plan-request', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit plan request');
  return res.json();
}

export async function fetchAdminPlanRequests() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/admin/plan-requests', { headers });
  if (!res.ok) throw new Error('Failed to fetch plan requests');
  return res.json();
}

export async function updateAdminPlanRequestStatus(id: number, data: {
  status: 'approved' | 'rejected';
  approveAsSubscriber?: boolean;
  userId?: number;
  requestedPlan?: string;
}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/admin/plan-requests/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update plan request status');
  return res.json();
}

// Recurring Invoices API
export async function fetchRecurringProfiles() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/recurring', { headers });
  if (!res.ok) throw new Error('Failed to fetch recurring profiles');
  return res.json();
}

export async function createRecurringProfile(data: any) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/recurring', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create recurring profile');
  return res.json();
}

export async function toggleRecurringProfile(id: number) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/recurring/${id}/toggle`, {
    method: 'PUT',
    headers,
  });
  if (!res.ok) throw new Error('Failed to toggle recurring profile');
  return res.json();
}

export async function deleteRecurringProfile(id: number) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/recurring/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete recurring profile');
  return res.json();
}

export async function triggerManualRecurringRun() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/recurring/trigger-run', {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to run recurring engine');
  return res.json();
}

// Razorpay Order Creation API
export async function createRazorpayOrderApi(amountInPaise: number, planId?: string, notes?: Record<string, any>) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      planId,
      notes,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create Razorpay payment order');
  }
  return data;
}

// Razorpay Payment Signature Verification API
export async function verifyRazorpayPaymentApi(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId?: string;
}) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Payment signature verification failed');
  }
  return data;
}




