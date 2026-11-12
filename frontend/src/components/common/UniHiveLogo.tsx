import React from 'react';

export interface UniHiveLogoProps {
  size?: number;
  className?: string;
  variant?: 'light' | 'dark' | 'purple' | 'white';
  type?: 'mark' | 'full';
  withBadge?: boolean;
}

export const UniHiveLogo: React.FC<UniHiveLogoProps> = ({
  size = 36,
  className = '',
  variant = 'light',
  type = 'mark',
  withBadge = false,
}) => {
  const isDark = variant === 'dark' || variant === 'white';

  // Mark fills based on variant
  const markFill = isDark ? '#FFFFFF' : '#0F2B5C';

  // If full wordmark lockup requested:
  if (type === 'full') {
    const titleFill = isDark ? '#FFFFFF' : '#0F172A';
    const honeyFill = '#D97706';
    const height = size;
    const width = Math.round(size * 4.2);

    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 420 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      >
        {/* Monogram */}
        <g id="monogram" transform="translate(6, 2)">
          <path
            d="M 16 16 L 30 16 L 30 56 C 30 63 35 68 45 68 C 55 68 60 63 60 56 L 60 16 L 74 16 L 74 44 L 104 44 L 104 16 L 118 16 L 118 80 L 104 80 L 104 56 L 74 56 C 74 70 61 82 45 82 C 29 82 16 70 16 56 Z"
            fill={markFill}
          />
        </g>

        {/* Brand Wordmark */}
        <text
          x="156"
          y="66"
          fill={titleFill}
          style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '46px',
            fontWeight: 800,
            letterSpacing: '-1.2px',
          }}
        >
          Uni<tspan fill={honeyFill}>Hive</tspan>
        </text>
      </svg>
    );
  }

  // Standalone Interlocking "UH" Monogram Mark
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >

      {/* Optional Brand Squircle Badge */}
      {withBadge && (
        <rect
          width="140"
          height="140"
          rx="28"
          fill="#0F2B5C"
        />
      )}

      {/* Interlocking "UH" Monogram */}
      <g transform="translate(3, 22)">
        <path
          d="M 16 16 L 30 16 L 30 56 C 30 63 35 68 45 68 C 55 68 60 63 60 56 L 60 16 L 74 16 L 74 44 L 104 44 L 104 16 L 118 16 L 118 80 L 104 80 L 104 56 L 74 56 C 74 70 61 82 45 82 C 29 82 16 70 16 56 Z"
          fill={withBadge ? '#FFFFFF' : markFill}
        />
      </g>
    </svg>
  );
};
