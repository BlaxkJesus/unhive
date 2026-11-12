import React, { useState } from 'react';
import { Bike, Phone, MessageSquare, ShieldAlert, Check } from 'lucide-react';
import { MobileStatusBar } from '../components/common/MobileStatusBar';
import { MobileBottomNav, type TabId } from '../components/common/MobileBottomNav';

interface CourierDispatchProps {
  onNavigate: (screenId: string) => void;
}

export const CourierDispatch: React.FC<CourierDispatchProps> = ({ onNavigate }) => {
  const [pinDigits, setPinDigits] = useState(['4', '8', '2', '9']);
  const [isSettled, setIsSettled] = useState(false);

  const handleTabSelect = (tab: TabId) => {
    if (tab === 'home') onNavigate('01_home');
    else if (tab === 'search') onNavigate('02_search');
    else if (tab === 'orders') onNavigate('05_tracking');
    else if (tab === 'vendor') onNavigate('06_vendor');
    else if (tab === 'dispatch') onNavigate('07_dispatch');
  };

  const handlePinChange = (index: number, val: string) => {
    const updated = [...pinDigits];
    updated[index] = val.slice(-1);
    setPinDigits(updated);
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
      <div
        style={{
          padding: '8px 20px 14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.4px', marginBottom: '2px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
            <span>RUN DISPATCH NETWORK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Samuel A. (Runner)</span>
            <span
              style={{
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              Joshua Hall
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '9999px',
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
          <span>Online</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Performance Dark Card */}
        <div
          className="card-stagger-item"
          style={{
            background: '#0F172A',
            borderRadius: '24px',
            padding: '18px',
            color: '#FFFFFF',
            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.25)',
            animationDelay: '30ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontSize: '13px', fontWeight: 800 }}>
              <Bike size={16} color="#F59E0B" />
              <span>Courier Shift Performance</span>
            </div>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              ₦500 Batch / ₦1,500 Express
            </div>
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '16px',
                padding: '12px 14px',
                border: '1px solid #334155',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.4px', marginBottom: '4px' }}>
                TODAY'S EARNINGS
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#34D399', marginBottom: '2px' }}>
                ₦1,750
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                7 Campus Runs Completed
              </div>
            </div>

            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '16px',
                padding: '12px 14px',
                border: '1px solid #334155',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.4px', marginBottom: '4px' }}>
                RUNNER RATING
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#94A3B8', marginBottom: '2px' }}>
                No ratings yet
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                New Runner • 0 Lifetime Trips
              </div>
            </div>
          </div>

          {/* Account Strip */}
          <div
            style={{
              background: '#1E293B',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #334155',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>Courier Bank Account</div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>Auto-credit on OTP match • Max 2 accounts</div>
            </div>

            <div
              style={{
                background: 'rgba(5, 150, 105, 0.25)',
                color: '#34D399',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '6px',
              }}
            >
              ⚡ Instant Bank Payout
            </div>
          </div>
        </div>

        {/* Active Gig Card */}
        <div
          className="card-stagger-item"
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '18px',
            border: '1.5px solid #A7F3D0',
            boxShadow: '0 2px 8px rgba(15, 43, 92, 0.04)',
            animationDelay: '80ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A7F3D0' }} />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Active Gig #RUN-849201</span>
            </div>
            <div
              style={{
                background: '#ECFDF5',
                color: '#059669',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '9999px',
              }}
            >
              ETA: 4 mins • Walking
            </div>
          </div>

          {/* Route Container */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid #E2E8F0',
              marginBottom: '14px',
            }}
          >
            {/* Pickup */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', marginTop: '4px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#059669', letterSpacing: '0.4px' }}>
                  PICKUP LOCATION (DONE ✓)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Joshua Hall • Room B12
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Vendor: Tunde Kicks (Sealed Box)
                </div>
              </div>
            </div>

            {/* Dropoff */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', marginTop: '4px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.4px' }}>
                  DROPOFF DESTINATION (IN PROGRESS •)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Queen Esther Hall • Porter's Lodge
                </div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                  Recipient: Amaka O.
                </div>
              </div>
            </div>

            {/* Zero-Room-Entry Rule Notice */}
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#DC2626',
                fontWeight: 700,
              }}
            >
              <ShieldAlert size={14} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>RUN Safety Rule: Handover strictly at Porter's Lodge. No room entry allowed.</span>
            </div>
          </div>

          {/* Contact Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <button
              style={{
                background: '#EFF6FF',
                border: '1px solid #DBEAFE',
                color: '#1D4ED8',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Phone size={14} />
              <span>Call Amaka</span>
            </button>

            <button
              style={{
                background: '#EFF6FF',
                border: '1px solid #DBEAFE',
                color: '#1D4ED8',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* PIN Verification Handshake Box */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: '18px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                Enter Buyer's 4-Digit Delivery Code
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '14px' }}>
              Ask Amaka for the code after she inspects the shoes at the Porter's desk.
            </div>

            {/* 4 Yellow Border PIN Boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
              {pinDigits.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  style={{
                    width: '50px',
                    height: '52px',
                    borderRadius: '12px',
                    border: '2px solid #F59E0B',
                    background: '#FFFFFF',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            {/* Confirm PIN Button */}
            <button
              onClick={() => setIsSettled(true)}
              disabled={isSettled}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: isSettled ? '#059669' : '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: '0 4px 10px rgba(15, 43, 92, 0.25)',
              }}
            >
              <Check size={16} />
              <span>{isSettled ? 'Dual Settlement Completed!' : 'Confirm PIN & Collect Runner Fee'}</span>
            </button>

            <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center' }}>
              Dual Settlement: Triggers item subtotal to vendor's OPay & courier fee to your Kuda account.
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Nav */}
      <MobileBottomNav activeTab="dispatch" onSelectTab={handleTabSelect} />
    </div>
  );
};
