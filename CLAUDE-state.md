# Kāshe — CLAUDE-state.md
*Current build state. Read this before any new session.*
*Last updated: 19 March 2026 — Session 12 partial complete.
DL-01 through DL-05 committed. DL-06, DL-07, DL-08 remaining.
Major data layer decisions locked. Caching model locked.
CSV parser architecture overhauled. Audit log added.*

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

### Session 12 — Data Layer (partial — DL-01 through DL-05)

✅ DL-01: /services/storageService.ts
   expo-secure-store abstraction, single vault door
   STORAGE_KEYS enum, StorageError class
   get / set / delete / clear — all async, all typed
   DEC-06: write failures always propagate, never swallowed

✅ DL-01: /services/secureStorageAdapter.ts
   Zustand StateStorage bridge to storageService
   Option B architecture: separate from storageService
   Read failures: graceful degradation (return null)
   Write failures: re-throw (critical per DEC-06)

✅ DL-02: /services/spendCategoriser.ts
   Three-layer pipeline: Layer 3 → Layer 1 → Layer 2
   normaliseMerchant() — 5-step normalisation
   categorise() — synchronous, Layer 3 first (DEC-01)
   categoriseViaAI() — async, never throws, haiku model
   applyUserCorrection() — pure, returns new overrides array
   Layer 1 promotion logging at correctionCount >= 5

✅ DL-03: /constants/merchantKeywords.ts
   Geography-aware: NL / IN / EU / GLOBAL
   NL: Dutch transit, supermarkets, utilities, delivery
   IN: Food apps, investment platforms, payment apps
   EU/GLOBAL: Universal merchants, streaming, travel

✅ DL-04: /services/csvParser.ts
   Papa Parse for mechanical CSV reading
   Smart field detector — scores columns by type
   Tier 1 (blocking): date, amount, debit/credit direction
   Tier 2 (fallback OK): currency, description, merchant
   Tier 3 (nice to have): reference, geography, isRecurring
   Post-parse confidence scoring — not pre-parse prediction
   24 supported institutions across NL/BE/IN/EU/UK/US
   Atomic imports — all-or-nothing, ATOMIC_ROLLBACK on failure
   Security pipeline: account numbers, IBANs, BSN, PAN, Aadhaar
   Hybrid deduplication:
     Priority 1: transaction ID (where available)
     Priority 2: compound key (date + amount + desc slice)
     Priority 3: fuzzy Dice coefficient for Indian banks
   Probable duplicates flagged for user confirmation (not silent)
   ParseConfidence returned with every result
   ImportAuditData returned with every ParseSuccess
   Google Form fallback for unrecognised formats
   REQUEST_SUPPORT_URL constant (replace before beta)

✅ DL-05: /store/spendStore.ts
   Zustand + persist via secureStorageAdapter
   addTransactions: runs Layer 1 immediately on import
   Layer 2 misses queued in retryQueue[]
   recategorise: fan-out to all transactions same merchantNorm
   Derived cache: spendByCategory, totalSpend, comparisons
   lastCalculatedAt: null = never calculated (DEC-07)
   Invalidated on: addTransactions, recategorise, setSelectedMonth

✅ DL-05: /store/portfolioStore.ts
   Holdings, bucket overrides, protection designation
   BucketOverride + PortfolioDerived types
   Derived cache: liveTotal, lockedTotal, financialPosition,
     allocationByBucket, allocationByGeography, protection
   lastCalculatedAt invalidated on all mutations

✅ DL-05: /store/insightsStore.ts
   Insight + MonthlyReview + AIUsageRecord types
   Monthly token rollover in logAPIUsage
   Last 12 reviews trimmed automatically
   lastInsightCheck for API call throttling

✅ DL-05: /store/householdStore.ts
   Profile + Household + RiskProfileType types
   Default riskProfile: 'balanced' (RECOMMEND Balanced locked)
   onboardingComplete flag

✅ DL-05: /store/auditStore.ts
   ImportAuditEvent type — profile-level audit log
   100-event cap, FIFO eviction
   clearAuditLog() for "delete all data" flow only

---

## REMAINING — SESSION 12

⬜ DL-06: Hooks
   /hooks/useSpend.ts
   /hooks/usePortfolio.ts
   /hooks/useInsights.ts
   /hooks/useHousehold.ts
   /hooks/useInstrumentCatalogue.ts

⬜ DL-07: /services/aiInsightService.ts
   Budget cap, privacy rules, caching
   Option C (Clearbit) → Option A (Claude) enrichment fallback
   Retry queue batch cap: 20 per upload, 30 per day

⬜ DL-08: /services/analyticsService.ts
   PostHog, ANALYTICS_ENABLED = false
   Pending Anand review before enabling

---

## REMAINING BUILD ORDER

```
Session 12  Data Layer (3 tickets remaining)
              DL-06: Hooks
              DL-07: aiInsightService
              DL-08: analyticsService (PostHog, disabled)

Session 13  Wire UI to Data Layer
              Replace all mock data with live store data
              CSV upload flow end to end
              Real data stress test:
                - Anand's ABN Amro (personal)
                - Anand's ABN Amro (joint with partner)
                - Anand's HDFC Bank (personal)
                - Anand's HDFC Bank (joint with partner)
                - Anand's HDFC Demat/Securities
                - Anand's SBI account
                - Anand's DeGiro portfolio
                - Anand's Aditya Birla Capital (MF)
                - Partner's accounts
              Joint account ownership attribution flow
              Probable duplicate confirmation UI
              DataSource confirmation screen
              Post-upload toast (4 confirmations)

Session 14  Onboarding (10 screens + UniversalAddSheet)

Session 15  Sources Screen

Session 16  Settings + Polish
              Full settings screen
              Wire settings route from AppHeader overflow
              Compliance disclaimer on Invest + Education
              "Delete all my data" → storageService.clear()
              AUDIT_STORE key added to STORAGE_KEYS
              All 🔴 bug fixes

Session 17  QA + Native Build Prep

--- YOUR OWN TESTING ---
--- 10 FRIENDS BETA ---
--- INVESTOR READY ---
```

---

## DATA LAYER ARCHITECTURE — LOCKED (19 March 2026)

### The chain (non-negotiable)
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

### Caching model — LOCKED (19 March 2026)

Option A locked: derived values cached in stores with
lastCalculatedAt timestamp. Hooks check staleness on mount.

```
Home screen
  Cache: portfolioStore.derivedHome
  Staleness: 24 hours
  Invalidation: new upload, asset edit, bucket override

Spend screen
  Cache: spendStore.derivedSpend
  Staleness: 24 hours (time-based)
  Invalidation (event-based, immediate):
    addTransactions(), recategorise(), setSelectedMonth()
  Month caching: one month at a time
    Month switch = cache miss = immediate recalculation

Portfolio screen
  Cache: portfolioStore.derivedPortfolio
  Staleness: 24 hours
  Invalidation: asset add/edit, bucket override, price update

Insights screen
  Cache: insightsStore per insight type
  MARKET_EVENT_ALERT: expires 24h after generatedAt
  PORTFOLIO_HEALTH: expires on holdings change event
  INVESTMENT_OPPORTUNITY: expires on investment_transfer change
  MONTHLY_REVIEW: expires midnight 1st of next month
  One Claude call per app open maximum (lazy generation)
  Minimum 1 hour between calls for same insight type
```

### Retry queue — LOCKED (19 March 2026)
```
Per upload batch cap: 20 Layer 2 calls maximum
  Prioritisation: shortest/simplest merchant names first
Daily drain cap: 30 Layer 2 calls per day
  Runs on first app open of each day
  Processes oldest items first
Per transaction retry limit: 3 attempts (DEC-08)
  After 3 failures: category = 'other', confidence = 0.3
Budget gate: always check isWithinBudget() before any call
  Over budget: pause queue entirely
```

### Merchant enrichment — LOCKED (19 March 2026)
```
Option C (Clearbit) → Option A (Claude API) fallback

Clearbit call rules:
  Merchant name ONLY — zero user context
  No user ID, no amount, no date, no transaction data
  Completely anonymous request
  Opt-in in V1 Settings — not on by default
  Privacy policy must disclose before beta

Enrichment only runs for Layer 1 misses (confidence = 0.0)
Never called for transactions already matched in Layer 1
Background queue — never blocks upload UI
Progressive UI updates as enrichment completes
```

### CSV parsing — LOCKED (19 March 2026)
```
Papa Parse for mechanical parsing (never custom tokeniser)
Smart field detector — scores columns, assigns field types
Post-parse confidence scoring (not pre-parse prediction)

Field tiers:
  Tier 1 (blocking if missing): date, amount, debit/credit
  Tier 2 (fallback OK): currency, description, merchant
  Tier 3 (always has fallback): reference, geography

Atomic imports: all-or-nothing, never partial state
  On any failure mid-import: ATOMIC_ROLLBACK
  User sees error, asked to re-upload

Deduplication key hierarchy:
  1. Transaction ID (where present in CSV)
  2. Compound key: date + amount + desc.slice(0,20) normalised
  3. Fuzzy Dice coefficient (Indian banks, >0.8 similarity)
     → probableDuplicates[] for user confirmation
     → never silently skipped

Supported institutions (24):
  NL: ABN_AMRO, ING_NL, RABOBANK, BUNQ, SNS_BANK, N26
  EU/Digital: REVOLUT, WISE
  Investment: DEGIRO, IBKR
  IN: HDFC_BANK, HDFC_SECURITIES, ICICI_BANK, SBI,
      AXIS_BANK, KOTAK, ADITYA_BIRLA, ZERODHA, GROWW
  UK: BARCLAYS, HSBC, MONZO
  US: CHASE, SCHWAB
  Fallback: UNKNOWN

Unrecognised format:
  Show REQUEST_SUPPORT_URL (Google Form)
  User submits bank name + country
  PM prioritises new parsers from form data
```

### Atomic import guarantee — LOCKED (19 March 2026)
```
Partial imports are never supported.
If import fails mid-way: entire batch rolled back.
User shown clear error + re-upload request.
spendStore.addTransactions() is all-or-nothing.
```

### Import audit log — LOCKED (19 March 2026)
```
Every import logged in auditStore at profile level.
ImportAuditEvent fields:
  id, profileId, householdId, timestamp
  institution, transactionCount, duplicatesSkipped
  probableDuplicatesFound, layer2Queued
  parseConfidence, status, errorCode?
Last 100 events retained. FIFO eviction.
Never wiped except on "delete all data".
auditStore.clearAuditLog() called only in that flow.
```

### Joint accounts — LOCKED (19 March 2026)
```
Anand + partner have joint accounts at ABN Amro and HDFC.
Session 13 will test joint account import end to end.

DataSource.accountType: 'personal' | 'joint' | 'managed'
  Set during DataSource confirmation screen (Session 13)
  "Is this a joint account?" shown for every new import

Transaction.ownership: 'personal' | 'joint' | 'split'
  Joint account imports default to ownership: 'joint'

Household view: joint transactions shown once, not twice
Individual view: personal + joint for that profile
Split ratio: splitRatio + splitWithProfileId on Transaction

Deduplication cross-profile:
  Same joint account appearing in both exports:
  Compound key catches exact matches
  Fuzzy matching catches format variations
```

---

## SESSION 12 DECISIONS — ALL LOCKED

### Architecture decisions
```
DEC-A1: secureStorageAdapter separate from storageService
  (Option B) — single responsibility, easier V2 swap

DEC-A2: Derived cache in stores (Option A)
  Not recalculated in hooks every time
  lastCalculatedAt: null = never, ISO string = timestamp

DEC-A3: One month at a time for Spend cache
  Month switch = cache miss = recalculate immediately
  Not last 3 months simultaneously (V1 simplicity)

DEC-A4: One Claude call per app open for insights
  Lazy generation — highest priority stale insight only
  1 hour minimum between calls for same insight type
```

### CSV parser decisions
```
DEC-C1: Papa Parse for mechanical parsing (not custom)
DEC-C2: Smart field detector (not institution-specific hardcode)
DEC-C3: Post-parse confidence scoring
DEC-C4: Tier 1/2/3 field model
DEC-C5: Atomic imports — no partial state ever
DEC-C6: Hybrid deduplication key (ID → compound → fuzzy)
DEC-C7: Probable duplicates for user confirmation (Indian banks)
DEC-C8: Google Form for unrecognised institution requests
```

### Merchant enrichment decisions
```
DEC-M1: Option C (Clearbit) → Option A (Claude) fallback
DEC-M2: Clearbit receives merchant name only — zero user data
DEC-M3: Enrichment opt-in in Settings (not on by default)
DEC-M4: Background queue, progressive UI updates
DEC-M5: Enrichment only for Layer 1 misses
DEC-M6: 20 per upload batch cap, 30 per day drain cap
```

### Security decisions
```
DEC-S1: Hardware-backed encryption (iOS Keychain / Android Keystore)
DEC-S2: V2 adds E2E encryption: key = hash(OAuth token + device ID)
DEC-S3: Security pipeline runs BEFORE storage (never after)
DEC-S4: Raw files never persisted — parse → sanitise → store → discard
DEC-S5: Audit log retained even through data migration
```

### Beta/API key decisions
```
DEC-B1: BYOK model for V1 beta (bring your own key)
DEC-B2: One API key per beta tester — not one shared key
DEC-B3: PM (Anand) funds beta API usage (target: €50 total)
DEC-B4: Clearbit enrichment opt-in — not on by default
DEC-B5: ANALYTICS_ENABLED = false until Anand reviews events
```

---

## KNOWN BUG REGISTRY

### 🔴 Fix before beta
1. Hero number wrapping in PortfolioTotalsCard — Session 16
2. GROWTH total may be inflated — verify in Session 13
3. Dutch brand names in Spend mock data — replaced in Session 13
4. "For information only. Not financial advice." disclaimer missing
   from Invest tab and Education section
5. REQUEST_SUPPORT_URL needs real Google Form URL
6. Clearbit opt-in toggle missing from Settings
7. SpendTransaction vs Transaction alias — align type name
   across codebase (csvParser imports as SpendTransaction)
8. Compliance footer on Invest tab — Session 16

### 🟡 Fix in Session 16 (Polish)
9.  Chart spike at end of 1M view
10. KasheAsterisk k-stroke prominence
11. Vertical MacronRule in TotalsCard
12. TextInput monthly target not currency-formatted
13. Category detail screen gap
14. HomeHeader + SpendScreenHeader: showGreeting prop
    removed from AppHeader in Session 07 — not updated
15. _layout.tsx: @expo/vector-icons type declarations missing
16. [holdingId].tsx: MacronRule style array type mismatch
17. BucketReassignSheet: assetType vs assetSubtype typo

### 🟢 Deferred by design
18. Dark mode device verification — Session 17
19. react-native-reanimated — Session 17
20. Settings route wiring — Session 16
21. FIRE planner screen — V2
22. AUDIT_STORE key in STORAGE_KEYS — Session 16
    (currently uses SPEND_STORE + '_audit' suffix)
23. Price chart mock data — Session 13 wiring
24. V1 → V2 data migration strategy — pre-V2 planning
25. PARTNER profile type — V2 (requires Supabase couple sync)

### 🔵 Pre-beta strategic decisions needed
26. AI API key UX — BYOK locked for beta (DEC-B1/B2)
    Post-beta: proxy backend or bundled key evaluation needed
27. GDPR data export flow — "Delete all my data" in Session 16
28. Clearbit enrichment disclosure in privacy policy
29. Merchant enrichment opt-in UI in Settings

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
    Realtime pushes, Edge Function TER auto-flag weekly
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
V2: Contextual inline tooltips (Schwab pattern)
```

---

## SPEND CATEGORISATION (LOCKED)

```
Layer 1 → keyword rules (fast, free, offline) — confidence 1.0
  Check merchantOverrides FIRST (DEC-01 — user always wins)
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
  5+ corrections → Supabase merchant_keywords update (V2)
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

FIRE copy: "How close are you to financial independence?"
NEVER: "choose not to work", "stop working", "retire early"

FIRE inflation (country-based, from fireDefaults.ts):
  NL: 3.0%  IN: 5.0%  GB/US: 3.0%  DE/FR: 2.5%
  BE: 3.0%  OTHER: 3.5%

FIRE scope: Household default, Individual toggle
  PARTNER profile: V2 only
```

---

## LOCKED DECISIONS (do not re-debate)

### Product
- Four tabs: Home/Spend/Portfolio/Invest. No Insights tab.
- Universal AppHeader all tabs. No inline headers.
- Risk profile: RECOMMEND Balanced. Never silently assume.
- Catalogue: three concepts. Every type ends other|unknown.
- KasheScore: objective, quarterly, never shown as number.
- track_only never suggested. Ever.
- Living database: V1 static → V2 Supabase (one hook change).
- Spend: Layer 1 → Layer 2 → Layer 3 pipeline.
- Monthly Review: executive brief format. System-responsive mode.
- FIRE: entirely V2. No FIRE UI in V1. Foundation types built.
- FIRE copy: "How close are you to financial independence?"
- Empty state: 0.5 opacity ghost + floating accent pill. NOT blur.
- Education: settings.tsx in V1. Contextual tooltips in V2.
- Compliance: "For information only. Not financial advice."
  on Invest tab and settings Education section before beta.
- "Your Position" not "Net Worth" — everywhere, always.

### Storage + Security
- Storage: expo-secure-store only. No AsyncStorage directly.
- All storage: through storageService.ts. No raw SecureStore.
- secureStorageAdapter: separate file from storageService.
- Encryption: hardware-backed V1, E2E V2.
- Security pipeline: runs BEFORE storage. Always.
- Raw files: never persisted. Parse → sanitise → store → discard.
- Write failures: always propagate. Never swallowed (DEC-06).

### Data
- Multi-currency: store original + converted both (DEC-04).
- Duplicates: deduplicate + report count (DEC-05).
- Partial imports: never. Atomic or nothing (DEC-C5).
- Joint accounts: ownership: 'joint', shown once in household view.
- Audit log: every import logged at profile level.

### AI + Analytics
- AI budget cap: soft banner when hit. No hard paywall (DEC-03).
- PostHog: built disabled. ANALYTICS_ENABLED = false (DEC-09).
- Raw transactions: NEVER sent to Claude API.
- Clearbit: merchant name only. Zero user context.
- Enrichment: opt-in. Not on by default.
- One Claude call per app open maximum.

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
23. Spend: Layer 1 → Layer 2 → Layer 3.
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
40. ANALYTICS_ENABLED = false until Anand reviews events.
