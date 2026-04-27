import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { useInsights } from '../../hooks/useInsights'

// review is kept optional so the parent (invest.tsx) can still pass
// MOCK_MONTHLY_REVIEW without a TypeScript error, even though the card
// sources all its state from useInsights() internally.
interface MonthlyReviewCardProps {
  review?: { month: string; year: number; whereYouStand: string }
  onReadNow: () => void
  isRedacted?: boolean
}

function formatMonthYear(monthYear: string): string {
  const [yearStr, monthStr] = monthYear.split('-')
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1)
  const month = date.toLocaleString('en-US', { month: 'long' })
  return `${month} ${yearStr}`
}

export default function MonthlyReviewCard({ onReadNow }: MonthlyReviewCardProps) {
  const theme = useTheme()
  const { reviewState, currentMonthReview } = useInsights()

  // STATE 4 — unavailable: no spend data connected at all
  if (reviewState === 'unavailable') {
    return (
      <View style={[styles.cardMuted, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
        <Text style={[styles.titleMuted, { color: theme.textDim }]}>Connect your data</Text>
        <Text style={[styles.subtitle, { color: theme.textDim }]}>
          Import spend data to unlock your monthly review.
        </Text>
      </View>
    )
  }

  // STATE 3 — insufficient: less than 3 months of transactions
  if (reviewState === 'insufficient') {
    return (
      <View style={[styles.cardMuted, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
        <Text style={[styles.titleMuted, { color: theme.textDim }]}>Building your picture</Text>
        <Text style={[styles.subtitle, { color: theme.textDim }]}>
          Keep tracking spend. Your first review unlocks after 3 months of data.
        </Text>
      </View>
    )
  }

  // STATE 2 — ready_read: review generated and already viewed, no border
  if (reviewState === 'ready_read') {
    const reviewLabel =
      currentMonthReview !== null
        ? `${formatMonthYear(currentMonthReview.monthYear)} review`
        : 'Monthly review'
    return (
      <View style={[styles.cardMuted, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
        <Text style={[styles.titleMuted, { color: theme.textDim }]}>{reviewLabel}</Text>
        <Text style={[styles.subtitle, { color: theme.textDim }]}>Viewed</Text>
      </View>
    )
  }

  // STATE 1 — ready_unread: accent border, "Read now →" CTA
  const readyLabel =
    currentMonthReview !== null
      ? `${formatMonthYear(currentMonthReview.monthYear)} review ready`
      : 'Review ready'

  return (
    <View style={[styles.cardAvailable, { backgroundColor: theme.surface, borderLeftColor: colours.accent }]}>
      <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
      <Text style={[styles.titleAvailable, { color: theme.textPrimary }]}>{readyLabel}</Text>
      <Text style={[styles.generated, { color: theme.textDim }]}>Generated this month</Text>
      <TouchableOpacity style={styles.ctaButton} onPress={onReadNow}>
        <Text style={styles.ctaText}>Read now →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  cardAvailable: {
    borderRadius: 16,
    padding: 20,
    paddingLeft: 16,
    borderLeftWidth: 4,
  },
  cardMuted: {
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  titleAvailable: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
  },
  titleMuted: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
  },
  generated: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 6,
  },
  ctaButton: {
    backgroundColor: '#C8F04A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  ctaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#111110',
  },
})
