# Kāshe — Data Architecture
*Read CLAUDE.md and engineering-rules.md before this file.*
*This file covers the data layer: types, stores, hooks, services.*
*Last updated: 25 March 2026 — Session 13 complete.*
*Ingestion pipeline restructured: /services/ingestion/ (10 files).*
*csvParser.ts is now a re-export shim.*
*portfolioStore: addHoldings, addPendingHoldings, resolveHolding added.*
*ImportAuditEvent: holdingCount, pendingCategorizationCount, tier1Route added.*
*Upload flow updated: ingestFile(), four-tier taxonomy, XLSX/TXT support.*

---

## THE GOLDEN RULE
UI components never touch data services directly.
The chain is always: **Service → Store → Hook → Component**.
If you're importing a service into a component, you're doing it wrong.
EXCEPTION: CSVUploadSheet imports ingestFile() from /services/ingestion.
This is the one permitted direct service import — it IS the boundary layer.

---

## Layer Map

```
/types/                TypeScript interfaces — the contract
/services/             Business logic, API calls, parsing
/services/ingestion/   Ingestion pipeline — 10 files, single entry point
/store/                Zustand stores — in-memory state
/hooks/                Bridge between stores and UI
/components/           UI only — consumes hooks, never services
```

---

## Types — Written First, Always

Before any component or service is built, the TypeScript
interface exists in `/types/`. This is non-negotiable.

Build order:
1. Define the interface in `/types/`
2. Add mock data to `/constants/mockData.ts` that satisfies the interface
3. Build the component that renders it

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
  fxRateApplied: number | null
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
  tags: string[]
}

interface Budget {
  id: string
  householdId: string
  profileId: string | 'household'
  category: SpendCategory
  monthlyAmount: number
  currency: string
}

interface DataSource {
  id: string
  householdId: string
  profileId: string
  institution: string
  accountType: 'personal' | 'joint' | 'managed'
  accountLabel: string        // user-editable
  lastFourDigits?: string
  currency: string
  lastImported?: Date
  transactionCount: number
  type: 'SPEND' | 'PORTFOLIO' | 'SALARY'  // routes to correct store
}
```

### Portfolio types (built — /types/portfolio.ts)

```typescript
interface PortfolioHolding {
  id: string
  profileId: string
  householdId: string
  name: string
  ticker?: string
  isin?: string               // e.g. 'IE00B3RBWM25'
  assetClass: AssetClass      // display/grouping hint
  assetSubtype: AssetSubtype  // drives all logic — never use assetClass for logic
  geography: string
  currency: string
  currentValue: number
  quantity?: number
  purchasePrice?: number
  purchaseDate?: Date
  vestingDate?: Date          // RSU/ESPP only
  unlockDate?: Date           // PPF, FD etc.
  bucket: 'GROWTH' | 'STABILITY' | 'LOCKED'
  bucketOverridden: boolean
  isProtectionDesignated: boolean
  freshnessStatus: 'fresh' | 'stale' | 'very_stale'
  dataSource: 'CSV' | 'MANUAL' | 'API'
  lastPriceUpdate?: Date
}
```

### Ingestion types (built — /services/ingestion/types.ts)

```typescript
// The four-tier import taxonomy
type Tier1Route = 'spend' | 'portfolio'

type Tier2AccountType =
  // Spend
  | 'savings_account' | 'current_account'
  | 'credit_card' | 'joint_account'
  // Portfolio
  | 'brokerage' | 'mutual_fund_folio'
  | 'retirement' | 'fixed_deposit_account' | 'other_investment'

type RouteConfidence = 'high' | 'medium' | 'low' | 'unknown'

type FileType = 'csv' | 'txt' | 'xlsx'

type RawRow = Record<string, string>

interface RouteDetectionResult {
  tier1Route: Tier1Route
  tier2Suggestion: Tier2AccountType | null  // null when confidence = unknown
  confidence: RouteConfidence
  detectedInstitution: SupportedInstitution
  signals: string[]  // human-readable detection signals
}

interface IngestionInput {
  content: string           // raw file content or base64 for xlsx
  fileType: FileType
  filename: string
  dataSourceId: string
  profileId: string
  householdId: string
  existingTransactions: SpendTransaction[]
}

interface ParseSuccess {
  transactions: SpendTransaction[]
  holdings: PortfolioHolding[]
  pendingHoldings: PortfolioHolding[]   // unknown assetSubtype
  duplicatesSkipped: number
  probableDuplicates: ProbableDuplicate[]
  confidence: ParseConfidence
  routeDetection: RouteDetectionResult
  fileType: FileType
  auditData: ImportAuditData
}

interface ImportAuditData {
  institution: SupportedInstitution
  transactionCount: number
  holdingCount: number                    // portfolio path
  pendingCategorizationCount: number      // portfolio path
  duplicatesSkipped: number
  probableDuplicatesFound: number
  layer2Queued: number
  parseConfidence: number
  tier1Route: Tier1Route
  tier2AccountType: Tier2AccountType | null
  status: 'success' | 'failed'
  errorCode?: string
}
```

### UserFinancialProfile (built — /types/userProfile.ts)

```typescript
// The intelligence spine. Everything reads from this.
// Built by userProfileService.ts. Stored in householdStore.

interface UserFinancialProfile {
  portfolioTier: 1 | 2 | 3 | 4
  portfolioTierLabel: 'starter' | 'growing' | 'established' | 'significant'
  previousPortfolioTier: 1 | 2 | 3 | 4 | null
  tierChangedAt: string | null
  tierChangeDirection: 'up' | 'down' | null
  sophisticationScore: number
  sophisticationBand: 'foundation' | 'building' | 'established' | 'sophisticated'
  investmentStyle: 'passive' | 'active' | 'mixed' | 'unknown'
  isNriProfile: boolean
  financialVehicles: string[]
  growthPct: number
  stabilityPct: number
  lockedPct: number
  cashLikeVehiclePct: number
  illiquidSpeculativePct: number
  employerStockPct: number
  largestHoldingPct: number
  protectionMonthsCovered: number
  hasVestingEventSoon: boolean
  geographyExposure: Record<string, number>
  currencyExposure: Record<string, number>
  savingsRateBand: 'low' | 'medium' | 'high' | 'unknown'
  investingFrequency: 'rarely' | 'monthly' | 'frequent' | 'unknown'
  dataMonthsSpend: number
  dataMonthsPortfolio: number
  institutionsConnected: number
  hasSpendSource: boolean
  hasPortfolioSource: boolean
  hasIndianSource: boolean
  hasEuropeanSource: boolean
  hasInvestmentPlatform: boolean
  hasSalarySlip: boolean
  importFreshness: 'fresh' | 'stale' | 'very_stale' | 'never'
  lastSpendImportDate: string | null
  lastPortfolioImportDate: string | null
  importCountLifetime: number
  onboardingComplete: boolean
  riskProfileActivelySet: boolean
  protectionDesignated: boolean
  aiInsightsEnabled: boolean
  monthlyReviewCount: number
  budgetsConfigured: boolean
  monthlyTargetSet: boolean
  fireIsSetUp: boolean
  householdType: 'individual' | 'couple' | 'family' | 'multi_managed'
  managedProfileCount: number
  hasMortgage: boolean
  skippedAgeScreen: boolean
  firstSeenDate: string
  firstUploadDate: string | null
  lastCalculatedAt: string | null
}
```

---

## Stores — What Each One Owns

### spendStore (Zustand + secureStorageAdapter)

```typescript
interface SpendStore {
  transactions: SpendTransaction[]
  budgets: Budget[]
  dataSources: DataSource[]
  merchantOverrides: MerchantOverride[]
  retryQueue: PendingCategorization[]   // Layer 2 queue

  derivedSpend: {
    spendByCategory: Record<SpendCategory, number>
    totalSpend: number
    comparisonVsLastMonth: number
    comparisonVs3MonthAvg: number
    selectedMonth: string               // 'YYYY-MM'
    lastCalculatedAt: string | null
  }

  addTransactions: (txns: SpendTransaction[], geography: string) => void
  // Runs Layer 1 synchronously. Layer 2 misses → retryQueue.
  // Sets derivedSpend.lastCalculatedAt to null.
  // ALSO TRIGGERS: userProfileService update chain

  setBudget: (budget: Budget) => void
  recategorise: (txnId: string, category: SpendCategory) => void
  setSelectedMonth: (month: string) => void
  updateDerivedSpend: (derived: {...}) => void
  addDataSource: (source: DataSource) => void
  updateRetryQueue: (queue: PendingCategorization[]) => void
}
```

### portfolioStore (Zustand + secureStorageAdapter)

```typescript
interface PortfolioStore {
  holdings: PortfolioHolding[]
  bucketOverrides: BucketOverride[]
  protectionHoldingId: string | null
  pendingCategorizationQueue: PortfolioHolding[]  // added Session 13

  derived: {
    liveTotal: number
    lockedTotal: number
    financialPosition: number
    allocationByBucket: Record<string, number>
    allocationByGeography: Record<string, number>
    protectionAsset: PortfolioHolding | null
    protectionMonthsCovered: number
    lastCalculatedAt: string | null
  }

  addHolding: (holding: PortfolioHolding) => void
  // ALSO TRIGGERS: userProfileService update chain

  addHoldings: (holdings: PortfolioHolding[]) => void   // added Session 13
  // Batch add. Dedup by id. Sets derived.lastCalculatedAt = null.
  // ALSO TRIGGERS: userProfileService update chain

  addPendingHoldings: (holdings: PortfolioHolding[]) => void  // added Session 13
  // Appends to pendingCategorizationQueue. FIFO cap: 50.

  resolveHolding: (id: string, assetSubtype: AssetSubtype) => void  // added Session 13
  // Sets assetSubtype + bucket from DEFAULT_BUCKET.
  // Moves from pendingCategorizationQueue → holdings.
  // Sets derived.lastCalculatedAt = null.

  updateHolding: (holdingId: string, updates: Partial<PortfolioHolding>) => void
  // ALSO TRIGGERS: userProfileService update chain

  setBucketOverride: (override: BucketOverride) => void
  // ALSO TRIGGERS: userProfileService update chain
  // ALSO invalidates PORTFOLIO_HEALTH insight

  setProtection: (holdingId: string) => void
  // ALSO TRIGGERS: userProfileService update chain

  updateDerived: (derived: PortfolioDerived) => void
}

interface BucketOverride {
  holdingId: string
  overrideBucket: 'GROWTH' | 'STABILITY' | 'LOCKED'
  systemBucket: 'GROWTH' | 'STABILITY' | 'LOCKED'
  overriddenAt: string
  profileId: string
}
```

### insightsStore (Zustand + secureStorageAdapter)

```typescript
interface InsightsStore {
  activeInsight: Insight | null
  monthlyReviews: MonthlyReview[]
  aiUsage: AIUsageRecord
  lastInsightCheck: string | null
  discoveredSources: DiscoveredSource[]
  lastGenerationWindows: Record<string, string>

  setActiveInsight: (insight: Insight | null) => void
  dismissInsight: (insightId: string) => void
  setMonthlyReview: (review: MonthlyReview) => void
  markReviewViewed: (monthYear: string) => void
  logAPIUsage: (tokens: { input: number, output: number }) => void
  setLastInsightCheck: (timestamp: string) => void
  addDiscoveredSource: (source: DiscoveredSource) => void
  setLastGenerationWindow: (key: string, timestamp: string) => void
}
```

### householdStore (Zustand + secureStorageAdapter)

```typescript
interface HouseholdStore {
  household: Household | null
  profiles: Profile[]
  activeProfileId: string | 'household'
  isAuthenticated: boolean
  riskProfile: 'conservative' | 'balanced' | 'growth'
  onboardingComplete: boolean
  financialProfile: UserFinancialProfile | null  // added DL-09

  setHousehold: (household: Household) => void
  addProfile: (profile: Profile) => void
  setActiveProfile: (profileId: string | 'household') => void
  setAuthenticated: (value: boolean) => void
  setRiskProfile: (profile: RiskProfileType) => void
  setOnboardingComplete: (value: boolean) => void
  updateFinancialProfile: (profile: UserFinancialProfile) => void
}
```

### auditStore (Zustand + secureStorageAdapter)

```typescript
interface AuditStore {
  events: ImportAuditEvent[]    // last 100 events, FIFO eviction

  logImport: (event: ImportAuditEvent) => void
  clearAuditLog: () => void
  // clearAuditLog ONLY called from "delete all data" flow (Session 16)
}
```

---

## UserFinancialProfile — The Intelligence Spine

### What it feeds

```
getActiveSeedSources(profile)             → which sources to search
evaluateAllTriggers(profile, fxParams)    → which health checks fire
buildHoldingsContext(profile, holdings)   → what Claude receives
analyticsService.updateUserProperties()  → all PostHog properties
aiInsightService                          → search depth, framing, discovery pass
```

### updateUserProfile() triggers

Called automatically after:
- `spendStore.addTransactions()`
- `portfolioStore.addHolding()` / `addHoldings()`
- `portfolioStore.updateHolding()`
- `portfolioStore.setBucketOverride()`
- `portfolioStore.setProtection()`
- `householdStore.setRiskProfile()` (if changed from default)
- `householdStore.setOnboardingComplete()`
- Monthly target set
- FIRE inputs set

### Sophistication score

0–100. Five components. NEVER shown to user.
Drives: insight depth, PORTFOLIO_HEALTH framing, prompt conservatism.

### Portfolio tier hysteresis

Tier up: immediately when value crosses floor.
Tier down: only when 20% BELOW floor (prevents oscillation).
Floors: Tier 1 <€25k, Tier 2 €25k–€100k, Tier 3 €100k–€500k, Tier 4 >€500k.

---

## Caching Strategy — LOCKED (19 March 2026)

```
All expensive derived values cached IN their store.
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
  Invalidation: addHolding, addHoldings, updateHolding, setBucketOverride, new upload

Spend screen
  Source: spendStore.derivedSpend
  Staleness: 24 hours (time-based)
  Invalidation: addTransactions(), recategorise(), setSelectedMonth()
  Month caching: ONE MONTH AT A TIME

Portfolio screen
  Source: portfolioStore.derived
  Staleness: 24 hours
  Invalidation: all portfolioStore mutations

Insights
  Source: insightsStore (per insight type)
  MARKET_EVENT_ALERT: 24h from generatedAt
  PORTFOLIO_HEALTH: invalidated on holdings change
  INVESTMENT_OPPORTUNITY: invalidated on investment_transfer change
  MONTHLY_REVIEW: invalidated midnight on 1st of next month
  Generation windows: A (00:00–11:59) B (12:00–23:59)
  Max 2 generations per day

UserFinancialProfile
  Source: householdStore.financialProfile
  Staleness: 24 hours
  Invalidation: any data change event (see triggers above)
```

---

## Hooks — The UI Boundary

### useSpend()

```typescript
// Returns:
{
  transactions: SpendTransaction[]
  budgets: Budget[]
  spendByCategory: Record<SpendCategory, number>
  totalSpend: number
  comparisonVsLastMonth: number
  comparisonVs3MonthAvg: number
  hasMinimumHistory: boolean        // true if ≥2 months data
  selectedMonth: string             // 'YYYY-MM'
  setSelectedMonth: (month: string) => void
}
```

### usePortfolio()

```typescript
// Returns:
{
  holdings: PortfolioHolding[]
  liveTotal: number
  lockedTotal: number
  financialPosition: number
  allocationByBucket: Record<string, number>
  allocationByGeography: Record<string, number>
  protectionAsset: PortfolioHolding | null
  protectionMonthsCovered: number
  savingsRate: number
}
```

### useInsights()

```typescript
// Returns:
{
  activeInsight: Insight | null
  currentMonthReview: MonthlyReview | null
  pastReviews: MonthlyReview[]
  reviewState: 'unavailable' | 'insufficient' | 'ready_unread' | 'ready_read'
  isOverBudget: boolean
  dismissInsight: () => void
}
```

### useHousehold()

```typescript
// Returns:
{
  household: Household | null
  profiles: Profile[]
  activeProfile: Profile | 'household'
  currentProfile: Profile | null
  setActiveProfile: (id: string | 'household') => void
  isAuthenticated: boolean
  riskProfile: RiskProfileType
  financialProfile: UserFinancialProfile | null
}
```

### useInstrumentCatalogue()

```typescript
// Returns:
{
  getSuggestions: (bucket, riskProfile, geography) => InstrumentCatalogueEntry[]
  getEntry: (id: string) => InstrumentCatalogueEntry | null
}
// V1: reads /constants/instrumentCatalogue.ts directly
// V2: replace with Supabase call — zero component changes
// NOTE: currently sorts by tier ascending — fix to kasheScore desc in Session 16
```

---

## DataSource — First-Class Entity

Every file import creates or updates a DataSource record.
The DataSource represents a bank/broker account, not a file.

```
On import:
1. ingestFile() runs — institution detected via fingerprints
2. DataSourceConfirmSheet always shown:
   - Institution: detected name (e.g. "ABN Amro")
   - Tier 2 account type selector — user always picks
   - Account label: auto-generated, editable
   - "Is this a joint account?" toggle — ALWAYS asked
3. User confirms → DataSource created
4. Raw account holder name NEVER stored (security pipeline strips it)
5. User-edited label stored in accountLabel
6. Future imports: auto-matched to existing DataSource by institution + last4

Joint accounts:
  accountType: 'joint'
  All transactions: ownership: 'joint'
  Enables household vs individual view logic
```

---

## Ingestion Pipeline — LOCKED (updated 25 March 2026)

```
User taps [+] → CSVUploadSheet opens
  → User selects "Upload bank statement" or "Upload portfolio CSV"
  → expo-document-picker opens (CSV, TXT, XLSX accepted)
  → File content read into MEMORY ONLY — never written to disk
  → ingestFile(IngestionInput) called from /services/ingestion
      Stage 1: fileReader.readFile() → RawRow[]
        CSV/TXT: Papa Parse (auto-detect delimiter)
        XLSX/XLS: SheetJS → first sheet → rows
        All headers normalised (trim + lowercase)
      Stage 2: columnDetector.detectColumnMapping() → ColumnMapping + institution
        Scores column fingerprints against INSTITUTION_REGISTRY
        If tier1Complete = false: ParseError TIER1_FIELDS_MISSING
      Stage 3: routeDetector.detectRoute() → RouteDetectionResult
        Institution-first routing (high/medium confidence)
        Column scoring fallback (UNKNOWN institution)
        Returns: { tier1Route, tier2Suggestion, confidence, signals[] }
      Stage 4a (spend path):
        transactionParser.parseTransactions() → SpendTransaction[]
        deduplicator.deduplicateTransactions()
        Returns ParseSuccess { transactions, holdings: [], pendingHoldings: [] }
      Stage 4b (portfolio path):
        holdingsParser.parseHoldings() → { holdings, pendingHoldings }
          assetSubtype from ISIN prefix + column signals
          Unknown → pendingHoldings[]
        Returns ParseSuccess { transactions: [], holdings, pendingHoldings }
      Any failure → ParseError ATOMIC_ROLLBACK
  → If probableDuplicates.length > 0: ProbableDuplicateSheet (W-04)
  → DataSourceConfirmSheet shown (ALWAYS):
      Tier 2 account type selector — required
      Pre-selected if confidence = high/medium
      Confirm disabled if confidence = unknown until user picks
      Account label (editable), joint account toggle
  → User confirms
  → If tier1Route === 'spend':
      spendStore.addTransactions(transactions, geography)
  → If tier1Route === 'portfolio':
      portfolioStore.addHoldings(holdings)
      portfolioStore.addPendingHoldings(pendingHoldings)
  → userProfileService.buildUserFinancialProfile()
      → householdStore.updateFinancialProfile(profile)
      → analyticsService.updateUserProperties(profile)
  → auditStore.logImport(auditData)
  → UploadToast shown:
      "✓ X transactions imported"        (spend path)
      "✓ X holdings imported"            (portfolio path)
      "⚠ Y holdings need categorisation" (if pendingHoldings > 0)
      "✓ Account numbers masked"
      "✓ Raw file discarded"
      "✓ Data stored securely on your device"
  → Raw file content discarded from memory
  → Screen updates reactively (Zustand)
  → Insight caches invalidated
```

---

## Mock Data Rules

All mock data lives in `/constants/mockData.ts`.

```typescript
// Mock data must:
// 1. Use neutral, non-country-specific merchant names
//    WRONG: "Albert Heijn", "Jumbo", "Thuisbezorgd"
//    RIGHT: "Supermarket", "Food Delivery App"
// 2. Match production TypeScript types exactly
// 3. Be realistic — plausible numbers, not placeholder zeros
// 4. Be stable — same data every time, no Math.random()
// 5. Cover all component states
// 6. Use SpendTransaction type (not Transaction alias)
```

---

## What Never Goes in a Component

```
✗ import spendCategoriser from '../services/spendCategoriser'
✗ import { parseCSV } from '../services/csvParser'  ← shim, use /ingestion
✗ import { ingestFile } from '../services/ingestion'  ← only in CSVUploadSheet
✗ import useSpendStore from '../store/spendStore'
✗ const color = '#C8F04A'
✗ const { colorScheme } = useColorScheme()
✗ fetch('https://api.anthropic.com/...')
✗ await SecureStore.setItemAsync(...)
✗ spendByCategory = transactions.reduce(...)
✗ const tier = financialPosition > 100000 ? 3 : 2
```

All of these belong in services, stores, or hooks.
The component receives the result — it never does the work.
