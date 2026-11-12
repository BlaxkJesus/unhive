import React, { useState } from 'react';
import { ArrowLeft, Heart, Share2, MessageCircle, ShoppingBag, Flame } from 'lucide-react';
import { MobileStatusBar } from '../components/common/MobileStatusBar';
import { ProductGraphic } from '../components/common/ProductGraphic';

interface ProductDetailsProps {
  onNavigate: (screenId: string) => void;
  product?: any;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ onNavigate, product }) => {
  const [selectedSize, setSelectedSize] = useState('43');
  const [isLiked, setIsLiked] = useState(false);

  const item = product || {
    id: 'p1',
    name: "Nike Air Force 1 '07 Low (Triple White)",
    category: "Shoes & Kicks",
    price: 18500,
    vendor: 'Tunde Kicks',
    hall: 'Joshua Hall',
    type: 'sneaker',
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

      {/* Top Nav Bar */}
      <div
        style={{
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => onNavigate('01_home')}
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

        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F2B5C' }}>
          {item.category || 'Shoes & Kicks'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsLiked(!isLiked)}
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
            <Heart size={18} color={isLiked ? '#EF4444' : '#0F2B5C'} fill={isLiked ? '#EF4444' : 'none'} />
          </button>
          <button
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
            <Share2 size={18} color="#0F2B5C" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 90px 20px' }}>
        {/* Product Gallery Container */}
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '28px',
            padding: '24px 20px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '260px',
            marginBottom: '16px',
          }}
        >
          {/* Badge */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: '#059669',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '9999px',
            }}
          >
            Brand New In Box
          </div>

          <ProductGraphic type={item.type || 'sneaker'} size={150} />

          {/* Indicators & Photo Counter */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div style={{ width: '18px', height: '5px', borderRadius: '3px', background: '#1E3A8A' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }} />
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>1 of 3 photos</span>
          </div>
        </div>

        {/* Product Info Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 43, 92, 0.04)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
              MEN'S FOOTWEAR • RUN VERIFIED
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                ₦{item.price ? item.price.toLocaleString() : '18,500'}
              </span>
              <span
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                Fixed Price
              </span>
            </div>
          </div>

          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '14px', lineHeight: 1.3 }}>
            {item.name}
          </div>

          {/* High Demand Callout */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FEF3C7',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <Flame size={16} color="#F59E0B" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#B45309' }}>
              <span style={{ fontWeight: 800 }}>High Demand:</span> Only 1 pair left on campus in Size 43!
            </span>
          </div>

          {/* Size Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', marginBottom: '10px' }}>
              SELECT SIZE
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {['41', '42', '43', '44'].map((size) => {
                const isSelected = selectedSize === size;
                const isDisabled = size !== '43';

                return (
                  <button
                    key={size}
                    onClick={() => !isDisabled && setSelectedSize(size)}
                    disabled={isDisabled}
                    style={{
                      width: '48px',
                      height: '42px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #1E3A8A' : '1px solid #E2E8F0',
                      background: isSelected ? '#FFFFFF' : isDisabled ? '#F8FAFC' : '#FFFFFF',
                      color: isSelected ? '#1E3A8A' : isDisabled ? '#94A3B8' : '#0F172A',
                      fontWeight: 800,
                      fontSize: '14px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      textDecoration: isDisabled ? 'line-through' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vendor Stats Strip */}
        <div
          style={{
            background: '#0F172A',
            borderRadius: '18px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.5px' }}>
              DELIVERIES
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>38 Done</div>
          </div>

          <div style={{ borderLeft: '1px solid #334155', height: '24px' }} />

          <div>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.5px' }}>
              REVIEWS
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FBBF24' }}>4.9 (31 reviews)</div>
          </div>

          <div style={{ borderLeft: '1px solid #334155', height: '24px' }} />

          <div>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.5px' }}>
              DISPATCH
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#34D399' }}>&lt; 15 mins</div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
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
            TOTAL PRICE
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
            ₦{item.price ? item.price.toLocaleString() : '18,500'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
          <button
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <MessageCircle size={20} color="#0F2B5C" />
          </button>

          <button
            onClick={() => onNavigate('04_checkout')}
            style={{
              background: '#0F2B5C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 43, 92, 0.25)',
            }}
          >
            <ShoppingBag size={18} />
            <span>Pay Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
