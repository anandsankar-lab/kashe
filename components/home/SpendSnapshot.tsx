import { useEffect, useRef } from 'react';
import { Animated, View, useColorScheme } from 'react-native';
import Card from '../ui/Card';
import TypographyText from '../ui/Typography';
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
    <Card style={{ marginHorizontal: 16, marginTop: 12 }}>
      {/* Row 1 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <TypographyText variant="label" color={colours.textSecondary}>
          Spend this month
        </TypographyText>
        {budget > 0 && (
          <TypographyText variant="caption" color={colours.textDim}>
            of {currency}{budget.toLocaleString()} budget
          </TypographyText>
        )}
      </View>

      {/* Row 2 — Progress bar */}
      <View
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: trackColour,
          overflow: 'hidden',
          marginBottom: 10,
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

      {/* Row 3 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TypographyText variant="bodyMedium" color={colours.textPrimary}>
          {currency}{spent.toLocaleString()} spent
        </TypographyText>
        <TypographyText variant="caption" color={colours.textDim}>
          {Math.round(ratio * 100)}%
        </TypographyText>
      </View>
    </Card>
  );
}
