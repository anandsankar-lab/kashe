import { ScrollView, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import PositionHeroCard from '../../components/home/PositionHeroCard';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? colours.backgroundDark : colours.background }}
      contentContainerStyle={{ paddingTop: 60, paddingBottom: 32 }}
    >
      <PositionHeroCard
        position={450200}
        savingsRate={45}
        monthDelta={2340}
        ytdDelta={18400}
        liquidAssets={380200}
        illiquidAssets={120000}
        liabilities={50000}
        currency="€"
      />
    </ScrollView>
  );
}
