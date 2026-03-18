import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { formatCurrency } from '../../constants/formatters'
import { RISK_PROFILES } from '../../types/riskProfile'
import type { RiskProfileType } from '../../types/riskProfile'
import type { InvestmentPlan } from '../../types/portfolio'
import RedactedNumber from '../shared/RedactedNumber'

interface Props {
  plan: InvestmentPlan
  riskProfile: RiskProfileType
  isRedacted?: boolean
}

export default function InvestmentPlanFull({ plan, riskProfile, isRedacted }: Props) {
  const theme = useTheme()

  const monthlyTarget = plan.monthlyTarget ?? 0
  const progressPercent = monthlyTarget > 0
    ? Math.min((plan.investedThisMonth / monthlyTarget) * 100, 100)
    : 0

  const allocation = RISK_PROFILES[riskProfile].targetAllocation

  const buckets: { label: string; key: keyof typeof allocation; colour: string; dimBar: boolean; invested: number }[] = [
    { label: 'GROWTH',    key: 'growth',    colour: colours.accent,        dimBar: false, invested: plan.investedThisMonth },
    { label: 'STABILITY', key: 'stability', colour: theme.textSecondary,   dimBar: true,  invested: 0 },
    { label: 'LOCKED',    key: 'locked',    colour: theme.textDim,         dimBar: true,  invested: 0 },
  ]

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {/* Section header */}
      <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
        INVESTMENT PLAN
      </Text>

      {/* Monthly target row */}
      <View style={[styles.targetRow, { marginTop: 12 }]}>
        <View>
          <Text style={[styles.targetLabel, { color: theme.textSecondary }]}>
            Monthly target
          </Text>
          {isRedacted ? (
            <RedactedNumber style={styles.targetAmount} />
          ) : (
            <Text style={[styles.targetAmount, { color: theme.textPrimary, marginTop: 2 }]}>
              {formatCurrency(monthlyTarget, 'EUR')}
            </Text>
          )}
        </View>
        <View style={styles.progressSummary}>
          {isRedacted ? (
            <RedactedNumber style={styles.investedText} length={8} />
          ) : (
            <Text style={[styles.investedText, { color: theme.textSecondary }]}>
              {formatCurrency(plan.investedThisMonth, 'EUR')} invested
            </Text>
          )}
          {isRedacted ? (
            <RedactedNumber style={styles.percentText} length={3} />
          ) : (
            <Text style={[styles.percentText, { color: colours.accent }]}>
              {progressPercent.toFixed(0)}%
            </Text>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.border, marginTop: 12 }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colours.accent, width: `${progressPercent}%` },
          ]}
        />
      </View>

      {/* Salary contributions */}
      {plan.salaryContributions.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={[styles.sectionLabel, { color: theme.textDim, marginBottom: 8 }]}>
            AUTO-CONTRIBUTIONS
          </Text>
          {plan.salaryContributions.map((contribution) => (
            <View key={contribution.id} style={styles.contributionRow}>
              <Text style={[styles.contributionLabel, { color: theme.textSecondary }]}>
                {contribution.name}
              </Text>
              {isRedacted ? (
                <RedactedNumber style={styles.contributionAmount} length={5} />
              ) : (
                <Text style={[styles.contributionAmount, { color: theme.textSecondary }]}>
                  {formatCurrency(contribution.amountPerMonth, 'EUR')}/mo
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Bucket allocation targets */}
      <View style={{ marginTop: 20 }}>
        <Text style={[styles.sectionLabel, { color: theme.textDim, marginBottom: 12 }]}>
          TARGET ALLOCATION
        </Text>

        {buckets.map(({ label, key, colour, dimBar, invested }) => {
          const allocationPct = allocation[key]
          const targetAmount = (allocationPct / 100) * monthlyTarget
          const gap = targetAmount - invested

          return (
            <View key={key} style={styles.bucketRow}>
              {/* Top row: label + target amount */}
              <View style={styles.bucketTopRow}>
                <Text style={[styles.bucketLabel, { color: colour }]}>
                  {label}
                </Text>
                {isRedacted ? (
                  <RedactedNumber style={styles.bucketAmount} length={5} />
                ) : (
                  <Text style={[styles.bucketAmount, { color: theme.textPrimary }]}>
                    {formatCurrency(targetAmount, 'EUR')}
                  </Text>
                )}
              </View>

              {/* Allocation bar */}
              <View style={[styles.allocationTrack, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.allocationFill,
                    {
                      backgroundColor: colour,
                      opacity: dimBar ? 0.7 : 1,
                      width: `${allocationPct}%`,
                    },
                  ]}
                />
              </View>

              {/* Progress fraction */}
              {isRedacted ? (
                <RedactedNumber style={styles.progressFraction} length={10} />
              ) : (
                <Text style={[styles.progressFraction, { color: theme.textDim, marginTop: 4 }]}>
                  {formatCurrency(invested, 'EUR')} / {formatCurrency(targetAmount, 'EUR')}
                </Text>
              )}

              {/* CTA */}
              {gap > 0 && (
                <TouchableOpacity
                  onPress={() => console.log('explore', label)}
                  activeOpacity={0.7}
                  style={{ marginTop: 4 }}
                >
                  <Text style={[styles.ctaText, { color: colours.accent }]}>
                    Explore →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  targetLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  targetAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    letterSpacing: -0.8,
  },
  progressSummary: {
    alignItems: 'flex-end',
  },
  investedText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  percentText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
  },
  contributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contributionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  contributionAmount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  bucketRow: {
    marginBottom: 12,
  },
  bucketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bucketLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  bucketAmount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  allocationTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  allocationFill: {
    height: 4,
    borderRadius: 999,
  },
  progressFraction: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  ctaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
})
