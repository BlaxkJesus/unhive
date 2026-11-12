import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Store, Bike, Smartphone, Monitor } from 'lucide-react';

interface RoleSwitcherBarProps {
  viewportMode: 'mobile' | 'desktop';
  setViewportMode: (mode: 'mobile' | 'desktop') => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  viewportMode,
  setViewportMode,
}) => {
  const { activeRole, quickDemoLogin, setIsLoginModalOpen, user, logout } =
    useAuth();

  return (
    <div className="demo-bar">
      <div className="demo-bar-title">
        <span style={{ fontSize: '15px' }}>⚡</span>
        <span>UniHive™ Interactive Console</span>
      </div>

      <div className="demo-roles-group">
        <span style={{ fontSize: '11px', color: '#94A3B8', marginRight: '4px' }}>
          Switch Role:
        </span>
        <button
          className={`demo-role-btn ${activeRole === 'buyer' ? 'active' : ''}`}
          onClick={() => quickDemoLogin('buyer')}
          title="Login as Folake Adebayo (Buyer)"
        >
          <UserCheck size={13} />
          Buyer (Folake)
        </button>

        <button
          className={`demo-role-btn ${activeRole === 'vendor' ? 'active' : ''}`}
          onClick={() => quickDemoLogin('vendor')}
          title="Login as Tunde Kicks (Vendor)"
        >
          <Store size={13} />
          Vendor (Tunde)
        </button>

        <button
          className={`demo-role-btn ${activeRole === 'courier' ? 'active' : ''}`}
          onClick={() => quickDemoLogin('courier')}
          title="Login as David Adeleke (Courier)"
        >
          <Bike size={13} />
          Courier (David)
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Viewport switch: Mobile PWA frame vs Full Desktop */}
        <div style={{ display: 'flex', background: '#1E293B', borderRadius: '6px', padding: '2px' }}>
          <button
            onClick={() => setViewportMode('mobile')}
            style={{
              background: viewportMode === 'mobile' ? '#3B82F6' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
            }}
            title="View in Mobile PWA Retina Frame (10 Mobile Screens)"
          >
            <Smartphone size={13} /> Mobile PWA
          </button>
          <button
            onClick={() => setViewportMode('desktop')}
            style={{
              background: viewportMode === 'desktop' ? '#3B82F6' : 'transparent',
              color: '#FFF',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
            }}
            title="View in Full Desktop Workspace (Screens 11 & 12)"
          >
            <Monitor size={13} /> Desktop View
          </button>
        </div>

        {user ? (
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: '#94A3B8',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            style={{
              background: '#F59E0B',
              border: 'none',
              color: '#0F172A',
              fontWeight: 700,
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};
