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

## Non-Negotiables
- Never hardcode a colour value. Use tokens from /constants/colours.ts
- Every component handles both dark AND light mode
- Every screen has an empty state (blurred ghost pattern)
- [V2] and [NEVER] tags in the PRD mean: do not build
- TypeScript everywhere. No 'any' types.
- No new dependencies without PM approval

---

## Tech Stack
```
Framework:      React Native via Expo (managed workflow)
Language:       TypeScript (strict)
Navigation:     Expo Router (file-based routing)
State:          Zustand
Storage:        react-native-encrypted-storage
Auth:           Google OAuth via expo-auth-session
Fonts:          Expo Google Fonts — Syne + DM Sans
Blur:           @react-native-community/blur (iOS)
                Semi-transparent overlay fallback (Android)
Analytics:      PostHog (anonymised only, no PII)
Price APIs:     Alpha Vantage, Finnhub (free tier)
                AMFI NAV feed (Indian MFs)
                CoinGecko (crypto)
FX:             ExchangeRate-API
News:           Finnhub news API (filtered by ticker)
Backend:        Supabase (v1b only — couple sync)
Testing:        Jest + React Native Testing Library
```

---

## Design Tokens (use these, never raw values)

### Colours
```typescript
// Light mode
background:     '#F5F4F0'
surface:        '#FFFFFF'
border:         '#E8E8E3'
textPrimary:    '#1A1A18'
textSecondary:  '#8A8A85'
textDim:        '#C4C4BF'

// Dark mode
backgroundDark: '#111110'
surfaceDark:    '#1C1C1A'
borderDark:     '#2A2A28'
// text colours same in dark mode

// Brand (same in both modes)
accent:         '#C8F04A'   // acid green — use sparingly
danger:         '#FF5C5C'
warning:        '#FFB547'
```

### Typography
```typescript
// Syne for display, numbers, headings
// DM Sans for body, labels, captions

display:    { fontFamily: 'Syne_800ExtraBold', letterSpacing: -1.5 }
heading:    { fontFamily: 'Syne_700Bold' }
body:       { fontFamily: 'DMSans_400Regular' }
bodyMedium: { fontFamily: 'DMSans_500Medium' }
label:      { fontFamily: 'DMSans_500Medium',
              textTransform: 'uppercase', letterSpacing: 0.8 }
```

### Spacing (4px base grid)
```typescript
xs:  4,   sm: 8,   md: 12,
lg: 16,   xl: 20,  xxl: 24,
xxxl: 32
```

### Border Radius
```typescript
card:  16,
input: 12,
pill:  999,
small: 8
```

### Motion
```
Micro-animations: 200-300ms, ease-out
No shadows — borders only (flat design)
Loading: single pulsing accent dot, no spinners
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
    index.tsx           Welcome
    household.tsx       Single or couple
    location.tsx        Country + currency
    teach.tsx           Introduce [+]
    first-add.tsx       Guided upload
    payoff.tsx          First data view
    portfolio-teaser.tsx
    complete.tsx
  /settings
    index.tsx

/components
  /ui                   Base components (Button, Card, Typography)
  /home                 Home screen components
  /spend                Spend screen components
  /portfolio            Portfolio screen components
  /insights             Insights screen components
  /shared               UniversalAddSheet, EmptyState, etc

/constants
  colours.ts            All colour tokens
  typography.ts         All type styles
  spacing.ts            Spacing scale
  featureFlags.ts       FREE / FREEMIUM / PREMIUM gates
  mockData.ts           Fixed mock data for empty states

/hooks
  useColorScheme.ts     Dark/light mode
  usePortfolio.ts       Portfolio data access
  useSpend.ts           Spend data access
  useHousehold.ts       Profile/household management

/services
  dataSource.ts         Abstract DataSource interface
  csvDataSource.ts      CSV implementation
  priceRefresh.ts       All price API calls
  fxRefresh.ts          Exchange rate refresh
  portfolioCalc.ts      Position, allocation calculations
  savingsRate.ts        Savings rate formula
  spendCategoriser.ts   Transaction categorisation

/store
  householdStore.ts     Profiles, auth state
  portfolioStore.ts     Assets, liabilities
  spendStore.ts         Transactions
  uiStore.ts            Loading, error, modal states

/types
  asset.ts              Asset interface
  liability.ts          Liability interface
  transaction.ts        Transaction interface
  profile.ts            Profile + Household interfaces
  dataSource.ts         DataSource interface
```

---

## Key Product Decisions (do not re-debate)
```
CSV only — no Excel, PDF, OFX
Local-first storage — privacy by architecture
Google OAuth only — no passwords
4 tabs: Home / Spend / Portfolio / Insights
FIRE calculator in Insights tab
Acid green #C8F04A — brand accent, sparingly
"Your Position" not "Net Worth"
Physical assets (car, art) — out of scope, never build
DataSource abstraction — CSVDataSource in v1
featureFlag system — freemium ready, don't gate yet
Household + Managed profiles — covers couples + parents
Savings rate % — the v1 health metric
Blurred ghost empty states — invitations not errors
Both dark and light mode from day one
```

---

## What NOT to build
```
[V2]    Open banking API sync
[V2]    Push notifications
[V2]    Partner spend on Home screen
[V2]    Sparkline/chart behind position number
[V2]    Tax calculations (capture fields, don't surface)
[V2]    Property market estimate API
[V2]    Couple sync backend (Supabase)
[NEVER] Physical assets (car, art, jewellery)
[NEVER] Tax filing
[NEVER] Money transfers or payments
[NEVER] Social features or comparisons
[NEVER] Ads or data monetisation
[NEVER] Generic news feed
[NEVER] Gamification
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

## PRD Location
Full PRD: /docs/kashe-prd-complete.md
Read the TL;DR of each section first.
Only go deeper if your ticket requires it.
