import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { logWhatsAppReminder, getReminderLogsByUserId } from "../db/reminders.ts";

export async function getReminderLogs(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const logs = await getReminderLogsByUserId(userId);
    res.json({ success: true, logs });
  } catch (error: any) {
    console.error("Failed to get reminder logs:", error);
    res.status(500).json({ error: error.message || "Failed to get reminder logs" });
  }
}

export async function sendReminder(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const dbUser = req.dbUser;
    const { invoiceId, clientId, templateType, templateName, recipientName, invoiceNumber, totalAmount, dueDate, messageContent, recipientPhone, sendMethod, pdfUrl, sendAsDocument } = req.body;
    
    // Clean phone number (format with 91 for Indian numbers if 10 digits)
    let cleanPhone = (recipientPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    let deliveryStatus = 'sent';
    let directApiSent = false;
    let apiResponse = null;

    // Direct background sending via Meta WhatsApp Cloud API if credentials are configured
    const whatsappToken = dbUser.whatsappApiToken?.trim() || process.env.META_WHATSAPP_TOKEN?.trim();
    const phoneNumberId = dbUser.whatsappPhoneNumberId?.trim() || process.env.META_PHONE_NUMBER_ID?.trim();

    if (sendMethod === 'direct') {
      if (!whatsappToken || !phoneNumberId) {
        return res.status(400).json({
          error: 'Meta WhatsApp Cloud API credentials (Phone Number ID and Token) are not configured in Business Settings. Please configure them in Settings or send via wa.me.',
        });
      }

      try {
        const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        const isDocument = Boolean(pdfUrl || sendAsDocument);
        const messagePayload: any = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
        };

        if (templateName || process.env.META_WHATSAPP_TEMPLATE) {
          // Compliant Meta Utility Template message structure
          messagePayload.type = 'template';
          messagePayload.template = {
            name: templateName || process.env.META_WHATSAPP_TEMPLATE || 'payment_reminder',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: recipientName || 'Customer' },
                  { type: 'text', text: invoiceNumber || String(invoiceId) },
                  { type: 'text', text: totalAmount ? `₹${totalAmount}` : 'Pending Amount' },
                  { type: 'text', text: dueDate || 'Due immediately' },
                ],
              },
            ],
          };
        } else if (isDocument && pdfUrl) {
          messagePayload.type = 'document';
          messagePayload.document = {
            link: pdfUrl,
            caption: messageContent,
            filename: `Invoice_${invoiceId}.pdf`,
          };
        } else {
          messagePayload.type = 'text';
          messagePayload.text = {
            preview_url: true,
            body: messageContent,
          };
        }

        const metaRes = await fetch(metaUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messagePayload),
        });

        const metaData = await metaRes.json();
        apiResponse = metaData;

        if (metaRes.ok && metaData.messages) {
          deliveryStatus = 'delivered';
          directApiSent = true;
        } else {
          console.warn("Meta Cloud API warning:", metaData);
          deliveryStatus = 'api_error';
        }
      } catch (apiErr: any) {
        console.error("Direct WhatsApp Cloud API request error:", apiErr);
        deliveryStatus = 'api_error';
      }
    }

    const log = await logWhatsAppReminder(userId, {
      invoiceId: parseInt(invoiceId),
      clientId: parseInt(clientId),
      templateType,
      messageContent,
      recipientPhone,
      status: deliveryStatus,
    });

    const encodedMsg = encodeURIComponent(messageContent);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

    res.json({
      success: true,
      directApiSent,
      deliveryStatus,
      log,
      whatsappUrl,
      apiResponse,
    });
  } catch (error: any) {
    console.error("Failed to process reminder:", error);
    res.status(500).json({ error: error.message || "Failed to process reminder" });
  }
}

