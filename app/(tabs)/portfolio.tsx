import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/context/ThemeContext'
import Typography from '@/constants/typography'
import { borderRadius } from '@/constants/spacing'
import colours from '../../constants/colours'
import AppHeader from '@/components/shared/AppHeader'
import PortfolioTotalsCard from '@/components/portfolio/PortfolioTotalsCard'
import PortfolioSectionHeader from '@/components/portfolio/PortfolioSectionHeader'
import PortfolioHoldingRow from '@/components/portfolio/PortfolioHoldingRow'
import PortfolioInsightStrip from '@/components/portfolio/PortfolioInsightStrip'
import InvestmentPlanCard from '../../components/portfolio/InvestmentPlanCard'
import InstrumentSuggestionSheet from '../../components/portfolio/InstrumentSuggestionSheet'
import KasheAsterisk from '../../components/shared/KasheAsterisk'
import { MOCK_PORTFOLIO_TOTALS, MOCK_INVESTMENT_PLAN, MOCK_PORTFOLIO_HOLDINGS } from '@/constants/mockData'
import { BucketType } from '../../types/portfolio'

const growthTotal = MOCK_PORTFOLIO_HOLDINGS
  .filter(h => h.bucket === 'GROWTH')
  .reduce((sum, h) => sum + h.currentValue, 0);

const stabilityTotal = MOCK_PORTFOLIO_HOLDINGS
  .filter(h => h.bucket === 'STABILITY')
  .reduce((sum, h) => sum + h.currentValue, 0);

const lockedTotal = MOCK_PORTFOLIO_HOLDINGS
  .filter(h => h.bucket === 'LOCKED')
  .reduce((sum, h) => sum + h.currentValue, 0);

const MOCK_PORTFOLIO_INSIGHT = {
  id: 'mock-insight-1',
  headline: 'Employer stock above 15% of portfolio',
  body: 'Your employer stock is 18% of your live portfolio. Consider diversifying to reduce concentration risk.',
}

function DotsButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme()
  return (
    <TouchableOpacity
      style={{
        width: 36,
        height: 36,
        borderRadius: borderRadius.pill,
        backgroundColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Text style={[Typography.bodyMedium, { color: theme.textSecondary, fontSize: 14, letterSpacing: 1, lineHeight: 18 }]}>
        ···
      </Text>
    </TouchableOpacity>
  )
}

function PlusButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme()
  return (
    <TouchableOpacity
      style={{
        width: 36,
        height: 36,
        borderRadius: borderRadius.pill,
        backgroundColor: theme.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Text style={[Typography.heading, { fontSize: 20, color: theme.textOnAccent, lineHeight: 24 }]}>
        +
      </Text>
    </TouchableOpacity>
  )
}

export default function PortfolioScreen() {
  const theme = useTheme()
  const router = useRouter()
  const hasData = true  // toggle to false to preview empty state
  const [activeInsight, setActiveInsight] = useState<typeof MOCK_PORTFOLIO_INSIGHT | null>(MOCK_PORTFOLIO_INSIGHT)
  const [suggestionSheet, setSuggestionSheet] = useState<{ visible: boolean; bucket: BucketType }>({
    visible: false,
    bucket: 'GROWTH',
  })

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppHeader
        title="Portfolio"
        showGreeting={false}
        onAvatarPress={() => {}}
        avatarInitial="A"
        rightActions={
          <>
            <DotsButton onPress={() => {}} />
            <PlusButton onPress={() => {}} />
          </>
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ opacity: hasData ? 1 : 0.5 }}>
          <View style={styles.totalsCardWrapper}>
            <PortfolioTotalsCard
              totals={MOCK_PORTFOLIO_TOTALS}
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
            <PortfolioHoldingRow
              id="h3"
              variant="live"
              name="Parag Parikh Flexi Cap"
              assetType="Mutual Fund"
              value={54200}
              currency="€"
              bucket="GROWTH"
              geography="India"
              allocationPct={0.33}
              dailyMovementPct={2.3}
              freshnessStatus="green"
              isRedacted={!hasData}
              onPress={(id) => router.push(`/portfolio/${id}`)}
            />
            <PortfolioSectionHeader
              label="STABILITY"
              total={stabilityTotal}
              currency="€"
              isRedacted={!hasData}
            />
            <PortfolioHoldingRow
              id="h4"
              variant="protection"
              name="Current Account"
              assetType="Cash"
              value={8400}
              currency="€"
              bucket="STABILITY"
              geography="Europe"
              allocationPct={0.05}
              monthsCovered={2.8}
              freshnessStatus="amber"
              isRedacted={!hasData}
              onPress={(id) => router.push(`/portfolio/${id}`)}
            />
            <PortfolioSectionHeader
              label="LOCKED"
              total={lockedTotal}
              currency="€"
              isEmpty={false}
              isRedacted={!hasData}
              onAddPress={() => console.log('Add locked holding pressed')}
            />
            <PortfolioHoldingRow
              id="h6"
              variant="locked"
              name="PPF Account"
              assetType="Provident Fund"
              value={420000}
              currency="₹"
              bucket="LOCKED"
              geography="India"
              allocationPct={0.29}
              unlockDate="Mar 2031"
              freshnessStatus="red"
              isRedacted={!hasData}
              onPress={(id) => router.push(`/portfolio/${id}`)}
            />
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
