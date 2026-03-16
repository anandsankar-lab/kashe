# Kāshe — CLAUDE.md
*Read this before starting any task in this project.*
*Last updated: 16 March 2026 — Tab 4 renamed to Invest,
Risk Profile added V1, product vision broadened to all expat professionals,
Insights tab removed, AI insights baked into Spend + Portfolio screens,
HoldingDetailScreen enriched with chart + insight card.*

---

## What is Kāshe?

A pocket investment advisor and financial clarity tool for globally
mobile professionals — anyone managing savings, investments, and
spending across more than one country or currency.

Tracks spending (CSV upload), investments (multi-geography portfolio),
and financial position. Gives genuinely personalised, intelligent
guidance through AI insights baked into every screen — not a
separate "Insights" tab.

React Native, iOS + Android.

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
  PPF, employer RSUs, EUR mortgage
- Nigerian product manager in London: Nigerian bonds, ISA, UK pension,
  Revolut savings, GBP + NGN exposure
- Brazilian designer in Berlin: Brazilian CDB, German ETF portfolio,
  German pension (bAV), EUR + BRL exposure
- Filipino nurse in Dubai: Philippine bonds, UAE savings, remittances,
  USD + PHP + AED exposure

What they share: investments in multiple geographies, two or more
currencies always in play, no single app that shows the full picture.
They know they're doing okay. They can't see exactly how okay.
Kāshe is that picture — and a trusted advisor alongside it.

**User test:** Would a 38-year-old expat professional with investments
in two countries, two currencies, and a half-formed sense of their
financial position find this genuinely useful and trustworthy?

---

## Non-Negotiables
- Never hardcode a colour value. Use tokens from /constants/colours.ts
- Every component handles both dark AND light mode
- Every screen has an empty state (ghost pattern — 0.5 opacity, NOT blur)
- [V2] and [NEVER] tags in the PRD mean: do not build
- TypeScript everywhere. No 'any' types.
- No new dependencies without PM approval
- Never show a financial number as zero — use empty state instead
- "Your Position" not "Net Worth" — everywhere in the app
- formatCurrency() from /constants/formatters.ts always.
  Never Intl.NumberFormat. Never template literals with raw numbers.
- Git commands always run manually by Anand. Never through Claude Code.
- MD files always downloaded and replaced in full. Never edited inline.

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
Backend:        Supabase (v1b only — couple sync, E2E encrypted)
Testing:        Jest + React Native Testing Library
```

---

## Four Tabs — LOCKED

```
Home        Your position at a glance
Spend       Spend tracking + spend-specific AI insights
Portfolio   Holdings + portfolio-specific AI insights
Invest      Risk profile + investment plan + monthly review
            + optional FIRE planner
```

**There is no standalone Insights tab.**
AI insights live on the screen they are relevant to.
The Invest tab is for planning and forward-looking guidance.

Tab bar labels: Home / Spend / Portfolio / Invest
Routes:
  /app/(tabs)/index.tsx        Home
  /app/(tabs)/spend.tsx        Spend
  /app/(tabs)/portfolio.tsx    Portfolio
  /app/(tabs)/invest.tsx       Invest (was insights.tsx)

---

## Invest Tab — What Lives Here

```
RiskProfileCard          Setup card — first thing on the tab
                         Conservative / Balanced / Growth
                         Drives allocation targets + suggestions

InvestmentPlanCard       Monthly target, bucket gap analysis,
                         salary contributions, suggested allocation
                         Promoted from Portfolio screen summary

InstrumentSuggestions    Contextual suggestions filtered by risk profile
                         + underfunded bucket + geography
                         PM-curated static list, no affiliate links
                         "Worth exploring" framing always

MonthlyReviewCard        Cross-domain review (spend + portfolio + FIRE)
                         Generated once per calendar month
                         Cached — never regenerates mid-month

FIRE Planner entry       Optional. Behind a single low-pressure row.
                         "Curious when you could stop working? →"
                         Full planner at /app/invest/fire.tsx
                         Not shown prominently — user opts in
```

---

## AI Insights — Where They Live

**Insights are baked into their native screens. Not centralised.**

```
Spend screen:
  SpendInsightStrip       Market-aware spend insight
                          e.g. "Eating out up 40% — 3-month high"
  SpendCategoryRow        Inline category-level insight variant
                          e.g. "Groceries 12% over 3-month avg"

Portfolio screen:
  PortfolioInsightStrip   Portfolio health + market event alerts
                          e.g. "RBI rate decision may affect your
                               Indian MF allocation"

HoldingDetailScreen:
  HoldingInsightCard      Holding-specific market news + analysis
                          Sourced via instrument-class routing
                          (fund house, issuer, regulatory sources)
  HoldingPriceChart       Line chart with 1M/6M/1Y tabs
                          Mock time-series data in V1
                          Real price feed in data layer session

Invest tab:
  InvestmentPlanCard      Gap analysis + allocation suggestions
  MonthlyReviewCard       Cross-domain monthly synthesis
```

**Five insight types, priority ordered:**
```
1. MARKET_EVENT_ALERT      Time-sensitive, web search
2. PORTFOLIO_HEALTH        Action-needed, local calc + Claude
3. FIRE_TRAJECTORY         Important, not urgent
4. INVESTMENT_OPPORTUNITY  Helpful, fully templated, zero API cost
5. MONTHLY_REVIEW          Scheduled, own card in Invest tab
```

---

## Risk Profile — V1 Feature (LOCKED)

```
Three levels:
  Conservative   "Protect what I have, grow slowly"
                  Target allocation: GROWTH 40% / STABILITY 40% / LOCKED 20%
  Balanced       "Grow steadily, some volatility is fine"
                  Target allocation: GROWTH 60% / STABILITY 20% / LOCKED 20%
  Growth         "Maximise growth, I can ride out dips"
                  Target allocation: GROWTH 80% / STABILITY 10% / LOCKED 10%

Default: Balanced (used until user sets profile)
Drives: allocation targets, instrument suggestions, portfolio health triggers
Setup: RiskProfileSheet — 3 plain-language questions, not a quiz
Stored: in householdStore per profile
```

---

## Sources Screen

```
Route:   /app/sources.tsx
Entry:   Home header [⋯] overflow menu
Purpose: All connected data sources, sync status,
         future API connections
NOT a tab — utility screen, accessed from overflow

V1: Manual + CSV sources only
V1b: API connections (open banking, broker APIs)
```

---

## Household & Profile Model
```
Household
├── id
├── name
├── baseCurrency (country of residence currency)
└── Profiles[]
    ├── id, name, type, householdId
    ├── googleAuthId   (null for MANAGED profiles)
    ├── baseCountry, baseCurrency
    ├── age            (captured in onboarding, used for FIRE calc)
    ├── riskProfile    (conservative / balanced / growth — NEW V1)
    └── Assets[]

PROFILE TYPES:
OWNER    Full access. Can add/edit/remove profiles.
PARTNER  Full access. Manages own assets.
         [V2 — requires couple sync backend]
MANAGED  No login required. Administered by OWNER.
         Primary use case: adult child tracking
         parents' investments in another country.

HOME SCREEN VIEW:
Default: Household (all profiles aggregated)
Switch:  Tap avatar (top-left) → profile sheet
```

---

## Asset & Liability Model
```
ASSET SUBTYPES (drives all logic — buckets, lock rules, projections):
  in_mutual_fund        Indian mutual funds (NAV from AMFI)
  in_direct_equity      Indian direct equity (NSE/BSE tickers)
  in_nre_nro            NRE/NRO savings accounts
  in_ppf                PPF (locked, projects at 7.1%)
  in_epf                EPF (locked, projects at 8.2%)
  in_fd                 Fixed deposit (locked, projects at 6.5%)
  in_nsc                NSC (locked, projects at 7.2%)
  eu_etf                European ETFs (Alpha Vantage/Finnhub)
  eu_pension            European pension fund
  us_equity             US stocks/ETFs
  employer_rsu          RSUs (Morgan Stanley StockPlan)
  employer_espp         ESPP
  cash_general          Savings/current accounts
  crypto_general        Cryptocurrency (CoinGecko)
  alternative_general   Crowdcube/Seedrs/angel (illiquid, manual)

ASSET CLASS (display/grouping only — never drives logic):
  equity, fixed_income, cash, alternative, pension

BUCKET SYSTEM (three buckets):
  GROWTH      Equity, high growth potential (default: 60%)
  STABILITY   Cash, savings, lower risk (default: 20%)
  LOCKED      Committed for a period (default: 20%)

  Protection is a DESIGNATION on a STABILITY holding —
  not a separate bucket. isProtection: boolean on holding.

DEFAULT_BUCKET in /types/portfolio.ts is the single source of truth.
Never duplicate this mapping anywhere else.

NEVER BUILD:
  Property equity — deferred to V2
  Physical assets (car, art, jewellery, gold, watches) — NEVER

LIABILITY TYPES:
  mortgage, personal_loan, car_loan, student_loan, credit_card

FINANCIAL POSITION FORMULA:
  financialPosition = liquidAssets + illiquidAssets - liabilities
```

---

## Data Freshness Rules
```
Spending CSV:       Nudge after 14 days
EU Brokerage CSV:   Nudge after 30 days
Indian MFs CSV:     Nudge after 30 days
NRE/NRO balance:    Nudge after 90 days
Employer stock:     Nudge after each vesting event
PPF/EPF:            Nudge annually (April)
Credit card:        Amber warning dot after 7 days

Freshness dot:  Green / Amber / Red
[V2]: Push notifications for staleness nudges
```

---

## CSV Input Model
```
FILE FORMAT: CSV only. No Excel, PDF, OFX, MT940. Ever.

PARSER APPROACH: Smart universal parser — not a fixed list.
Any CSV from any bank worldwide works.

Known banks (instant parse, zero friction):
  ABN Amro, DeGiro, HDFC Bank, CAMS,
  Zerodha/Groww, Morgan Stanley, Revolut

Unknown banks (one confirmation screen):
  App auto-detects column mapping
  User confirms: "Does this look right?" then proceeds

See CLAUDE-financial.md for full parser spec.
```

---

## Design Tokens (use these, never raw values)

### Colours
```typescript
// Light mode
background:     '#F5F4F0'
surface:        '#FFFFFF'
border:         '#EEEEEA'
textPrimary:    '#1A1A18'
textSecondary:  '#8A8A85'
textDim:        '#C4C4BF'

// Dark mode
backgroundDark: '#111110'
surfaceDark:    '#1C1C1A'
borderDark:     '#252523'

// Brand (same in both modes)
accent:         '#C8F04A'   // acid green — use sparingly
danger:         '#FF5C5C'
warning:        '#FFB547'
success:        '#C8F04A'

// Hero card tokens (always dark — both modes)
heroGradientStart:   '#1E1E1B'
heroGradientEnd:     '#131311'
heroTextPrimary:     '#F5F4F0'
heroTextSecondary:   'rgba(245,244,240,0.55)'
heroTextDim:         'rgba(245,244,240,0.35)'
heroAccent:          '#C8F04A'
heroBorder:          'rgba(200,240,74,0.2)'
heroDanger:          '#FF8080'
```

### Typography
```
Space Grotesk 700Bold    display numbers, hero figures
Space Grotesk 600SemiBold  headings, prominent labels
Space Grotesk 400Regular   monospaced-feel secondary numbers
Inter 500Medium          labels (uppercase), pills, CTAs
Inter 400Regular         body, captions, secondary content

Kerning:
  Display:  letterSpacing -1.5
  Headings: letterSpacing -0.5 to -0.8
  Body:     letterSpacing -0.2
  Labels:   letterSpacing +0.8 (uppercase only)
```

### Spacing
```
xs: 4    sm: 8    md: 12    lg: 16
xl: 20   xxl: 24  xxxl: 32

borderRadius.card:  16
borderRadius.hero:  24
borderRadius.input: 12
borderRadius.pill:  999
borderRadius.small: 8
```

---

## File Structure
```
/app
  (tabs)/
    index.tsx            Home
    spend.tsx            Spend
    portfolio.tsx        Portfolio
    invest.tsx           Invest (was insights.tsx)
  _layout.tsx
  spend/
    [category].tsx       Spend category detail
  portfolio/
    [holdingId].tsx      Holding detail screen
  invest/
    fire.tsx             FIRE Planner (optional flow)
  sources.tsx            Sources + connections screen

/components
  /home                  HomeHeader, PositionHeroCard, SpendStoryCard,
                         MarketsStrip, PortfolioPulse, FIREProgress,
                         SegregationToggle, MonthlyReviewLink
  /spend                 SpendScreenHeader, SpendSummaryStrip,
                         SpendInsightStrip, SpendCategoryList,
                         SpendCategoryRow, SpendTransactionRow,
                         TransactionEditSheet, SpendBudgetSheet,
                         TagFilterPills, BulkTagSheet, CategoryIcon
  /portfolio             PortfolioTotalsCard, PortfolioSectionHeader,
                         PortfolioHoldingRow, PortfolioInsightStrip,
                         InvestmentPlanCard, InstrumentSuggestionSheet,
                         BucketReassignSheet, LockedProjectionCard,
                         ProtectionStatusCard, HoldingPriceChart,
                         HoldingInsightCard
  /invest                RiskProfileCard, RiskProfileSheet,
                         InvestmentPlanFull, MonthlyReviewCard,
                         MonthlyReviewSheet, FIRETeaserCard,
                         PastReviewsList
  /fire                  FIRESliderHero, FIREInputsCard,
                         FIREAssumptionsCard, FIREProfileSelector
  /shared                UniversalAddSheet, EmptyState,
                         KasheAsterisk, MacronRule, RedactedNumber,
                         AppHeader, DataSourceSheet, NotificationDot

/constants
  colours.ts
  typography.ts
  spacing.ts
  formatters.ts          formatCurrency() — Intl.NumberFormat banned
  featureFlags.ts
  mockData.ts
  fireDefaults.ts        Country-based inflation defaults

/hooks
  useTheme.ts            (via ThemeContext)
  usePortfolio.ts
  useSpend.ts
  useHousehold.ts
  useInvest.ts           (was useInsights — invest tab state)
  useFirePlanner.ts
  useInvestmentPlan.ts
  useDataSources.ts

/services
  dataSource.ts
  csvDataSource.ts
  universalParser.ts
  salarySlipParser.ts
  priceRefresh.ts
  fxRefresh.ts
  amfiNavFeed.ts
  portfolioCalc.ts
  savingsRate.ts
  spendCategoriser.ts
  fireEngine.ts
  aiInsights.ts
  budgetCap.ts

/store
  householdStore.ts
  portfolioStore.ts
  spendStore.ts
  investStore.ts         (was insightsStore)
  uiStore.ts

/types
  asset.ts
  liability.ts
  transaction.ts
  profile.ts
  dataSource.ts
  insight.ts
  portfolio.ts
  investmentPlan.ts
  riskProfile.ts         NEW — RiskProfile interface
  fire.ts

/context
  ThemeContext.tsx        useColorScheme() called ONLY here

/docs
  CLAUDE.md              ← this file
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

---

## Key Product Decisions (do not re-debate)
```
"Your Position" not "Net Worth" — everywhere
Physical assets — NEVER build
CSV only — no Excel, PDF, OFX ever
Smart universal CSV parser — works with any bank worldwide
Local-first storage — privacy by architecture
Google OAuth only — no passwords ever
4 tabs: Home / Spend / Portfolio / Invest
No standalone Insights tab — insights live on native screens
Tab 4 is "Invest" — planning, risk profile, monthly review, optional FIRE
FIRE is optional — behind a single low-pressure entry point
Risk profile: 3 levels (Conservative/Balanced/Growth) — drives allocation
Allocation targets driven by risk profile, not hardcoded globally
  Conservative: 40/40/20   Balanced: 60/20/20   Growth: 80/10/10
Product is for ALL globally mobile professionals — not India-specific
  Mock data uses neutral instrument names, any nationality can relate
FIRE calculator lives at /app/invest/fire.tsx
FIRE is household-level by default, switchable to individual
FIRE mortgage step-down: mortgage end date reduces projected spend
Age captured in onboarding screen 4 (skippable)
Inflation defaults country-based:
  NL 3.0% / IN 5.0% / UK 3.0% / US 3.0% / Other 3.5%
  Stored in /constants/fireDefaults.ts. Always shown, always overridable.
Monthly Review: generated once per calendar month, cached entire month
  Lives in Invest tab. Linked from Home via MonthlyReviewLink.
HoldingDetailScreen: line chart + holding insight card (V1 with mock data)
Sources screen: /app/sources.tsx, entry via Home header [⋯]
Insight strip on Portfolio/Spend: doorbell. Invest tab: planning room.
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

## Onboarding Stack — 10 Screens
```
1. Welcome          Kāshe asterisk + tagline + Google OAuth
2. Name             "What's your name?"
3. Location         Country + base currency
4. Age              Skippable. Used for FIRE calc.
5. Risk Profile     Conservative / Balanced / Growth
                    Plain language. Not a quiz.
                    Pre-selects Balanced. User can change.
6. Teach [+]        Static illustration, introduce the gesture
7. First Add        Guided universal add sheet (isOnboarding=true)
8. First Payoff     Real data OR ghost
9. Budget Suggest   Conditional — only if screen 7 upload succeeded
10. Complete        "Tap [+] anytime" → main app
```

---

## What NOT to Build
```
[V2]    Open banking API sync
[V2]    Push notifications
[V2]    Partner spend on Home screen
[V2]    Real price chart data (chart shell built V1, data V2)
[V2]    Tax field capture
[V2]    Property market estimate API
[V2]    Couple sync backend (Supabase)
[V2]    ML-based spend categorisation
[V2]    Year-end wrapped
[V2]    Conversational advisor / ask Kāshe anything
[V2]    Historical insight log beyond monthly reviews
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
```

---

## Git Conventions
```
Commit format:  [TICKET-ID] Brief description
Example:        [PORT-10] HoldingDetailScreen + sub-components

Rules:
- One commit per logical ticket
- Always preview before committing
- Never commit broken code
- Never commit API keys or tokens
- Every commit includes code + updated MD files together
- Git always run manually by Anand in normal terminal
- Never run git through Claude Code
```

---

## PRD Location
Full PRD: /docs/kashe-prd-complete.md
Read CLAUDE-state.md and latest handoff doc first.
Only read PRD sections relevant to your current ticket.
