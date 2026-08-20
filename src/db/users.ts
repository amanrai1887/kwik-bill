import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';
import { isSuperAdminEmail } from '../config/app.config.ts';
import { ensureDemoData } from './demoSeed.ts';

export async function getOrCreateUser(uid: string, email: string, businessName?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      if (uid === 'demo-business-owner-101') {
        await ensureDemoData(existing[0].id);
      }
      return existing[0];
    }

    const isAdmin = isSuperAdminEmail(email);
    const isDemoUser = uid === 'demo-business-owner-101';
    const role = isAdmin ? 'superadmin' : 'subscriber';
    
    // 15 Days trial calculation
    const trialDays = 15;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    const result = await db.insert(users)
      .values({
        uid,
        email,
        role,
        businessName: businessName || (isAdmin ? 'Platform SuperAdmin' : isDemoUser ? 'Speedy Transport Logistics' : 'My Business'),
        upiId: isDemoUser ? 'speedytrans@okaxis' : '',
        phone: isDemoUser ? '+91 98200 12345' : '',
        gstin: isDemoUser ? '27AABCS1429B1ZX' : '',
        address: isDemoUser ? 'Plot 42, Transport Nagar, JNPT Highway, Navi Mumbai, MH 400705' : '',
        industryType: 'transport',
        subscriptionPlan: isAdmin || isDemoUser ? 'pro_499' : 'trial_15_days',
        subscriptionStatus: isAdmin || isDemoUser ? 'active' : 'trial',
        trialEndsAt: isAdmin || isDemoUser ? null : trialEndsAt,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          role: isAdmin ? 'superadmin' : users.role,
          updatedAt: new Date(),
        },
      })
      .returning();

    const created = result[0];
    if (isDemoUser && created) {
      await ensureDemoData(created.id);
    }

    return created;

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
