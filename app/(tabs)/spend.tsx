import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { colours } from '../../constants/colours';

export default function SpendScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colours.backgroundDark : colours.background },
      ]}
    >
      <Text style={[styles.label, { color: colours.textSecondary }]}>Spend</Text>
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
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
});
