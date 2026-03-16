import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';
import { Theme } from '../../constants/colours';
import { BucketType, PortfolioHolding } from '../../types/portfolio';
import MacronRule from '../shared/MacronRule';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  holding: PortfolioHolding | null;
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (holdingId: string, newBucket: BucketType) => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: Theme, bottomInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrim: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    dragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      alignSelf: 'center',
      marginTop: 12,
    },
    headerText: {
      fontFamily: 'SpaceGrotesk_600SemiBold',
      fontSize: 18,
      color: colours.textPrimary,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 8,
    },
    reasoningText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: colours.textDim,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    optionsScroll: {
      flexShrink: 1,
    },
    optionsContainer: {
      paddingHorizontal: 20,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colours.textDim,
      backgroundColor: 'transparent',
      marginRight: 12,
    },
    radioOuterSelected: {
      borderColor: colours.accent,
    },
    radioInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colours.accent,
      position: 'absolute',
      top: 4,
      left: 4,
    },
    optionTextBlock: {
      flex: 1,
    },
    optionLabel: {
      fontFamily: 'Inter_500Medium',
      fontSize: 15,
      color: colours.textPrimary,
    },
    optionDescription: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: colours.textSecondary,
      marginTop: 2,
    },
    protectionNote: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: colours.textDim,
      paddingVertical: 14,
    },
    buttonsContainer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
    },
    confirmButton: {
      backgroundColor: colours.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    confirmText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 15,
      color: colours.textPrimary,
    },
    cancelText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: colours.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BucketReassignSheet({ holding, isVisible, onClose, onConfirm }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  const [mounted, setMounted] = useState(isVisible);
  const [selectedBucket, setSelectedBucket] = useState<BucketType>(holding?.bucket ?? 'GROWTH');

  // Animate in/out
  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [isVisible, sheetAnim]);

  // Reset selected bucket when holding changes
  useEffect(() => {
    if (holding) {
      setSelectedBucket(holding.bucket);
    }
  }, [holding]);

  if (!mounted) return null;

  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const styles = makeStyles(theme, insets.bottom);

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Scrim */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={[
            styles.scrim,
            Platform.OS === 'web' && ({ outline: 'none' } as object),
          ]}
        />

        {/* Sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY }], maxHeight: screenHeight * 0.8 }]}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <Text style={styles.headerText}>
            Reassign {holding?.name ?? ''}
          </Text>

          {/* System reasoning */}
          <Text style={styles.reasoningText}>
            We placed this in {holding?.bucket ?? ''} because it{"'"}s a {holding?.assetSubtype ?? ''}. Change it if that doesn{"'"}t fit how you think about this money.
          </Text>

          {/* Divider */}
          <MacronRule />

          {/* Radio options */}
          <ScrollView style={styles.optionsScroll} bounces={false}>
            <View style={styles.optionsContainer}>
              {/* GROWTH */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setSelectedBucket('GROWTH')}
                activeOpacity={0.7}
              >
                <View style={[styles.radioOuter, selectedBucket === 'GROWTH' && styles.radioOuterSelected]}>
                  {selectedBucket === 'GROWTH' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.optionTextBlock}>
                  <Text style={styles.optionLabel}>Growth</Text>
                  <Text style={styles.optionDescription}>Equity, high growth potential</Text>
                </View>
              </TouchableOpacity>

              {/* STABILITY */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setSelectedBucket('STABILITY')}
                activeOpacity={0.7}
              >
                <View style={[styles.radioOuter, selectedBucket === 'STABILITY' && styles.radioOuterSelected]}>
                  {selectedBucket === 'STABILITY' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.optionTextBlock}>
                  <Text style={styles.optionLabel}>Stability</Text>
                  <Text style={styles.optionDescription}>Cash, savings, lower risk</Text>
                </View>
              </TouchableOpacity>

              {/* LOCKED — hidden for protection holdings */}
              {holding?.isProtection === true ? (
                <Text style={styles.protectionNote}>
                  Protection holdings stay in Stability
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setSelectedBucket('LOCKED')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioOuter, selectedBucket === 'LOCKED' && styles.radioOuterSelected]}>
                    {selectedBucket === 'LOCKED' && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.optionTextBlock}>
                    <Text style={styles.optionLabel}>Locked</Text>
                    <Text style={styles.optionDescription}>Committed for a period</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Divider */}
          <MacronRule />

          {/* Buttons */}
          <View style={[styles.buttonsContainer, { paddingBottom: 32 + insets.bottom }]}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                if (holding) {
                  onConfirm(holding.id, selectedBucket);
                }
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
