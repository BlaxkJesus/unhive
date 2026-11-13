import React, { useState, useEffect, useRef } from 'react';
import { useCampus } from '../../context/CampusContext';
import { useAuth } from '../../context/AuthContext';
import { UniHiveLogo } from '../common/UniHiveLogo';
import {
  GraduationCap,
  Search,
  ShoppingCart,
  Store,
  Bike,
  ShieldCheck,
  ChevronDown,
  Lock,
  LogOut,
  Bell,
  X,
  Smartphone,
  Package,
  SlidersHorizontal,
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
  const { activeRole, user, setIsLoginModalOpen, logout, quickDemoLogin } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();
  const { openCart, totalCount } = useCart();
  const { toggleMobileMode } = useResponsive();
  const isScrolled = useScrollElevation(8);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const campusMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (campusMenuRef.current && !campusMenuRef.current.contains(target)) {
        setIsCampusDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener: Cmd/Ctrl + K or "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const expansionCampuses = [
    { name: 'Afe Babalola University (ABUAD)', city: 'Ado-Ekiti, Ekiti State' },
    { name: 'Bowen University', city: 'Iwo, Osun State' },
    { name: 'Babcock University', city: 'Ilishan-Remo, Ogun State' },
    { name: 'Pan-Atlantic University', city: 'Ibeju-Lekki, Lagos' },
  ];

  return (
    <header
      className={`header-transition ${isScrolled ? 'header-scrolled' : ''}`}
      style={{
        background: '#FFFFFF',
        borderBottom: isScrolled ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
        padding: '0 28px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '20px',
        boxShadow: isScrolled ? '0 4px 20px -2px rgba(15, 23, 42, 0.06)' : 'none',
        transition: 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* LEFT ZONE: Brand Lockup & Campus Switcher                      */}
      {/* ------------------------------------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {/* Brand Lockup */}
        <div
          onClick={() => setCurrentView('marketplace')}
          title="UniHive - Return to Marketplace"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <UniHiveLogo size={32} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', lineHeight: 1 }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F2B5C', letterSpacing: '-0.3px' }}>
                Uni
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#D97706', letterSpacing: '-0.3px' }}>
                Hive
              </span>
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, marginLeft: '1px' }}>™</span>
            </div>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.6px',
                marginTop: '3px',
                textTransform: 'uppercase',
              }}
            >
              Campus Dispatch
            </div>
          </div>
        </div>

        {/* Vertical subtle divider */}
        <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />

        {/* Institution Context Selector */}
        <div ref={campusMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
            title="Campus Context & Expansion Roadmap"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: isCampusDropdownOpen ? '1px solid #0F2B5C' : '1px solid #E2E8F0',
              background: isCampusDropdownOpen ? '#F8FAFC' : '#FFFFFF',
              color: '#1E293B',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isCampusDropdownOpen) {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }
            }}
            onMouseLeave={(e) => {
              if (!isCampusDropdownOpen) {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }
            }}
          >
            <GraduationCap size={15} color="#475569" />
            <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentCampus ? currentCampus.shortName || currentCampus.name : 'RUN Ede'}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                lineHeight: 1.2,
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'inline-block',
                }}
              />
              Live
            </span>
            <ChevronDown
              size={13}
              color="#64748B"
              style={{
                transform: isCampusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>

          {/* Campus Roadmap Popover */}
          {isCampusDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
                zIndex: 110,
                width: '340px',
                padding: '14px',
                animation: 'popoverFadeIn 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Campus Deployment
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #A7F3D0',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  Flagship Active
                </span>
              </div>

              {/* Active Campus Card */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={15} color="#0F2B5C" />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F2B5C' }}>
                    Redeemer's University (RUN)
                  </div>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                  Main campus live testbed in Ede, Osun State. Active student vendors, student runners, and hostel porter dispatch.
                </div>
              </div>

              {/* Expansion Campuses Roadmap */}
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  letterSpacing: '0.4px',
                }}
              >
                Expansion Campuses (2027 Roadmap)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {expansionCampuses.map((exp) => (
                  <div
                    key={exp.name}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      background: '#FAFAFA',
                      border: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>{exp.name}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{exp.city}</div>
                    </div>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#F1F5F9',
                        color: '#64748B',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      Waitlist
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: '#64748B',
                  marginTop: '10px',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '8px',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Strict Campus Isolation:</strong> Each institution operates within an isolated boundary to ensure verified matriculation and safety.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTER ZONE: Global Command & Search Input                    */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          flex: 1,
          maxWidth: '480px',
          minWidth: '220px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isSearchFocused ? '#0F2B5C' : '#94A3B8',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'color 0.15s ease',
          }}
        />

        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search campus items, past questions, chargers, food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={{
            width: '100%',
            height: '38px',
            paddingLeft: '36px',
            paddingRight: searchQuery ? '36px' : '64px',
            borderRadius: '8px',
            border: isSearchFocused ? '1px solid #0F2B5C' : '1px solid #E2E8F0',
            background: isSearchFocused ? '#FFFFFF' : '#F8FAFC',
            fontSize: '13px',
            color: '#0F172A',
            outline: 'none',
            boxSizing: 'border-box',
            boxShadow: isSearchFocused ? '0 0 0 3px rgba(15, 43, 92, 0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        />

        {/* Clear Button or Keyboard Shortcut Badge */}
        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            aria-label="Clear search query"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#E2E8F0',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              zIndex: 2,
              padding: 0,
            }}
          >
            <X size={11} />
          </button>
        ) : (
          <div
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <kbd
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#94A3B8',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '2px 5px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
                fontFamily: 'inherit',
              }}
            >
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT ZONE: Primary Navigation, Utilities & User Profile       */}
      {/* ------------------------------------------------------------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        {/* Primary View Segment (Tabs) */}
        <nav
          aria-label="Primary Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F1F5F9',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Marketplace Tab */}
          <button
            onClick={() => setCurrentView('marketplace')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: currentView === 'marketplace' ? '#FFFFFF' : 'transparent',
              color: currentView === 'marketplace' ? '#0F2B5C' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: currentView === 'marketplace' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Marketplace
          </button>

          {/* Active Order / Tracking (Buyer only) */}
          {activeRole === 'buyer' && (
            <button
              onClick={() => setCurrentView('tracking')}
              title="Track active dispatch order"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: currentView === 'tracking' ? '#FFFFFF' : 'transparent',
                color: currentView === 'tracking' ? '#0F2B5C' : '#64748B',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: currentView === 'tracking' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Package size={14} color={currentView === 'tracking' ? '#D97706' : '#64748B'} />
              <span>Orders</span>
            </button>
          )}

          {/* Vendor Studio Tab (Vendor role only) */}
          {activeRole === 'vendor' && (
            <button
              onClick={() => setCurrentView('vendor')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: currentView === 'vendor' ? '#FFFFFF' : 'transparent',
                color: currentView === 'vendor' ? '#0F2B5C' : '#64748B',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: currentView === 'vendor' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Store size={14} color={currentView === 'vendor' ? '#2563EB' : '#64748B'} />
              <span>Studio</span>
            </button>
          )}

          {/* Courier Portal Tab (Courier role only) */}
          {activeRole === 'courier' && (
            <button
              onClick={() => setCurrentView('courier')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: currentView === 'courier' ? '#FFFFFF' : 'transparent',
                color: currentView === 'courier' ? '#0F2B5C' : '#64748B',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: currentView === 'courier' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Bike size={14} color={currentView === 'courier' ? '#059669' : '#64748B'} />
              <span>Runner</span>
            </button>
          )}

          {/* Admin HQ Tab (Admin role only) */}
          {activeRole === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: currentView === 'admin' ? '#0F2B5C' : 'transparent',
                color: currentView === 'admin' ? '#FFFFFF' : '#64748B',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: currentView === 'admin' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={14} color={currentView === 'admin' ? '#10B981' : '#64748B'} />
              <span>Ops</span>
            </button>
          )}
        </nav>

        {/* Action Icon Buttons: Cart, Notifications & Phone Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Cart Action Button (Buyer only) */}
          {activeRole === 'buyer' && (
            <button
              onClick={openCart}
              title={`Hive Cart (${totalCount} item${totalCount === 1 ? '' : 's'})`}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <ShoppingCart size={17} />
              {totalCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    minWidth: '17px',
                    height: '17px',
                    borderRadius: '9999px',
                    background: '#0F2B5C',
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
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Trigger */}
          <button
            onClick={openDrawer}
            title="Live Alerts & Notifications"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '17px',
                  height: '17px',
                  borderRadius: '9999px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '9.5px',
                  fontWeight: 800,
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

          {/* Mobile Companion Pairing Trigger */}
          <button
            onClick={() => setIsMobileModalOpen(true)}
            title="Scan QR Code or copy link to test on mobile phone"
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <Smartphone size={15} color="#475569" />
            <span>Mobile Link</span>
          </button>
        </div>

        {/* Vertical subtle divider */}
        <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />

        {/* User Account & Profile Trigger */}
        {user ? (
          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              title="Account Menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '4px 8px 4px 5px',
                borderRadius: '8px',
                border: isProfileMenuOpen ? '1px solid #0F2B5C' : '1px solid #E2E8F0',
                background: isProfileMenuOpen ? '#F8FAFC' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isProfileMenuOpen) {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProfileMenuOpen) {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }
              }}
            >
              {/* Avatar Initial Circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#0F2B5C',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {(user?.fullName || 'User').charAt(0).toUpperCase()}
              </div>

              {/* User Name */}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0F172A',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {(user?.fullName || 'User').split(' ')[0]}
              </span>

              {/* Role Indicator Badge */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'capitalize',
                }}
              >
                {activeRole}
              </span>

              <ChevronDown
                size={13}
                color="#64748B"
                style={{
                  transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>

            {/* Profile & Account Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '280px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
                  padding: '12px',
                  zIndex: 110,
                  animation: 'popoverFadeIn 0.15s ease',
                }}
              >
                {/* User Card Summary */}
                <div style={{ paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#0F2B5C',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {(user?.fullName || 'User').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#0F172A',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.fullName || 'UniHive Student'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                        {user.phone || user.email || 'Verified Campus Account'}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        background: '#EFF6FF',
                        color: '#1E40AF',
                        border: '1px solid #DBEAFE',
                        padding: '2px 7px',
                        borderRadius: '4px',
                      }}
                    >
                      {currentCampus?.shortName || 'RUN'} Student
                    </span>
                    {user.matricNumber && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 600,
                          background: '#F1F5F9',
                          color: '#475569',
                          border: '1px solid #E2E8F0',
                          padding: '2px 7px',
                          borderRadius: '4px',
                        }}
                      >
                        {user.matricNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Fast Role Switcher */}
                <div style={{ padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Switch Active View</span>
                    <SlidersHorizontal size={12} color="#94A3B8" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { role: 'buyer', label: 'Buyer', icon: Package },
                      { role: 'vendor', label: 'Vendor', icon: Store },
                      { role: 'courier', label: 'Courier', icon: Bike },
                    ].map((item) => {
                      const isCurrent = activeRole === item.role;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.role}
                          onClick={async () => {
                            await quickDemoLogin(item.role as any);
                            if (item.role === 'buyer') setCurrentView('marketplace');
                            else if (item.role === 'vendor') setCurrentView('vendor');
                            else if (item.role === 'courier') setCurrentView('courier');
                            setIsProfileMenuOpen(false);
                          }}
                          style={{
                            padding: '6px 4px',
                            borderRadius: '6px',
                            border: isCurrent ? '1px solid #0F2B5C' : '1px solid #E2E8F0',
                            background: isCurrent ? '#0F2B5C' : '#FFFFFF',
                            color: isCurrent ? '#FFFFFF' : '#334155',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Icon size={14} color={isCurrent ? '#FFFFFF' : '#64748B'} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Account Navigation Links */}
                <div style={{ padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => {
                      setCurrentView('tracking');
                      setIsProfileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Package size={14} color="#64748B" />
                    <span>My Escrow Orders & History</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Smartphone size={14} color="#64748B" />
                    <span>Pair Phone with QR Code</span>
                  </button>
                </div>

                {/* Sign Out (Properly placed inside the user menu!) */}
                <div style={{ paddingTop: '8px' }}>
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
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={14} color="#DC2626" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0F2B5C',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1E3A8A')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0F2B5C')}
          >
            <Lock size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Global Phone Link & QR Modal */}
      <MobileLinkModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        onToggleMobilePreview={() => toggleMobileMode('mobile')}
      />
    </header>
  );
};
