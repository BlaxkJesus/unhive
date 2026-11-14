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

    if (!resolutionNotes || typeof resolutionNotes !== 'string' || resolutionNotes.trim().length < 3) {
      res.status(400).json({
        error: 'BadRequest',
        message: 'A proctor verdict statement explaining why this decision was reached is strictly required.',
      });
      return;
    }

    const result = AdminService.resolveDispute({
      disputeId: String(req.params.id),
      adminUserId: req.user!.userId,
      action,
      resolutionNotes: resolutionNotes.trim(),
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

// POST /api/v1/admin/vendors/:id/reinstate (Reinstate suspended vendor after reviewing appeal)
adminRouter.post('/vendors/:id/reinstate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await AdminService.updateVendorStatus(String(req.params.id), {
      isSuspended: false,
      isApproved: true,
    });
    res.status(200).json({
      success: true,
      message: 'Vendor successfully reinstated and appeal marked reviewed.',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'VendorReinstatementFailed', message: err.message });
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

// =========================================================================
// OPTION C: ENTERPRISE COMMAND CENTER & CAMPUS OPS ARCHITECTURE ENDPOINTS
// =========================================================================

// GET /api/v1/admin/campus-policies/:campusId
adminRouter.get('/campus-policies/:campusId', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = String(req.params.campusId);
  const policy = AdminService.getCampusPolicy(campusId);
  const curfewStatus = AdminService.getCurfewStatus(campusId);

  res.status(200).json({
    success: true,
    data: {
      policy,
      curfewStatus,
    },
  });
});

// PUT /api/v1/admin/campus-policies/:campusId
adminRouter.put('/campus-policies/:campusId', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const campusId = String(req.params.campusId);
    const updates = req.body;
    const policy = AdminService.updateCampusPolicy({
      campusId,
      updates,
      proctorId: req.user?.userId,
      proctorName: 'Chief Proctor',
    });

    res.status(200).json({
      success: true,
      message: 'Campus policies and delivery rules updated successfully.',
      data: policy,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'PolicyUpdateFailed', message: err.message });
  }
});

// POST /api/v1/admin/curfew-override
adminRouter.post('/curfew-override', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { campusId, isOverride } = req.body;
    const status = AdminService.toggleCurfewOverride({
      campusId: campusId || 'campus-run-ede',
      isOverride: !!isOverride,
      proctorId: req.user?.userId,
      proctorName: 'Chief Proctor',
    });

    res.status(200).json({
      success: true,
      message: isOverride ? 'Emergency Proctor Curfew Lockdown Activated.' : 'Curfew Lockdown Released.',
      data: status,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'CurfewOverrideFailed', message: err.message });
  }
});

// GET /api/v1/admin/audit-logs
adminRouter.get('/audit-logs', (req: AuthenticatedRequest, res: Response): void => {
  const { actionType, proctorId, search } = req.query;
  const logs = AdminService.getAuditLogs({
    actionType: actionType as string,
    proctorId: proctorId as string,
    search: search as string,
  });

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// GET /api/v1/admin/audit-logs/export-csv
adminRouter.get('/audit-logs/export-csv', (req: AuthenticatedRequest, res: Response): void => {
  const { actionType, proctorId, search } = req.query;
  const csv = AdminService.getAuditLogsCSV({
    actionType: actionType as string,
    proctorId: proctorId as string,
    search: search as string,
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="proctor-security-audit-trail.csv"');
  res.status(200).send(csv);
});

// GET /api/v1/admin/reconciliation
adminRouter.get('/reconciliation', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const data = AdminService.getReconciliation(campusId);

  res.status(200).json({
    success: true,
    data,
  });
});

// GET /api/v1/admin/reconciliation/export-csv
adminRouter.get('/reconciliation/export-csv', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = req.query.campusId as string;
  const csv = AdminService.getReconciliationCSV(campusId);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bursary-escrow-settlement-reconciliation.csv"');
  res.status(200).send(csv);
});

// GET /api/v1/admin/telemetry
adminRouter.get('/telemetry', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = (req.query.campusId as string) || 'campus-run-ede';
  const data = AdminService.getTelemetry(campusId);

  res.status(200).json({
    success: true,
    data,
  });
});

// POST /api/v1/admin/demo/seed-temporary-transactions
adminRouter.post('/demo/seed-temporary-transactions', (req: AuthenticatedRequest, res: Response): void => {
  const campusId = (req.body.campusId as string) || 'campus-run-ede';
  const result = AdminService.seedTemporaryDummyTransactions(campusId);

  res.status(201).json({
    success: true,
    ...result,
  });
});

// POST /api/v1/admin/demo/clear-temporary-transactions
adminRouter.post('/demo/clear-temporary-transactions', (req: AuthenticatedRequest, res: Response): void => {
  const result = AdminService.clearTemporaryDummyTransactions();

  res.status(200).json({
    success: true,
    ...result,
  });
});
