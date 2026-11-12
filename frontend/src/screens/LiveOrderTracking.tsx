import React from 'react';
import { Phone, MessageCircle, AlertTriangle, Key, MapPin } from 'lucide-react';
import { MobileStatusBar } from '../components/common/MobileStatusBar';
import { MobileBottomNav, type TabId } from '../components/common/MobileBottomNav';

interface LiveOrderTrackingProps {
  onNavigate: (screenId: string) => void;
}

export const LiveOrderTracking: React.FC<LiveOrderTrackingProps> = ({ onNavigate }) => {
  const handleTabSelect = (tab: TabId) => {
    if (tab === 'home') onNavigate('01_home');
    else if (tab === 'search') onNavigate('02_search');
    else if (tab === 'orders') onNavigate('05_tracking');
    else if (tab === 'vendor') onNavigate('06_vendor');
    else if (tab === 'dispatch') onNavigate('07_dispatch');
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

      {/* Header */}
      <div style={{ padding: '8px 20px 0 20px' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F2B5C', marginBottom: '14px' }}>
          Active Order Tracking
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '20px' }}>
          <div
            style={{
              paddingBottom: '10px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#1D4ED8',
              borderBottom: '2.5px solid #1D4ED8',
              cursor: 'pointer',
            }}
          >
            Live Delivery
          </div>
          <div
            style={{
              paddingBottom: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            Past Orders
          </div>
        </div>
      </div>

      {/* Scrollable Order Details */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Main Order Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 43, 92, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
              ORDER #RUN-849201
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: '#FEF3C7',
                color: '#D97706',
                fontSize: '10px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '9999px',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706' }} />
              <span>Runner in Transit</span>
            </div>
          </div>

          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
            Multi-Vendor Order (2 Campus Products)
          </div>

          {/* Courier Multi-Stop Pickup Progression Card */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '12px',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px' }}>🚴</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Courier Pickup Stops (1/2 Picked Up)
                </span>
              </div>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#D97706', background: '#FEF3C7', padding: '2px 7px', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
                1/2 Stops
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ width: '50%', height: '100%', background: '#F59E0B' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Stop 1 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '7px 9px', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>
                    ✓
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 750, color: '#166534', textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Nike Air Force 1 '07 Low
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>📍 Joshua Hall • Tunde Kicks</div>
                  </div>
                </div>
                <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                  Picked Up ✓
                </span>
              </div>

              {/* Stop 2 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: '10px', padding: '7px 9px', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>
                    2
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 750, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Apple 20W USB-C Power Adapter
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>📍 Joseph Hall • Chidi Tech Hub</div>
                  </div>
                </div>
                <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#F59E0B' }} />
                  Heading to Pick Up 🚴
                </span>
              </div>

              {/* Final Stop */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '10px', padding: '7px 9px', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#CBD5E1', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5px', fontWeight: 800 }}>
                    🏁
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F172A' }}>
                      Ground-Floor Porter Desk
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B' }}>Queen Esther Hall Porter's Lodge</div>
                  </div>
                </div>
                <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                  Awaiting Items
                </span>
              </div>
            </div>
          </div>

          {/* Confidential Delivery Handshake Code (OTP) Card */}
          <div
            style={{
              background: '#0F172A',
              borderRadius: '20px',
              padding: '18px',
              color: '#FFFFFF',
              boxShadow: '0 6px 16px rgba(15, 23, 42, 0.25)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '14px' }}>
              <Key size={14} color="#F59E0B" />
              <span>DELIVERY HANDSHAKE CODE (OTP)</span>
            </div>

            {/* 4 PIN Boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
              {[
                { digit: '4', highlight: false },
                { digit: '8', highlight: false },
                { digit: '2', highlight: false },
                { digit: '9', highlight: true },
              ].map((pin, index) => (
                <div
                  key={index}
                  style={{
                    width: '54px',
                    height: '58px',
                    borderRadius: '14px',
                    background: '#1E293B',
                    border: pin.highlight ? '1.5px solid #F59E0B' : '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: pin.highlight ? '#F59E0B' : '#FFFFFF',
                  }}
                >
                  {pin.digit}
                </div>
              ))}
            </div>

            {/* Anti-Sharing Warning */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '11px', color: '#94A3B8', lineHeight: 1.45 }}>
              <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ color: '#F59E0B', fontWeight: 800 }}>DO NOT SHARE</span> this code over the phone. Only give it to the courier at your <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Hall Porter's Desk</span> after checking your package.
              </div>
            </div>
          </div>

          {/* Vetted Courier Card */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
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
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                SA
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Samuel A.</span>
                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Vetted Runner
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  RUN Student Courier • Joshua Hall
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Phone size={14} color="#059669" />
              </button>
              <button
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <MessageCircle size={14} color="#2563EB" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Timeline */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '18px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F2B5C' }}>
              Live Campus Delivery Timeline
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>
              ETA: 6 mins
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#059669',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>
                <div style={{ width: '2px', height: '30px', background: '#059669' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Order Confirmed & Escrow Funded
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  10:14 AM • ₦18,850 secured by Paystack Escrow
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#059669',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>
                <div style={{ width: '2px', height: '30px', background: '#F59E0B' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Packaged by Tunde Kicks
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  10:18 AM • Sealed box with safety tape
                </div>
              </div>
            </div>

            {/* Step 3 (Active) */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#F59E0B',
                    border: '3px solid #FEF3C7',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ width: '2px', height: '30px', background: '#E2E8F0' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Courier Walking to Hall Reception
                </div>
                <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>
                  10:24 AM • Approaching Queen Esther Gate
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                4
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                  At Porter's Desk & OTP Handshake
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Awaiting inspection & code exchange
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Location Notice */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <MapPin size={18} color="#15803D" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: '#166534', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 800 }}>Pickup Location:</span> Ground Floor Porter's Lodge, Queen Esther Hall. Come down with your phone when called.
          </div>
        </div>
      </div>

      {/* Persistent Bottom Nav */}
      <MobileBottomNav activeTab="orders" onSelectTab={handleTabSelect} />
    </div>
  );
};
