# Kāshe — CLAUDE-financial.md
*Team Member 3: Financial Intelligence*
*Read CLAUDE.md first, then this file.*
*Last updated: March 2026 — Portfolio spec, insight engine,
salary slip parser, investment plan added*

---

## Your Role
You own the numbers. Every calculation, every parser, every
API call that produces financial data. You are the engine
that makes Kāshe honest and accurate.
You do NOT touch UI. You produce services and data shapes
that Team Member 2 (Experience) consumes via hooks.

---

## Your Domain
```
Universal CSV parser   Auto-detect any bank CSV format
Salary slip parser     Dutch loonstrook + Indian salary slip
                       Detect pension/EPF contributions (NEW)
Price refresh          All market price API integrations
FX rates               Currency conversion service
AMFI NAV feed          Indian mutual fund prices (free, daily)
Spend categoriser      Transaction to category (multilingual)
Portfolio calc         Position, allocation, bucket assignment
Savings rate           Formula + monthly trend tracking
FIRE engine            Calculator + projection logic
AI insights            Claude API integration - full engine
Budget cap             Client-side token usage enforcement (NEW)
```

---

## The DataSource Abstraction (critical architecture)
```typescript
interface DataSource {
  type: 'CSV' | 'API' | 'MANUAL'
  fetchTransactions(params: FetchParams): Promise<Transaction[]>
  fetchHoldings(params: FetchParams): Promise<Asset[]>
}

class CSVDataSource implements DataSource {
  // V1 implementation
}
// V2: class OpenBankingDataSource implements DataSource {}
// Adding V2 source must NOT require changes to consumers
```

---

## Smart Universal CSV Parser

```
APPROACH: Auto-detect, not fixed format list.
Known banks: zero-friction instant parse.
Unknown banks: one confirmation screen.

PIPELINE:
1. Read header row
2. Score columns against known field types
3. >85% confidence: auto-map, proceed silently
4. 60-85%: show mapping confirmation
5. <60%: ask user to map manually

KNOWN FORMATS (instant parse):
  ABN Amro        Semicolon-delimited, Dutch headers
  DeGiro          Portfolio export, ISIN column
  HDFC Bank       Comma-delimited, DD/MM/YY dates
  CAMS            Pipe-delimited, scheme code
  Zerodha/Groww   Holdings export, symbol column
  Morgan Stanley  StockPlan Connect, vest date column
  Revolut         Started Date + Completed Date pattern

AMOUNT PARSING:
  European: 1.234,56 (period=thousands, comma=decimal)
  Standard: 1,234.56 (comma=thousands, period=decimal)
  Auto-detect from first numeric cell.

DEBIT/CREDIT DETECTION:
  Separate debit + credit columns
  Single amount, negative = debit
  Af/Bij or Dr/Cr flag column
  Handle all three patterns.
```

---

## Salary Slip Parser (NEW - V1)

```
PURPOSE:
  Detect pension and EPF contributions automatically.
  Pre-populate Locked holdings for user to confirm.
  Calculate true investable surplus for investment plan.

SUPPORTED FORMATS:
  Dutch loonstrook
  Indian salary slip (any major payroll format)

DUTCH LOONSTROOK - FIELDS TO EXTRACT:
  Bruto salaris         gross salary
  Netto salaris         net salary (income for savings rate)
  Pensioen (werknemer)  employee pension contribution -> LOCKED
  Pensioen (werkgever)  employer contribution (context only)
  ZVW bijdrage          health contribution (not a holding)
  Loonheffing           tax (not a holding)
  Employer name         used to name the pension holding
  Pay period            monthly / 4-weekly detection

INDIAN SALARY SLIP - FIELDS TO EXTRACT:
  Basic salary          base for EPF calculation
  EPF employee (12%)    employee EPF contribution -> LOCKED
  EPF employer (12%)    employer contribution (context only)
  TDS                   tax (not a holding)
  Professional tax      not a holding
  Net pay               income for savings rate

POST-PARSE FLOW:
  For each detected contribution:
    Emit: SalaryContributionDetected event
    UI prompts user:
    "We found a pension contribution of X/month.
     Want to add this as a holding?"
    [+ Add pension]  [Skip]

    If accepted - pre-populate holding form:
      name: "{Employer} Pension" or "EPF"
      type: pension or ppf_epf
      bucket: LOCKED (cannot be overridden)
      monthlyContribution: detected amount
      employerContribution: detected if present

INVESTABLE SURPLUS:
  investableSurplus = monthlyTarget - detectedLockedContributions
  Feeds "Remaining to actively allocate" in Investment Plan card

AMBIGUOUS FORMAT:
  If not recognised: show manual field entry
  Fields: gross, net, pension, EPF, pay frequency
  User fills what they know, skips what they don't

PRIVACY:
  Parsed in memory - never persisted raw
  BSN / PAN / Aadhaar / full name stripped before storage
  Same security pipeline as CSV uploads
```

---

## Portfolio Bucket Assignment

DEFAULT_BUCKET per asset type:
  indian_mf, indian_equity, eu_brokerage,
  employer_stock, crypto  ->  GROWTH
  nre_nro, cash           ->  STABILITY
  ppf_epf, alternative    ->  LOCKED

debt MFs, money market funds -> STABILITY
bond ETFs -> STABILITY

BucketOverride: holdingId, overrideBucket, systemBucket,
  overriddenAt, profileId
Override triggers immediate insight regeneration.
Pass insightTrigger: BUCKET_REASSIGNED to insight engine.

---

## Protection Designation

Must be a STABILITY holding.
minimum     = averageMonthlySpend * 3
comfortable = averageMonthlySpend * 6
coverageMonths = protectionValue / averageMonthlySpend

Thresholds:
  <3 months:  DANGER - surface in insight
  3-6 months: GOOD - no insight needed
  >6 months:  SURPLUS - note: consider investing excess

---

## Locked Holding Projections

Only where unlock date known. Never for Crowdcube/angel.
Formula: FV = PV x (1 + r)^n

Default rates (update as announced):
  PPF: 7.1%   EPF: 8.2%   FD: user-entered   NSC: 7.2%

Always show rate source.
Always show: Projection only - actual returns may vary

---

## Investment Plan Gap Analysis

monthlyTarget - salaryDetectedLocked = remainingToAllocate
remainingToAllocate - currentMonthInvested = gapAmount
mostUnderfundedBucket -> drives Investment Opportunity insight

TARGET ALLOCATION (guide, not prescription):
  GROWTH: 60%   STABILITY: 20%   LOCKED: 20%
User cannot change target in V1.

---

## Spend Categorisation

Categories: groceries, mortgage_rent, childcare,
  eating_out, subscriptions, transport, health,
  utilities, shopping, travel, income,
  investment_transfer, transfer, other

CRITICAL: investment_transfer and transfer excluded
from spend totals and savings rate.

Dutch: albert heijn/jumbo (groceries), ns/gvb (transport),
  thuisbezorgd/uber eats (eating_out), eneco/ziggo (utilities)
Indian: bigbasket/zepto (groceries), swiggy/zomato (eating_out),
  zerodha/groww/cams (investment), salary/neft cr (income)

---

## Merchant Memory

On recategorisation:
  Save MerchantOverride (merchantName, category, profileId)
  Re-run on ALL past transactions from same merchant
  Future imports: override beats keyword match
Normalisation: ALBERT HEIJN 1234 -> albert heijn

---

## Savings Rate

savingsRate = ((income - spend) / income) * 100
income: income category transactions this month
spend: debits EXCLUDING investment_transfer + transfer
investment_transfer is wealth-building, not consumption

---

## FIRE Calculator

FIRE number = monthlyExpenses x 300 at 4% SWR
Default return: 7% blended conservative
  Indian equity EUR real: ~8.5%
  European equity: ~7-8%
  Blended 60/40: ~8% -> use 7% for conservatism

Exclude: unvested employer stock, Crowdcube/angel
Always show assumptions - never hide them.
Formula: FV = PV(1+r)^n + PMT x ((1+r)^n - 1) / r
Solve for n where FV >= FIRE number.

---

## AI Insight Engine - Full Spec

### Five insight types, priority ordered

1. MARKET_EVENT_ALERT      time-sensitive, web search
2. PORTFOLIO_HEALTH        action-needed, local calc + Claude
3. FIRE_TRAJECTORY         important, not urgent
4. INVESTMENT_OPPORTUNITY  helpful, fully templated, zero API cost
5. MONTHLY_REVIEW          scheduled, own sheet in Insights tab

One insight shows in strip at a time.
Priority order determines which shows when multiple exist.
Monthly Review has its own sheet - never competes with strip.
Monthly Review lives in Insights tab.
Portfolio and Home surface a review-ready link when available.

---

### Client-side budget enforcement

MONTHLY_BUDGET_EUR = 5.00

AIUsageRecord:
  monthYear: string        // 2026-03
  totalTokensInput: number
  totalTokensOutput: number
  estimatedCostEUR: number
  callCount: number
  lastUpdated: Date

Before every Claude call:
  Check usage.estimatedCostEUR + estimatedCallCost vs budget
  If over: return { error: BUDGET_EXCEEDED, resetsOn: ... }
  If under: call Claude, log usage, return response

When budget exceeded: insight strip does not render.
No error shown to user. Logged internally for PM visibility.

---

### API key security (V1)

API key stored in encrypted storage - NEVER in app bundle.
Never in source code. Never in GitHub.

Setup flow: Settings -> AI Features -> Enter API key
Stored via react-native-encrypted-storage (AES-256)
Same protection as all financial data.

V1b: move to Supabase Edge Functions when couple sync
backend is introduced. App change: one line.

---

### Insight 1 - Market Event Alert

Trigger: once per 24 hours on app open
Source:  Claude API + web search tool enabled
Cost:    ~0.01-0.02 EUR per call
Cache:   24 hours

holdingsContext - percentages only, never absolute values:
  Growth bucket: X% of live portfolio
    India equity: X%
    EU/US equity: X%
    Employer stock: X% (sector: Y)
  Stability bucket: X%
  Locked bucket: X%
  Currency exposure: X% INR, X% EUR

RESEARCH TIERS - instruct Claude to search across all:

TIER 1 - AUTHORITATIVE:
  RBI, SEBI, AMFI, NSE, BSE official announcements
  ECB, Federal Reserve statements
  Reuters, Bloomberg, Associated Press
  Financial Times, Wall Street Journal
  Economic Times, Mint, Business Standard
  NRC Financieel Dagblad (Netherlands context)
  Morningstar, S&P Global, Moody's
  Capitalmind / Deepak Shenoy (Indian markets)
  Freefincal (Indian FIRE / MF focused)

TIER 2 - ANALYSIS & COMMUNITY:
  Seeking Alpha, ValueResearch, Moneycontrol
  TradingView public ideas
  Bogleheads forums
  Zerodha Varsity community

TIER 3 - SOCIAL & SENTIMENT:
  Reddit: r/IndiaInvestments, r/IndianStreetBets,
          r/wallstreetbets, r/stocks,
          r/DutchFIRE, r/EuropeFIRE,
          r/financialindependence
  Stocktwits: symbol-specific sentiment streams,
              bullish/bearish ratio for held stocks
  Twitter/X:  #NIFTY #Sensex #IndianMarkets
              #MutualFunds #SP500 #ECB #earnings
              Indian finance community, Fintwit

Prompt rules:
  Run 5-7 searches across tiers.
  Note Tier 1 vs Tier 3 sentiment divergence.
  Stocktwits bullish/bearish ratio for held stocks.
  Find ONE most actionable event.
  Return null if nothing material in 48 hours.
  Never fabricate. Never recommend buy/sell.
  If uncertain: confidence low, still surface.

JSON response shape:
{
  headline: string,          // max 10 words
  body: string,              // max 40 words
  holdingType: string,
  source: string,
  sourceUrl: string,
  sentiment: bullish | bearish | mixed | neutral,
  confidence: high | medium | low,
  forumSignal: {
    summary: string,         // max 15 words
    platforms: string[]
  } | null
} | null

---

### Insight 2 - Portfolio Health Alert

Trigger: data change OR weekly check
Source:  local calculation + Claude for narrative
Cost:    ~0.002 EUR per call

Trigger conditions (any one sufficient):
  Growth bucket <50% (>10% below 60% target)
  Single holding >15% of live portfolio
  Employer stock >15% of live portfolio
  No protection designation + cash holdings exist
  Monthly invested < target * 0.8
  INR weakened >3% vs EUR in 90 days + India >20%
  Vesting event within 30 days

Prompt: local aggregated data only, no web search.
Be specific - use actual numbers.
Do not recommend specific assets.
Show the picture - user decides action.
Output: { headline, body, action | null }

---

### Insight 3 - FIRE Trajectory Change

Trigger: projected FIRE year shifts >6 months vs last month
Both directions trigger - good news too.
Source:  local FIRE engine + Claude for narrative
Cost:    ~0.002 EUR per call

Context includes:
  previousProjectedYear, currentProjectedYear
  shiftMonths, direction (earlier/later)
  spendChangePct, investmentChangePct, portfolioChangePct

Output: { headline, body, action | null }
Explain what caused the shift.
What would reverse it.
Max 10 word headline, 40 word body.

---

### Insight 4 - Investment Opportunity

Trigger: savingsRate >20% AND investment_transfer < target * 0.8
Source:  local calculation only
Cost:    ZERO - fully templated, no Claude call

Template:
  headline: {amount} uninvested this month
  body: Your {bucket} bucket is furthest from target.
        See suggested instruments to put this to work.
  action: VIEW_SUGGESTIONS  -> opens InstrumentSuggestionSheet

---

### Insight 5 - Monthly Review

Trigger: first app open of new calendar month
Minimum: 3 months spend + portfolio data
Source:  rich Claude API call, structured JSON output
Cost:    ~0.008 EUR per call (largest prompt)
Cache:   entire calendar month - never regenerates mid-month
Location: Insights tab (MonthlyReviewSheet)
          Portfolio + Home surface review-ready link

Context sent to Claude (pcts only, no absolute values):
  Portfolio allocation by bucket
  Spend last month vs 3-month average
  FIRE progress and projection
  Protection coverage months
  Investment plan gap

JSON response shape:
{
  whereYouStand: string,
  howMoneyIsWorking: {
    growth: string,
    stability: string,
    locked: string,
    protection: string,
  },
  thisMonthsPriority: {
    headline: string,
    reasoning: string,
    bucketTarget: GROWTH | STABILITY | LOCKED | null,
  },
  fireUpdate: {
    headline: string,
    detail: string,
  },
  nextMonthWatchlist: string[],    // 2-3 items max
}

Prompt rules:
  Specific - use the data, not generalities.
  Never recommend specific funds by name.
  Category-level guidance only.
  Warm but direct - no jargon.
  If data insufficient for a section: say so honestly.

---

### Cache management

MARKET_EVENT_ALERT:     expires 24 hours
PORTFOLIO_HEALTH:       expires when holdings data changes
FIRE_TRAJECTORY:        expires when FIRE inputs change
INVESTMENT_OPPORTUNITY: expires when investment_transfer changes
MONTHLY_REVIEW:         expires at start of next calendar month

triggerHash: hash the data that triggers each insight.
On bucket reassign: invalidate PORTFOLIO_HEALTH immediately.
On new CSV upload: invalidate relevant insights.
## Price Refresh Services

Alpha Vantage: stocks/ETFs, key required, 25 calls/day free
AMFI NAV: amfiindia.com/spages/NAVAll.txt, no key, cache 24h
CoinGecko: crypto, no key, 10-50 calls/min
ExchangeRate: open.er-api.com, no key basic, cache 1h
Finnhub: news + prices, key required, 60/min, Home Pulse only

## What You Must NOT Build

[NOT YOURS] UI, navigation, auth, storage encryption
[NOT YOURS] Coverage score (removed V1)
[NOT YOURS] Property equity (out of scope V1)
[V2] ML categorisation, tax calc, open banking
[V2] Dynamic fund feeds, Supabase Edge Functions
[V2] Historical performance charts
[NEVER] Buy/sell recommendations, regulated advice, affiliate links

## Your Output Files

/types/asset.ts
/types/liability.ts
/types/transaction.ts
/types/dataSource.ts
/types/insight.ts
/types/portfolio.ts              NEW
/types/investmentPlan.ts         NEW
/services/dataSource.ts
/services/csvDataSource.ts
/services/universalParser.ts
/services/salarySlipParser.ts    NEW - Dutch + Indian formats
/services/priceRefresh.ts
/services/amfiNavFeed.ts
/services/fxRefresh.ts
/services/portfolioCalc.ts       UPDATED
/services/savingsRate.ts
/services/spendCategoriser.ts
/services/fireEngine.ts
/services/aiInsights.ts          UPDATED - full 5-insight engine
/services/budgetCap.ts           NEW - client-side token tracking
/store/portfolioStore.ts         UPDATED
/store/spendStore.ts
/hooks/usePortfolio.ts           UPDATED
/hooks/useSpend.ts
/hooks/useInvestmentPlan.ts      NEW
