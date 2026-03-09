import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colours from '../../constants/colours';
import MacronRule from '../shared/MacronRule';
import RedactedNumber from '../shared/RedactedNumber';
import SpendCategoryRow from './SpendCategoryRow';
import { SpendCategory, SpendCategoryId } from '../../types/spend';

interface Props {
  categories: SpendCategory[];
  onCategoryPress: (id: SpendCategoryId) => void;
  isRedacted?: boolean;
  profileFilter: 'household' | string;
}

const COLLAPSED_COUNT = 5;
const ROW_HEIGHT = 78; // estimated px per standard row

function computeInsightLine(cat: SpendCategory): string | null {
  if (cat.isMortgage) {
    return `incl. €${cat.amount.toLocaleString()} mortgage — tracked as liability`;
  }

  const { hasHistory, vsAverage, topMerchants, amount, totalMonthSpend, budgetAmount } = cat;

  if (hasHistory && vsAverage !== null && vsAverage > 50) {
    return `↑ ${vsAverage}% above your average`;
  }
  if (hasHistory && vsAverage !== null && vsAverage > 20) {
    return 'Slightly higher than usual this month';
  }
  if (topMerchants.length >= 2) {
    return `Mostly ${topMerchants[0]} and ${topMerchants[1]}`;
  }
  if (topMerchants.length === 1) {
    return `Mostly ${topMerchants[0]} this month`;
  }
  if (!hasHistory && totalMonthSpend > 0 && amount / totalMonthSpend > 0.2) {
    return `${Math.round((amount / totalMonthSpend) * 100)}% of your total spend this month`;
  }
  if (budgetAmount !== null && amount >= budgetAmount * 0.8 && amount < budgetAmount) {
    return `€${Math.round(budgetAmount - amount)} remaining this month`;
  }
  if (budgetAmount !== null && amount >= budgetAmount) {
    return `Over budget by €${Math.round(amount - budgetAmount)}`;
  }
  return null;
}

export default function SpendCategoryList({
  categories,
  onCategoryPress,
  isRedacted = false,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  const peekOpacityAnim = useRef(new Animated.Value(0.35)).current;
  const slidingHeightAnim = useRef(new Animated.Value(0)).current;

  // Step 1: Filter excluded
  const nonExcluded = categories.filter((c) => !c.isExcluded);

  // Step 2: Score each category
  const scored = nonExcluded.map((cat) => ({
    cat,
    score: cat.hasHistory
      ? cat.anomalyScore
      : cat.totalMonthSpend > 0
      ? cat.amount / cat.totalMonthSpend
      : 0,
  }));

  // Step 3: Budget override
  const adjusted = scored.map(({ cat, score }) => ({
    cat,
    score:
      cat.budgetAmount !== null && cat.amount >= cat.budgetAmount * 0.8
        ? score + 10
        : score,
  }));

  // Step 4: Sort descending
  const sorted = [...adjusted].sort((a, b) => b.score - a.score).map(({ cat }) => cat);

  // Step 5: Enrich top 5 with insightLine if not already set
  const enriched = sorted.map((cat, index) => {
    if (index >= COLLAPSED_COUNT) return cat;
    if (cat.insightLine !== null) return cat;
    return { ...cat, insightLine: computeInsightLine(cat) };
  });

  const visibleRows = enriched.slice(0, COLLAPSED_COUNT);
  const peekRow = enriched.length > COLLAPSED_COUNT ? enriched[COLLAPSED_COUNT] : null;
  const slidingRows =
    enriched.length > COLLAPSED_COUNT + 1 ? enriched.slice(COLLAPSED_COUNT + 1) : [];
  const hasExtraRows = peekRow !== null;

  // Recurring strip
  const recurringCategories = enriched.filter((c) => c.isRecurring);
  const recurringCount = recurringCategories.length;
  const recurringTotal = recurringCategories.reduce((sum, c) => sum + c.amount, 0);

  function handleExpand() {
    setIsExpanded(true);

    Animated.timing(peekOpacityAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (slidingRows.length > 0) {
      Animated.timing(slidingHeightAnim, {
        toValue: slidingRows.length * ROW_HEIGHT,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }

  function handleCollapse() {
    Animated.timing(peekOpacityAnim, {
      toValue: 0.35,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && slidingRows.length === 0) setIsExpanded(false);
    });

    if (slidingRows.length > 0) {
      Animated.timing(slidingHeightAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) setIsExpanded(false);
      });
    }
  }

  const borderColor = isDark ? colours.borderDark : colours.border;
  const surfaceColor = isDark ? colours.surfaceDark : colours.surface;

  const fadeColors: readonly [string, string] = isDark
    ? ['rgba(17, 17, 16, 0)', '#111110']
    : ['rgba(245, 244, 240, 0)', '#F5F4F0'];

  function renderSeparator(key?: string) {
    return (
      <View
        key={key}
        style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 20 }}
      />
    );
  }

  return (
    <View>
      {/* Section label */}
      <Text style={[styles.sectionLabel, { color: colours.textDim }]}>CATEGORIES</Text>

      {/* Top 5 visible rows with optional fade gradient */}
      <View style={{ position: 'relative' }}>
        {visibleRows.map((cat, index) => (
          <React.Fragment key={cat.id}>
            {index > 0 && renderSeparator()}
            <SpendCategoryRow
              category={cat}
              onPress={() => onCategoryPress(cat.id)}
              isRedacted={isRedacted}
            />
          </React.Fragment>
        ))}

        {/* Fade gradient — only when collapsed and extra rows exist */}
        {!isExpanded && hasExtraRows && (
          <LinearGradient
            colors={fadeColors}
            style={styles.fadeGradient}
            pointerEvents="none"
          />
        )}
      </View>

      {/* Peek row (6th) and sliding rows */}
      {hasExtraRows && peekRow && (
        <>
          {renderSeparator('peek-sep')}
          <Animated.View style={{ opacity: peekOpacityAnim }}>
            <SpendCategoryRow
              category={peekRow}
              onPress={() => onCategoryPress(peekRow.id)}
              isRedacted={isRedacted}
            />
          </Animated.View>
        </>
      )}

      {/* Sliding rows (7+) — animated height container */}
      {slidingRows.length > 0 && (
        <Animated.View style={{ height: slidingHeightAnim, overflow: 'hidden' }}>
          {slidingRows.map((cat) => (
            <React.Fragment key={cat.id}>
              {renderSeparator(`sep-${cat.id}`)}
              <SpendCategoryRow
                category={cat}
                onPress={() => onCategoryPress(cat.id)}
                isRedacted={isRedacted}
              />
            </React.Fragment>
          ))}
        </Animated.View>
      )}

      {/* Expand / collapse button */}
      {hasExtraRows && (
        <View style={styles.expandButtonContainer}>
          <TouchableOpacity
            onPress={isExpanded ? handleCollapse : handleExpand}
            style={styles.expandButton}
            activeOpacity={0.8}
          >
            <Text style={styles.expandButtonLabel}>
              {isExpanded
                ? 'Show less ↑'
                : `Show all ${enriched.length} categories  ↓`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recurring strip */}
      {recurringCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.recurringStrip, { backgroundColor: surfaceColor }]}
        >
          <Text style={[styles.recurringIcon, { color: colours.textDim }]}>↻</Text>
          <View style={styles.recurringTextRow}>
            {isRedacted ? (
              <>
                <RedactedNumber length={1} style={styles.recurringAmount} />
                <Text style={[styles.recurringText, { color: colours.textSecondary }]}>
                  {' recurring charges '}
                </Text>
                <Text style={{ color: colours.textDim, fontFamily: 'Inter_400Regular', fontSize: 14 }}>·</Text>
                <Text style={[styles.recurringText, { color: colours.textSecondary }]}>{' €'}</Text>
                <RedactedNumber length={3} style={styles.recurringAmount} />
                <Text style={[styles.recurringText, { color: colours.textSecondary }]}>/month</Text>
              </>
            ) : (
              <>
                <Text style={[styles.recurringText, { color: colours.textSecondary }]}>
                  {recurringCount} recurring charges
                </Text>
                <Text style={[styles.recurringText, { color: colours.textDim }]}>{' · '}</Text>
                <Text style={[styles.recurringText, { color: colours.textSecondary }]}>
                  €{Math.round(recurringTotal)}/month
                </Text>
              </>
            )}
          </View>
          <Text style={[styles.recurringChevron, { color: colours.textDim }]}>›</Text>
        </TouchableOpacity>
      )}

      {/* Section separator */}
      <MacronRule style={{ marginHorizontal: 20, marginTop: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  fadeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  expandButtonContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  expandButton: {
    backgroundColor: colours.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  expandButtonLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#111110',
    letterSpacing: -0.2,
  },
  recurringStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  recurringIcon: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginRight: 8,
  },
  recurringTextRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  recurringText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  recurringAmount: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  recurringChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    marginLeft: 8,
  },
});
