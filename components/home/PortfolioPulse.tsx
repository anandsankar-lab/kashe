import { View, Text, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import Typography from '../../constants/typography';
import Card from '../ui/Card';

type PulseItem = {
  ticker: string;
  change: number;
  headline: string;
};

type Props = {
  items: PulseItem[];
};

export default function PortfolioPulse({ items }: Props) {
  const isDark = useColorScheme() === 'dark';

  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, 5);
  const borderColour = isDark ? colours.borderDark : colours.border;

  return (
    <Card style={{ marginHorizontal: 16, marginTop: 12 }} padded>
      <Text style={[Typography.label, { color: colours.textSecondary, marginBottom: 4 }]}>
        Portfolio Pulse
      </Text>

      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const changeColour = item.change >= 0 ? colours.accent : colours.danger;
        const changePrefix = item.change >= 0 ? '↑' : '↓';
        const changeText = `${changePrefix} ${Math.abs(item.change).toFixed(1)}%`;

        return (
          <View
            key={item.ticker}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: borderColour,
            }}
          >
            {/* Left: ticker + change stacked */}
            <View>
              <Text
                style={{
                  fontFamily: 'DMSans_500Medium',
                  fontSize: 13,
                  color: colours.textPrimary,
                }}
              >
                {item.ticker}
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 13,
                  color: changeColour,
                }}
              >
                {changeText}
              </Text>
            </View>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Right: headline + chevron */}
            <Text
              style={[
                Typography.caption,
                {
                  color: colours.textSecondary,
                  textAlign: 'right',
                  maxWidth: 200,
                  flexShrink: 1,
                },
              ]}
              numberOfLines={2}
            >
              {item.headline}
            </Text>
            <Text
              style={{
                color: colours.textDim,
                marginLeft: 8,
                fontSize: 16,
                fontFamily: 'DMSans_400Regular',
              }}
            >
              ›
            </Text>
          </View>
        );
      })}
    </Card>
  );
}
