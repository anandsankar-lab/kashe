import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'

interface MonthlyReviewCardProps {
  state: 'available' | 'viewed' | 'pending' | 'insufficient'
  onOpen: () => void
}

export default function MonthlyReviewCard({ state, onOpen }: MonthlyReviewCardProps) {
  const theme = useTheme()

  if (state === 'available') {
    return (
      <View style={[styles.cardAvailable, { backgroundColor: theme.surface, borderLeftColor: colours.accent }]}>
        <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
        <Text style={[styles.titleAvailable, { color: theme.textPrimary }]}>
          March review ready
        </Text>
        <Text style={[styles.generated, { color: theme.textDim }]}>Generated 16 March 2026</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={onOpen}>
          <Text style={styles.ctaText}>Read now →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (state === 'viewed') {
    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
        <Text style={[styles.titleViewed, { color: theme.textPrimary }]}>March review</Text>
        <TouchableOpacity style={styles.openButton} onPress={onOpen}>
          <Text style={[styles.openText, { color: theme.textSecondary }]}>Open →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (state === 'pending') {
    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
        <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
          Available once you have 3 months of data
        </Text>
      </View>
    )
  }

  // insufficient
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Text style={[styles.label, { color: theme.textDim }]}>MONTHLY REVIEW</Text>
      <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
        Add more data to unlock monthly reviews
      </Text>
      <TouchableOpacity style={styles.uploadButton} onPress={() => console.log('upload')}>
        <Text style={[styles.uploadText, { color: colours.accent }]}>+ Upload bank statement</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
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
  titleViewed: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    marginTop: 4,
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
  openButton: {
    marginTop: 8,
  },
  openText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 8,
  },
  uploadButton: {
    marginTop: 8,
  },
  uploadText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
})
