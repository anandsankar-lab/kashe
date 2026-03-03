// Kāshe spacing tokens — 4px base grid

const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  card: 16,
  input: 12,
  pill: 999,
  small: 8,
} as const;

export default Spacing;
