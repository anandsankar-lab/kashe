import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colours from '../../constants/colours';

interface SpendScreenHeaderProps {
  selectedMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  canGoNext: boolean;
  onAddPress: () => void;
  onBudgetsPress: () => void;
  notificationDot?: 'amber' | 'red' | null;
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function SpendScreenHeader({
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  canGoNext,
  onAddPress,
  onBudgetsPress,
  notificationDot,
}: SpendScreenHeaderProps) {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const overflowBg = isDark ? colours.borderDark : colours.border;
  const chevronColor = isDark ? colours.textSecondary : colours.textSecondary;
  const chevronDisabledColor = colours.textDim;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Row 1 — Title + action buttons */}
      <View style={styles.row1}>
        <Text style={styles.title}>Spend</Text>

        <View style={styles.actions}>
          {/* Overflow / budgets button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: overflowBg }]}
            onPress={onBudgetsPress}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[styles.overflowDots, { color: colours.textSecondary }]}>···</Text>
          </TouchableOpacity>

          {/* Add button with optional notification dot */}
          <View>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colours.accent }]}
              onPress={onAddPress}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.addPlus}>+</Text>
            </TouchableOpacity>

            {notificationDot != null && (
              <View
                style={[
                  styles.notificationDot,
                  {
                    backgroundColor:
                      notificationDot === 'red' ? colours.danger : colours.warning,
                  },
                ]}
              />
            )}
          </View>
        </View>
      </View>

      {/* Row 2 — Month selector */}
      <View style={styles.row2}>
        <TouchableOpacity
          onPress={onPreviousMonth}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.chevron, { color: chevronColor }]}>‹</Text>
        </TouchableOpacity>

        <Text style={[styles.monthLabel, { color: colours.textPrimary }]}>
          {formatMonth(selectedMonth)}
        </Text>

        <TouchableOpacity
          onPress={onNextMonth}
          activeOpacity={canGoNext ? 0.6 : 1}
          disabled={!canGoNext}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.chevron, { color: canGoNext ? chevronColor : chevronDisabledColor }]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    letterSpacing: -0.8,
    color: colours.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    outlineStyle: 'none',
    borderWidth: 0,
  },
  overflowDots: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 1,
    lineHeight: 18,
  },
  addPlus: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    color: '#1A1A18',
    lineHeight: 24,
    textAlign: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  chevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 22,
    lineHeight: 26,
  },
  monthLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
});
