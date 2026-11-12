import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useResponsive } from '../../hooks/useResponsive';
import { X, ExternalLink, Volume2, VolumeX } from 'lucide-react';

interface NotificationToastProps {
  onNavigate?: (view: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onNavigate }) => {
  const { activeToast, dismissToast, soundEnabled, toggleSound } = useNotifications();
  const { isMobile } = useResponsive();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeToast) {
      setProgress(100);
      return;
    }

    const duration = 6000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          dismissToast();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const handleAction = () => {
    if (activeToast.orderId) {
      localStorage.setItem('unihive_active_order_id', activeToast.orderId);
    }
    if (activeToast.link && onNavigate) {
      onNavigate(activeToast.link);
    }
    dismissToast();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '16px' : '24px',
        right: isMobile ? '12px' : '24px',
        left: isMobile ? '12px' : 'auto',
        maxWidth: isMobile ? 'none' : '420px',
        width: isMobile ? 'calc(100% - 24px)' : '400px',
        zIndex: 9999,
        background: '#0F172A',
        color: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        animation: 'slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes slideInToast {
          from {
            transform: translateY(-20px) scale(0.96);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* Main Toast Content */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Event Icon Badge */}
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {activeToast.icon || '🔔'}
        </div>

        {/* Text Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#F59E0B',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              UniHive Live Dispatch
            </span>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>Just now</span>
          </div>

          <h4
            style={{
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '3px 0 2px 0',
              lineHeight: 1.3,
            }}
          >
            {activeToast.title}
          </h4>

          <p
            style={{
              fontSize: '12px',
              color: '#CBD5E1',
              margin: '0 0 10px 0',
              lineHeight: 1.35,
              wordBreak: 'break-word',
            }}
          >
            {activeToast.body}
          </p>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeToast.link && (
              <button
                type="button"
                onClick={handleAction}
                style={{
                  background: '#2563EB',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'background 0.15s ease',
                }}
              >
                <span>View Details</span>
                <ExternalLink size={12} />
              </button>
            )}

            <button
              type="button"
              onClick={toggleSound}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '8px',
                padding: '5px 8px',
                color: '#94A3B8',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={soundEnabled ? 'Mute chimes' : 'Unmute chimes'}
            >
              {soundEnabled ? <Volume2 size={13} color="#10B981" /> : <VolumeX size={13} color="#EF4444" />}
            </button>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={dismissToast}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Dismiss alert"
        >
          <X size={16} />
        </button>
      </div>

      {/* Auto-Dismiss Progress Bar */}
      <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.1)' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#F59E0B',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </div>
  );
};
