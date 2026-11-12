export interface User {
  id: string;
  campusId: string;
  fullName: string;
  email: string;
  phone: string;
  matricNumber?: string;
  hostelId?: string;
  roomNumber?: string;
  roles: ('buyer' | 'vendor' | 'courier' | 'admin')[];
  isPhoneVerified: boolean;
  isSuspended: boolean;
  twoFactorEnabled: boolean;
}

export interface VendorProfile {
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

export interface VendorPayoutAccount {
  id: string;
  vendorId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
  createdAt: string;
}


export interface CourierProfile {
  id: string;
  userId: string;
  campusId: string;
  matricNumber: string;
  studentIdUrl: string;
  baseHostelId: string;
  status: 'available' | 'on_delivery' | 'offline';
  bankName: string;
  accountNumber: string;
  accountName: string;
  paystackRecipientCode?: string;
  totalTripsCompleted: number;
  rating: number;
  isApproved: boolean;
  currentHostelLocation?: string;
}

export interface Campus {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  status: 'active' | 'waitlist' | 'suspended';
  currency: string;
}

export interface Hostel {
  id: string;
  campusId: string;
  name: string;
  gender: 'female' | 'male' | 'coed';
  porterLodgeName: string;
  porterPhone: string;
  isActive: boolean;
}

export interface Product {
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
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  hostelName?: string;
  sizeBadge?: string;
  comboBadge?: string;
  vendor?: {
    id: string;
    businessName: string;
    trustScore?: number;
    completedOrdersCount?: number;
  };
}

export interface OrderEscrow {
  id: string;
  orderId: string;
  itemSubtotal: number;
  platformTechFee: number;
  courierDeliveryFee: number;
  totalAmount: number;
  paystackReference: string;
  paystackPaymentStatus: 'unpaid' | 'held_in_escrow' | 'settled' | 'refunded';
  handshakePinHash: string;
  plainPinForDev?: string;
  pinAttemptsCount: number;
  pinVerifiedAt?: string;
  settledAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  campusId: string;
  buyerId: string;
  vendorId: string;
  courierId?: string;
  status:
    | 'pending_payment'
    | 'escrow_locked'
    | 'vendor_preparing'
    | 'in_transit'
    | 'at_porter_desk'
    | 'inspected_completed'
    | 'disputed'
    | 'cancelled'
    | 'refunded';
  deliveryMethod: 'courier_runner' | 'vendor_self';
  dropoffHostelId: string;
  dropoffRoom: string;
  contactPhone: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  buyer?: User;
  vendor?: VendorProfile;
  courier?: CourierProfile;
  escrow?: OrderEscrow;
  dropoffHostel?: Hostel;
}

export interface EscrowBreakdown {
  itemSubtotal: number;
  platformTechFee: number;
  courierDeliveryFee: number;
  totalAmount: number;
}

export interface SettlementResult {
  success: boolean;
  orderId: string;
  orderNumber: string;
  vendorPayout: {
    amount: number;
    accountNumber: string;
    bankName: string;
    recipientName: string;
    reference: string;
  };
  courierPayout: {
    amount: number;
    accountNumber: string;
    bankName: string;
    recipientName: string;
    reference: string;
  };
  platformRevenue: number;
  settledAt: string;
}

export interface OrderDispute {
  id: string;
  orderId: string;
  raisedByUserId: string;
  reason: string;
  status: 'open' | 'under_review' | 'refunded' | 'released_to_vendor';
  adminId?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AdminDashboardStats {
  kpis: {
    escrowVaultBalance: number;
    platformRevenue: number;
    activeCouriersCount: number;
    verifiedVendorsCount: number;
    openDisputesCount: number;
  };
  recentOrdersCount: number;
  disputes: OrderDispute[];
}
