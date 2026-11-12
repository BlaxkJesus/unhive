# UniHive™ — Connected Multi-Campus Marketplace & Dispatch Network Backend

Welcome to the backend engine powering **UniHive™**, an institutional e-commerce, courier dispatch, and dual-settlement escrow platform engineered specifically for Nigerian private university campuses (Ajayi Crowther University flagship launch, with Bowen, Babcock, ABUAD, and Pan-Atlantic University in multi-tenant topology).

---

## 🚀 Key Architectural Pillars

1. **Dual-Settlement Escrow Vault (`OrderEscrow`):**
   - Eliminates student fraud via a **Zero-Trust Physical Inspection Contract**.
   - Buyers inspect goods at ground-floor hostel porter reception desks.
   - When verified via confidential **4-digit PIN** (`bcrypt` hashed), the system triggers **atomic dual settlements**:
     - ₦18,500 ➔ Vendor Bank / OPay
     - ₦250 ➔ Student Courier / Kuda Bank
     - ₦100 ➔ UniHive Platform Revenue (audit-verified)
   - 3 consecutive failed PIN attempts automatically lock down the escrow and alert campus proctors.

2. **Campus Multi-Tenant Isolation (`X-Campus-ID`):**
   - Strict residential scoping ensures students only see listings and runners belonging to their active university.

3. **Ground-Floor Porter Lodge Handshake & Zero-Room-Entry Rule:**
   - Full compliance with private university security and gender segregation policies.

4. **Multi-Role Single Identity & Admin 2FA Gateway:**
   - Unified credentials supporting Buyer, Vendor, Courier, and Admin roles.
   - Admins enforce RFC 6238 TOTP (Google Authenticator) 2FA.

---

## 📁 Directory Structure

```
unihive-backend/
├── prisma/
│   ├── schema.prisma          # PostgreSQL relational schema
│   └── seed.ts                # Flagship ACU data seed
├── src/
│   ├── config/
│   │   └── constants.ts       # Fee breakdowns & environment configs
│   ├── middlewares/
│   │   └── auth.middleware.ts # JWT verification & role security
│   ├── routes/
│   │   ├── auth.routes.ts     # 4-role login & 2FA
│   │   ├── campus.routes.ts   # University & hostel listings
│   │   ├── product.routes.ts  # Catalog & merchant listings
│   │   ├── order.routes.ts    # Checkout & Paystack webhooks
│   │   ├── dispatch.routes.ts # Runner pool & 4-digit PIN handshake
│   │   └── admin.routes.ts    # Dashboard metrics & disputes
│   ├── services/
│   │   ├── admin.service.ts   # Operational metrics & dispute resolution
│   │   ├── auth.service.ts    # Authentication & Speakeasy 2FA
│   │   ├── campus.service.ts  # Campus topology
│   │   ├── catalog.service.ts # Product filtering & search
│   │   ├── dispatch.service.ts# Runner fleet management
│   │   ├── escrow.service.ts  # Atomic settlement & bcrypt PIN verification
│   │   ├── order.service.ts   # Order lifecycle & tracking
│   │   └── store.service.ts   # Seeded in-memory / test repository
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces & enums
│   ├── app.ts                 # Express application configuration
│   └── server.ts              # HTTP & Socket.io WebSocket server
├── tests/
│   └── unihive.test.ts        # Comprehensive automated test suite
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Automated Test Suite
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Health Check
```bash
curl http://localhost:5000/health
```

---

## 🔐 Pre-Provisioned Test Accounts

| Role | Name | Phone / Identifier | Password | Special Credentials |
| :--- | :--- | :--- | :--- | :--- |
| **Buyer** | Folake Adebayo | `08143829102` | `unihive2026` | Hostel: Lady Oyinlola Room 204 |
| **Vendor** | Tunde Kicks | `08023456789` | `unihive2026` | OPay Subaccount: `ACCT_tundekicks99` |
| **Courier** | David Adeleke | `08098765432` | `unihive2026` | Kuda Subaccount: `RCP_davidrunner01` |
| **Admin** | Chief Proctor O. Adeleke | `08000000001` | `unihive2026` | 2FA Secret: `JBSWY3DPEHPK3PXP` (or `123456`) |

---

## 📡 Core API Specification

### Authentication
* `POST /api/v1/auth/login` — 4-role switcher login (`buyer`, `vendor`, `courier`, `admin`)
* `POST /api/v1/auth/signup` — Student registration with role selection
* `POST /api/v1/auth/admin/setup-2fa` — Setup Google Authenticator QR code

### Campus Topology
* `GET /api/v1/campuses` — List active universities & waitlist institutions
* `GET /api/v1/campuses/:campusId/hostels` — Hostels & ground-floor porter lodges

### Marketplace Catalog
* `GET /api/v1/products` — Products filtered by active `X-Campus-ID` header
* `GET /api/v1/products/:id` — Single product details with seller trust score
* `POST /api/v1/products` — Create listing (Vendor role only)

### Orders & Escrow
* `POST /api/v1/orders/create` — Initialize order with automated fee breakdown
* `GET /api/v1/orders/:id/tracking` — Live tracking + confidential buyer PIN
* `POST /api/v1/webhooks/paystack` — Paystack payment webhook simulation

### Logistics & Ground-Floor Porter Handshake
* `GET /api/v1/dispatch/available` — Available orders for campus runners
* `POST /api/v1/dispatch/accept` — Runner claims package
* `POST /api/v1/dispatch/milestone` — Advance order to `at_porter_desk`
* `POST /api/v1/dispatch/verify-pin` — Enter 4-digit PIN to release dual settlement

### Admin Command Center
* `GET /api/v1/admin/dashboard-stats` — Escrow balance & revenue metrics
* `GET /api/v1/admin/dispatch-stream` — Real-time live dispatch stream
* `POST /api/v1/admin/disputes/:id/resolve` — 1-click refund or vendor payout
