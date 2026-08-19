# KwikBill Pro - React Native Mobile Application (Android & iOS)

This mobile app pairs with the **KwikBill Pro** backend to give end-users full mobile invoicing and WhatsApp collection power on their Android and iOS devices.

---

## 📱 Features Included

1. **Workspace Sign-In & API Configuration**:
   - Secure token-based authentication.
   - Configurable Backend API endpoint (switch between Local Emulator `10.0.2.2`, LAN WiFi `http://192.168.x.x:3000/api`, or Production Server).

2. **Dashboard Overview**:
   - Total Realized Revenue, Pending Receivables, and Overdue Risk exposure.
   - Quick action shortcuts (+ Create Invoice, Directory, Escalations).
   - Recent invoice stream.

3. **Invoice Management**:
   - Multi-item GST calculation (0%, 5%, 12%, 18%, 28%).
   - Industry parameters (Transport LR/Vehicle, Gym Member ID, Coaching Roll No, Retail POS).
   - Balance due tracking & status indicators.

4. **1-Click WhatsApp Reminders**:
   - 4-Tier escalation tone generator (Gentle, Due Today, Urgent Overdue, Final Notice).
   - Pre-filled NPCI UPI payment links (`upi://pay?pa=...`).
   - Dual delivery engine: Deep link to native WhatsApp app or 1-Click Meta Cloud API background send.

5. **Spot Counter UPI QR Code**:
   - Dynamic high-resolution UPI QR generator on invoice detail screen for instant client payments.

6. **Client Directory**:
   - Add/edit clients, GSTIN validation.
   - 1-tap phone dialer and WhatsApp quick-chat triggers.

7. **Settlement Tracking**:
   - Record partial & full payments with UPI reference/UTR logging.

8. **Settings & Profile**:
   - Business branding, Bank Account, IFSC, UPI ID, and Meta WhatsApp Cloud API credentials.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Expo Development Server
```bash
npx expo start
```

### 3. Run on Android Device or Emulator
- **Android Emulator**: Press `a` in the terminal.
- **Physical Phone**: Install the **Expo Go** app from Google Play Store and scan the QR code displayed in the terminal.
- **Build Standalone APK**:
  ```bash
  npx eas-cli build -p android --profile preview
  ```
