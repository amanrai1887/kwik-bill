import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { getInvoicesByUserId } from "../db/invoices.ts";
import { getPaymentsForUser } from "../db/payments.ts";
import { getClientsByUserId } from "../db/clients.ts";
import { asyncHandler, ApiResponse } from "../utils/apiResponse.ts";

export const getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const invoicesList = await getInvoicesByUserId(userId);
  const paymentsList = await getPaymentsForUser(userId);
  const clientsList = await getClientsByUserId(userId);

  // Filter active (non-cancelled / non-voided) invoices
  const activeInvoices = invoicesList.filter(
    (inv) => inv.status !== 'cancelled' && !inv.isCancelled
  );
  const cancelledInvoices = invoicesList.filter(
    (inv) => inv.status === 'cancelled' || inv.isCancelled
  );

  const activeInvoiceIds = new Set(activeInvoices.map((i) => i.id));
  const activePayments = paymentsList.filter((p) => activeInvoiceIds.has(p.invoiceId));

  const activeClients = clientsList.filter((c) => c.isActive !== false);
  const disabledClients = clientsList.filter((c) => c.isActive === false);

  // Calculations across active non-cancelled invoices
  let totalInvoiced = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  // Ageing Buckets
  let ageing0to15 = 0;
  let ageing16to30 = 0;
  let ageing31to60 = 0;
  let ageing60plus = 0;

  // Cash Flow Forecast (Incoming in next 7 & 30 days)
  let expectedNext7Days = 0;
  let expectedNext30Days = 0;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  activeInvoices.forEach((inv) => {
    const total = parseFloat(inv.totalAmount || '0');
    const paid = parseFloat(inv.paidAmount || '0');
    const outstanding = Math.max(0, total - paid);

    totalInvoiced += total;
    totalCollected += paid;

    if (inv.status === 'paid' || outstanding <= 0) {
      // completely paid
    } else if (inv.status === 'overdue' || (inv.dueDate && inv.dueDate < todayStr)) {
      totalOverdue += outstanding;

      // Calculate days overdue for ageing buckets
      if (inv.dueDate) {
        const due = new Date(inv.dueDate);
        const diffDays = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
        if (diffDays <= 15) ageing0to15 += outstanding;
        else if (diffDays <= 30) ageing16to30 += outstanding;
        else if (diffDays <= 60) ageing31to60 += outstanding;
        else ageing60plus += outstanding;
      } else {
        ageing0to15 += outstanding;
      }
    } else {
      totalPending += outstanding;
      // Projected inflows based on future due dates
      if (inv.dueDate >= todayStr && inv.dueDate <= in7Days) {
        expectedNext7Days += outstanding;
      }
      if (inv.dueDate >= todayStr && inv.dueDate <= in30Days) {
        expectedNext30Days += outstanding;
      }
    }
  });

  // AI Client Credit Scoring & Risk Categorization
  const clientRiskMap: Record<
    number,
    { score: number; riskLevel: 'low' | 'medium' | 'high'; label: string; avgDelayDays: number }
  > = {};
  
  clientsList.forEach((c) => {
    if (c.isActive === false) {
      clientRiskMap[c.id] = { score: 0, riskLevel: 'low', label: 'Disabled Party (Inactive)', avgDelayDays: 0 };
      return;
    }

    const clientActiveInvoices = activeInvoices.filter((i) => i.clientId === c.id);
    if (clientActiveInvoices.length === 0) {
      clientRiskMap[c.id] = { score: 95, riskLevel: 'low', label: 'New Party • Reliable', avgDelayDays: 0 };
      return;
    }

    let totalClientOverdue = 0;
    let totalClientBilled = 0;
    let overdueCount = 0;

    clientActiveInvoices.forEach((i) => {
      const tot = parseFloat(i.totalAmount || '0');
      const pd = parseFloat(i.paidAmount || '0');
      totalClientBilled += tot;
      if (i.status === 'overdue' || (i.dueDate < todayStr && i.status !== 'paid')) {
        totalClientOverdue += (tot - pd);
        overdueCount++;
      }
    });

    const overdueRatio = totalClientBilled > 0 ? totalClientOverdue / totalClientBilled : 0;
    let score = 100 - Math.round(overdueRatio * 60) - overdueCount * 8;
    score = Math.max(20, Math.min(99, score));

    if (score >= 80) {
      clientRiskMap[c.id] = { score, riskLevel: 'low', label: 'Prompt Payer (Avg 2-4 Days)', avgDelayDays: 2 };
    } else if (score >= 50) {
      clientRiskMap[c.id] = { score, riskLevel: 'medium', label: 'Moderate Risk (Avg 7-14 Days)', avgDelayDays: 9 };
    } else {
      clientRiskMap[c.id] = { score, riskLevel: 'high', label: 'High Delay Risk (15+ Days)', avgDelayDays: 22 };
    }
  });

  // Monthly breakdown for trend chart (last 6 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curMonthIdx = new Date().getMonth();
  const trendData = [];

  for (let i = 5; i >= 0; i--) {
    const mIdx = (curMonthIdx - i + 12) % 12;
    const monthName = months[mIdx];
    
    let monthInvoiced = 0;
    let monthCollected = 0;

    activeInvoices.forEach((inv) => {
      if (inv.issueDate) {
        const d = new Date(inv.issueDate);
        if (d.getMonth() === mIdx) {
          monthInvoiced += parseFloat(inv.totalAmount || '0');
        }
      }
    });

    activePayments.forEach((p) => {
      if (p.paymentDate) {
        const d = new Date(p.paymentDate);
        if (d.getMonth() === mIdx) {
          monthCollected += parseFloat(p.amount || '0');
        }
      }
    });

    trendData.push({
      month: monthName,
      invoiced: monthInvoiced,
      collected: monthCollected,
      pending: Math.max(0, monthInvoiced - monthCollected),
    });
  }

  // Collection Rate
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  return ApiResponse.success(res, {
    metrics: {
      totalInvoiced,
      totalCollected,
      totalPending,
      totalOverdue,
      totalInvoicesCount: activeInvoices.length,
      totalCancelledInvoicesCount: cancelledInvoices.length,
      totalClientsCount: clientsList.length,
      activeClientsCount: activeClients.length,
      disabledClientsCount: disabledClients.length,
      collectionRate,
      expectedNext7Days,
      expectedNext30Days,
      ageingBuckets: {
        days0to15: ageing0to15,
        days16to30: ageing16to30,
        days31to60: ageing31to60,
        days60plus: ageing60plus,
      },
    },
    clientRiskMap,
    trendData,
  });
});
