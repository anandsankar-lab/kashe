import { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import SpendScreenHeader from '../../components/spend/SpendScreenHeader';
import SpendSummaryStrip from '../../components/spend/SpendSummaryStrip';

export default function SpendScreen() {
  const isDark = useColorScheme() === 'dark';
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const currentMonth = new Date();
  const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const canGoNext = selectedMonth < currentMonthStart;

  function handlePreviousMonth() {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    if (!canGoNext) return;
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colours.backgroundDark : colours.background },
      ]}
    >
      <SpendScreenHeader
        selectedMonth={selectedMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        canGoNext={canGoNext}
        onAddPress={() => {}}
        onBudgetsPress={() => {}}
        notificationDot={null}
        onAvatarPress={() => console.log('Avatar pressed')}
        avatarInitial="A"
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SpendSummaryStrip
          totalSpend={2847}
          currency="€"
          vsLastMonth={12}
          vs3MonthAvg={8}
          budgetAmount={4500}
          hasMultiCurrency={true}
          isRedacted={false}
        />
        <Text style={[styles.placeholder, { color: isDark ? colours.textDim : colours.textDim }]}>
          More coming soon...
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  placeholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    paddingHorizontal: 20,
  },
});
