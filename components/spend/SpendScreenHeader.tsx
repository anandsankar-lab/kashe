import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import AppHeader from '../shared/AppHeader';

interface SpendScreenHeaderProps {
  onAddPress: () => void;
  onBudgetsPress: () => void;
  notificationDot?: 'amber' | 'red' | null;
  onAvatarPress: () => void;
  avatarInitial: string;
}

function DotsButton({ onPress }: { onPress: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const bg = isDark ? colours.borderDark : colours.border;

  return (
    <TouchableOpacity
      style={[styles.iconButton, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Text style={[styles.overflowDots, { color: colours.textSecondary }]}>···</Text>
    </TouchableOpacity>
  );
}

function PlusButton({
  onPress,
  dot,
}: {
  onPress: () => void;
  dot?: 'amber' | 'red' | null;
}) {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? colours.backgroundDark : colours.background;
  const dotColor = dot === 'red' ? colours.danger : colours.warning;

  return (
    <View>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colours.accent }]}
        onPress={onPress}
        activeOpacity={0.8}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={styles.addPlus}>+</Text>
      </TouchableOpacity>

      {dot != null && (
        <View
          style={[
            styles.notificationDot,
            { backgroundColor: dotColor, borderColor: bgColor },
          ]}
        />
      )}
    </View>
  );
}

export default function SpendScreenHeader({
  onAddPress,
  onBudgetsPress,
  notificationDot,
  onAvatarPress,
  avatarInitial,
}: SpendScreenHeaderProps) {
  return (
    <AppHeader
      title="Spend"
      showGreeting={false}
      onAvatarPress={onAvatarPress}
      avatarInitial={avatarInitial}
      rightActions={
        <>
          <DotsButton onPress={onBudgetsPress} />
          <PlusButton onPress={onAddPress} dot={notificationDot} />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    outlineStyle: 'none',
    borderWidth: 0,
  },
  overflowDots: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 1,
    lineHeight: 18,
  },
  addPlus: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    color: '#1A1A18',
    lineHeight: 24,
    textAlign: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
});
