import React from 'react';

interface ProductGraphicProps {
  type: 'sneaker' | 'charger' | 'food' | 'jacket' | 'socks';
  size?: number | string;
  style?: React.CSSProperties;
}

export const ProductGraphic: React.FC<ProductGraphicProps> = ({ type, size = 120, style }) => {
  switch (type) {
    case 'sneaker':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(124, 58, 237, 0.2))', maxWidth: '100%', maxHeight: '100%', ...style }}
        >
          {/* Sneaker body */}
          <path
            d="M32 108C36 82 55 58 75 52L96 68L124 74C134 80 138 90 136 102C134 110 128 114 116 114H42C34 114 31 112 32 108Z"
            fill="url(#sneakerGrad)"
          />
          {/* Sole */}
          <path
            d="M28 112C28 110 32 108 38 108H132C136 108 138 110 138 114C138 120 132 124 122 124H44C32 124 28 118 28 112Z"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="2"
          />
          {/* Swoosh */}
          <path
            d="M58 92C74 88 104 76 122 84C106 94 86 102 68 98L58 92Z"
            fill="#DDD6FE"
            opacity="0.85"
          />
          {/* Laces */}
          <path d="M84 62L92 70" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M92 68L100 76" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M100 74L108 82" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="sneakerGrad" x1="40" y1="55" x2="135" y2="115" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A78BFA" />
              <stop offset="0.5" stopColor="#C4B5FD" />
              <stop offset="1" stopColor="#E0E7FF" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'charger':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.18))', maxWidth: '100%', maxHeight: '100%', ...style }}
        >
          {/* Prongs */}
          <rect x="66" y="32" width="6" height="24" rx="2" fill="#94A3B8" />
          <rect x="88" y="32" width="6" height="24" rx="2" fill="#94A3B8" />
          {/* Body */}
          <rect x="52" y="52" width="56" height="64" rx="10" fill="#1E293B" />
          {/* LED line */}
          <rect x="68" y="62" width="24" height="3" rx="1.5" fill="#10B981" />
          {/* USB Ports */}
          <rect x="64" y="94" width="32" height="10" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          <rect x="74" y="98" width="12" height="3" rx="1" fill="#F59E0B" />
        </svg>
      );

    case 'food':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(245, 158, 11, 0.25))', maxWidth: '100%', maxHeight: '100%', ...style }}
        >
          {/* Steam */}
          <path d="M68 36C68 30 76 28 76 22" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M80 32C80 26 88 24 88 18" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M92 36C92 30 100 28 100 22" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          {/* Pot body */}
          <path
            d="M44 68C44 58 116 58 116 68L110 112C108 122 52 122 50 112L44 68Z"
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="3"
          />
          {/* Food content */}
          <ellipse cx="80" cy="68" rx="32" ry="14" fill="#F97316" />
          <circle cx="72" cy="66" r="4" fill="#DC2626" />
          <circle cx="86" cy="69" r="3" fill="#16A34A" />
          <circle cx="92" cy="64" r="5" fill="#EA580C" />
          {/* Handles */}
          <path d="M42 74C32 74 32 86 42 86" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <path d="M118 74C128 74 128 86 118 86" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'jacket':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 8px 16px rgba(180, 83, 9, 0.2))', maxWidth: '100%', maxHeight: '100%', ...style }}
        >
          {/* Main jacket */}
          <path
            d="M52 46L68 38L80 50L92 38L108 46L126 78L112 88L104 74V124H56V74L48 88L34 78L52 46Z"
            fill="#D97706"
          />
          {/* Collar */}
          <path d="M68 38L80 54L92 38L80 44L68 38Z" fill="#FBBF24" />
          {/* Buttons */}
          <circle cx="80" cy="66" r="2.5" fill="#451A03" />
          <circle cx="80" cy="82" r="2.5" fill="#451A03" />
          <circle cx="80" cy="98" r="2.5" fill="#451A03" />
          <circle cx="80" cy="114" r="2.5" fill="#451A03" />
          {/* Pockets */}
          <rect x="62" y="76" width="10" height="12" rx="2" fill="#B45309" />
          <rect x="88" y="76" width="10" height="12" rx="2" fill="#B45309" />
        </svg>
      );

    case 'socks':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 6px 12px rgba(59, 130, 246, 0.2))', maxWidth: '100%', maxHeight: '100%', ...style }}
        >
          <path
            d="M55 42H75V86C75 96 82 102 94 102H105C112 102 115 110 110 116C104 124 90 126 76 122C62 118 55 106 55 92V42Z"
            fill="#3B82F6"
          />
          <path d="M55 42H75V52H55V42Z" fill="#FBBF24" />
          <path d="M55 58H75V64H55V58Z" fill="#FFFFFF" />
        </svg>
      );

    default:
      return null;
  }
};
