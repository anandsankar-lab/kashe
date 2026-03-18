import { useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { formatCurrency } from '../../constants/formatters'
import KasheAsterisk from '../shared/KasheAsterisk'
import RedactedNumber from '../shared/RedactedNumber'

interface FIRETeaserCardProps {
  isSetUp: boolean
  onGetStarted?: () => void
  onOpen?: () => void
  isRedacted?: boolean
}

export default function FIRETeaserCard({
  isSetUp,
  onGetStarted,
  onOpen,
  isRedacted,
}: FIRETeaserCardProps) {
  const theme = useTheme()
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isSetUp) return
    Animated.timing(progressAnim, {
      toValue: 34,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    }).start()
  }, [isSetUp, progressAnim])

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  })

  if (!isSetUp) {
    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.topRow}>
          <Text style={[styles.label, { color: theme.textDim }]}>
            FINANCIAL INDEPENDENCE
          </Text>
          <KasheAsterisk size={14} animated={false} />
        </View>

        <Text style={[styles.headline, { color: theme.textPrimary }]}>
          How close are you to financial independence?
        </Text>

        <Text style={[styles.subtext, { color: theme.textSecondary }]}>
          Set up your FIRE planner — takes 2 minutes.
        </Text>

        <TouchableOpacity
          onPress={onGetStarted ?? (() => console.log('fire setup'))}
          style={styles.cta}
        >
          <Text style={[styles.ctaText, { color: colours.accent }]}>
            Get started →
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: theme.textDim }]}>
          FINANCIAL INDEPENDENCE
        </Text>
        <KasheAsterisk size={14} animated={true} />
      </View>

      <Text style={[styles.subtext, { color: theme.textSecondary, marginTop: 4 }]}>
        Financial independence
      </Text>

      {isRedacted ? (
        <RedactedNumber style={styles.year} length={4} />
      ) : (
        <Text style={[styles.year, { color: theme.textPrimary }]}>
          2036
        </Text>
      )}

      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: colours.accent, width: progressWidth }]}
        />
      </View>

      <View style={styles.progressRow}>
        {isRedacted ? (
          <RedactedNumber style={styles.progressLabel} length={6} />
        ) : (
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            34% of your independence number
          </Text>
        )}
        {isRedacted ? (
          <RedactedNumber style={styles.progressAmount} length={8} />
        ) : (
          <Text style={[styles.progressAmount, { color: theme.textDim }]}>
            {formatCurrency(583380, 'EUR')} to go
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={onOpen ?? (() => console.log('fire open'))}
        style={styles.cta}
      >
        <Text style={[styles.openText, { color: theme.textSecondary }]}>
          Open FIRE planner →
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  headline: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    letterSpacing: -0.8,
  },
  subtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 6,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  ctaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  year: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 48,
    letterSpacing: -2,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  progressAmount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  openText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
})
