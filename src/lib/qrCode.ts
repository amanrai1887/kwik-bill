import QRCode from 'qrcode';

/**
 * Generates an offline data URL (PNG Base64) for UPI QR Codes
 * Compliant with DPDP Act 2023 & RBI Cyber Security Guidelines (Zero external API network calls)
 */
export async function generateLocalQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate local QR code:', err);
    return '';
  }
}

/**
 * Generates an offline SVG string for UPI QR Codes
 */
export async function generateLocalQrSvg(text: string): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate local QR SVG:', err);
    return '';
  }
}
