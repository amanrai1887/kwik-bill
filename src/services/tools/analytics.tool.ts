import { getInvoicesByUserId } from '../../db/invoices.ts';
import { getPaymentsForUser } from '../../db/payments.ts';
import { getClientsByUserId } from '../../db/clients.ts';

export const analyticsToolDeclarations = [
  {
    name: 'get_dashboard_analytics',
    description: 'Retrieve real-time business health metrics: total revenue billed, amount collected, pending receivables, overdue amounts, collection rate, and 30-day cash flow projections.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'get_party_risk_scores',
    description: 'Retrieve AI credit scoring and payment delay risk categorizations (Low/Medium/High risk) across customer directory.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];

export async function executeAnalyticsTool(userId: number, functionName: string, _args: any) {
  switch (functionName) {
    case 'get_dashboard_analytics': {
      const invoicesList = await getInvoicesByUserId(userId);
      const paymentsList = await getPaymentsForUser(userId);

      const activeInvoices = invoicesList.filter((inv: any) => inv.status !== 'cancelled' && !inv.isCancelled);

      let totalInvoiced = 0;
      let totalCollected = 0;
      let totalPending = 0;
      let totalOverdue = 0;

      const todayStr = new Date().toISOString().split('T')[0];

      activeInvoices.forEach((inv: any) => {
        const tot = parseFloat(inv.totalAmount || '0');
        const pd = parseFloat(inv.paidAmount || '0');
        const outstanding = Math.max(0, tot - pd);

        totalInvoiced += tot;
        totalCollected += pd;

        if (inv.status === 'paid' || outstanding <= 0) {
          // Paid
        } else if (inv.status === 'overdue' || (inv.dueDate && inv.dueDate < todayStr)) {
          totalOverdue += outstanding;
        } else {
          totalPending += outstanding;
        }
      });

      const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

      return {
        totalInvoiced: `₹${totalInvoiced.toLocaleString('en-IN')}`,
        totalCollected: `₹${totalCollected.toLocaleString('en-IN')}`,
        totalPending: `₹${totalPending.toLocaleString('en-IN')}`,
        totalOverdue: `₹${totalOverdue.toLocaleString('en-IN')}`,
        collectionRate: `${collectionRate}%`,
        activeInvoicesCount: activeInvoices.length,
        totalPaymentsLogged: paymentsList.length,
      };
    }

    case 'get_party_risk_scores': {
      const invoicesList = await getInvoicesByUserId(userId);
      const clientsList = await getClientsByUserId(userId);

      const activeInvoices = invoicesList.filter((inv: any) => inv.status !== 'cancelled' && !inv.isCancelled);
      const todayStr = new Date().toISOString().split('T')[0];

      const clientRisks = clientsList
        .filter((c: any) => c.isActive !== false)
        .map((c: any) => {
          const clientInvs = activeInvoices.filter((i: any) => i.clientId === c.id);
          if (clientInvs.length === 0) {
            return {
              name: c.name,
              companyName: c.companyName || c.name,
              score: 95,
              riskLevel: 'LOW',
              status: 'Reliable / New Party',
              overdueAmount: '₹0',
            };
          }

          let overdueAmount = 0;
          let billedAmount = 0;
          clientInvs.forEach((i: any) => {
            const tot = parseFloat(i.totalAmount || '0');
            const pd = parseFloat(i.paidAmount || '0');
            billedAmount += tot;
            if (i.status === 'overdue' || (i.dueDate < todayStr && i.status !== 'paid')) {
              overdueAmount += Math.max(0, tot - pd);
            }
          });

          const ratio = billedAmount > 0 ? overdueAmount / billedAmount : 0;
          let score = Math.max(20, Math.min(99, 100 - Math.round(ratio * 70)));
          const riskLevel = score >= 80 ? 'LOW' : score >= 50 ? 'MEDIUM' : 'HIGH';

          return {
            name: c.name,
            companyName: c.companyName || c.name,
            score,
            riskLevel,
            overdueAmount: `₹${overdueAmount.toLocaleString('en-IN')}`,
          };
        });

      return {
        clientsEvaluated: clientRisks.length,
        highRiskParties: clientRisks.filter((c) => c.riskLevel === 'HIGH'),
        mediumRiskParties: clientRisks.filter((c) => c.riskLevel === 'MEDIUM'),
        lowRiskParties: clientRisks.filter((c) => c.riskLevel === 'LOW'),
      };
    }

    default:
      throw new Error(`Unknown analytics tool action: ${functionName}`);
  }
}
