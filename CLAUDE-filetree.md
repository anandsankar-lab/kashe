# Kāshe — CLAUDE-filetree.md
*Current file tree. Rewrites every session.*
*Last updated: 27 April 2026 — Session 14 complete.*
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

settings.tsx        ✅ Stub with Education section (Session 18: full build)
sources.tsx         ⬜ Session 17
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
  PMDashboard.tsx             ⬜ Session 18.5
  UniversalAddSheet.tsx       ⬜ Session 16
  CSVUploadSheet.tsx          ✅ Session 13 (W-03)
  DataSourceConfirmSheet.tsx  ✅ Session 13 (W-03)
  ProbableDuplicateSheet.tsx  ⬜ RETIRED — compound key dedup replaces this (W-04)
  UploadToast.tsx             ✅ Session 13 (W-03)
  EmptyState.tsx              ✅
  KasheAsterisk.tsx           ✅
  MacronRule.tsx              ✅
  RedactedNumber.tsx          ✅
  InsightDetailSheet.tsx      ⬜ Session 15+
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
                           TaxWrapperTaxType, VehicleCategory, HoldingPeriodStatus enums
                           SHARED_LIMIT_GROUPS, getVehicleCategory() (never throws)
```

---

## /types

```
spend.ts                ✅ SpendTransaction, SpendCategory, Budget, DataSource
portfolio.ts            ✅ PortfolioHolding, DEFAULT_BUCKET, AssetSubtype (32 values)
                           ⬜ VI-03: purchaseDate required, countryOfAsset,
                              isInsideTaxWrapper, taxWrapperType, holdingPeriodStatus,
                              holdingPeriodMonths, maturityDate, lockInExpiry,
                              pficFlag, box3Included, dtaaRelevant
                              NEW ENUMS: TaxWrapperType (18+), HoldingPeriodStatus (11)
riskProfile.ts          ✅ RiskProfileType, RISK_PROFILES
instrumentCatalogue.ts  ✅ InstrumentCatalogueEntry, CatalogueRole
fire.ts                 ✅ FIREInputs, FIREOutputs — V2 foundation, do not delete
userProfile.ts          ✅ UserFinancialProfile, VEHICLE_CATEGORY_MAP
                           ⬜ VI-02: add citizenships[], isUSPerson, taxResidencyCountry,
                              incomePrimaryCountry, ukResidencyStartDate, indiaTaxRegime,
                              usState, deChurchTaxApplicable,
                              crossBorderComplexityScore, hasPficRisk, figRegimeEligible,
                              activeHoldingPeriodAlerts, vehiclePortabilityWarnings,
                              primaryInvestmentMarkets
                              VEHICLE_CATEGORY_MAP: add 'other' + 'unknown' catch-all
```

---

## /services

```
storageService.ts         ✅ Session 12 — expo-secure-store vault door
secureStorageAdapter.ts   ✅ Session 12 + Session 13 — web localStorage fallback
spendCategoriser.ts       ✅ Session 12 — Layer 3→1→2 pipeline
csvParser.ts              ✅ NOW A SHIM — re-exports from /services/ingestion
                             Do not add logic here. Session 18: remove shim.
holdingsContextBuilder.ts ✅ Session 12
                             ⬜ VI-07: add cross-border context (taxProfile, holdingFlags,
                                activeWarnings) to what is sent to Claude
aiInsightService.ts       ✅ Session 12
analyticsService.ts       ✅ Session 12 + Session 13
userProfileService.ts     ✅ Session 12
                             ⬜ VI-04: add 5 new computed functions:
                                computeCrossBorderComplexityScore()
                                computeHasPficRisk()
                                computeFigRegimeEligible()
                                computeBox3IncludedHoldings()
                                computeVehiclePortabilityWarnings()
snapshotService.ts        ⬜ Session 18.5
shareService.ts           ⬜ Session 18.5
```

---

## /services/ingestion/

```
types.ts                ✅ All ingestion types — single source of truth
institutionRegistry.ts  ✅ 35 institutions, column + content fingerprints
fileReader.ts           ✅ Raw file content → RawRow[]
columnDetector.ts       ✅ RawRow[] → ColumnMapping + ParseConfidence + institution
routeDetector.ts        ✅ Institution + ColumnMapping → RouteDetectionResult
securityPipeline.ts     ✅ PII masking and sanitisation
transactionParser.ts    ✅ RawRow[] + ColumnMapping → SpendTransaction[]
holdingsParser.ts       ✅ RawRow[] + ColumnMapping → PortfolioHolding[]
deduplicator.ts         ✅ Compound key dedup — geography-agnostic (W-04)
index.ts                ✅ ingestFile() — THE ONLY PUBLIC ENTRY POINT
```

---

## /store

```
spendStore.ts       ✅ Session 12
portfolioStore.ts   ✅ Session 12 + Session 13
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
                             NOTE: sorts by tier asc — fix to kasheScore desc Session 18
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
CLAUDE-state.md                   ✅ Updated Session 14
CLAUDE-history.md                 ✅ Updated Session 14
CLAUDE-filetree.md                ✅ This file — updated Session 14
CLAUDE-decisions.md               ✅ Updated Session 14 — Section 19 added
CLAUDE-bugs.md                    ✅ Updated Session 14 — items 45-55 added
CLAUDE-identity.md                ✅
CLAUDE-financial.md               ✅
engineering-rules.md              ✅ Updated Session 14 — Vehicle Intelligence rules added
data-architecture.md              ✅ Updated Session 14 — new types documented
ai-insights.md                    ✅
design-system.md                  ✅
freemium-boundaries.md            ✅
kashe-prd-complete.md             ✅
kashe-handoff-session-15.md       ✅ Session 14 → Session 15 briefing

vehicle-rules-IN.md               ✅ Session 14 — India market reference (double confirmed)
vehicle-rules-GB.md               ✅ Session 14 — UK market reference (double confirmed)
vehicle-rules-NL.md               ✅ Session 14 — Netherlands market reference (double confirmed)
vehicle-rules-US.md               ✅ Session 14 — USA market reference (double confirmed)
vehicle-rules-DE.md               ✅ Session 14 — Germany market reference (double confirmed)
vehicle-rules-XBORDER.md          ✅ Session 14 — Cross-border interaction matrix (double confirmed)
VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md  ✅ Session 14 — Annual review checklist
```
