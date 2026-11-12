import React from 'react';
import { Bell, ShoppingBag, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { UniHiveLogo } from '../components/common/UniHiveLogo';
import { MobileStatusBar } from '../components/common/MobileStatusBar';
import { MobileBottomNav, type TabId } from '../components/common/MobileBottomNav';
import { ProductGraphic } from '../components/common/ProductGraphic';

interface HomeFeedProps {
  onNavigate: (screenId: string) => void;
  onSelectProduct?: (product: any) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ onNavigate, onSelectProduct }) => {
  const handleTabSelect = (tab: TabId) => {
    if (tab === 'home') onNavigate('01_home');
    else if (tab === 'search') onNavigate('02_search');
    else if (tab === 'orders') onNavigate('05_tracking');
    else if (tab === 'vendor') onNavigate('06_vendor');
    else if (tab === 'dispatch') onNavigate('07_dispatch');
  };

  const handleProductClick = (product: any) => {
    if (onSelectProduct) onSelectProduct(product);
    onNavigate('03_product');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto',
        minHeight: '844px',
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <MobileStatusBar />

      {/* Top Header */}
      <div
        style={{
          padding: '8px 20px 12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UniHiveLogo size={42} />
          <div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F2B5C', lineHeight: 1.1 }}>
              Uni<span style={{ color: '#F59E0B' }}>Hive</span>
            </div>
            {/* Campus Selector Pill */}
            <div
              onClick={() => onNavigate('08_login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: '9999px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#1D4ED8',
                marginTop: '3px',
                cursor: 'pointer',
              }}
            >
              <span>Redeemer's Univ (Ede)</span>
              <ChevronDown size={12} />
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Bell */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <Bell size={18} color="#0F2B5C" />
            <div
              style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#EF4444',
              }}
            />
          </div>

          {/* Cart Bag with badge "1" */}
          <div
            onClick={() => onNavigate('04_checkout')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <ShoppingBag size={18} color="#059669" />
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#059669',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #FFFFFF',
              }}
            >
              1
            </div>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px' }}>
        {/* Search Bar */}
        <div
          onClick={() => onNavigate('02_search')}
          style={{
            background: '#F1F5F9',
            borderRadius: '16px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#64748B',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '16px',
            border: '1px solid transparent',
          }}
        >
          <Search size={18} color="#94A3B8" />
          <span style={{ color: '#94A3B8', fontWeight: 500 }}>
            Search sneakers, hoodies, buttery food, chargers...
          </span>
        </div>

        {/* 100% ANTI-SCAM SHIELD Banner */}
        <div
          style={{
            background: '#0F2B5C',
            borderRadius: '20px',
            padding: '18px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '20px',
            boxShadow: '0 8px 20px -4px rgba(30, 58, 138, 0.35)',
          }}
        >
          {/* Shield watermark graphic on right */}
          <div
            style={{
              position: 'absolute',
              right: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.15,
              pointerEvents: 'none',
            }}
          >
            <svg width="120" height="130" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '9999px',
              padding: '3px 10px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              color: '#FBBF24',
              marginBottom: '10px',
            }}
          >
            100% ANTI-SCAM SHIELD
          </div>

          <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
            Safe Campus Shopping
          </div>

          <div style={{ fontSize: '12px', color: '#BFDBFE', lineHeight: 1.45, maxWidth: '280px' }}>
            Your money is locked safely until you inspect your package and give the 4-digit code at your hostel desk.
          </div>
        </div>

        {/* POPULAR CATEGORIES */}
        <div style={{ marginBottom: '22px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F2B5C', letterSpacing: '0.3px' }}>
              POPULAR CATEGORIES
            </div>
            <div
              onClick={() => onNavigate('02_search')}
              style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}
            >
              See all
            </div>
          </div>

          {/* Horizontal scrollable pills */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {[
              { label: 'Shoes & Kicks' },
              { label: 'Thrift & Fits' },
              { label: 'Buttery & Food' },
              { label: 'Tech & Gadgets' },
            ].map((cat, i) => (
              <button
                key={i}
                onClick={() => onNavigate('02_search')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0F2B5C',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                }}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TRENDING IN RUN HALLS */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F2B5C', letterSpacing: '0.3px' }}>
              TRENDING IN RUN HALLS
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
              Live listings
            </div>
          </div>

          {/* 2-Column Product Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px',
            }}
          >
            {/* Card 1: Nike Air Force 1 */}
            <div
              onClick={() =>
                handleProductClick({
                  id: 'p1',
                  name: "Nike Air Force 1 '07 Low (Triple White)",
                  price: 18500,
                  vendor: 'Tunde Kicks',
                  hall: 'Joshua Hall',
                  condition: 'Size 43',
                  badgeColor: '#334155',
                  type: 'sneaker',
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '12px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
              }}
            >
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '14px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: '#334155',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '8px',
                  }}
                >
                  Size 43
                </div>
                <ProductGraphic type="sneaker" size={90} />
              </div>

              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                Nike Air Force 1 (Triple...
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  color: '#64748B',
                  marginBottom: '8px',
                }}
              >
                <CheckCircle2 size={12} color="#2563EB" />
                <span>Tunde Kicks • Joshua Hall</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>₦18,500</span>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}
                >
                  View
                </span>
              </div>
            </div>

            {/* Card 2: Oraimo Charger */}
            <div
              onClick={() =>
                handleProductClick({
                  id: 'p2',
                  name: 'Oraimo 65W GaN Fast Charger',
                  price: 9000,
                  vendor: 'GadgetPlug',
                  hall: 'Joseph Hall',
                  condition: 'Brand New',
                  badgeColor: '#059669',
                  type: 'charger',
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '12px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
              }}
            >
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '14px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: '#059669',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '8px',
                  }}
                >
                  Brand New
                </div>
                <ProductGraphic type="charger" size={90} />
              </div>

              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                Oraimo 65W Fast Charge...
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  color: '#64748B',
                  marginBottom: '8px',
                }}
              >
                <CheckCircle2 size={12} color="#2563EB" />
                <span>GadgetPlug • Joseph Hall</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>₦9,000</span>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '14px',
                    fontWeight: 700,
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </span>
              </div>
            </div>

            {/* Card 3: Food / Jollof Rice */}
            <div
              onClick={() =>
                handleProductClick({
                  id: 'p3',
                  name: 'Jollof Rice & Peppered Turkey',
                  price: 3500,
                  vendor: 'Central Buttery',
                  hall: 'RUN Central Buttery',
                  condition: 'Hot & Fresh',
                  badgeColor: '#F59E0B',
                  type: 'food',
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '12px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
              }}
            >
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '14px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: '#F59E0B',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '8px',
                  }}
                >
                  Hot & Fresh
                </div>
                <ProductGraphic type="food" size={85} />
              </div>

              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                Jollof Rice & Turkey...
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  color: '#64748B',
                  marginBottom: '8px',
                }}
              >
                <CheckCircle2 size={12} color="#2563EB" />
                <span>Central Buttery • RUN Core</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>₦3,500</span>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}
                >
                  View
                </span>
              </div>
            </div>

            {/* Card 4: Clean Thrift Jacket */}
            <div
              onClick={() =>
                handleProductClick({
                  id: 'p4',
                  name: 'Vintage Corduroy Jacket',
                  price: 7500,
                  vendor: 'ThriftZone',
                  hall: 'Queen Esther Hall',
                  condition: 'Clean Thrift',
                  badgeColor: '#4F46E5',
                  type: 'jacket',
                })
              }
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '12px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 6px rgba(15, 43, 92, 0.04)',
              }}
            >
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: '14px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '8px',
                  }}
                >
                  Clean Thrift
                </div>
                <ProductGraphic type="jacket" size={85} />
              </div>

              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                Vintage Corduroy Jacket
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  color: '#64748B',
                  marginBottom: '8px',
                }}
              >
                <CheckCircle2 size={12} color="#2563EB" />
                <span>ThriftZone • Queen Esther</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>₦7,500</span>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}
                >
                  View
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Nav */}
      <MobileBottomNav activeTab="home" onSelectTab={handleTabSelect} />
    </div>
  );
};
