import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  style?: ViewStyle;
};

export default function MacronRule({ style }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: theme.accent,
          width: '100%',
        },
        style,
      ]}
    />
  );
}
