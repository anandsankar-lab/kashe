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

// ─── Types ────────────────────────────────────────────────────────────────────

type FreshnessStatus = 'green' | 'amber' | 'red';
type HoldingVariant = 'live' | 'locked' | 'protection';
type HoldingBucket = 'GROWTH' | 'STABILITY' | 'LOCKED';

interface PortfolioHoldingRowProps {
  id?: string;
  variant: HoldingVariant;
  name: string;
  assetType: string;         // e.g. "Mutual Fund", "Cash", "Provident Fund"
  value: number;
  currency: string;          // '€' or '₹'
  bucket: HoldingBucket;
  geography: string;         // 'India', 'Europe', 'US', 'Global', etc.
  allocationPct?: number;    // 0–1 float
  freshnessStatus: FreshnessStatus;
  // live only
  dailyMovementPct?: number;
  // locked only
  unlockDate?: string;       // e.g. "Mar 2031"
  // protection only
  monthsCovered?: number;
  // empty state
  isRedacted?: boolean;
  // navigation
  onPress?: (id: string) => void;
}

// ─── HoldingTypeIcon (internal — not exported) ────────────────────────────────

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

  // Protection → shield + check
  if (variant === 'protection') {
    return (
      <Svg {...svgProps}>
        <Path
          d="M12 3 L20 7 V13 C20 17 12 21 12 21 C12 21 4 17 4 13 V7 Z"
          {...strokeProps}
        />
        <Path d="M9 13 L11.5 15.5 L16 10" {...strokeProps} />
      </Svg>
    );
  }

  // Locked → padlock
  if (variant === 'locked') {
    return (
      <Svg {...svgProps}>
        <Rect x={5} y={11} width={14} height={10} rx={2} {...strokeProps} />
        <Path d="M8 11 V8 a4 4 0 0 1 8 0 v3" {...strokeProps} />
      </Svg>
    );
  }

  // Live — India → rupee sign
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

  // Live — Europe / US / Global → trend line upward
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
  if (dailyMovementPct === undefined || dailyMovementPct === 0) {
    return textSecondary;
  }
  return dailyMovementPct > 0 ? colours.success : colours.danger;
}

function getCoveredColor(monthsCovered: number | undefined): string {
  if (monthsCovered === undefined || monthsCovered < 3) {
    return colours.warning;
  }
  return colours.success;
}

function getBarColor(
  variant: HoldingVariant,
  dailyMovementPct: number | undefined,
  monthsCovered: number | undefined,
  textDim: string,
): string {
  if (variant === 'live') {
    if (dailyMovementPct === undefined || dailyMovementPct === 0) {
      return textDim;
    }
    return dailyMovementPct > 0 ? colours.success : colours.danger;
  }
  if (variant === 'locked') {
    return textDim;
  }
  // protection
  if (monthsCovered === undefined || monthsCovered < 3) {
    return colours.warning;
  }
  return colours.success;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioHoldingRow({
  id,
  variant,
  name,
  assetType,
  value,
  currency,
  geography,
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
  const barColor = getBarColor(variant, dailyMovementPct, monthsCovered, theme.textDim);
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

  // Sub-label
  const subLabelText =
    variant === 'locked' ? `Locked until ${unlockDate ?? ''}` : `${assetType} · ${geography}`;

  // Asterisk direction (live variant only)
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
      style={Platform.OS === 'web' ? ({ outline: 'none' } as object) : undefined}
      onPress={onPress && id ? () => onPress(id) : undefined}
    >
      {/* Row content */}
      <View style={styles.rowContent}>
        {/* Icon — direct, no wrapping container, marginRight via nameContainer marginLeft */}
        <HoldingTypeIcon
          variant={variant}
          geography={geography}
          size={22}
          color={theme.textSecondary}
        />

        {/* Name + sub-label */}
        <View style={styles.nameContainer}>
          <Text style={[styles.holdingName, { color: theme.textPrimary }]}>
            {name}
          </Text>
          <Text style={[styles.subLabel, { color: theme.textSecondary }]}>
            {subLabelText}
          </Text>
        </View>

        {/* Right column: value + meta */}
        <View style={styles.rightColumn}>
          {/* Value row with freshness dot */}
          <View style={styles.valueRow}>
            <View style={[styles.freshnessDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.valueText, { color: theme.textPrimary }]}>
              {currency}{value.toLocaleString()}
            </Text>
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            {variant === 'live' && (
              <>
                <KasheAsterisk direction={asteriskDirection} size={11} />
                <Text style={[styles.metaText, { color: movementColor }]}>
                  {Math.abs(dailyMovementPct ?? 0).toFixed(1)}%
                </Text>
              </>
            )}
            {variant === 'locked' && (
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {((allocationPct ?? 0) * 100).toFixed(0)}% of portfolio
              </Text>
            )}
            {variant === 'protection' && (
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
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  holdingName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: -0.2,
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
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 3,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: -0.1,
    marginTop: 3,
  },
  barTrack: {
    marginHorizontal: 20,
    marginBottom: 2,
    height: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
});
