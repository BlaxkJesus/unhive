import { Router, Response } from 'express';
import { AdminService } from '../services/admin.service.js';
import {
  authenticateJwt,
  requireRole,
} from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

export const adminRouter = Router();

// Enforce admin role across all endpoints
adminRouter.use(authenticateJwt, requireRole('admin'));

// GET /api/v1/admin/dashboard-stats
adminRouter.get('/dashboard-stats', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const stats = AdminService.getDashboardStats(campusId);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// GET /api/v1/admin/dispatch-stream (Real-time live deliveries)
adminRouter.get('/dispatch-stream', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const stream = AdminService.getDispatchStream(campusId);

  res.status(200).json({
    success: true,
    count: stream.length,
    data: stream,
  });
});

// GET /api/v1/admin/disputes (Mediation queue)
adminRouter.get('/disputes', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const disputes = AdminService.getDisputes(campusId);

  res.status(200).json({
    success: true,
    count: disputes.length,
    data: disputes,
  });
});

// GET /api/v1/admin/disputes/:id (Single dispute case file)
adminRouter.get('/disputes/:id', (req: AuthenticatedRequest, res: Response): void => {
  const dispute = AdminService.getDisputeById(String(req.params.id));

  if (!dispute) {
    res.status(404).json({
      error: 'NotFound',
      message: 'Dispute case not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: dispute,
  });
});

// GET /api/v1/admin/payouts (Recent settlement and payout audit transactions)
adminRouter.get('/payouts', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const payouts = AdminService.getPayouts(campusId);

  res.status(200).json({
    success: true,
    count: payouts.length,
    data: payouts,
  });
});

// POST /api/v1/admin/disputes/:id/resolve
adminRouter.post('/disputes/:id/resolve', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { action, resolutionNotes } = req.body;

    if (!action || !['refund_buyer', 'release_to_vendor'].includes(action)) {
      res.status(400).json({
        error: 'BadRequest',
        message: "action must be either 'refund_buyer' or 'release_to_vendor'",
      });
      return;
    }

    const result = AdminService.resolveDispute({
      disputeId: String(req.params.id),
      adminUserId: req.user!.userId,
      action,
      resolutionNotes: resolutionNotes || 'Mediation completed by campus proctor',
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'DisputeResolutionFailed', message: err.message });
  }
});

// POST /api/v1/admin/couriers/provision
adminRouter.post('/couriers/provision', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fullName, whatsappPhone, baseHostelId, campusId, customPassword, bankName, accountNumber } = req.body;

    const result = await AdminService.provisionFleetCourier({
      fullName,
      whatsappPhone,
      baseHostelId,
      campusId,
      customPassword,
      bankName,
      accountNumber,
    });

    res.status(201).json({
      success: true,
      message: `Fleet courier ${fullName} successfully provisioned with WhatsApp credentials`,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'CourierProvisionFailed', message: err.message });
  }
});

// GET /api/v1/admin/couriers (Option B1: List all fleet couriers)
adminRouter.get('/couriers', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const couriers = AdminService.getCouriers(campusId);

  res.status(200).json({
    success: true,
    count: couriers.length,
    data: couriers,
  });
});

// POST /api/v1/admin/couriers/:id/status (Option B1: Update fleet runner status)
adminRouter.post('/couriers/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { isApproved, status, isSuspended } = req.body;
    const result = await AdminService.updateCourierStatus(String(req.params.id), {
      isApproved,
      status,
      isSuspended,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'CourierUpdateFailed', message: err.message });
  }
});

// GET /api/v1/admin/vendors (Option B2: List campus stores & merchant KYC)
adminRouter.get('/vendors', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const vendors = AdminService.getVendors(campusId);

  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors,
  });
});

// POST /api/v1/admin/vendors/:id/status (Option B2: Verify or suspend merchant store)
adminRouter.post('/vendors/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { isApproved, isSuspended } = req.body;
    const result = await AdminService.updateVendorStatus(String(req.params.id), {
      isApproved,
      isSuspended,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'VendorUpdateFailed', message: err.message });
  }
});

// GET /api/v1/admin/products (Option B3: List products across campus for moderation)
adminRouter.get('/products', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const vendorId = req.query.vendorId as string;
  const products = AdminService.getProducts(campusId, vendorId);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// POST /api/v1/admin/products/:id/moderate (Option B3: Moderate product listing)
adminRouter.post('/products/:id/moderate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { isActive, reason } = req.body;
    if (typeof isActive !== 'boolean') {
      res.status(400).json({ error: 'BadRequest', message: 'isActive must be a boolean' });
      return;
    }

    const result = await AdminService.moderateProduct(String(req.params.id), {
      isActive,
      reason,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'ProductModerationFailed', message: err.message });
  }
});
