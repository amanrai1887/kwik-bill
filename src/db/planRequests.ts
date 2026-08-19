import { db } from './index.ts';
import { planRequests } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface PlanRequestInput {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industryType: string;
  requestedPlan: string;
  businessNeeds?: string;
}

export async function createPlanRequest(userId: number, data: PlanRequestInput) {
  const [created] = await db
    .insert(planRequests)
    .values({
      userId,
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      industryType: data.industryType,
      requestedPlan: data.requestedPlan,
      businessNeeds: data.businessNeeds || '',
      status: 'pending',
    })
    .returning();
  return created;
}

export async function getAllPlanRequests() {
  return await db
    .select()
    .from(planRequests)
    .orderBy(desc(planRequests.createdAt));
}

export async function updatePlanRequestStatus(id: number, status: 'approved' | 'rejected') {
  const [updated] = await db
    .update(planRequests)
    .set({ status })
    .where(eq(planRequests.id, id))
    .returning();
  return updated;
}
