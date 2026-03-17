import { View, Text, TouchableOpacity, PanResponder } from 'react-native'
import { useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import Typography from '../../constants/typography'
import Spacing, { borderRadius } from '../../constants/spacing'
import KasheAsterisk from '../shared/KasheAsterisk'
import { PortfolioInsight } from '../../types/portfolio'

interface PortfolioInsightStripProps {
  insight: PortfolioInsight | null
  onDismiss: () => void
  onPress: () => void
}

export default function PortfolioInsightStrip({
  insight,
  onDismiss,
  onPress,
}: PortfolioInsightStripProps) {
  const theme = useTheme()

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dx < -10 && Math.abs(gestureState.dy) < 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          onDismiss()
        }
      },
    })
  ).current

  if (!insight) return null

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      {...panResponder.panHandlers}
      style={{
        backgroundColor: theme.surface,
        borderRadius: borderRadius.card,
        padding: Spacing.lg,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
          <KasheAsterisk size={12} direction="neutral" />
          <Text style={[Typography.label, { color: theme.textDim }]}>
            PORTFOLIO INSIGHT
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <Text style={[Typography.bodyMedium, { color: theme.textDim, fontSize: 16, lineHeight: 20 }]}>
            ×
          </Text>
        </TouchableOpacity>
      </View>

      {/* Headline */}
      <Text style={[Typography.bodyMedium, { color: theme.textPrimary, marginBottom: Spacing.xs }]}>
        {insight.headline}
      </Text>

      {/* Body */}
      <Text style={[Typography.caption, { color: theme.textSecondary, lineHeight: 18 }]}>
        {insight.body}
      </Text>
    </TouchableOpacity>
  )
}
