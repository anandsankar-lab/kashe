# Kāshe — Data Architecture
*Read CLAUDE.md and engineering-rules.md before this file.*
*This file covers the data layer: types, stores, hooks, services.*
*Last updated: 19 March 2026 — Session 12 complete.
Store interfaces updated with derived cache fields and auditStore.
CSV upload flow updated to reflect smart detector architecture.
Caching strategy section added. Joint account handling added.*

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

### Spend types (built — /types/spend.ts)

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

interface SpendTransaction {
  id: string
  dataSourceId: string
  profileId: string
  householdId: string
  date: Date
  amount: number              // negative = debit, positive = credit
  currency: string            // base currency (converted)
  currencyOriginal: string    // original currency before conversion
  amountOriginal: number      // original amount before conversion
  fxRateApplied: number | null // null if same currency
  merchant: string
  description: string
  rawDescription: string      // sanitised original
  category: SpendCategory
  subcategory?: string
  geography: 'india' | 'europe' | 'other'
  ownership: 'personal' | 'joint' | 'split'
  splitWithProfileId?: string
  splitRatio?: number
  isRecurring: boolean
  recurringGroupId?: string
  isExcluded: boolean
  dataSource: 'CSV' | 'MANUAL'
  merchantNorm: string        // normalised for merchant memory
  importedAt: Date
  tags: string[]              // default: []
}

// NOTE: types/spend.ts exports this as SpendTransaction.
// csvParser.ts imports it as: import type { SpendTransaction as Transaction }
// This alias will be aligned in Session 16 cleanup.

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
  accountLabel: string              // user-editable, e.g. "ABN Amro ····4821"
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
  name: string
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

### FIRE types (built — /types/fire.ts) [V2]

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

### Insight types (built — /store/insightsStore.ts)

```typescript
type InsightType =
  | 'MARKET_EVENT_ALERT'
  | 'PORTFOLIO_HEALTH'
  | 'FIRE_TRAJECTORY'       // V2 — skip in V1
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
  generatedAt: string        // ISO string
  expiresAt: string          // ISO string
  dismissed: boolean
  dismissedAt: string | null
  source?: string
  sourceUrl?: string
  sentiment?: 'bullish' | 'bearish' | 'mixed' | 'neutral'
  confidence?: 'high' | 'medium' | 'low'
  action?: {
    label: string
    type: 'VIEW_HOLDING' | 'VIEW_SUGGESTIONS' | 'VIEW_FIRE'
    payload?: string
  }
}

interface MonthlyReview {
  monthYear: string          // "YYYY-MM"
  generatedAt: string        // ISO string
  viewed: boolean
  whereYouStand: string
  howMoneyIsWorking: {
    growth: string | null
    stability: string | null
    locked: string | null
    protection: string | null
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

interface AIUsageRecord {
  inputTokensThisMonth: number
  outputTokensThisMonth: number
  callCount: number
  monthYear: string           // "YYYY-MM"
  tier: 'free' | 'paid'
  lastUpdated: string         // ISO string
}
```

### Audit types (built — /store/auditStore.ts)

```typescript
interface ImportAuditEvent {
  id: string
  profileId: string
  householdId: string
  timestamp: string               // ISO string
  institution: SupportedInstitution
  transactionCount: number
  duplicatesSkipped: number
  probableDuplicatesFound: number
  layer2Queued: number            // transactions with confidence 0.0
  parseConfidence: number         // ParseConfidence.overallScore
  status: 'success' | 'failed'
  errorCode?: string
}
```

---

## Stores — What Each One Owns

### spendStore (Zustand + secureStorageAdapter)

```typescript
interface SpendStore {
  // Raw data
  transactions: SpendTransaction[]
  budgets: Budget[]
  dataSources: DataSource[]
  merchantOverrides: MerchantOverride[]
  retryQueue: PendingCategorization[]   // Layer 2 queue

  // Derived cache (Option A — cached in store, not recalculated every render)
  derivedSpend: {
    spendByCategory: Record<SpendCategory, number>
    totalSpend: number
    comparisonVsLastMonth: number       // percentage
    comparisonVs3MonthAvg: number       // percentage
    selectedMonth: string               // 'YYYY-MM' format
    lastCalculatedAt: string | null     // null = never calculated
  }

  // Actions:
  addTransactions: (txns: SpendTransaction[], geography: string) => void
  // Runs Layer 1 categorisation synchronously on all incoming transactions
  // Layer 2 misses → retryQueue
  // Sets derivedSpend.lastCalculatedAt to null (forces recalculation)

  setBudget: (budget: Budget) => void

  recategorise: (txnId: string, category: SpendCategory) => void
  // Updates category on transaction
  // Calls applyUserCorrection() → updates merchantOverrides
  // Re-runs categorise() on ALL transactions with same merchantNorm
  // Sets derivedSpend.lastCalculatedAt to null

  setSelectedMonth: (month: string) => void
  // Sets selectedMonth in derivedSpend
  // Sets lastCalculatedAt to null (month switch = cache miss)

  updateDerivedSpend: (derived: {...}) => void
  // Called by useSpend() after recalculation
  // Sets lastCalculatedAt to new Date().toISOString()

  addDataSource: (source: DataSource) => void
  updateRetryQueue: (queue: PendingCategorization[]) => void
}
```

### portfolioStore (Zustand + secureStorageAdapter)

```typescript
interface PortfolioStore {
  // Raw data
  holdings: PortfolioHolding[]    // uses existing portfolio types
  bucketOverrides: BucketOverride[]
  protectionHoldingId: string | null

  // Derived cache
  derived: {
    liveTotal: number
    lockedTotal: number
    financialPosition: number       // liveTotal + lockedTotal - liabilities
    allocationByBucket: Record<string, number>    // percentages
    allocationByGeography: Record<string, number> // percentages
    protectionAsset: PortfolioHolding | null
    protectionMonthsCovered: number
    lastCalculatedAt: string | null
  }

  // Actions:
  addHolding: (holding: PortfolioHolding) => void
  // Sets derived.lastCalculatedAt to null

  updateHolding: (holdingId: string, updates: Partial<PortfolioHolding>) => void
  // Immutable merge, sets derived.lastCalculatedAt to null

  setBucketOverride: (override: BucketOverride) => void
  // Sets derived.lastCalculatedAt to null
  // Also invalidates PORTFOLIO_HEALTH insight (insightsStore)

  setProtection: (holdingId: string) => void
  // Sets derived.lastCalculatedAt to null

  updateDerived: (derived: PortfolioDerived) => void
  // Called by usePortfolio() after recalculation
}

interface BucketOverride {
  holdingId: string
  overrideBucket: 'GROWTH' | 'STABILITY' | 'LOCKED'
  systemBucket: 'GROWTH' | 'STABILITY' | 'LOCKED'
  overriddenAt: string    // ISO string
  profileId: string
}
```

### insightsStore (Zustand + secureStorageAdapter)

```typescript
interface InsightsStore {
  activeInsight: Insight | null
  monthlyReviews: MonthlyReview[]   // last 12 months
  aiUsage: AIUsageRecord
  lastInsightCheck: string | null   // ISO string — throttle API calls

  // Actions:
  setActiveInsight: (insight: Insight | null) => void
  dismissInsight: (insightId: string) => void
  setMonthlyReview: (review: MonthlyReview) => void
  markReviewViewed: (monthYear: string) => void
  logAPIUsage: (tokens: { input: number, output: number }) => void
  // Handles monthly rollover automatically
  setLastInsightCheck: (timestamp: string) => void
}
```

### householdStore (Zustand + secureStorageAdapter)

```typescript
interface HouseholdStore {
  household: Household | null
  profiles: Profile[]
  activeProfileId: string | 'household'   // 'household' = all
  isAuthenticated: boolean
  riskProfile: 'conservative' | 'balanced' | 'growth'
  onboardingComplete: boolean

  // Actions:
  setHousehold: (household: Household) => void
  addProfile: (profile: Profile) => void
  setActiveProfile: (profileId: string | 'household') => void
  setAuthenticated: (value: boolean) => void
  setRiskProfile: (profile: RiskProfileType) => void
  setOnboardingComplete: (value: boolean) => void
}

// Default riskProfile: 'balanced'
// RECOMMEND Balanced — never silently assume. Locked.
```

### auditStore (Zustand + secureStorageAdapter)

```typescript
interface AuditStore {
  events: ImportAuditEvent[]    // last 100 events, FIFO eviction

  // Actions:
  logImport: (event: ImportAuditEvent) => void
  // Appends event, evicts oldest if > 100

  clearAuditLog: () => void
  // ONLY called from "delete all data" flow (Session 16)
  // Never called anywhere else
}
```

---

## Caching Strategy — LOCKED (19 March 2026)

### The pattern

```
All expensive derived values are cached IN their store.
Hooks check lastCalculatedAt on mount.
If null or >24h old: recalculate from raw data, update store.
If fresh: return cached values directly.

This is Option A — derived cache in stores.
Never Option B (recalculate in hook every render).
```

### Per-screen cache locations

```
Home screen
  Source: portfolioStore.derived
  Staleness: 24 hours
  Event invalidation: addHolding, updateHolding, setBucketOverride
                      new CSV upload

Spend screen
  Source: spendStore.derivedSpend
  Staleness: 24 hours (time-based)
  Event invalidation (immediate):
    addTransactions(), recategorise(), setSelectedMonth()
  Month caching: ONE MONTH AT A TIME
    Month switch = lastCalculatedAt set to null = recalculate immediately

Portfolio screen
  Source: portfolioStore.derived
  Staleness: 24 hours
  Event invalidation: all portfolioStore mutations

Insights
  Source: insightsStore (per insight type)
  MARKET_EVENT_ALERT: expiresAt 24h after generatedAt
  PORTFOLIO_HEALTH: invalidated on holdings change
  INVESTMENT_OPPORTUNITY: invalidated on investment_transfer change
  MONTHLY_REVIEW: invalidated midnight on 1st of next month
  One Claude call per app open maximum
  Minimum 1 hour between calls for same insight type
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
  transactions: SpendTransaction[]  // filtered to active profile + selectedMonth
  budgets: Budget[]
  spendByCategory: Record<SpendCategory, number>
  totalSpend: number                // excludes investment_transfer + transfer
  comparisonVsLastMonth: number     // percentage
  comparisonVs3MonthAvg: number     // percentage
  hasMinimumHistory: boolean        // true if ≥2 months data
  selectedMonth: string             // 'YYYY-MM'
  setSelectedMonth: (month: string) => void
}

// On mount: check derivedSpend.lastCalculatedAt
// If null or >24h: recalculate + call updateDerivedSpend()
// If fresh: return cached values
```

### usePortfolio()

```typescript
// Returns:
{
  holdings: PortfolioHolding[]
  liveTotal: number               // non-illiquid holdings
  lockedTotal: number             // illiquid + LOCKED bucket
  financialPosition: number       // liveTotal + lockedTotal - liabilities
  allocationByBucket: Record<string, number>  // percentages
  allocationByGeography: Record<string, number>
  protectionAsset: PortfolioHolding | null
  protectionMonthsCovered: number
  savingsRate: number             // this month (from spendStore)
}

// On mount: check derived.lastCalculatedAt
// Apply bucketOverrides when computing allocationByBucket
// protectionMonthsCovered = protectionAsset.currentValue / avgMonthlySpend
```

### useInsights()

```typescript
// Returns:
{
  activeInsight: Insight | null
  currentMonthReview: MonthlyReview | null
  pastReviews: MonthlyReview[]    // last 12, excl. current month
  reviewState: 'unavailable' | 'insufficient' | 'ready_unread' | 'ready_read'
  isOverBudget: boolean           // any category >90% of budget
  dismissInsight: () => void
}

// reviewState logic:
// 'unavailable'  → no transactions at all
// 'insufficient' → <3 months data
// 'ready_unread' → review exists, viewed: false
// 'ready_read'   → review exists, viewed: true
```

### useFirePlanner() [V2]

```typescript
// Returns:
{
  inputs: FIREInputs
  outputs: FIREOutputs | null     // null if inputs incomplete
  updateInputs: (partial: Partial<FIREInputs>) => void
  recalculate: () => void
  isSetUp: boolean
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
  riskProfile: RiskProfileType
}
```

### useInstrumentCatalogue()

```typescript
// Returns:
{
  getSuggestions: (
    bucket: string,
    riskProfile: RiskProfileType,
    geography: string
  ) => InstrumentCatalogueEntry[]

  getEntry: (id: string) => InstrumentCatalogueEntry | null
}

// V1: reads from /constants/instrumentCatalogue.ts directly
// V2: replace with Supabase call — zero component changes
// This boundary is exactly why the hook exists
//
// Safety: getSuggestions always filters out track_only
// even if called with incorrect parameters
```

---

## DataSource — First-Class Entity

Every CSV upload creates or updates a DataSource record.
The DataSource represents a bank account, not a file.

```
On CSV upload:
1. parseCSV() runs — smart field detector identifies institution
2. DataSourceConfirmSheet always shown:
   Institution: detected name (e.g. "ABN Amro")
   Account label: auto-generated (e.g. "ABN Amro ····4821") ← editable
   "Is this a joint account?" toggle ← ALWAYS asked
3. User confirms → DataSource created with accountType
4. Raw account holder name NEVER stored (security pipeline strips it)
5. User-edited label is what gets stored in accountLabel
6. Future imports from same institution + last4: auto-matched to existing DataSource

Joint accounts:
  accountType: 'joint'
  All transactions from this DataSource: ownership: 'joint'
  Enables household vs individual view logic
```

---

## CSV Upload Flow — LOCKED (19 March 2026)

```
User taps [+] → CSVUploadSheet opens
  → User selects "Upload bank statement"
  → expo-document-picker opens (CSV only)
  → User selects file
  → CSV content read into MEMORY ONLY — never written to disk
  → parseCSV(content, dataSourceId, profileId, householdId, existing)
      → Papa Parse reads raw CSV
      → Smart field detector scores columns
      → detectColumnMapping() returns ParseConfidence
      → If tier1Complete = false: ParseError TIER1_FIELDS_MISSING
      → parseRow() for each row using ColumnMapping
      → sanitiseTransaction() inside each parseRow() call
          (account numbers masked, IBANs masked, BSN/PAN/Aadhaar stripped)
      → deduplicateTransactions() — hybrid key hierarchy
          Priority 1: referenceId (where present)
          Priority 2: compound key
          Priority 3: fuzzy Dice (Indian banks) → probableDuplicates[]
      → Atomic: any failure → ParseError ATOMIC_ROLLBACK
      → On success: ParseSuccess { transactions, duplicatesSkipped,
                                   probableDuplicates, confidence, auditData }
  → If probableDuplicates.length > 0: ProbableDuplicateSheet
      User confirms each pair: skip or import
  → DataSourceConfirmSheet shown (always)
      Editable label, joint account toggle
  → User confirms
  → spendStore.addTransactions()
      Layer 1 categorisation runs synchronously on all transactions
      Layer 2 misses → retryQueue (capped at 20 per upload)
      derivedSpend.lastCalculatedAt → null
  → auditStore.logImport(auditData)
  → Post-upload toast (always shown, never suppressed):
      "✓ X transactions imported"
      "✓ Account numbers masked"
      "✓ Raw file discarded"
      "✓ Data stored securely on your device"
  → Raw CSV content discarded from memory
  → Spend screen updates reactively (Zustand)
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
// 6. Use SpendTransaction type (not Transaction alias)
```

---

## What Never Goes in a Component

```
✗ import spendCategoriser from '../services/spendCategoriser'
✗ import { parseCSV } from '../services/csvParser'
✗ import useSpendStore from '../store/spendStore'
✗ const color = '#C8F04A'
✗ const { colorScheme } = useColorScheme()
✗ fetch('https://api.anthropic.com/...')
✗ await SecureStore.setItemAsync(...)
✗ spendByCategory = transactions.reduce(...)  // inline calculation
```

All of these belong in services, stores, or hooks.
The component receives the result — it never does the work.
