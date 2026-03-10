import React, { useRef, useState } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import KasheAsterisk from './KasheAsterisk';
import Button from '../ui/Button';

interface EmptyStateProps {
  children: React.ReactNode;
  isVisible: boolean;
  onCta: () => void;
  ctaLabel: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  headline: string;
  invitationHeadline: string;
  invitationDescription: string;
  invitationCtaLabel: string;
  invitationSecondaryLabel?: string;
}

export default function EmptyState({
  children,
  isVisible,
  onCta,
  ctaLabel,
  secondaryLabel,
  onSecondary,
  headline,
  invitationHeadline,
  invitationDescription,
  invitationCtaLabel,
  invitationSecondaryLabel,
}: EmptyStateProps) {
  const theme = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const showSheet = () => {
    setSheetVisible(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const hideSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSheetVisible(false));
  };

  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* Layer 1 — scrollable ghost content */}
      <View style={{ flex: 1, opacity: 0.5 }}>
        {children}
      </View>

      {/* Layer 2 — floating pill */}
      <TouchableOpacity
        onPress={showSheet}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: 24,
          alignSelf: 'center',
          zIndex: 10,
          backgroundColor: theme.accent,
          borderRadius: 999,
          paddingHorizontal: 24,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <KasheAsterisk size={14} direction="neutral" />
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            fontSize: 15,
            color: theme.textOnAccent,
            letterSpacing: -0.3,
          }}
        >
          {ctaLabel}
        </Text>
      </TouchableOpacity>

      {/* Layer 3 — bottom sheet */}
      {sheetVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
          }}
        >
          {/* Dark scrim */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={hideSheet}
            style={{
              position: 'absolute',
              top: -9999,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />

          {/* Sheet card */}
          <Animated.View
            style={{
              transform: [{ translateY }],
              backgroundColor: theme.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 28,
              paddingTop: 12,
              paddingBottom: 40,
              borderTopWidth: 1,
              borderColor: theme.border,
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.textDim,
                alignSelf: 'center',
                marginBottom: 24,
              }}
            />

            <View style={{ alignSelf: 'center', marginBottom: 16 }}>
              <KasheAsterisk size={28} animated={true} />
            </View>

            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 22,
                letterSpacing: -0.8,
                textAlign: 'center',
                color: theme.textPrimary,
                marginBottom: 10,
              }}
            >
              {invitationHeadline}
            </Text>

            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                letterSpacing: -0.2,
                textAlign: 'center',
                color: theme.textSecondary,
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              {invitationDescription}
            </Text>

            <Button
              label={invitationCtaLabel}
              variant="primary"
              onPress={() => {
                hideSheet();
                onCta();
              }}
            />

            {invitationSecondaryLabel && onSecondary && (
              <TouchableOpacity
                onPress={() => {
                  hideSheet();
                  onSecondary();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.textSecondary,
                    textAlign: 'center',
                    marginTop: 16,
                  }}
                >
                  {invitationSecondaryLabel}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      )}
    </View>
  );
}
