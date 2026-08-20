import { describe, it, expect } from 'vitest';
import { computeNextRunDate } from '../services/recurring.service.ts';

describe('Auto-Billing Recurring Engine - Date Calculations', () => {
  it('computes next weekly run date correctly', () => {
    const start = '2026-03-01';
    const next = computeNextRunDate(start, 'weekly', 1);
    expect(next).toBe('2026-03-08');
  });

  it('computes next bi-weekly run date with interval=2', () => {
    const start = '2026-03-01';
    const next = computeNextRunDate(start, 'weekly', 2);
    expect(next).toBe('2026-03-15');
  });

  it('computes next monthly run date accurately', () => {
    const start = '2026-01-15';
    const next = computeNextRunDate(start, 'monthly', 1);
    expect(next).toBe('2026-02-15');
  });

  it('computes next quarterly run date accurately (3 months)', () => {
    const start = '2026-01-01';
    const next = computeNextRunDate(start, 'quarterly', 1);
    expect(next).toBe('2026-04-01');
  });

  it('computes next yearly run date accurately', () => {
    const start = '2026-05-10';
    const next = computeNextRunDate(start, 'yearly', 1);
    expect(next).toBe('2027-05-10');
  });
});
