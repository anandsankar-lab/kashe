import { ScrollView, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import PositionHeroCard from '../../components/home/PositionHeroCard';
import SpendSnapshot from '../../components/home/SpendSnapshot';
import MarketsStrip from '../../components/home/MarketsStrip';

const MARKETS_DATA = [
  { label: 'S&P 500', value: '5,234', change: 0.4 },
  { label: 'NIFTY 50', value: '22,147', change: -0.8 },
  { label: 'EUR/INR', value: '89.24', change: -0.3 },
  { label: 'Gold', value: '2,041', change: 1.2 },
];

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
      <SpendSnapshot spent={2847} budget={4500} currency="€" />
      <MarketsStrip items={MARKETS_DATA} />
    </ScrollView>
  );
}
