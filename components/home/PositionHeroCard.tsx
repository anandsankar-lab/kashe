import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line } from 'react-native-svg';
import MacronRule from '../shared/MacronRule';
import KasheAsterisk from '../shared/KasheAsterisk';

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

function getPositionFontSize(value: number): number {
  const digits = Math.abs(value)
    .toLocaleString()
    .replace(/[^0-9]/g, '').length;
  if (digits <= 5) return 52;
  if (digits <= 6) return 46;
  if (digits <= 7) return 40;
  if (digits <= 9) return 34;
  return 28;
}

function formatNumber(n: number): string {
  return Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function deltaDirection(n: number): 'up' | 'down' | 'neutral' {
  if (n > 0) return 'up';
  if (n < 0) return 'down';
  return 'neutral';
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

  const onContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== contentHeight) {
      setContentHeight(h);
    }
  };

  return (
    <LinearGradient
      colors={['#1E1E1B', '#131311']}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      style={{ borderRadius: 24, overflow: 'hidden' }}
    >
      {/* Background asterisk watermark */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -45,
          right: -45,
          width: 200,
          height: 200,
          opacity: 0.07,
          zIndex: 0,
        }}
      >
        <Svg width={200} height={200}>
          <Line x1={100} y1={8} x2={100} y2={192} stroke="#C8F04A" strokeWidth={14} strokeLinecap="round" />
          <Line x1={22} y1={52} x2={178} y2={148} stroke="#C8F04A" strokeWidth={14} strokeLinecap="round" />
          <Line x1={22} y1={148} x2={178} y2={52} stroke="#C8F04A" strokeWidth={14} strokeLinecap="round" />
        </Svg>
      </View>

      <View style={{ padding: 24, zIndex: 1 }}>
        {/* Row 1: Label + Savings Rate badge */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: 'rgba(245, 244, 240, 0.5)',
            }}
          >
            Your Position
          </Text>
          <View
            style={{
              backgroundColor: 'rgba(200, 240, 74, 0.1)',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 13,
                color: '#C8F04A',
              }}
            >
              {savingsRate}%
            </Text>
          </View>
        </View>

        {/* Row 2: Position number */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: getPositionFontSize(position),
            letterSpacing: -2,
            color: '#F5F4F0',
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          {currency}{formatNumber(position)}
        </Text>

        {/* Row 3: Deltas */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginBottom: 20,
          }}
        >
          <KasheAsterisk size={11} direction={deltaDirection(monthDelta)} />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: 'rgba(245, 244, 240, 0.55)',
            }}
          >
            {currency}{formatNumber(monthDelta)} this month
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: 'rgba(245, 244, 240, 0.3)',
            }}
          >
            {' '}·{' '}
          </Text>
          <KasheAsterisk size={11} direction={deltaDirection(ytdDelta)} />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: 'rgba(245, 244, 240, 0.55)',
            }}
          >
            {currency}{formatNumber(ytdDelta)} YTD
          </Text>
        </View>

        {/* MacronRule divider */}
        <MacronRule style={{ backgroundColor: 'rgba(200, 240, 74, 0.2)', marginBottom: 0 }} />

        {/* Row 4: Toggle header */}
        <TouchableOpacity
          onPress={toggle}
          style={{ paddingVertical: 18 }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: 'rgba(245, 244, 240, 0.4)',
            }}
          >
            {expanded ? '▾' : '▸'} Assets & liabilities
          </Text>
        </TouchableOpacity>

        {/* Animated expandable breakdown */}
        <Animated.View style={{ overflow: 'hidden', height: animHeight }}>
          <View
            onLayout={onContentLayout}
            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
          >
            {/* Liquid assets */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: 'rgba(245, 244, 240, 0.55)',
                }}
              >
                Liquid assets
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 15,
                  color: '#F5F4F0',
                }}
              >
                {currency}{formatNumber(liquidAssets)}
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

            {/* Illiquid assets */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: 'rgba(245, 244, 240, 0.55)',
                }}
              >
                Illiquid assets
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 15,
                  color: '#F5F4F0',
                }}
              >
                {currency}{formatNumber(illiquidAssets)}
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

            {/* Liabilities */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: 'rgba(245, 244, 240, 0.55)',
                }}
              >
                Liabilities
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 15,
                  color: '#FF8080',
                }}
              >
                −{currency}{formatNumber(liabilities)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
