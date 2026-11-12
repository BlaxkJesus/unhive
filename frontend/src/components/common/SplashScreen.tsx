import React, { useEffect, useState } from 'react';
import { UniHiveLogo } from './UniHiveLogo';

interface SplashScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 4000,
}) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // At exact 4000ms mark, begin smooth exit transition
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, minDurationMs);

    // Complete transition and display the selected page
    const removeTimer = setTimeout(() => {
      setRemoved(true);
      if (onComplete) onComplete();
    }, minDurationMs + 320);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [minDurationMs, onComplete]);

  if (removed) return null;

  return (
    <div
      id="unihive-splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#0B1120',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transform: fadingOut ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      {/* Pure Bouncing Logo Animation Centerpiece */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Bouncing UniHive Logo */}
        <div
          className="unihive-bouncing-logo"
          style={{
            position: 'relative',
            animation: 'unihiveLogoBounce 0.85s cubic-bezier(0.28, 0.84, 0.42, 1) infinite',
            willChange: 'transform',
          }}
        >
          <UniHiveLogo size={92} variant="white" />
        </div>

        {/* Dynamic Reactive Floor Shadow */}
        <div
          className="unihive-bouncing-shadow"
          style={{
            width: '64px',
            height: '12px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.6)',
            marginTop: '12px',
            animation: 'unihiveShadowBounce 0.85s cubic-bezier(0.28, 0.84, 0.42, 1) infinite',
            willChange: 'transform, opacity',
          }}
        />
      </div>

      <style>{`
        @keyframes unihiveLogoBounce {
          0%, 100% {
            transform: translateY(0) scale(1.02, 0.98);
            animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          50% {
            transform: translateY(-28px) scale(0.98, 1.03);
            animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);
          }
        }
        @keyframes unihiveShadowBounce {
          0%, 100% {
            transform: scale(1.15);
            opacity: 0.65;
          }
          50% {
            transform: scale(0.65);
            opacity: 0.18;
          }
        }
      `}</style>
    </div>
  );
};
