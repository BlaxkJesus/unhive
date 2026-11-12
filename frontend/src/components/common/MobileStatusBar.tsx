import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface MobileStatusBarProps {
  dark?: boolean;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ dark = false }) => {
  const textColor = dark ? '#F8FAFC' : '#0F172A';

  return (
    <div
      style={{
        padding: '12px 24px 8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        fontWeight: 700,
        color: textColor,
        userSelect: 'none',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Time */}
      <span style={{ letterSpacing: '-0.2px' }}>9:41</span>

      {/* Dynamic Island / Notch */}
      <div
        style={{
          width: '120px',
          height: '28px',
          background: '#000000',
          borderRadius: '16px',
          position: 'absolute',
          left: '50%',
          top: '8px',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
        }}
      >
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0F172A' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#047857', opacity: 0.3 }} />
      </div>

      {/* Status Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Signal bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5px', height: '12px' }}>
          <div style={{ width: '3px', height: '4px', background: textColor, borderRadius: '1px' }} />
          <div style={{ width: '3px', height: '6px', background: textColor, borderRadius: '1px' }} />
          <div style={{ width: '3px', height: '9px', background: textColor, borderRadius: '1px' }} />
          <div style={{ width: '3px', height: '12px', background: textColor, borderRadius: '1px' }} />
        </div>
        <Wifi size={14} strokeWidth={2.5} color={textColor} />
        <Battery size={16} strokeWidth={2.5} color={textColor} />
      </div>
    </div>
  );
};
