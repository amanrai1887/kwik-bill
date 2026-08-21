# ⚡ KwikBill Pro — Smart Invoicing, GST & Automated WhatsApp Payment Collection SaaS.            
            
<div align="center">.  
  <img src="public/logo.png" alt="KwikBill Pro Logo" width="120" style="border-radius: 16px;" />
  <h3>Next-Gen Invoicing & Automated WhatsApp Payment Follow-Up SaaS</h3>
  <p>Engineered for Freelancers, Agencies, MSMEs, Transporters, Fitness Centers, and Retailers.</p>

  <div>
    <img src="https://img.shields.io/badge/Node.js-20+-green.svg" alt="Node.js" />
    <img src="https://img.shields.io/badge/React-19-blue.svg" alt="React 19" />
    <img src="https://img.shields.io/badge/React_Native-Expo-purple.svg" alt="React Native Expo" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-blue.svg" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Drizzle_ORM-0.45-orange.svg" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/WhatsApp_API-Meta_Cloud-25D366.svg" alt="Meta WhatsApp Cloud API" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED.svg" alt="Docker Ready" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
  </div>
</div>

---

## 📖 Overview

**KwikBill Pro** is a full-stack, multi-tenant Billing and Automated Receivables Collection platform with web and native mobile applications. It replaces manual payment chasing with automated multi-tier WhatsApp reminders, dynamic NPCI-compliant UPI QR codes, recurring auto-billing, and comprehensive GST compliance.

---

## 🌟 Key Highlights & Features

### 🧾 1. Multi-Industry Invoicing & GST Engine
- **Itemized GST Calculation**: Supports 0%, 5%, 12%, 18%, and 28% GST brackets with auto CGST/SGST splitting.
- **Industry-Specific Presets**:
  - 🚚 **Transport & Logistics**: Vehicle Number, LR (Lorry Receipt) Number, Source & Destination routes.
  - 🏋️ **Gyms & Fitness**: Member ID, Batch Time, Plan Validity.
  - 🎓 **Institutes & Coaching**: Roll Number, Batch, Course Name.
  - 🛍️ **Retail & POS**: Barcode SKU, Instant Payment checkout.
  - 💻 **Freelancers & IT Agencies**: Hourly/Milestone tracking with milestone deliverables.
- **PDF Generation & Direct Print**: High-resolution branded PDF invoices with dynamic UPI QR code stamp.

### 💬 2. WhatsApp Payment Reminders & AI Escalations
- **4-Tier Smart Escalation Sequences**:
  - 🌿 *Tone 1: Gentle Friendly Reminder* (Before due date)
  - 🔔 *Tone 2: Due Today Alert* (On due date with instant payment link)
  - ⚠️ *Tone 3: Urgent Overdue Warning* (Post due date)
  - 🚨 *Tone 4: Final Notice / Service Suspension* (High-priority escalation)
- **Dual Sending Engine**:
  - **Meta Cloud API (Automated Background)**: Direct webhook/API delivery via business WhatsApp.
  - **Native WhatsApp Direct Link**: Fallback 1-click deep link to native WhatsApp app with pre-filled message & payment link.

### 💳 3. Dynamic UPI QR & Payment Reconciliation
- **NPCI Compliant UPI Pay Links**: Pre-configures merchant VPA, Payee Name, Invoice reference number, and dynamic balance amount.
- **Counter-Top & Screen QR Code**: Instant UPI QR modal for immediate scan-to-pay.
- **Payment Split & Partial Settlements**: Supports tracking multiple partial settlements, transaction reference (UTR/Bank ref), and auto balance updates.

### 🔁 4. Automated Recurring Subscriptions
- Auto-generate recurring invoices on daily, weekly, monthly, quarterly, or annual schedules.
- Automatic background worker dispatching reminder pings when recurring invoices are issued.

### 👥 5. Client Directory & CRM
- Complete client ledger with GSTIN verification, outstanding aging breakdown, phone dialer triggers, and transaction history.

### 🌐 6. Multi-Language & Modern Dark/Light Theme
- Multi-lingual localization support (English, Hindi, and regional configurations).
- Ultra-modern, responsive UI with glassmorphism, fluid animations, and dark/light modes.

### 📱 7. Cross-Platform Mobile App (React Native / Expo)
- Full-featured companion mobile app for Android and iOS located in `/mobile`.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Web Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons |
| **Backend API** | Node.js (v20+), Express.js, TypeScript (`tsx` / `esbuild`) |
| **Database & ORM** | PostgreSQL 16, Drizzle ORM |
| **Mobile App** | React Native, Expo SDK 53, TypeScript, React Navigation |
| **Auth & Security** | Firebase Authentication (Web + Mobile), Role-Based Access Control (Admin/Tenant) |
| **Integrations** | Meta WhatsApp Cloud API, NPCI UPI Protocol, Google Gemini AI |
| **DevOps** | Docker, Docker Compose, Multi-stage Dockerfile |

---

## 📁 Repository Structure

```
kwik-bill/
├── src/                        # Web Frontend & Backend API Source Code
│   ├── components/             # React UI Modals, Views, and Layout components
│   ├── controllers/            # Express Route Controllers (Invoices, Clients, Payments, Admin)
│   ├── db/                     # Drizzle ORM Schema, DB connection pool, Seed scripts
│   ├── landing/                # Public Landing Page & ROI Calculator
│   ├── lib/                    # AuthContext, API client, Firebase admin/client configs
│   ├── middleware/             # Authentication & Admin authorization middlewares
│   ├── routes/                 # Express API route declarations
│   └── services/               # Background services (e.g., Recurring Invoice cron)
├── mobile/                     # React Native / Expo Mobile App (iOS & Android)
│   ├── src/                    # Screens, Components, Context, API hooks, Utils
│   ├── android/                # Native Android Gradle configuration
│   ├── app.json                # Expo application config
│   └── package.json            # Mobile dependencies
├── public/                     # Static assets, branding, and images
├── server.ts                   # Express Backend server entrypoint & Vite middleware
├── docker-compose.yml          # Production & local Docker composition
├── Dockerfile                  # Multi-stage container build definition
└── package.json                # Root project dependencies & scripts
```

---

## 🚀 Quick Start & Setup Guide

### 📋 Prerequisites
- **Node.js**: `v20.x` or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** / **pnpm**
- **PostgreSQL**: `v15+` (or use Docker)
- **Docker & Docker Compose** (Optional, for 1-command containerized run)

---

### Option A: Run with Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/amanrai1887/kwik-bill.git
   cd kwik-bill
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   *(Update your database credentials, Firebase project ID, and WhatsApp API keys as needed)*

3. **Start the containers**:
   ```bash
   docker compose up -d --build
   ```

4. **Access the application**:
   - Web App & API: [http://localhost:3000](http://localhost:3000)
   - PostgreSQL Database: `localhost:5434`

---

### Option B: Run Locally Without Docker

#### 1. Setup Backend Database
Ensure a local PostgreSQL instance is running, then create the database:
```sql
CREATE DATABASE invoice_saas;
```

#### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database configuration:
```env
SQL_HOST="localhost"
SQL_PORT="5432"
SQL_USER="postgres"
SQL_PASSWORD="your_password"
SQL_DB_NAME="invoice_saas"
PORT="3000"
NODE_ENV="development"
```

#### 3. Install Dependencies & Start Web + API Server
```bash
npm install
npm run dev
```
The server will automatically initialize tables on startup and serve the app at [http://localhost:3000](http://localhost:3000).

---

### Option C: Run Mobile App (Android & iOS)

1. **Navigate to mobile directory and install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Start the Expo Dev Server**:
   ```bash
   npx expo start -c
   ```

3. **Run on Device or Simulator**:
   - **Android Emulator**: Press `a` in the terminal.
   - **iOS Simulator** (Mac only): Press `i` in the terminal.
   - **Physical Device**: Scan the QR code using the **Expo Go** app from Google Play Store or App Store.

---

## ⚙️ Environment Variables Reference

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Web Server Port | `3000` |
| `NODE_ENV` | Environment Mode (`development` / `production`) | `development` |
| `SQL_HOST` | PostgreSQL Host | `localhost` or `postgres` |
| `SQL_PORT` | PostgreSQL Port | `5432` |
| `SQL_USER` | PostgreSQL Username | `postgres` |
| `SQL_PASSWORD` | PostgreSQL Password | `postgres` |
| `SQL_DB_NAME` | Database Name | `invoice_saas` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID for Auth token validation | `your-firebase-project-id` |
| `META_WHATSAPP_TOKEN` | Meta WhatsApp Cloud API Bearer Token | `EAA...` |
| `META_PHONE_NUMBER_ID` | Meta WhatsApp Business Phone Number ID | `1000...` |
| `GEMINI_API_KEY` | Google Gemini API Key for smart suggestions | `AIza...` |

---

## 🛠️ Available NPM Scripts

### Root Project (Web + API)
- `npm run dev`: Starts the backend server and Vite dev server with Hot Module Replacement (HMR).
- `npm run build`: Bundles the client with Vite and compiles the backend server with `esbuild` into `dist/`.
- `npm run start`: Runs the compiled production server (`node dist/server.cjs`).
- `npm run lint`: Checks TypeScript typings across the workspace.
- `npm run clean`: Cleans build artifacts (`dist/`).

### Mobile App (`/mobile`)
- `npx expo start`: Launches the Expo Metro bundler.
- `npx expo run:android`: Builds and runs native Android debug build.
- `npx expo run:ios`: Builds and runs native iOS debug build.
- `npx eas-cli build -p android --profile preview`: Builds a standalone Android APK with Expo EAS.

---

## 🔐 Security & Best Practices
- **Multi-Tenant Isolation**: Every database query verifies `tenantId`/`userId` to ensure strict tenant data segregation.
- **SQL Injection Protection**: Built with parameterized queries and Drizzle ORM type safety.
- **Authentication**: JWT token verification backed by Firebase Admin SDK.
- **Secure Secrets Management**: Sensitive credentials are never committed; `.env` is ignored by default.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ for modern businesses and freelancers.</sub>
</div>
