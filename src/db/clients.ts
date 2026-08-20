import { db } from './index.ts';
import { clients, invoices, payments, reminderLogs, recurringProfiles } from './schema.ts';
import { eq, and, desc, inArray } from 'drizzle-orm';

export async function getClientsByUserId(userId: number) {
  try {
    return await db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.createdAt));
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    throw new Error("Failed to fetch clients.", { cause: error });
  }
}

export async function createClient(userId: number, clientData: {
  name: string;
  phone: string;
  email?: string;
  companyName?: string;
  address?: string;
  gstin?: string;
  industryType?: string;
  paymentTermDays?: number;
  notes?: string;
  isActive?: boolean;
}) {
  try {
    const inserted = await db.insert(clients).values({
      userId,
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email || '',
      companyName: clientData.companyName || '',
      address: clientData.address || '',
      gstin: clientData.gstin || '',
      industryType: clientData.industryType || 'general',
      paymentTermDays: clientData.paymentTermDays || 7,
      notes: clientData.notes || '',
      isActive: clientData.isActive !== undefined ? clientData.isActive : true,
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error("Failed to create client:", error);
    throw new Error("Failed to create client.", { cause: error });
  }
}

export async function updateClient(userId: number, clientId: number, clientData: Partial<typeof clients.$inferInsert>) {
  try {
    const updated = await db.update(clients)
      .set(clientData)
      .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Failed to update client:", error);
    throw new Error("Failed to update client.", { cause: error });
  }
}

export async function toggleClientActive(userId: number, clientId: number, isActive?: boolean) {
  try {
    if (typeof isActive === 'boolean') {
      const updated = await db.update(clients)
        .set({ isActive })
        .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
        .returning();
      return updated[0];
    } else {
      const existing = await db.select().from(clients).where(and(eq(clients.id, clientId), eq(clients.userId, userId)));
      if (!existing || existing.length === 0) {
        throw new Error("Client not found");
      }
      const newStatus = !existing[0].isActive;
      const updated = await db.update(clients)
        .set({ isActive: newStatus })
        .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
        .returning();
      return updated[0];
    }
  } catch (error: any) {
    console.error("Failed to toggle client status:", error);
    throw new Error(error?.message || "Failed to toggle client status.", { cause: error });
  }
}

export async function deleteClient(userId: number, clientId: number) {
  try {
    // 1. Get all invoice IDs belonging to this client
    const clientInvoices = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.clientId, clientId), eq(invoices.userId, userId)));

    const invoiceIds = clientInvoices.map((inv) => inv.id);

    // 2. Delete payments for these invoices if any exist
    if (invoiceIds.length > 0) {
      await db
        .delete(payments)
        .where(and(eq(payments.userId, userId), inArray(payments.invoiceId, invoiceIds)));
    }

    // 3. Delete reminder logs associated with this client
    await db
      .delete(reminderLogs)
      .where(and(eq(reminderLogs.clientId, clientId), eq(reminderLogs.userId, userId)));

    // 4. Delete recurring profiles for this client
    await db
      .delete(recurringProfiles)
      .where(and(eq(recurringProfiles.clientId, clientId), eq(recurringProfiles.userId, userId)));

    // 5. Delete invoices for this client
    if (invoiceIds.length > 0) {
      await db
        .delete(invoices)
        .where(and(eq(invoices.clientId, clientId), eq(invoices.userId, userId)));
    }

    // 6. Delete the client
    const deleted = await db
      .delete(clients)
      .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
      .returning();

    return deleted[0];
  } catch (error: any) {
    console.error("Failed to delete client:", error);
    throw new Error(error?.message || "Failed to delete client.", { cause: error });
  }
}
