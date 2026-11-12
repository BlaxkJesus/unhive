import { db, OrderEntity, OrderEscrowEntity, OrderItemEntity } from './store.js';
import { EscrowService } from './escrow.service.js';
import { broadcastOrderStatus, broadcastCampusDispatch } from './events.js';

export class OrderService {
  /**
   * Create an order with escrow vault setup
   */
  static async createOrder(params: {
    campusId: string;
    buyerId: string;
    vendorId: string;
    productId?: string;
    items?: Array<{ productId: string; quantity: number; selectedSize?: string; selectedCombo?: string }>;
    itemSubtotal: number;
    dropoffHostelId: string;
    dropoffRoom: string;
    contactPhone: string;
    specialInstructions?: string;
    deliveryMethod?: 'courier_runner' | 'vendor_self';
    deliveryMode?: 'pickup' | 'batch_evening' | 'express';
    packageTag?: string;
    masterOrderNumber?: string;
    overrideFees?: {
      itemSubtotal: number;
      platformTechFee: number;
      courierDeliveryFee: number;
      totalAmount: number;
    };
    overridePin?: {
      plainPin: string;
      pinHash: string;
    };
  }) {
    const itemSummaries: string[] = [];
    const orderItems: OrderItemEntity[] = [];

    // 0. Validate product stock and availability
    if (params.items && params.items.length > 0) {
      // First verify all items in cart have sufficient stock
      for (const it of params.items) {
        const product = db.products.find((p) => p.id === it.productId);
        if (!product) {
          throw new Error(`Product not found: ${it.productId}`);
        }
        if (product.stockQuantity < it.quantity || !product.isActive) {
          throw new Error(`Product "${product.title}" has insufficient stock (${product.stockQuantity} remaining).`);
        }
      }

      // Decrement stock for all items
      for (const it of params.items) {
        const product = db.products.find((p) => p.id === it.productId)!;
        product.stockQuantity = Math.max(0, product.stockQuantity - it.quantity);
        if (product.stockQuantity === 0) {
          product.isActive = false;
        }
        db.saveProduct(product);
        itemSummaries.push(`${product.title} (x${it.quantity})`);
        const itemVendor = db.vendorProfiles.find((v) => v.id === product.vendorId);
        orderItems.push({
          productId: product.id,
          title: product.title,
          quantity: it.quantity,
          price: product.price,
          imageUrl: product.images?.[0] || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
          vendorName: itemVendor?.businessName || 'Campus Merchant',
          pickupHostel: product.hostelName || 'Joshua Hall',
          isPickedUp: false,
        });
      }
    } else if (params.productId) {
      const product = db.products.find((p) => p.id === params.productId);
      if (product) {
        if (product.stockQuantity <= 0 || !product.isActive) {
          throw new Error('This product is currently out of stock and cannot be purchased.');
        }
        // Decrement stock for the ordered item
        product.stockQuantity = Math.max(0, product.stockQuantity - 1);
        if (product.stockQuantity === 0) {
          product.isActive = false;
        }
        db.saveProduct(product);
        itemSummaries.push(product.title);
        const itemVendor = db.vendorProfiles.find((v) => v.id === product.vendorId);
        orderItems.push({
          productId: product.id,
          title: product.title,
          quantity: 1,
          price: product.price,
          imageUrl: product.images?.[0] || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
          vendorName: itemVendor?.businessName || 'Campus Merchant',
          pickupHostel: product.hostelName || 'Joshua Hall',
          isPickedUp: false,
        });
      }
    }

    // 1. Validate hostel
    const hostel = db.hostels.find((h) => h.id === params.dropoffHostelId);
    if (!hostel) {
      throw new Error('Invalid dropoff hostel specified');
    }

    // 2. Validate vendor
    const vendor = db.vendorProfiles.find((v) => v.id === params.vendorId);
    if (!vendor) {
      throw new Error('Vendor does not exist');
    }

    // 3. Calculate Escrow fees
    const fees = params.overrideFees || EscrowService.calculateFees(
      params.itemSubtotal,
      params.deliveryMode || 'express',
      1
    );

    // 4. Handshake PIN for buyer handover
    let plainPin: string;
    let pinHash: string;
    if (params.overridePin) {
      plainPin = params.overridePin.plainPin;
      pinHash = params.overridePin.pinHash;
    } else {
      const generated = await EscrowService.generateHandshakePin();
      plainPin = generated.plainPin;
      pinHash = generated.pinHash;
    }

    const campus = db.campuses.find((c) => c.id === params.campusId);
    const shortPrefix = campus ? campus.shortName.toUpperCase() : 'RUN';
    const isRun = params.campusId === 'campus-run-ede' || shortPrefix === 'RUN';
    const orderId = isRun ? `order-run-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}` : `order-${Date.now()}`;
    const orderNumber = params.packageTag || `${shortPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    const deliveryMode = params.deliveryMode || 'express';
    const deliveryMethod = params.deliveryMethod || (deliveryMode === 'pickup' ? 'vendor_self' : 'courier_runner');

    const newOrder: OrderEntity = {
      id: orderId,
      orderNumber,
      campusId: campus ? campus.id : 'campus-run-ede',
      buyerId: params.buyerId,
      vendorId: vendor.id,
      status: 'pending_payment',
      deliveryMethod,
      deliveryMode,
      packageTag: params.packageTag || orderNumber,
      masterOrderNumber: params.masterOrderNumber || orderNumber,
      items: orderItems,
      dropoffHostelId: hostel.id,
      dropoffRoom: params.dropoffRoom,
      contactPhone: params.contactPhone,
      specialInstructions: params.specialInstructions || itemSummaries.join(' • '),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newEscrow: OrderEscrowEntity = {
      id: `escrow-${Date.now()}`,
      orderId,
      itemSubtotal: fees.itemSubtotal,
      platformTechFee: fees.platformTechFee,
      courierDeliveryFee: fees.courierDeliveryFee,
      totalAmount: fees.totalAmount,
      paystackReference: `pstk_ref_${Date.now()}`,
      paystackPaymentStatus: 'unpaid',
      handshakePinHash: pinHash,
      plainPinForDev: plainPin,
      pinAttemptsCount: 0,
      createdAt: new Date(),
    };

    db.orders.unshift(newOrder);
    db.escrows.unshift(newEscrow);
    db.saveOrder(newOrder, newEscrow);

    const campusSlug = campus ? campus.slug : 'run-ede';

    // Broadcast new dispatch job to online campus couriers ONLY if courier run is requested AND order is already funded
    if (deliveryMode !== 'pickup' && fees.courierDeliveryFee > 0 && newOrder.status === 'escrow_locked') {
      broadcastCampusDispatch(campusSlug, 'dispatch:new_available', {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        packageTag: newOrder.packageTag,
        masterOrderNumber: newOrder.masterOrderNumber,
        deliveryMode: newOrder.deliveryMode,
        vendorName: vendor.businessName,
        dropoffHostel: hostel.name,
        porterLodge: hostel.porterLodgeName,
        payoutForCourier: fees.courierDeliveryFee,
        createdAt: newOrder.createdAt,
      });
    }

    // Only broadcast initial order status if already funded (avoids redundant pending_payment toast)
    if (newOrder.status === 'escrow_locked') {
      broadcastOrderStatus(newOrder.orderNumber, newOrder.status, {
        orderId: newOrder.id,
        status: newOrder.status,
      });
    }


    return {
      order: newOrder,
      escrow: {
        itemSubtotal: fees.itemSubtotal,
        platformTechFee: fees.platformTechFee,
        courierDeliveryFee: fees.courierDeliveryFee,
        totalAmount: fees.totalAmount,
        paystackReference: newEscrow.paystackReference,
      },
      // Note: plainPin is provided to buyer for order confirmation
      buyerHandshakePin: plainPin,
      paystackCheckoutUrl: `https://checkout.paystack.com/simulate/${newEscrow.paystackReference}`,
    };
  }

  /**
   * Create coordinated orders from a multi-item cart grouped by vendor
   */
  static async createCartOrders(params: {
    campusId: string;
    buyerId: string;
    items: Array<{ productId: string; quantity: number; selectedSize?: string; selectedCombo?: string }>;
    dropoffHostelId: string;
    dropoffRoom: string;
    contactPhone: string;
    specialInstructions?: string;
    deliveryMethod?: 'courier_runner' | 'vendor_self';
    deliveryMode?: 'pickup' | 'batch_evening' | 'express';
  }) {
    if (!params.items || params.items.length === 0) {
      throw new Error('Cart has no items to checkout.');
    }

    const deliveryMode = params.deliveryMode || 'batch_evening';

    // 1. Group items by vendorId & pre-validate stock
    const vendorMap: Record<string, Array<{ productId: string; quantity: number; selectedSize?: string; selectedCombo?: string }>> = {};
    let totalCartSubtotal = 0;

    for (const item of params.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stockQuantity < item.quantity || !product.isActive) {
        throw new Error(`Product "${product.title}" has insufficient stock (${product.stockQuantity} remaining).`);
      }
      const vendorId = product.vendorId;
      if (!vendorMap[vendorId]) {
        vendorMap[vendorId] = [];
      }
      vendorMap[vendorId].push(item);
      totalCartSubtotal += product.price * item.quantity;
    }

    const vendorEntries = Object.entries(vendorMap);
    const vendorCount = vendorEntries.length;

    // Calculate consolidated overall escrow fees across the whole cart
    const overallFees = EscrowService.calculateFees(totalCartSubtotal, deliveryMode, vendorCount);

    // Generate shared Master Order Number and Master Handshake PIN
    const campus = db.campuses.find((c) => c.id === params.campusId);
    const shortPrefix = campus ? campus.shortName.toUpperCase() : 'UNI';
    const masterOrderNumber = `${shortPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { plainPin: masterPlainPin, pinHash: masterPinHash } = await EscrowService.generateHandshakePin();

    const packageLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    // Split courier delivery fee across packages
    const baseCourierFeePerPackage = vendorCount > 0 ? Math.floor((overallFees.courierDeliveryFee / vendorCount) * 100) / 100 : 0;
    const courierFeeRemainder = Number((overallFees.courierDeliveryFee - (baseCourierFeePerPackage * vendorCount)).toFixed(2));

    // 2. Create one order per vendor with assigned package tag
    const createdOrders: any[] = [];
    for (let index = 0; index < vendorEntries.length; index++) {
      const [vendorId, vendorItems] = vendorEntries[index];
      let vendorSubtotal = 0;
      for (const vi of vendorItems) {
        const p = db.products.find((prod) => prod.id === vi.productId)!;
        vendorSubtotal += p.price * vi.quantity;
      }

      const pkgTag = vendorCount > 1 ? `${masterOrderNumber}-${packageLetters[index] || index + 1}` : masterOrderNumber;
      const pkgTechFee = index === 0 ? overallFees.platformTechFee : 0.0;
      const pkgCourierFee = index === 0 ? Number((baseCourierFeePerPackage + courierFeeRemainder).toFixed(2)) : baseCourierFeePerPackage;
      const pkgTotal = vendorSubtotal + pkgTechFee + pkgCourierFee;

      const orderResult = await this.createOrder({
        campusId: params.campusId,
        buyerId: params.buyerId,
        vendorId,
        items: vendorItems,
        itemSubtotal: vendorSubtotal,
        dropoffHostelId: params.dropoffHostelId,
        dropoffRoom: params.dropoffRoom,
        contactPhone: params.contactPhone,
        specialInstructions: params.specialInstructions,
        deliveryMethod: deliveryMode === 'pickup' ? 'vendor_self' : (params.deliveryMethod || 'courier_runner'),
        deliveryMode,
        packageTag: pkgTag,
        masterOrderNumber,
        overrideFees: {
          itemSubtotal: vendorSubtotal,
          platformTechFee: pkgTechFee,
          courierDeliveryFee: pkgCourierFee,
          totalAmount: pkgTotal,
        },
        overridePin: {
          plainPin: masterPlainPin,
          pinHash: masterPinHash,
        },
      });

      createdOrders.push(orderResult);
    }

    return {
      orders: createdOrders,
      primaryOrder: createdOrders[0],
      totalOrdersCount: createdOrders.length,
      masterOrderNumber,
      buyerHandshakePin: masterPlainPin,
      deliveryMode,
      overallFees: {
        itemSubtotal: totalCartSubtotal,
        platformTechFee: overallFees.platformTechFee,
        courierDeliveryFee: overallFees.courierDeliveryFee,
        totalAmount: overallFees.totalAmount,
      },
    };
  }

  /**
   * Handle Paystack payment success webhook
   */
  static async handlePaymentSuccessWebhook(paystackReference: string) {
    const escrow = db.escrows.find(
      (e) => e.paystackReference === paystackReference
    );
    if (!escrow) {
      throw new Error('Escrow record not found for this reference');
    }

    const order = db.orders.find((o) => o.id === escrow.orderId);
    if (!order) {
      throw new Error('Associated order not found');
    }

    escrow.paystackPaymentStatus = 'held_in_escrow';
    order.status = 'escrow_locked';
    order.updatedAt = new Date();
    db.saveOrder(order, escrow);

    const campus = db.campuses.find((c) => c.id === order.campusId);
    const campusSlug = campus ? campus.slug : 'run-ede';
    const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
    const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);

    // Broadcast escrow lock event to buyer and merchant
    broadcastOrderStatus(order.orderNumber, 'escrow_locked', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: 'escrow_locked',
      totalAmount: escrow.totalAmount,
    });

    // Alert campus courier fleet that order is funded and ready for pickup (only once per funded delivery run)
    if (order.deliveryMethod !== 'vendor_self' && order.deliveryMode !== 'pickup' && escrow.courierDeliveryFee > 0) {
      broadcastCampusDispatch(campusSlug, 'dispatch:new_available', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        masterOrderNumber: order.masterOrderNumber,
        vendorName: vendor?.businessName || 'Campus Vendor',
        dropoffHostel: hostel?.name || 'Hostel Ground Floor',
        porterLodge: hostel?.porterLodgeName || 'Porter Lodge',
        payoutForCourier: escrow.courierDeliveryFee,
        createdAt: order.createdAt,
      });
    }

    // Atomically lock any sibling orders belonging to this master checkout cart
    if (order.masterOrderNumber) {
      const siblingOrders = db.orders.filter(
        (o) =>
          o.id !== order.id &&
          o.masterOrderNumber === order.masterOrderNumber &&
          (o.status === 'pending_payment' || o.status === 'order_placed')
      );
      for (const sib of siblingOrders) {
        const sibEscrow = db.escrows.find((e) => e.orderId === sib.id);
        if (sibEscrow) {
          sibEscrow.paystackPaymentStatus = 'held_in_escrow';
          sib.status = 'escrow_locked';
          sib.updatedAt = new Date();
          db.saveOrder(sib, sibEscrow);
          broadcastOrderStatus(sib.orderNumber, 'escrow_locked', {
            orderId: sib.id,
            orderNumber: sib.orderNumber,
            status: 'escrow_locked',
            totalAmount: sibEscrow.totalAmount,
          });
        }
      }
    }


    return {
      message: 'Payment verified and secured in UniHive Escrow Vault',
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
    };
  }

  /**
   * Get order tracking details
   */
  static getOrderTracking(orderId: string, requestingUserId: string) {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return null;
    }

    const escrow = db.escrows.find((e) => e.orderId === order.id);
    const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);

    let resolvedCourierId = order.courierId;
    let resolvedStatus = order.status;
    if (!resolvedCourierId && order.masterOrderNumber) {
      const siblingWithCourier = db.orders.find(
        (o) => o.masterOrderNumber === order.masterOrderNumber && o.courierId
      );
      if (siblingWithCourier) {
        resolvedCourierId = siblingWithCourier.courierId;
        if (resolvedStatus === 'escrow_locked' || resolvedStatus === 'vendor_preparing' || resolvedStatus === 'pending_payment') {
          resolvedStatus = siblingWithCourier.status;
        }
      }
    }

    if (escrow?.paystackPaymentStatus === 'settled' || order.status === 'inspected_completed' || order.status === 'completed') {
      resolvedStatus = 'inspected_completed';
    }

    const courier = resolvedCourierId
      ? db.courierProfiles.find((c) => c.id === resolvedCourierId)
      : null;
    const dropoffHostel = db.hostels.find((h) => h.id === order.dropoffHostelId);

    const isBuyer = order.buyerId === requestingUserId;
    const isVendor = vendor && vendor.userId === requestingUserId;
    const isCourier = courier && courier.userId === requestingUserId;
    const user = db.users.find((u) => u.id === requestingUserId);
    const isAdmin = user && user.roles.includes('admin');

    if (!isBuyer && !isVendor && !isCourier && !isAdmin) {
      const err: any = new Error('AccessDenied: You do not have permission to view tracking for this order');
      err.status = 403;
      throw err;
    }

    const courierUser = courier
      ? db.users.find((u) => u.id === courier.userId)
      : null;

    // Collect all items across order or sibling orders sharing masterOrderNumber
    let allItems: OrderItemEntity[] = order.items && order.items.length > 0 ? [...order.items] : [];
    if (order.masterOrderNumber) {
      const siblingOrders = db.orders.filter(
        (o) => o.masterOrderNumber === order.masterOrderNumber && o.id !== order.id
      );
      for (const sib of siblingOrders) {
        if (sib.items && sib.items.length > 0) {
          allItems = allItems.concat(sib.items);
        }
      }
    }

    if (allItems.length === 0) {
      const p = db.products.find((prod) => prod.vendorId === order.vendorId) || db.products[0];
      if (p) {
        allItems = [
          {
            productId: p.id,
            title: p.title,
            quantity: 1,
            price: p.price,
            imageUrl: p.images?.[0],
            vendorName: vendor?.businessName || 'Campus Merchant',
            pickupHostel: p.hostelName || 'Joshua Hall',
            isPickedUp: order.status === 'at_porter_desk' || order.status === 'inspected_completed',
            pickedUpAt: order.status === 'at_porter_desk' || order.status === 'inspected_completed' ? order.updatedAt : undefined,
          },
        ];
      }
    }

    const pickedUpItemsCount = allItems.filter((it) => it.isPickedUp).length;
    const totalItemsCount = allItems.length;
    const allPickedUp = totalItemsCount > 0 && pickedUpItemsCount === totalItemsCount;
    const currentPickupItem = allItems.find((it) => !it.isPickedUp) || null;
    const pickupProgressPercent = totalItemsCount > 0 ? Math.round((pickedUpItemsCount / totalItemsCount) * 100) : 0;
    const consolidatedOrderNumber = order.masterOrderNumber || order.orderNumber;

    return {
      orderId: order.id,
      orderNumber: consolidatedOrderNumber,
      packageTag: order.packageTag,
      masterOrderNumber: consolidatedOrderNumber,
      deliveryMode: order.deliveryMode,
      status: order.status,
      deliveryMethod: order.deliveryMethod,
      items: allItems,
      pickedUpItemsCount,
      totalItemsCount,
      allPickedUp,
      currentPickupItem,
      pickupProgressPercent,
      order: {
        id: order.id,
        orderNumber: consolidatedOrderNumber,
        packageTag: order.packageTag,
        masterOrderNumber: consolidatedOrderNumber,
        deliveryMode: order.deliveryMode,
        status: order.status,
        dropoffRoom: order.dropoffRoom,
        contactPhone: order.contactPhone,
        specialInstructions: order.specialInstructions,
        deliveryMethod: order.deliveryMethod,
        items: allItems,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      dropoffLocation: {
        hostelName: dropoffHostel?.name,
        roomNumber: order.dropoffRoom,
        porterLodge: dropoffHostel?.porterLodgeName,
        porterPhone: dropoffHostel?.porterPhone,
      },
      dropoffHostel: dropoffHostel
        ? {
            id: dropoffHostel.id,
            name: dropoffHostel.name,
            porterLodgeName: dropoffHostel.porterLodgeName,
            porterPhone: dropoffHostel.porterPhone,
          }
        : null,
      vendor: vendor
        ? {
            id: vendor.id,
            businessName: vendor.businessName,
            trustScore: vendor.trustScore,
            bankName: vendor.bankName,
            accountNumber: vendor.accountNumber,
          }
        : null,
      courier: courier
        ? {
            id: courier.id,
            fullName: courierUser?.fullName || 'Assigned Courier',
            phone: courierUser?.phone || '08098765432',
            rating: courier.rating,
            status: courier.status,
          }
        : null,
      escrow: escrow
        ? {
            itemSubtotal: escrow.itemSubtotal,
            platformTechFee: escrow.platformTechFee,
            courierDeliveryFee: escrow.courierDeliveryFee,
            totalAmount: escrow.totalAmount,
            paymentStatus: escrow.paystackPaymentStatus,
            // Security: only buyer or admin can view the plain PIN!
            buyerSecretPin: isBuyer || isAdmin ? escrow.plainPinForDev : undefined,
            plainPinForDev: isBuyer || isAdmin ? escrow.plainPinForDev : undefined,
            pinAttemptsCount: escrow.pinAttemptsCount,
          }
        : null,
      handshakePin: isBuyer || isAdmin ? escrow?.plainPinForDev : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Get all active and historical orders for a buyer
   */
  static getBuyerOrders(buyerId: string) {
    const userOrders = db.orders
      .filter((o) => o.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const enriched = userOrders.map((order) => {
      const escrow = db.escrows.find((e) => e.orderId === order.id);
      const vendor = db.vendorProfiles.find((v) => v.id === order.vendorId);

      let resolvedCourierId = order.courierId;
      let resolvedStatus = order.status;
      if (!resolvedCourierId && order.masterOrderNumber) {
        const siblingWithCourier = db.orders.find(
          (o) => o.masterOrderNumber === order.masterOrderNumber && o.courierId
        );
        if (siblingWithCourier) {
          resolvedCourierId = siblingWithCourier.courierId;
          if (resolvedStatus === 'escrow_locked' || resolvedStatus === 'vendor_preparing' || resolvedStatus === 'pending_payment') {
            resolvedStatus = siblingWithCourier.status;
          }
        }
      }

      const courier = resolvedCourierId
        ? db.courierProfiles.find((c) => c.id === resolvedCourierId)
        : null;
      const courierUser = courier ? db.users.find((u) => u.id === courier.userId) : null;
      const dropoffHostel = db.hostels.find((h) => h.id === order.dropoffHostelId);

      if (escrow?.paystackPaymentStatus === 'settled' || order.status === 'inspected_completed' || order.status === 'completed') {
        resolvedStatus = 'inspected_completed';
      }

      const isLive = [
        'pending_payment',
        'escrow_locked',
        'vendor_preparing',
        'in_transit',
        'at_porter_desk',
        'disputed',
      ].includes(resolvedStatus) && escrow?.paystackPaymentStatus !== 'settled' && resolvedStatus !== 'inspected_completed' && resolvedStatus !== 'completed';

      const items = order.items || [];
      const pickedUpItemsCount = items.filter((i) => i.isPickedUp).length;
      const totalItemsCount = items.length;

      const itemTitleList = items.map((i) => `${i.title} (x${i.quantity})`).join(' • ');
      const title = itemTitleList || order.specialInstructions?.split(' • ')[0] || "Campus Marketplace Order";
      const calculatedSubtotal = items.reduce((s, it) => s + (it.price * it.quantity), 0);
      const resolvedSubtotal = escrow?.itemSubtotal || calculatedSubtotal || 0;
      const resolvedTotal = escrow?.totalAmount || (resolvedSubtotal + (escrow?.courierDeliveryFee || 0) + (escrow?.platformTechFee || 0));

      return {
        id: order.id,
        orderNumber: order.masterOrderNumber || order.orderNumber,
        masterOrderNumber: order.masterOrderNumber || order.orderNumber,
        status: resolvedStatus,
        isLive,
        title,
        items,
        itemSubtotal: resolvedSubtotal,
        totalAmount: resolvedTotal,
        pickedUpItemsCount,
        totalItemsCount,
        vendor: {
          id: vendor?.id || order.vendorId,
          businessName: vendor?.businessName || 'Campus Merchant',
        },
        courier: courier
          ? {
              id: courier.id,
              fullName: courierUser?.fullName || 'David A.',
              hall: 'Joshua Hall',
              rating: courier.rating || 0,
              ratingCount: courier.ratingCount || 0,
              isVetted: true,
              phone: courierUser?.phone || '08098765432',
            }
          : null,
        dropoffLocation: {
          hostelName: dropoffHostel?.name || 'Queen Esther Hall',
          roomNumber: order.dropoffRoom,
          porterLodge: dropoffHostel?.porterLodgeName || 'Ground Floor Porter Lodge',
        },
        escrow: {
          itemSubtotal: resolvedSubtotal,
          platformTechFee: escrow?.platformTechFee || 0,
          courierDeliveryFee: escrow?.courierDeliveryFee || 0,
          totalAmount: resolvedTotal,
          paymentStatus: escrow?.paystackPaymentStatus || 'pending',
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    const activeOrders = enriched.filter((o) => o.isLive);
    const pastOrders = enriched.filter((o) => !o.isLive);

    return {
      activeOrders,
      pastOrders,
      totalCount: enriched.length,
    };
  }
}
