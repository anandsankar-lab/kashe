import { View, Text, StyleSheet } from 'react-native';
import colours from '../../constants/colours';
import RedactedNumber from '../shared/RedactedNumber';
import KasheAsterisk from '../shared/KasheAsterisk';

interface SpendSummaryStripProps {
  totalSpend: number;
  currency: string;
  vsLastMonth: number | null;
  vs3MonthAvg: number | null;
  budgetAmount: number | null;
  hasMultiCurrency: boolean;
  isRedacted: boolean;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function SpendSummaryStrip({
  totalSpend,
  currency,
  vsLastMonth,
  vs3MonthAvg,
  budgetAmount,
  hasMultiCurrency,
  isRedacted,
}: SpendSummaryStripProps) {
  return (
    <View style={styles.container}>
      {/* 1. Net spend number */}
      {isRedacted ? (
        <RedactedNumber length={5} style={{ fontSize: 48, letterSpacing: -1.5 }} />
      ) : (
        <Text style={styles.spendNumber}>
          {currency}{formatAmount(totalSpend)}
        </Text>
      )}

      {/* Multi-currency note */}
      {hasMultiCurrency && !isRedacted && (
        <Text style={styles.multiCurrencyNote}>incl. amounts converted from INR</Text>
      )}

      {/* 2. Context line — only when vsLastMonth is not null */}
      {vsLastMonth !== null && (
        isRedacted ? (
          <View style={styles.contextRow}>
            <KasheAsterisk size={11} direction="neutral" />
            <RedactedNumber length={2} style={{ fontSize: 14 }} />
            <Text style={styles.contextDim}>% vs last month  ·  </Text>
            <KasheAsterisk size={11} direction="neutral" />
            <RedactedNumber length={2} style={{ fontSize: 14 }} />
            <Text style={styles.contextDim}>% vs 3-month avg</Text>
          </View>
        ) : (
          <View style={styles.contextRow}>
            <KasheAsterisk
              size={11}
              direction={vsLastMonth > 0 ? 'up' : vsLastMonth < 0 ? 'down' : 'neutral'}
            />
            <Text style={[styles.contextDim, { color: colours.textSecondary }]}>
              {Math.abs(vsLastMonth)}% vs last month
            </Text>
            {vs3MonthAvg !== null && (
              <>
                <Text style={styles.contextDim}>  ·  </Text>
                <KasheAsterisk
                  size={11}
                  direction={vs3MonthAvg > 0 ? 'up' : vs3MonthAvg < 0 ? 'down' : 'neutral'}
                />
                <Text style={[styles.contextDim, { color: colours.textSecondary }]}>
                  {Math.abs(vs3MonthAvg)}% vs 3-month avg
                </Text>
              </>
            )}
          </View>
        )
      )}

      {/* 3. Budget summary — only when budgetAmount is not null */}
      {budgetAmount !== null && (
        isRedacted ? (
          <View style={styles.budgetRow}>
            <RedactedNumber length={4} style={{ fontSize: 14 }} />
            <Text style={styles.budgetText}> of </Text>
            <RedactedNumber length={4} style={{ fontSize: 14 }} />
            <Text style={styles.budgetText}> budget</Text>
          </View>
        ) : (
          <Text style={styles.budgetText}>
            {currency}{formatAmount(totalSpend)} of {currency}{formatAmount(budgetAmount)} budget
          </Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  spendNumber: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 48,
    letterSpacing: -1.5,
    color: colours.textPrimary,
  },
  multiCurrencyNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colours.textDim,
    marginTop: 2,
  },
  contextText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colours.textPrimary,
    marginTop: 6,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  contextNumber: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colours.textPrimary,
  },
  contextDim: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colours.textDim,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  budgetText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colours.textSecondary,
    marginTop: 4,
  },
});
