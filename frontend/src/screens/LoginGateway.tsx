import React, { useState } from 'react';
import { ChevronDown, User, Lock, Eye, EyeOff, ShieldCheck, MessageCircle, GraduationCap, ArrowRight } from 'lucide-react';
import { UniHiveLogo } from '../components/common/UniHiveLogo';
import { MobileStatusBar } from '../components/common/MobileStatusBar';

interface LoginGatewayProps {
  onNavigate: (screenId: string) => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({ onNavigate }) => {
  const [activeRole, setActiveRole] = useState<'buyer' | 'vendor' | 'courier' | 'admin'>('buyer');
  const [identifier, setIdentifier] = useState('0812 345 0001');
  const [password, setPassword] = useState('unihive2026');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPhone, setRememberPhone] = useState(true);

  const handleRoleChange = (role: 'buyer' | 'vendor' | 'courier' | 'admin') => {
    setActiveRole(role);
    if (role === 'buyer') setIdentifier('0812 345 0001');
    else if (role === 'vendor') setIdentifier('0812 345 0002');
    else if (role === 'courier') setIdentifier('0812 345 0003');
    else if (role === 'admin') setIdentifier('0812 345 0004');
  };

  const handleSignIn = () => {
    if (activeRole === 'buyer') onNavigate('01_home');
    else if (activeRole === 'vendor') onNavigate('06_vendor');
    else if (activeRole === 'courier') onNavigate('07_dispatch');
    else if (activeRole === 'admin') onNavigate('10_admin_desktop');
  };

  const getRoutingLabel = () => {
    switch (activeRole) {
      case 'buyer':
        return (
          <>
            Routing to: <span style={{ fontWeight: 800 }}>Student Buyer Marketplace</span> (Escrow Protected)
          </>
        );
      case 'vendor':
        return (
          <>
            Routing to: <span style={{ fontWeight: 800 }}>Campus Merchant Studio</span> (Direct Bank Auto-Payout)
          </>
        );
      case 'courier':
        return (
          <>
            Routing to: <span style={{ fontWeight: 800 }}>Logistics Fleet Courier Terminal</span> (SwiftDrop Dispatch)
          </>
        );
      case 'admin':
        return (
          <>
            Routing to: <span style={{ fontWeight: 800 }}>Operations Command Center</span> (2FA Enforced)
          </>
        );
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
        minHeight: '844px',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <MobileStatusBar />

      {/* Main Content Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 30px 24px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <UniHiveLogo size={52} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F2B5C', lineHeight: 1.1 }}>
            Uni<span style={{ color: '#F59E0B' }}>Hive</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
            The Connected Campus Marketplace & Dispatch
          </div>
        </div>

        {/* Campus Selector */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 800, color: '#2563EB', letterSpacing: '0.4px', marginBottom: '6px' }}>
            <span>🎓</span>
            <span>SELECT UNIVERSITY CAMPUS</span>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏛️</span>
              <span>Redeemer's University (Ede)</span>
            </div>
            <ChevronDown size={16} color="#64748B" />
          </div>
        </div>

        {/* QUICK ROLE ROUTING */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', marginBottom: '6px' }}>
            QUICK ROLE ROUTING
          </div>

          <div
            style={{
              background: '#F1F5F9',
              borderRadius: '14px',
              padding: '4px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              marginBottom: '10px',
            }}
          >
            {[
              { id: 'buyer', label: 'Buyer', icon: '🛍️' },
              { id: 'vendor', label: 'Vendor', icon: '🏬' },
              { id: 'courier', label: 'Courier', icon: '🚲' },
              { id: 'admin', label: 'Admin', icon: '🛡️' },
            ].map((r) => {
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id as any)}
                  style={{
                    background: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? '#0F172A' : '#64748B',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '11px' }}>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Routing Notification Pill */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '11px',
              color: '#1D4ED8',
              textAlign: 'center',
            }}
          >
            {getRoutingLabel()}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', marginBottom: '6px' }}>
              PHONE NUMBER, RUN MATRIC NO. OR @RUN.EDU.NG EMAIL
            </div>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <User size={16} color="#64748B" />
              <input
                type="text"
                placeholder="e.g. 0812 345 0001 or buyer@run.edu.ng"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                PASSWORD OR SECURITY PIN
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}>
                Forgot PIN?
              </span>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Lock size={16} color="#64748B" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
              </button>
            </div>
          </div>

          {/* If Admin, show 2FA TOTP */}
          {activeRole === 'admin' && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', letterSpacing: '0.4px', marginBottom: '6px' }}>
                GOOGLE AUTHENTICATOR 2FA CODE
              </div>
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ShieldCheck size={16} color="#DC2626" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit TOTP"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>
          )}

          {/* Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setRememberPhone(!rememberPhone)}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                background: rememberPhone ? '#2563EB' : '#FFFFFF',
                border: rememberPhone ? 'none' : '1.5px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              {rememberPhone && '✓'}
            </div>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Remember this campus phone</span>
          </div>
        </div>

        {/* Primary Sign In Button */}
        <button
          onClick={handleSignIn}
          style={{
            width: '100%',
            background: '#0F2B5C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15, 43, 92, 0.25)',
            marginBottom: '16px',
          }}
        >
          <span>Sign In to UniHive</span>
          <ArrowRight size={16} />
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>
            OR CONNECT INSTANTLY
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* Alternative Login Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {/* WhatsApp OTP Button */}
          <button
            onClick={() => onNavigate('01_home')}
            style={{
              width: '100%',
              background: '#ECFDF5',
              border: '1.5px solid #10B981',
              color: '#059669',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <MessageCircle size={16} color="#059669" />
            <span>Login via WhatsApp OTP (No Password)</span>
          </button>

          {/* RUN Student Portal Button */}
          <button
            onClick={() => onNavigate('01_home')}
            style={{
              width: '100%',
              background: '#EFF6FF',
              border: '1.5px solid #3B82F6',
              color: '#1D4ED8',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <GraduationCap size={16} color="#1D4ED8" />
            <span>Log in with RUN Student Portal</span>
          </button>
        </div>

        {/* Footer Links */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
          <div style={{ marginBottom: '12px' }}>
            Don't have a campus account?{' '}
            <span
              onClick={() => onNavigate('09_signup')}
              style={{ fontWeight: 800, color: '#0F2B5C', cursor: 'pointer' }}
            >
              Create RUN Account
            </span>
          </div>

          <div
            onClick={() => {
              setActiveRole('admin');
              onNavigate('10_admin_desktop');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#F59E0B',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span>🛡️</span>
            <span>Campus Staff & Logistics Admin Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
