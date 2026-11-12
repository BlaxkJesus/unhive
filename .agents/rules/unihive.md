# UniHive™ Project Rules & Behavioral Guidelines

## 1. Project Context
* **Name:** UniHive™ (Campus Marketplace & Dispatch Network)
* **Flagship Campus:** Ajayi Crowther University (ACU), Oyo State, Nigeria.
* **Architecture:** Multi-tenant, residential campus topology.

## 2. Core Business Rules (DO NOT BREAK)
* **Zero-Room-Entry Rule:** Dispatch couriers MUST NEVER enter student rooms or hostel floors. Handovers terminate strictly at the ground-floor hostel porter lodge / reception desk.
* **Dual-Settlement Escrow:**
  * Total = `Item Subtotal + ₦100 (Platform Fee) + ₦250 (Hostel Courier Fee)`.
  * The buyer receives a 4-digit PIN.
  * The runner inputs the PIN at the porter lodge only AFTER physical inspection.
  * PIN is verified against bcrypt hash.
  * Successful verification executes atomic split payout: Vendor gets subtotal, Runner gets ₦250, Platform gets ₦100.
  * 3 failed PIN attempts permanently lock the escrow and trigger an admin dispute.
* **Admin 2FA Security:**
  * No public admin registration.
  * Admin login requires RFC 6238 TOTP 6-digit Authenticator code.

## 3. UI Theme Specifications
* **User-Facing Screens (Mobile & Desktop):** Clean Light Mode (`#0F2B5C` navy, `#EFF6FF` soft blue, `#F59E0B` amber gold, `#FFFFFF` surface).
* **Admin Dashboard:** Operations Dark Mode (`#0B1120`, `#0F172A`).
* **Screen 8 Login:** Must feature the 4-role switcher (`Buyer`, `Vendor`, `Courier`, `Admin`).
