import { View, Text, StyleSheet } from 'react-native'
import KasheAsterisk from '../shared/KasheAsterisk'
import { useTheme } from '../../context/ThemeContext'
import { PortfolioHolding } from '../../types/portfolio'

interface Props {
  holding: PortfolioHolding
}

const MOCK_HOLDING_INSIGHTS: Partial<Record<string, {
  label: string
  headline: string
  body: string
  source: string
  hoursAgo: number
}>> = {
  in_mutual_fund: {
    label: 'FUND UPDATE',
    headline: 'PPFAS filed updated portfolio disclosure',
    body: 'Fund house increased allocation to US tech by 3.2% in February. Top 10 holdings unchanged. Expense ratio stable at 0.58%.',
    source: 'PPFAS Investor Letter',
    hoursAgo: 14,
  },
  eu_etf: {
    label: 'MARKET EVENT',
    headline: 'ECB holds rates — broad ETF impact limited',
    body: 'ECB held rates at 3.15% as expected. European equity ETFs saw modest inflows. VWRL exposure is geographically diversified.',
    source: 'ECB Announcement',
    hoursAgo: 6,
  },
  in_direct_equity: {
    label: 'EARNINGS',
    headline: 'Q3 results beat estimates by 4%',
    body: 'Revenue up 18% YoY, margins expanded 120bps. Management guided for continued growth in FY26. Analyst consensus positive.',
    source: 'NSE Filings',
    hoursAgo: 22,
  },
  employer_rsu: {
    label: 'COMPANY NEWS',
    headline: 'Q4 earnings call scheduled for next week',
    body: 'Management to address guidance revision and buyback programme. Analyst consensus: hold. RSU vesting schedule unaffected.',
    source: 'Company IR',
    hoursAgo: 31,
  },
}

export default function HoldingInsightCard({ holding }: Props) {
  const theme = useTheme()
  const insight = MOCK_HOLDING_INSIGHTS[holding.assetSubtype ?? '']
  if (!insight) return null

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <KasheAsterisk size={12} animated={false} direction="neutral" />
          <Text style={[styles.label, { color: theme.textDim }]}>{insight.label}</Text>
        </View>
        <Text style={[styles.meta, { color: theme.textDim }]}>
          {insight.source} · {insight.hoursAgo}h ago
        </Text>
      </View>

      {/* Headline */}
      <Text style={[styles.headline, { color: theme.textPrimary }]}>{insight.headline}</Text>

      {/* Body */}
      <Text style={[styles.body, { color: theme.textSecondary }]}>{insight.body}</Text>

      {/* Footer */}
      <Text style={[styles.footer, { color: theme.textDim }]}>
        Powered by Kāshe AI · Not financial advice
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  headline: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 8,
  },
})
