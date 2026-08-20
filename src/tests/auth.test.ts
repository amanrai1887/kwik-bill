import { describe, it, expect } from 'vitest';
import { isSuperAdminUser } from '../lib/planConfig.ts';
import { isSuperAdminEmail } from '../config/app.config.ts';

describe('Authentication & SuperAdmin Privilege Resolution Tests', () => {
  it('correctly identifies superadmin by database role', () => {
    expect(isSuperAdminUser({ role: 'superadmin', email: 'custom@domain.com' })).toBe(true);
    expect(isSuperAdminUser({ role: 'subscriber', email: 'merchant@domain.com' })).toBe(false);
  });

  it('correctly identifies superadmin by configured email', () => {
    expect(isSuperAdminUser({ role: 'subscriber', email: 'ARAI.343531@GMAIL.COM' })).toBe(true);
  });

  it('handles null/undefined user safely', () => {
    expect(isSuperAdminUser(null)).toBe(false);
    expect(isSuperAdminUser(undefined)).toBe(false);
    expect(isSuperAdminEmail(null)).toBe(false);
    expect(isSuperAdminEmail(undefined)).toBe(false);
  });
});
