import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, businessName?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }

    const isSuperAdminEmail = email.toLowerCase() === 'arai.343531@gmail.com';
    const role = isSuperAdminEmail ? 'superadmin' : 'subscriber';
    
    // 15 Days trial calculation
    const trialDays = 15;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    const result = await db.insert(users)
      .values({
        uid,
        email,
        role,
        businessName: businessName || (isSuperAdminEmail ? 'Platform SuperAdmin' : 'My Business'),
        upiId: '',
        phone: '',
        gstin: '',
        address: '',
        industryType: 'transport',
        subscriptionPlan: isSuperAdminEmail ? 'pro_499' : 'trial_15_days',
        subscriptionStatus: isSuperAdminEmail ? 'active' : 'trial',
        trialEndsAt: isSuperAdminEmail ? null : trialEndsAt,
      })

      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          role: isSuperAdminEmail ? 'superadmin' : users.role,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];

  } catch (error) {
    console.error("Database user query failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function updateUserProfile(userId: number, data: any) {
  try {
    const updatePayload: any = { ...data };

    // Convert trialEndsAt ISO string to Date object if present
    if (updatePayload.trialEndsAt) {
      updatePayload.trialEndsAt = new Date(updatePayload.trialEndsAt);
    }

    // Remove any client-only/unmapped keys
    delete updatePayload.id;
    delete updatePayload.createdAt;

    const updated = await db.update(users)
      .set({
        ...updatePayload,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Database update user failed:", error);
    throw new Error("Failed to update user profile.", { cause: error });
  }
}


export async function getAllTenants() {
  try {
    const allUsers = await db.select().from(users).orderBy(users.id);
    return allUsers;
  } catch (error) {
    console.error("Database get all tenants failed:", error);
    throw new Error("Failed to get all tenants.", { cause: error });
  }
}

export async function updateTenantSubscription(userId: number, plan: string, status: string) {
  try {
    const updated = await db.update(users)
      .set({
        subscriptionPlan: plan,
        subscriptionStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Database update tenant subscription failed:", error);
    throw new Error("Failed to update tenant subscription.", { cause: error });
  }
}

