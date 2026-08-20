import { describe, it, expect } from 'vitest';
import { 
  getStateCodeFromGstin, 
  getStateByCode, 
  getStateNameOrFormatted, 
  calculateGstBreakdown 
} from '../lib/gstCompliance.ts';

describe('GST Compliance & Tax Breakdown Tests (Rule 46)', () => {
  it('extracts state code from 15-digit GSTIN correctly', () => {
    expect(getStateCodeFromGstin('07AAAAA0000A1Z5')).toBe('07'); // Delhi
    expect(getStateCodeFromGstin('27ABCDE1234F1Z5')).toBe('27'); // Maharashtra
    expect(getStateCodeFromGstin('')).toBeNull();
    expect(getStateCodeFromGstin('INVALID')).toBeNull();
  });

  it('retrieves state object by code', () => {
    const delhi = getStateByCode('07');
    expect(delhi?.name).toBe('Delhi');

    const maharashtra = getStateByCode('27');
    expect(maharashtra?.name).toBe('Maharashtra');

    expect(getStateByCode('999')).toBeUndefined();
  });

  it('formats state name correctly', () => {
    expect(getStateNameOrFormatted('07')).toBe('07 - Delhi');
    expect(getStateNameOrFormatted('Maharashtra')).toBe('27 - Maharashtra');
    expect(getStateNameOrFormatted('')).toBe('As per Billing Address');
  });

  it('calculates intra-state tax breakdown (CGST + SGST) accurately', () => {
    // Both supplier & client in Delhi (07)
    const result = calculateGstBreakdown(18, 1000, '07AAAAA0000A1Z5', '07BBBBB1111B1Z6');
    expect(result.isInterState).toBe(false);
    expect(result.totalTax).toBe(180);
    expect(result.cgstRate).toBe(9);
    expect(result.cgstAmount).toBe(90);
    expect(result.sgstRate).toBe(9);
    expect(result.sgstAmount).toBe(90);
    expect(result.igstRate).toBe(0);
    expect(result.igstAmount).toBe(0);
  });

  it('calculates inter-state tax breakdown (IGST) accurately', () => {
    // Supplier in Delhi (07), Client in Maharashtra (27)
    const result = calculateGstBreakdown(18, 1000, '07AAAAA0000A1Z5', '27BBBBB1111B1Z6');
    expect(result.isInterState).toBe(true);
    expect(result.totalTax).toBe(180);
    expect(result.cgstRate).toBe(0);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstRate).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.igstRate).toBe(18);
    expect(result.igstAmount).toBe(180);
  });

  it('handles zero or negative tax rates and amounts safely', () => {
    const result = calculateGstBreakdown(0, 5000);
    expect(result.totalTax).toBe(0);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.igstAmount).toBe(0);
  });
});
