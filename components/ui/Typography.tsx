import { Text, TextStyle, useColorScheme } from 'react-native';
import Typography, { TypographyVariant } from '../../constants/typography';
import colours from '../../constants/colours';

type Props = {
  variant: TypographyVariant;
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
};

export default function TypographyText({ variant, color, style, children }: Props) {
  const isDark = useColorScheme() === 'dark';
  const defaultColor = isDark ? colours.textPrimary : colours.textPrimary;

  return (
    <Text style={[Typography[variant], { color: color ?? defaultColor }, style]}>
      {children}
    </Text>
  );
}
