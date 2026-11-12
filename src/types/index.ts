import { Request } from 'express';

export type UserRole = 'buyer' | 'vendor' | 'courier' | 'admin';

export interface JwtUserPayload {
  userId: string;
  campusId: string;
  roles: UserRole[];
  email?: string;
  phone: string;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
  campusId?: string;
}

export type DeliveryMode = 'pickup' | 'batch_evening' | 'express';

export interface EscrowBreakdown {
  itemSubtotal: number;
  platformTechFee: number;
  courierDeliveryFee: number;
  totalAmount: number;
  deliveryMode?: DeliveryMode;
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
  settledAt: Date;
}
