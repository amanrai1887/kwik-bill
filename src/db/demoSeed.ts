import { db } from './index.ts';
import { users, clients, invoices, payments, reminderLogs } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function ensureDemoData(demoUserId: number) {
  try {
    // Check if demo user already has clients
    const existingClients = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, demoUserId));

    if (existingClients.length > 0) {
      return; // Already seeded
    }

    console.log('[Demo Seed] Seeding rich sample data for demo workspace...');

    // 1. Create Sample Clients
    const insertedClients = await db
      .insert(clients)
      .values([
        {
          userId: demoUserId,
          name: 'Rajesh Sharma',
          companyName: 'Rajesh Logistics & Supply Corp',
          phone: '+919820098200',
          email: 'rajesh@rajeshlogistics.com',
          address: 'Plot 48, GIDC Industrial Estate, Sanand, Ahmedabad, Gujarat 382110',
          gstin: '24AABCS1429B1ZX',
          industryType: 'transport',
          paymentTermDays: 7,
          notes: 'Regular transport client for Mumbai-Gujarat corridor.',
        },
        {
          userId: demoUserId,
          name: 'Amit Patel',
          companyName: 'Patel Steel & Trading Ltd',
          phone: '+919820198201',
          email: 'accounts@patelsteel.in',
          address: 'Steel Market, Kalamboli, Navi Mumbai, Maharashtra 410218',
          gstin: '27AABCP1122C1Z4',
          industryType: 'transport',
          paymentTermDays: 14,
          notes: 'Heavy coil & structural steel freight contract.',
        },
        {
          userId: demoUserId,
          name: 'Vikram Singh',
          companyName: 'Singhania Retail Distribution',
          phone: '+919820298202',
          email: 'billing@singhaniaretail.com',
          address: 'Kirti Nagar Warehousing Hub, New Delhi 110015',
          gstin: '07AABCS9988D1Z9',
          industryType: 'transport',
          paymentTermDays: 7,
          notes: 'E-commerce FMCG line-haul routes.',
        },
        {
          userId: demoUserId,
          name: 'Pooja Verma',
          companyName: 'Pooja FMCG Traders',
          phone: '+919820398203',
          email: 'pooja@poojatraders.in',
          address: 'Yeshwanthpur Industrial Area, Bengaluru, Karnataka 560022',
          gstin: '29AABCP3344E1Z2',
          industryType: 'transport',
          paymentTermDays: 10,
          notes: 'Interstate cold-chain delivery.',
        },
      ])
      .returning();

    const c1 = insertedClients[0];
    const c2 = insertedClients[1];
    const c3 = insertedClients[2];
    const c4 = insertedClients[3];

    // 2. Create Sample Invoices
    const today = new Date();
    const dateStr = (d: Date) => d.toISOString().split('T')[0];

    const pastDate1 = new Date(today.getTime() - 12 * 86400000);
    const pastDate2 = new Date(today.getTime() - 5 * 86400000);
    const pastDate3 = new Date(today.getTime() - 20 * 86400000);
    const futureDate = new Date(today.getTime() + 7 * 86400000);

    const insertedInvoices = await db
      .insert(invoices)
      .values([
        {
          userId: demoUserId,
          clientId: c1.id,
          invoiceNumber: 'INV-2026-001',
          issueDate: dateStr(pastDate1),
          dueDate: dateStr(pastDate2),
          status: 'paid',
          currency: 'INR',
          subtotal: '36000.00',
          taxRate: '18.00',
          taxAmount: '6480.00',
          totalAmount: '42480.00',
          paidAmount: '42480.00',
          taxType: 'inter_state',
          placeOfSupply: '24 - Gujarat',
          items: [
            { description: 'Freight Corridors: Mumbai to Ahmedabad (Trailer 32ft)', hsnCode: '9965', quantity: 1, rate: 30000, amount: 30000 },
            { description: 'Loading, Unloading & Transit Toll Handling', hsnCode: '9967', quantity: 1, rate: 6000, amount: 6000 },
          ],
          industryDetails: {
            vehicleNo: 'MH-04-GP-8842',
            lrNumber: 'LR-994201',
            routeFrom: 'JNPT Port Mumbai',
            routeTo: 'Sanand Industrial Estate, Gujarat',
          },
          notes: 'Payment received in full via UPI. Thank you for your business!',
        },
        {
          userId: demoUserId,
          clientId: c2.id,
          invoiceNumber: 'INV-2026-002',
          issueDate: dateStr(pastDate2),
          dueDate: dateStr(futureDate),
          status: 'pending',
          currency: 'INR',
          subtotal: '30000.00',
          taxRate: '18.00',
          taxAmount: '5400.00',
          totalAmount: '35400.00',
          paidAmount: '0.00',
          taxType: 'intra_state',
          placeOfSupply: '27 - Maharashtra',
          items: [
            { description: 'Heavy Steel Plate Transportation: Kalamboli to Pune', hsnCode: '9965', quantity: 1, rate: 30000, amount: 30000 },
          ],
          industryDetails: {
            vehicleNo: 'MH-46-AR-1199',
            lrNumber: 'LR-994202',
            routeFrom: 'Kalamboli Steel Market',
            routeTo: 'Chakan MIDC Phase 2, Pune',
          },
          notes: 'Please settle within stipulated credit period.',
        },
        {
          userId: demoUserId,
          clientId: c3.id,
          invoiceNumber: 'INV-2026-003',
          issueDate: dateStr(pastDate3),
          dueDate: dateStr(pastDate1),
          status: 'overdue',
          currency: 'INR',
          subtotal: '60000.00',
          taxRate: '18.00',
          taxAmount: '10800.00',
          totalAmount: '70800.00',
          paidAmount: '0.00',
          taxType: 'inter_state',
          placeOfSupply: '07 - Delhi',
          reminderSentCount: 2,
          lastReminderSentAt: pastDate2,
          items: [
            { description: 'Multi-Axle Container Dispatch: Mumbai to Delhi', hsnCode: '9965', quantity: 2, rate: 30000, amount: 60000 },
          ],
          industryDetails: {
            vehicleNo: 'NL-01-AB-4455',
            lrNumber: 'LR-994190',
            routeFrom: 'Bhiwandi Hub',
            routeTo: 'Kirti Nagar Warehouse Delhi',
          },
          notes: 'Overdue invoice. Kindly clear immediately.',
        },
        {
          userId: demoUserId,
          clientId: c4.id,
          invoiceNumber: 'INV-2026-004',
          issueDate: dateStr(today),
          dueDate: dateStr(futureDate),
          status: 'pending',
          currency: 'INR',
          subtotal: '16000.00',
          taxRate: '18.00',
          taxAmount: '2880.00',
          totalAmount: '18880.00',
          paidAmount: '0.00',
          taxType: 'inter_state',
          placeOfSupply: '29 - Karnataka',
          items: [
            { description: 'Refrigerated Cargo Transport: Pune to Bengaluru', hsnCode: '9965', quantity: 1, rate: 16000, amount: 16000 },
          ],
          industryDetails: {
            vehicleNo: 'KA-01-MJ-9920',
            lrNumber: 'LR-994210',
            routeFrom: 'Pune Cold Storage',
            routeTo: 'Yeshwanthpur, Bengaluru',
          },
        },
      ])
      .returning();

    // 3. Create Sample Payment
    await db.insert(payments).values({
      userId: demoUserId,
      invoiceId: insertedInvoices[0].id,
      amount: '42480.00',
      paymentDate: dateStr(pastDate2),
      paymentMethod: 'upi',
      referenceNumber: 'UPI-9948201994',
      notes: 'Settled via GooglePay UPI QR Code',
    });

    // 4. Create Sample Reminder Logs
    await db.insert(reminderLogs).values([
      {
        userId: demoUserId,
        invoiceId: insertedInvoices[2].id,
        clientId: c3.id,
        channel: 'whatsapp',
        templateType: 'overdue',
        recipientPhone: c3.phone,
        messageContent: `Namaste Vikram Singh, reminder for overdue invoice INV-2026-003 of Rs. 70,800.00 for Singhania Retail Distribution. Pay via UPI: speedytrans@okaxis`,
        status: 'sent',
        sentAt: pastDate2,
      },
    ]);

    console.log('[Demo Seed] Demo data seeded successfully.');
  } catch (error) {
    console.error('[Demo Seed] Error seeding demo data:', error);
  }
}
