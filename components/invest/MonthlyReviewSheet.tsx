import React, { useRef, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { formatCurrency } from '../../constants/formatters'
import KasheAsterisk from '../shared/KasheAsterisk'

interface Props {
  visible: boolean
  review: { month: string; year: number; whereYouStand: string }
  onDismiss: () => void
}

const MOCK_REVIEW = {
  month: 'March 2026',
  heroStat: { label: 'Invested this month', value: 920, currency: 'EUR' },
  portfolioGrowth: 2.3,
  benchmarkDelta: 0.8,
  buckets: [
    {
      label: 'Growth',
      value: 102400,
      currency: 'EUR',
      change: 2.3,
      changePositive: true,
      allocation: 60,
      filled: 59,
      context: '↑ 2.3% this month',
    },
    {
      label: 'Stability',
      value: 21100,
      currency: 'EUR',
      change: 0,
      changePositive: true,
      allocation: 20,
      filled: 12,
      context: '2.8 months covered',
    },
    {
      label: 'Locked',
      value: 48200,
      currency: 'EUR',
      change: 0,
      changePositive: true,
      allocation: 20,
      filled: 29,
      context: 'On track',
    },
  ],
  priority: {
    action: '€580 into Growth',
    reason: 'Growth is 8% below your 60% target',
    cta: 'Explore Growth options',
  },
  fire: { year: 2036, status: 'on track', unchanged: true },
  watchlist: [
    'Fed meeting 7 Apr — US equity impact',
    'Roth IRA deadline: 15 Apr',
    'Emergency fund at 2.8mo — target is 3mo',
  ],
  sparklinePoints: [
    168000, 171000, 169500, 172000, 170500,
    173000, 171700, 174000, 172800, 171700,
  ],
}

function SparkLine({
  points,
  width,
  height,
  color,
}: {
  points: number[]
  width: number
  height: number
  color: string
}) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * width,
    y: height - ((p - min) / range) * height,
  }))

  const pathD = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
    .join(' ')

  const lastPoint = coords[coords.length - 1]

  return (
    <Svg width={width} height={height}>
      <Path
        d={pathD}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={lastPoint.x} cy={lastPoint.y} r={3} fill={color} />
    </Svg>
  )
}

function AllocationBar({
  filled,
  color,
  delay = 0,
}: {
  filled: number
  color: string
  delay?: number
}) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: filled,
      duration: 800,
      delay,
      useNativeDriver: false,
    }).start()
  }, [filled])

  return (
    <View
      style={{
        height: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
        marginTop: 6,
      }}
    >
      <Animated.View
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: color,
          width: anim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  )
}

export default function MonthlyReviewSheet({ visible, review: _review, onDismiss }: Props) {
  const theme = useTheme()
  const review = MOCK_REVIEW
  const screenWidth = Dimensions.get('window').width

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.scrim} onPress={onDismiss}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {/* ── HEADER ── */}
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.monthLabel, { color: theme.textDim }]}>
                  MONTHLY REVIEW
                </Text>
                <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>
                  {review.month}
                </Text>
              </View>
              <TouchableOpacity onPress={onDismiss}>
                <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── LEVEL 1 — HERO STAT ── */}
            <View style={[styles.heroCard, { backgroundColor: theme.surface }]}>
              <View style={styles.heroLeft}>
                <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>
                  {review.heroStat.label}
                </Text>
                <Text style={[styles.heroValue, { color: theme.textPrimary }]}>
                  {formatCurrency(review.heroStat.value, review.heroStat.currency)}
                </Text>
                <View style={styles.heroSubRow}>
                  <KasheAsterisk size={12} animated={false} direction="up" />
                  <Text style={[styles.heroSub, { color: colours.accent }]}>
                    {' '}Portfolio +{review.portfolioGrowth}%
                    · beat benchmark by {review.benchmarkDelta}%
                  </Text>
                </View>
              </View>
              <SparkLine
                points={review.sparklinePoints}
                width={80}
                height={40}
                color={colours.accent}
              />
            </View>

            {/* ── LEVEL 2 — BUCKET ALLOCATION ── */}
            <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
              HOW YOUR MONEY IS WORKING
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              {review.buckets.map((bucket, i) => (
                <View
                  key={bucket.label}
                  style={[
                    styles.bucketRow,
                    i < review.buckets.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                      paddingBottom: 14,
                      marginBottom: 14,
                    },
                  ]}
                >
                  {/* Top row */}
                  <View style={styles.bucketTop}>
                    <Text style={[styles.bucketLabel, { color: theme.textPrimary }]}>
                      {bucket.label}
                    </Text>
                    <View style={styles.bucketRight}>
                      <Text style={[styles.bucketValue, { color: theme.textPrimary }]}>
                        {formatCurrency(bucket.value, bucket.currency)}
                      </Text>
                      {bucket.change !== 0 && (
                        <Text
                          style={[
                            styles.bucketChange,
                            {
                              color: bucket.changePositive
                                ? colours.accent
                                : colours.danger,
                            },
                          ]}
                        >
                          {bucket.changePositive ? '+' : ''}
                          {bucket.change}%
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Allocation bar */}
                  <AllocationBar
                    filled={bucket.filled}
                    color={i === 0 ? colours.accent : theme.textDim}
                    delay={i * 150}
                  />

                  {/* Context */}
                  <View style={styles.bucketContextRow}>
                    <Text style={[styles.bucketContext, { color: theme.textSecondary }]}>
                      {bucket.context}
                    </Text>
                    <Text style={[styles.bucketAlloc, { color: theme.textDim }]}>
                      Target {bucket.allocation}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ── LEVEL 3 — THIS MONTH'S PRIORITY ── */}
            <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
              THIS MONTH
            </Text>

            <View
              style={[
                styles.priorityCard,
                {
                  backgroundColor: theme.surface,
                  borderLeftColor: colours.accent,
                },
              ]}
            >
              <Text style={[styles.priorityAction, { color: theme.textPrimary }]}>
                {review.priority.action}
              </Text>
              <Text style={[styles.priorityReason, { color: theme.textSecondary }]}>
                {review.priority.reason}
              </Text>
              <TouchableOpacity
                onPress={() => console.log('explore priority')}
                style={styles.priorityCta}
              >
                <Text style={[styles.priorityCtaText, { color: colours.accent }]}>
                  {review.priority.cta} →
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── LEVEL 4 — HORIZON ── */}
            <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
              LOOKING AHEAD
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              {/* FIRE row */}
              <View style={styles.fireRow}>
                <View>
                  <Text style={[styles.fireLabel, { color: theme.textSecondary }]}>
                    Financial independence
                  </Text>
                  <View style={styles.fireYearRow}>
                    <Text style={[styles.fireYear, { color: theme.textPrimary }]}>
                      {review.fire.year}
                    </Text>
                    <View
                      style={[
                        styles.firePill,
                        { backgroundColor: 'rgba(200,240,74,0.15)' },
                      ]}
                    >
                      <Text style={[styles.firePillText, { color: colours.accent }]}>
                        On track
                      </Text>
                    </View>
                  </View>
                </View>
                <KasheAsterisk size={20} animated={true} />
              </View>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              {/* Watchlist */}
              <Text style={[styles.watchLabel, { color: theme.textDim }]}>
                WATCH FOR
              </Text>
              {review.watchlist.map((item, i) => (
                <View key={i} style={styles.watchRow}>
                  <View style={[styles.watchDot, { backgroundColor: colours.accent }]} />
                  <Text style={[styles.watchText, { color: theme.textSecondary }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* Footer */}
            <Text style={[styles.footer, { color: theme.textDim }]}>
              Kāshe AI · Your data only · Not financial advice
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  monthLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  monthTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  closeBtn: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    paddingLeft: 16,
    paddingTop: 4,
  },

  // Hero
  heroCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroLeft: { flex: 1, marginRight: 16 },
  heroLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  heroValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    letterSpacing: -1.5,
    marginTop: 4,
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  heroSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },

  // Section label
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },

  // Standard card
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  // Buckets
  bucketRow: {},
  bucketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bucketLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
  },
  bucketRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bucketValue: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
  },
  bucketChange: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  bucketContextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  bucketContext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  bucketAlloc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },

  // Priority
  priorityCard: {
    borderRadius: 16,
    padding: 20,
    paddingLeft: 16,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  priorityAction: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    letterSpacing: -0.8,
  },
  priorityReason: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 6,
  },
  priorityCta: { marginTop: 12 },
  priorityCtaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },

  // FIRE + watchlist
  fireRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fireLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  fireYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  fireYear: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    letterSpacing: -1.5,
  },
  firePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  firePillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  watchLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  watchDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    marginTop: 5,
    marginRight: 10,
  },
  watchText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },

  // Footer
  footer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
})
