export const MOCK_POSITION = 450200;
export const MOCK_POSITION_DELTA_MONTH = 2340;
export const MOCK_POSITION_DELTA_YTD = 18400;
export const MOCK_SAVINGS_RATE = 45;
export const MOCK_LIQUID_ASSETS = 380200;
export const MOCK_ILLIQUID_ASSETS = 120000;
export const MOCK_LIABILITIES = 50000;

export const MOCK_SPEND = 2847;
export const MOCK_BUDGET = 4500;
export const MOCK_SPEND_CURRENCY = '€';

export const MOCK_FIRE_PERCENTAGE = 63;
export const MOCK_FIRE_YEAR = 2036;

export const MOCK_MARKETS = [
  { label: 'S&P 500', change: 0.4, positive: true },
  { label: 'NIFTY 50', change: -0.8, positive: false },
  { label: 'EUR/INR', change: -0.3, positive: false },
  { label: 'Gold', change: 1.2, positive: true },
];

export const MOCK_PULSE = [
  {
    ticker: 'VWRL',
    change: 1.2,
    positive: true,
    headline: 'Global markets rally on Fed pause',
  },
  {
    ticker: 'INFY',
    change: -0.8,
    positive: false,
    headline: 'Q3 margins under pressure',
  },
  {
    ticker: 'PPFCF',
    change: 2.1,
    positive: true,
    headline: 'Flexi cap inflows hit 6-month high',
  },
];

export const MOCK_PORTFOLIO = {
  live: 312400,
  locked: 48200,
  total: 360600,
  deltaMonth: 2340,
  holdings: [
    {
      id: '1',
      name: 'VWRL',
      value: 124000,
      change: 1.2,
      positive: true,
      bucket: 'GROWTH',
      geography: 'Europe',
      flag: '🇪🇺',
    },
    {
      id: '2',
      name: 'Infosys',
      value: 68000,
      change: -0.8,
      positive: false,
      bucket: 'GROWTH',
      geography: 'India',
      flag: '🇮🇳',
    },
    {
      id: '3',
      name: 'Parag Parikh MF',
      value: 54000,
      change: 2.1,
      positive: true,
      bucket: 'GROWTH',
      geography: 'India',
      flag: '🇮🇳',
    },
    {
      id: '4',
      name: 'NRE Savings',
      value: 42000,
      change: 0,
      positive: true,
      bucket: 'STABILITY',
      geography: 'India',
      flag: '🇮🇳',
    },
    {
      id: '5',
      name: 'PPF',
      value: 48200,
      change: 0,
      positive: true,
      bucket: 'LOCKED',
      geography: 'India',
      flag: '🔒',
    },
  ],
};

export const MOCK_SPEND_CATEGORIES = [
  { name: 'Groceries', amount: 680, percentage: 24, icon: '🛒' },
  { name: 'Eating out', amount: 420, percentage: 15, icon: '🍽️' },
  { name: 'Transport', amount: 380, percentage: 13, icon: '🚆' },
  { name: 'Utilities', amount: 340, percentage: 12, icon: '💡' },
  { name: 'Shopping', amount: 290, percentage: 10, icon: '🛍️' },
  { name: 'Health', amount: 220, percentage: 8, icon: '🏥' },
  { name: 'Subscriptions', amount: 180, percentage: 6, icon: '📱' },
  { name: 'Other', amount: 337, percentage: 12, icon: '📦' },
];

export const MOCK_INSIGHT = {
  type: 'PORTFOLIO_HEALTH',
  headline: 'Employer stock at 18% of portfolio',
  body: 'Your employer stock has grown above the 15% concentration threshold. Consider rebalancing to reduce single-stock risk.',
};

export const MOCK_MONTHLY_REVIEW = {
  month: 'February',
  year: 2026,
  whereYouStand:
    'Your position grew €2,340 this month. Savings rate held at 45% — above your 3-month average of 41%.',
};
