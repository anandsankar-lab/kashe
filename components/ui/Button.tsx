import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'text';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
};

const labelStyle: TextStyle = {
  fontFamily: 'Inter_500Medium',
  fontSize: 16,
};

export default function Button({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    opacity: disabled ? 0.4 : 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(variant === 'primary' && {
      backgroundColor: theme.accent,
      borderRadius: 999,
      paddingVertical: 14,
      paddingHorizontal: 16,
    }),
    ...(variant === 'secondary' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.accent,
      borderRadius: 999,
      paddingVertical: 14,
      paddingHorizontal: 16,
    }),
  };

  const textColor =
    variant === 'primary' ? theme.textOnAccent : theme.accent;

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <Text style={[labelStyle, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}
