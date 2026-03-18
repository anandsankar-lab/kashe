import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'

interface MonthlyReview {
  month: string
  year: number
  whereYouStand: string
}

interface MonthlyReviewCardProps {
  review: MonthlyReview
  onReadNow: () => void
  isRedacted?: boolean
}

export default function MonthlyReviewCard({ review, onReadNow }: MonthlyReviewCardProps) {
  const theme = useTheme()

  return (
    <View style={[styles.cardAvailable, { backgroundColor: theme.surface, borderLeftColor: colours.accent }]}>
      <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
      <Text style={[styles.titleAvailable, { color: theme.textPrimary }]}>
        {review.month} {review.year} review ready
      </Text>
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
  generated: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
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
