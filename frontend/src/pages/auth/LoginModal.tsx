import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UniHiveLogo } from '../../components/common/UniHiveLogo';
import { ShieldCheck, Store, Bike, UserCheck, Key, AlertCircle, X, Lock } from 'lucide-react';
import { API } from '../../config/api';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, switchRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'vendor' | 'courier' | 'admin'>('buyer');
  const [phoneOrEmail, setPhoneOrEmail] = useState('buyer@run.edu.ng');
  const [password, setPassword] = useState('unihive2026');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleRoleTabChange = (role: 'buyer' | 'vendor' | 'courier' | 'admin') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'buyer') {
      setPhoneOrEmail('buyer@run.edu.ng');
    } else if (role === 'vendor') {
      setPhoneOrEmail('vendor@run.edu.ng');
    } else if (role === 'courier') {
      setPhoneOrEmail('courier@run.edu.ng');
    } else if (role === 'admin') {
      setPhoneOrEmail('admin@run.edu.ng');
      API.getDemoTotp()
        .then((res: any) => {
          if (res?.totp) setTotpCode(res.totp);
        })
        .catch(() => {});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(phoneOrEmail, selectedRole, password, selectedRole === 'admin' ? totpCode : undefined);
      switchRole(selectedRole);
      setIsLoginModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
      onClick={() => setIsLoginModalOpen(false)}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(15, 43, 92, 0.25)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsLoginModalOpen(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <UniHiveLogo size={44} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '10px' }}>
            UniHive™ Campus Gateway
          </h2>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Multi-Campus Auth & Institutional Escrow Gateway
          </p>
        </div>

        {/* 4-Role Switcher Tabs matching Screen 8 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '18px',
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleTabChange('buyer')}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: selectedRole === 'buyer' ? '#FFFFFF' : 'transparent',
              color: selectedRole === 'buyer' ? '#0F2B5C' : '#64748B',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: selectedRole === 'buyer' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <UserCheck size={14} />
            <span>Buyer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('vendor')}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: selectedRole === 'vendor' ? '#FFFFFF' : 'transparent',
              color: selectedRole === 'vendor' ? '#0F2B5C' : '#64748B',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: selectedRole === 'vendor' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Store size={14} />
            <span>Vendor</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('courier')}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: selectedRole === 'courier' ? '#FFFFFF' : 'transparent',
              color: selectedRole === 'courier' ? '#0F2B5C' : '#64748B',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: selectedRole === 'courier' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Bike size={14} />
            <span>Courier</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('admin')}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: selectedRole === 'admin' ? '#0B1120' : 'transparent',
              color: selectedRole === 'admin' ? '#10B981' : '#64748B',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: selectedRole === 'admin' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldCheck size={14} />
            <span>Admin</span>
          </button>
        </div>

        {/* Demo Identity Banner */}
        <div
          style={{
            background: selectedRole === 'admin' ? '#0F172A' : '#EFF6FF',
            border: '1px solid',
            borderColor: selectedRole === 'admin' ? '#334155' : '#BFDBFE',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '11px',
            color: selectedRole === 'admin' ? '#94A3B8' : '#1E40AF',
          }}
        >
          {selectedRole === 'buyer' && (
            <span>👤 Logging in as: <strong>Folake Adebayo</strong> (Student Buyer • Queen Esther Hall)</span>
          )}
          {selectedRole === 'vendor' && (
            <span>🏪 Logging in as: <strong>Tunde Kicks</strong> (Verified Merchant • Joshua Hall)</span>
          )}
          {selectedRole === 'courier' && (
            <span>🚴 Logging in as: <strong>David Adeleke</strong> (SwiftDrop Fleet Courier #87 • Contracted Partner Runner)</span>
          )}
          {selectedRole === 'admin' && (
            <span style={{ color: '#10B981' }}>🛡️ Logging in as: <strong>Chief Proctor O. Adeleke</strong> (RUN Security & Student Affairs)</span>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
              PHONE NUMBER OR STUDENT MATRIC
            </label>
            <input
              type="text"
              required
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>

          {/* Admin 2FA TOTP Field (RFC 6238) */}
          {selectedRole === 'admin' && (
            <div
              style={{
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '12px',
                color: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '11px', fontWeight: 800, color: '#10B981' }}>
                <Key size={14} />
                <span>AUTHENTICATOR 2FA TOTP CODE</span>
              </div>
              <input
                type="text"
                placeholder="6-digit TOTP (e.g. 123456)"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  background: '#1E293B',
                  color: '#F59E0B',
                  fontSize: '16px',
                  fontWeight: 800,
                  letterSpacing: '3px',
                  textAlign: 'center',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: '#64748B' }}>
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

          {error && (
            <div
              style={{
                background: '#FEF2F2',
                color: '#DC2626',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: selectedRole === 'admin' ? '#10B981' : '#F59E0B',
              color: selectedRole === 'admin' ? '#0F172A' : '#0F172A',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Lock size={14} />
            <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole.toUpperCase()}`}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#94A3B8' }}>
          By signing in you agree to RUN Zero-Room-Entry porter lodge policies.
        </div>
      </div>
    </div>
  );
};
