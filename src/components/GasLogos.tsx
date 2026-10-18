import React from 'react';

// Official SVG vector badge for IndianOil (Indane Gas)
export const IndianOilLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    {/* Outer saffron ring */}
    <circle cx="50" cy="50" r="48" fill="#F37021" />
    {/* Inner navy blue circle */}
    <circle cx="50" cy="50" r="38" fill="#1C3F94" />
    {/* Central horizontal saffron bar */}
    <rect x="12" y="42" width="76" height="16" fill="#F37021" rx="2" />
    {/* IndianOil stylized text in Hindi/English representation */}
    <text
      x="50"
      y="54"
      fill="#FFFFFF"
      fontSize="10"
      fontWeight="900"
      fontFamily="system-ui, sans-serif"
      textAnchor="middle"
      letterSpacing="0.5"
    >
      IndianOil
    </text>
    {/* Top text */}
    <text
      x="50"
      y="32"
      fill="#FFFFFF"
      fontSize="7.5"
      fontWeight="800"
      fontFamily="system-ui, sans-serif"
      textAnchor="middle"
    >
      INDIAN OIL
    </text>
    {/* Bottom text */}
    <text
      x="50"
      y="72"
      fill="#FFFFFF"
      fontSize="7.5"
      fontWeight="800"
      fontFamily="system-ui, sans-serif"
      textAnchor="middle"
    >
      INDANE GAS
    </text>
  </svg>
);

// Official SVG vector badge for HP Gas (Hindustan Petroleum)
export const HpGasLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    {/* HP Blue circular background */}
    <circle cx="50" cy="50" r="48" fill="#003399" />
    <circle cx="50" cy="50" r="44" fill="#FFFFFF" />
    <circle cx="50" cy="50" r="40" fill="#003399" />
    {/* Red and Blue HP Emblem */}
    <circle cx="50" cy="42" r="22" fill="#E31837" />
    {/* HP Bold Letters */}
    <text
      x="50"
      y="49"
      fill="#FFFFFF"
      fontSize="20"
      fontWeight="900"
      fontFamily="system-ui, sans-serif"
      textAnchor="middle"
      letterSpacing="-0.5"
    >
      HP
    </text>
    {/* HP GAS Banner */}
    <rect x="18" y="68" width="64" height="18" rx="4" fill="#E31837" />
    <text
      x="50"
      y="81"
      fill="#FFFFFF"
      fontSize="10"
      fontWeight="900"
      fontFamily="system-ui, sans-serif"
      textAnchor="middle"
      letterSpacing="1"
    >
      HP GAS
    </text>
  </svg>
);

// Official SVG vector badge for Bharat Gas (Bharat Petroleum)
export const BharatGasLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    {/* BPCL Yellow-Gold & Blue branding */}
    <circle cx="50" cy="50" r="48" fill="#00457C" />
    <circle cx="50" cy="50" r="44" fill="#FFCC00" />
    <circle cx="50" cy="50" r="40" fill="#FFFFFF" />
    {/* Flame / Drop symbol */}
    <path
      d="M50 20 C42 32 34 42 34 52 C34 62 41 68 50 68 C59 68 66 62 66 52 C66 42 58 32 50 20 Z"
      fill="#0072CE"
    />
    <path
      d="M50 28 C45 36 40 44 40 52 C40 58 44 63 50 63 C56 63 60 58 60 52 C60 44 55 36 50 28 Z"
      fill="#FFCC00"
    />
    {/* Bharat Gas label */}
    <rect x="14" y="70" width="72" height="18" rx="4" fill="#00457C" />
    <text
      x="50"
      y="83"
      fill="#FFCC00"
      fontSize="9"
      fontWeight="900"
      fontFamily="system-ui, sans-serif"
      textAnchor="middle"
      letterSpacing="0.5"
    >
      BHARAT GAS
    </text>
  </svg>
);

// Combined Gas Agency Multi-Tool Suite Logo (CDCMS + HP + IndianOil + Bharat)
export const GasAgencyMasterLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 48,
}) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    <div
      className="rounded-2xl p-1.5 shadow-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-blue-600 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full text-white"
      >
        {/* Flame symbol */}
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    </div>
  </div>
);
