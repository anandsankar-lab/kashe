import { View, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import Spacing from '../../constants/spacing';
import TypographyText from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import KasheAsterisk from '../../components/shared/KasheAsterisk';
import MacronRule from '../../components/shared/MacronRule';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? colours.backgroundDark : colours.background,
        padding: Spacing.xxl,
        gap: Spacing.lg,
      }}
    >
      <KasheAsterisk size={48} animated />

      <TypographyText variant="heading">Kāshe</TypographyText>

      <MacronRule style={{ marginVertical: Spacing.sm }} />

      <TypographyText variant="body" color={colours.textSecondary}>
        Your money. Both worlds.
      </TypographyText>

      <Card style={{ width: '100%', marginTop: Spacing.lg }}>
        <Button label="Get started" variant="primary" onPress={() => {}} />
      </Card>
    </View>
  );
}
