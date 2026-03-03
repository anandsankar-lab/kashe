import { View, ViewStyle } from 'react-native';
import colours from '../../constants/colours';

type Props = {
  style?: ViewStyle;
};

export default function MacronRule({ style }: Props) {
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: colours.accent,
          width: '100%',
        },
        style,
      ]}
    />
  );
}
