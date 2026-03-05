import { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import Card from '../ui/Card';
import colours from '../../constants/colours';

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
      easing: (t) => 1 - Math.pow(1 - t, 3),
      useNativeDriver: false,
    }).start();
  }, [isSetUp, trackWidth, percentage]);

  if (!isSetUp) return null;

  const borderColour = isDark ? colours.borderDark : colours.border;

  return (
    <Card style={{ padding: 16 }}>
      {/* Top row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colours.textSecondary,
          }}
        >
          Financial Independence
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: 22,
            letterSpacing: -0.5,
            color: colours.textPrimary,
          }}
        >
          {projectedYear}
        </Text>
      </View>

      {/* Animated progress bar */}
      <View
        style={{
          height: 6,
          backgroundColor: borderColour,
          borderRadius: 999,
          overflow: 'hidden',
          marginTop: 12,
          marginBottom: 10,
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

      {/* Bottom row */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: colours.textSecondary,
          }}
        >
          {percentage}% to FIRE
        </Text>
      </TouchableOpacity>
    </Card>
  );
}
