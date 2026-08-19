import { db } from './index.ts';
import { invoices, clients, payments, reminderLogs } from './schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function getInvoicesByUserId(userId: number) {
  try {
    const list = await db
      .select({
        invoice: invoices,
        client: clients,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));

    return list.map((item) => ({
      ...item.invoice,
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
      ...rows[0].invoice,
      client: rows[0].client,
      payments: paymentRows,
      reminderLogs: reminderRows,
    };
  } catch (error) {
    console.error("Failed to fetch invoice details:", error);
    throw new Error("Failed to fetch invoice details.", { cause: error });
  }
}

export async function getInvoiceByNumberPublic(invoiceNumber: string) {
  try {
    const { users } = await import('./schema.ts');
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
      .where(eq(invoices.invoiceNumber, invoiceNumber));


    if (rows.length === 0) return null;

    return {
      ...rows[0].invoice,
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
  items: any[];
  industryDetails?: any;
  notes?: string;
  terms?: string;
}) {
  try {
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

export async function deleteInvoice(userId: number, invoiceId: number) {
  try {
    // Delete associated payments and reminder logs first
    await db.delete(payments).where(and(eq(payments.invoiceId, invoiceId), eq(payments.userId, userId)));
    await db.delete(reminderLogs).where(and(eq(reminderLogs.invoiceId, invoiceId), eq(reminderLogs.userId, userId)));
    return await db.delete(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId))).returning();
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    throw new Error("Failed to delete invoice.", { cause: error });
  }
}
