import { ScrollView, Text, View, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import Typography from '../../constants/typography';

type MarketItem = {
  label: string;
  value: string;
  change: number;
};

type Props = {
  items: MarketItem[];
};

function MarketItemView({ label, change }: MarketItem) {
  const isDark = useColorScheme() === 'dark';

  const changeColour =
    change > 0 ? colours.accent : change < 0 ? colours.danger : colours.textDim;

  const changePrefix = change > 0 ? '↑' : change < 0 ? '↓' : '';
  const changeText = `${changePrefix} ${Math.abs(change).toFixed(1)}%`;

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
        backgroundColor: isDark ? colours.surfaceDark : colours.surface,
        borderWidth: 1,
        borderColor: isDark ? colours.borderDark : colours.border,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text
        style={[Typography.caption, { color: colours.textSecondary, marginRight: 8 }]}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'DMSans_500Medium',
          fontSize: 13,
          color: changeColour,
        }}
      >
        {changeText}
      </Text>
    </View>
  );
}

export default function MarketsStrip({ items }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      style={{ marginTop: 12, marginBottom: 4 }}
    >
      {items.map((item) => (
        <MarketItemView key={item.label} {...item} />
      ))}
    </ScrollView>
  );
}
