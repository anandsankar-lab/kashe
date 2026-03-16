import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  onClose: () => void;
  selectedCount: number;
  availableTags: string[];
  onApply: (tags: string[]) => void;
}

export default function BulkTagSheet({
  isVisible,
  onClose,
  selectedCount,
  availableTags,
  onApply,
}: Props) {
  const theme = useTheme();
  const bg = theme.background;
  const surface = theme.surface;
  const border = theme.border;

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Reset state and animate on visibility change
  useEffect(() => {
    if (isVisible) {
      setTags([]);
      setTagInput('');
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const suggestions =
    tagInput.length > 0
      ? availableTags.filter(
          (t) =>
            t.toLowerCase().includes(tagInput.toLowerCase()) &&
            !tags.includes(t)
        )
      : [];

  function handleAdd() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  }

  function handleApply() {
    onApply(tags);
    onClose();
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
        style={styles.scrim}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: surface, transform: [{ translateY }] },
        ]}
      >
        {/* Drag handle */}
        <View style={[styles.dragHandle, { backgroundColor: border }]} />

        {/* Header */}
        <Text style={[styles.header, { color: theme.textPrimary }]}>
          Tag {selectedCount} transaction{selectedCount !== 1 ? 's' : ''}
        </Text>

        {/* Dim note */}
        <Text style={[styles.dimNote, { color: theme.textDim }]}>
          These tags will be added to all selected transactions
        </Text>

        {/* Tag input section */}
        <View style={styles.tagSection}>
          <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
            ADD TAGS
          </Text>

          {/* Selected tags chips */}
          <View style={styles.existingTags}>
            {tags.length === 0 ? (
              <Text style={[styles.noTagsText, { color: theme.textDim }]}>
                No tags selected yet
              </Text>
            ) : (
              tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tagChip, { backgroundColor: border }]}
                >
                  <Text
                    style={[styles.tagChipText, { color: theme.textPrimary }]}
                  >
                    {tag}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setTags((prev) => prev.filter((t) => t !== tag))
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text
                      style={[styles.tagChipRemove, { color: theme.textDim }]}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* TextInput + Add button */}
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
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.addTagBtn,
                { backgroundColor: theme.accent },
                tagInput.trim().length === 0 && styles.addTagBtnDisabled,
              ]}
              onPress={handleAdd}
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

        {/* Apply button */}
        <TouchableOpacity
          style={[
            styles.applyBtn,
            { backgroundColor: theme.accent },
            tags.length === 0 && styles.applyBtnDisabled,
          ]}
          onPress={handleApply}
          disabled={tags.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.applyBtnText}>Apply tags</Text>
        </TouchableOpacity>
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
  header: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    paddingHorizontal: 20,
  },
  dimNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  tagSection: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
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
  applyBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colours.textOnAccent,
    textAlign: 'center',
  },
});
