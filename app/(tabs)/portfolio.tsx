import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import Typography from '@/constants/typography'
import Spacing, { borderRadius } from '@/constants/spacing'
import AppHeader from '@/components/shared/AppHeader'
import PortfolioTotalsCard from '@/components/portfolio/PortfolioTotalsCard'
import PortfolioSectionHeader from '@/components/portfolio/PortfolioSectionHeader'
import PortfolioHoldingRow from '@/components/portfolio/PortfolioHoldingRow'
import { MOCK_PORTFOLIO_TOTALS } from '@/constants/mockData'

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

        <View style={{ marginTop: 24, paddingHorizontal: 0 }}>
          <PortfolioSectionHeader
            label="GROWTH"
            total={198400}
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
            total={65200}
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
            total={48200}
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
    </View>
  )
}
