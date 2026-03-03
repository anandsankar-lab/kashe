// Kāshe typography tokens — never use raw font values in components, always import from here

const Typography = {
  display: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 40,
    letterSpacing: -1.5,
  },
  heading: {
    fontFamily: 'Syne_700Bold',
    fontSize: 24,
  },
  subheading: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  bodyMedium: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  caption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  number: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 32,
    letterSpacing: -1,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;

export default Typography;
