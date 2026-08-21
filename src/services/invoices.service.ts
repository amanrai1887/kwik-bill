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

  const itemsList = Array.isArray(data.items) ? data.items : [];
  const computedSubtotal = itemsList.reduce((acc: number, item: any) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return acc + (Number(item.amount) || (qty * rate));
  }, 0);

  const subtotalVal = data.subtotal !== undefined && Number(data.subtotal) > 0 ? Number(data.subtotal) : computedSubtotal;
  const taxRateVal = Number(data.taxRate) || 0;
  const taxAmountVal = data.taxAmount !== undefined && Number(data.taxAmount) >= 0 
    ? Number(data.taxAmount) 
    : (subtotalVal * taxRateVal) / 100;
  const discountVal = Number(data.discountAmount) || 0;
  const tdsVal = Number(data.tdsAmount) || 0;
  const computedTotal = Math.max(0, subtotalVal + taxAmountVal - discountVal - tdsVal);
  const totalAmountVal = data.totalAmount !== undefined && Number(data.totalAmount) > 0 
    ? Number(data.totalAmount) 
    : computedTotal;

  return await createInvoice(userId, {
    ...data,
    clientId,
    issueDate: data.issueDate || new Date().toISOString().split('T')[0],
    dueDate: data.dueDate || new Date().toISOString().split('T')[0],
    subtotal: subtotalVal.toFixed(2),
    taxRate: taxRateVal.toFixed(2),
    taxAmount: taxAmountVal.toFixed(2),
    tdsRate: (Number(data.tdsRate) || 0).toFixed(2),
    tdsAmount: tdsVal.toFixed(2),
    discountAmount: discountVal.toFixed(2),
    totalAmount: totalAmountVal.toFixed(2),
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
