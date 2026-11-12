import crypto from 'crypto';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { db } from '../src/services/store.js';
import { CONFIG } from '../src/config/constants.js';
import { EscrowService } from '../src/services/escrow.service.js';
import { AuthService } from '../src/services/auth.service.js';
import { CatalogService } from '../src/services/catalog.service.js';
import { DispatchService } from '../src/services/dispatch.service.js';
import { broadcastOrderStatus, broadcastVendorNotification, broadcastCampusDispatch, setSocketIO } from '../src/services/events.js';

describe('UniHive™ Core Architecture & Security Test Suite', () => {
  beforeEach(() => {
    // Reset database to seed baseline before each test run
    db.seedDefaultData();

    // Prepare test fixture order for verification & escrow unit tests
    const activeOrderId = 'order-run-4829';
    const plainPin = '4829';
    const pinHash = bcrypt.hashSync(plainPin, 8);

    db.orders = [
      {
        id: activeOrderId,
        orderNumber: 'RUN-4829',
        campusId: 'campus-run-ede',
        buyerId: 'user-run-buyer-1',
        vendorId: 'vendor-tunde-kicks-run',
        courierId: 'courier-david-runner-run',
        status: 'at_porter_desk',
        deliveryMethod: 'courier_runner',
        dropoffHostelId: 'hostel-run-queen-esther',
        dropoffRoom: 'Room 204',
        contactPhone: '08123450001',
        specialInstructions: "Nike Air Force 1 '07 Low (Triple White) • Call Folake when approaching Queen Esther Hall ground floor porter reception desk.",
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'order-run-4820',
        orderNumber: 'RUN-4820',
        campusId: 'campus-run-ede',
        buyerId: 'user-run-buyer-1',
        vendorId: 'vendor-tunde-kicks-run',
        courierId: 'courier-david-runner-run',
        status: 'inspected_completed',
        deliveryMethod: 'courier_runner',
        dropoffHostelId: 'hostel-run-queen-esther',
        dropoffRoom: 'Room 204',
        contactPhone: '08123450001',
        specialInstructions: "Nike Air Force 1 '07 Low (Triple White)",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
      },
      {
        id: 'order-run-4815',
        orderNumber: 'RUN-4815',
        campusId: 'campus-run-ede',
        buyerId: 'user-run-buyer-1',
        vendorId: 'vendor-tunde-kicks-run',
        courierId: 'courier-david-runner-run',
        status: 'inspected_completed',
        deliveryMethod: 'courier_runner',
        dropoffHostelId: 'hostel-run-queen-esther',
        dropoffRoom: 'Room 204',
        contactPhone: '08123450001',
        specialInstructions: 'Oraimo 65W Fast Charger (Type-C)',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
      },
      {
        id: 'order-run-4802',
        orderNumber: 'RUN-4802',
        campusId: 'campus-run-ede',
        buyerId: 'user-run-buyer-1',
        vendorId: 'vendor-tunde-kicks-run',
        courierId: 'courier-david-runner-run',
        status: 'inspected_completed',
        deliveryMethod: 'courier_runner',
        dropoffHostelId: 'hostel-run-queen-esther',
        dropoffRoom: 'Room 204',
        contactPhone: '08123450001',
        specialInstructions: 'Nike Ankle Socks (Pack of 3 Pairs)',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
      },
      {
        id: 'order-run-4790',
        orderNumber: 'RUN-4790',
        campusId: 'campus-run-ede',
        buyerId: 'user-run-buyer-1',
        vendorId: 'vendor-tunde-kicks-run',
        courierId: 'courier-david-runner-run',
        status: 'inspected_completed',
        deliveryMethod: 'courier_runner',
        dropoffHostelId: 'hostel-run-queen-esther',
        dropoffRoom: 'Room 204',
        contactPhone: '08123450001',
        specialInstructions: 'Vintage Oversized RUN Varsity Hoodie',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
      },
    ];

    db.escrows = [
      {
        id: 'escrow-run-4829',
        orderId: activeOrderId,
        itemSubtotal: 18500.0,
        platformTechFee: 100.0,
        courierDeliveryFee: 250.0,
        totalAmount: 18850.0,
        paystackReference: 'pstk_ref_run_4829_demo',
        paystackPaymentStatus: 'held_in_escrow',
        handshakePinHash: pinHash,
        plainPinForDev: plainPin,
        pinAttemptsCount: 0,
        pinVerifiedAt: undefined,
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
    ];
  });

  // 1. Escrow Financial Mathematical Integrity
  describe('1. Escrow Calculation Engine', () => {
    it('should correctly calculate exact fees: item + ₦100 (platform) + delivery fee (pickup: ₦0, batch: ₦500, express: ₦1,500)', () => {
      // Test 1: Express Solo Run (₦1,500 courier fee)
      const shoes = EscrowService.calculateFees(18500, 'express');
      expect(shoes.itemSubtotal).toBe(18500);
      expect(shoes.platformTechFee).toBe(100);
      expect(shoes.courierDeliveryFee).toBe(1500);
      expect(shoes.totalAmount).toBe(20100);

      // Test 2: Hostel Batch Run (₦500 courier fee)
      const food = EscrowService.calculateFees(3500, 'batch_evening');
      expect(food.courierDeliveryFee).toBe(500);
      expect(food.totalAmount).toBe(4100);

      // Test 3: Ground-Floor Self-Pickup (₦0 courier fee)
      const notes = EscrowService.calculateFees(2500, 'pickup');
      expect(notes.courierDeliveryFee).toBe(0);
      expect(notes.totalAmount).toBe(2600);
    });

    it('should reject invalid or negative subtotal amounts', () => {
      expect(() => EscrowService.calculateFees(0)).toThrow();
      expect(() => EscrowService.calculateFees(-500)).toThrow();
    });
  });

  // 2. Zero-Trust 4-Digit Handshake PIN & Rate-Limiting Security
  describe('2. Handshake PIN & Lockout Protection', () => {
    it('should generate a 4-digit numeric PIN and secure bcrypt hash', async () => {
      const { plainPin, pinHash } = await EscrowService.generateHandshakePin();
      expect(plainPin).toMatch(/^\d{4}$/);
      expect(pinHash.startsWith('$2')).toBe(true);

      const isValid = await bcrypt.compare(plainPin, pinHash);
      expect(isValid).toBe(true);
    });

    it('should successfully verify PIN and execute dual split settlement', async () => {
      const result = await EscrowService.verifyHandshakePin({
        orderId: 'order-run-4829',
        submittedPin: '4829',
        verifiedByUserId: 'user-run-courier-1',
      });

      expect(result.success).toBe(true);
      expect(result.vendorPayout.amount).toBe(18500);
      expect(result.courierPayout.amount).toBe(250);
      expect(result.platformRevenue).toBe(100);

      const order = db.orders.find((o) => o.id === 'order-run-4829');
      expect(order?.status).toBe('inspected_completed');
    });

    it('should track failed PIN attempts and lockout after 3 wrong tries', async () => {
      // Wrong Attempt 1
      await expect(
        EscrowService.verifyHandshakePin({
          orderId: 'order-run-4829',
          submittedPin: '0000',
          verifiedByUserId: 'user-run-courier-1',
        })
      ).rejects.toThrow(/2 attempt\(s\) remaining/);

      // Wrong Attempt 2
      await expect(
        EscrowService.verifyHandshakePin({
          orderId: 'order-run-4829',
          submittedPin: '1111',
          verifiedByUserId: 'user-run-courier-1',
        })
      ).rejects.toThrow(/1 attempt\(s\) remaining/);

      // Wrong Attempt 3 -> Triggers lockout & raises dispute
      await expect(
        EscrowService.verifyHandshakePin({
          orderId: 'order-run-4829',
          submittedPin: '2222',
          verifiedByUserId: 'user-run-courier-1',
        })
      ).rejects.toThrow(/Security lock activated/);

      const escrow = db.escrows.find((e) => e.orderId === 'order-run-4829');
      expect(escrow?.pinAttemptsCount).toBe(3);

      const order = db.orders.find((o) => o.id === 'order-run-4829');
      expect(order?.status).toBe('disputed');

      // Verify dispute case was logged for admin
      const dispute = db.disputes.find((d) => d.orderId === 'order-run-4829');
      expect(dispute).toBeDefined();
      expect(dispute?.status).toBe('open');
    });
  });

  // 3. Multi-Role Authentication & Admin 2FA TOTP
  describe('3. Multi-Role Auth & 2FA TOTP Security', () => {
    it('should authenticate student buyer without 2FA', async () => {
      const res = await AuthService.login({
        phoneOrEmail: '08123450001',
        password: 'unihive2026',
        role: 'buyer',
      });

      expect(res.token).toBeDefined();
      expect(res.user.fullName).toBe('Folake Adebayo');
      expect(res.activeRole).toBe('buyer');
    });

    it('should reject Admin login without 2FA code', async () => {
      await expect(
        AuthService.login({
          phoneOrEmail: '08123450004',
          password: 'unihive2026',
          role: 'admin',
        })
      ).rejects.toThrow(/requires 6-digit Authenticator 2FA code/);
    });

    it('should authenticate Admin when valid RFC 6238 TOTP is provided', async () => {
      const adminUser = db.users.find((u) => u.roles.includes('admin'));
      expect(adminUser?.twoFactorSecret).toBeDefined();

      const validTotp = speakeasy.totp({
        secret: adminUser!.twoFactorSecret!,
        encoding: 'base32',
      });

      const res = await AuthService.login({
        phoneOrEmail: '08123450004',
        password: 'unihive2026',
        role: 'admin',
        totpCode: validTotp,
      });

      expect(res.token).toBeDefined();
      expect(res.user.fullName).toBe('Chief Proctor O. Adeleke');
      expect(res.activeRole).toBe('admin');
    });
  });

  // 4. Multi-Campus Scoping & Product Catalog Isolation
  describe('4. Campus Scoping & Product Catalog Isolation', () => {
    it("should return empty catalog for fresh launch and filter products by campus when added", () => {
      // By default with zero dummy products
      const emptyRun = CatalogService.listProducts({ campusId: 'campus-run-ede' });
      expect(Array.isArray(emptyRun)).toBe(true);

      // Add a fixture product dynamically for RUN
      db.products.push({
        id: 'prod-test-catalog-run',
        campusId: 'campus-run-ede',
        vendorId: 'vendor-tunde-kicks-run',
        title: "Test Sneakers",
        description: "Campus footwear",
        category: "shoes",
        condition: "brand_new",
        price: 18500,
        images: [],
        stockQuantity: 5,
        isActive: true,
        createdAt: new Date(),
      } as any);

      const runProducts = CatalogService.listProducts({ campusId: 'campus-run-ede' });
      expect(runProducts.length).toBe(1);
      expect(runProducts[0].campusId).toBe('campus-run-ede');

      // Unlaunched campus returns zero products
      const otherProducts = CatalogService.listProducts({ campusId: 'campus-bowen-iwo' });
      expect(otherProducts.length).toBe(0);
    });
  });

  // 5. RESTful API Endpoints Integration (Supertest)
  describe('5. RESTful API Endpoints', () => {
    it('GET /health returns platform status online', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('online');
      expect(res.body.platform).toContain('UniHive');
    });

    it('GET /api/v1/campuses returns list of universities including RUN flagship', async () => {
      const res = await request(app).get('/api/v1/campuses');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      const run = res.body.data.find((c: any) => c.shortName === 'RUN');
      expect(run).toBeDefined();
      expect(run.status).toBe('active');
      expect(run.name).toBe("Redeemer's University");
    });

    it('GET /api/v1/campuses/:id/hostels returns RUN residential halls & porter lodges', async () => {
      const res = await request(app).get('/api/v1/campuses/campus-run-ede/hostels');
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(4);

      const queenEsther = res.body.data.find((h: any) => h.name === 'Queen Esther Hall');
      expect(queenEsther).toBeDefined();
      expect(queenEsther.porterLodgeName).toContain('Porter Reception');

      const joshua = res.body.data.find((h: any) => h.name === 'Joshua Hall');
      expect(joshua).toBeDefined();
    });

    it('GET /api/v1/campuses/:id/hostels returns empty list for campus without hostels', async () => {
      const res = await request(app).get('/api/v1/campuses/campus-nonexistent/hostels');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });

    it('POST /api/v1/auth/login authenticates 4-role switcher', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450002',
          password: 'unihive2026',
          role: 'vendor',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vendorProfile).toBeDefined();
      expect(res.body.data.vendorProfile.businessName).toBe('Tunde Kicks & Thrift');
    });

    it('POST /api/v1/dispatch/verify-pin triggers dual-settlement via HTTP endpoint', async () => {
      // 1. Authenticate courier
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450003',
          password: 'unihive2026',
          role: 'courier',
        });

      const token = loginRes.body.data.token;

      // 2. Submit PIN 4829
      const pinRes = await request(app)
        .post('/api/v1/dispatch/verify-pin')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: 'order-run-4829',
          pin: '4829',
        });

      expect(pinRes.status).toBe(200);
      expect(pinRes.body.success).toBe(true);
      expect(pinRes.body.data.vendorPayout.amount).toBe(18500);
      expect(pinRes.body.data.courierPayout.amount).toBe(250);
      expect(pinRes.body.data.platformRevenue).toBe(100);
    });

    it('GET /api/v1/dispatch/available lists pending deliveries and allows runner claim', async () => {
      const courierLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450003',
          password: 'unihive2026',
          role: 'courier',
        });
      const courierToken = courierLogin.body.data.token;

      const availRes = await request(app)
        .get('/api/v1/dispatch/available')
        .set('Authorization', `Bearer ${courierToken}`)
        .set('x-campus-id', 'campus-run-ede');

      expect(availRes.status).toBe(200);
      expect(availRes.body.success).toBe(true);
      expect(Array.isArray(availRes.body.data)).toBe(true);
    });

    it('GET /api/v1/admin/disputes returns mediation queue and supports resolution', async () => {
      const adminUser = db.users.find((u) => u.roles.includes('admin'));
      const validTotp = speakeasy.totp({
        secret: adminUser!.twoFactorSecret!,
        encoding: 'base32',
      });

      const adminLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450004',
          password: 'unihive2026',
          role: 'admin',
          totpCode: validTotp,
        });
      const adminToken = adminLogin.body.data.token;

      // Add a test dispute
      db.disputes.push({
        id: 'dispute-test-1',
        orderId: 'order-run-4829',
        raisedByUserId: 'user-run-buyer-1',
        reason: '3-Attempt PIN Lockout at Queen Esther Hall Reception Desk',
        status: 'open',
        createdAt: new Date(),
      });

      const disputesRes = await request(app)
        .get('/api/v1/admin/disputes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(disputesRes.status).toBe(200);
      expect(disputesRes.body.success).toBe(true);
      expect(disputesRes.body.count).toBeGreaterThan(0);

      // Resolve dispute
      const resolveRes = await request(app)
        .post('/api/v1/admin/disputes/dispute-test-1/resolve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'refund_buyer',
          resolutionNotes: 'Verified wrong shoe size delivered by vendor',
        });

      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.success).toBe(true);
      expect(resolveRes.body.data.refundedAmount).toBe(18850);
    });

    it('POST /api/v1/orders/:id/dispute allows student buyer to lodge complaint and freeze escrow', async () => {
      // 1. Authenticate buyer
      const buyerLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450001',
          password: 'unihive2026',
          role: 'buyer',
        });
      const buyerToken = buyerLogin.body.data.token;

      // 2. Lodge complaint
      const disputeRes = await request(app)
        .post('/api/v1/orders/order-run-4829/dispute')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          reason: 'Vendor sent size 40 EU instead of size 43 EU ordered',
          issueCategory: 'Wrong Item / Size',
        });

      expect(disputeRes.status).toBe(200);
      expect(disputeRes.body.success).toBe(true);
      expect(disputeRes.body.data.status).toBe('disputed');

      const order = db.orders.find((o) => o.id === 'order-run-4829');
      expect(order?.status).toBe('disputed');

      const dispute = db.disputes.find((d) => d.id === disputeRes.body.data.disputeId);
      expect(dispute).toBeDefined();
      expect(dispute?.reason).toContain('Wrong Item / Size');
    });

    it('GET /api/v1/orders/my-orders returns buyer active and past historical orders', async () => {
      const buyerLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450001',
          password: 'unihive2026',
          role: 'buyer',
        });
      expect(buyerLogin.status).toBe(200);
      const buyerToken = buyerLogin.body.data.token;

      const res = await request(app)
        .get('/api/v1/orders/my-orders')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.activeOrders)).toBe(true);
      expect(Array.isArray(res.body.data.pastOrders)).toBe(true);
      expect(res.body.data.activeOrders.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.pastOrders.length).toBeGreaterThanOrEqual(4);
    });
  });

  // 7. Vendor Orders Pipeline & Automated Transactional Email Notifications
  describe('7. Vendor Orders Pipeline & Automated Transactional Email Notifications', () => {
    it('GET /api/v1/vendor/orders returns pipeline orders with lifecycle counts', async () => {
      // Login as vendor Tunde
      const vendorLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450002',
          password: 'unihive2026',
          role: 'vendor',
        });
      expect(vendorLogin.status).toBe(200);
      const vendorToken = vendorLogin.body.data.token;

      const res = await request(app)
        .get('/api/v1/vendor/orders')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toBeDefined();
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.counts).toBeDefined();
      expect(res.body.data.counts.total).toBeGreaterThanOrEqual(1);
      expect(typeof res.body.data.counts.in_transit).toBe('number');
      expect(typeof res.body.data.counts.at_porter_desk).toBe('number');
      expect(typeof res.body.data.counts.completed).toBe('number');
      expect(typeof res.body.data.counts.refunded).toBe('number');

      // Verify populated details
      const firstOrder = res.body.data.orders[0];
      expect(firstOrder.product).toBeDefined();
      expect(firstOrder.buyer).toBeDefined();
      expect(firstOrder.dropoffHostel).toBeDefined();
    });

    it('GET /api/v1/vendor/notifications returns transactional email notification records', async () => {
      const vendorLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450002',
          password: 'unihive2026',
          role: 'vendor',
        });
      expect(vendorLogin.status).toBe(200);
      const vendorToken = vendorLogin.body.data.token;

      const res = await request(app)
        .get('/api/v1/vendor/notifications')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('dispatches automated transactional email on completed escrow payout', async () => {
      // Verify handshake PIN on order-run-4829
      const result = await EscrowService.verifyHandshakePin({
        orderId: 'order-run-4829',
        submittedPin: '4829',
        verifiedByUserId: 'user-run-courier-1',
      });
      expect(result.success).toBe(true);

      // Check that an email notification was generated for the vendor
      const notif = db.notifications.find(
        (n) => n.orderId === 'order-run-4829' && n.type === 'completed'
      );
      expect(notif).toBeDefined();
      expect(notif?.subject).toContain('Payout Released!');
      expect(notif?.metadata?.transferCode).toBeDefined();
      expect(notif?.htmlBody).toContain('Paystack Transfer Code');
    });

    it('dispatches automated transactional email on dispute refund', async () => {
      const adminUser = db.users.find((u) => u.roles.includes('admin'));
      const validTotp = speakeasy.totp({
        secret: adminUser!.twoFactorSecret!,
        encoding: 'base32',
      });

      const adminLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450004',
          password: 'unihive2026',
          role: 'admin',
          totpCode: validTotp,
        });
      expect(adminLogin.status).toBe(200);
      const adminToken = adminLogin.body.data.token;

      // Seed a test dispute
      db.disputes.push({
        id: 'dispute-vendor-test',
        orderId: 'order-run-4829',
        raisedByUserId: 'user-run-buyer-1',
        reason: 'Item defective',
        status: 'open',
        createdAt: new Date(),
      });

      const resolveRes = await request(app)
        .post('/api/v1/admin/disputes/dispute-vendor-test/resolve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'refund_buyer',
          resolutionNotes: 'Approved refund for student',
        });

      expect(resolveRes.status).toBe(200);

      const refundNotif = db.notifications.find(
        (n) => n.orderId === 'order-run-4829' && n.type === 'refunded'
      );
      expect(refundNotif).toBeDefined();
      expect(refundNotif?.subject).toContain('Dispute Resolved');
    });
  });

  // 8. Institutional Email & Matric Number Verification Suite
  describe('8. Institutional Email (@run.edu.ng) & Matric Number Verification', () => {
    it('successfully registers a Redeemer\'s University student with valid @run.edu.ng email and matric number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          fullName: 'Demilade Adeyemi',
          phone: '08133334444',
          email: 'demilade.adeyemi@run.edu.ng',
          password: 'unihive2026',
          campusId: 'campus-run-ede',
          matricNumber: 'RUN/2023/CMP/012',
          hostelId: 'hostel-run-queen-esther',
          roomNumber: 'Room 102',
          role: 'buyer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('demilade.adeyemi@run.edu.ng');
      expect(res.body.data.user.matricNumber).toBe('RUN/2023/CMP/012');
      expect(res.body.data.user.campusId).toBe('campus-run-ede');
    });

    it('rejects student registration on RUN campus with invalid email domain', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          fullName: 'Fake Impersonator',
          phone: '08199991111',
          email: 'scammer@yahoo.com',
          password: 'unihive2026',
          campusId: 'campus-run-ede',
          matricNumber: 'RUN/2023/00001',
          role: 'buyer',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('@run.edu.ng');
    });

    it('rejects student registration with unauthorized public email domain (e.g. @gmail.com)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          fullName: 'Fake Impersonator',
          phone: '08199999999',
          email: 'scammer@gmail.com',
          password: 'unihive2026',
          campusId: 'campus-run-ede',
          matricNumber: 'RUN/2023/00001',
          role: 'buyer',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('@run.edu.ng');
    });

    it('rejects student registration without a valid matriculation number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          fullName: 'No Matric Student',
          phone: '08188888888',
          email: 'nomatric@run.edu.ng',
          password: 'unihive2026',
          campusId: 'campus-run-ede',
          matricNumber: '',
          role: 'buyer',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Matriculation Number');
    });
  });

  // 9. 6-Digit Institutional Email OTP Verification Suite (Anti-Impersonation)
  describe('9. 6-Digit Institutional Email OTP Verification Suite (Anti-Impersonation)', () => {
    it('rejects OTP dispatch for non-RUN public emails (@gmail.com)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/send-email-otp')
        .send({
          email: 'impersonator@gmail.com',
          matricNumber: 'RUN/2023/99999',
          campusId: 'campus-run-ede',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('@run.edu.ng');
    });

    it('rejects OTP dispatch without a valid matriculation number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/send-email-otp')
        .send({
          email: 'student@run.edu.ng',
          matricNumber: '',
          campusId: 'campus-run-ede',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('matriculation number');
    });

    it('successfully dispatches 6-digit OTP to valid RUN student email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/send-email-otp')
        .send({
          email: 'segun.adeyemi@run.edu.ng',
          matricNumber: 'RUN/2023/07721',
          fullName: 'Segun Adeyemi',
          campusId: 'campus-run-ede',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.devCode).toBeDefined();
      expect(res.body.data.devCode).toHaveLength(6);

      // Verify OTP stored in db
      const stored = db.verificationOtps.find(
        (o) => o.email === 'segun.adeyemi@run.edu.ng'
      );
      expect(stored).toBeDefined();
      expect(stored?.code).toBe(res.body.data.devCode);
    });

    it('rejects verification with wrong 6-digit code', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify-email-otp')
        .send({
          email: 'segun.adeyemi@run.edu.ng',
          code: '000000',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Incorrect 6-digit');
    });

    it('successfully verifies with correct 6-digit code or dev master code (123456)', async () => {
      const stored = db.verificationOtps.find(
        (o) => o.email === 'segun.adeyemi@run.edu.ng'
      );
      expect(stored).toBeDefined();

      const res = await request(app)
        .post('/api/v1/auth/verify-email-otp')
        .send({
          email: 'segun.adeyemi@run.edu.ng',
          code: stored!.code,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(stored?.isVerified).toBe(true);
    });
  });

  // ==========================================
  // SUITE 10: Vendor Multi-Account Payout Management
  // ==========================================
  describe('Suite 10: Vendor Multi-Account Payout Management', () => {
    let vendorToken: string;
    let vendorId: string;

    beforeEach(async () => {
      const vendorLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450002',
          password: 'unihive2026',
          role: 'vendor',
        });
      expect(vendorLogin.status).toBe(200);
      vendorToken = vendorLogin.body.data.token;
      vendorId = db.vendorProfiles.find((v) => v.accountNumber === '8123450002')?.id || 'vendor-tunde-kicks-run';
    });

    it('GET /api/v1/vendor/payout-accounts returns seeded accounts with primary settlement designated', async () => {
      const res = await request(app)
        .get('/api/v1/vendor/payout-accounts')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.accounts)).toBe(true);
      expect(res.body.data.accounts.length).toBeGreaterThanOrEqual(1);

      const primary = res.body.data.accounts.find((a: any) => a.isPrimary);
      expect(primary).toBeDefined();
      expect(primary.bankName).toBe('OPay Digital Services');
      expect(primary.accountNumber).toBe('8123450002');
    });

    it('POST /api/v1/vendor/payout-accounts validates bankName, 10-digit NUBAN, and account name', async () => {
      // Invalid account number (less than 10 digits)
      const res1 = await request(app)
        .post('/api/v1/vendor/payout-accounts')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          bankName: 'Kuda Bank',
          accountNumber: '12345',
          accountName: 'TUNDE AKINOLA',
        });
      expect(res1.status).toBe(400);
      expect(res1.body.error).toBe('InvalidAccountNumber');

      // Invalid bank name
      const res2 = await request(app)
        .post('/api/v1/vendor/payout-accounts')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          bankName: '',
          accountNumber: '2001234567',
          accountName: 'TUNDE AKINOLA',
        });
      expect(res2.status).toBe(400);
      expect(res2.body.error).toBe('InvalidBankName');

      // Invalid account name
      const res3 = await request(app)
        .post('/api/v1/vendor/payout-accounts')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          bankName: 'Kuda Bank',
          accountNumber: '2001234567',
          accountName: '',
        });
      expect(res3.status).toBe(400);
      expect(res3.body.error).toBe('InvalidAccountName');
    });

    it('POST /api/v1/vendor/payout-accounts successfully adds a new Nigerian bank account', async () => {
      const res = await request(app)
        .post('/api/v1/vendor/payout-accounts')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          bankName: 'Kuda Bank',
          bankCode: 'kuda',
          accountNumber: '2001234567',
          accountName: 'TUNDE AYOMIDE AKINOLA',
          isPrimary: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.accountNumber).toBe('2001234567');
      expect(res.body.data.isPrimary).toBe(false);

      // Verify in store
      const inStore = db.vendorPayoutAccounts.find((a) => a.id === res.body.data.id);
      expect(inStore).toBeDefined();
      expect(inStore?.bankName).toBe('Kuda Bank');
    });

    it('PUT /api/v1/vendor/payout-accounts/:id/primary switches the primary settlement account', async () => {
      // In baseline: OPay is primary, GTBank is secondary
      const listRes = await request(app)
        .get('/api/v1/vendor/payout-accounts')
        .set('Authorization', `Bearer ${vendorToken}`);
      expect(listRes.status).toBe(200);

      const gtbAccount = listRes.body.data.accounts.find((a: any) => a.accountNumber === '0129847365');
      expect(gtbAccount).toBeDefined();
      expect(gtbAccount.isPrimary).toBe(false);

      // Switch primary to GTBank
      const res = await request(app)
        .put(`/api/v1/vendor/payout-accounts/${gtbAccount.id}/primary`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPrimary).toBe(true);

      // Verify in store that GTBank is now primary and OPay is false
      const accounts = db.getVendorPayoutAccounts(vendorId);
      const updatedGtb = accounts.find((a) => a.id === gtbAccount.id);
      const updatedOpay = accounts.find((a) => a.accountNumber === '8123450002');

      expect(updatedGtb?.isPrimary).toBe(true);
      expect(updatedOpay?.isPrimary).toBe(false);

      // Verify vendorProfile in store was updated
      const vendor = db.vendorProfiles.find((v) => v.id === vendorId);
      expect(vendor?.bankName).toBe('Guaranty Trust Bank (GTBank)');
      expect(vendor?.accountNumber).toBe('0129847365');
    });

    it('DELETE /api/v1/vendor/payout-accounts/:id removes secondary account and protects sole account', async () => {
      // Add a third account (Kuda) to safely test deleting
      const addRes = await request(app)
        .post('/api/v1/vendor/payout-accounts')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          bankName: 'Kuda Bank',
          accountNumber: '2001234567',
          accountName: 'TUNDE AYOMIDE AKINOLA',
          isPrimary: false,
        });
      expect(addRes.status).toBe(201);
      const kudaId = addRes.body.data.id;

      // Delete the secondary Kuda account
      const delRes = await request(app)
        .delete(`/api/v1/vendor/payout-accounts/${kudaId}`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      // Check it was removed from store
      const remaining = db.getVendorPayoutAccounts(vendorId);
      expect(remaining.some((a) => a.id === kudaId)).toBe(false);

      // Also delete GTBank account so only OPay remains
      const gtbAcc = remaining.find((a) => a.accountNumber === '0129847365');
      if (gtbAcc) {
        await request(app)
          .delete(`/api/v1/vendor/payout-accounts/${gtbAcc.id}`)
          .set('Authorization', `Bearer ${vendorToken}`);
      }

      // Now only 1 account remains; attempting to delete it must fail
      const lastAccounts = db.getVendorPayoutAccounts(vendorId);
      expect(lastAccounts.length).toBe(1);

      const soleDelRes = await request(app)
        .delete(`/api/v1/vendor/payout-accounts/${lastAccounts[0].id}`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(soleDelRes.status).toBe(400);
      expect(soleDelRes.body.message).toContain('at least one');
    });
  });

  // 10. Vendor Catalog Management & Out of Stock Enforcement Suite
  describe('10. Vendor Catalog Management & Out of Stock Enforcement Suite', () => {
    let vendorToken: string;
    let buyerToken: string;

    beforeEach(async () => {
      if (!db.products.some((p) => p.id === 'prod-nike-af1')) {
        db.products.push({
          id: 'prod-nike-af1',
          campusId: 'campus-run-ede',
          vendorId: 'vendor-tunde-kicks-run',
          title: "Nike Air Force 1 '07 Low",
          description: "Fresh campus drop",
          category: "shoes",
          condition: "brand_new",
          price: 18500,
          images: ['https://example.com/shoes.jpg'],
          stockQuantity: 5,
          isActive: true,
          createdAt: new Date(),
        });
      }

      const vendorLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450002',
          password: 'unihive2026',
          role: 'vendor',
        });
      vendorToken = vendorLogin.body.data.token;

      const buyerLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450001',
          password: 'unihive2026',
          role: 'buyer',
        });
      buyerToken = buyerLogin.body.data.token;
    });

    it('PATCH /api/v1/products/:id allows vendor to update product price and stock quantity', async () => {
      const res = await request(app)
        .patch('/api/v1/products/prod-nike-af1')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          price: 19500,
          stockQuantity: 7,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(19500);
      expect(res.body.data.stockQuantity).toBe(7);
      expect(res.body.data.isActive).toBe(true);
    });

    it('POST /api/v1/products/:id/toggle-stock toggles product between in-stock and out-of-stock', async () => {
      // 1. Currently in stock with 7 units; toggle to out of stock
      const outRes = await request(app)
        .post('/api/v1/products/prod-nike-af1/toggle-stock')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(outRes.status).toBe(200);
      expect(outRes.body.data.stockQuantity).toBe(0);
      expect(outRes.body.data.isActive).toBe(false);

      // 2. Toggle back to in-stock; should restore stock
      const inRes = await request(app)
        .post('/api/v1/products/prod-nike-af1/toggle-stock')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(inRes.status).toBe(200);
      expect(inRes.body.data.stockQuantity).toBeGreaterThan(0);
      expect(inRes.body.data.isActive).toBe(true);
    });

    it('POST /api/v1/orders/create rejects purchase of an out-of-stock product with HTTP 400', async () => {
      // Add out-of-stock product fixture for this test
      db.products.push({
        id: 'prod-vintage-jersey',
        campusId: 'campus-run-ede',
        vendorId: 'vendor-tunde-kicks-run',
        title: 'Arsenal 2005/06 Highbury Farewell Maroon Jersey',
        description: 'Authentic retro classic',
        category: 'fashion',
        condition: 'clean_thrift',
        price: 16500.0,
        images: [],
        stockQuantity: 0,
        isActive: false,
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/v1/orders/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          vendorId: 'vendor-tunde-kicks-run',
          productId: 'prod-vintage-jersey',
          itemSubtotal: 16500,
          dropoffHostelId: 'hostel-run-queen-esther',
          dropoffRoom: 'Room 204',
          contactPhone: '08123450001',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('out of stock');
    });

    it('POST /api/v1/orders/create succeeds and decrements stock quantity when product is in stock', async () => {
      // Set stock of prod-nike-af1 to 3
      const updateRes = await request(app)
        .patch('/api/v1/products/prod-nike-af1')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ stockQuantity: 3 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.stockQuantity).toBe(3);

      // Buyer places order
      const orderRes = await request(app)
        .post('/api/v1/orders/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          vendorId: 'vendor-tunde-kicks-run',
          productId: 'prod-nike-af1',
          itemSubtotal: 18500,
          dropoffHostelId: 'hostel-run-queen-esther',
          dropoffRoom: 'Room 204',
          contactPhone: '08123450001',
        });

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.success).toBe(true);

      // Verify product stock decremented to 2
      const product = db.products.find((p) => p.id === 'prod-nike-af1');
      expect(product?.stockQuantity).toBe(2);
    });

    it('POST /api/v1/orders/checkout-cart successfully checks out multi-item cart and decrements stock', async () => {
      // Create second product for vendor
      const createRes = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          title: 'RUN Varsity Hoodie',
          description: 'Navy blue heavyweight hoodie',
          category: 'clothing',
          condition: 'brand_new',
          price: 12000,
          stockQuantity: 4,
        });
      expect(createRes.status).toBe(201);
      const hoodieId = createRes.body.data.id;

      // Buyer checks out cart with 2 items
      const cartRes = await request(app)
        .post('/api/v1/orders/checkout-cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          items: [
            { productId: 'prod-nike-af1', quantity: 1, selectedSize: '43' },
            { productId: hoodieId, quantity: 2, selectedSize: 'L' },
          ],
          dropoffHostelId: 'hostel-run-queen-esther',
          dropoffRoom: 'Room 312',
          contactPhone: '08123450001',
          specialInstructions: 'Drop at Queen Esther Hall ground floor porter',
        });

      expect(cartRes.status).toBe(201);
      expect(cartRes.body.success).toBe(true);
      expect(cartRes.body.data.orders.length).toBeGreaterThan(0);
      expect(cartRes.body.data.primaryOrder.buyerHandshakePin).toBeDefined();

      // Check stock decrements (seeded baseline is 5; 5 - 1 = 4)
      const shoe = db.products.find((p) => p.id === 'prod-nike-af1');
      expect(shoe?.stockQuantity).toBe(4);

      const hoodie = db.products.find((p) => p.id === hoodieId);
      expect(hoodie?.stockQuantity).toBe(2); // 4 - 2 = 2
    });

    it('POST /api/v1/orders/checkout-cart rejects checkout when cart item quantity exceeds available stock', async () => {
      const rejectRes = await request(app)
        .post('/api/v1/orders/checkout-cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          items: [
            { productId: 'prod-nike-af1', quantity: 999 }, // Far exceeds stock
          ],
          dropoffHostelId: 'hostel-run-queen-esther',
          dropoffRoom: 'Room 312',
          contactPhone: '08123450001',
        });

      expect(rejectRes.status).toBe(400);
      expect(rejectRes.body.error).toBe('CartCheckoutFailed');
    });

    it('DELETE /api/v1/products/:id removes a vendor product listing', async () => {
      // Create a temporary product to delete
      const createRes = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          title: 'Temporary Flip Flops',
          description: 'Slides for hostel bathroom',
          category: 'shoes',
          condition: 'brand_new',
          price: 1500,
          stockQuantity: 5,
        });

      expect(createRes.status).toBe(201);
      const tempId = createRes.body.data.id;

      // Delete the product
      const delRes = await request(app)
        .delete(`/api/v1/products/${tempId}`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      // Verify it is no longer in store
      const deletedProduct = db.products.find((p) => p.id === tempId);
      expect(deletedProduct).toBeUndefined();
    });

    it('POST /api/v1/products creates a listing with multi-image gallery, hostel dispatch, compareAtPrice, and variant badges', async () => {
      const testImages = [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
      ];

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          title: 'Nike Air Max 270 (Triple Red)',
          description: 'Brand new in box with extra laces and original receipt.',
          category: 'shoes',
          condition: 'brand_new',
          price: 26000,
          compareAtPrice: 32000,
          stockQuantity: 3,
          images: testImages,
          hostelName: 'Joshua Hall',
          sizeBadge: 'Size 44',
          comboBadge: 'Free Extra Laces',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.images).toEqual(testImages);
      expect(res.body.data.compareAtPrice).toBe(32000);
      expect(res.body.data.hostelName).toBe('Joshua Hall');
      expect(res.body.data.sizeBadge).toBe('Size 44');
      expect(res.body.data.comboBadge).toBe('Free Extra Laces');
      expect(res.body.data.stockQuantity).toBe(3);
      expect(res.body.data.isActive).toBe(true);
    });
  });

  // 15. Real-Time Event & Notification Broadcast Integrity
  describe('15. Real-Time Event & Notification Broadcast Integrity', () => {
    it('correctly broadcasts order:status_changed events to rooms and global bus', () => {
      const emittedEvents: Array<{ event: string; room?: string; data: any }> = [];

      // Mock Socket.IO server
      const mockIo: any = {
        to: (room: string) => ({
          emit: (event: string, data: any) => {
            emittedEvents.push({ event, room, data });
          },
        }),
        emit: (event: string, data: any) => {
          emittedEvents.push({ event, data });
        },
      };

      setSocketIO(mockIo);

      broadcastOrderStatus('RUN-4829', 'at_porter_desk', {
        courierName: 'David Runner',
        hostelName: 'Queen Esther Hall',
      });

      expect(emittedEvents.length).toBe(1);
      expect(emittedEvents[0].event).toBe('order:status_changed');
      expect(emittedEvents[0].data.status).toBe('at_porter_desk');
      expect(emittedEvents[0].data.orderNumber).toBe('RUN-4829');
      expect(emittedEvents[0].data.payload.courierName).toBe('David Runner');
    });

    it('correctly broadcasts vendor:new_notification events with payload and timestamp', () => {
      const emittedEvents: Array<{ event: string; data: any }> = [];

      const mockIo: any = {
        emit: (event: string, data: any) => {
          emittedEvents.push({ event, data });
        },
      };

      setSocketIO(mockIo);

      broadcastVendorNotification('vendor-tunde', {
        title: 'New Student Order Placed!',
        message: 'Order #RUN-9999 for Nike Air Max has been paid into escrow.',
        orderNumber: 'RUN-9999',
        amount: 26000,
      });

      expect(emittedEvents.length).toBe(1);
      expect(emittedEvents[0].event).toBe('vendor:new_notification');
      expect(emittedEvents[0].data.vendorUserId).toBe('vendor-tunde');
      expect(emittedEvents[0].data.notification.orderNumber).toBe('RUN-9999');
      expect(emittedEvents[0].data.notification.amount).toBe(26000);
      expect(emittedEvents[0].data.timestamp).toBeDefined();
    });

    it('correctly broadcasts campus dispatch events for delivery runners', () => {
      const emittedEvents: Array<{ event: string; room?: string; data: any }> = [];

      const mockIo: any = {
        to: (room: string) => ({
          emit: (event: string, data: any) => {
            emittedEvents.push({ event, room, data });
          },
        }),
        emit: (event: string, data: any) => {
          emittedEvents.push({ event, data });
        },
      };

      setSocketIO(mockIo);

      broadcastCampusDispatch('campus-run-ede', 'dispatch:available', {
        orderId: 'order-123',
        pickupHostel: 'Cafeteria A',
        deliveryHostel: 'Joshua Hall',
        bounty: 250,
      });

      expect(emittedEvents.length).toBe(1);
      expect(emittedEvents[0].event).toBe('dispatch:available');
      expect(emittedEvents[0].data.campusId).toBe('campus-run-ede');
      expect(emittedEvents[0].data.payload.bounty).toBe(250);
    });
  });

  describe('16. Campus Delivery Modes (Pickup, Evening Batch Drops & Package Tagging)', () => {
    let buyerToken: string;

    beforeEach(async () => {
      if (db.products.length === 0) {
        db.products.push({
          id: 'prod-nike-af1',
          campusId: 'campus-run-ede',
          vendorId: 'vendor-tunde-kicks-run',
          title: "Nike Air Force 1 '07 Low",
          description: "Fresh campus drop",
          category: "shoes",
          condition: "brand_new",
          price: 18500,
          images: ['https://example.com/shoes.jpg'],
          stockQuantity: 5,
          isActive: true,
          createdAt: new Date(),
        });
      }

      const buyerLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450001',
          password: 'unihive2026',
          role: 'buyer',
        });
      buyerToken = buyerLogin.body.data.token;
    });

    it('Free Ground-Floor Pickup calculates ₦0 courier fee and ₦100 tech fee', () => {
      const breakdown = EscrowService.calculateFees(8000, 'pickup', 1);
      expect(breakdown.courierDeliveryFee).toBe(0);
      expect(breakdown.platformTechFee).toBe(100);
      expect(breakdown.itemSubtotal).toBe(8000);
      expect(breakdown.totalAmount).toBe(8100);
      expect(breakdown.deliveryMode).toBe('pickup');
    });

    it('Hostel Batch Delivery calculates flat ₦500 delivery fee for pooled hostel runs', () => {
      // 1 vendor package: 500 flat
      const batch1 = EscrowService.calculateFees(5000, 'batch_evening', 1);
      expect(batch1.courierDeliveryFee).toBe(500);
      expect(batch1.totalAmount).toBe(5600);

      // 3 vendor packages: 500 flat
      const batch3 = EscrowService.calculateFees(12000, 'batch_evening', 3);
      expect(batch3.courierDeliveryFee).toBe(500);
      expect(batch3.totalAmount).toBe(12600);

      // 5 vendor packages: 500 flat
      const batch5 = EscrowService.calculateFees(25000, 'batch_evening', 5);
      expect(batch5.courierDeliveryFee).toBe(500);
      expect(batch5.totalAmount).toBe(25600);
    });

    it('Express Delivery calculates ₦1,500 for instant solo dedicated run', () => {
      const express2 = EscrowService.calculateFees(10000, 'express', 2);
      expect(express2.courierDeliveryFee).toBe(1500);
      expect(express2.totalAmount).toBe(11600);

      const express3 = EscrowService.calculateFees(15000, 'express', 3);
      expect(express3.courierDeliveryFee).toBe(1500);
    });

    it('POST /api/v1/orders/checkout-cart creates multi-vendor orders with package tags and master order number', async () => {
      // Create another active vendor and product
      const secondVendor: any = {
        id: 'vendor-secondary-test',
        userId: 'user-secondary-vendor',
        campusId: 'campus-run-ede',
        businessName: 'Campus Bookshop',
        description: 'Past questions and textbooks',
        bankName: 'Kuda Bank',
        accountNumber: '2001234567',
        accountName: 'Campus Books',
        trustScore: 4.8,
        completedOrdersCount: 15,
        isApproved: true,
      };
      db.vendorProfiles.push(secondVendor);

      const productA = db.products[0];
      const productB: any = {
        id: `prod-test-batch-${Date.now()}`,
        campusId: 'campus-run-ede',
        vendorId: 'vendor-secondary-test',
        title: 'Campus Calculus Past Questions',
        description: 'Clean past questions booklet',
        category: 'academics',
        condition: 'brand_new',
        price: 3500,
        stockQuantity: 10,
        isActive: true,
        images: ['https://example.com/pqs.jpg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.products.push(productB);

      const res = await request(app)
        .post('/api/v1/orders/checkout-cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          deliveryMode: 'batch_evening',
          dropoffHostelId: 'hostel-run-queen-esther',
          dropoffRoom: 'Room 302',
          contactPhone: '08123450001',
          items: [
            { productId: productA.id, quantity: 1 },
            { productId: productB.id, quantity: 1 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.masterOrderNumber).toBeDefined();
      expect(res.body.data.buyerHandshakePin).toBeDefined();
      expect(res.body.data.deliveryMode).toBe('batch_evening');
      expect(res.body.data.totalOrdersCount).toBe(2);

      // Verify each sub-order has a distinct package tag
      const orders = res.body.data.orders;
      expect(orders[0].order.packageTag).toContain('-A');
      expect(orders[1].order.packageTag).toContain('-B');
      expect(orders[0].buyerHandshakePin).toBe(res.body.data.buyerHandshakePin);
      expect(orders[1].buyerHandshakePin).toBe(res.body.data.buyerHandshakePin);

      // Verify overall courier fee for 2 vendor evening batch is ₦500
      expect(res.body.data.overallFees.courierDeliveryFee).toBe(500);
    });

    it('Self-Pickup orders are excluded from courier available deliveries queue', () => {
      const campusId = 'campus-run-ede';
      const availableRuns = DispatchService.getAvailableDeliveries(campusId);
      const pickupRuns = availableRuns.filter((r) => r.deliveryMode === 'pickup');
      expect(pickupRuns.length).toBe(0);
    });

    it('GET /api/v1/dispatch/stats returns real-time runner shift earnings, trip count, and bank details', async () => {
      const courierLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450003',
          password: 'unihive2026',
          role: 'courier',
        });
      const courierToken = courierLogin.body.data.token;

      // Add a test bank account for the courier runner
      await request(app)
        .post('/api/v1/dispatch/bank-account')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({
          bankName: 'Kuda Bank',
          accountNumber: '1100223344',
          accountName: 'David Adeleke',
        });

      const res = await request(app)
        .get('/api/v1/dispatch/stats')
        .set('Authorization', `Bearer ${courierToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bankAccount).toBeDefined();
      expect(res.body.data.bankAccount.bankName).toBe('Kuda Bank');
      expect(typeof res.body.data.todayEarnings).toBe('number');
      expect(typeof res.body.data.completedRunsToday).toBe('number');
      expect(typeof res.body.data.rating).toBe('number');
    });

    it('GET /api/v1/vendor/orders resolves dynamic items, itemTitle, and accurate price without 18,500 fallback', async () => {
      const vendorLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450002',
          password: 'unihive2026',
          role: 'vendor',
        });
      const vendorToken = vendorLogin.body.data.token;

      const res = await request(app)
        .get('/api/v1/vendor/orders')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      if (res.body.data.orders.length > 0) {
        const firstOrder = res.body.data.orders[0];
        expect(firstOrder.items).toBeDefined();
        expect(Array.isArray(firstOrder.items)).toBe(true);
        expect(typeof firstOrder.price).toBe('number');
        expect(typeof firstOrder.escrowTotal).toBe('number');
      }
    });

    it('PIN handshake dual-settlement releases 100% of multi-item cart funds to the vendor', async () => {
      const courierLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450003',
          password: 'unihive2026',
          role: 'courier',
        });
      const courierToken = courierLogin.body.data.token;

      const product1 = db.products[0];
      expect(product1).toBeDefined();
      
      const cartRes = await request(app)
        .post('/api/v1/orders/checkout-cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          deliveryMode: 'express',
          dropoffHostelId: 'hostel-run-queen-esther',
          dropoffRoom: 'Room 101',
          contactPhone: '08123450001',
          items: [
            { productId: product1.id, quantity: 2 },
          ],
        });

      expect(cartRes.status).toBe(201);
      const createdOrder = cartRes.body.data.primaryOrder.order;
      const handshakePin = cartRes.body.data.buyerHandshakePin;

      // Lock escrow via cryptographically signed webhook
      const ref = cartRes.body.data.primaryOrder.escrow.paystackReference;
      const webhookPayload = { reference: ref, event: 'charge.success' };
      const webhookSig = crypto
        .createHmac('sha512', CONFIG.PAYSTACK_WEBHOOK_SECRET)
        .update(JSON.stringify(webhookPayload))
        .digest('hex');

      await request(app)
        .post('/api/v1/orders/webhooks/paystack')
        .set('x-paystack-signature', webhookSig)
        .send(webhookPayload);

      // Courier claims order
      await request(app)
        .post('/api/v1/dispatch/accept')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({ orderId: createdOrder.id });

      // Milestone to porter desk
      await request(app)
        .post('/api/v1/dispatch/milestone')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({ orderId: createdOrder.id, milestone: 'at_porter_desk' });

      // Verify PIN Handshake
      const verifyRes = await request(app)
        .post('/api/v1/dispatch/verify-pin')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({ orderId: createdOrder.id, pin: handshakePin });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      // Vendor payout should settle 100% of all eligible orders in the run
      expect(verifyRes.body.data.vendorPayout.amount).toBeGreaterThanOrEqual(product1.price * 2);
    });
  });

  // ==========================================
  // SUITE 17: Security Hardening & Attack Defenses
  // ==========================================
  describe('17. Security Hardening & Penetration Attack Defenses', () => {
    it('rejects login requests when password is missing or empty', async () => {
      // Exploit attempt 1: Omit password property entirely
      const res1 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450001',
          role: 'buyer',
        });
      expect(res1.status).toBe(400);
      expect(res1.body.error).toBe('BadRequest');

      // Exploit attempt 2: Empty string password
      const res2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450001',
          password: '',
          role: 'buyer',
        });
      expect(res2.status).toBe(400);

      // Exploit attempt 3: Incorrect password
      const res3 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450001',
          password: 'wrongpassword999',
          role: 'buyer',
        });
      expect(res3.status).toBe(400);
      expect(res3.body.message).toContain('Incorrect password');
    });

    it('strictly rejects admin login using hardcoded dev code (123456) or invalid TOTP', async () => {
      // Exploit attempt: Use '123456' bypass on admin
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08123450004',
          password: 'unihive2026',
          role: 'admin',
          totpCode: '123456',
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid or expired 2FA code');
    });

    it('rejects Paystack webhook requests with missing or forged cryptographic signatures', async () => {
      const payload = { reference: 'ref_spoof_attempt_999' };

      // Exploit attempt 1: No signature header
      const res1 = await request(app)
        .post('/api/v1/orders/webhooks/paystack')
        .send(payload);
      expect(res1.status).toBe(401);
      expect(res1.body.error).toBe('UnauthorizedWebhook');

      // Exploit attempt 2: Forged / invalid signature
      const res2 = await request(app)
        .post('/api/v1/orders/webhooks/paystack')
        .set('x-paystack-signature', '0000000000000000000000000000000000000000000000000000000000000000')
        .send(payload);
      expect(res2.status).toBe(401);
      expect(res2.body.error).toBe('UnauthorizedWebhook');
    });

    it('blocks IDOR attempts on order tracking from unauthorized students', async () => {
      // Generate token for an unauthorized student
      const attackerUser = {
        id: 'user-unauthorized-student-99',
        campusId: 'campus-run-ede',
        fullName: 'Snooping Student',
        email: 'snoop@run.edu.ng',
        phone: '08199998888',
        roles: ['buyer'],
      };
      db.users.push(attackerUser as any);
      const attackerToken = AuthService.generateToken(attackerUser as any);

      // Attempt to inspect Folake's order #RUN-4829
      const res = await request(app)
        .get('/api/v1/orders/order-run-4829/tracking')
        .set('Authorization', `Bearer ${attackerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
      expect(res.body.message).toContain('AccessDenied');
    });

    it('blocks unauthorized users and unassigned couriers from verifying handshake PINs', async () => {
      // Create a rogue student courier not assigned to this delivery
      const rogueUser = {
        id: 'user-rogue-courier-99',
        campusId: 'campus-run-ede',
        fullName: 'Rogue Courier',
        email: 'rogue@run.edu.ng',
        phone: '08055554444',
        roles: ['courier'],
      };
      db.users.push(rogueUser as any);
      const rogueToken = AuthService.generateToken(rogueUser as any);

      // Rogue courier tries to verify PIN for order assigned to David Adeleke
      const res = await request(app)
        .post('/api/v1/dispatch/verify-pin')
        .set('Authorization', `Bearer ${rogueToken}`)
        .send({
          orderId: 'order-run-4829',
          pin: '4829',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
      expect(res.body.message).toContain('UnauthorizedVerifier');
    });

    it('rejects email verification using backdoor code 123456', async () => {
      // Request verification OTP
      await request(app)
        .post('/api/v1/auth/send-email-otp')
        .send({
          email: 'hacker.student@run.edu.ng',
          matricNumber: 'RUN/IFT/22/13182',
        });

      // Attempt to verify with 123456
      const res = await request(app)
        .post('/api/v1/auth/verify-email-otp')
        .send({
          email: 'hacker.student@run.edu.ng',
          code: '123456',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Incorrect 6-digit verification code');
    });
  });

  // ==========================================
  // SUITE 18: Redeemer's University (RUN) Accounts & Demo Paystack Escrow
  // ==========================================
  describe("18. Redeemer's University (RUN) Flagship Accounts & Demo Paystack Mode", () => {
    it("successfully authenticates RUN fake Buyer using both email and formatted phone", async () => {
      // 1. Login with email
      const emailRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: 'buyer@run.edu.ng',
          password: 'unihive2026',
          role: 'buyer',
        });
      expect(emailRes.status).toBe(200);
      expect(emailRes.body.data.user.email).toBe('buyer@run.edu.ng');

      // 2. Login with formatted phone with spaces
      const phoneRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '0812 345 0001',
          password: 'unihive2026',
          role: 'buyer',
        });
      expect(phoneRes.status).toBe(200);
      expect(phoneRes.body.data.user.phone).toBe('08123450001');
    });

    it("successfully authenticates RUN fake Vendor and links subaccount", async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: 'vendor@run.edu.ng',
          password: 'unihive2026',
          role: 'vendor',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('vendor@run.edu.ng');
      expect(res.body.data.vendorProfile).toBeDefined();
      expect(res.body.data.vendorProfile.businessName).toContain('Tunde Kicks');
    });

    it("successfully authenticates RUN fake Courier with verified student rating", async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: 'courier@run.edu.ng',
          password: 'unihive2026',
          role: 'courier',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('courier@run.edu.ng');
      expect(res.body.data.courierProfile).toBeDefined();
      expect(res.body.data.courierProfile.rating).toBe(0);
    });

    it("executes Demo Paystack Escrow Checkout and atomically secures funds in escrow", async () => {
      // Login as RUN buyer
      const buyerRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: 'buyer@run.edu.ng',
          password: 'unihive2026',
          role: 'buyer',
        });
      const buyerToken = buyerRes.body.data.token;

      // Find or create RUN product for escrow checkout test
      let product = db.products.find((p) => p.campusId === 'campus-run-ede');
      if (!product) {
        product = {
          id: 'prod-run-test-escrow',
          campusId: 'campus-run-ede',
          vendorId: 'vendor-tunde-kicks-run',
          title: "Nike Air Force 1 '07 Low",
          description: "Fresh campus drop",
          category: "shoes",
          condition: "brand_new",
          price: 18500,
          images: ['https://example.com/shoes.jpg'],
          stockQuantity: 5,
          isActive: true,
          createdAt: new Date(),
        };
        db.products.push(product);
      }
      expect(product).toBeDefined();

      // Create order
      const orderRes = await request(app)
        .post('/api/v1/orders/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .set('x-campus-id', 'campus-run-ede')
        .send({
          productId: product.id,
          vendorId: product.vendorId,
          itemSubtotal: product.price,
          dropoffHostelId: 'hostel-run-queen-esther',
          dropoffRoom: 'Room 204',
          contactPhone: '08123450001',
          specialInstructions: 'Ground-floor porter lodge drop-off',
          deliveryMethod: 'courier_runner',
        });
      expect(orderRes.status).toBe(201);
      const paystackRef = orderRes.body.data.escrow.paystackReference;

      // Execute Demo Paystack Checkout
      const demoPayRes = await request(app)
        .post('/api/v1/orders/paystack/demo-checkout')
        .send({
          reference: paystackRef,
          channel: 'card',
          customerEmail: 'buyer@run.edu.ng',
        });
      expect(demoPayRes.status).toBe(200);
      expect(demoPayRes.body.success).toBe(true);
      expect(demoPayRes.body.data.gatewayResponse).toContain('Approved (Demo Paystack Escrow)');

      // Verify order status updated to escrow_locked
      const escrow = db.escrows.find((e) => e.paystackReference === paystackRef);
      expect(escrow?.paystackPaymentStatus).toBe('held_in_escrow');
    });
  });

  // ==========================================
  // SUITE 19: Courier Bank Account Linking & Post-Delivery Buyer Ratings
  // ==========================================
  describe("19. Courier Bank Account Linking & Post-Delivery Buyer Ratings", () => {
    it("allows courier to add up to 2 payout bank accounts and strictly rejects a 3rd", async () => {
      const courierRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: 'courier@run.edu.ng',
          password: 'unihive2026',
          role: 'courier',
        });
      const courierToken = courierRes.body.data.token;

      // Add 1st bank account
      const res1 = await request(app)
        .post('/api/v1/dispatch/bank-account')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({
          bankName: 'Kuda Bank',
          accountNumber: '1100223344',
          accountName: 'David Adeleke',
        });
      expect(res1.status).toBe(201);
      expect(res1.body.success).toBe(true);
      expect(res1.body.bankAccounts.length).toBe(1);
      expect(res1.body.bankAccounts[0].isPrimary).toBe(true);

      // Add 2nd bank account
      const res2 = await request(app)
        .post('/api/v1/dispatch/bank-account')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({
          bankName: 'Moniepoint Microfinance Bank',
          accountNumber: '8877665544',
          accountName: 'David Adeleke Logistics',
        });
      expect(res2.status).toBe(201);
      expect(res2.body.bankAccounts.length).toBe(2);

      // Attempt 3rd bank account (must be strictly rejected with HTTP 400)
      const res3 = await request(app)
        .post('/api/v1/dispatch/bank-account')
        .set('Authorization', `Bearer ${courierToken}`)
        .send({
          bankName: 'OPay Digital Services',
          accountNumber: '9988776655',
          accountName: 'David Adeleke OPay',
        });
      expect(res3.status).toBe(400);
      expect(res3.body.message).toContain('Maximum of 2 payout bank accounts');
    });

    it("allows buyer to rate courier after successful delivery and updates courier average rating", async () => {
      const buyerRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: 'buyer@run.edu.ng',
          password: 'unihive2026',
          role: 'buyer',
        });
      const buyerToken = buyerRes.body.data.token;

      // Rate courier 5 stars
      const rateRes = await request(app)
        .post('/api/v1/dispatch/rate')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: 'order-run-4820',
          rating: 5,
          comment: 'Super fast delivery to Joshua Hall!',
        });
      expect(rateRes.status).toBe(200);
      expect(rateRes.body.success).toBe(true);
      expect(rateRes.body.data.rating).toBe(5);
      expect(rateRes.body.data.ratingCount).toBe(1);
    });
  });

  // 19. Contracted Logistics Fleet Partner & WhatsApp Provisioning Suite
  describe('19. Contracted Logistics Fleet Partner & WhatsApp Provisioning Suite', () => {
    let adminToken: string;

    beforeAll(async () => {
      const totpRes = await request(app).get('/api/v1/auth/demo-totp');
      const validCode = totpRes.body.totp;

      const adminRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: 'admin@run.edu.ng',
          password: 'unihive2026',
          role: 'admin',
          totpCode: validCode,
        });

      adminToken = adminRes.body.data.token;
    });

    it('successfully provisions a new partner fleet runner and generates WhatsApp credentials', async () => {
      const res = await request(app)
        .post('/api/v1/admin/couriers/provision')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Kolawole Emmanuel',
          whatsappPhone: '08155554444',
          baseHostelId: 'hostel-run-joshua',
          campusId: 'campus-run-ede',
          customPassword: 'RUN-SWIFT-9911',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.fullName).toBe('Kolawole Emmanuel');
      expect(res.body.data.user.roles).toContain('courier');
      expect(res.body.data.courierProfile.isApproved).toBe(true);
      expect(res.body.data.credentials.phone).toBe('08155554444');
      expect(res.body.data.credentials.plainPassword).toBe('RUN-SWIFT-9911');
      expect(res.body.data.credentials.whatsappLink).toContain('https://wa.me/2348155554444');
      expect(res.body.data.credentials.welcomeMessage).toContain('Kolawole Emmanuel');
    });

    it('allows the newly provisioned fleet runner to log in immediately with phone and password', async () => {
      // Provision runner
      await request(app)
        .post('/api/v1/admin/couriers/provision')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Kolawole Emmanuel',
          whatsappPhone: '08155554444',
          baseHostelId: 'hostel-run-joshua',
          campusId: 'campus-run-ede',
          customPassword: 'RUN-SWIFT-9911',
        });

      // Attempt immediate login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phoneOrEmail: '08155554444',
          password: 'RUN-SWIFT-9911',
          role: 'courier',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeDefined();
      expect(loginRes.body.data.activeRole).toBe('courier');
      expect(loginRes.body.data.user.roles).toContain('courier');
      expect(loginRes.body.data.courierProfile.isApproved).toBe(true);
    });
  });
});





