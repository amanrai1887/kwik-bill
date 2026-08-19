import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Invoice, UserProfile } from '../types/index.ts';

export async function generateAndShareInvoicePdf(invoice: Invoice, profile: UserProfile | null) {
  const subtotal = parseFloat(invoice.subtotal) || 0;
  const taxAmount = parseFloat(invoice.taxAmount || '0') || 0;
  const tdsAmount = parseFloat(invoice.tdsAmount || '0') || 0;
  const discountAmount = parseFloat(invoice.discountAmount || '0') || 0;
  const totalAmount = parseFloat(invoice.totalAmount) || 0;
  const paidAmount = parseFloat(invoice.paidAmount || '0') || 0;
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  const upiId = profile?.upiId || 'billing@okaxis';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(profile?.businessName || 'Business')}&am=${balanceDue}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  const itemsHtml = invoice.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; text-align: center; color: #64748b; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 10px 8px; font-weight: 600; color: #0f172a;">${item.description}</td>
        <td style="padding: 10px 8px; text-align: center; font-family: monospace; color: #64748b;">${item.hsnCode || '-'}</td>
        <td style="padding: 10px 8px; text-align: center; font-family: monospace;">${item.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; font-family: monospace;">₹${Number(item.rate).toLocaleString('en-IN')}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; font-family: monospace; color: #0f172a;">
          ₹${(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  const metaDetailsHtml = invoice.industryDetails?.vehicleNo
    ? `
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11px;">
        <p style="margin: 2px 0;"><strong>Vehicle No:</strong> <span style="font-family: monospace;">${invoice.industryDetails.vehicleNo}</span> | <strong>LR No:</strong> <span style="font-family: monospace;">${invoice.industryDetails.lrNumber || 'N/A'}</span></p>
        <p style="margin: 2px 0;"><strong>Route:</strong> ${invoice.industryDetails.routeFrom || 'Origin'} &rarr; ${invoice.industryDetails.routeTo || 'Destination'}</p>
      </div>
    `
    : invoice.industryDetails?.campaignName
    ? `
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11px;">
        <p style="margin: 2px 0;"><strong>Campaign:</strong> ${invoice.industryDetails.campaignName} | <strong>Milestone:</strong> ${invoice.industryDetails.milestone}</p>
      </div>
    `
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            padding: 24px;
            margin: 0;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
          }
          .title {
            font-size: 22px;
            font-weight: 900;
            color: #4338ca;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            margin-top: 6px;
            ${invoice.status === 'paid' ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}
          }
          .meta-box {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
            margin-top: 16px;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th {
            background: #f1f5f9;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            padding: 8px;
            border-bottom: 2px solid #cbd5e1;
          }
          .calc-box {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }
          .qr-section {
            width: 40%;
            text-align: center;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
            background: #f8fafc;
          }
          .totals-section {
            width: 55%;
            font-size: 12px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
          }
          .grand-total {
            border-top: 2px solid #e2e8f0;
            padding-top: 6px;
            margin-top: 6px;
            font-weight: 900;
            font-size: 15px;
            color: #0f172a;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 style="font-size: 20px; margin: 0; font-weight: 900; color: #0f172a;">${profile?.businessName || 'KwikBill Pro Enterprise'}</h1>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0;">${profile?.address || 'India'}</p>
            <p style="font-size: 11px; margin: 2px 0;">GSTIN: <strong style="font-family: monospace;">${profile?.gstin || '27AABCU9603R1ZN'}</strong> | Phone: <strong>${profile?.phone || '+91 98200 12345'}</strong></p>
          </div>
          <div style="text-align: right;">
            <h2 class="title">TAX INVOICE</h2>
            <div class="badge">${invoice.status}</div>
            <p style="font-size: 11px; margin: 6px 0 0 0;">Invoice: <strong style="font-family: monospace;">#${invoice.invoiceNumber}</strong></p>
            <p style="font-size: 11px; margin: 2px 0;">Issue: <strong>${invoice.issueDate}</strong></p>
            <p style="font-size: 11px; margin: 2px 0;">Due: <strong style="color: #e11d48;">${invoice.dueDate}</strong></p>
          </div>
        </div>

        <div class="meta-box">
          <div>
            <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Billed To (Party)</span>
            <p style="font-size: 13px; font-weight: 800; margin: 2px 0 0 0; color: #0f172a;">${invoice.client?.businessName || invoice.client?.name || 'Customer'}</p>
            <p style="margin: 2px 0; color: #64748b;">Phone: ${invoice.client?.phone || 'N/A'}</p>
            ${invoice.client?.gstin ? `<p style="margin: 2px 0; color: #64748b;">GSTIN: <span style="font-family: monospace;">${invoice.client.gstin}</span></p>` : ''}
            ${metaDetailsHtml}
          </div>
        </div>


        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 45%; text-align: left;">Item / Service</th>
              <th style="width: 15%; text-align: center;">HSN</th>
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
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569;">Instant UPI Payment QR</span>
            <div style="margin: 8px 0;">
              <img src="${qrCodeImageUrl}" style="width: 110px; height: 110px;" />
            </div>
            <span style="font-size: 10px; font-family: monospace; font-weight: 700; color: #059669;">${upiId}</span>
          </div>

          <div class="totals-section">
            <div class="total-row">
              <span style="color: #64748b;">Subtotal:</span>
              <span style="font-family: monospace;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="total-row">
              <span style="color: #64748b;">GST (${invoice.taxRate || '18'}%):</span>
              <span style="font-family: monospace;">+ ₹${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
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
              <span style="color: #4f46e5; font-family: monospace;">₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="total-row" style="margin-top: 6px; font-weight: 800; color: ${balanceDue > 0 ? '#e11d48' : '#059669'};">
              <span>Balance Payable:</span>
              <span style="font-family: monospace;">₹${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
          Generated via KwikBill Pro • Fast, Smart, GST Ready Mobile Platform
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
