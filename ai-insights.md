# Kāshe — AI Insights
*Read CLAUDE.md, engineering-rules.md, and data-architecture.md before this file.*
*Last updated: 16 March 2026 — Scalable source architecture, weighted tier system,
dynamic discovery, structured reasoning chain, instrument-class source routing,
stale app handling, currency concentration trigger, portfolio data sufficiency.*

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
  If nothing material in full search window: return null
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
  Regulators, central banks, tier-1 wire services,
  and official fund manager / issuer primary sources.
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

### Instrument-Class Source Routing — Option A

For fund-type and structured holdings, the fund manager or issuer's
own published material is the most authoritative source for that
instrument. These are treated as Tier 1 — not Tier 2 — because
they represent primary disclosure, not third-party analysis.

The discovery prompt explicitly instructs Claude to identify
instrument-class-specific primary sources based on holdings profile.

```
ROUTING RULES BY INSTRUMENT TYPE:

in_mutual_fund held:
  → Fund house investor relations and newsroom pages
    (PPFAS/Parag Parikh, Mirae Asset India, HDFC AMC,
     Axis AMC, SBI MF, Nippon India, Kotak, DSP, Edelweiss)
  → Fund house monthly factsheets (commentary sections, not raw NAV)
  → Fund manager letters and portfolio disclosure notes
  → AMFI scheme information documents (SID/SAI updates)
  → SEBI regulatory filings for the specific AMC
  Tier 1: Fund house official pages, AMFI filings
  Tier 2: ValueResearch fund page, Morningstar India analyst notes,
          CRISIL/ICRA fund ratings

eu_etf held:
  → Fund provider investor relations and product pages
    (Vanguard Europe, iShares EMEA, SPDR Europe,
     Xtrackers, Amundi ETF, Lyxor)
  → Monthly fund commentaries and factsheets
  → KIID (Key Investor Information Document) updates
  → Euronext or LSE product notices for the specific ISIN
  Tier 1: Fund provider official pages, exchange product notices
  Tier 2: justETF fund page (tracking difference changes),
          Curvo analysis, Trackinsight

in_ppf / in_epf / in_nsc / in_fd:
  → RBI monetary policy announcements
  → Ministry of Finance small savings rate circulars
  → SBI / India Post official rate pages
  → EPFO circulars (for EPF rate changes)
  Tier 1: RBI, Ministry of Finance, EPFO official sources
  Tier 2: Economic Times rate tracker, Cleartax rate summaries

eu_pension / nl_pension held:
  → Pension fund annual reports and quarterly update letters
    (ABP, PFZW, Pensioenfonds Metaal & Techniek,
     BeFrank, Brand New Day, ASR, NN Group pension pages)
  → DNB pension fund supervision announcements
  → Pensioenfederatie (Dutch Pension Federation) updates
  → Individual fund dekkingsgraad (coverage ratio) publications
  Tier 1: Pension fund official pages, DNB supervision
  Tier 2: Pensioenpro.nl, IPE (Investment & Pensions Europe)

alternative_general (Crowdcube, angel investments):
  → Company's own investor updates page / investor portal
  → Crowdcube campaign update feed
  → Beauhurst or Dealroom for funding round news
  → Companies House filings (UK) or KVK (Netherlands)
  DO NOT attempt projection — show last known valuation only.
  DO NOT treat community speculation as signal.
  Tier 2: All sources (no authoritative Tier 1 for private companies)

employer_rsu / employer_espp:
  → Company investor relations page (earnings, buyback, guidance)
  → SEC EDGAR for recent filings (10-K, 10-Q, 8-K)
  → Company press releases and newsroom
  → Glassdoor news section for comp/restructuring signals
  Tier 1: SEC filings, company IR official pages
  Tier 2: Glassdoor, LinkedIn company announcements

DISCOVERY PROMPT INJECTION:
  Add to the discovery prompt, after holdingsContext:

  "For each instrument type in the holdings profile, identify
   the primary fund house or issuer source for that instrument.
   These are Tier 1 sources — official fund manager commentary,
   monthly factsheets, manager letters, and investor disclosures
   published in the last 90 days.
   Include them even if not recent, as baseline context for any
   market event affecting that specific fund or issuer.
   Return these alongside the 10 session-specific sources."
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

Also apply instrument-class source routing rules (see above)
to identify primary fund/issuer sources for each holding type.

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
  Apply instrument-class source routing to identify primary
  fund/issuer sources for each holding type held.
  Claude returns 10 session-specific sources + issuer sources
  to add to seed list. Cost: ~€0.005.
  Result cached for this session only.

STEP 2 — GATHER
  Search seed sources + discovered sources + issuer sources.
  Target: 8–12 searches total across all tiers.
  Focus: events in last 48 hours by default.

  STALE APP HANDLING:
    If last app open was >72 hours ago:
      Widen search window to match the gap (up to 7 days max).
      Surface the most relevant event found in that full window.
      When event is older than 48 hours, label it in the body:
        "from X days ago" (textDim, small) — honest about recency.
      Do not return null just because nothing happened in 48h.
      Return null only if nothing material found in full window.

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
    Does it affect a specific fund they hold (via issuer source)? (+20)
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
  If sourced from fund manager directly: note this positively —
    "from [Fund House] investor letter" in source line.

holdingsContext sent (percentages only, never absolute values):
  Growth bucket: X% of live portfolio
    India equity: X%
    EU/US equity: X%
    Employer stock: X% (sector: Y, company withheld)
  Stability bucket: X%
  Locked bucket: X%
  Currency exposure: X% INR, X% EUR, X% USD, X% GBP
  Instrument types held: [list of assetSubtype values, no names]

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
  eventAgeHours: number,      // hours since event — used for stale label
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
  Single currency >75% of total portfolio exposure
    (e.g. 82% EUR concentration when user has India financial goals)
    Note: separate from INR weakness — this is concentration, not movement
  Vesting event within 30 days

Context sent (local calculations only, no web search):
  allocationByBucket (percentages)
  largestHoldingPct
  employerStockPct
  hasProtectionDesignation
  monthlyInvestedVsTarget (percentage)
  currencyExposure (percentages, all currencies)
  dominantCurrencyPct (highest single currency %)
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
Minimum: 3 months spend data required
         1 month portfolio data required (see below)
Model:   claude-sonnet-4-20250514 (no web search)

DATA SUFFICIENCY RULES:
  Spend section: requires 3 months spend history.
    If <3 months: whereYouStand and spendAnalysis return null.
    Do not fabricate spend observations from partial data.
  Portfolio section: requires 1 month holdings data minimum.
    If <1 month holdings: all howMoneyIsWorking fields return null.
  FIRE section: requires FIRE inputs to be set up by user.
    If not set up: fireUpdate = null. Do not fabricate.
  Prompt instruction: "If data for any section is insufficient,
    return null for that field and say so honestly in whereYouStand.
    Insufficient data is better than confident noise."

Context sent (percentages only — no absolute values):
  allocationByBucket (percentages)
  spendLastMonthVs3MonthAvg (per category, percentages)
  FIREProgress (percentage of FIRE number, years to go)
  protectionCoverageMonths
  investmentPlanGapPct
  mortgageStepDownOccurredThisPeriod: boolean
  dataMonthsAvailable: { spend: number, portfolio: number }

Prompt rules:
  Specific — use the data, not generalities.
  Never recommend specific funds by name.
  Category-level guidance only (Growth / Stability / Locked).
  Warm but direct — no jargon.
  If data insufficient for a section: say so honestly,
    return null for that field, do not pad with generalities.
  If FIRE not set up: fireUpdate = null, do not fabricate.

JSON response shape:
{
  whereYouStand: string,
  howMoneyIsWorking: {
    growth: string | null,
    stability: string | null,
    locked: string | null,
    protection: string | null
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
  When eventAgeHours > 48: "from X days ago" (textDim, small)
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
//    (includes instrument-class source routing per holding types)
// 4. Builds main prompt with seed + discovered + issuer sources
// 5. Sends holdings context (percentages + instrument types only)
// 6. Instructs Claude to follow the 6-step reasoning chain
// 7. Parses JSON response
// 8. Validates confidence score and tier attribution
// 9. Stores result in insightsStore
// 10. Logs token usage to budgetCap service

// It does NOT:
// - Touch any UI component
// - Know anything about how insights are displayed
// - Send absolute monetary values or holding names
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
  3. Review instrument-class routing rules for new asset subtypes
  4. Update "Last updated" date in this file
  5. Commit updated ai-insights.md
  6. No code changes required — sources live in the prompt,
     not in hardcoded arrays

Next review: June 2026
```
