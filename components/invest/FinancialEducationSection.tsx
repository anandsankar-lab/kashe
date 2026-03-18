import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import type { RiskProfileType } from '../../types/riskProfile'
import type { PortfolioHolding } from '../../types/portfolio'

// ─── Article type ───────────────────────────────────────────

interface Article {
  id: string
  tier: 0 | 1
  bucket: 'GROWTH' | 'STABILITY'
  title: string
  tagline: string
  body: string
  bullets: [string, string, string]
  readMoreSources: string[]
}

// ─── Hardcoded content ──────────────────────────────────────

const ARTICLES: Article[] = [
  {
    id: 'what_is_etf',
    tier: 0,
    bucket: 'GROWTH',
    title: 'What is an ETF?',
    tagline: 'The building block of modern investing',
    body: 'An ETF (Exchange-Traded Fund) holds a basket of assets — stocks, bonds, or both — and trades on an exchange like a single share. You get instant diversification without picking individual companies.',
    bullets: [
      'One purchase = exposure to hundreds of companies',
      'Costs are a fraction of actively managed funds',
      'Buy and sell any time the market is open',
    ],
    readMoreSources: ['Investopedia', 'DEGIRO Learning Centre'],
  },
  {
    id: 'what_is_emergency_fund',
    tier: 0,
    bucket: 'STABILITY',
    title: 'Emergency fund basics',
    tagline: '3–6 months of expenses. Boring. Essential.',
    body: 'An emergency fund is cash set aside for unexpected costs — job loss, medical bills, urgent repairs. It sits in a high-yield savings account, not invested. Its job is to be there when you need it.',
    bullets: [
      'Target 3 months of expenses if single-income, 6 if household',
      'Keep it in a separate account so you do not spend it accidentally',
      'Replenish it within 3 months after any withdrawal',
    ],
    readMoreSources: ['NerdWallet', 'MoneySavingExpert'],
  },
  {
    id: 'what_is_factor',
    tier: 1,
    bucket: 'GROWTH',
    title: 'Factor investing explained',
    tagline: 'Why some ETFs tilt toward specific return drivers',
    body: 'Factor investing targets specific characteristics — like value, momentum, or quality — that have historically outperformed a plain market-cap index over long periods. Factor ETFs tilt your portfolio toward these traits.',
    bullets: [
      'Factor ETFs can complement a broad-market fund, not replace it',
      'Value, momentum, and quality are the most evidence-backed factors',
      'Factor premiums tend to show over long periods — think 10+ years',
    ],
    readMoreSources: ['Research Affiliates', 'Morningstar'],
  },
  {
    id: 'what_is_bond_duration',
    tier: 1,
    bucket: 'STABILITY',
    title: 'Why bond duration matters',
    tagline: 'The hidden lever inside your fixed income holdings',
    body: 'Duration measures how sensitive a bond or bond fund is to interest rate changes. A fund with a duration of 7 years will fall roughly 7% in value if rates rise by 1%. Shorter duration means less rate risk — and lower return potential.',
    bullets: [
      'Short-duration bonds are closer to cash — less upside, less volatility',
      'Long-duration bonds behave more like equities when rates move sharply',
      'Match duration to your time horizon — not just your risk tolerance',
    ],
    readMoreSources: ['Morningstar', 'Vanguard UK'],
  },
]

// ─── Filtering helpers ──────────────────────────────────────

function deriveUserTier(holdings: PortfolioHolding[]): 0 | 1 {
  const hasGrowthHoldings = holdings.some(h => h.bucket === 'GROWTH')
  const hasGlobalETF = holdings.some(
    h => h.assetSubtype === 'eu_etf' || h.assetSubtype === 'us_brokerage',
  )
  return !hasGrowthHoldings ? 0 : hasGlobalETF ? 1 : 0
}

function alreadyDemonstrates(article: Article, holdings: PortfolioHolding[]): boolean {
  if (article.id === 'what_is_etf') {
    // If they hold growth assets they already understand ETF concepts
    return holdings.some(h => h.bucket === 'GROWTH')
  }
  if (article.id === 'what_is_emergency_fund') {
    // If they hold stability assets they already have the habit
    return holdings.some(h => h.bucket === 'STABILITY')
  }
  return false
}

function getVisibleArticles(
  riskProfile: RiskProfileType,
  holdings: PortfolioHolding[],
): Article[] {
  const userTier = deriveUserTier(holdings)

  const filtered = ARTICLES.filter(
    a => a.tier <= userTier && !alreadyDemonstrates(a, holdings),
  )

  const primaryBucket: 'GROWTH' | 'STABILITY' =
    riskProfile === 'conservative' ? 'STABILITY' : 'GROWTH'

  return [...filtered].sort((a, b) => {
    const aScore = a.bucket === primaryBucket ? 0 : 1
    const bScore = b.bucket === primaryBucket ? 0 : 1
    return aScore - bScore
  })
}

// ─── Props ──────────────────────────────────────────────────

interface Props {
  riskProfile: RiskProfileType
  holdings: PortfolioHolding[]
}

// ─── Component ──────────────────────────────────────────────

export default function FinancialEducationSection({ riskProfile, holdings }: Props) {
  const theme = useTheme()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const articles = getVisibleArticles(riskProfile, holdings)

  if (articles.length === 0) return null

  function handleToggle(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {/* Section header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerLabel, { color: theme.textDim }]}>
            LEARN
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            Matched to where you are
          </Text>
        </View>
        <View style={[styles.countPill, { backgroundColor: theme.border }]}>
          <Text style={[styles.countPillText, { color: theme.textSecondary }]}>
            {`${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`}
          </Text>
        </View>
      </View>

      {/* Article cards */}
      {articles.map((article, index) => {
        const isExpanded = expandedId === article.id
        const isLast = index === articles.length - 1
        const bucketColour = article.bucket === 'GROWTH' ? colours.accent : colours.warning

        return (
          <View
            key={article.id}
            style={[
              styles.articleCard,
              { borderColor: isExpanded ? bucketColour + '55' : theme.border },
              !isLast && styles.articleCardMargin,
            ]}
          >
            {/* Header row — always visible */}
            <TouchableOpacity
              onPress={() => handleToggle(article.id)}
              activeOpacity={0.7}
              style={styles.articleHeader}
            >
              <View style={styles.articleHeaderLeft}>
                <View style={[styles.bucketDot, { backgroundColor: bucketColour }]} />
                <View style={styles.articleTitles}>
                  <Text style={[styles.articleTitle, { color: theme.textPrimary }]}>
                    {article.title}
                  </Text>
                  <Text style={[styles.articleTagline, { color: theme.textSecondary }]}>
                    {article.tagline}
                  </Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.textDim }]}>
                {isExpanded ? '−' : '+'}
              </Text>
            </TouchableOpacity>

            {/* Expanded body */}
            {isExpanded && (
              <View style={styles.articleBody}>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  {article.body}
                </Text>

                <View style={styles.bulletsContainer}>
                  {article.bullets.map((bullet, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={[styles.bulletDot, { color: bucketColour }]}>{'·'}</Text>
                      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>
                        {bullet}
                      </Text>
                    </View>
                  ))}
                </View>

                {article.readMoreSources.length > 0 && (
                  <View style={styles.sourcesRow}>
                    <Text style={[styles.sourcesLabel, { color: theme.textDim }]}>
                      {'Read more: '}
                    </Text>
                    <Text style={[styles.sourcesText, { color: theme.textDim }]}>
                      {article.readMoreSources.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

// ─── Styles ─────────────────────────────────────────────────

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
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  articleCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  articleCardMargin: {
    marginBottom: 10,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  articleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  bucketDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 5,
  },
  articleTitles: {
    flex: 1,
    gap: 2,
  },
  articleTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    letterSpacing: -0.3,
  },
  articleTagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  chevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 22,
    marginLeft: 8,
  },
  articleBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  bulletsContainer: {
    marginTop: 12,
    gap: 7,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 19,
  },
  bulletText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  sourcesLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  sourcesText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
})
