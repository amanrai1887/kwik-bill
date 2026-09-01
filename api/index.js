var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiConversations: () => aiConversations,
  aiConversationsRelations: () => aiConversationsRelations,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  planRequests: () => planRequests,
  planRequestsRelations: () => planRequestsRelations,
  recurringProfiles: () => recurringProfiles,
  recurringProfilesRelations: () => recurringProfilesRelations,
  reminderLogs: () => reminderLogs,
  reminderLogsRelations: () => reminderLogsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
var users, clients, invoices, payments, reminderLogs, planRequests, recurringProfiles, aiConversations, usersRelations, aiConversationsRelations, recurringProfilesRelations, planRequestsRelations, clientsRelations, invoicesRelations, paymentsRelations, reminderLogsRelations;
var init_schema = __esm({
  "src/db/schema.ts"() {
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      uid: text("uid").notNull().unique(),
      // Firebase Auth UID
      email: text("email").notNull(),
      role: text("role").default("subscriber").notNull(),
      // 'superadmin' | 'subscriber'
      businessName: text("business_name").default("My Business"),
      phone: text("phone").default(""),
      upiId: text("upi_id").default(""),
      gstin: text("gstin").default(""),
      address: text("address").default(""),
      bankName: text("bank_name").default(""),
      bankAccountNo: text("bank_account_no").default(""),
      bankIfsc: text("bank_ifsc").default(""),
      industryType: text("industry_type").default("transport"),
      // transport | agency | freelancer | consultant
      subscriptionPlan: text("subscription_plan").default("trial_15_days"),
      // trial_15_days | starter_299 | pro_499
      subscriptionStatus: text("subscription_status").default("trial"),
      // trial | active | expired | inactive
      trialEndsAt: timestamp("trial_ends_at"),
      // WhatsApp Direct API Gateway Config
      whatsappProvider: text("whatsapp_provider").default("meta"),
      // 'meta' | 'generic'
      whatsappPhoneNumberId: text("whatsapp_phone_number_id").default(""),
      whatsappApiToken: text("whatsapp_api_token").default(""),
      // Custom Invoice Templates & Branding
      logoUrl: text("logo_url").default(""),
      invoiceTemplate: text("invoice_template").default("modern"),
      // modern | corporate | logistics | creative | classic | dark_neon
      brandColor: text("brand_color").default("#4f46e5"),
      // Hex code
      customFooter: text("custom_footer").default(""),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    clients = pgTable("clients", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      name: text("name").notNull(),
      phone: text("phone").notNull(),
      // WhatsApp Phone number
      email: text("email").default(""),
      companyName: text("company_name").default(""),
      address: text("address").default(""),
      gstin: text("gstin").default(""),
      industryType: text("industry_type").default("general"),
      // transport, agency, freelancer, consultant
      paymentTermDays: integer("payment_term_days").default(7),
      notes: text("notes").default(""),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    invoices = pgTable("invoices", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
      invoiceNumber: text("invoice_number").notNull(),
      issueDate: text("issue_date").notNull(),
      // YYYY-MM-DD
      dueDate: text("due_date").notNull(),
      // YYYY-MM-DD
      status: text("status").default("pending").notNull(),
      // 'pending' | 'paid' | 'overdue' | 'partial'
      // Financials
      currency: text("currency").default("INR").notNull(),
      subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0.00"),
      taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("18.00"),
      // GST %
      taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
      tdsRate: numeric("tds_rate", { precision: 5, scale: 2 }).default("0.00"),
      // TDS % (Consultants/Agencies)
      tdsAmount: numeric("tds_amount", { precision: 12, scale: 2 }).default("0.00"),
      discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0.00"),
      totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
      paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0.00"),
      // GST Compliance & Security Isolation
      placeOfSupply: text("place_of_supply").default(""),
      isRcm: boolean("is_rcm").default(false),
      taxType: text("tax_type").default("intra_state"),
      // 'intra_state' | 'inter_state'
      shareToken: text("share_token").default(""),
      isCancelled: boolean("is_cancelled").default(false),
      cancelReason: text("cancel_reason").default(""),
      // Itemized breakdown & industry custom fields (stored as structured JSON)
      items: jsonb("items").notNull(),
      // Array<{ description: string, quantity: number, uqc?: string, rate: number, gstRate?: number, amount: number, hsnCode?: string }>
      industryDetails: jsonb("industry_details").default({}),
      // e.g. Transport: { vehicleNo, lrNumber, routeFrom, routeTo }, Consultant: { sessionDates, hours }
      notes: text("notes").default("Thank you for your business! Please settle the dues promptly via UPI or bank transfer."),
      terms: text("terms").default("Payment is due within the stipulated days. Interest of 2%/month applicable on late payments."),
      reminderSentCount: integer("reminder_sent_count").default(0),
      lastReminderSentAt: timestamp("last_reminder_sent_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    payments = pgTable("payments", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
      amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
      paymentDate: text("payment_date").notNull(),
      // YYYY-MM-DD
      paymentMethod: text("payment_method").default("upi").notNull(),
      // upi | bank_transfer | cash | cheque
      referenceNumber: text("reference_number").default(""),
      notes: text("notes").default(""),
      createdAt: timestamp("created_at").defaultNow()
    });
    reminderLogs = pgTable("reminder_logs", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
      clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
      channel: text("channel").default("whatsapp").notNull(),
      // whatsapp | sms | email
      templateType: text("template_type").default("standard").notNull(),
      // polite | standard | urgent | overdue
      messageContent: text("message_content").notNull(),
      recipientPhone: text("recipient_phone").notNull(),
      status: text("status").default("sent").notNull(),
      // sent | delivered | clicked
      sentAt: timestamp("sent_at").defaultNow()
    });
    planRequests = pgTable("plan_requests", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      businessName: text("business_name").notNull(),
      contactPerson: text("contact_person").notNull(),
      email: text("email").notNull(),
      phone: text("phone").notNull(),
      industryType: text("industry_type").default("transport").notNull(),
      requestedPlan: text("requested_plan").notNull(),
      // 'starter_299' | 'pro_499'
      businessNeeds: text("business_needs").default(""),
      status: text("status").default("pending").notNull(),
      // 'pending' | 'approved' | 'rejected'
      createdAt: timestamp("created_at").defaultNow()
    });
    recurringProfiles = pgTable("recurring_profiles", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
      title: text("title").default("Recurring Retainer Billing").notNull(),
      frequency: text("frequency").default("monthly").notNull(),
      // 'weekly' | 'monthly' | 'quarterly' | 'yearly'
      interval: integer("interval").default(1).notNull(),
      startDate: text("start_date").notNull(),
      // YYYY-MM-DD
      nextRunDate: text("next_run_date").notNull(),
      // YYYY-MM-DD
      endDate: text("end_date"),
      isActive: boolean("is_active").default(true).notNull(),
      autoSendWhatsApp: boolean("auto_send_whatsapp").default(true).notNull(),
      // Template Invoice Financials
      currency: text("currency").default("INR").notNull(),
      subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0.00"),
      taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("18.00"),
      taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
      tdsRate: numeric("tds_rate", { precision: 5, scale: 2 }).default("0.00"),
      tdsAmount: numeric("tds_amount", { precision: 12, scale: 2 }).default("0.00"),
      discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0.00"),
      totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
      // Line Items & Metadata
      items: jsonb("items").notNull(),
      // Array<{ description: string, quantity: number, rate: number, amount: number, hsnCode?: string }>
      industryDetails: jsonb("industry_details").default({}),
      notes: text("notes").default("Automated recurring invoice. Thank you for your continued business!"),
      terms: text("terms").default("Payment is due within 7 days of invoice generation."),
      generatedCount: integer("generated_count").default(0).notNull(),
      lastGeneratedAt: timestamp("last_generated_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    aiConversations = pgTable("ai_conversations", {
      id: serial("id").primaryKey(),
      conversationId: text("conversation_id").notNull().unique(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      title: text("title").default("New Conversation").notNull(),
      messages: jsonb("messages").notNull().default([]),
      // Array<{ id: string, role: 'user' | 'model' | 'function' | 'system', content?: string, toolCalls?: any[], toolResult?: any, structuredData?: any, createdAt: string }>
      lastActiveAt: timestamp("last_active_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      clients: many(clients),
      invoices: many(invoices),
      payments: many(payments),
      reminderLogs: many(reminderLogs),
      planRequests: many(planRequests),
      recurringProfiles: many(recurringProfiles),
      aiConversations: many(aiConversations)
    }));
    aiConversationsRelations = relations(aiConversations, ({ one }) => ({
      user: one(users, {
        fields: [aiConversations.userId],
        references: [users.id]
      })
    }));
    recurringProfilesRelations = relations(recurringProfiles, ({ one }) => ({
      user: one(users, {
        fields: [recurringProfiles.userId],
        references: [users.id]
      }),
      client: one(clients, {
        fields: [recurringProfiles.clientId],
        references: [clients.id]
      })
    }));
    planRequestsRelations = relations(planRequests, ({ one }) => ({
      user: one(users, {
        fields: [planRequests.userId],
        references: [users.id]
      })
    }));
    clientsRelations = relations(clients, ({ one, many }) => ({
      user: one(users, {
        fields: [clients.userId],
        references: [users.id]
      }),
      invoices: many(invoices),
      reminderLogs: many(reminderLogs),
      recurringProfiles: many(recurringProfiles)
    }));
    invoicesRelations = relations(invoices, ({ one, many }) => ({
      user: one(users, {
        fields: [invoices.userId],
        references: [users.id]
      }),
      client: one(clients, {
        fields: [invoices.clientId],
        references: [clients.id]
      }),
      payments: many(payments),
      reminderLogs: many(reminderLogs)
    }));
    paymentsRelations = relations(payments, ({ one }) => ({
      user: one(users, {
        fields: [payments.userId],
        references: [users.id]
      }),
      invoice: one(invoices, {
        fields: [payments.invoiceId],
        references: [invoices.id]
      })
    }));
    reminderLogsRelations = relations(reminderLogs, ({ one }) => ({
      user: one(users, {
        fields: [reminderLogs.userId],
        references: [users.id]
      }),
      invoice: one(invoices, {
        fields: [reminderLogs.invoiceId],
        references: [invoices.id]
      }),
      client: one(clients, {
        fields: [reminderLogs.clientId],
        references: [clients.id]
      })
    }));
  }
});

// src/db/index.ts
var db_exports = {};
__export(db_exports, {
  createPool: () => createPool,
  db: () => db
});
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
var createPool, pool, db;
var init_db = __esm({
  "src/db/index.ts"() {
    init_schema();
    dotenv.config();
    createPool = () => {
      if (!global._postgresPool) {
        const connectionString = process.env.DATABASE_URL;
        const isSsl = process.env.DB_SSL === "true" || connectionString && connectionString.includes("supabase.co") || process.env.SQL_HOST && process.env.SQL_HOST.includes("supabase.co");
        const sslConfig = isSsl ? { rejectUnauthorized: false } : void 0;
        if (connectionString) {
          global._postgresPool = new Pool({
            connectionString,
            ssl: sslConfig,
            max: 10,
            connectionTimeoutMillis: 15e3
          });
        } else {
          global._postgresPool = new Pool({
            host: process.env.SQL_HOST || "postgres",
            port: parseInt(process.env.SQL_PORT || "5432"),
            user: process.env.SQL_USER || "postgres",
            password: process.env.SQL_PASSWORD || "postgres",
            database: process.env.SQL_DB_NAME || "invoice_saas",
            ssl: sslConfig,
            max: 10,
            connectionTimeoutMillis: 15e3
          });
        }
        global._postgresPool.on("error", (err) => {
          console.error("Unexpected error on idle SQL pool client:", err);
        });
      }
      return global._postgresPool;
    };
    pool = createPool();
    db = drizzle(pool, { schema: schema_exports });
  }
});

// src/api-serverless.ts
import express from "express";

// src/routes/index.ts
import { Router as Router10 } from "express";

// src/routes/user.routes.ts
import { Router } from "express";

// src/db/users.ts
init_db();
init_schema();
import { eq as eq2 } from "drizzle-orm";

// src/config/app.config.ts
import * as dotenv2 from "dotenv";
dotenv2.config();
var config3 = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 3e3,
  // SuperAdmin configuration: Supports comma-separated list of admin emails (no hardcoded fallback)
  superAdminEmails: (process.env.ADMIN_EMAIL || process.env.SUPERADMIN_EMAIL || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
  // Razorpay
  razorpay: {
    keyId: (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET || "").trim()
  },
  // Meta WhatsApp Cloud API
  whatsapp: {
    token: (process.env.META_WHATSAPP_TOKEN || "").trim(),
    phoneNumberId: (process.env.META_PHONE_NUMBER_ID || "").trim(),
    defaultTemplate: (process.env.META_WHATSAPP_TEMPLATE || "payment_reminder").trim()
  },
  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "invoice-saas-app-fc503"
  },
  // Redis Cache (Temporarily disabled)
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    enabled: process.env.REDIS_ENABLED === "true"
  },
  // Gemini AI Agent
  gemini: {
    apiKey: (process.env.GEMINI_API_KEY || "").trim(),
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash"
  },
  // AI Rate Limits & Gating
  ai: {
    maxRequestsPerMinute: Number(process.env.AI_RATE_LIMIT_PER_MIN) || 10
  },
  // Security / Demo Mode: Strictly disabled in production unless explicitly enabled for dev/testing
  allowDemoAuth: process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_AUTH === "true"
};
var PLAN_PRICING = {
  starter_299: 29900,
  pro_499: 49900
};
function isSuperAdminEmail(email) {
  if (!email || config3.superAdminEmails.length === 0) return false;
  return config3.superAdminEmails.includes(email.trim().toLowerCase());
}

// src/db/demoSeed.ts
init_db();
init_schema();
import { eq } from "drizzle-orm";
async function ensureDemoData(demoUserId) {
  try {
    const existingClients = await db.select().from(clients).where(eq(clients.userId, demoUserId));
    if (existingClients.length > 0) {
      return;
    }
    console.log("[Demo Seed] Seeding rich sample data for demo workspace...");
    const insertedClients = await db.insert(clients).values([
      {
        userId: demoUserId,
        name: "Rajesh Sharma",
        companyName: "Rajesh Logistics & Supply Corp",
        phone: "+919820098200",
        email: "rajesh@rajeshlogistics.com",
        address: "Plot 48, GIDC Industrial Estate, Sanand, Ahmedabad, Gujarat 382110",
        gstin: "24AABCS1429B1ZX",
        industryType: "transport",
        paymentTermDays: 7,
        notes: "Regular transport client for Mumbai-Gujarat corridor."
      },
      {
        userId: demoUserId,
        name: "Amit Patel",
        companyName: "Patel Steel & Trading Ltd",
        phone: "+919820198201",
        email: "accounts@patelsteel.in",
        address: "Steel Market, Kalamboli, Navi Mumbai, Maharashtra 410218",
        gstin: "27AABCP1122C1Z4",
        industryType: "transport",
        paymentTermDays: 14,
        notes: "Heavy coil & structural steel freight contract."
      },
      {
        userId: demoUserId,
        name: "Vikram Singh",
        companyName: "Singhania Retail Distribution",
        phone: "+919820298202",
        email: "billing@singhaniaretail.com",
        address: "Kirti Nagar Warehousing Hub, New Delhi 110015",
        gstin: "07AABCS9988D1Z9",
        industryType: "transport",
        paymentTermDays: 7,
        notes: "E-commerce FMCG line-haul routes."
      },
      {
        userId: demoUserId,
        name: "Pooja Verma",
        companyName: "Pooja FMCG Traders",
        phone: "+919820398203",
        email: "pooja@poojatraders.in",
        address: "Yeshwanthpur Industrial Area, Bengaluru, Karnataka 560022",
        gstin: "29AABCP3344E1Z2",
        industryType: "transport",
        paymentTermDays: 10,
        notes: "Interstate cold-chain delivery."
      }
    ]).returning();
    const c1 = insertedClients[0];
    const c2 = insertedClients[1];
    const c3 = insertedClients[2];
    const c4 = insertedClients[3];
    const today = /* @__PURE__ */ new Date();
    const dateStr = (d) => d.toISOString().split("T")[0];
    const pastDate1 = new Date(today.getTime() - 12 * 864e5);
    const pastDate2 = new Date(today.getTime() - 5 * 864e5);
    const pastDate3 = new Date(today.getTime() - 20 * 864e5);
    const futureDate = new Date(today.getTime() + 7 * 864e5);
    const insertedInvoices = await db.insert(invoices).values([
      {
        userId: demoUserId,
        clientId: c1.id,
        invoiceNumber: "INV-2026-001",
        issueDate: dateStr(pastDate1),
        dueDate: dateStr(pastDate2),
        status: "paid",
        currency: "INR",
        subtotal: "36000.00",
        taxRate: "18.00",
        taxAmount: "6480.00",
        totalAmount: "42480.00",
        paidAmount: "42480.00",
        taxType: "inter_state",
        placeOfSupply: "24 - Gujarat",
        items: [
          { description: "Freight Corridors: Mumbai to Ahmedabad (Trailer 32ft)", hsnCode: "9965", quantity: 1, rate: 3e4, amount: 3e4 },
          { description: "Loading, Unloading & Transit Toll Handling", hsnCode: "9967", quantity: 1, rate: 6e3, amount: 6e3 }
        ],
        industryDetails: {
          vehicleNo: "MH-04-GP-8842",
          lrNumber: "LR-994201",
          routeFrom: "JNPT Port Mumbai",
          routeTo: "Sanand Industrial Estate, Gujarat"
        },
        notes: "Payment received in full via UPI. Thank you for your business!"
      },
      {
        userId: demoUserId,
        clientId: c2.id,
        invoiceNumber: "INV-2026-002",
        issueDate: dateStr(pastDate2),
        dueDate: dateStr(futureDate),
        status: "pending",
        currency: "INR",
        subtotal: "30000.00",
        taxRate: "18.00",
        taxAmount: "5400.00",
        totalAmount: "35400.00",
        paidAmount: "0.00",
        taxType: "intra_state",
        placeOfSupply: "27 - Maharashtra",
        items: [
          { description: "Heavy Steel Plate Transportation: Kalamboli to Pune", hsnCode: "9965", quantity: 1, rate: 3e4, amount: 3e4 }
        ],
        industryDetails: {
          vehicleNo: "MH-46-AR-1199",
          lrNumber: "LR-994202",
          routeFrom: "Kalamboli Steel Market",
          routeTo: "Chakan MIDC Phase 2, Pune"
        },
        notes: "Please settle within stipulated credit period."
      },
      {
        userId: demoUserId,
        clientId: c3.id,
        invoiceNumber: "INV-2026-003",
        issueDate: dateStr(pastDate3),
        dueDate: dateStr(pastDate1),
        status: "overdue",
        currency: "INR",
        subtotal: "60000.00",
        taxRate: "18.00",
        taxAmount: "10800.00",
        totalAmount: "70800.00",
        paidAmount: "0.00",
        taxType: "inter_state",
        placeOfSupply: "07 - Delhi",
        reminderSentCount: 2,
        lastReminderSentAt: pastDate2,
        items: [
          { description: "Multi-Axle Container Dispatch: Mumbai to Delhi", hsnCode: "9965", quantity: 2, rate: 3e4, amount: 6e4 }
        ],
        industryDetails: {
          vehicleNo: "NL-01-AB-4455",
          lrNumber: "LR-994190",
          routeFrom: "Bhiwandi Hub",
          routeTo: "Kirti Nagar Warehouse Delhi"
        },
        notes: "Overdue invoice. Kindly clear immediately."
      },
      {
        userId: demoUserId,
        clientId: c4.id,
        invoiceNumber: "INV-2026-004",
        issueDate: dateStr(today),
        dueDate: dateStr(futureDate),
        status: "pending",
        currency: "INR",
        subtotal: "16000.00",
        taxRate: "18.00",
        taxAmount: "2880.00",
        totalAmount: "18880.00",
        paidAmount: "0.00",
        taxType: "inter_state",
        placeOfSupply: "29 - Karnataka",
        items: [
          { description: "Refrigerated Cargo Transport: Pune to Bengaluru", hsnCode: "9965", quantity: 1, rate: 16e3, amount: 16e3 }
        ],
        industryDetails: {
          vehicleNo: "KA-01-MJ-9920",
          lrNumber: "LR-994210",
          routeFrom: "Pune Cold Storage",
          routeTo: "Yeshwanthpur, Bengaluru"
        }
      }
    ]).returning();
    await db.insert(payments).values({
      userId: demoUserId,
      invoiceId: insertedInvoices[0].id,
      amount: "42480.00",
      paymentDate: dateStr(pastDate2),
      paymentMethod: "upi",
      referenceNumber: "UPI-9948201994",
      notes: "Settled via GooglePay UPI QR Code"
    });
    await db.insert(reminderLogs).values([
      {
        userId: demoUserId,
        invoiceId: insertedInvoices[2].id,
        clientId: c3.id,
        channel: "whatsapp",
        templateType: "overdue",
        recipientPhone: c3.phone,
        messageContent: `Namaste Vikram Singh, reminder for overdue invoice INV-2026-003 of Rs. 70,800.00 for Singhania Retail Distribution. Pay via UPI: speedytrans@okaxis`,
        status: "sent",
        sentAt: pastDate2
      }
    ]);
    console.log("[Demo Seed] Demo data seeded successfully.");
  } catch (error) {
    console.error("[Demo Seed] Error seeding demo data:", error);
  }
}

// src/db/users.ts
async function getOrCreateUser(uid, email, businessName) {
  try {
    const existing = await db.select().from(users).where(eq2(users.uid, uid));
    if (existing.length > 0) {
      if (uid === "demo-business-owner-101") {
        await ensureDemoData(existing[0].id);
      }
      return existing[0];
    }
    const isAdmin = isSuperAdminEmail(email);
    const isDemoUser = uid === "demo-business-owner-101";
    const role = isAdmin ? "superadmin" : "subscriber";
    const trialDays = 15;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1e3);
    const result = await db.insert(users).values({
      uid,
      email,
      role,
      businessName: businessName || (isAdmin ? "Platform SuperAdmin" : isDemoUser ? "Speedy Transport Logistics" : "My Business"),
      upiId: isDemoUser ? "speedytrans@okaxis" : "",
      phone: isDemoUser ? "+91 98200 12345" : "",
      gstin: isDemoUser ? "27AABCS1429B1ZX" : "",
      address: isDemoUser ? "Plot 42, Transport Nagar, JNPT Highway, Navi Mumbai, MH 400705" : "",
      industryType: "transport",
      subscriptionPlan: isAdmin || isDemoUser ? "pro_499" : "trial_15_days",
      subscriptionStatus: isAdmin || isDemoUser ? "active" : "trial",
      trialEndsAt: isAdmin || isDemoUser ? null : trialEndsAt
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        role: isAdmin ? "superadmin" : users.role,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    const created = result[0];
    if (isDemoUser && created) {
      await ensureDemoData(created.id);
    }
    return created;
  } catch (error) {
    console.error("Database user query failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
async function updateUserProfile(userId, data) {
  try {
    const updatePayload = { ...data };
    if (updatePayload.trialEndsAt) {
      updatePayload.trialEndsAt = new Date(updatePayload.trialEndsAt);
    }
    delete updatePayload.id;
    delete updatePayload.createdAt;
    const updated = await db.update(users).set({
      ...updatePayload,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(users.id, userId)).returning();
    return updated[0];
  } catch (error) {
    console.error("Database update user failed:", error);
    throw new Error("Failed to update user profile.", { cause: error });
  }
}
async function getAllTenants() {
  try {
    const allUsers = await db.select().from(users).orderBy(users.id);
    return allUsers;
  } catch (error) {
    console.error("Database get all tenants failed:", error);
    throw new Error("Failed to get all tenants.", { cause: error });
  }
}
async function updateTenantSubscription(userId, plan, status) {
  try {
    const updated = await db.update(users).set({
      subscriptionPlan: plan,
      subscriptionStatus: status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(users.id, userId)).returning();
    return updated[0];
  } catch (error) {
    console.error("Database update tenant subscription failed:", error);
    throw new Error("Failed to update tenant subscription.", { cause: error });
  }
}

// src/controllers/user.controller.ts
init_db();
init_schema();
import { eq as eq3 } from "drizzle-orm";

// src/utils/apiResponse.ts
var ApiError = class extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var BadRequestError = class extends ApiError {
  constructor(message = "Invalid request parameters", details) {
    super(message, 400, "BAD_REQUEST", details);
  }
};
var ForbiddenError = class extends ApiError {
  constructor(message = "Access forbidden: Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
};
var NotFoundError = class extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
};
var ApiResponse = {
  success(res, data, statusCode = 200, message) {
    return res.status(statusCode).json({
      success: true,
      ...message ? { message } : {},
      ...typeof data === "object" && data !== null && !Array.isArray(data) ? data : { data }
    });
  },
  paginated(res, items, pagination, key = "items") {
    return res.status(200).json({
      success: true,
      [key]: items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        count: items.length,
        ...pagination.total !== void 0 ? { total: pagination.total } : {}
      }
    });
  }
};
function parsePositiveInt(val, fieldName = "id") {
  const parsed = parseInt(String(val), 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new BadRequestError(`Invalid ${fieldName}: must be a positive integer.`);
  }
  return parsed;
}
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected internal server error occurred";
  const code = err.code || (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR");
  if (statusCode >= 500) {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
  }
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...err.details ? { details: err.details } : {}
    }
  });
}

// src/lib/redis.ts
import Redis from "ioredis";
var isRedisConnected = false;
var hasLoggedFailure = false;
var createRedisClient = () => {
  if (!config3.redis.enabled) {
    return null;
  }
  if (global._redisClient) {
    return global._redisClient;
  }
  try {
    const client = new Redis(config3.redis.url, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 5) {
          if (!hasLoggedFailure) {
            console.warn("[Redis] Max reconnect attempts reached. Operating in cache-bypass mode.");
            hasLoggedFailure = true;
          }
          return null;
        }
        return Math.min(times * 500, 2e3);
      },
      connectTimeout: 5e3,
      lazyConnect: false,
      enableOfflineQueue: false
    });
    client.on("connect", () => {
      isRedisConnected = true;
      hasLoggedFailure = false;
      console.log(`[Redis] Connected successfully to ${config3.redis.url.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`);
    });
    client.on("ready", () => {
      isRedisConnected = true;
    });
    client.on("error", (err) => {
      isRedisConnected = false;
      if (!hasLoggedFailure) {
        console.warn(`[Redis] Connection warning (${err?.code || err?.message || "Offline"}). Falling back to direct database.`);
        hasLoggedFailure = true;
      }
    });
    client.on("close", () => {
      isRedisConnected = false;
    });
    global._redisClient = client;
    return client;
  } catch (err) {
    console.warn("[Redis] Failed to initialize Redis client:", err);
    return null;
  }
};
var redis = createRedisClient();
var isCacheAvailable = () => {
  return isRedisConnected && redis !== null && redis.status === "ready";
};
async function getCache(key) {
  if (!isCacheAvailable() || !redis) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.debug(`[Redis] getCache error for key "${key}":`, err);
    return null;
  }
}
async function setCache(key, data, ttlSeconds = 180) {
  if (!isCacheAvailable() || !redis) return false;
  try {
    const serialized = JSON.stringify(data);
    if (ttlSeconds > 0) {
      await redis.set(key, serialized, "EX", ttlSeconds);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (err) {
    console.debug(`[Redis] setCache error for key "${key}":`, err);
    return false;
  }
}
async function invalidatePattern(pattern) {
  if (!isCacheAvailable() || !redis) return 0;
  try {
    let cursor = "0";
    let deletedCount = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== "0");
    return deletedCount;
  } catch (err) {
    console.debug(`[Redis] invalidatePattern error for "${pattern}":`, err);
    return 0;
  }
}
async function invalidateUserCache(userId, ...resources) {
  if (!isCacheAvailable() || !redis || !userId) return;
  try {
    if (resources.length === 0) {
      await invalidatePattern(`cache:${userId}:*`);
    } else {
      const tasks = resources.map((res) => invalidatePattern(`cache:${userId}:${res}*`));
      await Promise.all(tasks);
    }
  } catch (err) {
    console.debug(`[Redis] invalidateUserCache error for user ${userId}:`, err);
  }
}
async function invalidateAdminCache(...resources) {
  if (!isCacheAvailable() || !redis) return;
  try {
    if (resources.length === 0) {
      await invalidatePattern(`cache:admin:*`);
    } else {
      const tasks = resources.map((res) => invalidatePattern(`cache:admin:${res}*`));
      await Promise.all(tasks);
    }
  } catch (err) {
    console.debug(`[Redis] invalidateAdminCache error:`, err);
  }
}
async function flushAllCache() {
  if (!isCacheAvailable() || !redis) return false;
  try {
    await invalidatePattern("cache:*");
    return true;
  } catch (err) {
    console.debug(`[Redis] flushAllCache error:`, err);
    return false;
  }
}
async function getCacheStats() {
  const defaultStats = {
    isConnected: false,
    status: redis?.status || "disconnected",
    keysCount: 0,
    memoryUsed: "0 MB",
    uptimeSeconds: 0,
    redisVersion: "unknown"
  };
  if (!isCacheAvailable() || !redis) {
    return defaultStats;
  }
  try {
    const info = await redis.info();
    const parseInfo = (section, key) => {
      const match = section.match(new RegExp(`^${key}:(.+)$`, "m"));
      return match ? match[1].trim() : "";
    };
    const redisVersion = parseInfo(info, "redis_version") || "unknown";
    const usedMemoryHuman = parseInfo(info, "used_memory_human") || "0 MB";
    const uptime = parseInt(parseInfo(info, "uptime_in_seconds") || "0", 10);
    let cursor = "0";
    let keysCount = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "cache:*", "COUNT", 100);
      cursor = nextCursor;
      keysCount += keys.length;
    } while (cursor !== "0");
    return {
      isConnected: true,
      status: redis.status,
      keysCount,
      memoryUsed: usedMemoryHuman,
      uptimeSeconds: uptime,
      redisVersion
    };
  } catch (err) {
    console.debug("[Redis] getCacheStats error:", err);
    return defaultStats;
  }
}

// src/controllers/user.controller.ts
var getUserProfile = asyncHandler(async (req, res) => {
  const user = req.dbUser;
  return ApiResponse.success(res, { user });
});
var putUserProfile = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const userRole = req.dbUser?.role;
  const userEmail = req.dbUser?.email;
  const userPlan = req.dbUser?.subscriptionPlan;
  const isPro = userRole === "superadmin" || isSuperAdminEmail(userEmail) || userPlan === "pro_499";
  const payload = { ...req.body };
  if (!isPro && payload.invoiceTemplate) {
    const allowedTemplates = ["modern", "classic"];
    if (!allowedTemplates.includes(payload.invoiceTemplate)) {
      payload.invoiceTemplate = "modern";
    }
  }
  const updated = await updateUserProfile(userId, payload);
  await invalidateUserCache(userId, "profile");
  return ApiResponse.success(res, { user: updated });
});
var resetUserData = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  await db.transaction(async (tx) => {
    await tx.delete(reminderLogs).where(eq3(reminderLogs.userId, userId));
    await tx.delete(payments).where(eq3(payments.userId, userId));
    await tx.delete(recurringProfiles).where(eq3(recurringProfiles.userId, userId));
    await tx.delete(invoices).where(eq3(invoices.userId, userId));
    await tx.delete(clients).where(eq3(clients.userId, userId));
  });
  await invalidateUserCache(userId);
  return ApiResponse.success(res, { message: "Workspace successfully reset to a clean slate." });
});

// src/controllers/admin.controller.ts
init_db();
init_schema();

// src/db/planRequests.ts
init_db();
init_schema();
import { eq as eq4, desc } from "drizzle-orm";
async function createPlanRequest(userId, data) {
  const [created] = await db.insert(planRequests).values({
    userId,
    businessName: data.businessName,
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone,
    industryType: data.industryType,
    requestedPlan: data.requestedPlan,
    businessNeeds: data.businessNeeds || "",
    status: "pending"
  }).returning();
  return created;
}
async function getAllPlanRequests() {
  return await db.select().from(planRequests).orderBy(desc(planRequests.createdAt));
}
async function updatePlanRequestStatus(id, status) {
  const [updated] = await db.update(planRequests).set({ status }).where(eq4(planRequests.id, id)).returning();
  return updated;
}

// src/services/email.service.ts
import nodemailer from "nodemailer";
var transporter = null;
function getEmailTransporter() {
  if (transporter) return transporter;
  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    return transporter;
  }
  if (smtpUser && smtpPass && (smtpUser.includes("@gmail.com") || process.env.EMAIL_SERVICE === "gmail")) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    return transporter;
  }
  return null;
}
async function sendAdminPlanRequestNotification(data) {
  const adminEmail = config3.superAdminEmails[0] || "arai.343531@gmail.com";
  const planLabel = data.requestedPlan === "pro_499" ? "Pro Growth Plan (\u20B9499/mo)" : data.requestedPlan === "starter_299" ? "Starter Plan (\u20B9299/mo)" : "15-Day Free Trial (\u20B90)";
  const subject = `\u{1F514} [Kwik-Bill] New Subscription Request: ${data.businessName} (${planLabel})`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
      <div style="background-color: #4f46e5; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px;">New Subscription & Onboarding Request</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Kwik-Bill SaaS Management Console</p>
      </div>

      <p style="font-size: 14px; color: #334155; line-height: 1.5;">
        A new company has requested to subscribe to <strong>${planLabel}</strong>. Below are their requirement details:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 40%;">Company / Trade Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${data.businessName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Contact Person:</td>
          <td style="padding: 10px 0; color: #0f172a;">${data.contactPerson}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">WhatsApp Mobile:</td>
          <td style="padding: 10px 0; color: #0f172a; font-family: monospace; font-weight: bold;">${data.phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Email Address:</td>
          <td style="padding: 10px 0; color: #0f172a;">${data.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Industry Segment:</td>
          <td style="padding: 10px 0; color: #0f172a; text-transform: capitalize;">${data.industryType}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Requested Plan:</td>
          <td style="padding: 10px 0; color: #4f46e5; font-weight: bold;">${planLabel}</td>
        </tr>
        ${data.businessNeeds ? `<tr>
                <td style="padding: 10px 0; font-weight: bold; color: #64748b; vertical-align: top;">Business Needs:</td>
                <td style="padding: 10px 0; color: #0f172a; background: #f8fafc; padding: 10px; border-radius: 6px;">${data.businessNeeds}</td>
              </tr>` : ""}
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #334155;">
        <strong>Next Steps:</strong> Log in to your SuperAdmin Master Console to review, provision, or approve this company's subscription.
      </div>

      <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
        Kwik-Bill SaaS \u2022 Automated Lead & Subscription Notification Engine
      </div>
    </div>
  `;
  const mailTransporter = getEmailTransporter();
  if (mailTransporter) {
    try {
      const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"Kwik-Bill Subscriptions" <${process.env.SMTP_USER || "notifications@kwikbill.com"}>`;
      await mailTransporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject,
        html: htmlContent
      });
      console.log(`[Email Service] Subscription request notification successfully sent to Admin (${adminEmail})`);
      return true;
    } catch (err) {
      console.error("[Email Service] Failed to send email via SMTP:", err);
    }
  } else {
    console.log(`[Email Service - Notification Logged]`);
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Company: ${data.businessName} | Contact: ${data.contactPerson} | Phone: ${data.phone} | Plan: ${data.requestedPlan}`);
  }
  return false;
}

// src/controllers/admin.controller.ts
var getTenants = asyncHandler(async (req, res) => {
  const tenants = await getAllTenants();
  return ApiResponse.success(res, { tenants });
});
var postTenant = asyncHandler(async (req, res) => {
  const { email, businessName, phone, industryType, subscriptionPlan, upiId } = req.body;
  if (!email || !email.trim()) {
    throw new BadRequestError("Company email is required.");
  }
  const generatedUid = `manual-onboard-${Date.now()}`;
  const created = await db.insert(users).values({
    uid: generatedUid,
    email: email.trim(),
    businessName: businessName || "New Business Client",
    phone: phone || "",
    upiId: upiId || "",
    industryType: industryType || "transport",
    subscriptionPlan: subscriptionPlan || "pro_499",
    subscriptionStatus: "active",
    role: "subscriber"
  }).returning();
  await invalidateAdminCache("tenants");
  return ApiResponse.success(res, { tenant: created[0] }, 201, "Tenant onboarded successfully");
});
var putTenantSubscription = asyncHandler(async (req, res) => {
  const tenantId = parsePositiveInt(req.params.id, "tenant ID");
  const { plan, status } = req.body;
  if (!plan || !status) {
    throw new BadRequestError("Both plan and status are required.");
  }
  const updated = await updateTenantSubscription(tenantId, plan, status);
  await Promise.all([
    invalidateAdminCache("tenants"),
    invalidateUserCache(tenantId, "profile")
  ]);
  return ApiResponse.success(res, { tenant: updated });
});
var submitPlanRequest = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const { businessName, contactPerson, email, phone, industryType, requestedPlan, businessNeeds } = req.body;
  if (!businessName || !contactPerson || !phone || !requestedPlan) {
    throw new BadRequestError("Business name, contact person, phone, and requested plan are required.");
  }
  const created = await createPlanRequest(userId, {
    businessName,
    contactPerson,
    email: email || req.dbUser.email,
    phone,
    industryType: industryType || "general",
    requestedPlan,
    businessNeeds
  });
  await invalidateAdminCache("plan-requests");
  sendAdminPlanRequestNotification({
    businessName,
    contactPerson,
    email: email || req.dbUser.email,
    phone,
    industryType: industryType || "general",
    requestedPlan,
    businessNeeds,
    userId
  }).catch((err) => console.error("[Admin Notification Error]:", err));
  return ApiResponse.success(res, { request: created }, 201, "Plan request submitted successfully");
});
var getPlanRequestsList = asyncHandler(async (req, res) => {
  const requests = await getAllPlanRequests();
  return ApiResponse.success(res, { requests });
});
var putPlanRequestStatus = asyncHandler(async (req, res) => {
  const requestId = parsePositiveInt(req.params.id, "plan request ID");
  const { status, approveAsSubscriber, userId, requestedPlan } = req.body;
  if (!status) {
    throw new BadRequestError("Status is required.");
  }
  const updated = await updatePlanRequestStatus(requestId, status);
  if (approveAsSubscriber && userId && requestedPlan) {
    await updateTenantSubscription(Number(userId), requestedPlan, "active");
    await invalidateUserCache(Number(userId), "profile");
  }
  await invalidateAdminCache("plan-requests", "tenants");
  return ApiResponse.success(res, { request: updated });
});

// src/controllers/cache.controller.ts
var resetUserCache = asyncHandler(async (req, res) => {
  const userId = req.dbUser?.id;
  if (userId) {
    await invalidateUserCache(userId);
  }
  return ApiResponse.success(res, {
    message: "Cache successfully cleared for your workspace.",
    userId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var flushGlobalCache = asyncHandler(async (_req, res) => {
  const flushed = await flushAllCache();
  return ApiResponse.success(res, {
    message: flushed ? "All system cache keys flushed successfully." : "Redis cache is offline or could not be flushed.",
    flushed,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var getCacheHealthStats = asyncHandler(async (_req, res) => {
  const stats = await getCacheStats();
  return ApiResponse.success(res, { stats });
});

// src/lib/firebase-admin.ts
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
var projectId = process.env.FIREBASE_PROJECT_ID || "invoice-saas-app-fc503";
if (!getApps().length) {
  initializeApp({
    projectId
  });
}
var adminAuth = getAuth();

// src/middleware/auth.ts
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const isDevOrDemo = config3.allowDemoAuth;
  let dbUser = null;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (isDevOrDemo) {
      const demoUid = "demo-business-owner-101";
      const demoEmail = "owner@speedytrans.in";
      try {
        dbUser = await getOrCreateUser(demoUid, demoEmail, "Speedy Transport & Logistics");
        req.user = { uid: demoUid, email: demoEmail, name: "Speedy Transport Logistics" };
        req.dbUser = dbUser;
      } catch (err) {
        console.error("Error creating/fetching fallback user:", err);
        return res.status(500).json({ success: false, error: { code: "SESSION_INIT_ERROR", message: "Database session initialization error" } });
      }
    } else {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized: Missing or invalid Authorization header." } });
    }
  } else {
    const token = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      dbUser = await getOrCreateUser(
        decodedToken.uid,
        decodedToken.email || "user@example.com",
        decodedToken.name || "My Business"
      );
      req.user = decodedToken;
      req.dbUser = dbUser;
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error);
      if (isDevOrDemo) {
        const demoUid = "demo-business-owner-101";
        const demoEmail = "owner@speedytrans.in";
        dbUser = await getOrCreateUser(demoUid, demoEmail, "Speedy Transport & Logistics");
        req.user = { uid: demoUid, email: demoEmail, name: "Speedy Transport Logistics" };
        req.dbUser = dbUser;
      } else {
        return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Unauthorized: Invalid or expired authentication token." } });
      }
    }
  }
  if (req.dbUser?.uid === "demo-business-owner-101") {
    const isWriteMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    if (isWriteMethod) {
      const url = req.originalUrl || req.url || "";
      const isPlanRequest = req.method === "POST" && url.includes("/plan-request");
      const isCacheReset = req.method === "POST" && url.includes("/cache/reset");
      if (!isPlanRequest && !isCacheReset) {
        return res.status(403).json({
          success: false,
          error: {
            code: "DEMO_READ_ONLY",
            message: "You are viewing the demo workspace in read-only mode. Please sign in or create an account to create, edit, or delete data."
          }
        });
      }
    }
  }
  const isSuspendedAccount = req.dbUser && ["suspended", "inactive", "cancelled"].includes(req.dbUser.subscriptionStatus);
  if (isSuspendedAccount) {
    const isSuperAdmin = req.dbUser.role === "superadmin" || isSuperAdminEmail(req.dbUser.email);
    if (!isSuperAdmin) {
      const url = req.originalUrl || req.url || "";
      const isProfileGet = req.method === "GET" && url.includes("/profile");
      const isPlanRequest = req.method === "POST" && url.includes("/plan-request");
      if (!isProfileGet && !isPlanRequest) {
        return res.status(403).json({
          success: false,
          error: {
            code: "ACCOUNT_SUSPENDED",
            message: "Your account has been suspended by the platform administrator. Please contact support."
          }
        });
      }
    }
  }
  if (req.dbUser) {
    const isSuperAdmin = req.dbUser.role === "superadmin" || isSuperAdminEmail(req.dbUser.email);
    if (!isSuperAdmin && req.dbUser.subscriptionStatus !== "active") {
      const isTrial = req.dbUser.subscriptionStatus === "trial" || req.dbUser.subscriptionPlan === "trial_15_days";
      const isTrialEnded = Boolean(
        isTrial && req.dbUser.trialEndsAt && new Date(req.dbUser.trialEndsAt).getTime() <= Date.now()
      );
      const isStatusExpired = req.dbUser.subscriptionStatus === "expired";
      if (isTrialEnded || isStatusExpired) {
        const url = req.originalUrl || req.url || "";
        const isProfileGet = req.method === "GET" && url.includes("/profile");
        const isPlanRequest = req.method === "POST" && url.includes("/plan-request");
        if (!isProfileGet && !isPlanRequest) {
          return res.status(403).json({
            success: false,
            error: {
              code: "TRIAL_EXPIRED",
              message: "Your 15-day free trial has expired. Please upgrade to a paid plan to continue."
            }
          });
        }
      }
    }
  }
  next();
};

// src/middleware/cacheMiddleware.ts
var cacheResponse = (resourceName, ttlSeconds = 180, options = {}) => {
  const { includeQueryParams = true, customKeyGenerator } = options;
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    if (!isCacheAvailable()) {
      res.setHeader("X-Cache", "BYPASS");
      return next();
    }
    try {
      let cacheKey;
      if (customKeyGenerator) {
        cacheKey = customKeyGenerator(req);
      } else {
        const userId = req.dbUser?.id;
        const isSuperAdminRoute = resourceName.startsWith("admin:") || req.originalUrl.includes("/admin/");
        let prefix;
        if (isSuperAdminRoute) {
          prefix = `cache:admin:${resourceName.replace("admin:", "")}`;
        } else if (userId) {
          prefix = `cache:${userId}:${resourceName}`;
        } else {
          prefix = `cache:public:${resourceName}`;
        }
        const paramsKey = Object.keys(req.params).length > 0 ? `:${Object.entries(req.params).map(([k, v]) => `${k}=${v}`).join("&")}` : "";
        let queryKey = "";
        if (includeQueryParams && Object.keys(req.query).length > 0) {
          const sortedQuery = Object.keys(req.query).sort().map((k) => `${k}=${req.query[k]}`).join("&");
          queryKey = `:qs:${sortedQuery}`;
        }
        cacheKey = `${prefix}${paramsKey}${queryKey}`;
      }
      const cachedData = await getCache(cacheKey);
      if (cachedData !== null) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-Key", cacheKey);
        const magenta = "\x1B[35m";
        const cyan = "\x1B[36m";
        const gray = "\x1B[90m";
        const reset = "\x1B[0m";
        console.log(
          `${magenta}[Redis Cache HIT]${reset} ${cyan}${req.method.padEnd(6)}${reset} ${req.originalUrl || req.url} ${gray}(Serving cached response from key: ${cacheKey})${reset}`
        );
        return res.status(200).json(cachedData);
      }
      res.setHeader("X-Cache", "MISS");
      res.setHeader("X-Cache-Key", cacheKey);
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && body) {
          setCache(cacheKey, body, ttlSeconds).catch((err) => {
            console.debug(`[Redis] Failed to cache key "${cacheKey}":`, err);
          });
        }
        return originalJson(body);
      };
      next();
    } catch (err) {
      console.debug("[Redis] Cache middleware error, proceeding with bypass:", err);
      res.setHeader("X-Cache", "ERROR-BYPASS");
      next();
    }
  };
};

// src/middleware/validate.ts
function formatZodError(error) {
  const fieldErrors = {};
  const messages = [];
  for (const issue of error.issues) {
    const fieldPath = issue.path.length > 0 ? issue.path.join(".") : "root";
    if (!fieldErrors[fieldPath]) {
      fieldErrors[fieldPath] = issue.message;
      messages.push(issue.message);
    }
  }
  const summary = messages.length === 1 ? messages[0] : `Validation error: ${messages.slice(0, 2).join("; ")}${messages.length > 2 ? ` (+${messages.length - 2} more)` : ""}`;
  return { summary, fieldErrors };
}
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const { summary, fieldErrors } = formatZodError(result.error);
      return next(new BadRequestError(summary, { fieldErrors }));
    }
    req.body = result.data;
    next();
  };
}

// src/lib/validators/index.ts
import { z } from "zod";

// src/lib/validators/regexPatterns.ts
var EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
var PHONE_REGEX = /^(?:\+?(?:91)?[ -]?)?[6-9]\d{9}$|^\+?[1-9]\d{6,14}$/;
var GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
var PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
var IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
var UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;
var HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
var BANK_ACCOUNT_REGEX = /^[0-9]{9,18}$/;
var HSN_SAC_REGEX = /^[0-9]{2,8}$/;
var INVOICE_NUMBER_REGEX = /^[a-zA-Z0-9/_-]{1,50}$/;

// src/lib/validators/index.ts
var emailField = z.string().trim().min(1, "Email address cannot be empty.").max(255, "Email address cannot exceed 255 characters.").regex(EMAIL_REGEX, "Please enter a valid email address (e.g. name@company.com).").toLowerCase();
var optionalEmailField = z.string().trim().max(255, "Email address cannot exceed 255 characters.").optional().or(z.literal("")).refine((val) => !val || EMAIL_REGEX.test(val), {
  message: "Please enter a valid email address format."
});
var passwordField = z.string().min(8, "Password must be at least 8 characters long.").max(128, "Password cannot exceed 128 characters.").refine((val) => /[a-zA-Z]/.test(val), {
  message: "Password must contain at least one letter."
}).refine((val) => /[0-9]/.test(val), {
  message: "Password must contain at least one numeric digit."
});
var phoneField = z.string().trim().min(1, "Phone number is required.").refine((val) => {
  const cleaned = val.replace(/[\s\-()]/g, "");
  return PHONE_REGEX.test(cleaned);
}, {
  message: "Please enter a valid phone number (10-digit mobile or international format)."
});
var optionalPhoneField = z.string().trim().optional().or(z.literal("")).refine((val) => {
  if (!val) return true;
  const cleaned = val.replace(/[\s\-()]/g, "");
  return PHONE_REGEX.test(cleaned);
}, {
  message: "Please enter a valid phone number (10-digit mobile or international format)."
});
var optionalGstinField = z.string().trim().optional().or(z.literal("")).refine((val) => !val || GSTIN_REGEX.test(val.toUpperCase()), {
  message: "GSTIN must be exactly 15 alphanumeric characters (e.g. 27AAPFU0939F1ZV)."
}).transform((val) => val ? val.toUpperCase() : "");
var optionalPanField = z.string().trim().optional().or(z.literal("")).refine((val) => !val || PAN_REGEX.test(val.toUpperCase()), {
  message: "PAN must be a valid 10-character code (e.g. ABCDE1234F)."
}).transform((val) => val ? val.toUpperCase() : "");
var optionalIfscField = z.string().trim().optional().or(z.literal("")).refine((val) => !val || IFSC_REGEX.test(val.toUpperCase()), {
  message: "IFSC code must be 11 characters (e.g. HDFC0001234)."
}).transform((val) => val ? val.toUpperCase() : "");
var optionalUpiField = z.string().trim().optional().or(z.literal("")).refine((val) => !val || UPI_REGEX.test(val), {
  message: "UPI ID must be in standard format (e.g. yourname@okaxis or 9876543210@upi)."
});
var optionalBankAccountField = z.string().trim().optional().or(z.literal("")).refine((val) => !val || BANK_ACCOUNT_REGEX.test(val.replace(/\s/g, "")), {
  message: "Bank account number must be between 9 and 18 digits."
});
var optionalHexColorField = z.string().trim().optional().or(z.literal("")).refine((val) => !val || HEX_COLOR_REGEX.test(val), {
  message: "Brand color must be a valid hex code (e.g. #4f46e5)."
});
var loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password cannot be empty.")
});
var registerSchema = z.object({
  email: emailField,
  password: passwordField,
  confirmPassword: z.string().optional()
}).refine(
  (data) => {
    if (data.confirmPassword !== void 0 && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  }
);
var forgotPasswordSchema = z.object({
  email: emailField
});
var createClientSchema = z.object({
  name: z.string().trim().min(2, "Party name must be at least 2 characters.").max(100, "Party name cannot exceed 100 characters."),
  phone: phoneField,
  email: optionalEmailField,
  companyName: z.string().trim().max(120, "Company name cannot exceed 120 characters.").optional().or(z.literal("")),
  address: z.string().trim().max(300, "Address cannot exceed 300 characters.").optional().or(z.literal("")),
  gstin: optionalGstinField,
  industryType: z.enum(["transport", "agency", "freelancer", "consultant", "general"]).default("general"),
  paymentTermDays: z.coerce.number().int("Payment terms must be a whole number of days.").min(0, "Payment terms cannot be negative.").max(365, "Payment terms cannot exceed 365 days.").default(7),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters.").optional().or(z.literal("")),
  isActive: z.boolean().default(true).optional()
});
var updateClientSchema = createClientSchema.partial();
var lineItemSchema = z.object({
  description: z.string().trim().min(1, "Item description cannot be empty.").max(255, "Item description cannot exceed 255 characters."),
  quantity: z.coerce.number().positive("Quantity must be greater than 0.").max(1e6, "Quantity cannot exceed 1,000,000."),
  rate: z.coerce.number().min(0, "Rate cannot be negative.").max(1e8, "Rate cannot exceed 100,000,000."),
  gstRate: z.coerce.number().min(0, "GST rate cannot be negative.").max(100, "GST rate cannot exceed 100%.").default(18),
  amount: z.coerce.number().optional(),
  uqc: z.string().trim().max(10).optional().or(z.literal("")),
  hsnCode: z.string().trim().optional().or(z.literal("")).refine((val) => !val || HSN_SAC_REGEX.test(val), {
    message: "HSN/SAC code must be between 2 and 8 numeric digits."
  })
});
var rawInvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Invoice number cannot be empty.").max(50, "Invoice number cannot exceed 50 characters.").regex(INVOICE_NUMBER_REGEX, "Invoice number can only contain letters, numbers, hyphens, slashes, and underscores."),
  clientId: z.coerce.number().int().positive("Please select a valid client / party."),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invoice date must be in YYYY-MM-DD format."),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format."),
  items: z.array(lineItemSchema).min(1, "An invoice must contain at least one line item.").max(100, "An invoice cannot contain more than 100 line items."),
  subtotal: z.coerce.number().or(z.string()).optional(),
  taxRate: z.coerce.number().min(0).max(100).default(18),
  taxAmount: z.coerce.number().or(z.string()).optional(),
  tdsRate: z.coerce.number().min(0).max(30).default(0),
  tdsAmount: z.coerce.number().or(z.string()).optional(),
  discountAmount: z.coerce.number().min(0, "Discount cannot be negative.").default(0),
  totalAmount: z.coerce.number().or(z.string()).optional(),
  paidAmount: z.coerce.number().or(z.string()).optional(),
  status: z.enum(["pending", "paid", "overdue", "partial"]).optional(),
  currency: z.string().default("INR"),
  placeOfSupply: z.string().trim().max(100).optional().or(z.literal("")),
  isRcm: z.boolean().default(false).optional(),
  taxType: z.enum(["intra_state", "inter_state"]).default("intra_state").optional(),
  notes: z.string().trim().max(1e3, "Notes cannot exceed 1000 characters.").optional().or(z.literal("")),
  terms: z.string().trim().max(1e3, "Terms cannot exceed 1000 characters.").optional().or(z.literal("")),
  industryDetails: z.record(z.string(), z.any()).optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.string().optional(),
  autoSendWhatsApp: z.boolean().optional(),
  shareToken: z.string().optional()
});
var createInvoiceSchema = rawInvoiceSchema.refine(
  (data) => {
    return new Date(data.dueDate) >= new Date(data.issueDate);
  },
  {
    message: "Due date cannot be earlier than invoice issue date.",
    path: ["dueDate"]
  }
);
var updateInvoiceSchema = rawInvoiceSchema.partial();
var recordPaymentSchema = z.object({
  invoiceId: z.coerce.number().int().positive("Invalid invoice ID."),
  amount: z.coerce.number().positive("Payment amount must be greater than 0.").max(1e8, "Amount cannot exceed 100,000,000."),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date must be in YYYY-MM-DD format."),
  paymentMethod: z.enum(["cash", "upi", "bank_transfer", "card", "cheque", "razorpay", "other"]).default("upi"),
  notes: z.string().trim().max(200, "Notes/Transaction ID cannot exceed 200 characters.").optional().or(z.literal(""))
});
var updateProfileSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters.").max(120, "Business name cannot exceed 120 characters.").optional(),
  phone: optionalPhoneField,
  email: optionalEmailField,
  address: z.string().trim().max(300, "Business address cannot exceed 300 characters.").optional().or(z.literal("")),
  gstin: optionalGstinField,
  pan: optionalPanField,
  bankName: z.string().trim().max(100, "Bank name cannot exceed 100 characters.").optional().or(z.literal("")),
  bankAccountNo: optionalBankAccountField,
  bankIfsc: optionalIfscField,
  upiId: optionalUpiField,
  industryType: z.enum(["transport", "agency", "freelancer", "consultant", "general"]).optional(),
  // Branding
  logoUrl: z.string().trim().max(1e3).optional().or(z.literal("")),
  invoiceTemplate: z.enum(["modern", "corporate", "logistics", "creative", "classic", "dark_neon"]).optional(),
  brandColor: optionalHexColorField,
  customFooter: z.string().trim().max(500, "Custom footer cannot exceed 500 characters.").optional().or(z.literal("")),
  // WhatsApp Config
  whatsappProvider: z.enum(["meta", "generic"]).optional(),
  whatsappPhoneNumberId: z.string().trim().max(100).optional().or(z.literal("")),
  whatsappApiToken: z.string().trim().max(500).optional().or(z.literal(""))
});
var sendReminderSchema = z.object({
  invoiceId: z.coerce.number().int().positive("Valid invoice ID is required."),
  clientId: z.coerce.number().int().positive().optional(),
  channel: z.enum(["whatsapp", "email", "both"]).default("whatsapp").optional(),
  templateType: z.string().optional().default("standard"),
  templateName: z.string().optional(),
  recipientName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  totalAmount: z.coerce.number().or(z.string()).optional(),
  dueDate: z.string().optional(),
  messageContent: z.string().trim().max(4e3, "Reminder message cannot exceed 4000 characters.").optional().or(z.literal("")),
  recipientPhone: optionalPhoneField,
  recipientEmail: optionalEmailField,
  sendMethod: z.string().optional().default("wame"),
  pdfUrl: z.string().optional(),
  sendAsDocument: z.boolean().optional(),
  customMessage: z.string().trim().max(4e3, "Reminder message cannot exceed 4000 characters.").optional().or(z.literal(""))
});
var createRecurringSchema = z.object({
  clientId: z.coerce.number().int().positive("Please select a valid client."),
  frequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format."),
  nextRunDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Next run date must be in YYYY-MM-DD format."),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format.").optional().or(z.literal("")),
  items: z.array(lineItemSchema).min(1, "Recurring invoice must contain at least one line item."),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  terms: z.string().trim().max(500).optional().or(z.literal(""))
});
var adminUpdateTenantSchema = z.object({
  subscriptionPlan: z.enum(["trial_15_days", "starter_299", "pro_499"]).optional(),
  subscriptionStatus: z.enum(["trial", "active", "expired", "inactive", "suspended"]).optional(),
  extendDays: z.coerce.number().int().min(1, "Days must be at least 1.").max(365, "Cannot extend by more than 365 days at once.").optional()
});

// src/routes/user.routes.ts
var router = Router();
router.use(requireAuth);
router.get("/profile", cacheResponse("profile", 300), getUserProfile);
router.put("/profile", validateBody(updateProfileSchema), putUserProfile);
router.post("/reset", resetUserData);
router.post("/cache/reset", resetUserCache);
router.post("/plan-request", submitPlanRequest);
var user_routes_default = router;

// src/routes/clients.routes.ts
import { Router as Router2 } from "express";

// src/db/clients.ts
init_db();
init_schema();
import { eq as eq5, and, desc as desc2, inArray } from "drizzle-orm";
async function getClientsByUserId(userId) {
  try {
    return await db.select().from(clients).where(eq5(clients.userId, userId)).orderBy(desc2(clients.createdAt));
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    throw new Error("Failed to fetch clients.", { cause: error });
  }
}
async function createClient(userId, clientData) {
  try {
    const inserted = await db.insert(clients).values({
      userId,
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email || "",
      companyName: clientData.companyName || "",
      address: clientData.address || "",
      gstin: clientData.gstin || "",
      industryType: clientData.industryType || "general",
      paymentTermDays: clientData.paymentTermDays || 7,
      notes: clientData.notes || "",
      isActive: clientData.isActive !== void 0 ? clientData.isActive : true
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error("Failed to create client:", error);
    throw new Error("Failed to create client.", { cause: error });
  }
}
async function updateClient(userId, clientId, clientData) {
  try {
    const updated = await db.update(clients).set(clientData).where(and(eq5(clients.id, clientId), eq5(clients.userId, userId))).returning();
    return updated[0];
  } catch (error) {
    console.error("Failed to update client:", error);
    throw new Error("Failed to update client.", { cause: error });
  }
}
async function toggleClientActive(userId, clientId, isActive) {
  try {
    if (typeof isActive === "boolean") {
      const updated = await db.update(clients).set({ isActive }).where(and(eq5(clients.id, clientId), eq5(clients.userId, userId))).returning();
      return updated[0];
    } else {
      const existing = await db.select().from(clients).where(and(eq5(clients.id, clientId), eq5(clients.userId, userId)));
      if (!existing || existing.length === 0) {
        throw new Error("Client not found");
      }
      const newStatus = !existing[0].isActive;
      const updated = await db.update(clients).set({ isActive: newStatus }).where(and(eq5(clients.id, clientId), eq5(clients.userId, userId))).returning();
      return updated[0];
    }
  } catch (error) {
    console.error("Failed to toggle client status:", error);
    throw new Error(error?.message || "Failed to toggle client status.", { cause: error });
  }
}
async function deleteClient(userId, clientId) {
  try {
    return await db.transaction(async (tx) => {
      const clientInvoices = await tx.select({ id: invoices.id }).from(invoices).where(and(eq5(invoices.clientId, clientId), eq5(invoices.userId, userId)));
      const invoiceIds = clientInvoices.map((inv) => inv.id);
      if (invoiceIds.length > 0) {
        await tx.delete(payments).where(and(eq5(payments.userId, userId), inArray(payments.invoiceId, invoiceIds)));
      }
      await tx.delete(reminderLogs).where(and(eq5(reminderLogs.clientId, clientId), eq5(reminderLogs.userId, userId)));
      await tx.delete(recurringProfiles).where(and(eq5(recurringProfiles.clientId, clientId), eq5(recurringProfiles.userId, userId)));
      if (invoiceIds.length > 0) {
        await tx.delete(invoices).where(and(eq5(invoices.clientId, clientId), eq5(invoices.userId, userId)));
      }
      const deleted = await tx.delete(clients).where(and(eq5(clients.id, clientId), eq5(clients.userId, userId))).returning();
      return deleted[0];
    });
  } catch (error) {
    console.error("Failed to delete client:", error);
    throw new Error(error?.message || "Failed to delete client.", { cause: error });
  }
}

// src/services/clients.service.ts
async function getClientsService(userId) {
  return await getClientsByUserId(userId);
}
async function createClientService(userId, data) {
  if (!data.name || !data.name.trim()) {
    throw new BadRequestError("Client party name is required.");
  }
  if (!data.phone || !data.phone.trim()) {
    throw new BadRequestError("Client WhatsApp phone number is required.");
  }
  return await createClient(userId, {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || "",
    companyName: data.companyName?.trim() || "",
    address: data.address?.trim() || "",
    gstin: data.gstin?.trim() || "",
    industryType: data.industryType || "general",
    paymentTermDays: data.paymentTermDays ? Number(data.paymentTermDays) : 7,
    notes: data.notes || "",
    isActive: data.isActive !== void 0 ? Boolean(data.isActive) : true
  });
}
async function updateClientService(userId, clientId, data) {
  const updated = await updateClient(userId, clientId, data);
  if (!updated) {
    throw new NotFoundError("Client not found in your directory.");
  }
  return updated;
}
async function toggleClientStatusService(userId, clientId, isActive) {
  const updated = await toggleClientActive(userId, clientId, isActive);
  if (!updated) {
    throw new NotFoundError("Client not found.");
  }
  return updated;
}
async function deleteClientService(userId, clientId) {
  const deleted = await deleteClient(userId, clientId);
  if (!deleted) {
    throw new NotFoundError("Client not found or already deleted.");
  }
  return deleted;
}

// src/controllers/clients.controller.ts
var getClients = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const clientsList = await getClientsService(userId);
  return ApiResponse.success(res, { clients: clientsList });
});
var postClient = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const created = await createClientService(userId, req.body);
  await invalidateUserCache(userId, "clients", "analytics", "invoices");
  return ApiResponse.success(res, { client: created }, 201, "Client added successfully");
});
var putClient = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const clientId = parsePositiveInt(req.params.id, "client ID");
  const updated = await updateClientService(userId, clientId, req.body);
  await invalidateUserCache(userId, "clients", "analytics", "invoices");
  return ApiResponse.success(res, { client: updated }, 200, "Client updated successfully");
});
var toggleClient = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const clientId = parsePositiveInt(req.params.id, "client ID");
  const { isActive } = req.body || {};
  const updated = await toggleClientStatusService(
    userId,
    clientId,
    typeof isActive === "boolean" ? isActive : void 0
  );
  await invalidateUserCache(userId, "clients", "analytics", "invoices");
  return ApiResponse.success(res, { client: updated }, 200, "Client status updated");
});
var removeClient = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const clientId = parsePositiveInt(req.params.id, "client ID");
  await deleteClientService(userId, clientId);
  await invalidateUserCache(userId, "clients", "analytics", "invoices");
  return ApiResponse.success(res, { message: "Client deleted successfully" });
});

// src/routes/clients.routes.ts
var router2 = Router2();
router2.use(requireAuth);
router2.get("/", cacheResponse("clients", 180), getClients);
router2.post("/", validateBody(createClientSchema), postClient);
router2.put("/:id", validateBody(updateClientSchema), putClient);
router2.patch("/:id/toggle-status", toggleClient);
router2.post("/:id/toggle-status", toggleClient);
router2.delete("/:id", removeClient);
var clients_routes_default = router2;

// src/routes/invoices.routes.ts
import { Router as Router3 } from "express";

// src/db/invoices.ts
init_db();
init_schema();
import { eq as eq6, and as and2, desc as desc3, or, sql } from "drizzle-orm";
import crypto from "crypto";
function normalizeInvoiceFinancials(invoice) {
  if (!invoice) return invoice;
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const computedSubtotal = items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const rate = Number(it.rate) || 0;
    return acc + (Number(it.amount) || qty * rate);
  }, 0);
  const rawSubtotal = parseFloat(invoice.subtotal);
  const subtotal = !isNaN(rawSubtotal) && rawSubtotal > 0 ? rawSubtotal : computedSubtotal;
  const taxRate = parseFloat(invoice.taxRate) || 0;
  const rawTaxAmount = parseFloat(invoice.taxAmount);
  const taxAmount = !isNaN(rawTaxAmount) && rawTaxAmount > 0 ? rawTaxAmount : subtotal * taxRate / 100;
  const discountAmount = parseFloat(invoice.discountAmount) || 0;
  const tdsAmount = parseFloat(invoice.tdsAmount) || 0;
  const computedTotal = Math.max(0, subtotal + taxAmount - discountAmount - tdsAmount);
  const rawTotal = parseFloat(invoice.totalAmount);
  const totalAmount = !isNaN(rawTotal) && rawTotal > 0 ? rawTotal : computedTotal;
  return {
    ...invoice,
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2)
  };
}
async function getInvoicesByUserId(userId, options) {
  try {
    const conditions = [eq6(invoices.userId, userId)];
    if (options?.status && options.status !== "all") {
      conditions.push(eq6(invoices.status, options.status));
    }
    if (options?.search && options.search.trim()) {
      const s = `%${options.search.trim()}%`;
      conditions.push(
        or(
          sql`${invoices.invoiceNumber} ILIKE ${s}`,
          sql`${clients.name} ILIKE ${s}`,
          sql`${clients.companyName} ILIKE ${s}`
        )
      );
    }
    let query = db.select({
      invoice: invoices,
      client: clients
    }).from(invoices).innerJoin(clients, eq6(invoices.clientId, clients.id)).where(and2(...conditions)).orderBy(desc3(invoices.createdAt));
    if (options?.limit && options.limit > 0) {
      query = query.limit(options.limit);
      if (options.offset && options.offset > 0) {
        query = query.offset(options.offset);
      }
    }
    const list = await query;
    return list.map((item) => ({
      ...normalizeInvoiceFinancials(item.invoice),
      client: item.client
    }));
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    throw new Error("Failed to fetch invoices.", { cause: error });
  }
}
async function getInvoiceById(userId, invoiceId) {
  try {
    const rows = await db.select({
      invoice: invoices,
      client: clients
    }).from(invoices).innerJoin(clients, eq6(invoices.clientId, clients.id)).where(and2(eq6(invoices.id, invoiceId), eq6(invoices.userId, userId)));
    if (rows.length === 0) return null;
    const paymentRows = await db.select().from(payments).where(and2(eq6(payments.invoiceId, invoiceId), eq6(payments.userId, userId))).orderBy(desc3(payments.createdAt));
    const reminderRows = await db.select().from(reminderLogs).where(and2(eq6(reminderLogs.invoiceId, invoiceId), eq6(reminderLogs.userId, userId))).orderBy(desc3(reminderLogs.sentAt));
    return {
      ...normalizeInvoiceFinancials(rows[0].invoice),
      client: rows[0].client,
      payments: paymentRows,
      reminderLogs: reminderRows
    };
  } catch (error) {
    console.error("Failed to fetch invoice details:", error);
    throw new Error("Failed to fetch invoice details.", { cause: error });
  }
}
async function getInvoiceByNumberPublic(identifier) {
  try {
    const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const token = identifier ? identifier.trim() : "";
    if (!token) return null;
    const rows = await db.select({
      invoice: invoices,
      client: clients,
      merchant: {
        id: users3.id,
        businessName: users3.businessName,
        phone: users3.phone,
        upiId: users3.upiId,
        gstin: users3.gstin,
        address: users3.address,
        bankName: users3.bankName,
        bankAccountNo: users3.bankAccountNo,
        bankIfsc: users3.bankIfsc,
        industryType: users3.industryType,
        logoUrl: users3.logoUrl,
        invoiceTemplate: users3.invoiceTemplate,
        brandColor: users3.brandColor,
        customFooter: users3.customFooter
      }
    }).from(invoices).innerJoin(clients, eq6(invoices.clientId, clients.id)).innerJoin(users3, eq6(invoices.userId, users3.id)).where(eq6(invoices.shareToken, token));
    if (rows.length === 0) return null;
    return {
      ...normalizeInvoiceFinancials(rows[0].invoice),
      client: rows[0].client,
      merchant: rows[0].merchant
    };
  } catch (error) {
    console.error("Failed to fetch public invoice:", error);
    throw new Error("Failed to fetch public invoice.", { cause: error });
  }
}
async function createInvoice(userId, data) {
  try {
    const generatedShareToken = data.shareToken || `inv_live_${crypto.randomBytes(16).toString("hex")}`;
    const inserted = await db.insert(invoices).values({
      userId,
      clientId: data.clientId,
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: data.status || "pending",
      currency: data.currency || "INR",
      subtotal: data.subtotal,
      taxRate: data.taxRate || "18.00",
      taxAmount: data.taxAmount || "0.00",
      tdsRate: data.tdsRate || "0.00",
      tdsAmount: data.tdsAmount || "0.00",
      discountAmount: data.discountAmount || "0.00",
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount || "0.00",
      placeOfSupply: data.placeOfSupply || "",
      isRcm: data.isRcm ?? false,
      taxType: data.taxType || "intra_state",
      shareToken: generatedShareToken,
      isCancelled: false,
      items: data.items,
      industryDetails: data.industryDetails || {},
      notes: data.notes || "Thank you for your business! Please settle the dues promptly.",
      terms: data.terms || "Payment is due within the stipulated days."
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error("Failed to create invoice:", error);
    throw new Error("Failed to create invoice.", { cause: error });
  }
}
async function updateInvoiceStatus(userId, invoiceId, status, paidAmount) {
  try {
    const updateObj = { status, updatedAt: /* @__PURE__ */ new Date() };
    if (paidAmount !== void 0) {
      updateObj.paidAmount = paidAmount;
    }
    const updated = await db.update(invoices).set(updateObj).where(and2(eq6(invoices.id, invoiceId), eq6(invoices.userId, userId))).returning();
    return updated[0];
  } catch (error) {
    console.error("Failed to update invoice status:", error);
    throw new Error("Failed to update invoice status.", { cause: error });
  }
}
async function recordReminderSent(userId, invoiceId) {
  try {
    const updated = await db.update(invoices).set({
      reminderSentCount: sql`${invoices.reminderSentCount} + 1`,
      lastReminderSentAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and2(eq6(invoices.id, invoiceId), eq6(invoices.userId, userId))).returning();
    return updated[0];
  } catch (error) {
    console.error("Failed to update reminder count:", error);
  }
}
async function deleteInvoice(userId, invoiceId, reason) {
  try {
    const updated = await db.update(invoices).set({
      status: "cancelled",
      isCancelled: true,
      cancelReason: reason || "Cancelled by user / voided invoice",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and2(eq6(invoices.id, invoiceId), eq6(invoices.userId, userId))).returning();
    return updated[0];
  } catch (error) {
    console.error("Failed to cancel invoice:", error);
    throw new Error("Failed to cancel invoice.", { cause: error });
  }
}

// src/services/invoices.service.ts
init_schema();
init_db();
import { eq as eq7, and as and3 } from "drizzle-orm";
async function getInvoicesService(userId, options) {
  return await getInvoicesByUserId(userId, options);
}
async function getInvoiceByIdService(userId, invoiceId) {
  const invoice = await getInvoiceById(userId, invoiceId);
  if (!invoice) {
    throw new NotFoundError("Invoice not found or does not belong to your account.");
  }
  return invoice;
}
async function getPublicInvoiceService(invoiceNumberOrToken) {
  if (!invoiceNumberOrToken || !invoiceNumberOrToken.trim()) {
    throw new BadRequestError("Invoice identifier is required.");
  }
  const invoice = await getInvoiceByNumberPublic(invoiceNumberOrToken.trim());
  if (!invoice) {
    throw new NotFoundError("Invoice not found or public link has expired.");
  }
  return invoice;
}
async function createInvoiceService(userId, data) {
  const clientId = Number(data.clientId);
  if (isNaN(clientId) || clientId <= 0) {
    throw new BadRequestError("Valid clientId is required to generate an invoice.");
  }
  const clientExists = await db.select({ id: clients.id }).from(clients).where(and3(eq7(clients.id, clientId), eq7(clients.userId, userId))).limit(1);
  if (clientExists.length === 0) {
    throw new NotFoundError("Client not found in your client directory.");
  }
  if (!data.invoiceNumber || !data.invoiceNumber.trim()) {
    throw new BadRequestError("Invoice number is required.");
  }
  const itemsList = Array.isArray(data.items) ? data.items : [];
  const computedSubtotal = itemsList.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return acc + (Number(item.amount) || qty * rate);
  }, 0);
  const subtotalVal = data.subtotal !== void 0 && Number(data.subtotal) > 0 ? Number(data.subtotal) : computedSubtotal;
  const taxRateVal = Number(data.taxRate) || 0;
  const taxAmountVal = data.taxAmount !== void 0 && Number(data.taxAmount) >= 0 ? Number(data.taxAmount) : subtotalVal * taxRateVal / 100;
  const discountVal = Number(data.discountAmount) || 0;
  const tdsVal = Number(data.tdsAmount) || 0;
  const computedTotal = Math.max(0, subtotalVal + taxAmountVal - discountVal - tdsVal);
  const totalAmountVal = data.totalAmount !== void 0 && Number(data.totalAmount) > 0 ? Number(data.totalAmount) : computedTotal;
  return await createInvoice(userId, {
    ...data,
    clientId,
    issueDate: data.issueDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dueDate: data.dueDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    subtotal: subtotalVal.toFixed(2),
    taxRate: taxRateVal.toFixed(2),
    taxAmount: taxAmountVal.toFixed(2),
    tdsRate: (Number(data.tdsRate) || 0).toFixed(2),
    tdsAmount: tdsVal.toFixed(2),
    discountAmount: discountVal.toFixed(2),
    totalAmount: totalAmountVal.toFixed(2)
  });
}
async function updateInvoiceStatusService(userId, invoiceId, status, paidAmount) {
  const existing = await getInvoiceById(userId, invoiceId);
  if (!existing) {
    throw new NotFoundError("Invoice not found.");
  }
  return await updateInvoiceStatus(userId, invoiceId, status, paidAmount);
}
async function cancelInvoiceService(userId, invoiceId, reason) {
  const existing = await getInvoiceById(userId, invoiceId);
  if (!existing) {
    throw new NotFoundError("Invoice not found.");
  }
  return await deleteInvoice(userId, invoiceId, reason);
}

// src/controllers/invoices.controller.ts
var getInvoices = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const { page, limit, status, search } = req.query;
  const pageNum = page ? parseInt(page, 10) : void 0;
  const limitNum = limit ? parseInt(limit, 10) : void 0;
  const offset = pageNum && limitNum ? (pageNum - 1) * limitNum : void 0;
  const invoicesList = await getInvoicesService(userId, {
    limit: limitNum,
    offset,
    status,
    search
  });
  return res.json({
    success: true,
    invoices: invoicesList,
    pagination: limitNum ? { page: pageNum || 1, limit: limitNum, count: invoicesList.length } : void 0
  });
});
var getInvoice = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const invoiceId = parsePositiveInt(req.params.id, "invoice ID");
  const invoice = await getInvoiceByIdService(userId, invoiceId);
  return ApiResponse.success(res, { invoice });
});
var getPublicInvoice = asyncHandler(async (req, res) => {
  const invoiceNumber = req.params.invoiceNumber;
  const invoice = await getPublicInvoiceService(invoiceNumber);
  return ApiResponse.success(res, { invoice });
});
var postInvoice = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const created = await createInvoiceService(userId, req.body);
  await Promise.all([
    invalidateUserCache(userId, "invoices", "analytics", "clients", "payments"),
    invalidatePattern("cache:public:invoice-public*")
  ]);
  return ApiResponse.success(res, { invoice: created }, 201, "Invoice created successfully");
});
var putInvoiceStatus = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const invoiceId = parsePositiveInt(req.params.id, "invoice ID");
  const { status, paidAmount } = req.body;
  const updated = await updateInvoiceStatusService(userId, invoiceId, status, paidAmount);
  await Promise.all([
    invalidateUserCache(userId, "invoices", "analytics", "clients", "payments"),
    invalidatePattern("cache:public:invoice-public*")
  ]);
  return ApiResponse.success(res, { invoice: updated }, 200, "Invoice status updated");
});
var removeInvoice = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const invoiceId = parsePositiveInt(req.params.id, "invoice ID");
  const reason = req.body?.reason;
  await cancelInvoiceService(userId, invoiceId, reason);
  await Promise.all([
    invalidateUserCache(userId, "invoices", "analytics", "clients", "payments"),
    invalidatePattern("cache:public:invoice-public*")
  ]);
  return ApiResponse.success(res, { message: "Invoice cancelled successfully." });
});

// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
var getClientIp = (req) => {
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "127.0.0.1";
};
var generalApiLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: false,
  message: {
    success: false,
    error: "Too many requests. Please slow down and try again in a minute."
  }
});
var publicPayLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: false,
  message: {
    success: false,
    error: "Too many invoice lookup requests from this IP. Please try again later."
  }
});
var remindersLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: false,
  message: {
    success: false,
    error: "WhatsApp dispatch rate limit reached. Please wait a moment before sending more reminders."
  }
});
var checkoutLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: false,
  message: {
    success: false,
    error: "Too many payment requests initiated. Please retry shortly."
  }
});
var aiLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.dbUser?.id ? `user_${req.dbUser.id}` : getClientIp(req);
  },
  validate: false,
  message: {
    success: false,
    error: {
      code: "AI_RATE_LIMITED",
      message: "AI request rate limit reached (10 requests/minute). Please pause for a moment before your next prompt."
    }
  }
});

// src/routes/invoices.routes.ts
var router3 = Router3();
router3.get("/public/:invoiceNumber", publicPayLimiter, cacheResponse("invoice-public", 300), getPublicInvoice);
router3.use(requireAuth);
router3.get("/", cacheResponse("invoices", 120), getInvoices);
router3.get("/:id", cacheResponse("invoice-detail", 120), getInvoice);
router3.post("/", validateBody(createInvoiceSchema), postInvoice);
router3.put("/:id/status", putInvoiceStatus);
router3.delete("/:id", removeInvoice);
var invoices_routes_default = router3;

// src/routes/payments.routes.ts
import { Router as Router4 } from "express";

// src/services/payments.service.ts
init_db();
init_schema();
import { eq as eq8, and as and4, desc as desc4 } from "drizzle-orm";
async function recordPaymentService(userId, data) {
  const invoiceId = Number(data.invoiceId);
  const paymentAmount = parseFloat(String(data.amount || "0"));
  if (isNaN(invoiceId) || invoiceId <= 0) {
    throw new BadRequestError("Valid invoice ID is required.");
  }
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    throw new BadRequestError("Payment amount must be greater than 0.");
  }
  return await db.transaction(async (tx) => {
    const invRows = await tx.select().from(invoices).where(and4(eq8(invoices.id, invoiceId), eq8(invoices.userId, userId)));
    if (invRows.length === 0) {
      throw new NotFoundError("Invoice not found or does not belong to your account.");
    }
    const invoice = invRows[0];
    const inserted = await tx.insert(payments).values({
      userId,
      invoiceId,
      amount: paymentAmount.toFixed(2),
      paymentDate: data.paymentDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      paymentMethod: data.paymentMethod || "upi",
      referenceNumber: data.referenceNumber || "",
      notes: data.notes || ""
    }).returning();
    const allPayments = await tx.select().from(payments).where(and4(eq8(payments.invoiceId, invoiceId), eq8(payments.userId, userId)));
    const totalPaid = allPayments.reduce((acc, p) => acc + parseFloat(p.amount || "0"), 0);
    const invoiceTotal = parseFloat(invoice.totalAmount);
    let newStatus = "pending";
    if (totalPaid >= invoiceTotal) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partial";
    }
    await tx.update(invoices).set({
      status: newStatus,
      paidAmount: totalPaid.toFixed(2),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and4(eq8(invoices.id, invoiceId), eq8(invoices.userId, userId)));
    return inserted[0];
  });
}
async function getPaymentsService(userId) {
  return await db.select().from(payments).where(eq8(payments.userId, userId)).orderBy(desc4(payments.createdAt));
}

// src/controllers/payments.controller.ts
var getPayments = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const list = await getPaymentsService(userId);
  return ApiResponse.success(res, { payments: list });
});
var postPayment = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const recorded = await recordPaymentService(userId, req.body);
  await invalidateUserCache(userId, "payments", "invoices", "analytics");
  return ApiResponse.success(res, { payment: recorded }, 201, "Payment recorded successfully");
});

// src/routes/payments.routes.ts
var router4 = Router4();
router4.use(requireAuth);
router4.get("/", cacheResponse("payments", 180), getPayments);
router4.post("/", validateBody(recordPaymentSchema), postPayment);
var payments_routes_default = router4;

// src/routes/reminders.routes.ts
import { Router as Router5 } from "express";

// src/db/reminders.ts
init_db();
init_schema();
import { eq as eq9, desc as desc5 } from "drizzle-orm";
async function logWhatsAppReminder(userId, data) {
  try {
    const inserted = await db.insert(reminderLogs).values({
      userId,
      invoiceId: data.invoiceId,
      clientId: data.clientId,
      templateType: data.templateType || "standard",
      messageContent: data.messageContent,
      recipientPhone: data.recipientPhone,
      channel: data.channel || "whatsapp",
      status: data.status || "sent"
    }).returning();
    await recordReminderSent(userId, data.invoiceId);
    return inserted[0];
  } catch (error) {
    console.error("Failed to log reminder:", error);
    throw new Error("Failed to log reminder.", { cause: error });
  }
}
async function getReminderLogsByUserId(userId) {
  try {
    const logs = await db.select({
      log: reminderLogs,
      client: clients,
      invoice: invoices
    }).from(reminderLogs).leftJoin(clients, eq9(reminderLogs.clientId, clients.id)).leftJoin(invoices, eq9(reminderLogs.invoiceId, invoices.id)).where(eq9(reminderLogs.userId, userId)).orderBy(desc5(reminderLogs.sentAt));
    return logs.map((l) => ({
      ...l.log,
      clientName: l.client?.name || "Customer",
      companyName: l.client?.companyName || "",
      clientIsActive: l.client?.isActive !== false,
      invoiceNumber: l.invoice?.invoiceNumber || "",
      invoiceAmount: l.invoice?.totalAmount || "0.00",
      invoiceStatus: l.invoice?.status || "unknown",
      isCancelled: l.invoice?.isCancelled || l.invoice?.status === "cancelled"
    }));
  } catch (error) {
    console.error("Failed to fetch reminder logs:", error);
    throw new Error("Failed to fetch reminder logs.", { cause: error });
  }
}

// src/services/whatsapp.service.ts
function normalizeIndianPhoneNumber(phone) {
  let clean = (phone || "").replace(/[^0-9]/g, "");
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}
function generateWaMeUrl(cleanPhone, messageContent) {
  const encodedMsg = encodeURIComponent(messageContent);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}
async function sendWhatsAppMessage(params) {
  const cleanPhone = normalizeIndianPhoneNumber(params.recipientPhone);
  const whatsappUrl = generateWaMeUrl(cleanPhone, params.messageContent);
  const whatsappToken = params.merchantToken?.trim() || config3.whatsapp.token;
  const phoneNumberId = params.merchantPhoneNumberId?.trim() || config3.whatsapp.phoneNumberId;
  if (!whatsappToken || !phoneNumberId) {
    return {
      deliveryStatus: "sent",
      directApiSent: false,
      whatsappUrl
    };
  }
  try {
    const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const isDocument = Boolean(params.pdfUrl || params.sendAsDocument);
    let messagePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone
    };
    if (params.templateName || config3.whatsapp.defaultTemplate) {
      messagePayload.type = "template";
      messagePayload.template = {
        name: params.templateName || config3.whatsapp.defaultTemplate,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: params.recipientName || "Customer" },
              { type: "text", text: params.invoiceNumber || String(params.invoiceId || "") },
              { type: "text", text: params.totalAmount ? `\u20B9${params.totalAmount}` : "Pending Amount" },
              { type: "text", text: params.dueDate || "Due immediately" }
            ]
          }
        ]
      };
    } else if (isDocument && params.pdfUrl) {
      messagePayload.type = "document";
      messagePayload.document = {
        link: params.pdfUrl,
        caption: params.messageContent,
        filename: `Invoice_${params.invoiceNumber || params.invoiceId}.pdf`
      };
    } else {
      messagePayload.type = "text";
      messagePayload.text = {
        preview_url: true,
        body: params.messageContent
      };
    }
    const metaRes = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whatsappToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messagePayload)
    });
    const metaData = await metaRes.json();
    if (metaRes.ok && metaData.messages) {
      return {
        deliveryStatus: "delivered",
        directApiSent: true,
        whatsappUrl,
        apiResponse: metaData
      };
    } else {
      console.warn("[WhatsApp Service] Meta Cloud API warning:", metaData);
      return {
        deliveryStatus: "api_error",
        directApiSent: false,
        whatsappUrl,
        apiResponse: metaData
      };
    }
  } catch (error) {
    console.error("[WhatsApp Service] Request error:", error);
    return {
      deliveryStatus: "api_error",
      directApiSent: false,
      whatsappUrl,
      apiResponse: { error: error.message }
    };
  }
}

// src/controllers/reminders.controller.ts
var getReminderLogs = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const logs = await getReminderLogsByUserId(userId);
  return ApiResponse.success(res, { logs });
});
var sendReminder = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const dbUser = req.dbUser;
  const {
    invoiceId,
    clientId,
    templateType = "standard",
    templateName,
    recipientName,
    invoiceNumber,
    totalAmount,
    dueDate,
    messageContent,
    customMessage,
    recipientPhone,
    sendMethod,
    pdfUrl,
    sendAsDocument
  } = req.body;
  const parsedInvoiceId = parseInt(String(invoiceId), 10);
  if (isNaN(parsedInvoiceId) || parsedInvoiceId <= 0) {
    throw new BadRequestError("Valid invoiceId is required.");
  }
  const invoice = await getInvoiceById(userId, parsedInvoiceId);
  if (!invoice) {
    throw new NotFoundError("Invoice not found or does not belong to your business account.");
  }
  const parsedClientId = clientId ? parseInt(String(clientId), 10) : invoice.clientId;
  if (isNaN(parsedClientId) || parsedClientId <= 0) {
    throw new BadRequestError("Valid clientId is required.");
  }
  const finalMessage = (messageContent || customMessage || "").trim();
  if (!finalMessage) {
    throw new BadRequestError("Reminder message content cannot be empty.");
  }
  const targetPhone = (recipientPhone || invoice.client?.phone || "").trim();
  if (!targetPhone) {
    throw new BadRequestError("Recipient WhatsApp phone number is required.");
  }
  const cleanPhone = normalizeIndianPhoneNumber(targetPhone);
  let deliveryStatus = "sent";
  let directApiSent = false;
  let apiResponse = null;
  if (sendMethod === "direct") {
    const whatsappToken = dbUser?.whatsappApiToken?.trim();
    const phoneNumberId = dbUser?.whatsappPhoneNumberId?.trim();
    if (!whatsappToken || !phoneNumberId) {
      throw new BadRequestError(
        "Meta WhatsApp Cloud API credentials (Phone Number ID & Token) are not configured. Please configure them in Settings or send via wa.me."
      );
    }
    const sendResult = await sendWhatsAppMessage({
      recipientPhone: cleanPhone,
      messageContent: finalMessage,
      recipientName,
      invoiceNumber: invoiceNumber || invoice.invoiceNumber,
      invoiceId: parsedInvoiceId,
      totalAmount: totalAmount || invoice.totalAmount,
      dueDate: dueDate || invoice.dueDate,
      templateName,
      pdfUrl,
      sendAsDocument,
      merchantToken: whatsappToken,
      merchantPhoneNumberId: phoneNumberId
    });
    deliveryStatus = sendResult.deliveryStatus;
    directApiSent = sendResult.directApiSent;
    apiResponse = sendResult.apiResponse;
  }
  const log = await logWhatsAppReminder(userId, {
    invoiceId: parsedInvoiceId,
    clientId: parsedClientId,
    templateType,
    messageContent: finalMessage,
    recipientPhone: cleanPhone,
    status: deliveryStatus
  });
  await invalidateUserCache(userId, "reminders");
  const whatsappUrl = generateWaMeUrl(cleanPhone, finalMessage);
  return ApiResponse.success(res, {
    directApiSent,
    deliveryStatus,
    log,
    whatsappUrl,
    apiResponse
  });
});

// src/routes/reminders.routes.ts
var router5 = Router5();
router5.use(requireAuth);
router5.get("/logs", cacheResponse("reminders", 180), getReminderLogs);
router5.post("/send", remindersLimiter, validateBody(sendReminderSchema), sendReminder);
var reminders_routes_default = router5;

// src/routes/analytics.routes.ts
import { Router as Router6 } from "express";

// src/db/payments.ts
init_db();
init_schema();
import { eq as eq10, and as and6, desc as desc6 } from "drizzle-orm";
async function getPaymentsForUser(userId) {
  try {
    return await db.select().from(payments).where(eq10(payments.userId, userId)).orderBy(desc6(payments.createdAt));
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    throw new Error("Failed to fetch payments.", { cause: error });
  }
}

// src/controllers/analytics.controller.ts
var getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const invoicesList = await getInvoicesByUserId(userId);
  const paymentsList = await getPaymentsForUser(userId);
  const clientsList = await getClientsByUserId(userId);
  const activeInvoices = invoicesList.filter(
    (inv) => inv.status !== "cancelled" && !inv.isCancelled
  );
  const cancelledInvoices = invoicesList.filter(
    (inv) => inv.status === "cancelled" || inv.isCancelled
  );
  const activeInvoiceIds = new Set(activeInvoices.map((i) => i.id));
  const activePayments = paymentsList.filter((p) => activeInvoiceIds.has(p.invoiceId));
  const activeClients = clientsList.filter((c) => c.isActive !== false);
  const disabledClients = clientsList.filter((c) => c.isActive === false);
  let totalInvoiced = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  let ageing0to15 = 0;
  let ageing16to30 = 0;
  let ageing31to60 = 0;
  let ageing60plus = 0;
  let expectedNext7Days = 0;
  let expectedNext30Days = 0;
  const today = /* @__PURE__ */ new Date();
  const todayStr = today.toISOString().split("T")[0];
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
  activeInvoices.forEach((inv) => {
    const total = parseFloat(inv.totalAmount || "0");
    const paid = parseFloat(inv.paidAmount || "0");
    const outstanding = Math.max(0, total - paid);
    totalInvoiced += total;
    totalCollected += paid;
    if (inv.status === "paid" || outstanding <= 0) {
    } else if (inv.status === "overdue" || inv.dueDate && inv.dueDate < todayStr) {
      totalOverdue += outstanding;
      if (inv.dueDate) {
        const due = new Date(inv.dueDate);
        const diffDays = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1e3 * 60 * 60 * 24)));
        if (diffDays <= 15) ageing0to15 += outstanding;
        else if (diffDays <= 30) ageing16to30 += outstanding;
        else if (diffDays <= 60) ageing31to60 += outstanding;
        else ageing60plus += outstanding;
      } else {
        ageing0to15 += outstanding;
      }
    } else {
      totalPending += outstanding;
      if (inv.dueDate >= todayStr && inv.dueDate <= in7Days) {
        expectedNext7Days += outstanding;
      }
      if (inv.dueDate >= todayStr && inv.dueDate <= in30Days) {
        expectedNext30Days += outstanding;
      }
    }
  });
  const clientRiskMap = {};
  clientsList.forEach((c) => {
    if (c.isActive === false) {
      clientRiskMap[c.id] = { score: 0, riskLevel: "low", label: "Disabled Party (Inactive)", avgDelayDays: 0 };
      return;
    }
    const clientActiveInvoices = activeInvoices.filter((i) => i.clientId === c.id);
    if (clientActiveInvoices.length === 0) {
      clientRiskMap[c.id] = { score: 95, riskLevel: "low", label: "New Party \u2022 Reliable", avgDelayDays: 0 };
      return;
    }
    let totalClientOverdue = 0;
    let totalClientBilled = 0;
    let overdueCount = 0;
    clientActiveInvoices.forEach((i) => {
      const tot = parseFloat(i.totalAmount || "0");
      const pd = parseFloat(i.paidAmount || "0");
      totalClientBilled += tot;
      if (i.status === "overdue" || i.dueDate < todayStr && i.status !== "paid") {
        totalClientOverdue += tot - pd;
        overdueCount++;
      }
    });
    const overdueRatio = totalClientBilled > 0 ? totalClientOverdue / totalClientBilled : 0;
    let score = 100 - Math.round(overdueRatio * 60) - overdueCount * 8;
    score = Math.max(20, Math.min(99, score));
    if (score >= 80) {
      clientRiskMap[c.id] = { score, riskLevel: "low", label: "Prompt Payer (Avg 2-4 Days)", avgDelayDays: 2 };
    } else if (score >= 50) {
      clientRiskMap[c.id] = { score, riskLevel: "medium", label: "Moderate Risk (Avg 7-14 Days)", avgDelayDays: 9 };
    } else {
      clientRiskMap[c.id] = { score, riskLevel: "high", label: "High Delay Risk (15+ Days)", avgDelayDays: 22 };
    }
  });
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const curMonthIdx = (/* @__PURE__ */ new Date()).getMonth();
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
          monthInvoiced += parseFloat(inv.totalAmount || "0");
        }
      }
    });
    activePayments.forEach((p) => {
      if (p.paymentDate) {
        const d = new Date(p.paymentDate);
        if (d.getMonth() === mIdx) {
          monthCollected += parseFloat(p.amount || "0");
        }
      }
    });
    trendData.push({
      month: monthName,
      invoiced: monthInvoiced,
      collected: monthCollected,
      pending: Math.max(0, monthInvoiced - monthCollected)
    });
  }
  const collectionRate = totalInvoiced > 0 ? Math.round(totalCollected / totalInvoiced * 100) : 0;
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
        days60plus: ageing60plus
      }
    },
    clientRiskMap,
    trendData
  });
});

// src/routes/analytics.routes.ts
var router6 = Router6();
router6.use(requireAuth);
router6.get("/", cacheResponse("analytics", 300), getAnalytics);
var analytics_routes_default = router6;

// src/routes/admin.routes.ts
import { Router as Router7 } from "express";

// src/middleware/admin.ts
var requireSuperAdmin = (req, res, next) => {
  const isSuperAdmin = req.dbUser?.role === "superadmin" || isSuperAdminEmail(req.user?.email) || isSuperAdminEmail(req.dbUser?.email);
  if (!isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Access Denied: SuperAdmin privileges required."
      }
    });
  }
  next();
};

// src/routes/admin.routes.ts
var router7 = Router7();
router7.use(requireAuth);
router7.use(requireSuperAdmin);
router7.get("/tenants", cacheResponse("admin:tenants", 120), getTenants);
router7.post("/tenants", postTenant);
router7.put("/tenants/:id/subscription", validateBody(adminUpdateTenantSchema), putTenantSubscription);
router7.get("/plan-requests", cacheResponse("admin:plan-requests", 120), getPlanRequestsList);
router7.put("/plan-requests/:id", putPlanRequestStatus);
router7.post("/cache/flush", flushGlobalCache);
router7.get("/cache/stats", getCacheHealthStats);
var admin_routes_default = router7;

// src/routes/recurring.routes.ts
import { Router as Router8 } from "express";

// src/db/recurring.ts
init_db();
init_schema();
import { eq as eq11, and as and7, desc as desc7, lte } from "drizzle-orm";
async function getRecurringProfilesByUserId(userId) {
  const rows = await db.select({
    profile: recurringProfiles,
    client: {
      id: clients.id,
      name: clients.name,
      companyName: clients.companyName,
      phone: clients.phone,
      email: clients.email
    }
  }).from(recurringProfiles).innerJoin(clients, eq11(recurringProfiles.clientId, clients.id)).where(eq11(recurringProfiles.userId, userId)).orderBy(desc7(recurringProfiles.createdAt));
  return rows.map((r) => ({
    ...r.profile,
    client: r.client
  }));
}
async function getRecurringProfileById(userId, id) {
  const rows = await db.select().from(recurringProfiles).where(and7(eq11(recurringProfiles.id, id), eq11(recurringProfiles.userId, userId))).limit(1);
  return rows.length > 0 ? rows[0] : null;
}
async function createRecurringProfileInDb(userId, data) {
  const inserted = await db.insert(recurringProfiles).values({
    userId,
    clientId: Number(data.clientId),
    title: data.title || "Recurring Retainer Billing",
    frequency: data.frequency || "monthly",
    interval: data.interval ? Number(data.interval) : 1,
    startDate: data.startDate,
    nextRunDate: data.nextRunDate || data.startDate,
    endDate: data.endDate || null,
    isActive: true,
    autoSendWhatsApp: data.autoSendWhatsApp ?? true,
    currency: data.currency || "INR",
    subtotal: String(data.subtotal || "0.00"),
    taxRate: String(data.taxRate || "18.00"),
    taxAmount: String(data.taxAmount || "0.00"),
    tdsRate: String(data.tdsRate || "0.00"),
    tdsAmount: String(data.tdsAmount || "0.00"),
    discountAmount: String(data.discountAmount || "0.00"),
    totalAmount: String(data.totalAmount || "0.00"),
    items: data.items || [],
    industryDetails: data.industryDetails || {},
    notes: data.notes || "Automated recurring invoice. Thank you for your continued business!",
    terms: data.terms || "Payment is due within 7 days of invoice generation."
  }).returning();
  return inserted[0];
}
async function toggleRecurringProfileInDb(userId, id) {
  const existing = await getRecurringProfileById(userId, id);
  if (!existing) return null;
  const updated = await db.update(recurringProfiles).set({
    isActive: !existing.isActive,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(and7(eq11(recurringProfiles.id, id), eq11(recurringProfiles.userId, userId))).returning();
  return updated.length > 0 ? updated[0] : null;
}
async function deleteRecurringProfileFromDb(userId, id) {
  const deleted = await db.delete(recurringProfiles).where(and7(eq11(recurringProfiles.id, id), eq11(recurringProfiles.userId, userId))).returning();
  return deleted.length > 0;
}
async function getDueRecurringProfiles(todayStr) {
  return await db.select({
    profile: recurringProfiles,
    client: clients,
    merchant: users
  }).from(recurringProfiles).innerJoin(clients, eq11(recurringProfiles.clientId, clients.id)).innerJoin(users, eq11(recurringProfiles.userId, users.id)).where(
    and7(
      eq11(recurringProfiles.isActive, true),
      lte(recurringProfiles.nextRunDate, todayStr)
    )
  );
}
async function updateRecurringProfileNextRun(id, nextRunDate, generatedCount, isActive) {
  return await db.update(recurringProfiles).set({
    nextRunDate,
    generatedCount,
    lastGeneratedAt: /* @__PURE__ */ new Date(),
    isActive,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq11(recurringProfiles.id, id)).returning();
}

// src/services/recurring.service.ts
function computeNextRunDate(currentDateStr, frequency, interval = 1) {
  const current = new Date(currentDateStr);
  const next = new Date(current);
  const safeInterval = Math.max(1, interval);
  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7 * safeInterval);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1 * safeInterval);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3 * safeInterval);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1 * safeInterval);
      break;
    default:
      next.setMonth(next.getMonth() + 1 * safeInterval);
  }
  return next.toISOString().split("T")[0];
}
function generateRecurringInvoiceNumber(prefix = "INV") {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const randomNum = Math.floor(1e3 + Math.random() * 9e3);
  return `${prefix}-${year}-${randomNum}`;
}
var isRecurringProcessing = false;
async function processRecurringInvoices() {
  if (isRecurringProcessing) {
    console.log("[Auto-Billing Engine] Scan already in progress. Skipping concurrent run.");
    return { count: 0, generated: [], message: "Scan already in progress" };
  }
  isRecurringProcessing = true;
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  try {
    const dueProfiles = await getDueRecurringProfiles(todayStr);
    if (dueProfiles.length === 0) {
      return { count: 0, generated: [] };
    }
    const generatedInvoices = [];
    for (const item of dueProfiles) {
      const p = item.profile;
      const client = item.client;
      const merchant = item.merchant;
      const issueDate = todayStr;
      const dueDateObj = /* @__PURE__ */ new Date();
      dueDateObj.setDate(dueDateObj.getDate() + (client.paymentTermDays || 7));
      const dueDate = dueDateObj.toISOString().split("T")[0];
      const invNumber = generateRecurringInvoiceNumber();
      const newInv = await createInvoice(p.userId, {
        clientId: p.clientId,
        invoiceNumber: invNumber,
        issueDate,
        dueDate,
        status: "pending",
        currency: p.currency,
        subtotal: p.subtotal,
        taxRate: p.taxRate || "18.00",
        taxAmount: p.taxAmount || "0.00",
        tdsRate: p.tdsRate || "0.00",
        tdsAmount: p.tdsAmount || "0.00",
        discountAmount: p.discountAmount || "0.00",
        totalAmount: p.totalAmount,
        items: p.items,
        industryDetails: p.industryDetails,
        notes: p.notes || "Automated recurring invoice.",
        terms: p.terms || "Payment due within stipulated terms."
      });
      const nextRunDate = computeNextRunDate(p.nextRunDate, p.frequency, p.interval);
      const isExpired = p.endDate && nextRunDate > p.endDate;
      await updateRecurringProfileNextRun(
        p.id,
        nextRunDate,
        p.generatedCount + 1,
        isExpired ? false : true
      );
      if (p.autoSendWhatsApp && client.phone) {
        const cleanPhone = normalizeIndianPhoneNumber(client.phone);
        const upiPayLink = merchant.upiId ? `upi://pay?pa=${merchant.upiId}&pn=${encodeURIComponent(merchant.businessName || "Business")}&am=${p.totalAmount}&cu=INR&tn=${encodeURIComponent(`Invoice ${invNumber}`)}` : "";
        const messageContent = `Hello *${client.name}*,

Greetings from *${merchant.businessName || "Our Business"}*! \u2728

Your automated recurring Invoice *#${invNumber}* for *\u20B9${p.totalAmount}* has been generated for *${issueDate}* (Due: *${dueDate}*).

${upiPayLink ? `\u{1F4F2} *Instant UPI Payment:*
${upiPayLink}

` : ""}Thank you for your valued partnership!`;
        await sendWhatsAppMessage({
          recipientPhone: cleanPhone,
          messageContent,
          recipientName: client.name,
          invoiceNumber: invNumber,
          invoiceId: newInv.id,
          totalAmount: p.totalAmount,
          dueDate,
          merchantToken: merchant.whatsappApiToken || void 0,
          merchantPhoneNumberId: merchant.whatsappPhoneNumberId || void 0
        });
      }
      generatedInvoices.push({
        profileId: p.id,
        invoiceId: newInv.id,
        invoiceNumber: invNumber,
        clientName: client.name,
        totalAmount: p.totalAmount
      });
      invalidateUserCache(p.userId, "invoices", "recurring", "analytics").catch(() => {
      });
      console.log(`[Auto-Billing Engine] Generated recurring invoice ${invNumber} for ${client.name} (\u20B9${p.totalAmount})`);
    }
    return { count: generatedInvoices.length, generated: generatedInvoices };
  } catch (error) {
    console.error("[Auto-Billing Engine] Error processing recurring invoices:", error);
    throw error;
  } finally {
    isRecurringProcessing = false;
  }
}

// src/controllers/recurring.controller.ts
var getRecurringProfiles = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const profiles = await getRecurringProfilesByUserId(userId);
  return ApiResponse.success(res, { profiles });
});
var createRecurringProfile = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const userRole = req.dbUser?.role;
  const userEmail = req.dbUser?.email;
  const userPlan = req.dbUser?.subscriptionPlan;
  const isProUser = userRole === "superadmin" || isSuperAdminEmail(userEmail) || userPlan === "pro_499";
  if (!isProUser) {
    throw new ForbiddenError(
      "Automated recurring billing is exclusively available on the Pro Growth Plan (\u20B9499/mo). Please upgrade to Pro to create recurring schedules."
    );
  }
  const { clientId, startDate, items, totalAmount } = req.body;
  if (!clientId || !startDate || !items || !totalAmount) {
    throw new BadRequestError("Missing required recurring fields: clientId, startDate, items, and totalAmount are mandatory.");
  }
  const created = await createRecurringProfileInDb(userId, req.body);
  await invalidateUserCache(userId, "recurring", "invoices", "analytics");
  return ApiResponse.success(res, { profile: created }, 201, "Recurring profile created successfully");
});
var toggleRecurringProfile = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const id = parsePositiveInt(req.params.id, "recurring profile ID");
  const updated = await toggleRecurringProfileInDb(userId, id);
  if (!updated) {
    throw new NotFoundError("Recurring profile not found.");
  }
  await invalidateUserCache(userId, "recurring");
  return ApiResponse.success(res, { profile: updated }, 200, "Recurring profile status toggled");
});
var deleteRecurringProfile = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const id = parsePositiveInt(req.params.id, "recurring profile ID");
  const deleted = await deleteRecurringProfileFromDb(userId, id);
  if (!deleted) {
    throw new NotFoundError("Recurring profile not found.");
  }
  await invalidateUserCache(userId, "recurring");
  return ApiResponse.success(res, { message: "Recurring profile deleted successfully" });
});
var triggerManualRun = asyncHandler(async (req, res) => {
  const result = await processRecurringInvoices();
  const userId = req.dbUser?.id;
  if (userId) {
    await invalidateUserCache(userId, "recurring", "invoices", "analytics");
  }
  return ApiResponse.success(res, { result });
});

// src/routes/recurring.routes.ts
var router8 = Router8();
router8.use(requireAuth);
router8.get("/", cacheResponse("recurring", 180), getRecurringProfiles);
router8.post("/", validateBody(createRecurringSchema), createRecurringProfile);
router8.put("/:id/toggle", toggleRecurringProfile);
router8.delete("/:id", deleteRecurringProfile);
router8.post("/trigger-run", requireSuperAdmin, triggerManualRun);
var recurring_routes_default = router8;

// src/routes/ai.routes.ts
import { Router as Router9 } from "express";

// src/services/agent.orchestrator.ts
import { GoogleGenAI } from "@google/genai";

// src/config/ai.config.ts
function buildSystemPrompt(ctx) {
  return `You are KwikBill AI \u2014 an expert, conversational billing & financial assistant built specifically for Indian businesses, SMEs, transporters, agencies, freelancers, and merchants.

BUSINESS CONTEXT (Active Merchant Workspace):
- Business Name: ${ctx.businessName || "My Business"}
- Merchant Email: ${ctx.email}
- Contact Phone: ${ctx.phone || "Not Set"}
- GSTIN: ${ctx.gstin || "Unregistered / Not Set"}
- Industry Segment: ${ctx.industryType}
- Subscription Plan: ${ctx.subscriptionPlan}
- UPI ID: ${ctx.upiId || "Not Set"}
- Bank Details: ${ctx.bankName ? `${ctx.bankName} (A/C: ${ctx.bankAccountNo}, IFSC: ${ctx.bankIfsc})` : "Not Set"}
- Current Date (India Standard Time): ${ctx.currentDate}

CORE CAPABILITIES & TOOLS:
1. Invoices: Query by status/date/party (e.g. "unpaid invoices from last month"), retrieve details, draft new invoices, update line items/GST/discounts, update status, cancel invoices.
2. Clients: Search client directory, add new customers/parties, update party profile.
3. Payments: Record collections (UPI, Bank Transfer, Cash, Cheque) against invoices.
4. WhatsApp Delivery: Send payment reminders or invoice PDFs via WhatsApp directly to clients.
5. PDF Generation: Generate downloadable, print-ready PDF invoices.
6. Analytics & Intelligence: Retrieve revenue metrics, cash flow forecasts, overdue ageing buckets, and party credit risk ratings.

CRITICAL BEHAVIORAL & SAFETY RULES:
1. ALWAYS confirm financial mutations if user did not explicitly say "confirm" or "proceed":
   - When creating a new invoice or recording a payment, unless the user explicitly gives complete confirmation, call the tool or draft the action and request confirmation, or return the draft invoice summary clearly for the user to review.
2. INDIAN FINANCIAL STANDARDS:
   - Format currency values in Indian Rupees (\u20B9) with appropriate comma separation (e.g. \u20B950,000, \u20B91,47,500).
   - Default GST rate is 18.00% unless specified otherwise (or 0%, 5%, 12%, 18%, 28%).
   - Understand Indian financial terms: GST, CGST, SGST, IGST, TDS, Place of Supply, E-way bill, LR number (lorry receipt).
3. DATE INTERPRETATION:
   - Interpret relative dates against today's date (${ctx.currentDate}).
   - "Last month" means the previous calendar month.
   - "Overdue" means invoices where dueDate < ${ctx.currentDate} and status != 'paid'.
4. MULTI-STEP CONVERSATION FLOWS:
   - Maintain context across follow-up queries. If user creates an invoice and then says "Add 18% GST", apply it to the invoice created in the recent context.
   - If user then says "Generate PDF" or "Send it through WhatsApp", use the active invoice ID.
5. CONCISE & ACTIONABLE RESPONSES:
   - Be professional, polite, concise, and helpful.
   - Use markdown tables or bullet points for readability. Highlight invoice numbers, totals, and due dates clearly.
`;
}
var AI_SUGGESTIONS = [
  "Show me unpaid invoices from last month",
  "Create an invoice for ABC Traders for \u20B950,000",
  "What is our total collection this month?",
  "Which clients have high payment delay risk?",
  "Send payment reminder for overdue invoices"
];

// src/services/tools/invoice.tool.ts
init_db();
init_schema();
import { eq as eq12, and as and8 } from "drizzle-orm";
var invoiceToolDeclarations = [
  {
    name: "query_invoices",
    description: "Query and filter invoices from PostgreSQL by status, client name, search query, or relative date ranges like last month or overdue.",
    parameters: {
      type: "OBJECT",
      properties: {
        status: {
          type: "STRING",
          description: "Filter status: 'pending', 'paid', 'overdue', 'partial', 'cancelled', or 'all'"
        },
        search: {
          type: "STRING",
          description: "Search string for invoice number, client name, or company"
        },
        clientName: {
          type: "STRING",
          description: "Filter specifically by customer or client name"
        },
        dateRange: {
          type: "STRING",
          description: "Relative date range: 'last_month', 'this_month', 'this_year', or 'overdue'"
        },
        limit: {
          type: "INTEGER",
          description: "Max number of invoices to return (default 10)"
        }
      }
    }
  },
  {
    name: "get_invoice_detail",
    description: "Get full details of a specific invoice including client info, line items, taxes, and payment history by invoice ID or invoice number.",
    parameters: {
      type: "OBJECT",
      properties: {
        invoiceId: {
          type: "INTEGER",
          description: "Numeric database ID of the invoice"
        },
        invoiceNumber: {
          type: "STRING",
          description: "Invoice number string (e.g. INV-2026-001)"
        }
      }
    }
  },
  {
    name: "create_invoice",
    description: "Draft or create a new invoice for a client. If the client name does not exist, it can automatically search or create it.",
    parameters: {
      type: "OBJECT",
      properties: {
        clientName: {
          type: "STRING",
          description: "The party/customer name for the invoice (e.g. ABC Traders)"
        },
        clientId: {
          type: "INTEGER",
          description: "Existing client ID if known"
        },
        clientPhone: {
          type: "STRING",
          description: "Client WhatsApp/Phone number if creating a new client on the fly"
        },
        items: {
          type: "ARRAY",
          description: "Array of line items with description, quantity, rate, amount",
          items: {
            type: "OBJECT",
            properties: {
              description: { type: "STRING" },
              quantity: { type: "NUMBER" },
              rate: { type: "NUMBER" },
              amount: { type: "NUMBER" },
              hsnCode: { type: "STRING" }
            },
            required: ["description", "rate"]
          }
        },
        subtotal: {
          type: "NUMBER",
          description: "Subtotal amount before taxes (if no items array specified)"
        },
        taxRate: {
          type: "NUMBER",
          description: "GST tax percentage (e.g. 18 for 18% GST). Defaults to 18 if not specified."
        },
        discountAmount: {
          type: "NUMBER",
          description: "Discount amount in INR"
        },
        tdsRate: {
          type: "NUMBER",
          description: "TDS rate percentage (e.g. 1, 2, 10)"
        },
        dueDate: {
          type: "STRING",
          description: "Due date in YYYY-MM-DD format"
        },
        issueDate: {
          type: "STRING",
          description: "Issue date in YYYY-MM-DD format"
        },
        vehicleNumber: {
          type: "STRING",
          description: "Transport vehicle registration number (e.g. MH-04-GP-8842)"
        },
        lrNumber: {
          type: "STRING",
          description: "Lorry receipt / Bilty number (e.g. LR-994201)"
        },
        routeSource: {
          type: "STRING",
          description: "Origin / departure location (e.g. JNPT Navi Mumbai)"
        },
        routeDestination: {
          type: "STRING",
          description: "Destination location (e.g. Ahmedabad, Gujarat)"
        },
        ewayBillNumber: {
          type: "STRING",
          description: "Government E-Way bill number"
        },
        placeOfSupply: {
          type: "STRING",
          description: "2-digit state code or state name for GST Place of Supply"
        },
        notes: {
          type: "STRING",
          description: "Customer notes or remarks"
        },
        terms: {
          type: "STRING",
          description: "Payment terms & conditions"
        },
        confirmAction: {
          type: "BOOLEAN",
          description: "Set to true ONLY when user has confirmed invoice creation approval card."
        }
      },
      required: ["clientName"]
    }
  },
  {
    name: "update_invoice_tax_and_totals",
    description: "Update the tax rate (GST %), discount, or line items on an existing invoice and recalculate totals.",
    parameters: {
      type: "OBJECT",
      properties: {
        invoiceId: {
          type: "INTEGER",
          description: "Database ID of the invoice to update"
        },
        taxRate: {
          type: "NUMBER",
          description: "New GST rate percentage (e.g. 18 for 18% GST)"
        },
        discountAmount: {
          type: "NUMBER",
          description: "New discount amount"
        },
        tdsRate: {
          type: "NUMBER",
          description: "TDS rate percentage if applicable"
        }
      },
      required: ["invoiceId"]
    }
  },
  {
    name: "update_invoice_status",
    description: "Update the status of an invoice to 'paid', 'pending', 'overdue', or 'partial'.",
    parameters: {
      type: "OBJECT",
      properties: {
        invoiceId: {
          type: "INTEGER",
          description: "Database ID of the invoice"
        },
        status: {
          type: "STRING",
          description: "New status: 'paid', 'pending', 'overdue', 'partial'"
        },
        paidAmount: {
          type: "STRING",
          description: "Total amount paid so far"
        }
      },
      required: ["invoiceId", "status"]
    }
  },
  {
    name: "cancel_invoice",
    description: "Cancel an invoice with a reason (GST-compliant soft delete).",
    parameters: {
      type: "OBJECT",
      properties: {
        invoiceId: {
          type: "INTEGER",
          description: "Database ID of the invoice to cancel"
        },
        reason: {
          type: "STRING",
          description: "Reason for cancellation"
        }
      },
      required: ["invoiceId"]
    }
  }
];
async function executeInvoiceTool(userId, functionName, args) {
  switch (functionName) {
    case "query_invoices": {
      const { status, search, clientName, dateRange, limit = 10 } = args;
      const invoicesList = await getInvoicesService(userId, {
        status: status && status !== "all" ? status : void 0,
        search: search || clientName || void 0,
        limit: Math.min(50, limit)
      });
      let filtered = invoicesList;
      if (dateRange) {
        const now = /* @__PURE__ */ new Date();
        if (dateRange === "last_month") {
          const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          const startStr = firstDayLastMonth.toISOString().split("T")[0];
          const endStr = lastDayLastMonth.toISOString().split("T")[0];
          filtered = filtered.filter((inv) => {
            const date = inv.issueDate || inv.createdAt;
            return date && date >= startStr && date <= endStr;
          });
        } else if (dateRange === "this_month") {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          filtered = filtered.filter((inv) => inv.issueDate >= firstDay);
        } else if (dateRange === "overdue") {
          const todayStr = now.toISOString().split("T")[0];
          filtered = filtered.filter((inv) => inv.status !== "paid" && inv.dueDate < todayStr);
        }
      }
      const totalAmount = filtered.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || "0"), 0);
      const totalPending = filtered.reduce((sum, inv) => {
        if (inv.status === "paid") return sum;
        const total = parseFloat(inv.totalAmount || "0");
        const paid = parseFloat(inv.paidAmount || "0");
        return sum + Math.max(0, total - paid);
      }, 0);
      return {
        count: filtered.length,
        totalInvoiced: `\u20B9${totalAmount.toLocaleString("en-IN")}`,
        totalPending: `\u20B9${totalPending.toLocaleString("en-IN")}`,
        invoices: filtered.slice(0, 15).map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          clientName: inv.client?.name || inv.client?.companyName || "Unknown Client",
          clientPhone: inv.client?.phone || "",
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          status: inv.status,
          totalAmount: `\u20B9${parseFloat(inv.totalAmount || "0").toLocaleString("en-IN")}`,
          paidAmount: `\u20B9${parseFloat(inv.paidAmount || "0").toLocaleString("en-IN")}`,
          shareToken: inv.shareToken
        }))
      };
    }
    case "get_invoice_detail": {
      const { invoiceId, invoiceNumber } = args;
      let invoice = null;
      if (invoiceId) {
        invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      } else if (invoiceNumber) {
        invoice = await getPublicInvoiceService(invoiceNumber);
      }
      if (!invoice) {
        return { error: "Invoice not found." };
      }
      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        client: {
          id: invoice.client?.id,
          name: invoice.client?.name,
          phone: invoice.client?.phone,
          companyName: invoice.client?.companyName,
          gstin: invoice.client?.gstin
        },
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        subtotal: `\u20B9${parseFloat(invoice.subtotal || "0").toLocaleString("en-IN")}`,
        taxRate: `${invoice.taxRate}%`,
        taxAmount: `\u20B9${parseFloat(invoice.taxAmount || "0").toLocaleString("en-IN")}`,
        discountAmount: `\u20B9${parseFloat(invoice.discountAmount || "0").toLocaleString("en-IN")}`,
        totalAmount: `\u20B9${parseFloat(invoice.totalAmount || "0").toLocaleString("en-IN")}`,
        paidAmount: `\u20B9${parseFloat(invoice.paidAmount || "0").toLocaleString("en-IN")}`,
        items: invoice.items,
        notes: invoice.notes,
        terms: invoice.terms,
        shareToken: invoice.shareToken,
        payments: invoice.payments || []
      };
    }
    case "create_invoice": {
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
        confirmAction = false
      } = args;
      const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: eq14 } = await import("drizzle-orm");
      const merchantRows = await db3.select().from(users3).where(eq14(users3.id, userId)).limit(1);
      const merchant = merchantRows[0] || {};
      let resolvedClientId = clientId;
      let resolvedClientName = clientName;
      let matchedClient = null;
      if (!resolvedClientId) {
        const existingClients = await getClientsService(userId);
        matchedClient = existingClients.find(
          (c) => c.name.toLowerCase().includes(clientName.toLowerCase()) || c.companyName && c.companyName.toLowerCase().includes(clientName.toLowerCase())
        );
        if (matchedClient) {
          resolvedClientId = matchedClient.id;
          resolvedClientName = matchedClient.name;
        } else if (confirmAction) {
          const newClient = await createClientService(userId, {
            name: clientName,
            phone: clientPhone || "9999999999",
            companyName: clientName
          });
          resolvedClientId = newClient.id;
          resolvedClientName = newClient.name;
          matchedClient = newClient;
        }
      }
      let computedItems = items;
      if (!computedItems || computedItems.length === 0) {
        const baseAmount = Number(subtotal) || 5e4;
        computedItems = [
          {
            description: routeSource && routeDestination ? `Freight Transportation: ${routeSource} \u2192 ${routeDestination}` : `Professional Services for ${clientName}`,
            quantity: 1,
            rate: baseAmount,
            amount: baseAmount,
            hsnCode: routeSource ? "9965" : "9983",
            uqc: routeSource ? "TRIP" : "NOS"
          }
        ];
      }
      const calcSubtotal = computedItems.reduce((acc, item) => acc + (Number(item.amount) || Number(item.quantity || 1) * Number(item.rate || 0)), 0);
      const calcTaxAmount = calcSubtotal * Number(taxRate) / 100;
      const calcTdsAmount = calcSubtotal * Number(tdsRate) / 100;
      const calcTotal = Math.max(0, calcSubtotal + calcTaxAmount - Number(discountAmount) - calcTdsAmount);
      const now = /* @__PURE__ */ new Date();
      const todayStr = issueDate || now.toISOString().split("T")[0];
      const dueStr = dueDate || new Date(now.getTime() + 15 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      const existingInvoices = await getInvoicesService(userId, { limit: 1 });
      const nextSeq = existingInvoices.length > 0 ? existingInvoices[0].id + 101 : 101;
      const invoiceNumber = `INV-${now.getFullYear()}-${String(nextSeq).padStart(3, "0")}`;
      const resolvedPlaceOfSupply = placeOfSupply || matchedClient?.gstin?.substring(0, 2) || merchant?.gstin?.substring(0, 2) || "27";
      if (!confirmAction) {
        return {
          requiresConfirmation: true,
          actionType: "create_invoice",
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
            subtotal: `\u20B9${calcSubtotal.toLocaleString("en-IN")}`,
            taxRate: `${taxRate}%`,
            taxAmount: `\u20B9${calcTaxAmount.toLocaleString("en-IN")}`,
            discountAmount: `\u20B9${Number(discountAmount).toLocaleString("en-IN")}`,
            tdsAmount: `\u20B9${calcTdsAmount.toLocaleString("en-IN")}`,
            totalAmount: `\u20B9${calcTotal.toLocaleString("en-IN")}`
          },
          confirmationMessage: `Please confirm creating GST invoice **${invoiceNumber}** for **${resolvedClientName}** totaling **\u20B9${calcTotal.toLocaleString("en-IN")}** (Subtotal: \u20B9${calcSubtotal.toLocaleString("en-IN")} + ${taxRate}% GST: \u20B9${calcTaxAmount.toLocaleString("en-IN")}).`,
          payload: {
            clientName: resolvedClientName,
            clientId: resolvedClientId,
            clientPhone: clientPhone || matchedClient?.phone || "9999999999",
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
            notes: notes || "Thank you for your business!",
            terms: terms || "Payment due within 15 days of invoice date.",
            confirmAction: true
          }
        };
      }
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
        notes: notes || "Thank you for your business!",
        terms: terms || "Payment due within 15 days of invoice date."
      });
      return {
        success: true,
        invoiceId: created.id,
        invoiceNumber: created.invoiceNumber,
        clientName: resolvedClientName,
        totalAmount: `\u20B9${calcTotal.toLocaleString("en-IN")}`,
        subtotal: `\u20B9${calcSubtotal.toLocaleString("en-IN")}`,
        taxAmount: `\u20B9${calcTaxAmount.toLocaleString("en-IN")}`,
        taxRate: `${taxRate}%`,
        status: created.status,
        dueDate: created.dueDate,
        shareToken: created.shareToken,
        message: `Successfully created invoice ${created.invoiceNumber} for ${resolvedClientName} of \u20B9${calcTotal.toLocaleString("en-IN")}.`
      };
    }
    case "update_invoice_tax_and_totals": {
      const { invoiceId, taxRate, discountAmount, tdsRate } = args;
      const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      if (!invoice) return { error: "Invoice not found." };
      const subtotal = parseFloat(invoice.subtotal || "0");
      const newTaxRate = taxRate !== void 0 ? Number(taxRate) : parseFloat(invoice.taxRate || "0");
      const newTaxAmount = subtotal * newTaxRate / 100;
      const newDiscount = discountAmount !== void 0 ? Number(discountAmount) : parseFloat(invoice.discountAmount || "0");
      const newTdsRate = tdsRate !== void 0 ? Number(tdsRate) : parseFloat(invoice.tdsRate || "0");
      const newTdsAmount = subtotal * newTdsRate / 100;
      const newTotal = Math.max(0, subtotal + newTaxAmount - newDiscount - newTdsAmount);
      const updated = await db.update(invoices).set({
        taxRate: newTaxRate.toFixed(2),
        taxAmount: newTaxAmount.toFixed(2),
        discountAmount: newDiscount.toFixed(2),
        tdsRate: newTdsRate.toFixed(2),
        tdsAmount: newTdsAmount.toFixed(2),
        totalAmount: newTotal.toFixed(2),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and8(eq12(invoices.id, Number(invoiceId)), eq12(invoices.userId, userId))).returning();
      const resRow = updated[0];
      return {
        success: true,
        invoiceId: resRow.id,
        invoiceNumber: resRow.invoiceNumber,
        subtotal: `\u20B9${subtotal.toLocaleString("en-IN")}`,
        taxRate: `${newTaxRate}%`,
        taxAmount: `\u20B9${newTaxAmount.toLocaleString("en-IN")}`,
        totalAmount: `\u20B9${newTotal.toLocaleString("en-IN")}`,
        message: `Updated invoice ${resRow.invoiceNumber}: ${newTaxRate}% GST (\u20B9${newTaxAmount.toLocaleString("en-IN")}) added. New Total is \u20B9${newTotal.toLocaleString("en-IN")}.`
      };
    }
    case "update_invoice_status": {
      const { invoiceId, status, paidAmount } = args;
      const updated = await updateInvoiceStatusService(userId, Number(invoiceId), status, paidAmount);
      return {
        success: true,
        invoiceId: updated.id,
        invoiceNumber: updated.invoiceNumber,
        status: updated.status,
        paidAmount: `\u20B9${parseFloat(updated.paidAmount || "0").toLocaleString("en-IN")}`,
        message: `Invoice ${updated.invoiceNumber} status updated to '${updated.status}'.`
      };
    }
    case "cancel_invoice": {
      const { invoiceId, reason } = args;
      const cancelled = await cancelInvoiceService(userId, Number(invoiceId), reason);
      return {
        success: true,
        invoiceId: cancelled.id,
        invoiceNumber: cancelled.invoiceNumber,
        status: "cancelled",
        message: `Invoice ${cancelled.invoiceNumber} has been cancelled (GST compliant table entry preserved).`
      };
    }
    default:
      throw new Error(`Unknown invoice tool action: ${functionName}`);
  }
}

// src/services/tools/client.tool.ts
var clientToolDeclarations = [
  {
    name: "search_clients",
    description: "Search or list clients/parties in the user directory by name, phone, company, or status.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description: "Search query for client name, phone number, company name, or GSTIN"
        }
      }
    }
  },
  {
    name: "create_client",
    description: "Add a new client/party into the directory.",
    parameters: {
      type: "OBJECT",
      properties: {
        name: {
          type: "STRING",
          description: "Contact or party name (Required)"
        },
        phone: {
          type: "STRING",
          description: "WhatsApp mobile number (Required)"
        },
        companyName: {
          type: "STRING",
          description: "Business or legal company name"
        },
        gstin: {
          type: "STRING",
          description: "15-character GSTIN number"
        },
        address: {
          type: "STRING",
          description: "Billing address"
        },
        email: {
          type: "STRING",
          description: "Email address"
        },
        paymentTermDays: {
          type: "INTEGER",
          description: "Default payment terms in days (e.g. 7, 15, 30)"
        }
      },
      required: ["name", "phone"]
    }
  }
];
async function executeClientTool(userId, functionName, args) {
  switch (functionName) {
    case "search_clients": {
      const { query } = args;
      const allClients = await getClientsService(userId);
      let filtered = allClients;
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        filtered = allClients.filter(
          (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.companyName && c.companyName.toLowerCase().includes(q) || c.gstin && c.gstin.toLowerCase().includes(q)
        );
      }
      return {
        count: filtered.length,
        clients: filtered.map((c) => ({
          id: c.id,
          name: c.name,
          companyName: c.companyName || "",
          phone: c.phone,
          gstin: c.gstin || "",
          email: c.email || "",
          paymentTermDays: c.paymentTermDays,
          isActive: c.isActive
        }))
      };
    }
    case "create_client": {
      const created = await createClientService(userId, args);
      return {
        success: true,
        client: {
          id: created.id,
          name: created.name,
          companyName: created.companyName,
          phone: created.phone,
          gstin: created.gstin
        },
        message: `Client "${created.name}" (${created.companyName || created.phone}) was successfully registered.`
      };
    }
    default:
      throw new Error(`Unknown client tool action: ${functionName}`);
  }
}

// src/services/tools/payment.tool.ts
var paymentToolDeclarations = [
  {
    name: "record_payment",
    description: "Record an incoming payment (UPI, Bank Transfer, Cash, Cheque) against an invoice and update invoice status.",
    parameters: {
      type: "OBJECT",
      properties: {
        invoiceId: {
          type: "INTEGER",
          description: "Database ID of the invoice being paid (Required)"
        },
        amount: {
          type: "NUMBER",
          description: "Payment amount received in INR (Required)"
        },
        paymentMethod: {
          type: "STRING",
          description: "Payment method: 'upi', 'bank_transfer', 'cash', 'cheque' (default 'upi')"
        },
        paymentDate: {
          type: "STRING",
          description: "Date of payment in YYYY-MM-DD format (defaults to today)"
        },
        referenceNumber: {
          type: "STRING",
          description: "Transaction reference ID / UTR / Cheque number"
        },
        notes: {
          type: "STRING",
          description: "Notes on the payment"
        },
        confirmAction: {
          type: "BOOLEAN",
          description: "Set to true ONLY if user explicitly confirmed recording the payment."
        }
      },
      required: ["invoiceId", "amount"]
    }
  },
  {
    name: "get_payments_history",
    description: "List recent payment transactions and settlement history across invoices.",
    parameters: {
      type: "OBJECT",
      properties: {
        limit: {
          type: "INTEGER",
          description: "Max number of payments to retrieve (default 10)"
        }
      }
    }
  }
];
async function executePaymentTool(userId, functionName, args) {
  switch (functionName) {
    case "record_payment": {
      const {
        invoiceId,
        amount,
        paymentMethod = "upi",
        paymentDate,
        referenceNumber = "",
        notes = "",
        confirmAction = false
      } = args;
      const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      if (!invoice) return { error: `Invoice #${invoiceId} not found.` };
      const numAmount = Number(amount);
      const totalAmount = parseFloat(invoice.totalAmount || "0");
      const alreadyPaid = parseFloat(invoice.paidAmount || "0");
      const remainingBalance = Math.max(0, totalAmount - alreadyPaid);
      if (!confirmAction) {
        return {
          requiresConfirmation: true,
          actionType: "record_payment",
          preview: {
            invoiceId,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.client?.name || "Customer",
            paymentAmount: `\u20B9${numAmount.toLocaleString("en-IN")}`,
            invoiceTotal: `\u20B9${totalAmount.toLocaleString("en-IN")}`,
            currentPaid: `\u20B9${alreadyPaid.toLocaleString("en-IN")}`,
            remainingAfterPayment: `\u20B9${Math.max(0, remainingBalance - numAmount).toLocaleString("en-IN")}`,
            paymentMethod,
            referenceNumber
          },
          confirmationMessage: `Please confirm recording a payment of **\u20B9${numAmount.toLocaleString("en-IN")}** via **${paymentMethod.toUpperCase()}** against invoice **${invoice.invoiceNumber}** (${invoice.client?.name}).`,
          payload: {
            invoiceId,
            amount: numAmount,
            paymentMethod,
            paymentDate: paymentDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            referenceNumber,
            notes,
            confirmAction: true
          }
        };
      }
      const recorded = await recordPaymentService(userId, {
        invoiceId: Number(invoiceId),
        amount: numAmount,
        paymentMethod,
        paymentDate: paymentDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        referenceNumber,
        notes
      });
      const updatedInvoice = await getInvoiceByIdService(userId, Number(invoiceId));
      return {
        success: true,
        paymentId: recorded.id,
        invoiceNumber: invoice.invoiceNumber,
        amountRecorded: `\u20B9${numAmount.toLocaleString("en-IN")}`,
        newInvoiceStatus: updatedInvoice.status,
        totalPaidOnInvoice: `\u20B9${parseFloat(updatedInvoice.paidAmount || "0").toLocaleString("en-IN")}`,
        message: `Payment of \u20B9${numAmount.toLocaleString("en-IN")} successfully recorded for invoice ${invoice.invoiceNumber}. New status is '${updatedInvoice.status}'.`
      };
    }
    case "get_payments_history": {
      const { limit = 10 } = args;
      const paymentsList = await getPaymentsService(userId);
      return {
        count: paymentsList.length,
        payments: paymentsList.slice(0, limit).map((p) => ({
          id: p.id,
          invoiceId: p.invoiceId,
          amount: `\u20B9${parseFloat(p.amount || "0").toLocaleString("en-IN")}`,
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          referenceNumber: p.referenceNumber
        }))
      };
    }
    default:
      throw new Error(`Unknown payment tool action: ${functionName}`);
  }
}

// src/services/tools/analytics.tool.ts
var analyticsToolDeclarations = [
  {
    name: "get_dashboard_analytics",
    description: "Retrieve real-time business health metrics: total revenue billed, amount collected, pending receivables, overdue amounts, collection rate, and 30-day cash flow projections.",
    parameters: {
      type: "OBJECT",
      properties: {}
    }
  },
  {
    name: "get_party_risk_scores",
    description: "Retrieve AI credit scoring and payment delay risk categorizations (Low/Medium/High risk) across customer directory.",
    parameters: {
      type: "OBJECT",
      properties: {}
    }
  }
];
async function executeAnalyticsTool(userId, functionName, _args) {
  switch (functionName) {
    case "get_dashboard_analytics": {
      const invoicesList = await getInvoicesByUserId(userId);
      const paymentsList = await getPaymentsForUser(userId);
      const activeInvoices = invoicesList.filter((inv) => inv.status !== "cancelled" && !inv.isCancelled);
      let totalInvoiced = 0;
      let totalCollected = 0;
      let totalPending = 0;
      let totalOverdue = 0;
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      activeInvoices.forEach((inv) => {
        const tot = parseFloat(inv.totalAmount || "0");
        const pd = parseFloat(inv.paidAmount || "0");
        const outstanding = Math.max(0, tot - pd);
        totalInvoiced += tot;
        totalCollected += pd;
        if (inv.status === "paid" || outstanding <= 0) {
        } else if (inv.status === "overdue" || inv.dueDate && inv.dueDate < todayStr) {
          totalOverdue += outstanding;
        } else {
          totalPending += outstanding;
        }
      });
      const collectionRate = totalInvoiced > 0 ? Math.round(totalCollected / totalInvoiced * 100) : 0;
      return {
        totalInvoiced: `\u20B9${totalInvoiced.toLocaleString("en-IN")}`,
        totalCollected: `\u20B9${totalCollected.toLocaleString("en-IN")}`,
        totalPending: `\u20B9${totalPending.toLocaleString("en-IN")}`,
        totalOverdue: `\u20B9${totalOverdue.toLocaleString("en-IN")}`,
        collectionRate: `${collectionRate}%`,
        activeInvoicesCount: activeInvoices.length,
        totalPaymentsLogged: paymentsList.length
      };
    }
    case "get_party_risk_scores": {
      const invoicesList = await getInvoicesByUserId(userId);
      const clientsList = await getClientsByUserId(userId);
      const activeInvoices = invoicesList.filter((inv) => inv.status !== "cancelled" && !inv.isCancelled);
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const clientRisks = clientsList.filter((c) => c.isActive !== false).map((c) => {
        const clientInvs = activeInvoices.filter((i) => i.clientId === c.id);
        if (clientInvs.length === 0) {
          return {
            name: c.name,
            companyName: c.companyName || c.name,
            score: 95,
            riskLevel: "LOW",
            status: "Reliable / New Party",
            overdueAmount: "\u20B90"
          };
        }
        let overdueAmount = 0;
        let billedAmount = 0;
        clientInvs.forEach((i) => {
          const tot = parseFloat(i.totalAmount || "0");
          const pd = parseFloat(i.paidAmount || "0");
          billedAmount += tot;
          if (i.status === "overdue" || i.dueDate < todayStr && i.status !== "paid") {
            overdueAmount += Math.max(0, tot - pd);
          }
        });
        const ratio = billedAmount > 0 ? overdueAmount / billedAmount : 0;
        let score = Math.max(20, Math.min(99, 100 - Math.round(ratio * 70)));
        const riskLevel = score >= 80 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH";
        return {
          name: c.name,
          companyName: c.companyName || c.name,
          score,
          riskLevel,
          overdueAmount: `\u20B9${overdueAmount.toLocaleString("en-IN")}`
        };
      });
      return {
        clientsEvaluated: clientRisks.length,
        highRiskParties: clientRisks.filter((c) => c.riskLevel === "HIGH"),
        mediumRiskParties: clientRisks.filter((c) => c.riskLevel === "MEDIUM"),
        lowRiskParties: clientRisks.filter((c) => c.riskLevel === "LOW")
      };
    }
    default:
      throw new Error(`Unknown analytics tool action: ${functionName}`);
  }
}

// src/services/tools/whatsapp.tool.ts
init_db();
init_schema();
var whatsappToolDeclarations = [
  {
    name: "send_whatsapp_invoice",
    description: "Send an invoice with payment link or PDF via WhatsApp directly to the customer mobile number.",
    parameters: {
      type: "OBJECT",
      properties: {
        invoiceId: {
          type: "INTEGER",
          description: "Database ID of the invoice to send (Required)"
        },
        recipientPhone: {
          type: "STRING",
          description: "WhatsApp number to override client default phone if needed"
        },
        customMessage: {
          type: "STRING",
          description: "Optional custom note/text message to include"
        }
      },
      required: ["invoiceId"]
    }
  },
  {
    name: "send_payment_reminder",
    description: "Send a formatted payment reminder notice (polite, standard, or urgent) via WhatsApp for pending/overdue invoices.",
    parameters: {
      type: "OBJECT",
      properties: {
        invoiceId: {
          type: "INTEGER",
          description: "Database ID of the invoice (Required)"
        },
        tone: {
          type: "STRING",
          description: "Reminder tone: 'polite', 'standard', 'urgent', or 'overdue' (default 'standard')"
        }
      },
      required: ["invoiceId"]
    }
  }
];
async function executeWhatsAppTool(userId, functionName, args) {
  switch (functionName) {
    case "send_whatsapp_invoice": {
      const { invoiceId, recipientPhone, customMessage } = args;
      const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      if (!invoice) return { error: `Invoice #${invoiceId} not found.` };
      const targetPhone = recipientPhone || invoice.client?.phone;
      if (!targetPhone) return { error: "No recipient phone number found for this invoice client." };
      const merchant = invoice.merchant;
      const clientName = invoice.client?.name || "Customer";
      const totalAmount = `\u20B9${parseFloat(invoice.totalAmount || "0").toLocaleString("en-IN")}`;
      const dueDate = invoice.dueDate;
      const invNum = invoice.invoiceNumber;
      const payLink = `${process.env.APP_URL || "https://kwikbill.in"}/pay/${invoice.shareToken || invNum}`;
      const messageContent = customMessage || `Dear ${clientName},

Please find attached Invoice *${invNum}* from *${merchant?.businessName || "Us"}* for *${totalAmount}*.

\u{1F4C5} Due Date: ${dueDate}
\u{1F4B3} Instant UPI / Online Payment Link: ${payLink}

Thank you for your business!`;
      const result = await sendWhatsAppMessage({
        recipientPhone: targetPhone,
        messageContent,
        recipientName: clientName,
        invoiceNumber: invNum,
        invoiceId: invoice.id,
        totalAmount: invoice.totalAmount,
        dueDate
      });
      await db.insert(reminderLogs).values({
        userId,
        invoiceId: invoice.id,
        clientId: invoice.client.id,
        channel: "whatsapp",
        templateType: "standard",
        messageContent,
        recipientPhone: targetPhone,
        status: result.directApiSent ? "sent" : "delivered"
      });
      return {
        success: true,
        directApiSent: result.directApiSent,
        deliveryStatus: result.deliveryStatus,
        whatsappUrl: result.whatsappUrl,
        invoiceNumber: invNum,
        recipientPhone: targetPhone,
        message: result.directApiSent ? `Invoice ${invNum} was sent via WhatsApp Meta API to ${targetPhone}!` : `WhatsApp message link prepared for ${targetPhone} (Click link to send if Meta API is not configured).`
      };
    }
    case "send_payment_reminder": {
      const { invoiceId, tone = "standard" } = args;
      const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
      if (!invoice) return { error: `Invoice #${invoiceId} not found.` };
      const targetPhone = invoice.client?.phone;
      if (!targetPhone) return { error: "No phone number for this client." };
      const clientName = invoice.client?.name || "Customer";
      const outstanding = Math.max(0, parseFloat(invoice.totalAmount || "0") - parseFloat(invoice.paidAmount || "0"));
      const outstandingStr = `\u20B9${outstanding.toLocaleString("en-IN")}`;
      const invNum = invoice.invoiceNumber;
      const payLink = `${process.env.APP_URL || "https://kwikbill.in"}/pay/${invoice.shareToken || invNum}`;
      let msg = "";
      if (tone === "polite") {
        msg = `Hi ${clientName}, this is a gentle reminder that invoice *${invNum}* of *${outstandingStr}* is due on ${invoice.dueDate}. Pay easily here: ${payLink}. Thank you!`;
      } else if (tone === "urgent" || tone === "overdue") {
        msg = `\u26A0\uFE0F URGENT: Invoice *${invNum}* for *${outstandingStr}* is overdue since ${invoice.dueDate}. Please clear the outstanding balance immediately via: ${payLink}`;
      } else {
        msg = `Hello ${clientName}, payment reminder for Invoice *${invNum}* totaling *${outstandingStr}* due by ${invoice.dueDate}. Settle securely: ${payLink}`;
      }
      const result = await sendWhatsAppMessage({
        recipientPhone: targetPhone,
        messageContent: msg,
        recipientName: clientName,
        invoiceNumber: invNum,
        invoiceId: invoice.id,
        totalAmount: outstanding,
        dueDate: invoice.dueDate
      });
      await db.insert(reminderLogs).values({
        userId,
        invoiceId: invoice.id,
        clientId: invoice.client.id,
        channel: "whatsapp",
        templateType: tone,
        messageContent: msg,
        recipientPhone: targetPhone,
        status: result.directApiSent ? "sent" : "delivered"
      });
      return {
        success: true,
        directApiSent: result.directApiSent,
        deliveryStatus: result.deliveryStatus,
        whatsappUrl: result.whatsappUrl,
        invoiceNumber: invNum,
        message: `Payment reminder (${tone}) sent to ${clientName} (${targetPhone})!`
      };
    }
    default:
      throw new Error(`Unknown WhatsApp tool action: ${functionName}`);
  }
}

// src/lib/qrCode.ts
import QRCode from "qrcode";
async function generateLocalQrDataUrl(text2) {
  try {
    return await QRCode.toDataURL(text2, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });
  } catch (err) {
    console.error("Failed to generate local QR code:", err);
    return "";
  }
}

// src/lib/gstCompliance.ts
var INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" }
];
function getStateCodeFromGstin(gstin) {
  if (!gstin) return null;
  const clean = gstin.trim();
  if (clean.length >= 2 && /^\d{2}/.test(clean)) {
    return clean.substring(0, 2);
  }
  return null;
}
function getStateNameOrFormatted(codeOrName) {
  if (!codeOrName) return "As per Billing Address";
  const matched = INDIAN_STATES.find((s) => s.code === codeOrName || s.name.toLowerCase() === codeOrName.toLowerCase());
  if (matched) {
    return `${matched.code} - ${matched.name}`;
  }
  return codeOrName;
}
function calculateGstBreakdown(taxRateNum, taxableAmount, supplierGstinOrState, placeOfSupplyOrClientGstin, forceInterState) {
  if (taxRateNum <= 0 || taxableAmount <= 0) {
    return {
      isInterState: false,
      taxRate: 0,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: 0,
      igstAmount: 0,
      totalTax: 0
    };
  }
  const supplierCode = getStateCodeFromGstin(supplierGstinOrState) || (supplierGstinOrState && supplierGstinOrState.length === 2 ? supplierGstinOrState : null);
  const clientCode = getStateCodeFromGstin(placeOfSupplyOrClientGstin) || (placeOfSupplyOrClientGstin && placeOfSupplyOrClientGstin.length === 2 ? placeOfSupplyOrClientGstin : null);
  let isInterState = false;
  if (forceInterState !== void 0) {
    isInterState = forceInterState;
  } else if (supplierCode && clientCode) {
    isInterState = supplierCode !== clientCode;
  }
  const totalTax = taxableAmount * taxRateNum / 100;
  if (isInterState) {
    return {
      isInterState: true,
      taxRate: taxRateNum,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: taxRateNum,
      igstAmount: totalTax,
      totalTax
    };
  } else {
    const halfRate = taxRateNum / 2;
    const halfTax = totalTax / 2;
    return {
      isInterState: false,
      taxRate: taxRateNum,
      cgstRate: halfRate,
      cgstAmount: halfTax,
      sgstRate: halfRate,
      sgstAmount: halfTax,
      igstRate: 0,
      igstAmount: 0,
      totalTax
    };
  }
}
var STATUTORY_INVOICE_DISCLAIMER = "This is a computer-generated Tax Invoice issued under Rule 46 of the Central Goods and Services Tax (CGST) Rules, 2017 and the Information Technology Act, 2000. It does not require a physical signature.";

// src/services/tools/pdf.tool.ts
var puppeteerModule = null;
async function getPuppeteer() {
  if (puppeteerModule) return puppeteerModule;
  try {
    puppeteerModule = await import("puppeteer");
    return puppeteerModule;
  } catch (err) {
    console.error("Failed to import puppeteer:", err);
    return null;
  }
}
var pdfToolDeclarations = [
  {
    name: "generate_invoice_pdf",
    description: "Generate a print-ready, GST-compliant PDF document for an invoice and return the download URL.",
    parameters: {
      type: "OBJECT",
      properties: {
        invoiceId: {
          type: "INTEGER",
          description: "Database ID of the invoice to render (Required)"
        }
      },
      required: ["invoiceId"]
    }
  }
];
function numberToIndianWords(num) {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const n = Math.floor(Math.abs(num));
  if (n === 0) return "Zero Rupees Only";
  function inWords(n2) {
    let str = "";
    if (n2 >= 1e7) {
      str += inWords(Math.floor(n2 / 1e7)) + "Crore ";
      n2 %= 1e7;
    }
    if (n2 >= 1e5) {
      str += inWords(Math.floor(n2 / 1e5)) + "Lakh ";
      n2 %= 1e5;
    }
    if (n2 >= 1e3) {
      str += inWords(Math.floor(n2 / 1e3)) + "Thousand ";
      n2 %= 1e3;
    }
    if (n2 >= 100) {
      str += inWords(Math.floor(n2 / 100)) + "Hundred ";
      n2 %= 100;
    }
    if (n2 > 0) {
      if (n2 < 20) str += a[n2];
      else {
        str += b[Math.floor(n2 / 10)] + (n2 % 10 !== 0 ? " " + a[n2 % 10] : " ");
      }
    }
    return str;
  }
  return `${inWords(n).trim()} Rupees Only`;
}
function escapeHtml(str) {
  if (str === null || str === void 0) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function sanitizeBrandColor(color) {
  if (color && /^#[0-9a-fA-F]{6}$/.test(color.trim())) {
    return color.trim();
  }
  return "#4f46e5";
}
function sanitizeLogoUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("data:image/")) {
    return escapeHtml(trimmed);
  }
  return "";
}
async function renderInvoiceHtml(invoice, merchant) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const brandColor = sanitizeBrandColor(merchant?.brandColor);
  const logoUrl = sanitizeLogoUrl(merchant?.logoUrl);
  const subtotal = parseFloat(invoice.subtotal || "0");
  const taxRate = parseFloat(invoice.taxRate || "0");
  const discountAmount = parseFloat(invoice.discountAmount || "0");
  const tdsAmount = parseFloat(invoice.tdsAmount || "0");
  const totalAmount = parseFloat(invoice.totalAmount || "0");
  const paidAmount = parseFloat(invoice.paidAmount || "0");
  const balanceDue = Math.max(0, totalAmount - paidAmount);
  const gstBreakdown = calculateGstBreakdown(
    taxRate,
    subtotal,
    merchant?.gstin,
    invoice.placeOfSupply || invoice.client?.gstin
  );
  const rawUpiId = merchant?.upiId || "speedytrans@okaxis";
  const upiId = escapeHtml(rawUpiId);
  const upiUrl = `upi://pay?pa=${rawUpiId}&pn=${encodeURIComponent(merchant?.businessName || "Merchant")}&am=${balanceDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}`;
  const qrCodeDataUrl = await generateLocalQrDataUrl(upiUrl);
  const placeOfSupplyFormatted = escapeHtml(getStateNameOrFormatted(invoice.placeOfSupply || invoice.client?.gstin?.substring(0, 2) || merchant?.gstin?.substring(0, 2)));
  const rows = items.map(
    (item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; text-align: center; color: #64748b; font-size: 12px;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b; font-size: 13px;">
          ${escapeHtml(item.description || "Item")}
          ${item.hsnCode ? `<div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">HSN/SAC: <span style="font-family: monospace;">${escapeHtml(item.hsnCode)}</span></div>` : ""}
        </td>
        <td style="padding: 10px 12px; text-align: center; color: #334155; font-size: 12px;">${escapeHtml(item.quantity || 1)} ${escapeHtml(item.uqc || "")}</td>
        <td style="padding: 10px 12px; text-align: right; color: #334155; font-size: 13px;">\u20B9${Number(item.rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">\u20B9${Number(item.amount || (item.quantity || 1) * (item.rate || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    `
  ).join("");
  const hasTransportDetails = Boolean(invoice.vehicleNumber || invoice.lrNumber || invoice.routeSource || invoice.routeDestination);
  const escapedBusinessName = escapeHtml(merchant?.businessName || "KwikBill Merchant");
  const escapedInvoiceNumber = escapeHtml(invoice.invoiceNumber);
  const escapedClientName = escapeHtml(invoice.client?.name || "Customer");
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Tax Invoice ${escapedInvoiceNumber}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #ffffff; color: #0f172a; }
        .invoice-box { max-width: 820px; margin: auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 28px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid ${brandColor}; padding-bottom: 18px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-paid { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
        .badge-overdue { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <!-- Header -->
        <div class="header">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width: 56px; height: 56px; object-fit: contain; border-radius: 10px; border: 1px solid #e2e8f0; padding: 2px;" />` : `<div style="width: 52px; height: 52px; border-radius: 12px; background: ${brandColor}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${escapeHtml((merchant?.businessName || "M").charAt(0).toUpperCase())}</div>`}
            <div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: ${brandColor}; letter-spacing: -0.5px;">${escapedBusinessName}</h1>
              <p style="margin: 3px 0; color: #475569; font-size: 12px; line-height: 1.4;">${escapeHtml(merchant?.address || "India")}</p>
              ${merchant?.gstin ? `<p style="margin: 2px 0; font-size: 12px; font-weight: 700; color: #1e293b;">GSTIN: <span style="font-family: monospace; font-weight: 800; color: ${brandColor};">${escapeHtml(merchant.gstin)}</span></p>` : ""}
              ${merchant?.phone ? `<p style="margin: 2px 0; font-size: 12px; color: #64748b;">Phone: <strong>${escapeHtml(merchant.phone)}</strong> | Email: ${escapeHtml(merchant.email || "")}</p>` : ""}
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">TAX INVOICE</div>
            <div style="font-size: 14px; font-weight: 800; color: ${brandColor}; margin-top: 3px;"># ${escapedInvoiceNumber}</div>
            <div style="margin-top: 6px;">
              <span class="badge ${invoice.status === "paid" ? "badge-paid" : invoice.status === "overdue" ? "badge-overdue" : "badge-pending"}">
                ${escapeHtml(invoice.status || "pending")}
              </span>
            </div>
          </div>
        </div>

        <!-- Bill To & Meta Info Grid -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="max-width: 55%;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px;">BILLED TO (BUYER):</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">${escapedClientName}</div>
            ${invoice.client?.companyName ? `<div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px;">${escapeHtml(invoice.client.companyName)}</div>` : ""}
            ${invoice.client?.address ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px; line-height: 1.4;">${escapeHtml(invoice.client.address)}</div>` : ""}
            ${invoice.client?.gstin ? `<div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-top: 4px;">GSTIN: <span style="font-family: monospace; color: #4f46e5;">${escapeHtml(invoice.client.gstin)}</span></div>` : ""}
            ${invoice.client?.phone ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Contact: ${escapeHtml(invoice.client.phone)}</div>` : ""}
          </div>

          <div style="text-align: right; font-size: 12px; min-width: 40%;">
            <div style="margin-bottom: 4px;"><span style="color: #64748b;">Invoice Date:</span> <strong style="color: #0f172a;">${escapeHtml(invoice.issueDate)}</strong></div>
            <div style="margin-bottom: 4px;"><span style="color: #64748b;">Due Date:</span> <strong style="color: #dc2626;">${escapeHtml(invoice.dueDate)}</strong></div>
            <div style="margin-bottom: 4px;"><span style="color: #64748b;">Place of Supply:</span> <strong>${placeOfSupplyFormatted}</strong></div>
            <div><span style="color: #64748b;">Reverse Charge (RCM):</span> <strong>${invoice.isRcm ? "YES" : "NO"}</strong></div>
          </div>
        </div>

        <!-- Optional Transport & Logistics Details -->
        ${hasTransportDetails ? `
          <div style="margin-bottom: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; display: flex; flex-wrap: wrap; gap: 16px; font-size: 11px;">
            ${invoice.vehicleNumber ? `<div><span style="color: #1e40af; font-weight: bold;">Vehicle No:</span> <strong>${escapeHtml(invoice.vehicleNumber)}</strong></div>` : ""}
            ${invoice.lrNumber ? `<div><span style="color: #1e40af; font-weight: bold;">LR / Bilty No:</span> <strong>${escapeHtml(invoice.lrNumber)}</strong></div>` : ""}
            ${invoice.routeSource && invoice.routeDestination ? `<div><span style="color: #1e40af; font-weight: bold;">Route:</span> <strong>${escapeHtml(invoice.routeSource)} \u2192 ${escapeHtml(invoice.routeDestination)}</strong></div>` : ""}
            ${invoice.ewayBillNumber ? `<div><span style="color: #1e40af; font-weight: bold;">E-Way Bill:</span> <strong>${escapeHtml(invoice.ewayBillNumber)}</strong></div>` : ""}
          </div>
        ` : ""}

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8;">
              <th style="padding: 10px 12px; text-align: center; width: 35px; font-weight: 800; color: #334155;">#</th>
              <th style="padding: 10px 12px; text-align: left; font-weight: 800; color: #334155;">ITEM DESCRIPTION</th>
              <th style="padding: 10px 12px; text-align: center; width: 75px; font-weight: 800; color: #334155;">QTY</th>
              <th style="padding: 10px 12px; text-align: right; width: 110px; font-weight: 800; color: #334155;">RATE</th>
              <th style="padding: 10px 12px; text-align: right; width: 120px; font-weight: 800; color: #334155;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <!-- Amount In Words -->
        <div style="margin-bottom: 20px; padding: 10px 14px; background: #f8fafc; border-left: 4px solid ${brandColor}; border-radius: 4px; font-size: 12px;">
          <span style="color: #64748b; font-weight: 600;">Total in Words:</span>
          <strong style="color: #0f172a; margin-left: 6px;">${numberToIndianWords(totalAmount)}</strong>
        </div>

        <!-- Footer Breakdown: QR Code + Bank Details + Financial Calculation -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
          <!-- Left: UPI QR Code & Bank Transfer Box -->
          <div style="flex: 1; max-width: 48%;">
            <div style="display: flex; gap: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; align-items: center;">
              ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="UPI QR" style="width: 88px; height: 88px; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0;" />` : ""}
              <div style="font-size: 11px; color: #475569;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px; font-size: 12px;">Instant UPI Payment</div>
                <div>Scan with Google Pay, PhonePe, Paytm</div>
                <div style="margin-top: 4px; font-family: monospace; font-weight: 800; color: ${brandColor}; font-size: 12px;">
                  ${upiId}
                </div>
              </div>
            </div>

            ${merchant?.bankAccountNo ? `
              <div style="margin-top: 10px; font-size: 11px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div><strong>Bank Name:</strong> ${escapeHtml(merchant.bankName || "Bank")}</div>
                <div><strong>A/C No:</strong> <span style="font-family: monospace; font-weight: bold;">${escapeHtml(merchant.bankAccountNo)}</span> | <strong>IFSC:</strong> ${escapeHtml(merchant.bankIfsc || "")}</div>
              </div>
            ` : ""}

            <div style="margin-top: 10px; font-size: 11px; color: #64748b; line-height: 1.4;">
              <strong>Terms & Conditions:</strong><br />
              ${escapeHtml(invoice.terms || "Payment is due within stipulated days of invoice date.")}
            </div>
          </div>

          <!-- Right: Tax Split & Totals Table -->
          <div style="width: 48%; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
              <span style="color: #64748b;">Taxable Subtotal:</span>
              <span style="font-weight: 700; color: #0f172a;">\u20B9${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            ${gstBreakdown.isInterState ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b;">Integrated GST (IGST ${gstBreakdown.igstRate}%):</span>
                <span style="font-weight: 700; color: #0f172a;">\u20B9${gstBreakdown.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            ` : `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b;">Central GST (CGST ${gstBreakdown.cgstRate}%):</span>
                <span style="font-weight: 700; color: #0f172a;">\u20B9${gstBreakdown.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b;">State GST (SGST ${gstBreakdown.sgstRate}%):</span>
                <span style="font-weight: 700; color: #0f172a;">\u20B9${gstBreakdown.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            `}

            ${discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; color: #16a34a;">
                <span>Discount Applied:</span>
                <span style="font-weight: 700;">- \u20B9${discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            ` : ""}

            ${tdsAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; color: #d97706;">
                <span>TDS Deducted:</span>
                <span style="font-weight: 700;">- \u20B9${tdsAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            ` : ""}

            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #0f172a; margin-top: 6px; font-size: 16px; font-weight: 900; color: ${brandColor};">
              <span>Total Amount:</span>
              <span>\u20B9${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            ${paidAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #16a34a; font-size: 12px;">
                <span>Amount Paid:</span>
                <span style="font-weight: bold;">\u20B9${paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px dashed #cbd5e1; font-weight: 800; color: #dc2626; font-size: 14px;">
                <span>Balance Due:</span>
                <span>\u20B9${balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            ` : ""}

            <!-- Authorised Signatory Box -->
            <div style="margin-top: 24px; text-align: right; font-size: 11px; color: #64748b;">
              <div style="font-weight: 700; color: #0f172a;">For ${escapedBusinessName}</div>
              <div style="height: 44px;"></div>
              <div style="border-top: 1px solid #cbd5e1; display: inline-block; padding-top: 4px; min-width: 140px; text-align: center;">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>

        <!-- Statutory Footer -->
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
          ${STATUTORY_INVOICE_DISCLAIMER}
        </div>
      </div>
    </body>
    </html>
  `;
}
async function executePdfTool(userId, functionName, args) {
  if (functionName !== "generate_invoice_pdf") {
    throw new Error(`Unknown PDF tool action: ${functionName}`);
  }
  const { invoiceId } = args;
  const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
  if (!invoice) return { error: `Invoice #${invoiceId} not found.` };
  const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { db: db3 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { eq: eq14 } = await import("drizzle-orm");
  const userRows = await db3.select().from(users3).where(eq14(users3.id, userId)).limit(1);
  const merchant = userRows[0] || {};
  const html = await renderInvoiceHtml(invoice, merchant);
  try {
    const puppeteer = await getPuppeteer();
    if (puppeteer && (puppeteer.default || puppeteer).launch) {
      const browser = await (puppeteer.default || puppeteer).launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || void 0,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu"
        ]
      });
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on("request", (interceptedReq) => {
        const reqUrl = interceptedReq.url().toLowerCase();
        if (reqUrl.startsWith("file:") || reqUrl.includes("169.254.169.254") || reqUrl.includes("127.0.0.1") || reqUrl.includes("localhost") || reqUrl.includes("0.0.0.0") || reqUrl.includes("10.") || reqUrl.includes("192.168.") || reqUrl.includes("172.16.")) {
          interceptedReq.abort();
        } else {
          interceptedReq.continue();
        }
      });
      await page.setContent(html, { waitUntil: "networkidle0" });
      await browser.close();
      const viewUrl = `/pay/${invoice.shareToken || invoice.invoiceNumber}`;
      return {
        success: true,
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: viewUrl,
        message: `Invoice ${invoice.invoiceNumber} PDF generated successfully. Ready to view & print.`
      };
    }
  } catch (err) {
    console.error("Puppeteer PDF generation error:", err);
  }
  return {
    success: true,
    invoiceNumber: invoice.invoiceNumber,
    pdfUrl: `/pay/${invoice.shareToken || invoice.invoiceNumber}`,
    message: `Invoice ${invoice.invoiceNumber} is ready to view & print directly from your browser!`
  };
}

// src/services/tools/index.ts
var allToolDeclarations = [
  ...invoiceToolDeclarations,
  ...clientToolDeclarations,
  ...paymentToolDeclarations,
  ...analyticsToolDeclarations,
  ...whatsappToolDeclarations,
  ...pdfToolDeclarations
];
async function executeAgentTool(userId, toolName, args) {
  if (invoiceToolDeclarations.some((t) => t.name === toolName)) {
    return await executeInvoiceTool(userId, toolName, args);
  }
  if (clientToolDeclarations.some((t) => t.name === toolName)) {
    return await executeClientTool(userId, toolName, args);
  }
  if (paymentToolDeclarations.some((t) => t.name === toolName)) {
    return await executePaymentTool(userId, toolName, args);
  }
  if (analyticsToolDeclarations.some((t) => t.name === toolName)) {
    return await executeAnalyticsTool(userId, toolName, args);
  }
  if (whatsappToolDeclarations.some((t) => t.name === toolName)) {
    return await executeWhatsAppTool(userId, toolName, args);
  }
  if (pdfToolDeclarations.some((t) => t.name === toolName)) {
    return await executePdfTool(userId, toolName, args);
  }
  throw new Error(`Tool "${toolName}" is not registered in the tool execution registry.`);
}

// src/db/conversations.ts
init_db();
init_schema();
import { eq as eq13, and as and9, desc as desc8 } from "drizzle-orm";
async function getConversationsByUserId(userId, limit = 20) {
  try {
    return await db.select({
      id: aiConversations.id,
      conversationId: aiConversations.conversationId,
      title: aiConversations.title,
      lastActiveAt: aiConversations.lastActiveAt,
      createdAt: aiConversations.createdAt
    }).from(aiConversations).where(eq13(aiConversations.userId, userId)).orderBy(desc8(aiConversations.lastActiveAt)).limit(limit);
  } catch (error) {
    console.error("Failed to get AI conversations:", error);
    throw new Error("Failed to get AI conversations.", { cause: error });
  }
}
async function getConversationById(userId, conversationId) {
  try {
    const rows = await db.select().from(aiConversations).where(and9(eq13(aiConversations.userId, userId), eq13(aiConversations.conversationId, conversationId))).limit(1);
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Failed to get conversation:", error);
    throw new Error("Failed to get conversation.", { cause: error });
  }
}
async function saveConversation(userId, conversationId, messages, title) {
  try {
    const existing = await getConversationById(userId, conversationId);
    const trimmedMessages = messages.slice(-50);
    if (existing) {
      const updateData = {
        messages: trimmedMessages,
        lastActiveAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (title && title.trim()) {
        updateData.title = title.trim();
      }
      const updated = await db.update(aiConversations).set(updateData).where(and9(eq13(aiConversations.userId, userId), eq13(aiConversations.conversationId, conversationId))).returning();
      return updated[0];
    } else {
      const inserted = await db.insert(aiConversations).values({
        userId,
        conversationId,
        title: title || "New Conversation",
        messages: trimmedMessages,
        lastActiveAt: /* @__PURE__ */ new Date()
      }).returning();
      return inserted[0];
    }
  } catch (error) {
    console.error("Failed to save AI conversation:", error);
    throw new Error("Failed to save AI conversation.", { cause: error });
  }
}
async function deleteConversation(userId, conversationId) {
  try {
    const deleted = await db.delete(aiConversations).where(and9(eq13(aiConversations.userId, userId), eq13(aiConversations.conversationId, conversationId))).returning();
    return deleted[0] || null;
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw new Error("Failed to delete conversation.", { cause: error });
  }
}

// src/services/agent.orchestrator.ts
import { randomUUID } from "crypto";
async function processAgentTurn(params) {
  const { userId, userProfile, userMessage, confirmationPayload } = params;
  const conversationId = params.conversationId || randomUUID();
  const apiKey = config3.gemini.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment variables.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const now = /* @__PURE__ */ new Date();
  const currentDateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const businessContext = {
    userId,
    businessName: userProfile.businessName || "My Business",
    email: userProfile.email,
    phone: userProfile.phone || "",
    gstin: userProfile.gstin || "",
    address: userProfile.address || "",
    upiId: userProfile.upiId || "",
    bankName: userProfile.bankName,
    bankAccountNo: userProfile.bankAccountNo,
    bankIfsc: userProfile.bankIfsc,
    industryType: userProfile.industryType || "general",
    subscriptionPlan: userProfile.subscriptionPlan || "pro_499",
    currentDate: currentDateStr
  };
  const systemInstruction = buildSystemPrompt(businessContext);
  const existingConv = await getConversationById(userId, conversationId);
  const storedMessages = existingConv?.messages || [];
  const contents = [];
  for (const m of storedMessages.slice(-16)) {
    if (m.role === "user") {
      contents.push({
        role: "user",
        parts: [{ text: m.content || "" }]
      });
    } else if (m.role === "model") {
      const parts = [];
      if (m.content) {
        parts.push({ text: m.content });
      }
      if (m.toolCalls && m.toolCalls.length > 0) {
        for (const tc of m.toolCalls) {
          parts.push({
            functionCall: {
              name: tc.name,
              args: tc.args || {}
            }
          });
        }
      }
      if (parts.length > 0) {
        contents.push({ role: "model", parts });
      }
    } else if (m.role === "function" && m.toolResult) {
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: m.toolResult.name,
              response: m.toolResult.result || {}
            }
          }
        ]
      });
    }
  }
  let effectiveMessage = userMessage;
  if (confirmationPayload && confirmationPayload.actionType) {
    effectiveMessage = `Confirmed: Proceed with ${confirmationPayload.actionType}.`;
  }
  contents.push({
    role: "user",
    parts: [{ text: effectiveMessage }]
  });
  const toolsUsed = [];
  let finalResponseText = "";
  let structuredData = null;
  let requiresConfirmation = false;
  let pendingConfirmationPayload = null;
  const maxIterations = 5;
  let iteration = 0;
  while (iteration < maxIterations) {
    iteration++;
    const geminiResponse = await ai.models.generateContent({
      model: config3.gemini.model || "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        tools: [
          {
            functionDeclarations: allToolDeclarations
          }
        ]
      }
    });
    const candidate = geminiResponse.candidates?.[0];
    if (!candidate || !candidate.content) {
      finalResponseText = "I'm sorry, I couldn't process your request right now. Please try again.";
      break;
    }
    const parts = candidate.content.parts || [];
    const functionCalls = parts.filter((p) => Boolean(p.functionCall)).map((p) => p.functionCall);
    const textParts = parts.filter((p) => Boolean(p.text)).map((p) => p.text).join("\n");
    if (textParts) {
      finalResponseText = textParts;
    }
    if (functionCalls.length === 0) {
      break;
    }
    contents.push({
      role: "model",
      parts
    });
    const toolResponseParts = [];
    for (const call of functionCalls) {
      const toolName = call.name;
      let toolArgs = call.args || {};
      if (confirmationPayload && confirmationPayload.payload) {
        toolArgs = { ...toolArgs, ...confirmationPayload.payload, confirmAction: true };
      }
      console.log(`[KwikBill AI Agent] Executing Tool: ${toolName} with args:`, toolArgs);
      let toolResult;
      try {
        toolResult = await executeAgentTool(userId, toolName, toolArgs);
      } catch (err) {
        console.error(`[KwikBill AI Agent] Tool execution error (${toolName}):`, err);
        toolResult = { error: err.message || "Tool execution failed" };
      }
      toolsUsed.push({
        name: toolName,
        args: toolArgs,
        result: toolResult
      });
      if (toolResult?.invoices || toolResult?.invoiceId || toolResult?.pdfUrl || toolResult?.client || toolResult?.paymentId) {
        structuredData = { ...structuredData || {}, ...toolResult };
      }
      if (toolResult?.requiresConfirmation) {
        requiresConfirmation = true;
        pendingConfirmationPayload = toolResult;
      }
      toolResponseParts.push({
        functionResponse: {
          name: toolName,
          response: toolResult
        }
      });
    }
    contents.push({
      role: "user",
      parts: toolResponseParts
    });
    if (requiresConfirmation) {
      const confirmSummaryRes = await ai.models.generateContent({
        model: config3.gemini.model || "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });
      const confirmText = confirmSummaryRes.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n");
      if (confirmText) {
        finalResponseText = confirmText;
      } else if (pendingConfirmationPayload?.confirmationMessage) {
        finalResponseText = pendingConfirmationPayload.confirmationMessage;
      }
      break;
    }
  }
  const newMessagesToStore = [
    ...storedMessages,
    {
      id: randomUUID(),
      role: "user",
      content: effectiveMessage,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      id: randomUUID(),
      role: "model",
      content: finalResponseText,
      toolCalls: toolsUsed.map((t) => ({ name: t.name, args: t.args })),
      structuredData,
      requiresConfirmation,
      confirmationPayload: pendingConfirmationPayload,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  const title = storedMessages.length === 0 ? effectiveMessage.slice(0, 45) : existingConv?.title;
  await saveConversation(userId, conversationId, newMessagesToStore, title);
  return {
    conversationId,
    response: finalResponseText,
    toolsUsed,
    structuredData,
    requiresConfirmation,
    confirmationPayload: pendingConfirmationPayload
  };
}

// src/controllers/ai.controller.ts
var postChatMessage = asyncHandler(async (req, res) => {
  const user = req.dbUser;
  if (!user) {
    throw new BadRequestError("User session not found.");
  }
  if (user.uid === "demo-business-owner-101") {
    throw new ForbiddenError(
      "KwikBill AI Agent is available only for registered, signed-in users. Please sign in with your account to use AI Agent."
    );
  }
  const isSuperAdmin = user.role === "superadmin" || isSuperAdminEmail(user.email);
  const isProPlan = user.subscriptionPlan === "pro_499";
  const isTrialActive = user.subscriptionPlan === "trial_15_days" && user.subscriptionStatus === "trial";
  if (!isSuperAdmin && !isProPlan && !isTrialActive) {
    throw new ForbiddenError(
      "KwikBill AI Agent is exclusively available on the Pro Growth Plan (\u20B9499/mo). Please upgrade your subscription to unlock intelligent AI billing automation."
    );
  }
  const { message, conversationId, confirmationPayload } = req.body;
  if ((!message || !message.trim()) && !confirmationPayload) {
    throw new BadRequestError("Message or confirmationPayload is required.");
  }
  const agentResult = await processAgentTurn({
    userId: user.id,
    userProfile: user,
    conversationId,
    userMessage: (message || "").trim(),
    confirmationPayload
  });
  return ApiResponse.success(res, agentResult);
});
var getConversationsList = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const list = await getConversationsByUserId(userId);
  return ApiResponse.success(res, { conversations: list });
});
var getConversationDetail = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const conversationId = req.params.conversationId;
  const conv = await getConversationById(userId, conversationId);
  if (!conv) {
    return ApiResponse.success(res, { conversation: null, messages: [] });
  }
  return ApiResponse.success(res, { conversation: conv, messages: conv.messages || [] });
});
var removeConversation = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const conversationId = req.params.conversationId;
  await deleteConversation(userId, conversationId);
  return ApiResponse.success(res, { message: "Conversation deleted successfully." });
});
var getChatSuggestions = asyncHandler(async (_req, res) => {
  return ApiResponse.success(res, { suggestions: AI_SUGGESTIONS });
});

// src/routes/ai.routes.ts
var router9 = Router9();
router9.use(requireAuth);
router9.post("/chat", aiLimiter, postChatMessage);
router9.get("/conversations", getConversationsList);
router9.get("/conversations/:conversationId", getConversationDetail);
router9.delete("/conversations/:conversationId", removeConversation);
router9.get("/suggestions", getChatSuggestions);
var ai_routes_default = router9;

// src/controllers/razorpay.controller.ts
import crypto2 from "crypto";
import Razorpay from "razorpay";
function getRazorpayInstance() {
  const keyId = config3.razorpay.keyId;
  const keySecret = config3.razorpay.keySecret;
  if (!keyId || !keySecret) {
    throw new ApiError("Razorpay credentials are not configured in environment variables (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET).", 500, "CONFIG_ERROR");
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}
var processedPaymentIds = /* @__PURE__ */ new Set();
var createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt, planId, notes = {} } = req.body;
  let finalAmount;
  if (planId) {
    const authoritativePlanPrice = PLAN_PRICING[planId];
    if (!authoritativePlanPrice) {
      throw new BadRequestError(`Invalid subscription plan: '${planId}'.`);
    }
    finalAmount = authoritativePlanPrice;
  } else {
    if (!amount || typeof amount !== "number" || amount < 100) {
      throw new BadRequestError("Invalid amount. Minimum amount is 100 paise (\u20B91.00).");
    }
    finalAmount = Math.round(amount);
  }
  const razorpay = getRazorpayInstance();
  const generatedReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
  const orderOptions = {
    amount: finalAmount,
    currency: currency.toUpperCase(),
    receipt: generatedReceipt,
    notes: {
      ...notes,
      planId: planId || "custom_payment",
      userId: req.dbUser?.id ? String(req.dbUser.id) : "guest",
      email: req.user?.email || "",
      expectedAmount: String(finalAmount)
    }
  };
  const order = await razorpay.orders.create(orderOptions);
  return ApiResponse.success(res, {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: config3.razorpay.keyId,
    receipt: order.receipt,
    planId: planId || null
  });
});
var verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new BadRequestError("Missing required payment verification fields (order_id, payment_id, signature).");
  }
  if (processedPaymentIds.has(razorpay_payment_id)) {
    throw new BadRequestError("This payment has already been verified and processed.");
  }
  const keySecret = config3.razorpay.keySecret;
  if (!keySecret) {
    throw new ApiError("Razorpay secret key is not configured on the server.", 500, "CONFIG_ERROR");
  }
  const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto2.createHmac("sha256", keySecret).update(bodyToSign).digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(razorpay_signature, "utf8");
  const isMatch = expectedBuffer.length === receivedBuffer.length && crypto2.timingSafeEqual(expectedBuffer, receivedBuffer);
  if (!isMatch) {
    console.warn(`[Razorpay Signature Mismatch] Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
    throw new BadRequestError("Payment verification failed. Signature mismatch.");
  }
  const razorpay = getRazorpayInstance();
  let verifiedPlanId = planId;
  try {
    const fetchedOrder = await razorpay.orders.fetch(razorpay_order_id);
    const orderPlanId = fetchedOrder?.notes?.planId;
    if (orderPlanId && orderPlanId !== "custom_payment") {
      const requiredPrice = PLAN_PRICING[orderPlanId];
      if (requiredPrice && fetchedOrder.amount < requiredPrice) {
        throw new BadRequestError("Payment amount does not match the price for the requested subscription plan.");
      }
      verifiedPlanId = orderPlanId;
    }
  } catch (fetchErr) {
    if (fetchErr instanceof BadRequestError) throw fetchErr;
    console.warn("[Razorpay Order Fetch Warning]:", fetchErr?.message || fetchErr);
  }
  processedPaymentIds.add(razorpay_payment_id);
  if (processedPaymentIds.size > 5e3) {
    const firstKey = processedPaymentIds.values().next().value;
    if (firstKey) processedPaymentIds.delete(firstKey);
  }
  let updatedUser = null;
  if (req.dbUser?.id && verifiedPlanId && PLAN_PRICING[verifiedPlanId]) {
    try {
      updatedUser = await updateTenantSubscription(req.dbUser.id, verifiedPlanId, "active");
      await Promise.all([
        invalidateUserCache(req.dbUser.id, "profile"),
        invalidateAdminCache("tenants")
      ]);
      console.log(`[Subscription Upgraded] User ${req.dbUser.id} securely upgraded to ${verifiedPlanId}`);
    } catch (dbErr) {
      console.error("[Subscription DB Update Error]:", dbErr);
    }
  }
  return ApiResponse.success(res, {
    message: "Payment verified successfully",
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
    planId: verifiedPlanId || null,
    user: updatedUser || null
  });
});

// src/routes/index.ts
var apiRouter = Router10();
apiRouter.use(generalApiLimiter);
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Invoice & Payment Reminder SaaS",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.post("/create-order", requireAuth, checkoutLimiter, createOrder);
apiRouter.post("/verify-payment", requireAuth, checkoutLimiter, verifyPayment);
apiRouter.post("/razorpay/create-order", requireAuth, checkoutLimiter, createOrder);
apiRouter.post("/razorpay/verify-payment", requireAuth, checkoutLimiter, verifyPayment);
apiRouter.use("/user", user_routes_default);
apiRouter.use("/ai", ai_routes_default);
apiRouter.use("/clients", clients_routes_default);
apiRouter.use("/invoices", invoices_routes_default);
apiRouter.use("/payments", payments_routes_default);
apiRouter.use("/reminders", reminders_routes_default);
apiRouter.use("/analytics", analytics_routes_default);
apiRouter.use("/admin", admin_routes_default);
apiRouter.use("/recurring", recurring_routes_default);
apiRouter.use(globalErrorHandler);
var routes_default = apiRouter;

// src/db/init.ts
init_db();
async function initializeDatabase() {
  const pool2 = createPool();
  try {
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'subscriber',
        business_name TEXT DEFAULT 'My Business',
        phone TEXT DEFAULT '',
        upi_id TEXT DEFAULT '',
        gstin TEXT DEFAULT '',
        address TEXT DEFAULT '',
        industry_type TEXT DEFAULT 'transport',
        subscription_plan TEXT DEFAULT 'pro_499',
        subscription_status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool2.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT DEFAULT 'My Business';
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'businessname') THEN
          UPDATE users SET business_name = businessname WHERE business_name IS NULL OR business_name = 'My Business';
        END IF;
      END $$;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'subscriber';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_no TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_ifsc TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_provider TEXT DEFAULT 'meta';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_api_token TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_template TEXT DEFAULT 'modern';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#4f46e5';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_footer TEXT DEFAULT '';
    `);
    if (config3.superAdminEmails.length > 0) {
      await pool2.query(
        `UPDATE users SET role = 'superadmin' WHERE LOWER(email) = ANY($1::text[]);`,
        [config3.superAdminEmails]
      );
    }
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT DEFAULT '',
        company_name TEXT DEFAULT '',
        address TEXT DEFAULT '',
        gstin TEXT DEFAULT '',
        industry_type TEXT DEFAULT 'general',
        payment_term_days INTEGER DEFAULT 7,
        notes TEXT DEFAULT '',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        invoice_number TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        currency TEXT NOT NULL DEFAULT 'INR',
        subtotal NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
        tax_rate NUMERIC(5, 2) DEFAULT '18.00',
        tax_amount NUMERIC(12, 2) DEFAULT '0.00',
        tds_rate NUMERIC(5, 2) DEFAULT '0.00',
        tds_amount NUMERIC(12, 2) DEFAULT '0.00',
        discount_amount NUMERIC(12, 2) DEFAULT '0.00',
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
        paid_amount NUMERIC(12, 2) DEFAULT '0.00',
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        industry_details JSONB DEFAULT '{}'::jsonb,
        notes TEXT DEFAULT 'Thank you for your business! Please settle the dues promptly via UPI or bank transfer.',
        terms TEXT DEFAULT 'Payment is due within the stipulated days. Interest of 2%/month applicable on late payments.',
        reminder_sent_count INTEGER DEFAULT 0,
        last_reminder_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool2.query(`
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT DEFAULT '';
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_rcm BOOLEAN DEFAULT false;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_type TEXT DEFAULT 'intra_state';
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS share_token TEXT DEFAULT '';
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancel_reason TEXT DEFAULT '';
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'upi',
        reference_number TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS reminder_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        channel TEXT NOT NULL DEFAULT 'whatsapp',
        template_type TEXT NOT NULL DEFAULT 'standard',
        message_content TEXT NOT NULL,
        recipient_phone TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS plan_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        business_name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        industry_type TEXT DEFAULT 'transport' NOT NULL,
        requested_plan TEXT NOT NULL,
        business_needs TEXT DEFAULT '',
        status TEXT DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS recurring_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL DEFAULT 'Recurring Retainer Billing',
        frequency TEXT NOT NULL DEFAULT 'monthly',
        interval INTEGER NOT NULL DEFAULT 1,
        start_date TEXT NOT NULL,
        next_run_date TEXT NOT NULL,
        end_date TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        auto_send_whatsapp BOOLEAN NOT NULL DEFAULT true,
        currency TEXT NOT NULL DEFAULT 'INR',
        subtotal NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
        tax_rate NUMERIC(5, 2) DEFAULT '18.00',
        tax_amount NUMERIC(12, 2) DEFAULT '0.00',
        tds_rate NUMERIC(5, 2) DEFAULT '0.00',
        tds_amount NUMERIC(12, 2) DEFAULT '0.00',
        discount_amount NUMERIC(12, 2) DEFAULT '0.00',
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        industry_details JSONB DEFAULT '{}'::jsonb,
        notes TEXT DEFAULT 'Automated recurring invoice. Thank you for your continued business!',
        terms TEXT DEFAULT 'Payment is due within 7 days of invoice generation.',
        generated_count INTEGER NOT NULL DEFAULT 0,
        last_generated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id SERIAL PRIMARY KEY,
        conversation_id TEXT NOT NULL UNIQUE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL DEFAULT 'New Conversation',
        messages JSONB NOT NULL DEFAULT '[]'::jsonb,
        last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool2.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_share_token ON invoices(share_token);
      CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id ON reminder_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_reminder_logs_invoice_id ON reminder_logs(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_profiles_user_id ON recurring_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_profiles_next_run ON recurring_profiles(next_run_date, is_active);
      CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_ai_conversations_conv_id ON ai_conversations(conversation_id);
    `);
    console.log("Database tables & performance indexes verified / initialized successfully.");
  } catch (err) {
    console.error("Error initializing database tables:", err);
  }
}

// src/api-serverless.ts
import * as dotenv3 from "dotenv";
dotenv3.config();
var app = express();
app.set("trust proxy", 1);
app.use((req, res, next) => {
  if (!req.socket) {
    req.socket = {};
  }
  if (!req.socket.remoteAddress) {
    const forwarded = req.headers["x-forwarded-for"];
    req.socket.remoteAddress = (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : null) || req.headers["x-real-ip"] || "127.0.0.1";
  }
  if (!req.connection) {
    req.connection = req.socket;
  }
  next();
});
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use(express.json());
app.use("/api", routes_default);
app.use("/", routes_default);
app.use((err, req, res, next) => {
  console.error("[Vercel API Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});
var dbInitPromise = null;
function ensureDatabaseInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase().catch((err) => {
      console.error("[Serverless DB Init Error]:", err);
      dbInitPromise = null;
    });
  }
  return dbInitPromise;
}
async function handler(req, res) {
  try {
    await ensureDatabaseInitialized();
  } catch (err) {
    console.error("[Handler DB Init Exception]:", err);
  }
  return app(req, res);
}
export {
  handler as default
};
