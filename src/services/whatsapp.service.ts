import { config } from '../config/app.config.ts';

export interface WhatsAppSendParams {
  recipientPhone: string;
  messageContent: string;
  recipientName?: string;
  invoiceNumber?: string;
  invoiceId?: number | string;
  totalAmount?: string | number;
  dueDate?: string;
  templateName?: string;
  pdfUrl?: string;
  sendAsDocument?: boolean;
  merchantToken?: string;
  merchantPhoneNumberId?: string;
}

export interface WhatsAppSendResult {
  deliveryStatus: 'delivered' | 'sent' | 'api_error' | 'logged';
  directApiSent: boolean;
  whatsappUrl: string;
  apiResponse?: any;
}

export function normalizeIndianPhoneNumber(phone?: string): string {
  let clean = (phone || '').replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}

export function generateWaMeUrl(cleanPhone: string, messageContent: string): string {
  const encodedMsg = encodeURIComponent(messageContent);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export async function sendWhatsAppMessage(params: WhatsAppSendParams): Promise<WhatsAppSendResult> {
  const cleanPhone = normalizeIndianPhoneNumber(params.recipientPhone);
  const whatsappUrl = generateWaMeUrl(cleanPhone, params.messageContent);

  const whatsappToken = params.merchantToken?.trim() || config.whatsapp.token;
  const phoneNumberId = params.merchantPhoneNumberId?.trim() || config.whatsapp.phoneNumberId;

  if (!whatsappToken || !phoneNumberId) {
    return {
      deliveryStatus: 'sent',
      directApiSent: false,
      whatsappUrl,
    };
  }

  try {
    const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const isDocument = Boolean(params.pdfUrl || params.sendAsDocument);

    let messagePayload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
    };

    if (params.templateName || config.whatsapp.defaultTemplate) {
      messagePayload.type = 'template';
      messagePayload.template = {
        name: params.templateName || config.whatsapp.defaultTemplate,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: params.recipientName || 'Customer' },
              { type: 'text', text: params.invoiceNumber || String(params.invoiceId || '') },
              { type: 'text', text: params.totalAmount ? `₹${params.totalAmount}` : 'Pending Amount' },
              { type: 'text', text: params.dueDate || 'Due immediately' },
            ],
          },
        ],
      };
    } else if (isDocument && params.pdfUrl) {
      messagePayload.type = 'document';
      messagePayload.document = {
        link: params.pdfUrl,
        caption: params.messageContent,
        filename: `Invoice_${params.invoiceNumber || params.invoiceId}.pdf`,
      };
    } else {
      messagePayload.type = 'text';
      messagePayload.text = {
        preview_url: true,
        body: params.messageContent,
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

    if (metaRes.ok && metaData.messages) {
      return {
        deliveryStatus: 'delivered',
        directApiSent: true,
        whatsappUrl,
        apiResponse: metaData,
      };
    } else {
      console.warn('[WhatsApp Service] Meta Cloud API warning:', metaData);
      return {
        deliveryStatus: 'api_error',
        directApiSent: false,
        whatsappUrl,
        apiResponse: metaData,
      };
    }
  } catch (error: any) {
    console.error('[WhatsApp Service] Request error:', error);
    return {
      deliveryStatus: 'api_error',
      directApiSent: false,
      whatsappUrl,
      apiResponse: { error: error.message },
    };
  }
}
