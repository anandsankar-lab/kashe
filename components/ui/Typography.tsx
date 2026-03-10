import { Text, TextStyle } from 'react-native';
import Typography, { TypographyVariant } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  variant: TypographyVariant;
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
};

export default function TypographyText({ variant, color, style, children }: Props) {
  const theme = useTheme();

  return (
    <Text style={[Typography[variant], { color: color ?? theme.textPrimary }, style]}>
      {children}
    </Text>
  );
}
