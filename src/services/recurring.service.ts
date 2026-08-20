import { eq, and, lte, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { recurringProfiles, invoices, clients, users } from '../db/schema.ts';
import { createInvoice } from '../db/invoices.ts';

// Helper to compute next run date given current run date and frequency
export function computeNextRunDate(currentDateStr: string, frequency: string, interval = 1): string {
  const current = new Date(currentDateStr);
  const next = new Date(current);

  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7 * interval);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1 * interval);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3 * interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1 * interval);
      break;
    default:
      next.setMonth(next.getMonth() + 1 * interval);
  }

  return next.toISOString().split('T')[0];
}

// Generates unique invoice number (e.g., INV-2026-REC-102)
function generateRecurringInvoiceNumber(prefix = 'INV'): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomNum}`;
}

// Mutex lock to prevent race conditions during concurrent execution
let isRecurringProcessing = false;

export async function processRecurringInvoices() {
  if (isRecurringProcessing) {
    console.log('[Auto-Billing Engine] Scan already in progress. Skipping concurrent run.');
    return { count: 0, generated: [], message: 'Scan already in progress' };
  }

  isRecurringProcessing = true;
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    // Find all active profiles whose nextRunDate <= today
    const dueProfiles = await db
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

    if (dueProfiles.length === 0) {
      isRecurringProcessing = false;
      return { count: 0, generated: [] };
    }

    const generatedInvoices: any[] = [];

    for (const item of dueProfiles) {
      const p = item.profile;
      const client = item.client;
      const merchant = item.merchant;

      // Calculate issueDate and dueDate (default 7 days after issueDate)
      const issueDate = todayStr;
      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + (client.paymentTermDays || 7));
      const dueDate = dueDateObj.toISOString().split('T')[0];
      const invNumber = generateRecurringInvoiceNumber();

      // Create new invoice in database
      const newInv = await createInvoice(p.userId, {
        clientId: p.clientId,
        invoiceNumber: invNumber,
        issueDate,
        dueDate,
        status: 'pending',
        currency: p.currency,
        subtotal: p.subtotal,
        taxRate: p.taxRate || '18.00',
        taxAmount: p.taxAmount || '0.00',
        tdsRate: p.tdsRate || '0.00',
        tdsAmount: p.tdsAmount || '0.00',
        discountAmount: p.discountAmount || '0.00',
        totalAmount: p.totalAmount,
        items: p.items as any[],
        industryDetails: p.industryDetails,
        notes: p.notes || 'Automated recurring invoice.',
        terms: p.terms || 'Payment due within stipulated terms.',
      });

      // Calculate next run date
      const nextRunDate = computeNextRunDate(p.nextRunDate, p.frequency, p.interval);
      const isExpired = p.endDate && nextRunDate > p.endDate;

      // Update recurring profile stats & next run date
      await db
        .update(recurringProfiles)
        .set({
          nextRunDate,
          generatedCount: p.generatedCount + 1,
          lastGeneratedAt: new Date(),
          isActive: isExpired ? false : true,
          updatedAt: new Date(),
        })
        .where(eq(recurringProfiles.id, p.id));

      // If autoSendWhatsApp is enabled, send direct WhatsApp notification
      if (p.autoSendWhatsApp && client.phone) {
        const whatsappToken = merchant.whatsappApiToken || process.env.META_WHATSAPP_TOKEN;
        const phoneNumberId = merchant.whatsappPhoneNumberId || process.env.META_PHONE_NUMBER_ID;

        let cleanPhone = client.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) {
          cleanPhone = `91${cleanPhone}`;
        }

        const upiPayLink = merchant.upiId 
          ? `upi://pay?pa=${merchant.upiId}&pn=${encodeURIComponent(merchant.businessName || 'Business')}&am=${p.totalAmount}&cu=INR&tn=${encodeURIComponent(`Invoice ${invNumber}`)}`
          : '';

        const messageContent = `Hello *${client.name}*,\n\nGreetings from *${merchant.businessName || 'Our Business'}*! ✨\n\nYour automated recurring Invoice *#${invNumber}* for *₹${p.totalAmount}* has been generated for *${issueDate}* (Due: *${dueDate}*).\n\n${upiPayLink ? `📲 *Instant UPI Payment:*\n${upiPayLink}\n\n` : ''}Thank you for your valued partnership!`;

        let deliveryStatus = 'logged';

        if (whatsappToken && phoneNumberId) {
          try {
            const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
            const metaRes = await fetch(metaUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanPhone,
                type: 'text',
                text: { preview_url: true, body: messageContent },
              }),
            });

            const metaData = await metaRes.json();
            if (metaRes.ok && metaData.messages) {
              deliveryStatus = 'delivered';
              console.log(`[Auto-Billing Engine] WhatsApp message sent successfully to +${cleanPhone}`);
            } else {
              console.warn(`[Auto-Billing Engine] Meta WhatsApp Cloud API response error:`, JSON.stringify(metaData));
              deliveryStatus = 'api_error';
            }
          } catch (apiErr) {
            console.error(`[Auto-Billing Engine] Failed to dispatch automated WhatsApp message:`, apiErr);
            deliveryStatus = 'api_error';
          }
        } else {
          console.log(`[Auto-Billing Engine] WhatsApp credentials not found for user ${merchant.email}. Logged reminder locally.`);
        }
      }

      generatedInvoices.push({
        profileId: p.id,
        invoiceId: newInv.id,
        invoiceNumber: invNumber,
        clientName: client.name,
        totalAmount: p.totalAmount,
      });

      console.log(`[Auto-Billing Engine] Generated recurring invoice ${invNumber} for ${client.name} (₹${p.totalAmount})`);
    }

    return { count: generatedInvoices.length, generated: generatedInvoices };
  } catch (error) {
    console.error('[Auto-Billing Engine] Error processing recurring invoices:', error);
    throw error;
  } finally {
    isRecurringProcessing = false;
  }
}
