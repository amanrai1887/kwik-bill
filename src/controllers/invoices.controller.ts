import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { 
  getInvoicesService, 
  getInvoiceByIdService, 
  getPublicInvoiceService, 
  createInvoiceService, 
  updateInvoiceStatusService, 
  cancelInvoiceService 
} from "../services/invoices.service.ts";
import { asyncHandler, ApiResponse, parsePositiveInt } from "../utils/apiResponse.ts";
import { invalidateUserCache, invalidatePattern } from "../lib/redis.ts";

export const getInvoices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const { page, limit, status, search } = req.query;

  const pageNum = page ? parseInt(page as string, 10) : undefined;
  const limitNum = limit ? parseInt(limit as string, 10) : undefined;
  const offset = pageNum && limitNum ? (pageNum - 1) * limitNum : undefined;

  const invoicesList = await getInvoicesService(userId, {
    limit: limitNum,
    offset,
    status: status as string,
    search: search as string,
  });

  return res.json({ 
    success: true, 
    invoices: invoicesList,
    pagination: limitNum ? { page: pageNum || 1, limit: limitNum, count: invoicesList.length } : undefined
  });
});

export const getInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const invoiceId = parsePositiveInt(req.params.id, 'invoice ID');
  const invoice = await getInvoiceByIdService(userId, invoiceId);
  return ApiResponse.success(res, { invoice });
});

export const getPublicInvoice = asyncHandler(async (req: any, res: Response) => {
  const invoiceNumber = req.params.invoiceNumber;
  const invoice = await getPublicInvoiceService(invoiceNumber);
  return ApiResponse.success(res, { invoice });
});

export const postInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const created = await createInvoiceService(userId, req.body);
  await Promise.all([
    invalidateUserCache(userId, 'invoices', 'analytics', 'clients', 'payments'),
    invalidatePattern('cache:public:invoice-public*'),
  ]);
  return ApiResponse.success(res, { invoice: created }, 201, "Invoice created successfully");
});

export const putInvoiceStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const invoiceId = parsePositiveInt(req.params.id, 'invoice ID');
  const { status, paidAmount } = req.body;
  const updated = await updateInvoiceStatusService(userId, invoiceId, status, paidAmount);
  await Promise.all([
    invalidateUserCache(userId, 'invoices', 'analytics', 'clients', 'payments'),
    invalidatePattern('cache:public:invoice-public*'),
  ]);
  return ApiResponse.success(res, { invoice: updated }, 200, "Invoice status updated");
});

export const removeInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const invoiceId = parsePositiveInt(req.params.id, 'invoice ID');
  const reason = req.body?.reason;
  await cancelInvoiceService(userId, invoiceId, reason);
  await Promise.all([
    invalidateUserCache(userId, 'invoices', 'analytics', 'clients', 'payments'),
    invalidatePattern('cache:public:invoice-public*'),
  ]);
  return ApiResponse.success(res, { message: "Invoice cancelled successfully." });
});
