import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';

interface Props {
  availableTags: string[];
  activeTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

export default function TagFilterPills({
  availableTags,
  activeTags,
  onTagToggle,
  onClearAll,
}: Props) {
  const theme = useTheme();
  const surfaceColor = theme.surface;
  const borderColor = theme.border;

  if (availableTags.length === 0) return null;

  const isAllActive = activeTags.length === 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* All pill */}
      <TouchableOpacity
        onPress={onClearAll}
        activeOpacity={0.7}
        style={[
          styles.allPill,
          isAllActive
            ? { backgroundColor: colours.accent }
            : { backgroundColor: surfaceColor, borderWidth: 1, borderColor },
          Platform.OS === 'web' && ({ outline: 'none' } as object),
        ]}
      >
        <Text
          style={[
            styles.pillText,
            { color: isAllActive ? theme.textOnAccent : theme.textSecondary },
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {/* Tag pills */}
      {availableTags.map((tag) => {
        const isActive = activeTags.includes(tag);
        return (
          <TouchableOpacity
            key={tag}
            onPress={() => onTagToggle(tag)}
            activeOpacity={0.7}
            style={[
              styles.tagPill,
              isActive
                ? { backgroundColor: colours.accent }
                : { backgroundColor: surfaceColor, borderWidth: 1, borderColor },
              Platform.OS === 'web' && ({ outline: 'none' } as object),
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: isActive ? theme.textOnAccent : theme.textSecondary },
              ]}
            >
              {isActive ? `${tag} ×` : tag}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 0,
    gap: 8,
    alignItems: 'center',
  },
  allPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
});
