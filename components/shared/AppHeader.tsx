import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface AppHeaderProps {
  title?: string;
  showGreeting?: boolean;
  greetingName?: string;
  rightActions?: React.ReactNode;
  onAvatarPress: () => void;
  avatarInitial: string;
  notificationDot?: 'amber' | 'red' | null;
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good morning, ${name}`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}`;
  if (hour >= 17 && hour < 22) return `Good evening, ${name}`;
  return `Good night, ${name}`;
}

function getFormattedDate(): string {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
}

export default function AppHeader({
  title,
  showGreeting = false,
  greetingName,
  rightActions,
  onAvatarPress,
  avatarInitial,
  notificationDot = null,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const dotColor = notificationDot === 'red' ? theme.danger : theme.warning;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: insets.top + 12,
        paddingBottom: 12,
      }}
    >
      {/* LEFT — Avatar */}
      <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7}>
        <View style={{ position: 'relative' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 16,
                color: theme.textOnAccent,
              }}
            >
              {avatarInitial}
            </Text>
          </View>

          {notificationDot != null && (
            <View
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: dotColor,
                borderWidth: 2,
                borderColor: theme.background,
              }}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* CENTRE — Title or Greeting */}
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        {showGreeting ? (
          <>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 16,
                letterSpacing: -0.3,
                color: theme.textPrimary,
                textAlign: 'center',
              }}
            >
              {greetingName ? getGreeting(greetingName) : ''}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: theme.textSecondary,
                textAlign: 'center',
              }}
            >
              {getFormattedDate()}
            </Text>
          </>
        ) : (
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 22,
              letterSpacing: -0.5,
              color: theme.textPrimary,
              textAlign: 'left',
            }}
          >
            {title}
          </Text>
        )}
      </View>

      {/* RIGHT — rightActions */}
      {rightActions != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {rightActions}
        </View>
      )}
    </View>
  );
}
