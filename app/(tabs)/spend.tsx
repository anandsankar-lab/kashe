import { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import SpendScreenHeader from '../../components/spend/SpendScreenHeader';

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
