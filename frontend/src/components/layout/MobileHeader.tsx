import React, { useState } from 'react';
import { useCampus } from '../../context/CampusContext';
import { useAuth } from '../../context/AuthContext';
import { UniHiveLogo } from '../common/UniHiveLogo';
import {
  GraduationCap,
  ChevronDown,
  ShoppingBag,
  Store,
  Bike,
  ShieldCheck,
  LogOut,
  UserCheck,
  Shield,
  X,
  CheckCircle2,
  Bell,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useScrollElevation } from '../../hooks/useScrollElevation';

interface MobileHeaderProps {
  onOpenCart?: () => void;
  onOpenNotifications?: () => void;
  cartCount?: number;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenCart,
  cartCount = 1,
  currentView = 'marketplace',
  onNavigate,
}) => {
  const { currentCampus } = useCampus();
  const { user, activeRole, switchRole, quickDemoLogin, logout } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();
  const isScrolled = useScrollElevation(8);
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);

  // Role color palette
  const roleStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    buyer: { label: 'BUYER', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    vendor: { label: 'VENDOR', bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
    courier: { label: 'RUNNER', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    admin: { label: 'ADMIN', bg: '#0B1120', text: '#10B981', border: '#334155' },
  };

  const activeStyle = roleStyles[activeRole] || roleStyles.buyer;

  // User initials for compact mobile avatar
  const userInitials = (() => {
    if (!user?.fullName) return 'U';
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  })();

  const handleRoleSwitch = (role: 'buyer' | 'vendor' | 'courier' | 'admin') => {
    switchRole(role);
    if (onNavigate) {
      if (role === 'buyer') onNavigate('marketplace');
      else if (role === 'vendor') onNavigate('vendor');
      else if (role === 'courier') onNavigate('courier');
      else if (role === 'admin') onNavigate('admin');
    }
    setIsRoleDrawerOpen(false);
  };

  const handleDemoSwitch = async (role: 'buyer' | 'vendor' | 'courier' | 'admin') => {
    await quickDemoLogin(role);
    if (onNavigate) {
      if (role === 'buyer') onNavigate('marketplace');
      else if (role === 'vendor') onNavigate('vendor');
      else if (role === 'courier') onNavigate('courier');
      else if (role === 'admin') onNavigate('admin');
    }
    setIsRoleDrawerOpen(false);
  };

  return (
    <>
      <header
        className={`header-transition ${isScrolled ? 'header-scrolled' : ''}`}
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: activeRole === 'admin' ? '#0B1120' : '#FFFFFF',
          borderBottom: activeRole === 'admin'
            ? (isScrolled ? '1px solid #334155' : '1px solid #1E293B')
            : (isScrolled ? '1px solid #CBD5E1' : '1px solid #E2E8F0'),
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: isScrolled
            ? '0 4px 16px -2px rgba(15, 43, 92, 0.08)'
            : '0 2px 12px rgba(15, 43, 92, 0.04)',
          transition: 'box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.22s ease',
          maxWidth: '100vw',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'clip',
        }}
      >
        {/* Brand & Campus Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => onNavigate && onNavigate('marketplace')}
          >
            <UniHiveLogo size={32} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15.5px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              <span style={{ color: activeRole === 'admin' ? '#FFFFFF' : '#0F2B5C' }}>Uni</span>
              <span style={{ color: '#F59E0B' }}>Hive</span>
              <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '3px', fontWeight: 700 }}>™</span>
            </div>

            <div
              onClick={() => setIsCampusOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: activeRole === 'admin' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                border: activeRole === 'admin' ? '1px solid #1E3A8A' : '1px solid #BFDBFE',
                borderRadius: '9999px',
                padding: '2px 7px',
                color: activeRole === 'admin' ? '#93C5FD' : '#1E3A8A',
                fontSize: '10px',
                fontWeight: 700,
                marginTop: '2px',
                cursor: 'pointer',
              }}
              title="Tap to view campus network & roadmap"
            >
              <GraduationCap size={11} />
              <span>{currentCampus?.shortName || 'RUN'}</span>
              <ChevronDown size={10} />
            </div>
          </div>
        </div>

        {/* Center/Right: Role-Based Identity & Switcher Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Live Notification Bell */}
          <button
            onClick={openDrawer}
            title="Open Live Notifications & Chimes"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: activeRole === 'admin' ? '#1E293B' : '#F1F5F9',
              border: activeRole === 'admin' ? '1px solid #334155' : '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: activeRole === 'admin' ? '#93C5FD' : '#334155',
              transition: 'all 0.15s ease',
              flexShrink: 0,
              padding: 0,
            }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '9999px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  border: '2px solid #FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Active User Initials Avatar Button (Tap to switch roles or logout) */}
          <button
            onClick={() => setIsRoleDrawerOpen(true)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: `1.5px solid ${activeStyle.border}`,
              background: activeRole === 'admin' ? '#10B981' : '#0F2B5C',
              color: activeRole === 'admin' ? '#0B1120' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              padding: 0,
              flexShrink: 0,
            }}
            title={`Logged in as ${user?.fullName || 'User'} (${activeStyle.label}) - Tap to switch roles or log out`}
          >
            {userInitials}
          </button>

          {/* Role-Specific Shortcut Icon (Shopping Bag / Cart) */}
          {activeRole === 'buyer' && (
            <button
              onClick={onOpenCart}
              title="Open Hive Cart"
              aria-label="Open Hive Cart"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: currentView === 'tracking' ? '#FEF3C7' : '#EFF6FF',
                border: currentView === 'tracking' ? '1.5px solid #F59E0B' : '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: currentView === 'tracking' ? '#92400E' : '#1D4ED8',
                boxShadow: '0 2px 6px rgba(29, 78, 216, 0.08)',
                flexShrink: 0,
                padding: 0,
              }}
            >
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '9999px',
                    background: '#1D4ED8',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '2px solid #FFFFFF',
                    boxSizing: 'border-box',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {activeRole === 'vendor' && (
            <button
              onClick={() => onNavigate && onNavigate('vendor')}
              title="Open Vendor Studio"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: currentView === 'vendor' ? '#EFF6FF' : '#F8FAFC',
                border: currentView === 'vendor' ? '1.5px solid #3B82F6' : '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1E40AF',
              }}
            >
              <Store size={16} />
            </button>
          )}

          {activeRole === 'courier' && (
            <button
              onClick={() => onNavigate && onNavigate('courier')}
              title="Open Courier Portal"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: currentView === 'courier' ? '#ECFDF5' : '#F8FAFC',
                border: currentView === 'courier' ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#065F46',
              }}
            >
              <Bike size={16} />
            </button>
          )}

          {activeRole === 'admin' && (
            <button
              onClick={() => onNavigate && onNavigate('admin')}
              title="Open Admin Console"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#1E293B',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#10B981',
              }}
            >
              <ShieldCheck size={16} />
            </button>
          )}

          {/* Direct Sign Out Button on Mobile Header */}
          <button
            onClick={() => {
              logout();
              if (onNavigate) onNavigate('marketplace');
            }}
            title="Sign out back to login gateway"
            aria-label="Sign Out"
            style={{
              height: '34px',
              padding: '0 8px',
              borderRadius: '8px',
              border: '1px solid #FCA5A5',
              background: '#FEF2F2',
              color: '#DC2626',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Interactive Mobile Role & Profile Drawer */}
      {isRoleDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 300,
          }}
          onClick={() => setIsRoleDrawerOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '480px',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 20px 28px 20px',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Drag Pill & Header */}
            <div
              style={{
                width: '40px',
                height: '4px',
                borderRadius: '9999px',
                background: '#CBD5E1',
                margin: '0 auto 16px auto',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="#059669" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.4px' }}>
                    ROLE-BASED ACCESS CONTROL
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {user?.fullName || 'UniHive User'}
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B' }}>
                  {user?.matricNumber ? `${user.matricNumber} • ` : ''}{currentCampus?.shortName || 'RUN'} Campus
                </p>
                <button
                  onClick={() => {
                    logout();
                    setIsRoleDrawerOpen(false);
                    if (onNavigate) onNavigate('marketplace');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #FCA5A5',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '6px',
                  }}
                >
                  <LogOut size={12} />
                  <span>Sign Out of Account</span>
                </button>
              </div>

              <button
                onClick={() => setIsRoleDrawerOpen(false)}
                style={{
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
            </div>

            {/* Current Active Role Card */}
            <div
              style={{
                background: activeStyle.bg,
                border: `1.5px solid ${activeStyle.border}`,
                borderRadius: '16px',
                padding: '14px 16px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: activeStyle.text }}>
                  ACTIVE SESSION ROLE
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    background: '#FFFFFF',
                    color: activeStyle.text,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  ● {activeStyle.label}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: activeStyle.text, opacity: 0.9, lineHeight: 1.4 }}>
                {activeRole === 'buyer' &&
                  'Viewing verified campus inventory, order pin verification & proctor mediation complaints.'}
                {activeRole === 'vendor' &&
                  'Operating Merchant Studio, product catalog, fulfillment pipeline & OPay escrow payouts.'}
                {activeRole === 'courier' &&
                  'Managing bicycle delivery runs, hostel porter lodge drops & 4-digit PIN handshakes.'}
                {activeRole === 'admin' &&
                  'Operating Chief Proctor command center, mediation dispute arbitration & security lockouts.'}
              </p>
            </div>

            {/* If user account holds multiple roles, allow direct switching */}
            {user?.roles && user.roles.length > 1 && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '8px', letterSpacing: '0.4px' }}>
                  SWITCH TO YOUR OTHER AUTHORIZED ROLES
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {user.roles.map((r) => {
                    const isCurrent = activeRole === r;
                    const rStyle = roleStyles[r] || roleStyles.buyer;

                    return (
                      <button
                        key={r}
                        onClick={() => handleRoleSwitch(r)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: isCurrent ? `2px solid ${rStyle.border}` : '1px solid #E2E8F0',
                          background: isCurrent ? rStyle.bg : '#F8FAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {r === 'buyer' && <ShoppingBag size={16} color="#92400E" />}
                          {r === 'vendor' && <Store size={16} color="#1E40AF" />}
                          {r === 'courier' && <Bike size={16} color="#065F46" />}
                          {r === 'admin' && <ShieldCheck size={16} color="#991B1B" />}
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              {r === 'buyer' && 'Student Buyer'}
                              {r === 'vendor' && 'Merchant Vendor Studio'}
                              {r === 'courier' && 'Hostel Courier Runner'}
                              {r === 'admin' && 'Chief Proctor Admin'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              Switch active permissions on mobile
                            </div>
                          </div>
                        </div>

                        {isCurrent ? (
                          <CheckCircle2 size={18} color="#059669" />
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB' }}>
                            Switch
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fast Campus Persona Switcher (For simulation / testing on mobile) */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '8px', letterSpacing: '0.4px' }}>
                DEMO PERSONA SWITCHER (FAST TESTING)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => handleDemoSwitch('buyer')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #FDE68A',
                    background: activeRole === 'buyer' ? '#FEF3C7' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#92400E',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <UserCheck size={14} />
                  <span>Buyer (Folake)</span>
                </button>

                <button
                  onClick={() => handleDemoSwitch('vendor')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #BFDBFE',
                    background: activeRole === 'vendor' ? '#EFF6FF' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#1E40AF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Store size={14} />
                  <span>Vendor (Tunde)</span>
                </button>

                <button
                  onClick={() => handleDemoSwitch('courier')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #A7F3D0',
                    background: activeRole === 'courier' ? '#ECFDF5' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#065F46',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Bike size={14} />
                  <span>Runner (David)</span>
                </button>

                <button
                  onClick={() => handleDemoSwitch('admin')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #FECACA',
                    background: activeRole === 'admin' ? '#FEE2E2' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#991B1B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Admin (2FA)</span>
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                setIsRoleDrawerOpen(false);
                if (onNavigate) onNavigate('marketplace');
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #FCA5A5',
                background: '#FEF2F2',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out to Gateway</span>
            </button>
          </div>
        </div>
      )}

      {/* Campus Network & 2027 Roadmap Drawer */}
      {isCampusOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setIsCampusOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              background: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 20px 32px 20px',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.15)',
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={20} color="#0F2B5C" />
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2B5C' }}>
                  UniHive™ Campus Network
                </div>
              </div>
              <button
                onClick={() => setIsCampusOpen(false)}
                style={{
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
            </div>

            {/* Active Flagship Campus Card */}
            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                border: '2px solid #2563EB',
                background: '#EFF6FF',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E3A8A' }}>
                  🎓 Redeemer's University (RUN)
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#059669',
                    color: '#FFFFFF',
                  }}
                >
                  LIVE FLAGSHIP
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                Ede, Osun State • Flagship launch testbed. All vendors, products, and courier runners are live on this campus.
              </div>
            </div>

            {/* Expansion Campuses Header */}
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.4px' }}>
              Expansion Campuses (Roadmap 2027)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {[
                { name: 'Afe Babalola University (ABUAD)', city: 'Ado-Ekiti, Ekiti State' },
                { name: 'Bowen University', city: 'Iwo, Osun State' },
                { name: 'Babcock University', city: 'Ilishan-Remo, Ogun State' },
                { name: 'Pan-Atlantic University', city: 'Ibeju-Lekki, Lagos State' },
              ].map((exp) => (
                <div
                  key={exp.name}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: 0.85,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{exp.name}</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>{exp.city}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: '#E2E8F0',
                      color: '#64748B',
                    }}
                  >
                    2027 Roadmap
                  </span>
                </div>
              ))}
            </div>

            {/* Zero Bleed Isolation Policy Box */}
            <div
              style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '10px 12px',
                fontSize: '11px',
                color: '#92400E',
                lineHeight: 1.4,
              }}
            >
              🔒 <strong>Strict Campus Isolation:</strong> Each university operates in an isolated hive. RUN students, vendors, and couriers cannot bleed into other universities, ensuring safety and authentic student verification.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
