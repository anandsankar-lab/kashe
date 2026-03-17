import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path, Line, Polyline, Circle, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';
import KasheAsterisk from '../shared/KasheAsterisk';
import { getGeographyLabel } from '../../constants/displayLabels';

// ─── Types ────────────────────────────────────────────────────────────────────

type FreshnessStatus = 'green' | 'amber' | 'red';
type HoldingVariant = 'live' | 'locked' | 'protection';
type HoldingBucket = 'GROWTH' | 'STABILITY' | 'LOCKED';

interface PortfolioHoldingRowProps {
  id?: string;
  variant: HoldingVariant;
  name: string;
  assetType: string;
  value: number;
  currency: string;
  bucket: HoldingBucket;
  geography: string;
  domicile?: string;
  allocationPct?: number;
  freshnessStatus: FreshnessStatus;
  dailyMovementPct?: number;
  unlockDate?: string;
  monthsCovered?: number;
  isRedacted?: boolean;
  onPress?: (id: string) => void;
}

// ─── HoldingTypeIcon ──────────────────────────────────────────────────────────

interface HoldingTypeIconProps {
  variant: HoldingVariant;
  geography: string;
  size: number;
  color: string;
}

function HoldingTypeIcon({ variant, geography, size, color }: HoldingTypeIconProps) {
  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
  };
  const strokeProps = {
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (variant === 'protection') {
    return (
      <Svg {...svgProps}>
        <Path d="M12 3 L20 7 V13 C20 17 12 21 12 21 C12 21 4 17 4 13 V7 Z" {...strokeProps} />
        <Path d="M9 13 L11.5 15.5 L16 10" {...strokeProps} />
      </Svg>
    );
  }

  if (variant === 'locked') {
    return (
      <Svg {...svgProps}>
        <Rect x={5} y={11} width={14} height={10} rx={2} {...strokeProps} />
        <Path d="M8 11 V8 a4 4 0 0 1 8 0 v3" {...strokeProps} />
      </Svg>
    );
  }

  if (geography === 'India') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Line x1="5" y1="6" x2="19" y2="6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <Line x1="5" y1="11" x2="19" y2="11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <Line x1="5" y1="6" x2="5" y2="20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <Line x1="5" y1="11" x2="15" y2="20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg {...svgProps}>
      <Polyline points="3,18 8,12 13,15 21,6" {...strokeProps} />
      <Circle cx={21} cy={6} r={2} fill={color} {...strokeProps} />
    </Svg>
  );
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

function getDotColor(status: FreshnessStatus): string {
  switch (status) {
    case 'green': return colours.success;
    case 'amber': return colours.warning;
    case 'red':   return colours.danger;
  }
}

function getMovementColor(dailyMovementPct: number | undefined, textSecondary: string): string {
  if (dailyMovementPct === undefined || dailyMovementPct === 0) return textSecondary;
  return dailyMovementPct > 0 ? colours.success : colours.danger;
}

function getCoveredColor(monthsCovered: number | undefined): string {
  if (monthsCovered === undefined || monthsCovered < 3) return colours.warning;
  return colours.success;
}

function getBarFillColor(bucket: HoldingBucket, textDim: string): string {
  if (bucket === 'GROWTH') return colours.accent;
  if (bucket === 'STABILITY') return colours.warning;
  return textDim;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioHoldingRow({
  id,
  variant,
  name,
  assetType,
  value,
  currency,
  bucket,
  geography,
  domicile,
  allocationPct,
  freshnessStatus,
  dailyMovementPct,
  unlockDate,
  monthsCovered,
  isRedacted = false,
  onPress,
}: PortfolioHoldingRowProps) {
  const theme = useTheme();
  const barAnim = useRef(new Animated.Value(0)).current;

  const barFillPercent = isRedacted ? 0 : (allocationPct ?? 0);
  const barColor = getBarFillColor(bucket, theme.textDim);
  const dotColor = getDotColor(freshnessStatus);
  const movementColor = getMovementColor(dailyMovementPct, theme.textSecondary);
  const coveredColor = getCoveredColor(monthsCovered);

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: barFillPercent,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRedacted]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const lockedOutcomeUnknown = variant === 'locked' && !unlockDate;
  const subLabelText = variant === 'locked'
    ? (unlockDate ? `Locked until ${unlockDate}` : 'Outcome unknown')
    : `${assetType} · ${domicile ?? getGeographyLabel(geography)}`;

  let asteriskDirection: 'up' | 'down' | 'neutral';
  if (dailyMovementPct === undefined || dailyMovementPct === 0) {
    asteriskDirection = 'neutral';
  } else if (dailyMovementPct > 0) {
    asteriskDirection = 'up';
  } else {
    asteriskDirection = 'down';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.outer,
        Platform.OS === 'web' ? ({ outline: 'none' } as object) : undefined,
      ]}
      onPress={onPress && id ? () => onPress(id) : undefined}
    >
      {/* Row content */}
      <View style={styles.rowContent}>
        <HoldingTypeIcon
          variant={variant}
          geography={geography}
          size={22}
          color={theme.textSecondary}
        />

        <View style={styles.nameContainer}>
          {isRedacted ? (
            <View style={[styles.redactedName, { backgroundColor: theme.border }]} />
          ) : (
            <Text style={[styles.holdingName, { color: theme.textPrimary }]}>
              {name}
            </Text>
          )}
          {!(variant === 'locked' && isRedacted) && (
            <Text style={[styles.subLabel, { color: lockedOutcomeUnknown ? theme.textDim : theme.textSecondary }]}>
              {subLabelText}
            </Text>
          )}
        </View>

        <View style={styles.rightColumn}>
          <View style={styles.valueRow}>
            {!isRedacted && <View style={[styles.freshnessDot, { backgroundColor: dotColor }]} />}
            {!isRedacted && (
              <Text style={[styles.valueText, { color: theme.textPrimary }]}>
                {currency}{value.toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.metaRow}>
            {variant === 'live' && !isRedacted && (
              <>
                <KasheAsterisk direction={asteriskDirection} size={11} />
                <Text style={[styles.metaText, { color: movementColor }]}>
                  {Math.abs(dailyMovementPct ?? 0).toFixed(1)}%
                </Text>
              </>
            )}
            {variant === 'locked' && !isRedacted && (
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {((allocationPct ?? 0) * 100).toFixed(0)}% of portfolio
              </Text>
            )}
            {variant === 'protection' && !isRedacted && (
              <Text style={[styles.metaText, { color: coveredColor }]}>
                {monthsCovered?.toFixed(1)} months covered
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Allocation bar */}
      <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
        <Animated.View
          style={[styles.barFill, { width: barWidth, backgroundColor: barColor }]}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outer: {
    marginBottom: 4,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  holdingName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  redactedName: {
    width: 120,
    height: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
  subLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freshnessDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  valueText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  barTrack: {
    marginHorizontal: 0,
    marginTop: 10,
    marginBottom: 0,
    height: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
});
