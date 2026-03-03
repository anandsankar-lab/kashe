import { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import Typography from '../../constants/typography';

type Props = {
  percentage: number;
  projectedYear: number;
  isSetUp: boolean;
  onPress?: () => void;
};

export default function FIREProgress({ percentage, projectedYear, isSetUp, onPress }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [trackWidth, setTrackWidth] = useState(0);
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isSetUp || trackWidth === 0) return;
    Animated.timing(fillAnim, {
      toValue: (percentage / 100) * trackWidth,
      duration: 600,
      easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic
      useNativeDriver: false,
    }).start();
  }, [isSetUp, trackWidth, percentage]);

  if (!isSetUp) return null;

  const borderColour = isDark ? colours.borderDark : colours.border;

  return (
    <View style={{ marginHorizontal: 16, marginTop: 12 }}>
      {/* Row 1 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={[Typography.label, { color: colours.textSecondary }]}>
          Financial Independence
        </Text>
        <Text style={[Typography.caption, { color: colours.textDim }]}>
          {projectedYear}
        </Text>
      </View>

      {/* Row 2 — animated progress bar */}
      <View
        style={{
          height: 6,
          backgroundColor: borderColour,
          borderRadius: 999,
          overflow: 'hidden',
          marginBottom: 8,
        }}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={{
            height: 6,
            width: fillAnim,
            backgroundColor: colours.accent,
            borderRadius: 999,
          }}
        />
      </View>

      {/* Row 3 — tappable */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={[Typography.caption, { color: colours.textDim }]}>
          {percentage}% to FIRE
        </Text>
      </TouchableOpacity>
    </View>
  );
}
