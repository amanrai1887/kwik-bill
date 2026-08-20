import { db } from './index.ts';
import { recurringProfiles, clients, users } from './schema.ts';
import { eq, and, desc, lte } from 'drizzle-orm';

export async function getRecurringProfilesByUserId(userId: number) {
  const rows = await db
    .select({
      profile: recurringProfiles,
      client: {
        id: clients.id,
        name: clients.name,
        companyName: clients.companyName,
        phone: clients.phone,
        email: clients.email,
      },
    })
    .from(recurringProfiles)
    .innerJoin(clients, eq(recurringProfiles.clientId, clients.id))
    .where(eq(recurringProfiles.userId, userId))
    .orderBy(desc(recurringProfiles.createdAt));

  return rows.map((r) => ({
    ...r.profile,
    client: r.client,
  }));
}

export async function getRecurringProfileById(userId: number, id: number) {
  const rows = await db
    .select()
    .from(recurringProfiles)
    .where(and(eq(recurringProfiles.id, id), eq(recurringProfiles.userId, userId)))
    .limit(1);

  return rows.length > 0 ? rows[0] : null;
}

export async function createRecurringProfileInDb(userId: number, data: any) {
  const inserted = await db
    .insert(recurringProfiles)
    .values({
      userId,
      clientId: Number(data.clientId),
      title: data.title || 'Recurring Retainer Billing',
      frequency: data.frequency || 'monthly',
      interval: data.interval ? Number(data.interval) : 1,
      startDate: data.startDate,
      nextRunDate: data.nextRunDate || data.startDate,
      endDate: data.endDate || null,
      isActive: true,
      autoSendWhatsApp: data.autoSendWhatsApp ?? true,
      currency: data.currency || 'INR',
      subtotal: String(data.subtotal || '0.00'),
      taxRate: String(data.taxRate || '18.00'),
      taxAmount: String(data.taxAmount || '0.00'),
      tdsRate: String(data.tdsRate || '0.00'),
      tdsAmount: String(data.tdsAmount || '0.00'),
      discountAmount: String(data.discountAmount || '0.00'),
      totalAmount: String(data.totalAmount || '0.00'),
      items: data.items || [],
      industryDetails: data.industryDetails || {},
      notes: data.notes || 'Automated recurring invoice. Thank you for your continued business!',
      terms: data.terms || 'Payment is due within 7 days of invoice generation.',
    })
    .returning();

  return inserted[0];
}

export async function toggleRecurringProfileInDb(userId: number, id: number) {
  const existing = await getRecurringProfileById(userId, id);
  if (!existing) return null;

  const updated = await db
    .update(recurringProfiles)
    .set({
      isActive: !existing.isActive,
      updatedAt: new Date(),
    })
    .where(and(eq(recurringProfiles.id, id), eq(recurringProfiles.userId, userId)))
    .returning();

  return updated.length > 0 ? updated[0] : null;
}

export async function deleteRecurringProfileFromDb(userId: number, id: number) {
  const deleted = await db
    .delete(recurringProfiles)
    .where(and(eq(recurringProfiles.id, id), eq(recurringProfiles.userId, userId)))
    .returning();

  return deleted.length > 0;
}

export async function getDueRecurringProfiles(todayStr: string) {
  return await db
    .select({
      profile: recurringProfiles,
      client: clients,
      merchant: users,
    })
    .from(recurringProfiles)
    .innerJoin(clients, eq(recurringProfiles.clientId, clients.id))
    .innerJoin(users, eq(recurringProfiles.userId, users.id))
    .where(
      and(
        eq(recurringProfiles.isActive, true),
        lte(recurringProfiles.nextRunDate, todayStr)
      )
    );
}

export async function updateRecurringProfileNextRun(id: number, nextRunDate: string, generatedCount: number, isActive: boolean) {
  return await db
    .update(recurringProfiles)
    .set({
      nextRunDate,
      generatedCount,
      lastGeneratedAt: new Date(),
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(recurringProfiles.id, id))
    .returning();
}
