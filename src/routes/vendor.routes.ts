import { Router, Response } from 'express';
import { db } from '../services/store.js';
import { NotificationService } from '../services/notification.service.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

export const vendorRouter = Router();

// GET /api/v1/vendor/orders
vendorRouter.get(
  '/orders',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      if (!vendor) {
        res.status(404).json({ error: 'VendorNotFound', message: 'Vendor profile not found for user' });
        return;
      }

      const vendorOrders = db.orders
        .filter((o) => o.vendorId === vendor.id)
        .map((order) => {
          const buyer = db.users.find((u) => u.id === order.buyerId);
          const hostel = db.hostels.find((h) => h.id === order.dropoffHostelId);
          const escrow = db.escrows.find((e) => e.orderId === order.id);
          const courier = order.courierId ? db.courierProfiles.find((c) => c.id === order.courierId) : null;
          const courierUser = courier ? db.users.find((u) => u.id === courier.userId) : null;

          // Resolve order items and exact pricing dynamically without hardcoded fallbacks
          const detailedItems = (order.items || []).map((it) => {
            const prod = db.products.find((p) => p.id === it.productId);
            const unitPrice = prod?.price || 0;
            const qty = it.quantity || 1;
            return {
              productId: it.productId,
              title: prod?.title || 'Campus Marketplace Item',
              price: unitPrice,
              quantity: qty,
              selectedSize: it.selectedSize,
              selectedCombo: it.selectedCombo,
              subtotal: unitPrice * qty,
              category: prod?.category || 'general',
              imageUrl: prod?.images?.[0] || prod?.imageUrl,
            };
          });

          const itemsSubtotal = detailedItems.reduce((sum, it) => sum + it.subtotal, 0);
          const resolvedPrice = escrow?.itemSubtotal !== undefined ? escrow.itemSubtotal : itemsSubtotal;
          const resolvedTotal = escrow?.totalAmount !== undefined
            ? escrow.totalAmount
            : (resolvedPrice + (escrow?.courierDeliveryFee || 0) + (escrow?.platformTechFee || 0));

          const vendorProduct = db.products.find((p) => p.vendorId === vendor.id);
          const itemTitle = detailedItems.length > 0
            ? detailedItems.map((i) => `${i.title} (x${i.quantity})`).join(', ')
            : (vendorProduct ? vendorProduct.title : 'Campus Marketplace Order Item');

          return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            itemTitle,
            items: detailedItems,
            category: detailedItems[0]?.category || vendorProduct?.category || 'general',
            product: {
              title: itemTitle,
              category: detailedItems[0]?.category || vendorProduct?.category || 'general',
            },
            deliveryMethod: order.deliveryMethod || 'courier_runner',
            deliveryMode: order.deliveryMode || 'batch_evening',
            specialInstructions: order.specialInstructions || '',
            escrowStatus: escrow?.paystackPaymentStatus || 'unpaid',
            pinAttemptsCount: escrow?.pinAttemptsCount || 0,
            price: resolvedPrice,
            itemSubtotal: resolvedPrice,
            escrowTotal: resolvedTotal,
            totalAmount: resolvedTotal,
            courierFee: escrow?.courierDeliveryFee || 0,
            buyer: {
              name: buyer?.fullName || 'Student Buyer',
              phone: order.contactPhone || buyer?.phone || 'N/A',
              roomNumber: order.dropoffRoom,
            },

            dropoff: {
              hostelName: hostel?.name || 'Campus Hostel',
              porterLodge: hostel?.porterLodgeName || 'Ground-Floor Porter Lodge',
              porterPhone: hostel?.porterPhone,
            },
            dropoffHostel: {
              name: hostel?.name || 'Campus Hostel',
              porterLodgeName: hostel?.porterLodgeName || 'Ground-Floor Porter Lodge',
              porterPhone: hostel?.porterPhone,
            },
            courier: courierUser
              ? {
                  name: courierUser.fullName,
                  phone: courierUser.phone,
                  rating: courier?.rating || 4.9,
                }
              : null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const counts = {
        in_transit: vendorOrders.filter((o) => o.status === 'in_transit').length,
        at_porter_desk: vendorOrders.filter((o) => o.status === 'at_porter_desk').length,
        completed: vendorOrders.filter((o) => o.status === 'inspected_completed').length,
        refunded: vendorOrders.filter((o) => o.status === 'refunded').length,
        disputed: vendorOrders.filter((o) => o.status === 'disputed').length,
        total: vendorOrders.length,
      };

      res.status(200).json({
        success: true,
        data: {
          orders: vendorOrders,
          counts,
          vendor: {
            id: vendor.id,
            businessName: vendor.businessName,
            bankName: vendor.bankName,
            accountNumber: vendor.accountNumber,
            trustScore: vendor.trustScore,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'VendorOrdersFetchFailed', message: err.message });
    }
  }
);

// GET /api/v1/vendor/payout-accounts
vendorRouter.get(
  '/payout-accounts',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      if (!vendor) {
        res.status(404).json({ error: 'VendorNotFound', message: 'Vendor profile not found for user' });
        return;
      }

      const accounts = db.getVendorPayoutAccounts(vendor.id);
      res.status(200).json({
        success: true,
        data: {
          vendorId: vendor.id,
          businessName: vendor.businessName,
          accounts,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'PayoutAccountsFetchFailed', message: err.message });
    }
  }
);

// POST /api/v1/vendor/payout-accounts
vendorRouter.post(
  '/payout-accounts',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      if (!vendor) {
        res.status(404).json({ error: 'VendorNotFound', message: 'Vendor profile not found for user' });
        return;
      }

      const { bankName, bankCode, accountNumber, accountName, isPrimary } = req.body;

      if (!bankName || typeof bankName !== 'string' || !bankName.trim()) {
        res.status(400).json({ error: 'InvalidBankName', message: 'Bank name is required' });
        return;
      }

      if (!accountNumber || typeof accountNumber !== 'string' || !/^\d{10}$/.test(accountNumber.trim())) {
        res.status(400).json({
          error: 'InvalidAccountNumber',
          message: 'Account number must be exactly 10 digits (Nigerian NUBAN)',
        });
        return;
      }

      if (!accountName || typeof accountName !== 'string' || accountName.trim().length < 2) {
        res.status(400).json({
          error: 'InvalidAccountName',
          message: 'Verified account holder name is required',
        });
        return;
      }

      const created = db.addVendorPayoutAccount(vendor.id, {
        bankName: bankName.trim(),
        bankCode: (bankCode && String(bankCode).trim()) || bankName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim().toUpperCase(),
        isPrimary: Boolean(isPrimary),
      });

      res.status(201).json({
        success: true,
        message: 'Payout account successfully registered',
        data: created,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'PayoutAccountCreateFailed', message: err.message });
    }
  }
);

// PUT /api/v1/vendor/payout-accounts/:id/primary
vendorRouter.put(
  '/payout-accounts/:id/primary',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      if (!vendor) {
        res.status(404).json({ error: 'VendorNotFound', message: 'Vendor profile not found for user' });
        return;
      }

      const accountId = req.params.id as string;
      const updated = db.setPrimaryPayoutAccount(vendor.id, accountId);
      if (!updated) {
        res.status(404).json({
          error: 'AccountNotFound',
          message: 'Payout account not found or does not belong to vendor',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Primary settlement switched to ${updated.bankName} (${updated.accountNumber})`,
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'SetPrimaryPayoutAccountFailed', message: err.message });
    }
  }
);

// DELETE /api/v1/vendor/payout-accounts/:id
vendorRouter.delete(
  '/payout-accounts/:id',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const vendor = db.vendorProfiles.find((v) => v.userId === req.user!.userId);
      if (!vendor) {
        res.status(404).json({ error: 'VendorNotFound', message: 'Vendor profile not found for user' });
        return;
      }

      const accountId = req.params.id as string;
      const success = db.deleteVendorPayoutAccount(vendor.id, accountId);
      if (!success) {
        res.status(404).json({
          error: 'AccountNotFound',
          message: 'Payout account not found or does not belong to vendor',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Payout account removed successfully',
      });
    } catch (err: any) {
      res.status(400).json({
        error: 'PayoutAccountDeleteFailed',
        message: err.message || 'Failed to delete payout account',
      });
    }
  }
);

// GET /api/v1/vendor/notifications
vendorRouter.get(
  '/notifications',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const notifications = NotificationService.getVendorNotifications(req.user!.userId);
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'VendorNotificationsFetchFailed', message: err.message });
    }
  }
);

// DELETE /api/v1/vendor/notifications
vendorRouter.delete(
  '/notifications',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      NotificationService.clearVendorNotifications(req.user!.userId);
      res.status(200).json({
        success: true,
        message: 'All vendor email notifications cleared successfully',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'VendorNotificationsClearFailed', message: err.message });
    }
  }
);



