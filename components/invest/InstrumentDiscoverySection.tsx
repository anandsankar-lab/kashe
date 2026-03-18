import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import {
  getInstrumentsByTierAndBucket,
  TER_FOOTNOTE,
} from '../../constants/instrumentCatalogue'
import type { InstrumentCatalogueEntry, RiskTier } from '../../types/instrumentCatalogue'
import type { PortfolioHolding } from '../../types/portfolio'
import type { RiskProfileType } from '../../types/riskProfile'
import { RISK_PROFILES } from '../../types/riskProfile'
import KasheAsterisk from '../shared/KasheAsterisk'

interface Props {
  riskProfile: RiskProfileType
  holdings: PortfolioHolding[]
  geography?: string
}

type BucketKey = 'growth' | 'stability' | 'locked'

function getRiskColour(
  riskTier: RiskTier,
  themeBorder: string,
  themeTextDim: string,
): { bg: string; text: string } {
  switch (riskTier) {
    case 'very_low':
    case 'low':
    case 'medium_low':
    case 'medium':
    case 'capital_guaranteed':
      return { bg: 'rgba(200,240,74,0.12)', text: colours.accent }
    case 'medium_high':
      return { bg: 'rgba(255,181,71,0.15)', text: colours.warning }
    case 'high':
      return { bg: 'rgba(255,92,92,0.12)', text: colours.danger }
    case 'very_high':
    case 'illiquid':
      return { bg: 'rgba(255,92,92,0.2)', text: colours.danger }
    case 'unknown':
    default:
      return { bg: themeBorder, text: themeTextDim }
  }
}

function formatRiskLabel(riskTier: string): string {
  return riskTier.charAt(0).toUpperCase() + riskTier.slice(1).replace(/_/g, ' ')
}

function truncateName(name: string, max: number): string {
  return name.length > max ? name.slice(0, max) + '…' : name
}

export default function InstrumentDiscoverySection({
  riskProfile,
  holdings,
  geography,
}: Props) {
  const theme = useTheme()

  const profile = RISK_PROFILES[riskProfile]
  const targets = profile.targetAllocation
  const current = { growth: 59, stability: 12, locked: 29 }
  const gaps: Record<BucketKey, number> = {
    growth: targets.growth - current.growth,
    stability: targets.stability - current.stability,
    locked: targets.locked - current.locked,
  }

  const bucketKey: BucketKey = (
    (Object.entries(gaps) as [BucketKey, number][])
      .filter(([, gap]) => gap > 5)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'growth'
  )

  const bucketLabel = bucketKey.toUpperCase() as 'GROWTH' | 'STABILITY' | 'LOCKED'
  const gapPercent = gaps[bucketKey]

  const hasGrowthHoldings = holdings.some(h => h.bucket === 'GROWTH')
  const hasGlobalETF = holdings.some(
    h => h.assetSubtype === 'eu_etf' || h.assetSubtype === 'us_brokerage',
  )
  const tier = !hasGrowthHoldings ? 0 : hasGlobalETF ? 1 : 0

  const resolvedGeography = geography ?? 'NL'
  const suggestions = getInstrumentsByTierAndBucket(bucketLabel, tier, resolvedGeography).slice(0, 3)

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerLabel, { color: theme.textDim }]}>
            WORTH EXPLORING
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {`For your ${bucketLabel} gap`}
          </Text>
        </View>
        <View style={styles.gapPill}>
          <Text style={styles.gapPillText}>
            {`${gapPercent}% below target`}
          </Text>
        </View>
      </View>

      {suggestions.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Building suggestions for your geography...
        </Text>
      ) : (
        <>
          {suggestions.map((entry: InstrumentCatalogueEntry, index: number) => {
            const riskColour = getRiskColour(entry.riskTier, theme.border, theme.textDim)
            const isLast = index === suggestions.length - 1
            return (
              <View
                key={entry.id}
                style={[
                  styles.instrumentCard,
                  { borderColor: theme.border },
                  !isLast && styles.instrumentCardMargin,
                ]}
              >
                {/* Row 1 — Name + ticker */}
                <View style={styles.nameRow}>
                  <Text
                    style={[styles.instrumentName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {truncateName(entry.name, 28)}
                  </Text>
                  {entry.ticker != null && (
                    <View style={[styles.tickerBadge, { backgroundColor: theme.border }]}>
                      <Text style={[styles.tickerText, { color: theme.textSecondary }]}>
                        {entry.ticker}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Row 2 — Description */}
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  {entry.description}
                </Text>

                {/* Row 3 — Why */}
                <View style={styles.whyRow}>
                  <KasheAsterisk size={10} animated={false} />
                  <Text style={styles.whyText} numberOfLines={2}>{entry.why}</Text>
                </View>

                {/* Row 4 — Meta row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaLeft}>
                    {entry.expenseRatio != null && (
                      <Text style={[styles.metaText, { color: theme.textDim }]}>
                        {`TER ${entry.expenseRatio}`}
                      </Text>
                    )}
                    <Text style={[styles.metaText, { color: theme.textDim }]}>
                      {entry.regulatoryRegime}
                    </Text>
                  </View>
                  <View style={[styles.riskPill, { backgroundColor: riskColour.bg }]}>
                    <Text style={[styles.riskPillText, { color: riskColour.text }]}>
                      {formatRiskLabel(entry.riskTier)}
                    </Text>
                  </View>
                </View>

                {/* Risk warning */}
                {entry.riskWarning != null && (
                  <Text style={styles.riskWarning}>{entry.riskWarning}</Text>
                )}

                {/* TER footnote */}
                {entry.terFootnote && (
                  <Text style={[styles.terFootnote, { color: theme.textDim }]}>
                    {'* ' + TER_FOOTNOTE}
                  </Text>
                )}
              </View>
            )
          })}

          <TouchableOpacity onPress={() => console.log('explore more')}>
            <Text style={styles.exploreMore}>Explore more options →</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  gapPill: {
    backgroundColor: 'rgba(200,240,74,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  gapPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colours.accent,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  instrumentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  instrumentCardMargin: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instrumentName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    flex: 1,
  },
  tickerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tickerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
  whyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colours.accent,
    flex: 1,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  metaLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  riskPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  riskWarning: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colours.danger,
    marginTop: 8,
  },
  terFootnote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 4,
  },
  exploreMore: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colours.accent,
    textAlign: 'center',
    paddingTop: 12,
  },
})
