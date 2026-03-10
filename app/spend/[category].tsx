import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import colours from '../../constants/colours';
import { MOCK_SUBCATEGORIES, MOCK_SUBCATEGORIES_BY_CATEGORY, MOCK_TAGS } from '../../constants/mockData';
import { SpendTransaction } from '../../types/spend';
import SpendTransactionRow from '../../components/spend/SpendTransactionRow';
import TagFilterPills from '../../components/spend/TagFilterPills';
import TransactionEditSheet from '../../components/spend/TransactionEditSheet';
import BulkTagSheet from '../../components/spend/BulkTagSheet';
import CategoryIcon from '../../components/spend/CategoryIcon';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatTotal(amount: number): string {
  return `€${amount.toLocaleString('en-EU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getSubcategoryIcon(subcategoryId: string, parentCategoryId: string): string {
  const overrides: Record<string, string> = {
    delivery: 'eating_out',
    restaurants: 'eating_out',
    lunch: 'eating_out',
    coffee: 'eating_out',
    supermarket: 'groceries',
    online: 'shopping',
    fuel: 'transport',
    public_transport: 'transport',
  };
  return overrides[subcategoryId] ?? parentCategoryId;
}

export default function CategoryDetailScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const bg = theme.background;
  const surface = theme.surface;
  const border = theme.border;

  // Month selector state — default March 2026
  const [selectedMonth, setSelectedMonth] = useState({ month: 2, year: 2026 });

  // Subcategory expand state
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null);

  // Tag filter state
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Bulk selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  // Sheet state
  const [editingTransaction, setEditingTransaction] = useState<SpendTransaction | null>(null);
  const [showBulkTagSheet, setShowBulkTagSheet] = useState(false);

  // Edit tip (one-time)
  const [showEditTip, setShowEditTip] = useState(true);

  // Chevron animation refs per subcategory
  const chevronAnims = useRef<Map<string, Animated.Value>>(new Map());

  function getChevronAnim(id: string): Animated.Value {
    if (!chevronAnims.current.has(id)) {
      chevronAnims.current.set(id, new Animated.Value(0));
    }
    return chevronAnims.current.get(id)!;
  }

  // Computed values
  const subcategories = MOCK_SUBCATEGORIES_BY_CATEGORY[category ?? ''] ?? MOCK_SUBCATEGORIES;
  const allTransactions = subcategories.flatMap((s) => s.transactions);
  const totalAmount = allTransactions.reduce((sum, t) => sum + t.amount, 0);

  const availableTags = Array.from(
    new Set(allTransactions.flatMap((t) => t.tags ?? []))
  );

  const filteredTransactions =
    activeTags.length === 0
      ? allTransactions
      : allTransactions.filter((t) =>
          activeTags.every((tag) => (t.tags ?? []).includes(tag))
        );

  const filteredSubcategories = subcategories.map((sub) => ({
    ...sub,
    transactions: sub.transactions.filter(
      (t) =>
        activeTags.length === 0 ||
        activeTags.every((tag) => (t.tags ?? []).includes(tag))
    ),
  })).filter((sub) => sub.transactions.length > 0);

  const filteredTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Month navigation
  const now = new Date();
  const isAtCurrentMonth =
    selectedMonth.month === now.getMonth() && selectedMonth.year === now.getFullYear();

  function handlePrevMonth() {
    setSelectedMonth((prev) => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  }

  function handleNextMonth() {
    if (isAtCurrentMonth) return;
    setSelectedMonth((prev) => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { month: prev.month + 1, year: prev.year };
    });
  }

  // Tag toggle
  function handleTagToggle(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  // Subcategory toggle with chevron animation
  function handleSubcategoryToggle(id: string) {
    const isExpanding = expandedSubcategory !== id;

    // Collapse previous
    if (expandedSubcategory !== null && expandedSubcategory !== id) {
      Animated.timing(getChevronAnim(expandedSubcategory), {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }

    setExpandedSubcategory(isExpanding ? id : null);

    Animated.timing(getChevronAnim(id), {
      toValue: isExpanding ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }

  // Transaction press handlers
  function handleTransactionPress(t: SpendTransaction) {
    if (isSelectionMode) {
      setSelectedTransactions((prev) =>
        prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id]
      );
    } else {
      setShowEditTip(false);
      setEditingTransaction(t);
    }
  }

  function handleTransactionLongPress(t: SpendTransaction) {
    setIsSelectionMode(true);
    setSelectedTransactions([t.id]);
  }

  function handleCancelSelection() {
    setIsSelectionMode(false);
    setSelectedTransactions([]);
  }

  function handleSelectAll() {
    setSelectedTransactions(filteredTransactions.map((t) => t.id));
  }

  const categoryLabel = category
    ? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Category';

  const bulkDisabled = selectedTransactions.length === 0;

  return (
    <View style={[styles.screen, { backgroundColor: bg, paddingTop: insets.top }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        {isSelectionMode ? (
          <>
            <TouchableOpacity
            onPress={handleCancelSelection}
            style={[styles.headerSideBtn, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
          >
              <Text style={[styles.cancelText, { color: colours.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <Text style={[styles.selectionCount, { color: colours.textPrimary }]}>
              {selectedTransactions.length} selected
            </Text>

            <TouchableOpacity
              onPress={handleSelectAll}
              style={[styles.headerSideBtn, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
            >
              <Text style={[styles.selectAllText, { color: colours.accent }]}>All</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
            >
              <Text style={[styles.backChevron, { color: colours.textPrimary }]}>‹</Text>
            </TouchableOpacity>

            <Text style={[styles.title, { color: colours.textPrimary }]} numberOfLines={1}>
              {categoryLabel}
            </Text>
          </>
        )}
      </View>

      {/* ── SUMMARY ROW ── */}
      <View style={[styles.summaryRow, { borderBottomColor: border }]}>
        <Text style={[styles.summaryCount, { color: colours.textDim }]}>
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Text>
        {activeTags.length > 0 ? (
          <Text style={[styles.summaryAmount, { color: colours.textPrimary }]}>
            {formatTotal(filteredTotal)} of {formatTotal(totalAmount)}
          </Text>
        ) : (
          <Text style={[styles.summaryAmount, { color: colours.textPrimary }]}>
            {formatTotal(totalAmount)} this month
          </Text>
        )}
      </View>

      {/* ── EDIT TIP ── */}
      {showEditTip && !isSelectionMode && (
        <View style={[styles.editTip, { backgroundColor: surface, borderBottomColor: border }]}>
          <View style={styles.editTipPencil}>
            <Text style={{ color: colours.textDim, fontSize: 12 }}>✏</Text>
          </View>
          <Text style={[styles.editTipText, { color: colours.textDim }]}>
            Tap to edit · Long press to select multiple
          </Text>
          <TouchableOpacity
            onPress={() => setShowEditTip(false)}
            style={[styles.editTipDismiss, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
          >
            <Text style={[styles.editTipDismissText, { color: colours.textDim }]}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── MONTH SELECTOR ── */}
      <View style={styles.monthRow}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={[styles.monthChevronBtn, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
        >
          <Text style={[styles.monthChevron, { color: colours.textSecondary }]}>‹</Text>
        </TouchableOpacity>

        <Text style={[styles.monthLabel, { color: colours.textPrimary }]}>
          {MONTH_NAMES[selectedMonth.month]} {selectedMonth.year}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={[styles.monthChevronBtn, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
          disabled={isAtCurrentMonth}
        >
          <Text
            style={[
              styles.monthChevron,
              { color: isAtCurrentMonth ? colours.textDim : colours.textSecondary },
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TAG FILTER PILLS ── */}
      {availableTags.length > 0 && (
        <TagFilterPills
          availableTags={availableTags}
          activeTags={activeTags}
          onTagToggle={handleTagToggle}
          onClearAll={() => setActiveTags([])}
        />
      )}

      {/* ── SUBCATEGORY LIST ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isSelectionMode ? 100 + insets.bottom : insets.bottom + 24 },
        ]}
      >
        {filteredSubcategories.map((sub, subIndex) => {
          const isExpanded = expandedSubcategory === sub.id;
          const chevronAnim = getChevronAnim(sub.id);
          const rotation = chevronAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg'],
          });

          return (
            <View key={sub.id}>
              {/* Subcategory gap between groups */}
              {subIndex > 0 && (
                <View style={[styles.subgroupGap, { backgroundColor: bg }]} />
              )}

              {/* Subcategory header */}
              <TouchableOpacity
                onPress={() => handleSubcategoryToggle(sub.id)}
                activeOpacity={0.7}
                style={[
                  styles.subcategoryHeader,
                  { backgroundColor: surface },
                  Platform.OS === 'web' && ({ outline: 'none' } as object),
                ]}
              >
                <View style={styles.subcategoryLeft}>
                  <CategoryIcon
                    categoryId={getSubcategoryIcon(sub.id, category ?? '')}
                    size={16}
                    color={colours.textDim}
                  />
                  <Text style={[styles.subcategoryName, { color: colours.textPrimary, marginLeft: 10 }]}>
                    {sub.name}
                  </Text>
                  <Text style={[styles.subcategoryCount, { color: colours.textDim }]}>
                    {' · '}
                    {sub.transactionCount} transaction{sub.transactionCount !== 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.subcategoryRight}>
                  <Text style={[styles.subcategoryAmount, { color: colours.textPrimary }]}>
                    {formatTotal(sub.amount)}
                  </Text>
                  <Animated.Text
                    style={[
                      styles.expandChevron,
                      { color: colours.textDim, transform: [{ rotate: rotation }] },
                    ]}
                  >
                    ›
                  </Animated.Text>
                </View>
              </TouchableOpacity>

              {/* Transactions (when expanded) — indented with accent left border */}
              {isExpanded && (
                <View style={[styles.transactionIndent, { borderLeftColor: 'rgba(200, 240, 74, 0.3)', backgroundColor: bg }]}>
                  {sub.transactions.map((t, tIndex) => (
                    <View key={t.id}>
                      {tIndex > 0 && (
                        <View
                          style={[
                            styles.transactionSeparator,
                            { backgroundColor: border },
                          ]}
                        />
                      )}
                      <SpendTransactionRow
                        transaction={t}
                        onPress={() => handleTransactionPress(t)}
                        onLongPress={() => handleTransactionLongPress(t)}
                        isSelected={selectedTransactions.includes(t.id)}
                        isSelectionMode={isSelectionMode}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ── BULK ACTION BAR ── */}
      {isSelectionMode && (
        <View
          style={[
            styles.bulkBar,
            {
              backgroundColor: surface,
              borderTopColor: border,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.bulkBtn,
              { backgroundColor: colours.accent },
              bulkDisabled && styles.bulkDisabled,
              Platform.OS === 'web' && ({ outline: 'none' } as object),
            ]}
            onPress={() => setShowBulkTagSheet(true)}
            disabled={bulkDisabled}
            activeOpacity={0.8}
          >
            <Text style={[styles.bulkBtnText, { color: theme.textOnAccent }]}>🏷 Tag selected</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bulkBtn,
              { backgroundColor: surface, borderWidth: 1, borderColor: border },
              bulkDisabled && styles.bulkDisabled,
              Platform.OS === 'web' && ({ outline: 'none' } as object),
            ]}
            onPress={() => console.log('Recategorise', selectedTransactions)}
            disabled={bulkDisabled}
            activeOpacity={0.8}
          >
            <Text style={[styles.bulkBtnText, { color: colours.textPrimary }]}>
              ↩ Recategorise
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── TRANSACTION EDIT SHEET ── */}
      <TransactionEditSheet
        transaction={editingTransaction}
        isVisible={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
        onSave={(updated) => {
          console.log('Transaction updated:', updated);
          setEditingTransaction(null);
        }}
        availableTags={MOCK_TAGS}
      />

      {/* ── BULK TAG SHEET ── */}
      <BulkTagSheet
        isVisible={showBulkTagSheet}
        onClose={() => setShowBulkTagSheet(false)}
        selectedCount={selectedTransactions.length}
        availableTags={MOCK_TAGS}
        onApply={(tags) => {
          console.log('Bulk tags applied:', tags, 'to', selectedTransactions);
          setIsSelectionMode(false);
          setSelectedTransactions([]);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    marginRight: 12,
  },
  backChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 28,
    lineHeight: 32,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    letterSpacing: -0.8,
    flex: 1,
  },
  headerSideBtn: {
    minWidth: 56,
  },
  cancelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  selectionCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    flex: 1,
    textAlign: 'center',
  },
  selectAllText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    textAlign: 'right',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    marginBottom: 0,
  },
  monthChevronBtn: {
    padding: 4,
  },
  monthChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
  },
  monthLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  summaryCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  summaryAmount: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
  },
  editTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  editTipPencil: {
    width: 16,
    alignItems: 'center',
  },
  editTipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    flex: 1,
  },
  editTipDismiss: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editTipDismissText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
  },
  subgroupGap: {
    height: 8,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  subcategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  subcategoryName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  subcategoryCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  subcategoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subcategoryAmount: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
  },
  expandChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  transactionSeparator: {
    height: 1,
  },
  transactionIndent: {
    marginLeft: 20,
    borderLeftWidth: 2,
  },
  bulkBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  bulkBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    textAlign: 'center',
  },
  bulkDisabled: {
    opacity: 0.5,
  },
});
