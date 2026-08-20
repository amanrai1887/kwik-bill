import { db } from '../db/index.ts';
import { payments, invoices } from '../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { BadRequestError, NotFoundError } from '../utils/apiResponse.ts';

export interface CreatePaymentDTO {
  invoiceId: number;
  amount: string | number;
  paymentDate: string;
  paymentMethod?: 'upi' | 'bank_transfer' | 'cash' | 'cheque';
  referenceNumber?: string;
  notes?: string;
}

export async function recordPaymentService(userId: number, data: CreatePaymentDTO) {
  const invoiceId = Number(data.invoiceId);
  const paymentAmount = parseFloat(String(data.amount || '0'));

  if (isNaN(invoiceId) || invoiceId <= 0) {
    throw new BadRequestError('Valid invoice ID is required.');
  }

  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    throw new BadRequestError('Payment amount must be greater than 0.');
  }

  return await db.transaction(async (tx) => {
    // 1. Verify invoice exists and belongs to the requesting user
    const invRows = await tx
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));

    if (invRows.length === 0) {
      throw new NotFoundError('Invoice not found or does not belong to your account.');
    }

    const invoice = invRows[0];

    // 2. Insert payment
    const inserted = await tx
      .insert(payments)
      .values({
        userId,
        invoiceId,
        amount: paymentAmount.toFixed(2),
        paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: data.paymentMethod || 'upi',
        referenceNumber: data.referenceNumber || '',
        notes: data.notes || '',
      })
      .returning();

    // 3. Recalculate total paid for this invoice
    const allPayments = await tx
      .select()
      .from(payments)
      .where(and(eq(payments.invoiceId, invoiceId), eq(payments.userId, userId)));

    const totalPaid = allPayments.reduce((acc, p) => acc + parseFloat(p.amount || '0'), 0);
    const invoiceTotal = parseFloat(invoice.totalAmount);

    let newStatus = 'pending';
    if (totalPaid >= invoiceTotal) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partial';
    }

    // 4. Update invoice status & paidAmount
    await tx
      .update(invoices)
      .set({
        status: newStatus,
        paidAmount: totalPaid.toFixed(2),
        updatedAt: new Date(),
      })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));

    return inserted[0];
  });
}

export async function getPaymentsService(userId: number) {
  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}
