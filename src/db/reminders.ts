import { db } from './index.ts';
import { reminderLogs, clients, invoices } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { recordReminderSent } from './invoices.ts';

export async function logWhatsAppReminder(userId: number, data: {
  invoiceId: number;
  clientId: number;
  templateType: string;
  messageContent: string;
  recipientPhone: string;
  channel?: string;
  status?: string;
}) {
  try {
    const inserted = await db.insert(reminderLogs).values({
      userId,
      invoiceId: data.invoiceId,
      clientId: data.clientId,
      templateType: data.templateType || 'standard',
      messageContent: data.messageContent,
      recipientPhone: data.recipientPhone,
      channel: data.channel || 'whatsapp',
      status: data.status || 'sent',
    }).returning();

    // Increment reminder counter on the invoice
    await recordReminderSent(userId, data.invoiceId);

    return inserted[0];
  } catch (error) {
    console.error("Failed to log reminder:", error);
    throw new Error("Failed to log reminder.", { cause: error });
  }
}

export async function getReminderLogsByUserId(userId: number) {
  try {
    const logs = await db
      .select({
        log: reminderLogs,
        client: clients,
        invoice: invoices,
      })
      .from(reminderLogs)
      .leftJoin(clients, eq(reminderLogs.clientId, clients.id))
      .leftJoin(invoices, eq(reminderLogs.invoiceId, invoices.id))
      .where(eq(reminderLogs.userId, userId))
      .orderBy(desc(reminderLogs.sentAt));

    return logs.map((l) => ({
      ...l.log,
      clientName: l.client?.name || 'Customer',
      companyName: l.client?.companyName || '',
      clientIsActive: l.client?.isActive !== false,
      invoiceNumber: l.invoice?.invoiceNumber || '',
      invoiceAmount: l.invoice?.totalAmount || '0.00',
      invoiceStatus: l.invoice?.status || 'unknown',
      isCancelled: l.invoice?.isCancelled || l.invoice?.status === 'cancelled',
    }));
  } catch (error) {
    console.error("Failed to fetch reminder logs:", error);
    throw new Error("Failed to fetch reminder logs.", { cause: error });
  }
}
