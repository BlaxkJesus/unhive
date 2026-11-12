import { db, OrderItemEntity } from './store.js';
import { broadcastOrderStatus, broadcastCampusDispatch } from './events.js';
import { NotificationService } from './notification.service.js';

export class DispatchService {
  /**
   * List orders waiting for dispatch pickup in the courier's campus
   */
  static getAvailableDeliveries(campusId: string) {
    return db.orders
      .filter(
        (o) =>
          o.campusId === campusId &&
          o.deliveryMode !== 'pickup' &&
          o.deliveryMethod !== 'vendor_self' &&
          (o.status === 'escrow_locked' || o.status === 'vendor_preparing' || o.status === 'pending_payment') &&
          !o.courierId
      )
      .map((order) => {
        const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
        const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
        const escrow = db.escrows.find((e) => e.orderId === order.id);

        const fee = escrow?.courierDeliveryFee ?? (order.deliveryMode === 'express' ? 1500 : order.deliveryMode === 'pickup' ? 0 : 500);
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          packageTag: order.packageTag || order.orderNumber,
          masterOrderNumber: order.masterOrderNumber || order.orderNumber,
          deliveryMode: order.deliveryMode || 'batch',
          vendorName: vendor?.businessName || 'Campus Vendor',
          dropoffHostel: hostel?.name,
          porterLodge: hostel?.porterLodgeName,
          payoutForCourier: fee,
          courierFee: fee,
          status: order.status,
          createdAt: order.createdAt,
        };
      });
  }

  /**
   * Courier accepts a delivery order
   */
  static acceptDelivery(params: { orderId: string; courierUserId: string }) {
    const courier = db.courierProfiles.find(
      (c) => c.userId === params.courierUserId
    );
    if (!courier) {
      throw new Error('Courier profile not found');
    }

    if (!courier.isApproved) {
      throw new Error('Your courier account is pending admin verification');
    }

    const order = db.orders.find((o) => o.id === params.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.courierId) {
      throw new Error('This delivery has already been claimed by another runner');
    }

    // Update this order and all sibling sub-orders sharing masterOrderNumber or same buyer & vendor delivery batch
    const ordersToUpdate = db.orders.filter(
      (o) =>
        (order.masterOrderNumber && o.masterOrderNumber === order.masterOrderNumber) ||
        o.id === order.id ||
        (o.buyerId === order.buyerId &&
          o.vendorId === order.vendorId &&
          !o.courierId &&
          (o.status === 'escrow_locked' || o.status === 'vendor_preparing' || o.status === 'pending_payment'))
    );

    for (const ord of ordersToUpdate) {
      ord.courierId = courier.id;
      ord.status = 'in_transit';
      ord.updatedAt = new Date();
      db.saveOrder(ord);
    }
    courier.status = 'on_delivery';

    const campus = db.campuses.find((c) => c.id === order.campusId);
    const campusSlug = campus ? campus.slug : 'run-ede';
    const runnerUser = db.users.find((u) => u.id === courier.userId);
    const consolidatedOrderNum = order.masterOrderNumber || order.orderNumber;

    // Broadcast claimed job to campus couriers so it drops off other runners' lists
    broadcastCampusDispatch(campusSlug, 'dispatch:claimed', {
      orderId: order.id,
      orderNumber: consolidatedOrderNum,
      claimedBy: runnerUser?.fullName || 'Courier Runner',
    });

    // Broadcast milestone advancement to buyer, vendor, and courier
    broadcastOrderStatus(consolidatedOrderNum, 'in_transit', {
      orderId: order.id,
      orderNumber: consolidatedOrderNum,
      masterOrderNumber: order.masterOrderNumber,
      status: 'in_transit',
      courier: {
        id: courier.id,
        fullName: runnerUser?.fullName || 'David Adeleke',
        phone: runnerUser?.phone || '08098765432',
        rating: courier.rating,
        hall: courier.hostelId,
        status: 'on_delivery',
      },
    });

    // Automated Transactional Email Alert to Vendor
    const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
    const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
    const escrow = db.escrows.find((e) => e.orderId === order.id);
    const vendorProduct = db.products.find((p) => p.vendorId === order.vendorId);

    if (vendor) {
      NotificationService.sendVendorEmail({
        vendorUserId: vendor.userId,
        type: 'in_transit',
        orderId: order.id,
        orderNumber: consolidatedOrderNum,
        itemTitle: vendorProduct?.title || 'Campus Marketplace Item',
        amount: escrow?.itemSubtotal || 18500,
        hostelName: hostel?.name || 'Campus Hostel',
        porterLodge: hostel?.porterLodgeName || 'Ground-Floor Porter Lodge',
        courierName: runnerUser?.fullName || 'Courier Runner',
        courierPhone: runnerUser?.phone || '08098765432',
      });
    }

    return {
      message: 'Delivery claimed successfully',
      orderNumber: consolidatedOrderNum,
      status: order.status,
    };
  }

  /**
   * Advance order status towards porter's lodge
   */
  static updateDeliveryMilestone(params: {
    orderId: string;
    courierUserId: string;
    milestone: 'in_transit' | 'at_porter_desk';
  }) {
    const courier = db.courierProfiles.find(
      (c) => c.userId === params.courierUserId
    );
    if (!courier) {
      throw new Error('Courier profile not found');
    }

    const order = db.orders.find((o) => o.id === params.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.courierId !== courier.id) {
      throw new Error('You are not assigned to this delivery');
    }

    // Update this order and all sibling sub-orders sharing masterOrderNumber or same delivery run
    const ordersToUpdate = db.orders.filter(
      (o) =>
        (order.masterOrderNumber && o.masterOrderNumber === order.masterOrderNumber) ||
        o.id === order.id ||
        (o.courierId === courier.id && o.buyerId === order.buyerId && o.vendorId === order.vendorId)
    );

    for (const ord of ordersToUpdate) {
      ord.status = params.milestone;
      ord.updatedAt = new Date();
      db.saveOrder(ord);
    }

    const message =
      params.milestone === 'at_porter_desk'
        ? 'Package arrived at Ground-Floor Porter Lodge. Ready for physical inspection & PIN verification.'
        : 'Package is in transit across campus.';

    const runnerUser = db.users.find((u) => u.id === courier.userId);
    const consolidatedOrderNum = order.masterOrderNumber || order.orderNumber;

    // Broadcast milestone advancement to buyer, runner, and admin
    broadcastOrderStatus(consolidatedOrderNum, params.milestone, {
      orderId: order.id,
      orderNumber: consolidatedOrderNum,
      masterOrderNumber: order.masterOrderNumber,
      status: params.milestone,
      message,
      courier: {
        id: courier.id,
        fullName: runnerUser?.fullName || 'Courier Runner',
        phone: runnerUser?.phone || '08098765432',
        rating: courier.rating,
        hall: courier.hostelId,
        status: courier.status,
      },
    });

    // Automated Transactional Email Alert to Vendor on Porter Desk Arrival
    if (params.milestone === 'at_porter_desk') {
      const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
      const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
      const escrow = db.escrows.find((e) => e.orderId === order.id);
      const vendorProduct = db.products.find((p) => p.vendorId === order.vendorId);

      if (vendor) {
        NotificationService.sendVendorEmail({
          vendorUserId: vendor.userId,
          type: 'at_porter_desk',
          orderId: order.id,
          orderNumber: consolidatedOrderNum,
          itemTitle: vendorProduct?.title || 'Campus Marketplace Item',
          amount: escrow?.itemSubtotal || 18500,
          hostelName: hostel?.name || 'Campus Hostel',
          porterLodge: hostel?.porterLodgeName || 'Ground-Floor Porter Lodge',
          courierName: runnerUser?.fullName || 'Courier Runner',
          courierPhone: runnerUser?.phone || '08098765432',
        });
      }
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      message,
    };
  }

  /**
   * Courier confirms pickup of a specific product stop in a multi-item/multi-order run
   */
  static confirmItemPickup(params: {
    orderId: string;
    productId?: string;
    courierUserId: string;
  }) {
    const courier = db.courierProfiles.find((c) => c.userId === params.courierUserId);
    if (!courier) {
      throw new Error('Courier profile not found');
    }

    // Locate order by ID or orderNumber or masterOrderNumber
    let order = db.orders.find((o) => o.id === params.orderId || o.orderNumber === params.orderId);
    if (!order) {
      order = db.orders.find((o) => o.masterOrderNumber === params.orderId);
    }
    if (!order) {
      throw new Error('Order not found');
    }

    // Collect all sibling orders sharing this master order number if any
    const relatedOrders = order.masterOrderNumber
      ? db.orders.filter((o) => o.masterOrderNumber === order!.masterOrderNumber)
      : [order];

    let targetItem: OrderItemEntity | undefined;
    let targetOrder = order;

    for (const ord of relatedOrders) {
      if (ord.items && ord.items.length > 0) {
        const found = params.productId
          ? ord.items.find((it) => it.productId === params.productId && !it.isPickedUp)
          : ord.items.find((it) => !it.isPickedUp);
        if (found) {
          targetItem = found;
          targetOrder = ord;
          break;
        }
      }
    }

    if (!targetItem) {
      if (!targetOrder.items || targetOrder.items.length === 0) {
        const prod = db.products.find((p) => p.id === params.productId) || db.products[0];
        targetItem = {
          productId: prod.id,
          title: prod.title,
          quantity: 1,
          price: prod.price,
          imageUrl: prod.images?.[0],
          pickupHostel: prod.hostelName || 'Joshua Hall',
          isPickedUp: false,
        };
        targetOrder.items = [targetItem];
      } else {
        targetItem = targetOrder.items.find((it) => it.productId === params.productId) || targetOrder.items[0];
      }
    }

    targetItem.isPickedUp = true;
    targetItem.pickedUpAt = new Date();
    targetOrder.updatedAt = new Date();
    db.saveOrder(targetOrder);

    // Aggregate counts across all related orders
    let allItems: OrderItemEntity[] = [];
    for (const ord of relatedOrders) {
      if (ord.items) allItems = allItems.concat(ord.items);
    }
    const pickedUpCount = allItems.filter((i) => i.isPickedUp).length;
    const totalCount = allItems.length;
    const allPickedUp = totalCount > 0 && pickedUpCount === totalCount;
    const nextItem = allItems.find((i) => !i.isPickedUp);

    const activeOrderNum = order.masterOrderNumber || order.orderNumber;
    const campus = db.campuses.find((c) => c.id === order.campusId);
    const campusSlug = campus ? campus.slug : 'run-ede';
    const runnerUser = db.users.find((u) => u.id === courier.userId);

    // Broadcast item pickup event on real-time sockets
    const pickupPayload = {
      orderId: order.id,
      orderNumber: activeOrderNum,
      productId: targetItem.productId,
      productTitle: targetItem.title,
      pickupHostel: targetItem.pickupHostel,
      pickedUpCount,
      totalCount,
      allPickedUp,
      nextItem: nextItem ? { productId: nextItem.productId, title: nextItem.title, pickupHostel: nextItem.pickupHostel } : null,
      courier: {
        name: runnerUser?.fullName || 'Courier Runner',
        phone: runnerUser?.phone || '08098765432',
      },
    };

    // Broadcast item pickup event on real-time sockets once
    broadcastOrderStatus(activeOrderNum, 'item_picked_up', pickupPayload);

    return {
      success: true,
      message: `Confirmed pickup of ${targetItem.title} (${pickedUpCount}/${totalCount} items collected)`,
      data: pickupPayload,
    };
  }

  /**
   * Get all active deliveries assigned to this courier (Batch Manifest)
   */
  static getCourierActiveJobs(courierUserId: string) {
    const courier = db.courierProfiles.find(
      (c) => c.userId === courierUserId
    );
    if (!courier) {
      return [];
    }

    const activeOrders = db.orders.filter((o) => {
      if (o.courierId !== courier.id) return false;
      if (o.status !== 'in_transit' && o.status !== 'at_porter_desk') return false;
      const esc = db.escrows.find((e) => e.orderId === o.id);
      if (esc && esc.paystackPaymentStatus === 'settled') return false;
      return true;
    });

    if (activeOrders.length === 0) {
      return [];
    }

    // Group orders by masterOrderNumber if shared (e.g. multi-vendor cart for single buyer),
    // otherwise each buyer's batch order remains a distinct delivery in the manifest
    const grouped = new Map<string, typeof activeOrders>();
    for (const ord of activeOrders) {
      const key = ord.masterOrderNumber ? `master_${ord.masterOrderNumber}` : `order_${ord.id}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(ord);
    }

    const jobs: any[] = [];
    for (const [, groupOrders] of grouped) {
      const primaryOrder = groupOrders[0];
      const vendor = db.vendorProfiles.find((v) => v.id === primaryOrder.vendorId);
      const hostel = db.hostels.find((h) => h.id === primaryOrder.dropoffHostelId);
      const buyer = db.users.find((u) => u.id === primaryOrder.buyerId);
      const escrow = db.escrows.find((e) => e.orderId === primaryOrder.id);

      let allItems: OrderItemEntity[] = [];
      for (const ord of groupOrders) {
        if (ord.items && ord.items.length > 0) {
          allItems = allItems.concat(ord.items);
        }
      }

      if (allItems.length === 0) {
        const prod = db.products.find((p) => p.vendorId === primaryOrder.vendorId) || db.products[0];
        allItems = [{
          productId: prod.id,
          title: prod.title,
          quantity: 1,
          price: prod.price,
          imageUrl: prod.images?.[0],
          vendorName: vendor?.businessName || 'Campus Merchant',
          pickupHostel: prod.hostelName || 'Joshua Hall',
          isPickedUp: false,
        }];
      }

      const pickedUpCount = allItems.filter((i) => i.isPickedUp).length;
      const totalCount = allItems.length;

      const totalRunnerFee = groupOrders.reduce((sum, ord) => {
        const esc = db.escrows.find((e) => e.orderId === ord.id);
        const fee = esc?.courierDeliveryFee ?? (ord.deliveryMode === 'express' ? 1500 : ord.deliveryMode === 'pickup' ? 0 : 500);
        return sum + fee;
      }, 0);

      const totalItemSubtotal = groupOrders.reduce((sum, ord) => {
        const esc = db.escrows.find((e) => e.orderId === ord.id);
        return sum + (esc?.itemSubtotal || ord.subtotal || 18500);
      }, 0);

      jobs.push({
        id: primaryOrder.id,
        orderId: primaryOrder.id,
        orderNumber: primaryOrder.orderNumber,
        masterOrderNumber: primaryOrder.masterOrderNumber || primaryOrder.orderNumber,
        packageTag: primaryOrder.packageTag || `PKG-${hostel?.name?.split(' ')[0]?.toUpperCase() || 'RUN'}-${primaryOrder.orderNumber.slice(-4)}`,
        itemTitle: allItems.map((i) => i.title).join(' • ') || 'Campus Delivery Items',
        items: allItems,
        pickedUpCount,
        totalCount,
        allPickedUp: totalCount > 0 && pickedUpCount === totalCount,
        pickupVendor: vendor?.businessName || 'Campus Vendor',
        pickupLocation: 'Hostel Pickup Station',
        dropoffHostel: `${hostel?.name || 'Hostel'} • ${hostel?.porterLodgeName || "Porter's Lodge"}`,
        dropoffHostelId: primaryOrder.dropoffHostelId,
        dropoffRoom: primaryOrder.dropoffRoom,
        recipientName: buyer?.fullName || 'Student Buyer',
        recipientPhone: primaryOrder.contactPhone || buyer?.phone || '08143829102',
        status: primaryOrder.status,
        deliveryMode: primaryOrder.deliveryMode || 'batch',
        runnerFee: totalRunnerFee,
        courierFee: totalRunnerFee,
        itemSubtotal: totalItemSubtotal,
        createdAt: primaryOrder.createdAt,
      });
    }

    return jobs;
  }

  /**
   * Get the courier's active ongoing delivery if any (first active job)
   */
  static getCourierActiveJob(courierUserId: string) {
    const jobs = this.getCourierActiveJobs(courierUserId);
    return jobs.length > 0 ? jobs[0] : null;
  }

  /**
   * Get runner shift earnings, completed trips count, rating, and payout history
   */
  static getCourierStats(courierUserId: string) {
    const courier = db.courierProfiles.find((c) => c.userId === courierUserId);
    if (!courier) {
      return {
        todayEarnings: 0,
        lifetimeEarnings: 0,
        completedRunsToday: 0,
        totalTripsCompleted: 0,
        rating: 0,
        ratingCount: 0,
        bankAccounts: [],
        bankAccount: null,
        recentPayouts: [],
      };
    }

    const courierPayouts = db.payouts.filter(
      (p) =>
        (p.recipientUserId === courierUserId || p.recipientUserId === courier.userId) &&
        p.recipientType === 'courier' &&
        p.status === 'success'
    );

    const totalPayoutAmount = courierPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedCount = courierPayouts.length;

    const bankAccounts = courier.bankAccounts && courier.bankAccounts.length > 0
      ? courier.bankAccounts
      : [];

    const primaryAccount = bankAccounts.find((a) => a.isPrimary) || bankAccounts[0] || null;

    return {
      todayEarnings: totalPayoutAmount,
      lifetimeEarnings: totalPayoutAmount,
      completedRunsToday: completedCount,
      totalTripsCompleted: Math.max(courier.totalTripsCompleted || 0, completedCount),
      rating: (courier.ratingCount && courier.ratingCount > 0) ? courier.rating : 0,
      ratingCount: courier.ratingCount || 0,
      bankAccounts,
      bankAccount: primaryAccount,
      recentPayouts: courierPayouts.slice(-10).reverse(),
    };
  }

  /**
   * Add a real bank account for courier (Strict limit: Maximum 2 accounts)
   */
  static addCourierBankAccount(
    courierUserId: string,
    params: { bankName: string; accountNumber: string; accountName: string }
  ) {
    const courier = db.courierProfiles.find((c) => c.userId === courierUserId);
    if (!courier) {
      throw new Error('Courier profile not found');
    }

    courier.bankAccounts = courier.bankAccounts || [];

    if (courier.bankAccounts.length >= 2) {
      throw new Error('Maximum limit reached: Maximum of 2 payout bank accounts allowed.');
    }

    const newAccount = {
      id: `courier-bank-${Date.now()}`,
      bankName: params.bankName.trim(),
      accountNumber: params.accountNumber.trim(),
      accountName: params.accountName.trim(),
      isPrimary: courier.bankAccounts.length === 0,
      createdAt: new Date().toISOString(),
    };

    courier.bankAccounts.push(newAccount);

    if (newAccount.isPrimary || !courier.bankName) {
      courier.bankName = newAccount.bankName;
      courier.accountNumber = newAccount.accountNumber;
      courier.accountName = newAccount.accountName;
    }

    return {
      success: true,
      message: `Bank account (${newAccount.bankName}) added successfully`,
      bankAccounts: courier.bankAccounts,
      data: {
        account: newAccount,
        bankAccounts: courier.bankAccounts,
      },
    };
  }

  /**
   * Buyer rates the student courier after a successful delivery
   */
  static rateCourier(params: {
    orderId: string;
    courierId?: string;
    rating: number;
    comment?: string;
  }) {
    const order = db.orders.find((o) => o.id === params.orderId || o.orderNumber === params.orderId);
    const targetCourierId = params.courierId || order?.courierId || 'courier-david-runner-run';
    const courier =
      db.courierProfiles.find(
        (c) =>
          c.id === targetCourierId ||
          c.userId === targetCourierId ||
          (targetCourierId === 'courier-david-runner' && c.id === 'courier-david-runner-run')
      ) || db.courierProfiles[0];

    if (!courier) {
      throw new Error('Courier profile not found for rating');
    }

    const numRating = Math.max(1, Math.min(5, Math.round(params.rating * 10) / 10));
    const currentCount = courier.ratingCount || 0;
    const currentRating = courier.rating || 0;

    const newRating =
      currentCount === 0
        ? numRating
        : Math.round(((currentRating * currentCount + numRating) / (currentCount + 1)) * 10) / 10;

    courier.rating = newRating;
    courier.ratingCount = currentCount + 1;

    return {
      success: true,
      message: 'Thank you for rating your student courier!',
      data: {
        courierId: courier.id,
        rating: courier.rating,
        ratingCount: courier.ratingCount,
      },
    };
  }

  /**
   * Get list of all completed delivery runs and dispatches by this courier
   */
  static getCourierCompletedRuns(courierUserId: string) {
    const courier = db.courierProfiles.find((c) => c.userId === courierUserId);
    if (!courier) {
      return [];
    }

    // Find all orders assigned to this courier that have been completed
    const completedOrders = db.orders.filter(
      (o) =>
        o.courierId === courier.id &&
        (o.status === 'inspected_completed' || o.status === 'completed')
    );

    // Also include any payouts for this courier
    const courierPayouts = db.payouts.filter(
      (p) =>
        (p.recipientUserId === courierUserId || p.recipientUserId === courier.userId) &&
        p.recipientType === 'courier' &&
        p.status === 'success'
    );

    const results = completedOrders.map((order) => {
      const buyer = db.users.find((u) => u.id === order.buyerId);
      const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);
      const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
      const escrow = db.escrows.find((e) => e.orderId === order.id);
      const payout = courierPayouts.find((p) => p.orderId === order.id);

      const items = (order.items || []).map((item) => {
        const product = db.products.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          title: item.title || product?.title || 'Campus Item',
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize,
          subtotal: item.subtotal || (product?.price ? product.price * (item.quantity || 1) : 0),
        };
      });

      return {
        id: order.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        masterOrderNumber: order.masterOrderNumber,
        packageTag: order.packageTag,
        status: order.status,
        deliveryMode: order.deliveryMode || escrow?.deliveryMode || 'batch_evening',
        courierFee: payout?.amount || escrow?.courierDeliveryFee || 500,
        completedAt: payout?.transferredAt || order.updatedAt || order.createdAt,
        dropoffHostel: hostel ? `${hostel.name} (${hostel.porterLodgeName})` : 'Hostel Porter Lodge',
        dropoffRoom: order.dropoffRoom || 'Porter Desk',
        recipientName: buyer?.fullName || 'Student Buyer',
        recipientPhone: order.contactPhone || buyer?.phone || '08143829102',
        vendorName: vendor?.businessName || 'Campus Vendor',
        items,
        totalItemsCount: items.reduce((acc, i) => acc + i.quantity, 0),
        transferCode: payout?.paystackTransferCode || null,
      };
    });

    results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return results;
  }
}
