import { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Card from '../ui/Card';
import colours from '../../constants/colours';
import RedactedNumber from '../shared/RedactedNumber';

type Props = {
  spent: number;
  budget: number;
  currency?: string;
  isRedacted?: boolean;
};

export default function SpendSnapshot({ spent, budget, currency = '€', isRedacted = false }: Props) {
  const theme = useTheme();
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
      toValue: isRedacted ? 0 : pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct, isRedacted]);

  const trackColour = theme.border;

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
            color: theme.textSecondary,
          }}
        >
          Spend this month
        </Text>
        {budget > 0 && (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: theme.textDim,
            }}
          >
            of {currency}{isRedacted ? <RedactedNumber length={4} style={{ fontSize: 12 }} /> : budget.toLocaleString()} budget
          </Text>
        )}
      </View>

      {/* Row 2: amount + percentage */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        {isRedacted ? (
          <RedactedNumber length={5} style={{ fontSize: 20 }} />
        ) : (
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 20,
              color: theme.textPrimary,
            }}
          >
            {currency}{spent.toLocaleString()} spent
          </Text>
        )}
        {isRedacted ? (
          <RedactedNumber length={2} style={{ fontSize: 13 }} />
        ) : (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: theme.textSecondary,
            }}
          >
            {Math.round(ratio * 100)}%
          </Text>
        )}
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
