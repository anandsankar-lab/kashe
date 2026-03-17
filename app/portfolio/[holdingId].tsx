import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { formatCurrency } from '../../constants/formatters'
import { MOCK_PORTFOLIO_HOLDINGS, MOCK_PORTFOLIO_TOTALS } from '../../constants/mockData'
import MacronRule from '../../components/shared/MacronRule'
import KasheAsterisk from '../../components/shared/KasheAsterisk'
import BucketReassignSheet from '../../components/portfolio/BucketReassignSheet'
import HoldingPriceChart from '../../components/portfolio/HoldingPriceChart'
import HoldingInsightCard from '../../components/portfolio/HoldingInsightCard'
import LockedProjectionCard from '../../components/portfolio/LockedProjectionCard'
import ProtectionStatusCard from '../../components/portfolio/ProtectionStatusCard'
import { PortfolioHolding, BucketType, AssetSubtype } from '../../types/portfolio'
import { getAssetTypeLabel, getGeographyLabel } from '../../constants/displayLabels'

// ─── Projection rates (mirrors LockedProjectionCard) ─────────────────────────

const LOCKED_RATES: Partial<Record<AssetSubtype, number>> = {
  in_ppf: 0.071,
  in_epf: 0.082,
  in_fd: 0.065,
  in_nsc: 0.072,
  eu_pension: 0.05,
}

function computeProjectedValue(holding: PortfolioHolding): number | null {
  if (!holding.unlockDate || holding.assetSubtype === 'alternative_general') return null
  const rate = LOCKED_RATES[holding.assetSubtype] ?? 0.065
  const yearsToUnlock =
    (new Date(holding.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25)
  if (yearsToUnlock <= 0) return null
  return Math.round(holding.currentValue * Math.pow(1 + rate, yearsToUnlock))
}

function toUnlockLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function toPriceAgeLabel(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHrs = Math.round(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs} hr ago`
  const diffDays = Math.round(diffHrs / 24)
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
}

function toShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function buildNarrative(
  holding: PortfolioHolding,
  portfolioPct: string | null,
  lastUpdatedShort: string,
): string {
  if (holding.bucket === 'LOCKED') {
    const unlockLabel = holding.unlockDate ? toUnlockLabel(holding.unlockDate) : '?'
    const fv = computeProjectedValue(holding)
    if (fv !== null) {
      return `Locked until ${unlockLabel} · projected ${formatCurrency(fv, holding.currency)} at unlock`
    }
    return `Locked until ${unlockLabel}`
  }

  if (holding.isProtection === true) {
    const pct = portfolioPct ?? '—'
    return `Your emergency fund · ${pct}% of live portfolio`
  }

  if (holding.bucket === 'GROWTH') {
    const pct = portfolioPct ?? '—'
    const changePct = holding.dailyChangePercent
    if (changePct !== undefined && changePct !== 0) {
      const dir = changePct > 0 ? 'Up' : 'Down'
      return `${dir} ${Math.abs(changePct).toFixed(2)}% this month · ${pct}% of your portfolio`
    }
    return `${pct}% of your portfolio`
  }

  // STABILITY
  const pct = portfolioPct ?? '—'
  return `${pct}% of live portfolio · last updated ${lastUpdatedShort}`
}

// ─── Row data type ────────────────────────────────────────────────────────────

type RowData = { label: string; value: string; valueColor?: string }

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HoldingDetailScreen() {
  const { holdingId } = useLocalSearchParams<{ holdingId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const holding = MOCK_PORTFOLIO_HOLDINGS.find(h => h.id === holdingId)

  const [reassignSheet, setReassignSheet] = useState<{
    visible: boolean
    holding: PortfolioHolding | null
  }>({ visible: false, holding: null })

  if (!holding) {
    return (
      <View style={[styles.notFoundOuter, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
          Holding not found
        </Text>
      </View>
    )
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const dailyChangePercent = holding.dailyChangePercent
  const dailyChange =
    dailyChangePercent !== undefined
      ? (holding.currentValue * dailyChangePercent) / 100
      : undefined

  const changeSign: 'positive' | 'negative' | 'neutral' =
    dailyChangePercent === undefined || dailyChangePercent === 0
      ? 'neutral'
      : dailyChangePercent > 0
      ? 'positive'
      : 'negative'

  const asteriskDirection: 'up' | 'down' | 'neutral' =
    changeSign === 'positive' ? 'up' : changeSign === 'negative' ? 'down' : 'neutral'

  const portfolioPct =
    holding.bucket !== 'LOCKED'
      ? ((holding.currentValue / MOCK_PORTFOLIO_TOTALS.liveTotal) * 100).toFixed(1)
      : null

  const gain =
    holding.purchasePrice !== undefined
      ? holding.currentValue - holding.purchasePrice
      : undefined

  const pricePerUnit =
    holding.quantity !== undefined && holding.quantity > 0
      ? holding.currentValue / holding.quantity
      : undefined

  const lastUpdatedShort = toShortDate(holding.lastUpdated)
  const priceAgeLabel = toPriceAgeLabel(holding.lastUpdated)
  const narrative = buildNarrative(holding, portfolioPct, lastUpdatedShort)

  // ── Hero change pill ────────────────────────────────────────────────────────

  const changePillBg =
    changeSign === 'positive'
      ? 'rgba(200,240,74,0.12)'
      : changeSign === 'negative'
      ? 'rgba(255,92,92,0.10)'
      : 'rgba(255,255,255,0.08)'

  const changeTextColour =
    changeSign === 'positive'
      ? colours.accent
      : changeSign === 'negative'
      ? colours.heroDanger
      : colours.heroTextSecondary

  const changeLabel: string | undefined =
    dailyChange !== undefined && dailyChangePercent !== undefined
      ? `${changeSign === 'positive' ? '+' : changeSign === 'negative' ? '−' : ''}${formatCurrency(Math.abs(dailyChange), holding.currency)} (${Math.abs(dailyChangePercent).toFixed(2)}%)`
      : undefined

  // ── Bucket pill (hero top-right) ────────────────────────────────────────────

  const bucketPillBg =
    holding.bucket === 'GROWTH'
      ? 'rgba(200,240,74,0.15)'
      : holding.bucket === 'STABILITY'
      ? 'rgba(255,181,71,0.15)'
      : 'rgba(196,196,191,0.15)'

  const bucketPillText =
    holding.bucket === 'GROWTH'
      ? colours.accent
      : holding.bucket === 'STABILITY'
      ? colours.warning
      : colours.heroTextDim

  // ── Purpose row colour bar ──────────────────────────────────────────────────

  const bucketBarColor =
    holding.bucket === 'GROWTH'
      ? colours.accent
      : holding.bucket === 'STABILITY'
      ? colours.warning
      : theme.textDim

  // ── Detail row arrays ───────────────────────────────────────────────────────

  const group1Rows: RowData[] = []
  if (holding.quantity !== undefined) {
    group1Rows.push({ label: 'Units held', value: holding.quantity.toString() })
  }
  if (pricePerUnit !== undefined) {
    group1Rows.push({ label: 'Price per unit', value: formatCurrency(pricePerUnit, holding.currency) })
  }
  if (holding.purchasePrice !== undefined) {
    group1Rows.push({ label: 'Purchase price', value: formatCurrency(holding.purchasePrice, holding.currency) })
  }
  if (gain !== undefined) {
    group1Rows.push({
      label: gain >= 0 ? 'Unrealised gain' : 'Unrealised loss',
      value: formatCurrency(Math.abs(gain), holding.currency),
      valueColor: gain >= 0 ? colours.accent : colours.danger,
    })
  }

  const group2Rows: RowData[] = [
    { label: 'Asset type', value: getAssetTypeLabel(holding.assetSubtype) },
    { label: 'Geography', value: getGeographyLabel(holding.geography) },
  ]
  if (holding.taxWrapper !== undefined && holding.taxWrapper !== 'none') {
    group2Rows.push({ label: 'Tax wrapper', value: holding.taxWrapper })
  }
  group2Rows.push({ label: 'Data source', value: 'Manual' })

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      {/* Sticky header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.backChevron, { color: theme.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerName, { color: theme.textPrimary }]} numberOfLines={1}>
          {holding.name}
        </Text>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SECTION 1: Hero ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={[colours.heroGradientStart, colours.heroGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Top row: name + bucket pill */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroHoldingName} numberOfLines={1}>
              {holding.name}
            </Text>
            <View style={[styles.bucketPill, { backgroundColor: bucketPillBg }]}>
              <Text style={[styles.bucketPillText, { color: bucketPillText }]}>
                {holding.bucket}
              </Text>
            </View>
          </View>

          {/* Current value */}
          <Text style={styles.heroValue}>
            {formatCurrency(holding.currentValue, holding.currency)}
          </Text>

          {/* Daily change pill */}
          {changeLabel !== undefined && (
            <View style={[styles.changePill, { backgroundColor: changePillBg }]}>
              <KasheAsterisk size={12} direction={asteriskDirection} animated={false} />
              <Text style={[styles.changePillText, { color: changeTextColour }]}>
                {changeLabel}
              </Text>
            </View>
          )}

          {/* Narrative */}
          <Text style={styles.heroNarrative}>{narrative}</Text>

          {/* Price age */}
          <Text style={styles.heroPriceAge}>Prices updated {priceAgeLabel}</Text>
        </LinearGradient>

        {/* ── SECTION 2: Chart + Insight ──────────────────────────────────── */}
        <HoldingPriceChart holding={holding} currency={holding.currency ?? 'EUR'} />

        {holding.bucket !== 'LOCKED' && (
          <HoldingInsightCard holding={holding} />
        )}

        {/* ── SECTION 3: Details ──────────────────────────────────────────── */}

        {/* Group 1: Financial details (only if any row exists) */}
        {group1Rows.length > 0 && (
          <View style={styles.detailGroup}>
            {group1Rows.map((row, i) => (
              <View key={row.label}>
                {i > 0 && <MacronRule style={[styles.detailRule, { backgroundColor: theme.border }]} />}
                <DetailRow
                  label={row.label}
                  value={row.value}
                  valueColor={row.valueColor}
                />
              </View>
            ))}
          </View>
        )}

        {/* Group 2: About */}
        <View style={styles.aboutGroup}>
          <Text style={[styles.sectionLabel, { color: theme.textDim }]}>ABOUT</Text>
          {group2Rows.map((row, i) => (
            <View key={row.label}>
              {i > 0 && <MacronRule style={[styles.detailRule, { backgroundColor: theme.border }]} />}
              <DetailRow
                label={row.label}
                value={row.value}
                valueColor={row.valueColor}
              />
            </View>
          ))}
        </View>

        {/* Purpose bucket row */}
        <TouchableOpacity
          style={[styles.purposeRow, { backgroundColor: theme.surface }]}
          onPress={() => setReassignSheet({ visible: true, holding })}
          activeOpacity={0.7}
        >
          <View>
            <Text style={[styles.purposeLabel, { color: theme.textDim }]}>PURPOSE</Text>
            <Text style={[styles.purposeBucketName, { color: theme.textPrimary }]}>
              {holding.bucket}
            </Text>
          </View>
          <View style={styles.purposeRight}>
            <View style={[styles.bucketBar, { backgroundColor: bucketBarColor }]} />
            <Text style={[styles.purposeChevron, { color: theme.textDim }]}>›</Text>
          </View>
        </TouchableOpacity>

        {/* ── Locked + Protection cards ────────────────────────────────────── */}
        {holding.bucket === 'LOCKED' && holding.unlockDate !== undefined && (
          <LockedProjectionCard holding={holding} />
        )}

        {holding.isProtection === true && (
          <ProtectionStatusCard holding={holding} avgMonthlySpend={2847} />
        )}

        {/* ── SECTION 4: Actions ──────────────────────────────────────────── */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => console.log('Edit holding:', holding.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.editButtonText, { color: theme.textPrimary }]}>
              Edit holding
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeRow}
            onPress={() => console.log('Remove holding:', holding.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.removeText, { color: colours.danger }]}>Remove holding</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BucketReassignSheet
        holding={reassignSheet.holding}
        isVisible={reassignSheet.visible}
        onClose={() => setReassignSheet({ visible: false, holding: null })}
        onConfirm={(hId: string, newBucket: BucketType) => {
          console.log('Reassign:', hId, '->', newBucket)
          setReassignSheet({ visible: false, holding: null })
        }}
      />
    </View>
  )
}

// ─── Detail row helper ────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  const theme = useTheme()
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: valueColor ?? theme.textPrimary }]}>
        {value}
      </Text>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  notFoundOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backChevron: {
    fontSize: 24,
    marginRight: 12,
    lineHeight: 28,
  },
  headerName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    letterSpacing: -0.5,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroCard: {
    borderRadius: 24,
    padding: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroHoldingName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: colours.heroTextSecondary,
    flex: 1,
    marginRight: 8,
  },
  bucketPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  bucketPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  heroValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 44,
    letterSpacing: -1.5,
    color: colours.heroTextPrimary,
    marginTop: 16,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
    gap: 6,
  },
  changePillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  heroNarrative: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colours.heroTextSecondary,
    marginTop: 12,
  },
  heroPriceAge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colours.heroTextDim,
    marginTop: 8,
  },

  // ── Details ───────────────────────────────────────────────────────────────
  detailGroup: {
    marginTop: 24,
  },
  aboutGroup: {
    marginTop: 24,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  detailRule: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  detailLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  detailValue: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },

  // ── Purpose bucket row ────────────────────────────────────────────────────
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
  },
  purposeLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  purposeBucketName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    marginTop: 2,
  },
  purposeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bucketBar: {
    width: 6,
    height: 20,
    borderRadius: 3,
  },
  purposeChevron: {
    fontSize: 18,
    marginLeft: 8,
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  actionsGroup: {
    marginTop: 32,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  removeRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  removeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
})
