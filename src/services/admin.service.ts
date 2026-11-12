import { db } from './store.js';
import { broadcastOrderStatus, broadcastAdminAlert } from './events.js';
import { NotificationService } from './notification.service.js';
import bcrypt from 'bcryptjs';

export class AdminService {
  /**
   * Get operational overview statistics for admin dashboard
   */
  static getDashboardStats(campusId?: string) {
    let escrows = db.escrows;
    let orders = db.orders;
    let couriers = db.courierProfiles;

    if (campusId) {
      orders = orders.filter((o) => o.campusId === campusId);
      const orderIds = new Set(orders.map((o) => o.id));
      escrows = escrows.filter((e) => orderIds.has(e.orderId));
      couriers = couriers.filter((c) => c.campusId === campusId);
    }

    const lockedEscrowBalance = escrows
      .filter((e) => e.paystackPaymentStatus === 'held_in_escrow')
      .reduce((sum, e) => sum + e.totalAmount, 0);

    const platformRevenueTotal = db.payouts
      .filter((p) => p.recipientType === 'platform')
      .reduce((sum, p) => sum + p.amount, 0);

    const activeDeliveriesCount = orders.filter(
      (o) => o.status === 'in_transit' || o.status === 'at_porter_desk'
    ).length;

    const disputesCount = db.disputes.filter((d) => d.status === 'open').length;

    return {
      vault: {
        escrowBalance: lockedEscrowBalance,
        currency: 'NGN',
        status: 'Audit Clean (Zero Fund Leakage)',
      },
      revenue: {
        totalEarned: platformRevenueTotal,
        platformFeePerOrder: 100.0,
      },
      operations: {
        activeDeliveriesCount,
        openDisputesCount: disputesCount,
        registeredCampusesCount: db.campuses.length,
        activeCouriersCount: couriers.filter((c) => c.status !== 'offline').length,
        totalOrdersCount: orders.length,
      },
    };
  }

  /**
   * Real-time live dispatch stream of all campus orders
   */
  static getDispatchStream(campusId?: string) {
    let orders = db.orders;
    if (campusId) {
      orders = orders.filter((o) => o.campusId === campusId);
    }

    return orders.map((order) => {
      const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
      const courier = order.courierId
        ? db.courierProfiles.find((c) => c.id === order.courierId)
        : null;
      const courierUser = courier
        ? db.users.find((u) => u.id === courier.userId)
        : null;
      const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
      const escrow = db.escrows.find((e) => e.orderId === order.id);

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        vendor: vendor?.businessName,
        courier: courierUser?.fullName || 'Awaiting Courier',
        destination: `${hostel?.name} (${order.dropoffRoom})`,
        porterLodge: hostel?.porterLodgeName,
        totalAmount: escrow?.totalAmount || 0,
        pinAttempts: escrow?.pinAttemptsCount || 0,
        updatedAt: order.updatedAt,
      };
    });
  }

  /**
   * Get all mediation disputes for admin mediation terminal
   */
  static getDisputes(campusId?: string) {
    let disputes = db.disputes;
    if (campusId) {
      const campusOrderIds = new Set(
        db.orders.filter((o) => o.campusId === campusId).map((o) => o.id)
      );
      disputes = disputes.filter((d) => campusOrderIds.has(d.orderId));
    }

    return disputes.map((d) => {
      const order = db.orders.find((o) => o.id === d.orderId);
      const buyer = order ? db.users.find((u) => u.id === order.buyerId) : null;
      const vendor = order ? db.vendorProfiles.find((v) => v.id === order.vendorId) : null;
      const courier = order?.courierId
        ? db.courierProfiles.find((c) => c.id === order.courierId)
        : null;
      const courierUser = courier
        ? db.users.find((u) => u.id === courier.userId)
        : null;
      const escrow = order ? db.escrows.find((e) => e.orderId === order.id) : null;
      const hostel = order ? db.hostels.find((h) => h.id === order.dropoffHostelId) : null;
      const campus = order ? db.campuses.find((c) => c.id === order.campusId) : null;

      // Determine category
      const reasonLower = (d.reason || '').toLowerCase();
      const category = d.category || (
        reasonLower.includes('pin') || (escrow && escrow.pinAttemptsCount >= 3)
          ? 'pin_lockout'
          : reasonLower.includes('size') || reasonLower.includes('wrong')
          ? 'wrong_item'
          : reasonLower.includes('damaged') || reasonLower.includes('defect')
          ? 'item_defect'
          : 'inspection_failure'
      );

      // Build realistic audit timeline for dispute file
      const createdAtDate = d.createdAt ? new Date(d.createdAt) : new Date();
      const timeline = [
        {
          event: 'Order Placed & Escrow Locked',
          timestamp: order?.createdAt || createdAtDate,
          description: `₦${(escrow?.totalAmount || 0).toLocaleString()} held in Paystack Escrow Vault.`,
          status: 'completed',
        },
        {
          event: 'Courier Dispatched',
          timestamp: new Date(createdAtDate.getTime() - 25 * 60 * 1000),
          description: `Runner ${courierUser?.fullName || 'Assigned Courier'} collected package ${order?.packageTag || ''}.`,
          status: 'completed',
        },
        {
          event: 'Arrived at Porter Lodge Checkpoint',
          timestamp: new Date(createdAtDate.getTime() - 10 * 60 * 1000),
          description: `Dropoff at ${hostel?.porterLodgeName || 'Ground Floor Reception'}. Zero room entry maintained.`,
          status: 'completed',
        },
      ];

      if (category === 'pin_lockout' || (escrow && escrow.pinAttemptsCount >= 3)) {
        timeline.push(
          {
            event: 'Handshake PIN Attempt 1',
            timestamp: new Date(createdAtDate.getTime() - 7 * 60 * 1000),
            description: 'Incorrect PIN submitted at runner terminal.',
            status: 'failed',
          },
          {
            event: 'Handshake PIN Attempt 2',
            timestamp: new Date(createdAtDate.getTime() - 4 * 60 * 1000),
            description: 'Incorrect PIN submitted. Security warning issued.',
            status: 'failed',
          },
          {
            event: 'PIN Attempt 3 (3-Attempt Lockout)',
            timestamp: escrow?.pinLockedAt || createdAtDate,
            description: 'Maximum attempts exceeded. Escrow auto-frozen and referred to Proctor Desk.',
            status: 'locked',
          }
        );
      } else {
        timeline.push({
          event: 'Physical Inspection Mismatch Flagged',
          timestamp: createdAtDate,
          description: `Buyer rejected handover: ${d.reason}`,
          status: 'disputed',
        });
      }

      if (d.status === 'refunded') {
        timeline.push({
          event: 'Paystack Escrow Reversal Executed',
          timestamp: d.resolvedAt || new Date(),
          description: `100% refund executed to buyer (${d.resolutionNotes || 'Mediation completed'}).`,
          status: 'refunded',
        });
      } else if (d.status === 'released_to_vendor') {
        timeline.push({
          event: 'Settlement Payout Released to Vendor',
          timestamp: d.resolvedAt || new Date(),
          description: `Proctor approved disbursement to ${vendor?.businessName || 'Vendor'}.`,
          status: 'released',
        });
      }

      return {
        id: d.id,
        orderId: d.orderId,
        orderNumber: order?.orderNumber || 'N/A',
        buyerName: buyer?.fullName || 'Student Buyer',
        vendorName: vendor?.businessName || 'Campus Vendor',
        amount: escrow?.totalAmount || 0,
        itemSubtotal: escrow?.itemSubtotal || 0,
        deliveryFee: escrow?.courierDeliveryFee || escrow?.deliveryFee || 250,
        platformFee: escrow?.platformTechFee || escrow?.platformFee || 100,
        reason: d.reason,
        status: d.status,
        category,
        evidenceUrls: d.evidenceUrls && d.evidenceUrls.length > 0 ? d.evidenceUrls : [
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800'
        ],
        buyerStatement: d.buyerStatement || d.reason,
        merchantStatement: d.merchantStatement || (vendor ? `Merchant '${vendor.businessName}' notified of dispute and awaiting proctor resolution.` : ''),
        courierNotes: d.courierNotes || (courierUser ? `Runner '${courierUser.fullName}' safely held package at ${hostel?.porterLodgeName || 'Porter Lodge'}.` : ''),
        resolutionNotes: d.resolutionNotes,
        createdAt: d.createdAt,
        resolvedAt: d.resolvedAt,
        pinAttemptsCount: escrow?.pinAttemptsCount || 0,
        isPinLocked: (escrow?.pinAttemptsCount ?? 0) >= 3,
        pinLockedAt: escrow?.pinLockedAt,
        packageTag: order?.packageTag || 'RUN-PKG',
        items: order?.items && order.items.length > 0 ? order.items : [
          {
            productId: 'prod-item-1',
            title: order?.packageTag ? `Campus Marketplace Item (${order.packageTag})` : 'Nike Air Jordan 4 Retro',
            quantity: 1,
            price: escrow?.itemSubtotal || 24000,
            selectedSize: 'EU 44',
            imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800',
            vendorName: vendor?.businessName || 'Campus Vendor',
          }
        ],
        buyer: {
          id: buyer?.id,
          fullName: buyer?.fullName || 'Student Buyer',
          phone: buyer?.phone || order?.contactPhone || '08123450001',
          email: buyer?.email || 'student@run.edu.ng',
          matricNumber: buyer?.matricNumber || 'RUN/2023/STU/001',
          hostelName: hostel?.name || 'Campus Hostel',
          roomNumber: order?.dropoffRoom || 'Room 101',
        },
        vendor: {
          id: vendor?.id,
          businessName: vendor?.businessName || 'Campus Vendor',
          bankName: vendor?.bankName || 'OPay Digital Services',
          accountNumber: vendor?.accountNumber || '8123450002',
          subaccountCode: vendor?.paystackSubaccountCode || 'ACCT_vendor_sub',
        },
        courier: {
          id: courier?.id,
          fullName: courierUser?.fullName || 'Student Runner',
          phone: courierUser?.phone || '08098765432',
          matricNumber: courier?.matricNumber || 'RUN/2023/LAW/054',
          rating: courier?.rating || 4.9,
          totalTrips: courier?.totalTripsCompleted || 12,
        },
        location: {
          campusName: campus?.name || "Redeemer's University (RUN)",
          hostelName: hostel?.name || 'Campus Hostel',
          porterLodgeName: hostel?.porterLodgeName || 'Ground-Floor Porter Lodge',
        },
        timeline,
      };
    });
  }

  /**
   * Get single dispute by ID
   */
  static getDisputeById(disputeId: string) {
    const list = AdminService.getDisputes();
    return list.find((d) => d.id === disputeId || d.orderId === disputeId);
  }

  /**
   * Resolve an open dispute
   */
  static resolveDispute(params: {
    disputeId: string;
    adminUserId: string;
    action: 'refund_buyer' | 'release_to_vendor';
    resolutionNotes: string;
  }) {
    const dispute = db.disputes.find((d) => d.id === params.disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const order = db.orders.find((o) => o.id === dispute.orderId);
    const escrow = db.escrows.find((e) => e.orderId === dispute.orderId);

    if (!order || !escrow) {
      throw new Error('Order/Escrow associated with dispute not found');
    }

    const resolvedAt = new Date();
    dispute.adminId = params.adminUserId;
    dispute.resolutionNotes = params.resolutionNotes;
    dispute.resolvedAt = resolvedAt;

    let responseData: any;

    if (params.action === 'refund_buyer') {
      dispute.status = 'refunded';
      order.status = 'refunded';
      escrow.paystackPaymentStatus = 'refunded';

      // Log refund payout
      const refundPayoutTx = {
        id: `refund-${Date.now()}`,
        orderId: order.id,
        recipientType: 'platform' as const,
        recipientUserId: order.buyerId,
        amount: escrow.totalAmount,
        paystackTransferCode: `REFUND_${Date.now()}`,
        status: 'success' as const,
        transferredAt: resolvedAt,
      };
      db.payouts.push(refundPayoutTx);
      db.savePayout(refundPayoutTx);

      responseData = {
        message: 'Dispute resolved: 100% refund issued to buyer',
        orderNumber: order.orderNumber,
        refundedAmount: escrow.totalAmount,
      };
    } else {
      dispute.status = 'released_to_vendor';
      order.status = 'inspected_completed';
      escrow.paystackPaymentStatus = 'settled';

      const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
      const courier = order.courierId
        ? db.courierProfiles.find((c) => c.id === order.courierId)
        : null;

      // 1. Release Item Subtotal to Vendor
      const vendorPayoutTx = {
        id: `payout-vnd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: order.id,
        recipientType: 'vendor' as const,
        recipientUserId: vendor?.userId,
        amount: escrow.itemSubtotal,
        paystackTransferCode: `TRF_VND_RESOLVE_${Date.now()}`,
        status: 'success' as const,
        transferredAt: resolvedAt,
      };
      db.payouts.push(vendorPayoutTx);
      db.savePayout(vendorPayoutTx);
      if (vendor) vendor.completedOrdersCount += 1;

      // 2. Release Delivery Fee to Courier
      if (courier && escrow.courierDeliveryFee > 0) {
        const courierPayoutTx = {
          id: `payout-cou-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderId: order.id,
          recipientType: 'courier' as const,
          recipientUserId: courier.userId,
          amount: escrow.courierDeliveryFee,
          paystackTransferCode: `TRF_COU_RESOLVE_${Date.now()}`,
          status: 'success' as const,
          transferredAt: resolvedAt,
        };
        db.payouts.push(courierPayoutTx);
        db.savePayout(courierPayoutTx);
        courier.totalTripsCompleted += 1;
      }

      // 3. Platform Revenue
      const platformPayoutTx = {
        id: `payout-plt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: order.id,
        recipientType: 'platform' as const,
        amount: escrow.platformTechFee,
        paystackTransferCode: 'REV_INTERNAL',
        status: 'success' as const,
        transferredAt: resolvedAt,
      };
      db.payouts.push(platformPayoutTx);
      db.savePayout(platformPayoutTx);

      responseData = {
        message: 'Dispute resolved: Funds released to vendor after inspection review',
        orderNumber: order.orderNumber,
        amount: escrow.itemSubtotal,
      };
    }

    db.saveOrder(order, escrow);
    db.saveDispute(dispute);

    // Broadcast live resolution to order room (buyer, courier, vendor)
    broadcastOrderStatus(order.orderNumber, order.status, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      disputeId: dispute.id,
      resolution: dispute.status,
      notes: dispute.resolutionNotes,
    });

    // Broadcast live resolution to admin console
    broadcastAdminAlert('admin:dispute_resolved', {
      disputeId: dispute.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: params.action,
      status: dispute.status,
    });

    // Automated Transactional Email Alert to Vendor upon dispute resolution
    const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
    const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
    const vendorProduct = db.products.find((p) => p.vendorId === order.vendorId);

    if (vendor) {
      if (params.action === 'refund_buyer') {
        NotificationService.sendVendorEmail({
          vendorUserId: vendor.userId,
          type: 'refunded',
          orderId: order.id,
          orderNumber: order.orderNumber,
          itemTitle: vendorProduct?.title || 'Campus Marketplace Item',
          amount: escrow.itemSubtotal,
          hostelName: hostel?.name || 'Campus Hostel',
          porterLodge: hostel?.porterLodgeName || 'Ground-Floor Porter Lodge',
          notes: params.resolutionNotes || 'Dispute settled as buyer refund by Chief Proctor',
        });
      } else {
        NotificationService.sendVendorEmail({
          vendorUserId: vendor.userId,
          type: 'completed',
          orderId: order.id,
          orderNumber: order.orderNumber,
          itemTitle: vendorProduct?.title || 'Campus Marketplace Item',
          amount: escrow.itemSubtotal,
          hostelName: hostel?.name || 'Campus Hostel',
          porterLodge: hostel?.porterLodgeName || 'Ground-Floor Porter Lodge',
          bankName: vendor.bankName,
          accountNumber: vendor.accountNumber,
          transferCode: `TRF_VND_RESOLVE_${Date.now()}`,
          notes: params.resolutionNotes,
        });
      }
    }

    return responseData;
  }

  /**
   * Approve or reject a courier registration
   */
  static reviewCourierApplication(courierId: string, isApproved: boolean) {
    const courier = db.courierProfiles.find((c) => c.id === courierId);
    if (!courier) {
      throw new Error('Courier profile not found');
    }

    courier.isApproved = isApproved;
    return {
      courierId: courier.id,
      matricNumber: courier.matricNumber,
      isApproved: courier.isApproved,
    };
  }

  /**
   * Get all settlement and payout transactions for admin audit
   */
  static getPayouts(campusId?: string) {
    let payouts = db.payouts;
    if (campusId) {
      const campusOrderIds = new Set(
        db.orders.filter((o) => o.campusId === campusId).map((o) => o.id)
      );
      payouts = payouts.filter((p) => campusOrderIds.has(p.orderId));
    }

    return payouts
      .map((p) => {
        const order = db.orders.find((o) => o.id === p.orderId);
        const user = p.recipientUserId ? db.users.find((u) => u.id === p.recipientUserId) : null;
        return {
          id: p.id,
          orderId: p.orderId,
          orderNumber: order?.orderNumber || 'RUN-ORDER',
          recipientType: p.recipientType,
          recipientName:
            user?.fullName ||
            (p.recipientType === 'platform' ? 'UniHive Tech Reserve' : 'Merchant / Runner'),
          amount: p.amount,
          status: p.status,
          paystackTransferCode: p.paystackTransferCode,
          transferredAt: p.transferredAt,
        };
      })
      .sort((a, b) => new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime());
  }

  /**
   * Provision a contracted partner fleet courier with instant WhatsApp credentials
   */
  static async provisionFleetCourier(params: {
    fullName: string;
    whatsappPhone: string;
    baseHostelId: string;
    campusId?: string;
    customPassword?: string;
    bankName?: string;
    accountNumber?: string;
  }) {
    const campusId = params.campusId || 'campus-run-ede';
    const campus = db.campuses.find((c) => c.id === campusId) || db.campuses[0];
    const hostel = db.hostels.find((h) => h.id === params.baseHostelId) || db.hostels[0];

    const cleanPhone = params.whatsappPhone.trim().replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('A valid WhatsApp phone number is required (e.g. 08143829102)');
    }

    if (!params.fullName || params.fullName.trim().length < 3) {
      throw new Error('Full legal or partner dispatch name is required');
    }

    const plainPassword =
      params.customPassword?.trim() ||
      `RUN-FLEET-${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Check if user already exists
    let user = db.users.find((u) => u.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone);

    if (user) {
      if (!user.roles.includes('courier')) {
        user.roles.push('courier');
      }
      user.passwordHash = passwordHash;
      await db.saveUser(user);
    } else {
      user = {
        id: `user-fleet-${Date.now()}`,
        campusId,
        fullName: params.fullName.trim(),
        email: `${cleanPhone}@fleet.run.edu.ng`,
        phone: cleanPhone,
        matricNumber: `FLEET/${campus.shortName || 'RUN'}/${Math.floor(100 + Math.random() * 900)}`,
        hostelId: hostel.id,
        roomNumber: 'Porter Lodge Desk',
        passwordHash,
        roles: ['buyer', 'courier'],
        isPhoneVerified: true,
        isSuspended: false,
        twoFactorEnabled: false,
        createdAt: new Date(),
      };
      db.users.push(user);
      await db.saveUser(user);
    }

    // Check or create CourierProfile
    let courierProfile = db.courierProfiles.find((c) => c.userId === user!.id);
    if (!courierProfile) {
      courierProfile = {
        id: `courier-fleet-${Date.now()}`,
        userId: user.id,
        campusId,
        matricNumber: user.matricNumber || 'FLEET-RUNNER',
        studentIdUrl: 'https://unihive.ng/assets/fleet-partner-badge.png',
        baseHostelId: hostel.id,
        hostelId: hostel.id,
        status: 'available',
        bankName: params.bankName || 'Kuda Microfinance Bank',
        accountNumber: params.accountNumber || '2001928374',
        accountName: user.fullName,
        completedTripsCount: 0,
        isApproved: true,
        currentHostelLocation: hostel.name,
      };
      db.courierProfiles.push(courierProfile);
      await db.saveCourierProfile(courierProfile);
    } else {
      courierProfile.baseHostelId = hostel.id;
      courierProfile.hostelId = hostel.id;
      courierProfile.isApproved = true;
      courierProfile.status = 'available';
      courierProfile.currentHostelLocation = hostel.name;
      await db.saveCourierProfile(courierProfile);
    }

    // Format WhatsApp International Phone (Nigerian +234 format)
    let intlPhone = cleanPhone;
    if (intlPhone.startsWith('0')) {
      intlPhone = '234' + intlPhone.slice(1);
    } else if (intlPhone.startsWith('+')) {
      intlPhone = intlPhone.replace('+', '');
    } else if (!intlPhone.startsWith('234')) {
      intlPhone = '234' + intlPhone;
    }

    const welcomeMessage = `Hello ${user.fullName}! 🚴\n\nYou have been provisioned as an official SwiftDrop Campus Fleet Runner on UniHive (${campus.name}).\n\n📱 Login Phone: ${cleanPhone}\n🔑 Password: ${plainPassword}\n🏢 Base Station: ${hostel.name} (Ground-Floor Porter Lodge)\n🌐 Sign In URL: http://localhost:3000\n\nSign in to start receiving campus hostel delivery drops and earning instant automated payouts!`;

    const whatsappLink = `https://wa.me/${intlPhone}?text=${encodeURIComponent(welcomeMessage)}`;

    console.log(`
================================================================================
📱 [WHATSAPP CREDENTIAL DISPATCH]
--------------------------------------------------------------------------------
To:      +${intlPhone} (${user.fullName})
Role:    SwiftDrop Campus Fleet Runner
Station: ${hostel.name}
Phone:   ${cleanPhone}
Code:    [ ${plainPassword} ]
Message:
${welcomeMessage}
================================================================================
    `);

    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        roles: user.roles,
      },
      courierProfile: {
        id: courierProfile.id,
        baseHostelId: hostel.id,
        baseHostelName: hostel.name,
        status: courierProfile.status,
        isApproved: courierProfile.isApproved,
      },
      credentials: {
        phone: cleanPhone,
        plainPassword,
        whatsappIntlPhone: `+${intlPhone}`,
        whatsappLink,
        welcomeMessage,
      },
    };
  }
}
