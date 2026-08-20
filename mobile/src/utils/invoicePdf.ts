import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Invoice, UserProfile, InvoiceTemplate } from '../types/index.ts';
import { 
  calculateGstBreakdown, 
  getStateNameOrFormatted, 
  STATUTORY_INVOICE_DISCLAIMER, 
  STATUTORY_RCM_DISCLAIMER 
} from './gstCompliance.ts';

export async function generateAndShareInvoicePdf(invoice: Invoice, profile: UserProfile | null) {
  const template: InvoiceTemplate = (profile?.invoiceTemplate as InvoiceTemplate) || 'modern';
  const brandColor = profile?.brandColor || '#4f46e5';
  const logoUrl = profile?.logoUrl || '';
  const customFooter = profile?.customFooter || '';

  const subtotal = parseFloat(invoice.subtotal) || 0;
  const taxRateNum = parseFloat(invoice.taxRate || '18') || 0;
  const tdsAmount = parseFloat(invoice.tdsAmount || '0') || 0;
  const discountAmount = parseFloat(invoice.discountAmount || '0') || 0;
  const totalAmount = parseFloat(invoice.totalAmount) || 0;
  const paidAmount = parseFloat(invoice.paidAmount || '0') || 0;
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  const upiId = profile?.upiId || 'billing@okaxis';
  const businessName = profile?.businessName || 'Business Enterprise';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${balanceDue}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const gstBreakdown = calculateGstBreakdown(
    taxRateNum,
    subtotal,
    profile?.gstin,
    invoice.placeOfSupply || invoice.client?.gstin,
    invoice.taxType ? invoice.taxType === 'inter_state' : undefined
  );

  const placeOfSupplyFormatted = getStateNameOrFormatted(invoice.placeOfSupply || invoice.client?.gstin?.substring(0, 2) || profile?.gstin?.substring(0, 2));
  const isRcm = invoice.isRcm === true;

  const itemsHtml = invoice.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid ${template === 'dark_neon' ? '#334155' : '#e2e8f0'};">
        <td style="padding: 10px 8px; text-align: center; color: ${template === 'dark_neon' ? '#94a3b8' : '#64748b'}; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 10px 8px; font-weight: 600; color: ${template === 'dark_neon' ? '#f8fafc' : '#0f172a'};">${item.description}</td>
        <td style="padding: 10px 8px; text-align: center; font-family: monospace; color: ${template === 'dark_neon' ? '#94a3b8' : '#64748b'};">${item.hsnCode || '9983'}</td>
        <td style="padding: 10px 8px; text-align: center; font-family: monospace; color: ${template === 'dark_neon' ? '#cbd5e1' : '#334155'};">${item.quantity} ${item.uqc ? `<span style="font-size: 9px; color: #94a3b8;">${item.uqc}</span>` : ''}</td>
        <td style="padding: 10px 8px; text-align: right; font-family: monospace; color: ${template === 'dark_neon' ? '#cbd5e1' : '#334155'};">₹${Number(item.rate).toLocaleString('en-IN')}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; font-family: monospace; color: ${template === 'dark_neon' ? '#38bdf8' : '#0f172a'};">
          ₹${(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  const metaDetailsHtml = invoice.industryDetails?.vehicleNo
    ? `
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${template === 'dark_neon' ? '#475569' : '#cbd5e1'}; font-size: 11px;">
        <p style="margin: 2px 0;"><strong>Vehicle No:</strong> <span style="font-family: monospace; color: ${brandColor}; font-weight: bold;">${invoice.industryDetails.vehicleNo}</span> | <strong>LR No:</strong> <span style="font-family: monospace;">${invoice.industryDetails.lrNumber || 'N/A'}</span></p>
        <p style="margin: 2px 0;"><strong>Route:</strong> ${invoice.industryDetails.routeFrom || 'Origin'} &rarr; ${invoice.industryDetails.routeTo || 'Destination'}</p>
      </div>
    `
    : invoice.industryDetails?.campaignName
    ? `
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${template === 'dark_neon' ? '#475569' : '#cbd5e1'}; font-size: 11px;">
        <p style="margin: 2px 0;"><strong>Campaign:</strong> ${invoice.industryDetails.campaignName} | <strong>Milestone:</strong> ${invoice.industryDetails.milestone}</p>
      </div>
    `
    : '';

  // ----------------------------------------------------
  // Dynamic CSS & HTML Builder for 6 Invoice Templates
  // ----------------------------------------------------
  let templateStyles = '';
  let templateHeader = '';

  if (template === 'corporate') {
    templateStyles = `
      body { font-family: 'Times New Roman', Times, Georgia, serif; color: #0f172a; padding: 28px; background: #ffffff; }
      .header-bar { background: #0f172a; color: #ffffff; padding: 18px 24px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
      .header-bar h1 { margin: 0; font-size: 22px; letter-spacing: 0.5px; font-weight: 800; }
      .title-corp { font-size: 20px; font-weight: 900; color: #f8fafc; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
      .meta-box { display: flex; justify-content: space-between; border: 1.5px solid #0f172a; border-radius: 4px; padding: 14px; margin-top: 18px; font-size: 12px; background: #f8fafc; }
      table { width: 100%; border-collapse: collapse; margin-top: 22px; font-size: 12px; }
      th { background: #0f172a; color: #ffffff; font-weight: 700; text-transform: uppercase; font-size: 10px; padding: 10px 8px; border: 1px solid #0f172a; }
      td { border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
      .calc-box { display: flex; justify-content: space-between; margin-top: 22px; }
      .qr-section { width: 36%; text-align: center; border: 1.5px solid #0f172a; border-radius: 4px; padding: 12px; background: #ffffff; }
      .totals-section { width: 60%; font-size: 12px; border: 1.5px solid #0f172a; padding: 14px; background: #f8fafc; border-radius: 4px; }
      .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
      .grand-total { border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; padding: 8px 0; margin-top: 6px; font-weight: 900; font-size: 16px; color: #0f172a; }
    `;
    templateHeader = `
      <div class="header-bar">
        <div>
          <h1>${businessName}</h1>
          <p style="font-size: 11px; margin: 3px 0 0 0; color: #cbd5e1;">${profile?.address || 'India'}</p>
          <p style="font-size: 11px; margin: 2px 0 0 0; color: #cbd5e1;">GSTIN: <strong style="font-family: monospace; color: #ffffff;">${profile?.gstin || '27AABCU9603R1ZN'}</strong> | Phone: ${profile?.phone || '+91 98200 12345'}</p>
        </div>
        <div style="text-align: right;">
          <h2 class="title-corp">TAX INVOICE</h2>
          <p style="font-size: 12px; margin: 4px 0 0 0; color: #cbd5e1;">#${invoice.invoiceNumber}</p>
          <p style="font-size: 11px; margin: 2px 0 0 0; color: #cbd5e1;">Date: ${invoice.issueDate} | Due: ${invoice.dueDate}</p>
        </div>
      </div>
    `;
  } else if (template === 'logistics') {
    templateStyles = `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 24px; background: #ffffff; }
      .header-logistics { border-left: 6px solid #d97706; background: #fefce8; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #fef08a; }
      .title-log { font-size: 20px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
      .meta-box { display: flex; justify-content: space-between; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-top: 16px; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
      th { background: #fef3c7; color: #92400e; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 9px 8px; border-bottom: 2px solid #f59e0b; }
      .calc-box { display: flex; justify-content: space-between; margin-top: 20px; }
      .qr-section { width: 36%; text-align: center; border: 2px dashed #d97706; border-radius: 8px; padding: 12px; background: #fffbeb; }
      .totals-section { width: 60%; font-size: 12px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 14px; }
      .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
      .grand-total { border-top: 2px solid #d97706; padding-top: 6px; margin-top: 6px; font-weight: 900; font-size: 16px; color: #92400e; }
    `;
    templateHeader = `
      <div class="header-logistics">
        <div>
          <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #b45309; letter-spacing: 1px;">🚚 Logistics & Transport Freight</span>
          <h1 style="font-size: 22px; margin: 2px 0; font-weight: 900; color: #0f172a;">${businessName}</h1>
          <p style="font-size: 11px; color: #64748b; margin: 2px 0;">${profile?.address || 'India'}</p>
          <p style="font-size: 11px; margin: 2px 0;">GSTIN: <strong style="font-family: monospace;">${profile?.gstin || '27AABCU9603R1ZN'}</strong> | Phone: ${profile?.phone || '+91 98200 12345'}</p>
        </div>
        <div style="text-align: right;">
          <h2 class="title-log">FREIGHT TAX INVOICE</h2>
          <p style="font-size: 12px; margin: 4px 0 0 0; font-family: monospace; font-weight: 800;">#${invoice.invoiceNumber}</p>
          <p style="font-size: 11px; margin: 2px 0;">Date: <strong>${invoice.issueDate}</strong></p>
        </div>
      </div>
    `;
  } else if (template === 'creative') {
    templateStyles = `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 24px; background: #ffffff; }
      .header-creative { background: linear-gradient(135deg, ${brandColor} 0%, #1e1b4b 100%); color: #ffffff; padding: 22px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; }
      .title-creative { font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
      .meta-box { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-top: 18px; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
      th { background: #f1f5f9; color: ${brandColor}; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 10px 8px; border-bottom: 2px solid ${brandColor}; }
      .calc-box { display: flex; justify-content: space-between; margin-top: 20px; }
      .qr-section { width: 36%; text-align: center; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; background: #f8fafc; }
      .totals-section { width: 60%; font-size: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; }
      .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
      .grand-total { border-top: 2px solid ${brandColor}; padding-top: 8px; margin-top: 6px; font-weight: 900; font-size: 17px; color: ${brandColor}; }
    `;
    templateHeader = `
      <div class="header-creative">
        <div>
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #a5b4fc; letter-spacing: 1px;">🎨 Digital Agency & Creative Studio</span>
          <h1 style="font-size: 24px; margin: 2px 0; font-weight: 900; color: #ffffff;">${businessName}</h1>
          <p style="font-size: 11px; color: #cbd5e1; margin: 2px 0;">${profile?.address || 'India'}</p>
          <p style="font-size: 11px; margin: 2px 0; color: #e0e7ff;">GSTIN: <strong style="font-family: monospace;">${profile?.gstin || '27AABCU9603R1ZN'}</strong> | Phone: ${profile?.phone || '+91 98200 12345'}</p>
        </div>
        <div style="text-align: right;">
          <h2 class="title-creative">TAX INVOICE</h2>
          <p style="font-size: 13px; margin: 4px 0 0 0; font-family: monospace; font-weight: 800; color: #ffffff;">#${invoice.invoiceNumber}</p>
          <p style="font-size: 11px; margin: 2px 0; color: #cbd5e1;">Due: <strong>${invoice.dueDate}</strong></p>
        </div>
      </div>
    `;
  } else if (template === 'classic') {
    templateStyles = `
      body { font-family: 'Times New Roman', Times, serif; color: #000000; padding: 24px; background: #ffffff; }
      .header-classic { border-bottom: 3px double #000000; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
      .title-classic { font-size: 22px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
      .meta-box { display: flex; justify-content: space-between; border: 1px solid #000000; padding: 10px; margin-top: 14px; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; border: 1px solid #000000; }
      th { background: #f5f5f5; color: #000000; font-weight: 900; text-transform: uppercase; font-size: 10px; padding: 8px; border: 1px solid #000000; }
      td { border: 1px solid #000000; padding: 8px; }
      .calc-box { display: flex; justify-content: space-between; margin-top: 16px; }
      .qr-section { width: 36%; text-align: center; border: 1px solid #000000; padding: 10px; }
      .totals-section { width: 60%; font-size: 12px; border: 1px solid #000000; padding: 12px; }
      .total-row { display: flex; justify-content: space-between; padding: 3px 0; }
      .grand-total { border-top: 3px double #000000; padding-top: 6px; margin-top: 6px; font-weight: 900; font-size: 15px; }
    `;
    templateHeader = `
      <div class="header-classic">
        <div>
          <h1 style="font-size: 22px; margin: 0; font-weight: 900;">${businessName}</h1>
          <p style="font-size: 11px; margin: 2px 0;">${profile?.address || 'India'}</p>
          <p style="font-size: 11px; margin: 2px 0;">GSTIN: <strong style="font-family: monospace;">${profile?.gstin || '27AABCU9603R1ZN'}</strong> | Phone: ${profile?.phone || '+91 98200 12345'}</p>
        </div>
        <div style="text-align: right;">
          <h2 class="title-classic">TAX INVOICE</h2>
          <p style="font-size: 11px; margin: 3px 0 0 0;">Bill No: <strong style="font-family: monospace;">${invoice.invoiceNumber}</strong></p>
          <p style="font-size: 11px; margin: 1px 0;">Date: <strong>${invoice.issueDate}</strong></p>
        </div>
      </div>
    `;
  } else if (template === 'dark_neon') {
    templateStyles = `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; padding: 24px; background: #0f172a; }
      .header-neon { border-bottom: 2px solid ${brandColor}; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
      .title-neon { font-size: 24px; font-weight: 900; color: ${brandColor}; text-shadow: 0 0 10px ${brandColor}40; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
      .meta-box { display: flex; justify-content: space-between; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px; margin-top: 16px; font-size: 12px; color: #f8fafc; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
      th { background: #1e293b; color: ${brandColor}; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 10px 8px; border-bottom: 2px solid ${brandColor}; }
      .calc-box { display: flex; justify-content: space-between; margin-top: 20px; }
      .qr-section { width: 36%; text-align: center; border: 1px solid #334155; border-radius: 12px; padding: 12px; background: #1e293b; }
      .totals-section { width: 60%; font-size: 12px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px; }
      .total-row { display: flex; justify-content: space-between; padding: 4px 0; color: #cbd5e1; }
      .grand-total { border-top: 2px solid ${brandColor}; padding-top: 8px; margin-top: 6px; font-weight: 900; font-size: 17px; color: #38bdf8; }
    `;
    templateHeader = `
      <div class="header-neon">
        <div>
          <h1 style="font-size: 22px; margin: 0; font-weight: 900; color: #ffffff;">${businessName}</h1>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0;">${profile?.address || 'India'}</p>
          <p style="font-size: 11px; margin: 2px 0; color: #cbd5e1;">GSTIN: <strong style="font-family: monospace; color: ${brandColor};">${profile?.gstin || '27AABCU9603R1ZN'}</strong> | Phone: ${profile?.phone || '+91 98200 12345'}</p>
        </div>
        <div style="text-align: right;">
          <h2 class="title-neon">TAX INVOICE</h2>
          <p style="font-size: 12px; margin: 4px 0 0 0; color: #94a3b8;">Invoice: <strong style="font-family: monospace; color: #ffffff;">#${invoice.invoiceNumber}</strong></p>
          <p style="font-size: 11px; margin: 2px 0; color: #94a3b8;">Due: <strong style="color: #f43f5e;">${invoice.dueDate}</strong></p>
        </div>
      </div>
    `;
  } else {
    // DEFAULT: Modern Minimalist
    templateStyles = `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 24px; margin: 0; background: #ffffff; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
      .title { font-size: 22px; font-weight: 900; color: ${brandColor}; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
      .meta-box { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-top: 16px; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
      th { background: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 10px; padding: 8px; border-bottom: 2px solid ${brandColor}; }
      .calc-box { display: flex; justify-content: space-between; margin-top: 20px; }
      .qr-section { width: 38%; text-align: center; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; background: #f8fafc; }
      .totals-section { width: 58%; font-size: 12px; }
      .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
      .grand-total { border-top: 2px solid ${brandColor}; padding-top: 6px; margin-top: 6px; font-weight: 900; font-size: 15px; color: ${brandColor}; }
    `;
    templateHeader = `
      <div class="header">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${logoUrl ? `<img src="${logoUrl}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px;" />` : ''}
          <div>
            <h1 style="font-size: 20px; margin: 0; font-weight: 900; color: #0f172a;">${businessName}</h1>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0;">${profile?.address || 'India'}</p>
            <p style="font-size: 11px; margin: 2px 0;">GSTIN: <strong style="font-family: monospace;">${profile?.gstin || '27AABCU9603R1ZN'}</strong> | Phone: <strong>${profile?.phone || '+91 98200 12345'}</strong></p>
          </div>
        </div>
        <div style="text-align: right;">
          <h2 class="title">TAX INVOICE</h2>
          <p style="font-size: 11px; margin: 6px 0 0 0;">Invoice: <strong style="font-family: monospace;">#${invoice.invoiceNumber}</strong></p>
          <p style="font-size: 11px; margin: 2px 0;">Issue: <strong>${invoice.issueDate}</strong> | Due: <strong style="color: #e11d48;">${invoice.dueDate}</strong></p>
        </div>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          ${templateStyles}
        </style>
      </head>
      <body>
        ${templateHeader}

        <div class="meta-box">
          <div style="width: 55%;">
            <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Billed To (Party)</span>
            <p style="font-size: 13px; font-weight: 800; margin: 2px 0 0 0; color: ${template === 'dark_neon' ? '#ffffff' : '#0f172a'};">${invoice.client?.businessName || invoice.client?.name || 'Customer'}</p>
            <p style="margin: 2px 0; color: ${template === 'dark_neon' ? '#94a3b8' : '#64748b'};">Phone: ${invoice.client?.phone || 'N/A'}</p>
            ${invoice.client?.gstin ? `<p style="margin: 2px 0; color: ${template === 'dark_neon' ? '#cbd5e1' : '#64748b'};">GSTIN: <span style="font-family: monospace; font-weight: 700;">${invoice.client.gstin}</span></p>` : '<p style="margin: 2px 0; color: #94a3b8; font-style: italic;">GSTIN: Unregistered (URP)</p>'}
            ${metaDetailsHtml}
          </div>
          <div style="width: 42%; text-align: right; border-left: 1px solid ${template === 'dark_neon' ? '#334155' : '#e2e8f0'}; padding-left: 12px;">
            <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">GST Statutory Details</span>
            <p style="margin: 3px 0;">Place of Supply: <strong>${placeOfSupplyFormatted}</strong></p>
            <p style="margin: 2px 0;">Supply: <strong>${gstBreakdown.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}</strong></p>
            <p style="margin: 2px 0; font-size: 11px;">RCM Applicable: <strong>${isRcm ? 'YES' : 'NO'}</strong></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 45%; text-align: left;">Item / Service</th>
              <th style="width: 15%; text-align: center;">HSN/SAC</th>
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 12%; text-align: right;">Rate</th>
              <th style="width: 13%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="calc-box">
          <div class="qr-section">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${template === 'dark_neon' ? '#cbd5e1' : '#475569'};">Instant UPI Payment QR</span>
            <div style="margin: 8px 0;">
              <img src="${qrCodeImageUrl}" style="width: 110px; height: 110px; background: white; padding: 4px; border-radius: 6px;" />
            </div>
            <span style="font-size: 10px; font-family: monospace; font-weight: 700; color: ${brandColor};">${upiId}</span>
          </div>

          <div class="totals-section">
            <div class="total-row">
              <span style="color: ${template === 'dark_neon' ? '#94a3b8' : '#64748b'};">Taxable Subtotal:</span>
              <span style="font-family: monospace;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            ${gstBreakdown.isInterState ? `
              <div class="total-row">
                <span style="color: ${template === 'dark_neon' ? '#94a3b8' : '#64748b'};">IGST (${gstBreakdown.igstRate}%):</span>
                <span style="font-family: monospace;">+ ₹${gstBreakdown.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ` : `
              <div class="total-row">
                <span style="color: ${template === 'dark_neon' ? '#94a3b8' : '#64748b'};">CGST (${gstBreakdown.cgstRate}%):</span>
                <span style="font-family: monospace;">+ ₹${gstBreakdown.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row">
                <span style="color: ${template === 'dark_neon' ? '#94a3b8' : '#64748b'};">SGST (${gstBreakdown.sgstRate}%):</span>
                <span style="font-family: monospace;">+ ₹${gstBreakdown.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            `}
            ${
              tdsAmount > 0
                ? `<div class="total-row" style="color: #e11d48;">
                    <span>TDS Withholding (${invoice.tdsRate}%):</span>
                    <span style="font-family: monospace;">- ₹${tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>`
                : ''
            }
            ${
              discountAmount > 0
                ? `<div class="total-row" style="color: #059669;">
                    <span>Discount:</span>
                    <span style="font-family: monospace;">- ₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>`
                : ''
            }
            <div class="total-row grand-total">
              <span>Total Invoice Amount:</span>
              <span style="font-family: monospace;">₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="total-row" style="margin-top: 6px; font-weight: 800; color: ${balanceDue > 0 ? '#e11d48' : '#059669'};">
              <span>Balance Payable:</span>
              <span style="font-family: monospace;">₹${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        ${customFooter ? `<div style="margin-top: 16px; font-size: 11px; text-align: center; color: #64748b; font-style: italic;">${customFooter}</div>` : ''}

        <div style="margin-top: 20px; padding: 10px; background: ${template === 'dark_neon' ? '#1e293b' : '#f8fafc'}; border: 1px solid ${template === 'dark_neon' ? '#334155' : '#e2e8f0'}; border-radius: 8px; font-size: 9.5px; color: ${template === 'dark_neon' ? '#94a3b8' : '#64748b'}; line-height: 1.4;">
          <strong>Statutory Compliance:</strong> ${STATUTORY_INVOICE_DISCLAIMER}
        </div>
      </body>
    </html>
  `;

  // 1. Generate PDF file
  const { uri } = await Print.printToFileAsync({ html });

  // 2. Share / Save PDF via native share sheet
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Share Invoice #${invoice.invoiceNumber}`,
    });
  } else {
    await Print.printAsync({ uri });
  }
}
