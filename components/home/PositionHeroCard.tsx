import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import Card from '../ui/Card';
import MacronRule from '../shared/MacronRule';
import colours from '../../constants/colours';
import Spacing, { borderRadius } from '../../constants/spacing';
import Typography from '../../constants/typography';

type Props = {
  position: number;
  savingsRate: number;
  monthDelta: number;
  ytdDelta: number;
  liquidAssets: number;
  illiquidAssets: number;
  liabilities: number;
  currency?: string;
};

function formatNumber(n: number): string {
  return Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function deltaSign(n: number): string {
  return n >= 0 ? '↑' : '↓';
}

export default function PositionHeroCard({
  position,
  savingsRate,
  monthDelta,
  ytdDelta,
  liquidAssets,
  illiquidAssets,
  liabilities,
  currency = '€',
}: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const [contentHeight, setContentHeight] = React.useState(0);
  const animValue = React.useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(animValue, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setExpanded((prev) => !prev);
  };

  const animHeight = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const animRotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const onContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== contentHeight) {
      setContentHeight(h);
    }
  };

  return (
    <Card style={{ marginHorizontal: Spacing.lg }}>
      {/* Row 1: Label + Savings Rate badge */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={[Typography.label, { color: colours.textSecondary }]}>
          Your Position
        </Text>
        <View
          style={{
            backgroundColor: colours.accent,
            borderRadius: borderRadius.pill,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontFamily: 'DMSans_500Medium',
              fontSize: 13,
              color: colours.textPrimary,
            }}
          >
            {savingsRate}%
          </Text>
        </View>
      </View>

      {/* Row 2: Position number */}
      <Text
        style={{
          fontFamily: 'Syne_800ExtraBold',
          fontSize: 48,
          letterSpacing: -1.5,
          color: colours.textPrimary,
          marginTop: Spacing.sm,
        }}
      >
        {currency}{formatNumber(position)}
      </Text>

      {/* Row 3: Deltas */}
      <Text
        style={[
          Typography.caption,
          { color: colours.textSecondary, marginTop: Spacing.xs },
        ]}
      >
        {deltaSign(monthDelta)} {currency}{formatNumber(monthDelta)} this month{'  ·  '}
        {deltaSign(ytdDelta)} {currency}{formatNumber(ytdDelta)} YTD
      </Text>

      {/* MacronRule */}
      <MacronRule style={{ marginVertical: Spacing.lg }} />

      {/* Row 4: Toggle header */}
      <TouchableOpacity
        onPress={toggle}
        style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}
        activeOpacity={0.7}
      >
        <Animated.Text
          style={{
            fontSize: 10,
            color: colours.textDim,
            transform: [{ rotate: animRotate }],
          }}
        >
          ▼
        </Animated.Text>
        <Text style={[Typography.caption, { color: colours.textDim }]}>
          Assets & liabilities
        </Text>
      </TouchableOpacity>

      {/* Animated expandable breakdown */}
      <Animated.View style={{ overflow: 'hidden', height: animHeight }}>
        <View
          onLayout={onContentLayout}
          style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        >
          <View style={{ paddingTop: Spacing.md, gap: Spacing.sm }}>
            {/* Liquid assets */}
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={[Typography.caption, { color: colours.textSecondary }]}>
                Liquid assets
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans_500Medium',
                  fontSize: 13,
                  color: colours.textPrimary,
                }}
              >
                {currency}{formatNumber(liquidAssets)}
              </Text>
            </View>

            {/* Illiquid assets */}
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={[Typography.caption, { color: colours.textSecondary }]}>
                Illiquid assets{' '}
                <Text style={{ color: colours.textDim }}>ⓘ</Text>
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans_500Medium',
                  fontSize: 13,
                  color: colours.textPrimary,
                }}
              >
                {currency}{formatNumber(illiquidAssets)}
              </Text>
            </View>

            {/* Liabilities */}
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={[Typography.caption, { color: colours.textSecondary }]}>
                Liabilities
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans_500Medium',
                  fontSize: 13,
                  color: colours.danger,
                }}
              >
                −{currency}{formatNumber(liabilities)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Card>
  );
}
