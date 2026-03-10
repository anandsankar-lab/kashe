# Kāshe — Freemium Boundaries
*Read CLAUDE.md before this file.*
*This file defines what is FREE, FREEMIUM, and PREMIUM in V1.*

---

## The Principle

Kāshe launches fully free. No gates enforced in V1.
The flag system is built now so gates can be added later
without touching component logic.

Every feature is tagged. The tag is the spec.
When the business decides to enforce a gate, one line changes.
No component rewrites. No architecture changes.

---

## Feature Flags File

```typescript
// /constants/featureFlags.ts
// All features tagged here. Gates not enforced in V1.
// To enforce a gate: set the flag to false for free users.
// Paywall UX: benefit-led bottom sheet — never an error state.
//   "Unlock unlimited AI insights" NOT "You've used your 3 free analyses."

export const FEATURE_FLAGS = {

  // FREE — always available, no gate ever
  spend_analysis:        true,
  portfolio_overview:    true,
  basic_fire_calculator: true,
  csv_upload:            true,
  auto_price_refresh:    true,
  dark_light_mode:       true,
  single_profile:        true,

  // FREEMIUM — available free with limits, paid for unlimited
  // V1: all set to true (no enforcement)
  // Future: check usage count before allowing
  ai_insights:           true,   // 3 analyses/month free, unlimited paid
  fire_full_detail:      true,   // basic free, full calculator paid
  data_export:           true,   // 1 export/month free
  additional_profiles:   true,   // 2 profiles free, unlimited paid

  // PREMIUM — requires paid subscription
  // V1: couple_sync not built yet (V1b)
  // Others: flag only, no enforcement in V1
  couple_sync:           false,  // V1b — requires Supabase backend
  multi_currency_view:   true,
  advanced_ai_advice:    true,

} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
```

---

## What Is Built vs What Is Gated

### FREE — Build fully, never restrict

```
Spend tracking        Full spend screen, all categories,
                      all 12 months of history
Portfolio overview    All buckets, all holding types,
                      all detail screens
Basic FIRE calc       FIRE planner screen fully functional
                      Slider, inputs, assumptions card
CSV upload            All supported institutions
                      Universal parser for unknown banks
Auto price refresh    All market APIs (Alpha Vantage,
                      AMFI NAV, CoinGecko, FX rates)
Dark/light mode       Both modes, all components
Single profile        One OWNER profile fully supported
```

### FREEMIUM — Build fully, tag for future gating

```
AI insights           5 insight types built and functional
                      Tag: ai_insights
                      Future gate: 3 per month free
                      Counter lives in budgetCap.ts (already tracking)

Full FIRE detail      Complete FIRE planner built and functional
                      Tag: fire_full_detail
                      Future gate: basic projection free,
                      advanced inputs (mortgage step-down,
                      household toggle) paid

Data export           Not built in V1 — flag reserved for V2
                      Tag: data_export

Additional profiles   Profiles built and functional
                      Tag: additional_profiles
                      Future gate: >2 profiles requires paid
                      Profile count check goes in householdStore
```

### PREMIUM — Flag now, build when ready

```
Couple sync           [V1b] — requires Supabase E2E backend
                      Flag: couple_sync = false
                      PARTNER profile type exists in types,
                      but sync flow not built
                      Show greyed-out in FIREProfileSelector
                      with "[V2] — requires couple sync" note

Multi-currency view   Flag reserved
Advanced AI advice    Flag reserved
```

---

## Paywall UX (when gates are eventually enforced)

```
NEVER show an error state for hitting a free tier limit.
ALWAYS show a benefit-led bottom sheet.

Pattern:
  Kāshe asterisk (small, pulsing)
  Benefit headline: "Unlock unlimited AI insights"
  Not: "You've used your 3 free analyses this month"

  One clear benefit statement
  One price line (when pricing is set)
  [Unlock →] accent button
  [Maybe later] text link, textSecondary

This component does not exist in V1.
Flag it here so it's designed correctly when built.
```

---

## What Is NEVER Built (regardless of tier)

These are not feature gates. They are permanent scope boundaries.

```
Physical assets       Car, art, jewellery, gold, watches
                      These will never be in the asset model.

Tax calculations      Data is captured (purchase_price,
                      purchase_date) for future use.
                      Tax display and calculations: never V1.
                      Tax fields: V2 surface only.

Money transfers       No payments, no bank connections,
                      no sending money anywhere.

Social features       No comparisons, no leaderboards,
                      no "how do you compare" features.

Ads                   No advertising. Ever.
                      No data monetisation. Ever.

Generic news feed     Finnhub news is filtered to tickers
                      the user actually holds. That's it.
                      No generic market news.

Gamification          No badges, streaks, scores, or
                      achievement systems.

Business finances     Personal finance only. No company
                      accounts, no B2B features.

Buy/sell signals      Educational suggestions only.
                      Never "buy X" or "sell Y".

Affiliate links       Zero. Educational links only.
                      Disclaimer always visible.

Regulated advice      Kāshe is not a financial advisor.
                      Never present outputs as advice.
                      Always include appropriate caveats.
```

---

## V1 / V1b / V2 Scope Boundary

```
V1 (current build):
  4 tabs fully built
  All UI components
  CSV parsing (7 known institutions + universal)
  Price refresh services
  AI insights (5 types)
  FIRE planner
  Onboarding (10 screens)
  Settings
  Single OWNER profile
  Data encrypted locally

V1b (after V1 is stable):
  Couple sync (Supabase E2E encrypted)
  PARTNER profile type activated
  API key moves to Supabase Edge Functions
  Push notifications (opt-in)

V2:
  Open banking (Nordigen EU, Account Aggregator India, Plaid US)
  ML spend categorisation
  Tax field surface (data already captured in V1)
  Historical portfolio performance charts
  Property market estimate (Funda/Kadaster for NL)
  Year-end wrapped (built from 12-month review archive)
  Conversational advisor ("ask Kāshe anything")
  Sparkline charts
  Partner spend visible on Home screen
```
