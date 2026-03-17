import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Line } from 'react-native-svg'
import KasheAsterisk from '../shared/KasheAsterisk'
import MacronRule from '../shared/MacronRule'
import RedactedNumber from '../shared/RedactedNumber'
import colours from '../../constants/colours'
import { PortfolioTotals } from '../../types/portfolio'

interface PortfolioTotalsCardProps {
  totals: PortfolioTotals
  isRedacted?: boolean
}

function formatAmount(value: number, currency: string): string {
  const symbol =
    currency === 'EUR' ? '€'
    : currency === 'INR' ? '₹'
    : currency === 'USD' ? '$'
    : currency === 'GBP' ? '£'
    : currency
  return symbol + Math.round(value).toLocaleString('en-US')
}

function formatLastRefreshed(isoString: string): string {
  const then = new Date(isoString).getTime()
  const now = Date.now()
  const diffMin = Math.floor((now - then) / 60_000)
  const diffHrs = Math.floor(diffMin / 60)
  if (diffMin < 1) return 'Prices updated just now'
  if (diffMin < 60) return `Prices updated ${diffMin} min ago`
  if (diffHrs < 24) return `Prices updated ${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `Prices updated ${diffDays}d ago`
}

function DeltaIndicator({ value, currency }: { value: number; currency: string }) {
  const isPositive = value >= 0
  const color = isPositive ? colours.accent : colours.heroDanger
  const direction: 'up' | 'down' = isPositive ? 'up' : 'down'
  return (
    <View style={styles.deltaRow}>
      <KasheAsterisk size={11} direction={direction} animated={false} />
      <Text style={[styles.deltaText, { color }]}>
        {' '}{formatAmount(Math.abs(value), currency)} this month
      </Text>
    </View>
  )
}

export default function PortfolioTotalsCard({ totals, isRedacted = false }: PortfolioTotalsCardProps) {
  const { liveTotal, lockedTotal, combinedTotal, monthlyDeltaLive, baseCurrency, lastRefreshed } = totals

  return (
    <LinearGradient
      colors={[colours.heroGradientStart, colours.heroGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Background asterisk watermark */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -45,
          right: -45,
          width: 200,
          height: 200,
          opacity: 0.07,
          zIndex: 0,
        }}
      >
        <Svg width={200} height={200}>
          <Line x1={100} y1={8} x2={100} y2={192} stroke="#C8F04A" strokeWidth={14} strokeLinecap="round" />
          <Line x1={22} y1={52} x2={178} y2={148} stroke="#C8F04A" strokeWidth={14} strokeLinecap="round" />
          <Line x1={22} y1={148} x2={178} y2={52} stroke="#C8F04A" strokeWidth={14} strokeLinecap="round" />
        </Svg>
      </View>

      <View style={{ padding: 24, zIndex: 1 }}>
      {/* Two-column totals */}
      <View style={styles.columnsRow}>
        {/* Live column */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>LIVE</Text>
          {isRedacted
            ? <RedactedNumber style={{ fontSize: 32 }} length={6} />
            : <Text style={styles.columnValue}>{formatAmount(liveTotal, baseCurrency)}</Text>
          }
        </View>

        {/* Vertical divider */}
        <View style={styles.verticalDivider} />

        {/* Locked column */}
        <View style={styles.column}>
          <Text style={styles.columnLabel}>LOCKED</Text>
          {isRedacted
            ? <RedactedNumber style={{ fontSize: 32 }} length={6} />
            : <Text style={styles.columnValue}>{formatAmount(lockedTotal, baseCurrency)}</Text>
          }
        </View>
      </View>

      {/* Horizontal rule */}
      <MacronRule style={styles.rule} />

      {/* Combined total */}
      {isRedacted
        ? <RedactedNumber style={{ fontSize: 14 }} length={8} />
        : (
          <Text style={styles.combinedText}>
            <Text style={styles.combinedAmount}>{formatAmount(combinedTotal, baseCurrency)}</Text>
            {' across all holdings'}
          </Text>
        )
      }

      {/* Monthly delta */}
      <View style={styles.deltaContainer}>
        {isRedacted
          ? <RedactedNumber style={{ fontSize: 14 }} length={7} />
          : <DeltaIndicator value={monthlyDeltaLive} currency={baseCurrency} />
        }
      </View>

      {/* Freshness */}
      <Text style={styles.freshness}>{formatLastRefreshed(lastRefreshed)}</Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 0,
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colours.heroTextSecondary,
    marginBottom: 6,
  },
  columnValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    letterSpacing: -1.5,
    color: colours.heroTextPrimary,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 20,
    marginTop: 4,
    alignSelf: 'stretch',
  },
  rule: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginTop: 16,
    marginBottom: 12,
  },
  combinedText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colours.heroTextSecondary,
  },
  combinedAmount: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colours.heroTextPrimary,
  },
  deltaContainer: {
    marginTop: 6,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deltaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  freshness: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colours.heroTextDim,
    marginTop: 12,
  },
})
