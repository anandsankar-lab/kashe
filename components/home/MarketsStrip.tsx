import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import KasheAsterisk from '../shared/KasheAsterisk';
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
  const theme = useTheme();

  const changeColour =
    change > 0 ? theme.accent : change < 0 ? theme.danger : theme.textSecondary;

  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
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
          color: theme.textPrimary,
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
