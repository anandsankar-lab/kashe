# Kāshe — AI Insights
*Read CLAUDE.md, engineering-rules.md, and data-architecture.md before this file.*
*This file covers all Claude API calls, the 5-insight engine, and the budget cap.*

---

## The Contract

Kāshe uses Claude's API for four things only:
1. Market Event Alert (with web search)
2. Portfolio Health Alert (local calc + Claude narrative)
3. FIRE Trajectory Change (local FIRE engine + Claude narrative)
4. Monthly Review (the richest call, once per month)

Investment Opportunity (Insight 4) costs ZERO — it's templated locally.
Never call Claude for something that can be computed deterministically.

---

## Hard Rules — Non-Negotiable

```
NEVER send absolute monetary values to Claude API
  Wrong: "User has €450,000 in their portfolio"
  Right: "Growth bucket: 62% of live portfolio"

NEVER send raw transactions
  Wrong: [array of Transaction objects]
  Right: aggregated category totals as percentages

NEVER recommend specific assets by name
  Wrong: "Consider buying more VWRL"
  Right: "Broad market ETFs are commonly used for Growth allocation"

NEVER guarantee outcomes
  Wrong: "You will reach FIRE in 12 years"
  Right: "At current pace, projected 2036 — estimates only"

NEVER use affiliate links
  Educational suggestions only, always with disclaimer
```

---

## Budget Cap — Check Before Every Call

Monthly budget: €5.00. Hard limit. Not a soft nudge.

```typescript
// /services/budgetCap.ts

interface AIUsageRecord {
  monthYear: string          // "2026-03"
  totalTokensInput: number
  totalTokensOutput: number
  estimatedCostEUR: number
  callCount: number
  lastUpdated: Date
}

// Before EVERY Claude API call:
async function checkBudget(estimatedCallCost: number): Promise<boolean> {
  const usage = await getUsageRecord()
  if (usage.estimatedCostEUR + estimatedCallCost > 5.00) {
    // Over budget — do not call API
    // Do not show error to user
    // Log internally for PM visibility
    return false
  }
  return true
}

// After every successful call:
async function logUsage(tokensIn: number, tokensOut: number): Promise<void> {
  // Update usage record in encrypted storage
  // Cost estimate: input at claude-sonnet-4-20250514 rates
}

// When budget exceeded:
// Insight strip does not render
// MonthlyReview shows State 3 ("insufficient data") UI
// No error message shown to user
```

---

## API Key Security

```
Stored: react-native-encrypted-storage (AES-256)
Never:  in source code, app bundle, GitHub, logs, analytics

Setup flow:
  Settings → AI Features → Enter API key
  Key stored alongside financial data
  Same protection level as bank transactions

V1b:  Move to Supabase Edge Functions when couple sync
      backend is introduced. One-line app change.

The API call in aiInsights.ts must read the key from
encrypted storage before every call. Never cache in memory.
```

---

## Insight 1 — Market Event Alert

```
Cost:    ~€0.01–0.02 per call
Cache:   24 hours (do not re-call until cache expires)
Trigger: Once per 24 hours on app open
Model:   claude-sonnet-4-20250514 + web_search tool enabled

Context sent (percentages only):
  Growth bucket: X% of live portfolio
    India equity: X%
    EU/US equity: X%
    Employer stock: X% (sector: Y)
  Stability bucket: X%
  Locked bucket: X%
  Currency exposure: X% INR, X% EUR

Prompt instruction to Claude:
  Run 5–7 web searches across research tiers.
  Find ONE most actionable event in last 48 hours.
  Return null if nothing material.

Research tiers (instruct Claude to search these):
  TIER 1: RBI, SEBI, AMFI, NSE/BSE, ECB, Fed,
          Reuters, Bloomberg, FT, WSJ,
          Economic Times, Mint, Business Standard,
          NRC Financieel Dagblad, Morningstar
  TIER 2: Seeking Alpha, ValueResearch, Moneycontrol,
          Bogleheads, Zerodha Varsity community
  TIER 3: r/IndiaInvestments, r/DutchFIRE, r/EuropeFIRE,
          r/financialindependence, r/wallstreetbets,
          Stocktwits (bullish/bearish for held stocks),
          Twitter #NIFTY #SP500 #ECB #MutualFunds

JSON response shape:
{
  headline: string,           // max 10 words
  body: string,               // max 40 words
  holdingType: string,
  source: string,
  sourceUrl: string,
  sentiment: 'bullish' | 'bearish' | 'mixed' | 'neutral',
  confidence: 'high' | 'medium' | 'low',
  forumSignal: {
    summary: string,          // max 15 words
    platforms: string[]
  } | null
} | null
```

---

## Insight 2 — Portfolio Health Alert

```
Cost:    ~€0.002 per call
Cache:   Expires when holdings data changes
Trigger: Data change OR weekly check
Model:   claude-sonnet-4-20250514 (no web search)

Trigger conditions (any one sufficient):
  Growth bucket <50% (>10% below 60% target)
  Single holding >15% of live portfolio value
  Employer stock >15% of live portfolio
  No protection designation + cash holdings exist
  Monthly invested < target * 0.8
  INR weakened >3% vs EUR in rolling 90 days + India >20%
  Vesting event within 30 days

Context sent (local calculations only):
  allocationByBucket (percentages)
  largestHoldingPct
  employerStockPct
  hasProtectionDesignation
  monthlyInvestedVsTarget (percentage)
  currencyExposure (percentages)
  upcomingVestingDays

Prompt rules:
  Be specific — use the actual numbers.
  Do not recommend specific assets by name.
  Show the picture — user decides action.
  Max 10 word headline, 40 word body.

JSON response shape:
{
  headline: string,
  body: string,
  action: string | null
}
```

---

## Insight 3 — FIRE Trajectory Change

```
Cost:    ~€0.002 per call
Cache:   Expires when FIRE inputs change
Trigger: Projected FIRE year shifts >6 months vs last month
         Both directions trigger — good news too

Context sent:
  previousProjectedYear
  currentProjectedYear
  shiftMonths
  direction: 'earlier' | 'later'
  spendChangePct
  investmentChangePct
  portfolioChangePct
  mortgageStepDownOccurring: boolean

Prompt rules:
  Explain what caused the shift.
  If later: what would reverse it.
  If earlier: what would sustain it.
  Max 10 word headline, 40 word body.

JSON response shape:
{
  headline: string,
  body: string,
  action: string | null
}
```

---

## Insight 4 — Investment Opportunity

```
Cost:    ZERO — fully templated, no Claude call
Trigger: savingsRate >20% AND investment_transfer < target * 0.8

Template (constructed locally):
  headline: "{amount} uninvested this month"
  body: "Your {bucket} bucket is furthest from target.
         See suggested instruments to put this to work."
  action: VIEW_SUGGESTIONS → opens InstrumentSuggestionSheet

The InstrumentSuggestionSheet is a static curated list.
It is NOT AI-generated. It is NOT fetched dynamically.
It is a hand-curated list updated by PM quarterly.
No affiliate links. Educational framing only. Always with disclaimer.
```

---

## Insight 5 — Monthly Review

```
Cost:    ~€0.008 per call (richest prompt)
Cache:   Entire calendar month — never regenerates mid-month
Trigger: First app open of new calendar month
Minimum: 3 months spend + portfolio data required
Model:   claude-sonnet-4-20250514 (no web search)

Context sent (percentages only — no absolute values):
  allocationByBucket (percentages)
  spendLastMonthVs3MonthAvg (per category, percentages)
  FIREProgress (percentage of FIRE number, years to go)
  protectionCoverageMonths
  investmentPlanGapPct
  mortgageStepDownOccurredThisPeriod: boolean

Prompt rules:
  Be specific — use the data, not generalities.
  Never recommend specific funds by name.
  Category-level guidance only (Growth / Stability / Locked).
  Warm but direct — no jargon.
  If data insufficient for a section: say so honestly.
  If FIRE not set up: fireUpdate = null, do not fabricate.

JSON response shape (strict — parse directly into MonthlyReview type):
{
  whereYouStand: string,
  howMoneyIsWorking: {
    growth: string,
    stability: string,
    locked: string,
    protection: string
  },
  thisMonthsPriority: {
    headline: string,
    reasoning: string,
    bucketTarget: 'GROWTH' | 'STABILITY' | 'LOCKED' | null
  },
  fireUpdate: {
    headline: string,
    detail: string
  } | null,
  nextMonthWatchlist: string[]   // 2–3 items max
}
```

---

## Priority Order (one insight shown at a time)

```
MARKET_EVENT_ALERT     (highest — time-sensitive)
PORTFOLIO_HEALTH
FIRE_TRAJECTORY
INVESTMENT_OPPORTUNITY (lowest — helpful but not urgent)

Monthly Review is separate — it has its own card and sheet.
It never competes with the insight strip.
```

---

## Cache Invalidation

```
MARKET_EVENT_ALERT:     expires 24 hours from generation
PORTFOLIO_HEALTH:       invalidate on any holdings change
                        invalidate on bucket reassignment immediately
FIRE_TRAJECTORY:        invalidate on any FIRE input change
INVESTMENT_OPPORTUNITY: invalidate on investment_transfer change
MONTHLY_REVIEW:         invalidate on first day of new month
                        (triggers fresh generation on next app open)

Implementation:
  triggerHash = hash(the data that triggers the insight)
  On data change: compare new hash vs stored hash
  If different: clear cached insight, regenerate on next open
```

---

## The aiInsights.ts Service

```typescript
// /services/aiInsights.ts

// This service:
// 1. Reads portfolio/spend data from stores (via injected deps)
// 2. Checks budget cap before every call
// 3. Builds prompt with percentages only
// 4. Calls Claude API
// 5. Parses JSON response
// 6. Stores result in insightsStore
// 7. Logs token usage to budgetCap service

// It does NOT:
// - Touch any UI component
// - Know anything about how insights are displayed
// - Send absolute monetary values
// - Cache in memory (cache lives in encrypted storage)
```

---

## UI Rendering Rules (for Team Member 2)

These rules govern how the insight strip renders.
The strip is a doorbell, not a room. The Insights tab goes deeper.

```
Insight strip (Home + Portfolio + Spend):
  One compact card when active
  Kāshe asterisk (small, static — not pulsing)
  Headline + body (trimmed to spec limits)
  Dismiss: swipe left or tap ×, hidden for 24 hours
  Tap → InsightDetailSheet (shared component)

MARKET_EVENT only additions in strip:
  Source: "via Reuters · 3 hours ago" (textDim, small)
  LOW confidence: "Limited sources available" (textDim, small)
  Forum signal: "⚡ Stocktwits 68% bearish · r/stocks mixed"
    Only when institutional vs retail diverges

INVESTMENT_OPPORTUNITY renders differently:
  No KasheAsterisk (it's templated, not AI-generated)
  Label: "OPPORTUNITY" instead of "MARKET EVENT" etc.
  [Explore options →] → InstrumentSuggestionSheet

InsightsEmptyInsightState (no active insight):
  Small KasheAsterisk (static)
  "Nothing needs your attention right now."
  "Checked X hours ago" (textDim, small)
  No CTA. No encouragement to add data. Intentional silence.
  This is a trusted advisor being quiet — it's good news.
```
