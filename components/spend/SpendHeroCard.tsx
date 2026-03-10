import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line } from 'react-native-svg';
import MacronRule from '../shared/MacronRule';
import RedactedNumber from '../shared/RedactedNumber';
import KasheAsterisk from '../shared/KasheAsterisk';

interface SpendHeroCardProps {
  totalSpend: number;
  currency: string;
  budgetAmount: number | null;
  vsLastMonth: number | null;
  vs3MonthAvg: number | null;
  hasMultiCurrency: boolean;
  selectedMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  canGoNext: boolean;
  isRedacted?: boolean;
}

function getSpendFontSize(amount: number): number {
  if (amount < 10000) return 52;
  if (amount < 100000) return 44;
  if (amount < 1000000) return 36;
  return 28;
}

export default function SpendHeroCard({
  totalSpend,
  currency,
  budgetAmount,
  vsLastMonth,
  vs3MonthAvg,
  hasMultiCurrency,
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  canGoNext,
  isRedacted = false,
}: SpendHeroCardProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  const fillPercent =
    budgetAmount !== null
      ? Math.min((totalSpend / budgetAmount) * 100, 100)
      : 0;

  useEffect(() => {
    if (budgetAmount === null || isRedacted) return;
    fillAnim.setValue(0);
    Animated.timing(fillAnim, {
      toValue: fillPercent,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [fillPercent, budgetAmount, isRedacted]);

  function getFillColor(pct: number): string {
    if (pct < 80) return '#C8F04A';
    if (pct < 100) return '#FFB547';
    return '#FF5C5C';
  }

  const monthLabel = selectedMonth.toLocaleDateString('en-EU', {
    month: 'long',
    year: 'numeric',
  });

  const formattedSpend = `${currency}${totalSpend.toLocaleString('en-EU')}`;
  const fontSize = getSpendFontSize(totalSpend);

  const chevronActiveColor = 'rgba(245, 244, 240, 0.55)';
  const chevronDisabledColor = 'rgba(245, 244, 240, 0.15)';

  return (
    <LinearGradient
      colors={['#1E1E1B', '#131311']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 24,
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 4,
        overflow: 'hidden',
      }}
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

        {/* Section 1: Month selector */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={onPreviousMonth}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 20,
                color: chevronActiveColor,
              }}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: chevronActiveColor,
            }}
          >
            {monthLabel}
          </Text>

          <TouchableOpacity
            onPress={canGoNext ? onNextMonth : undefined}
            activeOpacity={canGoNext ? 0.6 : 1}
            disabled={!canGoNext}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 20,
                color: canGoNext ? chevronActiveColor : chevronDisabledColor,
              }}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 2: Spend number */}
        {budgetAmount !== null && (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: 'rgba(245, 244, 240, 0.55)',
              marginBottom: 6,
            }}
          >
            Spent this month
          </Text>
        )}

        {isRedacted ? (
          <RedactedNumber length={5} style={{ fontSize }} />
        ) : (
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize,
              letterSpacing: -2,
              color: '#F5F4F0',
            }}
          >
            {formattedSpend}
          </Text>
        )}

        {hasMultiCurrency && !isRedacted && (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: 'rgba(245, 244, 240, 0.35)',
              marginTop: 4,
            }}
          >
            incl. amounts converted from INR
          </Text>
        )}

        {/* Section 3: MacronRule */}
        <MacronRule
          style={{
            backgroundColor: 'rgba(200, 240, 74, 0.2)',
            marginTop: 16,
            marginBottom: 16,
          }}
        />

        {/* Section 4: Budget progress bar */}
        {budgetAmount !== null && (
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: 'rgba(245, 244, 240, 0.55)',
                }}
              >
                {isRedacted ? (
                  <>
                    <RedactedNumber length={4} style={{ fontSize: 13 }} />
                    {' of '}
                    <RedactedNumber length={4} style={{ fontSize: 13 }} />
                  </>
                ) : (
                  `${currency}${totalSpend.toLocaleString('en-EU')} of ${currency}${budgetAmount.toLocaleString('en-EU')}`
                )}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 13,
                  color: '#F5F4F0',
                }}
              >
                {isRedacted ? (
                  <RedactedNumber length={2} style={{ fontSize: 13 }} />
                ) : (
                  `${Math.round(fillPercent)}% used`
                )}
              </Text>
            </View>

            {/* Track */}
            <View
              style={{
                height: 4,
                borderRadius: 999,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
              }}
            >
              {isRedacted ? (
                <View
                  style={{
                    height: 4,
                    borderRadius: 999,
                    width: '40%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                />
              ) : (
                <Animated.View
                  style={{
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: getFillColor(fillPercent),
                    width: fillAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              )}
            </View>
          </View>
        )}

        {/* Section 5: Context line */}
        {vsLastMonth !== null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <KasheAsterisk
              size={11}
              direction={isRedacted ? 'neutral' : vsLastMonth > 0 ? 'up' : vsLastMonth < 0 ? 'down' : 'neutral'}
            />
            {isRedacted ? (
              <RedactedNumber length={2} style={{ fontSize: 13 }} />
            ) : (
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#F5F4F0' }}>
                {Math.abs(vsLastMonth)}%
              </Text>
            )}
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(245, 244, 240, 0.35)' }}>
              vs last month
            </Text>
            {vs3MonthAvg !== null && (
              <>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(245, 244, 240, 0.35)' }}>
                  {'·'}
                </Text>
                <KasheAsterisk
                  size={11}
                  direction={isRedacted ? 'neutral' : vs3MonthAvg > 0 ? 'up' : vs3MonthAvg < 0 ? 'down' : 'neutral'}
                />
                {isRedacted ? (
                  <RedactedNumber length={2} style={{ fontSize: 13 }} />
                ) : (
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#F5F4F0' }}>
                    {Math.abs(vs3MonthAvg)}%
                  </Text>
                )}
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(245, 244, 240, 0.35)' }}>
                  vs 3-month avg
                </Text>
              </>
            )}
          </View>
        )}

      </View>
    </LinearGradient>
  );
}
