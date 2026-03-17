# Kāshe — CLAUDE.md
*Read this before starting any task in this project.*
*Last updated: 17 March 2026 — Instrument catalogue type system locked,
KasheScore introduced, living database architecture decided,
spend categorisation Layer 1/2/3 locked, universal AppHeader locked,
learning loops formalised, product vision fully articulated.*

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
financial roots in another (or several). This is not an India-specific
product — it is for any expat professional with a multi-geography
financial life.

Example profiles:
- Indian engineer in Amsterdam: Indian MFs, DeGiro ETFs, NRE savings,
  PPF, employer RSUs, EUR mortgage, Dutch pension (pensioenfonds)
- Nigerian product manager in London: Nigerian bonds, ISA, UK pension,
  Revolut savings, GBP + NGN exposure
- Brazilian designer in Berlin: Brazilian CDB, German ETF Sparplan,
  bAV pension, EUR + BRL exposure
- Filipino nurse in Dubai: Philippine bonds, UAE savings, remittances,
  USD + PHP + AED exposure

What they share: investments in multiple geographies, two or more
currencies always in play, no single app that shows the full picture.
They know they're doing okay. They can't see exactly how okay.
Kāshe is that picture — and a trusted advisor alongside it.

**North star test:** Would a 38-year-old expat professional with
investments in two countries trust this with their full financial
picture, find it genuinely insightful, and willingly pay for it?

---

## Non-Negotiables
- Never hardcode a colour value. Use tokens from /constants/colours.ts
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

---

## Tech Stack
```
Framework:      React Native via Expo (managed workflow)
Language:       TypeScript (strict)
Navigation:     Expo Router (file-based routing)
State:          Zustand
Storage:        react-native-encrypted-storage
                (iOS Keychain / Android Keystore — AES-256)
Auth:           Google OAuth only via expo-auth-session
                No passwords. Ever.
Fonts:          Expo Google Fonts — Space Grotesk + Inter
                Space Grotesk: display numbers, headings
                Inter: body, labels, captions, all UI text
                NEVER: Syne, DM Sans — permanently retired
Animation:      React Native Animated API only
                react-native-reanimated — banned from web builds
                Returns for native-only builds in QA session
Price APIs:     Alpha Vantage (stocks/ETFs, free tier 25/day)
                Finnhub (news + prices, free tier 60/min)
                AMFI NAV feed (Indian MFs, free, no key)
                CoinGecko (crypto, free, no key)
FX:             ExchangeRate-API (free, no key for basic)
AI Insights:    Claude API (claude-sonnet-4-20250514)
                Hard budget cap: €5.00/month client-side
                API key in encrypted storage — never in bundle
Analytics:      PostHog (anonymised, no PII)
                Four learning loops — see LEARNING LOOPS section
Backend:        Supabase
                V1b: couple sync (E2E encrypted)
                V2: instrument catalogue live feed + merchant keywords
                    Edge Functions for catalogue freshness checks
```

---

## Four Tabs — LOCKED

```
Home        Your position at a glance
Spend       Spend tracking + spend-specific AI insights
Portfolio   Holdings + portfolio-specific AI insights
Invest      Risk profile + investment plan + discovery +
            monthly review + optional FIRE planner
```

**There is no standalone Insights tab.**
AI insights live on the screen they are relevant to.
The Invest tab is for planning and forward-looking guidance.

Tab bar labels: Home / Spend / Portfolio / Invest
Routes:
  /app/(tabs)/index.tsx        Home
  /app/(tabs)/spend.tsx        Spend
  /app/(tabs)/portfolio.tsx    Portfolio
  /app/(tabs)/invest.tsx       Invest

---

## Invest Tab — What Lives Here

```
RiskProfileCard          First thing on the tab
                         Conservative / Balanced / Growth
                         Default: recommend Balanced (never silently set)
                         Drives allocation targets + suggestions

InvestmentPlanFull       Always-expanded monthly plan
                         Gap analysis per bucket, salary contributions
                         Allocation targets from risk profile (not hardcoded)

InstrumentDiscovery      Tier-based suggestions filtered by:
                         - Risk profile
                         - Most underfunded bucket
                         - User's existing holding geographies
                         - KasheScore ordering within tier
                         "Worth exploring" framing always
                         Never buy/sell. Never affiliate links.

FinancialEducation       Tier-matched content
                         Never shows concepts user already demonstrates
                         Cycles through relevant topics

MonthlyReviewCard        Cross-domain review (spend + portfolio + FIRE)
                         Generated once per calendar month
                         Cached — never regenerates mid-month

FIRETeaserCard           Optional. Single low-pressure entry.
                         Full planner at /app/invest/fire.tsx
```

---

## AI Insights — Where They Live

**Insights are baked into their native screens. Not centralised.**

```
Spend screen:
  SpendInsightStrip       Spend pattern insight
                          e.g. "Eating out up 40% — 3-month high"

Portfolio screen:
  PortfolioInsightStrip   Portfolio health + market event alerts

HoldingDetailScreen:
  HoldingInsightCard      Holding-specific market news + analysis
  HoldingPriceChart       Line chart with 1M/6M/1Y tabs

Invest tab:
  InvestmentPlanFull      Gap analysis + allocation suggestions
  MonthlyReviewCard       Cross-domain monthly synthesis
```

**Five insight types, priority ordered:**
```
1. MARKET_EVENT_ALERT      Time-sensitive, web search
                           Tiered sources: RBI/ECB/Reuters (T1) →
                           Morningstar/ValueResearch (T2) →
                           Reddit/Bogleheads (T3)
2. PORTFOLIO_HEALTH        Action-needed, local calc + Claude
3. FIRE_TRAJECTORY         Important, not urgent
4. INVESTMENT_OPPORTUNITY  Helpful, fully templated, zero API cost
5. MONTHLY_REVIEW          Scheduled, own card in Invest tab
```

---

## Risk Profile — LOCKED

```
Three levels:
  Conservative   "Protect what I have, grow slowly"
                  GROWTH 40% / STABILITY 40% / LOCKED 20%
  Balanced       "Grow steadily, some volatility is fine"
                  GROWTH 60% / STABILITY 20% / LOCKED 20%
  Growth         "Maximise growth, I can ride out dips"
                  GROWTH 80% / STABILITY 10% / LOCKED 10%

Default: Recommend Balanced — never silently pre-select
STATE 1 copy: "Most people in your situation start with Balanced."
RiskProfileSheet: pre-selects Balanced but user sees the question
Drives: allocation targets, instrument suggestions, health triggers
Stored: in householdStore per profile
```

---

## Instrument Catalogue — Architecture LOCKED

### The three concepts
```
RegulatoryRegime  Legal framework the instrument is issued under
                  UCITS / SEBI / SEC / FCA / BaFin / AFM / FSMA /
                  RBI / EPFO / PFRDA / MoF_IN / exchange_listed /
                  unregulated / other / unknown

AccountWrapper    Tax or account structure it can sit inside
                  Full list: /types/instrumentCatalogue.ts
                  Includes all UK / US / India / NL / DE / BE wrappers
                  Every type ends with 'other' | 'unknown'

InstrumentType    What the instrument actually is
                  Full list: /types/instrumentCatalogue.ts
                  Covers all public + private + alternative instruments
                  Every type ends with 'other' | 'unknown'
```

### CatalogueRole
```
suggest      → shown in InstrumentDiscoverySection
track_only   → recordable in portfolio, NEVER suggested
educational  → shown in FinancialEducationSection only

TRACK_ONLY forever — never suggest these:
  equity_crowdfunding (Crowdcube, Seedrs, Republic)
  angel_investment, venture_fund, private_equity
  employer_rsu, employer_espp (track holdings, never suggest)
  crypto_spot, nft
  stock_options, futures, structured_product
  other, unknown
```

### KasheScore (0–100)
Internal quality score. Never shown to user as a number.
Drives ordering within a tier — highest score shown first.
Updated quarterly by PM via Supabase dashboard.

```
Cost efficiency       25pts  TER vs category peers
Diversification       25pts  Holdings count + index breadth
Liquidity/access      20pts  AUM proxy + platform count
Regulatory strength   15pts  UCITS/SEBI/SEC = 15, unregulated = 0
Track record          15pts  Inception date depth
```

### Geography coverage
```
NL/BE/DE/LU   DeGiro, IBKR, Trade Republic, Scalable Capital,
              Bolero, Comdirect, DKB, Flatex, ING
IN            Zerodha, Groww, Kuvera, MFCentral, INDmoney
US            Fidelity, Vanguard, Schwab, IBKR US
GB            Vanguard UK, Hargreaves Lansdown, AJ Bell,
              InvestEngine, Freetrade
GLOBAL        IBKR International — fallback for unknown geographies
```

### Unknown geography
Show GLOBAL entries (VWCE + AGGH via IBKR).
Message: "We're building your region's instrument list.
          Here's what works globally while we do."

### V1 → V2 migration path
```
V1:  /constants/instrumentCatalogue.ts — static seed + offline fallback
V2:  Supabase table instrument_catalogue — identical schema
     catalogueService.ts fetches Supabase, falls back to static
     Supabase Realtime pushes updates — no app release needed
```

---

## Spend Categorisation — Architecture LOCKED

Three-layer pipeline. Each layer improves over time.

```
Layer 1 — Keyword rules
  Geography-aware merchant keyword matching
  /constants/merchantKeywords.ts
  Fast, free, offline
  Updated via Supabase → all users benefit immediately
  MerchantConfidence: 1.0

Layer 2 — Claude API enrichment
  Triggered only when Layer 1 fails
  Cost: ~€0.001 per unrecognised transaction
  Result cached permanently → never sent to API again
  MerchantConfidence: 0.8

Layer 3 — User correction
  User recategorises → MerchantOverride saved
  PostHog: category_corrected event logged
  Corrections appearing 5+ times → promoted to Layer 1
  MerchantConfidence: 1.0 (highest confidence)
```

---

## Living Database — Three Pillars

### Pillar 1 — Instrument Catalogue (Invest tab)
```
AUTOMATED (weekly, Supabase Edge Function):
  Check TER changes for all catalogue entries
  Flag instruments where TER drifted > 0.05%
  Check platform availability changes
  Create review_queue entries for PM

MANUAL (PM, quarterly — 30 minutes):
  Review review_queue in Supabase dashboard
  Update TERs, add new instruments, retire stale ones
  Update KasheScores based on objective criteria
  → Supabase Realtime pushes to all users instantly
```

### Pillar 2 — Spend Categories (Spend tab)
```
AUTOMATED (continuous):
  Layer 2 Claude API catches unrecognised merchants
  Cached permanently → improves for all future uploads

MANUAL (PM, monthly — 15 minutes):
  Review PostHog category_corrected events
  Promote high-frequency corrections to Layer 1
  → Supabase keyword update → all users benefit
```

### Pillar 3 — Portfolio Intelligence (Portfolio tab)
```
AUTOMATED (continuous):
  Price refresh: Alpha Vantage, AMFI NAV, CoinGecko, FX
  Already in spec — runs on app open

AUTOMATED (monthly, on Monthly Review generation):
  Claude API call with user's actual holdings + catalogue KasheScores
  Honest assessment of portfolio composition vs catalogue quality
  Surfaces if better alternatives exist within same tier

MANUAL (PM, quarterly):
  Update KasheScores for instruments users actually hold
  Ensures portfolio insight quality stays high
```

---

## Four Learning Loops — LOCKED

Quality is baked in via KasheScore (objective).
Behaviour signal supplements but never replaces it.

```
LOOP 1 — Catalogue freshness
  KasheScore: objective quarterly update by PM
  TER changes: auto-flagged weekly by Edge Function
  review_queue: PM reviews weekly (15 minutes)
  Updates push via Supabase Realtime — no release needed

LOOP 2 — Spend category accuracy
  PostHog: category_corrected { merchant_norm, from, to, geography }
  Monthly review: corrections appearing 5+ times → Layer 1 keywords
  Layer 2 cache: self-improving, no manual action needed

LOOP 3 — AI insight quality
  PostHog: insight_viewed, insight_actioned, insight_dismissed
           time_visible tracked alongside dismissal
  Monthly review: actioned rate + time_visible by insight type
  High dismiss + low time_visible → tighten trigger threshold
  High dismiss + high time_visible → improve narrative prompt

LOOP 4 — Instrument discovery signal
  PostHog: instrument_tapped, instrument_added, instrument_skipped
  Monthly review: tap rate + add rate per instrument per geography
  High tap + low add → description/why copy needs work
  High add rate → candidate for tier promotion
  This is editorial signal — PM decides, not algorithm
```

---

## Sources Screen

```
Route:   /app/sources.tsx
Entry:   Home header [⋯] overflow menu
Purpose: All connected data sources, sync status,
         future API connections
NOT a tab — utility screen, accessed from overflow
```

---

## Onboarding Stack — 10 Screens
```
1. Welcome          Kāshe asterisk + tagline + Google OAuth
2. Name             "What's your name?"
3. Location         Country + base currency
4. Age              Skippable. Used for FIRE calc only.
5. Risk Profile     Conservative / Balanced / Growth
                    Plain language. Not a quiz.
                    Pre-selects Balanced. User sees the question.
6. Teach [+]        Static illustration, introduce the gesture
7. First Add        Guided universal add sheet (isOnboarding=true)
8. First Payoff     Real data OR ghost
9. Budget Suggest   Conditional — only if screen 7 upload succeeded
10. Complete        "Tap [+] anytime" → main app

Screen 5 also captures residence country for:
  → Geography-filtered instrument suggestions
  → FIRE inflation defaults
  → Spend merchant keyword set
  → If country unknown: show GLOBAL fallback + build queue entry
```

---

## What NOT to Build
```
[V2]    Open banking API sync (Nordigen EU, AA India, Plaid US)
[V2]    Push notifications
[V2]    Partner spend on Home screen
[V2]    Real price chart data (chart shell built V1, data V2)
[V2]    Tax field surface (data captured V1, shown V2)
[V2]    Property market estimate API
[V2]    Couple sync backend (Supabase E2E)
[V2]    ML-based spend categorisation (Layer 2 is Claude API in V1)
[V2]    Conversational advisor / "ask Kāshe anything"
[V2]    Historical insight log beyond monthly reviews
[V2]    Year-end wrapped
[V2]    Algorithmic catalogue personalisation (editorial in V1)
[V2]    API connections in Sources screen
[NEVER] Physical assets (car, art, jewellery, watches)
[NEVER] Tax filing or tax calculations
[NEVER] Money transfers or payments
[NEVER] Social features or comparisons
[NEVER] Ads, affiliate links, or data monetisation
[NEVER] Generic market news feed
[NEVER] Gamification (badges, streaks, scores)
[NEVER] Business or company finances
[NEVER] Specific buy/sell recommendations
[NEVER] Regulated financial advice
[NEVER] Intl.NumberFormat anywhere in the codebase
[NEVER] react-native-reanimated in web builds
[NEVER] @/ import alias — relative imports only
[NEVER] Inline style objects — StyleSheet.create() always
[NEVER] Hardcoded hex colour values in components
[NEVER] Raw subtype keys in UI — always use displayLabels.ts
```

---

## Key Product Decisions — Do Not Re-Debate
```
"Your Position" not "Net Worth" — everywhere
Physical assets — NEVER build
CSV only — no Excel, PDF, OFX ever
Smart universal CSV parser — works with any bank worldwide
Local-first storage — privacy by architecture
Google OAuth only — no passwords ever
4 tabs: Home / Spend / Portfolio / Invest
No standalone Insights tab — insights live on native screens
Tab 4 is "Invest" — planning, risk profile, discovery, monthly review
FIRE is optional — behind a single low-pressure entry point
Risk profile: 3 levels — drives allocation (never hardcoded globally)
  Conservative: 40/40/20  Balanced: 60/20/20  Growth: 80/10/10
Default risk: RECOMMEND Balanced — never silently assume
Product is for ALL globally mobile professionals — not India-specific
FIRE calculator lives at /app/invest/fire.tsx
FIRE is household-level by default, switchable to individual
Monthly Review: generated once per calendar month, cached entire month
HoldingDetailScreen: line chart + holding insight card (mock data V1)
Instrument suggestions: "worth exploring" — never buy/sell
Catalogue: KasheScore drives ordering — objective not behaviour-based
Equity crowdfunding / crypto / angel: track_only, never suggest
Unknown geography: show GLOBAL fallback, build region queue
Spend categories: Layer 1 (keywords) → Layer 2 (Claude) → Layer 3 (user)
Learning loops: four loops, inherent quality baked in via KasheScore
Universal AppHeader: shared component, all four tabs
Acid green #C8F04A — brand accent, used sparingly
Space Grotesk (display/numbers) + Inter (body/UI) — locked
Hero card always dark — both light and dark mode
Directional KasheAsterisk replaces ↑↓ arrows everywhere
Empty state: 0.5 opacity ghost + floating acid green pill (NOT blur)
formatCurrency() always — Intl.NumberFormat permanently banned
DataSource abstraction — CSVDataSource v1, open banking v2
featureFlag system — freemium ready, don't gate in v1
investment_transfer is NOT spend — excluded from savings rate
```

---

## Git Conventions
```
Commit format:  [TICKET-ID] Brief description
Example:        [INV-01] RiskProfileCard + RiskProfileSheet

Rules:
- One commit per logical ticket
- Always preview before committing
- Never commit broken code
- Never commit API keys or tokens
- Every commit includes code + updated MD files together
- Git always run manually by Anand in normal terminal
- Never run git through Claude Code
- MD files downloaded and replaced in full — never edited inline
```

---

## File Structure Reference
```
/app
  (tabs)/
    index.tsx            Home
    spend.tsx            Spend
    portfolio.tsx        Portfolio
    invest.tsx           Invest
  _layout.tsx
  spend/
    [category].tsx
  portfolio/
    [holdingId].tsx
  invest/
    fire.tsx
  sources.tsx

/components
  /home
  /spend
  /portfolio
  /invest
    RiskProfileCard.tsx       ✅
    RiskProfileSheet.tsx      ✅
    InvestmentPlanFull.tsx
    MonthlyReviewCard.tsx
    MonthlyReviewSheet.tsx
    FIRETeaserCard.tsx
    InstrumentDiscoverySection.tsx
    FinancialEducationSection.tsx
  /shared
    AppHeader.tsx             ✅ Universal — all four tabs
    UniversalAddSheet.tsx
    EmptyState.tsx            ✅
    KasheAsterisk.tsx         ✅
    MacronRule.tsx            ✅
    RedactedNumber.tsx        ✅
    DataSourceSheet.tsx       ✅

/constants
  colours.ts                  ✅
  typography.ts               ✅
  spacing.ts                  ✅
  formatters.ts               ✅
  featureFlags.ts
  mockData.ts                 ✅
  fireDefaults.ts
  instrumentCatalogue.ts      ✅ Session 09 — ~40 entries
  merchantKeywords.ts         (Session 12 — data layer)

/types
  spend.ts                    ✅
  portfolio.ts                ✅
  riskProfile.ts              ✅ Session 09
  instrumentCatalogue.ts      ✅ Session 09 — full type system
  fire.ts
  profile.ts
  insight.ts
  investmentPlan.ts

/services
  catalogueService.ts         (Session 12 — Supabase + static fallback)
  spendCategoriser.ts         (Session 12 — Layer 1/2/3)
  dataSource.ts
  csvDataSource.ts
  universalParser.ts
  priceRefresh.ts
  fxRefresh.ts
  amfiNavFeed.ts
  portfolioCalc.ts
  savingsRate.ts
  fireEngine.ts
  aiInsights.ts
  budgetCap.ts

/store
  householdStore.ts
  portfolioStore.ts
  spendStore.ts
  investStore.ts
  uiStore.ts

/context
  ThemeContext.tsx             ✅ useColorScheme() ONLY here

/docs
  CLAUDE.md
  CLAUDE-state.md
  CLAUDE-experience.md
  CLAUDE-financial.md
  CLAUDE-identity.md
  engineering-rules.md
  design-system.md
  ai-insights.md
  data-architecture.md
  freemium-boundaries.md
  kashe-prd-complete.md
  kashe-handoff-session-XX.md
```
