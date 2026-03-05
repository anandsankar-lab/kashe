import { useEffect, useRef } from 'react';
import { Animated, View, Text, useColorScheme } from 'react-native';
import Card from '../ui/Card';
import colours from '../../constants/colours';

type Props = {
  spent: number;
  budget: number;
  currency?: string;
};

export default function SpendSnapshot({ spent, budget, currency = '€' }: Props) {
  const isDark = useColorScheme() === 'dark';
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const ratio = budget > 0 ? spent / budget : 0;
  const pct = Math.min(ratio, 1);

  const fillColour =
    ratio >= 1
      ? colours.danger
      : ratio >= 0.8
        ? colours.warning
        : colours.accent;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const trackColour = isDark ? colours.borderDark : colours.border;

  return (
    <Card>
      {/* Row 1: label + budget */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colours.textSecondary,
          }}
        >
          Spend this month
        </Text>
        {budget > 0 && (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: colours.textDim,
            }}
          >
            of {currency}{budget.toLocaleString()} budget
          </Text>
        )}
      </View>

      {/* Row 2: amount + percentage */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            fontSize: 20,
            color: colours.textPrimary,
          }}
        >
          {currency}{spent.toLocaleString()} spent
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: colours.textSecondary,
          }}
        >
          {Math.round(ratio * 100)}%
        </Text>
      </View>

      {/* Row 3: progress bar */}
      <View
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: trackColour,
          overflow: 'hidden',
          marginTop: 10,
          marginBottom: 0,
        }}
      >
        <Animated.View
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: fillColour,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </Card>
  );
}
