import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import KasheAsterisk from '../shared/KasheAsterisk'
import { RiskProfileType, RISK_PROFILES } from '../../types/riskProfile'

interface RiskProfileCardProps {
  riskProfile: RiskProfileType | null
  onOpenSheet: () => void
}

export default function RiskProfileCard({
  riskProfile,
  onOpenSheet,
}: RiskProfileCardProps) {
  const theme = useTheme()

  if (riskProfile === null) {
    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.asteriskWrapper}>
          <KasheAsterisk size={16} animated={false} direction="neutral" />
        </View>
        <Text style={[styles.headline, { color: theme.textPrimary }]}>
          What kind of investor are you?
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Tell us how you think about risk. We'll tailor your investment plan and suggestions.
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={onOpenSheet}>
          <Text style={styles.ctaText}>Set your risk profile →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const profile = RISK_PROFILES[riskProfile]

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: theme.textDim }]}>RISK PROFILE</Text>
        <TouchableOpacity onPress={onOpenSheet}>
          <Text style={[styles.editLink, { color: colours.accent }]}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.profileLabel, { color: theme.textPrimary }]}>
        {profile.label}
      </Text>
      <Text style={[styles.profileDescription, { color: theme.textSecondary }]}>
        {profile.description}
      </Text>
      <View style={styles.pillsRow}>
        <View style={[styles.pill, styles.pillGrowth]}>
          <Text style={[styles.pillText, { color: colours.accent }]}>
            GROWTH {profile.targetAllocation.growth}%
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: theme.border }]}>
          <Text style={[styles.pillText, { color: theme.textSecondary }]}>
            STABILITY {profile.targetAllocation.stability}%
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: theme.border }]}>
          <Text style={[styles.pillText, { color: theme.textSecondary }]}>
            LOCKED {profile.targetAllocation.locked}%
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
  asteriskWrapper: {
    marginBottom: 12,
  },
  headline: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  editLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  profileLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  profileDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillGrowth: {
    backgroundColor: 'rgba(200,240,74,0.15)',
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
})
