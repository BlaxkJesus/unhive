import { Router, Response } from 'express';
import speakeasy from 'speakeasy';
import { AuthService } from '../services/auth.service.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

export const authRouter = Router();

// POST /api/v1/auth/login (4-Role Unified Gateway)
authRouter.post('/login', async (req, res): Promise<void> => {
  try {
    const { phoneOrEmail, password, role, totpCode } = req.body;

    if (!phoneOrEmail || !password || !role) {
      res.status(400).json({
        error: 'BadRequest',
        message: 'phoneOrEmail, password, and role are required',
      });
      return;
    }

    const result = await AuthService.login({
      phoneOrEmail,
      password,
      role,
      totpCode,
    });

    res.status(200).json({
      success: true,
      message: `Successfully authenticated as ${role}`,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'AuthenticationFailed',
      message: err.message || 'Login failed',
    });
  }
});

// POST /api/v1/auth/signup
authRouter.post('/signup', async (req, res): Promise<void> => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      campusId,
      hostelId,
      roomNumber,
      matricNumber,
      role = 'buyer',
      businessName,
      bankName,
      accountNumber,
      accountName,
      emailOtp,
    } = req.body;

    if (!fullName || !phone || !password) {
      res.status(400).json({
        error: 'BadRequest',
        message: 'fullName, phone, and password are required',
      });
      return;
    }

    const resolvedCampusId = campusId || 'campus-run-ede';

    const result = await AuthService.signup({
      fullName,
      phone,
      email,
      password,
      campusId: resolvedCampusId,
      hostelId,
      roomNumber,
      matricNumber,
      role,
      businessName,
      bankName,
      accountNumber,
      accountName,
      emailOtp,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'RegistrationFailed',
      message: err.message || 'Sign up failed',
    });
  }
});

// POST /api/v1/auth/send-email-otp (Anti-Impersonation 6-Digit Email Verification)
authRouter.post('/send-email-otp', async (req, res): Promise<void> => {
  try {
    const { email, matricNumber, campusId, fullName } = req.body;

    if (!email || !matricNumber) {
      res.status(400).json({
        error: 'BadRequest',
        message: 'Institutional email and matriculation number are required',
      });
      return;
    }

    const resolvedCampusId = campusId || 'campus-run-ede';

    const result = await AuthService.requestEmailVerificationOtp({
      email,
      matricNumber,
      campusId: resolvedCampusId,
      fullName,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'OtpDispatchFailed',
      message: err.message || 'Failed to dispatch verification code',
    });
  }
});

// POST /api/v1/auth/verify-email-otp
authRouter.post('/verify-email-otp', async (req, res): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        error: 'BadRequest',
        message: 'Email and 6-digit code are required',
      });
      return;
    }

    const result = await AuthService.verifyEmailOtp({ email, code });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'OtpVerificationFailed',
      message: err.message || 'Invalid or expired verification code',
    });
  }
});

// GET /api/v1/auth/demo-totp (Returns active RFC 6238 TOTP code for demo admin access)
authRouter.get('/demo-totp', (_req, res): void => {
  const code = speakeasy.totp({
    secret: 'JBSWY3DPEHPK3PXP',
    encoding: 'base32',
  });
  res.status(200).json({ success: true, totp: code });
});

// GET /api/v1/auth/me
authRouter.get('/me', authenticateJwt, (req: AuthenticatedRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// POST /api/v1/auth/admin/setup-2fa
authRouter.post(
  '/admin/setup-2fa',
  authenticateJwt,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const email = req.user?.email || 'admin@unihive.edu.ng';
      const setup = await AuthService.generate2FASetup(email);

      res.status(200).json({
        success: true,
        message: 'Scan this QR code with Google Authenticator or enter the base32 key',
        data: setup,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate 2FA key', message: err.message });
    }
  }
);
