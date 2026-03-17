import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg'
import { useTheme } from '../../context/ThemeContext'
import colours from '../../constants/colours'
import { PortfolioHolding } from '../../types/portfolio'

interface Props {
  holding: PortfolioHolding
  currency: string
}

function generateMockHistory(
  currentValue: number,
  days: number
): { date: string; value: number }[] {
  const points: { date: string; value: number }[] = []
  let value = currentValue * 0.82
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    value = value * (1 + (Math.random() - 0.46) * 0.015)
    points.push({
      date: date.toISOString().split('T')[0],
      value,
    })
  }
  points[points.length - 1].value = currentValue
  return points
}

const TAB_DAYS: Record<'1M' | '6M' | '1Y', number> = {
  '1M': 30,
  '6M': 180,
  '1Y': 365,
}

const CHART_HEIGHT = 140

export default function HoldingPriceChart({ holding, currency: _currency }: Props) {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<'1M' | '6M' | '1Y'>('1M')
  const [chartWidth, setChartWidth] = useState(300)

  if (
    holding.assetSubtype === 'cash_general' ||
    holding.assetSubtype === 'in_ppf' ||
    holding.assetSubtype === 'in_epf' ||
    holding.assetSubtype === 'in_fd' ||
    holding.assetSubtype === 'in_nsc' ||
    holding.assetSubtype === 'eu_pension' ||
    holding.assetSubtype === 'alternative_general' ||
    holding.bucket === 'LOCKED'
  ) {
    return null
  }

  const days = TAB_DAYS[activeTab]
  const data = generateMockHistory(holding.currentValue, days)

  const isUp = data[data.length - 1].value >= data[0].value
  const lineColor = isUp ? colours.accent : colours.danger

  const minVal = Math.min(...data.map(d => d.value))
  const maxVal = Math.max(...data.map(d => d.value))
  const padding = { top: 10, bottom: 20 }
  const range = maxVal - minVal || 1

  const svgPoints = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartWidth,
    y:
      padding.top +
      (1 - (d.value - minVal) / range) *
        (CHART_HEIGHT - padding.top - padding.bottom),
  }))

  const linePath = svgPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')

  const fillPath =
    linePath +
    ` L ${svgPoints[svgPoints.length - 1].x.toFixed(2)} ${CHART_HEIGHT}` +
    ` L 0 ${CHART_HEIGHT} Z`

  const lastPoint = svgPoints[svgPoints.length - 1]
  const firstDate = data[0].date
  const midDate = data[Math.floor(data.length / 2)].date
  const lastDate = data[data.length - 1].date

  return (
    <View style={styles.container}>
      {/* Tab row */}
      <View style={styles.tabRow}>
        {(['1M', '6M', '1Y'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab
                  ? { color: colours.accent, fontFamily: 'Inter_500Medium' }
                  : { color: theme.textSecondary, fontFamily: 'Inter_400Regular' },
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart container — bleeds to card edges */}
      <View
        style={styles.chartContainer}
        onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
      >
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0%"
                stopColor={isUp ? colours.accent : colours.danger}
                stopOpacity={isUp ? 0.25 : 0.15}
              />
              <Stop
                offset="100%"
                stopColor={isUp ? colours.accent : colours.danger}
                stopOpacity={0}
              />
            </LinearGradient>
          </Defs>
          <Path d={fillPath} fill="url(#priceGradient)" />
          <Path d={linePath} stroke={lineColor} strokeWidth={1.5} fill="none" />
          <Circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill={lineColor} />
        </Svg>

        {/* X-axis labels */}
        <View style={styles.xAxisRow}>
          <Text style={[styles.xLabel, { color: theme.textDim, textAlign: 'left' }]}>
            {firstDate}
          </Text>
          <Text style={[styles.xLabel, { color: theme.textDim, textAlign: 'center' }]}>
            {midDate}
          </Text>
          <Text style={[styles.xLabel, { color: theme.textDim, textAlign: 'right' }]}>
            {lastDate}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  tabText: {
    fontSize: 13,
  },
  tabUnderline: {
    height: 2,
    width: '100%',
    backgroundColor: colours.accent,
    marginTop: 2,
  },
  chartContainer: {
    height: 140,
    marginHorizontal: -20,
  },
  xAxisRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  xLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
  },
})
