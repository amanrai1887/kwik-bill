import { sendWhatsAppMessage } from '../whatsapp.service.ts';
import { getInvoiceByIdService } from '../invoices.service.ts';
import { db } from '../../db/index.ts';
import { reminderLogs } from '../../db/schema.ts';

export const whatsappToolDeclarations = [
  {
    name: 'send_whatsapp_invoice',
    description: 'Send an invoice with payment link or PDF via WhatsApp directly to the customer mobile number.',
    parameters: {
      type: 'OBJECT',
      properties: {
        invoiceId: {
          type: 'INTEGER',
          description: 'Database ID of the invoice to send (Required)',
        },
        recipientPhone: {
          type: 'STRING',
          description: 'WhatsApp number to override client default phone if needed',
        },
        customMessage: {
          type: 'STRING',
          description: 'Optional custom note/text message to include',
        },
      },
      required: ['invoiceId'],
    },
  },
  {
    name: 'send_payment_reminder',
    description: 'Send a formatted payment reminder notice (polite, standard, or urgent) via WhatsApp for pending/overdue invoices.',
    parameters: {
      type: 'OBJECT',
      properties: {
        invoiceId: {
          type: 'INTEGER',
          description: 'Database ID of the invoice (Required)',
        },
        tone: {
          type: 'STRING',
          description: "Reminder tone: 'polite', 'standard', 'urgent', or 'overdue' (default 'standard')",
        },
      },
      required: ['invoiceId'],
    },
  },
];

export async function executeWhatsAppTool(userId: number, functionName: string, args: any) {
  switch (functionName) {
    case 'send_whatsapp_invoice': {
      const { invoiceId, recipientPhone, customMessage } = args;
      const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      if (!invoice) return { error: `Invoice #${invoiceId} not found.` };

      const targetPhone = recipientPhone || invoice.client?.phone;
      if (!targetPhone) return { error: 'No recipient phone number found for this invoice client.' };

      const merchant = invoice.merchant;
      const clientName = invoice.client?.name || 'Customer';
      const totalAmount = `₹${parseFloat(invoice.totalAmount || '0').toLocaleString('en-IN')}`;
      const dueDate = invoice.dueDate;
      const invNum = invoice.invoiceNumber;
      const payLink = `${process.env.APP_URL || 'https://kwikbill.in'}/pay/${invoice.shareToken || invNum}`;

      const messageContent =
        customMessage ||
        `Dear ${clientName},\n\nPlease find attached Invoice *${invNum}* from *${merchant?.businessName || 'Us'}* for *${totalAmount}*.\n\n📅 Due Date: ${dueDate}\n💳 Instant UPI / Online Payment Link: ${payLink}\n\nThank you for your business!`;

      const result = await sendWhatsAppMessage({
        recipientPhone: targetPhone,
        messageContent,
        recipientName: clientName,
        invoiceNumber: invNum,
        invoiceId: invoice.id,
        totalAmount: invoice.totalAmount,
        dueDate,
      });

      // Log reminder in DB
      await db.insert(reminderLogs).values({
        userId,
        invoiceId: invoice.id,
        clientId: invoice.client.id,
        channel: 'whatsapp',
        templateType: 'standard',
        messageContent,
        recipientPhone: targetPhone,
        status: result.directApiSent ? 'sent' : 'delivered',
      });

      return {
        success: true,
        directApiSent: result.directApiSent,
        deliveryStatus: result.deliveryStatus,
        whatsappUrl: result.whatsappUrl,
        invoiceNumber: invNum,
        recipientPhone: targetPhone,
        message: result.directApiSent
          ? `Invoice ${invNum} was sent via WhatsApp Meta API to ${targetPhone}!`
          : `WhatsApp message link prepared for ${targetPhone} (Click link to send if Meta API is not configured).`,
      };
    }

    case 'send_payment_reminder': {
      const { invoiceId, tone = 'standard' } = args;
      const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      if (!invoice) return { error: `Invoice #${invoiceId} not found.` };

      const targetPhone = invoice.client?.phone;
      if (!targetPhone) return { error: 'No phone number for this client.' };

      const clientName = invoice.client?.name || 'Customer';
      const outstanding = Math.max(0, parseFloat(invoice.totalAmount || '0') - parseFloat(invoice.paidAmount || '0'));
      const outstandingStr = `₹${outstanding.toLocaleString('en-IN')}`;
      const invNum = invoice.invoiceNumber;
      const payLink = `${process.env.APP_URL || 'https://kwikbill.in'}/pay/${invoice.shareToken || invNum}`;

      let msg = '';
      if (tone === 'polite') {
        msg = `Hi ${clientName}, this is a gentle reminder that invoice *${invNum}* of *${outstandingStr}* is due on ${invoice.dueDate}. Pay easily here: ${payLink}. Thank you!`;
      } else if (tone === 'urgent' || tone === 'overdue') {
        msg = `⚠️ URGENT: Invoice *${invNum}* for *${outstandingStr}* is overdue since ${invoice.dueDate}. Please clear the outstanding balance immediately via: ${payLink}`;
      } else {
        msg = `Hello ${clientName}, payment reminder for Invoice *${invNum}* totaling *${outstandingStr}* due by ${invoice.dueDate}. Settle securely: ${payLink}`;
      }

      const result = await sendWhatsAppMessage({
        recipientPhone: targetPhone,
        messageContent: msg,
        recipientName: clientName,
        invoiceNumber: invNum,
        invoiceId: invoice.id,
        totalAmount: outstanding,
        dueDate: invoice.dueDate,
      });

      await db.insert(reminderLogs).values({
        userId,
        invoiceId: invoice.id,
        clientId: invoice.client.id,
        channel: 'whatsapp',
        templateType: tone,
        messageContent: msg,
        recipientPhone: targetPhone,
        status: result.directApiSent ? 'sent' : 'delivered',
      });

      return {
        success: true,
        directApiSent: result.directApiSent,
        deliveryStatus: result.deliveryStatus,
        whatsappUrl: result.whatsappUrl,
        invoiceNumber: invNum,
        message: `Payment reminder (${tone}) sent to ${clientName} (${targetPhone})!`,
      };
    }

    default:
      throw new Error(`Unknown WhatsApp tool action: ${functionName}`);
  }
}
