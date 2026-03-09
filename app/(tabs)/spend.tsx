import { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import SpendScreenHeader from '../../components/spend/SpendScreenHeader';
import SpendHeroCard from '../../components/spend/SpendHeroCard';
import SpendCategoryList from '../../components/spend/SpendCategoryList';
import { SpendCategory } from '../../types/spend';

const mockCategories: SpendCategory[] = [
  {
    id: 'eating_out',
    name: 'Eating out',
    icon: '🍽️',
    amount: 340,
    currency: '€',
    budgetAmount: 300,
    totalMonthSpend: 2847,
    anomalyScore: 1.70,
    hasHistory: true,
    vsAverage: 34,
    topMerchants: ['Thuisbezorgd', 'Uber Eats'],
    isMortgage: false,
    isExcluded: false,
    isRecurring: false,
    insightLine: null,
    ownership: 'personal',
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: '🏠',
    amount: 1840,
    currency: '€',
    budgetAmount: null,
    totalMonthSpend: 2847,
    anomalyScore: 1.0,
    hasHistory: true,
    vsAverage: 0,
    topMerchants: [],
    isMortgage: true,
    isExcluded: false,
    isRecurring: true,
    insightLine: 'incl. €1,650 mortgage — tracked as liability',
    ownership: 'personal',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: '🛒',
    amount: 280,
    currency: '€',
    budgetAmount: 350,
    totalMonthSpend: 2847,
    anomalyScore: 0.95,
    hasHistory: true,
    vsAverage: -5,
    topMerchants: ['Albert Heijn', 'Jumbo'],
    isMortgage: false,
    isExcluded: false,
    isRecurring: false,
    insightLine: null,
    ownership: 'household',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: '📱',
    amount: 95,
    currency: '€',
    budgetAmount: null,
    totalMonthSpend: 2847,
    anomalyScore: 1.22,
    hasHistory: true,
    vsAverage: 22,
    topMerchants: ['Netflix', 'Spotify'],
    isMortgage: false,
    isExcluded: false,
    isRecurring: true,
    insightLine: null,
    ownership: 'personal',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚆',
    amount: 180,
    currency: '€',
    budgetAmount: null,
    totalMonthSpend: 2847,
    anomalyScore: 0.82,
    hasHistory: true,
    vsAverage: -18,
    topMerchants: ['NS', 'GVB'],
    isMortgage: false,
    isExcluded: false,
    isRecurring: false,
    insightLine: null,
    ownership: 'personal',
  },
  {
    id: 'health',
    name: 'Health',
    icon: '🏥',
    amount: 145,
    currency: '€',
    budgetAmount: null,
    totalMonthSpend: 2847,
    anomalyScore: 1.0,
    hasHistory: false,
    vsAverage: null,
    topMerchants: ['Apotheek'],
    isMortgage: false,
    isExcluded: false,
    isRecurring: false,
    insightLine: null,
    ownership: 'personal',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    amount: 89,
    currency: '€',
    budgetAmount: null,
    totalMonthSpend: 2847,
    anomalyScore: 0.9,
    hasHistory: true,
    vsAverage: -10,
    topMerchants: ['Bol.com'],
    isMortgage: false,
    isExcluded: false,
    isRecurring: false,
    insightLine: null,
    ownership: 'personal',
  },
  {
    id: 'investment_transfer',
    name: 'Investments',
    icon: '📈',
    amount: 1500,
    currency: '€',
    budgetAmount: null,
    totalMonthSpend: 2847,
    anomalyScore: 1.0,
    hasHistory: true,
    vsAverage: 0,
    topMerchants: ['DeGiro', 'CAMS'],
    isMortgage: false,
    isExcluded: true,
    isRecurring: true,
    insightLine: null,
    ownership: 'personal',
  },
  {
    id: 'transfer',
    name: 'Transfers',
    icon: '💸',
    amount: 500,
    currency: '€',
    budgetAmount: null,
    totalMonthSpend: 2847,
    anomalyScore: 1.0,
    hasHistory: true,
    vsAverage: 0,
    topMerchants: ['HDFC Remittance'],
    isMortgage: false,
    isExcluded: true,
    isRecurring: false,
    insightLine: null,
    ownership: 'personal',
  },
];

export default function SpendScreen() {
  const isDark = useColorScheme() === 'dark';
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [profileFilter, setProfileFilter] = useState<'household' | string>('household');

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
        <SpendHeroCard
          totalSpend={2847}
          currency="€"
          budgetAmount={4500}
          vsLastMonth={12}
          vs3MonthAvg={8}
          hasMultiCurrency={true}
          selectedMonth={selectedMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          canGoNext={canGoNext}
          isRedacted={false}
        />
        <SpendCategoryList
          categories={mockCategories}
          onCategoryPress={(id) => console.log('Category pressed:', id)}
          isRedacted={false}
          profileFilter={profileFilter}
        />
        <Text style={[styles.transfersPlaceholder, { color: colours.textDim }]}>
          SPEND-04 coming soon
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
  transfersPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
