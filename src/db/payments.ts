import { db } from './index.ts';
import { payments, invoices } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { updateInvoiceStatus } from './invoices.ts';

export async function recordPayment(userId: number, data: {
  invoiceId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}) {
  try {
    const inserted = await db.insert(payments).values({
      userId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod || 'upi',
      referenceNumber: data.referenceNumber || '',
      notes: data.notes || '',
    }).returning();

    // Check invoice total vs paid amount
    const inv = await db.select().from(invoices).where(and(eq(invoices.id, data.invoiceId), eq(invoices.userId, userId)));
    if (inv.length > 0) {
      const invoice = inv[0];
      const allPayments = await db.select().from(payments).where(and(eq(payments.invoiceId, data.invoiceId), eq(payments.userId, userId)));
      const totalPaid = allPayments.reduce((acc, p) => acc + parseFloat(p.amount || '0'), 0);
      const invoiceTotal = parseFloat(invoice.totalAmount);
      
      let newStatus = 'pending';
      if (totalPaid >= invoiceTotal) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partial';
      }
      
      await updateInvoiceStatus(userId, data.invoiceId, newStatus, totalPaid.toFixed(2));
    }

    return inserted[0];
  } catch (error) {
    console.error("Failed to record payment:", error);
    throw new Error("Failed to record payment.", { cause: error });
  }
}

export async function getPaymentsForUser(userId: number) {
  try {
    return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    throw new Error("Failed to fetch payments.", { cause: error });
  }
}
