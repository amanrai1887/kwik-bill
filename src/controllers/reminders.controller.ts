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
    recipientPhone, 
    sendMethod, 
    pdfUrl, 
    sendAsDocument 
  } = req.body;

  const parsedInvoiceId = parseInt(String(invoiceId), 10);
  const parsedClientId = parseInt(String(clientId), 10);

  if (isNaN(parsedInvoiceId) || isNaN(parsedClientId)) {
    throw new BadRequestError("Valid invoiceId and clientId are required.");
  }

  if (!messageContent || !messageContent.trim()) {
    throw new BadRequestError("Reminder message content cannot be empty.");
  }

  if (!recipientPhone || !recipientPhone.trim()) {
    throw new BadRequestError("Recipient WhatsApp phone number is required.");
  }

  // Verify that the invoice belongs to this merchant
  const invoice = await getInvoiceById(userId, parsedInvoiceId);
  if (!invoice) {
    throw new NotFoundError("Invoice not found or does not belong to your business account.");
  }

  const cleanPhone = normalizeIndianPhoneNumber(recipientPhone);
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
      messageContent,
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
    messageContent,
    recipientPhone: cleanPhone,
    status: deliveryStatus,
  });

  await invalidateUserCache(userId, 'reminders');

  const whatsappUrl = generateWaMeUrl(cleanPhone, messageContent);

  return ApiResponse.success(res, {
    directApiSent,
    deliveryStatus,
    log,
    whatsappUrl,
    apiResponse,
  });
});
