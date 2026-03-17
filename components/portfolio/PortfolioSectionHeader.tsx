import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import MacronRule from '../shared/MacronRule'
import RedactedNumber from '../shared/RedactedNumber'

interface PortfolioSectionHeaderProps {
  label: string
  total: number
  currency: string
  isRedacted?: boolean
  isEmpty?: boolean
  onAddPress?: () => void
}

export default function PortfolioSectionHeader({
  label,
  total,
  currency,
  isRedacted = false,
  isEmpty = false,
  onAddPress,
}: PortfolioSectionHeaderProps) {
  const theme = useTheme()

  const formatted = currency + total.toLocaleString('en-US')

  return (
    <View style={styles.outer}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>

        {isRedacted ? (
          <RedactedNumber length={6} />
        ) : (
          <Text style={[styles.sectionTotal, { color: theme.textPrimary }]}>
            {formatted}
          </Text>
        )}
      </View>

      <MacronRule style={styles.rule} />

      {isEmpty && (
        <View>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No {label.toLowerCase()} holdings yet
          </Text>
          <TouchableOpacity onPress={onAddPress} activeOpacity={0.7}>
            <Text style={[styles.addLink, { color: theme.accent }]}>
              [+ Add one]
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    marginTop: 32,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTotal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    textAlign: 'right',
  },
  rule: {
    marginTop: 6,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 12,
  },
  addLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
})
