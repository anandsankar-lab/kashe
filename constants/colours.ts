// Kāshe colour tokens — never use raw hex values in components, always import from here

const colours = {
  // Light mode surfaces
  background: '#F5F4F0',     // warm off-white
  surface: '#FFFFFF',
  border: '#E8E8E3',

  // Dark mode surfaces
  backgroundDark: '#111110', // warm near-black
  surfaceDark: '#1C1C1A',
  borderDark: '#2A2A28',

  // Text (same in both modes)
  textPrimary: '#1A1A18',
  textSecondary: '#8A8A85',
  textDim: '#C4C4BF',

  // Brand (same in both modes)
  accent: '#C8F04A',         // acid green — use sparingly
  danger: '#FF5C5C',
  warning: '#FFB547',
  success: '#C8F04A',        // same as accent

  // Hero card gradient (dark, premium — always dark in both modes)
  heroGradientStart: '#1C1C1A',
  heroGradientEnd: '#111110',
  heroGradientTint: 'rgba(200, 240, 74, 0.06)',

  // Hero card text (always light — card is always dark)
  heroTextPrimary: '#F5F4F0',
  heroTextSecondary: 'rgba(245, 244, 240, 0.6)',
  heroTextDim: 'rgba(245, 244, 240, 0.35)',
  heroAccent: '#C8F04A',
  heroBorder: 'rgba(200, 240, 74, 0.15)',
} as const;

export default colours;
