import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';
import AppHeader from '../shared/AppHeader';

interface SpendScreenHeaderProps {
  onAddPress: () => void;
  onBudgetsPress: () => void;
  notificationDot?: 'amber' | 'red' | null;
  onAvatarPress: () => void;
  avatarInitial: string;
  hasStaleData?: boolean;
}

function DotsButton({ onPress, hasStaleData }: { onPress: () => void; hasStaleData?: boolean }) {
  const theme = useTheme();
  const bg = theme.border;

  return (
    <View>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: bg }]}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={[styles.overflowDots, { color: theme.textSecondary }]}>···</Text>
      </TouchableOpacity>
      {hasStaleData && (
        <View style={[styles.staleDot, { backgroundColor: colours.warning }]} />
      )}
    </View>
  );
}

function PlusButton({
  onPress,
  dot,
}: {
  onPress: () => void;
  dot?: 'amber' | 'red' | null;
}) {
  const theme = useTheme();
  const bgColor = theme.background;
  const dotColor = dot === 'red' ? theme.danger : theme.warning;

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
  hasStaleData,
}: SpendScreenHeaderProps) {
  return (
    <AppHeader
      title="Spend"
      showGreeting={false}
      onAvatarPress={onAvatarPress}
      avatarInitial={avatarInitial}
      rightActions={
        <>
          <DotsButton onPress={onBudgetsPress} hasStaleData={hasStaleData} />
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
    color: colours.textOnAccent,
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
  staleDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 999,
  },
});
