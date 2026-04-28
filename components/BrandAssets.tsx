
import React from 'react';

/**
 * GoodCircles Brand Assets
 * ════════════════════════
 * Logo assets from Powerup Media brand package.
 * Transparent PNGs extracted from original deliverables.
 * 
 * Brand Colors:
 *   Primary Purple: #7851A9
 *   Lavender:       #CA9CE1
 *   Gold:           #C2A76F
 *   Crimson:        #A20021
 *   Black:          #000000
 *   White:          #FFFFFF
 * 
 * Typography:
 *   Headings: Montserrat Extra Bold (800)
 *   Accent:   Fira Sans Medium (500)
 *   Body:     Montserrat Regular (400)
 */

const LOGO_PATHS = {
  goldLg:    '/logos/logo-gold-lg.png',
  goldMd:    '/logos/logo-gold-md.png',
  goldSm:    '/logos/logo-gold-sm.png',
  whiteMd:   '/logos/logo-white-md.png',
  goldFull:  '/logos/logo-gold.png',
  whiteFull: '/logos/logo-white.png',
} as const;

const SUBMARK_PATHS = {
  gold:      '/logos/submark-gold-48.png',
  white:     '/logos/submark-gold-48.png',   // white variant pending asset upload
  goldFull:  '/logos/submark-gold-48.png',
  whiteFull: '/logos/logo-white.png',         // white variant pending asset upload
} as const;

interface IconProps {
  className?: string;
  color?: string;
  size?: number | string;
  style?: React.CSSProperties;
  variant?: 'DEFAULT' | 'GOLD' | 'WHITE' | 'BLACK';
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Crown: React.FC<IconProps> = ({ className, color = 'currentColor', style }) => (
  <svg viewBox="0 0 100 60" className={className} fill={color} style={style} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 50 L10 20 L35 35 L50 5 L65 35 L90 20 L80 50 Z" />
    <circle cx="50" cy="5" r="3" />
    <circle cx="10" cy="20" r="2.5" />
    <circle cx="90" cy="20" r="2.5" />
  </svg>
);

export const BrandLogo: React.FC<IconProps> = ({ 
  className, variant = 'DEFAULT', style, size = 'auto', onClick 
}) => {
  const isWhite = variant === 'WHITE';
  const numericSize = typeof size === 'number' ? size : 
    size === 'auto' ? 200 : parseInt(size as string, 10) || 200;
  
  let src: string;
  if (isWhite) {
    src = numericSize > 240 ? LOGO_PATHS.whiteFull : LOGO_PATHS.whiteMd;
  } else {
    src = numericSize > 320 ? LOGO_PATHS.goldFull :
          numericSize > 200 ? LOGO_PATHS.goldLg :
          numericSize > 140 ? LOGO_PATHS.goldMd : LOGO_PATHS.goldSm;
  }

  const width = typeof size === 'number' ? `${size}px` : 
    size === 'auto' ? '200px' : size;

  return (
    <div
      className={`flex items-center select-none ${className || ''}`}
      style={{ ...style, width }}
      onClick={onClick}
    >
      <img 
        src={src} 
        alt="Good Circles" 
        style={{ width: '100%', height: 'auto', display: 'block' }}
        draggable={false}
      />
    </div>
  );
};

export const BrandSubmark: React.FC<IconProps & { showCrown?: boolean }> = ({ 
  className, variant = 'DEFAULT', showCrown = true, size = 48, onClick 
}) => {
  const isWhite = variant === 'WHITE';
  const numericSize = typeof size === 'number' ? size : parseInt(size as string, 10) || 48;
  
  const src = isWhite 
    ? (numericSize > 60 ? SUBMARK_PATHS.whiteFull : SUBMARK_PATHS.white)
    : (numericSize > 60 ? SUBMARK_PATHS.goldFull : SUBMARK_PATHS.gold);

  return (
    <div
      className={`flex items-center justify-center ${className || ''}`}
      style={{ width: numericSize, height: numericSize }}
      onClick={onClick}
    >
      <img
        src={src}
        alt="GC"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        draggable={false}
      />
    </div>
  );
};
