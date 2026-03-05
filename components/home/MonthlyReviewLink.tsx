import { TouchableOpacity, View, Text, StyleSheet, useColorScheme } from 'react-native';
import colours from '../../constants/colours';

interface MonthlyReviewLinkProps {
  month: string;
  isVisible: boolean;
  isRedacted?: boolean;
  onPress: () => void;
}

export default function MonthlyReviewLink({ month, isVisible, isRedacted, onPress }: MonthlyReviewLinkProps) {
  if (!isVisible || isRedacted) return null;

  const isDark = useColorScheme() === 'dark';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? colours.surfaceDark : colours.surface,
            borderColor: isDark ? colours.borderDark : colours.border,
          },
        ]}
      >
        <Text
          style={[styles.label, { color: colours.textPrimary }]}
          numberOfLines={1}
        >
          Your {month} review is ready
        </Text>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: colours.accent,
  },
  label: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  arrow: {
    fontSize: 16,
    color: colours.accent,
  },
});
