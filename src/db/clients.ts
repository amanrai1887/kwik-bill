import { db } from './index.ts';
import { clients } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

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

export async function deleteClient(userId: number, clientId: number) {
  try {
    return await db.delete(clients).where(and(eq(clients.id, clientId), eq(clients.userId, userId))).returning();
  } catch (error) {
    console.error("Failed to delete client:", error);
    throw new Error("Failed to delete client.", { cause: error });
  }
}
