import React, { useState } from 'react'
import {
  ScrollView,
  View,
  StyleSheet,
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import AppHeader from '../../components/shared/AppHeader'
import MacronRule from '../../components/shared/MacronRule'
import RiskProfileCard from '../../components/invest/RiskProfileCard'
import RiskProfileSheet from '../../components/invest/RiskProfileSheet'
import InvestmentPlanFull from '../../components/invest/InvestmentPlanFull'
import InstrumentDiscoverySection from '../../components/invest/InstrumentDiscoverySection'
import MonthlyReviewCard from '../../components/invest/MonthlyReviewCard'
import MonthlyReviewSheet from '../../components/invest/MonthlyReviewSheet'
import FIRETeaserCard from '../../components/invest/FIRETeaserCard'
import {
  MOCK_HOLDINGS,
  MOCK_INVESTMENT_PLAN,
  MOCK_MONTHLY_REVIEW,
} from '../../constants/mockData'
import { RiskProfileType } from '../../types/riskProfile'

export default function InvestScreen() {
  const theme = useTheme()

  const [riskProfile, setRiskProfile] =
    useState<RiskProfileType>('balanced')
  const [riskSheetVisible, setRiskSheetVisible] =
    useState(false)
  const [reviewVisible, setReviewVisible] =
    useState(false)

  const styles = makeStyles(theme)

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Invest"
        showAvatar
        showOverflow
        showAdd
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 1 — Risk Profile */}
        <RiskProfileCard
          riskProfile={riskProfile}
          onSetProfile={() => setRiskSheetVisible(true)}
        />

        {/* 2 — Investment Plan */}
        <MacronRule style={styles.rule} />
        <InvestmentPlanFull
          plan={MOCK_INVESTMENT_PLAN}
          riskProfile={riskProfile}
        />

        {/* 3 — Instrument Discovery */}
        <MacronRule style={styles.rule} />
        <InstrumentDiscoverySection
          riskProfile={riskProfile}
          holdings={MOCK_HOLDINGS}
          geography="NL"
        />

        {/* 4 — Monthly Review */}
        <MacronRule style={styles.rule} />
        <MonthlyReviewCard
          review={MOCK_MONTHLY_REVIEW}
          onReadNow={() => setReviewVisible(true)}
        />

        {/* 5 — FIRE Teaser */}
        <MacronRule style={styles.rule} />
        <FIRETeaserCard
          isSetUp={false}
          onGetStarted={() => {}}
        />

        <View style={styles.bottom} />
      </ScrollView>

      {/* Sheets — outside ScrollView */}
      <RiskProfileSheet
        visible={riskSheetVisible}
        currentProfile={riskProfile}
        onSelect={(p) => {
          setRiskProfile(p)
          setRiskSheetVisible(false)
        }}
        onDismiss={() => setRiskSheetVisible(false)}
      />

      <MonthlyReviewSheet
        visible={reviewVisible}
        review={MOCK_MONTHLY_REVIEW}
        onDismiss={() => setReviewVisible(false)}
      />
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 48,
    },
    rule: {
      marginTop: 24,
    },
    bottom: {
      height: 8,
    },
  })
}
