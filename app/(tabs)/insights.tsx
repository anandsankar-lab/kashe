import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import colours from '../../constants/colours';

export default function InsightsScreen() {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colours.backgroundDark : colours.background },
      ]}
    >
      <Text style={[styles.label, { color: colours.textSecondary }]}>Insights</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
});
