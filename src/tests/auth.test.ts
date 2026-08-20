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

  it('detects tenant account suspension status correctly across all inactive states', () => {
    const isTenantSuspended = (u: any) =>
      !isSuperAdminUser(u) &&
      Boolean(u?.subscriptionStatus && ['suspended', 'inactive', 'cancelled'].includes(u.subscriptionStatus));

    expect(isTenantSuspended({ role: 'subscriber', email: 't@biz.in', subscriptionStatus: 'suspended' })).toBe(true);
    expect(isTenantSuspended({ role: 'subscriber', email: 't@biz.in', subscriptionStatus: 'inactive' })).toBe(true);
    expect(isTenantSuspended({ role: 'subscriber', email: 't@biz.in', subscriptionStatus: 'cancelled' })).toBe(true);
    expect(isTenantSuspended({ role: 'subscriber', email: 't@biz.in', subscriptionStatus: 'active' })).toBe(false);
    expect(isTenantSuspended({ role: 'subscriber', email: 't@biz.in', subscriptionStatus: 'trial' })).toBe(false);
    expect(isTenantSuspended({ role: 'superadmin', email: 'admin@biz.in', subscriptionStatus: 'suspended' })).toBe(false);
  });

  it('calculates remaining trial days and detects expired trials correctly', () => {
    const isTrialExpired = (u: any) => {
      if (!u || isSuperAdminUser(u) || u.subscriptionStatus === 'active') return false;
      if (u.subscriptionStatus === 'expired') return true;
      const isTrial = u.subscriptionStatus === 'trial' || u.subscriptionPlan === 'trial_15_days';
      return Boolean(isTrial && u.trialEndsAt && new Date(u.trialEndsAt).getTime() <= Date.now());
    };

    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    expect(isTrialExpired({ role: 'subscriber', email: 'u@test.in', subscriptionStatus: 'trial', trialEndsAt: pastDate })).toBe(true);
    expect(isTrialExpired({ role: 'subscriber', email: 'u@test.in', subscriptionStatus: 'expired' })).toBe(true);
    expect(isTrialExpired({ role: 'subscriber', email: 'u@test.in', subscriptionStatus: 'trial', trialEndsAt: futureDate })).toBe(false);
    expect(isTrialExpired({ role: 'subscriber', email: 'u@test.in', subscriptionStatus: 'active', trialEndsAt: pastDate })).toBe(false);
    expect(isTrialExpired({ role: 'superadmin', email: 'admin@test.in', subscriptionStatus: 'trial', trialEndsAt: pastDate })).toBe(false);
  });

  it('restricts mutating write operations for demo preview workspace', () => {
    const isWritePermitted = (uid: string, method: string, url: string) => {
      if (uid === 'demo-business-owner-101') {
        const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        if (isWrite) {
          return method === 'POST' && url.includes('/plan-request');
        }
      }
      return true;
    };

    expect(isWritePermitted('demo-business-owner-101', 'GET', '/api/invoices')).toBe(true);
    expect(isWritePermitted('demo-business-owner-101', 'GET', '/api/clients')).toBe(true);
    expect(isWritePermitted('demo-business-owner-101', 'POST', '/api/invoices')).toBe(false);
    expect(isWritePermitted('demo-business-owner-101', 'POST', '/api/clients')).toBe(false);
    expect(isWritePermitted('demo-business-owner-101', 'DELETE', '/api/invoices/1')).toBe(false);
    expect(isWritePermitted('demo-business-owner-101', 'PUT', '/api/user/profile')).toBe(false);
    expect(isWritePermitted('demo-business-owner-101', 'POST', '/api/admin/plan-request')).toBe(true);
    expect(isWritePermitted('firebase-user-999', 'POST', '/api/invoices')).toBe(true);
  });
});
