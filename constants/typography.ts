// Kāshe typography tokens — never use raw font values in components, always import from here

import { TextStyle } from 'react-native';

export const Typography = {
  display: {
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: -1.5,
    lineHeight: 1.1,
  } as TextStyle,

  heading: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    letterSpacing: -0.5,
  } as TextStyle,

  headingLarge: {
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: -0.8,
  } as TextStyle,

  body: {
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.2,
  } as TextStyle,

  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    letterSpacing: -0.2,
  } as TextStyle,

  label: {
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
  } as TextStyle,

  caption: {
    fontFamily: 'Inter_400Regular',
    letterSpacing: -0.1,
    fontSize: 12,
  } as TextStyle,

  mono: {
    fontFamily: 'SpaceGrotesk_400Regular',
    letterSpacing: -0.3,
  } as TextStyle,
};

export type TypographyVariant = keyof typeof Typography;

export default Typography;
