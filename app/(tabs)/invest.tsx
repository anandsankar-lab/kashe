import { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import AppHeader from '../../components/shared/AppHeader'
import RiskProfileCard from '../../components/invest/RiskProfileCard'
import RiskProfileSheet from '../../components/invest/RiskProfileSheet'
import InvestmentPlanFull from '../../components/invest/InvestmentPlanFull'
import MonthlyReviewCard from '../../components/invest/MonthlyReviewCard'
import MonthlyReviewSheet from '../../components/invest/MonthlyReviewSheet'
import MacronRule from '../../components/shared/MacronRule'
import FIRETeaserCard from '../../components/invest/FIRETeaserCard'
import { MOCK_INVESTMENT_PLAN } from '../../constants/mockData'
import { RiskProfileType } from '../../types/riskProfile'

export default function InvestScreen() {
  const theme = useTheme()
  const [riskProfile, setRiskProfile] = useState<RiskProfileType | null>(null)
  const [sheetVisible, setSheetVisible] = useState(false)
  const [reviewVisible, setReviewVisible] = useState(false)

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
        <RiskProfileCard
          riskProfile={null}
          onOpenSheet={() => setSheetVisible(true)}
        />

        <MacronRule style={{ marginTop: 24 }} />

        <InvestmentPlanFull
          plan={MOCK_INVESTMENT_PLAN}
          riskProfile="balanced"
        />

        <MacronRule style={{ marginTop: 24 }} />
        <MonthlyReviewCard
          state="available"
          onOpen={() => setReviewVisible(true)}
        />

        <MacronRule style={{ marginTop: 24 }} />
        <FIRETeaserCard fireSetUp={false} />
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
      <MonthlyReviewSheet
        visible={reviewVisible}
        onClose={() => setReviewVisible(false)}
      />
    </View>
  )
}
