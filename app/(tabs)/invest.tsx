import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import AppHeader from '../../components/shared/AppHeader'
import MacronRule from '../../components/shared/MacronRule'
import KasheAsterisk from '../../components/shared/KasheAsterisk'
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

  const hasData = false

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
        <View style={[
          styles.scrollContent,
          !hasData && styles.redacted,
        ]}>
          {/* 1 — Risk Profile */}
          <RiskProfileCard
            riskProfile={riskProfile}
            onSetProfile={() => setRiskSheetVisible(true)}
            isRedacted={!hasData}
          />

          {/* 2 — Investment Plan */}
          <MacronRule style={styles.rule} />
          <InvestmentPlanFull
            plan={MOCK_INVESTMENT_PLAN}
            riskProfile={riskProfile}
            isRedacted={!hasData}
          />

          {/* 3 — Instrument Discovery */}
          <MacronRule style={styles.rule} />
          <InstrumentDiscoverySection
            riskProfile={riskProfile}
            holdings={MOCK_HOLDINGS}
            geography="NL"
            isRedacted={!hasData}
          />

          {/* 4 — Monthly Review */}
          <MacronRule style={styles.rule} />
          <MonthlyReviewCard
            review={MOCK_MONTHLY_REVIEW}
            onReadNow={() => setReviewVisible(true)}
            isRedacted={!hasData}
          />

          {/* 5 — FIRE Teaser */}
          <MacronRule style={styles.rule} />
          <FIRETeaserCard
            isSetUp={false}
            onGetStarted={() => {}}
            isRedacted={!hasData}
          />

          <View style={styles.bottom} />
        </View>
      </ScrollView>

      {!hasData && (
        <View style={styles.emptyPill} pointerEvents="box-none">
          <TouchableOpacity style={styles.pillButton} activeOpacity={0.9}>
            <KasheAsterisk size={14} animated={false} direction="neutral" />
            <Text style={styles.pillText}>+ Connect your data</Text>
          </TouchableOpacity>
        </View>
      )}

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
    scrollContent: {
      flex: 1,
    },
    redacted: {
      opacity: 0.5,
    },
    rule: {
      marginTop: 24,
    },
    bottom: {
      height: 8,
    },
    emptyPill: {
      position: 'absolute',
      bottom: 24,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    pillButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colours.accent,
      borderRadius: 999,
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
    },
    pillText: {
      fontFamily: 'SpaceGrotesk_600SemiBold',
      fontSize: 14,
      color: colours.textOnAccent,
      letterSpacing: -0.3,
    },
  })
}
