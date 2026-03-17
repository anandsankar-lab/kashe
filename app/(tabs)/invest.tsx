import { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import RiskProfileCard from '../../components/invest/RiskProfileCard'
import RiskProfileSheet from '../../components/invest/RiskProfileSheet'
import { RiskProfileType } from '../../types/riskProfile'

export default function InvestScreen() {
  const theme = useTheme()
  const [riskProfile, setRiskProfile] = useState<RiskProfileType | null>(null)
  const [sheetVisible, setSheetVisible] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        {/* STATE 1 — null profile */}
        <RiskProfileCard
          riskProfile={null}
          onOpenSheet={() => setSheetVisible(true)}
        />

        {/* STATE 2 — balanced profile */}
        <RiskProfileCard
          riskProfile="balanced"
          onOpenSheet={() => setSheetVisible(true)}
        />
      </ScrollView>

      <RiskProfileSheet
        visible={sheetVisible}
        currentProfile={riskProfile}
        onConfirm={(p) => {
          setRiskProfile(p)
          setSheetVisible(false)
        }}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  )
}
