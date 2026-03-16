import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import colours from '../../constants/colours';

interface MonthlyReviewLinkProps {
  month: string;
  isVisible: boolean;
  isRedacted?: boolean;
  onPress: () => void;
}

export default function MonthlyReviewLink({ month, isVisible, isRedacted, onPress }: MonthlyReviewLinkProps) {
  if (!isVisible || isRedacted) return null;

  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Text
          style={[styles.label, { color: theme.textPrimary }]}
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
