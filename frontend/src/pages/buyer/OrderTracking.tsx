import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { API } from '../../config/api';
import { ProductGraphic } from '../../components/common/ProductGraphic';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Package,
  RefreshCw,
  X,
  Phone,
  MessageSquare,
  MapPin,
  Key,
  ShieldAlert,
  Receipt,
  Star,
  Video,
  UploadCloud,
} from 'lucide-react';

interface OrderTrackingProps {
  initialOrderId?: string;
  onNavigateMarketplace?: () => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  initialOrderId,
  onNavigateMarketplace,
}) => {
  const { token } = useAuth();
  const { socket, joinOrder } = useSocket();

  // Active Tab: 'live' or 'past'
  const [activeTab, setActiveTab] = useState<'live' | 'past'>('live');

  // Active Order State
  const [orderTracking, setOrderTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPin, setShowPin] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Past Orders State
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any | null>(null);
  const [justCompletedOrder, setJustCompletedOrder] = useState<{ orderNumber: string; totalAmount?: number } | null>(null);


  // Dispute & Complaint Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('wrong_item');
  const [disputeReason, setDisputeReason] = useState('');
  const [buyerStatement, setBuyerStatement] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoValidationLoading, setVideoValidationLoading] = useState(false);
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setDisputeError('Please select a valid video file.');
      return;
    }

    setVideoValidationLoading(true);
    setDisputeError(null);

    const tempUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = tempUrl;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(tempUrl);
      const duration = video.duration;
      setVideoDuration(duration);
      setVideoValidationLoading(false);

      if (duration > 5.5) {
        setDisputeError(
          `Video evidence must be 5 seconds or shorter. Your video is ${duration.toFixed(1)} seconds. Please trim or record a clip under 5 seconds.`
        );
        setVideoUrl(null);
        return;
      }

      // Convert to Base64 data URL
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setVideoUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    };

    video.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      setVideoValidationLoading(false);
      setDisputeError('Could not process video file. Please try another video format (MP4/WebM).');
    };
  };

  const handleUseDemoVideo = () => {
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setVideoDuration(4.5);
    setDisputeError(null);
  };

  // Courier Rating State & Modal
  const [ratingCourierModal, setRatingCourierModal] = useState<{
    orderId: string;
    courierId?: string;
    courierName: string;
  } | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccessMessage, setRatingSuccessMessage] = useState<string | null>(null);
  const [ratedOrdersMap, setRatedOrdersMap] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('unihive_rated_courier_orders');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleRateCourier = async (targetOrderId: string, courierId?: string) => {
    if (!token) return;
    setSubmittingRating(true);
    try {
      await API.rateCourier(
        {
          orderId: targetOrderId,
          courierId,
          rating: selectedStars,
          comment: ratingComment,
        },
        token
      );
      const updated = { ...ratedOrdersMap, [targetOrderId]: selectedStars };
      setRatedOrdersMap(updated);
      localStorage.setItem('unihive_rated_courier_orders', JSON.stringify(updated));
      setRatingSuccessMessage(`Thank you! You rated the runner ${selectedStars} ★.`);
      setTimeout(() => {
        setRatingCourierModal(null);
        setRatingSuccessMessage(null);
        setRatingComment('');
      }, 1500);
    } catch (err: any) {
      console.warn('Courier rating offline fallback:', err);
      const updated = { ...ratedOrdersMap, [targetOrderId]: selectedStars };
      setRatedOrdersMap(updated);
      localStorage.setItem('unihive_rated_courier_orders', JSON.stringify(updated));
      setRatingSuccessMessage(`Thank you! You rated the runner ${selectedStars} ★.`);
      setTimeout(() => {
        setRatingCourierModal(null);
        setRatingSuccessMessage(null);
        setRatingComment('');
      }, 1500);
    } finally {
      setSubmittingRating(false);
    }
  };

  const [activeOrdersList, setActiveOrdersList] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    const saved = localStorage.getItem('unihive_active_order_id');
    if (saved === 'order-acu-4829') {
      localStorage.removeItem('unihive_active_order_id');
      return 'order-run-4829';
    }
    return (initialOrderId !== undefined && initialOrderId !== '' && initialOrderId !== 'order-acu-4829')
      ? initialOrderId
      : (saved || 'order-run-4829');
  });

  // Keep selectedOrderId in sync if initialOrderId changes
  useEffect(() => {
    if (initialOrderId && initialOrderId !== 'order-acu-4829') {
      setSelectedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  const orderId = selectedOrderId || (activeOrdersList[0]?.id || '');

  // Load Buyer Active and Past Orders
  const loadBuyerOrders = async () => {
    if (!token) return;
    setLoadingPast(true);
    try {
      const res = await API.getMyOrders(token);
      if (res.success && res.data) {
        setPastOrders(res.data.pastOrders || []);
        const active = (res.data.activeOrders || []).filter(
          (o: any) => o.status !== 'inspected_completed' && o.status !== 'completed' && o.status !== 'refunded'
        );
        setActiveOrdersList(active);
        if (active.length > 0) {
          if (!selectedOrderId || !active.some((ao: any) => ao.id === selectedOrderId)) {
            setSelectedOrderId(active[0].id);
          }
        } else {
          setSelectedOrderId('');
          localStorage.removeItem('unihive_active_order_id');
          setOrderTracking(null);
        }
      } else {
        setPastOrders([]);
        setActiveOrdersList([]);
        setSelectedOrderId('');
        localStorage.removeItem('unihive_active_order_id');
        setOrderTracking(null);
      }
    } catch (err) {
      console.warn('Could not load buyer orders from API', err);
      setPastOrders([]);
      setActiveOrdersList([]);
      setSelectedOrderId('');
      setOrderTracking(null);
    } finally {
      setLoadingPast(false);
    }
  };

  useEffect(() => {
    loadBuyerOrders();
  }, [token]);

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim() || disputeReason.trim().length < 5) {
      setDisputeError('Please describe the issue with your delivery (minimum 5 characters).');
      return;
    }
    if (!token) return;
    setSubmittingDispute(true);
    setDisputeError(null);
    try {
      const categoryLabels: Record<string, string> = {
        wrong_item: 'Wrong Item / Incorrect Size',
        damaged_goods: 'Item Damaged / Spoiled',
        courier_violation: 'Courier Rule Violation',
        not_arrived: 'Courier Demanded Cash / Did Not Arrive',
        other: 'Inspection Failure',
      };

      const res = await API.reportOrderDispute(
        orderId,
        {
          reason: disputeReason.trim(),
          issueCategory: categoryLabels[disputeCategory] || 'Inspection Issue',
          videoUrl: videoUrl || undefined,
          buyerStatement: buyerStatement.trim() || disputeReason.trim(),
        },
        token
      );

      if (res.success) {
        setShowDisputeModal(false);
        setOrderTracking((prev: any) => ({
          ...prev,
          status: 'disputed',
          dispute: {
            reason: `[${categoryLabels[disputeCategory] || 'Inspection Issue'}] ${disputeReason.trim()}`,
            buyerStatement: buyerStatement.trim() || disputeReason.trim(),
            videoUrl: videoUrl || undefined,
          },
        }));
        setRefreshKey((k) => k + 1);
      }
    } catch (err: any) {
      setDisputeError(err.message || 'Failed to lodge complaint');
    } finally {
      setSubmittingDispute(false);
    }
  };

  useEffect(() => {
    async function loadOrder() {
      if (!token) return;
      if (!orderId) {
        setOrderTracking(null);
        setLoading(false);
        return;
      }
      // Only show full spinner on initial empty load, never wipe screen on background refresh
      if (!orderTracking) {
        setLoading(true);
      }
      try {
        const res = await API.getOrderTracking(orderId, token);
        if (res.data) {
          if (res.data.status === 'inspected_completed' || res.data.status === 'completed' || res.data.status === 'refunded') {
            setOrderTracking(null);
            localStorage.removeItem('unihive_active_order_id');
            setSelectedOrderId('');
          } else {
            setOrderTracking(res.data);
            const orderNum = res.data.orderNumber || res.data.order?.orderNumber;
            const masterNum = res.data.masterOrderNumber || res.data.order?.masterOrderNumber;
            if (orderNum) joinOrder(orderNum);
            if (masterNum && masterNum !== orderNum) joinOrder(masterNum);
            if (res.data.id) joinOrder(res.data.id);
            if (res.data.order?.id && res.data.order.id !== res.data.id) joinOrder(res.data.order.id);
          }
        } else {
          setOrderTracking(null);
        }
      } catch (err) {
        console.warn('Could not load order tracking from API', err);
        setOrderTracking(null);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, token, refreshKey]);

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = (data: any) => {
      console.log('[Socket] Order status updated in tracking view:', data);
      setOrderTracking((prev: any) => {
        if (!prev) return prev;
        const activeNum = prev.masterOrderNumber || prev.orderNumber || prev.order?.orderNumber;
        // Verify this update is relevant to the active order
        if (
          data.orderNumber &&
          data.orderNumber !== activeNum &&
          data.orderId !== prev.order?.id &&
          data.orderId !== prev.id &&
          data.orderId !== prev.orderNumber &&
          data.orderId !== prev.masterOrderNumber
        ) {
          return prev;
        }

        const newCourier = data.payload?.courier || prev.courier;
        return {
          ...prev,
          status: data.status,
          courier: newCourier,
          order: prev.order
            ? { ...prev.order, status: data.status, courier: newCourier }
            : undefined,
        };
      });

      if (data.status === 'inspected_completed') {
        localStorage.removeItem('unihive_active_order_id');
        setSelectedOrderId('');
        setJustCompletedOrder({
          orderNumber: data.orderNumber || data.payload?.orderNumber || 'RUN',
          totalAmount: data.payload?.settlement?.vendorPayout?.amount || data.payload?.totalAmount,
        });
        setTimeout(() => {
          setActiveTab('past');
        }, 2000);
      }

      loadBuyerOrders();
      setRefreshKey((prev) => prev + 1);
    };


    const handleItemPickedUp = (data: any) => {
      console.log('[Socket] Item picked up event in tracking view:', data);
      setOrderTracking((prev: any) => {
        if (!prev) return prev;
        const activeNum = prev.masterOrderNumber || prev.orderNumber || prev.order?.orderNumber;
        if (data.orderNumber && data.orderNumber !== activeNum && data.orderId !== prev.order?.id && data.orderId !== prev.id) {
          return prev;
        }
        const updatedItems = (prev.items || []).map((it: any) => {
          if (it.productId === data.productId) {
            return { ...it, isPickedUp: true, pickedUpAt: new Date().toISOString() };
          }
          return it;
        });
        const pickedUpCount = data.pickedUpCount ?? updatedItems.filter((i: any) => i.isPickedUp).length;
        const totalCount = data.totalCount ?? updatedItems.length;
        return {
          ...prev,
          items: updatedItems,
          pickedUpItemsCount: pickedUpCount,
          totalItemsCount: totalCount,
          allPickedUp: data.allPickedUp ?? (pickedUpCount === totalCount),
          pickupProgressPercent: Math.round((pickedUpCount / totalCount) * 100),
          currentPickupItem: data.nextItem,
        };
      });
      setRefreshKey((prev) => prev + 1);
    };

    socket.on('order:status_changed', handleStatusChange);
    socket.on('order:item_picked_up', handleItemPickedUp);

    return () => {
      socket.off('order:status_changed', handleStatusChange);
      socket.off('order:item_picked_up', handleItemPickedUp);
    };
  }, [socket]);

  const currentStatus = orderTracking?.status || orderTracking?.order?.status || 'escrow_locked';
  const masterOrderNumber = orderTracking?.masterOrderNumber || orderTracking?.order?.masterOrderNumber;
  const rawOrderNumber = orderTracking?.orderNumber || orderTracking?.order?.orderNumber || 'RUN-4829';
  const orderNumber = masterOrderNumber || rawOrderNumber;
  const packageTag = orderTracking?.packageTag || orderTracking?.order?.packageTag;
  const deliveryMode = orderTracking?.deliveryMode || orderTracking?.order?.deliveryMode || 'batch_evening';
  const escrow = orderTracking?.escrow;
  const dropoffLocation = orderTracking?.dropoffLocation;
  const items = orderTracking?.items || [];
  const pickedUpItemsCount = orderTracking?.pickedUpItemsCount ?? items.filter((i: any) => i.isPickedUp).length;
  const totalItemsCount = orderTracking?.totalItemsCount ?? items.length;
  const allPickedUp = Boolean(orderTracking?.allPickedUp ?? (totalItemsCount > 0 && pickedUpItemsCount === totalItemsCount));
  const porterLodge =
    dropoffLocation?.porterLodge ||
    orderTracking?.dropoffHostel?.porterLodgeName ||
    "Ground Floor Porter's Lodge, Queen Esther Hall";
  const hostelName = dropoffLocation?.hostelName || orderTracking?.dropoffHostel?.name || 'Queen Esther Hall';
  const pin = orderTracking?.handshakePin || escrow?.plainPinForDev || escrow?.buyerSecretPin || '4829';
  const courier = orderTracking?.courier || {
    id: 'courier-david-run',
    fullName: 'David A.',
    phone: '08098765432',
    rating: 0,
    ratingCount: 0,
    hall: 'Joshua Hall',
    isVetted: true,
  };

  // Status mapping for badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_transit':
        return { label: 'Runner in Transit', bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B' };
      case 'at_porter_desk':
        return { label: 'At Porter Lodge', bg: '#FEF3C7', color: '#B45309', dot: '#F59E0B' };
      case 'inspected_completed':
        return { label: 'Settled & Completed', bg: '#ECFDF5', color: '#059669', dot: '#10B981' };
      case 'disputed':
        return { label: 'Under Proctor Review', bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444' };
      case 'refunded':
        return { label: '100% Refunded', bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6' };
      default:
        return { label: 'Order Confirmed', bg: '#EFF6FF', color: '#1E40AF', dot: '#2563EB' };
    }
  };

  const statusBadge = getStatusBadge(currentStatus);

  // Split PIN into 4 individual characters
  const pinDigits = String(pin).padEnd(4, '0').slice(0, 4).split('');

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
        <div>Connecting to RUN Live Dispatch Vault...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 96px 16px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Top Header: Active Order Tracking */}
      <div style={{ marginBottom: '16px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.3px',
            margin: '0 0 16px 0',
          }}
        >
          Active Order Tracking
        </h1>

        {/* Tabs: Live Delivery (1) and Past Orders (4) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <button
            onClick={() => setActiveTab('live')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 0 10px 0',
              fontSize: '14px',
              fontWeight: activeTab === 'live' ? 800 : 600,
              color: activeTab === 'live' ? '#0F2B5C' : '#64748B',
              borderBottom: activeTab === 'live' ? '3px solid #0F2B5C' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Live Delivery</span>
            <span
              style={{
                fontSize: '12px',
                background: activeTab === 'live' ? '#EFF6FF' : '#F1F5F9',
                color: activeTab === 'live' ? '#1D4ED8' : '#64748B',
                padding: '1px 7px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              {activeOrdersList.filter((o) => o.status !== 'inspected_completed' && o.status !== 'completed' && o.status !== 'refunded').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 0 10px 0',
              fontSize: '14px',
              fontWeight: activeTab === 'past' ? 800 : 600,
              color: activeTab === 'past' ? '#0F2B5C' : '#64748B',
              borderBottom: activeTab === 'past' ? '3px solid #0F2B5C' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Past Orders</span>
            <span
              style={{
                fontSize: '12px',
                background: activeTab === 'past' ? '#EFF6FF' : '#F1F5F9',
                color: activeTab === 'past' ? '#1D4ED8' : '#64748B',
                padding: '1px 7px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              {pastOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Completed Order Celebratory Banner */}
      {justCompletedOrder && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.1)',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎉</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>
                Order #{justCompletedOrder.orderNumber} Delivered & Settled!
              </div>
              <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>
                Physical inspection handshake verified at Porter Lodge. Full payment disbursed to vendor.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('past');
              setJustCompletedOrder(null);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: '#059669',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            View in Past Orders →
          </button>
        </div>
      )}

      {/* TAB 1: LIVE DELIVERY VIEW (Screen 5 Design 1:1) */}
      {activeTab === 'live' && (
        (!orderTracking || currentStatus === 'inspected_completed' || currentStatus === 'completed' || currentStatus === 'refunded' || activeOrdersList.filter((o) => o.status !== 'inspected_completed' && o.status !== 'completed' && o.status !== 'refunded').length === 0) ? (
          <div

            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(15, 43, 92, 0.04)',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '28px',
              }}
            >
              📦
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              No Active Orders in Transit
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              You don't have any pending deliveries right now. When you order from campus merchants, your real-time runner tracking, hostel route progress, and 4-digit escrow handshake PIN will appear right here.
            </p>
            <button
              onClick={onNavigateMarketplace}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 43, 92, 0.2)',
              }}
            >
              Browse Campus Marketplace
            </button>
          </div>
        ) : (
          <>
            {/* Multi-Order Switcher if buyer has multiple concurrent active orders */}
            {activeOrdersList.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  marginBottom: '16px',
                  paddingBottom: '4px',
                }}
              >
                {activeOrdersList.map((ao) => {
                  const isCurrent = ao.id === orderId;
                  return (
                    <button
                      key={ao.id}
                      onClick={() => setSelectedOrderId(ao.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: isCurrent ? '1.5px solid #0F2B5C' : '1px solid #CBD5E1',
                        background: isCurrent ? '#0F2B5C' : '#FFFFFF',
                        color: isCurrent ? '#FFFFFF' : '#334155',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      #{ao.orderNumber}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main White Tracking Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(15, 43, 92, 0.04)',
                marginBottom: '20px',
              }}
            >
            {/* Header: ORDER #RUN-849201 + Status Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#64748B',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                  }}
                >
                  ORDER #{orderNumber}
                </div>
                {packageTag && masterOrderNumber && packageTag !== masterOrderNumber && (
                  <span
                    style={{
                      background: '#0F2B5C',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    TAG: {packageTag.split('-').pop()}
                  </span>
                )}
                <span
                  style={{
                    background: deliveryMode === 'pickup' ? '#ECFDF5' : deliveryMode === 'batch_evening' ? '#EFF6FF' : '#FFFBEB',
                    color: deliveryMode === 'pickup' ? '#065F46' : deliveryMode === 'batch_evening' ? '#1E40AF' : '#92400E',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    border: `1px solid ${deliveryMode === 'pickup' ? '#A7F3D0' : deliveryMode === 'batch_evening' ? '#BFDBFE' : '#FDE68A'}`,
                  }}
                >
                  {deliveryMode === 'pickup' ? 'Free Pickup' : deliveryMode === 'batch_evening' ? 'Evening Batch' : 'Express Delivery'}
                </span>
              </div>

              {/* Status Pill */}
              <div
                style={{
                  background: statusBadge.bg,
                  color: statusBadge.color,
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: statusBadge.dot,
                  }}
                />
                <span>{statusBadge.label}</span>
              </div>
            </div>

            {/* Product Title */}
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 14px 0',
              }}
            >
              {items && items.length > 1
                ? `Multi-Product Campus Order (${items.length} items)`
                : orderTracking?.product?.title || orderTracking?.order?.itemTitle || (items?.[0]?.title) || 'Campus Order Items'}
            </h2>

            {/* Live Stop-by-Stop Multi-Product Courier Pickup Tracker */}
            {items && items.length > 0 && (
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>🚴</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Courier Pickup Stops
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                        {allPickedUp
                          ? 'All items collected! Courier heading to porter lodge reception desk.'
                          : `${pickedUpItemsCount} of ${totalItemsCount} products collected by runner`}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: allPickedUp ? '#ECFDF5' : '#FEF3C7',
                      color: allPickedUp ? '#059669' : '#D97706',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      border: `1px solid ${allPickedUp ? '#A7F3D0' : '#FDE68A'}`,
                    }}
                  >
                    {allPickedUp ? 'All Picked Up ✓' : `${pickedUpItemsCount}/${totalItemsCount} Stops`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    background: '#E2E8F0',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.round((pickedUpItemsCount / (totalItemsCount || 1)) * 100)}%`,
                      height: '100%',
                      background: allPickedUp ? '#10B981' : '#F59E0B',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                {/* Stop-by-Stop Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((item: any, idx: number) => {
                    const isDone = Boolean(item.isPickedUp);
                    const isCurrent = !isDone && (idx === 0 || Boolean(items[idx - 1]?.isPickedUp));

                    return (
                      <div
                        key={item.productId || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isDone ? '#F0FDF4' : isCurrent ? '#FFFBEB' : '#FFFFFF',
                          border: isDone
                            ? '1px solid #BBF7D0'
                            : isCurrent
                            ? '1.5px solid #FCD34D'
                            : '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '8px 10px',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: isDone ? '#10B981' : isCurrent ? '#F59E0B' : '#E2E8F0',
                              color: isDone || isCurrent ? '#FFFFFF' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10.5px',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 750,
                                color: isDone ? '#166534' : '#0F172A',
                                textDecoration: isDone ? 'line-through' : 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.title}
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>📍 {item.pickupHostel || 'Campus Vendor'}</span>
                              <span>•</span>
                              <span>{item.vendorName || 'Vendor'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {isDone ? (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: '#15803D',
                                background: '#DCFCE7',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Picked Up ✓
                            </span>
                          ) : isCurrent ? (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: '#B45309',
                                background: '#FEF3C7',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F59E0B' }} />
                              Heading to Pick Up 🚴
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#94A3B8',
                                background: '#F1F5F9',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              In Queue ⏳
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Dropoff Destination Stop */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: allPickedUp ? '#EFF6FF' : '#F8FAFC',
                      border: allPickedUp ? '1.5px solid #BFDBFE' : '1px dashed #CBD5E1',
                      borderRadius: '12px',
                      padding: '8px 10px',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: allPickedUp ? '#2563EB' : '#CBD5E1',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        🏁
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                          Final Dropoff: Porter Lodge Desk
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>
                          {porterLodge}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: allPickedUp ? '#1D4ED8' : '#64748B',
                        background: allPickedUp ? '#DBEAFE' : '#F1F5F9',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {allPickedUp ? 'Next Stop 📍' : 'Awaiting Items'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Luxury Delivery Handshake Code (OTP) Box */}
            <div
              style={{
                background: '#0F1E36',
                borderRadius: '18px',
                padding: '18px 16px',
                color: '#FFFFFF',
                marginBottom: '16px',
                position: 'relative',
              }}
            >
              {/* Header: Gold Key + DELIVERY HANDSHAKE CODE (OTP) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#F59E0B',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                <Key size={13} color="#F59E0B" />
                <span>DELIVERY HANDSHAKE CODE (OTP)</span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    marginLeft: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPin ? 'Hide code' : 'Show code'}
                >
                  {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>

              {/* 4 Distinct Squircle Digit Boxes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '16px 0',
                }}
              >
                {pinDigits.map((digit, idx) => {
                  const isLastDigit = idx === 3;
                  return (
                    <div
                      key={idx}
                      style={{
                        width: '54px',
                        height: '64px',
                        background: '#1E2E4A',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '30px',
                        fontWeight: 800,
                        color: isLastDigit ? '#F59E0B' : '#FFFFFF',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {showPin ? digit : '•'}
                    </div>
                  );
                })}
              </div>

              {/* Security Warning */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#94A3B8',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  maxWidth: '380px',
                  margin: '0 auto',
                }}
              >
                <AlertTriangle size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>DO NOT SHARE</strong> this code over the phone. Only give it to the courier at your{' '}
                  <span style={{ color: '#F1F5F9' }}>Hall Porter's Desk</span> after checking your package.
                </span>
              </div>
            </div>

            {/* Vetted Student Courier Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Runner Avatar Circle */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#0F2B5C',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  SA
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      {courier.fullName || 'David A.'}
                    </span>
                    <span
                      style={{
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                    >
                      Vetted Runner
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    RUN Student Courier • {courier.hall || 'Joshua Hall'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: (courier.rating && courier.rating > 0) ? '#D97706' : '#64748B', marginTop: '2px', fontWeight: 600 }}>
                    {(courier.rating && courier.rating > 0)
                      ? `★ ${Number(courier.rating).toFixed(1)} (${courier.ratingCount || 1} drops)`
                      : '🌱 New Runner • No ratings yet'}
                  </div>
                </div>
              </div>

              {/* Call & WhatsApp Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={`tel:${courier.phone || '08098765432'}`}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                  title="Call Runner"
                >
                  <Phone size={16} color="#059669" />
                </a>

                <a
                  href={`https://wa.me/234${(courier.phone || '08098765432').replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                  title="WhatsApp Runner"
                >
                  <MessageSquare size={16} color="#2563EB" />
                </a>
              </div>
            </div>

            {/* Live Campus Delivery Timeline Header */}
            {(() => {
              const isStep2Done = ['vendor_preparing', 'in_transit', 'at_porter_desk', 'inspected_completed'].includes(currentStatus);
              const isStep2Current = currentStatus === 'escrow_locked' || currentStatus === 'pending';
              const isStep3Done = ['at_porter_desk', 'inspected_completed'].includes(currentStatus);
              const isStep3Current = currentStatus === 'in_transit';
              const isStep4Done = currentStatus === 'inspected_completed';
              const isStep4Current = currentStatus === 'at_porter_desk';

              const etaLabel = currentStatus === 'inspected_completed'
                ? 'Delivered'
                : currentStatus === 'at_porter_desk'
                ? 'At Reception Desk'
                : currentStatus === 'in_transit'
                ? 'ETA: ~6 mins'
                : 'Preparing';

              return (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                      Live Campus Delivery Timeline
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>
                      {etaLabel}
                    </div>
                  </div>

                  {/* 4-Step Vertical Stepper */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
                    {/* Vertical Connector Line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '11px',
                        top: '12px',
                        bottom: '24px',
                        width: '2px',
                        background: '#E2E8F0',
                        zIndex: 1,
                      }}
                    />

                    {/* Step 1: Order Confirmed & Escrow Funded */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#10B981',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2 size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          Order Confirmed & Escrow Funded
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          {escrow?.amount ? `₦${Number(escrow.amount).toLocaleString()}` : (orderTracking?.total ? `₦${Number(orderTracking.total).toLocaleString()}` : 'Payment')} secured by Paystack Escrow
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Packaged by Vendor */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isStep2Done ? '#10B981' : isStep2Current ? '#FEF3C7' : '#F1F5F9',
                          border: isStep2Current ? '2px solid #F59E0B' : isStep2Done ? 'none' : '1.5px solid #CBD5E1',
                          color: isStep2Done ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {isStep2Done ? (
                          <CheckCircle2 size={15} />
                        ) : isStep2Current ? (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                        ) : (
                          '2'
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: isStep2Current ? 800 : 700, color: isStep2Current ? '#D97706' : isStep2Done ? '#0F172A' : '#94A3B8' }}>
                          {isStep2Done
                            ? `Packaged by ${orderTracking?.vendor?.businessName || 'Vendor'}`
                            : `Packaging by ${orderTracking?.vendor?.businessName || 'Vendor'}`}
                        </div>
                        <div style={{ fontSize: '11px', color: isStep2Current ? '#B45309' : '#64748B', marginTop: '2px' }}>
                          {isStep2Done ? 'Sealed package with safety tape' : isStep2Current ? 'Vendor packaging items' : 'Awaiting packaging'}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Courier En Route / Dispatched */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isStep3Done ? '#10B981' : isStep3Current ? '#FEF3C7' : '#F1F5F9',
                          border: isStep3Current ? '2px solid #F59E0B' : isStep3Done ? 'none' : '1.5px solid #CBD5E1',
                          color: isStep3Done ? '#FFFFFF' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {isStep3Done ? (
                          <CheckCircle2 size={15} />
                        ) : isStep3Current ? (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                        ) : (
                          '3'
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: isStep3Current ? 800 : 700, color: isStep3Current ? '#D97706' : isStep3Done ? '#0F172A' : '#94A3B8' }}>
                          {isStep3Done
                            ? 'Package Dispatched with Runner'
                            : isStep3Current
                            ? 'Courier Walking to Hall Reception'
                            : 'Courier Campus Dispatch'}
                        </div>
                        <div style={{ fontSize: '11px', color: isStep3Current ? '#B45309' : '#64748B', marginTop: '2px' }}>
                          {isStep3Done
                            ? `Runner ${courier?.fullName || ''} picked up order`
                            : isStep3Current
                            ? `Approaching ${hostelName} Gate`
                            : 'Awaiting courier assignment & pickup'}
                        </div>
                      </div>
                    </div>

                    {/* Step 4: At Porter's Desk & OTP Handshake */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isStep4Done ? '#10B981' : isStep4Current ? '#FEF3C7' : '#F1F5F9',
                          border: isStep4Current ? '2px solid #F59E0B' : isStep4Done ? 'none' : '1.5px solid #CBD5E1',
                          color: isStep4Done ? '#FFFFFF' : '#94A3B8',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isStep4Done ? (
                          <CheckCircle2 size={15} />
                        ) : isStep4Current ? (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                        ) : (
                          '4'
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: isStep4Current ? 800 : 600, color: isStep4Current ? '#D97706' : isStep4Done ? '#0F172A' : '#94A3B8' }}>
                          {isStep4Done ? 'Delivered & Handshake Completed' : "At Porter's Desk & OTP Handshake"}
                        </div>
                        <div style={{ fontSize: '11px', color: isStep4Current ? '#B45309' : '#94A3B8', marginTop: '2px' }}>
                          {isStep4Done
                            ? 'PIN verified at Porter Lodge, funds released'
                            : isStep4Current
                            ? `Waiting at ${hostelName} Porter's Desk`
                            : 'Awaiting arrival & code exchange'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Pickup Location Callout Banner */}
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '14px',
                padding: '12px 14px',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <MapPin size={20} color="#059669" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: '#166534', lineHeight: '1.4' }}>
                <strong>Pickup Location:</strong> {porterLodge}. Come down with your phone when called.
              </div>
            </div>

            {/* Zero-Room-Entry Ground Floor Mandate */}
            <div
              style={{
                fontSize: '11px',
                color: '#64748B',
                textAlign: 'center',
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={13} color="#059669" />
              <span>Zero-Room-Entry Rule: Handover strictly at the reception desk. Couriers cannot enter corridors.</span>
            </div>

            {/* Courier Rating Section for Completed Delivery */}
            {currentStatus === 'inspected_completed' && (
              ratedOrdersMap[orderId] ? (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                      Runner Rated ({ratedOrdersMap[orderId]} ★)
                    </div>
                    <div style={{ fontSize: '11px', color: '#15803D' }}>
                      Thank you! Your rating maintains trusted and verified courier deliveries on campus.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: '#FFFBEB',
                    border: '1.5px solid #FCD34D',
                    borderRadius: '18px',
                    padding: '16px',
                    marginTop: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={16} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                        Rate Your Courier ({courier.fullName || 'David A.'})
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: '6px' }}>
                      Handover Complete
                    </span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#78350F', margin: '0 0 12px 0' }}>
                    How was your delivery handover at {hostelName}? Rate this student runner:
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedStars(star)}
                        onMouseEnter={() => setHoverStars(star)}
                        onMouseLeave={() => setHoverStars(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <Star
                          size={28}
                          color={star <= (hoverStars || selectedStars) ? '#F59E0B' : '#D1D5DB'}
                          fill={star <= (hoverStars || selectedStars) ? '#F59E0B' : 'none'}
                        />
                      </button>
                    ))}
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', marginLeft: '6px' }}>
                      {hoverStars || selectedStars} / 5 Stars
                    </span>
                  </div>

                  <input
                    type="text"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Optional compliment (e.g. Very fast, polite runner)"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #FDE68A',
                      background: '#FFFFFF',
                      fontSize: '12px',
                      color: '#0F172A',
                      marginBottom: '10px',
                      boxSizing: 'border-box',
                    }}
                  />

                  {ratingSuccessMessage && (
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginBottom: '8px' }}>
                      ✓ {ratingSuccessMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRateCourier(orderId, courier.id)}
                    disabled={submittingRating}
                    style={{
                      background: '#0F2B5C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '9px 18px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Star size={13} fill="#FFFFFF" color="#FFFFFF" />
                    <span>{submittingRating ? 'Saving...' : 'Submit Runner Rating'}</span>
                  </button>
                </div>
              )
            )}
          </div>

          {/* Active Dispute / Verdict Information Card */}
          {currentStatus === 'disputed' ? (
            <div
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #F87171',
                borderRadius: '16px',
                padding: '16px',
                marginTop: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#DC2626" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B' }}>
                    Case File: Under Chief Proctor Mediation Desk
                  </span>
                </div>
                <span style={{ fontSize: '10px', background: '#FEE2E2', color: '#B91C1C', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  Escrow Frozen 🔒
                </span>
              </div>

              <p style={{ fontSize: '12px', color: '#7F1D1D', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                <strong>Complaint Reason:</strong> {orderTracking?.dispute?.reason || orderTracking?.reason || 'Physical Inspection Failure'}
              </p>

              {/* Video Evidence Preview if Available */}
              {(orderTracking?.dispute?.videoUrl || videoUrl) && (
                <div style={{ marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #FECACA', background: '#000' }}>
                  <video
                    src={orderTracking?.dispute?.videoUrl || videoUrl!}
                    controls
                    playsInline
                    style={{ width: '100%', maxHeight: '180px', display: 'block' }}
                  />
                  <div style={{ padding: '6px 10px', background: '#FFF1F2', fontSize: '11px', color: '#991B1B', fontWeight: 700 }}>
                    🎥 5-Second Defect Video Transmitted to Admin Console
                  </div>
                </div>
              )}

              {/* Statements Comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#991B1B', display: 'block', marginBottom: '2px' }}>
                    Buyer's Formal Statement:
                  </span>
                  <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
                    "{orderTracking?.dispute?.buyerStatement || orderTracking?.buyerStatement || disputeReason || 'Awaiting buyer statement.'}"
                  </p>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#991B1B', display: 'block', marginBottom: '2px' }}>
                    Vendor's Statement:
                  </span>
                  <p style={{ fontSize: '12px', color: '#334155', margin: 0, fontStyle: (orderTracking?.dispute?.merchantStatement || orderTracking?.dispute?.vendorStatement) ? 'normal' : 'italic' }}>
                    "{orderTracking?.dispute?.merchantStatement || orderTracking?.dispute?.vendorStatement || 'Merchant notified; awaiting vendor statement at Proctor Desk.'}"
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#991B1B', background: '#FEE2E2', padding: '8px 12px', borderRadius: '8px' }}>
                🛡️ <strong>Zero-Trust Protection:</strong> Your funds remain secured in the Paystack escrow vault until Chief Proctor Adeleke issues a signed verdict with rationale.
              </div>
            </div>
          ) : currentStatus === 'refunded' ? (
            <div
              style={{
                background: '#EFF6FF',
                border: '1.5px solid #93C5FD',
                borderRadius: '16px',
                padding: '16px',
                marginTop: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle2 size={18} color="#2563EB" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E40AF' }}>
                  Proctor Verdict: 100% Escrow Refund Issued
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#1E3A8A', margin: '0 0 6px 0' }}>
                <strong>Proctor Verdict Statement:</strong> {orderTracking?.dispute?.resolutionNotes || orderTracking?.resolutionNotes || 'Refund authorized after inspection review.'}
              </p>
              <div style={{ fontSize: '11px', color: '#2563EB' }}>
                ₦{Number(orderTracking?.escrow?.totalAmount || orderTracking?.totalAmount || orderTracking?.itemSubtotal || 18850).toLocaleString()} has been refunded back to your Paystack account.
              </div>
            </div>
          ) : (
            /* Dispute & Inspection Complaint Action */
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setShowDisputeModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldAlert size={14} color="#EF4444" />
                <span>Problem with delivery? Lodge an Inspection Complaint</span>
              </button>
            </div>
          )}
        </>
        )
      )}

      {/* TAB 2: PAST ORDERS VIEW */}
      {activeTab === 'past' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loadingPast ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
              <RefreshCw size={20} className="spin" style={{ margin: '0 auto 10px' }} />
              <div>Loading past fulfilled campus orders...</div>
            </div>
          ) : pastOrders.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '40px 20px',
                textAlign: 'center',
              }}
            >
              <Package size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>No Past Orders Yet</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Completed campus marketplace purchases will appear here with settlement receipts.
              </div>
            </div>
          ) : (
            pastOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(15, 43, 92, 0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F2B5C' }}>
                        #{order.orderNumber}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>•</span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>{formattedDate}</span>
                    </div>

                    <div
                      style={{
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={11} color="#059669" />
                      <span>SETTLED</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '12px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ProductGraphic
                        type={
                          order.graphicType ||
                          (order.title?.toLowerCase().includes('charger')
                            ? 'charger'
                            : order.title?.toLowerCase().includes('sock')
                            ? 'socks'
                            : order.title?.toLowerCase().includes('hoodie')
                            ? 'jacket'
                            : 'sneaker')
                        }
                        size={42}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {order.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                        Vendor: <strong>{order.vendor?.businessName}</strong> • Runner: {order.courier?.fullName || 'Campus Courier'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                        Delivered to {order.dropoffLocation?.hostelName || 'Queen Esther Hall'} (Ground Floor)
                      </div>
                    </div>
                  </div>

                  {/* List of individual purchased items */}
                  {order.items && order.items.length > 0 && (
                    <div
                      style={{
                        background: '#F8FAFC',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        marginBottom: '14px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          marginBottom: '2px',
                        }}
                      >
                        Purchased Items ({order.items.length})
                      </div>
                      {order.items.map((it: any, idx: number) => (
                        <div
                          key={it.productId || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            color: '#1E293B',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, color: '#0F2B5C' }}>x{it.quantity || 1}</span>
                            <span>{it.title}</span>
                            {it.selectedSize && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  background: '#E2E8F0',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  color: '#475569',
                                }}
                              >
                                {it.selectedSize}
                              </span>
                            )}
                          </div>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>
                            ₦{Number((it.price || 0) * (it.quantity || 1)).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>Total Paid (Escrow + Courier)</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                        ₦{Number(order.totalAmount || order.escrow?.totalAmount || order.itemSubtotal || 0).toLocaleString()}
                      </div>
                    </div>


                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {ratedOrdersMap[order.id] ? (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 750,
                            color: '#059669',
                            background: '#ECFDF5',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #A7F3D0',
                          }}
                        >
                          <Star size={11} fill="#059669" color="#059669" />
                          <span>Rated {ratedOrdersMap[order.id]}★</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedStars(5);
                            setHoverStars(0);
                            setRatingComment('');
                            setRatingCourierModal({
                              orderId: order.id,
                              courierId: order.courier?.id,
                              courierName: order.courier?.fullName || 'Campus Runner',
                            });
                          }}
                          style={{
                            padding: '7px 11px',
                            borderRadius: '8px',
                            border: '1px solid #F59E0B',
                            background: '#FFFBEB',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#B45309',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Star size={12} fill="#F59E0B" color="#F59E0B" />
                          <span>Rate Runner</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#0F2B5C',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Receipt size={13} color="#0F2B5C" />
                        <span>View Paystack Receipt</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onNavigateMarketplace) onNavigateMarketplace();
                        }}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#0F2B5C',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PAYSTACK RECEIPT MODAL */}
      {selectedReceiptOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setSelectedReceiptOrder(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <CheckCircle2 size={26} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Paystack Dual-Settlement Receipt
              </h3>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                Order #{selectedReceiptOrder.orderNumber} • Settled to Merchant & Courier
              </div>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                marginBottom: '18px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Item Subtotal</span>
                <strong style={{ color: '#0F172A' }}>
                  ₦{(selectedReceiptOrder.escrow?.itemSubtotal || 18500).toLocaleString()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>Campus Courier Delivery Fee</span>
                <strong style={{ color: '#0F172A' }}>
                  ₦{(selectedReceiptOrder.escrow?.courierDeliveryFee || 250).toLocaleString()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748B' }}>UniHive Escrow & Tech Fee</span>
                <strong style={{ color: '#0F172A' }}>
                  ₦{(selectedReceiptOrder.escrow?.platformTechFee || 100).toLocaleString()}
                </strong>
              </div>
              <div
                style={{
                  borderTop: '1px dashed #CBD5E1',
                  paddingTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                }}
              >
                <span style={{ fontWeight: 800, color: '#0F2B5C' }}>Total Settled</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>
                  ₦{(selectedReceiptOrder.escrow?.totalAmount || 18850).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '16px', lineHeight: '1.4' }}>
              🔒 <strong>Paystack Reference:</strong> {`pstk_settled_${selectedReceiptOrder.orderNumber.toLowerCase()}`}<br />
              Recipient: {selectedReceiptOrder.vendor?.businessName} (OPay) & {selectedReceiptOrder.courier?.fullName} (Kuda)
            </div>

            <button
              onClick={() => setSelectedReceiptOrder(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: '#0F2B5C',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* DISPUTE & ESCROW FREEZE MODAL */}
      {showDisputeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1.5px solid #EF4444',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              color: '#F8FAFC',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                    Lodge Complaint & Freeze Escrow
                  </h3>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                    Order #{orderNumber} • Ground-Floor Inspection Desk
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Warning Banner */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#FCA5A5',
                lineHeight: '1.4',
              }}
            >
              ⚠️ <strong>Zero-Trust Escrow Protection:</strong> Submitting this complaint immediately freezes your <strong>₦18,850</strong> vault deposit. No funds will be released to the vendor or courier until Chief Proctor Adeleke completes mediation.
            </div>

            <form onSubmit={handleSubmitDispute}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Issue Category
                </label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#1E293B',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="wrong_item">Wrong Item / Incorrect Size or Color</option>
                  <option value="damaged_goods">Item Damaged, Defective, or Spoiled</option>
                  <option value="courier_violation">Courier Violated Ground-Floor Porter Lodge Rule</option>
                  <option value="not_arrived">Courier Did Not Arrive or Demanded Cash</option>
                  <option value="other">Other Physical Inspection Failure</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Detailed Explanation / Incident Summary
                </label>
                <textarea
                  rows={2}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="e.g. Shoes are size 40 EU instead of size 43 EU specified on the product page."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#1E293B',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Formal Buyer Statement */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Buyer's Formal Statement for Mediation File
                </label>
                <textarea
                  rows={3}
                  value={buyerStatement}
                  onChange={(e) => setBuyerStatement(e.target.value)}
                  placeholder="State your account of what occurred at the Ground-Floor Porter Lodge during inspection..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#1E293B',
                    border: '1px solid #334155',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 5-Second Video Evidence Upload */}
              <div
                style={{
                  marginBottom: '16px',
                  background: '#1E293B',
                  border: '1px dashed #475569',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={16} color="#F59E0B" />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#F8FAFC' }}>
                      Upload Video Evidence (Max 5 Seconds)
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Mandatory ≤ 5s Rule
                  </span>
                </div>

                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 10px 0' }}>
                  Record a quick clip (up to 5 seconds) showing the defect, wrong size label, or packaging state at the porter desk.
                </p>

                {!videoUrl ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <label
                      style={{
                        flex: '1',
                        minWidth: '150px',
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#60A5FA',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <UploadCloud size={14} />
                      <span>{videoValidationLoading ? 'Validating clip...' : 'Select Video (≤5s)'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={handleVideoSelect}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleUseDemoVideo}
                      style={{
                        background: '#334155',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '11px',
                        color: '#F8FAFC',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🎥 Use Demo 5s Clip
                    </button>
                  </div>
                ) : (
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155', background: '#000' }}>
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      style={{ width: '100%', maxHeight: '160px', display: 'block' }}
                    />
                    <div
                      style={{
                        padding: '6px 12px',
                        background: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>
                        ✓ Video Validated ({videoDuration?.toFixed(1) || '4.5'}s ≤ 5s)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoUrl(null);
                          setVideoDuration(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        Remove Clip
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {disputeError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#FCA5A5',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    marginBottom: '14px',
                  }}
                >
                  {disputeError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  disabled={submittingDispute}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    background: '#1E293B',
                    color: '#CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{submittingDispute ? 'Freezing Escrow...' : 'Freeze Escrow & Lodge Complaint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURIER RATING MODAL (From Past Orders / Complete) */}
      {ratingCourierModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D97706',
                  }}
                >
                  <Star size={20} fill="#F59E0B" color="#F59E0B" />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Rate Runner
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    {ratingCourierModal.courierName} • Order #{ratingCourierModal.orderId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRatingCourierModal(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
              How satisfied were you with this courier's delivery speed, handling, and porter-lodge arrival?
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '16px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedStars(star)}
                  onMouseEnter={() => setHoverStars(star)}
                  onMouseLeave={() => setHoverStars(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <Star
                    size={32}
                    color={star <= (hoverStars || selectedStars) ? '#F59E0B' : '#CBD5E1'}
                    fill={star <= (hoverStars || selectedStars) ? '#F59E0B' : 'none'}
                  />
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#0F2B5C', marginBottom: '16px' }}>
              {hoverStars || selectedStars} / 5 Stars
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>
                REVIEW / COMPLIMENT (OPTIONAL)
              </label>
              <textarea
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="e.g. Prompt delivery, very careful with package at porter desk..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {ratingSuccessMessage && (
              <div
                style={{
                  background: '#ECFDF5',
                  color: '#065F46',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                ✓ {ratingSuccessMessage}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRatingCourierModal(null)}
                disabled={submittingRating}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRateCourier(ratingCourierModal.orderId, ratingCourierModal.courierId)}
                disabled={submittingRating}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0F2B5C',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Star size={16} fill="#FFFFFF" color="#FFFFFF" />
                <span>{submittingRating ? 'Saving...' : 'Submit Rating'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
