# Kāshe — AI Insights
*Read CLAUDE.md, engineering-rules.md, and data-architecture.md before this file.*
*Last updated: 16 March 2026 — Scalable source architecture, weighted tier system,
dynamic discovery, structured reasoning chain.*

---

## The Contract

Kāshe uses Claude's API for four things only:
1. Market Event Alert (seed + discover + reason)
2. Portfolio Health Alert (local calc + Claude narrative)
3. FIRE Trajectory Change (local FIRE engine + Claude narrative)
4. Monthly Review (richest call, once per month)

Investment Opportunity (Insight 4) costs ZERO — templated locally.
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

NEVER fabricate sources
  If Claude cannot find corroboration: confidence = LOW, still surface
  If nothing material in 48 hours: return null
```

---

## Budget Cap — Hard Limit €5.00/month

```typescript
// /services/budgetCap.ts

interface AIUsageRecord {
  monthYear: string           // "2026-03"
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

Approximate monthly cost breakdown at daily Market Event triggers:
```
Market Event Alert (daily):       ~€0.025/call × 30 = €0.75
  Includes discovery pass:        +€0.005/call × 30 = €0.15
Portfolio Health (weekly):        ~€0.002/call × 4  = €0.008
FIRE Trajectory (on change):      ~€0.002/call × 4  = €0.008
Monthly Review (once):            ~€0.008/call × 1  = €0.008
                                             Total ≈ €0.92/month

Well within €5.00 cap. Buffer exists for catch-up calls
after offline periods or re-triggers on data change.
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

## Source Architecture — Seed + Discover + Weight

The source system has three layers. Hardcoded seed sources are
the anchor. Dynamic discovery adapts to the user's holdings each
session. Tier weighting ensures signal quality is always explicit.

### Tier Definitions and Maximum Weights

```
TIER 1 — AUTHORITATIVE (max weight: 50 points per source)
  Regulators, central banks, tier-1 wire services.
  Always searched first. Corroboration from 2+ Tier 1 sources
  = confidence HIGH. Corroboration from 1 = confidence MEDIUM.

TIER 2 — ANALYSIS (max weight: 30 points per source)
  Practitioners, research platforms, quality financial media.
  Strong Tier 2 signal alone = confidence MEDIUM.
  Tier 2 + any Tier 1 corroboration = confidence HIGH.

TIER 3 — SOCIAL SENTIMENT (max weight: 20 points per source)
  Reddit, Stocktwits, Twitter/X, YouTube/Instagram signals.
  Never sufficient alone for a factual claim.
  Always shown as sentiment context, never as primary source.
  Strong Tier 3 signal (>70% directional consensus across
  3+ platforms) = always surfaced, even without Tier 1/2
  corroboration, labelled clearly as "retail sentiment signal".
  Tier 3 diverging from Tier 1/2 = flagged as divergence signal.

CONFIDENCE CALCULATION:
  score = sum of (source weight × corroboration count)
  score ≥ 80:  confidence HIGH
  score 40–79: confidence MEDIUM
  score < 40:  confidence LOW (surface with dim note)
  score 0 (Tier 3 only): confidence SENTIMENT_ONLY
    Label: "Retail sentiment signal — no institutional corroboration"
```

---

### Seed Sources — Hardcoded, PM-versioned Quarterly

These are always included in every Market Event search,
regardless of holdings. Small, high-trust, non-negotiable.

```
INDIA (always searched if India exposure > 0%):
  Tier 1: RBI, SEBI, AMFI, NSE/BSE announcements,
          Economic Times, Business Standard, Mint,
          Reuters India, Bloomberg India

NETHERLANDS / EUROPE (always searched if EUR exposure > 0%):
  Tier 1: ECB, DNB (De Nederlandsche Bank), AFM,
          Het Financieele Dagblad, Reuters Europe,
          Bloomberg Europe, Euronext announcements

UNITED STATES (always searched if US exposure > 0%):
  Tier 1: Federal Reserve, SEC, Wall Street Journal,
          Bloomberg US, Reuters US, Associated Press

UNITED KINGDOM (always searched if GBP exposure > 0%):
  Tier 1: Bank of England, FCA, Financial Times,
          Reuters UK

GLOBAL (always searched regardless of holdings):
  Tier 1: Reuters Wire, Bloomberg Wire, Financial Times,
          Morningstar, S&P Global, Moody's

Last updated: March 2026. Next review: June 2026.
```

---

### Dynamic Discovery — Per Session, Per Holdings Profile

Before each Market Event search, Claude runs a discovery pass.
This is a separate, cheap call (~€0.005) that generates a
session-specific source list adapted to the user's actual holdings.

```
DISCOVERY PROMPT (sent before main search):

"Given this holdings profile:
  {holdingsContext — instrument types and geographies only}

Identify the 10 most relevant additional sources to search
for market events in the last 48 hours. Return only source
names and URLs. Do not search them yet.

Prioritise sources that:
  1. Cover the specific instrument types held (ETFs, MFs, direct equity)
  2. Have published in the last 48 hours
  3. Are not already in this seed list: {seedSourceNames}

Return as JSON array: [{name, url, tier}]"

DISCOVERY EXPANDS TO INCLUDE (examples — not exhaustive):

India equity/MF specific:
  Tier 2: Capitalmind, Freefincal, ValueResearch Online,
          Moneycontrol, ET Markets, Zerodha Varsity updates,
          CRISIL research, Morningstar India, Groww blog,
          ICRA, India Ratings, CARE Ratings,
          PPFAS blog (for flexi-cap holders),
          Mirae Asset India research

Europe ETF specific:
  Tier 2: justETF, Curvo blog, Trackinsight,
          Morningstar Europe, Bogleheads EU threads,
          The Poor Swiss, Finanzfluss (DE), IEX.nl (NL),
          Mijngeldzaken.nl, Geldnerd.nl (NL FIRE community)

US market specific:
  Tier 2: Seeking Alpha, Morningstar US, Barron's,
          MarketWatch, Investopedia analysis,
          Simply Wall St, Motley Fool analysis

UK market specific:
  Tier 2: Hargreaves Lansdown research, AJ Bell Youinvest,
          This is Money, MoneyWeek, Interactive Investor,
          Stockopedia, The Motley Fool UK

Employer stock specific (when employer_rsu or employer_espp held):
  Tier 2: SEC EDGAR (company filings), company IR page,
          Glassdoor news, LinkedIn company announcements

Crypto specific (when crypto_general held):
  Tier 2: CoinDesk, The Block, Decrypt, CoinTelegraph

FIRE / personal finance community:
  Tier 2: Early Retirement Now (ERN), Mr Money Mustache,
          Physician on FIRE, r/DutchFIRE wiki,
          Financial Independence EU community

Social sentiment (always included in discovery):
  Tier 3 — Reddit:
    r/IndiaInvestments, r/IndianStreetBets,
    r/DutchFIRE, r/EuropeFIRE, r/financialindependence,
    r/leanfire, r/fatFIRE, r/wallstreetbets, r/stocks,
    r/investing, r/ETFs, r/Bogleheads,
    r/UKPersonalFinance, r/UKInvesting,
    r/germany (finance threads), r/Netherlands (finance threads),
    r/mutualfunds, r/IndiaFinance

  Tier 3 — Stocktwits:
    Symbol-level streams for every ticker held.
    Bullish/bearish ratio. Volume of posts in 24h.
    Unusual spike in post volume = always flag regardless of direction.

  Tier 3 — Twitter/X:
    #NIFTY #Sensex #IndianMarkets #MutualFunds
    #SP500 #FTSE #DAX #AEX #ECB #Fed #RBI
    #FIRE #IndexFunds #ETF #earnings
    Cashtags for tickers held (e.g. $INFY $VWRL)

  Tier 3 — YouTube/Instagram (sentiment signal only):
    Track upload frequency + topic keywords for:
    IN: Akshat Shrivastava, Pranjal Kamra, CA Rachana Ranade,
        Shankar Nath, Nithin Kamath (Zerodha)
    GLOBAL: Ben Felix, The Plain Bagel, Humphrey Yang,
            Graham Stephan, Andrei Jikh
    Signal: unusual upload frequency on a topic = weak
    sentiment indicator. Never used as factual source.
    Never transcribed. Topic keyword only.
```

---

## Insight 1 — Market Event Alert

```
Cost:    ~€0.025/call (includes discovery pass ~€0.005)
Cache:   24 hours from generation
Trigger: Once per 24 hours on app open

REASONING CHAIN — Claude follows these steps explicitly:

STEP 1 — DISCOVERY PASS (separate cheap call)
  Send holdingsContext (instrument types + geographies, % only).
  Claude returns 10 session-specific sources to add to seed list.
  Cost: ~€0.005. Result cached for this session only.

STEP 2 — GATHER
  Search seed sources + discovered sources.
  Target: 8–12 searches total across all tiers.
  Focus: events in last 48 hours only.
  Never surface events older than 48 hours as current alerts.

STEP 3 — CROSS-REFERENCE
  For each candidate event found:
    Which Tier 1 sources cover it? (weight × count)
    Which Tier 2 sources cover it? (weight × count)
    What is Tier 3 sentiment? (directional consensus %)
    Is there Tier 1 vs Tier 3 divergence? (flag if >30% gap)
    Calculate confidence score (see Tier Weighting above).

STEP 4 — RELEVANCE FILTER
  Score each event against user's holdings profile:
    Does it affect their specific bucket allocation? (+20)
    Does it affect their currency exposure? (+15)
    Does it affect employer stock specifically? (+25)
    Is there a FIRE trajectory implication? (+10)
    Is it a regulatory change (SEBI/ECB/Fed)? (+30)
    Is it macro noise with no direct holding impact? (-20)
  Only surface if total relevance score > 40.
  Return null if nothing clears threshold.

STEP 5 — SYNTHESISE
  Pick ONE event (highest combined confidence + relevance).
  Never combine two events into one insight.
  Never surface noise as signal.

STEP 6 — FRAME
  Write as a knowledgeable friend, not a headline service.
  What happened (headline, max 10 words).
  Why it matters FOR THIS USER specifically (body, max 40 words).
  What to watch — not what to do.
  Never recommend buy/sell/hold.
  If Tier 3 diverges from Tier 1/2: mention it.
  If Tier 3 strong but no institutional corroboration:
    surface as SENTIMENT_ONLY with clear label.

holdingsContext sent (percentages only, never absolute values):
  Growth bucket: X% of live portfolio
    India equity: X%
    EU/US equity: X%
    Employer stock: X% (sector: Y, company withheld)
  Stability bucket: X%
  Locked bucket: X%
  Currency exposure: X% INR, X% EUR, X% USD, X% GBP

JSON response shape:
{
  headline: string,           // max 10 words
  body: string,               // max 40 words
  holdingType: string,        // which part of portfolio is affected
  source: string,             // primary source name
  sourceUrl: string,
  sourceTier: 1 | 2 | 3,
  sentiment: 'bullish' | 'bearish' | 'mixed' | 'neutral',
  confidence: 'high' | 'medium' | 'low' | 'sentiment_only',
  confidenceScore: number,    // raw score for logging
  forumSignal: {
    summary: string,          // max 15 words
    platforms: string[],
    directionalConsensus: number,  // 0–100%, e.g. 68 = 68% bearish
    divergesFromInstitutional: boolean
  } | null,
  retailSentimentOnly: boolean  // true when Tier 3 only, no T1/T2
} | null
```

---

## Insight 2 — Portfolio Health Alert

```
Cost:    ~€0.002/call
Cache:   Expires when holdings data changes
Trigger: Data change OR weekly check
Model:   claude-sonnet-4-20250514 (no web search — local data only)

Trigger conditions (any one sufficient):
  Growth bucket <50% (>10% below 60% target)
  Single holding >15% of live portfolio value
  Employer stock >15% of live portfolio
  No protection designation + cash holdings exist
  Monthly invested < target * 0.8
  INR weakened >3% vs EUR in rolling 90 days + India >20%
  Vesting event within 30 days

Context sent (local calculations only, no web search):
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

JSON response: { headline, body, action | null }
```

---

## Insight 3 — FIRE Trajectory Change

```
Cost:    ~€0.002/call
Cache:   Expires when FIRE inputs change
Trigger: Projected FIRE year shifts >6 months vs last month
         Both directions trigger — good news too

Context sent:
  previousProjectedYear, currentProjectedYear
  shiftMonths, direction ('earlier' | 'later')
  spendChangePct, investmentChangePct, portfolioChangePct
  mortgageStepDownOccurring: boolean

Prompt rules:
  Explain what caused the shift.
  If later: what would reverse it.
  If earlier: what would sustain it.
  Max 10 word headline, 40 word body.

JSON response: { headline, body, action | null }
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

InstrumentSuggestionSheet is a static PM-curated list.
Not AI-generated. Not fetched dynamically.
Updated by PM quarterly alongside seed source review.
No affiliate links. Educational framing only. Always with disclaimer.
```

---

## Insight 5 — Monthly Review

```
Cost:    ~€0.008/call (richest prompt)
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
  Specific — use the data, not generalities.
  Never recommend specific funds by name.
  Category-level guidance only (Growth / Stability / Locked).
  Warm but direct — no jargon.
  If data insufficient for a section: say so honestly.
  If FIRE not set up: fireUpdate = null, do not fabricate.

JSON response shape:
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
  nextMonthWatchlist: string[]  // 2–3 items max
}
```

---

## Priority Order (one insight shown at a time)

```
MARKET_EVENT_ALERT     (highest — time-sensitive)
PORTFOLIO_HEALTH
FIRE_TRAJECTORY
INVESTMENT_OPPORTUNITY (lowest — helpful but not urgent)

Monthly Review is separate — own card and sheet.
Never competes with the insight strip.
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

Implementation:
  triggerHash = hash(the data that triggers the insight)
  On data change: compare new hash vs stored hash
  If different: clear cached insight, regenerate on next open
```

---

## UI Rendering Rules

```
Insight strip (Home + Portfolio + Spend):
  One compact card when active
  KasheAsterisk (small, static — not pulsing)
  Headline + body
  Dismiss: swipe left or tap ×, hidden 24 hours
  Tap → InsightDetailSheet (shared component)

MARKET_EVENT additions in strip:
  Source: "via Reuters · 3 hours ago" (textDim, small)
  Confidence LOW: "Limited sources available" (textDim, small)
  Confidence SENTIMENT_ONLY: "Retail sentiment signal —
    no institutional corroboration" (textDim, small)
  Forum signal (when present):
    "⚡ Stocktwits 68% bearish · r/IndiaInvestments mixed"
    Always shown when divergesFromInstitutional = true
    Always shown when directionalConsensus > 70%
    Hidden when weak or ambiguous

INVESTMENT_OPPORTUNITY renders differently:
  No KasheAsterisk (templated, not AI-generated)
  Label: "OPPORTUNITY"
  [Explore options →] → InstrumentSuggestionSheet

InsightsEmptyInsightState:
  KasheAsterisk (small, static)
  "Nothing needs your attention right now."
  "Checked X hours ago" (textDim, small)
  No CTA. Intentional silence. This is good news.
```

---

## The aiInsights.ts Service

```typescript
// /services/aiInsights.ts

// This service:
// 1. Reads portfolio/spend data from stores (injected deps)
// 2. Checks budget cap before every call
// 3. Runs discovery pass to get session-specific source list
// 4. Builds main prompt with seed + discovered sources
// 5. Sends holdings context (percentages only)
// 6. Instructs Claude to follow the 6-step reasoning chain
// 7. Parses JSON response
// 8. Validates confidence score and tier attribution
// 9. Stores result in insightsStore
// 10. Logs token usage to budgetCap service

// It does NOT:
// - Touch any UI component
// - Know anything about how insights are displayed
// - Send absolute monetary values
// - Cache in memory (cache lives in encrypted storage)
// - Persist the discovered source list (regenerated each session)
```

---

## Seed Source Review Schedule

```
PM reviews seed sources quarterly.
Trigger: calendar reminder, not code change.
Process:
  1. Check each seed source is still active and reliable
  2. Add/remove based on quality changes
  3. Update "Last updated" date in this file
  4. Commit updated ai-insights.md
  5. No code changes required — sources live in the prompt,
     not in hardcoded arrays

Next review: June 2026
```
