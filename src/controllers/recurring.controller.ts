import { Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { recurringProfiles, clients } from '../db/schema.ts';
import { processRecurringInvoices } from '../services/recurring.service.ts';
import { AuthRequest } from '../middleware/auth.ts';

// GET /api/recurring
export async function getRecurringProfiles(req: AuthRequest, res: Response) {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
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

    const profiles = rows.map((r) => ({
      ...r.profile,
      client: r.client,
    }));

    return res.json({ success: true, profiles });
  } catch (error: any) {
    console.error('Failed to fetch recurring profiles:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch recurring profiles' });
  }
}

// POST /api/recurring
export async function createRecurringProfile(req: AuthRequest, res: Response) {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // STRICT PRO PLAN CHECK: Only Pro users (or superadmin) can create recurring billing profiles
  const userRole = req.dbUser?.role;
  const userEmail = req.dbUser?.email?.toLowerCase();
  const userPlan = req.dbUser?.subscriptionPlan;
  const isProUser = userRole === 'superadmin' || userEmail === 'arai.343531@gmail.com' || userPlan === 'pro_499';

  if (!isProUser) {
    return res.status(403).json({
      error: 'Automated recurring billing is exclusively available on the Pro Growth Plan (₹499/mo). Please upgrade to Pro to create recurring schedules.',
    });
  }

  try {
    const {
      clientId,
      title,
      frequency,
      interval,
      startDate,
      nextRunDate,
      endDate,
      autoSendWhatsApp,
      currency,
      subtotal,
      taxRate,
      taxAmount,
      tdsRate,
      tdsAmount,
      discountAmount,
      totalAmount,
      items,
      industryDetails,
      notes,
      terms,
    } = req.body;

    if (!clientId || !startDate || !items || !totalAmount) {
      return res.status(400).json({ error: 'Missing required recurring fields' });
    }

    const calculatedNextRun = nextRunDate || startDate;

    const inserted = await db
      .insert(recurringProfiles)
      .values({
        userId,
        clientId: Number(clientId),
        title: title || 'Recurring Retainer Billing',
        frequency: frequency || 'monthly',
        interval: interval ? Number(interval) : 1,
        startDate,
        nextRunDate: calculatedNextRun,
        endDate: endDate || null,
        isActive: true,
        autoSendWhatsApp: autoSendWhatsApp ?? true,
        currency: currency || 'INR',
        subtotal: String(subtotal),
        taxRate: String(taxRate || '18.00'),
        taxAmount: String(taxAmount || '0.00'),
        tdsRate: String(tdsRate || '0.00'),
        tdsAmount: String(tdsAmount || '0.00'),
        discountAmount: String(discountAmount || '0.00'),
        totalAmount: String(totalAmount),
        items: items || [],
        industryDetails: industryDetails || {},
        notes: notes || 'Automated recurring invoice. Thank you for your continued business!',
        terms: terms || 'Payment is due within 7 days of invoice generation.',
      })
      .returning();

    return res.status(201).json({ success: true, profile: inserted[0] });
  } catch (error: any) {
    console.error('Failed to create recurring profile:', error);
    return res.status(500).json({ error: error.message || 'Failed to create recurring profile' });
  }
}

// PUT /api/recurring/:id/toggle
export async function toggleRecurringProfile(req: AuthRequest, res: Response) {
  const userId = req.dbUser?.id;
  const id = Number(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const existing = await db
      .select()
      .from(recurringProfiles)
      .where(and(eq(recurringProfiles.id, id), eq(recurringProfiles.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Recurring profile not found' });
    }

    const updated = await db
      .update(recurringProfiles)
      .set({
        isActive: !existing[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(recurringProfiles.id, id))
      .returning();

    return res.json({ success: true, profile: updated[0] });
  } catch (error: any) {
    console.error('Failed to toggle recurring profile:', error);
    return res.status(500).json({ error: error.message || 'Failed to toggle recurring profile' });
  }
}

// DELETE /api/recurring/:id
export async function deleteRecurringProfile(req: AuthRequest, res: Response) {
  const userId = req.dbUser?.id;
  const id = Number(req.params.id);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await db
      .delete(recurringProfiles)
      .where(and(eq(recurringProfiles.id, id), eq(recurringProfiles.userId, userId)));

    return res.json({ success: true, message: 'Recurring profile deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete recurring profile:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete recurring profile' });
  }
}

// POST /api/recurring/trigger-run
export async function triggerManualRun(req: AuthRequest, res: Response) {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await processRecurringInvoices();
    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('Manual recurring run failed:', error);
    return res.status(500).json({ error: error.message || 'Manual run failed' });
  }
}

