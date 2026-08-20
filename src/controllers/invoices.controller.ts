import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { 
  getInvoicesByUserId, 
  getInvoiceById, 
  createInvoice, 
  updateInvoiceStatus, 
  deleteInvoice 
} from "../db/invoices.ts";

export async function getInvoices(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const { page, limit, status, search } = req.query;

    const pageNum = page ? parseInt(page as string, 10) : undefined;
    const limitNum = limit ? parseInt(limit as string, 10) : undefined;
    const offset = pageNum && limitNum ? (pageNum - 1) * limitNum : undefined;

    const invoicesList = await getInvoicesByUserId(userId, {
      limit: limitNum,
      offset,
      status: status as string,
      search: search as string,
    });

    res.json({ 
      success: true, 
      invoices: invoicesList,
      pagination: limitNum ? { page: pageNum || 1, limit: limitNum, count: invoicesList.length } : undefined
    });
  } catch (error: any) {
    console.error("Failed to get invoices:", error);
    res.status(500).json({ error: error.message || "Failed to get invoices" });
  }
}

export async function getInvoice(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const invoiceId = parseInt(req.params.id);
    const invoice = await getInvoiceById(userId, invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Failed to get invoice:", error);
    res.status(500).json({ error: error.message || "Failed to get invoice" });
  }
}

export async function getPublicInvoice(req: any, res: Response) {
  try {
    const { getInvoiceByNumberPublic } = await import('../db/invoices.ts');
    const invoiceNumber = req.params.invoiceNumber;
    const invoice = await getInvoiceByNumberPublic(invoiceNumber);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found or expired" });
    }
    res.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Failed to get public invoice:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve invoice" });
  }
}


export async function postInvoice(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const created = await createInvoice(userId, req.body);
    res.json({ success: true, invoice: created });
  } catch (error: any) {
    console.error("Failed to create invoice:", error);
    res.status(500).json({ error: error.message || "Failed to create invoice" });
  }
}

export async function putInvoiceStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const invoiceId = parseInt(req.params.id);
    const { status, paidAmount } = req.body;
    const updated = await updateInvoiceStatus(userId, invoiceId, status, paidAmount);
    res.json({ success: true, invoice: updated });
  } catch (error: any) {
    console.error("Failed to update status:", error);
    res.status(500).json({ error: error.message || "Failed to update status" });
  }
}

export async function removeInvoice(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const invoiceId = parseInt(req.params.id);
    await deleteInvoice(userId, invoiceId);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete invoice:", error);
    res.status(500).json({ error: error.message || "Failed to delete invoice" });
  }
}
