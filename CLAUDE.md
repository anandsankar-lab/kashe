# Kāshe — CLAUDE.md
*Read this before starting any task in this project.*
*Last updated: 20 March 2026 — Session 12 complete.*
*Data layer engine fully built: DL-01 through DL-09.*
*UserFinancialProfile architecture introduced — central intelligence spine.*
*Analytics finalised: events + user properties + PostHog key live.*
*Sophistication score added. T11 + T12 triggers added.*
*FIRE confirmed V2 only — no FIRE UI anywhere in V1.*

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
- UserFinancialProfile is the spine of all intelligence. Read from it. Never re-derive inline.

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
AI Insights:    Claude API (claude-haiku-4-5-20251001 for all insight types)
                Hard budget cap: client-side token enforcement
                API key in encrypted storage — never in bundle
                NEVER send raw transactions — aggregated percentages only
                One call per app open maximum
                12-hour generation windows: A (00:00–11:59) B (12:00–23:59)
                Max 2 insight generations per day per user
Merchant enrich: Clearbit (merchant name only, opt-in) →
                 Claude API fallback (same privacy rules)
Analytics:      PostHog EU cloud (eu.posthog.com), project 144615
                PostHog key: in analyticsService.ts (write-only, safe in client)
                anonymised, zero PII — four learning loops
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
2. PORTFOLIO_HEALTH        Action-needed, local calc + Claude narrative
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
12-hour generation windows — max 2 per day
Cache insights: 24 hours (insights), full calendar month (reviews)
```

---

## UserFinancialProfile — The Intelligence Spine (LOCKED 20 March 2026)

```
Every insight, trigger, source selector, and analytics call reads from
UserFinancialProfile stored in householdStore.financialProfile.

Built by: /services/userProfileService.ts
Stored in: householdStore.financialProfile
Updated on: addTransactions, addHolding, updateHolding, setBucketOverride,
            setProtection, setRiskProfile (if actively changed),
            onboardingComplete, setMonthlyTarget, setFireInputs

UserFinancialProfile feeds:
  → getActiveSeedSources()    which sources to search
  → evaluateAllTriggers()     which health checks fire
  → buildHoldingsContext()    what context Claude receives
  → analyticsService          all PostHog user properties
  → aiInsightService          search depth + insight depth

NEVER re-derive inline what is already in the profile.
NEVER send the profile directly to Claude — use context builders.
```

---

## Portfolio Sophistication Score (LOCKED 20 March 2026)

```
0–100 score computed from five components:
  1. Vehicle diversity (0–25)     — distinct asset class categories
  2. Liquidity balance (0–25)     — growth/stability/locked all funded
  3. Protection coverage (0–20)   — emergency fund months
  4. Investing consistency (0–15) — regular investing cadence
  5. Geographic spread (0–15)     — multi-geography exposure

Bands:
  0–25:   'foundation'    — basics missing, health insight priority
  26–50:  'building'      — progress, gaps remain
  51–75:  'established'   — solid foundations
  76–100: 'sophisticated' — diversified, consistent

NEVER shown to user as a number.
Drives: insight depth, PORTFOLIO_HEALTH framing, prompt conservatism.

Key scenarios:
  €500k all in savings accounts → sophisticationScore ~20
    → T11_CASH_PILE_CONCENTRATION fires
    → Insight: "Substantial savings eroding to inflation"

  €100k overleveraged on illiquid/speculative → score ~15
    → T12_LIQUIDITY_CONCENTRATION fires
    → Insight: "Portfolio locked up — no liquid buffer"
```

---

## Risk Profile — LOCKED

```
Conservative   40% Growth / 40% Stability / 20% Locked
Balanced       60% Growth / 20% Stability / 20% Locked
Growth         80% Growth / 10% Stability / 10% Locked

Default: RECOMMEND Balanced — never silently assume.
Stored in: householdStore.riskProfile
riskProfileActivelySet: true ONLY if user changed from Balanced default
```

---

## Portfolio Tier — LOCKED (with hysteresis)

```
Tier 1 (Starter):      < €25k      3 sources, seed only
Tier 2 (Growing):      €25k–€100k  6 sources, discovery pass
Tier 3 (Established):  €100k–€500k 10 sources, full tiered
Tier 4 (Significant):  > €500k     14 sources, full + routing

Tier up:   immediately when value crosses floor
Tier down: only when value is 20% BELOW the floor
           (prevents oscillation on market movements)
```

---

## Analytics — LOCKED (20 March 2026)

```
PostHog EU cloud. Project 144615.
ANALYTICS_ENABLED = false — PM reviews before enabling.

User properties: driven entirely by UserFinancialProfile
  updateUserProperties(profile) — single call, all properties
  Called by userProfileService after every profile update

Events (17 total):
  Loop 1: instrument_tapped, instrument_added, instrument_skipped
  Loop 2: category_correction, layer1_promotion_candidate
  Loop 3: insight_viewed, insight_actioned, insight_dismissed,
          insight_generation_result, monthly_review_opened,
          monthly_review_section_read
  Loop 4: csv_uploaded
  PM visibility: portfolio_tier_changed, milestone_reached,
                 pm_snapshot_exported
  General: screen_viewed, risk_profile_set, app_opened

ZERO PII in any event. ZERO merchant names. ZERO amounts.
injection_detected: NEVER sent to analytics — log locally only.
```

---

## V1 / V2 / Never Scope

```
[V1 Built]
  Four tabs fully built
  CSV parsing — 24 supported institutions + smart detector
  Security pipeline — sanitisation inside csvParser
  Atomic imports
  Spend categoriser — Layer 3 → Layer 1 → Layer 2
  Merchant enrichment — Clearbit opt-in → Claude fallback
  Zustand stores with secureStorageAdapter
  Hooks — clean UI boundary layer
  AI insight engine (5 files, 2383 lines)
  UserFinancialProfile + userProfileService
  Analytics (PostHog, disabled)
  Sophistication score + T11/T12 triggers
  Tiered source architecture
  Onboarding (10 screens) — Session 14
  Settings — Session 16
  PM dashboard + snapshot export — Session 16.5
  Single OWNER profile
  BYOK API keys — one per beta tester

[V1b]
  Couple sync (Supabase E2E encrypted)
  PARTNER profile type activated
  API key moves to Supabase Edge Functions
  Push notifications (opt-in)
  Server-side budget enforcement (replaces local-only)
  PostHog → Supabase signal loop (previousDismissRate automated)

[V2]
  FIRE planner screen (foundation types already built)
  Open banking (Nordigen EU, Account Aggregator India, Plaid US)
  ML spend categorisation
  Tax field surface (data already captured in V1)
  Historical portfolio performance charts
  Property market estimate
  Year-end wrapped
  Conversational advisor
  Historical insight log
  Partner spend on Home
  Supabase instrument catalogue live feed
  Supabase merchant keywords live feed

[NEVER]
  Physical assets
  Tax filing or calculations
  Money transfers or payments
  Social features or comparisons
  Ads, affiliate links, data monetisation
  Generic market news feed
  Gamification
  Business finances
  Specific buy/sell recommendations
  Regulated financial advice
  Intl.NumberFormat
  react-native-reanimated in web builds
  @/ import alias
  Inline style objects
  Hardcoded hex colours in components
  Raw subtype keys in UI (use displayLabels.ts)
  KasheScore shown to user as a number
  Sophistication score shown to user as a number
  Crypto suggested (track_only only)
  Equity crowdfunding suggested (track_only only)
  AsyncStorage used directly
  Raw SecureStore calls outside storageService.ts
  Raw transactions sent to Claude API
  FIRE UI in V1
  "Choose not to work" — use financial independence framing
  Partial CSV imports — atomic or nothing
  Raw CSV files written to disk
  Services imported directly into components
  Derived values recalculated inline in components
  Clearbit sent any user data — merchant name only
  Merchant enrichment on Layer 1 matches
  Probable duplicates silently skipped
  Joint transactions shown twice in household view
  auditStore.clearAuditLog() except in "delete all data"
  ANALYTICS_ENABLED = true without PM review
  UserFinancialProfile sent directly to Claude API
```

---

## Key Product Decisions — Do Not Re-Debate
```
"Your Position" not "Net Worth" everywhere
CSV only — no Excel, PDF, OFX
Local-first storage — privacy by architecture
expo-secure-store for all persistence — via storageService.ts
secureStorageAdapter separate from storageService
Google OAuth only — no passwords
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
12-hour generation windows for insights — max 2 per day
24h minimum between same insight type regeneration
Joint accounts: ownership: 'joint', shown once in household view
Audit log: every import at profile level, 100 events max, never wiped
BYOK (bring your own key) for V1 beta — one key per tester
ANALYTICS_ENABLED = false — PM reviews before enabling
Data deletion: storageService.clear() + sign out (Session 16)
UserFinancialProfile: single source of truth for all intelligence
Sophistication score: 0–100 computed, never shown to user
Portfolio tier: size-based with 20% hysteresis for tier-down
financialVehicles drives source selection — not re-derived per call
T11 (cash pile) + T12 (liquidity) triggers added to PORTFOLIO_HEALTH
PM dashboard: 5-second long press on KasheAsterisk (Session 16.5)
Snapshot export: JSON + readable summary via native share sheet
PostHog dashboards: 4 (Spend Accuracy, Insight Quality, Catalogue, CSV)
```

---

## Git Conventions
```
Commit format:  [TICKET-ID] Brief description
Rules:
- One commit per logical ticket
- Always preview before committing
- Never commit broken code
- Never commit API keys or tokens (PostHog write-only key is OK in client)
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
  /invest        ✅ complete
  /shared
    AppHeader.tsx         ✅ universal — all tabs
    PMDashboard.tsx       ⬜ Session 16.5
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
  educationCatalogue.ts   ✅
  fireDefaults.ts         ✅ V2 foundation
  merchantKeywords.ts     ✅ Session 12
  insightSources.ts       ✅ Session 12 — tiered source registry
  insightTriggers.ts      ✅ Session 12 — 12 trigger conditions
  insightPrompts.ts       ✅ Session 12 — prompt templates

/types
  spend.ts ✅  portfolio.ts ✅  riskProfile.ts ✅
  instrumentCatalogue.ts ✅  fire.ts ✅ V2 foundation
  userProfile.ts          ✅ Session 12 — UserFinancialProfile

/services
  storageService.ts         ✅ Session 12
  secureStorageAdapter.ts   ✅ Session 12
  spendCategoriser.ts       ✅ Session 12
  csvParser.ts              ✅ Session 12
  holdingsContextBuilder.ts ✅ Session 12
  aiInsightService.ts       ✅ Session 12
  analyticsService.ts       ✅ Session 12
  userProfileService.ts     ✅ Session 12 (DL-09)
  snapshotService.ts        ⬜ Session 16.5
  shareService.ts           ⬜ Session 16.5

/store
  spendStore.ts           ✅ Session 12
  portfolioStore.ts       ✅ Session 12
  insightsStore.ts        ✅ Session 12
  householdStore.ts       ✅ Session 12 (updated DL-09)
  auditStore.ts           ✅ Session 12

/hooks
  useDataSources.ts       ✅
  useSpend.ts             ✅ Session 12
  usePortfolio.ts         ✅ Session 12
  useInsights.ts          ✅ Session 12
  useHousehold.ts         ✅ Session 12
  useInstrumentCatalogue.ts ✅ Session 12

/context
  ThemeContext.tsx ✅ (useColorScheme() ONLY here)
```
