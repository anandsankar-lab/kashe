import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../context/ThemeContext'
import FinancialEducationSection from '../components/invest/FinancialEducationSection'
import { MOCK_PORTFOLIO_HOLDINGS as MOCK_HOLDINGS } from '../constants/mockData'

export default function SettingsScreen() {
  const theme = useTheme()
  const router = useRouter()

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: theme.background },
        ]}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={[styles.backChevron, { color: theme.textPrimary }]}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
        </View>

        {/* LEARN section */}
        <Text style={[styles.sectionLabel, { color: theme.textDim, marginTop: 32 }]}>
          LEARN
        </Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <FinancialEducationSection
            riskProfile="balanced"
            holdings={MOCK_HOLDINGS}
          />
        </View>

        {/* COMING SOON section */}
        <Text style={[styles.sectionLabel, { color: theme.textDim, marginTop: 32 }]}>
          COMING SOON
        </Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.placeholderText, { color: theme.textDim }]}>
            Profile, security, data sources and more
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
    lineHeight: 24,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  placeholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
})
