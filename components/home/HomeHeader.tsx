import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import colours from '../../constants/colours';

interface HomeHeaderProps {
  name: string;
  hasNotification?: boolean;
  notificationType?: 'amber' | 'red' | null;
  onAvatarPress: () => void;
  onAddPress: () => void;
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

export default function HomeHeader({
  name,
  hasNotification = false,
  notificationType = null,
  onAvatarPress,
  onAddPress,
}: HomeHeaderProps) {
  const isDark = useColorScheme() === 'dark';
  const initial = name.charAt(0).toUpperCase();

  const dotColor = notificationType === 'red' ? colours.danger : colours.warning;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      {/* LEFT — Avatar */}
      <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colours.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Syne_700Bold',
              fontSize: 16,
              color: colours.textPrimary,
            }}
          >
            {initial}
          </Text>
        </View>
      </TouchableOpacity>

      {/* CENTRE — Greeting + date */}
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: 'DMSans_500Medium',
            fontSize: 15,
            color: colours.textPrimary,
          }}
        >
          {getGreeting(name)}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans_400Regular',
            fontSize: 12,
            color: colours.textDim,
          }}
        >
          {getFormattedDate()}
        </Text>
      </View>

      {/* RIGHT — [+] button */}
      <TouchableOpacity onPress={onAddPress} activeOpacity={0.7}>
        <View style={{ position: 'relative' }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? colours.surfaceDark : colours.surface,
              borderWidth: 1,
              borderColor: isDark ? colours.borderDark : colours.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Syne_700Bold',
                fontSize: 20,
                color: colours.textPrimary,
                lineHeight: 22,
              }}
            >
              +
            </Text>
          </View>
          {hasNotification && notificationType && (
            <View
              style={{
                position: 'absolute',
                top: -1,
                right: -1,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: dotColor,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
