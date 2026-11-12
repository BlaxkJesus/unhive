# UniHive™ Project Handover & Onboarding Dossier for Antigravity IDE

Welcome to **UniHive™** (*The Connected Multi-Campus Marketplace & Dispatch Network*). This dossier contains all domain rules, architectural contracts, credentials, file paths, and current progress needed to bring any new agent or developer in the **Antigravity IDE** up to full speed immediately.

---

## 1. Executive Summary & Brand Identity

* **Brand Name:** Strictly **UniHive™** (Rebranded from early CrowtherMart prototype).
* **Tagline:** *The Connected Campus Marketplace & Dispatch Network*.
* **Target Environment:** Multi-tenant platform tailored for Nigerian private residential universities.
* **Flagship Launch Campus:** **Ajayi Crowther University (ACU)**, Oyo.
* **Expansion Campuses:** Bowen University (Iwo), Babcock University (Ilishan-Remo), ABUAD (Ado-Ekiti), Pan-Atlantic University (PAU, Lagos).

---

## 2. Non-Negotiable Institutional & Security Rules

1. **The Zero-Room-Entry Rule:**
   - Due to strict private university safety regulations and gender-segregated hostel policies, campus couriers/runners are **strictly prohibited** from entering hostel corridors or student rooms.
   - All pickups and deliveries strictly terminate at the **ground-floor hostel porter lodge / reception desk**.
2. **The Zero-Trust Physical Inspection Handshake:**
   - Buyers do **NOT** pay cash on delivery, nor do they release payment upfront to the vendor.
   - The payment is locked in the **UniHive Escrow Vault**.
   - When the runner arrives at the ground-floor porter lodge, the buyer physically inspects the item (size, condition, fit).
   - Only when satisfied does the buyer disclose their confidential **4-digit PIN** to the runner.
3. **Escrow Fee Structure:**
   - `Total Amount = Item Subtotal + ₦100 (Platform Tech Fee) + ₦250 (Hostel Courier Delivery)`
4. **Atomic Dual-Settlement:**
   - When the runner enters the 4-digit PIN into their app, the system verifies the bcrypt hash and atomically executes:
     - ₦18,500 ➔ Vendor Bank / OPay
     - ₦250 ➔ Student Courier / Kuda Bank
     - ₦100 ➔ UniHive Platform Revenue
   - If 3 incorrect PIN attempts occur, the escrow is permanently locked and automatically escalated to the **Admin Mediation Desk**.
5. **Admin Access Security:**
   - Admin accounts are strictly pre-provisioned (no public signup).
   - Admin login enforces **RFC 6238 TOTP 2FA** (Google Authenticator) via Speakeasy.

---

## 3. Design System & Theme Strategy

* **Clean Light Mode (User-Facing):**
  - Used across all 10 Mobile PWA screens and Desktop Marketplace Hub & Product Details/Checkout screens.
  - Colors: Deep Institutional Navy (`#0F2B5C`, `#1E3A8A`), Soft Blue Tints (`#EFF6FF`, `#DBEAFE`), Amber Gold Accents (`#F59E0B`, `#D97706`), Neutral White/Gray (`#FFFFFF`, `#F8FAFC`, `#64748B`).
* **Operations Dark Mode (Admin Only):**
  - Exclusively for the Admin Operations Command Center.
  - Colors: Deep Slate (`#0B1120`, `#0F172A`, `#1E293B`), Emerald Green (`#10B981`), Amber Gold (`#F59E0B`), Crimson Alert (`#EF4444`).
* **Screen 8 Unified Login Gateway:**
  - 4-role switcher tabs: `Buyer`, `Vendor`, `Courier`, `Admin`.
  - Selecting `Admin` dynamically renders the 6-digit Authenticator 2FA TOTP input.

---

## 4. Master Asset & Prototype Locations

### Local Retina 2X Export Folders
* **Primary:** `C:\Users\ONU\Desktop\UniHive.png\`
* **Mirror:** `C:\Users\ONU\Desktop\CrowderMart.png\`

### Visual Assets Generated
* `1.png` — Master 10-screen panoramic mobile showcase graphic
* `01_Screen_1_Splash.png` to `10_Screen_10_Admin_Dashboard_Desktop.png` — Individual retina screens
* `11_Screen_11_Desktop_Marketplace_Hub.png` — Full-width desktop marketplace
* `12_Screen_12_Desktop_Product_Checkout.png` — Split-column product & checkout
* `Desktop_Web_Suite_Showcase.png` — Master desktop graphic

### Interactive HTML Prototypes (Test in Browser)
* **Mobile PWA (10 screens):** `file:///C:/Users/ONU/.gemini/antigravity/brain/5960052c-7be7-47ea-aee4-4de752b37787/unihive_ui_prototype.html`
* **Desktop Marketplace:** `file:///C:/Users/ONU/.gemini/antigravity/brain/5960052c-7be7-47ea-aee4-4de752b37787/unihive_desktop_home.html`
* **Desktop Product Checkout:** `file:///C:/Users/ONU/.gemini/antigravity/brain/5960052c-7be7-47ea-aee4-4de752b37787/unihive_desktop_product.html`
* **Desktop Admin Console:** `file:///C:/Users/ONU/.gemini/antigravity/brain/5960052c-7be7-47ea-aee4-4de752b37787/unihive_admin_dashboard.html`

---

## 5. Backend Codebase & Architecture State

* **Location:** `C:\Users\ONU\.gemini\antigravity\scratch\unihive-backend`
* **Stack:** Node.js (TypeScript) + Express + Prisma ORM (PostgreSQL) + Vitest + Socket.io + Speakeasy + Bcrypt.
* **Prisma Schema (`prisma/schema.prisma`):**
  - Models: `Campus`, `Hostel`, `User`, `VendorProfile`, `CourierProfile`, `Product`, `Order`, `OrderEscrow`, `PayoutTransaction`, `OrderDispute`.
* **Services Implemented:**
  - `src/services/auth.service.ts`: 4-role switcher login, 2FA TOTP verification, student signup.
  - `src/services/escrow.service.ts`: Fee calculations, bcrypt PIN verification, 3-try lockout, atomic dual settlement.
  - `src/services/campus.service.ts`: Campus scoping and hostel porter lodge lookup.
  - `src/services/catalog.service.ts`: Product search and vendor inventory.
  - `src/services/dispatch.service.ts`: Campus runner dispatch pool and milestone tracking.
  - `src/services/admin.service.ts`: Escrow audit, dispute resolution, courier approval.
  - `src/services/store.ts`: Pre-seeded in-memory database store with ACU hostels and test entities.
* **API Routes Mounted (`src/app.ts`):**
  - `/api/v1/auth`, `/api/v1/campuses`, `/api/v1/products`, `/api/v1/orders`, `/api/v1/dispatch`, `/api/v1/admin`.
* **Real-time Server (`src/server.ts`):**
  - Socket.io live tracking on `order:<orderNumber>` and `campus:<slug>`.
* **Verification Status:**
  - `npx tsc --noEmit` ➔ **0 errors**.
  - `npx vitest run` ➔ **15 / 15 tests passed (100%)**.

---

## 6. Pre-Configured Test Credentials

| Role | Name | Phone / Login | Password | Context |
| :--- | :--- | :--- | :--- | :--- |
| **Buyer** | Folake Adebayo | `08143829102` | `unihive2026` | Lady Oyinlola Hall, Room 204 |
| **Vendor** | Tunde Kicks | `08023456789` | `unihive2026` | OPay Subaccount: `ACCT_tundekicks99` |
| **Courier** | David Adeleke | `08098765432` | `unihive2026` | Kuda Subaccount: `RCP_davidrunner01` |
| **Admin** | Chief Proctor O. Adeleke | `08000000001` | `unihive2026` | 2FA Secret: `JBSWY3DPEHPK3PXP` (or dev code `123456`) |

---

## 7. Next Milestones for Antigravity IDE

1. **Frontend Web & Mobile App Development:**
   - Scaffold the frontend client (Next.js / React + Tailwind or Flutter) connecting to `http://localhost:5000/api/v1`.
   - Implement the 4-role switcher login and route to respective views:
     - Buyer: Browse campus catalog, order with escrow, live tracking with 4-digit PIN.
     - Vendor: Add products, view earnings, order fulfillment.
     - Courier: Claim available orders, advance milestones to porter lodge, input 4-digit PIN.
     - Admin: Command Center dashboard with live dispatch stream and dispute resolution.
2. **Live Third-Party Integrations:**
   - Connect actual Paystack Subaccount Split API keys.
   - WhatsApp Cloud API or Termii for instant OTP SMS alerts to students.
