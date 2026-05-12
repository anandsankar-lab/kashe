# Kāshe — CLAUDE-filetree.md
*Current file tree. Rewrites every session.*
*Last updated: 11 May 2026 — Session 15 complete.*
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

settings.tsx        ✅ Stub with Education section (Session 19: full build)
sources.tsx         ⬜ Session 18
onboarding/         ⬜ Session 17 — 10 screens + Tax Profile (VI-08)
                       + non-blocking property nudge card
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

/invest/            ✅ All complete + wired
  RiskProfileCard        ✅ Wired to householdStore — W-07
  RiskProfileSheet, InvestmentPlanFull
  MonthlyReviewCard      ✅ Wired to useInsights() — W-05
  MonthlyReviewSheet, FIRETeaserCard (built, not rendered)
  InstrumentDiscoverySection ✅ Wired to useInstrumentCatalogue() — W-06
  FinancialEducationSection

/shared/
  AppHeader.tsx               ✅ Universal — all tabs
  PMDashboard.tsx             ⬜ Session 19.5
  UniversalAddSheet.tsx       ⬜ Session 17 — includes property entry form
  CSVUploadSheet.tsx          ✅ Session 13 (W-03)
  DataSourceConfirmSheet.tsx  ✅ Session 13 (W-03)
  ProbableDuplicateSheet.tsx  ⬜ RETIRED — compound key dedup replaces this (W-04)
  UploadToast.tsx             ✅ Session 13 (W-03)
  EmptyState.tsx              ✅
  KasheAsterisk.tsx           ✅
  MacronRule.tsx              ✅
  RedactedNumber.tsx          ✅
  InsightDetailSheet.tsx      ⬜ Session 16+
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
                           NOTE: must be updated for VI-02 + VI-03 new fields
displayLabels.ts        ✅ Raw subtype keys never in UI
instrumentCatalogue.ts  ✅ ~40 curated entries, 5 geographies
educationCatalogue.ts   ✅ 20 articles, 5 geographies
fireDefaults.ts         ✅ V2 foundation — do not delete
merchantKeywords.ts     ✅ NL/IN/EU/GLOBAL
insightSources.ts       ✅ Seed sources, getActiveSeedSources(profile)
insightTriggers.ts      ✅ 12 triggers T1–T12
                           ⬜ VI-05: add T13–T30 (Vehicle Intelligence triggers)
insightPrompts.ts       ✅ Prompt templates, injection defence
                           ⬜ VI-06: add market-aware tax profile context
vehicleRules.ts         ⬜ VI-01 (NEW) — VehicleRule[], VEHICLE_RULES constant
```

---

## /types

```
spend.ts                ✅ SpendTransaction, SpendCategory, Budget, DataSource
portfolio.ts            ✅ PortfolioHolding, DEFAULT_BUCKET, AssetSubtype (32 values)
                           ⬜ VI-03: purchaseDate required, countryOfAsset,
                              isInsideTaxWrapper, taxWrapperType, holdingPeriodStatus
riskProfile.ts          ✅ RiskProfileType, RISK_PROFILES
instrumentCatalogue.ts  ✅ InstrumentCatalogueEntry, CatalogueRole
fire.ts                 ✅ FIREInputs, FIREOutputs — V2 foundation, do not delete
userProfile.ts          ✅ UserFinancialProfile, VEHICLE_CATEGORY_MAP
                           ⬜ VI-02: cross-border fields, citizenships[], PFIC, FIG, Box3
```

---

## /services

```
storageService.ts         ✅ Session 12 + PDF_EXTRACTION_BUDGET key (DL-10)
secureStorageAdapter.ts   ✅ Session 12 + Session 13 — web localStorage fallback
spendCategoriser.ts       ✅ Session 12 — Layer 3→1→2 pipeline
csvParser.ts              ✅ SHIM — re-exports from /services/ingestion. Remove Session 19.
holdingsContextBuilder.ts ✅ Session 12
                             ⬜ VI-07: add cross-border context
aiInsightService.ts       ✅ Session 12
analyticsService.ts       ✅ Session 12 + Session 13
userProfileService.ts     ✅ Session 12
                             ⬜ VI-04: 5 new computed functions
snapshotService.ts        ⬜ Session 19.5
shareService.ts           ⬜ Session 19.5
```

---

## /services/ingestion/

```
types.ts                ✅ All ingestion types + PdfBudget + PdfExtractionResult (DL-10)
institutionRegistry.ts  ✅ 35 institutions, column + content fingerprints
fileReader.ts           ✅ CSV/TXT/XLSX + PDF branch (DL-10)
columnDetector.ts       ✅ RawRow[] → ColumnMapping + ParseConfidence + institution
routeDetector.ts        ✅ Institution + ColumnMapping → RouteDetectionResult
securityPipeline.ts     ✅ PII masking and sanitisation
transactionParser.ts    ✅ RawRow[] + ColumnMapping → SpendTransaction[]
holdingsParser.ts       ✅ RawRow[] + ColumnMapping → PortfolioHolding[]
deduplicator.ts         ✅ Compound key dedup — geography-agnostic (W-04)
pdfExtractor.ts         ✅ Claude Haiku extraction — 50 call/month cap (DL-10)
index.ts                ✅ ingestFile() — PDF branch added (DL-10)
```

---

## /store

```
spendStore.ts       ✅ Session 12
portfolioStore.ts   ✅ Session 12 + Session 13
insightsStore.ts    ✅ Session 12
householdStore.ts   ✅ Session 12 + Session 13 + W-07 (riskProfile persistence)
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
useInstrumentCatalogue.ts ✅ Session 12 — wired to InstrumentDiscoverySection (W-06)
                             NOTE: sorts by tier asc — fix to kasheScore desc Session 19
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
CLAUDE.md                         ✅
CLAUDE-state.md                   ✅ Updated Session 15
CLAUDE-history.md                 ✅ Updated Session 15
CLAUDE-filetree.md                ✅ This file — updated Session 15
CLAUDE-decisions.md               ✅ Updated Session 14 (no new locked decisions Session 15)
CLAUDE-bugs.md                    ✅ Updated Session 15 — password-protected file error added
engineering-rules.md              ✅ Updated Session 14
data-architecture.md              ✅ Updated Session 14
ai-insights.md                    ✅
design-system.md                  ✅
freemium-boundaries.md            ✅
kashe-prd-complete.md             ✅
kashe-handoff-session-16.md       ✅ Session 15 → Session 16 briefing

vehicle-rules-IN.md               ✅ Session 14
vehicle-rules-GB.md               ✅ Session 14
vehicle-rules-NL.md               ✅ Session 14
vehicle-rules-US.md               ✅ Session 14
vehicle-rules-DE.md               ✅ Session 14
vehicle-rules-XBORDER.md          ✅ Session 14
VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md ✅ Session 14
```
