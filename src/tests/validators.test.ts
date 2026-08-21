import { describe, it, expect } from 'vitest';
import {
  isValidPhone,
  isValidGSTIN,
  isValidPAN,
  isValidIFSC,
  isValidUPI,
  validatePasswordStrength,
  formatPhoneNumber,
} from '../lib/validators/regexPatterns.ts';
import {
  loginSchema,
  registerSchema,
  createClientSchema,
  createInvoiceSchema,
  recordPaymentSchema,
  updateProfileSchema,
} from '../lib/validators/index.ts';

describe('Regex and Utility Validators', () => {
  it('validates phone numbers correctly', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('+919876543210')).toBe(true);
    expect(isValidPhone('+91 98765 43210')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });

  it('formats phone numbers properly to E.164 / +91', () => {
    expect(formatPhoneNumber('9876543210')).toBe('+919876543210');
    expect(formatPhoneNumber('919876543210')).toBe('+919876543210');
  });

  it('validates Indian 15-character GSTIN format', () => {
    expect(isValidGSTIN('27AAPFU0939F1ZV')).toBe(true);
    expect(isValidGSTIN('07AAAAA0000A1Z5')).toBe(true);
    expect(isValidGSTIN('27AAPFU0939F')).toBe(false); // too short
    expect(isValidGSTIN('INVALIDGSTIN1234')).toBe(false);
  });

  it('validates Indian PAN format', () => {
    expect(isValidPAN('ABCDE1234F')).toBe(true);
    expect(isValidPAN('abcde1234f')).toBe(true);
    expect(isValidPAN('ABCD12345F')).toBe(false);
    expect(isValidPAN('12345ABCDE')).toBe(false);
  });

  it('validates Bank IFSC code format', () => {
    expect(isValidIFSC('HDFC0001234')).toBe(true);
    expect(isValidIFSC('SBIN0000456')).toBe(true);
    expect(isValidIFSC('HDFC1001234')).toBe(false); // 5th character must be 0
    expect(isValidIFSC('HDFC00123')).toBe(false); // too short
  });

  it('validates UPI ID format', () => {
    expect(isValidUPI('user@okaxis')).toBe(true);
    expect(isValidUPI('9876543210@upi')).toBe(true);
    expect(isValidUPI('business.corp@icici')).toBe(true);
    expect(isValidUPI('invalid-upi')).toBe(false);
    expect(isValidUPI('@bank')).toBe(false);
  });

  it('validates password strength rules', () => {
    expect(validatePasswordStrength('short').isValid).toBe(false);
    expect(validatePasswordStrength('alllettersonly').isValid).toBe(false);
    expect(validatePasswordStrength('12345678').isValid).toBe(false);
    expect(validatePasswordStrength('Secret123').isValid).toBe(true);
  });
});

describe('Zod Schema Validation', () => {
  describe('Authentication Schemas', () => {
    it('validates login payload', () => {
      const valid = loginSchema.safeParse({
        email: 'admin@kwikbill.com',
        password: 'Password123',
      });
      expect(valid.success).toBe(true);

      const invalidEmail = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'Password123',
      });
      expect(invalidEmail.success).toBe(false);
    });

    it('validates register payload and password match', () => {
      const match = registerSchema.safeParse({
        email: 'test@kwikbill.com',
        password: 'SecurePassword1',
        confirmPassword: 'SecurePassword1',
      });
      expect(match.success).toBe(true);

      const mismatch = registerSchema.safeParse({
        email: 'test@kwikbill.com',
        password: 'SecurePassword1',
        confirmPassword: 'DifferentPassword2',
      });
      expect(mismatch.success).toBe(false);
    });
  });

  describe('Client Schemas', () => {
    it('validates complete client creation payload', () => {
      const valid = createClientSchema.safeParse({
        name: 'Rajesh Sharma',
        phone: '+91 98765 43210',
        email: 'rajesh@example.com',
        companyName: 'Rajesh Logistics',
        gstin: '27AAPFU0939F1ZV',
        paymentTermDays: 14,
        industryType: 'transport',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects client with missing name or invalid phone', () => {
      const missingName = createClientSchema.safeParse({
        name: '',
        phone: '9876543210',
      });
      expect(missingName.success).toBe(false);

      const invalidPhone = createClientSchema.safeParse({
        name: 'Rajesh',
        phone: '12345',
      });
      expect(invalidPhone.success).toBe(false);
    });
  });

  describe('Invoice Schemas', () => {
    it('validates invoice creation with valid line items and dates', () => {
      const valid = createInvoiceSchema.safeParse({
        invoiceNumber: 'INV-2026-001',
        clientId: 1,
        issueDate: '2026-08-21',
        dueDate: '2026-08-28',
        items: [
          {
            description: 'Freight transport service',
            quantity: 2,
            rate: 5000,
            gstRate: 18,
          },
        ],
        taxRate: 18,
        discountAmount: 500,
      });
      expect(valid.success).toBe(true);
    });

    it('rejects invoice when dueDate is earlier than issueDate', () => {
      const invalidDate = createInvoiceSchema.safeParse({
        invoiceNumber: 'INV-001',
        clientId: 1,
        issueDate: '2026-08-21',
        dueDate: '2026-08-15', // past date
        items: [
          { description: 'Service', quantity: 1, rate: 1000 },
        ],
      });
      expect(invalidDate.success).toBe(false);
    });

    it('rejects invoice with empty line items', () => {
      const emptyItems = createInvoiceSchema.safeParse({
        invoiceNumber: 'INV-001',
        clientId: 1,
        issueDate: '2026-08-21',
        dueDate: '2026-08-28',
        items: [],
      });
      expect(emptyItems.success).toBe(false);
    });
  });

  describe('Payment Schemas', () => {
    it('validates payment record', () => {
      const valid = recordPaymentSchema.safeParse({
        invoiceId: 1,
        amount: 5000,
        paymentDate: '2026-08-21',
        paymentMethod: 'upi',
        notes: 'Ref: UPI-12345678',
      });
      expect(valid.success).toBe(true);

      const invalidAmount = recordPaymentSchema.safeParse({
        invoiceId: 1,
        amount: -100,
        paymentDate: '2026-08-21',
        paymentMethod: 'upi',
      });
      expect(invalidAmount.success).toBe(false);
    });
  });

  describe('Business Profile Schemas', () => {
    it('validates profile updates with banking & GSTIN details', () => {
      const valid = updateProfileSchema.safeParse({
        businessName: 'Super Transport Corp',
        phone: '9876543210',
        email: 'accounts@supertransport.in',
        gstin: '27AAPFU0939F1ZV',
        pan: 'AAPFU0939F',
        bankAccountNo: '123456789012',
        bankIfsc: 'HDFC0001234',
        upiId: 'supertransport@okaxis',
        brandColor: '#4f46e5',
      });
      expect(valid.success).toBe(true);
    });
  });
});
