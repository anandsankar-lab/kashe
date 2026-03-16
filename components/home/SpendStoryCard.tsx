import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import colours from '../../constants/colours';
import { useTheme } from '../../context/ThemeContext';
import Card from '../ui/Card';
import KasheAsterisk from '../shared/KasheAsterisk';
import RedactedNumber from '../shared/RedactedNumber';

interface TopInsight {
  categoryName: string;
  vsAverage: number;
  topMerchant: string | null;
}

interface Props {
  totalSpend: number;
  currency: string;
  vsAverage: number | null;
  investedAmount: number | null;
  investmentTarget: number | null;
  topInsight: TopInsight | null;
  onSpendPress: () => void;
  onInvestPress: () => void;
  isRedacted?: boolean;
}

export default function SpendStoryCard({
  totalSpend,
  currency,
  vsAverage,
  investedAmount,
  investmentTarget,
  topInsight,
  onSpendPress,
  onInvestPress,
  isRedacted = false,
}: Props) {
  const theme = useTheme();
  const spendFontSize = 22;

  const asteriskDirection =
    vsAverage === null ? 'neutral' : vsAverage > 0 ? 'up' : 'down';

  const dotColor =
    investmentTarget === null
      ? theme.textDim
      : investedAmount !== null && investedAmount >= investmentTarget
      ? colours.accent
      : colours.warning;

  let investStatusText: React.ReactNode = null;
  if (investmentTarget !== null && investedAmount !== null) {
    if (investedAmount >= investmentTarget) {
      investStatusText = (
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: colours.accent,
          }}
        >
          ✓ on track
        </Text>
      );
    } else {
      const gap = investmentTarget - investedAmount;
      investStatusText = (
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: colours.warning,
          }}
        >
          {'↓ €'}
          {isRedacted ? <RedactedNumber length={3} style={{ fontSize: 13 }} /> : gap.toLocaleString()}
          {' short'}
        </Text>
      );
    }
  }

  let insightString: string | null = null;
  if (topInsight !== null) {
    insightString = `${topInsight.categoryName} up ${topInsight.vsAverage}%`;
    if (topInsight.topMerchant) {
      insightString += ` — mostly ${topInsight.topMerchant}`;
    }
  }

  return (
    <Card style={{ marginHorizontal: 20, marginTop: 8 }}>
      {/* Label */}
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: theme.textDim,
          marginBottom: 14,
        }}
      >
        This month
      </Text>

      {/* LINE 1: Spend */}
      <TouchableOpacity
        onPress={onSpendPress}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <KasheAsterisk size={12} direction={asteriskDirection} />
          {isRedacted ? (
            <RedactedNumber
              length={5}
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: spendFontSize,
                letterSpacing: -1,
              }}
            />
          ) : (
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: spendFontSize,
                letterSpacing: -1,
                color: theme.textPrimary,
              }}
            >
              {`${currency}${totalSpend.toLocaleString()}`}
            </Text>
          )}
        </View>

        {vsAverage !== null && (
          <View>
            {isRedacted ? (
              <RedactedNumber
                length={4}
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                }}
              />
            ) : (
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: theme.textSecondary,
                }}
              >
                {`${vsAverage > 0 ? '+' : '\u2212'}${Math.abs(vsAverage)}% vs avg`}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* LINE 2: Invested */}
      {investedAmount !== null && (
        <TouchableOpacity
          onPress={onInvestPress}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: dotColor,
              }}
            />
            {isRedacted ? (
              <RedactedNumber
                length={4}
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 15,
                  letterSpacing: -0.3,
                }}
              />
            ) : (
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 15,
                  letterSpacing: -0.3,
                  color: theme.textPrimary,
                }}
              >
                {`€${investedAmount.toLocaleString()} invested`}
              </Text>
            )}
          </View>

          {investStatusText}
        </TouchableOpacity>
      )}

      {/* MacronRule divider */}
      {topInsight !== null && (
        <View
          style={{
            height: 1,
            backgroundColor: 'rgba(200, 240, 74, 0.15)',
            marginBottom: 12,
          }}
        />
      )}

      {/* LINE 3: Top insight */}
      {topInsight !== null && insightString !== null && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text
            style={{
              fontSize: 13,
              marginRight: 8,
              marginTop: 1,
              color: theme.textSecondary,
            }}
          >
            ⚡
          </Text>
          {isRedacted ? (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: theme.textSecondary,
                  letterSpacing: -0.2,
                }}
              >
                {topInsight.categoryName}
                {' up '}
                <RedactedNumber length={2} style={{ fontSize: 13 }} />
                {topInsight.topMerchant ? ` — mostly ${topInsight.topMerchant}` : ''}
              </Text>
            </View>
          ) : (
            <Text
              style={{
                flex: 1,
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: theme.textSecondary,
                letterSpacing: -0.2,
              }}
            >
              {insightString}
            </Text>
          )}
        </View>
      )}
    </Card>
  );
}
