import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'unihive-dev-secret-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_2FA_ISSUER: process.env.ADMIN_2FA_ISSUER || 'UniHive Admin',

  // Paystack
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_unihive',
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_mock_unihive',
  PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET || 'whsec_mock_unihive',

  // Mandatory Platform Financial Fees (NGN)
  PLATFORM_TECH_FEE: 100.0,
  HOSTEL_COURIER_FEE: 500.0,
  HOSTEL_COURIER_FEE_PICKUP: 0.0,
  HOSTEL_COURIER_FEE_BATCH: 500.0,
  HOSTEL_COURIER_FEE_EXPRESS: 1500.0,

  // Maximum allowed PIN handshake attempts before security lock
  MAX_PIN_ATTEMPTS: 3,
};

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('unihive-dev-secret')) {
    throw new Error(
      'FATAL SECURITY ERROR: JWT_SECRET must be explicitly set to a strong secret in production environment.'
    );
  }
}
