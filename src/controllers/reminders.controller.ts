import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { logWhatsAppReminder, getReminderLogsByUserId } from "../db/reminders.ts";
import { sendWhatsAppMessage, normalizeIndianPhoneNumber, generateWaMeUrl } from "../services/whatsapp.service.ts";
import { getInvoiceById } from "../db/invoices.ts";
import { asyncHandler, ApiResponse, BadRequestError, NotFoundError } from "../utils/apiResponse.ts";
import { invalidateUserCache } from "../lib/redis.ts";

export const getReminderLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const logs = await getReminderLogsByUserId(userId);
  return ApiResponse.success(res, { logs });
});

export const sendReminder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const dbUser = req.dbUser;
  const { 
    invoiceId, 
    clientId, 
    templateType = 'standard', 
    templateName, 
    recipientName, 
    invoiceNumber, 
    totalAmount, 
    dueDate, 
    messageContent, 
    customMessage,
    recipientPhone, 
    sendMethod, 
    pdfUrl, 
    sendAsDocument 
  } = req.body;

  const parsedInvoiceId = parseInt(String(invoiceId), 10);
  if (isNaN(parsedInvoiceId) || parsedInvoiceId <= 0) {
    throw new BadRequestError("Valid invoiceId is required.");
  }

  // Verify that the invoice belongs to this merchant
  const invoice = await getInvoiceById(userId, parsedInvoiceId);
  if (!invoice) {
    throw new NotFoundError("Invoice not found or does not belong to your business account.");
  }

  const parsedClientId = clientId ? parseInt(String(clientId), 10) : invoice.clientId;
  if (isNaN(parsedClientId) || parsedClientId <= 0) {
    throw new BadRequestError("Valid clientId is required.");
  }

  const finalMessage = (messageContent || customMessage || '').trim();
  if (!finalMessage) {
    throw new BadRequestError("Reminder message content cannot be empty.");
  }

  const targetPhone = (recipientPhone || invoice.client?.phone || '').trim();
  if (!targetPhone) {
    throw new BadRequestError("Recipient WhatsApp phone number is required.");
  }

  const cleanPhone = normalizeIndianPhoneNumber(targetPhone);
  let deliveryStatus: 'delivered' | 'sent' | 'api_error' | 'logged' = 'sent';
  let directApiSent = false;
  let apiResponse = null;

  if (sendMethod === 'direct') {
    const whatsappToken = dbUser?.whatsappApiToken?.trim();
    const phoneNumberId = dbUser?.whatsappPhoneNumberId?.trim();

    if (!whatsappToken || !phoneNumberId) {
      throw new BadRequestError(
        'Meta WhatsApp Cloud API credentials (Phone Number ID & Token) are not configured. Please configure them in Settings or send via wa.me.'
      );
    }

    const sendResult = await sendWhatsAppMessage({
      recipientPhone: cleanPhone,
      messageContent: finalMessage,
      recipientName,
      invoiceNumber: invoiceNumber || invoice.invoiceNumber,
      invoiceId: parsedInvoiceId,
      totalAmount: totalAmount || invoice.totalAmount,
      dueDate: dueDate || invoice.dueDate,
      templateName,
      pdfUrl,
      sendAsDocument,
      merchantToken: whatsappToken,
      merchantPhoneNumberId: phoneNumberId,
    });

    deliveryStatus = sendResult.deliveryStatus;
    directApiSent = sendResult.directApiSent;
    apiResponse = sendResult.apiResponse;
  }

  const log = await logWhatsAppReminder(userId, {
    invoiceId: parsedInvoiceId,
    clientId: parsedClientId,
    templateType,
    messageContent: finalMessage,
    recipientPhone: cleanPhone,
    status: deliveryStatus,
  });

  await invalidateUserCache(userId, 'reminders');

  const whatsappUrl = generateWaMeUrl(cleanPhone, finalMessage);

  return ApiResponse.success(res, {
    directApiSent,
    deliveryStatus,
    log,
    whatsappUrl,
    apiResponse,
  });
});
