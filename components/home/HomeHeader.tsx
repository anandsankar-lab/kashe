import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import AppHeader from '../shared/AppHeader';

interface HomeHeaderProps {
  name: string;
  hasNotification?: boolean;
  notificationType?: 'amber' | 'red' | null;
  onAvatarPress: () => void;
  onAddPress: () => void;
}

function PlusButton({
  onPress,
  dot,
}: {
  onPress: () => void;
  dot: 'amber' | 'red' | null;
}) {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? colours.backgroundDark : colours.background;
  const dotColor = dot === 'red' ? colours.danger : colours.warning;

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            backgroundColor: colours.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 20,
              color: '#1A1A18',
              lineHeight: 24,
            }}
          >
            +
          </Text>
        </View>
      </TouchableOpacity>

      {dot != null && (
        <View
          style={{
            position: 'absolute',
            top: -1,
            right: -1,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: dotColor,
            borderWidth: 2,
            borderColor: bgColor,
          }}
        />
      )}
    </View>
  );
}

export default function HomeHeader({
  name,
  hasNotification = false,
  notificationType = null,
  onAvatarPress,
  onAddPress,
}: HomeHeaderProps) {
  const dot = hasNotification ? notificationType ?? null : null;

  return (
    <AppHeader
      showGreeting={true}
      greetingName={name}
      onAvatarPress={onAvatarPress}
      avatarInitial={name[0].toUpperCase()}
      rightActions={<PlusButton onPress={onAddPress} dot={dot} />}
    />
  );
}
