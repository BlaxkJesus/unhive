import React, { useState } from 'react';
import { Plus, CheckCircle2, Zap, Landmark, Check, Bike, ShieldCheck } from 'lucide-react';
import { MobileStatusBar } from '../components/common/MobileStatusBar';
import { MobileBottomNav, type TabId } from '../components/common/MobileBottomNav';

interface VendorStudioProps {
  onNavigate: (screenId: string) => void;
}

interface ActiveHandshakeOrder {
  id: string;
  orderNumber: string;
  itemTitle: string;
  buyer: string;
  location: string;
  price: number;
  expectedPin: string[];
}

const SAMPLE_PICKUP_ORDERS: ActiveHandshakeOrder[] = [
  {
    id: 'order-1',
    orderNumber: '#RUN-849201',
    itemTitle: "Nike Air Force 1 '07 (Triple White)",
    buyer: 'Amaka O.',
    location: 'Queen Esther Hall',
    price: 18500,
    expectedPin: ['4', '8', '2', '9'],
  },
  {
    id: 'order-2',
    orderNumber: '#RUN-910423',
    itemTitle: 'Casio Scientific Calculator FX-991EX',
    buyer: 'Tobi Adebayo',
    location: 'Joshua Hall',
    price: 6500,
    expectedPin: ['1', '9', '7', '3'],
  },
  {
    id: 'order-3',
    orderNumber: '#RUN-773190',
    itemTitle: 'Anti-Theft Waterproof Backpack',
    buyer: 'Fatima Bello',
    location: 'Maryam Hall',
    price: 13500,
    expectedPin: ['6', '2', '4', '0'],
  },
];

export const VendorStudio: React.FC<VendorStudioProps> = ({ onNavigate }) => {
  const [deliveryMode, setDeliveryMode] = useState<'self' | 'courier'>('self');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('order-1');
  const [settledOrderIds, setSettledOrderIds] = useState<string[]>([]);
  const [pinDigits, setPinDigits] = useState(['4', '8', '2', '9']);

  const currentOrder = SAMPLE_PICKUP_ORDERS.find((o) => o.id === selectedOrderId) || SAMPLE_PICKUP_ORDERS[0];
  const isCurrentOrderSettled = settledOrderIds.includes(currentOrder.id);

  const handleTabSelect = (tab: TabId) => {
    if (tab === 'home') onNavigate('01_home');
    else if (tab === 'search') onNavigate('02_search');
    else if (tab === 'orders') onNavigate('05_tracking');
    else if (tab === 'vendor') onNavigate('06_vendor');
    else if (tab === 'dispatch') onNavigate('07_dispatch');
  };

  const handleSelectOrder = (order: ActiveHandshakeOrder) => {
    setSelectedOrderId(order.id);
    setPinDigits(order.expectedPin);
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
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', letterSpacing: '0.4px', marginBottom: '2px' }}>
            MERCHANT STUDIO
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>Tunde Kicks</span>
            <CheckCircle2 size={18} color="#2563EB" />
          </div>
        </div>

        <button
          style={{
            background: '#0F2B5C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Direct Paystack Escrow Card */}
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
              <Zap size={16} color="#F59E0B" />
              <span>Direct Paystack Escrow</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              <span>Auto-Payout Active</span>
            </div>
          </div>

          {/* Revenue Grid */}
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
                THIS MONTH (SEPT)
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                ₦85,400
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>
                ↗ 11 orders delivered
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
                LIFETIME REVENUE
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B', marginBottom: '2px' }}>
                ₦342,000
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                38 total orders
              </div>
            </div>
          </div>

          {/* Bank Strip */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Landmark size={16} color="#94A3B8" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>OPay • 8140 •••• 921</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Verified: Babatunde A.</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(5, 150, 105, 0.25)',
                color: '#34D399',
                fontSize: '10px',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={12} color="#F59E0B" />
              <span>Direct Bank Credit</span>
            </div>
          </div>
        </div>

        {/* Active Order Card */}
        <div
          className="card-stagger-item"
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 43, 92, 0.04)',
            animationDelay: '80ms',
          }}
        >
          {/* Multi-Order Handshake Queue Ribbon */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px' }}>
                  ACTIVE PICKUP QUEUE ({SAMPLE_PICKUP_ORDERS.length})
                </span>
              </div>
              <div
                style={{
                  background: '#FFFBEB',
                  color: '#B45309',
                  border: '1px solid #FEF3C7',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                }}
              >
                ⏱ Awaiting Handshakes
              </div>
            </div>

            {/* Order Selector Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {SAMPLE_PICKUP_ORDERS.map((order) => {
                const isSelected = order.id === currentOrder.id;
                const isSettled = settledOrderIds.includes(order.id);
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => handleSelectOrder(order)}
                    style={{
                      flex: '1 0 auto',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: isSelected ? '#EFF6FF' : '#F8FAFC',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: isSelected ? '#1E40AF' : '#0F172A' }}>
                        {order.orderNumber}
                      </span>
                      {isSettled ? (
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#059669', background: '#DCFCE7', padding: '1px 5px', borderRadius: '4px' }}>
                          ✓ SETTLED
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#059669' }}>
                          ₦{order.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {order.buyer}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Target Order Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', background: '#F8FAFC', padding: '12px', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                {currentOrder.itemTitle}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Buyer: <span style={{ fontWeight: 700, color: '#0F172A' }}>{currentOrder.buyer}</span> • {currentOrder.location}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#059669' }}>
                ₦{currentOrder.price.toLocaleString()}
              </div>
              <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 700 }}>
                {isCurrentOrderSettled ? 'Settled to Bank' : 'Locked in Escrow'}
              </div>
            </div>
          </div>

          {/* Delivery Mode Switcher */}
          <div
            style={{
              background: '#F1F5F9',
              borderRadius: '12px',
              padding: '4px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              marginBottom: '16px',
            }}
          >
            <button
              type="button"
              onClick={() => setDeliveryMode('courier')}
              style={{
                background: deliveryMode === 'courier' ? '#FFFFFF' : 'transparent',
                color: deliveryMode === 'courier' ? '#0F2B5C' : '#64748B',
                border: 'none',
                borderRadius: '10px',
                padding: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: deliveryMode === 'courier' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Courier Run (Hands-Free)
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMode('self')}
              style={{
                background: deliveryMode === 'self' ? '#FFFFFF' : 'transparent',
                color: deliveryMode === 'self' ? '#0F2B5C' : '#64748B',
                border: 'none',
                borderRadius: '10px',
                padding: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: deliveryMode === 'self' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Direct Buyer Pickup
            </button>
          </div>

          {deliveryMode === 'courier' ? (
            /* Courier Fleet Mode (Hands-Free for Vendor) */
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '18px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Bike size={14} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>
                  Courier Fleet Active • Hands-Free for Vendor
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#166534', lineHeight: 1.45 }}>
                Platform runner collects package directly from you and delivers to the hostel porter reception desk. Runner verifies the 4-digit PIN at the desk: you don't need to contact them or enter any PIN!
              </div>
            </div>
          ) : (
            /* Direct Buyer Pickup PIN Subcard */
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '18px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <ShieldCheck size={14} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Direct Pickup Handshake PIN
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.45, marginBottom: '14px' }}>
                <strong>Direct Pickup Only:</strong> Meet {currentOrder.buyer} in person. Once they inspect the {currentOrder.itemTitle}, collect their confidential 4-digit code and enter below to release your ₦{currentOrder.price.toLocaleString()} escrow.
              </div>

              {/* 4 Input Boxes */}
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
                      borderRadius: '14px',
                      border: '1.5px solid #CBD5E1',
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

              {/* Settle Button */}
              <button
                type="button"
                onClick={() => {
                  if (!settledOrderIds.includes(currentOrder.id)) {
                    setSettledOrderIds((prev) => [...prev, currentOrder.id]);
                  }
                }}
                style={{
                  width: '100%',
                  background: isCurrentOrderSettled ? '#059669' : '#0F2B5C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 43, 92, 0.25)',
                  marginBottom: '10px',
                }}
              >
                {isCurrentOrderSettled ? <Check size={16} /> : <Zap size={16} color="#F59E0B" />}
                <span>
                  {isCurrentOrderSettled
                    ? `₦${currentOrder.price.toLocaleString()} Settled to OPay!`
                    : `Verify PIN & Settle ₦${currentOrder.price.toLocaleString()} to Bank`}
                </span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '10px', color: '#64748B' }}>
                <CheckCircle2 size={12} color="#059669" />
                <span>Direct Bank Credit: ₦{currentOrder.price.toLocaleString()} transfers automatically to OPay (8140••••921).</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Bottom Nav */}
      <MobileBottomNav activeTab="vendor" onSelectTab={handleTabSelect} />
    </div>
  );
};
