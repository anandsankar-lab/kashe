import { View, ViewStyle, useColorScheme } from 'react-native';
import colours from '../../constants/colours';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export default function Card({ children, style, padded = true }: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        {
          backgroundColor: isDark ? colours.surfaceDark : colours.surface,
          borderWidth: 1,
          borderColor: isDark ? colours.borderDark : colours.border,
          borderRadius: 16,
          ...(padded ? { padding: 20 } : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
