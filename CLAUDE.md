# Kāshe — CLAUDE.md
*Read this before starting any task in this project.*
*Last updated: 17 March 2026 — Session 10 complete.
Monthly Review executive brief format locked. Invest tab copy principles
locked. FIRE copy locked. File structure updated.*

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

---

## Tech Stack
```
Framework:      React Native via Expo (managed workflow)
Language:       TypeScript (strict)
Navigation:     Expo Router (file-based routing)
State:          Zustand
Storage:        react-native-encrypted-storage (AES-256)
Auth:           Google OAuth only via expo-auth-session
Fonts:          Space Grotesk (display/numbers) + Inter (body/UI)
                NEVER: Syne, DM Sans — permanently retired
Animation:      React Native Animated API only
                react-native-reanimated — banned from web builds
Price APIs:     Alpha Vantage / Finnhub / AMFI NAV / CoinGecko
FX:             ExchangeRate-API
AI Insights:    Claude API (claude-sonnet-4-20250514)
                Hard budget cap: €5.00/month client-side
                API key in encrypted storage — never in bundle
Analytics:      PostHog (anonymised, no PII) — four learning loops
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
            monthly review + optional FIRE planner
```

No standalone Insights tab. AI insights live on native screens.

Routes:
  /app/(tabs)/index.tsx     Home
  /app/(tabs)/spend.tsx     Spend
  /app/(tabs)/portfolio.tsx Portfolio
  /app/(tabs)/invest.tsx    Invest

---

## Invest Tab — What Lives Here (LOCKED)

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
                         L4: FIRE year + watchlist
                         System-responsive mode (intentional).

FinancialEducationSection Tier-matched content. Collapsible articles.
                         Never shows what user already demonstrates.

FIRETeaserCard           "When could you choose not to work?"
                         Freedom framing. Single low-pressure entry.
```

---

## AI Insights — Where They Live

```
Spend screen:     SpendInsightStrip
Portfolio screen: PortfolioInsightStrip
Holding detail:   HoldingInsightCard + HoldingPriceChart
Invest tab:       InvestmentPlanFull + MonthlyReviewCard
```

**Five types, priority ordered:**
```
1. MARKET_EVENT_ALERT      Time-sensitive, web search, tiered sources
2. PORTFOLIO_HEALTH        Action-needed, local calc + Claude
3. FIRE_TRAJECTORY         Important, not urgent
4. INVESTMENT_OPPORTUNITY  Helpful, zero API cost, fully templated
5. MONTHLY_REVIEW          Scheduled, executive brief format
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

### KasheScore (0–100)
Objective quality. Never shown as number. Drives ordering within tier.
PM updates quarterly. Cost(25) + Diversification(25) + Liquidity(20)
+ Regulatory(15) + Track record(15).

### Geography
```
NL/BE/DE/LU / IN / US / GB / GLOBAL (IBKR fallback)
Unknown geography: show GLOBAL entries +
  "We're building your region — here's what works globally"
```

### V1 → V2
V1: static file = seed + offline fallback
V2: Supabase table (identical schema) — Realtime, no release needed

---

## Spend Categorisation — LOCKED

```
Layer 1 → keyword rules (geography-aware, offline) — confidence 1.0
Layer 2 → Claude API (unrecognised only, ~€0.001) — confidence 0.8
Layer 3 → user correction (5+ occurrences → Layer 1) — confidence 1.0
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
4. Age          Skippable. FIRE only.
5. Risk Profile Conservative / Balanced / Growth
                KasheAsterisk + "Balanced is a good starting point"
6. Teach [+]    Static illustration
7. First Add    Guided universal add sheet
8. First Payoff Real data OR ghost
9. Budget       Conditional on screen 7 upload success
10. Complete    "Tap [+] anytime" → main app

Screen 3+5 together drive:
  → Geography-filtered instrument suggestions
  → FIRE inflation defaults
  → Spend merchant keyword set
  → Balanced recommendation (or user changes it)
```

---

## What NOT to Build
```
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
```

---

## Key Product Decisions — Do Not Re-Debate
```
"Your Position" not "Net Worth" everywhere
CSV only — no Excel, PDF, OFX
Local-first storage — privacy by architecture
Google OAuth only — no passwords
4 tabs: Home / Spend / Portfolio / Invest
No standalone Insights tab
Tab 4 = Invest — planning, risk profile, discovery, monthly review
FIRE optional — single low-pressure entry
Risk profile: 3 levels — drives allocation (never hardcoded)
Default: RECOMMEND Balanced — never silently assume
Product for ALL globally mobile professionals — not India-specific
Monthly Review: executive brief, four levels, system-responsive
FIRE copy: "choose not to work" — freedom framing
Invest copy: visuals first, no verbose paragraphs
KasheAsterisk punctuates AI-generated insights
"Worth exploring" always — never buy/sell
track_only instruments never suggested
KasheScore objective, editorial, never shown as number
Unknown geography: GLOBAL fallback + "building your region"
Spend: Layer 1 → Layer 2 → Layer 3 pipeline
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
  invest/fire.tsx
  sources.tsx

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
    FIRETeaserCard.tsx             ✅
    InstrumentDiscoverySection.tsx ✅
    FinancialEducationSection.tsx  ⬜ Session 11
  /shared
    AppHeader.tsx     ✅ universal — all tabs
    UniversalAddSheet.tsx ⬜
    EmptyState.tsx    ✅
    KasheAsterisk.tsx ✅
    MacronRule.tsx    ✅
    RedactedNumber.tsx ✅

/constants
  colours.ts typography.ts spacing.ts formatters.ts
  featureFlags.ts mockData.ts displayLabels.ts
  instrumentCatalogue.ts ✅
  fireDefaults.ts ⬜ Session 11
  merchantKeywords.ts ⬜ Session 12

/types
  spend.ts ✅  portfolio.ts ✅  riskProfile.ts ✅
  instrumentCatalogue.ts ✅  fire.ts ⬜ Session 11

/services
  catalogueService.ts ⬜ Session 12 (Supabase + fallback)
  spendCategoriser.ts ⬜ Session 12 (Layer 1/2/3)
  [all other services] ⬜ Session 12

/context
  ThemeContext.tsx ✅ (useColorScheme() ONLY here)
```
