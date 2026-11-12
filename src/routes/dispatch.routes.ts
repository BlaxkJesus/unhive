import { Router, Response } from 'express';
import { DispatchService } from '../services/dispatch.service.js';
import { EscrowService } from '../services/escrow.service.js';
import {
  authenticateJwt,
  requireRole,
  resolveCampusContext,
} from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

export const dispatchRouter = Router();

// GET /api/v1/dispatch/available (Deliveries available for runners)
dispatchRouter.get(
  '/available',
  authenticateJwt,
  requireRole('courier'),
  resolveCampusContext,
  (req: AuthenticatedRequest, res: Response): void => {
    const deliveries = DispatchService.getAvailableDeliveries(req.campusId!);
    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });
  }
);

// GET /api/v1/dispatch/active-job (Courier's current active ongoing delivery)
dispatchRouter.get(
  '/active-job',
  authenticateJwt,
  requireRole('courier'),
  (req: AuthenticatedRequest, res: Response): void => {
    const job = DispatchService.getCourierActiveJob(req.user!.userId);
    res.status(200).json({
      success: true,
      data: job,
    });
  }
);

// GET /api/v1/dispatch/active-jobs (Courier's all active ongoing deliveries in batch manifest)
dispatchRouter.get(
  '/active-jobs',
  authenticateJwt,
  requireRole('courier'),
  (req: AuthenticatedRequest, res: Response): void => {
    const jobs = DispatchService.getCourierActiveJobs(req.user!.userId);
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  }
);

// GET /api/v1/dispatch/stats (Courier shift earnings, completed trips, rating, and linked bank account)
dispatchRouter.get(
  '/stats',
  authenticateJwt,
  requireRole('courier'),
  (req: AuthenticatedRequest, res: Response): void => {
    const stats = DispatchService.getCourierStats(req.user!.userId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

// GET /api/v1/dispatch/completed (Courier's history of completed runs, dispatches and earnings)
dispatchRouter.get(
  '/completed',
  authenticateJwt,
  requireRole('courier'),
  (req: AuthenticatedRequest, res: Response): void => {
    const completedRuns = DispatchService.getCourierCompletedRuns(req.user!.userId);
    res.status(200).json({
      success: true,
      count: completedRuns.length,
      data: completedRuns,
    });
  }
);


// POST /api/v1/dispatch/accept (Courier accepts job)
dispatchRouter.post(
  '/accept',
  authenticateJwt,
  requireRole('courier'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        res.status(400).json({ error: 'BadRequest', message: 'orderId is required' });
        return;
      }

      const result = DispatchService.acceptDelivery({
        orderId,
        courierUserId: req.user!.userId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ error: 'ClaimDeliveryFailed', message: err.message });
    }
  }
);

// POST /api/v1/dispatch/milestone (Courier updates status)
dispatchRouter.post(
  '/milestone',
  authenticateJwt,
  requireRole('courier'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { orderId, milestone } = req.body;
      if (!orderId || !milestone) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'orderId and milestone (in_transit or at_porter_desk) are required',
        });
        return;
      }

      const result = DispatchService.updateDeliveryMilestone({
        orderId,
        courierUserId: req.user!.userId,
        milestone,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ error: 'UpdateMilestoneFailed', message: err.message });
    }
  }
);

// POST /api/v1/dispatch/confirm-pickup (Courier confirms item pickup stop)
dispatchRouter.post(
  '/confirm-pickup',
  authenticateJwt,
  requireRole('courier'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { orderId, productId } = req.body;
      if (!orderId) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'orderId is required',
        });
        return;
      }

      const result = DispatchService.confirmItemPickup({
        orderId,
        productId,
        courierUserId: req.user!.userId,
      });

      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: 'ConfirmPickupFailed', message: err.message });
    }
  }
);

// POST /api/v1/dispatch/verify-pin (Ground-Floor Porter Lodge Physical Inspection Handshake)
dispatchRouter.post(
  '/verify-pin',
  authenticateJwt,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { orderId, pin } = req.body;

      if (!orderId || !pin) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'orderId and 4-digit pin are required',
        });
        return;
      }

      const settlement = await EscrowService.verifyHandshakePin({
        orderId,
        submittedPin: pin.toString(),
        verifiedByUserId: req.user!.userId,
      });

      res.status(200).json({
        success: true,
        message:
          'Handshake verified! Item approved. Atomic dual-settlement payouts executed successfully via Paystack subaccounts.',
        data: settlement,
      });
    } catch (err: any) {
      const isUnauthorized = err.message && err.message.includes('UnauthorizedVerifier');
      res.status(isUnauthorized ? 403 : 400).json({
        error: isUnauthorized ? 'Forbidden' : 'PinVerificationFailed',
        message: err.message || 'Verification failed',
      });
    }
  }
);

// POST /api/v1/dispatch/bank-account (Courier adds a payout bank account - max 2)
dispatchRouter.post(
  '/bank-account',
  authenticateJwt,
  requireRole('courier'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { bankName, accountNumber, accountName } = req.body;
      if (!bankName || !accountNumber || !accountName) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'bankName, accountNumber, and accountName are required',
        });
        return;
      }

      if (!/^\d{10}$/.test(accountNumber.trim())) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'Account number must be exactly 10 digits',
        });
        return;
      }

      const result = DispatchService.addCourierBankAccount(req.user!.userId, {
        bankName,
        accountNumber,
        accountName,
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: 'AddBankFailed', message: err.message });
    }
  }
);

// POST /api/v1/dispatch/rate (Buyer rates courier after successful delivery)
dispatchRouter.post(
  '/rate',
  authenticateJwt,
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { orderId, courierId, rating, comment } = req.body;
      if (!orderId || rating === undefined) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'orderId and rating (1-5) are required',
        });
        return;
      }

      const result = DispatchService.rateCourier({
        orderId,
        courierId,
        rating: Number(rating),
        comment,
      });

      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: 'RateCourierFailed', message: err.message });
    }
  }
);
