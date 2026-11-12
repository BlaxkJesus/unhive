import React from 'react';
import { Home, Search, Package, Store, Bike, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type TabId = 'home' | 'search' | 'orders' | 'vendor' | 'dispatch' | 'admin';

interface MobileBottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  dark?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  dark = false,
}) => {
  const { activeRole } = useAuth();
  const bg = dark ? '#0B1120' : '#FFFFFF';
  const border = dark ? '#1E293B' : '#E2E8F0';
  const activeColor = dark ? '#60A5FA' : '#1D4ED8';
  const inactiveColor = dark ? '#64748B' : '#94A3B8';

  // Build role-isolated tabs
  const allTabs: { id: TabId; label: string; icon: React.ReactNode; badge?: 'orange' | 'green'; roles: string[] }[] = [
    {
      id: 'home',
      label: 'Market',
      icon: <Home size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />,
      roles: ['buyer', 'courier', 'vendor', 'admin'],
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search size={20} strokeWidth={activeTab === 'search' ? 2.5 : 2} />,
      roles: ['buyer', 'vendor', 'courier', 'admin'],
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: <Package size={20} strokeWidth={activeTab === 'orders' ? 2.5 : 2} />,
      badge: 'orange',
      roles: ['buyer'],
    },
    {
      id: 'dispatch',
      label: 'Courier Run',
      icon: <Bike size={20} strokeWidth={activeTab === 'dispatch' ? 2.5 : 2} />,
      badge: 'green',
      roles: ['courier'],
    },
    {
      id: 'vendor',
      label: 'Studio',
      icon: <Store size={20} strokeWidth={activeTab === 'vendor' ? 2.5 : 2} />,
      roles: ['vendor'],
    },
    {
      id: 'admin',
      label: 'Admin Ops',
      icon: <ShieldCheck size={20} strokeWidth={activeTab === 'admin' ? 2.5 : 2} />,
      roles: ['admin'],
    },
  ];

  const tabs = allTabs.filter((t) => t.roles.includes(activeRole));

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100vw',
        background: dark ? '#0F172A' : '#FFFFFF',
        borderTop: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 8px calc(12px + env(safe-area-inset-bottom, 4px)) 8px',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(15, 43, 92, 0.08)',
        boxSizing: 'border-box',
      }}
    >
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        const color = isActive ? activeColor : inactiveColor;
        const activePillBg = dark ? 'rgba(96, 165, 250, 0.12)' : 'rgba(29, 78, 216, 0.08)';

        return (
          <button
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            style={{
              background: isActive ? activePillBg : 'transparent',
              border: 'none',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 12px',
              cursor: 'pointer',
              color: color,
              position: 'relative',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div
              className={isActive ? 'nav-icon-pop' : ''}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {t.icon}
              {t.badge === 'orange' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-3px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#F59E0B',
                    border: `1.5px solid ${bg}`,
                  }}
                />
              )}
              {t.badge === 'green' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-3px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#10B981',
                    border: `1.5px solid ${bg}`,
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 800 : 600,
                letterSpacing: '0.1px',
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
