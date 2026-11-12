import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowRight, Store, Bike, ShoppingBag, ShieldCheck, UserCheck } from 'lucide-react';

interface RoleRestrictedViewProps {
  requiredRole: 'buyer' | 'vendor' | 'courier' | 'admin';
  onNavigateHome: () => void;
}

export const RoleRestrictedView: React.FC<RoleRestrictedViewProps> = ({
  requiredRole,
  onNavigateHome,
}) => {
  const { user, activeRole, switchRole, quickDemoLogin } = useAuth();

  const roleLabels: Record<string, { title: string; desc: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
    buyer: {
      title: 'Student Customer (Buyer)',
      desc: 'Order delivery tracking, secret PIN verification & escrow dispute complaints',
      icon: <ShoppingBag size={20} color="#92400E" />,
      color: '#92400E',
      bg: '#FEF3C7',
      border: '#FDE68A',
    },
    vendor: {
      title: 'Campus Merchant (Vendor)',
      desc: 'Merchant Studio, stock management, fulfillment pipeline & Paystack escrow payouts',
      icon: <Store size={20} color="#1E40AF" />,
      color: '#1E40AF',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    },
    courier: {
      title: 'Hostel Courier Runner',
      desc: 'Available delivery claims, bike transit routing & porter desk PIN handshakes',
      icon: <Bike size={20} color="#065F46" />,
      color: '#065F46',
      bg: '#ECFDF5',
      border: '#A7F3D0',
    },
    admin: {
      title: 'Chief Proctor Operations (Admin)',
      desc: 'Campus security command center, 3-attempt PIN lockouts & mediation dispute refunds',
      icon: <ShieldCheck size={20} color="#991B1B" />,
      color: '#991B1B',
      bg: '#FEE2E2',
      border: '#FECACA',
    },
  };

  const requiredInfo = roleLabels[requiredRole];
  const userHasPermission = user?.roles?.includes(requiredRole);

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '32px auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FEF2F2',
          border: '2px solid #FCA5A5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <ShieldAlert size={32} color="#DC2626" />
      </div>

      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#DC2626',
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        ROLE-BASED ACCESS CONTROL (RBAC) ENFORCED
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
        Access Restricted to {requiredInfo.title}
      </h2>

      <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
        This campus portal requires verified <strong>{requiredRole.toUpperCase()}</strong> permissions. You are currently active as{' '}
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '11px',
            background: roleLabels[activeRole]?.bg || '#F1F5F9',
            color: roleLabels[activeRole]?.color || '#0F172A',
            border: `1px solid ${roleLabels[activeRole]?.border || '#E2E8F0'}`,
            textTransform: 'uppercase',
          }}
        >
          {activeRole}
        </span>
        .
      </p>

      {/* Scope Card */}
      <div
        style={{
          width: '100%',
          background: '#F8FAFC',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {requiredInfo.icon}
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
            {requiredInfo.title} Scope
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          {requiredInfo.desc}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {userHasPermission ? (
          <button
            onClick={() => switchRole(requiredRole)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '12px',
              border: 'none',
              background: '#0F2B5C',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 43, 92, 0.15)',
            }}
          >
            <UserCheck size={16} />
            <span>Switch to {requiredRole.toUpperCase()} Mode</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => quickDemoLogin(requiredRole)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '12px',
              border: 'none',
              background: '#F59E0B',
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
            }}
          >
            <UserCheck size={16} />
            <span>Switch Persona to {requiredRole.toUpperCase()}</span>
            <ArrowRight size={14} />
          </button>
        )}

        <button
          onClick={onNavigateHome}
          style={{
            width: '100%',
            padding: '11px 18px',
            borderRadius: '12px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            color: '#334155',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Return to My {activeRole.toUpperCase()} Workspace
        </button>
      </div>
    </div>
  );
};
