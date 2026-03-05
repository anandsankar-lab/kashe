import { TouchableOpacity, View, Text, StyleProp, TextStyle } from 'react-native';
import colours from '../../constants/colours';

interface RedactedNumberProps {
  style?: StyleProp<TextStyle>;
  length?: number;
  onPress?: () => void;
}

export default function RedactedNumber({ style, length = 6, onPress }: RedactedNumberProps) {
  const text = (
    <Text
      style={[
        {
          fontFamily: 'SpaceGrotesk_700Bold',
          color: colours.textDim,
          letterSpacing: 2,
        },
        style,
      ]}
    >
      {'X'.repeat(length)}
    </Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {text}
      </TouchableOpacity>
    );
  }

  return <View>{text}</View>;
}
