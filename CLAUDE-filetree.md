# Kāshe — CLAUDE-filetree.md
*Current file tree. Rewrites every session.*
*Last updated: 25 March 2026 — Session 13 in progress.*
*✅ = built and committed. ⬜ = not yet built.*

---

## /app

```
(tabs)/
  index.tsx         ✅ Home screen — complete
  spend.tsx         ✅ Wired to useSpend() — W-01
  portfolio.tsx     ✅ Wired to usePortfolio() — W-02
  invest.tsx        ✅ Invest tab — complete

spend/
  [category].tsx    ✅ Spend category detail screen

portfolio/
  [holdingId].tsx   ✅ Holding detail screen

invest/
  fire.tsx          ⬜ V2 — do not build

settings.tsx        ✅ Stub with Education section (Session 16: full build)
sources.tsx         ⬜ Session 15
```

---

## /components

```
/home/              ✅ All complete
  PositionHeroCard, SpendStoryCard, MarketsStrip, PortfolioPulse
  SegregationToggle, SavingsRateBadge, MonthlyReviewLink

/spend/             ✅ All complete
  SpendScreenHeader, SpendSummaryStrip, SpendInsightStrip
  SpendCategoryList, SpendCategoryRow, SpendTransactionRow
  TransactionEditSheet, SpendBudgetSheet

/portfolio/         ✅ All complete
  PortfolioTotalsCard, PortfolioInsightStrip, InvestmentPlanCard
  InvestmentPlanExpanded, SalaryContributionRow, AllocationSuggestionRow
  InstrumentSuggestionSheet, PortfolioSectionHeader, PortfolioHoldingRow
  BucketReassignSheet, LockedProjectionCard, ProtectionStatusCard
  HoldingPriceChart, HoldingInsightCard

/invest/            ✅ All complete
  RiskProfileCard, RiskProfileSheet, InvestmentPlanFull
  MonthlyReviewCard, MonthlyReviewSheet, FIRETeaserCard (built, not rendered)
  InstrumentDiscoverySection, FinancialEducationSection

/shared/
  AppHeader.tsx               ✅ Universal — all tabs
  PMDashboard.tsx             ⬜ Session 16.5
  UniversalAddSheet.tsx       ⬜ Session 14
  CSVUploadSheet.tsx          ✅ Session 13 (W-03)
                                 Accepts CSV, TXT, XLSX/XLS
                                 Calls ingestFile() from /services/ingestion
  DataSourceConfirmSheet.tsx  ✅ Session 13 (W-03)
                                 Tier 2 account type selector — always shown
                                 Confirm disabled until user picks when confidence=unknown
  ProbableDuplicateSheet.tsx  ⬜ Session 13 (W-04)
  UploadToast.tsx             ✅ Session 13 (W-03)
                                 Shows pending count if pendingHoldings > 0
  EmptyState.tsx              ✅
  KasheAsterisk.tsx           ✅
  MacronRule.tsx              ✅
  RedactedNumber.tsx          ✅
  InsightDetailSheet.tsx      ⬜ Session 13+
```

---

## /constants

```
colours.ts              ✅
typography.ts           ✅
spacing.ts              ✅
formatters.ts           ✅ formatCurrency() — Intl.NumberFormat banned
featureFlags.ts         ✅
mockData.ts             ✅ Geography-neutral, production-shaped
displayLabels.ts        ✅ Raw subtype keys never in UI
instrumentCatalogue.ts  ✅ ~40 curated entries, 5 geographies
educationCatalogue.ts   ✅ 20 articles, 5 geographies
fireDefaults.ts         ✅ V2 foundation — do not delete
merchantKeywords.ts     ✅ NL/IN/EU/GLOBAL
insightSources.ts       ✅ Seed sources, getActiveSeedSources(profile)
insightTriggers.ts      ✅ 12 triggers T1–T12, all pure functions
insightPrompts.ts       ✅ Prompt templates, injection defence
```

---

## /types

```
spend.ts                ✅ SpendTransaction, SpendCategory, Budget, DataSource
portfolio.ts            ✅ PortfolioHolding, DEFAULT_BUCKET, AssetSubtype (32 values)
riskProfile.ts          ✅ RiskProfileType, RISK_PROFILES
instrumentCatalogue.ts  ✅ InstrumentCatalogueEntry, CatalogueRole
fire.ts                 ✅ FIREInputs, FIREOutputs — V2 foundation, do not delete
userProfile.ts          ✅ UserFinancialProfile, VEHICLE_CATEGORY_MAP
```

---

## /services

```
storageService.ts         ✅ Session 12 — expo-secure-store vault door
secureStorageAdapter.ts   ✅ Session 12 + Session 13
                             Web localStorage fallback added Session 13
                             Zustand bridge, separate from storageService
spendCategoriser.ts       ✅ Session 12 — Layer 3→1→2 pipeline
csvParser.ts              ✅ NOW A SHIM — re-exports from /services/ingestion
                             Do not add logic here. Session 16: remove shim.
holdingsContextBuilder.ts ✅ Session 12
                             TODO Session 13 W-09: wire to UserFinancialProfile
aiInsightService.ts       ✅ Session 12
analyticsService.ts       ✅ Session 12 + Session 13
userProfileService.ts     ✅ Session 12
snapshotService.ts        ⬜ Session 16.5
shareService.ts           ⬜ Session 16.5
```

---

## /services/ingestion/ ← NEW Session 13

```
types.ts                ✅ All ingestion types — single source of truth
                           Tier1Route, Tier2AccountType, RouteDetectionResult
                           IngestionInput, FileType, RawRow, RouteConfidence
                           ParseSuccess (updated), ParseError, ParseResult
                           SupportedInstitution (35 institutions)
                           ImportAuditData (updated with holdingCount etc.)

institutionRegistry.ts  ✅ 35 institutions across NL/IN/UK/US/EU
                           InstitutionDefinition with column + content fingerprints
                           INSTITUTION_REGISTRY — single source for all institution logic
                           getInstitution(), getSpendInstitutions(), getPortfolioInstitutions()

fileReader.ts           ✅ Raw file content → RawRow[]
                           detectFileType(): csv | txt | xlsx
                           readFile(): XLSX via SheetJS, CSV/TXT via Papa Parse
                           All headers normalised (trim + lowercase)

columnDetector.ts       ✅ RawRow[] → ColumnMapping + ParseConfidence + institution
                           detectInstitution(): scores registry fingerprints
                           detectColumnMapping(): returns full detection result

routeDetector.ts        ✅ Institution + ColumnMapping → RouteDetectionResult
                           Institution-first (high/medium confidence)
                           Column scoring fallback (UNKNOWN institution)
                           Returns tier1Route, tier2Suggestion, confidence, signals[]

securityPipeline.ts     ✅ PII masking and sanitisation
                           sanitiseTransaction(), sanitiseHolding()
                           isSafeValue(), maskAccountNumber(), normaliseDescription()

transactionParser.ts    ✅ RawRow[] + ColumnMapping → SpendTransaction[]
                           parseTransactions(), parseRow(), parseAmount(), parseDate()

holdingsParser.ts       ✅ RawRow[] + ColumnMapping → PortfolioHolding[]
                           ISIN prefix detection for assetSubtype
                           pendingHoldings[] for unknown assetSubtype rows

deduplicator.ts         ✅ SpendTransaction[] deduplication
                           Dice coefficient fuzzy match for Indian banks
                           deduplicateTransactions()

index.ts                ✅ ingestFile(IngestionInput): Promise<ParseResult>
                           THE ONLY PUBLIC ENTRY POINT
                           Orchestrates full pipeline stages 1–4
                           Re-exports all types for consumers
```

---

## /store

```
spendStore.ts       ✅ Session 12
portfolioStore.ts   ✅ Session 12 + Session 13
                       Added: addHoldings() — batch add with dedup by id
                       Added: pendingCategorizationQueue — FIFO cap 50
                       Added: addPendingHoldings()
                       Added: resolveHolding(id, assetSubtype)
insightsStore.ts    ✅ Session 12
householdStore.ts   ✅ Session 12 + Session 13
auditStore.ts       ✅ Session 12
```

---

## /hooks

```
useDataSources.ts         ✅ Session 03
useSpend.ts               ✅ Session 12
usePortfolio.ts           ✅ Session 12
useInsights.ts            ✅ Session 12
useHousehold.ts           ✅ Session 12
useInstrumentCatalogue.ts ✅ Session 12
                             NOTE: sorts by tier asc — fix to kasheScore desc Session 16
```

---

## /context

```
ThemeContext.tsx  ✅ useColorScheme() ONLY here — nowhere else
```

---

## Project root

```
metro.config.js   ✅ Session 13 — unstable_enablePackageExports: false
babel.config.js   ✅ Session 13 — babel-preset-expo
```

---

## /docs (project root)

```
CLAUDE.md                    ✅
CLAUDE-state.md              ✅ Rewrites each session
CLAUDE-history.md            ✅ Append-only
CLAUDE-filetree.md           ✅ This file
CLAUDE-decisions.md          ✅ Updated Session 13
CLAUDE-bugs.md               ✅ Updated Session 13
CLAUDE-identity.md           ✅ Updated Session 13
CLAUDE-financial.md          ✅
engineering-rules.md         ✅ Updated Session 13
data-architecture.md         ✅ Updated Session 13
ai-insights.md               ✅
design-system.md             ✅
freemium-boundaries.md       ✅
kashe-prd-complete.md        ✅
kashe-handoff-session-XX.md  ✅ Per-session briefing
```
