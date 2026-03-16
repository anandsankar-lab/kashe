import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import Typography from '@/constants/typography'
import Spacing, { borderRadius } from '@/constants/spacing'
import AppHeader from '@/components/shared/AppHeader'
import PortfolioTotalsCard from '@/components/portfolio/PortfolioTotalsCard'
import PortfolioSectionHeader from '@/components/portfolio/PortfolioSectionHeader'
import PortfolioHoldingRow from '@/components/portfolio/PortfolioHoldingRow'
import PortfolioInsightStrip from '@/components/portfolio/PortfolioInsightStrip'
import InvestmentPlanCard from '../../components/portfolio/InvestmentPlanCard'
import InstrumentSuggestionSheet from '../../components/portfolio/InstrumentSuggestionSheet'
import BucketReassignSheet from '../../components/portfolio/BucketReassignSheet'
import { MOCK_PORTFOLIO_TOTALS, MOCK_INVESTMENT_PLAN, MOCK_PORTFOLIO_HOLDINGS } from '@/constants/mockData'
import { BucketType, PortfolioHolding } from '../../types/portfolio'
import colours from '../../constants/colours'

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
  const [activeInsight, setActiveInsight] = useState<typeof MOCK_PORTFOLIO_INSIGHT | null>(MOCK_PORTFOLIO_INSIGHT)
  const [suggestionSheet, setSuggestionSheet] = useState<{ visible: boolean; bucket: BucketType }>({
    visible: false,
    bucket: 'GROWTH',
  })
  const [reassignSheet, setReassignSheet] = useState<{
    visible: boolean;
    holding: PortfolioHolding | null;
  }>({ visible: false, holding: null })

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
        contentContainerStyle={{ padding: Spacing.lg }}
      >
        <PortfolioTotalsCard
          totals={MOCK_PORTFOLIO_TOTALS}
          isRedacted={false}
        />

        <TouchableOpacity
          style={{ marginHorizontal: 20, marginTop: 12, padding: 12, backgroundColor: theme.surface, borderRadius: 8, alignItems: 'center' }}
          onPress={() => setReassignSheet({ visible: true, holding: MOCK_PORTFOLIO_HOLDINGS[0] })}
        >
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colours.textSecondary }}>
            [TEST] Open BucketReassignSheet
          </Text>
        </TouchableOpacity>

        <PortfolioInsightStrip
          insight={activeInsight}
          onDismiss={() => setActiveInsight(null)}
          onPress={() => console.log('Portfolio insight tapped — InsightDetailSheet to come')}
        />

        <InvestmentPlanCard
          plan={MOCK_INVESTMENT_PLAN}
          onSaveTarget={(target) => console.log('Save target:', target)}
          onExploreOptions={(bucket) => setSuggestionSheet({ visible: true, bucket })}
          isRedacted={false}
        />

        <View style={{ marginTop: 24, paddingHorizontal: 0 }}>
          <PortfolioSectionHeader
            label="GROWTH"
            total={growthTotal}
            currency="€"
            isRedacted={false}
          />
          <PortfolioHoldingRow
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
          />
          <View style={{ marginBottom: 16 }} />
          <PortfolioSectionHeader
            label="STABILITY"
            total={stabilityTotal}
            currency="€"
            isRedacted={false}
          />
          <PortfolioHoldingRow
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
          />
          <View style={{ marginBottom: 16 }} />
          <PortfolioSectionHeader
            label="LOCKED"
            total={lockedTotal}
            currency="€"
            isEmpty={false}
            onAddPress={() => console.log('Add locked holding pressed')}
          />
          <PortfolioHoldingRow
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
          />
        </View>
      </ScrollView>

      <InstrumentSuggestionSheet
        isVisible={suggestionSheet.visible}
        bucket={suggestionSheet.bucket}
        onClose={() => setSuggestionSheet(prev => ({ ...prev, visible: false }))}
      />

      <BucketReassignSheet
        holding={reassignSheet.holding}
        isVisible={reassignSheet.visible}
        onClose={() => setReassignSheet({ visible: false, holding: null })}
        onConfirm={(holdingId, newBucket) => {
          console.log('Reassign:', holdingId, '->', newBucket);
          setReassignSheet({ visible: false, holding: null });
        }}
      />
    </View>
  )
}
