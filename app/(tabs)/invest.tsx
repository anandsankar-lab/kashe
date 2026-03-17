import { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import AppHeader from '../../components/shared/AppHeader'
import RiskProfileCard from '../../components/invest/RiskProfileCard'
import RiskProfileSheet from '../../components/invest/RiskProfileSheet'
import { RiskProfileType } from '../../types/riskProfile'

export default function InvestScreen() {
  const theme = useTheme()
  const [riskProfile, setRiskProfile] = useState<RiskProfileType | null>(null)
  const [sheetVisible, setSheetVisible] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppHeader
        title="Invest"
        showAvatar={true}
        avatarInitial="A"
        showOverflow={true}
        showAdd={true}
        onAdd={() => console.log('add')}
        onOverflow={() => console.log('overflow')}
        onAvatar={() => console.log('avatar')}
      />
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
