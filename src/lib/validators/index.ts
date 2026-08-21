import { z } from 'zod';
import { 
  EMAIL_REGEX, 
  PHONE_REGEX, 
  GSTIN_REGEX, 
  PAN_REGEX, 
  IFSC_REGEX, 
  UPI_REGEX, 
  HEX_COLOR_REGEX, 
  BANK_ACCOUNT_REGEX, 
  HSN_SAC_REGEX, 
  INVOICE_NUMBER_REGEX 
} from './regexPatterns.ts';

// -------------------------------------------------------------
// 1. REUSABLE FIELD VALIDATORS
// -------------------------------------------------------------

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email address cannot be empty.')
  .max(255, 'Email address cannot exceed 255 characters.')
  .regex(EMAIL_REGEX, 'Please enter a valid email address (e.g. name@company.com).')
  .toLowerCase();

export const optionalEmailField = z
  .string()
  .trim()
  .max(255, 'Email address cannot exceed 255 characters.')
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || EMAIL_REGEX.test(val), {
    message: 'Please enter a valid email address format.',
  });

export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .max(128, 'Password cannot exceed 128 characters.')
  .refine((val) => /[a-zA-Z]/.test(val), {
    message: 'Password must contain at least one letter.',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must contain at least one numeric digit.',
  });

export const phoneField = z
  .string()
  .trim()
  .min(1, 'Phone number is required.')
  .refine((val) => {
    const cleaned = val.replace(/[\s\-()]/g, '');
    return PHONE_REGEX.test(cleaned);
  }, {
    message: 'Please enter a valid phone number (10-digit mobile or international format).',
  });

export const optionalPhoneField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((val) => {
    if (!val) return true;
    const cleaned = val.replace(/[\s\-()]/g, '');
    return PHONE_REGEX.test(cleaned);
  }, {
    message: 'Please enter a valid phone number (10-digit mobile or international format).',
  });

export const optionalGstinField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || GSTIN_REGEX.test(val.toUpperCase()), {
    message: 'GSTIN must be exactly 15 alphanumeric characters (e.g. 27AAPFU0939F1ZV).',
  })
  .transform((val) => (val ? val.toUpperCase() : ''));

export const optionalPanField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || PAN_REGEX.test(val.toUpperCase()), {
    message: 'PAN must be a valid 10-character code (e.g. ABCDE1234F).',
  })
  .transform((val) => (val ? val.toUpperCase() : ''));

export const optionalIfscField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || IFSC_REGEX.test(val.toUpperCase()), {
    message: 'IFSC code must be 11 characters (e.g. HDFC0001234).',
  })
  .transform((val) => (val ? val.toUpperCase() : ''));

export const optionalUpiField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || UPI_REGEX.test(val), {
    message: 'UPI ID must be in standard format (e.g. yourname@okaxis or 9876543210@upi).',
  });

export const optionalBankAccountField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || BANK_ACCOUNT_REGEX.test(val.replace(/\s/g, '')), {
    message: 'Bank account number must be between 9 and 18 digits.',
  });

export const optionalHexColorField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || HEX_COLOR_REGEX.test(val), {
    message: 'Brand color must be a valid hex code (e.g. #4f46e5).',
  });

// -------------------------------------------------------------
// 2. AUTH SCHEMAS
// -------------------------------------------------------------

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password cannot be empty.'),
});

export const registerSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }
  );

export const forgotPasswordSchema = z.object({
  email: emailField,
});

// -------------------------------------------------------------
// 3. CLIENT / PARTY SCHEMAS
// -------------------------------------------------------------

export const createClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Party name must be at least 2 characters.')
    .max(100, 'Party name cannot exceed 100 characters.'),
  phone: phoneField,
  email: optionalEmailField,
  companyName: z.string().trim().max(120, 'Company name cannot exceed 120 characters.').optional().or(z.literal('')),
  address: z.string().trim().max(300, 'Address cannot exceed 300 characters.').optional().or(z.literal('')),
  gstin: optionalGstinField,
  industryType: z.enum(['transport', 'agency', 'freelancer', 'consultant', 'general']).default('general'),
  paymentTermDays: z
    .coerce
    .number()
    .int('Payment terms must be a whole number of days.')
    .min(0, 'Payment terms cannot be negative.')
    .max(365, 'Payment terms cannot exceed 365 days.')
    .default(7),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional().or(z.literal('')),
  isActive: z.boolean().default(true).optional(),
});

export const updateClientSchema = createClientSchema.partial();

// -------------------------------------------------------------
// 4. INVOICE & LINE ITEM SCHEMAS
// -------------------------------------------------------------

export const lineItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Item description cannot be empty.')
    .max(255, 'Item description cannot exceed 255 characters.'),
  quantity: z
    .coerce
    .number()
    .positive('Quantity must be greater than 0.')
    .max(1000000, 'Quantity cannot exceed 1,000,000.'),
  rate: z
    .coerce
    .number()
    .min(0, 'Rate cannot be negative.')
    .max(100000000, 'Rate cannot exceed 100,000,000.'),
  gstRate: z
    .coerce
    .number()
    .min(0, 'GST rate cannot be negative.')
    .max(100, 'GST rate cannot exceed 100%.')
    .default(18),
  amount: z.coerce.number().optional(),
  uqc: z.string().trim().max(10).optional().or(z.literal('')),
  hsnCode: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || HSN_SAC_REGEX.test(val), {
      message: 'HSN/SAC code must be between 2 and 8 numeric digits.',
    }),
});

export const rawInvoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .trim()
    .min(1, 'Invoice number cannot be empty.')
    .max(50, 'Invoice number cannot exceed 50 characters.')
    .regex(INVOICE_NUMBER_REGEX, 'Invoice number can only contain letters, numbers, hyphens, slashes, and underscores.'),
  clientId: z
    .coerce
    .number()
    .int()
    .positive('Please select a valid client / party.'),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invoice date must be in YYYY-MM-DD format.'),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format.'),
  items: z
    .array(lineItemSchema)
    .min(1, 'An invoice must contain at least one line item.')
    .max(100, 'An invoice cannot contain more than 100 line items.'),
  subtotal: z.coerce.number().or(z.string()).optional(),
  taxRate: z.coerce.number().min(0).max(100).default(18),
  taxAmount: z.coerce.number().or(z.string()).optional(),
  tdsRate: z.coerce.number().min(0).max(30).default(0),
  tdsAmount: z.coerce.number().or(z.string()).optional(),
  discountAmount: z.coerce.number().min(0, 'Discount cannot be negative.').default(0),
  totalAmount: z.coerce.number().or(z.string()).optional(),
  paidAmount: z.coerce.number().or(z.string()).optional(),
  status: z.enum(['pending', 'paid', 'overdue', 'partial']).optional(),
  currency: z.string().default('INR'),
  placeOfSupply: z.string().trim().max(100).optional().or(z.literal('')),
  isRcm: z.boolean().default(false).optional(),
  taxType: z.enum(['intra_state', 'inter_state']).default('intra_state').optional(),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters.').optional().or(z.literal('')),
  terms: z.string().trim().max(1000, 'Terms cannot exceed 1000 characters.').optional().or(z.literal('')),
  industryDetails: z.record(z.string(), z.any()).optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.string().optional(),
  autoSendWhatsApp: z.boolean().optional(),
  shareToken: z.string().optional(),
});

export const createInvoiceSchema = rawInvoiceSchema.refine(
  (data) => {
    return new Date(data.dueDate) >= new Date(data.issueDate);
  },
  {
    message: 'Due date cannot be earlier than invoice issue date.',
    path: ['dueDate'],
  }
);

export const updateInvoiceSchema = rawInvoiceSchema.partial();

// -------------------------------------------------------------
// 5. PAYMENT RECORD SCHEMAS
// -------------------------------------------------------------

export const recordPaymentSchema = z.object({
  invoiceId: z
    .coerce
    .number()
    .int()
    .positive('Invalid invoice ID.'),
  amount: z
    .coerce
    .number()
    .positive('Payment amount must be greater than 0.')
    .max(100000000, 'Amount cannot exceed 100,000,000.'),
  paymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Payment date must be in YYYY-MM-DD format.'),
  paymentMethod: z
    .enum(['cash', 'upi', 'bank_transfer', 'card', 'cheque', 'razorpay', 'other'])
    .default('upi'),
  notes: z.string().trim().max(200, 'Notes/Transaction ID cannot exceed 200 characters.').optional().or(z.literal('')),
});

// -------------------------------------------------------------
// 6. BUSINESS SETTINGS & PROFILE SCHEMAS
// -------------------------------------------------------------

export const updateProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters.')
    .max(120, 'Business name cannot exceed 120 characters.')
    .optional(),
  phone: optionalPhoneField,
  email: optionalEmailField,
  address: z.string().trim().max(300, 'Business address cannot exceed 300 characters.').optional().or(z.literal('')),
  gstin: optionalGstinField,
  pan: optionalPanField,
  bankName: z.string().trim().max(100, 'Bank name cannot exceed 100 characters.').optional().or(z.literal('')),
  bankAccountNo: optionalBankAccountField,
  bankIfsc: optionalIfscField,
  upiId: optionalUpiField,
  industryType: z.enum(['transport', 'agency', 'freelancer', 'consultant', 'general']).optional(),

  // Branding
  logoUrl: z.string().trim().max(1000).optional().or(z.literal('')),
  invoiceTemplate: z.enum(['modern', 'corporate', 'logistics', 'creative', 'classic', 'dark_neon']).optional(),
  brandColor: optionalHexColorField,
  customFooter: z.string().trim().max(500, 'Custom footer cannot exceed 500 characters.').optional().or(z.literal('')),

  // WhatsApp Config
  whatsappProvider: z.enum(['meta', 'generic']).optional(),
  whatsappPhoneNumberId: z.string().trim().max(100).optional().or(z.literal('')),
  whatsappApiToken: z.string().trim().max(500).optional().or(z.literal('')),
});

// -------------------------------------------------------------
// 7. REMINDERS & COMMUNICATIONS SCHEMAS
// -------------------------------------------------------------

export const sendReminderSchema = z.object({
  invoiceId: z.coerce.number().int().positive('Valid invoice ID is required.'),
  clientId: z.coerce.number().int().positive().optional(),
  channel: z.enum(['whatsapp', 'email', 'both']).default('whatsapp').optional(),
  templateType: z.string().optional().default('standard'),
  templateName: z.string().optional(),
  recipientName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  totalAmount: z.coerce.number().or(z.string()).optional(),
  dueDate: z.string().optional(),
  messageContent: z.string().trim().max(4000, 'Reminder message cannot exceed 4000 characters.').optional().or(z.literal('')),
  recipientPhone: optionalPhoneField,
  recipientEmail: optionalEmailField,
  sendMethod: z.string().optional().default('wame'),
  pdfUrl: z.string().optional(),
  sendAsDocument: z.boolean().optional(),
  customMessage: z.string().trim().max(4000, 'Reminder message cannot exceed 4000 characters.').optional().or(z.literal('')),
});

// -------------------------------------------------------------
// 8. RECURRING INVOICE SCHEMAS
// -------------------------------------------------------------

export const createRecurringSchema = z.object({
  clientId: z.coerce.number().int().positive('Please select a valid client.'),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format.'),
  nextRunDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Next run date must be in YYYY-MM-DD format.'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format.').optional().or(z.literal('')),
  items: z.array(lineItemSchema).min(1, 'Recurring invoice must contain at least one line item.'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  terms: z.string().trim().max(500).optional().or(z.literal('')),
});

// -------------------------------------------------------------
// 9. ADMIN ACTION SCHEMAS
// -------------------------------------------------------------

export const adminUpdateTenantSchema = z.object({
  subscriptionPlan: z.enum(['trial_15_days', 'starter_299', 'pro_499']).optional(),
  subscriptionStatus: z.enum(['trial', 'active', 'expired', 'inactive', 'suspended']).optional(),
  extendDays: z.coerce.number().int().min(1, 'Days must be at least 1.').max(365, 'Cannot extend by more than 365 days at once.').optional(),
});
