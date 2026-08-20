export interface GSTState {
  code: string;
  name: string;
}

export const INDIAN_STATES: GSTState[] = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' },
];

export function getStateCodeFromGstin(gstin?: string): string | null {
  if (!gstin) return null;
  const clean = gstin.trim();
  if (clean.length >= 2 && /^\d{2}/.test(clean)) {
    return clean.substring(0, 2);
  }
  return null;
}

export function getStateByCode(code?: string): GSTState | undefined {
  if (!code) return undefined;
  return INDIAN_STATES.find(s => s.code === code);
}

export function getStateNameOrFormatted(codeOrName?: string): string {
  if (!codeOrName) return 'As per Billing Address';
  const matched = INDIAN_STATES.find(s => s.code === codeOrName || s.name.toLowerCase() === codeOrName.toLowerCase());
  if (matched) {
    return `${matched.code} - ${matched.name}`;
  }
  return codeOrName;
}

export interface TaxSplitResult {
  isInterState: boolean;
  taxRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
}

export function calculateGstBreakdown(
  taxRateNum: number,
  taxableAmount: number,
  supplierGstinOrState?: string,
  placeOfSupplyOrClientGstin?: string,
  forceInterState?: boolean
): TaxSplitResult {
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
      totalTax: 0,
    };
  }

  const supplierCode = getStateCodeFromGstin(supplierGstinOrState) || (supplierGstinOrState && supplierGstinOrState.length === 2 ? supplierGstinOrState : null);
  const clientCode = getStateCodeFromGstin(placeOfSupplyOrClientGstin) || (placeOfSupplyOrClientGstin && placeOfSupplyOrClientGstin.length === 2 ? placeOfSupplyOrClientGstin : null);

  let isInterState = false;
  if (forceInterState !== undefined) {
    isInterState = forceInterState;
  } else if (supplierCode && clientCode) {
    isInterState = supplierCode !== clientCode;
  }

  const totalTax = (taxableAmount * taxRateNum) / 100;

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
      totalTax,
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
      totalTax,
    };
  }
}

export const STATUTORY_INVOICE_DISCLAIMER =
  'This is a computer-generated Tax Invoice issued under Rule 46 of the Central Goods and Services Tax (CGST) Rules, 2017 and the Information Technology Act, 2000. It does not require a physical signature.';

export const STATUTORY_RCM_DISCLAIMER = 'Whether Tax is Payable under Reverse Charge (RCM):';
