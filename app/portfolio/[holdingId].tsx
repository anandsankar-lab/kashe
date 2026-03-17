import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
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
import { PortfolioHolding, BucketType } from '../../types/portfolio'
import { getAssetTypeLabel, getGeographyLabel } from '../../constants/displayLabels'

export default function HoldingDetailScreen() {
  const { holdingId } = useLocalSearchParams<{ holdingId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const holding = MOCK_PORTFOLIO_HOLDINGS.find(h => h.id === holdingId)

  const [reassignSheet, setReassignSheet] = useState<{
    visible: boolean;
    holding: PortfolioHolding | null;
  }>({ visible: false, holding: null })

  if (!holding) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: theme.textSecondary }}>
          Holding not found
        </Text>
      </View>
    )
  }

  // Derived values
  const dailyChangePercent = holding.dailyChangePercent
  const dailyChange = dailyChangePercent !== undefined
    ? (holding.currentValue * dailyChangePercent) / 100
    : undefined

  const changeColor =
    dailyChangePercent === undefined || dailyChangePercent === 0
      ? theme.textDim
      : dailyChangePercent > 0 ? colours.accent : colours.danger

  const asteriskDirection: 'up' | 'down' | 'neutral' =
    dailyChangePercent === undefined || dailyChangePercent === 0
      ? 'neutral'
      : dailyChangePercent > 0 ? 'up' : 'down'

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

  const lastUpdatedDisplay = new Date(holding.lastUpdated).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header — sticky */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.backChevron, { color: theme.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerName, { color: theme.textPrimary }]} numberOfLines={1}>
          {holding.name}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero value */}
        <Text style={[styles.heroValue, { color: theme.textPrimary }]}>
          {formatCurrency(holding.currentValue, holding.currency)}
        </Text>

        {/* Daily change row */}
        {dailyChange !== undefined && dailyChangePercent !== undefined && (
          <View style={styles.changeRow}>
            <KasheAsterisk direction={asteriskDirection} size={14} animated={false} />
            <Text style={[styles.changeText, { color: changeColor }]}>
              {formatCurrency(Math.abs(dailyChange), holding.currency)} ({Math.abs(dailyChangePercent).toFixed(2)}%)
            </Text>
          </View>
        )}

        {/* Portfolio allocation */}
        {portfolioPct !== null && (
          <Text style={[styles.allocationText, { color: theme.textSecondary }]}>
            {portfolioPct}% of live portfolio
          </Text>
        )}

        <HoldingPriceChart holding={holding} currency={holding.currency ?? 'EUR'} />

        {holding.bucket !== 'LOCKED' && (
          <HoldingInsightCard holding={holding} />
        )}

        <MacronRule style={{ marginTop: 16 }} />

        {/* Details rows */}
        <View style={{ marginTop: 4 }}>
          {holding.quantity !== undefined && (
            <DetailRow label="Units / Quantity" value={holding.quantity.toString()} theme={theme} />
          )}
          {pricePerUnit !== undefined && (
            <DetailRow
              label="Price per unit"
              value={formatCurrency(pricePerUnit, holding.currency)}
              theme={theme}
            />
          )}
          {holding.purchasePrice !== undefined && (
            <DetailRow
              label="Purchase price"
              value={formatCurrency(holding.purchasePrice, holding.currency)}
              theme={theme}
            />
          )}
          {gain !== undefined && (
            <DetailRow
              label={gain >= 0 ? 'Unrealised gain' : 'Unrealised loss'}
              value={formatCurrency(Math.abs(gain), holding.currency)}
              valueColor={gain >= 0 ? colours.accent : colours.danger}
              theme={theme}
            />
          )}
          <DetailRow label="Asset type" value={getAssetTypeLabel(holding.assetSubtype ?? holding.assetType ?? '')} theme={theme} />
          <DetailRow label="Geography" value={getGeographyLabel(holding.geography ?? '')} theme={theme} />
          {holding.taxWrapper !== undefined && holding.taxWrapper !== 'none' && (
            <DetailRow label="Tax wrapper" value={holding.taxWrapper} theme={theme} />
          )}
          <DetailRow label="Data source" value="Manual" theme={theme} />
          <DetailRow label="Last updated" value={lastUpdatedDisplay} theme={theme} />
        </View>

        <MacronRule style={{ marginTop: 8 }} />

        {/* Purpose bucket row */}
        <View style={styles.bucketRow}>
          <Text style={[styles.bucketLabel, { color: theme.textSecondary }]}>Purpose bucket</Text>
          <TouchableOpacity
            style={styles.bucketRight}
            onPress={() => setReassignSheet({ visible: true, holding })}
            activeOpacity={0.7}
          >
            <Text style={[styles.bucketName, { color: theme.textPrimary }]}>
              {holding.bucket}
            </Text>
            <Text style={[styles.bucketChevron, { color: theme.textDim }]}>›</Text>
          </TouchableOpacity>
        </View>

        <MacronRule style={{ marginTop: 8 }} />

        {/* Conditional cards */}
        {holding.bucket === 'LOCKED' && holding.unlockDate !== undefined && (
          <LockedProjectionCard holding={holding} />
        )}

        {holding.isProtection === true && (
          <ProtectionStatusCard holding={holding} avgMonthlySpend={2847} />
        )}

        {/* Action buttons */}
        <View style={{ marginTop: 24 }}>
          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: theme.border }]}
            onPress={() => console.log('Edit holding:', holding.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.outlineButtonText, { color: theme.textPrimary }]}>
              Edit holding
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: theme.border, marginTop: 0 }]}
            onPress={() => setReassignSheet({ visible: true, holding })}
            activeOpacity={0.7}
          >
            <Text style={[styles.outlineButtonText, { color: theme.textPrimary }]}>
              Reassign bucket
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 8 }}
            onPress={() => console.log('Remove holding:', holding.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.removeLink, { color: colours.danger }]}>Remove holding</Text>
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
  theme,
}: {
  label: string
  value: string
  valueColor?: string
  theme: ReturnType<typeof useTheme>
}) {
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 36,
    letterSpacing: -1.5,
    marginTop: 20,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginLeft: 6,
  },
  allocationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  detailValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  bucketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  bucketLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  bucketRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bucketName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  bucketChevron: {
    fontSize: 18,
    marginLeft: 4,
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  removeLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
})
