import type { AccentColor } from '@/types';

/**
 * Accent palette hex map — the JS twin of the CSS variables defined in
 * src/index.css under `[data-theme-color="…"]`. CSS classes should always
 * prefer the `(--brand)` Tailwind variable shorthand; this map exists for
 * the spots that need a raw colour value in JS/TS: SVG chart attributes,
 * the Razorpay checkout theme, jsPDF invoice colours and the
 * <meta name="theme-color"> tag. Keep the two in sync.
 */
export interface AccentPalette {
  /** --brand — primary brand colour */
  brand: string;
  /** --brand-hover — darker shade for hover states */
  hover: string;
  /** --brand-soft — pale tint background */
  soft: string;
  /** --brand-soft-hover — slightly deeper soft tint (hover on soft) */
  softHover: string;
  /** --brand-ink — light tint for use on dark backgrounds */
  ink: string;
  /** --brand-mid — lighter mid stop for brand gradients */
  mid: string;
  /** --brand-rgb as a tuple, for rgba()/canvas/PDF APIs */
  rgb: [number, number, number];
  /** --brand-ink-rgb as a tuple */
  inkRgb: [number, number, number];
}

export const ACCENTS: Record<AccentColor, AccentPalette> = {
  royal: {
    brand: '#1E40FF',
    hover: '#1740D6',
    soft: '#EEF1FF',
    softHover: '#E0E6FF',
    ink: '#8fa0ff',
    mid: '#5b83ff',
    rgb: [30, 64, 255],
    inkRgb: [143, 160, 255],
  },
  indigo: {
    brand: '#4f46e5',
    hover: '#4338ca',
    soft: '#e0e7ff',
    softHover: '#c7d2fe',
    ink: '#a5b4fc',
    mid: '#818cf8',
    rgb: [79, 70, 229],
    inkRgb: [165, 180, 252],
  },
  emerald: {
    brand: '#059669',
    hover: '#047857',
    soft: '#d1fae5',
    softHover: '#a7f3d0',
    ink: '#6ee7b7',
    mid: '#34d399',
    rgb: [5, 150, 105],
    inkRgb: [110, 231, 183],
  },
  rose: {
    brand: '#e11d48',
    hover: '#be123c',
    soft: '#ffe4e6',
    softHover: '#fecdd3',
    ink: '#fda4af',
    mid: '#fb7185',
    rgb: [225, 29, 72],
    inkRgb: [253, 164, 175],
  },
  amber: {
    brand: '#d97706',
    hover: '#b45309',
    soft: '#fef3c7',
    softHover: '#fde68a',
    ink: '#fcd34d',
    mid: '#fbbf24',
    rgb: [217, 119, 6],
    inkRgb: [252, 211, 77],
  },
  sky: {
    brand: '#0284c7',
    hover: '#0369a1',
    soft: '#e0f2fe',
    softHover: '#bae6fd',
    ink: '#7dd3fc',
    mid: '#38bdf8',
    rgb: [2, 132, 199],
    inkRgb: [125, 211, 252],
  },
  violet: {
    brand: '#7c3aed',
    hover: '#6d28d9',
    soft: '#ede9fe',
    softHover: '#ddd6fe',
    ink: '#c4b5fd',
    mid: '#a78bfa',
    rgb: [124, 58, 237],
    inkRgb: [196, 181, 253],
  },
};

export const DEFAULT_ACCENT: AccentColor = 'royal';

const ACCENT_IDS = Object.keys(ACCENTS) as AccentColor[];

export function isAccentColor(value: unknown): value is AccentColor {
  return typeof value === 'string' && (ACCENT_IDS as string[]).includes(value);
}

/** Palette for an accent id, falling back to the default preset. */
export function getAccent(accent: AccentColor | null | undefined): AccentPalette {
  return (accent && ACCENTS[accent]) || ACCENTS[DEFAULT_ACCENT];
}

/**
 * The accent currently stored by ThemeContext (localStorage `lw_accent_color`).
 * For non-React code paths — payment checkout, PDF generation, one-shot
 * event handlers — that run outside the React tree.
 */
export function getStoredAccent(): AccentColor {
  try {
    const raw = localStorage.getItem('lw_accent_color');
    return isAccentColor(raw) ? raw : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

/** Palette for the accent stored by ThemeContext. */
export function getStoredAccentPalette(): AccentPalette {
  return getAccent(getStoredAccent());
}
