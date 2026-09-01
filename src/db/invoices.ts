import { db } from './index.ts';
import { invoices, clients, payments, reminderLogs } from './schema.ts';
import { eq, and, desc, or, sql } from 'drizzle-orm';

export interface InvoiceQueryOptions {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
}

export function normalizeInvoiceFinancials(invoice: any) {
  if (!invoice) return invoice;
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const computedSubtotal = items.reduce((acc: number, it: any) => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.rate) || 0;
    return acc + (Number(it.amount) || (qty * rate));
  }, 0);

  const rawSubtotal = parseFloat(invoice.subtotal);
  const subtotal = !isNaN(rawSubtotal) && rawSubtotal > 0 ? rawSubtotal : computedSubtotal;

  const taxRate = parseFloat(invoice.taxRate) || 0;
  const rawTaxAmount = parseFloat(invoice.taxAmount);
  const taxAmount = !isNaN(rawTaxAmount) && rawTaxAmount > 0 ? rawTaxAmount : (subtotal * taxRate) / 100;

  const discountAmount = parseFloat(invoice.discountAmount) || 0;
  const tdsAmount = parseFloat(invoice.tdsAmount) || 0;
  const computedTotal = Math.max(0, subtotal + taxAmount - discountAmount - tdsAmount);

  const rawTotal = parseFloat(invoice.totalAmount);
  const totalAmount = !isNaN(rawTotal) && rawTotal > 0 ? rawTotal : computedTotal;

  return {
    ...invoice,
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
}

export async function getInvoicesByUserId(userId: number, options?: InvoiceQueryOptions) {
  try {
    const conditions = [eq(invoices.userId, userId)];

    if (options?.status && options.status !== 'all') {
      conditions.push(eq(invoices.status, options.status));
    }

    if (options?.search && options.search.trim()) {
      const s = `%${options.search.trim()}%`;
      conditions.push(
        or(
          sql`${invoices.invoiceNumber} ILIKE ${s}`,
          sql`${clients.name} ILIKE ${s}`,
          sql`${clients.companyName} ILIKE ${s}`
        )!
      );
    }

    let query = db
      .select({
        invoice: invoices,
        client: clients,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt));

    if (options?.limit && options.limit > 0) {
      query = (query as any).limit(options.limit);
      if (options.offset && options.offset > 0) {
        query = (query as any).offset(options.offset);
      }
    }

    const list = await query;

    return list.map((item: any) => ({
      ...normalizeInvoiceFinancials(item.invoice),
      client: item.client,
    }));
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    throw new Error("Failed to fetch invoices.", { cause: error });
  }
}

export async function getInvoiceById(userId: number, invoiceId: number) {
  try {
    const rows = await db
      .select({
        invoice: invoices,
        client: clients,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));

    if (rows.length === 0) return null;

    const paymentRows = await db
      .select()
      .from(payments)
      .where(and(eq(payments.invoiceId, invoiceId), eq(payments.userId, userId)))
      .orderBy(desc(payments.createdAt));

    const reminderRows = await db
      .select()
      .from(reminderLogs)
      .where(and(eq(reminderLogs.invoiceId, invoiceId), eq(reminderLogs.userId, userId)))
      .orderBy(desc(reminderLogs.sentAt));

    return {
      ...normalizeInvoiceFinancials(rows[0].invoice),
      client: rows[0].client,
      payments: paymentRows,
      reminderLogs: reminderRows,
    };
  } catch (error) {
    console.error("Failed to fetch invoice details:", error);
    throw new Error("Failed to fetch invoice details.", { cause: error });
  }
}

import crypto from "crypto";

export async function getInvoiceByNumberPublic(identifier: string) {
  try {
    const { users } = await import('./schema.ts');
    const token = identifier ? identifier.trim() : '';
    if (!token) return null;

    // Secure IDOR-proof lookup: Query ONLY by high-entropy shareToken
    const rows = await db
      .select({
        invoice: invoices,
        client: clients,
        merchant: {
          id: users.id,
          businessName: users.businessName,
          phone: users.phone,
          upiId: users.upiId,
          gstin: users.gstin,
          address: users.address,
          bankName: users.bankName,
          bankAccountNo: users.bankAccountNo,
          bankIfsc: users.bankIfsc,
          industryType: users.industryType,
          logoUrl: users.logoUrl,
          invoiceTemplate: users.invoiceTemplate,
          brandColor: users.brandColor,
          customFooter: users.customFooter,
        },
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .innerJoin(users, eq(invoices.userId, users.id))
      .where(eq(invoices.shareToken, token));

    if (rows.length === 0) return null;

    return {
      ...normalizeInvoiceFinancials(rows[0].invoice),
      client: rows[0].client,
      merchant: rows[0].merchant,
    };
  } catch (error) {
    console.error("Failed to fetch public invoice:", error);
    throw new Error("Failed to fetch public invoice.", { cause: error });
  }
}

export async function createInvoice(userId: number, data: {
  clientId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status?: string;
  currency?: string;
  subtotal: string;
  taxRate?: string;
  taxAmount?: string;
  tdsRate?: string;
  tdsAmount?: string;
  discountAmount?: string;
  totalAmount: string;
  paidAmount?: string;
  placeOfSupply?: string;
  isRcm?: boolean;
  taxType?: string;
  shareToken?: string;
  items: any[];
  industryDetails?: any;
  notes?: string;
  terms?: string;
}) {
  try {
    const generatedShareToken = data.shareToken || `inv_live_${crypto.randomBytes(16).toString('hex')}`;
    const inserted = await db.insert(invoices).values({
      userId,
      clientId: data.clientId,
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: data.status || 'pending',

      currency: data.currency || 'INR',
      subtotal: data.subtotal,
      taxRate: data.taxRate || '18.00',
      taxAmount: data.taxAmount || '0.00',
      tdsRate: data.tdsRate || '0.00',
      tdsAmount: data.tdsAmount || '0.00',
      discountAmount: data.discountAmount || '0.00',
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount || '0.00',
      placeOfSupply: data.placeOfSupply || '',
      isRcm: data.isRcm ?? false,
      taxType: data.taxType || 'intra_state',
      shareToken: generatedShareToken,
      isCancelled: false,
      items: data.items,
      industryDetails: data.industryDetails || {},
      notes: data.notes || 'Thank you for your business! Please settle the dues promptly.',
      terms: data.terms || 'Payment is due within the stipulated days.',
    }).returning();

    return inserted[0];
  } catch (error) {
    console.error("Failed to create invoice:", error);
    throw new Error("Failed to create invoice.", { cause: error });
  }
}

export async function updateInvoiceStatus(userId: number, invoiceId: number, status: string, paidAmount?: string) {
  try {
    const updateObj: any = { status, updatedAt: new Date() };
    if (paidAmount !== undefined) {
      updateObj.paidAmount = paidAmount;
    }
    const updated = await db
      .update(invoices)
      .set(updateObj)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
      .returning();

    return updated[0];
  } catch (error) {
    console.error("Failed to update invoice status:", error);
    throw new Error("Failed to update invoice status.", { cause: error });
  }
}

export async function recordReminderSent(userId: number, invoiceId: number) {
  try {
    const updated = await db
      .update(invoices)
      .set({
        reminderSentCount: sql`${invoices.reminderSentCount} + 1`,
        lastReminderSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Failed to update reminder count:", error);
  }
}

/**
 * GST Compliant Invoice Cancellation (CGST Section 31 & Rule 46)
 * Invoices issued cannot be physically hard-deleted. They must be preserved as 'cancelled'
 * in the taxpayer's Table 13 Document register for GST audit integrity.
 */
export async function deleteInvoice(userId: number, invoiceId: number, reason?: string) {
  try {
    const updated = await db
      .update(invoices)
      .set({
        status: 'cancelled',
        isCancelled: true,
        cancelReason: reason || 'Cancelled by user / voided invoice',
        updatedAt: new Date(),
      })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
      .returning();

    return updated[0];
  } catch (error) {
    console.error("Failed to cancel invoice:", error);
    throw new Error("Failed to cancel invoice.", { cause: error });
  }
}
