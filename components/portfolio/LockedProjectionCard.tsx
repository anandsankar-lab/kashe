import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { PortfolioHolding, AssetSubtype } from '../../types/portfolio'
import { formatCurrency } from '../../constants/formatters'

interface Props {
  holding: PortfolioHolding
}

const PROJECTION_RATES: Partial<Record<AssetSubtype, number | null>> = {
  in_ppf: 0.071,
  in_epf: 0.082,
  in_fd: 0.065,
  in_nsc: 0.072,
  eu_pension: 0.05,
  alternative_general: null,
}

const RATE_LABELS: Partial<Record<AssetSubtype, string>> = {
  in_ppf: 'PPF',
  in_epf: 'EPF',
  in_fd: 'fixed deposit',
  in_nsc: 'NSC',
  eu_pension: 'pension fund',
}

export default function LockedProjectionCard({ holding }: Props) {
  const theme = useTheme()

  const isAlternative = holding.assetSubtype === 'alternative_general'

  const rateEntry = PROJECTION_RATES[holding.assetSubtype]
  const rate: number = (rateEntry === undefined || rateEntry === null) ? 0.065 : rateEntry
  const label = RATE_LABELS[holding.assetSubtype] ?? 'fixed deposit'

  let projectedValue = 0
  let unlockDisplay = ''

  if (!isAlternative && holding.unlockDate) {
    const now = new Date()
    const unlock = new Date(holding.unlockDate)
    const yearsToUnlock =
      (unlock.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    projectedValue = Math.round(holding.currentValue * Math.pow(1 + rate, yearsToUnlock))
    unlockDisplay = unlock.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  }

  return (
    <View style={[styles.outer, { backgroundColor: theme.surface }]}>
      <Text style={styles.header}>🔒 Projected at unlock</Text>

      {isAlternative ? (
        <>
          <Text style={styles.lastKnown}>
            Last known valuation: {formatCurrency(holding.currentValue, holding.currency)}
          </Text>
          <Text style={styles.illiquid}>Illiquid alternative — outcome uncertain</Text>
        </>
      ) : (
        <>
          <Text style={[styles.projectedValue, { color: colours.accent }]}>
            {formatCurrency(projectedValue, holding.currency)}
          </Text>
          <Text style={styles.rateSource}>
            at {(rate * 100).toFixed(1)}% {label} rate (current)
          </Text>
          <Text style={styles.unlockDate}>Unlocks {unlockDisplay}</Text>
          <Text style={styles.disclaimer}>Projection only — actual returns may vary</Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  header: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colours.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  projectedValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  rateSource: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colours.textSecondary,
    marginTop: 4,
  },
  unlockDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colours.textSecondary,
    marginTop: 2,
  },
  disclaimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colours.textDim,
    marginTop: 8,
  },
  lastKnown: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colours.textSecondary,
  },
  illiquid: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colours.textDim,
    marginTop: 4,
  },
})
