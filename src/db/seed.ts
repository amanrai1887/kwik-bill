import { db } from './index.ts';
import { users, clients, invoices, payments, reminderLogs } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedDemoDataIfEmpty(userId: number) {
  try {
    const existingClients = await db.select().from(clients).where(eq(clients.userId, userId));
    if (existingClients.length > 0) {
      return; // Already populated
    }

    console.log(`Seeding initial industry data for user ID: ${userId}`);

    // Create clients
    const [cTransport, cAgency, cFreelance, cConsult] = await db.insert(clients).values([
      {
        userId,
        name: 'Rajesh Logistics Corp',
        phone: '+919820123456',
        email: 'billing@rajeshlogistics.com',
        companyName: 'Rajesh Freight Carriers Pvt Ltd',
        address: 'Warehouse 14, JNPT Port Road, Navi Mumbai 400707',
        gstin: '27AABCR1234F1ZQ',
        industryType: 'transport',
        paymentTermDays: 15,
        notes: 'Fleet deliveries for north-west corridors. Bilty copy required.',
      },
      {
        userId,
        name: 'Priya Sharma (Apex Brands)',
        phone: '+919811987654',
        email: 'accounts@apexbrands.agency',
        companyName: 'Apex Creative Media LLP',
        address: '8th Floor, Cyber Hub, Gurugram, HR 122002',
        gstin: '06AAHCA9876P1ZV',
        industryType: 'agency',
        paymentTermDays: 7,
        notes: 'Monthly digital marketing retainer & brand asset production.',
      },
      {
        userId,
        name: 'Arjun Mehta (FinTech Lab)',
        phone: '+919845112233',
        email: 'arjun@fintechlabs.io',
        companyName: 'FinTech Labs Inc',
        address: 'Indiranagar 100ft Road, Bengaluru, KA 560038',
        gstin: '29ABCDE1122K1Z9',
        industryType: 'freelancer',
        paymentTermDays: 5,
        notes: 'Full-stack UI/UX sprint and React frontend design.',
      },
      {
        userId,
        name: 'Dr. Vivek Singhania',
        phone: '+919871098765',
        email: 'director@singhaniagroup.in',
        companyName: 'Singhania Enterprise Advisory',
        address: 'Express Towers, Nariman Point, Mumbai 400021',
        gstin: '27AAACS5544N1ZP',
        industryType: 'consultant',
        paymentTermDays: 10,
        notes: 'Quarterly supply chain strategy advisory & audit sessions.',
      },
    ]).returning();

    // Helper for dates
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    const dMinus20 = new Date(today.getTime() - 20 * 86400000);
    const dMinus10 = new Date(today.getTime() - 10 * 86400000);
    const dMinus5 = new Date(today.getTime() - 5 * 86400000);
    const dPlus5 = new Date(today.getTime() + 5 * 86400000);
    const dPlus12 = new Date(today.getTime() + 12 * 86400000);

    // Create sample invoices
    const [inv1, inv2, inv3, inv4] = await db.insert(invoices).values([
      {
        userId,
        clientId: cTransport.id,
        invoiceNumber: 'INV-2026-001',
        issueDate: formatDate(dMinus20),
        dueDate: formatDate(dMinus5),
        status: 'overdue', // Overdue transport invoice
        currency: 'INR',
        subtotal: '48000.00',
        taxRate: '12.00',
        taxAmount: '5760.00',
        tdsRate: '0.00',
        tdsAmount: '0.00',
        discountAmount: '0.00',
        totalAmount: '53760.00',
        paidAmount: '0.00',
        items: [
          { description: 'Freight Cargo Haul (Mumbai to Ahmedabad - 18 Ton Container)', quantity: 1, rate: 42000, amount: 42000, hsnCode: '996511' },
          { description: 'Loading & Toll Clearance Charges', quantity: 1, rate: 6000, amount: 6000, hsnCode: '996519' },
        ],
        industryDetails: {
          vehicleNo: 'MH-04-GP-8842',
          lrNumber: 'LR-994201',
          routeFrom: 'JNPT Port, Mumbai',
          routeTo: 'Sanand Industrial Estate, Ahmedabad',
          driverName: 'Harpreet Singh',
        },
        notes: 'Payment overdue by 5 days. Driver unloading completed on schedule with signed pod acknowledgement.',
        reminderSentCount: 2,
        lastReminderSentAt: new Date(today.getTime() - 2 * 86400000),
      },
      {
        userId,
        clientId: cAgency.id,
        invoiceNumber: 'INV-2026-002',
        issueDate: formatDate(dMinus10),
        dueDate: formatDate(dPlus5),
        status: 'pending', // Pending agency invoice
        currency: 'INR',
        subtotal: '75000.00',
        taxRate: '18.00',
        taxAmount: '13500.00',
        tdsRate: '10.00',
        tdsAmount: '7500.00',
        discountAmount: '0.00',
        totalAmount: '81000.00', // 75000 + 13500 - 7500
        paidAmount: '0.00',
        items: [
          { description: 'Performance Ad Campaign Management (Q3 Growth Retainer)', quantity: 1, rate: 45000, amount: 45000, hsnCode: '998311' },
          { description: 'Motion Design & Video Creatives Production (6 Reels)', quantity: 6, rate: 5000, amount: 30000, hsnCode: '998314' },
        ],
        industryDetails: {
          milestone: 'Sprint Deliverables Finalized',
          hoursBilled: 48,
          ratePerHour: 1500,
        },
        notes: 'TDS @ 10% deducted under Sec 194J. Form 16A to be issued at quarter end.',
        reminderSentCount: 1,
        lastReminderSentAt: new Date(today.getTime() - 1 * 86400000),
      },
      {
        userId,
        clientId: cFreelance.id,
        invoiceNumber: 'INV-2026-003',
        issueDate: formatDate(dMinus20),
        dueDate: formatDate(dMinus10),
        status: 'paid', // Paid freelancer invoice
        currency: 'INR',
        subtotal: '35000.00',
        taxRate: '18.00',
        taxAmount: '6300.00',
        tdsRate: '0.00',
        tdsAmount: '0.00',
        discountAmount: '0.00',
        totalAmount: '41300.00',
        paidAmount: '41300.00',
        items: [
          { description: 'React SaaS Dashboard UI & Component Architecture', quantity: 1, rate: 35000, amount: 35000, hsnCode: '998313' },
        ],
        industryDetails: {
          projectGithub: 'github.com/fintechlabs/dashboard',
          hours: 24,
        },
        notes: 'Fully settled via Instant UPI payment on delivery.',
        reminderSentCount: 1,
      },
      {
        userId,
        clientId: cConsult.id,
        invoiceNumber: 'INV-2026-004',
        issueDate: formatDate(dMinus5),
        dueDate: formatDate(dPlus12),
        status: 'partial', // Partial payment consultant invoice
        currency: 'INR',
        subtotal: '120000.00',
        taxRate: '18.00',
        taxAmount: '21600.00',
        tdsRate: '10.00',
        tdsAmount: '12000.00',
        discountAmount: '0.00',
        totalAmount: '129600.00',
        paidAmount: '60000.00', // 50% advance received
        items: [
          { description: 'Strategic Logistics Advisory & Warehouse Automation Audit', quantity: 4, rate: 30000, amount: 120000, hsnCode: '998312' },
        ],
        industryDetails: {
          sessionDates: 'Aug 2, Aug 6, Aug 9, Aug 14',
          advisoryDomain: 'Supply Chain Operations & Route Optimization',
        },
        notes: '50% advance received. Balance Rs 69,600 due on final presentation delivery.',
        reminderSentCount: 0,
      }
    ]).returning();

    // Add corresponding payment logs
    await db.insert(payments).values([
      {
        userId,
        invoiceId: inv3.id,
        amount: '41300.00',
        paymentDate: formatDate(dMinus10),
        paymentMethod: 'upi',
        referenceNumber: 'UPI/388291048291',
        notes: 'Received via Google Pay instant UPI transfer.',
      },
      {
        userId,
        invoiceId: inv4.id,
        amount: '60000.00',
        paymentDate: formatDate(dMinus5),
        paymentMethod: 'bank_transfer',
        referenceNumber: 'NEFT-HDFC-9918237',
        notes: '50% initial retainer advance credited to Current A/c.',
      }
    ]);

    // Add reminder logs
    await db.insert(reminderLogs).values([
      {
        userId,
        invoiceId: inv1.id,
        clientId: cTransport.id,
        channel: 'whatsapp',
        templateType: 'urgent',
        messageContent: 'Dear Rajesh Logistics Corp, Invoice INV-2026-001 for Rs 53,760.00 is OVERDUE by 5 days. Kindly clear the pending balance to avoid service interruption. Pay via UPI: speedytrans@okaxis',
        recipientPhone: '+919820123456',
        status: 'sent',
      },
      {
        userId,
        invoiceId: inv2.id,
        clientId: cAgency.id,
        channel: 'whatsapp',
        templateType: 'polite',
        messageContent: 'Hi Priya Sharma, gentle reminder that Invoice INV-2026-002 for Rs 81,000.00 is due on ' + formatDate(dPlus5) + '. Thank you for your continued partnership!',
        recipientPhone: '+919811987654',
        status: 'sent',
      }
    ]);

    console.log('Sample database seed completed successfully!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}
