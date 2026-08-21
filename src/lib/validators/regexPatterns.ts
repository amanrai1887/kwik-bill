/**
 * Standardized Regular Expression Patterns and Normalizers for KwikBill
 */

// Email regex matching standard format
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone regex allowing Indian 10-digit mobile (6-9 followed by 9 digits) with optional +91, 91, or 0 prefix, or international E.164
export const PHONE_REGEX = /^(?:\+?(?:91)?[ -]?)?[6-9]\d{9}$|^\+?[1-9]\d{6,14}$/;

// Indian 15-character Goods and Services Tax Identification Number (GSTIN)
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Indian 10-character Permanent Account Number (PAN)
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Indian 11-character Bank IFSC Code (4 letters, 0, 6 alphanumeric)
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Unified Payments Interface (UPI) VPA format
export const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;

// Indian 6-digit Postal PIN Code
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Hex Color format (#RGB or #RRGGBB)
export const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Bank Account Number (typically 9 to 18 digits)
export const BANK_ACCOUNT_REGEX = /^[0-9]{9,18}$/;

// HSN / SAC Code (2, 4, 6, or 8 digits)
export const HSN_SAC_REGEX = /^[0-9]{2,8}$/;

// Invoice Number (1-50 chars alphanumeric with hyphen, underscore, slash)
export const INVOICE_NUMBER_REGEX = /^[a-zA-Z0-9/_-]{1,50}$/;

/**
 * Utility to clean and format phone numbers to standard E.164 / +91 format
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Validates whether a given phone string is valid
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return PHONE_REGEX.test(cleaned);
}

/**
 * Validates whether a given GSTIN is valid and checks its 2-digit state prefix
 */
export function isValidGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  const upper = gstin.trim().toUpperCase();
  return GSTIN_REGEX.test(upper);
}

/**
 * Validates Indian PAN format
 */
export function isValidPAN(pan: string): boolean {
  if (!pan) return false;
  return PAN_REGEX.test(pan.trim().toUpperCase());
}

/**
 * Validates Indian Bank IFSC format
 */
export function isValidIFSC(ifsc: string): boolean {
  if (!ifsc) return false;
  return IFSC_REGEX.test(ifsc.trim().toUpperCase());
}

/**
 * Validates UPI ID format
 */
export function isValidUPI(upi: string): boolean {
  if (!upi) return false;
  return UPI_REGEX.test(upi.trim());
}

/**
 * Validates Password strength
 * Requires at least 8 characters, with at least one letter and one number
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  return { isValid: true, message: 'Password is strong.' };
}
