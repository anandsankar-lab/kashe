import { View, Text, TouchableOpacity } from 'react-native'
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
    <View style={{ paddingTop: 20, paddingBottom: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: theme.textSecondary,
          }}
        >
          {label}
        </Text>

        {isRedacted ? (
          <RedactedNumber length={6} />
        ) : (
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 18,
              color: theme.textPrimary,
              textAlign: 'right',
            }}
          >
            {formatted}
          </Text>
        )}
      </View>

      <MacronRule style={{ marginTop: 6 }} />

      {isEmpty && (
        <View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: theme.textSecondary,
              marginTop: 12,
            }}
          >
            No {label.toLowerCase()} holdings yet
          </Text>
          <TouchableOpacity onPress={onAddPress} activeOpacity={0.7}>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: theme.accent,
                marginTop: 4,
              }}
            >
              [+ Add one]
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
