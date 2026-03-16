import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import KasheAsterisk from '../shared/KasheAsterisk';
import RedactedNumber from '../shared/RedactedNumber';

interface Insight {
  headline: string;
  body: string;
  categoryId: string;
}

interface Props {
  insight: Insight | null;
  onDismiss: () => void;
  onPress: () => void;
  isRedacted?: boolean;
}

export default function SpendInsightStrip({
  insight,
  onDismiss,
  onPress,
  isRedacted = false,
}: Props) {
  const theme = useTheme();
  const swipeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          swipeAnim.setValue(gs.dx);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -80) {
          Animated.timing(swipeAnim, {
            toValue: -400,
            duration: 220,
            useNativeDriver: true,
          }).start(() => onDismiss());
        } else {
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (insight === null) return null;

  const borderColor = theme.border;
  const surfaceColor = theme.surface;

  return (
    <Animated.View
      style={{
        transform: [{ translateX: swipeAnim }],
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 4,
      }}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          backgroundColor: surfaceColor,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor,
        }}
      >
        {/* ROW 1 — header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <KasheAsterisk size={14} animated={false} direction="neutral" />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: theme.textDim,
              }}
            >
              Spend Insight
            </Text>
          </View>

          <TouchableOpacity
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ padding: 4 }}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 20,
                color: theme.textDim,
              }}
            >
              ×
            </Text>
          </TouchableOpacity>
        </View>

        {/* ROW 2 — headline */}
        {isRedacted ? (
          <RedactedNumber
            length={10}
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 15,
              letterSpacing: -0.5,
              marginBottom: 6,
            }}
          />
        ) : (
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 15,
              letterSpacing: -0.5,
              color: theme.textPrimary,
              marginBottom: 6,
            }}
          >
            {insight.headline}
          </Text>
        )}

        {/* ROW 3 — body */}
        {isRedacted ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <RedactedNumber length={12} style={{ fontSize: 13 }} />
            <RedactedNumber length={8} style={{ fontSize: 13 }} />
          </View>
        ) : (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              letterSpacing: -0.2,
              color: theme.textSecondary,
              lineHeight: 20,
            }}
          >
            {insight.body}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
