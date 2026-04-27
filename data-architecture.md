# Kāshe — Data Architecture
*Read CLAUDE.md and engineering-rules.md before this file.*
*This file covers the data layer: types, stores, hooks, services.*
*Last updated: 27 April 2026 — Session 14 complete.*
*Vehicle Intelligence Engine: new types, new profile fields, new computed functions.*
*Ingestion pipeline restructured: /services/ingestion/ (10 files).*
*csvParser.ts is now a re-export shim.*
*portfolioStore: addHoldings, addPendingHoldings, resolveHolding added.*
*W-04: ProbableDuplicate removed. Compound key dedup only.*

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
/constants/            Static data, vehicle rules, catalogues
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
  currency: string
  currencyOriginal: string
  amountOriginal: number
  fxRateApplied: number | null
  merchant: string
  description: string
  rawDescription: string
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
  merchantNorm: string
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
  accountLabel: string
  lastFourDigits?: string
  currency: string
  lastImported?: Date
  transactionCount: number
  type: 'SPEND' | 'PORTFOLIO' | 'SALARY'
}
```

### Portfolio types (updated VI-03 — /types/portfolio.ts)

```typescript
interface PortfolioHolding {
  id: string
  profileId: string
  householdId: string
  name: string
  ticker?: string
  isin?: string
  assetClass: AssetClass
  assetSubtype: AssetSubtype
  geography: string
  currency: string
  currentValue: number
  quantity?: number
  purchasePrice?: number

  // REQUIRED (was optional before VI-03)
  purchaseDate: Date
  // For historical imports without known date:
  //   purchaseDate = new Date(0), purchaseDateKnown = false
  // NEVER fire holding period alerts when purchaseDateKnown = false

  purchaseDateKnown: boolean

  // REQUIRED (added VI-03)
  countryOfAsset: string
  // 'IN'|'NL'|'GB'|'US'|'DE'|'other'|'unknown'
  // Drives: Box 3 inclusion, PFIC risk, DTAA relevance
  // Default for legacy imports: 'unknown' — no triggers fire

  isInsideTaxWrapper: boolean
  // true: ISA, pension, 401k, Roth IRA, lijfrente, NPS, EPF, PPF
  // false: GIA, direct equity, NRE account, cash savings

  // OPTIONAL (added VI-03)
  taxWrapperType?: TaxWrapperType

  vestingDate?: Date
  unlockDate?: Date

  costBasis?: number
  costBasisCurrency?: string

  // COMPUTED by userProfileService (do not set manually)
  holdingPeriodMonths?: number
  holdingPeriodStatus?: HoldingPeriodStatus
  pficFlag?: boolean          // isUSPerson + non-US mutual fund
  box3Included?: boolean      // NL resident + not in excluded wrapper
  dtaaRelevant?: boolean      // countryOfAsset != taxResidencyCountry

  maturityDate?: Date         // FDs, PPF, NSC, SGBs, I Bonds
  lockInExpiry?: Date         // ELSS 3yr, ULIP 5yr, NPS age 60, LISA 12mo
  insurancePremiumAnnual?: number
  insuranceSumAssured?: number
  annualInterestRate?: number

  bucket: 'GROWTH' | 'STABILITY' | 'LOCKED'
  bucketOverridden: boolean
  isProtectionDesignated: boolean
  freshnessStatus: 'fresh' | 'stale' | 'very_stale'
  dataSource: 'CSV' | 'MANUAL' | 'API'
  lastPriceUpdate?: Date
}

// NEW (VI-03)
export type TaxWrapperType =
  | 'isa_stocks_shares' | 'isa_cash' | 'isa_lifetime' | 'isa_jisa'
  | 'pension_uk' | 'sipp'
  | 'pension_us_401k_traditional' | 'pension_us_401k_roth'
  | 'pension_us_ira_traditional' | 'pension_us_ira_roth'
  | 'pension_us_hsa' | 'us_529'
  | 'pension_de_bav' | 'pension_de_rurup'
  | 'pension_nl_lijfrente' | 'pension_nl_employer'
  | 'pension_in_nps' | 'pension_in_epf' | 'pension_in_ppf'
  | 'other_tax_wrapper' | 'unknown'

// NEW (VI-03)
export type HoldingPeriodStatus =
  | 'short_term'
  | 'approaching_long_term'   // within 60 days of long-term threshold
  | 'long_term'
  | 'approaching_tax_free'    // within 60 days of full tax-free (DE crypto/property)
  | 'tax_free'
  | 'locked'
  | 'approaching_unlock'      // within 90 days of lock-in expiry
  | 'unlocked'
  | 'approaching_maturity'    // within 90 days of maturity
  | 'matured'
  | 'unknown'                 // purchaseDateKnown = false — never fire alerts
```

### Vehicle Intelligence types (new — /constants/vehicleRules.ts)

```typescript
// Single source of truth for all investment vehicle facts.
// Derived from vehicle-rules-IN/GB/NL/US/DE/XBORDER.md.
// Never hardcode vehicle facts anywhere else.

interface VehicleRule {
  vehicleId: string
  displayName: string
  geography: string[]
  vehicleCategory: VehicleCategory

  taxWrapper: {
    type: TaxWrapperTaxType
    annualLimit?: { amount: number; currency: string; period: string }
    sharedLimitGroup?: string   // 'india_80c' | 'uk_isa' | 'india_80d'
    taxFreeGrowth: boolean
    taxFreeWithdrawal: boolean
    taxReliefRate?: 'marginal' | number
    keyFacts: string[]          // max 3, factual only, no advice
    warningFacts?: string[]
    crossBorderFacts?: string[]
  }

  holdingPeriodRules?: {
    shortTermMonths: number
    taxFreeAfterMonths?: number  // DE crypto: 12, DE property: 120
    lockInMonths?: number
    lockInAgeYears?: number      // NPS: 60
    shortTermRate?: number
    longTermRate?: number
    taxFreeThreshold?: number    // India equity LTCG: 125000
    maturityMonths?: number      // SGB: 96 (8 years)
    earlyExitPenalty?: string
    maturityBenefit?: string
  }

  deadline?: {
    type: 'tax_year_end' | 'financial_year_end' | 'calendar_year_end' | 'peildatum'
    month: number
    day: number
    label: string
    daysWarningThreshold: number
  }

  crossBorderRules: {
    pficRisk: boolean
    box3Included: boolean
    portabilityRating: 'high' | 'medium' | 'low' | 'none' | 'unknown'
    portabilityNote?: string
    nriRestricted?: boolean
    nriRestrictedNote?: string
    figRegimeEligible?: boolean
    dtaaTreatment?: Record<string, string>
  }

  tierVisibility: (1 | 2 | 3)[]
  priorityScore: number

  triggerFlags: {
    hasAnnualAllowance: boolean
    hasDeadline: boolean
    isEmployerMatched: boolean
    hasHoldingPeriodAlert: boolean
    hasMaturityAlert: boolean
    hasLockInAlert: boolean
    requiresRegimeCheck: boolean
    isBox3Exposed: boolean
    hasPficRisk: boolean
    hasPortabilityRisk: boolean
  }
}

export type TaxWrapperTaxType =
  | 'eee'           // PPF, ISA — exempt contribution, growth, withdrawal
  | 'eet'           // pension, 401k traditional
  | 'tee'           // Roth IRA, Roth 401k
  | 'exempt_growth' // S&S ISA (post-tax, tax-free growth + withdrawal)
  | 'deductible'    // NPS old regime, Rürup
  | 'taxed'         // GIA, NRO account
  | 'complex'       // Box 3, ELSS under new regime
  | 'conditional'   // depends on regime or circumstance
  | 'unknown'

export type VehicleCategory =
  | 'pension' | 'isa_wrapper' | 'tax_advantaged_savings'
  | 'equity_investment' | 'fixed_income' | 'property'
  | 'emergency_fund' | 'insurance_investment' | 'employer_benefit'
  | 'government_scheme' | 'alternative'
  | 'other' | 'unknown'     // always required — no lookup ever throws

export const SHARED_LIMIT_GROUPS = {
  india_80c: { total: 150000, currency: 'INR', label: 'Section 80C (₹1.5L)' },
  india_80d: { total: 25000, currency: 'INR', label: 'Section 80D (₹25k)' },
  uk_isa: { total: 20000, currency: 'GBP', label: 'UK ISA (£20k)' },
}

// Never throws. Returns 'unknown' for unrecognised subtypes.
export function getVehicleCategory(subtype: string): VehicleCategory {
  return VEHICLE_CATEGORY_MAP[subtype] ?? 'unknown'
}

export const VEHICLE_RULES: VehicleRule[] = [ /* built in VI-01 */ ]
```

### Ingestion types (built — /services/ingestion/types.ts)

```typescript
type Tier1Route = 'spend' | 'portfolio'

type Tier2AccountType =
  | 'savings_account' | 'current_account'
  | 'credit_card' | 'joint_account'
  | 'brokerage' | 'mutual_fund_folio'
  | 'retirement' | 'fixed_deposit_account' | 'other_investment'

type RouteConfidence = 'high' | 'medium' | 'low' | 'unknown'
type FileType = 'csv' | 'txt' | 'xlsx'
type RawRow = Record<string, string>

interface RouteDetectionResult {
  tier1Route: Tier1Route
  tier2Suggestion: Tier2AccountType | null
  confidence: RouteConfidence
  detectedInstitution: SupportedInstitution
  signals: string[]
}

interface IngestionInput {
  content: string
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
  pendingHoldings: PortfolioHolding[]
  duplicatesSkipped: number
  // NOTE: probableDuplicates removed in W-04 — compound key dedup only
  confidence: ParseConfidence
  routeDetection: RouteDetectionResult
  fileType: FileType
  auditData: ImportAuditData
}

interface ImportAuditData {
  institution: SupportedInstitution
  transactionCount: number
  holdingCount: number
  pendingCategorizationCount: number
  duplicatesSkipped: number
  probableDuplicatesFound: number  // always 0 after W-04 — clean up Session 18
  layer2Queued: number
  parseConfidence: number
  tier1Route: Tier1Route
  tier2AccountType: Tier2AccountType | null
  status: 'success' | 'failed'
  errorCode?: string
}
```

### UserFinancialProfile (updated VI-02 — /types/userProfile.ts)

```typescript
// The intelligence spine. Everything reads from this.
// Built by userProfileService.ts. Stored in householdStore.

interface UserFinancialProfile {
  // === EXISTING FIELDS (unchanged) ===
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

  // === VEHICLE INTELLIGENCE ADDITIONS (VI-02) ===

  // Citizenship — drives worldwide tax, PFIC, NRI restrictions
  citizenships: string[]
  // ['IN'] | ['NL'] | ['IN','NL'] | ['IN','US'] etc.
  // Default: [] — empty until Tax Profile onboarding screen

  isUSPerson: boolean
  // true if US citizen or green card holder
  // US persons: worldwide income tax regardless of residence,
  //   ISA not sheltered from US tax, Indian MFs = PFIC risk
  // Default: false

  taxResidencyCountry: string
  // Primary country whose domestic rules apply
  // 'IN'|'NL'|'GB'|'US'|'DE'|'other'|'unknown'
  // Default: 'unknown'

  taxResidencyCountrySecondary?: string
  // For split-year or dual residency

  incomePrimaryCountry: string
  // Where salary/employment income comes from
  // Drives: pension access (401k, employer pension, NPS employer contribution)
  // Default: 'unknown'

  ukResidencyStartDate?: string
  // ISO date string — for FIG regime eligibility
  // FIG: foreign income and gains exempt for first 4 years of UK residency

  ukDomicileStatus?: 'uk' | 'non_uk' | 'unknown'

  indiaTaxRegime?: 'old' | 'new' | 'unknown'
  // 'new' = default from FY 2024-25 (no 80C deductions)
  // 'old' = opted in (full deduction ecosystem)
  // 'unknown' = not captured → T21 (80C) never fires, T30 fires instead

  indiaResidencyStatus?: 'resident' | 'nri' | 'rnor' | 'unknown'

  usState?: string
  // 'CA'|'NY'|'TX'|'FL'|'WA'|'NV'|'other'|'unknown'
  // CA: +13.3% CGT. NY: +10.9%. TX/FL/NV: 0%.

  deChurchTaxApplicable?: boolean

  // === COMPUTED FIELDS (set by userProfileService — do not set manually) ===

  primaryInvestmentMarkets: string[]
  // Derived from countryOfAsset across all holdings
  // e.g. ['IN', 'NL'] for Dutch resident with Indian investments

  crossBorderComplexityScore: number
  // 0 = single market, 1 = two markets, 2 = three+ or US person,
  // 3 = US person + multiple markets
  // NEVER shown to user

  hasPficRisk: boolean
  // true if isUSPerson + holds non-US/non-UCITS mutual fund

  figRegimeEligible: boolean
  // true if taxResidencyCountry='GB' + ukResidencyStartDate within 4 years
  // + had 10+ years prior non-UK residence

  activeHoldingPeriodAlerts: string[]
  // Vehicle IDs approaching key holding period thresholds

  vehiclePortabilityWarnings: string[]
  // e.g. ['bav_portability_risk', 'rurup_not_transferable']
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
  retryQueue: PendingCategorization[]

  derivedSpend: {
    spendByCategory: Record<SpendCategory, number>
    totalSpend: number
    comparisonVsLastMonth: number
    comparisonVs3MonthAvg: number
    selectedMonth: string
    lastCalculatedAt: string | null
  }

  addTransactions: (txns: SpendTransaction[], geography: string) => void
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
  pendingCategorizationQueue: PortfolioHolding[]

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
  addHoldings: (holdings: PortfolioHolding[]) => void
  addPendingHoldings: (holdings: PortfolioHolding[]) => void
  resolveHolding: (id: string, assetSubtype: AssetSubtype) => void
  updateHolding: (holdingId: string, updates: Partial<PortfolioHolding>) => void
  setBucketOverride: (override: BucketOverride) => void
  setProtection: (holdingId: string) => void
  updateDerived: (derived: PortfolioDerived) => void
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
  financialProfile: UserFinancialProfile | null

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
  // clearAuditLog ONLY called from "delete all data" flow
}
```

---

## UserFinancialProfile — The Intelligence Spine

### What it feeds

```
getActiveSeedSources(profile)              → which sources to search
evaluateAllTriggers(profile, fxParams)     → which triggers fire (T1-T30)
buildHoldingsContext(profile, holdings)    → what Claude receives
analyticsService.updateUserProperties()   → all PostHog properties
aiInsightService                           → search depth, framing, discovery pass
```

### Vehicle Intelligence computed functions (VI-04 — userProfileService.ts)

```typescript
// Five new functions called inside buildUserFinancialProfile():

computeCrossBorderComplexityScore(citizenships, taxResidencyCountry, primaryInvestmentMarkets)
// Returns 0-3. US person always >= 2.

computeHasPficRisk(citizenships, isUSPerson, financialVehicles)
// true if US person + holds Indian/non-US/non-UCITS mutual funds

computeFigRegimeEligible(taxResidencyCountry, ukResidencyStartDate?)
// true if GB resident + within 4 years of arrival + 10+ years prior non-UK

computeBox3IncludedHoldings(holdings, taxResidencyCountry)
// Returns holding IDs. NL residents only.
// Excludes: all pension wrappers, US 401k/IRA (confirmed excluded by Dutch tax authority)

computeVehiclePortabilityWarnings(financialVehicles, taxResidencyCountry)
// e.g. DE resident with bAV → 'bav_portability_risk'
// e.g. DE resident with Rürup → 'rurup_not_transferable'
```

### How vehicleRules.ts enters the insight engine

```
vehicleRules.ts is NEVER sent directly to Claude.
It feeds the engine through four channels only:

1. insightTriggers.ts (T13-T30)
   Reads VEHICLE_RULES to know: deadlines, holding period thresholds,
   allowance limits, cross-border flags.

2. holdingsContextBuilder.ts
   Reads holdingPeriodStatus, pficFlag, box3Included, dtaaRelevant
   from each holding. Adds taxProfile block to Claude context.
   Never sends raw VEHICLE_RULES array.

3. insightSources.ts
   Seed sources filtered by profile.primaryInvestmentMarkets.
   Dutch resident with Indian assets → NL + IN sources only.

4. educationCatalogue.ts
   Vehicle-specific articles linked by vehicleId.
   Surfaces relevant education based on actual holdings.

Claude receives sanitised, structured context — never raw rules.
```

### updateUserProfile() triggers

```
spendStore.addTransactions()           → buildUserFinancialProfile()
portfolioStore.addHolding()            → same
portfolioStore.addHoldings()           → same
portfolioStore.updateHolding()         → same
portfolioStore.setBucketOverride()     → same
portfolioStore.setProtection()         → same
householdStore.setRiskProfile()        → same (if changed from default)
householdStore.setOnboardingComplete() → same
Monthly target set                     → same
FIRE inputs set                        → same
```

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
{
  transactions: SpendTransaction[]
  budgets: Budget[]
  spendByCategory: Record<SpendCategory, number>
  totalSpend: number
  comparisonVsLastMonth: number
  comparisonVs3MonthAvg: number
  hasMinimumHistory: boolean
  selectedMonth: string
  setSelectedMonth: (month: string) => void
}
```

### usePortfolio()

```typescript
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
{
  getSuggestions: (bucket, riskProfile, geography) => InstrumentCatalogueEntry[]
  getEntry: (id: string) => InstrumentCatalogueEntry | null
}
// V1: reads /constants/instrumentCatalogue.ts directly
// V2: replace with Supabase call — zero component changes
// NOTE: currently sorts by tier ascending — fix to kasheScore desc in Session 18
```

---

## DataSource — First-Class Entity

Every file import creates or updates a DataSource record.

```
On import:
1. ingestFile() runs — institution detected via fingerprints
2. DataSourceConfirmSheet always shown:
   - Institution: detected name
   - Tier 2 account type selector — user always picks
   - Account label: auto-generated, editable
   - "Is this a joint account?" toggle — ALWAYS asked
3. User confirms → DataSource created
4. Raw account holder name NEVER stored (security pipeline strips it)
5. Future imports: auto-matched by institution + last4

Joint accounts:
  accountType: 'joint'
  All transactions: ownership: 'joint'
  Enables household vs individual view logic
```

---

## Ingestion Pipeline — LOCKED (updated 25 March 2026)

```
User taps [+] → CSVUploadSheet opens
  → User selects file (CSV, TXT, XLSX accepted)
  → File content read into MEMORY ONLY — never written to disk
  → ingestFile(IngestionInput) called from /services/ingestion
      Stage 1: fileReader.readFile() → RawRow[]
      Stage 2: columnDetector.detectColumnMapping() → ColumnMapping + institution
        If tier1Complete = false: ParseError TIER1_FIELDS_MISSING
      Stage 3: routeDetector.detectRoute() → RouteDetectionResult
      Stage 4a (spend path):
        transactionParser.parseTransactions() → SpendTransaction[]
        deduplicator.deduplicateTransactions() — compound key only (W-04)
      Stage 4b (portfolio path):
        holdingsParser.parseHoldings() → { holdings, pendingHoldings }
      Any failure → ParseError ATOMIC_ROLLBACK
  → DataSourceConfirmSheet shown (ALWAYS)
  → User confirms
  → portfolioStore or spendStore updated
  → userProfileService.buildUserFinancialProfile()
      → householdStore.updateFinancialProfile(profile)
      → analyticsService.updateUserProperties(profile)
  → auditStore.logImport(auditData)
  → UploadToast shown
  → Raw file content discarded from memory
```

---

## Mock Data Rules

```typescript
// All mock data lives in /constants/mockData.ts
// Must be updated for VI-02 + VI-03 new fields

// Mock UserFinancialProfile additions (VI-02):
citizenships: ['IN'],
isUSPerson: false,
taxResidencyCountry: 'NL',
incomePrimaryCountry: 'NL',
indiaTaxRegime: 'new',
indiaResidencyStatus: 'nri',
crossBorderComplexityScore: 1,
hasPficRisk: false,
figRegimeEligible: false,
primaryInvestmentMarkets: ['IN', 'NL'],
activeHoldingPeriodAlerts: [],
vehiclePortabilityWarnings: [],

// Mock PortfolioHolding additions (VI-03):
purchaseDate: new Date('2022-06-15'),  // realistic date
purchaseDateKnown: true,
countryOfAsset: 'NL',                 // or 'IN' per holding
isInsideTaxWrapper: false,
holdingPeriodMonths: 22,              // computed from purchaseDate
holdingPeriodStatus: 'long_term',

// Mock data rules:
// 1. Never Dutch-specific brand names — neutral only
// 2. Match production types exactly — always
// 3. Realistic numbers — no placeholder zeros
// 4. Stable — no Math.random()
// 5. Use SpendTransaction type (not Transaction alias)
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
✗ const category = VEHICLE_CATEGORY_MAP[subtype]  ← use getVehicleCategory()
✗ const rule = VEHICLE_RULES.find(r => r.vehicleId === ...)  ← service layer only
```

All of these belong in services, stores, or hooks.
The component receives the result — it never does the work.
