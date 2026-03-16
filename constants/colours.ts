// Kāshe colour tokens — never use raw hex values in components, always import from here

// ─── Raw palette (never use these directly in components) ───
const palette = {
  // Neutrals
  nearBlack:   '#111110',
  darkSurface: '#1C1C1A',
  darkBorder:  '#252523',
  offWhite:    '#F5F4F0',
  white:       '#FFFFFF',
  lightBorder: '#EEEEEA',

  // Text
  ink:  '#1A1A18',
  snow: '#F5F4F0',
  mid:  '#8A8A85',
  dim:  '#C4C4BF',

  // Brand
  acidGreen: '#C8F04A',
  red:       '#FF5C5C',
  amber:     '#FFB547',
  softRed:   '#FF8080',

  // Hero (always dark regardless of mode)
  heroStart:  '#1E1E1B',
  heroEnd:    '#131311',
  heroBorder: 'rgba(200, 240, 74, 0.2)',
} as const;

export type Theme = {
  background:    string;
  surface:       string;
  border:        string;
  textPrimary:   string;
  textSecondary: string;
  textDim:       string;
  textOnAccent:  string;
  accent:        string;
  danger:        string;
  warning:       string;
  success:       string;
  isDark:        boolean;
  hero: {
    backgroundStart:  string;
    backgroundEnd:    string;
    border:           string;
    textPrimary:      string;
    textSecondary:    string;
    textDim:          string;
    accent:           string;
    danger:           string;
    watermarkOpacity: number;
    trackBg:          string;
  };
};

export const darkTheme: Theme = {
  background:    palette.nearBlack,
  surface:       palette.darkSurface,
  border:        '#3A3A38',
  textPrimary:   palette.snow,
  textSecondary: palette.mid,
  textDim:       palette.dim,
  textOnAccent:  palette.ink,
  accent:        palette.acidGreen,
  danger:        palette.red,
  warning:       palette.amber,
  success:       palette.acidGreen,
  isDark:        true,
  hero: {
    backgroundStart:  palette.heroStart,
    backgroundEnd:    palette.heroEnd,
    border:           palette.heroBorder,
    textPrimary:      palette.snow,
    textSecondary:    'rgba(245, 244, 240, 0.55)',
    textDim:          'rgba(245, 244, 240, 0.35)',
    accent:           palette.acidGreen,
    danger:           palette.softRed,
    watermarkOpacity: 0.07,
    trackBg:          'rgba(255, 255, 255, 0.1)',
  },
};

export const lightTheme: Theme = {
  background:    palette.offWhite,
  surface:       palette.white,
  border:        palette.lightBorder,
  textPrimary:   palette.ink,
  textSecondary: palette.mid,
  textDim:       palette.dim,
  textOnAccent:  palette.ink,
  accent:        palette.acidGreen,
  danger:        palette.red,
  warning:       palette.amber,
  success:       palette.acidGreen,
  isDark:        false,
  hero: {
    backgroundStart:  palette.heroStart,   // hero is ALWAYS dark
    backgroundEnd:    palette.heroEnd,
    border:           palette.heroBorder,
    textPrimary:      palette.snow,
    textSecondary:    'rgba(245, 244, 240, 0.55)',
    textDim:          'rgba(245, 244, 240, 0.35)',
    accent:           palette.acidGreen,
    danger:           palette.softRed,
    watermarkOpacity: 0.07,
    trackBg:          'rgba(255, 255, 255, 0.1)',
  },
};

// Default export kept for backward compat during migration
// Prefer useTheme() in all new code
const colours = {
  // Light mode surfaces (kept for migration compat)
  background:     lightTheme.background,
  surface:        lightTheme.surface,
  border:         lightTheme.border,
  backgroundDark: darkTheme.background,
  surfaceDark:    darkTheme.surface,
  borderDark:     darkTheme.border,

  // Text (same in both modes)
  textPrimary:   '#F5F4F0',
  textSecondary: '#8A8A85',
  textDim:       '#C4C4BF',
  textOnAccent:  '#1A1A18',
  textOnDark:    '#F5F4F0',
  textOnLight:   '#1A1A18',

  // Brand (same in both modes)
  accent:  '#C8F04A',
  danger:  '#FF5C5C',
  warning: '#FFB547',
  success: '#C8F04A',

  // Hero card tokens
  heroGradientStart: '#1E1E1B',
  heroGradientEnd:   '#131311',
  heroBorder:        'rgba(200, 240, 74, 0.2)',
  heroTextPrimary:   '#F5F4F0',
  heroTextSecondary: 'rgba(245, 244, 240, 0.55)',
  heroTextDim:       'rgba(245, 244, 240, 0.35)',
  heroAccent:        '#C8F04A',
  heroDanger:        '#FF8080',
} as const;

export default colours;
