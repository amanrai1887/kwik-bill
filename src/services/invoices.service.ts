import { 
  getInvoicesByUserId, 
  getInvoiceById, 
  getInvoiceByNumberPublic, 
  createInvoice, 
  updateInvoiceStatus, 
  deleteInvoice,
  InvoiceQueryOptions 
} from "../db/invoices.ts";
import { clients } from "../db/schema.ts";
import { db } from "../db/index.ts";
import { eq, and } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "../utils/apiResponse.ts";

export async function getInvoicesService(userId: number, options: InvoiceQueryOptions) {
  return await getInvoicesByUserId(userId, options);
}

export async function getInvoiceByIdService(userId: number, invoiceId: number) {
  const invoice = await getInvoiceById(userId, invoiceId);
  if (!invoice) {
    throw new NotFoundError("Invoice not found or does not belong to your account.");
  }
  return invoice;
}

export async function getPublicInvoiceService(invoiceNumberOrToken: string) {
  if (!invoiceNumberOrToken || !invoiceNumberOrToken.trim()) {
    throw new BadRequestError("Invoice identifier is required.");
  }
  const invoice = await getInvoiceByNumberPublic(invoiceNumberOrToken.trim());
  if (!invoice) {
    throw new NotFoundError("Invoice not found or public link has expired.");
  }
  return invoice;
}

export async function createInvoiceService(userId: number, data: any) {
  const clientId = Number(data.clientId);
  if (isNaN(clientId) || clientId <= 0) {
    throw new BadRequestError("Valid clientId is required to generate an invoice.");
  }

  // Verify client belongs to this merchant
  const clientExists = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
    .limit(1);

  if (clientExists.length === 0) {
    throw new NotFoundError("Client not found in your client directory.");
  }

  if (!data.invoiceNumber || !data.invoiceNumber.trim()) {
    throw new BadRequestError("Invoice number is required.");
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new BadRequestError("At least one line item is required on the invoice.");
  }

  return await createInvoice(userId, {
    ...data,
    clientId,
    issueDate: data.issueDate || new Date().toISOString().split('T')[0],
    dueDate: data.dueDate || new Date().toISOString().split('T')[0],
    subtotal: String(data.subtotal || '0.00'),
    totalAmount: String(data.totalAmount || '0.00'),
  });
}

export async function updateInvoiceStatusService(userId: number, invoiceId: number, status: string, paidAmount?: string) {
  const existing = await getInvoiceById(userId, invoiceId);
  if (!existing) {
    throw new NotFoundError("Invoice not found.");
  }

  return await updateInvoiceStatus(userId, invoiceId, status, paidAmount);
}

export async function cancelInvoiceService(userId: number, invoiceId: number, reason?: string) {
  const existing = await getInvoiceById(userId, invoiceId);
  if (!existing) {
    throw new NotFoundError("Invoice not found.");
  }

  return await deleteInvoice(userId, invoiceId, reason);
}
