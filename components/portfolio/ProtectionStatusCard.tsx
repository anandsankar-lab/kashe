import { useRef, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { PortfolioHolding } from '../../types/portfolio'
import { formatCurrency } from '../../constants/formatters'
import MacronRule from '../shared/MacronRule'

interface Props {
  holding: PortfolioHolding
  avgMonthlySpend: number
}

export default function ProtectionStatusCard({ holding, avgMonthlySpend }: Props) {
  const theme = useTheme()
  const [containerWidth, setContainerWidth] = useState(0)
  const barAnim = useRef(new Animated.Value(0)).current

  const months = Math.round((holding.currentValue / avgMonthlySpend) * 10) / 10
  const fillWidth = Math.min(months / 6, 1)
  const min = avgMonthlySpend * 3
  const max = avgMonthlySpend * 6

  let coverageColor: string
  if (months < 3) {
    coverageColor = colours.danger
  } else if (months <= 6) {
    coverageColor = colours.accent
  } else {
    coverageColor = theme.textSecondary
  }

  useEffect(() => {
    if (containerWidth > 0) {
      Animated.timing(barAnim, {
        toValue: fillWidth * containerWidth,
        duration: 600,
        useNativeDriver: false,
      }).start()
    }
  }, [containerWidth, fillWidth, barAnim])

  return (
    <View style={[styles.outer, { backgroundColor: theme.surface }]}>
      <Text style={[styles.header, { color: theme.textDim }]}>🛡️ Emergency fund</Text>

      <Text style={[styles.coverageNumber, { color: coverageColor }]}>
        {months.toFixed(1)}
      </Text>

      <Text style={[styles.coverageLabel, { color: theme.textSecondary }]}>{months.toFixed(1)} months covered</Text>

      <View
        style={[styles.barTrack, { backgroundColor: theme.border }]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[styles.barFill, { width: barAnim, backgroundColor: coverageColor }]}
        />
      </View>

      <View style={styles.rangeRow}>
        <Text style={[styles.rangeLabel, { color: theme.textSecondary }]}>Recommended</Text>
        <Text style={[styles.rangeValue, { color: theme.textPrimary }]}>
          {formatCurrency(min, 'EUR')} – {formatCurrency(max, 'EUR')}
        </Text>
      </View>

      <Text style={[styles.basedOn, { color: theme.textDim }]}>
        Based on {formatCurrency(avgMonthlySpend, 'EUR')} avg monthly spend
      </Text>

      {months > 6 && (
        <Text style={[styles.surplusNote, { color: theme.textDim }]}>
          You may have more than you need here. Consider investing the surplus.
        </Text>
      )}

      <MacronRule style={{ marginTop: 12 }} />

      <TouchableOpacity
        style={{ marginTop: 12 }}
        onPress={() => console.log('Remove protection designation')}
        activeOpacity={0.7}
      >
        <Text style={[styles.removeLink, { color: theme.textSecondary }]}>Remove protection designation</Text>
      </TouchableOpacity>

      <Text style={[styles.removeSubNote, { color: theme.textDim }]}>
        This won't delete the holding, just the designation.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  header: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  coverageNumber: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
  },
  coverageLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 2,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
    marginTop: 12,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  rangeLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  rangeValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  basedOn: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 4,
  },
  surplusNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 8,
  },
  removeLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  removeSubNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
})
