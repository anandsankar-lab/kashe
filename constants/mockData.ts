import { AppDataState, DataSource, SpendTransaction, SpendSubcategory } from '../types/spend';
import { PortfolioHolding, PortfolioTotals, InvestmentPlan } from '../types/portfolio';

export const MOCK_APP_STATE: AppDataState = 'HAS_DATA';
// Change to 'UNAUTHENTICATED' or 'AUTHENTICATED_EMPTY' to test other states

export const MOCK_DATA_SOURCES: DataSource[] = [
  {
    id: 'bank-a-spend',
    institution: 'Bank A',
    accountLabel: 'Current account',
    lastUpdatedDays: 16,
    status: 'STALE',
    type: 'SPEND',
  },
  {
    id: 'bank-b-spend',
    institution: 'Bank B',
    accountLabel: 'Personal',
    lastUpdatedDays: 3,
    status: 'FRESH',
    type: 'SPEND',
  },
  {
    id: 'brokerage-portfolio',
    institution: 'Brokerage',
    accountLabel: 'Investment account',
    lastUpdatedDays: null,
    status: 'NEVER_CONNECTED',
    type: 'PORTFOLIO',
  },
];

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

// ── SPEND CATEGORIES MOCK DATA ─────────────────────────────────────────────────
// Rich structure for category detail screens and empty-state ghost.
// Merchants are internationally neutral — no country-specific brand names.

interface MockTxn {
  date: string;
  merchant: string;
  amount: number;
  subcategory: string;
}

interface MockSubcat {
  id: string;
  label: string;
  amount: number;
  transactions: MockTxn[];
}

export interface MockSpendCategory {
  category: string;
  amount: number;
  budget: number | null;
  subcategories: MockSubcat[];
}

export const MOCK_SPEND_CATEGORIES: MockSpendCategory[] = [
  {
    category: 'housing',
    amount: 1850.00,
    budget: 2000.00,
    subcategories: [
      {
        id: 'rent_mortgage', label: 'Rent / Mortgage', amount: 1650.00,
        transactions: [
          { date: '2026-03-01', merchant: 'Monthly Rent', amount: 1650.00, subcategory: 'rent_mortgage' },
        ],
      },
      {
        id: 'maintenance_repairs', label: 'Maintenance & repairs', amount: 120.00,
        transactions: [
          { date: '2026-03-05', merchant: 'Hardware Store', amount: 120.00, subcategory: 'maintenance_repairs' },
        ],
      },
      {
        id: 'cleaning_help', label: 'Cleaning & household help', amount: 80.00,
        transactions: [
          { date: '2026-03-08', merchant: 'Cleaning Service', amount: 80.00, subcategory: 'cleaning_help' },
        ],
      },
    ],
  },
  {
    category: 'groceries',
    amount: 380.00,
    budget: 400.00,
    subcategories: [
      {
        id: 'supermarket', label: 'Supermarket', amount: 245.50,
        transactions: [
          { date: '2026-03-02', merchant: 'City Supermarket', amount: 67.30, subcategory: 'supermarket' },
          { date: '2026-03-07', merchant: 'City Supermarket', amount: 89.20, subcategory: 'supermarket' },
          { date: '2026-03-14', merchant: 'City Supermarket', amount: 89.00, subcategory: 'supermarket' },
        ],
      },
      {
        id: 'online_grocery', label: 'Online grocery delivery', amount: 94.50,
        transactions: [
          { date: '2026-03-10', merchant: 'Grocery Delivery', amount: 94.50, subcategory: 'online_grocery' },
        ],
      },
      {
        id: 'fresh_market', label: 'Fresh market', amount: 40.00,
        transactions: [
          { date: '2026-03-09', merchant: 'Weekend Market', amount: 40.00, subcategory: 'fresh_market' },
        ],
      },
    ],
  },
  {
    category: 'eating_out',
    amount: 285.00,
    budget: 300.00,
    subcategories: [
      {
        id: 'food_delivery', label: 'Food delivery', amount: 94.60,
        transactions: [
          { date: '2026-03-03', merchant: 'Food Delivery App', amount: 28.50, subcategory: 'food_delivery' },
          { date: '2026-03-11', merchant: 'Food Delivery App', amount: 32.40, subcategory: 'food_delivery' },
          { date: '2026-03-18', merchant: 'Food Delivery App', amount: 33.70, subcategory: 'food_delivery' },
        ],
      },
      {
        id: 'restaurants', label: 'Restaurants', amount: 128.40,
        transactions: [
          { date: '2026-03-08', merchant: 'Local Restaurant', amount: 67.00, subcategory: 'restaurants' },
          { date: '2026-03-15', merchant: 'Bistro', amount: 61.40, subcategory: 'restaurants' },
        ],
      },
      {
        id: 'cafes_coffee', label: 'Cafés & coffee', amount: 37.50,
        transactions: [
          { date: '2026-03-04', merchant: 'Coffee Shop', amount: 4.80, subcategory: 'cafes_coffee' },
          { date: '2026-03-06', merchant: 'Coffee Shop', amount: 4.80, subcategory: 'cafes_coffee' },
          { date: '2026-03-10', merchant: 'Café', amount: 12.50, subcategory: 'cafes_coffee' },
          { date: '2026-03-13', merchant: 'Coffee Shop', amount: 4.80, subcategory: 'cafes_coffee' },
          { date: '2026-03-17', merchant: 'Coffee Shop', amount: 10.60, subcategory: 'cafes_coffee' },
        ],
      },
    ],
  },
  {
    category: 'transport',
    amount: 180.00,
    budget: null,
    subcategories: [
      {
        id: 'public_transit', label: 'Public transit', amount: 89.00,
        transactions: [
          { date: '2026-03-01', merchant: 'Transit Card Top-up', amount: 50.00, subcategory: 'public_transit' },
          { date: '2026-03-15', merchant: 'Train Ticket', amount: 39.00, subcategory: 'public_transit' },
        ],
      },
      {
        id: 'taxi_rideshare', label: 'Taxi & rideshare', amount: 54.00,
        transactions: [
          { date: '2026-03-06', merchant: 'Ride Share App', amount: 18.50, subcategory: 'taxi_rideshare' },
          { date: '2026-03-12', merchant: 'Ride Share App', amount: 22.30, subcategory: 'taxi_rideshare' },
          { date: '2026-03-20', merchant: 'Taxi', amount: 13.20, subcategory: 'taxi_rideshare' },
        ],
      },
      {
        id: 'parking', label: 'Parking', amount: 37.00,
        transactions: [
          { date: '2026-03-08', merchant: 'Parking', amount: 22.00, subcategory: 'parking' },
          { date: '2026-03-16', merchant: 'Parking Garage', amount: 15.00, subcategory: 'parking' },
        ],
      },
    ],
  },
  {
    category: 'subscriptions',
    amount: 67.50,
    budget: 80.00,
    subcategories: [
      {
        id: 'video_streaming', label: 'Video streaming', amount: 27.97,
        transactions: [
          { date: '2026-03-03', merchant: 'Streaming Service A', amount: 15.99, subcategory: 'video_streaming' },
          { date: '2026-03-08', merchant: 'Streaming Service B', amount: 11.98, subcategory: 'video_streaming' },
        ],
      },
      {
        id: 'music_streaming', label: 'Music streaming', amount: 10.99,
        transactions: [
          { date: '2026-03-05', merchant: 'Music Service', amount: 10.99, subcategory: 'music_streaming' },
        ],
      },
      {
        id: 'software_productivity', label: 'Software & productivity', amount: 28.54,
        transactions: [
          { date: '2026-03-01', merchant: 'Cloud Storage', amount: 9.99, subcategory: 'cloud_storage' },
          { date: '2026-03-02', merchant: 'Productivity App', amount: 18.55, subcategory: 'software_productivity' },
        ],
      },
    ],
  },
  {
    category: 'utilities',
    amount: 195.00,
    budget: 200.00,
    subcategories: [
      {
        id: 'electricity_gas', label: 'Electricity & gas', amount: 95.00,
        transactions: [
          { date: '2026-03-05', merchant: 'Energy Provider', amount: 95.00, subcategory: 'electricity_gas' },
        ],
      },
      {
        id: 'internet', label: 'Internet', amount: 45.00,
        transactions: [
          { date: '2026-03-05', merchant: 'Internet Provider', amount: 45.00, subcategory: 'internet' },
        ],
      },
      {
        id: 'mobile_phone', label: 'Mobile / phone', amount: 55.00,
        transactions: [
          { date: '2026-03-05', merchant: 'Mobile Provider', amount: 55.00, subcategory: 'mobile_phone' },
        ],
      },
    ],
  },
  {
    category: 'health',
    amount: 100.00,
    budget: null,
    subcategories: [
      {
        id: 'pharmacy', label: 'Pharmacy', amount: 38.00,
        transactions: [
          { date: '2026-03-07', merchant: 'Pharmacy', amount: 38.00, subcategory: 'pharmacy' },
        ],
      },
      {
        id: 'doctor_gp', label: 'Doctor & GP', amount: 62.00,
        transactions: [
          { date: '2026-03-12', merchant: 'Medical Clinic', amount: 62.00, subcategory: 'doctor_gp' },
        ],
      },
    ],
  },
  {
    category: 'personal_care',
    amount: 75.00,
    budget: null,
    subcategories: [
      {
        id: 'gym_fitness', label: 'Gym & fitness', amount: 45.00,
        transactions: [
          { date: '2026-03-01', merchant: 'Gym Membership', amount: 45.00, subcategory: 'gym_fitness' },
        ],
      },
      {
        id: 'haircut_salon', label: 'Haircut & salon', amount: 30.00,
        transactions: [
          { date: '2026-03-18', merchant: 'Hair Salon', amount: 30.00, subcategory: 'haircut_salon' },
        ],
      },
    ],
  },
  {
    category: 'insurance',
    amount: 180.00,
    budget: 200.00,
    subcategories: [
      {
        id: 'health_insurance', label: 'Health insurance', amount: 120.00,
        transactions: [
          { date: '2026-03-01', merchant: 'Health Insurer', amount: 120.00, subcategory: 'health_insurance' },
        ],
      },
      {
        id: 'home_contents', label: 'Home & contents', amount: 35.00,
        transactions: [
          { date: '2026-03-01', merchant: 'Home Insurance', amount: 35.00, subcategory: 'home_contents' },
        ],
      },
      {
        id: 'life_insurance', label: 'Life insurance', amount: 25.00,
        transactions: [
          { date: '2026-03-01', merchant: 'Life Insurer', amount: 25.00, subcategory: 'life_insurance' },
        ],
      },
    ],
  },
  {
    category: 'shopping',
    amount: 124.00,
    budget: 150.00,
    subcategories: [
      {
        id: 'online_retail', label: 'Online retail', amount: 54.00,
        transactions: [
          { date: '2026-03-09', merchant: 'Online Retailer', amount: 54.00, subcategory: 'online_retail' },
        ],
      },
      {
        id: 'clothing_accessories', label: 'Clothing & accessories', amount: 70.00,
        transactions: [
          { date: '2026-03-14', merchant: 'Clothing Store', amount: 70.00, subcategory: 'clothing_accessories' },
        ],
      },
    ],
  },
  {
    category: 'childcare',
    amount: 0,
    budget: null,
    subcategories: [],
  },
  {
    category: 'education',
    amount: 0,
    budget: null,
    subcategories: [],
  },
  {
    category: 'travel',
    amount: 0,
    budget: null,
    subcategories: [],
  },
  {
    category: 'gifts_giving',
    amount: 0,
    budget: null,
    subcategories: [],
  },
  {
    category: 'other',
    amount: 38.50,
    budget: null,
    subcategories: [
      {
        id: 'other_uncategorised', label: 'Uncategorised', amount: 38.50,
        transactions: [
          { date: '2026-03-11', merchant: 'Unknown Merchant', amount: 18.50, subcategory: 'other_uncategorised' },
          { date: '2026-03-16', merchant: 'Misc Purchase', amount: 20.00, subcategory: 'other_uncategorised' },
        ],
      },
    ],
  },
];

// Excluded from spend total — shown separately
export const MOCK_TRANSFERS: MockSpendCategory[] = [
  {
    category: 'investment_transfer',
    amount: 920.00,
    budget: null,
    subcategories: [
      {
        id: 'brokerage_transfer', label: 'Brokerage transfer', amount: 500.00,
        transactions: [
          { date: '2026-03-04', merchant: 'Brokerage Account', amount: 500.00, subcategory: 'brokerage_transfer' },
        ],
      },
      {
        id: 'sip_recurring', label: 'SIP / recurring investment', amount: 420.00,
        transactions: [
          { date: '2026-03-04', merchant: 'Investment Platform', amount: 420.00, subcategory: 'sip_recurring' },
        ],
      },
    ],
  },
  {
    category: 'transfer',
    amount: 500.00,
    budget: null,
    subcategories: [
      {
        id: 'family_remittance', label: 'Family remittance', amount: 500.00,
        transactions: [
          { date: '2026-03-06', merchant: 'International Transfer', amount: 500.00, subcategory: 'family_remittance' },
        ],
      },
    ],
  },
];

export const MOCK_INCOME = [
  { date: '2026-03-25', merchant: 'Employer', amount: 5800.00, category: 'income', subcategory: 'salary' },
];

export const MOCK_INSIGHT = {
  type: 'PORTFOLIO_HEALTH',
  headline: 'Employer stock at 18% of portfolio',
  body: 'Your employer stock has grown above the 15% concentration threshold. Consider rebalancing to reduce single-stock risk.',
};

export const MOCK_MONTHLY_REVIEW = {
  month: 'March',
  year: 2026,
  whereYouStand:
    'Your position grew €2,340 this month. Savings rate held at 45% — above your 3-month average of 41%.',
};

// ── EATING OUT TRANSACTIONS ───────────────────────────────────────────────────

const t1: SpendTransaction = {
  id: 't1', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-07'), merchant: 'Food Delivery App',
  description: 'Online order', amount: 34.50, currency: 'EUR',
  category: 'eating_out', subcategory: 'food_delivery',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Food delivery order', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'food delivery app',
  currencyOriginal: 'EUR', amountOriginal: 34.50,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t2: SpendTransaction = {
  id: 't2', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-05'), merchant: 'Food Delivery App',
  description: 'Food delivery', amount: 28.90, currency: 'EUR',
  category: 'eating_out', subcategory: 'food_delivery',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Food delivery order', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'food delivery app',
  currencyOriginal: 'EUR', amountOriginal: 28.90,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t3: SpendTransaction = {
  id: 't3', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-04'), merchant: 'Work Cafeteria',
  description: 'Lunch', amount: 12.50, currency: 'EUR',
  category: 'eating_out', subcategory: 'work_lunch',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Work cafeteria lunch', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'work cafeteria',
  currencyOriginal: 'EUR', amountOriginal: 12.50,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t4: SpendTransaction = {
  id: 't4', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-02'), merchant: 'Local Restaurant',
  description: 'Dinner', amount: 67.00, currency: 'EUR',
  category: 'eating_out', subcategory: 'restaurants',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Restaurant dinner', isExcluded: false,
  dataSource: 'CSV', tags: ['work-dinner'], merchantNorm: 'local restaurant',
  currencyOriginal: 'EUR', amountOriginal: 67.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t5: SpendTransaction = {
  id: 't5', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'Food Delivery App',
  description: 'Online order', amount: 31.20, currency: 'EUR',
  category: 'eating_out', subcategory: 'food_delivery',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Food delivery order', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'food delivery app',
  currencyOriginal: 'EUR', amountOriginal: 31.20,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t6: SpendTransaction = {
  id: 't6', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'Coffee Shop',
  description: 'Coffee & snack', amount: 4.80, currency: 'EUR',
  category: 'eating_out', subcategory: 'cafes_coffee',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Coffee shop', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'coffee shop',
  currencyOriginal: 'EUR', amountOriginal: 4.80,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

export const MOCK_TRANSACTIONS: SpendTransaction[] = [t1, t2, t3, t4, t5, t6];

export const MOCK_SUBCATEGORIES: SpendSubcategory[] = [
  { id: 'food_delivery', name: 'Food delivery', amount: 94.60, currency: 'EUR',
    transactionCount: 3, transactions: [t1, t2, t5] },
  { id: 'restaurants', name: 'Restaurants', amount: 67.00, currency: 'EUR',
    transactionCount: 1, transactions: [t4] },
  { id: 'work_lunch', name: 'Work lunch', amount: 12.50, currency: 'EUR',
    transactionCount: 1, transactions: [t3] },
  { id: 'cafes_coffee', name: 'Cafés & coffee', amount: 4.80, currency: 'EUR',
    transactionCount: 1, transactions: [t6] },
];

export const MOCK_TAGS = ['work-dinner'];

// ── TRANSPORT TRANSACTIONS ────────────────────────────────────────────────────

const t7: SpendTransaction = {
  id: 't7', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-07'), merchant: 'City Rail',
  description: 'Rail ticket', amount: 19.00, currency: 'EUR',
  category: 'transport', subcategory: 'public_transit',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City rail ticket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city rail',
  currencyOriginal: 'EUR', amountOriginal: 19.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t8: SpendTransaction = {
  id: 't8', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-06'), merchant: 'City Rail',
  description: 'Rail ticket', amount: 15.00, currency: 'EUR',
  category: 'transport', subcategory: 'public_transit',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City rail ticket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city rail',
  currencyOriginal: 'EUR', amountOriginal: 15.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t9: SpendTransaction = {
  id: 't9', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-05'), merchant: 'City Transit',
  description: 'Day pass', amount: 11.00, currency: 'EUR',
  category: 'transport', subcategory: 'public_transit',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City transit day pass', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city transit',
  currencyOriginal: 'EUR', amountOriginal: 11.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t10: SpendTransaction = {
  id: 't10', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-04'), merchant: 'City Transit',
  description: '1-hour ticket', amount: 9.00, currency: 'EUR',
  category: 'transport', subcategory: 'public_transit',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City transit ticket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city transit',
  currencyOriginal: 'EUR', amountOriginal: 9.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t11: SpendTransaction = {
  id: 't11', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-03'), merchant: 'City Rail',
  description: 'Rail ticket', amount: 10.00, currency: 'EUR',
  category: 'transport', subcategory: 'public_transit',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City rail ticket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city rail',
  currencyOriginal: 'EUR', amountOriginal: 10.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t12: SpendTransaction = {
  id: 't12', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-02'), merchant: 'City Transit',
  description: '1-hour ticket', amount: 8.50, currency: 'EUR',
  category: 'transport', subcategory: 'public_transit',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City transit ticket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city transit',
  currencyOriginal: 'EUR', amountOriginal: 8.50,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t13: SpendTransaction = {
  id: 't13', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'City Rail',
  description: 'Rail ticket', amount: 9.50, currency: 'EUR',
  category: 'transport', subcategory: 'public_transit',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City rail ticket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city rail',
  currencyOriginal: 'EUR', amountOriginal: 9.50,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t14: SpendTransaction = {
  id: 't14', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'City Transit',
  description: '1-hour ticket', amount: 7.00, currency: 'EUR',
  category: 'transport', subcategory: 'public_transit',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City transit ticket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city transit',
  currencyOriginal: 'EUR', amountOriginal: 7.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t15: SpendTransaction = {
  id: 't15', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-06'), merchant: 'Ride Share App',
  description: 'Ride to airport', amount: 28.00, currency: 'EUR',
  category: 'transport', subcategory: 'taxi_rideshare',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Ride share trip', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'ride share app',
  currencyOriginal: 'EUR', amountOriginal: 28.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t16: SpendTransaction = {
  id: 't16', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-03'), merchant: 'Ride Share App',
  description: 'Evening ride', amount: 26.00, currency: 'EUR',
  category: 'transport', subcategory: 'taxi_rideshare',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Ride share trip', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'ride share app',
  currencyOriginal: 'EUR', amountOriginal: 26.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t17: SpendTransaction = {
  id: 't17', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-04'), merchant: 'City Parking',
  description: 'Parking', amount: 22.00, currency: 'EUR',
  category: 'transport', subcategory: 'parking',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City parking', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city parking',
  currencyOriginal: 'EUR', amountOriginal: 22.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t18: SpendTransaction = {
  id: 't18', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-02'), merchant: 'Petrol Station',
  description: 'Fuel', amount: 15.00, currency: 'EUR',
  category: 'transport', subcategory: 'fuel',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Petrol station fuel', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'petrol station',
  currencyOriginal: 'EUR', amountOriginal: 15.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

// ── GROCERIES TRANSACTIONS ────────────────────────────────────────────────────

const t19: SpendTransaction = {
  id: 't19', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-07'), merchant: 'City Supermarket',
  description: 'Weekly shop', amount: 45.00, currency: 'EUR',
  category: 'groceries', subcategory: 'supermarket',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City supermarket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city supermarket',
  currencyOriginal: 'EUR', amountOriginal: 45.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t20: SpendTransaction = {
  id: 't20', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-05'), merchant: 'City Supermarket',
  description: 'Groceries', amount: 38.50, currency: 'EUR',
  category: 'groceries', subcategory: 'supermarket',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City supermarket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city supermarket',
  currencyOriginal: 'EUR', amountOriginal: 38.50,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t21: SpendTransaction = {
  id: 't21', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-04'), merchant: 'Supermarket',
  description: 'Weekly shop', amount: 42.00, currency: 'EUR',
  category: 'groceries', subcategory: 'supermarket',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Supermarket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'supermarket',
  currencyOriginal: 'EUR', amountOriginal: 42.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t22: SpendTransaction = {
  id: 't22', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-03'), merchant: 'City Supermarket',
  description: 'Groceries', amount: 31.00, currency: 'EUR',
  category: 'groceries', subcategory: 'supermarket',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City supermarket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city supermarket',
  currencyOriginal: 'EUR', amountOriginal: 31.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t23: SpendTransaction = {
  id: 't23', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'Supermarket',
  description: 'Groceries', amount: 29.00, currency: 'EUR',
  category: 'groceries', subcategory: 'supermarket',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Supermarket', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'supermarket',
  currencyOriginal: 'EUR', amountOriginal: 29.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t24: SpendTransaction = {
  id: 't24', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'City Supermarket',
  description: 'Top-up shop', amount: 24.50, currency: 'EUR',
  category: 'groceries', subcategory: 'supermarket',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'City supermarket top-up', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'city supermarket',
  currencyOriginal: 'EUR', amountOriginal: 24.50,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t25: SpendTransaction = {
  id: 't25', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-05'), merchant: 'Organic Market',
  description: 'Fresh produce', amount: 22.00, currency: 'EUR',
  category: 'groceries', subcategory: 'fresh_market',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Organic market', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'organic market',
  currencyOriginal: 'EUR', amountOriginal: 22.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t26: SpendTransaction = {
  id: 't26', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-02'), merchant: 'Weekend Market',
  description: 'Fresh produce', amount: 12.00, currency: 'EUR',
  category: 'groceries', subcategory: 'fresh_market',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Weekend market', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'weekend market',
  currencyOriginal: 'EUR', amountOriginal: 12.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t27: SpendTransaction = {
  id: 't27', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-04'), merchant: 'Grocery Delivery',
  description: 'Online grocery delivery', amount: 67.50, currency: 'EUR',
  category: 'groceries', subcategory: 'online_grocery',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Grocery delivery', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'grocery delivery',
  currencyOriginal: 'EUR', amountOriginal: 67.50,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

// ── SHOPPING TRANSACTIONS ─────────────────────────────────────────────────────

const t28: SpendTransaction = {
  id: 't28', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-06'), merchant: 'Online Retailer',
  description: 'Online order', amount: 22.00, currency: 'EUR',
  category: 'shopping', subcategory: 'online_retail',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Online retailer order', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'online retailer',
  currencyOriginal: 'EUR', amountOriginal: 22.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t29: SpendTransaction = {
  id: 't29', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-04'), merchant: 'Online Store',
  description: 'Online order', amount: 18.00, currency: 'EUR',
  category: 'shopping', subcategory: 'online_retail',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Online store order', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'online store',
  currencyOriginal: 'EUR', amountOriginal: 18.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t30: SpendTransaction = {
  id: 't30', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-02'), merchant: 'Online Retailer',
  description: 'Online order', amount: 14.00, currency: 'EUR',
  category: 'shopping', subcategory: 'online_retail',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Online retailer order', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'online retailer',
  currencyOriginal: 'EUR', amountOriginal: 14.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t31: SpendTransaction = {
  id: 't31', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-03'), merchant: 'Clothing Store',
  description: 'Clothing', amount: 35.00, currency: 'EUR',
  category: 'shopping', subcategory: 'clothing_accessories',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Clothing store', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'clothing store',
  currencyOriginal: 'EUR', amountOriginal: 35.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

// ── HEALTH TRANSACTIONS ───────────────────────────────────────────────────────

const t32: SpendTransaction = {
  id: 't32', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-05'), merchant: 'Pharmacy',
  description: 'Pharmacy', amount: 19.00, currency: 'EUR',
  category: 'health', subcategory: 'pharmacy',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Pharmacy', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'pharmacy',
  currencyOriginal: 'EUR', amountOriginal: 19.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t33: SpendTransaction = {
  id: 't33', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-02'), merchant: 'Local Pharmacy',
  description: 'Prescription', amount: 19.00, currency: 'EUR',
  category: 'health', subcategory: 'pharmacy',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Local pharmacy', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'local pharmacy',
  currencyOriginal: 'EUR', amountOriginal: 19.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t34: SpendTransaction = {
  id: 't34', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'Gym Membership',
  description: 'Monthly membership', amount: 45.00, currency: 'EUR',
  category: 'personal_care', subcategory: 'gym_fitness',
  geography: 'europe', ownership: 'personal', isRecurring: true,
  rawDescription: 'Gym membership', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'gym membership',
  currencyOriginal: 'EUR', amountOriginal: 45.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t35: SpendTransaction = {
  id: 't35', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-04'), merchant: 'Medical Clinic',
  description: 'GP appointment', amount: 62.00, currency: 'EUR',
  category: 'health', subcategory: 'doctor_gp',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Medical clinic appointment', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'medical clinic',
  currencyOriginal: 'EUR', amountOriginal: 62.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

// ── HOUSING TRANSACTIONS ──────────────────────────────────────────────────────

const t36: SpendTransaction = {
  id: 't36', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'Monthly Rent',
  description: 'Rent March 2026', amount: 1650.00, currency: 'EUR',
  category: 'housing', subcategory: 'rent_mortgage',
  geography: 'europe', ownership: 'personal', isRecurring: true,
  rawDescription: 'Monthly rent', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'monthly rent',
  currencyOriginal: 'EUR', amountOriginal: 1650.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t39: SpendTransaction = {
  id: 't39', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-06'), merchant: 'Hardware Store',
  description: 'Repair supplies', amount: 45.00, currency: 'EUR',
  category: 'housing', subcategory: 'maintenance_repairs',
  geography: 'europe', ownership: 'personal', isRecurring: false,
  rawDescription: 'Hardware store', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'hardware store',
  currencyOriginal: 'EUR', amountOriginal: 45.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

// ── UTILITIES TRANSACTIONS ────────────────────────────────────────────────────

const t37: SpendTransaction = {
  id: 't37', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'Energy Provider',
  description: 'Electricity & gas', amount: 55.00, currency: 'EUR',
  category: 'utilities', subcategory: 'electricity_gas',
  geography: 'europe', ownership: 'personal', isRecurring: true,
  rawDescription: 'Energy provider', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'energy provider',
  currencyOriginal: 'EUR', amountOriginal: 55.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

const t38: SpendTransaction = {
  id: 't38', dataSourceId: 'ds1', profileId: 'p1', householdId: 'h1',
  date: new Date('2026-03-01'), merchant: 'Internet Provider',
  description: 'Internet & TV', amount: 40.00, currency: 'EUR',
  category: 'utilities', subcategory: 'internet',
  geography: 'europe', ownership: 'personal', isRecurring: true,
  rawDescription: 'Internet provider', isExcluded: false,
  dataSource: 'CSV', tags: [], merchantNorm: 'internet provider',
  currencyOriginal: 'EUR', amountOriginal: 40.00,
  fxRateApplied: null, importedAt: new Date('2026-03-08'),
};

// ── SUBCATEGORY MAP (used by category detail screen) ─────────────────────────

export const MOCK_SUBCATEGORIES_BY_CATEGORY: Record<string, SpendSubcategory[]> = {
  eating_out: MOCK_SUBCATEGORIES,
  transport: [
    {
      id: 'public_transit', name: 'Public transit', amount: 89.00, currency: 'EUR',
      transactionCount: 8, transactions: [t7, t8, t9, t10, t11, t12, t13, t14],
    },
    {
      id: 'taxi_rideshare', name: 'Taxi & rideshare', amount: 54.00, currency: 'EUR',
      transactionCount: 2, transactions: [t15, t16],
    },
    {
      id: 'parking', name: 'Parking', amount: 22.00, currency: 'EUR',
      transactionCount: 1, transactions: [t17],
    },
    {
      id: 'fuel', name: 'Fuel', amount: 15.00, currency: 'EUR',
      transactionCount: 1, transactions: [t18],
    },
  ],
  groceries: [
    {
      id: 'supermarket', name: 'Supermarket', amount: 210.00, currency: 'EUR',
      transactionCount: 6, transactions: [t19, t20, t21, t22, t23, t24],
    },
    {
      id: 'fresh_market', name: 'Fresh market', amount: 34.00, currency: 'EUR',
      transactionCount: 2, transactions: [t25, t26],
    },
    {
      id: 'online_grocery', name: 'Online delivery', amount: 67.50, currency: 'EUR',
      transactionCount: 1, transactions: [t27],
    },
  ],
  shopping: [
    {
      id: 'online_retail', name: 'Online retail', amount: 54.00, currency: 'EUR',
      transactionCount: 3, transactions: [t28, t29, t30],
    },
    {
      id: 'clothing_accessories', name: 'Clothing & accessories', amount: 35.00, currency: 'EUR',
      transactionCount: 1, transactions: [t31],
    },
  ],
  health: [
    {
      id: 'pharmacy', name: 'Pharmacy', amount: 38.00, currency: 'EUR',
      transactionCount: 2, transactions: [t32, t33],
    },
    {
      id: 'doctor_gp', name: 'Doctor & GP', amount: 62.00, currency: 'EUR',
      transactionCount: 1, transactions: [t35],
    },
  ],
  personal_care: [
    {
      id: 'gym_fitness', name: 'Gym & fitness', amount: 45.00, currency: 'EUR',
      transactionCount: 1, transactions: [t34],
    },
  ],
  housing: [
    {
      id: 'rent_mortgage', name: 'Rent / Mortgage', amount: 1650.00, currency: 'EUR',
      transactionCount: 1, transactions: [t36],
    },
    {
      id: 'maintenance_repairs', name: 'Maintenance & repairs', amount: 45.00, currency: 'EUR',
      transactionCount: 1, transactions: [t39],
    },
  ],
  utilities: [
    {
      id: 'electricity_gas', name: 'Electricity & gas', amount: 55.00, currency: 'EUR',
      transactionCount: 1, transactions: [t37],
    },
    {
      id: 'internet', name: 'Internet', amount: 40.00, currency: 'EUR',
      transactionCount: 1, transactions: [t38],
    },
  ],
};

// ── PORTFOLIO MOCK DATA ───────────────────────────────────────────────────────

export const MOCK_PORTFOLIO_HOLDINGS: PortfolioHolding[] = [
  { id: 'h1', name: 'VWRL — Vanguard All-World ETF', assetClass: 'equity', assetSubtype: 'eu_etf', bucket: 'GROWTH', geography: 'europe', domicile: 'Ireland', currentValue: 48200, currency: 'EUR', dailyChangePercent: 0.6, freshnessStatus: 'fresh', isProtection: false, valueInBaseCurrency: 48200, lastUpdated: '2026-03-18' },
  { id: 'h2', name: 'Invesco Nasdaq 100 ETF', assetClass: 'equity', assetSubtype: 'eu_etf', bucket: 'GROWTH', geography: 'europe', domicile: 'Ireland', currentValue: 31400, currency: 'EUR', dailyChangePercent: 1.2, freshnessStatus: 'fresh', isProtection: false, valueInBaseCurrency: 31400, lastUpdated: '2026-03-18' },
  { id: 'h3', name: 'Apple Inc — RSU', assetClass: 'equity', assetSubtype: 'employer_rsu', bucket: 'GROWTH', geography: 'us', domicile: 'United States', currentValue: 22800, currency: 'EUR', dailyChangePercent: -0.4, freshnessStatus: 'amber', isProtection: false, valueInBaseCurrency: 22800, lastUpdated: '2026-03-18' },
  { id: 'h4', name: 'Current Account', assetClass: 'cash', assetSubtype: 'cash_general', bucket: 'STABILITY', geography: 'europe', domicile: 'Netherlands', currentValue: 8400, currency: 'EUR', dailyChangePercent: 0, freshnessStatus: 'fresh', isProtection: true, avgMonthlySpend: 3000, valueInBaseCurrency: 8400, lastUpdated: '2026-03-18' },
  { id: 'h5', name: 'High-Yield Savings', assetClass: 'cash', assetSubtype: 'cash_general', bucket: 'STABILITY', geography: 'us', domicile: 'United States', currentValue: 12700, currency: 'EUR', dailyChangePercent: 0, freshnessStatus: 'fresh', isProtection: false, valueInBaseCurrency: 12700, lastUpdated: '2026-03-18' },
  { id: 'h6', name: 'Roth IRA — S&P 500 Index', assetClass: 'retirement', assetSubtype: 'us_roth_ira', bucket: 'LOCKED', geography: 'us', domicile: 'United States', currentValue: 34600, currency: 'EUR', dailyChangePercent: 0, freshnessStatus: 'fresh', isProtection: false, unlockDate: '2041-01-01', valueInBaseCurrency: 34600, lastUpdated: '2026-03-18' },
  { id: 'h7', name: 'Seedrs Portfolio', assetClass: 'alternative', assetSubtype: 'alternative_general', bucket: 'LOCKED', geography: 'europe', domicile: 'United Kingdom', currentValue: 13600, currency: 'EUR', dailyChangePercent: 0, freshnessStatus: 'stale', isProtection: false, valueInBaseCurrency: 13600, lastUpdated: '2026-03-18' },
];

export const MOCK_HOLDINGS = MOCK_PORTFOLIO_HOLDINGS

export const MOCK_PORTFOLIO_TOTALS: PortfolioTotals = {
  liveTotal: 123500,
  lockedTotal: 48200,
  combinedTotal: 171700,
  monthlyDeltaLive: 2640,
  baseCurrency: 'EUR',
  lastRefreshed: '2026-03-18T09:00:00.000Z',
};

export const MOCK_INVESTMENT_PLAN: InvestmentPlan = {
  monthlyTarget: 1500,
  investedThisMonth: 920,
  salaryContributions: [
    {
      id: 'sc1',
      name: 'Employer Pension',
      amountPerMonth: 380,
      currency: 'EUR',
      bucket: 'LOCKED',
    },
  ],
};
