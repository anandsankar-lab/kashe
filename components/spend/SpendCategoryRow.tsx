import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { router } from 'expo-router';
import colours from '../../constants/colours';
import MacronRule from '../shared/MacronRule';
import RedactedNumber from '../shared/RedactedNumber';
import CategoryIcon from './CategoryIcon';
import { SpendCategoryData } from '../../types/spend';

interface Props {
  category: SpendCategoryData;
  onPress: () => void;
  isRedacted?: boolean;
}

function computeBarFill(
  category: SpendCategoryData,
  isRedacted: boolean,
  border: string
): { fillPercent: number; fillColor: string } {
  if (isRedacted) {
    return {
      fillPercent: 0.4,
      fillColor: border,
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
  function handlePress() {
    onPress();
    router.push(`/spend/${category.id}`);
  }
  const theme = useTheme();
  const barAnim = useRef(new Animated.Value(0)).current;

  const variant = category.isMortgage
    ? 'mortgage'
    : category.insightLine !== null
    ? 'insight'
    : 'standard';

  const { fillPercent, fillColor } = computeBarFill(category, isRedacted, theme.border);

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

  const trackColor = theme.border;
  const nameColor =
    variant === 'mortgage' ? theme.textSecondary : theme.textPrimary;
  const amountColor =
    variant === 'mortgage' ? theme.textSecondary : theme.textPrimary;
  const insightColor =
    variant === 'mortgage' ? theme.textDim : theme.textSecondary;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={Platform.OS === 'web' ? ({ outline: 'none' } as object) : undefined}
    >
      {/* Row content */}
      <View style={styles.rowContent}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <CategoryIcon categoryId={category.id} size={22} color={theme.textSecondary} />
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
          <Text style={[styles.chevron, { color: theme.textDim }]}>›</Text>
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
  iconWrapper: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginLeft: 6,
  },
  insightLineContainer: {
    paddingLeft: 58, // 20px row padding + 22px icon + 16px gap
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
