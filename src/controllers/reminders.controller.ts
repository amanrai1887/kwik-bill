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
    const { invoiceId, clientId, templateType, messageContent, recipientPhone, sendMethod, pdfUrl, sendAsDocument } = req.body;
    
    // Clean phone number (format with 91 for Indian numbers if 10 digits)
    let cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    let deliveryStatus = 'sent';
    let directApiSent = false;
    let apiResponse = null;

    // Direct background sending via Meta WhatsApp Cloud API or Generic Gateway if credentials are configured
    const whatsappToken = dbUser.whatsappApiToken || process.env.META_WHATSAPP_TOKEN;
    const phoneNumberId = dbUser.whatsappPhoneNumberId || process.env.META_PHONE_NUMBER_ID;

    if (sendMethod === 'direct' && whatsappToken && phoneNumberId) {
      try {
        const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        const isDocument = Boolean(pdfUrl || sendAsDocument);
        const messagePayload: any = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
        };

        if (isDocument && pdfUrl) {
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

