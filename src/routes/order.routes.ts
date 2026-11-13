import crypto from 'crypto';
import { Router, Response } from 'express';
import { OrderService } from '../services/order.service.js';
import { EscrowService } from '../services/escrow.service.js';
import { AdminService } from '../services/admin.service.js';
import { CONFIG } from '../config/constants.js';
import {
  authenticateJwt,
  resolveCampusContext,
} from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

export const orderRouter = Router();

// POST /api/v1/orders/create
orderRouter.post(
  '/create',
  authenticateJwt,
  resolveCampusContext,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        vendorId,
        productId,
        itemSubtotal,
        dropoffHostelId,
        dropoffRoom,
        contactPhone,
        specialInstructions,
        deliveryMethod,
      } = req.body;

      if (!vendorId || !itemSubtotal || !dropoffHostelId || !dropoffRoom) {
        res.status(400).json({
          error: 'BadRequest',
          message:
            'vendorId, itemSubtotal, dropoffHostelId, and dropoffRoom are required',
        });
        return;
      }

      const result = await OrderService.createOrder({
        campusId: req.campusId!,
        buyerId: req.user!.userId,
        vendorId,
        productId,
        itemSubtotal: parseFloat(itemSubtotal),
        dropoffHostelId,
        dropoffRoom,
        contactPhone: contactPhone || req.user!.phone,
        specialInstructions,
        deliveryMethod,
      });

      res.status(201).json({
        success: true,
        message: 'Order created with locked escrow terms',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        error: 'OrderCreationFailed',
        message: err.message || 'Failed to create order',
      });
    }
  }
);

// POST /api/v1/orders/checkout-cart (Checkout multi-item cart grouped by vendor)
orderRouter.post(
  '/checkout-cart',
  authenticateJwt,
  resolveCampusContext,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        items,
        dropoffHostelId,
        dropoffRoom,
        contactPhone,
        specialInstructions,
        deliveryMethod,
        deliveryMode,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'A non-empty items array is required to checkout cart',
        });
        return;
      }

      const effectiveHostelId = dropoffHostelId || 'hostel-run-queen-esther';
      const effectiveRoom = dropoffRoom || (deliveryMode === 'pickup' ? 'Ground-Floor Lodge Pickup' : '');

      if (!effectiveRoom) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'dropoffHostelId and dropoffRoom are required for hostel delivery',
        });
        return;
      }

      const result = await OrderService.createCartOrders({
        campusId: req.campusId!,
        buyerId: req.user!.userId,
        items,
        dropoffHostelId: effectiveHostelId,
        dropoffRoom: effectiveRoom,
        contactPhone: contactPhone || req.user!.phone,
        specialInstructions,
        deliveryMethod,
        deliveryMode,
      });

      res.status(201).json({
        success: true,
        message: `Successfully created ${result.totalOrdersCount} package order(s) with locked escrow`,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        error: 'CartCheckoutFailed',
        message: err.message || 'Failed to checkout cart orders',
      });
    }
  }
);

// GET /api/v1/orders/my-orders (Buyer's active and historical orders)
orderRouter.get(
  '/my-orders',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const result = OrderService.getBuyerOrders(req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        error: 'FetchOrdersFailed',
        message: err.message || 'Failed to fetch buyer orders',
      });
    }
  }
);

// GET /api/v1/orders/:id/tracking
orderRouter.get(
  '/:id/tracking',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const tracking = OrderService.getOrderTracking(
        String(req.params.id),
        req.user!.userId
      );

      if (!tracking) {
        res.status(404).json({ error: 'OrderNotFound', message: 'Order tracking not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: tracking,
      });
    } catch (err: any) {
      res.status(err.status || 403).json({
        error: 'Forbidden',
        message: err.message || 'Access denied. You do not have permission to inspect this order.',
      });
    }
  }
);

// POST /api/v1/webhooks/paystack (Public Webhook listener with HMAC SHA-512 verification)
// POST /api/v1/orders/paystack/demo-checkout (Demonstration Paystack Escrow Payment)
orderRouter.post('/paystack/demo-checkout', async (req, res): Promise<void> => {
  try {
    const { reference, channel, customerEmail } = req.body;
    const targetRef = reference || req.body?.data?.reference;

    if (!targetRef) {
      res.status(400).json({ error: 'InvalidPayload', message: 'Paystack reference is required' });
      return;
    }

    const result = await OrderService.handlePaymentSuccessWebhook(targetRef);

    res.status(200).json({
      success: true,
      message: 'Demo Paystack Escrow Payment Authorized & Locked',
      data: {
        reference: targetRef,
        channel: channel || 'card',
        gatewayResponse: 'Approved (Demo Paystack Escrow)',
        paidAt: new Date().toISOString(),
        order: result,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: 'PaymentSimulationFailed', message: err.message });
  }
});

// POST /api/v1/orders/webhooks/paystack (Public Webhook listener with HMAC SHA-512 verification)
orderRouter.post('/webhooks/paystack', async (req, res): Promise<void> => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature) {
      res.status(401).json({
        error: 'UnauthorizedWebhook',
        message: 'Missing x-paystack-signature verification header',
      });
      return;
    }

    const hash = crypto
      .createHmac('sha512', CONFIG.PAYSTACK_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      res.status(401).json({
        error: 'UnauthorizedWebhook',
        message: 'Invalid cryptographic webhook signature',
      });
      return;
    }

    const { reference, event } = req.body;
    const targetRef = reference || req.body?.data?.reference;

    if (!targetRef) {
      res.status(400).json({ error: 'InvalidWebhookPayload', message: 'Payment reference missing' });
      return;
    }

    const result = await OrderService.handlePaymentSuccessWebhook(targetRef);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'WebhookProcessingFailed', message: err.message });
  }
});

// POST /api/v1/orders/:id/dispute (Customer raises physical inspection complaint with optional 5s video)
orderRouter.post(
  '/:id/dispute',
  authenticateJwt,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reason, issueCategory, videoUrl, buyerStatement } = req.body;

      if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'Please provide a detailed complaint explanation (at least 5 characters).',
        });
        return;
      }

      const result = await EscrowService.raiseBuyerDispute({
        orderId: String(req.params.id),
        buyerUserId: req.user!.userId,
        reason,
        issueCategory,
        videoUrl,
        buyerStatement,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        error: 'DisputeCreationFailed',
        message: err.message || 'Failed to lodge complaint',
      });
    }
  }
);

// POST /api/v1/orders/:id/dispute/vendor-statement (Vendor submits statement/defense in open dispute)
orderRouter.post(
  '/:id/dispute/vendor-statement',
  authenticateJwt,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { statement } = req.body;
      if (!statement || typeof statement !== 'string' || statement.trim().length < 3) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'Please provide a valid vendor statement (at least 3 characters).',
        });
        return;
      }

      const result = await AdminService.submitVendorStatement({
        orderId: String(req.params.id),
        vendorUserId: req.user!.userId,
        statement: statement.trim(),
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({
        error: 'StatementSubmissionFailed',
        message: err.message || 'Failed to submit statement',
      });
    }
  }
);
