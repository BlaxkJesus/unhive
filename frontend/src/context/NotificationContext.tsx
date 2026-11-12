import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { soundService } from '../services/soundService';

export interface UniHiveNotification {
  id: string;
  title: string;
  body: string;
  type: 'order_status' | 'payout' | 'dispatch' | 'dispute' | 'system';
  role?: 'buyer' | 'vendor' | 'courier' | 'admin' | 'all';
  icon?: string;
  status?: string;
  orderId?: string;
  orderNumber?: string;
  link?: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: UniHiveNotification[];
  allNotifications: UniHiveNotification[];
  activeToast: UniHiveNotification | null;
  unreadCount: number;
  isDrawerOpen: boolean;
  soundEnabled: boolean;
  activeRole: string;
  pushPermission: NotificationPermission | 'unsupported';
  dispatchNotification: (notif: Omit<UniHiveNotification, 'id' | 'createdAt' | 'read'>) => void;
  dismissToast: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  toggleSound: () => void;
  testSound: (type?: 'chime' | 'success' | 'alert') => void;
  requestPushPermission: () => Promise<NotificationPermission | 'unsupported'>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { activeRole } = useAuth();

  // Clear legacy notifications if unihive_alerts_cleared_v7 is not present
  const [notifications, setNotifications] = useState<UniHiveNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const isCleared = localStorage.getItem('unihive_alerts_cleared_v7');
      if (!isCleared) {
        localStorage.removeItem('unihive_notifications_history');
        localStorage.removeItem('unihive_notifications_v1');
        localStorage.removeItem('unihive_notifications_v2');
        localStorage.removeItem('unihive_notifications_v3');
        localStorage.removeItem('unihive_notifications_v4');
        localStorage.removeItem('unihive_notifications_v5');
        localStorage.removeItem('unihive_notifications_v6');
        localStorage.removeItem('unihive_active_order_id');
        localStorage.setItem('unihive_alerts_cleared_v7', 'true');
        return [];
      }
      const saved = localStorage.getItem('unihive_notifications_v7');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [activeToast, setActiveToast] = useState<UniHiveNotification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => !soundService.getIsMuted());
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Check initial browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        setPushPermission('unsupported');
      } else {
        setPushPermission(Notification.permission);
      }
    }
  }, []);

  // Save notification history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('unihive_notifications_v7', JSON.stringify(notifications.slice(0, 50)));
    }
  }, [notifications]);

  // Strict role segregation: filter notifications by activeRole
  const roleFilteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (!n.role || n.role === 'all') return true;
      return n.role === activeRole;
    });
  }, [notifications, activeRole]);

  const unreadCount = useMemo(() => {
    return roleFilteredNotifications.filter((n) => !n.read).length;
  }, [roleFilteredNotifications]);

  const triggerBrowserPush = (title: string, body: string, iconUrl?: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: iconUrl || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'unihive-notification',
        });
      } catch (err) {
        console.warn('[WebPush] Error showing system notification:', err);
      }
    }
  };

  // Track recent notifications timestamps for deduplication
  const recentNotifsRef = useRef<Map<string, number>>(new Map());

  const dispatchNotification = useCallback(
    (notifData: Omit<UniHiveNotification, 'id' | 'createdAt' | 'read'>) => {
      // Deduplicate: suppress identical notifications arriving within 5.0 seconds
      const dedupKey = `${notifData.role || 'all'}:${notifData.type || ''}:${notifData.status || ''}:${notifData.orderNumber || notifData.orderId || ''}:${notifData.title}`;
      const now = Date.now();
      const lastSent = recentNotifsRef.current.get(dedupKey) || 0;
      if (now - lastSent < 5000) {
        console.log('[NotificationEngine] Suppressed duplicate notification:', notifData.title);
        return;
      }
      recentNotifsRef.current.set(dedupKey, now);

      // Clean up old entries from ref map periodically
      if (recentNotifsRef.current.size > 50) {
        recentNotifsRef.current.forEach((time, key) => {
          if (now - time > 15000) recentNotifsRef.current.delete(key);
        });
      }

      const newNotif: UniHiveNotification = {
        ...notifData,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Add to notifications array
      setNotifications((prev) => [newNotif, ...prev]);

      // Only chime and show toast if notification matches user's current role
      const isTargetForUser = !newNotif.role || newNotif.role === 'all' || newNotif.role === activeRole;

      if (isTargetForUser) {
        if (soundEnabled) {
          if (newNotif.status === 'inspected_completed' || newNotif.type === 'payout') {
            soundService.playSuccess();
          } else if (newNotif.status === 'disputed' || newNotif.type === 'dispute') {
            soundService.playAlert();
          } else {
            soundService.playChime();
          }
        }

        // Show floating in-app toast
        setActiveToast(newNotif);

        // Trigger Web Push notification if allowed
        triggerBrowserPush(`UniHive: ${newNotif.title}`, newNotif.body);
      }
    },
    [soundEnabled, activeRole]
  );

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!n.role || n.role === 'all' || n.role === activeRole) {
          return { ...n, read: true };
        }
        return n;
      })
    );
  }, [activeRole]);

  const clearAll = useCallback(() => {
    // Clear notifications for the active role
    setNotifications((prev) => prev.filter((n) => n.role && n.role !== activeRole && n.role !== 'all'));
    setActiveToast(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unihive_notifications_history');
      localStorage.removeItem('unihive_notifications_v5');
    }
  }, [activeRole]);

  const toggleSound = useCallback(() => {
    const isMutedNow = soundService.toggleMute();
    setSoundEnabled(!isMutedNow);
    if (!isMutedNow) {
      soundService.playChime();
    }
  }, []);

  const testSound = useCallback(() => {
    soundService.playChime();
  }, []);

  const requestPushPermission = useCallback(async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm === 'granted') {
        triggerBrowserPush('UniHive Alerts Activated', 'You will receive real-time campus delivery updates.');
      }
      return perm;
    }
    return 'unsupported';
  }, []);


  // Real-time socket listener for incoming events with role tagging
  useEffect(() => {
    if (!socket) return;

    // Buyer Order Status Updates
    const handleOrderStatus = (data: any) => {
      console.log('[Notification Engine] Order status changed:', data);
      const status = data.status;
      const orderNum = data.orderNumber || data.payload?.orderNumber || 'RUN-4829';

      // Suppress intermediate pending_payment and item_picked_up (item_picked_up has dedicated rich handler)
      if (status === 'item_picked_up' || status === 'pending_payment') {
        return;
      }

      let title = `Order #${orderNum} Updated`;
      let body = `Status changed to ${status}`;
      let icon = '📦';

      if (status === 'escrow_locked') {
        title = `🔐 Escrow Payment Secured (#${orderNum})`;
        const amount = data.payload?.totalAmount;
        body = amount
          ? `₦${Number(amount).toLocaleString()} locked in Escrow Vault. 4-digit PIN is active for delivery inspection.`
          : 'Payment locked in Escrow Vault. 4-digit PIN is active for delivery inspection.';
        icon = '🔐';
      } else if (status === 'in_transit') {
        title = `🚴 Runner En Route (#${orderNum})`;
        body = 'Your RUN courier has accepted the run and is heading to pick up your package.';
        icon = '🚴';
      } else if (status === 'at_porter_desk') {
        title = `🏢 Arrived at Porter's Lodge (#${orderNum})`;
        body = 'Package has arrived at the ground-floor porter reception. Ready for inspection & 4-digit PIN verification.';
        icon = '🏢';
      } else if (status === 'inspected_completed') {
        title = `🎉 Order Delivered & Escrow Settled (#${orderNum})`;
        body = 'Inspection confirmed! Payment has been safely disbursed to vendor.';
        icon = '🎉';
      } else if (status === 'refunded') {
        title = `💸 Escrow Refund Processed (#${orderNum})`;
        body = 'The escrow payment has been reversed and credited back to student wallet.';
        icon = '💸';
      } else if (status === 'disputed') {
        title = `⚠️ Mediation Dispute Opened (#${orderNum})`;
        body = 'A complaint has been lodged. Escrow funds are temporarily frozen pending proctor mediation.';
        icon = '⚠️';
      }

      dispatchNotification({
        title,
        body,
        type: status === 'disputed' ? 'dispute' : 'order_status',
        role: 'buyer',
        icon,
        status,
        orderId: data.payload?.orderId || data.orderId,
        orderNumber: orderNum,
        link: 'tracking',
      });
    };

    // Buyer Multi-Stop Live Item Pickup Progress
    const handleItemPickedUp = (data: any) => {
      console.log('[Notification Engine] Item picked up by courier:', data);
      const orderNum = data.orderNumber || 'RUN-4829';
      const isAll = data.allPickedUp;

      const title = isAll
        ? `🎉 All Items Picked Up (#${orderNum})`
        : `✓ Item Picked Up: ${data.productTitle} (#${orderNum})`;

      const body = isAll
        ? `Courier ${data.courier?.name || 'Runner'} has picked up all items and is heading to the porter lodge desk!`
        : `Courier ${data.courier?.name || 'Runner'} picked up ${data.productTitle} at ${data.pickupHostel}. (${data.pickedUpCount}/${data.totalCount} collected)`;

      dispatchNotification({
        title,
        body,
        type: 'order_status',
        role: 'buyer',
        icon: isAll ? '📦' : '✓',
        status: isAll ? 'all_items_picked_up' : 'item_picked_up',
        orderId: data.orderId || data.payload?.orderId,
        orderNumber: orderNum,
        link: 'tracking',
      });
    };

    // Vendor Payout & New Order Alerts
    const handleVendorNotif = (data: any) => {
      console.log('[Notification Engine] Vendor notification received:', data);
      const notif = data.notification || data;
      dispatchNotification({
        title: notif.subject || '💰 Paystack Escrow Payout Released',
        body: notif.body || `Settlement transferred to your verified merchant account for Order #${notif.orderId || 'RUN-4829'}.`,
        type: 'payout',
        role: 'vendor',
        icon: '💰',
        orderId: notif.orderId,
        link: 'vendor',
      });
    };

    // Courier Delivery Available Dispatch Alerts
    const handleCampusDispatch = (data: any) => {
      console.log('[Notification Engine] Campus dispatch event:', data);
      dispatchNotification({
        title: '🚲 New Delivery Request Available',
        body: `Order #${data?.orderNumber || 'RUN-4829'}: New delivery run available for pickup at RUN hostel porter lodge.`,
        type: 'dispatch',
        role: 'courier',
        icon: '🚲',
        link: 'courier',
      });
    };

    // Admin Dispute & Oversight Alerts
    const handleDisputeEvent = (data: any) => {
      console.log('[Notification Engine] Dispute event received:', data);
      dispatchNotification({
        title: '⚠️ New Order Dispute Lodged',
        body: `Order #${data?.orderNumber || 'RUN-4829'} flagged for proctor review: ${data?.reason || 'Buyer reported condition issue'}.`,
        type: 'dispute',
        role: 'admin',
        icon: '🛡️',
        link: 'admin',
      });
    };

    socket.on('order:status_changed', handleOrderStatus);
    socket.on('order:item_picked_up', handleItemPickedUp);
    socket.on('vendor:new_notification', handleVendorNotif);
    socket.on('dispatch:available', handleCampusDispatch);
    socket.on('dispute:raised', handleDisputeEvent);

    return () => {
      socket.off('order:status_changed', handleOrderStatus);
      socket.off('order:item_picked_up', handleItemPickedUp);
      socket.off('vendor:new_notification', handleVendorNotif);
      socket.off('dispatch:available', handleCampusDispatch);
      socket.off('dispute:raised', handleDisputeEvent);
    };
  }, [socket, dispatchNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: roleFilteredNotifications,
        allNotifications: notifications,
        activeToast,
        unreadCount,
        isDrawerOpen,
        soundEnabled,
        activeRole,
        pushPermission,
        dispatchNotification,
        dismissToast,
        openDrawer,
        closeDrawer,
        markAsRead,
        markAllAsRead,
        clearAll,
        toggleSound,
        testSound,
        requestPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
