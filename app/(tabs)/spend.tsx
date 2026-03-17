import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AppHeader from '../../components/shared/AppHeader';
import SpendHeroCard from '../../components/spend/SpendHeroCard';
import SpendInsightStrip from '../../components/spend/SpendInsightStrip';
import SpendCategoryList from '../../components/spend/SpendCategoryList';
import SpendBudgetSheet from '../../components/spend/SpendBudgetSheet';
import EmptyState from '../../components/shared/EmptyState';
import DataSourceSheet from '../../components/shared/DataSourceSheet';
import { SpendCategoryData, AppDataState } from '../../types/spend';
import { MOCK_APP_STATE } from '../../constants/mockData';
import { useDataSources } from '../../hooks/useDataSources';

const mockCategories: SpendCategoryData[] = [
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
    ownership: 'joint',
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
];

const MOCK_TRANSFERS: SpendCategoryData[] = [
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
    name: 'Family remittance',
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
  const theme = useTheme();
  const [appState] = useState<AppDataState>(MOCK_APP_STATE);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [profileFilter] = useState<'household' | string>('household');
  const [showBudgetSheet, setShowBudgetSheet] = useState(false);
  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [insightDismissed, setInsightDismissed] = useState(false);

  const { sources } = useDataSources();
  const hasData = appState === 'HAS_DATA';

  const hasStaleData = sources.some(
    (s) => s.type === 'SPEND' && s.status !== 'FRESH'
  );

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

  function handleDotsPress() {
    if (hasStaleData) {
      setShowSourceSheet(true);
    } else {
      setShowBudgetSheet(true);
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <AppHeader
        title="Spend"
        showAvatar={true}
        avatarInitial="A"
        showOverflow={true}
        showAdd={true}
        onAdd={() => console.log('add')}
        onOverflow={() => console.log('overflow')}
        onAvatar={() => console.log('avatar')}
      />

      <EmptyState
        isVisible={!hasData}
        headline="See where your money goes"
        ctaLabel="+ Upload bank statement"
        secondaryLabel="Add manually instead"
        onCta={() => console.log('Upload pressed')}
        onSecondary={() => console.log('Manual pressed')}
        invitationHeadline="Your spending, clearly"
        invitationDescription="Upload a bank statement and Kāshe categorises everything automatically. Your data never leaves your device."
        invitationCtaLabel="+ Upload bank statement"
        invitationSecondaryLabel="Add manually instead"
      >
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
            isRedacted={!hasData}
          />
          <SpendInsightStrip
            insight={insightDismissed || !hasData ? null : {
              headline: 'Eating out jumped this month',
              body: 'You spent €340 on eating out — 34% above your 3-month average of €254. Mostly Thuisbezorgd and Uber Eats.',
              categoryId: 'eating_out',
            }}
            onDismiss={() => setInsightDismissed(true)}
            onPress={() => console.log('Insight pressed')}
            isRedacted={false}
          />
          <SpendCategoryList
            categories={mockCategories}
            transferCategories={MOCK_TRANSFERS}
            onCategoryPress={(id) => console.log('Category pressed:', id)}
            isRedacted={!hasData}
            profileFilter={profileFilter}
          />
        </ScrollView>
      </EmptyState>

      <SpendBudgetSheet
        isVisible={showBudgetSheet}
        onClose={() => setShowBudgetSheet(false)}
        categories={mockCategories}
        onSave={(budgets) => console.log('Budgets saved:', budgets)}
      />

      <DataSourceSheet
        isVisible={showSourceSheet}
        onClose={() => setShowSourceSheet(false)}
        sources={sources.filter((s) => s.type === 'SPEND')}
        onRequestUpload={(id) => console.log('Request upload', id)}
      />
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
});
