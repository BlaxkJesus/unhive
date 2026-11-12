import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { UniHiveLogo } from '../../components/common/UniHiveLogo';
import {
  ShoppingBag,
  Bike,
  Store,
  ShieldCheck,
  Lock,
  ArrowRight,
  GraduationCap,
  Key,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Mail,
  RotateCcw,
  Check,
} from 'lucide-react';
import { API } from '../../config/api';

type UserRole = 'buyer' | 'courier' | 'vendor' | 'admin';

export const AuthGatewayPage: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const { currentCampus, hostels } = useCampus();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('buyer@run.edu.ng');
  const [loginPassword, setLoginPassword] = useState('unihive2026');
  const [totpCode, setTotpCode] = useState('');

  // Sign up form state
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('unihive2026');
  const [matricNumber, setMatricNumber] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('hostel-run-queen-esther');
  const [businessName, setBusinessName] = useState('');

  // 2-Step OTP state
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [emailOtp, setEmailOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setSuccessMsg(null);

    // Auto-fill test credentials for convenience
    if (role === 'buyer') {
      setLoginIdentifier('buyer@run.edu.ng');
      setLoginPassword('unihive2026');
    } else if (role === 'courier') {
      setLoginIdentifier('courier@run.edu.ng');
      setLoginPassword('unihive2026');
    } else if (role === 'vendor') {
      setLoginIdentifier('vendor@run.edu.ng');
      setLoginPassword('unihive2026');
    } else if (role === 'admin') {
      setLoginIdentifier('admin@run.edu.ng');
      setLoginPassword('unihive2026');
      API.getDemoTotp()
        .then((res: any) => {
          if (res?.totp) setTotpCode(res.totp);
        })
        .catch(() => {});
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(
        loginIdentifier,
        selectedRole,
        loginPassword,
        selectedRole === 'admin' ? totpCode : undefined
      );
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const email = signupEmail.trim().toLowerCase();
    const matric = matricNumber.trim();

    const campusId = currentCampus?.id || 'campus-run-ede';
    const schoolDomain = '@run.edu.ng';

    if (!email) {
      setError(`Official student email is required (${schoolDomain}).`);
      return;
    }

    if (!email.endsWith('@run.edu.ng') && !email.endsWith('@unihive.edu.ng')) {
      setError(`Unauthorized email domain: You must use an official @run.edu.ng student email to prevent impersonation.`);
      return;
    }

    if (!matric || matric.length < 5) {
      setError(`A valid RUN Matriculation Number is required for identity verification (e.g. RUN/IFT/22/13182).`);
      return;
    }

    setLoading(true);
    try {
      const res = await API.sendEmailOtp({
        email,
        matricNumber: matric,
        campusId,
        fullName,
      });

      if (res.success) {
        setDevOtp(res.data?.devCode || '123456');
        setSignupStep('otp');
        setSuccessMsg(`A 6-digit security code has been sent to ${email}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code to email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = signupEmail.trim().toLowerCase();
    const code = emailOtp.trim();

    if (!code || code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      setLoading(false);
      return;
    }

    try {
      // 1. Verify OTP
      await API.verifyEmailOtp({ email, code });

      // 2. Complete Signup with verified credentials
      const res = await API.signup({
        campusId: currentCampus?.id || 'campus-run-ede',
        fullName,
        phone: signupPhone,
        email,
        password: signupPassword,
        matricNumber: matricNumber.trim(),
        hostelId: selectedHostel,
        roomNumber: 'Ground Floor Porter Lodge',
        role: selectedRole,
        businessName: selectedRole === 'vendor' ? businessName : undefined,
        emailOtp: code,
      });

      if (res.success) {
        setSuccessMsg('Identity authenticated! Activating your account...');
        setTimeout(async () => {
          await login(signupPhone, selectedRole, signupPassword);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Verification or registration failed. Check the 6-digit code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0F2B5C',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        color: '#FFFFFF',
      }}
    >
      {/* Main Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
          padding: '32px 28px',
          color: '#0F172A',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <UniHiveLogo size={42} />
            <span style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px' }}>
              <span style={{ color: '#0F2B5C' }}>Uni</span>
              <span style={{ color: '#D97706' }}>Hive</span>
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 12px 0', fontWeight: 500 }}>
            Redeemer's University Marketplace & Dispatch Network
          </p>

          {/* Campus Indicator Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#1E3A8A',
            }}
          >
            <GraduationCap size={14} color="#1E3A8A" />
            <span>{currentCampus ? currentCampus.name : "Redeemer's University (RUN)"}</span>
            <span>•</span>
            <span style={{ color: '#059669', fontWeight: 800 }}>Flagship Active</span>
          </div>
        </div>

        {/* Quick Demo Access for Testing */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>
              DEMO PREVIEW ROLES
            </span>
            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
              Select role to test
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => quickDemoLogin('buyer')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
              title="Enter as Student Buyer"
            >
              Buyer
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('vendor')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
              title="Enter as Student Vendor"
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('courier')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
              title="Enter as Hostel Runner"
            >
              Courier
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('admin')}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: '1px solid #0F2B5C',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
              title="Enter as Proctor Admin"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Auth Mode Tabs (Sign In vs Sign Up) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            style={{
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              background: authMode === 'login' ? '#FFFFFF' : 'transparent',
              color: authMode === 'login' ? '#0F2B5C' : '#64748B',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              if (selectedRole === 'courier' || selectedRole === 'admin') {
                handleRoleSelect('buyer');
              }
              setError(null);
            }}
            style={{
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              background: authMode === 'signup' ? '#FFFFFF' : 'transparent',
              color: authMode === 'signup' ? '#0F2B5C' : '#64748B',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: authMode === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Stage / Role Selector Cards */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '8px' }}>
            {authMode === 'signup' ? 'SELECT REGISTRATION ROLE' : 'SELECT YOUR CAMPUS ROLE'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: authMode === 'signup' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '6px' }}>
            {/* 1. Customer */}
            <button
              type="button"
              onClick={() => handleRoleSelect('buyer')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: authMode === 'signup' ? '14px 8px' : '10px 4px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: selectedRole === 'buyer' ? '#0F2B5C' : '#E2E8F0',
                background: selectedRole === 'buyer' ? '#F0F5FF' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: selectedRole === 'buyer' ? '#0F2B5C' : '#F1F5F9',
                  color: selectedRole === 'buyer' ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}
              >
                <ShoppingBag size={16} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: selectedRole === 'buyer' ? '#0F2B5C' : '#64748B' }}>
                {authMode === 'signup' ? 'Student Customer' : 'Customer'}
              </span>
            </button>

            {/* 2. Courier (Contracted Partner Fleet - Login Only) */}
            {authMode === 'login' && (
              <button
                type="button"
                onClick={() => handleRoleSelect('courier')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: selectedRole === 'courier' ? '#10B981' : '#E2E8F0',
                  background: selectedRole === 'courier' ? '#ECFDF5' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: selectedRole === 'courier' ? '#10B981' : '#F1F5F9',
                    color: selectedRole === 'courier' ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <Bike size={16} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: selectedRole === 'courier' ? '#065F46' : '#64748B' }}>
                  Courier
                </span>
              </button>
            )}

            {/* 3. Vendor */}
            <button
              type="button"
              onClick={() => handleRoleSelect('vendor')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: authMode === 'signup' ? '14px 8px' : '10px 4px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: selectedRole === 'vendor' ? '#F59E0B' : '#E2E8F0',
                background: selectedRole === 'vendor' ? '#FFFBEB' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: selectedRole === 'vendor' ? '#F59E0B' : '#F1F5F9',
                  color: selectedRole === 'vendor' ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}
              >
                <Store size={16} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: selectedRole === 'vendor' ? '#92400E' : '#64748B' }}>
                {authMode === 'signup' ? 'Campus Merchant' : 'Vendor'}
              </span>
            </button>

            {/* 4. Admin (Login Only) */}
            {authMode === 'login' && (
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: selectedRole === 'admin' ? '#0B1120' : '#E2E8F0',
                  background: selectedRole === 'admin' ? '#0B1120' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: selectedRole === 'admin' ? '#10B981' : '#F1F5F9',
                    color: selectedRole === 'admin' ? '#0B1120' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <ShieldCheck size={16} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: selectedRole === 'admin' ? '#10B981' : '#64748B' }}>
                  Admin
                </span>
              </button>
            )}
          </div>

          {/* Contracted Logistics Fleet Notice for Signup Mode */}
          {authMode === 'signup' && (
            <div
              style={{
                marginTop: '10px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '10px 12px',
                fontSize: '11.5px',
                color: '#475569',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '15px', flexShrink: 0 }}>🚚</span>
              <div>
                <strong style={{ color: '#0F2B5C' }}>Contracted Logistics Fleet Notice:</strong> Campus courier deliveries are operated by contracted professional logistics fleet partners. Courier runner accounts are pre-provisioned by logistics dispatch and cannot be registered publicly.{' '}
                <span
                  onClick={() => {
                    setAuthMode('login');
                    handleRoleSelect('courier');
                  }}
                  style={{ color: '#2563EB', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Sign in to Courier Terminal ➔
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Role Access Scope Info Box */}
        <div
          style={{
            background:
              selectedRole === 'buyer'
                ? '#F0F5FF'
                : selectedRole === 'courier'
                ? '#ECFDF5'
                : selectedRole === 'vendor'
                ? '#FFFBEB'
                : '#0F172A',
            border: '1px solid',
            borderColor:
              selectedRole === 'buyer'
                ? '#BFDBFE'
                : selectedRole === 'courier'
                ? '#A7F3D0'
                : selectedRole === 'vendor'
                ? '#FDE68A'
                : '#334155',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '12px',
            lineHeight: 1.4,
            color: selectedRole === 'admin' ? '#E2E8F0' : '#1E293B',
          }}
        >
          {selectedRole === 'buyer' && (
            <div>
              <strong style={{ color: '#1E3A8A' }}>Customer Access:</strong>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                Restricted to <strong>Marketplace Only</strong>. Browse campus catalog, order with 4-digit PIN escrow, and track courier drop-offs at ground-floor porter lodge.
              </div>
            </div>
          )}
          {selectedRole === 'courier' && (
            <div>
              <strong style={{ color: '#065F46' }}>Logistics Partner Fleet Access:</strong>
              <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                Pre-provisioned runner terminal for contracted logistics couriers. Access the <strong>Courier Dispatch Portal</strong>, claim assigned orders, verify 4-digit inspection PINs at porter lodges, and receive automated trip payouts.
              </div>
            </div>
          )}
          {selectedRole === 'vendor' && (
            <div>
              <strong style={{ color: '#92400E' }}>Campus Vendor Access:</strong>
              <div style={{ fontSize: '11px', color: '#B45309', marginTop: '2px' }}>
                Full access to <strong>Vendor Studio</strong> & <strong>Marketplace</strong>. List products, monitor active sales, and receive automated OPay payouts upon delivery inspection.
              </div>
            </div>
          )}
          {selectedRole === 'admin' && (
            <div>
              <strong style={{ color: '#047857' }}>Chief Proctor Access:</strong>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Supervisory access to <strong>Admin Command Center</strong>, real-time dispatch streams, PIN lockout dispute mediation desk, and platform escrow audits.
              </div>
            </div>
          )}
        </div>

        {/* Success / Error Messages */}
        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#059669',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* AUTH FORM: LOGIN */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '5px' }}>
                PHONE NUMBER OR EMAIL
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. 08143829102"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '5px' }}>
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Admin 2FA TOTP Field (RFC 6238) */}
            {selectedRole === 'admin' && (
              <div
                style={{
                  background: '#0B1120',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '11px', fontWeight: 800, color: '#10B981' }}>
                  <Key size={14} />
                  <span>2FA TOTP AUTHENTICATOR PIN</span>
                </div>
                <input
                  type="text"
                  placeholder="6-digit PIN"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    background: '#1E293B',
                    color: '#10B981',
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '4px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                    Secret: <code>JBSWY3DPEHPK3PXP</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      API.getDemoTotp().then((res: any) => {
                        if (res?.totp) setTotpCode(res.totp);
                      });
                    }}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10B981',
                      color: '#6EE7B7',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Fetch Live TOTP
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: selectedRole === 'admin' ? '#10B981' : '#0F2B5C',
                color: selectedRole === 'admin' ? '#0F172A' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15, 43, 92, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <Lock size={16} />
              <span>{loading ? 'Verifying...' : `Sign In as ${selectedRole.toUpperCase()}`}</span>
              <ArrowRight size={16} />
            </button>

            {/* Quick 1-Click Demo Logins */}
            <div style={{ marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textAlign: 'center', marginBottom: '10px', letterSpacing: '0.4px' }}>
                OR 1-CLICK INSTANT DEMO SIGN IN
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('buyer')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                    background: '#EFF6FF',
                    color: '#1E3A8A',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={12} color="#2563EB" />
                  <span>Buyer: Folake</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('courier')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #A7F3D0',
                    background: '#ECFDF5',
                    color: '#065F46',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={12} color="#10B981" />
                  <span>Courier: David</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('vendor')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A',
                    background: '#FFFBEB',
                    color: '#92400E',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={12} color="#F59E0B" />
                  <span>Vendor: Tunde</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('admin')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    background: '#0B1120',
                    color: '#10B981',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={12} color="#10B981" />
                  <span>Admin: Proctor</span>
                </button>
              </div>
            </div>
          </form>
        ) : signupStep === 'form' ? (
          /* AUTH FORM: SIGN UP - STEP 1 (STUDENT DETAILS & INSTITUTIONAL EMAIL) */
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#1E40AF' }}>
              <GraduationCap size={16} color="#1E3A8A" />
              <span><strong>{currentCampus ? currentCampus.name : "Redeemer's University (Ede)"}</strong> • Student Enrollment</span>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                FULL NAME
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kolawole Balogun"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08143829102"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  RUN MATRIC NUMBER
                </label>
                <input
                  type="text"
                  required
                  placeholder="RUN/IFT/22/13182"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Official University Email Field */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>
                  OFFICIAL INSTITUTIONAL EMAIL
                </label>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669' }}>
                  Anti-Impersonation
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748B',
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="your.name@run.edu.ng"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                Only official <code>@run.edu.ng</code> addresses are permitted to verify active enrollment.
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                {currentCampus?.shortName || 'RUN'} HOSTEL / PORTER LODGE DROPOFF
              </label>
              <select
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                {hostels && hostels.length > 0 ? (
                  hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.gender === 'female' ? 'Female' : 'Male'})
                    </option>
                  ))
                ) : (
                  <>
                    <optgroup label="Female Hostels">
                      <option value="hostel-run-queen-esther">Queen Esther Hall</option>
                      <option value="hostel-run-deborah">Deborah Hall</option>
                      <option value="hostel-run-guest-house">Guest House</option>
                      <option value="hostel-run-dorcas">Dorcas Hall</option>
                    </optgroup>
                    <optgroup label="Male Hostels">
                      <option value="hostel-run-prophet-moses">Prophet Moses Hall</option>
                      <option value="hostel-run-joshua">Joshua Hall</option>
                      <option value="hostel-run-peter">Peter Hostel</option>
                    </optgroup>
                  </>
                )}
              </select>
            </div>

            {selectedRole === 'vendor' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  BUSINESS / BRAND NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${currentCampus?.shortName || 'RUN'} Thrift Kicks`}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                boxShadow: '0 4px 12px rgba(15, 43, 92, 0.25)',
              }}
            >
              <Mail size={16} />
              <span>{loading ? 'Dispatching...' : 'Send 6-Digit Verification Code'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* AUTH FORM: SIGN UP - STEP 2 (6-DIGIT EMAIL OTP VERIFICATION PAD) */
          <form onSubmit={handleVerifyOtpAndSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#0F2B5C',
                  color: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  boxShadow: '0 4px 10px rgba(15, 43, 92, 0.2)',
                }}
              >
                <Lock size={20} />
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F2B5C' }}>
                Verify Institutional Identity
              </div>
              <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                We sent a 6-digit authentication code to:
                <br />
                <strong style={{ color: '#1E3A8A' }}>{signupEmail}</strong>
              </p>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', textAlign: 'center', marginBottom: '8px' }}>
                ENTER 6-DIGIT VERIFICATION CODE
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="• • • • • •"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #2563EB',
                  background: '#F8FAFC',
                  color: '#0F2B5C',
                  fontSize: '26px',
                  fontWeight: 900,
                  letterSpacing: '10px',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />

              {devOtp && (
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setEmailOtp(devOtp)}
                    style={{
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#92400E',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Dev Code:</span>
                    <code>{devOtp}</code>
                    <span style={{ textDecoration: 'underline', marginLeft: '4px' }}>(Click to fill)</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="submit"
                disabled={loading || emailOtp.length !== 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: emailOtp.length === 6 ? 'pointer' : 'not-allowed',
                  opacity: emailOtp.length === 6 ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                }}
              >
                <Check size={18} />
                <span>{loading ? 'Verifying...' : `Verify & Activate ${selectedRole.toUpperCase()} Account`}</span>
              </button>

              <button
                type="button"
                onClick={() => setSignupStep('form')}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: 'transparent',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={13} />
                <span>Change Email / Edit Details</span>
              </button>
            </div>
          </form>
        )}

        {/* Institutional Trust Footer */}
        <div
          style={{
            marginTop: '22px',
            borderTop: '1px solid #F1F5F9',
            paddingTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '11px',
            color: '#64748B',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>Zero-Room-Entry Mandate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={14} color="#F59E0B" />
            <span>4-Digit Escrow Vault</span>
          </div>
        </div>
      </div>

      {/* Campus Bottom Notice */}
      <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
        UniHive™ Multi-Campus Network • Powered by Paystack Escrow & OPay Instant Settlement
      </div>
    </div>
  );
};
