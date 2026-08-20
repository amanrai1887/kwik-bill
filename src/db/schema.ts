import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users / Businesses
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('subscriber').notNull(), // 'superadmin' | 'subscriber'
  businessName: text('business_name').default('My Business'),
  phone: text('phone').default(''),
  upiId: text('upi_id').default(''),
  gstin: text('gstin').default(''),
  address: text('address').default(''),
  bankName: text('bank_name').default(''),
  bankAccountNo: text('bank_account_no').default(''),
  bankIfsc: text('bank_ifsc').default(''),
  industryType: text('industry_type').default('transport'), // transport | agency | freelancer | consultant
  subscriptionPlan: text('subscription_plan').default('trial_15_days'), // trial_15_days | starter_299 | pro_499
  subscriptionStatus: text('subscription_status').default('trial'), // trial | active | expired | inactive
  trialEndsAt: timestamp('trial_ends_at'),
  
  // WhatsApp Direct API Gateway Config
  whatsappProvider: text('whatsapp_provider').default('meta'), // 'meta' | 'generic'
  whatsappPhoneNumberId: text('whatsapp_phone_number_id').default(''),
  whatsappApiToken: text('whatsapp_api_token').default(''),

  // Custom Invoice Templates & Branding
  logoUrl: text('logo_url').default(''),
  invoiceTemplate: text('invoice_template').default('modern'), // modern | corporate | logistics | creative | classic | dark_neon
  brandColor: text('brand_color').default('#4f46e5'), // Hex code
  customFooter: text('custom_footer').default(''),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});





// Clients Directory
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(), // WhatsApp Phone number
  email: text('email').default(''),
  companyName: text('company_name').default(''),
  address: text('address').default(''),
  gstin: text('gstin').default(''),
  industryType: text('industry_type').default('general'), // transport, agency, freelancer, consultant
  paymentTermDays: integer('payment_term_days').default(7),
  notes: text('notes').default(''),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Invoices
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: integer('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  issueDate: text('issue_date').notNull(), // YYYY-MM-DD
  dueDate: text('due_date').notNull(), // YYYY-MM-DD
  status: text('status').default('pending').notNull(), // 'pending' | 'paid' | 'overdue' | 'partial'
  
  // Financials
  currency: text('currency').default('INR').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0.00'),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('18.00'), // GST %
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0.00'),
  tdsRate: numeric('tds_rate', { precision: 5, scale: 2 }).default('0.00'), // TDS % (Consultants/Agencies)
  tdsAmount: numeric('tds_amount', { precision: 12, scale: 2 }).default('0.00'),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).default('0.00'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).default('0.00'),

  // GST Compliance & Security Isolation
  placeOfSupply: text('place_of_supply').default(''),
  isRcm: boolean('is_rcm').default(false),
  taxType: text('tax_type').default('intra_state'), // 'intra_state' | 'inter_state'
  shareToken: text('share_token').default(''),
  isCancelled: boolean('is_cancelled').default(false),
  cancelReason: text('cancel_reason').default(''),

  // Itemized breakdown & industry custom fields (stored as structured JSON)
  items: jsonb('items').notNull(), // Array<{ description: string, quantity: number, uqc?: string, rate: number, gstRate?: number, amount: number, hsnCode?: string }>
  industryDetails: jsonb('industry_details').default({}), // e.g. Transport: { vehicleNo, lrNumber, routeFrom, routeTo }, Consultant: { sessionDates, hours }

  notes: text('notes').default('Thank you for your business! Please settle the dues promptly via UPI or bank transfer.'),
  terms: text('terms').default('Payment is due within the stipulated days. Interest of 2%/month applicable on late payments.'),
  
  reminderSentCount: integer('reminder_sent_count').default(0),
  lastReminderSentAt: timestamp('last_reminder_sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payments Log
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  invoiceId: integer('invoice_id')
    .references(() => invoices.id, { onDelete: 'cascade' })
    .notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentDate: text('payment_date').notNull(), // YYYY-MM-DD
  paymentMethod: text('payment_method').default('upi').notNull(), // upi | bank_transfer | cash | cheque
  referenceNumber: text('reference_number').default(''),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// WhatsApp & Communication Reminders Log
export const reminderLogs = pgTable('reminder_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  invoiceId: integer('invoice_id')
    .references(() => invoices.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: integer('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  channel: text('channel').default('whatsapp').notNull(), // whatsapp | sms | email
  templateType: text('template_type').default('standard').notNull(), // polite | standard | urgent | overdue
  messageContent: text('message_content').notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  status: text('status').default('sent').notNull(), // sent | delivered | clicked
  sentAt: timestamp('sent_at').defaultNow(),
});

// Subscription Plan Requests (When users apply for Starter / Pro paid tiers)
export const planRequests = pgTable('plan_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  businessName: text('business_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  industryType: text('industry_type').default('transport').notNull(),
  requestedPlan: text('requested_plan').notNull(), // 'starter_299' | 'pro_499'
  businessNeeds: text('business_needs').default(''),
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp('created_at').defaultNow(),
});

// Recurring Invoice Profiles
export const recurringProfiles = pgTable('recurring_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: integer('client_id')
    .references(() => clients.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').default('Recurring Retainer Billing').notNull(),
  frequency: text('frequency').default('monthly').notNull(), // 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  interval: integer('interval').default(1).notNull(),
  startDate: text('start_date').notNull(), // YYYY-MM-DD
  nextRunDate: text('next_run_date').notNull(), // YYYY-MM-DD
  endDate: text('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  autoSendWhatsApp: boolean('auto_send_whatsapp').default(true).notNull(),
  
  // Template Invoice Financials
  currency: text('currency').default('INR').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0.00'),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('18.00'),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0.00'),
  tdsRate: numeric('tds_rate', { precision: 5, scale: 2 }).default('0.00'),
  tdsAmount: numeric('tds_amount', { precision: 12, scale: 2 }).default('0.00'),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).default('0.00'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  
  // Line Items & Metadata
  items: jsonb('items').notNull(), // Array<{ description: string, quantity: number, rate: number, amount: number, hsnCode?: string }>
  industryDetails: jsonb('industry_details').default({}),
  notes: text('notes').default('Automated recurring invoice. Thank you for your continued business!'),
  terms: text('terms').default('Payment is due within 7 days of invoice generation.'),
  
  generatedCount: integer('generated_count').default(0).notNull(),
  lastGeneratedAt: timestamp('last_generated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  invoices: many(invoices),
  payments: many(payments),
  reminderLogs: many(reminderLogs),
  planRequests: many(planRequests),
  recurringProfiles: many(recurringProfiles),
}));

export const recurringProfilesRelations = relations(recurringProfiles, ({ one }) => ({
  user: one(users, {
    fields: [recurringProfiles.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [recurringProfiles.clientId],
    references: [clients.id],
  }),
}));

export const planRequestsRelations = relations(planRequests, ({ one }) => ({
  user: one(users, {
    fields: [planRequests.userId],
    references: [users.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
  reminderLogs: many(reminderLogs),
  recurringProfiles: many(recurringProfiles),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  payments: many(payments),
  reminderLogs: many(reminderLogs),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const reminderLogsRelations = relations(reminderLogs, ({ one }) => ({
  user: one(users, {
    fields: [reminderLogs.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [reminderLogs.invoiceId],
    references: [invoices.id],
  }),
  client: one(clients, {
    fields: [reminderLogs.clientId],
    references: [clients.id],
  }),
}));

