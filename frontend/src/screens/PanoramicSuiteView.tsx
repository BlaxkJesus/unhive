import React, { useState } from 'react';
import { HomeFeed } from './HomeFeed';
import { SearchCategories } from './SearchCategories';
import { ProductDetails } from './ProductDetails';
import { ExpressCheckout } from './ExpressCheckout';
import { LiveOrderTracking } from './LiveOrderTracking';
import { VendorStudio } from './VendorStudio';
import { CourierDispatch } from './CourierDispatch';
import { LoginGateway } from './LoginGateway';
import { SignupRoleSelection } from './SignupRoleSelection';
import { AdminDashboardMobile } from './AdminDashboardMobile';
import { AdminDashboardDesktop } from './AdminDashboardDesktop';
import { DesktopMarketplaceHub } from './DesktopMarketplaceHub';
import { DesktopProductCheckout } from './DesktopProductCheckout';
import { ZoomIn, ZoomOut, Smartphone, Monitor } from 'lucide-react';

interface PanoramicProps {
  onSelectScreen: (screenId: string) => void;
}

export const PanoramicSuiteView: React.FC<PanoramicProps> = ({ onSelectScreen }) => {
  const [zoomScale, setZoomScale] = useState<number>(0.65);
  const [suiteCategory, setSuiteCategory] = useState<'all' | 'mobile' | 'desktop'>('all');

  const mobileScreens = [
    { id: '01_home', num: '01', title: 'Home Feed & Campus Catalog', comp: <HomeFeed onNavigate={onSelectScreen} /> },
    { id: '02_search', num: '02', title: 'Search & Category Discovery', comp: <SearchCategories onNavigate={onSelectScreen} /> },
    { id: '03_product', num: '03', title: 'Product Details & Size Selector', comp: <ProductDetails onNavigate={onSelectScreen} /> },
    { id: '04_checkout', num: '04', title: 'Express Escrow Checkout', comp: <ExpressCheckout onNavigate={onSelectScreen} /> },
    { id: '05_tracking', num: '05', title: 'Live Order Tracking & 4-Digit PIN', comp: <LiveOrderTracking onNavigate={onSelectScreen} /> },
    { id: '06_vendor', num: '06', title: 'Vendor Studio & Delivery PIN', comp: <VendorStudio onNavigate={onSelectScreen} /> },
    { id: '07_dispatch', num: '07', title: 'Courier Dispatch Portal & PIN Pad', comp: <CourierDispatch onNavigate={onSelectScreen} /> },
    { id: '08_login', num: '08', title: 'Unified Gateway (4-Role Switcher)', comp: <LoginGateway onNavigate={onSelectScreen} /> },
    { id: '09_signup', num: '09', title: 'Registration & Role Selection', comp: <SignupRoleSelection onNavigate={onSelectScreen} /> },
    { id: '10_admin_mobile', num: '10M', title: 'Admin Command Center (Mobile Dark)', comp: <AdminDashboardMobile onNavigate={onSelectScreen} /> },
  ];

  const desktopScreens = [
    { id: '11_desktop_market', num: '11', title: 'Desktop Marketplace Hub (Clean Light)', comp: <DesktopMarketplaceHub onNavigate={onSelectScreen} /> },
    { id: '12_desktop_product', num: '12', title: 'Desktop Product & Escrow Checkout', comp: <DesktopProductCheckout onNavigate={onSelectScreen} /> },
    { id: '10_admin_desktop', num: '10D', title: 'Admin Operations Command Center (Operations Dark)', comp: <AdminDashboardDesktop onNavigate={onSelectScreen} /> },
  ];

  return (
    <div style={{ background: '#0B1120', minHeight: '100vh', padding: '24px 30px', color: '#FFFFFF' }}>
      {/* Control Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          padding: '12px 24px',
          marginBottom: '30px',
          position: 'sticky',
          top: '10px',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
            UniHive™ Panoramic Suite Showcase
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>
            Interactive rendering of all 10 Mobile PWA screens and 3 Desktop Workstation layouts
          </div>
        </div>

        {/* Filters and Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Suite switcher */}
          <div style={{ display: 'flex', background: '#1E293B', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              onClick={() => setSuiteCategory('all')}
              style={{
                background: suiteCategory === 'all' ? '#F59E0B' : 'transparent',
                color: suiteCategory === 'all' ? '#0F172A' : '#CBD5E1',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              All (13 Screens)
            </button>
            <button
              onClick={() => setSuiteCategory('mobile')}
              style={{
                background: suiteCategory === 'mobile' ? '#F59E0B' : 'transparent',
                color: suiteCategory === 'mobile' ? '#0F172A' : '#CBD5E1',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Smartphone size={14} />
              <span>Mobile PWA (10)</span>
            </button>
            <button
              onClick={() => setSuiteCategory('desktop')}
              style={{
                background: suiteCategory === 'desktop' ? '#F59E0B' : 'transparent',
                color: suiteCategory === 'desktop' ? '#0F172A' : '#CBD5E1',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Monitor size={14} />
              <span>Desktop Suite (3)</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setZoomScale(Math.max(0.45, zoomScale - 0.1))}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(Math.min(1.0, zoomScale + 0.1))}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Mobile PWA Suite (Side-by-Side Scroll) */}
      {(suiteCategory === 'all' || suiteCategory === 'mobile') && (
        <div style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Smartphone size={20} color="#F59E0B" />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
              Mobile / PWA View Suite (Screens 01 – 10 Mobile)
            </h2>
            <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
              Matching 1.png Panoramic Showcase
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              overflowX: 'auto',
              paddingBottom: '20px',
              scrollbarWidth: 'thin',
            }}
          >
            {mobileScreens.map((screen) => (
              <div
                key={screen.id}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Header Tag */}
                <div
                  onClick={() => onSelectScreen(screen.id)}
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#FBBF24',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <span>{screen.num}</span>
                  <span>•</span>
                  <span>{screen.title}</span>
                </div>

                {/* Scaled Device Container */}
                <div
                  style={{
                    width: `${430 * zoomScale}px`,
                    height: `${844 * zoomScale}px`,
                    overflow: 'hidden',
                    borderRadius: `${40 * zoomScale}px`,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 8px #0F172A',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onClick={() => onSelectScreen(screen.id)}
                >
                  <div
                    style={{
                      width: '430px',
                      height: '844px',
                      transform: `scale(${zoomScale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                    }}
                  >
                    {screen.comp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Desktop Suite */}
      {(suiteCategory === 'all' || suiteCategory === 'desktop') && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Monitor size={20} color="#38BDF8" />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
              Desktop Workstation Suite (Screens 11, 12, and 10 Desktop)
            </h2>
            <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
              Matching Desktop_Web_Suite_Showcase.png
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {desktopScreens.map((screen) => (
              <div key={screen.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  onClick={() => onSelectScreen(screen.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#38BDF8',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  <span>{screen.num}</span>
                  <span>•</span>
                  <span>{screen.title}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px' }}>
                    (Click to open full view)
                  </span>
                </div>

                <div
                  onClick={() => onSelectScreen(screen.id)}
                  style={{
                    width: '100%',
                    height: `${700 * zoomScale}px`,
                    overflow: 'hidden',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '1440px',
                      transform: `scale(${zoomScale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                    }}
                  >
                    {screen.comp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
