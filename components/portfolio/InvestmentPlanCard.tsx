import { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { formatCurrency } from '../../constants/formatters'
import MacronRule from '../shared/MacronRule'
import { InvestmentPlan, BucketType } from '../../types/portfolio'

interface Props {
  plan: InvestmentPlan
  onSaveTarget: (target: number) => void
  onExploreOptions: (bucket: BucketType) => void
  isRedacted?: boolean
}

const BUCKETS: { key: BucketType; label: string; pct: number }[] = [
  { key: 'GROWTH', label: 'GROWTH', pct: 0.6 },
  { key: 'STABILITY', label: 'STABILITY', pct: 0.2 },
  { key: 'LOCKED', label: 'LOCKED', pct: 0.2 },
]

export default function InvestmentPlanCard({
  plan,
  onSaveTarget,
  onExploreOptions,
  isRedacted = false,
}: Props) {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [editableTarget, setEditableTarget] = useState(
    plan.monthlyTarget ? String(plan.monthlyTarget) : ''
  )

  const hasTarget = (plan.monthlyTarget ?? 0) > 0
  const monthlyTarget = plan.monthlyTarget ?? 0
  const investedThisMonth = plan.investedThisMonth
  const progressPercent = hasTarget
    ? Math.min(investedThisMonth / monthlyTarget, 1) * 100
    : 0

  const totalAutoContributions = plan.salaryContributions.reduce(
    (sum, c) => sum + c.amountPerMonth,
    0
  )
  const remaining = Math.max(monthlyTarget - totalAutoContributions, 0)

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const expandAnim = useRef(new Animated.Value(0)).current
  const expandedHeightRef = useRef(0)

  useEffect(() => {
    if (hasTarget) {
      Animated.timing(progressAnim, {
        toValue: progressPercent,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = useCallback(() => {
    const expanding = !isExpanded
    setIsExpanded(expanding)
    Animated.timing(rotateAnim, {
      toValue: expanding ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
    Animated.timing(expandAnim, {
      toValue: expanding ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start()
  }, [isExpanded, rotateAnim, expandAnim])

  const onExpandedLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height
    if (h > expandedHeightRef.current) {
      expandedHeightRef.current = h
    }
  }, [])

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  })

  const animatedMaxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, expandedHeightRef.current > 0 ? expandedHeightRef.current : 600],
  })

  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  })

  const cardStyle = {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  }

  // ── STATE 1: Collapsed, no target ───────────────────────────────────────────
  if (!hasTarget) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={() => setIsExpanded(true)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: theme.textPrimary }}>
              Monthly investment plan
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: theme.accent, marginTop: 2 }}>
              Set a target →
            </Text>
          </View>
          <Text style={{ fontSize: 20, color: theme.textDim }}>›</Text>
        </View>
      </TouchableOpacity>
    )
  }

  // ── STATE 2 + 3: Has target — collapsed or expanded ─────────────────────────

  return (
    <TouchableOpacity style={cardStyle} onPress={toggleExpand} activeOpacity={0.9}>
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: theme.textPrimary }}>
          Monthly investment plan
        </Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Text style={{ fontSize: 20, color: theme.textDim }}>›</Text>
        </Animated.View>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.border,
          width: '100%',
          marginTop: 10,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.accent,
            width: isRedacted ? '0%' : animatedProgressWidth,
          }}
        />
      </View>
      {!isRedacted && (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: theme.textSecondary,
            marginTop: 6,
          }}
        >
          {`${formatCurrency(investedThisMonth, 'EUR')} of ${formatCurrency(monthlyTarget, 'EUR')} invested this month`}
        </Text>
      )}

      {/* Expanded section — clipped by animated maxHeight */}
      <Animated.View style={{ maxHeight: animatedMaxHeight, overflow: 'hidden' }}>
        <View onLayout={onExpandedLayout}>
          <MacronRule style={{ marginTop: 12 }} />

          {/* Monthly target input */}
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: theme.textDim,
              marginTop: 12,
            }}
          >
            Monthly target
          </Text>
          {!isRedacted && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_700Bold',
                  fontSize: 28,
                  color: theme.textPrimary,
                }}
              >
                €
              </Text>
              <TextInput
                value={editableTarget}
                onChangeText={setEditableTarget}
                keyboardType="numeric"
                onBlur={() => onSaveTarget(parseFloat(editableTarget) || 0)}
                style={{
                  fontFamily: 'SpaceGrotesk_700Bold',
                  fontSize: 28,
                  color: theme.textPrimary,
                  minWidth: 80,
                  flex: 1,
                  padding: 0,
                  margin: 0,
                }}
              />
            </View>
          )}

          <MacronRule style={{ marginTop: 12 }} />

          {/* Salary contributions */}
          {plan.salaryContributions.length > 0 && (
            <>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: theme.textDim,
                  marginTop: 12,
                }}
              >
                Already going in automatically
              </Text>

              {plan.salaryContributions.map((contribution) => (
                <View
                  key={contribution.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                        color: theme.textPrimary,
                      }}
                    >
                      {contribution.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: theme.textSecondary,
                      }}
                    >
                      {contribution.bucket} · Auto-detected
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk_700Bold',
                      fontSize: 14,
                      color: theme.textPrimary,
                    }}
                  >
                    {isRedacted ? '•••••' : `${formatCurrency(contribution.amountPerMonth, 'EUR')}/mo`}
                  </Text>
                </View>
              ))}

              <MacronRule style={{ marginTop: 4 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: theme.textSecondary,
                  }}
                >
                  Remaining to actively allocate:
                </Text>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_700Bold',
                    fontSize: 15,
                    color: theme.textPrimary,
                  }}
                >
                  {isRedacted ? '•••••' : `${formatCurrency(remaining, 'EUR')}/mo`}
                </Text>
              </View>
            </>
          )}

          <MacronRule style={{ marginTop: 12 }} />

          {/* Suggested allocation */}
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: theme.textDim,
              marginTop: 12,
            }}
          >
            Suggested allocation
          </Text>

          {BUCKETS.map(({ key, label, pct }) => {
            const amount = Math.round(remaining * pct)
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onExploreOptions(key)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 8,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 14,
                      color: theme.textPrimary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 12,
                      color: theme.textSecondary,
                    }}
                  >
                    {Math.round(pct * 100)}%
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_700Bold',
                    fontSize: 14,
                    color: theme.textPrimary,
                  }}
                >
                  {isRedacted ? '•••••' : formatCurrency(amount, 'EUR')}
                </Text>
              </TouchableOpacity>
            )
          })}

          {/* Collapse link */}
          <TouchableOpacity
            onPress={toggleExpand}
            activeOpacity={0.7}
            style={{ marginTop: 12, marginBottom: 4 }}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: theme.textDim,
                textAlign: 'center',
              }}
            >
              Collapse ↑
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}
