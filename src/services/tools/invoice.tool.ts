import { 
  getInvoicesService, 
  getInvoiceByIdService, 
  getPublicInvoiceService,
  createInvoiceService, 
  updateInvoiceStatusService, 
  cancelInvoiceService 
} from '../invoices.service.ts';
import { getClientsService, createClientService } from '../clients.service.ts';
import { db } from '../../db/index.ts';
import { invoices } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';

export const invoiceToolDeclarations = [
  {
    name: 'query_invoices',
    description: 'Query and filter invoices from PostgreSQL by status, client name, search query, or relative date ranges like last month or overdue.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: {
          type: 'STRING',
          description: "Filter status: 'pending', 'paid', 'overdue', 'partial', 'cancelled', or 'all'",
        },
        search: {
          type: 'STRING',
          description: 'Search string for invoice number, client name, or company',
        },
        clientName: {
          type: 'STRING',
          description: 'Filter specifically by customer or client name',
        },
        dateRange: {
          type: 'STRING',
          description: "Relative date range: 'last_month', 'this_month', 'this_year', or 'overdue'",
        },
        limit: {
          type: 'INTEGER',
          description: 'Max number of invoices to return (default 10)',
        },
      },
    },
  },
  {
    name: 'get_invoice_detail',
    description: 'Get full details of a specific invoice including client info, line items, taxes, and payment history by invoice ID or invoice number.',
    parameters: {
      type: 'OBJECT',
      properties: {
        invoiceId: {
          type: 'INTEGER',
          description: 'Numeric database ID of the invoice',
        },
        invoiceNumber: {
          type: 'STRING',
          description: 'Invoice number string (e.g. INV-2026-001)',
        },
      },
    },
  },
  {
    name: 'create_invoice',
    description: 'Draft or create a new invoice for a client. If the client name does not exist, it can automatically search or create it.',
    parameters: {
      type: 'OBJECT',
      properties: {
        clientName: {
          type: 'STRING',
          description: 'The party/customer name for the invoice (e.g. ABC Traders)',
        },
        clientId: {
          type: 'INTEGER',
          description: 'Existing client ID if known',
        },
        clientPhone: {
          type: 'STRING',
          description: 'Client WhatsApp/Phone number if creating a new client on the fly',
        },
        items: {
          type: 'ARRAY',
          description: 'Array of line items with description, quantity, rate, amount',
          items: {
            type: 'OBJECT',
            properties: {
              description: { type: 'STRING' },
              quantity: { type: 'NUMBER' },
              rate: { type: 'NUMBER' },
              amount: { type: 'NUMBER' },
              hsnCode: { type: 'STRING' },
            },
            required: ['description', 'rate'],
          },
        },
        subtotal: {
          type: 'NUMBER',
          description: 'Subtotal amount before taxes (if no items array specified)',
        },
        taxRate: {
          type: 'NUMBER',
          description: 'GST tax percentage (e.g. 18 for 18% GST). Defaults to 18 if not specified.',
        },
        discountAmount: {
          type: 'NUMBER',
          description: 'Discount amount in INR',
        },
        tdsRate: {
          type: 'NUMBER',
          description: 'TDS rate percentage (e.g. 1, 2, 10)',
        },
        dueDate: {
          type: 'STRING',
          description: 'Due date in YYYY-MM-DD format',
        },
        issueDate: {
          type: 'STRING',
          description: 'Issue date in YYYY-MM-DD format',
        },
        vehicleNumber: {
          type: 'STRING',
          description: 'Transport vehicle registration number (e.g. MH-04-GP-8842)',
        },
        lrNumber: {
          type: 'STRING',
          description: 'Lorry receipt / Bilty number (e.g. LR-994201)',
        },
        routeSource: {
          type: 'STRING',
          description: 'Origin / departure location (e.g. JNPT Navi Mumbai)',
        },
        routeDestination: {
          type: 'STRING',
          description: 'Destination location (e.g. Ahmedabad, Gujarat)',
        },
        ewayBillNumber: {
          type: 'STRING',
          description: 'Government E-Way bill number',
        },
        placeOfSupply: {
          type: 'STRING',
          description: '2-digit state code or state name for GST Place of Supply',
        },
        notes: {
          type: 'STRING',
          description: 'Customer notes or remarks',
        },
        terms: {
          type: 'STRING',
          description: 'Payment terms & conditions',
        },
        confirmAction: {
          type: 'BOOLEAN',
          description: 'Set to true ONLY when user has confirmed invoice creation approval card.',
        },
      },
      required: ['clientName'],
    },
  },
  {
    name: 'update_invoice_tax_and_totals',
    description: 'Update the tax rate (GST %), discount, or line items on an existing invoice and recalculate totals.',
    parameters: {
      type: 'OBJECT',
      properties: {
        invoiceId: {
          type: 'INTEGER',
          description: 'Database ID of the invoice to update',
        },
        taxRate: {
          type: 'NUMBER',
          description: 'New GST rate percentage (e.g. 18 for 18% GST)',
        },
        discountAmount: {
          type: 'NUMBER',
          description: 'New discount amount',
        },
        tdsRate: {
          type: 'NUMBER',
          description: 'TDS rate percentage if applicable',
        },
      },
      required: ['invoiceId'],
    },
  },
  {
    name: 'update_invoice_status',
    description: "Update the status of an invoice to 'paid', 'pending', 'overdue', or 'partial'.",
    parameters: {
      type: 'OBJECT',
      properties: {
        invoiceId: {
          type: 'INTEGER',
          description: 'Database ID of the invoice',
        },
        status: {
          type: 'STRING',
          description: "New status: 'paid', 'pending', 'overdue', 'partial'",
        },
        paidAmount: {
          type: 'STRING',
          description: 'Total amount paid so far',
        },
      },
      required: ['invoiceId', 'status'],
    },
  },
  {
    name: 'cancel_invoice',
    description: 'Cancel an invoice with a reason (GST-compliant soft delete).',
    parameters: {
      type: 'OBJECT',
      properties: {
        invoiceId: {
          type: 'INTEGER',
          description: 'Database ID of the invoice to cancel',
        },
        reason: {
          type: 'STRING',
          description: 'Reason for cancellation',
        },
      },
      required: ['invoiceId'],
    },
  },
];

export async function executeInvoiceTool(userId: number, functionName: string, args: any) {
  switch (functionName) {
    case 'query_invoices': {
      const { status, search, clientName, dateRange, limit = 10 } = args;
      const invoicesList = await getInvoicesService(userId, {
        status: status && status !== 'all' ? status : undefined,
        search: search || clientName || undefined,
        limit: Math.min(50, limit),
      });

      let filtered = invoicesList;

      // Filter by relative date range if specified
      if (dateRange) {
        const now = new Date();
        if (dateRange === 'last_month') {
          const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          const startStr = firstDayLastMonth.toISOString().split('T')[0];
          const endStr = lastDayLastMonth.toISOString().split('T')[0];

          filtered = filtered.filter((inv: any) => {
            const date = inv.issueDate || inv.createdAt;
            return date && date >= startStr && date <= endStr;
          });
        } else if (dateRange === 'this_month') {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          filtered = filtered.filter((inv: any) => inv.issueDate >= firstDay);
        } else if (dateRange === 'overdue') {
          const todayStr = now.toISOString().split('T')[0];
          filtered = filtered.filter((inv: any) => inv.status !== 'paid' && inv.dueDate < todayStr);
        }
      }

      const totalAmount = filtered.reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || '0'), 0);
      const totalPending = filtered.reduce((sum: number, inv: any) => {
        if (inv.status === 'paid') return sum;
        const total = parseFloat(inv.totalAmount || '0');
        const paid = parseFloat(inv.paidAmount || '0');
        return sum + Math.max(0, total - paid);
      }, 0);

      return {
        count: filtered.length,
        totalInvoiced: `₹${totalAmount.toLocaleString('en-IN')}`,
        totalPending: `₹${totalPending.toLocaleString('en-IN')}`,
        invoices: filtered.slice(0, 15).map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientName: inv.client?.name || inv.client?.companyName || 'Unknown Client',
          clientPhone: inv.client?.phone || '',
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          status: inv.status,
          totalAmount: `₹${parseFloat(inv.totalAmount || '0').toLocaleString('en-IN')}`,
          paidAmount: `₹${parseFloat(inv.paidAmount || '0').toLocaleString('en-IN')}`,
          shareToken: inv.shareToken,
        })),
      };
    }

    case 'get_invoice_detail': {
      const { invoiceId, invoiceNumber } = args;
      let invoice: any = null;
      if (invoiceId) {
        invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      } else if (invoiceNumber) {
        invoice = await getPublicInvoiceService(invoiceNumber);
      }

      if (!invoice) {
        return { error: 'Invoice not found.' };
      }

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        client: {
          id: invoice.client?.id,
          name: invoice.client?.name,
          phone: invoice.client?.phone,
          companyName: invoice.client?.companyName,
          gstin: invoice.client?.gstin,
        },
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        subtotal: `₹${parseFloat(invoice.subtotal || '0').toLocaleString('en-IN')}`,
        taxRate: `${invoice.taxRate}%`,
        taxAmount: `₹${parseFloat(invoice.taxAmount || '0').toLocaleString('en-IN')}`,
        discountAmount: `₹${parseFloat(invoice.discountAmount || '0').toLocaleString('en-IN')}`,
        totalAmount: `₹${parseFloat(invoice.totalAmount || '0').toLocaleString('en-IN')}`,
        paidAmount: `₹${parseFloat(invoice.paidAmount || '0').toLocaleString('en-IN')}`,
        items: invoice.items,
        notes: invoice.notes,
        terms: invoice.terms,
        shareToken: invoice.shareToken,
        payments: invoice.payments || [],
      };
    }

    case 'create_invoice': {
      const {
        clientName,
        clientId,
        clientPhone,
        items,
        subtotal,
        taxRate = 18,
        discountAmount = 0,
        tdsRate = 0,
        dueDate,
        issueDate,
        vehicleNumber,
        lrNumber,
        routeSource,
        routeDestination,
        ewayBillNumber,
        placeOfSupply,
        notes,
        terms,
        confirmAction = false,
      } = args;

      // 1. Resolve merchant details for defaults
      const { users } = await import('../../db/schema.ts');
      const { db } = await import('../../db/index.ts');
      const { eq } = await import('drizzle-orm');
      const merchantRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const merchant = merchantRows[0] || {};

      // 2. Resolve client
      let resolvedClientId = clientId;
      let resolvedClientName = clientName;
      let matchedClient: any = null;

      if (!resolvedClientId) {
        const existingClients = await getClientsService(userId);
        matchedClient = existingClients.find(
          (c: any) =>
            c.name.toLowerCase().includes(clientName.toLowerCase()) ||
            (c.companyName && c.companyName.toLowerCase().includes(clientName.toLowerCase()))
        );

        if (matchedClient) {
          resolvedClientId = matchedClient.id;
          resolvedClientName = matchedClient.name;
        } else if (confirmAction) {
          // Auto create client if confirmed
          const newClient = await createClientService(userId, {
            name: clientName,
            phone: clientPhone || '9999999999',
            companyName: clientName,
          });
          resolvedClientId = newClient.id;
          resolvedClientName = newClient.name;
          matchedClient = newClient;
        }
      }

      // Compute financial numbers
      let computedItems = items;
      if (!computedItems || computedItems.length === 0) {
        const baseAmount = Number(subtotal) || 50000;
        computedItems = [
          {
            description: routeSource && routeDestination
              ? `Freight Transportation: ${routeSource} → ${routeDestination}`
              : `Professional Services for ${clientName}`,
            quantity: 1,
            rate: baseAmount,
            amount: baseAmount,
            hsnCode: routeSource ? '9965' : '9983',
            uqc: routeSource ? 'TRIP' : 'NOS',
          },
        ];
      }

      const calcSubtotal = computedItems.reduce((acc: number, item: any) => acc + (Number(item.amount) || Number(item.quantity || 1) * Number(item.rate || 0)), 0);
      const calcTaxAmount = (calcSubtotal * Number(taxRate)) / 100;
      const calcTdsAmount = (calcSubtotal * Number(tdsRate)) / 100;
      const calcTotal = Math.max(0, calcSubtotal + calcTaxAmount - Number(discountAmount) - calcTdsAmount);

      const now = new Date();
      const todayStr = issueDate || now.toISOString().split('T')[0];
      const dueStr = dueDate || new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Auto generate next invoice sequence number
      const existingInvoices = await getInvoicesService(userId, { limit: 1 });
      const nextSeq = existingInvoices.length > 0 ? (existingInvoices[0].id + 101) : 101;
      const invoiceNumber = `INV-${now.getFullYear()}-${String(nextSeq).padStart(3, '0')}`;

      const resolvedPlaceOfSupply = placeOfSupply || matchedClient?.gstin?.substring(0, 2) || merchant?.gstin?.substring(0, 2) || '27';

      // If user has NOT confirmed, return confirmation requirement payload
      if (!confirmAction) {
        return {
          requiresConfirmation: true,
          actionType: 'create_invoice',
          preview: {
            clientName: resolvedClientName,
            clientId: resolvedClientId,
            invoiceNumber,
            issueDate: todayStr,
            dueDate: dueStr,
            items: computedItems,
            vehicleNumber,
            lrNumber,
            routeSource,
            routeDestination,
            ewayBillNumber,
            placeOfSupply: resolvedPlaceOfSupply,
            subtotal: `₹${calcSubtotal.toLocaleString('en-IN')}`,
            taxRate: `${taxRate}%`,
            taxAmount: `₹${calcTaxAmount.toLocaleString('en-IN')}`,
            discountAmount: `₹${Number(discountAmount).toLocaleString('en-IN')}`,
            tdsAmount: `₹${calcTdsAmount.toLocaleString('en-IN')}`,
            totalAmount: `₹${calcTotal.toLocaleString('en-IN')}`,
          },
          confirmationMessage: `Please confirm creating GST invoice **${invoiceNumber}** for **${resolvedClientName}** totaling **₹${calcTotal.toLocaleString('en-IN')}** (Subtotal: ₹${calcSubtotal.toLocaleString('en-IN')} + ${taxRate}% GST: ₹${calcTaxAmount.toLocaleString('en-IN')}).`,
          payload: {
            clientName: resolvedClientName,
            clientId: resolvedClientId,
            clientPhone: clientPhone || matchedClient?.phone || '9999999999',
            items: computedItems,
            subtotal: calcSubtotal,
            taxRate,
            discountAmount,
            tdsRate,
            dueDate: dueStr,
            issueDate: todayStr,
            vehicleNumber,
            lrNumber,
            routeSource,
            routeDestination,
            ewayBillNumber,
            placeOfSupply: resolvedPlaceOfSupply,
            notes: notes || 'Thank you for your business!',
            terms: terms || 'Payment due within 15 days of invoice date.',
            confirmAction: true,
          },
        };
      }

      // Actually create invoice in DB with full rich system fields
      const created = await createInvoiceService(userId, {
        clientId: resolvedClientId,
        invoiceNumber,
        issueDate: todayStr,
        dueDate: dueStr,
        items: computedItems,
        subtotal: calcSubtotal.toFixed(2),
        taxRate: Number(taxRate).toFixed(2),
        taxAmount: calcTaxAmount.toFixed(2),
        tdsRate: Number(tdsRate).toFixed(2),
        tdsAmount: calcTdsAmount.toFixed(2),
        discountAmount: Number(discountAmount).toFixed(2),
        totalAmount: calcTotal.toFixed(2),
        vehicleNumber: vehicleNumber || null,
        lrNumber: lrNumber || null,
        routeSource: routeSource || null,
        routeDestination: routeDestination || null,
        ewayBillNumber: ewayBillNumber || null,
        placeOfSupply: resolvedPlaceOfSupply,
        notes: notes || 'Thank you for your business!',
        terms: terms || 'Payment due within 15 days of invoice date.',
      });

      return {
        success: true,
        invoiceId: created.id,
        invoiceNumber: created.invoiceNumber,
        clientName: resolvedClientName,
        totalAmount: `₹${calcTotal.toLocaleString('en-IN')}`,
        subtotal: `₹${calcSubtotal.toLocaleString('en-IN')}`,
        taxAmount: `₹${calcTaxAmount.toLocaleString('en-IN')}`,
        taxRate: `${taxRate}%`,
        status: created.status,
        dueDate: created.dueDate,
        shareToken: created.shareToken,
        message: `Successfully created invoice ${created.invoiceNumber} for ${resolvedClientName} of ₹${calcTotal.toLocaleString('en-IN')}.`,
      };
    }

    case 'update_invoice_tax_and_totals': {
      const { invoiceId, taxRate, discountAmount, tdsRate } = args;
      const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      if (!invoice) return { error: 'Invoice not found.' };

      const subtotal = parseFloat(invoice.subtotal || '0');
      const newTaxRate = taxRate !== undefined ? Number(taxRate) : parseFloat(invoice.taxRate || '0');
      const newTaxAmount = (subtotal * newTaxRate) / 100;
      const newDiscount = discountAmount !== undefined ? Number(discountAmount) : parseFloat(invoice.discountAmount || '0');
      const newTdsRate = tdsRate !== undefined ? Number(tdsRate) : parseFloat(invoice.tdsRate || '0');
      const newTdsAmount = (subtotal * newTdsRate) / 100;
      const newTotal = Math.max(0, subtotal + newTaxAmount - newDiscount - newTdsAmount);

      const updated = await db
        .update(invoices)
        .set({
          taxRate: newTaxRate.toFixed(2),
          taxAmount: newTaxAmount.toFixed(2),
          discountAmount: newDiscount.toFixed(2),
          tdsRate: newTdsRate.toFixed(2),
          tdsAmount: newTdsAmount.toFixed(2),
          totalAmount: newTotal.toFixed(2),
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, Number(invoiceId)), eq(invoices.userId, userId)))
        .returning();

      const resRow = updated[0];
      return {
        success: true,
        invoiceId: resRow.id,
        invoiceNumber: resRow.invoiceNumber,
        subtotal: `₹${subtotal.toLocaleString('en-IN')}`,
        taxRate: `${newTaxRate}%`,
        taxAmount: `₹${newTaxAmount.toLocaleString('en-IN')}`,
        totalAmount: `₹${newTotal.toLocaleString('en-IN')}`,
        message: `Updated invoice ${resRow.invoiceNumber}: ${newTaxRate}% GST (₹${newTaxAmount.toLocaleString('en-IN')}) added. New Total is ₹${newTotal.toLocaleString('en-IN')}.`,
      };
    }

    case 'update_invoice_status': {
      const { invoiceId, status, paidAmount } = args;
      const updated = await updateInvoiceStatusService(userId, Number(invoiceId), status, paidAmount);
      return {
        success: true,
        invoiceId: updated.id,
        invoiceNumber: updated.invoiceNumber,
        status: updated.status,
        paidAmount: `₹${parseFloat(updated.paidAmount || '0').toLocaleString('en-IN')}`,
        message: `Invoice ${updated.invoiceNumber} status updated to '${updated.status}'.`,
      };
    }

    case 'cancel_invoice': {
      const { invoiceId, reason } = args;
      const cancelled = await cancelInvoiceService(userId, Number(invoiceId), reason);
      return {
        success: true,
        invoiceId: cancelled.id,
        invoiceNumber: cancelled.invoiceNumber,
        status: 'cancelled',
        message: `Invoice ${cancelled.invoiceNumber} has been cancelled (GST compliant table entry preserved).`,
      };
    }

    default:
      throw new Error(`Unknown invoice tool action: ${functionName}`);
  }
}
