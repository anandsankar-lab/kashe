import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';
import { DataSource } from '../../types/spend';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  onClose: () => void;
  sources: DataSource[];
  onRequestUpload: (sourceId: string) => void;
}

const TYPE_LABELS: Record<DataSource['type'], string> = {
  SPEND: 'Spending',
  PORTFOLIO: 'Portfolio',
  SALARY: 'Salary',
};

const ADD_ROWS: { emoji: string; label: string; id: string }[] = [
  { emoji: '💳', label: 'Upload bank statement', id: 'bank' },
  { emoji: '📈', label: 'Upload portfolio CSV', id: 'portfolio' },
  { emoji: '📄', label: 'Upload salary slip', id: 'salary' },
  { emoji: '✋', label: 'Add manually', id: 'manual' },
];

export default function DataSourceSheet({ isVisible, onClose, sources, onRequestUpload }: Props) {
  const theme = useTheme();
  const surface = theme.surface;
  const border = theme.border;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const [autoSyncInterested, setAutoSyncInterested] = useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: isVisible ? 350 : 250,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  // Group sources by type
  const grouped = sources.reduce<Record<string, DataSource[]>>((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {});

  const typeOrder: DataSource['type'][] = ['SPEND', 'PORTFOLIO', 'SALARY'];

  function renderStatusLine(source: DataSource) {
    if (source.status === 'FRESH') {
      return (
        <Text style={[styles.statusLine, { color: theme.textDim }]}>
          Updated {source.lastUpdatedDays} days ago
        </Text>
      );
    }
    if (source.status === 'STALE') {
      return (
        <Text style={[styles.statusLine, { color: colours.warning }]}>
          Last updated {source.lastUpdatedDays} days ago — needs refresh
        </Text>
      );
    }
    return (
      <Text style={[styles.statusLine, { color: colours.danger }]}>
        Not yet added
      </Text>
    );
  }

  function renderStatusAction(source: DataSource) {
    if (source.status === 'FRESH') {
      return (
        <View style={[styles.freshDot, { backgroundColor: colours.accent }]} />
      );
    }
    if (source.status === 'STALE') {
      return (
        <TouchableOpacity
          onPress={() => onRequestUpload(source.id)}
          style={[styles.staleBtn, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
          activeOpacity={0.8}
        >
          <Text style={[styles.staleBtnText, { color: colours.warning }]}>Refresh ↑</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => onRequestUpload(source.id)}
        style={[styles.addBtn, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
        activeOpacity={0.8}
      >
        <Text style={styles.addBtnText}>+ Add</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      {/* Scrim */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFillObject, Platform.OS === 'web' && ({ outline: 'none' } as object)]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      </TouchableOpacity>

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

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
            Your data sources
          </Text>
          <Text style={[styles.sheetSubhead, { color: theme.textDim }]}>
            Keep these fresh for accurate insights
          </Text>

          {/* Sources grouped by type */}
          {typeOrder.map((type) => {
            const group = grouped[type];
            if (!group || group.length === 0) return null;
            return (
              <View key={type}>
                <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
                  {TYPE_LABELS[type]}
                </Text>
                {group.map((source, idx) => (
                  <View
                    key={source.id}
                    style={[
                      styles.sourceRow,
                      idx < group.length - 1 && { borderBottomWidth: 1, borderBottomColor: border },
                    ]}
                  >
                    <View style={styles.sourceLeft}>
                      <Text style={[styles.institutionName, { color: theme.textPrimary }]}>
                        {source.institution}
                      </Text>
                      <View style={{ marginTop: 3 }}>{renderStatusLine(source)}</View>
                    </View>
                    <View style={styles.sourceRight}>{renderStatusAction(source)}</View>
                  </View>
                ))}
              </View>
            );
          })}

          {/* Add a source section */}
          <View style={styles.addSection}>
            <Text style={[styles.sectionLabel, { color: theme.textDim }]}>
              Add a source
            </Text>
            {ADD_ROWS.map((row, idx) => (
              <TouchableOpacity
                key={row.id}
                onPress={() => onRequestUpload('new')}
                activeOpacity={0.7}
                style={[
                  styles.addRow,
                  idx < ADD_ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: border },
                  Platform.OS === 'web' && ({ outline: 'none' } as object),
                ]}
              >
                <Text style={styles.addRowEmoji}>{row.emoji}</Text>
                <Text style={[styles.addRowLabel, { color: theme.textPrimary }]}>
                  {row.label}
                </Text>
                <Text style={[styles.addRowChevron, { color: theme.textDim }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Automation interest */}
          <View style={styles.autoSyncSection}>
            <Text style={[styles.autoSyncText, { color: theme.textDim }]}>
              Automatic sync is coming — interested?
            </Text>
            {autoSyncInterested ? (
              <Text style={[styles.autoSyncConfirm, { color: theme.textDim }]}>
                Got it — we'll let you know ✓
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  console.log('auto_sync_interest PostHog event');
                  // TODO Session 06: wire to PostHog
                  setAutoSyncInterested(true);
                }}
                activeOpacity={0.7}
                style={Platform.OS === 'web' ? ({ outline: 'none' } as object) : undefined}
              >
                <Text style={[styles.autoSyncCta, { color: colours.accent }]}>Notify me →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    paddingBottom: 32,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetSubhead: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sourceLeft: {
    flex: 1,
  },
  institutionName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  statusLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  sourceRight: {
    marginLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  freshDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  staleBtn: {
    backgroundColor: 'rgba(255, 181, 71, 0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  staleBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: colours.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colours.textOnAccent,
  },
  addSection: {
    paddingHorizontal: 0,
    marginTop: 8,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  addRowEmoji: {
    fontSize: 17,
  },
  addRowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    flex: 1,
  },
  addRowChevron: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
  },
  autoSyncSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
  },
  autoSyncText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  autoSyncCta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 6,
  },
  autoSyncConfirm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 6,
  },
});
