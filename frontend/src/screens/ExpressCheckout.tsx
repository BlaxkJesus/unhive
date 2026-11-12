import React, { useState } from 'react';
import { ArrowLeft, MapPin, Building, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { MobileStatusBar } from '../components/common/MobileStatusBar';
import { ProductGraphic } from '../components/common/ProductGraphic';
import { PaystackDemoModal } from '../components/common/PaystackDemoModal';

interface ExpressCheckoutProps {
  onNavigate: (screenId: string) => void;
}

export const ExpressCheckout: React.FC<ExpressCheckoutProps> = ({ onNavigate }) => {
  const [selectedHall] = useState('Queen Esther Hall (Female)');
  const [roomNo, setRoomNo] = useState('Room 204');
  const [phone, setPhone] = useState('0812 345 0001');
  const [paystackOpen, setPaystackOpen] = useState(false);

  const itemPrice = 18500;
  const dispatchFee = 250;
  const escrowFee = 100;
  const totalAmount = itemPrice + dispatchFee + escrowFee;

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

      {/* Top Nav */}
      <div
        style={{
          padding: '8px 20px 14px 20px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={() => onNavigate('03_product')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} color="#0F2B5C" />
        </button>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: '#0F2B5C',
            pointerEvents: 'none',
          }}
        >
          EXPRESS CHECKOUT
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 90px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Destination Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 43, 92, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#1D4ED8' }}>
              <MapPin size={14} color="#1D4ED8" />
              <span>DELIVERY DESTINATION (RUN)</span>
            </div>
            <span
              style={{
                background: '#ECFDF5',
                color: '#059669',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              Campus Direct
            </span>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px', letterSpacing: '0.3px' }}>
            SELECT HALL OF RESIDENCE
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '12px',
              cursor: 'pointer',
            }}
          >
            <span>{selectedHall}</span>
            <ChevronDown size={16} color="#64748B" />
          </div>

          {/* Zero-Room-Entry Callout Box */}
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <Building size={20} color="#15803D" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '11px', color: '#166534', lineHeight: 1.45 }}>
              <span style={{ fontWeight: 800 }}>Mandatory Drop-off Point:</span> Ground Floor Porter's Lodge / Reception Desk. Student runners are prohibited from entering residential corridors.
            </div>
          </div>

          {/* Inputs Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', marginBottom: '4px', letterSpacing: '0.4px' }}>
                HOSTEL ROOM
              </div>
              <input
                type="text"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', marginBottom: '4px', letterSpacing: '0.4px' }}>
                YOUR PHONE / WHATSAPP
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Product Preview Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '14px 18px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '14px',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ProductGraphic type="sneaker" size={50} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
              Nike Air Force 1 '07 Low
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
              Size 43 • Triple White • Brand New
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
              ₦18,500
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '18px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', marginBottom: '14px' }}>
            PAYMENT SUMMARY
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Item Subtotal</span>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>₦{itemPrice.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Campus Runner Dispatch</span>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  To Porter Desk
                </span>
              </div>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>₦{dispatchFee}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Escrow & Buyer Protection Fee</span>
                <ShieldCheck size={14} color="#059669" />
              </div>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>₦{escrowFee}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '18px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', marginBottom: '12px' }}>
            SELECT PAYMENT METHOD
          </div>

          <div
            style={{
              border: '2px solid #1E3A8A',
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#EFF6FF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: '#0F2B5C',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                ⚡
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Instant Bank Transfer</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>Paystack Virtual Account / OPay / Kuda</div>
              </div>
            </div>

            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#1E3A8A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={12} color="#FFFFFF" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '12px 20px 20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
          zIndex: 40,
        }}
      >
        <div>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>
            AMOUNT TO PAY
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
            ₦{totalAmount.toLocaleString()}
          </div>
        </div>

        <button
          onClick={() => setPaystackOpen(true)}
          style={{
            background: '#059669',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 22px',
            fontSize: '14px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
          }}
        >
          <ShieldCheck size={18} />
          <span>Confirm & Pay ₦{totalAmount.toLocaleString()}</span>
        </button>
      </div>

      {/* Paystack Demo Modal */}
      <PaystackDemoModal
        isOpen={paystackOpen}
        onClose={() => setPaystackOpen(false)}
        amount={totalAmount}
        customerEmail="buyer@run.edu.ng"
        reference={`pstk_demo_${Date.now()}`}
        onSuccess={() => {
          setPaystackOpen(false);
          onNavigate('05_tracking');
        }}
      />
    </div>
  );
};
