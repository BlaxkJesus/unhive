import React, { useState } from 'react';
import type { Product } from '../../types';
import { useCampus } from '../../context/CampusContext';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { API } from '../../config/api';
import {
  ShieldCheck,
  MapPin,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ProductGraphic } from '../../components/common/ProductGraphic';
import { PaystackDemoModal } from '../../components/common/PaystackDemoModal';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onOrderSuccess: (order: any) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onOrderSuccess,
}) => {
  const { hostels, currentCampus } = useCampus();
  const { user, token, setIsLoginModalOpen } = useAuth();
  const { isMobile } = useResponsive();
  const { addToCart, openCart, cartItems } = useCart();
  const [addedToast, setAddedToast] = useState(false);

  const [selectedHostelId, setSelectedHostelId] = useState<string>(
    hostels[0]?.id || 'hostel-run-queen-esther'
  );
  const [selectedSize, setSelectedSize] = useState<string>('43');
  const [roomNumber, setRoomNumber] = useState<string>(user?.roomNumber || 'Room 204');
  const [contactPhone, setContactPhone] = useState<string>(user?.phone || '08143829102');
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    'Please call when runner arrives at the ground-floor porter lodge reception desk.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [paystackOpen, setPaystackOpen] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);

  // Escrow Math strictly per Rule 2 & 3:
  const itemSubtotal = product.price;
  const platformTechFee = 100;
  const courierDeliveryFee = 250;
  const totalAmount = itemSubtotal + platformTechFee + courierDeliveryFee;

  const sizes = ['40', '41', '42', '43', '44', '45'];

  const getProductGraphicType = (title: string, category: string): 'sneaker' | 'charger' | 'food' | 'jacket' | 'socks' => {
    const lower = `${title} ${category}`.toLowerCase();
    if (lower.includes('nike') || lower.includes('shoe') || lower.includes('kick')) return 'sneaker';
    if (lower.includes('charge') || lower.includes('gadget') || lower.includes('power')) return 'charger';
    if (lower.includes('food') || lower.includes('asun') || lower.includes('jollof') || lower.includes('pot')) return 'food';
    if (lower.includes('sock')) return 'socks';
    return 'jacket';
  };

  const graphicType = getProductGraphicType(product.title, product.category);

  const isOutOfStock = !product.isActive || product.stockQuantity <= 0;

  const handleCreateOrder = async () => {
    if (!user || !token) {
      setIsLoginModalOpen(true);
      return;
    }

    if (isOutOfStock) {
      setError('This product is currently out of stock and cannot be purchased.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await API.createOrder(
        {
          productId: product.id,
          vendorId: product.vendorId,
          itemSubtotal,
          dropoffHostelId: selectedHostelId,
          dropoffRoom: roomNumber,
          contactPhone,
          specialInstructions,
          deliveryMethod: 'courier_runner',
        },
        token,
        currentCampus?.id || 'campus-run-ede'
      );

      if (res.success && res.data) {
        setPendingOrderData(res.data);
        setPaystackOpen(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place escrow order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackSuccess = () => {
    setPaystackOpen(false);
    if (pendingOrderData) {
      onOrderSuccess(pendingOrderData.order);
    }
  };

  return (
    <div
      style={{
        padding: isMobile ? '12px clamp(10px, 3.2vw, 16px) 96px clamp(10px, 3.2vw, 16px)' : '24px 32px 96px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: 'clamp(5px, 1.5vw, 7px) clamp(10px, 2.5vw, 13px)',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          background: '#FFFFFF',
          color: '#475569',
          fontSize: 'clamp(11px, 2.6vw, 12px)',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        <ArrowLeft size={14} />
        <span>Back to Listings</span>
      </button>

      {/* Responsive Grid: Split 60/40 on Desktop, 1 Column on Mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : '1.2fr 0.8fr',
          gap: isMobile ? 'clamp(12px, 3vw, 18px)' : '28px',
          alignItems: 'start',
          width: '100%',
          minWidth: 0,
        }}
      >
        {/* Left Column: Product Details & Photos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'clamp(16px, 3vw, 20px)',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(15, 43, 92, 0.04)',
              width: '100%',
              minWidth: 0,
            }}
          >
            {/* Main Graphic / Hero Box (Scales fluidly with viewport) */}
            <div
              style={{
                height: 'clamp(200px, 45vw, 380px)',
                background: product.images && product.images.length > 0 ? '#0F172A' : '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
              }}
            >
              {product.images && product.images.length > 0 && product.images[selectedImageIndex] ? (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <ProductGraphic type={graphicType} size="clamp(115px, 32vw, 230px)" />
              )}
              <span
                style={{
                  position: 'absolute',
                  top: 'clamp(10px, 2.5vw, 16px)',
                  left: 'clamp(10px, 2.5vw, 16px)',
                  background: isOutOfStock ? '#DC2626' : '#059669',
                  color: '#FFFFFF',
                  fontSize: 'clamp(10px, 2.4vw, 11.5px)',
                  fontWeight: 800,
                  padding: 'clamp(3.5px, 1vw, 4.5px) clamp(9px, 2.2vw, 12px)',
                  borderRadius: '9999px',
                  letterSpacing: '0.3px',
                }}
              >
                {isOutOfStock ? 'OUT OF STOCK' : product.condition.replace('_', ' ')}
              </span>
            </div>

            {/* Multi-Image Thumbnail Selector (if more than 1 image) */}
            {product.images && product.images.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '12px clamp(14px, 3.5vw, 26px) 0 clamp(14px, 3.5vw, 26px)',
                  overflowX: 'auto',
                }}
              >
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: idx === selectedImageIndex ? '2.5px solid #2563EB' : '1px solid #CBD5E1',
                      padding: 0,
                      background: '#0F172A',
                      cursor: 'pointer',
                      flexShrink: 0,
                      opacity: idx === selectedImageIndex ? 1 : 0.65,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img src={img} alt={`${product.title} ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Product Metadata */}
            <div style={{ padding: 'clamp(14px, 3.5vw, 26px)', minWidth: 0 }}>

              <h1
                style={{
                  fontSize: 'clamp(17px, 4.5vw, 25px)',
                  fontWeight: 800,
                  color: '#0F172A',
                  marginBottom: '8px',
                  lineHeight: 1.28,
                  letterSpacing: '-0.3px',
                  wordBreak: 'break-word',
                }}
              >
                {product.title}
              </h1>

              <div
                style={{
                  fontSize: 'clamp(19px, 4.8vw, 24px)',
                  fontWeight: 800,
                  color: '#0F2B5C',
                  marginBottom: '16px',
                  letterSpacing: '-0.4px',
                }}
              >
                ₦{product.price.toLocaleString()}
              </div>

              {/* Size Selector */}
              {product.category === 'shoes' && (
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      fontSize: 'clamp(10.5px, 2.5vw, 12px)',
                      fontWeight: 800,
                      color: '#475569',
                      marginBottom: '8px',
                      letterSpacing: '0.4px',
                    }}
                  >
                    SELECT SIZE (EU)
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {sizes.map((s) => {
                      const isSel = selectedSize === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          style={{
                            width: 'clamp(36px, 9vw, 44px)',
                            height: 'clamp(36px, 9vw, 44px)',
                            borderRadius: '12px',
                            border: '1.5px solid',
                            borderColor: isSel ? '#0F2B5C' : '#E2E8F0',
                            background: isSel ? '#0F2B5C' : '#FFFFFF',
                            color: isSel ? '#FFFFFF' : '#0F172A',
                            fontSize: 'clamp(11.5px, 2.8vw, 13.5px)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p
                style={{
                  fontSize: 'clamp(12px, 2.8vw, 13.5px)',
                  color: '#475569',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                  wordBreak: 'break-word',
                }}
              >
                {product.description}
              </p>

              {/* Seller Trust Box */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: 'clamp(12px, 2.8vw, 16px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(15, 43, 92, 0.03)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: 'clamp(12.5px, 3vw, 14px)', fontWeight: 800, color: '#0F172A' }}>
                      Tunde Kicks
                    </span>
                    <CheckCircle2 size={14} color="#3B82F6" style={{ flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: 'clamp(10.5px, 2.5vw, 12px)', color: '#64748B', marginTop: '3px', wordBreak: 'break-word' }}>
                    Joshua Hall • 42 Completed Drops
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 'clamp(9.5px, 2.3vw, 11px)',
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontWeight: 750,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Verified Merchant
                </span>
              </div>

              {/* Zero-Room-Entry Rule Callout */}
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '16px',
                  padding: 'clamp(12px, 2.8vw, 16px)',
                  display: 'flex',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(30, 58, 138, 0.04)',
                }}
              >
                <ShieldCheck size={22} color="#1D4ED8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'clamp(11.5px, 2.7vw, 13px)', fontWeight: 800, color: '#1E40AF', marginBottom: '3px' }}>
                    Institutional Zero-Room-Entry Rule Active
                  </div>
                  <p style={{ fontSize: 'clamp(10.5px, 2.5vw, 12px)', color: '#1E3A8A', lineHeight: 1.5, wordBreak: 'break-word', margin: 0 }}>
                    Courier runs strictly terminate at the <strong>ground-floor hostel porter reception desk</strong>. Meet runner there to physically inspect your item before disclosing your confidential 4-digit PIN.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column / Mobile Section: Sticky Paystack Escrow Checkout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'clamp(16px, 3vw, 22px)',
              border: '1px solid #E2E8F0',
              padding: 'clamp(14px, 3.2vw, 26px)',
              boxShadow: '0 8px 24px -4px rgba(15, 43, 92, 0.07)',
              position: isMobile ? 'static' : 'sticky',
              top: '90px',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '6px' }}>
              <div>
                <span style={{ fontSize: 'clamp(10px, 2.4vw, 11.5px)', color: '#64748B', fontWeight: 750, letterSpacing: '0.4px' }}>
                  EXPRESS ESCROW CHECKOUT
                </span>
                <div style={{ fontSize: 'clamp(20px, 4.8vw, 26px)', fontWeight: 800, color: '#0F2B5C', letterSpacing: '-0.5px' }}>
                  ₦{totalAmount.toLocaleString()}
                </div>
              </div>
              <span
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  fontSize: 'clamp(10px, 2.4vw, 11.5px)',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                }}
              >
                Shield Protected
              </span>
            </div>

            {/* Form Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px', width: '100%', minWidth: 0 }}>
              <div style={{ width: '100%', minWidth: 0 }}>
                <label style={{ fontSize: 'clamp(10px, 2.4vw, 11.5px)', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '5px', letterSpacing: '0.3px' }}>
                  <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  DROPOFF HOSTEL (PORTER LODGE)
                </label>
                <select
                  value={selectedHostelId}
                  onChange={(e) => setSelectedHostelId(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    padding: 'clamp(9px, 2.2vw, 12px) clamp(10px, 2.5vw, 14px)',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: 'clamp(12px, 2.8vw, 13.5px)',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.gender.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: '100%', minWidth: 0 }}>
                <label style={{ fontSize: 'clamp(10px, 2.4vw, 11.5px)', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '5px', letterSpacing: '0.3px' }}>
                  YOUR ROOM & PHONE NUMBER
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '8px', width: '100%', minWidth: 0 }}>
                  <input
                    type="text"
                    placeholder="e.g. Room 204"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    style={{
                      width: '100%',
                      minWidth: 0,
                      maxWidth: '100%',
                      padding: 'clamp(9px, 2.2vw, 12px) clamp(10px, 2.5vw, 14px)',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: 'clamp(12px, 2.8vw, 13.5px)',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="08143829102"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    style={{
                      width: '100%',
                      minWidth: 0,
                      maxWidth: '100%',
                      padding: 'clamp(9px, 2.2vw, 12px) clamp(10px, 2.5vw, 14px)',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: 'clamp(12px, 2.8vw, 13.5px)',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ width: '100%', minWidth: 0 }}>
                <label style={{ fontSize: 'clamp(10px, 2.4vw, 11.5px)', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '5px', letterSpacing: '0.3px' }}>
                  PORTER LODGE NOTE
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Call when runner reaches ground-floor porter desk"
                  style={{
                    width: '100%',
                    minWidth: 0,
                    maxWidth: '100%',
                    padding: 'clamp(9px, 2.2vw, 12px) clamp(10px, 2.5vw, 14px)',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: 'clamp(12px, 2.7vw, 13px)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Fee Breakdown */}
            <div
              style={{
                borderTop: '1px solid #E2E8F0',
                borderBottom: '1px solid #E2E8F0',
                padding: '12px 0',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: 'clamp(11px, 2.6vw, 12.5px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Item Subtotal</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>₦{itemSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Platform Tech Fee</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>₦{platformTechFee.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Hostel Courier Run (Flat)</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>₦{courierDeliveryFee.toLocaleString()}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: 'clamp(13.5px, 3.2vw, 15px)',
                  color: '#0F2B5C',
                  paddingTop: '8px',
                  borderTop: '1px dashed #E2E8F0',
                }}
              >
                <span>Total Escrow Amount</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {isOutOfStock && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #FECACA',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#991B1B' }}>
                    Currently Out of Stock
                  </div>
                  <div style={{ fontSize: '11px', color: '#B91C1C', marginTop: '2px' }}>
                    The seller has 0 units remaining for this listing. Purchases are temporarily disabled.
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  color: '#DC2626',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: 'clamp(11.5px, 2.6vw, 12.5px)',
                  marginBottom: '14px',
                }}
              >
                {error}
              </div>
            )}

            {/* Action Buttons: Add to Cart + Pay Now via Escrow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                disabled={isOutOfStock}
                onClick={() => {
                  const res = addToCart(product, 1, {
                    size: selectedSize,
                    combo: product.comboBadge,
                  });
                  if (res.success) {
                    setAddedToast(true);
                    setTimeout(() => setAddedToast(false), 3500);
                  }
                }}
                style={{
                  width: '100%',
                  padding: 'clamp(11px, 2.8vw, 14px)',
                  borderRadius: '14px',
                  border: '1.5px solid #0F2B5C',
                  background: addedToast ? '#ECFDF5' : '#FFFFFF',
                  color: addedToast ? '#059669' : '#0F2B5C',
                  fontSize: 'clamp(13px, 3.2vw, 14.5px)',
                  fontWeight: 800,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  opacity: isOutOfStock ? 0.6 : 1,
                }}
              >
                {addedToast ? (
                  <>
                    <CheckCircle2 size={17} color="#059669" />
                    <span>Added to Cart! (Tap to open cart)</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={17} />
                    <span>
                      {cartItems.find((ci) => ci.product.id === product.id)
                        ? `In Cart (${
                            cartItems.find((ci) => ci.product.id === product.id)?.quantity
                          }) : Add Another`
                        : '+ Add to Hive Cart'}
                    </span>
                  </>
                )}
              </button>

              {addedToast && (
                <div
                  onClick={openCart}
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#1D4ED8',
                    fontWeight: 700,
                  }}
                >
                  <span>Item added to your cart</span>
                  <u style={{ color: '#2563EB' }}>Open Cart & Checkout ➔</u>
                </div>
              )}

              <button
                disabled={loading || isOutOfStock}
                onClick={handleCreateOrder}
                style={{
                  width: '100%',
                  padding: 'clamp(11px, 2.8vw, 15px)',
                  borderRadius: '12px',
                  border: 'none',
                  background: isOutOfStock ? '#CBD5E1' : '#D97706',
                  color: isOutOfStock ? '#64748B' : '#FFFFFF',
                  fontSize: 'clamp(13px, 3.2vw, 15px)',
                  fontWeight: 800,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
                }}
              >
                <CreditCard size={17} style={{ flexShrink: 0 }} />
                <span>
                  {isOutOfStock
                    ? 'Out of Stock (Unavailable)'
                    : loading
                    ? 'Locking Escrow...'
                    : `Direct Escrow Checkout ₦${totalAmount.toLocaleString()}`}
                </span>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: 'clamp(9.5px, 2.3vw, 11px)', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <Lock size={12} style={{ flexShrink: 0 }} />
              <span>Atomic Dual Settlement • 100% Refundable if item rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Paystack Demo Modal */}
      <PaystackDemoModal
        isOpen={paystackOpen}
        onClose={() => setPaystackOpen(false)}
        amount={totalAmount}
        customerEmail={user?.email || 'buyer@run.edu.ng'}
        reference={pendingOrderData?.escrow?.paystackReference || `pstk_demo_${Date.now()}`}
        onSuccess={handlePaystackSuccess}
      />
    </div>
  );
};
