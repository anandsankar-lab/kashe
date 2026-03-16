import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Path } from 'react-native-svg';
import colours from '../../constants/colours';
import { SpendTransaction } from '../../types/spend';

const PencilIcon = ({ size = 13, color = '#C4C4BF' }: { size?: number; color?: string }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

interface Props {
  transaction: SpendTransaction;
  onPress: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onLongPress?: () => void;
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

function formatAmount(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('en-EU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (currency === 'EUR') return `€${formatted}`;
  if (currency === 'INR') return `₹${formatted}`;
  if (currency === 'USD') return `$${formatted}`;
  if (currency === 'GBP') return `£${formatted}`;
  return `${currency} ${formatted}`;
}

export default function SpendTransactionRow({
  transaction,
  onPress,
  isSelected = false,
  isSelectionMode = false,
  onLongPress,
}: Props) {
  const theme = useTheme();
  const surfaceColor = theme.surface;
  const borderColor = theme.border;

  const tags = transaction.tags ?? [];
  const hasTags = tags.length > 0;
  const hasFx = (transaction.fxRateApplied ?? null) !== null;
  const showDotBeforeFx = !hasTags && hasFx;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[styles.row, { backgroundColor: surfaceColor }]}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? colours.accent : 'transparent',
              borderColor: isSelected ? colours.accent : borderColor,
            },
          ]}
        >
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}

      {/* Main content */}
      <View style={styles.content}>
        {/* Row 1: merchant + amount */}
        <View style={styles.topRow}>
          <Text
            style={[styles.merchant, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {transaction.merchant}
          </Text>
          <Text style={[styles.amount, { color: theme.textPrimary }]}>
            {formatAmount(transaction.amount, transaction.currency)}
          </Text>
        </View>

        {/* Row 2: date + tags + fx */}
        <View style={styles.bottomRow}>
          <Text style={[styles.date, { color: theme.textDim }]}>
            {formatDate(transaction.date)}
          </Text>

          {hasTags && (
            <View style={[styles.dot, { backgroundColor: theme.textDim }]} />
          )}

          {tags.map((tag) => (
            <View key={tag} style={[styles.tagPill, { backgroundColor: borderColor }]}>
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                {tag}
              </Text>
            </View>
          ))}

          {hasFx && (
            <>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: theme.textDim, marginLeft: showDotBeforeFx ? 0 : 0 },
                ]}
              />
              <Text style={[styles.fxLabel, { color: theme.textDim }]}>converted</Text>
            </>
          )}
        </View>
      </View>

      {/* Recurring indicator */}
      {transaction.isRecurring && (
        <Text style={[styles.recurringIcon, { color: theme.textDim }]}>↻</Text>
      )}

      {/* Edit affordance — signal, not a button */}
      {!isSelectionMode && (
        <View style={styles.pencilContainer} pointerEvents="none">
          <PencilIcon size={13} color={theme.textDim} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colours.textOnAccent,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchant: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.5,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
    flexWrap: 'wrap',
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  fxLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  recurringIcon: {
    fontSize: 12,
    marginLeft: 8,
  },
  pencilContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
