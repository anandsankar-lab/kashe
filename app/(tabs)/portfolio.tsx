import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/context/ThemeContext'
import colours from '../../constants/colours'
import AppHeader from '@/components/shared/AppHeader'
import PortfolioTotalsCard from '@/components/portfolio/PortfolioTotalsCard'
import PortfolioSectionHeader from '@/components/portfolio/PortfolioSectionHeader'
import PortfolioHoldingRow from '@/components/portfolio/PortfolioHoldingRow'
import PortfolioInsightStrip from '@/components/portfolio/PortfolioInsightStrip'
import InvestmentPlanCard from '../../components/portfolio/InvestmentPlanCard'
import InstrumentSuggestionSheet from '../../components/portfolio/InstrumentSuggestionSheet'
import KasheAsterisk from '../../components/shared/KasheAsterisk'
import { MOCK_PORTFOLIO_TOTALS, MOCK_INVESTMENT_PLAN } from '@/constants/mockData'
import { BucketType, PortfolioHolding } from '../../types/portfolio'
import usePortfolio from '../../hooks/usePortfolio'

const ASSET_TYPE_LABEL: Partial<Record<string, string>> = {
  eu_etf: 'ETF',
  eu_direct_equity: 'Stock',
  eu_pension: 'Pension',
  eu_savings: 'Savings',
  employer_rsu: 'RSU',
  employer_espp: 'ESPP',
  cash_general: 'Cash',
  us_401k: '401(k)',
  us_roth_ira: 'Roth IRA',
  us_ira: 'IRA',
  us_brokerage: 'Brokerage',
  alternative_general: 'Alternative',
  in_mutual_fund: 'Mutual Fund',
  in_ppf: 'Provident Fund',
  in_epf: 'Provident Fund',
  in_direct_equity: 'Stock',
  in_nre_nro: 'Savings',
  in_fd: 'Fixed Deposit',
  crypto_general: 'Crypto',
};

function holdingVariant(h: PortfolioHolding): 'live' | 'locked' | 'protection' {
  if (h.bucket === 'LOCKED') return 'locked';
  if (h.isProtection) return 'protection';
  return 'live';
}

function holdingFreshness(s: string): 'green' | 'amber' | 'red' {
  if (s === 'fresh') return 'green';
  if (s === 'stale') return 'red';
  return 'amber';
}

function holdingUnlockDate(date?: string): string | undefined {
  if (!date) return undefined;
  return new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

const MOCK_PORTFOLIO_INSIGHT = {
  id: 'mock-insight-1',
  headline: 'Employer stock above 15% of portfolio',
  body: 'Your employer stock is 18% of your live portfolio. Consider diversifying to reduce concentration risk.',
}


export default function PortfolioScreen() {
  const theme = useTheme()
  const router = useRouter()
  const [activeInsight, setActiveInsight] = useState<typeof MOCK_PORTFOLIO_INSIGHT | null>(MOCK_PORTFOLIO_INSIGHT)
  const [suggestionSheet, setSuggestionSheet] = useState<{ visible: boolean; bucket: BucketType }>({
    visible: false,
    bucket: 'GROWTH',
  })

  const {
    holdings,
    liveTotal,
    lockedTotal,
    financialPosition,
    allocationByBucket,
    protectionAsset,
    protectionMonthsCovered,
    savingsRate,
  } = usePortfolio()

  const hasData = holdings.length > 0

  const growthTotal = holdings
    .filter(h => h.bucket === 'GROWTH')
    .reduce((sum, h) => sum + h.currentValue, 0)
  const stabilityTotal = holdings
    .filter(h => h.bucket === 'STABILITY')
    .reduce((sum, h) => sum + h.currentValue, 0)
  const totalPortfolioValue = financialPosition

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppHeader
        title="Portfolio"
        showAvatar={true}
        avatarInitial="A"
        showOverflow={true}
        showAdd={true}
        onAdd={() => console.log('add')}
        onOverflow={() => console.log('overflow')}
        onAvatar={() => console.log('avatar')}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ opacity: hasData ? 1 : 0.5 }}>
          <View style={styles.totalsCardWrapper}>
            <PortfolioTotalsCard
              totals={{ ...MOCK_PORTFOLIO_TOTALS, liveTotal, lockedTotal, combinedTotal: financialPosition }}
              isRedacted={!hasData}
            />
          </View>

          <PortfolioInsightStrip
            insight={hasData ? activeInsight : null}
            onDismiss={() => setActiveInsight(null)}
            onPress={() => console.log('Portfolio insight tapped — InsightDetailSheet to come')}
          />

          <InvestmentPlanCard
            plan={MOCK_INVESTMENT_PLAN}
            onSaveTarget={(target) => console.log('Save target:', target)}
            onExploreOptions={(bucket) => setSuggestionSheet({ visible: true, bucket })}
            isRedacted={!hasData}
          />

          <View>
            <PortfolioSectionHeader
              label="GROWTH"
              total={growthTotal}
              currency="€"
              isRedacted={!hasData}
            />
            {holdings.filter(h => h.bucket === 'GROWTH').map(h => (
              <PortfolioHoldingRow
                key={h.id}
                id={h.id}
                variant={holdingVariant(h)}
                name={h.name}
                assetType={ASSET_TYPE_LABEL[h.assetSubtype] ?? h.assetSubtype}
                value={h.currentValue}
                currency={h.currency === 'EUR' ? '€' : h.currency}
                bucket={h.bucket}
                geography={h.geography}
                domicile={h.domicile}
                allocationPct={totalPortfolioValue > 0 ? h.currentValue / totalPortfolioValue : 0}
                dailyMovementPct={h.dailyChangePercent}
                freshnessStatus={holdingFreshness(h.freshnessStatus)}
                isRedacted={!hasData}
                onPress={(id) => router.push(`/portfolio/${id}`)}
              />
            ))}
            <PortfolioSectionHeader
              label="STABILITY"
              total={stabilityTotal}
              currency="€"
              isRedacted={!hasData}
            />
            {holdings.filter(h => h.bucket === 'STABILITY').map(h => (
              <PortfolioHoldingRow
                key={h.id}
                id={h.id}
                variant={holdingVariant(h)}
                name={h.name}
                assetType={ASSET_TYPE_LABEL[h.assetSubtype] ?? h.assetSubtype}
                value={h.currentValue}
                currency={h.currency === 'EUR' ? '€' : h.currency}
                bucket={h.bucket}
                geography={h.geography}
                domicile={h.domicile}
                allocationPct={totalPortfolioValue > 0 ? h.currentValue / totalPortfolioValue : 0}
                dailyMovementPct={h.dailyChangePercent}
                freshnessStatus={holdingFreshness(h.freshnessStatus)}
                monthsCovered={h.avgMonthlySpend ? h.currentValue / h.avgMonthlySpend : undefined}
                isRedacted={!hasData}
                onPress={(id) => router.push(`/portfolio/${id}`)}
              />
            ))}
            <PortfolioSectionHeader
              label="LOCKED"
              total={lockedTotal}
              currency="€"
              isEmpty={false}
              isRedacted={!hasData}
              onAddPress={() => console.log('Add locked holding pressed')}
            />
            {holdings.filter(h => h.bucket === 'LOCKED').map(h => (
              <PortfolioHoldingRow
                key={h.id}
                id={h.id}
                variant={holdingVariant(h)}
                name={h.name}
                assetType={ASSET_TYPE_LABEL[h.assetSubtype] ?? h.assetSubtype}
                value={h.currentValue}
                currency={h.currency === 'EUR' ? '€' : h.currency}
                bucket={h.bucket}
                geography={h.geography}
                domicile={h.domicile}
                allocationPct={totalPortfolioValue > 0 ? h.currentValue / totalPortfolioValue : 0}
                freshnessStatus={holdingFreshness(h.freshnessStatus)}
                unlockDate={holdingUnlockDate(h.unlockDate)}
                isRedacted={!hasData}
                onPress={(id) => router.push(`/portfolio/${id}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {!hasData && (
        <View style={styles.emptyPill}>
          <TouchableOpacity
            style={[styles.pillButton, { backgroundColor: colours.accent }]}
            onPress={() => console.log('Open invitation sheet')}
            activeOpacity={0.85}
          >
            <KasheAsterisk size={14} animated={false} direction="neutral" />
            <Text style={styles.pillText}>  Connect your data</Text>
          </TouchableOpacity>
        </View>
      )}

      <InstrumentSuggestionSheet
        isVisible={suggestionSheet.visible}
        bucket={suggestionSheet.bucket}
        onClose={() => setSuggestionSheet(prev => ({ ...prev, visible: false }))}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  totalsCardWrapper: {
    marginBottom: 0,
  },
  emptyPill: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pillText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: colours.textOnAccent,
  },
})
