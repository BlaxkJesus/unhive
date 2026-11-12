import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useCampus } from '../../context/CampusContext';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../config/api';
import { ProductGraphic } from '../common/ProductGraphic';
import { PaystackDemoModal } from '../common/PaystackDemoModal';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  ShieldCheck,
  Package,
  Store,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Moon,
  Zap,
  Building2,
  Clock,
} from 'lucide-react';

interface CartDrawerProps {
  onNavigateToTracking?: (orderId: string) => void;
  onNavigateMarketplace?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToTracking,
  onNavigateMarketplace,
}) => {
  const getProductGraphicType = (
    title: string,
    category: string
  ): 'sneaker' | 'charger' | 'food' | 'jacket' | 'socks' => {
    const lower = `${title} ${category}`.toLowerCase();
    if (lower.includes('nike') || lower.includes('shoe') || lower.includes('kick')) return 'sneaker';
    if (lower.includes('charge') || lower.includes('gadget') || lower.includes('power')) return 'charger';
    if (lower.includes('food') || lower.includes('asun') || lower.includes('jollof') || lower.includes('pot')) return 'food';
    if (lower.includes('sock')) return 'socks';
    return 'jacket';
  };

  const {
    cartItems,
    totalCount,
    subtotal,
    platformTechFee,
    courierDeliveryFee,
    totalAmount,
    vendorPackages,
    deliveryMode,
    setDeliveryMode,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { currentCampus, hostels } = useCampus();
  const { user, token } = useAuth();

  // Hostel Dropoff Form State
  const [selectedHostelId, setSelectedHostelId] = useState<string>(() => {
    return user?.hostelId || (hostels.length > 0 ? hostels[0].id : 'hostel-run-queen-esther');
  });
  const [roomNumber, setRoomNumber] = useState<string>(user?.roomNumber || 'Room 204');
  const [contactPhone, setContactPhone] = useState<string>(user?.phone || '08123450001');
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    'Please deposit with the ground-floor porter lodge desk'
  );

  // Checkout Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<{
    orderId: string;
    reference: string;
    amount: number;
  } | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (!selectedHostelId) {
      setErrorMessage('Please select your drop-off hostel');
      return;
    }

    const effectiveRoom = deliveryMode === 'pickup' ? (roomNumber.trim() || 'Ground-Floor Lodge Pickup') : roomNumber;
    if (!effectiveRoom.trim()) {
      setErrorMessage('Please enter your room or door number');
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMessage('Please enter a valid phone number for delivery contact');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const itemsPayload = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedCombo: item.selectedCombo,
      }));

      const res = await API.checkoutCart(
        {
          items: itemsPayload,
          dropoffHostelId: selectedHostelId,
          dropoffRoom: effectiveRoom,
          contactPhone,
          specialInstructions:
            deliveryMode === 'pickup'
              ? `[SELF-PICKUP] ${specialInstructions}`
              : specialInstructions,
          deliveryMethod: deliveryMode === 'pickup' ? 'vendor_self' : 'courier_runner',
          deliveryMode,
        },
        token || '',
        currentCampus?.id || 'campus-run-ede'
      );

      if (res.success && res.data) {
        const primaryOrder = res.data.primaryOrder || (res.data.orders && res.data.orders[0]);
        const orderId = primaryOrder?.order?.id || primaryOrder?.id || `order-${Date.now()}`;
        const ref =
          primaryOrder?.escrow?.paystackReference ||
          primaryOrder?.order?.escrow?.paystackReference ||
          `pstk_demo_${Date.now()}`;

        // Prompt interactive Paystack Demo Checkout Modal for demonstration
        setPendingCheckout({
          orderId,
          reference: ref,
          amount: totalAmount,
        });
        setPaystackModalOpen(true);
      } else {
        throw new Error(res.message || 'Failed to complete escrow checkout');
      }
    } catch (err: any) {
      console.error('Cart checkout error:', err);
      setErrorMessage(
        err.message || 'Could not place order. Please check item stock and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaystackSuccess = () => {
    setPaystackModalOpen(false);
    if (pendingCheckout) {
      localStorage.setItem('unihive_active_order_id', pendingCheckout.orderId);
      clearCart();
      closeCart();
      if (onNavigateToTracking) {
        onNavigateToTracking(pendingCheckout.orderId);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Dimmed Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
        }}
      />

      {/* Slide-out Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(490px, 100vw)',
          boxSizing: 'border-box',
          height: '100%',
          background: '#FFFFFF',
          boxShadow: '-10px 0 35px rgba(15, 43, 92, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#0F2B5C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(15, 43, 92, 0.15)',
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  My Hive Cart
                </h2>
                <span
                  style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid #FDE68A',
                  }}
                >
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                🎓 {currentCampus?.shortName || 'RUN'} Campus Hub • Queen Esther / Joshua Hall
              </div>
            </div>
          </div>

          <button
            onClick={closeCart}
            aria-label="Close cart drawer"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cartItems.length === 0 ? (
            /* Empty State */
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '70%',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#94A3B8',
                }}
              >
                <ShoppingBag size={38} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                Your Cart is Empty
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#64748B',
                  maxWidth: '300px',
                  lineHeight: 1.5,
                  marginBottom: '24px',
                }}
              >
                Find authentic sneakers, past questions, spicy grills, hoodies, or chargers from verified
                RUN student vendors.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  if (onNavigateMarketplace) onNavigateMarketplace();
                }}
                style={{
                  padding: '11px 22px',
                  borderRadius: '10px',
                  background: '#0F2B5C',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Explore Campus Feed</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            /* Cart Items List Grouped by Vendor Packages */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Vendor Packages Notification */}
              {vendorPackages.length > 1 && (
                <div
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Package size={16} color="#2563EB" style={{ flexShrink: 0 }} />
                  <span>
                    Your cart contains items from <strong>{vendorPackages.length} different vendors</strong>.
                    They will be dispatched as {vendorPackages.length} independent packages so runners can
                    deliver each directly to your porter lodge!
                  </span>
                </div>
              )}

              {/* Each Vendor Package */}
              {vendorPackages.map((pkg) => (
                <div
                  key={pkg.vendorId}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    background: '#F8FAFC',
                    overflow: 'hidden',
                  }}
                >
                  {/* Package Header */}
                  <div
                    style={{
                      background: '#F1F5F9',
                      padding: '10px 14px',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: '#0F2B5C',
                          color: '#FFFFFF',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          letterSpacing: '0.4px',
                        }}
                      >
                        PACKAGE {pkg.packageLetter}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Store size={13} color="#0F2B5C" />
                        <strong style={{ color: '#0F2B5C' }}>{pkg.vendorName}</strong>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        color: deliveryMode === 'pickup' ? '#0284C7' : '#059669',
                        fontWeight: 700,
                      }}
                    >
                      {deliveryMode === 'pickup'
                        ? 'Ground-Floor Pickup (₦0)'
                        : deliveryMode === 'batch_evening'
                        ? `Batch Share: ₦${pkg.runnerFee}`
                        : `Express: ₦${pkg.runnerFee}`}
                    </span>
                  </div>

                  {/* Items in this package */}
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pkg.items.map((item, itemIdx) => {
                      const hasImage = item.product.images && item.product.images.length > 0;
                      const imageUrl = hasImage ? item.product.images[0] : null;
                      const isLowStock = item.product.stockQuantity <= 3;

                      return (
                        <div
                          key={`${item.product.id}-${item.selectedSize || ''}-${item.selectedCombo || ''}-${itemIdx}`}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '10px',
                            border: '1px solid #E2E8F0',
                            alignItems: 'center',
                          }}
                        >
                          {/* Thumbnail / Graphic */}
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '10px',
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.product.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <ProductGraphic
                                type={getProductGraphicType(item.product.title, item.product.category)}
                                size={28}
                              />
                            )}
                          </div>

                          {/* Item Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 750,
                                color: '#0F172A',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={item.product.title}
                            >
                              {item.product.title}
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '3px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F2B5C' }}>
                                ₦{item.product.price.toLocaleString()}
                              </span>

                              {item.selectedSize && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    background: '#F1F5F9',
                                    color: '#475569',
                                    padding: '1px 6px',
                                    borderRadius: '6px',
                                    border: '1px solid #CBD5E1',
                                  }}
                                >
                                  {item.selectedSize}
                                </span>
                              )}

                              {item.selectedCombo && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    background: '#ECFDF5',
                                    color: '#065F46',
                                    padding: '1px 6px',
                                    borderRadius: '6px',
                                    border: '1px solid #A7F3D0',
                                  }}
                                >
                                  {item.selectedCombo}
                                </span>
                              )}
                            </div>

                            {isLowStock && (
                              <div
                                style={{
                                  fontSize: '10px',
                                  color: '#D97706',
                                  fontWeight: 700,
                                  marginTop: '2px',
                                }}
                              >
                                Only {item.product.stockQuantity} remaining!
                              </div>
                            )}
                          </div>

                          {/* Quantity Stepper & Remove */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                background: '#F8FAFC',
                                overflow: 'hidden',
                              }}
                            >
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1, {
                                    size: item.selectedSize,
                                    combo: item.selectedCombo,
                                  })
                                }
                                aria-label="Decrease quantity"
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  border: 'none',
                                  background: 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: '#475569',
                                }}
                              >
                                <Minus size={12} />
                              </button>

                              <span
                                style={{
                                  width: '24px',
                                  textAlign: 'center',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: '#0F172A',
                                }}
                              >
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1, {
                                    size: item.selectedSize,
                                    combo: item.selectedCombo,
                                  })
                                }
                                disabled={item.quantity >= item.product.stockQuantity}
                                aria-label="Increase quantity"
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  border: 'none',
                                  background: 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor:
                                    item.quantity >= item.product.stockQuantity
                                      ? 'not-allowed'
                                      : 'pointer',
                                  color:
                                    item.quantity >= item.product.stockQuantity ? '#CBD5E1' : '#475569',
                                }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                removeFromCart(item.product.id, {
                                  size: item.selectedSize,
                                  combo: item.selectedCombo,
                                })
                              }
                              title="Remove item"
                              aria-label="Remove item"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#94A3B8',
                                padding: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Campus Delivery Mode Selector Card */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(15, 43, 92, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      color: '#0F2B5C',
                    }}
                  >
                    <Package size={16} color="#2563EB" />
                    <span>Choose Delivery Option</span>
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: '#64748B',
                      fontWeight: 700,
                      background: '#F1F5F9',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Zero-Room-Entry
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Option 1: Free Self-Pickup (₦0) */}
                  <div
                    onClick={() => setDeliveryMode('pickup')}
                    style={{
                      border: deliveryMode === 'pickup' ? '2px solid #059669' : '1px solid #E2E8F0',
                      background: deliveryMode === 'pickup' ? '#ECFDF5' : '#F8FAFC',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: deliveryMode === 'pickup' ? '#D1FAE5' : '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#047857',
                          }}
                        >
                          <Building2 size={15} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              Self-Pickup
                            </span>
                            <span
                              style={{
                                background: '#E0F2FE',
                                color: '#0369A1',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '9999px',
                                border: '1px solid #BAE6FD',
                              }}
                            >
                              ₦0 Delivery Fee
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            Meet vendor at room or faculty lobby
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                          FREE (₦0)
                        </div>
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>
                          Save 100% on courier
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.35, marginTop: '4px' }}>
                      Meet vendor directly at their campus room or faculty lobby. ₦0 delivery fee (only ₦100 escrow protection applies).
                    </div>
                  </div>

                  {/* Option 2: Batch Delivery (₦500) */}
                  <div
                    onClick={() => setDeliveryMode('batch_evening')}
                    style={{
                      border: deliveryMode === 'batch_evening' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: deliveryMode === 'batch_evening' ? '#EFF6FF' : '#F8FAFC',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: deliveryMode === 'batch_evening' ? '#DBEAFE' : '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1E40AF',
                          }}
                        >
                          <Moon size={15} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              Batch Delivery
                            </span>
                            <span
                              style={{
                                background: '#DCFCE7',
                                color: '#166534',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '9999px',
                                border: '1px solid #BBF7D0',
                              }}
                            >
                              Campus Value
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} />
                            <span>Pooled hostel delivery</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563EB' }}>
                          ₦500
                        </div>
                        <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700 }}>
                          Save ₦1,000 vs Express
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        background: '#DBEAFE',
                        color: '#1E40AF',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        lineHeight: 1.35,
                        marginTop: '6px',
                      }}
                    >
                      📦 <strong>Batch Pooling Notice:</strong> Your package will be delivered to you when the courier has up to 4 or more packages to deliver for your hostel route.
                    </div>
                  </div>

                  {/* Option 3: Express Instant Delivery (₦1,500) */}
                  <div
                    onClick={() => setDeliveryMode('express')}
                    style={{
                      border: deliveryMode === 'express' ? '2px solid #D97706' : '1px solid #E2E8F0',
                      background: deliveryMode === 'express' ? '#FFFBEB' : '#F8FAFC',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: deliveryMode === 'express' ? '#FEF3C7' : '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#B45309',
                          }}
                        >
                          <Zap size={15} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              Express Delivery
                            </span>
                            <span
                              style={{
                                background: '#FEF3C7',
                                color: '#92400E',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '9999px',
                                border: '1px solid #FDE68A',
                              }}
                            >
                              Instant Dispatch
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            Dedicated solo bike run • 30–45 mins to lodge
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#B45309' }}>
                          ₦1,500
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>
                          Immediate dispatch
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.35, marginTop: '4px' }}>
                      Dedicated runner charters transit immediately from vendor straight to your hostel porter desk.
                    </div>
                  </div>
                </div>
              </div>

              {/* Hostel Drop-off Details Card */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(15, 43, 92, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: '#0F2B5C',
                    marginBottom: '14px',
                  }}
                >
                  <MapPin size={16} color="#2563EB" />
                  <span>
                    {deliveryMode === 'pickup' ? 'Ground-Floor Handover Location' : 'Hostel Delivery Destination'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '4px',
                      }}
                    >
                      RUN Drop-off Hostel
                    </label>
                    <select
                      value={selectedHostelId}
                      onChange={(e) => setSelectedHostelId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        fontSize: '13px',
                        color: '#0F172A',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    >
                      {hostels.length > 0 ? (
                        hostels.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.porterLodgeName})
                          </option>
                        ))
                      ) : (
                        <>
                          <optgroup label="Female Hostels">
                            <option value="hostel-run-queen-esther">
                              Queen Esther Hall (Ground Floor Reception)
                            </option>
                            <option value="hostel-run-deborah">
                              Deborah Hall (Ground Floor Reception)
                            </option>
                            <option value="hostel-run-guest-house">
                              Guest House (Ground Floor Reception)
                            </option>
                            <option value="hostel-run-dorcas">
                              Dorcas Hall (Ground Floor Reception)
                            </option>
                          </optgroup>
                          <optgroup label="Male Hostels">
                            <option value="hostel-run-prophet-moses">
                              Prophet Moses Hall (Ground Floor Reception)
                            </option>
                            <option value="hostel-run-joshua">
                              Joshua Hall (Ground Floor Reception)
                            </option>
                            <option value="hostel-run-peter">
                              Peter Hostel (Ground Floor Reception)
                            </option>
                          </optgroup>
                        </>
                      )}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          marginBottom: '4px',
                        }}
                      >
                        Room / Door No.
                      </label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g. Room 204"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          fontSize: '13px',
                          color: '#0F172A',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          marginBottom: '4px',
                        }}
                      >
                        Recipient Phone
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="08143829102"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          fontSize: '13px',
                          color: '#0F172A',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '4px',
                      }}
                    >
                      Courier Delivery Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Call when runner drops at ground-floor porter desk"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        fontSize: '12px',
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Escrow Fee Breakdown Card */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: '#0F2B5C',
                    marginBottom: '12px',
                  }}
                >
                  <ShieldCheck size={16} color="#F59E0B" />
                  <span>Escrow Breakdown</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Items Subtotal ({totalCount} items)</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>₦{subtotal.toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Platform Tech Fee</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>₦{platformTechFee.toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>
                      {deliveryMode === 'pickup'
                        ? 'Self-Pickup'
                        : deliveryMode === 'batch_evening'
                        ? 'Hostel Batch Delivery'
                        : 'Express Solo Delivery'}
                    </span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      {deliveryMode === 'pickup' ? 'FREE (₦0)' : `₦${courierDeliveryFee.toLocaleString()}`}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                      fontSize: '15px',
                      color: '#0F2B5C',
                      paddingTop: '10px',
                      marginTop: '4px',
                      borderTop: '1px dashed #CBD5E1',
                    }}
                  >
                    <span>Total Escrow Amount</span>
                    <span>₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    lineHeight: 1.4,
                  }}
                >
                  <ShieldCheck size={14} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <strong>Hostel Escrow:</strong> Funds are safely locked. You inspect each item at the
                    hostel porter lodge and release your 4-digit PIN before anyone gets paid.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 -4px 15px rgba(15, 43, 92, 0.04)',
            }}
          >
            {errorMessage && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#DC2626',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={14} color="#DC2626" style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              disabled={isSubmitting}
              onClick={handleCheckout}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '12px',
                border: 'none',
                background: isSubmitting ? '#CBD5E1' : '#D97706',
                color: isSubmitting ? '#64748B' : '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isSubmitting ? 'none' : '0 6px 20px rgba(245, 158, 11, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <CreditCard size={18} />
              <span>
                {isSubmitting
                  ? 'Locking Escrow & Placing Order...'
                  : `Lock Escrow & Pay ₦${totalAmount.toLocaleString()}`}
              </span>
            </button>

            <div
              style={{
                textAlign: 'center',
                marginTop: '8px',
                fontSize: '10.5px',
                color: '#64748B',
              }}
            >
              🔒 100% Refund Guarantee • Dual Atomic Settlement
            </div>
          </div>
        )}

        {/* Demo Paystack Escrow Checkout Modal */}
        <PaystackDemoModal
          isOpen={paystackModalOpen}
          onClose={() => setPaystackModalOpen(false)}
          amount={pendingCheckout?.amount || totalAmount}
          customerEmail={user?.email || 'buyer@run.edu.ng'}
          reference={pendingCheckout?.reference || `pstk_demo_${Date.now()}`}
          onSuccess={handlePaystackSuccess}
        />
      </div>
    </div>
  );
};
