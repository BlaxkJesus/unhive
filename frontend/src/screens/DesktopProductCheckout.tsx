import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Phone, MessageCircle, ShieldCheck, Lock, Package, Tag, Search } from 'lucide-react';
import { UniHiveLogo } from '../components/common/UniHiveLogo';
import { ProductGraphic } from '../components/common/ProductGraphic';
import { PaystackDemoModal } from '../components/common/PaystackDemoModal';

interface DesktopProductCheckoutProps {
  onNavigate: (screenId: string) => void;
  product?: any;
}

export const DesktopProductCheckout: React.FC<DesktopProductCheckoutProps> = ({ onNavigate, product }) => {
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [selectedHostel] = useState("Queen Esther Hall (Ground Floor Porter's Lodge)");
  const [roomNo, setRoomNo] = useState('Room 204');
  const [phone, setPhone] = useState('0812 345 0001');
  const [paystackOpen, setPaystackOpen] = useState(false);

  const itemPrice = product?.price || 18500;
  const techFee = 100;
  const deliveryFee = 250;
  const totalAmount = itemPrice + techFee + deliveryFee;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#F8FAFC',
        color: '#0F172A',
        fontFamily: 'var(--font-main, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onNavigate('11_desktop_market')}>
            <UniHiveLogo size={40} />
            <div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F2B5C', lineHeight: 1.1 }}>
                Uni<span style={{ color: '#F59E0B' }}>Hive</span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>The Connected Campus Network</div>
            </div>
          </div>

          {/* Campus Selector */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderRadius: '9999px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1D4ED8',
            }}
          >
            <span>Redeemer's Univ (Ede)</span>
            <span style={{ background: '#059669', color: '#FFFFFF', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
              Active
            </span>
            <ChevronDown size={14} />
          </div>

          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('11_desktop_market')}>Home</span>
            <span>&gt;</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('11_desktop_market')}>Shoes &amp; Kicks</span>
            <span>&gt;</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>Nike Air Force 1 '07 Low</span>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onNavigate('11_desktop_market')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Market</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              AO
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                Amaka Okafor
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Queen Esther Hall
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Split Grid */}
      <div
        style={{
          flex: 1,
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '30px 40px',
          width: '100%',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '30px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Multi-photo Gallery, Condition, Mandate Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Photo Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '380px',
            }}
          >
            {/* Badges */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '8px' }}>
              <span
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  color: '#1D4ED8',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                }}
              >
                Refurbished Like New
              </span>
              <span
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                }}
              >
                RUN In-Campus • 15m Delivery
              </span>
            </div>

            {/* Circular Gradient Background with Sneaker */}
            <div
              style={{
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ProductGraphic type="sneaker" size={200} />
            </div>

            {/* Photo count */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
              }}
            >
              1 of 4 Photos
            </div>
          </div>

          {/* Thumbnail Strip (4 Thumbnails) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {[
              { id: 0, icon: <ProductGraphic type="sneaker" size={44} /> },
              { id: 1, icon: <Package size={26} color="#B45309" /> },
              { id: 2, icon: <Tag size={26} color="#F59E0B" /> },
              { id: 3, icon: <Search size={26} color="#6366F1" /> },
            ].map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedThumb(t.id)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: selectedThumb === t.id ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  height: '74px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                {t.icon}
              </div>
            ))}
          </div>

          {/* Item Overview & Seller Condition Notes Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
              Item Overview &amp; Seller Condition Notes
            </div>

            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
              Triple White Air Force 1 '07 Low in pristine condition. Bought brand new last semester, worn less than 5 times on campus. Sole stars fully visible, no heel drag, no creased toe box. Comes in original Nike box with receipt. Available for immediate handover at any RUN hostel porter's lodge.
            </div>

            {/* 3 Metric Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.4px', marginBottom: '4px' }}>
                  SHOE SIZE
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  43 EU / 9.5 US
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.4px', marginBottom: '4px' }}>
                  COLORWAY
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  Triple White '07
                </div>
              </div>

              <div style={{ background: '#FFFBEB', borderRadius: '14px', padding: '14px', border: '1px solid #FEF3C7' }}>
                <div style={{ fontSize: '10px', color: '#B45309', fontWeight: 800, letterSpacing: '0.4px', marginBottom: '4px' }}>
                  CAMPUS STOCK
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#B45309' }}>
                  Only 1 Pair Left
                </div>
              </div>
            </div>
          </div>

          {/* Paystack Escrow & Physical Inspection Mandate Banner */}
          <div
            style={{
              background: '#0F2B5C',
              borderRadius: '20px',
              padding: '20px',
              color: '#FFFFFF',
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
            }}
          >
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '12px', color: '#FBBF24', flexShrink: 0 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FBBF24', marginBottom: '4px' }}>
                Paystack Escrow &amp; Physical Inspection Mandate
              </div>
              <div style={{ fontSize: '12px', color: '#BFDBFE', lineHeight: 1.45 }}>
                Your payment is held in escrow. You do <strong style={{ color: '#FFFFFF' }}>NOT</strong> share your secret 4-digit code until you physically open the box, inspect the shoes, and confirm fit at your hostel's Ground Floor Porter's Lodge.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Purchase Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            padding: '28px',
            boxShadow: '0 4px 16px rgba(15, 43, 92, 0.05)',
            position: 'sticky',
            top: '80px',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-block',
              background: '#EFF6FF',
              color: '#1D4ED8',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              marginBottom: '8px',
            }}
          >
            REDEEMER'S UNIVERSITY CAMPUS LISTING
          </div>

          {/* Title */}
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
            Nike Air Force 1 '07 Low (Triple White)
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>₦18,500</span>
            <span style={{ fontSize: '16px', color: '#94A3B8', textDecoration: 'line-through' }}>₦22,000</span>
            <span
              style={{
                background: '#ECFDF5',
                color: '#059669',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              Save ₦3,500
            </span>
          </div>

          {/* Merchant Trust Box */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#0F2B5C',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                TK
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Tunde Kicks</span>
                  <ShieldCheck size={14} color="#2563EB" />
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Joshua Hall • Rm B12</div>
                <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 700 }}>
                  Rating: 4.9 • 142 RUN Orders Completed
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                style={{
                  width: '36px',
                  height: '36px',
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
                  width: '36px',
                  height: '36px',
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

          {/* Form: Drop-off destination */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', marginBottom: '6px' }}>
                HOSTEL DROP-OFF DESTINATION
              </div>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                <span>{selectedHostel}</span>
                <ChevronDown size={14} color="#64748B" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', marginBottom: '6px' }}>
                  ROOM NUMBER
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
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', marginBottom: '6px' }}>
                  WHATSAPP PHONE
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

          {/* Fee Itemization */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Item Subtotal:</span>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>₦{itemPrice.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>UniHive Platform Tech Fee:</span>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>₦{techFee}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Hostel Courier Delivery Fee:</span>
              <span style={{ fontWeight: 800, color: '#059669' }}>₦{deliveryFee}</span>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '6px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Total Escrow Amount:</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#D97706' }}>₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={() => setPaystackOpen(true)}
            style={{
              width: '100%',
              background: '#F59E0B',
              color: '#0F172A',
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              marginBottom: '14px',
            }}
          >
            <Lock size={18} />
            <span>Pay Now with Paystack Escrow • ₦{totalAmount.toLocaleString()}</span>
          </button>

          {/* Trust Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#64748B',
              textAlign: 'center',
            }}
          >
            <span>Escrow Shielded</span>
            <span>•</span>
            <span>Instant Bank Transfer / USSD</span>
            <span>•</span>
            <span>Zero-Risk Returns</span>
          </div>
        </div>
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
