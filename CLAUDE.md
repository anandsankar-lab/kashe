# Kāshe — CLAUDE.md
*Read this before starting any task in this project.*

---

## What is Kāshe?
Personal finance app for globally mobile Indian professionals.
Tracks spending (CSV upload), investments (multi-geography),
and financial position. React Native, iOS + Android.

**You are building one screen / one service / one component at a time.**
Do not implement anything not in your current ticket.
When in doubt — do less, ask the PM.

---

## The User We Are Building For
Indian professional, 32–45, living in Netherlands / UK / US.
Investments split across India and abroad:
- Indian mutual funds (CAMS, Zerodha, Groww)
- Indian direct equity (Demat account)
- NRE/NRO savings accounts
- PPF / EPF (slow-moving, updated annually)
- EU/US brokerage (DeGiro, IBKR)
- Employer stock — RSUs or ESPP (Morgan Stanley StockPlan)
- Possibly a mortgage in Europe
- Possibly Crowdcube / Seedrs / angel investments

Two currencies minimum. INR always in the picture.
They know they're doing okay but can't see the full picture.
Kāshe is that picture.

**User test:** Would a 38-year-old Indian engineer in Amsterdam
with Indian MFs and DeGiro ETFs find this genuinely useful?

---

## Non-Negotiables
- Never hardcode a colour value. Use tokens from /constants/colours.ts
- Every component handles both dark AND light mode
- Every screen has an empty state (blurred ghost pattern)
- [V2] and [NEVER] tags in the PRD mean: do not build
- TypeScript everywhere. No 'any' types.
- No new dependencies without PM approval
- Never show a financial number as zero — use empty state instead
- "Your Position" not "Net Worth" — everywhere in the app

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
Fonts:          Expo Google Fonts — Syne + DM Sans
Blur:           @react-native-community/blur (iOS)
                Semi-transparent overlay fallback (Android)
Analytics:      PostHog (anonymised only, no PII)
Price APIs:     Alpha Vantage (stocks/ETFs, free tier 25/day)
                Finnhub (news + prices, free tier 60/min)
                AMFI NAV feed (Indian MFs, free, no key)
                CoinGecko (crypto, free, no key)
FX:             ExchangeRate-API (free, no key for basic)
News:           Finnhub news API (filtered by owned tickers only)
AI Insights:    Claude API (claude-sonnet-4-20250514)
Backend:        Supabase (v1b only — couple sync, E2E encrypted)
Testing:        Jest + React Native Testing Library
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
    └── Assets[]

PROFILE TYPES:
OWNER    Full access. Can add/edit/remove profiles.
PARTNER  Full access. Manages own assets.
         [V2 — requires couple sync backend]
MANAGED  No login required. Administered by OWNER.
         Primary use case: adult child tracking
         parents' investments in India.

HOME SCREEN VIEW:
Default: Household (all profiles aggregated)
Switch:  Tap avatar (top-left) → profile sheet
         Shows: Household / Anand / Puhoop / Amma & Achan / [+ Add]

PROFILE LIMIT:
v1:      Unlimited (freemium gate flagged but not enforced)
Future:  >2 profiles = PREMIUM
```

---

## Asset & Liability Model
```
ASSET TYPES (financial instruments only):
  indian_mf         Indian mutual funds (NAV from AMFI)
  indian_equity     Indian direct equity (NSE/BSE tickers)
  nre_nro           NRE/NRO savings accounts (manual balance)
  ppf_epf           PPF / EPF (manual, updated annually)
  eu_brokerage      European ETFs/stocks (Alpha Vantage/Finnhub)
  employer_stock    RSUs/ESPP (Morgan Stanley — highest conc. risk)
  crypto            Cryptocurrency (CoinGecko)
  alternative       Crowdcube/Seedrs/angel (illiquid, manual)
  cash              Savings accounts, current accounts

NEVER BUILD:
  Property equity — different valuation methods per market, deferred to v2
  Physical assets (car, art, jewellery, gold, watches) — never

LIQUID vs ILLIQUID:
  Liquid:   indian_mf, indian_equity, nre_nro, ppf_epf,
            eu_brokerage, employer_stock, crypto, cash
  Illiquid: alternative (Crowdcube/Seedrs/angel only)

DISPLAY RULE:
  Always show liquid and illiquid separately.
  Never combine into one number without distinction.

LIABILITY TYPES:
  mortgage          Property loan (the debt, not the asset)
  personal_loan     Personal/consumer loan
  car_loan          Vehicle financing
  student_loan      Education loan
  credit_card       Manual balance snapshot
                    Amber staleness warning after 7 days
                    Show credit utilisation ratio

FINANCIAL POSITION FORMULA:
  financialPosition = liquidAssets + illiquidAssets - liabilities
  Clean and honest. No property estimates. No guesswork.
```

---

## Data Freshness Rules
```
Spending CSV:       Nudge after 14 days
EU Brokerage CSV:   Nudge after 30 days
Indian MFs CSV:     Nudge after 30 days
NRE/NRO balance:    Nudge after 90 days
Employer stock:     Nudge after each vesting event
PPF/EPF:            Nudge annually (April — Indian financial year)
Credit card:        Amber warning dot after 7 days
Property equity:    Nudge annually

Freshness dot:  Green (fresh) / Amber (getting stale) / Red (stale)
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
background:     '#F5F4F0'   // warm off-white
surface:        '#FFFFFF'
border:         '#E8E8E3'
textPrimary:    '#1A1A18'
textSecondary:  '#8A8A85'
textDim:        '#C4C4BF'

// Dark mode
backgroundDark: '#111110'   // warm near-black
surfaceDark:    '#1C1C1A'
borderDark:     '#2A2A28'
// Text colours are the same in both modes

// Brand (same in both modes)
accent:         '#C8F04A'   // acid green — use sparingly
danger:         '#FF5C5C'
warning:        '#FFB547'
success:        '#C8F04A'   // same as accent
```

### Typography
```typescript
// Syne: display, numbers, headings
// DM Sans: body, labels, captions

display:    { fontFamily: 'Syne_800ExtraBold', letterSpacing: -1.5 }
heading:    { fontFamily: 'Syne_700Bold' }
body:       { fontFamily: 'DMSans_400Regular' }
bodyMedium: { fontFamily: 'DMSans_500Medium' }
label:      { fontFamily: 'DMSans_500Medium',
              textTransform: 'uppercase', letterSpacing: 0.8 }
```

### Spacing (4px base grid)
```typescript
xs: 4,  sm: 8,   md: 12,
lg: 16, xl: 20,  xxl: 24,  xxxl: 32
```

### Border Radius
```typescript
card: 16,  input: 12,  pill: 999,  small: 8
```

### Motion
```
Micro-animations: 200-300ms ease-out
Price updates:    Gentle tick on number change
Transitions:      Slide (not fade) — feels native
Loading:          Single pulsing accent dot — no spinners
No shadows:       Borders only — flat design throughout
```

---

## Brand Elements
```
LOGO MARK:
  6-point asterisk
  5 strokes: #8A8A85 (textSecondary)
  1 stroke (the k): #C8F04A (accent)
  Animation: opacity pulse 0.4 to 1.0 to 0.4, 2s loop
             On loading: slow 8s rotation

MACRON RULE (ā):
  1px horizontal line in accent colour (#C8F04A)
  Used ONLY as a meaningful divider:
    - Between assets and liabilities in Position hero
    - Active tab indicator in bottom nav
    - Progress bar fill
    - Between India / Europe sections in Portfolio
  Never used as pure decoration
```

---

## Empty State Pattern
```
Every screen and every card must have an empty state.
Never show a financial number as zero.

Structure:
  Full-screen blurred ghost (realistic mock data from mockData.ts)
  + Frosted card centred over blur:
      Kāshe asterisk (slow pulse)
      One headline (what this screen shows when populated)
      One [+] CTA button (accent colour)
      Optional: one secondary text link

iOS:     @react-native-community/blur (BlurView)
Android: Semi-transparent overlay (#111110 at 70% opacity)
Mock data: always from /constants/mockData.ts — fixed constants only
```

---

## Feature Flags
```
/constants/featureFlags.ts

FREE
  spend_analysis, portfolio_overview, basic_fire_calculator,
  csv_upload, auto_price_refresh, dark_light_mode, single_profile

FREEMIUM (flagged now, gates enforced later)
  ai_insights          3 analyses/month free, unlimited paid
  fire_full_detail     Basic free, full calculator paid
  data_export          1 export/month free
  additional_profiles  2 profiles free, unlimited paid

PREMIUM
  couple_sync          Requires Supabase backend (v1b)
  multi_currency_view
  advanced_ai_advice

Paywall UX: benefit-led bottom sheet, never an error.
"Unlock unlimited AI insights" not "You've used your 3 free analyses."
```

---

## Agent Architecture
Three specialised team members. Each reads CLAUDE.md first,
then their own file. They never cross boundaries.

```
Team Member 1 — Identity & Trust       → CLAUDE-identity.md
  Auth, profiles, household, encrypted storage, security pipeline

Team Member 2 — Experience & Delight   → CLAUDE-experience.md
  All UI: screens, components, animations, empty states
  Consumes data via hooks — never fetches directly

Team Member 3 — Financial Intelligence → CLAUDE-financial.md
  CSV parser, price APIs, calculations, FIRE engine, AI insights
  Produces data shapes and services — never touches UI
```

---

## File Structure
```
/app
  /(tabs)
    index.tsx           Home
    spend.tsx           Spend
    portfolio.tsx       Portfolio
    insights.tsx        Insights
  /onboarding
    index.tsx           Welcome + Google OAuth
    household.tsx       Single or couple?
    location.tsx        Country + base currency
    teach.tsx           Introduce [+] gesture
    first-add.tsx       Guided universal add sheet
    payoff.tsx          First data view (real or ghost)
    budget-suggest.tsx  Budget suggestion (conditional — upload only)
    portfolio-teaser.tsx
    complete.tsx        Tap [+] anytime → main app
  /settings
    index.tsx

/components
  /ui                   Button, Card, Typography, Avatar,
                        Badge, ProgressBar, Divider
  /home                 PositionHeroCard, SpendSnapshot,
                        FIREProgress, CoverageCard,
                        SavingsRateBadge, MarketsStrip,
                        PortfolioPulse, SegregationToggle
  /spend                (specced in Spend screen session)
  /portfolio            (specced in Portfolio screen session)
  /insights             (specced in Insights screen session)
  /shared               UniversalAddSheet, EmptyState,
                        KasheAsterisk, MacronRule,
                        NotificationDot

/constants
  colours.ts            All colour tokens (both modes)
  typography.ts         All type styles
  spacing.ts            Spacing scale
  featureFlags.ts       FREE / FREEMIUM / PREMIUM gates
  mockData.ts           Fixed mock data for empty states

/hooks
  useColorScheme.ts
  usePortfolio.ts
  useSpend.ts
  useHousehold.ts

/services
  dataSource.ts         Abstract DataSource interface
  csvDataSource.ts      Smart universal CSV parser (v1)
  universalParser.ts    Column detection + confidence scoring
  priceRefresh.ts       Orchestrates all price API calls
  fxRefresh.ts          Exchange rate refresh
  amfiNavFeed.ts        Indian MF NAV feed
  portfolioCalc.ts      Position, allocation, coverage score
  savingsRate.ts        Savings rate formula
  spendCategoriser.ts   Transaction to category mapping
  fireEngine.ts         FIRE calculator + projections
  aiInsights.ts         Claude API integration

/store
  householdStore.ts     Profiles + auth state
  portfolioStore.ts     Assets + liabilities
  spendStore.ts         Transactions
  uiStore.ts            Loading, error, modal states

/types
  asset.ts
  liability.ts
  transaction.ts
  profile.ts
  dataSource.ts
  insight.ts

/docs
  kashe-prd-complete.md
```

---

## Key Product Decisions (do not re-debate)
```
"Your Position" not "Net Worth" — everywhere
Physical assets (car, art, jewellery) — NEVER build
CSV only — no Excel, PDF, OFX ever
Smart universal CSV parser — works with any bank worldwide
Local-first storage — privacy by architecture
Google OAuth only — no passwords ever
4 tabs: Home / Spend / Portfolio / Insights
FIRE calculator lives in Insights tab
Acid green #C8F04A — brand accent, used sparingly
DataSource abstraction — CSVDataSource v1, open banking v2
featureFlag system — freemium ready, don't gate in v1
Household + Managed profiles — covers couples + parents
Savings rate % — the v1 financial health metric
investment_transfer is NOT spend — excluded from savings rate
Liquid and illiquid always shown separately — never combined
Blurred ghost empty states — invitations not errors
Both dark and light mode on every single component from day one
```

---

## What NOT to Build
```
[V2]    Open banking API sync
[V2]    Push notifications
[V2]    Partner spend on Home screen
[V2]    Sparkline charts
[V2]    Tax field capture (never surface, only store)
[V2]    Property market estimate API
[V2]    Couple sync backend (Supabase)
[V2]    ML-based spend categorisation
[V2]    Historical portfolio performance charts
[NEVER] Physical assets (car, art, jewellery, watches)
[NEVER] Tax filing or tax calculations
[NEVER] Money transfers or payments
[NEVER] Social features or comparisons
[NEVER] Ads or data monetisation
[NEVER] Generic market news feed
[NEVER] Gamification (badges, streaks, scores)
[NEVER] Business or company finances
```

---

## Git Conventions
```
Branch naming:  feature/TICKET-ID-short-description
                fix/TICKET-ID-short-description
                chore/TICKET-ID-short-description

Commit format:  [TICKET-ID] Brief description
Example:        [HOME-02] Build PositionHeroCard component

Rules:
- One commit per logical change
- Never commit directly to main
- Always work on a feature branch
- PR required before merge
- CI must pass before merge

Never commit:
- API keys or tokens (use .env)
- .env files
- node_modules/
- .DS_Store
- Expo build artifacts (dist/, .expo/)
```

---

## PRD Location
Full PRD: /docs/kashe-prd-complete.md
Read the TL;DR of each section first.
Only go deeper if your ticket requires it.
