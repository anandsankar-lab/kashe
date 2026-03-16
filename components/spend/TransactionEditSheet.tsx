import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';
import { SpendTransaction, SpendCategory, SUBCATEGORIES, CATEGORY_META } from '../../types/spend';
import CategoryIcon from './CategoryIcon';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORIES = CATEGORY_META
  .filter((m) => !['income', 'investment_transfer', 'transfer'].includes(m.id))
  .map((m) => ({ id: m.id as SpendCategory, name: m.label }));

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

interface Props {
  transaction: SpendTransaction | null;
  isVisible: boolean;
  onClose: () => void;
  onSave: (updated: {
    category: string;
    subcategory: string | undefined;
    tags: string[];
  }) => void;
  availableTags: string[];
}

export default function TransactionEditSheet({
  transaction,
  isVisible,
  onClose,
  onSave,
  availableTags,
}: Props) {
  const theme = useTheme();
  const bg = theme.background;
  const surface = theme.surface;
  const border = theme.border;

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [merchantMemoryToast, setMerchantMemoryToast] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Reset state when transaction changes
  useEffect(() => {
    if (transaction) {
      setSelectedCategory(transaction.category);
      setSelectedSubcategory(transaction.subcategory ?? '');
      setTags(transaction.tags ?? []);
      setTagInput('');
      setShowCategoryPicker(false);
      setShowSubcategoryPicker(false);
      setMerchantMemoryToast(false);
      toastOpacity.setValue(0);
    }
  }, [transaction?.id]);

  // Slide animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  // Toast animation
  useEffect(() => {
    if (merchantMemoryToast) {
      toastOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [merchantMemoryToast]);

  if (!transaction) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const categoryChanged = selectedCategory !== transaction.category;
  const categoryName =
    CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? selectedCategory;

  const availableSubcategories = SUBCATEGORIES[selectedCategory as SpendCategory] ?? [];
  const hasSubcategories = availableSubcategories.length > 0;
  const subcategoryName =
    availableSubcategories.find((s) => s.id === selectedSubcategory)?.label ?? selectedSubcategory;

  const suggestions =
    tagInput.length > 0
      ? availableTags.filter(
          (t) =>
            t.toLowerCase().includes(tagInput.toLowerCase()) &&
            !tags.includes(t)
        )
      : [];

  function handleSave() {
    onSave({
      category: selectedCategory,
      subcategory: selectedSubcategory || undefined,
      tags,
    });
    if (categoryChanged) {
      setMerchantMemoryToast(true);
      setTimeout(() => {
        setMerchantMemoryToast(false);
        onClose();
      }, 2000);
    } else {
      onClose();
    }
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Scrim */}
      <TouchableOpacity
        style={[styles.scrim, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: surface, transform: [{ translateY }] },
          Platform.OS === 'web' && ({
            maxWidth: 480,
            alignSelf: 'center',
            width: '100%',
          } as object),
        ]}
      >
        {/* Drag handle */}
        <View style={[styles.dragHandle, { backgroundColor: border }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Merchant header */}
          <View style={styles.merchantHeader}>
            <Text style={[styles.merchantName, { color: theme.textPrimary }]}>
              {transaction.merchant}
            </Text>
            <View style={styles.amountDateRow}>
              <Text style={[styles.amount, { color: theme.textPrimary }]}>
                €{transaction.amount.toFixed(2)}
              </Text>
              <Text style={[styles.dateText, { color: theme.textDim }]}>
                {formatDate(transaction.date)}
              </Text>
            </View>
          </View>

          {/* Structural divider */}
          <View style={[styles.divider, { backgroundColor: border }]} />

          {/* Category section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
              CATEGORY
            </Text>

            {/* Category selector row */}
            <TouchableOpacity
              style={[
                styles.selectorRow,
                { backgroundColor: bg, borderColor: border },
                Platform.OS === 'web' && ({ outline: 'none' } as object),
              ]}
              onPress={() => setShowCategoryPicker((prev) => !prev)}
              activeOpacity={0.7}
            >
              <View style={styles.selectorLeft}>
                <CategoryIcon
                  categoryId={selectedCategory}
                  size={18}
                  color={theme.textSecondary}
                />
                <Text style={[styles.selectorText, { color: theme.textPrimary }]}>
                  {categoryName}
                </Text>
              </View>
              <Text style={[styles.changeText, { color: theme.accent }]}>
                Change →
              </Text>
            </TouchableOpacity>

            {/* Inline category picker */}
            {showCategoryPicker && (
              <ScrollView
                style={[
                  styles.pickerScroll,
                  { backgroundColor: bg, borderColor: border },
                ]}
                nestedScrollEnabled
              >
                {CATEGORIES.map((cat, idx) => {
                  const isCatSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory('');
                        setShowCategoryPicker(false);
                        setShowSubcategoryPicker(false);
                      }}
                      activeOpacity={0.7}
                      style={[
                        styles.pickerRow,
                        {
                          backgroundColor: isCatSelected
                            ? theme.accent
                            : 'transparent',
                          borderBottomColor: border,
                          borderBottomWidth:
                            idx < CATEGORIES.length - 1 ? 1 : 0,
                        },
                        Platform.OS === 'web' && ({ outline: 'none' } as object),
                      ]}
                    >
                      <CategoryIcon
                        categoryId={cat.id}
                        size={16}
                        color={isCatSelected ? theme.textOnAccent : theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.pickerRowText,
                          {
                            color: isCatSelected
                              ? theme.textOnAccent
                              : theme.textPrimary,
                          },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Subcategory row — shown when category has subcategories and category picker is closed */}
            {hasSubcategories && !showCategoryPicker && (
              <>
                <TouchableOpacity
                  style={[
                    styles.subcategoryRow,
                    { backgroundColor: bg, borderColor: border },
                    Platform.OS === 'web' && ({ outline: 'none' } as object),
                  ]}
                  onPress={() => setShowSubcategoryPicker((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <View style={styles.selectorLeft}>
                    <CategoryIcon
                      categoryId={selectedCategory}
                      size={16}
                      color={theme.textDim}
                    />
                    <Text style={[styles.subcategoryRowText, { color: theme.textPrimary }]}>
                      {subcategoryName || 'Select subcategory'}
                    </Text>
                  </View>
                  <Text style={[styles.changeText, { color: theme.accent }]}>
                    Change →
                  </Text>
                </TouchableOpacity>

                {/* Inline subcategory picker */}
                {showSubcategoryPicker && (
                  <ScrollView
                    style={[
                      styles.pickerScroll,
                      { backgroundColor: bg, borderColor: border },
                    ]}
                    nestedScrollEnabled
                  >
                    {availableSubcategories.map((sub, idx) => {
                      const isSubSelected = selectedSubcategory === sub.id;
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          onPress={() => {
                            setSelectedSubcategory(sub.id);
                            setShowSubcategoryPicker(false);
                          }}
                          activeOpacity={0.7}
                          style={[
                            styles.pickerRow,
                            {
                              backgroundColor: isSubSelected
                                ? theme.accent
                                : 'transparent',
                              borderBottomColor: border,
                              borderBottomWidth:
                                idx < availableSubcategories.length - 1 ? 1 : 0,
                            },
                            Platform.OS === 'web' && ({ outline: 'none' } as object),
                          ]}
                        >
                          <CategoryIcon
                            categoryId={selectedCategory}
                            size={16}
                            color={isSubSelected ? theme.textOnAccent : theme.textSecondary}
                          />
                          <Text
                            style={[
                              styles.pickerRowText,
                              {
                                color: isSubSelected
                                  ? theme.textOnAccent
                                  : theme.textPrimary,
                              },
                            ]}
                          >
                            {sub.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </>
            )}
          </View>

          {/* Tags section */}
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
              TAGS
            </Text>

            <Text style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              letterSpacing: -0.1,
              color: theme.textDim,
              marginBottom: 12,
              marginTop: 4,
            }}>
              Tag this to find it later — e.g. 'india-trip-2026' or 'team-dinner'
            </Text>

            {/* Existing tags */}
            <View style={styles.existingTags}>
              {tags.length === 0 ? (
                <Text style={[styles.noTagsText, { color: theme.textDim }]}>
                  No tags yet
                </Text>
              ) : (
                tags.map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tagChip, { backgroundColor: border }]}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        { color: theme.textPrimary },
                      ]}
                    >
                      {tag}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setTags((prev) => prev.filter((t) => t !== tag))
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={Platform.OS === 'web' ? ({ outline: 'none' } as object) : undefined}
                    >
                      <Text
                        style={[
                          styles.tagChipRemove,
                          { color: theme.textDim },
                        ]}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Add tag row */}
            <View style={styles.addTagRow}>
              <TextInput
                style={[
                  styles.tagInput,
                  {
                    backgroundColor: bg,
                    borderColor: border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Add a tag..."
                placeholderTextColor={theme.textDim}
                value={tagInput}
                onChangeText={setTagInput}
              />
              <TouchableOpacity
                style={[
                  styles.addTagBtn,
                  { backgroundColor: theme.accent },
                  tagInput.trim().length === 0 && styles.addTagBtnDisabled,
                  Platform.OS === 'web' && ({ outline: 'none' } as object),
                ]}
                onPress={() => {
                  const trimmed = tagInput.trim();
                  if (trimmed && !tags.includes(trimmed)) {
                    setTags((prev) => [...prev, trimmed]);
                    setTagInput('');
                  }
                }}
                disabled={tagInput.trim().length === 0}
                activeOpacity={0.8}
              >
                <Text style={styles.addTagBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <View style={styles.suggestionsRow}>
                {suggestions.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.suggestionChip,
                      { backgroundColor: surface, borderColor: border },
                      Platform.OS === 'web' && ({ outline: 'none' } as object),
                    ]}
                    onPress={() => {
                      setTags((prev) => [...prev, s]);
                      setTagInput('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.suggestionText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Merchant memory note */}
          {categoryChanged && (
            <View
              style={[
                styles.memoryNote,
                { backgroundColor: surface, borderColor: border },
              ]}
            >
              <Text
                style={[styles.memoryNoteText, { color: theme.textSecondary }]}
              >
                ↻ {transaction.merchant} will always be categorised as{' '}
                {categoryName} going forward
              </Text>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: colours.accent },
              Platform.OS === 'web' && ({ outline: 'none' } as object),
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Merchant memory toast */}
        {merchantMemoryToast && (
          <Animated.View
            style={[
              styles.toast,
              { backgroundColor: colours.textOnLight, opacity: toastOpacity },
            ]}
          >
            <View style={[styles.toastCheck, { backgroundColor: theme.accent }]}>
              <Text style={styles.toastCheckIcon}>✓</Text>
            </View>
            <Text style={[styles.toastText, { color: surface }]}>
              {transaction.merchant} will always be {categoryName}
              {subcategoryName ? ` → ${subcategoryName}` : ''}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingBottom: 32,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  merchantHeader: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  merchantName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    letterSpacing: -0.8,
  },
  amountDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  amount: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    marginLeft: 10,
  },
  changeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  pickerScroll: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    maxHeight: 200,
  },
  subcategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  subcategoryRowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerRowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginLeft: 10,
  },
  tagsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  existingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  noTagsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  tagChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  tagChipRemove: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  addTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  addTagBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagBtnDisabled: {
    opacity: 0.4,
  },
  addTagBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colours.textOnAccent,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  suggestionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  memoryNote: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  memoryNoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  saveBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colours.textOnAccent,
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastCheckIcon: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colours.textOnAccent,
    textAlign: 'center',
    lineHeight: 20,
  },
  toastText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    flex: 1,
  },
});
