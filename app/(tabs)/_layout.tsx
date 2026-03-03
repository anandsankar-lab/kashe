import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { colours } from '../../constants/colours';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colours.accent,
        tabBarInactiveTintColor: colours.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? colours.surfaceDark : colours.surface,
          borderTopColor: isDark ? colours.borderDark : colours.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="spend" options={{ title: 'Spend' }} />
      <Tabs.Screen name="portfolio" options={{ title: 'Portfolio' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
    </Tabs>
  );
}
