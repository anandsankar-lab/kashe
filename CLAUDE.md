# Kāshe — CLAUDE.md
*Read this before starting any task in this project.*
*Last updated: 19 March 2026 — Session 12 partial complete.
Data layer engine built (DL-01 through DL-05).
Tech stack updated: Papa Parse, Zustand added.
File structure updated. CSV parsing philosophy locked.
Caching model locked. Atomic imports locked.
Joint account model locked. Audit log locked.*

---

## What is Kāshe?

A pocket investment advisor and financial clarity tool for globally
mobile professionals — anyone managing savings, investments, and
spending across more than one country or currency.

Three pillars:
  1. Spend — understand and track where money is going
  2. Portfolio — see all existing investments in one place
  3. Invest — plan intelligently, discover what to explore next

What makes it different: genuinely personalised AI guidance baked
into every screen. Not a generic budgeting app. Not a robo-advisor.
A trusted financial companion that knows your specific situation.

React Native, iOS + Android, dark and light mode from day one.

**You are building one screen / one service / one component at a time.**
Do not implement anything not in your current ticket.
When in doubt — do less, ask the PM.

---

## The User We Are Building For

A globally mobile professional, 30–50, living in one country with
financial roots in another (or several). Not India-specific — for
any expat professional with a multi-geography financial life.

Example profiles:
- Indian engineer in Amsterdam: Indian MFs, DeGiro ETFs, NRE savings,
  PPF, employer RSUs, EUR mortgage, Dutch pension
- Nigerian PM in London: Nigerian bonds, ISA, UK pension, GBP + NGN
- Brazilian designer in Berlin: Brazilian CDB, German ETF Sparplan,
  bAV pension, EUR + BRL
- Filipino nurse in Dubai: Philippine bonds, UAE savings, USD + PHP

**North star test:** Would a 38-year-old expat professional with
investments in two countries trust this with their full financial
picture, find it genuinely insightful, and willingly pay for it?

---

## Non-Negotiables
- Never hardcode a colour. Use tokens from /constants/colours.ts
- Every component handles both dark AND light mode
- Every screen has an empty state (ghost pattern — 0.5 opacity, NOT blur)
- [V2] and [NEVER] tags mean: do not build
- TypeScript everywhere. No 'any' types.
- No new dependencies without PM approval
- Never show a financial number as zero — use empty state instead
- "Your Position" not "Net Worth" — everywhere in the app
- formatCurrency() from /constants/formatters.ts always.
  Never Intl.NumberFormat. Never template literals with raw numbers.
- Git commands always run manually by Anand. Never through Claude Code.
- MD files always downloaded and replaced in full. Never edited inline.
- Universal AppHeader — never inline header code in any tab screen.
- Monthly Review: executive brief format. Never revert to text document.
- expo-secure-store for ALL persistence. Never AsyncStorage directly.
- ALL storage access goes through /services/storageService.ts only.
- Service → Store → Hook → Component. Never skip the chain.
- Atomic imports: all-or-nothing. Never partial state.
- Raw CSV files never written to disk. Parse in memory only.

---

## Tech Stack
```
Framework:      React Native via Expo (managed workflow)
Language:       TypeScript (strict)
Navigation:     Expo Router (file-based routing)
State:          Zustand (with secureStorageAdapter for persistence)
                createJSONStorage() pattern for Zustand v5
Storage:        expo-secure-store — ALL data, via storageService.ts
                Never AsyncStorage directly. Never raw SecureStore calls.
CSV parsing:    Papa Parse — mechanical parsing only (never custom tokeniser)
                Smart field detector for column mapping (no hardcoded formats)
Auth:           Google OAuth only via expo-auth-session
                Encryption key = hash(OAuth token + device ID)
Fonts:          Space Grotesk (display/numbers) + Inter (body/UI)
                NEVER: Syne, DM Sans — permanently retired
Animation:      React Native Animated API only
                react-native-reanimated — banned from web builds
Price APIs:     Alpha Vantage / Finnhub / AMFI NAV / CoinGecko
FX:             ExchangeRate-API
AI Insights:    Claude API (claude-haiku-4-5-20251001 for insights)
                Hard budget cap: client-side token enforcement
                API key in encrypted storage — never in bundle
                NEVER send raw transactions — aggregated percentages only
                One call per app open maximum
Merchant enrich: Clearbit (merchant name only, opt-in) →
                 Claude API fallback (same privacy rules)
Analytics:      PostHog (anonymised, zero PII) — four learning loops
                ANALYTICS_ENABLED = false until PM review
Backend:        Supabase
                V1b: couple sync (E2E encrypted)
                V2: instrument catalogue live feed + merchant keywords
                    Edge Functions for catalogue freshness
```

---

## Four Tabs — LOCKED

```
Home        Your position at a glance
Spend       Spend tracking + spend-specific AI insights
Portfolio   Holdings + portfolio-specific AI insights
Invest      Risk profile + investment plan + discovery +
            monthly review
```

No standalone Insights tab. AI insights live on native screens.

Routes:
  /app/(tabs)/index.tsx     Home
  /app/(tabs)/spend.tsx     Spend
  /app/(tabs)/portfolio.tsx Portfolio
  /app/(tabs)/invest.tsx    Invest

---

## Invest Tab — What Lives Here (LOCKED 18 March 2026)

```
RiskProfileCard          First. KasheAsterisk + "Balanced is a good
                         starting point for most". Never verbose.

InvestmentPlanFull       Fraction format (€920/€1,500). Risk-profile-
                         driven targets. "Explore →" CTA. No gap prose.

InstrumentDiscoverySection
                         Tier/bucket/geography filtered from catalogue.
                         KasheAsterisk on "why" text. Risk tier pill.
                         "Worth exploring" always. Never buy/sell.

MonthlyReviewCard        "March review ready" / "Read now →"
                         Four states: available/viewed/pending/insufficient

MonthlyReviewSheet       Executive brief. Four storytelling levels.
                         L1: hero stat + sparkline
                         L2: animated bucket allocation bars
                         L3: priority action card (accent border)
                         L4: watchlist
                         System-responsive mode (intentional).
```

NOT on the Invest tab (V2):
```
FinancialEducationSection  Lives in /app/settings.tsx only
FIRETeaserCard             Removed [V2]
FIREProgress               Removed from Home [V2]
/app/invest/fire.tsx       Not built [V2]
```

---

## AI Insights — Where They Live

```
Spend screen:     SpendInsightStrip
Portfolio screen: PortfolioInsightStrip
Holding detail:   HoldingInsightCard + HoldingPriceChart
Invest tab:       InvestmentPlanFull + MonthlyReviewCard
```

**Four types in V1, priority ordered:**
```
1. MARKET_EVENT_ALERT      Time-sensitive, web search, tiered sources
2. PORTFOLIO_HEALTH        Action-needed, local calc + Claude
3. INVESTMENT_OPPORTUNITY  Helpful, zero API cost, fully templated
4. MONTHLY_REVIEW          Scheduled, executive brief format
(FIRE_TRAJECTORY is V2 — skip entirely in V1)
```

**AI privacy rules (non-negotiable):**
```
NEVER send raw transactions to Claude API
NEVER send absolute monetary values
Send only aggregated category totals and percentages
Send portfolio percentages, not absolute values
One insight per API call — never generate all types at once
One call per app open maximum
Minimum 1 hour between calls for same insight type
Cache insights: 24 hours (insights), full calendar month (reviews)
```

---

## Risk Profile — LOCKED

```
Conservative   40% Growth / 40% Stability / 20% Locked
Balanced       60% Growth / 20% Stability / 20% Locked
Growth         80% Growth / 10% Stability / 10% Locked

Default: RECOMMEND Balanced — never silently pre-select
STATE 1: KasheAsterisk + "Balanced is a good starting point for most"
Drives: targets, suggestions, health alerts
Persisted in householdStore via secureStorageAdapter
```

---

## Instrument Catalogue — LOCKED

### Three concepts
```
RegulatoryRegime  Legal framework (UCITS/SEBI/SEC/FCA/BaFin/
                  AFM/FSMA/RBI/EPFO/PFRDA/MoF_IN/
                  exchange_listed/unregulated/other/unknown)

AccountWrapper    Tax structure (ISA/LISA/SIPP/Roth_IRA/401k/PPF/
                  EPF/NPS/ELSS/NRE/NRO/FCNR/Pension_NL/bAV_DE/
                  Pensioensparen_BE/taxable/other/unknown)

InstrumentType    What it is (etf/index_fund/active_mutual_fund/
                  bond_etf/direct_equity/fractional_equity/
                  equity_crowdfunding/govt_savings_scheme/
                  pension_scheme/crypto_spot/p2p_lending/
                  other/unknown)
```

### CatalogueRole
```
suggest      → InstrumentDiscoverySection (shown to user)
track_only   → portfolio only, NEVER suggested
educational  → FinancialEducationSection only

TRACK_ONLY forever: equity_crowdfunding, angel_investment,
  venture_fund, private_equity, nft, stock_options, futures,
  structured_product, employer_rsu, employer_espp, crypto_spot
```

---

## CSV Parsing Philosophy — LOCKED (19 March 2026)

```
Papa Parse handles all mechanical CSV reading.
Never write a custom CSV tokeniser.

Smart field detector scores every column against field types.
Never hardcode institution-specific parsing logic.
Institution hints (lightweight header patterns) exist only
to label the detected institution for display — not to control parsing.

Post-parse confidence scoring:
  Tier 1 (blocking): date, amount, debit/credit direction
  Tier 2 (fallback OK): currency, description, merchant
  Tier 3 (always fallback): reference, geography, isRecurring
  If Tier 1 missing: hard fail (ParseError)
  If Tier 1 present: always ParseSuccess, warn on low Tier 2/3

Atomic imports — all-or-nothing:
  Any failure mid-import: entire batch rolled back
  User shown error + re-upload request
  Never partial state in spendStore

24 supported institutions:
  NL: ABN_AMRO, ING_NL, RABOBANK, BUNQ, SNS_BANK, N26
  EU/Digital: REVOLUT, WISE
  Investment: DEGIRO, IBKR
  IN: HDFC_BANK, HDFC_SECURITIES, ICICI_BANK, SBI,
      AXIS_BANK, KOTAK, ADITYA_BIRLA, ZERODHA, GROWW
  UK: BARCLAYS, HSBC, MONZO
  US: CHASE, SCHWAB
  Fallback: UNKNOWN

Unrecognised bank:
  ParseError with REQUEST_SUPPORT_URL (Google Form)
  User submits bank + country
  PM prioritises new parsers from form data
```

---

## Spend Categorisation Pipeline — LOCKED

```
Layer 3 (FIRST — user corrections always win — DEC-01):
  merchantOverrides checked before anything else
  User correction always beats keyword rulebook

Layer 1 (SECOND — fast, free, offline):
  /constants/merchantKeywords.ts
  Geography-aware: NL / IN / EU / GLOBAL
  confidence: 1.0

Layer 2 (LAST — only for Layer 1 misses):
  Option C: Clearbit merchant lookup (opt-in, name only)
  Option A: Claude haiku fallback (if Clearbit misses)
  Retry queue: 20/upload cap, 30/day drain, 3 attempt limit
  Budget gated: always check isWithinBudget() first
  After 3 failures: category = 'other', confidence = 0.3

Layer 3 back-application:
  User corrects any transaction → correction applied to ALL
  past + future transactions from same merchantNorm
  correctionCount >= 5 → Layer 1 promotion candidate logged
```

---

## Caching Model — LOCKED (19 March 2026)

```
Derived values cached in stores with lastCalculatedAt timestamp.
Hooks check staleness on mount. 24-hour rule for time-based.
Event-based invalidation is immediate (ignores time).

Home:       portfolioStore.derived, 24h + event invalidation
Spend:      spendStore.derivedSpend, 24h + immediate on import/edit
            One month at a time — month switch = cache miss
Portfolio:  portfolioStore.derived, 24h + event invalidation
Insights:   per-insight type expiry (see ai-insights.md)
            One Claude call per app open maximum
```

---

## Joint Account Model — LOCKED (19 March 2026)

```
DataSource.accountType: 'personal' | 'joint' | 'managed'
Transaction.ownership: 'personal' | 'joint' | 'split'

Joint imports:
  DataSourceConfirmSheet always asks "Is this a joint account?"
  Joint transactions: ownership: 'joint'
  splitWithProfileId + splitRatio: 0.5 default

Household view: joint transactions shown ONCE
Individual view: personal + joint for that profile

Deduplication:
  Same joint account in two exports → compound key catches it
  Indian bank format variations → fuzzy Dice coefficient
  Probable duplicates → user confirmation (never silent)
```

---

## Audit Log — LOCKED (19 March 2026)

```
Every import logged in auditStore at profile level.
Last 100 events retained. FIFO eviction.
Never wiped except "delete all data" (Session 16).

ImportAuditEvent: id, profileId, householdId, timestamp,
  institution, transactionCount, duplicatesSkipped,
  probableDuplicatesFound, layer2Queued, parseConfidence,
  status ('success' | 'failed'), errorCode?
```

---

## Living Database — Three Pillars

```
Invest catalogue:  KasheScore quarterly + TER auto-flag weekly
                   review_queue Supabase table (PM: 15 min/week)
Spend categories:  PostHog corrections → Layer 1 promotion monthly
Portfolio intel:   Monthly Review includes KasheScore of held instruments
```

---

## Four Learning Loops — LOCKED

Quality baked in via KasheScore (objective). Behaviour supplements only.

```
Loop 1: Catalogue freshness — KasheScore + Edge Function + review_queue
Loop 2: Spend accuracy — category_corrected → Layer 1
Loop 3: AI insight quality — viewed/actioned/dismissed + time_visible
Loop 4: Discovery signal — tapped/added/skipped (editorial, not algo)
```

---

## Onboarding Stack — 10 Screens
```
1. Welcome      Kāshe asterisk + tagline + Google OAuth
2. Name         "What's your name?"
3. Location     Country + base currency (drives geography filtering)
4. Age          Skippable. Stored for V2 FIRE only.
5. Risk Profile Conservative / Balanced / Growth
                KasheAsterisk + "Balanced is a good starting point"
6. Teach [+]    Static illustration
7. First Add    Guided universal add sheet
8. First Payoff Real data OR ghost
9. Budget       Conditional on screen 7 upload success
10. Complete    "Tap [+] anytime" → main app

Screen 3+5 together drive:
  → Geography-filtered instrument suggestions
  → Education catalogue geography filter
  → Spend merchant keyword set
  → Balanced recommendation (or user changes it)

Note on screen 4 (Age):
  Stored in Profile.age — null if skipped
  Used for FIRE engine (V2 only)
  Never used for any V1 logic
```

---

## What NOT to Build
```
[V2]    FIRE planner screen (/app/invest/fire.tsx)
[V2]    FIRETeaserCard on Invest tab
[V2]    FIREProgress on Home
[V2]    Open banking API sync
[V2]    Push notifications
[V2]    Partner spend on Home
[V2]    Real price chart data (shell V1, data V2)
[V2]    Tax field surface
[V2]    Property market estimate
[V2]    Couple sync (Supabase E2E)
[V2]    ML spend categorisation (Layer 2 is Claude API in V1)
[V2]    Conversational advisor
[V2]    Historical insight log
[V2]    Year-end wrapped
[V2]    Algorithmic catalogue personalisation (editorial V1)
[V2]    API connections in Sources screen
[V2]    Contextual education tooltips (V1: settings.tsx only)
[NEVER] Physical assets
[NEVER] Tax filing or calculations
[NEVER] Money transfers or payments
[NEVER] Social features or comparisons
[NEVER] Ads, affiliate links, data monetisation
[NEVER] Generic market news feed
[NEVER] Gamification
[NEVER] Business finances
[NEVER] Specific buy/sell recommendations
[NEVER] Regulated financial advice
[NEVER] Intl.NumberFormat
[NEVER] react-native-reanimated in web builds
[NEVER] @/ import alias
[NEVER] Inline style objects
[NEVER] Hardcoded hex colours in components
[NEVER] Raw subtype keys in UI (use displayLabels.ts)
[NEVER] KasheScore shown to user as a number
[NEVER] Crypto suggested (track_only only)
[NEVER] Equity crowdfunding suggested (track_only only)
[NEVER] AsyncStorage used directly
[NEVER] Raw SecureStore calls outside storageService.ts
[NEVER] Raw transactions sent to Claude API
[NEVER] FIRE UI in V1
[NEVER] "Choose not to work" — use financial independence framing
[NEVER] Partial CSV imports — atomic or nothing
[NEVER] Raw CSV files written to disk — parse in memory only
[NEVER] Services imported directly into components
[NEVER] Derived values recalculated inline in components
[NEVER] Clearbit sent any user data — merchant name only
[NEVER] Merchant enrichment on Layer 1 matches — misses only
[NEVER] Probable duplicates silently skipped
[NEVER] Joint transactions shown twice in household view
[NEVER] auditStore.clearAuditLog() except in "delete all data"
[NEVER] ANALYTICS_ENABLED = true without PM review
```

---

## Key Product Decisions — Do Not Re-Debate
```
"Your Position" not "Net Worth" everywhere
CSV only — no Excel, PDF, OFX
Local-first storage — privacy by architecture
expo-secure-store for all persistence — via storageService.ts
secureStorageAdapter separate from storageService (single responsibility)
Google OAuth only — no passwords
Encryption key = hash(OAuth token + device ID) [V2 adds E2E]
4 tabs: Home / Spend / Portfolio / Invest
No standalone Insights tab
Tab 4 = Invest — planning, risk profile, discovery, monthly review
FIRE — V2 only. Foundation types built. No V1 UI.
FIRE copy: "How close are you to financial independence?"
Risk profile: 3 levels — drives allocation (never hardcoded)
Default: RECOMMEND Balanced — never silently assume
Product for ALL globally mobile professionals — not India-specific
Monthly Review: executive brief, four levels, system-responsive
Invest copy: visuals first, no verbose paragraphs
KasheAsterisk punctuates AI-generated insights
"Worth exploring" always — never buy/sell
track_only instruments never suggested
KasheScore objective, editorial, never shown as number
Unknown geography: GLOBAL fallback + "building your region"
Spend: Layer 3 (user) → Layer 1 (keywords) → Layer 2 (AI)
  Layer 3 checked FIRST — user corrections always win
Education: settings.tsx in V1, contextual tooltips in V2
Four learning loops — quality baked in, behaviour supplements
Supabase V2 schema identical to V1 static file
Acid green #C8F04A — brand accent, used sparingly
Space Grotesk (display/numbers) + Inter (body/UI)
Hero card always dark — both light and dark mode
Empty state: 0.5 opacity ghost + floating pill (NOT blur)
formatCurrency() always — Intl.NumberFormat banned
DataSource abstraction — CSVDataSource V1, open banking V2
featureFlag system — freemium ready, don't gate in V1
investment_transfer excluded from spend totals + savings rate
Compliance: "For information only. Not financial advice."
  on Invest tab and Education section before beta
Papa Parse for CSV reading — never custom tokeniser
Smart field detector — never institution-hardcoded parsing
Post-parse confidence scoring — not pre-parse prediction
Atomic imports — all-or-nothing, never partial state
Hybrid dedup: referenceId → compound key → fuzzy (Indian banks)
Probable duplicates → user confirmation, never silent skip
Clearbit for merchant enrichment — name only, opt-in, zero user data
Option C (Clearbit) → Option A (Claude) fallback for enrichment
Retry queue: 20/upload cap, 30/day drain, 3 attempt limit
Derived cache in stores with lastCalculatedAt — not recalculated every render
One month at a time for Spend cache — month switch = cache miss
One Claude call per app open maximum for insights
24h minimum between same insight type regeneration
Joint accounts: ownership: 'joint', shown once in household view
Audit log: every import at profile level, 100 events max, never wiped
BYOK (bring your own key) for V1 beta — one key per tester
ANALYTICS_ENABLED = false — PM reviews before enabling
Data deletion: storageService.clear() + sign out (Session 16)
```

---

## Git Conventions
```
Commit format:  [TICKET-ID] Brief description
Rules:
- One commit per logical ticket
- Always preview before committing
- Never commit broken code
- Never commit API keys or tokens
- Every commit includes code + updated MD files together
- Git always run manually — never through Claude Code
- MD files downloaded and replaced in full — never edited inline
```

---

## File Structure Reference
```
/app
  (tabs)/index.tsx spend.tsx portfolio.tsx invest.tsx
  spend/[category].tsx
  portfolio/[holdingId].tsx
  invest/fire.tsx              ← V2, do not build
  settings.tsx                 ← stub, Session 16 full build
  sources.tsx                  ← Session 15

/components
  /home          ✅ complete
  /spend         ✅ complete
  /portfolio     ✅ complete
  /invest
    RiskProfileCard.tsx            ✅
    RiskProfileSheet.tsx           ✅
    InvestmentPlanFull.tsx         ✅
    MonthlyReviewCard.tsx          ✅
    MonthlyReviewSheet.tsx         ✅ executive brief
    FIRETeaserCard.tsx             ✅ built, NOT rendered [V2]
    InstrumentDiscoverySection.tsx ✅
    FinancialEducationSection.tsx  ✅ rendered in settings.tsx
  /shared
    AppHeader.tsx         ✅ universal — all tabs
    UniversalAddSheet.tsx ⬜ Session 14
    CSVUploadSheet.tsx    ⬜ Session 13
    DataSourceConfirmSheet.tsx ⬜ Session 13
    ProbableDuplicateSheet.tsx ⬜ Session 13
    UploadToast.tsx       ⬜ Session 13
    EmptyState.tsx        ✅
    KasheAsterisk.tsx     ✅
    MacronRule.tsx        ✅
    RedactedNumber.tsx    ✅

/constants
  colours.ts typography.ts spacing.ts formatters.ts
  featureFlags.ts mockData.ts displayLabels.ts
  instrumentCatalogue.ts  ✅
  educationCatalogue.ts   ✅ 20 articles, 5 geographies
  fireDefaults.ts         ✅ V2 foundation
  merchantKeywords.ts     ✅ Session 12 — NL/IN/EU/GLOBAL

/types
  spend.ts ✅  portfolio.ts ✅  riskProfile.ts ✅
  instrumentCatalogue.ts ✅  fire.ts ✅ V2 foundation

/services
  storageService.ts       ✅ Session 12 — vault door
  secureStorageAdapter.ts ✅ Session 12 — Zustand bridge
  spendCategoriser.ts     ✅ Session 12 — Layer 1/2/3
  csvParser.ts            ✅ Session 12 — smart detector
  aiInsightService.ts     ⬜ Session 12 remaining
  analyticsService.ts     ⬜ Session 12 remaining

/store
  spendStore.ts           ✅ Session 12
  portfolioStore.ts       ✅ Session 12
  insightsStore.ts        ✅ Session 12
  householdStore.ts       ✅ Session 12
  auditStore.ts           ✅ Session 12

/hooks
  useDataSources.ts       ✅
  useSpend.ts             ⬜ Session 12 remaining
  usePortfolio.ts         ⬜ Session 12 remaining
  useInsights.ts          ⬜ Session 12 remaining
  useHousehold.ts         ⬜ Session 12 remaining
  useInstrumentCatalogue.ts ⬜ Session 12 remaining

/context
  ThemeContext.tsx ✅ (useColorScheme() ONLY here)
```
