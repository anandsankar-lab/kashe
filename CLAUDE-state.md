# Kāshe — CLAUDE-state.md
*Current build state. Read this before any new session.*
*Last updated: 20 March 2026 — Session 12 COMPLETE.*
*DL-01 through DL-09 all committed.*
*UserFinancialProfile architecture complete.*
*Analytics events + user properties finalised.*
*Session 13 is next: DL-09 runs first, then UI wiring.*

---

## HOW TO USE THIS DOCUMENT

Before starting any session:
1. Read this file first
2. Read CLAUDE.md
3. Read the latest kashe-handoff-session-XX.md
4. Read engineering-rules.md
5. Read design-system.md for any UI work
6. Then and only then: write the Claude Code prompt

## HOW WE WORK — THE EXACT LOOP

1. Write the Claude Code prompt in the planning chat (Claude.ai)
2. Paste into Claude Code in terminal → runs → preview at localhost:8081
3. Screenshot shared back in planning chat → verified together
4. Planning chat provides exact git commands → Anand commits

MD files are downloaded and replaced in full in the repo.
Never edited inline. Every commit includes code + updated MD files.
Git commands always run manually by Anand. Never through Claude Code.

---

## SESSIONS COMPLETE

### Session 01 — Design System + Home Screen (Part 1)
✅ Environment setup (Node v25.6.1, npm 11.9.0, Claude Code)
✅ Expo SDK 55 + Expo Router + 4-tab navigation
✅ Fonts: Space Grotesk (700, 600, 400) + Inter (500, 400)
✅ Dark/light mode via ThemeContext
✅ /constants/colours.ts — all tokens, both modes, hero tokens
✅ /constants/typography.ts — 8 type styles
✅ /constants/spacing.ts — 4px grid + borderRadius
✅ /constants/mockData.ts
✅ /components/ui/Typography.tsx, Card.tsx, Button.tsx
✅ /components/shared/KasheAsterisk.tsx
✅ /components/shared/MacronRule.tsx
✅ /components/shared/RedactedNumber.tsx
✅ /components/shared/EmptyState.tsx
✅ /components/home/ — all home components

### Session 02 — Home Screen (Complete)
✅ Fonts locked: Space Grotesk + Inter (Syne/DM Sans retired)
✅ ThemeContext pattern introduced and locked
✅ /components/home/SegregationToggle.tsx
✅ /components/home/MonthlyReviewLink.tsx
✅ /components/home/SpendStoryCard.tsx
✅ /components/shared/AppHeader.tsx (initial)
✅ /context/ThemeContext.tsx
✅ react-native-svg, expo-linear-gradient installed

### Session 03 — Spend Screen (Complete)
✅ /types/spend.ts
✅ /hooks/useDataSources.ts
✅ All spend components
✅ /app/spend/[category].tsx
✅ /app/(tabs)/spend.tsx — complete

### Session 04 — Portfolio (PORT-01 through PORT-03)
✅ /types/portfolio.ts — two-layer type system + DEFAULT_BUCKET
✅ /constants/mockData.ts — portfolio mock data added
✅ /components/portfolio/PortfolioTotalsCard.tsx
✅ /components/portfolio/PortfolioSectionHeader.tsx
✅ /components/portfolio/PortfolioHoldingRow.tsx

### Session 05 — Portfolio (PORT-06 through PORT-09)
✅ /components/portfolio/PortfolioInsightStrip.tsx
✅ /components/portfolio/InvestmentPlanCard.tsx
✅ /constants/formatters.ts — formatCurrency()
✅ /components/portfolio/InstrumentSuggestionSheet.tsx
✅ /components/portfolio/BucketReassignSheet.tsx

### Session 06 — Portfolio (PORT-10 basic)
✅ /components/portfolio/LockedProjectionCard.tsx
✅ /components/portfolio/ProtectionStatusCard.tsx
✅ /app/portfolio/[holdingId].tsx — basic version

### Session 07 — Colour Audit + PORT-10b + Visual Standardisation
✅ insights.tsx → invest.tsx, _layout.tsx updated
✅ Full colour audit — all components use theme tokens correctly
✅ /constants/displayLabels.ts
✅ /components/portfolio/HoldingPriceChart.tsx
✅ /components/portfolio/HoldingInsightCard.tsx
✅ /app/portfolio/[holdingId].tsx — PORT-10b complete
✅ Visual standardisation pass complete

### Session 08 — PORT-11 + Mock Data Overhaul + Invest shell
✅ PORT-11: Portfolio empty state
✅ Mock data overhaul — geography-neutral holdings
✅ Tab 4 confirmed as Invest, invest.tsx shell created

### Session 09 — INV-01 + Catalogue Type System + Universal Header
✅ /types/riskProfile.ts — RiskProfileType + RISK_PROFILES
✅ /components/invest/RiskProfileCard.tsx — two states
✅ /components/invest/RiskProfileSheet.tsx — three-option picker
✅ /types/instrumentCatalogue.ts — full type system
✅ /constants/instrumentCatalogue.ts — ~40 curated entries
✅ /components/shared/AppHeader.tsx — rebuilt as universal

### Session 10 — INV-02 through INV-05 + Copy Tightening
✅ /components/invest/InvestmentPlanFull.tsx — INV-02
✅ /components/invest/MonthlyReviewCard.tsx — INV-03
✅ /components/invest/MonthlyReviewSheet.tsx — INV-03 REDESIGN
✅ /components/invest/FIRETeaserCard.tsx — built (V2 — hidden)
✅ /components/invest/InstrumentDiscoverySection.tsx — INV-05
✅ Invest tab copy tightening — all components updated

### Session 11 — Invest Tab Complete + FIRE Foundation
✅ /constants/educationCatalogue.ts — 20 articles, 5 geographies
✅ /components/invest/FinancialEducationSection.tsx — INV-06
✅ /app/(tabs)/invest.tsx — INV-07 full assembly
✅ Invest tab empty state — INV-08
✅ /constants/fireDefaults.ts — FIRE-01 (foundation, V2)
✅ /types/fire.ts — FIRE-01 (foundation, V2)
✅ /app/invest/fire.tsx — NOT BUILT [V2]
✅ FIREProgress removed from /app/(tabs)/index.tsx [V2]
✅ FIRETeaserCard removed from /app/(tabs)/invest.tsx [V2]
✅ Mock data fixes (Employer Pension, March 2026 review)
✅ /app/settings.tsx — stub with Education section

### Session 12 — Complete Data Layer (DL-01 through DL-09)

✅ DL-01: /services/storageService.ts + /services/secureStorageAdapter.ts
   expo-secure-store abstraction, STORAGE_KEYS enum, StorageError
   secureStorageAdapter: Zustand bridge (Option B — separate file)
   Read failures: graceful degradation. Write failures: always re-throw.

✅ DL-02+03: /services/spendCategoriser.ts + /constants/merchantKeywords.ts
   Three-layer pipeline: Layer 3 → Layer 1 → Layer 2
   Layer 3 checked FIRST (user corrections always win)
   categorise() synchronous. categoriseViaAI() never throws.
   applyUserCorrection() pure function. correctionCount >= 5 → promotion log.
   merchantKeywords: NL/IN/EU/GLOBAL geography-aware

✅ DL-04: /services/csvParser.ts
   Papa Parse. Smart field detector. Tier 1/2/3 field model.
   Atomic imports. Hybrid dedup (ref → compound → Dice for Indian banks).
   24 institutions. Google Form fallback. ImportAuditData returned.
   NOTE: imports SpendTransaction as Transaction alias — fix Session 16

✅ DL-05: Five Zustand stores
   spendStore, portfolioStore, insightsStore, householdStore, auditStore
   All use createJSONStorage(() => secureStorageAdapter)
   Derived cache with lastCalculatedAt. auditStore: 100-event FIFO cap.

✅ DL-06: Five hooks
   useSpend, usePortfolio, useInsights, useHousehold, useInstrumentCatalogue
   24h staleness check on mount. Derived cache read from stores.
   NOTE: useInstrumentCatalogue sorts by tier ascending — fix to kasheScore desc in Session 16

✅ DL-07: AI insight engine (five files, 2383 lines)
   /constants/insightSources.ts — seed source registry, PM-curated quarterly
   /constants/insightTriggers.ts — 10 trigger conditions (T1–T10), all pure functions
   /constants/insightPrompts.ts — prompt templates, injection defence, word limits
   /services/holdingsContextBuilder.ts — ISIN→issuer→source mapping
   /services/aiInsightService.ts — orchestration, budget cap, lock, storage

   Key security decisions:
   - Pessimistic accounting: deduct before call, reconcile after
   - Clock manipulation detection: stored monthYear in future → freeze
   - In-memory isGenerating lock: prevents parallel calls
   - Max 3 failures per type per day → pause 24h
   - API key: local to call, never outer scope
   - 12-hour generation windows: A (00:00–11:59) B (12:00–23:59)
   - Max 2 generations per day per user
   - FIRE_TRAJECTORY: returns not_implemented (V2)

✅ DL-08: /services/analyticsService.ts
   PostHog EU cloud. ANALYTICS_ENABLED = false (never enable without review).
   PostHog project 144615. Key: phc_i9rgKR4VVPTBzHUL1jur68kdn7SvXovSOGubxUKHWJz
   13 core events + 4 PM visibility events.
   Anonymous distinct ID via crypto.randomUUID().
   Zero merchant strings in any event.
   NOTE: source_discovered event dropped (not actionable without domain)
   NOTE: injection_detected never sent to analytics (local log only)

✅ TYPE FIXES (committed after DL-08)
   types/portfolio.ts: added isin?: string to PortfolioHolding
   store/insightsStore.ts: confidence now includes 'sentiment_only'

✅ DL-09: UserFinancialProfile + userProfileService (COMMITTED)
   /types/userProfile.ts — UserFinancialProfile interface + vehicle taxonomy
   /services/userProfileService.ts — buildUserFinancialProfile() + helpers
   /store/householdStore.ts — financialProfile field added
   /services/analyticsService.ts — updateUserProperties(profile) + 4 new events
   /constants/insightTriggers.ts — T11 + T12 added, TriggerInput extended
   /constants/insightSources.ts — getActiveSeedSources() takes UserFinancialProfile

   Key architecture decisions:
   - UserFinancialProfile is the central intelligence spine
   - Built by userProfileService, stored in householdStore
   - All downstream consumers read from profile, never re-derive
   - sophisticationScore: 0–100 (never shown to user)
   - sophisticationBand: foundation/building/established/sophisticated
   - Tier hysteresis: 20% below floor before tiering down
   - financialVehicles drives source selection (not re-derived per call)
   - T11: cash pile concentration (tier 2+ + >70% cash + no equity)
   - T12: liquidity concentration (>70% illiquid + <15% stability + <2mo protection)
   - updateUserProfile() called on: addTransactions, addHolding,
     updateHolding, setBucketOverride, setProtection, setRiskProfile,
     onboardingComplete, setMonthlyTarget, setFireInputs

---

## REMAINING BUILD ORDER

```
Session 13  Wire UI to Data Layer + real data stress test
              W-00: DL-09 prompt (if not yet run) — run FIRST
              W-01: Wire useSpend to spend.tsx
              W-02: Wire usePortfolio to portfolio.tsx
              W-03: CSV Upload Flow (CSVUploadSheet, DataSourceConfirmSheet,
                    UploadToast)
              W-04: Probable Duplicate Confirmation UI
              W-05: Wire MonthlyReviewCard to useInsights
              W-06: Wire useInstrumentCatalogue to InstrumentDiscoverySection
              W-07: Wire householdStore to RiskProfileCard
              W-08: Real Data Stress Test (ABN Amro, HDFC, SBI, DeGiro,
                    Aditya Birla, HDFC Demat, partner accounts)
              W-09: Wire UserFinancialProfile to aiInsightService
                    (update holdingsContextBuilder to read from profile)
              W-10: Wire UserFinancialProfile to insightTriggers
                    (pass profile fields into TriggerInput)

Session 14  Onboarding (10 screens + UniversalAddSheet)

Session 15  Sources Screen

Session 16  Settings + Polish
              Full settings screen
              Wire settings route from AppHeader overflow
              Compliance disclaimer on Invest + Education
              "Delete all my data" → storageService.clear()
              AUDIT_STORE key added to STORAGE_KEYS
              Clearbit opt-in toggle
              REQUEST_SUPPORT_URL → real Google Form URL
              SpendTransaction/Transaction alias cleanup
              useInstrumentCatalogue sort: kasheScore desc (not tier asc)
              All 🔴 bug fixes
              Comment pass on data layer (DL-01 through DL-09)

Session 16.5  PM Dashboard + Snapshot Export
              /components/shared/PMDashboard.tsx
                Trigger: 5-second long press on KasheAsterisk in AppHeader
                Always available (no __DEV__ wrapper) for beta device testing
                Shows: analytics signals, source review queue,
                        catalogue review queue, layer1 promotion candidates,
                        bug registry snapshot, session progress
              /services/snapshotService.ts
                Reads from all stores. Builds export JSON. Zero PII.
              /services/shareService.ts
                JSON file + readable summary. Native share sheet.
                feedbackNotes: 500 char free text from tester.
              PostHog dashboards setup (4 dashboards, manual in PostHog UI):
                Dashboard 1: Spend Accuracy
                Dashboard 2: Insight Quality
                Dashboard 3: Catalogue Discovery
                Dashboard 4: CSV Health
              Weekly PM workflow: 20 min Monday, one change max

Session 17  QA + Native Build Prep

--- YOUR OWN TESTING ---
--- 10 FRIENDS BETA ---
--- INVESTOR READY ---
```

---

## PENDING: ANALYTICS ENABLE CHECKLIST

Before flipping ANALYTICS_ENABLED = true:
- [ ] DL-09 committed and verified (UserFinancialProfile live)
- [ ] updateUserProperties() called on first app open
- [ ] All 17 events verified with correct property names
- [ ] PostHog project 144615 confirmed active (eu.posthog.com)
- [ ] 4 PostHog dashboards created manually
- [ ] Set per-tester API key spend limits in Anthropic console
- [ ] Privacy policy updated with PostHog disclosure
- [ ] Clearbit disclosure in privacy policy

---

## DATA LAYER ARCHITECTURE — LOCKED (20 March 2026)

### The intelligence chain (non-negotiable)
```
Raw data (CSV / manual) → Store → UserFinancialProfile → Intelligence layer
                                                        → Analytics
                                                        → Insight engine
                                                        → Source selector
                                                        → Trigger evaluator
```

### The UI chain (non-negotiable)
```
Service → Store → Hook → Component
Components never import services. Ever.
```

### Storage rules
```
ALL persistent data: expo-secure-store
ALL storage access: /services/storageService.ts only
Zustand persistence: secureStorageAdapter (createJSONStorage)
AsyncStorage: NEVER used directly — anywhere
Raw SecureStore calls: ONLY in services/storageService.ts
```

### UserFinancialProfile — LOCKED (20 March 2026)
```
Single source of truth for all financial intelligence.
Built by: /services/userProfileService.ts
Stored in: householdStore.financialProfile
Staleness: 24 hours (same as all derived caches)

What it drives:
  - Portfolio tier (1–4) with hysteresis
  - Sophistication score (0–100) and band
  - financialVehicles[] → source activation
  - Precomputed trigger inputs (no re-derivation)
  - Geographic + currency exposure (percentages only)
  - All PostHog user properties (single updateUserProperties call)

What it NEVER contains:
  - Absolute monetary values
  - Raw transaction data
  - Account numbers or identifiers
  - Anything sent directly to Claude
```

### Caching model — LOCKED (19 March 2026)
```
Option A locked: derived values cached in stores with
lastCalculatedAt timestamp. Hooks check staleness on mount.

Home screen
  Cache: portfolioStore.derivedHome
  Staleness: 24 hours
  Invalidation: new upload, asset edit, bucket override

Spend screen
  Cache: spendStore.derivedSpend
  Staleness: 24 hours (time-based)
  Invalidation: addTransactions(), recategorise(), setSelectedMonth()
  Month caching: one month at a time

Portfolio screen
  Cache: portfolioStore.derivedPortfolio
  Staleness: 24 hours
  Invalidation: asset add/edit, bucket override, price update

Insights
  Cache: insightsStore per insight type
  MARKET_EVENT_ALERT: expires 24h after generatedAt
  PORTFOLIO_HEALTH: expires on holdings change event
  INVESTMENT_OPPORTUNITY: expires on investment_transfer change
  MONTHLY_REVIEW: expires midnight 1st of next month
  Generation windows: A (00:00–11:59) B (12:00–23:59)
  Max 2 generations per day per user

UserFinancialProfile
  Cache: householdStore.financialProfile
  Staleness: 24 hours
  Invalidation: addTransactions, addHolding, updateHolding,
                setBucketOverride, setProtection, setRiskProfile,
                onboardingComplete, setMonthlyTarget, setFireInputs
```

### Retry queue — LOCKED (19 March 2026)
```
Per upload batch cap: 20 Layer 2 calls maximum
Daily drain cap: 30 Layer 2 calls per day
Per transaction retry limit: 3 attempts (DEC-08)
  After 3 failures: category = 'other', confidence = 0.3
Budget gate: always check isWithinBudget() before any call
```

### Merchant enrichment — LOCKED (19 March 2026)
```
Option C (Clearbit) → Option A (Claude API) fallback
Clearbit: merchant name ONLY — zero user context
Opt-in in V1 Settings — not on by default
Privacy policy must disclose before beta
Enrichment only runs for Layer 1 misses
Never called for transactions already matched in Layer 1
```

### CSV parsing — LOCKED (19 March 2026)
```
Papa Parse for mechanical parsing (never custom tokeniser)
Smart field detector — scores columns, assigns field types
Post-parse confidence scoring (not pre-parse prediction)
Atomic import — all-or-nothing (ATOMIC_ROLLBACK on failure)
24 institutions (NL/EU/IN/UK/US + UNKNOWN fallback)
Hybrid dedup: referenceId → compound key → Dice (Indian banks)
Probable duplicates → user confirmation, never silent skip
```

---

## AI INSIGHT ENGINE ARCHITECTURE — LOCKED (20 March 2026)

### Five files (all committed Session 12)
```
/constants/insightSources.ts      Seed sources, PM-curated quarterly
/constants/insightTriggers.ts     12 trigger conditions (T1–T12), pure functions
/constants/insightPrompts.ts      Prompt templates, injection defence
/services/holdingsContextBuilder.ts  ISIN/ticker → issuer → source mapping
/services/aiInsightService.ts     Orchestration, budget, lock, storage
```

### Portfolio tier → search depth
```
Tier 1: 3 sources, seed only, no discovery pass
Tier 2: 6 sources, discovery pass runs
Tier 3: 10 sources, full tiered system
Tier 4: 14 sources, full + instrument-class routing
```

### Sophistication score → insight framing
```
foundation (0–25):   PORTFOLIO_HEALTH always priority, basics first
building (26–50):    Standard priority order
established (51–75): Full suite, standard depth
sophisticated (76+): Full suite, richest context, best sources
```

### Trigger conditions (T1–T12)
```
T1:  Growth bucket >10% below risk profile target
T2:  Single holding >15% of live portfolio
T3:  Employer stock >15% of live portfolio
T4:  No protection designation + cash holdings exist
T5:  Monthly invested < target × 0.8
T6:  INR weakened >3% vs EUR in rolling 90 days + India >20%
T7:  Vesting event within 30 days
T8:  Employer stock >10% AND salary from same employer
T9:  Locked >40% AND protection coverage <3 months
T10: Stability >30% + bond exposure + rising rate environment
T11: Portfolio tier 2+ AND >70% cash-like AND no equity (NEW)
T12: Illiquid/speculative >70% AND stability <15% AND protection <2mo (NEW)
```

### financialVehicles → source activation (LOCKED)
```
eu_etf / index_fund        → justETF, Curvo, Euronext, Vanguard/iShares IR
in_mutual_fund             → AMFI, fund house IR, ValueResearch, Freefincal
employer_rsu / espp        → SEC EDGAR, company IR, Glassdoor
ppf / epf / govt_savings   → Ministry of Finance, EPFO, RBI small savings
nre_account / nro_account  → RBI FEMA, SEBI NRI guidelines, SBNRI
pension_scheme             → DNB, pension fund pages, Pensioenfederatie
direct_equity              → NSE/BSE + company IR via ISIN/ticker
crypto_spot                → CoinDesk, The Block, Decrypt (track-only)
bond_etf / bond_fund       → ECB, RBI rate decision sources
```

### Budget cap
```
FREE_MONTHLY_LIMIT:   10,000 input tokens
PAID_MONTHLY_LIMIT:  100,000 input tokens
BUDGET_CAP_BUFFER:    0.90 (stop at 90%)
Pessimistic accounting: deduct before call, reconcile after
Clock manipulation: stored monthYear in future → freeze (don't reset)
```

---

## ANALYTICS ARCHITECTURE — LOCKED (20 March 2026)

### PostHog project
```
Host: eu.posthog.com (EU data residency)
Project ID: 144615
Key: phc_i9rgKR4VVPTBzHUL1jur68kdn7SvXovSOGubxUKHWJz
     (write-only client key — safe in app code)
ANALYTICS_ENABLED = false — PM reviews before enabling
```

### User properties (all derived from UserFinancialProfile)
```
Device: os_platform, app_version
Geography: primary_geography, secondary_geographies[], is_nri_profile
Tier: portfolio_tier, portfolio_tier_label, tier_change_direction
Sophistication: sophistication_score, sophistication_band
Vehicles: financial_vehicles[] (PostHog array — filterable)
Behaviour: investment_style, investing_frequency, savings_rate_band
Data: data_months_spend, data_months_portfolio, institutions_connected,
      has_spend_source, has_portfolio_source, has_indian_source,
      has_european_source, has_investment_platform, has_salary_slip,
      import_freshness, import_count_lifetime
Engagement: onboarding_complete, risk_profile_actively_set,
            protection_designated, ai_insights_enabled,
            monthly_review_count, budgets_configured,
            monthly_target_set, fire_is_set_up
Household: household_type, managed_profile_count, has_mortgage
Tenure: first_seen_date, skipped_age_screen
```

### Events (17 total)
```
Loop 1 — Catalogue:
  instrument_tapped, instrument_added, instrument_skipped

Loop 2 — Spend accuracy:
  category_correction, layer1_promotion_candidate

Loop 3 — Insight quality:
  insight_viewed, insight_actioned, insight_dismissed,
  insight_generation_result, monthly_review_opened,
  monthly_review_section_read

Loop 4 — CSV + data:
  csv_uploaded

PM visibility:
  portfolio_tier_changed, milestone_reached, pm_snapshot_exported

General:
  screen_viewed, risk_profile_set, app_opened
```

### PM weekly workflow
```
Every Monday — 20 minutes:
1. PostHog — 4 metrics (insight dismiss rate, correction rate,
   catalogue skip rate, parse confidence)
2. Snapshot exports — review pending sources + parser failures
3. One change maximum per week
4. Commit: "Analytics-driven: [what] from [signal]"
```

---

## KNOWN BUG REGISTRY (updated 20 March 2026)

### 🔴 Fix before beta
1.  Hero number wrapping in PortfolioTotalsCard
2.  GROWTH total may be inflated (mock data arithmetic)
3.  Dutch brand names in Spend mock data
4.  "For information only. Not financial advice." missing on Invest tab
5.  REQUEST_SUPPORT_URL needs real Google Form URL
6.  Clearbit opt-in toggle missing from Settings
7.  SpendTransaction vs Transaction alias — align in Session 16
8.  Compliance footer on Invest tab missing

### 🟡 Polish — Session 16
9.  Chart spike at end of 1M view in HoldingPriceChart
10. KasheAsterisk k-stroke weight prominence
11. Vertical MacronRule in TotalsCard as plain View not MacronRule
12. TextInput monthly target not going through currency formatter
13. Category detail screen layout gap
14. HomeHeader + SpendScreenHeader showGreeting prop mismatch
15. _layout.tsx @expo/vector-icons types missing
16. [holdingId].tsx MacronRule style array mismatch
17. BucketReassignSheet assetType vs assetSubtype typo
18. useInstrumentCatalogue sorts by tier asc — fix to kasheScore desc
19. Comment pass on data layer (DL-01 through DL-09)

### 🟢 Deferred by design
20. Dark mode device verification — Session 17
21. react-native-reanimated — Session 17 (native build only)
22. Settings route wiring — Session 16
23. FIRE planner screen — V2
24. AUDIT_STORE key in STORAGE_KEYS — Session 16
25. Price chart mock data — Session 13 wiring
26. V1 → V2 data migration strategy — pre-V2 planning
27. PARTNER profile type — V2 (requires Supabase couple sync)
28. holdingsContextBuilder wiring to UserFinancialProfile — Session 13 (W-09)
29. insightTriggers wiring to UserFinancialProfile — Session 13 (W-10)
30. ANALYTICS_ENABLED flip to true — after beta checklist complete

### 🔵 Pre-beta strategic decisions needed
31. AI API key UX post-beta (BYOK locked for beta)
32. GDPR data export flow — Session 16
33. Clearbit enrichment disclosure in privacy policy
34. Merchant enrichment opt-in UI in Settings
35. Set per-tester API key spend limits in Anthropic console (~€6/tester)
36. PostHog 4 dashboards setup manually before beta
37. Unit tests: insightTriggers, csvParser, spendCategoriser,
    holdingsContextBuilder, userProfileService — Session 16
38. Integration tests: CSV pipeline, budget cap, categoriser — Session 16

---

## INSTRUMENT CATALOGUE ARCHITECTURE (LOCKED)

```
/constants/instrumentCatalogue.ts — seed + offline fallback
~40 entries across NL/BE/DE/LU, India, US, UK, GLOBAL

Three concepts:
  RegulatoryRegime — legal framework
  AccountWrapper — tax structure
  InstrumentType — what it is

CatalogueRole:
  suggest      → InstrumentDiscoverySection
  track_only   → portfolio only, NEVER suggested
  educational  → FinancialEducationSection only

TRACK_ONLY forever:
  equity_crowdfunding, angel_investment, venture_fund,
  private_equity, nft, stock_options, futures,
  structured_product, employer_rsu, employer_espp, crypto_spot

KasheScore: 0–100, objective, never shown to user
  Components: cost(25) + diversification(25) + liquidity(20)
              + regulatory(15) + track record(15)

V1: /constants/instrumentCatalogue.ts — static, offline
V2: Supabase instrument_catalogue table (identical schema)
```

---

## EDUCATION CATALOGUE ARCHITECTURE (LOCKED)

```
/constants/educationCatalogue.ts — 20 articles, 5 geographies

Filtering (getEducationArticles):
  1. Geography: GLOBAL always + geography-specific
  2. Tier: never show below user's derived tier
  3. excludeIfHoldingTypes: don't show what user already holds

V1: /app/settings.tsx only
V2: Contextual inline tooltips
```

---

## SPEND CATEGORISATION (LOCKED)

```
Layer 1 → keyword rules (fast, free, offline) — confidence 1.0
  Check merchantOverrides FIRST (user always wins)
  Then MERCHANT_KEYWORDS by geography
  Then GLOBAL fallback

Layer 2 → Claude API enrichment (unrecognised only) — confidence 0.8
  Option C: Clearbit merchant lookup first (opt-in, name only)
  Option A: Claude haiku fallback if Clearbit misses
  Retry queue: 20/upload cap, 30/day drain, 3 attempt limit
  Budget gated: always check isWithinBudget() first

Layer 3 → user correction — confidence 1.0
  Back-applies to ALL past transactions from same merchantNorm
  correctionCount >= 5 → Layer 1 promotion candidate logged
```

---

## FIRE ENGINE (V2 — LOCKED)

```
FIRE is entirely V2. No FIRE UI exists in V1.

Foundation files (built, do not delete):
  /constants/fireDefaults.ts — country inflation rates, SWR
  /types/fire.ts — FIREInputs, FIREOutputs, FIREAssumptions
  /components/invest/FIRETeaserCard.tsx — built, not rendered

Not built (V2):
  /app/invest/fire.tsx

Removed from V1 screens:
  FIREProgress — removed from index.tsx
  FIRETeaserCard — removed from invest.tsx

fireIsSetUp in UserFinancialProfile:
  true if FIRE inputs have been entered (affects monthly review)
  No FIRE insight generation in V1. FIRE_TRAJECTORY returns not_implemented.
```

---

## LOCKED DECISIONS (do not re-debate)

### Product
- Four tabs: Home/Spend/Portfolio/Invest. No Insights tab.
- Universal AppHeader all tabs. No inline headers.
- Risk profile: RECOMMEND Balanced. Never silently assume.
- Catalogue: three concepts. Every type ends other|unknown.
- KasheScore: objective, quarterly, never shown as number.
- Sophistication score: objective, never shown as number.
- track_only never suggested. Ever.
- Living database: V1 static → V2 Supabase (one hook change).
- Spend: Layer 1 → Layer 2 → Layer 3 pipeline.
- Monthly Review: executive brief format.
- FIRE: entirely V2. No FIRE UI in V1. Foundation types built.
- FIRE copy: "How close are you to financial independence?"
- Empty state: 0.5 opacity ghost + floating accent pill. NOT blur.
- Education: settings.tsx in V1. Contextual tooltips in V2.
- Compliance: "For information only. Not financial advice."
- "Your Position" not "Net Worth" — everywhere, always.
- UserFinancialProfile: single source of truth for all intelligence.

### Storage + Security
- Storage: expo-secure-store only. No AsyncStorage directly.
- All storage: through storageService.ts. No raw SecureStore.
- secureStorageAdapter: separate file from storageService.
- Encryption: hardware-backed V1, E2E V2.
- Security pipeline: runs BEFORE storage. Always.
- Raw files: never persisted. Parse → sanitise → store → discard.
- Write failures: always propagate. Never swallowed.

### Data
- Multi-currency: store original + converted both.
- Duplicates: deduplicate + report count.
- Partial imports: never. Atomic or nothing.
- Joint accounts: ownership: 'joint', shown once in household view.
- Audit log: every import logged at profile level.

### AI + Analytics
- AI budget cap: soft banner when hit. No hard paywall.
- PostHog: built disabled. ANALYTICS_ENABLED = false.
- Raw transactions: NEVER sent to Claude API.
- Clearbit: merchant name only. Zero user context.
- Enrichment: opt-in. Not on by default.
- 12-hour generation windows. Max 2 per day.
- UserFinancialProfile: never sent to Claude directly.
- updateUserProperties(profile): single call for all PostHog properties.
- injection_detected: never sent to analytics.

---

## CRITICAL RULES — QUICK REFERENCE

1.  --legacy-peer-deps every npm install
2.  Never react-native-reanimated (web builds)
3.  const theme = useTheme() — never destructured
4.  theme.* surface/border/text. colours.* static tokens.
5.  StyleSheet.create() always. No inline styles.
6.  formatCurrency() always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero any.
9.  Space Grotesk numbers/display. Inter body/UI.
10. Hero card always dark. Hero tokens inside only.
11. Standard card: theme.surface, borderRadius 16, no border.
12. Screen layout: paddingH 20, paddingTop 16, paddingBottom 48.
13. Universal AppHeader — never inline header code.
14. Empty state = 0.5 opacity ghost + floating accent pill.
15. Every commit = code + updated MD files together.
16. Git always manually. MD files replaced in full.
17. Never show raw subtype keys — use displayLabels.ts.
18. Tab 4 is Invest. No Insights tab.
19. Risk profile drives allocation. Never hardcoded.
20. "Worth exploring" always. Never buy/sell. No affiliate links.
21. track_only never suggested. Ever.
22. KasheScore drives ordering — objective, never behaviour-based.
23. Spend: Layer 3 → Layer 1 → Layer 2.
24. RECOMMEND Balanced — never silently assume.
25. Monthly Review: executive brief. Never text document.
26. FIRE: V2 only. No FIRE UI anywhere in V1.
27. FIRE copy: "How close are you to financial independence?"
28. Invest copy: visuals first. No verbose paragraphs.
29. KasheAsterisk punctuates AI-generated insights.
30. MacronRule between major sections: marginTop 24.
31. Detail screens: light bg, dark hero at top.
32. Storage: expo-secure-store only. Never AsyncStorage directly.
33. All storage: through storageService.ts only.
34. Compliance: "For information only. Not financial advice."
35. Raw transactions: NEVER to Claude API. Aggregated only.
36. Atomic imports: all-or-nothing. No partial state.
37. Audit log: every import. Never wiped except "delete all data".
38. Clearbit: merchant name only. Zero user context. Opt-in.
39. Joint accounts: ownership: 'joint'. One import per household.
40. ANALYTICS_ENABLED = false until PM reviews.
41. UserFinancialProfile: single intelligence spine. Never re-derive inline.
42. Sophistication score: never shown as number. Drives depth, not gates.
43. financialVehicles[]: drives source selection. Must be current.
44. updateUserProfile() called on every data change event.
45. Portfolio tier hysteresis: 20% below floor before tiering down.
