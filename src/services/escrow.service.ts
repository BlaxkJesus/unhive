import bcrypt from 'bcryptjs';
import { CONFIG } from '../config/constants.js';
import { db, OrderEntity, OrderEscrowEntity, PayoutTransactionEntity, OrderDisputeEntity } from './store.js';
import { EscrowBreakdown, SettlementResult, DeliveryMode } from '../types/index.js';
import { broadcastOrderStatus, broadcastAdminAlert } from './events.js';
import { NotificationService } from './notification.service.js';

export class EscrowService {
  /**
   * Calculates platform escrow breakdown for an order
   */
  static calculateFees(
    itemSubtotal: number,
    deliveryMode: DeliveryMode = 'express',
    vendorCount: number = 1
  ): EscrowBreakdown {
    if (itemSubtotal <= 0) {
      throw new Error('Item subtotal must be greater than zero');
    }

    const platformTechFee = CONFIG.PLATFORM_TECH_FEE;
    let courierDeliveryFee = 0;

    if (deliveryMode === 'pickup') {
      courierDeliveryFee = CONFIG.HOSTEL_COURIER_FEE_PICKUP; // ₦0
    } else if (deliveryMode === 'batch_evening') {
      courierDeliveryFee = CONFIG.HOSTEL_COURIER_FEE_BATCH; // ₦500
    } else {
      // express: ₦1,500 instant solo run
      courierDeliveryFee = CONFIG.HOSTEL_COURIER_FEE_EXPRESS; // ₦1,500
    }

    const totalAmount = itemSubtotal + platformTechFee + courierDeliveryFee;

    return {
      itemSubtotal: Number(itemSubtotal.toFixed(2)),
      platformTechFee: Number(platformTechFee.toFixed(2)),
      courierDeliveryFee: Number(courierDeliveryFee.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      deliveryMode,
    };
  }

  /**
   * Generates a confidential 4-digit PIN for the buyer.
   * Returns plaintext PIN (sent only to buyer) and bcrypt hash (saved to DB).
   */
  static async generateHandshakePin(): Promise<{ plainPin: string; pinHash: string }> {
    // Generate random 4-digit PIN between 1000 and 9999
    const pinNumber = Math.floor(1000 + Math.random() * 9000);
    const plainPin = pinNumber.toString();
    const pinHash = await bcrypt.hash(plainPin, 10);

    return { plainPin, pinHash };
  }

  /**
   * Verify the confidential 4-digit PIN entered by courier or vendor at the porter lodge.
   * On success: triggers atomic dual-settlement payouts.
   * On 3 consecutive failures: permanently locks escrow and flags order.
   */
  static async verifyHandshakePin(params: {
    orderId: string;
    submittedPin: string;
    verifiedByUserId: string;
  }): Promise<SettlementResult> {
    const order = db.orders.find((o) => o.id === params.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const escrow = db.escrows.find((e) => e.orderId === params.orderId);
    if (!escrow) {
      throw new Error('Escrow record not found for this order');
    }

    // Security check: Only the assigned courier, assigned vendor (for vendor_self), or admin can verify the PIN
    const verifierUser = db.users.find((u) => u.id === params.verifiedByUserId);
    const isVerifierAdmin = verifierUser && verifierUser.roles.includes('admin');

    const courier = order.courierId ? db.courierProfiles.find((c) => c.id === order.courierId) : null;
    const isAssignedCourier = courier && courier.userId === params.verifiedByUserId;

    const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
    const isAssignedVendor = vendor && vendor.userId === params.verifiedByUserId && order.deliveryMethod === 'vendor_self';

    if (!isAssignedCourier && !isAssignedVendor && !isVerifierAdmin) {
      throw new Error(
        'UnauthorizedVerifier: Only the assigned delivery runner or campus administrator can verify this handshake PIN.'
      );
    }

    if (escrow.paystackPaymentStatus === 'settled') {
      throw new Error('This order has already been settled and funds released');
    }

    if (escrow.pinAttemptsCount >= CONFIG.MAX_PIN_ATTEMPTS) {
      throw new Error(
        'PIN verification locked due to excessive failed attempts. Please contact Admin Mediation Desk.'
      );
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(params.submittedPin.trim(), escrow.handshakePinHash);

    if (!isMatch) {
      escrow.pinAttemptsCount += 1;
      const attemptsRemaining = CONFIG.MAX_PIN_ATTEMPTS - escrow.pinAttemptsCount;

      if (escrow.pinAttemptsCount >= CONFIG.MAX_PIN_ATTEMPTS) {
        order.status = 'disputed';
        // Auto-raise mediation case
        const disputeId = `dispute-${Date.now()}`;
        const newDispute = {
          id: disputeId,
          orderId: order.id,
          raisedByUserId: order.buyerId,
          reason: 'Excessive incorrect PIN attempts at Porter Lodge (Escrow Auto-Lock)',
          status: 'open' as const,
          createdAt: new Date(),
        };
        db.disputes.push(newDispute);
        db.saveOrder(order, escrow);
        db.saveDispute(newDispute);

        // Broadcast lockout to buyer & courier & proctor
        broadcastOrderStatus(order.orderNumber, 'disputed', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'disputed',
          reason: '3-Attempt PIN Lockout at Porter Lodge. Escrow frozen.',
          attemptsCount: escrow.pinAttemptsCount,
        });

        broadcastAdminAlert('admin:dispute_opened', {
          disputeId: newDispute.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          reason: newDispute.reason,
          createdAt: newDispute.createdAt,
        });

        throw new Error(
          'Incorrect PIN. Security lock activated: Escrow frozen and forwarded to Admin Mediation Desk.'
        );
      } else {
        db.saveEscrow(escrow);
      }

      // Broadcast attempt countdown update
      broadcastOrderStatus(order.orderNumber, order.status, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        attemptsRemaining,
      });

      throw new Error(
        `Incorrect PIN. ${attemptsRemaining} attempt(s) remaining before account lockout.`
      );
    }

    // Success! Settle primary order
    const primaryResult = await this.executeAtomicSettlement(order, escrow);

    // Atomically settle all sibling and related orders (same master order or same buyer/vendor on this delivery)
    const relatedOrders = order.masterOrderNumber
      ? db.orders.filter(
          (o) =>
            o.id !== order.id &&
            o.masterOrderNumber === order.masterOrderNumber &&
            o.status !== 'inspected_completed' &&
            o.status !== 'refunded'
        )
      : [];

    if (order.courierId) {
      const additionalVendorOrders = db.orders.filter(
        (o) =>
          o.id !== order.id &&
          o.buyerId === order.buyerId &&
          o.vendorId === order.vendorId &&
          (o.status === 'at_porter_desk' || o.status === 'in_transit' || o.status === 'escrow_locked') &&
          !relatedOrders.some((ro) => ro.id === o.id)
      );
      relatedOrders.push(...additionalVendorOrders);
    }

    let aggregatedVendorPayout = primaryResult.vendorPayout.amount;
    let aggregatedCourierPayout = primaryResult.courierPayout.amount;
    let aggregatedPlatformRevenue = primaryResult.platformRevenue;

    for (const sibling of relatedOrders) {
      const sibEscrow = db.escrows.find((e) => e.orderId === sibling.id);
      if (sibEscrow && sibEscrow.paystackPaymentStatus !== 'settled') {
        const sibResult = await this.executeAtomicSettlement(sibling, sibEscrow);
        aggregatedVendorPayout += sibResult.vendorPayout.amount;
        aggregatedCourierPayout += sibResult.courierPayout.amount;
        aggregatedPlatformRevenue += sibResult.platformRevenue;
      }
    }

    return {
      ...primaryResult,
      vendorPayout: {
        ...primaryResult.vendorPayout,
        amount: aggregatedVendorPayout,
      },
      courierPayout: {
        ...primaryResult.courierPayout,
        amount: aggregatedCourierPayout,
      },
      platformRevenue: aggregatedPlatformRevenue,
    };
  }

  /**
   * Atomically executes the dual-settlement Paystack split payout:
   * 1. Transfers Item Subtotal (e.g. ₦18,500) to Vendor's Bank/OPay
   * 2. Transfers Hostel Courier Fee (₦250) to Runner's Bank/Kuda
   * 3. Retains Tech Fee (₦100) as UniHive Platform Revenue
   * 4. Marks order as 'inspected_completed'
   */
  private static async executeAtomicSettlement(
    order: OrderEntity,
    escrow: OrderEscrowEntity
  ): Promise<SettlementResult> {
    const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
    if (!vendor) {
      throw new Error('Vendor profile not found for settlement');
    }

    const courier = order.courierId
      ? db.courierProfiles.find((c) => c.id === order.courierId)
      : null;

    const settledAt = new Date();

    // 1. Record Vendor Payout
    const vendorTransferCode = `TRF_VND_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const vendorPayoutTx: PayoutTransactionEntity = {
      id: `payout-vnd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: order.id,
      recipientType: 'vendor',
      recipientUserId: vendor.userId,
      amount: escrow.itemSubtotal,
      paystackTransferCode: vendorTransferCode,
      status: 'success',
      transferredAt: settledAt,
    };
    db.payouts.push(vendorPayoutTx);
    vendor.completedOrdersCount += 1;

    // 2. Record Courier Payout
    const courierTransferCode = courier ? `TRF_COU_${Date.now()}_${Math.floor(Math.random() * 1000)}` : 'N/A';
    if (courier && escrow.courierDeliveryFee > 0) {
      const courierPayoutTx: PayoutTransactionEntity = {
        id: `payout-cou-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: order.id,
        recipientType: 'courier',
        recipientUserId: courier.userId,
        amount: escrow.courierDeliveryFee,
        paystackTransferCode: courierTransferCode,
        status: 'success',
        transferredAt: settledAt,
      };
      db.payouts.push(courierPayoutTx);
      db.savePayout(courierPayoutTx);
      courier.totalTripsCompleted += 1;
    }

    // 3. Record Platform Revenue
    const platformPayoutTx: PayoutTransactionEntity = {
      id: `payout-plt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: order.id,
      recipientType: 'platform',
      amount: escrow.platformTechFee,
      paystackTransferCode: 'REV_INTERNAL',
      status: 'success',
      transferredAt: settledAt,
    };
    db.payouts.push(platformPayoutTx);
    db.savePayout(vendorPayoutTx);
    db.savePayout(platformPayoutTx);

    // 4. Update Escrow & Order Status
    escrow.paystackPaymentStatus = 'settled';
    escrow.pinVerifiedAt = settledAt;
    escrow.settledAt = settledAt;

    order.status = 'inspected_completed';
    order.updatedAt = settledAt;
    db.saveOrder(order, escrow);

    const primaryAccount = db.getVendorPayoutAccounts(vendor.id).find((a) => a.isPrimary);
    const resolvedBankName = primaryAccount?.bankName || vendor.bankName;
    const resolvedAccountNumber = primaryAccount?.accountNumber || vendor.accountNumber;
    const resolvedAccountName = primaryAccount?.accountName || vendor.accountName;

    const result: SettlementResult = {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      vendorPayout: {
        amount: escrow.itemSubtotal,
        accountNumber: resolvedAccountNumber,
        bankName: resolvedBankName,
        recipientName: resolvedAccountName,
        reference: vendorTransferCode,
      },
      courierPayout: {
        amount: escrow.courierDeliveryFee,
        accountNumber: courier ? courier.accountNumber : 'N/A',
        bankName: courier ? courier.bankName : 'N/A',
        recipientName: courier ? courier.accountName : 'N/A',
        reference: courierTransferCode,
      },
      platformRevenue: escrow.platformTechFee,
      settledAt,
    };

    // Broadcast live settlement completion to buyer, runner, and merchant
    broadcastOrderStatus(order.orderNumber, 'inspected_completed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'inspected_completed',
      settlement: result,
    });

    // Alert admin command center
    broadcastAdminAlert('admin:settlement_executed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: escrow.totalAmount,
      vendorAmount: escrow.itemSubtotal,
      courierAmount: escrow.courierDeliveryFee,
      platformFee: escrow.platformTechFee,
    });

    // Automated Transactional Email & Payout Receipt to Vendor
    const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
    const vendorProduct = db.products.find((p) => p.vendorId === order.vendorId);
    const courierUser = courier ? db.users.find((u) => u.id === courier.userId) : null;

    NotificationService.sendVendorEmail({
      vendorUserId: vendor.userId,
      type: 'completed',
      orderId: order.id,
      orderNumber: order.orderNumber,
      itemTitle: vendorProduct?.title || 'Campus Marketplace Item',
      amount: escrow.itemSubtotal,
      hostelName: hostel?.name || 'Campus Hostel',
      porterLodge: hostel?.porterLodgeName || 'Ground-Floor Porter Lodge',
      courierName: courierUser?.fullName || 'Courier Runner',
      bankName: vendor.bankName,
      accountNumber: vendor.accountNumber,
      transferCode: vendorTransferCode,
    });

    return result;
  }

  /**
   * Allows customer to report an issue or lodge a complaint during physical inspection.
   * Freezes the escrow immediately and opens a mediation case with Chief Proctor Adeleke.
   */
  static async raiseBuyerDispute(params: {
    orderId: string;
    buyerUserId: string;
    reason: string;
    issueCategory?: string;
    videoUrl?: string;
    buyerStatement?: string;
  }) {
    const order = db.orders.find((o) => o.id === params.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.buyerId !== params.buyerUserId) {
      throw new Error('Unauthorized: You can only lodge complaints for your own orders');
    }

    const escrow = db.escrows.find((e) => e.orderId === params.orderId);
    if (!escrow) {
      throw new Error('Escrow record not found for this order');
    }

    if (escrow.paystackPaymentStatus === 'settled' || order.status === 'inspected_completed') {
      throw new Error('This order has already been inspected, settled, and funds released.');
    }

    if (order.status === 'disputed') {
      throw new Error('A dispute has already been logged for this order. It is currently under mediation.');
    }

    const categoryPrefix = params.issueCategory ? `[${params.issueCategory}] ` : '';
    const fullReason = `${categoryPrefix}${params.reason.trim()}`;

    order.status = 'disputed';
    order.updatedAt = new Date();

    const disputeId = `dispute-${Date.now()}`;
    const newDispute: OrderDisputeEntity = {
      id: disputeId,
      orderId: order.id,
      raisedByUserId: params.buyerUserId,
      reason: fullReason,
      buyerStatement: params.buyerStatement?.trim() || params.reason.trim(),
      videoUrl: params.videoUrl,
      evidenceUrls: params.videoUrl ? [params.videoUrl] : [],
      status: 'open',
      createdAt: new Date(),
    };

    db.disputes.push(newDispute);
    db.saveOrder(order, escrow);
    db.saveDispute(newDispute);

    // Broadcast status change to student buyer, vendor, and courier runner
    broadcastOrderStatus(order.orderNumber, 'disputed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'disputed',
      reason: fullReason,
      disputeId: newDispute.id,
      buyerStatement: newDispute.buyerStatement,
      videoUrl: newDispute.videoUrl,
    });

    // Alert Chief Proctor Admin Mediation Terminal in real time
    broadcastAdminAlert('admin:dispute_opened', {
      disputeId: newDispute.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      reason: newDispute.reason,
      buyerStatement: newDispute.buyerStatement,
      videoUrl: newDispute.videoUrl,
      createdAt: newDispute.createdAt,
    });

    return {
      success: true,
      message: 'Complaint lodged successfully. Escrow frozen and forwarded to Admin Mediation Desk.',
      disputeId: newDispute.id,
      orderNumber: order.orderNumber,
      status: order.status,
    };
  }
}
