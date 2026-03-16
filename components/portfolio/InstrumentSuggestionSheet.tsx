import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';
import { Theme } from '../../constants/colours';
import { BucketType } from '../../types/portfolio';

// ─── Data types ──────────────────────────────────────────────────────────────

interface InstrumentLink {
  label: string;
  url: string;
}

interface Instrument {
  groupLabel?: string;
  name: string;
  description: string;
  links: InstrumentLink[];
  note?: string;
}

interface BucketSection {
  region: string;
  instruments: Instrument[];
}

// ─── Instrument data ─────────────────────────────────────────────────────────

const GROWTH_SECTIONS: BucketSection[] = [
  {
    region: 'INDIA',
    instruments: [
      {
        groupLabel: 'INDEX FUNDS',
        name: 'UTI Nifty 50 Index Fund',
        description: 'Tracks NIFTY 50. Expense ratio ~0.18%.',
        links: [
          { label: 'View on AMFI →', url: 'https://www.amfiindia.com' },
          { label: 'View on Groww →', url: 'https://groww.in' },
        ],
      },
      {
        groupLabel: 'LARGE-CAP ACTIVE',
        name: 'Mirae Asset Large Cap',
        description: 'Consistently well-regarded. Check Morningstar.',
        links: [
          { label: 'View on AMFI →', url: 'https://www.amfiindia.com' },
          { label: 'View on Groww →', url: 'https://groww.in' },
        ],
      },
      {
        groupLabel: 'FLEXI-CAP',
        name: 'Parag Parikh Flexi Cap',
        description: 'Holds international stocks too. Lower India concentration.',
        links: [
          { label: 'View on AMFI →', url: 'https://www.amfiindia.com' },
          { label: 'View on Groww →', url: 'https://groww.in' },
        ],
      },
    ],
  },
  {
    region: 'EUROPE',
    instruments: [
      {
        groupLabel: 'BROAD MARKET ETFs',
        name: 'VWRL — Vanguard FTSE All-World',
        description: 'Global exposure including emerging markets. Available on DEGIRO.',
        links: [
          { label: 'View on justETF →', url: 'https://www.justetf.com' },
        ],
      },
      {
        groupLabel: 'BROAD MARKET ETFs',
        name: 'IWDA — iShares Core MSCI World',
        description: 'Developed markets focus. Lower volatility than all-world.',
        links: [
          { label: 'View on justETF →', url: 'https://www.justetf.com' },
        ],
      },
    ],
  },
];

const STABILITY_SECTIONS: BucketSection[] = [
  {
    region: 'INDIA',
    instruments: [
      {
        name: 'NRE Fixed Deposit',
        description: 'Repatriable. Tax-free interest in India. Rates ~7-8%.',
        links: [
          { label: 'View on HDFC →', url: 'https://www.hdfcbank.com' },
        ],
      },
      {
        name: 'Debt Mutual Fund',
        description: 'Lower volatility than equity. Monthly liquidity.',
        links: [
          { label: 'View on AMFI →', url: 'https://www.amfiindia.com' },
        ],
      },
    ],
  },
  {
    region: 'EUROPE',
    instruments: [
      {
        name: 'High-Yield Savings Account',
        description: 'ABN Amro, ING, Revolut offer >2.5% currently.',
        links: [],
        note: 'Compare rates at your bank',
      },
    ],
  },
];

const LOCKED_SECTIONS: BucketSection[] = [
  {
    region: 'INDIA',
    instruments: [
      {
        name: 'PPF (Public Provident Fund)',
        description: 'Government-backed. 7.1% p.a. 15-year lock.',
        links: [
          { label: 'View on NSDL →', url: 'https://www.nsdl.co.in' },
        ],
      },
      {
        name: 'NPS (National Pension System)',
        description: 'Tax efficient. Partial withdrawal after 3 years.',
        links: [
          { label: 'View on NPS Trust →', url: 'https://www.npstrust.org.in' },
        ],
      },
    ],
  },
  {
    region: 'EUROPE',
    instruments: [
      {
        name: 'Employer Pension Top-up',
        description: 'Voluntary extra contribution to your pension pot. Ask HR.',
        links: [],
      },
    ],
  },
];

const BUCKET_DATA: Record<BucketType, BucketSection[]> = {
  GROWTH: GROWTH_SECTIONS,
  STABILITY: STABILITY_SECTIONS,
  LOCKED: LOCKED_SECTIONS,
};

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: Theme, screenHeight: number, bottomInset: number) {
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
      maxHeight: screenHeight * 0.8,
      paddingBottom: 20 + bottomInset,
    },
    dragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    header: {
      fontFamily: 'SpaceGrotesk_700Bold',
      fontSize: 18,
      color: colours.textPrimary,
      letterSpacing: -0.5,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    sectionHeader: {
      fontFamily: 'Inter_500Medium',
      fontSize: 11,
      letterSpacing: 0.8,
      color: colours.textDim,
      textTransform: 'uppercase',
      marginTop: 16,
      marginBottom: 8,
    },
    instrumentRow: {
      marginBottom: 16,
    },
    groupLabel: {
      fontFamily: 'Inter_500Medium',
      fontSize: 11,
      letterSpacing: 0.8,
      color: colours.textDim,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    instrumentName: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: colours.textPrimary,
    },
    instrumentDescription: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      color: colours.textSecondary,
      marginTop: 2,
    },
    instrumentNote: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      color: colours.textDim,
      marginTop: 4,
    },
    linkRow: {
      flexDirection: 'row',
      marginTop: 6,
    },
    linkText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      color: colours.accent,
    },
    linkSpacing: {
      marginLeft: 16,
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    disclaimerSeparator: {
      height: 1,
      backgroundColor: theme.border,
    },
    disclaimerContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    disclaimerText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 11,
      color: colours.textDim,
      textAlign: 'center',
      lineHeight: 16,
    },
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isVisible: boolean;
  bucket: BucketType;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InstrumentSuggestionSheet({ isVisible, bucket, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  const [mounted, setMounted] = useState(isVisible);

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

  if (!mounted) return null;

  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const styles = makeStyles(theme, screenHeight, insets.bottom);
  const sections = BUCKET_DATA[bucket];

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
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <Text style={styles.header}>
            {bucket} — commonly used instruments
          </Text>

          {/* Scrollable content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section, sIdx) => (
              <View key={section.region}>
                <Text style={styles.sectionHeader}>{section.region}</Text>

                {section.instruments.map((instrument, iIdx) => (
                  <View key={iIdx} style={styles.instrumentRow}>
                    {instrument.groupLabel != null && (
                      <Text style={styles.groupLabel}>
                        {instrument.groupLabel}
                      </Text>
                    )}

                    <Text style={styles.instrumentName}>{instrument.name}</Text>

                    <Text style={styles.instrumentDescription}>
                      {instrument.description}
                    </Text>

                    {instrument.note != null && (
                      <Text style={styles.instrumentNote}>{instrument.note}</Text>
                    )}

                    {instrument.links.length > 0 && (
                      <View style={styles.linkRow}>
                        {instrument.links.map((link, lIdx) => (
                          <TouchableOpacity
                            key={lIdx}
                            onPress={() => console.log('Open link:', link.url)}
                            style={lIdx > 0 ? styles.linkSpacing : undefined}
                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.linkText}>{link.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}

                {sIdx < sections.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </ScrollView>

          {/* Disclaimer — fixed at bottom of sheet, outside ScrollView */}
          <View style={styles.disclaimerSeparator} />
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              These are educational suggestions, not financial advice. Kāshe earns nothing from these links. Always do your own research.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
