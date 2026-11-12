import React, { useState, useEffect } from 'react';
import { CampusProvider } from './context/CampusContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider, useCart } from './context/CartContext';
import { CartDrawer } from './components/cart/CartDrawer';
import { useResponsive } from './hooks/useResponsive';
import { Navbar } from './components/layout/Navbar';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav, type TabId } from './components/common/MobileBottomNav';
import { RoleRestrictedView } from './components/common/RoleRestrictedView';
import { MarketplaceHome } from './pages/buyer/MarketplaceHome';
import { SearchDiscoveryView } from './pages/buyer/SearchDiscoveryView';
import { ProductDetail } from './pages/buyer/ProductDetail';
import { OrderTracking } from './pages/buyer/OrderTracking';
import { VendorStudio } from './pages/vendor/VendorStudio';
import { CourierPortal } from './pages/courier/CourierPortal';
import { AdminConsole } from './pages/admin/AdminConsole';
import { LoginModal } from './pages/auth/LoginModal';
import { AuthGatewayPage } from './pages/auth/AuthGatewayPage';
import { PanoramicSuiteView } from './screens/PanoramicSuiteView';
import { SplashScreen } from './components/common/SplashScreen';
import { UniHiveLogo } from './components/common/UniHiveLogo';
import { NotificationToast } from './components/common/NotificationToast';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { transitionNavigate, type NavigationDirection } from './utils/navigation';
import type { Product } from './types';
import { ShieldCheck, MapPin, Lock } from 'lucide-react';

const DEFAULT_PRODUCT: Product = {
  id: 'prod-run-nike-af1',
  vendorId: 'vendor-run-gadgetplug',
  campusId: 'campus-run-ede',
  title: "Nike Air Force 1 '07 Low (Triple White)",
  description:
    'Brand new in box, never worn. Size 43 EU. Direct pickup from Queen Esther Hall, Room B12. Guaranteed authentic.',
  category: 'shoes',
  condition: 'brand_new',
  price: 18500,
  compareAtPrice: 22000,
  stockQuantity: 4,
  images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a'],
  isActive: true,
  createdAt: new Date().toISOString(),
};

const UniHiveApp: React.FC = () => {
  const { activeRole, isAuthenticated, quickDemoLogin } = useAuth();
  const { isMobile } = useResponsive();
  const { openCart, totalCount } = useCart();

  const [currentView, setCurrentView] = useState<string>('marketplace');
  const [navDirection, setNavDirection] = useState<NavigationDirection>('fade');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(DEFAULT_PRODUCT);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string>(() => {
    const saved = localStorage.getItem('unihive_active_order_id');
    if (saved === 'order-acu-4829') {
      localStorage.removeItem('unihive_active_order_id');
      return 'order-run-4829';
    }
    return saved || 'order-run-4829';
  });

  const TAB_ORDER: Record<string, number> = {
    marketplace: 0,
    search: 1,
    product: 2,
    tracking: 3,
    vendor: 4,
    courier: 5,
    admin: 6,
  };

  /**
   * Unified directional navigation with native View Transitions and fallback animations
   */
  const navigateTo = (
    newView: string,
    explicitDirection?: NavigationDirection,
    pushHistory = true
  ) => {
    let dir: NavigationDirection = explicitDirection || 'fade';
    if (!explicitDirection) {
      const prevIndex = TAB_ORDER[currentView] ?? 0;
      const nextIndex = TAB_ORDER[newView] ?? 0;
      if (nextIndex > prevIndex) dir = 'forward';
      else if (nextIndex < prevIndex) dir = 'backward';
      else dir = 'fade';
    }

    setNavDirection(dir);

    transitionNavigate(() => {
      setCurrentView(newView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, dir);

    if (pushHistory && typeof window !== 'undefined' && window.history) {
      try {
        window.history.pushState({ view: newView, direction: dir }, '', window.location.href);
      } catch {}
    }
  };

  // Browser back / forward button handling for natural mobile/desktop page transitions
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        navigateTo(e.state.view, 'backward', false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  // URL-based admin separation: Admin is accessible only by directly navigating to /admin or ?view=admin
  useEffect(() => {
    const isAdminUrl =
      window.location.pathname.toLowerCase().includes('/admin') ||
      window.location.search.toLowerCase().includes('view=admin') ||
      window.location.hash.toLowerCase().includes('admin');

    if (isAdminUrl) {
      if (activeRole !== 'admin') {
        quickDemoLogin('admin');
      }
      setCurrentView('admin');
    }
  }, []);

  // Role-based view guards & automatic synchronization across viewport sizes
  useEffect(() => {
    if (!isAuthenticated) return;

    const isAdminUrl =
      window.location.pathname.toLowerCase().includes('/admin') ||
      window.location.search.toLowerCase().includes('view=admin') ||
      window.location.hash.toLowerCase().includes('admin');

    if (activeRole === 'buyer') {
      if (['vendor', 'courier', 'admin'].includes(currentView)) {
        setCurrentView(isAdminUrl ? 'admin' : 'marketplace');
      }
    } else if (activeRole === 'courier') {
      if (['vendor', 'admin', 'tracking'].includes(currentView)) {
        setCurrentView(isAdminUrl ? 'admin' : 'courier');
      }
    } else if (activeRole === 'vendor') {
      if (['courier', 'admin', 'tracking'].includes(currentView)) {
        setCurrentView(isAdminUrl ? 'admin' : 'vendor');
      }
    } else if (activeRole === 'admin') {
      if (['courier', 'vendor', 'tracking'].includes(currentView)) {
        setCurrentView('admin');
      }
    }
  }, [activeRole, isAuthenticated]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('product', 'forward');
  };

  const handleOrderSuccess = (order: any) => {
    const newOrderId = order.id || order.orderId || (order.orders && order.orders[0]?.id) || '';
    if (newOrderId) {
      setActiveOrderId(newOrderId);
      localStorage.setItem('unihive_active_order_id', newOrderId);
    }
    navigateTo('tracking', 'forward');
  };

  const handleMobileTab = (tab: TabId) => {
    let target = 'marketplace';
    if (tab === 'home') target = 'marketplace';
    else if (tab === 'search') target = 'search';
    else if (tab === 'orders') target = 'tracking';
    else if (tab === 'vendor') target = 'vendor';
    else if (tab === 'dispatch') target = 'courier';
    else if (tab === 'admin') target = 'admin';
    navigateTo(target);
  };

  const getActiveTab = (): TabId => {
    if (currentView === 'search') return 'search';
    if (currentView === 'tracking') return 'orders';
    if (currentView === 'vendor') return 'vendor';
    if (currentView === 'courier') return 'dispatch';
    if (currentView === 'admin') return 'admin';
    return 'home';
  };

  // If user is not authenticated, display full Auth Gateway Page with initial 4-sec splash overlay
  if (!isAuthenticated) {
    return (
      <>
        {showSplash && <SplashScreen minDurationMs={4000} onComplete={() => setShowSplash(false)} />}
        <AuthGatewayPage />
      </>
    );
  }

  // Strict Admin Isolation: When the admin logs in, display ONLY the Admin Console and nothing else
  if (activeRole === 'admin') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0B1120',
          color: '#F8FAFC',
          width: '100%',
        }}
      >
        {showSplash && <SplashScreen minDurationMs={2000} onComplete={() => setShowSplash(false)} />}
        <AdminConsole />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'marketplace':
        return (
          <MarketplaceHome
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case 'search':
        return (
          <SearchDiscoveryView
            onSelectProduct={handleSelectProduct}
            initialQuery={searchQuery}
            onBack={() => navigateTo('marketplace', 'backward')}
          />
        );
      case 'product':
        return (
          <ProductDetail
            product={selectedProduct || DEFAULT_PRODUCT}
            onBack={() => navigateTo('marketplace', 'backward')}
            onOrderSuccess={handleOrderSuccess}
          />
        );
      case 'tracking':
        if (activeRole !== 'buyer') {
          return (
            <RoleRestrictedView
              requiredRole="buyer"
              onNavigateHome={() =>
                setCurrentView(
                  activeRole === 'vendor'
                    ? 'vendor'
                    : activeRole === 'courier'
                    ? 'courier'
                    : 'marketplace'
                )
              }
            />
          );
        }
        return (
          <OrderTracking
            initialOrderId={activeOrderId}
            onNavigateMarketplace={() => {
              localStorage.removeItem('unihive_active_order_id');
              setActiveOrderId('');
              navigateTo('marketplace', 'backward');
            }}
          />
        );
      case 'vendor':
        if (activeRole !== 'vendor') {
          return (
            <RoleRestrictedView
              requiredRole="vendor"
              onNavigateHome={() => setCurrentView('marketplace')}
            />
          );
        }
        return <VendorStudio />;
      case 'courier':
        if (activeRole !== 'courier') {
          return (
            <RoleRestrictedView
              requiredRole="courier"
              onNavigateHome={() => setCurrentView('marketplace')}
            />
          );
        }
        return <CourierPortal />;
      case 'admin':
        return <AdminConsole />;
      case 'panoramic':
        return (
          <PanoramicSuiteView
            onSelectScreen={(screenId) => {
              if (screenId === '01_home' || screenId === '11_desktop_market') setCurrentView('marketplace');
              else if (screenId === '02_search') setCurrentView('search');
              else if (screenId === '03_product' || screenId === '12_desktop_product') setCurrentView('product');
              else if (screenId === '05_tracking') setCurrentView('tracking');
              else if (screenId === '06_vendor') setCurrentView('vendor');
              else if (screenId === '07_dispatch') setCurrentView('courier');
              else if (screenId === '10_admin_mobile' || screenId === '10_admin_desktop') setCurrentView('admin');
              else setCurrentView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      default:
        return (
          <MarketplaceHome
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: currentView === 'admin' ? '#0B1120' : '#F8FAFC',
        color: currentView === 'admin' ? '#F8FAFC' : '#0F172A',
        width: '100%',
      }}
    >
      {/* App Splash / Loading Screen on initial visit or page reload (4s bouncing UniHive logo) */}
      {showSplash && <SplashScreen minDurationMs={4000} onComplete={() => setShowSplash(false)} />}

      {/* Dynamic Header: Mobile Header vs Full Desktop Navbar */}
      {isMobile ? (
        <MobileHeader
          onOpenCart={openCart}
          cartCount={totalCount}
          onOpenNotifications={() => {}}
          currentView={currentView}
          onNavigate={(view) => navigateTo(view)}
        />
      ) : (
        <Navbar
          currentView={currentView}
          setCurrentView={(view) => navigateTo(view)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* Main Content Area - padded on mobile to ensure content isn't obscured by fixed bottom navbar */}
      <main
        style={{
          flex: 1,
          width: '100%',
          boxSizing: 'border-box',
          paddingBottom: isMobile ? 'calc(78px + env(safe-area-inset-bottom, 16px))' : '0px',
        }}
      >
        <div
          key={currentView}
          className={`page-container page-transition-${navDirection}`}
        >
          {renderContent()}
        </div>
      </main>

      {/* Dynamic Footer: Mobile Bottom Nav vs Desktop Footer */}
      {isMobile ? (
        <MobileBottomNav
          activeTab={getActiveTab()}
          onSelectTab={handleMobileTab}
          dark={currentView === 'admin'}
        />
      ) : (
        <footer
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            padding: '32px',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UniHiveLogo size={36} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2B5C' }}>
                  Uni<span style={{ color: '#F59E0B' }}>Hive</span>™
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  The Connected Multi-Campus Marketplace & Dispatch Network
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#059669" />
                <span>Zero-Room-Entry Ground-Floor Pickup Mandate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="#F59E0B" />
                <span>Zero-Trust 4-Digit Escrow Vault</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#2563EB" />
                <span>Flagship: Redeemer's University (RUN)</span>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              © 2026 UniHive Inc. All campus rights reserved.
            </div>
          </div>
        </footer>
      )}

      {/* Global Auth Modal */}
      <LoginModal />

      {/* Global Shopping Cart Drawer */}
      <CartDrawer
        onNavigateToTracking={(orderId) => {
          setActiveOrderId(orderId);
          setCurrentView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateMarketplace={() => {
          setCurrentView('marketplace');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Real-Time Audible Chime Toast & Notification Drawer */}
      <NotificationToast onNavigate={(view) => setCurrentView(view)} />
      <NotificationDrawer onNavigate={(view) => setCurrentView(view)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CampusProvider>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <CartProvider>
              <UniHiveApp />
            </CartProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </CampusProvider>
  );
};

export default App;
