import { recordPaymentService, getPaymentsService } from '../payments.service.ts';
import { getInvoiceByIdService } from '../invoices.service.ts';

export const paymentToolDeclarations = [
  {
    name: 'record_payment',
    description: 'Record an incoming payment (UPI, Bank Transfer, Cash, Cheque) against an invoice and update invoice status.',
    parameters: {
      type: 'OBJECT',
      properties: {
        invoiceId: {
          type: 'INTEGER',
          description: 'Database ID of the invoice being paid (Required)',
        },
        amount: {
          type: 'NUMBER',
          description: 'Payment amount received in INR (Required)',
        },
        paymentMethod: {
          type: 'STRING',
          description: "Payment method: 'upi', 'bank_transfer', 'cash', 'cheque' (default 'upi')",
        },
        paymentDate: {
          type: 'STRING',
          description: 'Date of payment in YYYY-MM-DD format (defaults to today)',
        },
        referenceNumber: {
          type: 'STRING',
          description: 'Transaction reference ID / UTR / Cheque number',
        },
        notes: {
          type: 'STRING',
          description: 'Notes on the payment',
        },
        confirmAction: {
          type: 'BOOLEAN',
          description: 'Set to true ONLY if user explicitly confirmed recording the payment.',
        },
      },
      required: ['invoiceId', 'amount'],
    },
  },
  {
    name: 'get_payments_history',
    description: 'List recent payment transactions and settlement history across invoices.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: {
          type: 'INTEGER',
          description: 'Max number of payments to retrieve (default 10)',
        },
      },
    },
  },
];

export async function executePaymentTool(userId: number, functionName: string, args: any) {
  switch (functionName) {
    case 'record_payment': {
      const {
        invoiceId,
        amount,
        paymentMethod = 'upi',
        paymentDate,
        referenceNumber = '',
        notes = '',
        confirmAction = false,
      } = args;

      const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      if (!invoice) return { error: `Invoice #${invoiceId} not found.` };

      const numAmount = Number(amount);
      const totalAmount = parseFloat(invoice.totalAmount || '0');
      const alreadyPaid = parseFloat(invoice.paidAmount || '0');
      const remainingBalance = Math.max(0, totalAmount - alreadyPaid);

      if (!confirmAction) {
        return {
          requiresConfirmation: true,
          actionType: 'record_payment',
          preview: {
            invoiceId,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.client?.name || 'Customer',
            paymentAmount: `₹${numAmount.toLocaleString('en-IN')}`,
            invoiceTotal: `₹${totalAmount.toLocaleString('en-IN')}`,
            currentPaid: `₹${alreadyPaid.toLocaleString('en-IN')}`,
            remainingAfterPayment: `₹${Math.max(0, remainingBalance - numAmount).toLocaleString('en-IN')}`,
            paymentMethod,
            referenceNumber,
          },
          confirmationMessage: `Please confirm recording a payment of **₹${numAmount.toLocaleString('en-IN')}** via **${paymentMethod.toUpperCase()}** against invoice **${invoice.invoiceNumber}** (${invoice.client?.name}).`,
          payload: {
            invoiceId,
            amount: numAmount,
            paymentMethod,
            paymentDate: paymentDate || new Date().toISOString().split('T')[0],
            referenceNumber,
            notes,
            confirmAction: true,
          },
        };
      }

      const recorded = await recordPaymentService(userId, {
        invoiceId: Number(invoiceId),
        amount: numAmount,
        paymentMethod,
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
        referenceNumber,
        notes,
      });

      // Refetch updated invoice
      const updatedInvoice = await getInvoiceByIdService(userId, Number(invoiceId));

      return {
        success: true,
        paymentId: recorded.id,
        invoiceNumber: invoice.invoiceNumber,
        amountRecorded: `₹${numAmount.toLocaleString('en-IN')}`,
        newInvoiceStatus: updatedInvoice.status,
        totalPaidOnInvoice: `₹${parseFloat(updatedInvoice.paidAmount || '0').toLocaleString('en-IN')}`,
        message: `Payment of ₹${numAmount.toLocaleString('en-IN')} successfully recorded for invoice ${invoice.invoiceNumber}. New status is '${updatedInvoice.status}'.`,
      };
    }

    case 'get_payments_history': {
      const { limit = 10 } = args;
      const paymentsList = await getPaymentsService(userId);
      return {
        count: paymentsList.length,
        payments: paymentsList.slice(0, limit).map((p: any) => ({
          id: p.id,
          invoiceId: p.invoiceId,
          amount: `₹${parseFloat(p.amount || '0').toLocaleString('en-IN')}`,
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          referenceNumber: p.referenceNumber,
        })),
      };
    }

    default:
      throw new Error(`Unknown payment tool action: ${functionName}`);
  }
}
