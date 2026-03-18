import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';

interface AppHeaderProps {
  title: string;
  showAvatar?: boolean;
  avatarInitial?: string;
  showOverflow?: boolean;
  showAdd?: boolean;
  onAdd?: () => void;
  onOverflow?: () => void;
  onAvatar?: () => void;
}

export default function AppHeader({
  title,
  showAvatar = false,
  avatarInitial = 'A',
  showOverflow = false,
  showAdd = true,
  onAdd,
  onOverflow,
  onAvatar,
}: AppHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleOverflow = () => {
    if (onOverflow) {
      onOverflow();
    } else {
      router.push('/settings');
    }
  };

  return (
    <View style={styles.container}>
      {/* LEFT */}
      <View style={styles.left}>
        {showAvatar && (
          <TouchableOpacity onPress={onAvatar} activeOpacity={0.7}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        {showOverflow && (
          <TouchableOpacity onPress={handleOverflow} activeOpacity={0.7}>
            <View style={[styles.iconButton, { backgroundColor: theme.surface }]}>
              <Text style={[styles.dotsText, { color: theme.textPrimary }]}>···</Text>
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>
        )}
        {showAdd && (
          <TouchableOpacity onPress={onAdd} activeOpacity={0.8}>
            <View style={[styles.iconButton, { backgroundColor: colours.accent }]}>
              <Text style={styles.plusText}>+</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colours.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: '#111110',
  },
  title: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 24,
    letterSpacing: -0.8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dotsText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colours.warning,
  },
  plusText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 22,
    color: '#111110',
    lineHeight: 26,
  },
});
