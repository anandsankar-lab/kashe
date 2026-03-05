import { ScrollView, Text, View, useColorScheme } from 'react-native';
import KasheAsterisk from '../shared/KasheAsterisk';
import colours from '../../constants/colours';
import RedactedNumber from '../shared/RedactedNumber';

type MarketItem = {
  label: string;
  value: string;
  change: number;
};

type Props = {
  items: MarketItem[];
  isRedacted?: boolean;
};

function MarketItemView({ label, change, isRedacted }: MarketItem & { isRedacted?: boolean }) {
  const isDark = useColorScheme() === 'dark';

  const changeColour =
    change > 0 ? colours.accent : change < 0 ? colours.danger : colours.textSecondary;

  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: isDark ? colours.surfaceDark : colours.surface,
        borderWidth: 1,
        borderColor: isDark ? '#2A2A28' : '#EEEEE9',
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 13,
          color: colours.textPrimary,
        }}
      >
        {label}
      </Text>
      <KasheAsterisk size={11} direction={direction} />
      {isRedacted ? (
        <RedactedNumber length={2} style={{ fontSize: 13 }} />
      ) : (
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: changeColour,
          }}
        >
          {Math.abs(change).toFixed(1)}%
        </Text>
      )}
    </View>
  );
}

export default function MarketsStrip({ items, isRedacted = false }: Props) {
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 4,
        paddingVertical: 4,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {items.map((item) => (
        <MarketItemView key={item.label} {...item} isRedacted={isRedacted} />
      ))}
    </ScrollView>
  );
}
