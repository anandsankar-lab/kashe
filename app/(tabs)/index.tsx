import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AppHeader from '../../components/shared/AppHeader';
import PositionHeroCard from '../../components/home/PositionHeroCard';
import SpendStoryCard from '../../components/home/SpendStoryCard';
import MarketsStrip from '../../components/home/MarketsStrip';
import PortfolioPulse from '../../components/home/PortfolioPulse';
import FIREProgress from '../../components/home/FIREProgress';
import SegregationToggle from '../../components/home/SegregationToggle';
import MonthlyReviewLink from '../../components/home/MonthlyReviewLink';
import EmptyState from '../../components/shared/EmptyState';
import RedactedNumber from '../../components/shared/RedactedNumber';
import { MOCK_APP_STATE } from '../../constants/mockData';
import { AppDataState } from '../../types/spend';

const MARKETS_DATA = [
  { label: 'S&P 500', value: '5,234', change: 0.4 },
  { label: 'NIFTY 50', value: '22,147', change: -0.8 },
  { label: 'EUR/INR', value: '89.24', change: -0.3 },
  { label: 'Gold', value: '2,041', change: 1.2 },
];

const PULSE_DATA = [
  { ticker: 'VWRL', change: 1.2, headline: 'Global markets rally on Fed pause' },
  { ticker: 'INFY', change: -0.8, headline: 'Q3 margins under pressure' },
  { ticker: 'PPFCF', change: 2.1, headline: 'Flexi cap inflows hit 6-month high' },
];

type EmptyStateCopy = {
  headline: string;
  ctaLabel: string;
  secondaryLabel?: string;
  invitationHeadline: string;
  invitationDescription: string;
  invitationCtaLabel: string;
  invitationSecondaryLabel?: string;
};

function getEmptyStateCopy(appState: AppDataState): EmptyStateCopy {
  if (appState === 'UNAUTHENTICATED') {
    return {
      headline: 'Your money. Both worlds.',
      ctaLabel: '+ Connect your data',
      invitationHeadline: 'Sign in to get started',
      invitationDescription:
        'Your financial data stays on your device. Sign in with Google to begin.',
      invitationCtaLabel: 'Continue with Google',
    };
  }
  return {
    headline: 'Upload one statement to begin',
    ctaLabel: '+ Upload your first statement',
    secondaryLabel: 'Add investments manually instead',
    invitationHeadline: 'See where last month went',
    invitationDescription:
      'Upload your bank statement and Kāshe shows your spending picture instantly. Your data never leaves your device.',
    invitationCtaLabel: '+ Upload bank statement',
    invitationSecondaryLabel: 'Add investments instead',
  };
}

export default function HomeScreen() {
  const theme = useTheme();
  const [appState] = useState<AppDataState>(MOCK_APP_STATE);
  const [reviewVisible] = useState(true);
  const [reviewMonth] = useState('March');

  const hasData = appState === 'HAS_DATA';
  const copy = getEmptyStateCopy(appState);

  const redact = (fontSize: number, length: number = 6) => (
    <RedactedNumber
      length={length}
      style={{ fontSize }}
      onPress={() => {/* sheet handled by EmptyState */}}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppHeader
        title="Home"
        showAvatar={true}
        avatarInitial="A"
        showOverflow={true}
        showAdd={true}
        onAdd={() => console.log('add')}
        onOverflow={() => console.log('overflow')}
        onAvatar={() => console.log('avatar')}
      />
      <EmptyState
        isVisible={!hasData}
        headline={copy.headline}
        ctaLabel={copy.ctaLabel}
        secondaryLabel={copy.secondaryLabel}
        onCta={() => {}}
        onSecondary={() => {}}
        invitationHeadline={copy.invitationHeadline}
        invitationDescription={copy.invitationDescription}
        invitationCtaLabel={copy.invitationCtaLabel}
        invitationSecondaryLabel={copy.invitationSecondaryLabel}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: theme.background }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 48, gap: 14 }}
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
            isRedacted={!hasData}
          />
          <SpendStoryCard
            totalSpend={2847}
            currency="€"
            vsAverage={12}
            investedAmount={1500}
            investmentTarget={1500}
            topInsight={{
              categoryName: 'Eating out',
              vsAverage: 34,
              topMerchant: 'Deliveroo',
            }}
            onSpendPress={() => console.log('→ Spend tab')}
            onInvestPress={() => console.log('→ Portfolio tab')}
            isRedacted={!hasData}
          />
          <SegregationToggle isRedacted={!hasData} />
          <MarketsStrip items={MARKETS_DATA} isRedacted={!hasData} />
          <PortfolioPulse items={PULSE_DATA} isRedacted={!hasData} />
          <FIREProgress percentage={63} projectedYear={2036} isSetUp={true} isRedacted={!hasData} />
          <MonthlyReviewLink
            month={reviewMonth}
            isVisible={reviewVisible}
            isRedacted={!hasData}
            onPress={() => {}}
          />
        </ScrollView>
      </EmptyState>
    </View>
  );
}
