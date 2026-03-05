import { View, Text, useColorScheme } from 'react-native';
import colours from '../../constants/colours';
import Typography from '../../constants/typography';
import Card from '../ui/Card';
import KasheAsterisk from '../shared/KasheAsterisk';
import RedactedNumber from '../shared/RedactedNumber';

type PulseItem = {
  ticker: string;
  change: number;
  headline: string;
};

type Props = {
  items: PulseItem[];
  isRedacted?: boolean;
};

export default function PortfolioPulse({ items, isRedacted = false }: Props) {
  const isDark = useColorScheme() === 'dark';

  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, 5);
  const borderColour = isDark ? colours.borderDark : colours.border;

  return (
    <Card padded>
      <Text style={[Typography.label, { color: colours.textSecondary, marginBottom: 4 }]}>
        Portfolio Pulse
      </Text>

      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const changeColour = item.change >= 0 ? colours.accent : colours.danger;
        const direction = item.change >= 0 ? 'up' : 'down';

        return (
          <View
            key={item.ticker}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: borderColour,
            }}
          >
            {/* Left: ticker + change stacked */}
            <View>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_700Bold',
                  fontSize: 14,
                  color: colours.textPrimary,
                }}
              >
                {item.ticker}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
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
                    {Math.abs(item.change).toFixed(1)}%
                  </Text>
                )}
              </View>
            </View>

            {/* Right: headline */}
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                color: colours.textSecondary,
                textAlign: 'right',
                flex: 1,
                marginLeft: 12,
              }}
              numberOfLines={2}
            >
              {item.headline}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}
