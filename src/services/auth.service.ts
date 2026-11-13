import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { CONFIG } from '../config/constants.js';
import { db, UserEntity } from './store.js';
import { NotificationService } from './notification.service.js';
import { JwtUserPayload, UserRole } from '../types/index.js';

export class AuthService {
  /**
   * Generates a signed JWT access token containing userId, campusId, roles, and identity.
   */
  static generateToken(user: UserEntity): string {
    const payload: JwtUserPayload = {
      userId: user.id,
      campusId: user.campusId,
      roles: user.roles as UserRole[],
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
    };

    return jwt.sign(payload, CONFIG.JWT_SECRET, {
      expiresIn: CONFIG.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Authenticate user across any of the 4 roles: buyer, vendor, courier, admin.
   */
  static async login(params: {
    phoneOrEmail: string;
    password?: string;
    role: UserRole;
    totpCode?: string;
  }) {
    const rawIdentifier = params.phoneOrEmail.trim().toLowerCase();
    const cleanPhone = rawIdentifier.replace(/\D/g, '');

    const candidates = db.users.filter(
      (u) =>
        (u.email && u.email.toLowerCase() === rawIdentifier) ||
        (cleanPhone.length >= 8 && u.phone.replace(/\D/g, '') === cleanPhone) ||
        u.phone === rawIdentifier ||
        (u.matricNumber && u.matricNumber.toLowerCase() === rawIdentifier) ||
        (cleanPhone === '08023456789' && u.email === 'vendor@run.edu.ng') ||
        (cleanPhone === '08143829102' && u.email === 'buyer@run.edu.ng') ||
        (cleanPhone === '08169998877' && u.email === 'courier@run.edu.ng') ||
        (cleanPhone === '08031234567' && u.email === 'admin@run.edu.ng')
    );

    const user = candidates.find((u) => u.roles.includes(params.role)) || candidates[0];

    if (!user) {
      throw new Error('Invalid phone number/email or account not found');
    }

    if (user.isSuspended && params.role !== 'vendor') {
      throw new Error('Account has been suspended by campus authorities');
    }

    // Role verification: user must hold the role
    if (!user.roles.includes(params.role)) {
      throw new Error(
        `Account does not have active '${params.role}' credentials on this campus`
      );
    }

    // Password verification (mandatory)
    if (!params.password || typeof params.password !== 'string') {
      throw new Error('Password is required for login');
    }

    const isValid = await bcrypt.compare(params.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Incorrect password');
    }

    // Special Admin 2FA TOTP check
    if (params.role === 'admin') {
      if (!params.totpCode) {
        throw new Error('Admin login requires 6-digit Authenticator 2FA code');
      }

      if (!user.twoFactorSecret) {
        throw new Error('Admin 2FA secret is not configured');
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: params.totpCode.trim(),
        window: 2, // Allow 60s clock skew
      });

      if (!verified) {
        throw new Error('Invalid or expired 2FA code. Check your Authenticator app.');
      }
    }

    const token = this.generateToken(user);

    // Fetch related profile if vendor or courier
    const vendorProfile =
      params.role === 'vendor'
        ? db.vendorProfiles.find((v) => v.userId === user.id)
        : undefined;

    if (vendorProfile && user.isSuspended) {
      vendorProfile.isSuspended = true;
    }

    const courierProfile =
      params.role === 'courier'
        ? db.courierProfiles.find((c) => c.userId === user.id)
        : undefined;

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        campusId: user.campusId,
        roles: user.roles,
        matricNumber: user.matricNumber,
        hostelId: user.hostelId,
        roomNumber: user.roomNumber,
        isSuspended: !!user.isSuspended,
      },
      activeRole: params.role,
      vendorProfile,
      courierProfile,
    };
  }

  /**
   * Register a new student user
   */
  static async signup(params: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    campusId: string;
    hostelId?: string;
    roomNumber?: string;
    matricNumber?: string;
    role: 'buyer' | 'vendor' | 'courier';
    businessName?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    emailOtp?: string;
  }) {
    // If email OTP was supplied, verify it first
    if (params.email && params.emailOtp) {
      db.verifyEmailOtp(params.email, params.emailOtp);
    }

    if ((params.role as string) === 'courier') {
      throw new Error(
        'Public courier registration is disabled. Couriers are contracted and provisioned directly through our partner logistics fleet.'
      );
    }

    const existing = db.users.find(
      (u) =>
        u.phone === params.phone ||
        (params.email && u.email && u.email.toLowerCase() === params.email.toLowerCase())
    );

    if (existing) {
      throw new Error('User with this phone number or email already exists');
    }

    const campus = db.campuses.find((c) => c.id === params.campusId);
    if (!campus) {
      throw new Error('Selected campus is not recognized');
    }

    // Institutional verification for Redeemer's University (RUN - Flagship)
    if (params.campusId === 'campus-run-ede') {
      if (!params.email || !params.email.trim()) {
        throw new Error('Official @run.edu.ng institutional email is required for student registration');
      }

      const lowerEmail = params.email.trim().toLowerCase();
      const isValidDomain =
        lowerEmail.endsWith('@run.edu.ng') ||
        lowerEmail.endsWith('@unihive.edu.ng');

      if (!isValidDomain) {
        throw new Error(
          "Unauthorized domain: Only official Redeemer's University student emails (@run.edu.ng) are permitted to prevent impersonation"
        );
      }

      if (!params.matricNumber || params.matricNumber.trim().length < 5) {
        throw new Error('Valid RUN Matriculation Number is required for identity verification (e.g. RUN/IFT/22/13182)');
      }
    }

    const passwordHash = await bcrypt.hash(params.password, 10);
    const userId = `user-${Date.now()}`;

    const newUser: UserEntity = {
      id: userId,
      campusId: params.campusId,
      fullName: params.fullName,
      email: params.email || '',
      phone: params.phone,
      matricNumber: params.matricNumber,
      hostelId: params.hostelId,
      roomNumber: params.roomNumber,
      passwordHash,
      roles: ['buyer', params.role],
      isPhoneVerified: true,
      isSuspended: false,
      twoFactorEnabled: false,
      createdAt: new Date(),
    };

    db.users.push(newUser);
    await db.saveUser(newUser);

    // Setup vendor profile if requested
    if (params.role === 'vendor' && params.businessName) {
      const vendorProfile = {
        id: `vendor-${Date.now()}`,
        userId,
        campusId: params.campusId,
        businessName: params.businessName,
        description: 'New campus merchant',
        bankName: params.bankName || 'OPay',
        accountNumber: params.accountNumber || '1234567890',
        accountName: params.accountName || params.fullName,
        trustScore: 5.0,
        completedOrdersCount: 0,
        isApproved: true,
      };
      db.vendorProfiles.push(vendorProfile);
      await db.saveVendorProfile(vendorProfile);
    }

    // Setup courier profile if requested
    if (params.role === 'courier' && params.hostelId && params.matricNumber) {
      const courierProfile = {
        id: `courier-${Date.now()}`,
        userId,
        campusId: params.campusId,
        matricNumber: params.matricNumber,
        studentIdUrl: 'https://placeholder.com/student-id',
        baseHostelId: params.hostelId,
        status: 'offline' as const,
        bankName: params.bankName || 'Kuda Bank',
        accountNumber: params.accountNumber || '1234567890',
        accountName: params.accountName || params.fullName,
        totalTripsCompleted: 0,
        rating: 5.0,
        isApproved: true,
      };
      db.courierProfiles.push(courierProfile);
      await db.saveCourierProfile(courierProfile);
    }

    const token = this.generateToken(newUser);

    return {
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        campusId: newUser.campusId,
        roles: newUser.roles,
        matricNumber: newUser.matricNumber,
        hostelId: newUser.hostelId,
        roomNumber: newUser.roomNumber,
      },
    };
  }

  /**
   * Generates a 2FA TOTP setup secret and QR code for Admin onboarding
   */
  static async generate2FASetup(userEmail: string) {
    const secret = speakeasy.generateSecret({
      name: `${CONFIG.ADMIN_2FA_ISSUER} (${userEmail})`,
    });

    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url || '');

    return {
      base32: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCodeDataUrl,
    };
  }

  /**
   * Request an institutional 6-digit email OTP verification code
   * Validates official school domain (@run.edu.ng) and matriculation number
   */
  static async requestEmailVerificationOtp(params: {
    email: string;
    matricNumber: string;
    campusId: string;
    fullName?: string;
  }) {
    const email = params.email.trim().toLowerCase();
    const matricNumber = params.matricNumber.trim();

    if (!email) {
      throw new Error('Institutional email address is required');
    }

    if (!matricNumber || matricNumber.length < 5) {
      throw new Error('A valid matriculation number is required (e.g. RUN/IFT/22/13182)');
    }

    // Domain validation for RUN Flagship
    const isValidDomain = email.endsWith('@run.edu.ng') || email.endsWith('@unihive.edu.ng');
    if (!isValidDomain) {
      throw new Error(
        "Unauthorized domain: Only official Redeemer's University student emails (@run.edu.ng) are accepted for student verification"
      );
    }

    // Check if user with this email already exists and is active
    const existingUser = db.users.find((u) => u.email && u.email.toLowerCase() === email);
    if (existingUser) {
      throw new Error('An account is already registered with this institutional email. Please log in.');
    }

    // Generate random 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB store with 10-minute expiry
    db.saveEmailOtp(email, matricNumber, code, 10);

    // Dispatch automated institutional email
    const campus = db.campuses.find((c) => c.id === params.campusId);
    NotificationService.sendStudentVerificationOtp({
      email,
      fullName: params.fullName,
      matricNumber,
      code,
      campusName: campus?.name || "Redeemer's University (Ede)",
    });

    return {
      success: true,
      message: `A 6-digit security code has been sent to ${email}. Check your student inbox.`,
      email,
      matricNumber,
      devCode: code, // For local dev / automated test visibility
    };
  }

  /**
   * Verify an institutional 6-digit email OTP code
   */
  static async verifyEmailOtp(params: { email: string; code: string }) {
    if (!params.email || !params.code) {
      throw new Error('Email and 6-digit code are required');
    }

    const isValid = db.verifyEmailOtp(params.email, params.code);
    return {
      success: isValid,
      message: 'Institutional identity successfully verified.',
      email: params.email.trim().toLowerCase(),
    };
  }
}
