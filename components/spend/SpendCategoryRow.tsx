import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import colours from '../../constants/colours';
import MacronRule from '../shared/MacronRule';
import RedactedNumber from '../shared/RedactedNumber';
import { SpendCategory } from '../../types/spend';

interface Props {
  category: SpendCategory;
  onPress: () => void;
  isRedacted?: boolean;
}

function computeBarFill(
  category: SpendCategory,
  isRedacted: boolean,
  isDark: boolean
): { fillPercent: number; fillColor: string } {
  if (isRedacted) {
    return {
      fillPercent: 0.4,
      fillColor: isDark ? colours.borderDark : colours.border,
    };
  }

  const { amount, budgetAmount, totalMonthSpend } = category;

  if (budgetAmount === null) {
    return {
      fillPercent: totalMonthSpend > 0 ? Math.min(amount / totalMonthSpend, 1) : 0,
      fillColor: colours.accent,
    };
  }

  if (amount < budgetAmount * 0.8) {
    return {
      fillPercent: budgetAmount > 0 ? Math.min(amount / budgetAmount, 1) : 0,
      fillColor: colours.accent,
    };
  }

  if (amount < budgetAmount) {
    return {
      fillPercent: budgetAmount > 0 ? Math.min(amount / budgetAmount, 1) : 1,
      fillColor: colours.warning,
    };
  }

  return { fillPercent: 1, fillColor: colours.danger };
}

export default function SpendCategoryRow({
  category,
  onPress,
  isRedacted = false,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const barAnim = useRef(new Animated.Value(0)).current;

  const variant = category.isMortgage
    ? 'mortgage'
    : category.insightLine !== null
    ? 'insight'
    : 'standard';

  const { fillPercent, fillColor } = computeBarFill(category, isRedacted, isDark);

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: fillPercent,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRedacted]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const trackColor = isDark ? colours.borderDark : colours.border;
  const nameColor =
    variant === 'mortgage' ? colours.textSecondary : colours.textPrimary;
  const amountColor =
    variant === 'mortgage' ? colours.textSecondary : colours.textPrimary;
  const insightColor =
    variant === 'mortgage' ? colours.textDim : colours.textSecondary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {/* Row content */}
      <View style={styles.rowContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{category.icon}</Text>
        </View>

        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={[styles.categoryName, { color: nameColor }]}>
            {category.name}
          </Text>
        </View>

        {/* Amount + chevron */}
        <View style={styles.amountContainer}>
          {isRedacted && variant === 'mortgage' ? (
            <RedactedNumber length={5} style={styles.amountText} />
          ) : (
            <Text style={[styles.amountText, { color: amountColor }]}>
              {category.currency}
              {category.amount.toLocaleString()}
            </Text>
          )}
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>

      {/* Insight line */}
      {(variant === 'insight' || variant === 'mortgage') &&
        category.insightLine !== null && (
          <View style={styles.insightLineContainer}>
            {isRedacted ? (
              <RedactedNumber
                length={8}
                style={[styles.insightLinePlaceholder]}
              />
            ) : (
              <Text style={[styles.insightLineText, { color: insightColor }]}>
                {category.insightLine}
              </Text>
            )}
          </View>
        )}

      {/* Proportion bar or MacronRule */}
      {variant === 'mortgage' ? (
        <MacronRule
          style={{
            marginHorizontal: 20,
            marginBottom: 4,
            backgroundColor: colours.heroBorder,
          }}
        />
      ) : (
        <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
          <Animated.View
            style={[styles.barFill, { width: barWidth, backgroundColor: fillColor }]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 240, 74, 0.12)', // colours.accent at 12% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  nameContainer: {
    flex: 1,
  },
  categoryName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.5,
  },
  chevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: colours.textDim,
    marginLeft: 6,
  },
  insightLineContainer: {
    paddingLeft: 68, // 20px row padding + 36px icon + 12px gap
    paddingRight: 20,
    marginTop: 4,
    marginBottom: 6,
  },
  insightLineText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: -0.1,
  },
  insightLinePlaceholder: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  barTrack: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 2,
    height: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
});
