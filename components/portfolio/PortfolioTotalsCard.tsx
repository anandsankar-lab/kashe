import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Card from '../ui/Card';
import MacronRule from '../shared/MacronRule';
import RedactedNumber from '../shared/RedactedNumber';
import { PortfolioTotals } from '../../types/portfolio';

interface PortfolioTotalsCardProps {
  totals: PortfolioTotals
  isRedacted?: boolean
}

function formatAmount(value: number, currency: string): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency;
  return symbol + Math.round(value).toLocaleString('en-US');
}

function formatLastRefreshed(isoString: string): string {
  const then = new Date(isoString).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMin / 60);
  if (diffMin < 1) return 'Prices updated just now';
  if (diffMin < 60) return `Prices updated ${diffMin} min ago`;
  if (diffHrs < 24) return `Prices updated ${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `Prices updated ${diffDays}d ago`;
}

function DeltaIndicator({ value, currency, theme }: { value: number; currency: string; theme: ReturnType<typeof useTheme> }) {
  const isPositive = value >= 0;
  const color = isPositive ? theme.accent : theme.danger;
  const arrow = isPositive ? '↑' : '↓';
  return (
    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, letterSpacing: -0.2, color: theme.textSecondary }}>
      <Text style={{ color }}>{arrow} </Text>
      {formatAmount(Math.abs(value), currency)} this month
    </Text>
  );
}

export default function PortfolioTotalsCard({ totals, isRedacted = false }: PortfolioTotalsCardProps) {
  const theme = useTheme();
  const { liveTotal, lockedTotal, combinedTotal, monthlyDeltaLive, baseCurrency, lastRefreshed } = totals;

  const numberStyle = {
    fontFamily: 'SpaceGrotesk_700Bold' as const,
    fontSize: 28,
    letterSpacing: -1.0,
    color: theme.textPrimary,
  };

  const columnLabelStyle = {
    fontFamily: 'Inter_500Medium' as const,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: theme.textSecondary,
    marginBottom: 6,
  };

  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 12 }}>
      {/* Two-column totals */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Live column */}
        <View style={{ flex: 1 }}>
          <Text style={columnLabelStyle}>Live</Text>
          {isRedacted
            ? <RedactedNumber style={{ fontSize: 28 }} length={6} />
            : <Text style={numberStyle}>{formatAmount(liveTotal, baseCurrency)}</Text>
          }
        </View>

        {/* Vertical macron divider */}
        <View style={{ width: 1, backgroundColor: theme.accent, marginHorizontal: 20, marginTop: 4, alignSelf: 'stretch' }} />

        {/* Locked column */}
        <View style={{ flex: 1 }}>
          <Text style={columnLabelStyle}>Locked</Text>
          {isRedacted
            ? <RedactedNumber style={{ fontSize: 28 }} length={6} />
            : <Text style={numberStyle}>{formatAmount(lockedTotal, baseCurrency)}</Text>
          }
        </View>
      </View>

      {/* Horizontal macron rule */}
      <MacronRule style={{ marginTop: 16, marginBottom: 12 }} />

      {/* Combined total */}
      {isRedacted
        ? <RedactedNumber style={{ fontSize: 13 }} length={8} />
        : (
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, letterSpacing: -0.2, color: theme.textSecondary }}>
            <Text style={{ fontFamily: 'SpaceGrotesk_400Regular', color: theme.textPrimary }}>
              {formatAmount(combinedTotal, baseCurrency)}
            </Text>
            {' across all holdings'}
          </Text>
        )
      }

      {/* Monthly delta — live only */}
      <View style={{ marginTop: 6 }}>
        {isRedacted
          ? <RedactedNumber style={{ fontSize: 13 }} length={7} />
          : <DeltaIndicator value={monthlyDeltaLive} currency={baseCurrency} theme={theme} />
        }
      </View>

      {/* Last refreshed */}
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, letterSpacing: -0.1, color: theme.textDim, marginTop: 12 }}>
        {formatLastRefreshed(lastRefreshed)}
      </Text>
    </Card>
  );
}
