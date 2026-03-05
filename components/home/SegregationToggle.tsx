import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import Card from '../ui/Card';
import colours from '../../constants/colours';
import Typography from '../../constants/typography';
import Spacing, { borderRadius } from '../../constants/spacing';
import RedactedNumber from '../shared/RedactedNumber';

type ViewMode = 'risk' | 'vehicle' | 'geography';

const RISK_DATA = [
  { key: 'MEDIUM', label: 'Medium', actual: 68, target: 60 },
  { key: 'HIGH', label: 'High', actual: 22, target: 20 },
  { key: 'CASH', label: 'Cash / Low', actual: 10, target: 20 },
] as const;

const VEHICLE_DATA = [
  { key: 'mf', label: 'Mutual Funds', pct: 35 },
  { key: 'equity', label: 'Direct Equity', pct: 20 },
  { key: 'etf', label: 'ETFs', pct: 25 },
  { key: 'employer', label: 'Employer Stock', pct: 10 },
  { key: 'crypto', label: 'Crypto', pct: 5 },
  { key: 'cash', label: 'Cash & Savings', pct: 5 },
] as const;

const GEOGRAPHY_DATA = [
  { key: 'india', label: 'India', flag: '\u{1F1EE}\u{1F1F3}', pct: 45 },
  { key: 'europe', label: 'Europe', flag: '\u{1F1EA}\u{1F1FA}', pct: 40 },
  { key: 'us', label: 'US', flag: '\u{1F1FA}\u{1F1F8}', pct: 10 },
  { key: 'other', label: 'Other', flag: '\u{1F30D}', pct: 5 },
] as const;

const BAR_HEIGHT = 6;
const VARIANCE_THRESHOLD = 5;

const TABS: { key: ViewMode; label: string }[] = [
  { key: 'risk', label: 'Risk' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'geography', label: 'Geography' },
];

function getRiskBarColour(actual: number, target: number): string {
  const diff = actual - target;
  if (Math.abs(diff) <= VARIANCE_THRESHOLD) return colours.accent;
  if (diff > 0) return colours.warning;
  return colours.textDim;
}

interface AnimatedBarProps {
  pct: number;
  colour: string;
  viewKey: string;
}

function AnimatedBar({ pct, colour, viewKey }: AnimatedBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    widthAnim.setValue(0);
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [viewKey]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={{
        height: BAR_HEIGHT,
        width: animatedWidth,
        backgroundColor: colour,
        borderRadius: borderRadius.pill,
      }}
    />
  );
}

interface ViewProps {
  viewKey: string;
  trackColor: string;
  isRedacted?: boolean;
}

function RiskView({ viewKey, trackColor, isRedacted = false }: ViewProps) {
  return (
    <View style={{ gap: Spacing.lg }}>
      {RISK_DATA.map(item => {
        const diff = item.actual - item.target;
        const barColour = getRiskBarColour(item.actual, item.target);
        const isOver = diff > VARIANCE_THRESHOLD;
        const isUnder = diff < -VARIANCE_THRESHOLD;
        const hasVariance = isOver || isUnder;
        const varianceColour = isOver ? colours.warning : colours.textDim;

        return (
          <View key={item.key}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Spacing.xs,
              }}
            >
              <Text style={[Typography.label, { color: colours.textSecondary }]}>
                {item.label}
              </Text>
              {isRedacted ? (
                <RedactedNumber length={2} style={{ fontSize: 12 }} />
              ) : (
                <Text style={[Typography.caption, { color: colours.textSecondary }]}>
                  {item.actual}%
                </Text>
              )}
            </View>
            <View
              style={{
                height: BAR_HEIGHT,
                backgroundColor: trackColor,
                borderRadius: borderRadius.pill,
                overflow: 'hidden',
              }}
            >
              {/* Ghost target bar */}
              {!isRedacted && (
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: BAR_HEIGHT,
                    width: `${item.target}%`,
                    backgroundColor: colours.textSecondary,
                    borderRadius: borderRadius.pill,
                    opacity: 0.2,
                  }}
                />
              )}
              {/* Actual bar */}
              <AnimatedBar pct={isRedacted ? 40 : item.actual} colour={barColour} viewKey={viewKey} />
            </View>
            {!isRedacted && hasVariance && (
              <Text
                style={[
                  Typography.caption,
                  { color: varianceColour, marginTop: Spacing.xs },
                ]}
              >
                {isOver
                  ? `⚠ Overweight ${item.label} by ${diff}%`
                  : `⚠ Underweight ${item.label} by ${Math.abs(diff)}%`}
              </Text>
            )}
            {isRedacted && hasVariance && (
              <Text
                style={[
                  Typography.caption,
                  { color: varianceColour, marginTop: Spacing.xs },
                ]}
              >
                {isOver
                  ? `⚠ Overweight ${item.label} by XX%`
                  : `⚠ Underweight ${item.label} by XX%`}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function VehicleView({ viewKey, trackColor, isRedacted = false }: ViewProps) {
  return (
    <View style={{ gap: Spacing.md }}>
      {VEHICLE_DATA.map(item => (
        <View key={item.key}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: Spacing.xs,
            }}
          >
            <Text style={[Typography.caption, { color: colours.textPrimary }]}>
              {item.label}
            </Text>
            {isRedacted ? (
              <RedactedNumber length={2} style={{ fontSize: 12 }} />
            ) : (
              <Text style={[Typography.caption, { color: colours.textSecondary }]}>
                {item.pct}%
              </Text>
            )}
          </View>
          <View
            style={{
              height: BAR_HEIGHT,
              backgroundColor: trackColor,
              borderRadius: borderRadius.pill,
              overflow: 'hidden',
            }}
          >
            <AnimatedBar pct={isRedacted ? 40 : item.pct} colour={colours.accent} viewKey={viewKey} />
          </View>
        </View>
      ))}
    </View>
  );
}

function GeographyView({ viewKey, trackColor, isRedacted = false }: ViewProps) {
  return (
    <View style={{ gap: Spacing.md }}>
      {GEOGRAPHY_DATA.map(item => (
        <View key={item.key}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: Spacing.xs,
            }}
          >
            <Text style={[Typography.caption, { color: colours.textPrimary }]}>
              {item.flag} {item.label}
            </Text>
            {isRedacted ? (
              <RedactedNumber length={2} style={{ fontSize: 12 }} />
            ) : (
              <Text style={[Typography.caption, { color: colours.textSecondary }]}>
                {item.pct}%
              </Text>
            )}
          </View>
          <View
            style={{
              height: BAR_HEIGHT,
              backgroundColor: trackColor,
              borderRadius: borderRadius.pill,
              overflow: 'hidden',
            }}
          >
            <AnimatedBar pct={isRedacted ? 40 : item.pct} colour={colours.accent} viewKey={viewKey} />
          </View>
        </View>
      ))}
    </View>
  );
}

type SegregationToggleProps = {
  isRedacted?: boolean;
};

export default function SegregationToggle({ isRedacted = false }: SegregationToggleProps) {
  const [view, setView] = useState<ViewMode>('risk');
  const isDark = useColorScheme() === 'dark';

  const selectorBg = isDark ? colours.backgroundDark : colours.background;
  const trackColor = isDark ? colours.borderDark : colours.border;

  const surfaceBg = isDark ? colours.surfaceDark : colours.surface;

  return (
    <Card style={{ backgroundColor: surfaceBg, padding: 16, borderRadius: 16 }}>
      {/* Pill selector */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: selectorBg,
          borderRadius: borderRadius.pill,
          padding: 3,
          marginBottom: Spacing.lg,
        }}
      >
        {TABS.map(tab => {
          const isSelected = view === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setView(tab.key)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: Spacing.sm,
                borderRadius: borderRadius.pill,
                backgroundColor: isSelected ? colours.accent : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  Typography.label,
                  {
                    color: isSelected ? colours.textPrimary : colours.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* View content */}
      {view === 'risk' && <RiskView viewKey={view} trackColor={trackColor} isRedacted={isRedacted} />}
      {view === 'vehicle' && <VehicleView viewKey={view} trackColor={trackColor} isRedacted={isRedacted} />}
      {view === 'geography' && <GeographyView viewKey={view} trackColor={trackColor} isRedacted={isRedacted} />}
    </Card>
  );
}
