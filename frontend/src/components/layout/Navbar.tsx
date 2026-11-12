import React, { useState } from 'react';
import { useCampus } from '../../context/CampusContext';
import { useAuth } from '../../context/AuthContext';
import { UniHiveLogo } from '../common/UniHiveLogo';
import {
  GraduationCap,
  Search,
  ShoppingCart,
  ShieldCheck,
  Store,
  Bike,
  ChevronDown,
  Lock,
  LogOut,
  Bell,
  X,
  Smartphone,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useCart } from '../../context/CartContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useScrollElevation } from '../../hooks/useScrollElevation';
import { MobileLinkModal } from '../common/MobileLinkModal';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentCampus } = useCampus();
  const { activeRole, user, setIsLoginModalOpen, logout } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();
  const { openCart, totalCount } = useCart();
  const { toggleMobileMode } = useResponsive();
  const isScrolled = useScrollElevation(8);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  return (
    <nav
      className={`header-transition ${isScrolled ? 'header-scrolled' : ''}`}
      style={{
        background: '#FFFFFF',
        borderBottom: isScrolled ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '20px',
        boxShadow: isScrolled ? '0 4px 18px -2px rgba(15, 43, 92, 0.08)' : 'none',
        transition: 'box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.22s ease',
      }}
    >
      {/* Brand & Campus Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => setCurrentView('marketplace')}
        >
          <UniHiveLogo size={34} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.3px' }}>
              <span style={{ color: '#0F2B5C' }}>Uni</span>
              <span style={{ color: '#F59E0B' }}>Hive</span>
              <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '2px', fontWeight: 700 }}>™</span>
            </div>
            <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 700, letterSpacing: '0.6px', marginTop: '2px' }}>
              CAMPUS DISPATCH & ESCROW
            </div>
          </div>
        </div>

        {/* Flagship RUN Institutional Badge & Expansion Roadmap */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #CBD5E1',
              background: '#EFF6FF',
              color: '#1E3A8A',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(30, 58, 138, 0.08)',
              cursor: 'pointer',
            }}
            title="Click to view campus roadmap & isolation policy"
          >
            <GraduationCap size={16} color="#1E3A8A" />
            <span>{currentCampus ? currentCampus.name : "Redeemer's University (Ede)"}</span>
            <span
              style={{
                background: '#059669',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '9999px',
                letterSpacing: '0.4px',
              }}
            >
              FLAGSHIP HIVE
            </span>
            <ChevronDown size={14} />
          </div>

          {isCampusDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                boxShadow: '0 12px 30px rgba(15, 43, 92, 0.15)',
                zIndex: 110,
                minWidth: '320px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F2B5C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  UniHive™ Campus Network
                </span>
                <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>
                  RUN Live Active
                </span>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#1E3A8A' }}>
                  🎓 Redeemer's University (RUN)
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  Official launch testbed & flagship campus. All student vendors, products, and courier runners are live in Ede, Osun State.
                </div>
              </div>

              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.4px' }}>
                Expansion Campuses (Roadmap 2027)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { name: 'Afe Babalola University (ABUAD)', city: 'Ado-Ekiti, Ekiti State' },
                  { name: 'Bowen University', city: 'Iwo, Osun State' },
                  { name: 'Babcock University', city: 'Ilishan-Remo, Ogun' },
                  { name: 'Pan-Atlantic University', city: 'Ibeju-Lekki, Lagos' },
                ].map((exp) => (
                  <div
                    key={exp.name}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: 0.85,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>{exp.name}</div>
                      <div style={{ fontSize: '9px', color: '#94A3B8' }}>{exp.city}</div>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '9999px', background: '#E2E8F0', color: '#64748B' }}>
                      2027 Expansion
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '8px', lineHeight: 1.4 }}>
                🔒 <strong>Zero Cross-Campus Bleed:</strong> Each university runs as an isolated ecosystem to guarantee safety, authentic student matriculation, and zero hostel boundary violations.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Search Bar */}
      <div style={{ flex: 1, maxWidth: '520px', position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Search sneakers, past questions, spicy asun, chargers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '44px',
            paddingRight: searchQuery ? '36px' : '16px',
            borderRadius: '9999px',
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            fontSize: '13px',
            color: '#0F172A',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#3B82F6')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#E2E8F0',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              zIndex: 2,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Role Navigation & Fast Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Role-Specific View Switches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Marketplace is available to all authenticated roles */}
          <button
            onClick={() => setCurrentView('marketplace')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: currentView === 'marketplace' ? '#0F2B5C' : '#E2E8F0',
              background: currentView === 'marketplace' ? '#0F2B5C' : '#FFFFFF',
              color: currentView === 'marketplace' ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Marketplace
          </button>


          {/* Customer / Buyer: Shopping Cart with live badge */}
          {activeRole === 'buyer' && (
            <button
              onClick={openCart}
              title="Open Hive Cart"
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: totalCount > 0 ? '#BFDBFE' : '#E2E8F0',
                background: totalCount > 0 ? '#EFF6FF' : '#FFFFFF',
                color: totalCount > 0 ? '#1D4ED8' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShoppingCart size={14} color={totalCount > 0 ? '#2563EB' : '#475569'} />
              <span>Cart</span>
              {totalCount > 0 && (
                <span
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    padding: '1px 6px',
                    fontSize: '10px',
                    fontWeight: 800,
                  }}
                >
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Customer / Buyer: Active Order Tracking */}
          {activeRole === 'buyer' && (
            <button
              onClick={() => setCurrentView('tracking')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: currentView === 'tracking' ? '#F59E0B' : '#E2E8F0',
                background: currentView === 'tracking' ? '#FEF3C7' : '#FFFFFF',
                color: currentView === 'tracking' ? '#92400E' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ShoppingCart size={13} />
              <span>Active Order</span>
            </button>
          )}

          {/* Vendor: Vendor Studio Only */}
          {activeRole === 'vendor' && (
            <button
              onClick={() => setCurrentView('vendor')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: currentView === 'vendor' ? '#3B82F6' : '#E2E8F0',
                background: currentView === 'vendor' ? '#EFF6FF' : '#FFFFFF',
                color: currentView === 'vendor' ? '#1E40AF' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Store size={13} />
              <span>Vendor Studio</span>
            </button>
          )}

          {/* Courier: Courier Portal Only */}
          {activeRole === 'courier' && (
            <button
              onClick={() => setCurrentView('courier')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: currentView === 'courier' ? '#10B981' : '#E2E8F0',
                background: currentView === 'courier' ? '#ECFDF5' : '#FFFFFF',
                color: currentView === 'courier' ? '#065F46' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Bike size={13} />
              <span>Courier Portal</span>
            </button>
          )}

          {/* Admin: Admin Ops Only */}
          {activeRole === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#0B1120',
                color: '#10B981',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ShieldCheck size={13} />
              <span>Admin Ops</span>
            </button>
          )}
        </div>

        {/* User Identity & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mobile Link & QR Modal Trigger */}
          <button
            onClick={() => setIsMobileModalOpen(true)}
            title="Scan QR Code or get link to open UniHive on your home phone"
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              border: '1px solid #CBD5E1',
              background: '#EFF6FF',
              color: '#1E40AF',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(30, 58, 138, 0.08)',
              transition: 'all 0.15s ease',
            }}
          >
            <Smartphone size={14} color="#2563EB" />
            <span>📱 Phone Link</span>
          </button>

          {/* Live Notification Bell */}
          <button
            onClick={openDrawer}
            title="Open Live Alerts & Chimes"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: '#334155',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '17px',
                  height: '17px',
                  borderRadius: '9999px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '9.5px',
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

          {user ? (
            <>
              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  background: '#F1F5F9',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#0F2B5C',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {(user?.fullName || 'User').charAt(0)}
                </div>
                <span style={{ color: '#0F172A' }}>{(user?.fullName || 'User').split(' ')[0]}</span>
                <span
                  style={{
                    fontSize: '10px',
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'capitalize',
                  }}
                >
                  {activeRole}
                </span>
                <ChevronDown size={12} color="#64748B" />
              </div>

              {/* Direct Sign Out Button */}
              <button
                onClick={() => {
                  logout();
                  setCurrentView('marketplace');
                }}
                title="Sign out back to login gateway"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #FCA5A5',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F59E0B',
                color: '#0F172A',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Lock size={13} />
              <span>Sign In</span>
            </button>
          )}

          {isProfileMenuOpen && user && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '240px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.12)',
                padding: '12px',
                zIndex: 110,
              }}
            >
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{user.fullName || 'UniHive User'}</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{user.phone || ''}</div>
                {user.matricNumber && (
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{user.matricNumber}</div>
                )}
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '10px', background: '#EFF6FF', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {currentCampus?.shortName || 'RUN'} Campus
                  </span>
                  <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'capitalize' }}>
                    {activeRole}
                  </span>
                </div>
              </div>

              <div style={{ paddingTop: '10px' }}>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                    setCurrentView('marketplace');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #FCA5A5',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <LogOut size={14} color="#DC2626" />
                  <span>Log Out to Switch Role</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Phone Link & QR Modal */}
      <MobileLinkModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        onToggleMobilePreview={() => toggleMobileMode('mobile')}
      />
    </nav>
  );
};
