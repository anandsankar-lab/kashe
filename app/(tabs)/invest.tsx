import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import * as colours from '../../constants/colours'

export default function InvestScreen() {
  const theme = useTheme()
  return (
    <View style={[styles.container,
      { backgroundColor: theme.background }]}>
      <Text style={[styles.placeholder,
        { color: colours.textSecondary }]}>
        Invest — coming this session
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1,
    justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 14 },
})
