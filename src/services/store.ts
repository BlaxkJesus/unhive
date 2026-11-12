// UniHive In-Memory Store synced with SQLite
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';

export interface CampusEntity {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  status: 'active' | 'waitlist' | 'suspended';
  currency: string;
}

export interface HostelEntity {
  id: string;
  campusId: string;
  name: string;
  gender: 'female' | 'male' | 'coed';
  porterLodgeName: string;
  porterPhone: string;
  isActive: boolean;
}

export interface UserEntity {
  id: string;
  campusId: string;
  fullName: string;
  email: string;
  phone: string;
  matricNumber?: string;
  hostelId?: string;
  roomNumber?: string;
  passwordHash: string;
  roles: string[];
  isPhoneVerified: boolean;
  isSuspended: boolean;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

export interface VendorProfileEntity {
  id: string;
  userId: string;
  campusId: string;
  businessName: string;
  description: string;
  logoUrl?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  paystackSubaccountCode?: string;
  trustScore: number;
  completedOrdersCount: number;
  isApproved: boolean;
}

export interface VendorPayoutAccountEntity {
  id: string;
  vendorId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface CourierProfileEntity {
  id: string;
  userId: string;
  campusId: string;
  matricNumber: string;
  studentIdUrl: string;
  baseHostelId: string;
  hostelId?: string;
  status: 'available' | 'on_delivery' | 'offline';
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankAccounts?: Array<{
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isPrimary?: boolean;
    createdAt?: string;
  }>;
  paystackRecipientCode?: string;
  totalTripsCompleted: number;
  rating: number;
  ratingCount?: number;
  isApproved: boolean;
  currentHostelLocation?: string;
}

export interface ProductEntity {
  id: string;
  campusId: string;
  vendorId: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  imageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  hostelName?: string;
  sizeBadge?: string;
  comboBadge?: string;
}

export interface OrderEscrowEntity {
  id: string;
  orderId: string;
  itemSubtotal: number;
  platformTechFee: number;
  courierDeliveryFee: number;
  totalAmount: number;
  deliveryMode?: string;
  paystackReference: string;
  paystackPaymentStatus: 'unpaid' | 'held_in_escrow' | 'settled' | 'refunded';
  handshakePinHash: string;
  plainPinForDev?: string;
  pinAttemptsCount: number;
  pinLockedAt?: Date;
  pinVerifiedAt?: Date;
  settledAt?: Date;
  createdAt: Date;
}

export interface OrderItemEntity {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  subtotal?: number;
  selectedSize?: string;
  selectedCombo?: string;
  imageUrl?: string;
  vendorName?: string;
  pickupHostel?: string;
  isPickedUp?: boolean;
  pickedUpAt?: Date;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  campusId: string;
  buyerId: string;
  vendorId: string;
  courierId?: string;
  subtotal?: number;
  status:
  | 'order_placed'
  | 'pending_payment'
  | 'escrow_locked'
  | 'vendor_preparing'
  | 'in_transit'
  | 'at_porter_desk'
  | 'inspected_completed'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'refunded';
  deliveryMethod: 'courier_runner' | 'vendor_self';
  deliveryMode?: 'pickup' | 'batch_evening' | 'express';
  packageTag?: string;
  masterOrderNumber?: string;
  items?: OrderItemEntity[];
  dropoffHostelId: string;
  dropoffRoom: string;
  contactPhone: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutTransactionEntity {
  id: string;
  orderId: string;
  recipientType: 'vendor' | 'courier' | 'platform';
  recipientUserId?: string;
  amount: number;
  paystackTransferCode: string;
  status: 'queued' | 'success' | 'failed';
  transferredAt: Date;
}

export interface OrderDisputeEntity {
  id: string;
  orderId: string;
  raisedByUserId: string;
  reason: string;
  status: 'open' | 'under_review' | 'refunded' | 'released_to_vendor';
  adminId?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  category?: 'pin_lockout' | 'wrong_item' | 'item_defect' | 'missing_item' | 'unfulfilled';
  evidenceUrls?: string[];
  buyerStatement?: string;
  merchantStatement?: string;
  courierNotes?: string;
}

/**
 * In-Memory & Seeded Repository for UniHive
 * Guarantees zero external dependency runtime for developer testing
 * while matching Prisma schema 1:1.
 */
export type NotificationType = 'in_transit' | 'at_porter_desk' | 'completed' | 'refunded' | 'general';

export interface NotificationEntity {
  id: string;
  userId: string;
  recipientEmail?: string;
  orderId?: string;
  orderNumber?: string;
  type: NotificationType;
  title: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  targetRole?: 'buyer' | 'vendor' | 'courier' | 'admin' | 'all';
  metadata?: Record<string, any>;
  createdAt: Date;
  isRead: boolean;
}

export interface EmailVerificationOtp {
  email: string;
  matricNumber: string;
  code: string;
  expiresAt: Date;
  isVerified: boolean;
  createdAt: Date;
}

export class UniHiveStore {
  campuses: CampusEntity[] = [];
  hostels: HostelEntity[] = [];
  users: UserEntity[] = [];
  vendorProfiles: VendorProfileEntity[] = [];
  courierProfiles: CourierProfileEntity[] = [];
  products: ProductEntity[] = [];
  orders: OrderEntity[] = [];
  escrows: OrderEscrowEntity[] = [];
  payouts: PayoutTransactionEntity[] = [];
  disputes: OrderDisputeEntity[] = [];
  notifications: NotificationEntity[] = [];
  verificationOtps: EmailVerificationOtp[] = [];
  vendorPayoutAccounts: VendorPayoutAccountEntity[] = [];

  constructor() {
    this.seedDefaultData();
  }

  seedDefaultData() {
    this.notifications = [];
    this.disputes = [];

    // 1. Campuses (Flagship: Redeemer's University, Ede)
    const runId = 'campus-run-ede';
    const bowenId = 'campus-bowen-iwo';
    const babcockId = 'campus-babcock-ilishan';
    const abuadId = 'campus-abuad-ado';
    const pauId = 'campus-pau-lagos';

    this.campuses = [
      {
        id: runId,
        slug: 'run-ede',
        name: "Redeemer's University",
        shortName: 'RUN',
        city: 'Ede',
        state: 'Osun State',
        status: 'active',
        currency: 'NGN',
      },
      {
        id: bowenId,
        slug: 'bowen-iwo',
        name: 'Bowen University',
        shortName: 'Bowen',
        city: 'Iwo',
        state: 'Osun State',
        status: 'waitlist',
        currency: 'NGN',
      },
      {
        id: babcockId,
        slug: 'babcock-ilishan',
        name: 'Babcock University',
        shortName: 'Babcock',
        city: 'Ilishan-Remo',
        state: 'Ogun State',
        status: 'waitlist',
        currency: 'NGN',
      },
      {
        id: abuadId,
        slug: 'abuad-ado',
        name: 'Afe Babalola University (ABUAD)',
        shortName: 'ABUAD',
        city: 'Ado-Ekiti',
        state: 'Ekiti State',
        status: 'waitlist',
        currency: 'NGN',
      },
      {
        id: pauId,
        slug: 'pau-lagos',
        name: 'Pan-Atlantic University',
        shortName: 'PAU',
        city: 'Ibeju-Lekki',
        state: 'Lagos State',
        status: 'waitlist',
        currency: 'NGN',
      },
    ];

    // 2. Redeemer's University (RUN) Hostels
    const queenEstherId = 'hostel-run-queen-esther';
    const deborahId = 'hostel-run-deborah';
    const guestHouseId = 'hostel-run-guest-house';
    const dorcasId = 'hostel-run-dorcas';

    const prophetMosesId = 'hostel-run-prophet-moses';
    const joshuaId = 'hostel-run-joshua';
    const peterId = 'hostel-run-peter';

    this.hostels = [
      // Female Hostels
      {
        id: queenEstherId,
        campusId: runId,
        name: 'Queen Esther Hall',
        gender: 'female',
        porterLodgeName: 'Queen Esther Ground Floor Porter Reception',
        porterPhone: '08031234567',
        isActive: true,
      },
      {
        id: deborahId,
        campusId: runId,
        name: 'Deborah Hall',
        gender: 'female',
        porterLodgeName: 'Deborah Ground Floor Porter Reception',
        porterPhone: '08031234568',
        isActive: true,
      },
      {
        id: guestHouseId,
        campusId: runId,
        name: 'Guest House',
        gender: 'female',
        porterLodgeName: 'Guest House Reception & Porter Desk',
        porterPhone: '08031234570',
        isActive: true,
      },
      {
        id: dorcasId,
        campusId: runId,
        name: 'Dorcas Hall',
        gender: 'female',
        porterLodgeName: 'Dorcas Ground Floor Porter Reception',
        porterPhone: '08031234569',
        isActive: true,
      },
      // Male Hostels
      {
        id: prophetMosesId,
        campusId: runId,
        name: 'Prophet Moses Hall',
        gender: 'male',
        porterLodgeName: 'Prophet Moses Security & Porter Desk',
        porterPhone: '08037654321',
        isActive: true,
      },
      {
        id: joshuaId,
        campusId: runId,
        name: 'Joshua Hall',
        gender: 'male',
        porterLodgeName: 'Joshua Hall Ground Floor Porter Desk',
        porterPhone: '08037654322',
        isActive: true,
      },
      {
        id: peterId,
        campusId: runId,
        name: 'Peter Hostel',
        gender: 'male',
        porterLodgeName: 'Peter Hostel Central Porter Office',
        porterPhone: '08039988776',
        isActive: true,
      },
    ];

    // Default password hash for "unihive2026"
    const defaultPasswordHash = bcrypt.hashSync('unihive2026', 8);

    // 3. Pre-provisioned Seed Users (RUN Flagship)
    const buyerUserIdRun = 'user-run-buyer-1';
    const vendorUserIdRun = 'user-run-vendor-1';
    const courierUserIdRun = 'user-run-courier-1';
    const adminUserIdRun = 'user-run-admin-1';

    this.users = [
      {
        id: buyerUserIdRun,
        campusId: runId,
        fullName: 'Folake Adebayo',
        email: 'buyer@run.edu.ng',
        phone: '08123450001',
        matricNumber: 'RUN/IFT/22/13182',
        hostelId: queenEstherId,
        roomNumber: 'Room 204',
        passwordHash: defaultPasswordHash,
        roles: ['buyer'],
        isPhoneVerified: true,
        isSuspended: false,
        twoFactorEnabled: false,
        createdAt: new Date(),
      },
      {
        id: vendorUserIdRun,
        campusId: runId,
        fullName: 'Tunde Babalola',
        email: 'vendor@run.edu.ng',
        phone: '08123450002',
        matricNumber: 'RUN/2022/ECN/102',
        hostelId: prophetMosesId,
        roomNumber: 'Room 112',
        passwordHash: defaultPasswordHash,
        roles: ['buyer', 'vendor'],
        isPhoneVerified: true,
        isSuspended: false,
        twoFactorEnabled: false,
        createdAt: new Date(),
      },
      {
        id: courierUserIdRun,
        campusId: runId,
        fullName: 'David Adeleke',
        email: 'courier@run.edu.ng',
        phone: '08123450003',
        matricNumber: 'RUN/2023/LAW/054',
        hostelId: joshuaId,
        roomNumber: 'Room 305',
        passwordHash: defaultPasswordHash,
        roles: ['buyer', 'courier'],
        isPhoneVerified: true,
        isSuspended: false,
        twoFactorEnabled: false,
        createdAt: new Date(),
      },
      {
        id: adminUserIdRun,
        campusId: runId,
        fullName: 'Chief Proctor O. Adeleke',
        email: 'admin@run.edu.ng',
        phone: '08123450004',
        matricNumber: 'STAFF/RUN/SEC/001',
        passwordHash: defaultPasswordHash,
        roles: ['admin'],
        isPhoneVerified: true,
        isSuspended: false,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: true,
        createdAt: new Date(),
      },
    ];

    // 4. Vendor Profiles
    const vendorProfileIdRun = 'vendor-tunde-kicks-run';

    this.vendorProfiles = [
      {
        id: vendorProfileIdRun,
        userId: vendorUserIdRun,
        campusId: runId,
        businessName: 'Tunde Kicks & Thrift',
        description: 'Quality sneakers, slides & vintage jerseys delivered to your hostel.',
        bankName: 'OPay Digital Services',
        accountNumber: '8123450002',
        accountName: 'Tunde Babalola Kicks',
        paystackSubaccountCode: 'ACCT_tundekicks99_run',
        trustScore: 4.95,
        completedOrdersCount: 0,
        isApproved: true,
      },
    ];

    // 4.1 Vendor Payout Accounts: Tunde Kicks
    this.vendorPayoutAccounts = [
      {
        id: 'payout-acc-opay-run',
        vendorId: vendorProfileIdRun,
        bankName: 'OPay Digital Services',
        bankCode: '999992',
        accountNumber: '8123450002',
        accountName: 'Tunde Babalola Kicks',
        isPrimary: true,
        createdAt: new Date(),
      },
      {
        id: 'payout-acc-gtb-run',
        vendorId: vendorProfileIdRun,
        bankName: 'Guaranty Trust Bank (GTBank)',
        bankCode: '058',
        accountNumber: '0129847365',
        accountName: 'Tunde Babalola Kicks',
        isPrimary: false,
        createdAt: new Date(),
      },
    ];

    // 5. Courier Profiles (Fresh with 0 ratings and no dummy accounts)
    const courierProfileIdRun = 'courier-david-runner-run';

    this.courierProfiles = [
      {
        id: courierProfileIdRun,
        userId: courierUserIdRun,
        campusId: runId,
        matricNumber: 'RUN/2023/LAW/054',
        studentIdUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
        baseHostelId: joshuaId,
        status: 'available',
        bankName: '',
        accountNumber: '',
        accountName: '',
        bankAccounts: [],
        totalTripsCompleted: 0,
        rating: 0,
        ratingCount: 0,
        isApproved: true,
        currentHostelLocation: 'Joshua Hall',
      },
    ];

    // 6. Products Catalog: Cleared - Zero dummy products for fresh stock control
    this.products = [];

    // All runtime collections start 100% empty
    this.orders = [];
    this.escrows = [];
    this.payouts = [];
    this.disputes = [];
    this.notifications = [];
  }

  /**
   * Loads persisted data from SQLite via Prisma into memory
   */
  async loadFromDatabase() {
    try {
      if (process.env.NODE_ENV !== 'test') {
        try {
          await prisma.campus.deleteMany({
            where: {
              OR: [
                { id: { contains: 'acu' } },
                { slug: { contains: 'acu' } },
                { name: { contains: 'Ajayi' } },
              ],
            },
          });
          await prisma.hostel.deleteMany({
            where: {
              OR: [
                { id: { contains: 'acu' } },
                { campusId: { contains: 'acu' } },
                { name: { in: ['Daniel Hall', 'Joseph Hall'] } },
                { id: { in: ['hostel-run-daniel', 'hostel-run-joseph'] } },
              ],
            },
          });
        } catch (_) { }
      }

      const [
        dbCampuses,
        dbHostels,
        dbUsers,
        dbVendors,
        dbCouriers,
        dbProducts,
        dbOrders,
        dbEscrows,
        dbPayouts,
        dbDisputes,
      ] = await Promise.all([
        prisma.campus.findMany(),
        prisma.hostel.findMany(),
        prisma.user.findMany(),
        prisma.vendorProfile.findMany(),
        prisma.courierProfile.findMany(),
        prisma.product.findMany(),
        prisma.order.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.orderEscrow.findMany(),
        prisma.payoutTransaction.findMany(),
        prisma.orderDispute.findMany({ orderBy: { createdAt: 'desc' } }),
      ]);

      if (dbCampuses.length > 0) {
        const filteredDbCampuses = (dbCampuses as any[]).filter(
          (c) => !c.id.includes('acu') && !c.name.toLowerCase().includes('ajayi') && !c.slug.includes('acu')
        );
        const seedCampusesNotInDb = this.campuses.filter(
          (sc) => !filteredDbCampuses.some((lc) => lc.id === sc.id)
        );
        this.campuses = [...filteredDbCampuses, ...seedCampusesNotInDb];
        this.campuses.sort((a, b) => (a.id === 'campus-run-ede' ? -1 : b.id === 'campus-run-ede' ? 1 : 0));

        const validRunHostelNames = [
          'Queen Esther Hall',
          'Deborah Hall',
          'Guest House',
          'Dorcas Hall',
          'Prophet Moses Hall',
          'Joshua Hall',
          'Peter Hostel',
        ];

        const filteredDbHostels = (dbHostels as any[]).filter(
          (h) => h.campusId === 'campus-run-ede' && validRunHostelNames.includes(h.name)
        );
        const seedHostelsNotInDb = this.hostels.filter(
          (sh) => validRunHostelNames.includes(sh.name) && !filteredDbHostels.some((lh) => lh.id === sh.id)
        );
        this.hostels = [...filteredDbHostels, ...seedHostelsNotInDb].filter((h) => validRunHostelNames.includes(h.name));

        const loadedUsers = dbUsers.map((u) => ({
          ...u,
          roles: typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles,
        })) as any;
        const seedUsersNotInDb = this.users.filter(
          (su) => !loadedUsers.some((lu: any) => lu.id === su.id || (su.email && lu.email === su.email))
        );
        this.users = [...loadedUsers, ...seedUsersNotInDb];

        const seedVendorsNotInDb = this.vendorProfiles.filter(
          (sv) => !(dbVendors as any[]).some((lv) => lv.id === sv.id || lv.userId === sv.userId)
        );
        this.vendorProfiles = [...(dbVendors as any), ...seedVendorsNotInDb];

        const seedCouriersNotInDb = this.courierProfiles.filter(
          (sc) => !(dbCouriers as any[]).some((lc) => lc.id === sc.id || lc.userId === sc.userId)
        );
        this.courierProfiles = [...(dbCouriers as any), ...seedCouriersNotInDb].map((c) => ({
          ...c,
          rating: (c.ratingCount && c.ratingCount > 0) ? c.rating : 0,
          ratingCount: c.ratingCount || 0,
          bankAccounts: c.bankAccounts || [],
          bankName: c.bankAccounts?.[0]?.bankName || '',
          accountNumber: c.bankAccounts?.[0]?.accountNumber || '',
          accountName: c.bankAccounts?.[0]?.accountName || '',
          totalTripsCompleted: c.totalTripsCompleted || 0,
        }));

        // Purge dummy seed products so vendor campus inventory & stock control begins at zero
        this.products = [];

        this.orders = (dbOrders as any[]).map((o) => {
          const matchingEscrow = (dbEscrows as any[]).find((e) => e.orderId === o.id);
          if (matchingEscrow && matchingEscrow.paystackPaymentStatus === 'settled' && o.status !== 'inspected_completed') {
            return { ...o, status: 'inspected_completed' };
          }
          return o;
        }) as any;
        this.escrows = dbEscrows as any;
        this.payouts = dbPayouts as any;
        this.disputes = dbDisputes as any;

        console.log(
          `[Store] Synced from SQLite: ${this.campuses.length} campuses, ${this.users.length} users, ${this.orders.length} orders, ${this.products.length} products`
        );
      } else {
        console.log('[Store] SQLite is empty, running in-memory seed baseline');
      }

      if (process.env.NODE_ENV !== 'test') {
        this.seedDemoDisputesIfEmpty();
      }
    } catch (err) {
      console.warn('[Store] Database load skipped / using seed fallback:', err);
      if (process.env.NODE_ENV !== 'test') {
        this.seedDemoDisputesIfEmpty();
      }
    }
  }

  seedDemoDisputesIfEmpty() {
    if (this.disputes.length > 0) return;

    const runCampus = this.campuses.find((c) => c.slug === 'run-ede') || this.campuses[0];
    const buyer = this.users.find((u) => u.roles.includes('buyer')) || this.users[0];
    const vendor = this.vendorProfiles[0];
    const courier = this.courierProfiles[0];
    const joshuaHall = this.hostels.find((h) => h.name.includes('Joshua')) || this.hostels[0];
    const queenEstherHall = this.hostels.find((h) => h.name.includes('Queen Esther')) || this.hostels[1] || this.hostels[0];

    if (!runCampus || !buyer || !vendor || !courier) return;

    // Case 1: Wrong Shoe Size / Physical Inspection Dispute
    const order1Id = 'order-demo-dispute-1';
    if (!this.orders.some((o) => o.id === order1Id)) {
      this.orders.push({
        id: order1Id,
        orderNumber: 'RUN-4812',
        campusId: runCampus.id,
        buyerId: buyer.id,
        vendorId: vendor.id,
        courierId: courier.id,
        status: 'disputed',
        deliveryMethod: 'courier_runner',
        deliveryMode: 'batch_evening',
        packageTag: 'RUN-PKG-4812',
        dropoffHostelId: joshuaHall.id,
        dropoffRoom: 'Room 214',
        contactPhone: buyer.phone || '08123450001',
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
        updatedAt: new Date(Date.now() - 45 * 60 * 1000),
        items: [
          {
            productId: 'prod-nike-af1',
            title: 'Nike Air Jordan 4 Retro (Black/Cement)',
            quantity: 1,
            price: 24000,
            selectedSize: 'EU 44 (Ordered)',
            imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800',
            vendorName: vendor.businessName,
          },
        ],
      });

      this.escrows.push({
        id: 'escrow-demo-dispute-1',
        orderId: order1Id,
        itemSubtotal: 24000,
        courierDeliveryFee: 250,
        platformTechFee: 100,
        totalAmount: 24350,
        paystackReference: 'ref-demo-dispute-1',
        paystackPaymentStatus: 'held_in_escrow',
        handshakePinHash: '$2a$08$demoPinHashLocked123',
        pinAttemptsCount: 3,
        pinLockedAt: new Date(Date.now() - 45 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      });

      this.disputes.push({
        id: 'dispute-demo-4812',
        orderId: order1Id,
        raisedByUserId: buyer.id,
        category: 'wrong_item',
        reason: 'Buyer at Joshua Hall desk refused delivery: "Box has size 41 instead of size 44 advertised."',
        buyerStatement: 'I ordered size 44. I inspected the sneakers at Joshua Hall reception with the student runner present, and the inside label reads US 8 (EU 41). The shoe cannot fit me.',
        merchantStatement: 'Apologies from Tunde Kicks warehouse. The shelf picker boxed EU 41 by mistake. We have EU 44 available or accept full proctor refund.',
        courierNotes: 'Item is held safely at Joshua Hall Ground-Floor Porter Lodge in package RUN-PKG-4812. Student refused inspection handshake.',
        evidenceUrls: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800'],
        status: 'open',
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      });
    }

    // Case 2: 3-Attempt PIN Lockout at Porter Lodge
    const order2Id = 'order-demo-dispute-2';
    if (!this.orders.some((o) => o.id === order2Id)) {
      this.orders.push({
        id: order2Id,
        orderNumber: 'RUN-3990',
        campusId: runCampus.id,
        buyerId: buyer.id,
        vendorId: vendor.id,
        courierId: courier.id,
        status: 'disputed',
        deliveryMethod: 'courier_runner',
        deliveryMode: 'express',
        packageTag: 'RUN-PKG-3990',
        dropoffHostelId: queenEstherHall.id,
        dropoffRoom: 'Room 108',
        contactPhone: buyer.phone || '08123450001',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        updatedAt: new Date(Date.now() - 20 * 60 * 1000),
        items: [
          {
            productId: 'prod-oraimo-gan',
            title: 'Oraimo 65W GaN Fast Charger + 100W Cable',
            quantity: 1,
            price: 9000,
            imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
            vendorName: vendor.businessName,
          },
        ],
      });

      this.escrows.push({
        id: 'escrow-demo-dispute-2',
        orderId: order2Id,
        itemSubtotal: 9000,
        courierDeliveryFee: 250,
        platformTechFee: 100,
        totalAmount: 9350,
        paystackReference: 'ref-demo-dispute-2',
        paystackPaymentStatus: 'held_in_escrow',
        handshakePinHash: '$2a$08$demoPinHashLocked456',
        pinAttemptsCount: 3,
        pinLockedAt: new Date(Date.now() - 20 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      });

      this.disputes.push({
        id: 'dispute-demo-3990',
        orderId: order2Id,
        raisedByUserId: buyer.id,
        category: 'pin_lockout',
        reason: '3-Attempt PIN Lockout at Queen Esther Reception Desk. Escrow auto-frozen.',
        buyerStatement: 'My phone died on my way down to Queen Esther porter lodge. My friend attempted to guess my 4-digit code and triggered the security lock.',
        merchantStatement: 'Brand new in sealed box. Dispatched promptly.',
        courierNotes: 'Buyer is standing at Queen Esther desk with physical RUN student ID card verifying identity.',
        evidenceUrls: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'],
        status: 'open',
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
      });
    }
  }

  async saveOrder(order: OrderEntity, escrow?: OrderEscrowEntity) {
    if (process.env.NODE_ENV === 'test') return;
    try {
      await prisma.order.upsert({
        where: { id: order.id },
        update: {
          orderNumber: order.orderNumber,
          status: order.status,
          courierId: order.courierId,
          updatedAt: order.updatedAt || new Date(),
        },
        create: {
          id: order.id,
          orderNumber: order.orderNumber,
          campusId: order.campusId,
          buyerId: order.buyerId,
          vendorId: order.vendorId,
          courierId: order.courierId,
          status: order.status,
          deliveryMethod: order.deliveryMethod,
          dropoffHostelId: order.dropoffHostelId,
          dropoffRoom: order.dropoffRoom,
          contactPhone: order.contactPhone,
          specialInstructions: order.specialInstructions,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt || new Date(),
        },
      });

      if (escrow) {
        await prisma.orderEscrow.upsert({
          where: { orderId: escrow.orderId },
          update: {
            paystackPaymentStatus: escrow.paystackPaymentStatus,
            pinAttemptsCount: escrow.pinAttemptsCount,
            pinVerifiedAt: escrow.pinVerifiedAt,
            settledAt: escrow.settledAt,
          },
          create: {
            id: escrow.id,
            orderId: escrow.orderId,
            itemSubtotal: escrow.itemSubtotal || 0,
            platformTechFee: escrow.platformTechFee,
            courierDeliveryFee: escrow.courierDeliveryFee,
            totalAmount: escrow.totalAmount,
            paystackReference: escrow.paystackReference,
            paystackPaymentStatus: escrow.paystackPaymentStatus,
            handshakePinHash: escrow.handshakePinHash,
            plainPinForDev: escrow.plainPinForDev,
            pinAttemptsCount: escrow.pinAttemptsCount,
            createdAt: escrow.createdAt,
          },
        });
      }
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[Store] Persist order error (non-fatal):', err.message || err);
      }
    }
  }

  async saveEscrow(escrow: OrderEscrowEntity) {
    if (process.env.NODE_ENV === 'test') return;
    try {
      await prisma.orderEscrow.upsert({
        where: { orderId: escrow.orderId },
        update: {
          paystackPaymentStatus: escrow.paystackPaymentStatus,
          pinAttemptsCount: escrow.pinAttemptsCount,
          pinVerifiedAt: escrow.pinVerifiedAt,
          settledAt: escrow.settledAt,
        },
        create: {
          id: escrow.id,
          orderId: escrow.orderId,
          itemSubtotal: escrow.itemSubtotal,
          platformTechFee: escrow.platformTechFee,
          courierDeliveryFee: escrow.courierDeliveryFee,
          totalAmount: escrow.totalAmount,
          paystackReference: escrow.paystackReference,
          paystackPaymentStatus: escrow.paystackPaymentStatus,
          handshakePinHash: escrow.handshakePinHash,
          plainPinForDev: escrow.plainPinForDev,
          pinAttemptsCount: escrow.pinAttemptsCount,
          createdAt: escrow.createdAt,
        },
      });
    } catch (err) {
      console.warn('[Store] Persist escrow error (non-fatal):', err);
    }
  }

  async savePayout(payout: PayoutTransactionEntity) {
    if (process.env.NODE_ENV === 'test') return;
    try {
      await prisma.payoutTransaction.upsert({
        where: { id: payout.id },
        update: {
          status: payout.status,
          paystackTransferCode: payout.paystackTransferCode,
        },
        create: {
          id: payout.id,
          orderId: payout.orderId,
          recipientType: payout.recipientType,
          recipientUserId: payout.recipientUserId,
          amount: payout.amount || 0,
          paystackTransferCode: payout.paystackTransferCode,
          status: payout.status,
          transferredAt: payout.transferredAt,
        },
      });
    } catch (err) {
      console.warn('[Store] Persist payout error (non-fatal):', err);
    }
  }

  async saveDispute(dispute: OrderDisputeEntity) {
    if (process.env.NODE_ENV === 'test') return;
    try {
      await prisma.orderDispute.upsert({
        where: { orderId: dispute.orderId },
        update: {
          status: dispute.status,
          adminId: dispute.adminId,
          resolutionNotes: dispute.resolutionNotes,
          resolvedAt: dispute.resolvedAt,
        },
        create: {
          id: dispute.id,
          orderId: dispute.orderId,
          raisedByUserId: dispute.raisedByUserId,
          reason: dispute.reason,
          status: dispute.status,
          adminId: dispute.adminId,
          resolutionNotes: dispute.resolutionNotes,
          resolvedAt: dispute.resolvedAt,
          createdAt: dispute.createdAt,
        },
      });
    } catch (err) {
      console.warn('[Store] Persist dispute error (non-fatal):', err);
    }
  }

  async saveProduct(product: ProductEntity) {
    if (process.env.NODE_ENV === 'test') return;
    try {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          title: product.title,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: JSON.stringify(product.images),
          stockQuantity: product.stockQuantity,
          isActive: product.isActive,
        },
        create: {
          id: product.id,
          campusId: product.campusId,
          vendorId: product.vendorId,
          title: product.title,
          description: product.description,
          category: product.category,
          condition: product.condition,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: JSON.stringify(product.images),
          stockQuantity: product.stockQuantity,
          isActive: product.isActive,
          createdAt: product.createdAt,
        },
      });
    } catch (err) {
      console.warn('[Store] Persist product error (non-fatal):', err);
    }
  }

  async saveUser(user: UserEntity) {
    if (process.env.NODE_ENV === 'test') return;
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          fullName: user.fullName,
          email: user.email || null,
          phone: user.phone,
          matricNumber: user.matricNumber || null,
          hostelId: user.hostelId || null,
          roomNumber: user.roomNumber || null,
          roles: JSON.stringify(user.roles),
          isPhoneVerified: user.isPhoneVerified,
          isSuspended: user.isSuspended,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorSecret: user.twoFactorSecret || null,
        },
        create: {
          id: user.id,
          campusId: user.campusId,
          fullName: user.fullName,
          email: user.email || null,
          phone: user.phone,
          matricNumber: user.matricNumber || null,
          hostelId: user.hostelId || null,
          roomNumber: user.roomNumber || null,
          passwordHash: user.passwordHash,
          roles: JSON.stringify(user.roles),
          isPhoneVerified: user.isPhoneVerified,
          isSuspended: user.isSuspended,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorSecret: user.twoFactorSecret || null,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      console.warn('[Store] Persist user error (non-fatal):', err);
    }
  }

  async saveVendorProfile(profile: VendorProfileEntity) {
    if (process.env.NODE_ENV === 'test') return;
    try {
      await prisma.vendorProfile.upsert({
        where: { userId: profile.userId },
        update: {
          businessName: profile.businessName,
          description: profile.description || null,
          bankName: profile.bankName,
          accountNumber: profile.accountNumber,
          accountName: profile.accountName,
          isApproved: profile.isApproved,
        },
        create: {
          id: profile.id,
          userId: profile.userId,
          campusId: profile.campusId,
          businessName: profile.businessName,
          description: profile.description || null,
          bankName: profile.bankName,
          accountNumber: profile.accountNumber,
          accountName: profile.accountName,
          trustScore: profile.trustScore,
          completedOrdersCount: profile.completedOrdersCount,
          isApproved: profile.isApproved,
        },
      });
    } catch (err) {
      console.warn('[Store] Persist vendor profile error (non-fatal):', err);
    }
  }

  async saveCourierProfile(profile: CourierProfileEntity) {
    if (process.env.NODE_ENV === 'test') return;
    try {
      await prisma.courierProfile.upsert({
        where: { userId: profile.userId },
        update: {
          status: profile.status,
          isApproved: profile.isApproved,
        },
        create: {
          id: profile.id,
          userId: profile.userId,
          campusId: profile.campusId,
          matricNumber: profile.matricNumber,
          studentIdUrl: profile.studentIdUrl,
          baseHostelId: profile.baseHostelId,
          status: profile.status,
          bankName: profile.bankName,
          accountNumber: profile.accountNumber,
          accountName: profile.accountName,
          totalTripsCompleted: profile.totalTripsCompleted,
          rating: profile.rating,
          isApproved: profile.isApproved,
        },
      });
    } catch (err) {
      console.warn('[Store] Persist courier profile error (non-fatal):', err);
    }
  }

  saveEmailOtp(email: string, matricNumber: string, code: string, expiryMinutes = 10): EmailVerificationOtp {
    const normalizedEmail = email.trim().toLowerCase();
    this.verificationOtps = this.verificationOtps.filter(
      (o) => o.email.toLowerCase() !== normalizedEmail
    );

    const otp: EmailVerificationOtp = {
      email: normalizedEmail,
      matricNumber: matricNumber.trim(),
      code,
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      isVerified: false,
      createdAt: new Date(),
    };

    this.verificationOtps.push(otp);
    return otp;
  }

  verifyEmailOtp(email: string, code: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const otp = this.verificationOtps.find(
      (o) => o.email.toLowerCase() === normalizedEmail
    );

    if (!otp) {
      throw new Error('No verification code was requested for this institutional email');
    }

    if (new Date() > otp.expiresAt) {
      throw new Error('Verification code has expired. Please request a new 6-digit code');
    }

    if (otp.code !== code.trim()) {
      throw new Error('Incorrect 6-digit verification code. Please check your student inbox');
    }

    otp.isVerified = true;
    return true;
  }

  isEmailVerified(email: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const otp = this.verificationOtps.find(
      (o) => o.email.toLowerCase() === normalizedEmail && o.isVerified
    );
    return !!otp;
  }

  getVendorPayoutAccounts(vendorId: string): VendorPayoutAccountEntity[] {
    const targetVendorId = vendorId === 'vendor-tunde-kicks' ? 'vendor-tunde-kicks-run' : vendorId;
    return this.vendorPayoutAccounts.filter((a) => a.vendorId === targetVendorId);
  }

  addVendorPayoutAccount(
    vendorId: string,
    account: {
      bankName: string;
      bankCode?: string;
      accountNumber: string;
      accountName: string;
      isPrimary?: boolean;
    }
  ): VendorPayoutAccountEntity {
    const targetVendorId = vendorId === 'vendor-tunde-kicks' ? 'vendor-tunde-kicks-run' : vendorId;
    const existing = this.getVendorPayoutAccounts(targetVendorId);
    const isFirstAccount = existing.length === 0;
    const shouldBePrimary = isFirstAccount || !!account.isPrimary;

    if (shouldBePrimary) {
      this.vendorPayoutAccounts.forEach((a) => {
        if (a.vendorId === targetVendorId) a.isPrimary = false;
      });
    }

    const newAccount: VendorPayoutAccountEntity = {
      id: `payout-acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      vendorId: targetVendorId,
      bankName: account.bankName.trim(),
      bankCode: account.bankCode?.trim() || '000',
      accountNumber: account.accountNumber.trim(),
      accountName: account.accountName.trim(),
      isPrimary: shouldBePrimary,
      createdAt: new Date(),
    };

    this.vendorPayoutAccounts.push(newAccount);

    // Keep vendorProfile in sync with active primary account
    if (shouldBePrimary) {
      const vendor = this.vendorProfiles.find((v) => v.id === targetVendorId || v.id === vendorId);
      if (vendor) {
        vendor.bankName = newAccount.bankName;
        vendor.accountNumber = newAccount.accountNumber;
        vendor.accountName = newAccount.accountName;
      }
    }

    return newAccount;
  }

  setPrimaryPayoutAccount(vendorId: string, accountId: string): VendorPayoutAccountEntity | null {
    const targetVendorId = vendorId === 'vendor-tunde-kicks' ? 'vendor-tunde-kicks-run' : vendorId;
    const account = this.vendorPayoutAccounts.find(
      (a) => a.id === accountId && (a.vendorId === targetVendorId || a.vendorId === vendorId)
    );
    if (!account) return null;

    this.vendorPayoutAccounts.forEach((a) => {
      if (a.vendorId === targetVendorId || a.vendorId === vendorId) {
        a.isPrimary = a.id === accountId;
      }
    });

    const vendor = this.vendorProfiles.find((v) => v.id === targetVendorId || v.id === vendorId);
    if (vendor) {
      vendor.bankName = account.bankName;
      vendor.accountNumber = account.accountNumber;
      vendor.accountName = account.accountName;
    }

    return account;
  }

  deleteVendorPayoutAccount(vendorId: string, accountId: string): boolean {
    const targetVendorId = vendorId === 'vendor-tunde-kicks' ? 'vendor-tunde-kicks-run' : vendorId;
    const accounts = this.getVendorPayoutAccounts(targetVendorId);
    if (accounts.length <= 1) {
      throw new Error('Cannot remove your only payout account. You must have at least one settlement destination.');
    }

    const targetIndex = this.vendorPayoutAccounts.findIndex(
      (a) => a.id === accountId && (a.vendorId === targetVendorId || a.vendorId === vendorId)
    );
    if (targetIndex === -1) return false;

    const wasPrimary = this.vendorPayoutAccounts[targetIndex].isPrimary;
    this.vendorPayoutAccounts.splice(targetIndex, 1);

    if (wasPrimary) {
      const remaining = this.getVendorPayoutAccounts(targetVendorId);
      if (remaining.length > 0) {
        remaining[0].isPrimary = true;
        const vendor = this.vendorProfiles.find((v) => v.id === targetVendorId || v.id === vendorId);
        if (vendor) {
          vendor.bankName = remaining[0].bankName;
          vendor.accountNumber = remaining[0].accountNumber;
          vendor.accountName = remaining[0].accountName;
        }
      }
    }

    return true;
  }
}


export const db = new UniHiveStore();
