import React from 'react';
import { useNotifications, type UniHiveNotification } from '../../context/NotificationContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  Play,
  CheckCheck,
  Trash2,
  Shield,
  ExternalLink,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface NotificationDrawerProps {
  onNavigate?: (view: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    closeDrawer,
    soundEnabled,
    toggleSound,
    testSound,
    pushPermission,
    requestPushPermission,
    markAsRead,
    markAllAsRead,
    clearAll,
    activeRole,
  } = useNotifications();

  const { isMobile } = useResponsive();

  if (!isDrawerOpen) return null;

  const handleNotificationClick = (notif: UniHiveNotification) => {
    markAsRead(notif.id);
    if (notif.orderId) {
      localStorage.setItem('unihive_active_order_id', notif.orderId);
    }
    if (notif.link && onNavigate) {
      onNavigate(notif.link);
      closeDrawer();
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        zIndex: 10000,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'stretch',
        justifyContent: isMobile ? 'center' : 'flex-end',
      }}
      onClick={closeDrawer}
    >
      <div
        style={{
          background: '#FFFFFF',
          width: isMobile ? '100%' : '440px',
          maxWidth: '100vw',
          height: isMobile ? '86vh' : '100vh',
          borderTopLeftRadius: isMobile ? '24px' : '0',
          borderTopRightRadius: isMobile ? '24px' : '0',
          borderLeft: isMobile ? 'none' : '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          animation: isMobile ? 'slideUpDrawer 0.25s ease-out' : 'slideLeftDrawer 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideLeftDrawer {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes slideUpDrawer {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Drawer Drag Pill (Mobile Only) */}
        {isMobile && (
          <div
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '9999px',
              background: '#CBD5E1',
              margin: '12px auto 4px auto',
            }}
          />
        )}

        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Live Alerts
                </h3>
                <span
                  style={{
                    background:
                      activeRole === 'buyer'
                        ? '#EFF6FF'
                        : activeRole === 'vendor'
                        ? '#F0FDF4'
                        : activeRole === 'courier'
                        ? '#FEF3C7'
                        : '#F5F3FF',
                    color:
                      activeRole === 'buyer'
                        ? '#1D4ED8'
                        : activeRole === 'vendor'
                        ? '#15803D'
                        : activeRole === 'courier'
                        ? '#B45309'
                        : '#6D28D9',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    textTransform: 'capitalize',
                    border: `1px solid ${
                      activeRole === 'buyer'
                        ? '#BFDBFE'
                        : activeRole === 'vendor'
                        ? '#BBF7D0'
                        : activeRole === 'courier'
                        ? '#FDE68A'
                        : '#DDD6FE'
                    }`,
                  }}
                >
                  {activeRole}
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '9999px',
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                {activeRole === 'buyer'
                  ? 'Your campus orders & runner pickup stops'
                  : activeRole === 'vendor'
                  ? 'Merchant orders & escrow settlements'
                  : activeRole === 'courier'
                  ? 'Runner dispatch runs & delivery tasks'
                  : 'Platform disputes & oversight alerts'}
              </p>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
            }}
            title="Close alerts"
          >
            <X size={17} />
          </button>
        </div>

        {/* Audio Chime & Push Settings Control Bar */}
        <div
          style={{
            padding: '12px 18px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {/* Audio Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: soundEnabled ? '1px solid #A7F3D0' : '1px solid #FECACA',
                background: soundEnabled ? '#ECFDF5' : '#FEF2F2',
                color: soundEnabled ? '#065F46' : '#991B1B',
                fontSize: '11.5px',
                fontWeight: 750,
                cursor: 'pointer',
              }}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{soundEnabled ? 'Chime Sound: ON' : 'Chime Sound: MUTED'}</span>
            </button>

            {/* Test Synthesized Chime Button */}
            <button
              type="button"
              onClick={() => testSound('chime')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Preview synthesized Web Audio chime"
            >
              <Play size={11} />
              <span>Test Chime</span>
            </button>
          </div>

          {/* Web Push Notification Request / Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FFFFFF',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={13} color="#2563EB" />
              <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                Browser Web Push:
              </span>
            </div>

            {pushPermission === 'granted' ? (
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                ● Active
              </span>
            ) : pushPermission === 'denied' ? (
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#DC2626' }}>
                Blocked in browser
              </span>
            ) : (
              <button
                type="button"
                onClick={requestPushPermission}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  fontSize: '10.5px',
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
              >
                Enable Push
              </button>
            )}
          </div>
        </div>

        {/* Action Header Row */}
        {notifications.length > 0 && (
          <div
            style={{
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #F1F5F9',
              background: '#FFFFFF',
            }}
          >
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                  }}
                >
                  <CheckCheck size={13} />
                  <span>Mark read</span>
                </button>
              )}

              <button
                type="button"
                onClick={clearAll}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
                title="Clear all alerts"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications Scroll List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {notifications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                }}
              >
                <Bell size={24} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#334155', margin: 0 }}>
                All Caught Up for {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}!
              </h4>
              <p style={{ fontSize: '12px', color: '#64748B', maxWidth: '300px', margin: 0, lineHeight: 1.4 }}>
                {activeRole === 'buyer'
                  ? 'Updates for your orders, courier pickup stops, and porter arrival will appear here.'
                  : activeRole === 'vendor'
                  ? 'Incoming student purchases and escrow payouts will appear here.'
                  : activeRole === 'courier'
                  ? 'Campus dispatch tasks, runner requests, and pickup runs will appear here.'
                  : 'Administrative dispute reports and proctor mediation alerts will appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map((notif) => {
                const isPayout = notif.type === 'payout';
                const isCompleted = notif.status === 'inspected_completed';
                const isDispute = notif.type === 'dispute';

                const borderLeftColor = isPayout || isCompleted
                  ? '#059669'
                  : isDispute
                  ? '#DC2626'
                  : '#2563EB';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      borderLeft: `4px solid ${borderLeftColor}`,
                      background: notif.read ? '#FFFFFF' : '#F0F7FF',
                      cursor: notif.link ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      {notif.icon || '🔔'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <h5
                          style={{
                            fontSize: '13px',
                            fontWeight: notif.read ? 700 : 800,
                            color: '#0F172A',
                            margin: 0,
                            lineHeight: 1.3,
                          }}
                        >
                          {notif.title}
                        </h5>

                        <span style={{ fontSize: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: '11.5px',
                          color: '#475569',
                          margin: '3px 0 6px 0',
                          lineHeight: 1.35,
                          wordBreak: 'break-word',
                        }}
                      >
                        {notif.body}
                      </p>

                      {notif.link && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>
                          <span>
                            {notif.link === 'tracking'
                              ? 'View Live Order'
                              : notif.link === 'vendor'
                              ? 'Open Merchant Studio'
                              : notif.link === 'courier'
                              ? 'Open Courier Portal'
                              : 'View Details'}
                          </span>
                          <ExternalLink size={11} />
                        </div>
                      )}
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#2563EB',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                        title="Unread"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid #F1F5F9',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10.5px',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={12} color="#059669" />
            <span>End-to-end escrow protected alerts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 700 }}>
            <Sparkles size={11} />
            <span>RUN Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
