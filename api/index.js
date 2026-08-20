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
var users, clients, invoices, payments, reminderLogs, planRequests, recurringProfiles, usersRelations, recurringProfilesRelations, planRequestsRelations, clientsRelations, invoicesRelations, paymentsRelations, reminderLogsRelations;
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
    usersRelations = relations(users, ({ many }) => ({
      clients: many(clients),
      invoices: many(invoices),
      payments: many(payments),
      reminderLogs: many(reminderLogs),
      planRequests: many(planRequests),
      recurringProfiles: many(recurringProfiles)
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

// src/api-serverless.ts
import express from "express";

// src/routes/index.ts
import { Router as Router9 } from "express";

// src/routes/user.routes.ts
import { Router } from "express";

// src/db/index.ts
init_schema();
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();
var createPool = () => {
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
var pool = createPool();
var db = drizzle(pool, { schema: schema_exports });

// src/db/users.ts
init_schema();
import { eq } from "drizzle-orm";

// src/config/app.config.ts
import * as dotenv2 from "dotenv";
dotenv2.config();
var config3 = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 3e3,
  // SuperAdmin configuration: Supports comma-separated list of admin emails
  superAdminEmails: (process.env.ADMIN_EMAIL || process.env.SUPERADMIN_EMAIL || "arai.343531@gmail.com").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
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
  // Security / Demo Mode
  allowDemoAuth: process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_AUTH === "true"
};
function isSuperAdminEmail(email) {
  if (!email) return false;
  return config3.superAdminEmails.includes(email.trim().toLowerCase());
}

// src/db/users.ts
async function getOrCreateUser(uid, email, businessName) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }
    const isAdmin = isSuperAdminEmail(email);
    const role = isAdmin ? "superadmin" : "subscriber";
    const trialDays = 15;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1e3);
    const result = await db.insert(users).values({
      uid,
      email,
      role,
      businessName: businessName || (isAdmin ? "Platform SuperAdmin" : "My Business"),
      upiId: "",
      phone: "",
      gstin: "",
      address: "",
      industryType: "transport",
      subscriptionPlan: isAdmin ? "pro_499" : "trial_15_days",
      subscriptionStatus: isAdmin ? "active" : "trial",
      trialEndsAt: isAdmin ? null : trialEndsAt
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        role: isAdmin ? "superadmin" : users.role,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return result[0];
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
    }).where(eq(users.id, userId)).returning();
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
    }).where(eq(users.id, userId)).returning();
    return updated[0];
  } catch (error) {
    console.error("Database update tenant subscription failed:", error);
    throw new Error("Failed to update tenant subscription.", { cause: error });
  }
}

// src/controllers/user.controller.ts
init_schema();
import { eq as eq2 } from "drizzle-orm";

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
      ...process.env.NODE_ENV !== "production" && err.details ? { details: err.details } : {}
    }
  });
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
  return ApiResponse.success(res, { user: updated });
});
var resetUserData = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  await db.transaction(async (tx) => {
    await tx.delete(reminderLogs).where(eq2(reminderLogs.userId, userId));
    await tx.delete(payments).where(eq2(payments.userId, userId));
    await tx.delete(recurringProfiles).where(eq2(recurringProfiles.userId, userId));
    await tx.delete(invoices).where(eq2(invoices.userId, userId));
    await tx.delete(clients).where(eq2(clients.userId, userId));
  });
  return ApiResponse.success(res, { message: "Workspace successfully reset to a clean slate." });
});

// src/controllers/admin.controller.ts
init_schema();

// src/db/planRequests.ts
init_schema();
import { eq as eq3, desc } from "drizzle-orm";
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
  const [updated] = await db.update(planRequests).set({ status }).where(eq3(planRequests.id, id)).returning();
  return updated;
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
  return ApiResponse.success(res, { tenant: created[0] }, 201, "Tenant onboarded successfully");
});
var putTenantSubscription = asyncHandler(async (req, res) => {
  const tenantId = parsePositiveInt(req.params.id, "tenant ID");
  const { plan, status } = req.body;
  if (!plan || !status) {
    throw new BadRequestError("Both plan and status are required.");
  }
  const updated = await updateTenantSubscription(tenantId, plan, status);
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
  }
  return ApiResponse.success(res, { request: updated });
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
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (isDevOrDemo) {
      const demoUid = "demo-business-owner-101";
      const demoEmail = "owner@speedytrans.in";
      try {
        const dbUser = await getOrCreateUser(demoUid, demoEmail, "Speedy Transport & Logistics");
        req.user = { uid: demoUid, email: demoEmail, name: "Speedy Transport Logistics" };
        req.dbUser = dbUser;
        return next();
      } catch (err) {
        console.error("Error creating/fetching fallback user:", err);
        return res.status(500).json({ success: false, error: { code: "SESSION_INIT_ERROR", message: "Database session initialization error" } });
      }
    }
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized: Missing or invalid Authorization header." } });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || "user@example.com",
      decodedToken.name || "My Business"
    );
    req.user = decodedToken;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    if (isDevOrDemo) {
      const demoUid = "demo-business-owner-101";
      const demoEmail = "owner@speedytrans.in";
      const dbUser = await getOrCreateUser(demoUid, demoEmail, "Speedy Transport & Logistics");
      req.user = { uid: demoUid, email: demoEmail, name: "Speedy Transport Logistics" };
      req.dbUser = dbUser;
      return next();
    }
    return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Unauthorized: Invalid or expired authentication token." } });
  }
};

// src/routes/user.routes.ts
var router = Router();
router.use(requireAuth);
router.get("/profile", getUserProfile);
router.put("/profile", putUserProfile);
router.post("/reset", resetUserData);
router.post("/plan-request", submitPlanRequest);
var user_routes_default = router;

// src/routes/clients.routes.ts
import { Router as Router2 } from "express";

// src/db/clients.ts
init_schema();
import { eq as eq4, and, desc as desc2, inArray } from "drizzle-orm";
async function getClientsByUserId(userId) {
  try {
    return await db.select().from(clients).where(eq4(clients.userId, userId)).orderBy(desc2(clients.createdAt));
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
    const updated = await db.update(clients).set(clientData).where(and(eq4(clients.id, clientId), eq4(clients.userId, userId))).returning();
    return updated[0];
  } catch (error) {
    console.error("Failed to update client:", error);
    throw new Error("Failed to update client.", { cause: error });
  }
}
async function toggleClientActive(userId, clientId, isActive) {
  try {
    if (typeof isActive === "boolean") {
      const updated = await db.update(clients).set({ isActive }).where(and(eq4(clients.id, clientId), eq4(clients.userId, userId))).returning();
      return updated[0];
    } else {
      const existing = await db.select().from(clients).where(and(eq4(clients.id, clientId), eq4(clients.userId, userId)));
      if (!existing || existing.length === 0) {
        throw new Error("Client not found");
      }
      const newStatus = !existing[0].isActive;
      const updated = await db.update(clients).set({ isActive: newStatus }).where(and(eq4(clients.id, clientId), eq4(clients.userId, userId))).returning();
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
      const clientInvoices = await tx.select({ id: invoices.id }).from(invoices).where(and(eq4(invoices.clientId, clientId), eq4(invoices.userId, userId)));
      const invoiceIds = clientInvoices.map((inv) => inv.id);
      if (invoiceIds.length > 0) {
        await tx.delete(payments).where(and(eq4(payments.userId, userId), inArray(payments.invoiceId, invoiceIds)));
      }
      await tx.delete(reminderLogs).where(and(eq4(reminderLogs.clientId, clientId), eq4(reminderLogs.userId, userId)));
      await tx.delete(recurringProfiles).where(and(eq4(recurringProfiles.clientId, clientId), eq4(recurringProfiles.userId, userId)));
      if (invoiceIds.length > 0) {
        await tx.delete(invoices).where(and(eq4(invoices.clientId, clientId), eq4(invoices.userId, userId)));
      }
      const deleted = await tx.delete(clients).where(and(eq4(clients.id, clientId), eq4(clients.userId, userId))).returning();
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
  return ApiResponse.success(res, { client: created }, 201, "Client added successfully");
});
var putClient = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const clientId = parsePositiveInt(req.params.id, "client ID");
  const updated = await updateClientService(userId, clientId, req.body);
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
  return ApiResponse.success(res, { client: updated }, 200, "Client status updated");
});
var removeClient = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const clientId = parsePositiveInt(req.params.id, "client ID");
  await deleteClientService(userId, clientId);
  return ApiResponse.success(res, { message: "Client deleted successfully" });
});

// src/routes/clients.routes.ts
var router2 = Router2();
router2.use(requireAuth);
router2.get("/", getClients);
router2.post("/", postClient);
router2.put("/:id", putClient);
router2.patch("/:id/toggle-status", toggleClient);
router2.post("/:id/toggle-status", toggleClient);
router2.delete("/:id", removeClient);
var clients_routes_default = router2;

// src/routes/invoices.routes.ts
import { Router as Router3 } from "express";

// src/db/invoices.ts
init_schema();
import { eq as eq5, and as and2, desc as desc3, or, sql } from "drizzle-orm";
import crypto from "crypto";
async function getInvoicesByUserId(userId, options) {
  try {
    const conditions = [eq5(invoices.userId, userId)];
    if (options?.status && options.status !== "all") {
      conditions.push(eq5(invoices.status, options.status));
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
    }).from(invoices).innerJoin(clients, eq5(invoices.clientId, clients.id)).where(and2(...conditions)).orderBy(desc3(invoices.createdAt));
    if (options?.limit && options.limit > 0) {
      query = query.limit(options.limit);
      if (options.offset && options.offset > 0) {
        query = query.offset(options.offset);
      }
    }
    const list = await query;
    return list.map((item) => ({
      ...item.invoice,
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
    }).from(invoices).innerJoin(clients, eq5(invoices.clientId, clients.id)).where(and2(eq5(invoices.id, invoiceId), eq5(invoices.userId, userId)));
    if (rows.length === 0) return null;
    const paymentRows = await db.select().from(payments).where(and2(eq5(payments.invoiceId, invoiceId), eq5(payments.userId, userId))).orderBy(desc3(payments.createdAt));
    const reminderRows = await db.select().from(reminderLogs).where(and2(eq5(reminderLogs.invoiceId, invoiceId), eq5(reminderLogs.userId, userId))).orderBy(desc3(reminderLogs.sentAt));
    return {
      ...rows[0].invoice,
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
    const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const rows = await db.select({
      invoice: invoices,
      client: clients,
      merchant: {
        id: users2.id,
        businessName: users2.businessName,
        phone: users2.phone,
        upiId: users2.upiId,
        gstin: users2.gstin,
        address: users2.address,
        bankName: users2.bankName,
        bankAccountNo: users2.bankAccountNo,
        bankIfsc: users2.bankIfsc,
        industryType: users2.industryType,
        logoUrl: users2.logoUrl,
        invoiceTemplate: users2.invoiceTemplate,
        brandColor: users2.brandColor,
        customFooter: users2.customFooter
      }
    }).from(invoices).innerJoin(clients, eq5(invoices.clientId, clients.id)).innerJoin(users2, eq5(invoices.userId, users2.id)).where(or(eq5(invoices.shareToken, identifier), eq5(invoices.invoiceNumber, identifier)));
    if (rows.length === 0) return null;
    return {
      ...rows[0].invoice,
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
    const generatedShareToken = data.shareToken || `inv_live_${crypto.randomBytes(12).toString("hex")}`;
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
    const updated = await db.update(invoices).set(updateObj).where(and2(eq5(invoices.id, invoiceId), eq5(invoices.userId, userId))).returning();
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
    }).where(and2(eq5(invoices.id, invoiceId), eq5(invoices.userId, userId))).returning();
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
    }).where(and2(eq5(invoices.id, invoiceId), eq5(invoices.userId, userId))).returning();
    return updated[0];
  } catch (error) {
    console.error("Failed to cancel invoice:", error);
    throw new Error("Failed to cancel invoice.", { cause: error });
  }
}

// src/services/invoices.service.ts
init_schema();
import { eq as eq6, and as and3 } from "drizzle-orm";
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
  const clientExists = await db.select({ id: clients.id }).from(clients).where(and3(eq6(clients.id, clientId), eq6(clients.userId, userId))).limit(1);
  if (clientExists.length === 0) {
    throw new NotFoundError("Client not found in your client directory.");
  }
  if (!data.invoiceNumber || !data.invoiceNumber.trim()) {
    throw new BadRequestError("Invoice number is required.");
  }
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new BadRequestError("At least one line item is required on the invoice.");
  }
  return await createInvoice(userId, {
    ...data,
    clientId,
    issueDate: data.issueDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dueDate: data.dueDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    subtotal: String(data.subtotal || "0.00"),
    totalAmount: String(data.totalAmount || "0.00")
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
  return ApiResponse.success(res, { invoice: created }, 201, "Invoice created successfully");
});
var putInvoiceStatus = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const invoiceId = parsePositiveInt(req.params.id, "invoice ID");
  const { status, paidAmount } = req.body;
  const updated = await updateInvoiceStatusService(userId, invoiceId, status, paidAmount);
  return ApiResponse.success(res, { invoice: updated }, 200, "Invoice status updated");
});
var removeInvoice = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const invoiceId = parsePositiveInt(req.params.id, "invoice ID");
  const reason = req.body?.reason;
  await cancelInvoiceService(userId, invoiceId, reason);
  return ApiResponse.success(res, { message: "Invoice cancelled successfully." });
});

// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
var getClientIp = (req) => {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.headers?.["x-real-ip"] || req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip || "127.0.0.1";
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

// src/routes/invoices.routes.ts
var router3 = Router3();
router3.get("/public/:invoiceNumber", publicPayLimiter, getPublicInvoice);
router3.use(requireAuth);
router3.get("/", getInvoices);
router3.get("/:id", getInvoice);
router3.post("/", postInvoice);
router3.put("/:id/status", putInvoiceStatus);
router3.delete("/:id", removeInvoice);
var invoices_routes_default = router3;

// src/routes/payments.routes.ts
import { Router as Router4 } from "express";

// src/services/payments.service.ts
init_schema();
import { eq as eq7, and as and4, desc as desc4 } from "drizzle-orm";
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
    const invRows = await tx.select().from(invoices).where(and4(eq7(invoices.id, invoiceId), eq7(invoices.userId, userId)));
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
    const allPayments = await tx.select().from(payments).where(and4(eq7(payments.invoiceId, invoiceId), eq7(payments.userId, userId)));
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
    }).where(and4(eq7(invoices.id, invoiceId), eq7(invoices.userId, userId)));
    return inserted[0];
  });
}
async function getPaymentsService(userId) {
  return await db.select().from(payments).where(eq7(payments.userId, userId)).orderBy(desc4(payments.createdAt));
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
  return ApiResponse.success(res, { payment: recorded }, 201, "Payment recorded successfully");
});

// src/routes/payments.routes.ts
var router4 = Router4();
router4.use(requireAuth);
router4.get("/", getPayments);
router4.post("/", postPayment);
var payments_routes_default = router4;

// src/routes/reminders.routes.ts
import { Router as Router5 } from "express";

// src/db/reminders.ts
init_schema();
import { eq as eq8, desc as desc5 } from "drizzle-orm";
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
    }).from(reminderLogs).leftJoin(clients, eq8(reminderLogs.clientId, clients.id)).leftJoin(invoices, eq8(reminderLogs.invoiceId, invoices.id)).where(eq8(reminderLogs.userId, userId)).orderBy(desc5(reminderLogs.sentAt));
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
    recipientPhone,
    sendMethod,
    pdfUrl,
    sendAsDocument
  } = req.body;
  const parsedInvoiceId = parseInt(String(invoiceId), 10);
  const parsedClientId = parseInt(String(clientId), 10);
  if (isNaN(parsedInvoiceId) || isNaN(parsedClientId)) {
    throw new BadRequestError("Valid invoiceId and clientId are required.");
  }
  if (!messageContent || !messageContent.trim()) {
    throw new BadRequestError("Reminder message content cannot be empty.");
  }
  if (!recipientPhone || !recipientPhone.trim()) {
    throw new BadRequestError("Recipient WhatsApp phone number is required.");
  }
  const invoice = await getInvoiceById(userId, parsedInvoiceId);
  if (!invoice) {
    throw new NotFoundError("Invoice not found or does not belong to your business account.");
  }
  const cleanPhone = normalizeIndianPhoneNumber(recipientPhone);
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
      messageContent,
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
    messageContent,
    recipientPhone: cleanPhone,
    status: deliveryStatus
  });
  const whatsappUrl = generateWaMeUrl(cleanPhone, messageContent);
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
router5.get("/logs", getReminderLogs);
router5.post("/send", remindersLimiter, sendReminder);
var reminders_routes_default = router5;

// src/routes/analytics.routes.ts
import { Router as Router6 } from "express";

// src/db/payments.ts
init_schema();
import { eq as eq9, and as and6, desc as desc6 } from "drizzle-orm";
async function getPaymentsForUser(userId) {
  try {
    return await db.select().from(payments).where(eq9(payments.userId, userId)).orderBy(desc6(payments.createdAt));
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
router6.get("/", getAnalytics);
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
router7.get("/tenants", getTenants);
router7.post("/tenants", postTenant);
router7.put("/tenants/:id/subscription", putTenantSubscription);
router7.get("/plan-requests", getPlanRequestsList);
router7.put("/plan-requests/:id", putPlanRequestStatus);
var admin_routes_default = router7;

// src/routes/recurring.routes.ts
import { Router as Router8 } from "express";

// src/db/recurring.ts
init_schema();
import { eq as eq10, and as and7, desc as desc7, lte } from "drizzle-orm";
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
  }).from(recurringProfiles).innerJoin(clients, eq10(recurringProfiles.clientId, clients.id)).where(eq10(recurringProfiles.userId, userId)).orderBy(desc7(recurringProfiles.createdAt));
  return rows.map((r) => ({
    ...r.profile,
    client: r.client
  }));
}
async function getRecurringProfileById(userId, id) {
  const rows = await db.select().from(recurringProfiles).where(and7(eq10(recurringProfiles.id, id), eq10(recurringProfiles.userId, userId))).limit(1);
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
  }).where(and7(eq10(recurringProfiles.id, id), eq10(recurringProfiles.userId, userId))).returning();
  return updated.length > 0 ? updated[0] : null;
}
async function deleteRecurringProfileFromDb(userId, id) {
  const deleted = await db.delete(recurringProfiles).where(and7(eq10(recurringProfiles.id, id), eq10(recurringProfiles.userId, userId))).returning();
  return deleted.length > 0;
}
async function getDueRecurringProfiles(todayStr) {
  return await db.select({
    profile: recurringProfiles,
    client: clients,
    merchant: users
  }).from(recurringProfiles).innerJoin(clients, eq10(recurringProfiles.clientId, clients.id)).innerJoin(users, eq10(recurringProfiles.userId, users.id)).where(
    and7(
      eq10(recurringProfiles.isActive, true),
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
  }).where(eq10(recurringProfiles.id, id)).returning();
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
  return ApiResponse.success(res, { profile: created }, 201, "Recurring profile created successfully");
});
var toggleRecurringProfile = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const id = parsePositiveInt(req.params.id, "recurring profile ID");
  const updated = await toggleRecurringProfileInDb(userId, id);
  if (!updated) {
    throw new NotFoundError("Recurring profile not found.");
  }
  return ApiResponse.success(res, { profile: updated }, 200, "Recurring profile status toggled");
});
var deleteRecurringProfile = asyncHandler(async (req, res) => {
  const userId = req.dbUser.id;
  const id = parsePositiveInt(req.params.id, "recurring profile ID");
  const deleted = await deleteRecurringProfileFromDb(userId, id);
  if (!deleted) {
    throw new NotFoundError("Recurring profile not found.");
  }
  return ApiResponse.success(res, { message: "Recurring profile deleted successfully" });
});
var triggerManualRun = asyncHandler(async (req, res) => {
  const result = await processRecurringInvoices();
  return ApiResponse.success(res, { result });
});

// src/routes/recurring.routes.ts
var router8 = Router8();
router8.use(requireAuth);
router8.get("/", getRecurringProfiles);
router8.post("/", createRecurringProfile);
router8.put("/:id/toggle", toggleRecurringProfile);
router8.delete("/:id", deleteRecurringProfile);
router8.post("/trigger-run", triggerManualRun);
var recurring_routes_default = router8;

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
var createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt, planId, notes = {} } = req.body;
  if (!amount || typeof amount !== "number" || amount < 100) {
    throw new BadRequestError("Invalid amount. Minimum amount is 100 paise (\u20B91.00).");
  }
  const razorpay = getRazorpayInstance();
  const generatedReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
  const orderOptions = {
    amount: Math.round(amount),
    currency: currency.toUpperCase(),
    receipt: generatedReceipt,
    notes: {
      ...notes,
      planId: planId || "standard_plan",
      userId: req.dbUser?.id ? String(req.dbUser.id) : "guest",
      email: req.user?.email || ""
    }
  };
  const order = await razorpay.orders.create(orderOptions);
  return ApiResponse.success(res, {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: config3.razorpay.keyId,
    receipt: order.receipt
  });
});
var verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new BadRequestError("Missing required payment verification fields (order_id, payment_id, signature).");
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
  let updatedUser = null;
  if (req.dbUser?.id && planId) {
    try {
      updatedUser = await updateTenantSubscription(req.dbUser.id, planId, "active");
      console.log(`[Subscription Upgraded] User ${req.dbUser.id} upgraded to ${planId}`);
    } catch (dbErr) {
      console.error("[Subscription DB Update Error]:", dbErr);
    }
  }
  return ApiResponse.success(res, {
    message: "Payment verified successfully",
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
    planId: planId || null,
    user: updatedUser || null
  });
});

// src/routes/index.ts
var apiRouter = Router9();
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
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
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
