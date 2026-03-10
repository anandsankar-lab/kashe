# Kāshe — Data Architecture
*Read CLAUDE.md and engineering-rules.md before this file.*
*This file covers the data layer: types, stores, hooks, services.*

---

## THE GOLDEN RULE
UI components never touch data services directly.
The chain is always: **Service → Store → Hook → Component**.
If you're importing a service into a component, you're doing it wrong.

---

## Layer Map

```
/types/          TypeScript interfaces — the contract
/services/       Business logic, API calls, parsing
/store/          Zustand stores — in-memory state
/hooks/          Bridge between stores and UI
/components/     UI only — consumes hooks, never services
```

---

## Types — Written First, Always

Before any component or service is built, the TypeScript
interface exists in `/types/`. This is non-negotiable.

### Spend types (already built — /types/spend.ts)

```typescript
type SpendCategory =
  | 'housing' | 'groceries' | 'eating_out' | 'transport'
  | 'family' | 'health' | 'personal_care' | 'subscriptions'
  | 'utilities' | 'shopping' | 'travel' | 'education'
  | 'insurance' | 'gifts_giving' | 'other'
  | 'income' | 'investment_transfer' | 'transfer'

// Categories excluded from spend totals + savings rate:
const EXCLUDED_FROM_TOTALS: SpendCategory[] = [
  'income', 'investment_transfer', 'transfer'
]

// Mortgage: shown in UI but MUTED, excluded from totals
// Rendered with MacronRule instead of proportion bar
// SpendCategoryRow variant="mortgage"

interface Transaction {
  id: string
  dataSourceId: string
  profileId: string
  householdId: string
  date: Date
  amount: number
  currency: string
  merchant: string
  description: string
  category: SpendCategory
  subcategory?: string
  geography: 'india' | 'europe' | 'other'
  ownership: 'personal' | 'joint' | 'split'
  splitWithProfileId?: string
  splitRatio?: number
  isRecurring: boolean
  recurringGroupId?: string
  rawDescription: string
  isExcluded: boolean
  dataSource: 'CSV' | 'MANUAL'
  merchantNorm: string        // normalised for merchant memory
  currencyOriginal: string
  amountOriginal: number
  fxRateApplied: number | null
  importedAt: Date
  tags: string[]              // default: []
}

interface Budget {
  id: string
  householdId: string
  profileId: string | 'household'   // 'household' = applies to all
  category: SpendCategory
  monthlyAmount: number
  currency: string
}

interface DataSource {
  id: string
  householdId: string
  profileId: string
  institution: string               // "ABN Amro", "HDFC Bank", etc.
  accountType: 'personal' | 'joint' | 'managed'
  accountLabel: string              // user-editable, e.g. "ABN Amro - Anand ····4821"
  lastFourDigits?: string
  currency: string
  lastImported?: Date
  transactionCount: number
}
```

### Asset types (to be built — /types/asset.ts)

```typescript
type AssetType =
  | 'indian_mf' | 'indian_equity' | 'nre_nro' | 'ppf_epf'
  | 'eu_brokerage' | 'employer_stock' | 'crypto'
  | 'alternative' | 'cash'

type PortfolioBucket = 'GROWTH' | 'STABILITY' | 'LOCKED'

// DEFAULT bucket per asset type (can be overridden by user):
// GROWTH:    indian_mf, indian_equity, eu_brokerage,
//            employer_stock, crypto
// STABILITY: nre_nro, cash, debt MFs, money market funds,
//            bond ETFs
// LOCKED:    ppf_epf, alternative (Crowdcube/Seedrs/angel)

interface Asset {
  id: string
  profileId: string
  householdId: string
  owner: 'household' | string   // string = profileId
  type: AssetType
  name: string
  ticker?: string
  isin?: string
  fundCode?: string
  quantity?: number
  units?: number
  purchasePrice?: number
  purchaseDate?: Date
  purchaseCurrency?: string
  currentPrice?: number
  currentCurrency: string
  geography: 'india' | 'europe' | 'us' | 'uk' | 'other'
  bucket: PortfolioBucket        // system default or user override
  bucketOverridden: boolean
  isIlliquid: boolean            // Crowdcube, angel = true
  isEmployerStock: boolean
  vestingDate?: Date             // RSU/ESPP only
  unlockDate?: Date              // PPF, FD, etc.
  isProtectionDesignated: boolean // emergency fund flag
  lastPriceUpdate?: Date
  freshnessStatus: 'fresh' | 'stale' | 'very_stale'
    // fresh: updated today
    // stale: 7–30 days
    // very_stale: >30 days
  dataSource: 'CSV' | 'MANUAL' | 'API'
}
```

### Liability types (to be built — /types/liability.ts)

```typescript
type LiabilityType =
  | 'mortgage' | 'personal_loan' | 'car_loan'
  | 'student_loan' | 'credit_card'

interface Liability {
  id: string
  profileId: string
  type: LiabilityType
  name: string                    // e.g. "ABN Amro Mortgage"
  outstandingBalance: number
  currency: string
  monthlyPayment: number
  interestRate: number
  fixedRateExpiryDate?: Date      // mortgage only
  creditLimit?: number            // credit card only
  apr?: number                    // credit card only
  endDate?: Date                  // loans only
  linkedPropertyId?: string       // mortgage only, optional
  lastUpdatedDate: Date
}
// Credit card: amber staleness warning after 7 days
// Show credit utilisation = balance ÷ limit
```

### FIRE types (to be built — /types/fire.ts)

```typescript
interface FIREInputs {
  currentPortfolioValue: number
  monthlyInvestmentAmount: number
  targetMonthlySpendRetirement: number
  currentAge: number
  expectedAnnualReturnPct: number   // default 7.0
  inflationRatePct: number          // from fireDefaults by country
  mortgageEndDate?: Date
  monthlyMortgagePayment?: number
}

interface FIREOutputs {
  fireNumber: number                // targetSpend × 300
  yearsToFIRE: number
  projectedFIREYear: number
  requiredMonthlySavings: number
  safeWithdrawalAmount: number      // 4% of projectedPortfolio
  currentTrajectoryYear?: number    // at current PMT if data exists
  portfolioAtFIRE: number
  assumptions: FIREAssumptions
}

interface FIREAssumptions {
  safeWithdrawalRatePct: 4          // locked, not editable
  expectedReturnPct: number
  inflationRatePct: number
  inflationCountry: string
  primaryResidenceExcluded: true
  unvestedStockExcluded: true
  illiquidAlternativesExcluded: true
}
```

### Insight types (to be built — /types/insight.ts)

```typescript
type InsightType =
  | 'MARKET_EVENT_ALERT'
  | 'PORTFOLIO_HEALTH'
  | 'FIRE_TRAJECTORY'
  | 'INVESTMENT_OPPORTUNITY'
  | 'MONTHLY_REVIEW'

// Priority order (highest first):
// MARKET_EVENT_ALERT > PORTFOLIO_HEALTH >
// FIRE_TRAJECTORY > INVESTMENT_OPPORTUNITY

interface Insight {
  id: string
  type: InsightType
  headline: string           // max 10 words
  body: string               // max 40 words
  generatedAt: Date
  expiresAt: Date
  dismissed: boolean
  dismissedAt?: Date

  // MARKET_EVENT only:
  source?: string            // "Reuters"
  sourceUrl?: string
  sentiment?: 'bullish' | 'bearish' | 'mixed' | 'neutral'
  confidence?: 'high' | 'medium' | 'low'
  forumSignal?: {
    summary: string          // max 15 words
    platforms: string[]
  }

  // Optional deep link:
  action?: {
    label: string
    type: 'VIEW_HOLDING' | 'VIEW_SUGGESTIONS' | 'VIEW_FIRE'
    payload?: string
  }
}

interface MonthlyReview {
  monthYear: string          // "2026-03"
  generatedAt: Date
  viewed: boolean
  whereYouStand: string
  howMoneyIsWorking: {
    growth: string
    stability: string
    locked: string
    protection: string
  }
  thisMonthsPriority: {
    headline: string
    reasoning: string
    bucketTarget: 'GROWTH' | 'STABILITY' | 'LOCKED' | null
  }
  fireUpdate: {
    headline: string
    detail: string
  } | null
  nextMonthWatchlist: string[]  // 2–3 items
}
```

---

## Stores — What Each One Owns

### spendStore (Zustand)

```typescript
interface SpendStore {
  transactions: Transaction[]
  budgets: Budget[]
  dataSources: DataSource[]
  merchantOverrides: MerchantOverride[]

  // Actions:
  addTransactions: (txns: Transaction[]) => void
  setBudget: (budget: Budget) => void
  recategorise: (txnId: string, category: SpendCategory) => void
  // recategorise also saves MerchantOverride and re-runs
  // on ALL past transactions from same merchantNorm
}
```

### portfolioStore (Zustand)

```typescript
interface PortfolioStore {
  assets: Asset[]
  liabilities: Liability[]
  bucketOverrides: BucketOverride[]
  protectionDesignation: string | null  // assetId of protection holding

  // Actions:
  addAsset: (asset: Asset) => void
  updateAssetPrice: (assetId: string, price: number) => void
  setBucketOverride: (override: BucketOverride) => void
  setProtection: (assetId: string) => void
}
```

### insightsStore (Zustand)

```typescript
interface InsightsStore {
  activeInsight: Insight | null
  monthlyReviews: MonthlyReview[]   // last 12 months
  aiUsage: AIUsageRecord

  // Actions:
  setActiveInsight: (insight: Insight | null) => void
  dismissInsight: (insightId: string) => void
  setMonthlyReview: (review: MonthlyReview) => void
  logAPIUsage: (tokens: { input: number, output: number }) => void
}
```

### householdStore (Zustand)

```typescript
interface HouseholdStore {
  household: Household | null
  profiles: Profile[]
  activeProfileId: string | 'household'   // 'household' = all
  isAuthenticated: boolean

  // Actions:
  setHousehold: (household: Household) => void
  addProfile: (profile: Profile) => void
  setActiveProfile: (profileId: string | 'household') => void
}
```

---

## Hooks — The UI Boundary

Every hook has one job: translate store data into
something a component can consume without knowing
where it came from.

### useSpend()

```typescript
// Returns:
{
  transactions: Transaction[]     // filtered to active profile
  budgets: Budget[]
  spendByCategory: Record<SpendCategory, number>
  totalSpend: number              // excludes investment_transfer + transfer
  comparisonVsLastMonth: number   // percentage
  comparisonVs3MonthAvg: number   // percentage
  hasMinimumHistory: boolean      // true if ≥2 months data
  selectedMonth: Date
  setSelectedMonth: (date: Date) => void
}
```

### usePortfolio()

```typescript
// Returns:
{
  assets: Asset[]
  liabilities: Liability[]
  liveTotal: number               // assets with live prices
  lockedTotal: number             // illiquid + locked assets
  financialPosition: number       // liveTotal + lockedTotal - liabilities
  allocationByBucket: Record<PortfolioBucket, number>  // percentages
  allocationByGeography: Record<string, number>         // percentages
  allocationByVehicle: Record<string, number>           // percentages
  protectionAsset: Asset | null
  protectionMonthsCovered: number
  savingsRate: number             // this month
}
```

### useInsights()

```typescript
// Returns:
{
  activeInsight: Insight | null
  currentMonthReview: MonthlyReview | null
  pastReviews: MonthlyReview[]    // last 12, excl. current month
  reviewState: 'unavailable' | 'insufficient' | 'ready_unread' | 'ready_read'
  isOverBudget: boolean           // for notification dot
  dismissInsight: () => void
}
```

### useFirePlanner()

```typescript
// Returns:
{
  inputs: FIREInputs
  outputs: FIREOutputs | null     // null if inputs incomplete
  updateInputs: (partial: Partial<FIREInputs>) => void
  recalculate: () => void
  isSetUp: boolean                // true if user has entered at least one input
}
```

### useHousehold()

```typescript
// Returns:
{
  household: Household | null
  profiles: Profile[]
  activeProfile: Profile | 'household'
  currentProfile: Profile | null  // null when household view
  setActiveProfile: (id: string | 'household') => void
  isAuthenticated: boolean
}
```

---

## DataSource — First-Class Entity

Every CSV upload creates or updates a DataSource record.
The DataSource represents a bank account, not a file.

```
On CSV upload:
1. Parse CSV header to detect institution + account holder
2. Show confirmation screen:
   "Is this right?"
   Institution: ABN Amro
   Account holder: Anand Sankar
   Suggested label: "ABN Amro - Anand ····4821"  ← editable
   [Confirm]  [Edit]
3. Raw account holder name NEVER stored
4. User-edited label is what gets stored
5. Future imports from same institution + last4: auto-matched
```

---

## CSV Upload Flow

```
User taps [+ Upload bank statement]
  → DocumentPicker opens
  → User selects CSV
  → universalParser.ts detects format
    → >85% confidence: auto-map silently
    → 60-85%: show mapping confirmation screen
    → <60%: ask user to map columns manually
  → securityPipeline.ts sanitises transactions
    → Account numbers → last 4 digits only
    → IBANs → masked (****1234)
    → BSN/PAN/Aadhaar → removed entirely
  → DataSource confirmation screen (always shown)
  → spendStore.addTransactions()
  → spendCategoriser.ts runs on all new transactions
  → merchantOverrides applied on top of keyword matching
  → Post-upload toast:
      "✓ X transactions imported"
      "✓ Account numbers masked"
      "✓ Raw file discarded"
      "✓ Data encrypted on your device"
  → Relevant insight caches invalidated
```

---

## Mock Data Rules

All mock data lives in `/constants/mockData.ts`.
Components import from there — never hardcode inline.

```typescript
// Mock data must:
// 1. Use neutral, non-country-specific merchant names
//    WRONG: "Albert Heijn", "Jumbo", "Thuisbezorgd"
//    RIGHT: "Supermarket", "Food Delivery App"
// 2. Match production TypeScript types exactly
// 3. Be realistic — plausible numbers, not placeholder zeros
// 4. Be stable — same data every time, no Math.random()
// 5. Cover all component states (with data, partial, etc.)
```

---

## What Never Goes in a Component

```
✗ import { csvDataSource } from '../services/csvDataSource'
✗ const transactions = await csvDataSource.parse(file)
✗ const color = '#C8F04A'
✗ const { colorScheme } = useColorScheme()
✗ fetch('https://api.anthropic.com/...')
✗ await EncryptedStorage.setItem(...)
```

All of these belong in services, stores, or hooks.
The component receives the result — it never does the work.
