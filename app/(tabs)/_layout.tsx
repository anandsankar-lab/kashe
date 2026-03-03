import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import colours from '../../constants/colours';

export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = isDark ? colours.backgroundDark : colours.background;
  const border = isDark ? colours.borderDark : colours.border;
  const inactive = isDark ? colours.textDim : colours.textSecondary;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colours.accent,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
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
