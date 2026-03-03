# Kāshe — CLAUDE-financial.md
*Team Member 3: Financial Intelligence*
*Read CLAUDE.md first, then this file.*
*Last updated: March 2026 — Insights screen, FIRE planner engine,
fireDefaults, mortgage step-down, salary slip parser,
investment plan, full 5-insight engine*

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
                       Detect pension/EPF contributions
Price refresh          All market price API integrations
FX rates               Currency conversion service
AMFI NAV feed          Indian mutual fund prices (free, daily)
Spend categoriser      Transaction to category (multilingual)
Portfolio calc         Position, allocation, bucket assignment
Savings rate           Formula + monthly trend tracking
FIRE engine            Calculator + projection logic (UPDATED)
AI insights            Claude API integration — full 5-insight engine
Budget cap             Client-side token usage enforcement
fireDefaults           Country-based inflation + return defaults (NEW)
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

## Salary Slip Parser

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

```
DEFAULT_BUCKET per asset type:
  indian_mf, indian_equity, eu_brokerage,
  employer_stock, crypto              ->  GROWTH
  nre_nro, cash                       ->  STABILITY
  ppf_epf, alternative                ->  LOCKED
  debt MFs, money market funds        ->  STABILITY
  bond ETFs                           ->  STABILITY

BucketOverride:
  holdingId, overrideBucket, systemBucket,
  overriddenAt, profileId
  Override triggers immediate insight regeneration.
  Pass insightTrigger: BUCKET_REASSIGNED to insight engine.
```

---

## Protection Designation

```
Must be a STABILITY holding.
minimum     = averageMonthlySpend * 3
comfortable = averageMonthlySpend * 6
coverageMonths = protectionValue / averageMonthlySpend

Thresholds:
  <3 months:  DANGER — surface in insight
  3-6 months: GOOD — no insight needed
  >6 months:  SURPLUS — note: consider investing excess
```

---

## Locked Holding Projections

```
Only where unlock date known. Never for Crowdcube/angel.
Formula: FV = PV × (1 + r)^n

Default rates (update as announced):
  PPF: 7.1%   EPF: 8.2%   FD: user-entered   NSC: 7.2%

Always show rate source.
Always show: "Projection only — actual returns may vary"
```

---

## Investment Plan Gap Analysis

```
monthlyTarget - salaryDetectedLocked = remainingToAllocate
remainingToAllocate - currentMonthInvested = gapAmount
mostUnderfundedBucket -> drives Investment Opportunity insight

TARGET ALLOCATION (guide, not prescription):
  GROWTH: 60%   STABILITY: 20%   LOCKED: 20%
User cannot change target in V1.
```

---

## Spend Categorisation

```
Categories:
  groceries, mortgage_rent, childcare,
  eating_out, subscriptions, transport, health,
  utilities, shopping, travel, income,
  investment_transfer, transfer, other

CRITICAL: investment_transfer and transfer excluded
from spend totals and savings rate.

MERCHANT KEYWORDS:
  Dutch: albert heijn/jumbo (groceries), ns/gvb (transport),
    thuisbezorgd/uber eats (eating_out), eneco/ziggo (utilities)
  Indian: bigbasket/zepto (groceries), swiggy/zomato (eating_out),
    zerodha/groww/cams (investment), salary/neft cr (income)
```

---

## Merchant Memory

```
On recategorisation:
  Save MerchantOverride (merchantName, category, profileId)
  Re-run on ALL past transactions from same merchant
  Future imports: override beats keyword match
Normalisation: ALBERT HEIJN 1234 -> albert heijn
```

---

## Savings Rate

```
savingsRate = ((income - spend) / income) * 100
income: income category transactions this month
spend: debits EXCLUDING investment_transfer + transfer
investment_transfer is wealth-building, not consumption
```

---

## FIRE Engine — Full Spec

### Core formula
```
FIRE number = targetMonthlySpend × 300
  (derived from 4% safe withdrawal rate — Bengen rule)

Projection formula:
  FV = PV × (1 + r)^n + PMT × ((1 + r)^n - 1) / r
  Solve for n where FV >= FIRE number

  PV  = current portfolio value (excludes unvested stock,
        Crowdcube/angel, primary residence)
  PMT = monthly savings / investments
  r   = monthly equivalent of annual return
        (1 + annualReturn)^(1/12) - 1
  n   = months to FIRE

yearsToFIRE = n / 12
projectedFIREYear = currentYear + yearsToFIRE
```

### Inflation adjustment
```
All monetary values inflation-adjusted to today's terms.
targetMonthlySpend is in today's money.
The projection shows real purchasing power, not nominal.

Inflation rates — from /constants/fireDefaults.ts:
  NL: 3.0%   IN: 5.0%   UK: 3.0%   US: 3.0%   Other: 3.5%
  Source: conservative long-term planning assumptions
          based on 5-10 year historical averages and
          official forecasts. Not current CPI snapshots.

User can override. Always shown. Never hidden.
```

### Mortgage step-down
```
If a mortgage liability exists with a fixed end date:
  monthlyMortgagePayment = mortgage.monthly_payment
  mortgageEndDate = mortgage.end_date

  When projecting future spend:
    Before mortgageEndDate:  targetMonthlySpend (unchanged)
    From mortgageEndDate:    targetMonthlySpend - monthlyMortgagePayment

  This step-down is accounted for in the FIRE number calculation.
  The FIRE number itself is recalculated for each phase:
    Phase 1 FIRE number = currentSpend × 300
    Phase 2 FIRE number = reducedSpend × 300
  The projection solves across both phases.

  The step-down is surfaced in UI as an annotation:
    "Your mortgage ends in [year] — this reduces your
     required monthly spend by ~€[X] from that point"
  Team Member 2 renders this. You provide the data.
```

### FIRE inputs model
```typescript
interface FIREInputs {
  currentPortfolioValue: number       // auto-pulled or manual
  monthlyInvestmentAmount: number     // avg investment_transfer or manual
  targetMonthlySpendRetirement: number // avg spend last 3mo or manual
  currentAge: number                  // from profile (onboarding)
  expectedAnnualReturnPct: number     // default 7.0
  inflationRatePct: number            // from fireDefaults by country
  mortgageEndDate?: Date              // from liabilities, if exists
  monthlyMortgagePayment?: number     // from liabilities, if exists
}
```

### FIRE outputs model
```typescript
interface FIREOutputs {
  fireNumber: number                  // targetSpend × 300
  yearsToFIRE: number                 // at given slider value
  projectedFIREYear: number
  requiredMonthlySavings: number      // to hit slider target
  safeWithdrawalAmount: number        // 4% of projectedPortfolio
  currentTrajectoryYear?: number      // at current PMT (if data exists)
  portfolioAtFIRE: number             // projected total
  assumptions: FIREAssumptions        // always passed to UI
}

interface FIREAssumptions {
  safeWithdrawalRatePct: 4            // locked, not editable
  expectedReturnPct: number
  inflationRatePct: number
  inflationCountry: string            // "Netherlands", "India" etc.
  primaryResidenceExcluded: true
  unvestedStockExcluded: true
  illiquidAlternativesExcluded: true
}
```

### FIRE scope — household vs individual
```
Household mode (default):
  Aggregate all OWNER + MANAGED profile assets
  PARTNER: V2 — excluded in V1

Individual mode:
  Filter assets to selected profileId only
  Managed profiles: use their specific asset set
  Recalculate all outputs for selected profile only
```

### Exclusions from FIRE number
```
Always excluded:
  Unvested employer stock (vesting_date in future)
  Crowdcube / Seedrs / angel investments
  Primary residence (if ever added — currently out of V1)

Included despite being "Locked":
  PPF / EPF — real, realisable value at retirement
  FDs — included at maturity projection
```

---

## fireDefaults.ts

```typescript
// /constants/fireDefaults.ts
// Country-based conservative long-term planning assumptions.
// Source: 5–10 year rolling averages + official forward forecasts.
// Not current CPI. These are planning defaults, not live data.
// User can always override in FIRE planner.

export const FIRE_INFLATION_DEFAULTS: Record<string, number> = {
  NL: 3.0,   // Netherlands — EC forecast, trending to 2.5% by 2027
  IN: 5.0,   // India — RBI 4% target, structural ~5%
  GB: 3.0,   // United Kingdom — post-spike normalising
  US: 3.0,   // United States — post-spike normalising
  DE: 2.5,   // Germany — below EU average historically
  FR: 2.5,   // France
  BE: 3.0,   // Belgium
  OTHER: 3.5 // Conservative fallback
}

export const FIRE_RETURN_DEFAULT = 7.0
// 7% blended conservative:
//   Indian equity (EUR real): ~12% INR - 3.5% INR depreciation = ~8.5%
//   European equity: ~7–8%
//   Blended 60/40: ~8% → use 7% for conservatism

export const FIRE_SWR = 4.0
// Bengen rule. Fixed. Not user-editable.

export const FIRE_MULTIPLIER = 300
// = 1 / SWR * 12 = 1/0.04 * 12 = 300
// targetMonthlySpend × 300 = FIRE number
```

---

## AI Insight Engine — Full Spec

### Five insight types, priority ordered

```
1. MARKET_EVENT_ALERT      time-sensitive, web search
2. PORTFOLIO_HEALTH        action-needed, local calc + Claude
3. FIRE_TRAJECTORY         important, not urgent
4. INVESTMENT_OPPORTUNITY  helpful, fully templated, zero API cost
5. MONTHLY_REVIEW          scheduled, own sheet in Insights tab

One insight shows in strip at a time.
Priority order determines which shows when multiple exist.
Monthly Review has its own sheet — never competes with strip.
Monthly Review lives in Insights tab.
Portfolio and Home surface a review-ready link when available.
```

---

### Client-side budget enforcement

```
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
```

---

### API key security

```
API key stored in encrypted storage — NEVER in app bundle.
Never in source code. Never in GitHub.

Setup flow: Settings → AI Features → Enter API key
Stored via react-native-encrypted-storage (AES-256)
Same protection as all financial data.

V1b: move to Supabase Edge Functions when couple sync
backend is introduced. App change: one line.
```

---

### Insight 1 — Market Event Alert

```
Trigger: once per 24 hours on app open
Source:  Claude API + web search tool enabled
Cost:    ~0.01–0.02 EUR per call
Cache:   24 hours

holdingsContext — percentages only, never absolute values:
  Growth bucket: X% of live portfolio
    India equity: X%
    EU/US equity: X%
    Employer stock: X% (sector: Y)
  Stability bucket: X%
  Locked bucket: X%
  Currency exposure: X% INR, X% EUR

RESEARCH TIERS — instruct Claude to search across all:

TIER 1 — AUTHORITATIVE:
  RBI, SEBI, AMFI, NSE, BSE official announcements
  ECB, Federal Reserve statements
  Reuters, Bloomberg, Associated Press
  Financial Times, Wall Street Journal
  Economic Times, Mint, Business Standard
  NRC Financieel Dagblad (Netherlands context)
  Morningstar, S&P Global, Moody's
  Capitalmind / Deepak Shenoy (Indian markets)
  Freefincal (Indian FIRE / MF focused)

TIER 2 — ANALYSIS & COMMUNITY:
  Seeking Alpha, ValueResearch, Moneycontrol
  TradingView public ideas
  Bogleheads forums
  Zerodha Varsity community

TIER 3 — SOCIAL & SENTIMENT:
  Reddit: r/IndiaInvestments, r/IndianStreetBets,
          r/wallstreetbets, r/stocks,
          r/DutchFIRE, r/EuropeFIRE,
          r/financialindependence
  Stocktwits: symbol-specific sentiment streams,
              bullish/bearish ratio for held stocks
  Twitter/X:  #NIFTY #Sensex #IndianMarkets
              #MutualFunds #SP500 #ECB #earnings

Prompt rules:
  Run 5–7 searches across tiers.
  Note Tier 1 vs Tier 3 sentiment divergence.
  Stocktwits bullish/bearish ratio for held stocks.
  Find ONE most actionable event.
  Return null if nothing material in 48 hours.
  Never fabricate. Never recommend buy/sell.
  If uncertain: confidence LOW, still surface.

JSON response shape:
{
  headline: string,          // max 10 words
  body: string,              // max 40 words
  holdingType: string,
  source: string,
  sourceUrl: string,
  sentiment: 'bullish' | 'bearish' | 'mixed' | 'neutral',
  confidence: 'high' | 'medium' | 'low',
  forumSignal: {
    summary: string,         // max 15 words
    platforms: string[]
  } | null
} | null
```

---

### Insight 2 — Portfolio Health Alert

```
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
Be specific — use actual numbers.
Do not recommend specific assets.
Show the picture — user decides action.
Output: { headline, body, action | null }
```

---

### Insight 3 — FIRE Trajectory Change

```
Trigger: projected FIRE year shifts >6 months vs last month
Both directions trigger — good news too.
Source:  local FIRE engine + Claude for narrative
Cost:    ~0.002 EUR per call

Context includes:
  previousProjectedYear, currentProjectedYear
  shiftMonths, direction ('earlier' | 'later')
  spendChangePct, investmentChangePct, portfolioChangePct
  mortgageStepDownOccurring: boolean

Output: { headline, body, action | null }
Explain what caused the shift.
What would reverse it (if later) or sustain it (if earlier).
Max 10 word headline, 40 word body.
```

---

### Insight 4 — Investment Opportunity

```
Trigger: savingsRate >20% AND investment_transfer < target * 0.8
Source:  local calculation only
Cost:    ZERO — fully templated, no Claude call

Template:
  headline: "{amount} uninvested this month"
  body: "Your {bucket} bucket is furthest from target.
         See suggested instruments to put this to work."
  action: VIEW_SUGGESTIONS → opens InstrumentSuggestionSheet
```

---

### Insight 5 — Monthly Review

```
Trigger: first app open of new calendar month
Minimum: 3 months spend + portfolio data
Source:  rich Claude API call, structured JSON output
Cost:    ~0.008 EUR per call (largest prompt)
Cache:   entire calendar month — never regenerates mid-month
Location: Insights tab (MonthlyReviewSheet)
          Portfolio + Home surface review-ready link

Context sent to Claude (percentages only, no absolute values):
  Portfolio allocation by bucket
  Spend last month vs 3-month average
  FIRE progress and projection (if set up)
  Protection coverage months
  Investment plan gap
  Whether mortgage step-down occurred this period

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
    bucketTarget: 'GROWTH' | 'STABILITY' | 'LOCKED' | null,
  },
  fireUpdate: {
    headline: string,
    detail: string,
  } | null,                    // null if FIRE not set up
  nextMonthWatchlist: string[], // 2–3 items max
}

Prompt rules:
  Specific — use the data, not generalities.
  Never recommend specific funds by name.
  Category-level guidance only.
  Warm but direct — no jargon.
  If data insufficient for a section: say so honestly.
  If FIRE not set up: fireUpdate = null (do not fabricate).
```

---

### Cache management

```
MARKET_EVENT_ALERT:     expires 24 hours
PORTFOLIO_HEALTH:       expires when holdings data changes
FIRE_TRAJECTORY:        expires when FIRE inputs change
INVESTMENT_OPPORTUNITY: expires when investment_transfer changes
MONTHLY_REVIEW:         expires at start of next calendar month

triggerHash: hash the data that triggers each insight.
On bucket reassign: invalidate PORTFOLIO_HEALTH immediately.
On new CSV upload: invalidate relevant insights.
On FIRE inputs change: invalidate FIRE_TRAJECTORY.
On new month: invalidate MONTHLY_REVIEW (generate fresh).
```

---

## Price Refresh Services

```
Alpha Vantage: stocks/ETFs, key required, 25 calls/day free
AMFI NAV:      amfiindia.com/spages/NAVAll.txt, no key, cache 24h
CoinGecko:     crypto, no key, 10–50 calls/min
ExchangeRate:  open.er-api.com, no key basic, cache 1h
Finnhub:       news + prices, key required, 60/min, Home Pulse only
```

---

## What You Must NOT Build

```
[NOT YOURS] UI, navigation, auth, storage encryption
[NOT YOURS] Coverage score (removed V1)
[NOT YOURS] Property equity (out of scope V1)
[V2] ML categorisation, tax calc, open banking
[V2] Dynamic fund feeds, Supabase Edge Functions
[V2] Historical performance charts
[V2] Year-end wrapped generation
[NEVER] Buy/sell recommendations, regulated advice, affiliate links
```

---

## Your Output Files

```
/types/asset.ts
/types/liability.ts
/types/transaction.ts
/types/dataSource.ts
/types/insight.ts
/types/portfolio.ts
/types/investmentPlan.ts
/types/fire.ts                   NEW — FIREInputs, FIREOutputs,
                                      FIREAssumptions interfaces

/constants/fireDefaults.ts       NEW — inflation + return defaults
                                      by country code

/services/dataSource.ts
/services/csvDataSource.ts
/services/universalParser.ts
/services/salarySlipParser.ts
/services/priceRefresh.ts
/services/amfiNavFeed.ts
/services/fxRefresh.ts
/services/portfolioCalc.ts
/services/savingsRate.ts
/services/spendCategoriser.ts
/services/fireEngine.ts          UPDATED — full spec above
/services/aiInsights.ts          UPDATED — full 5-insight engine
/services/budgetCap.ts

/store/portfolioStore.ts
/store/spendStore.ts
/store/insightsStore.ts          NEW — insight cache + monthly review cache

/hooks/usePortfolio.ts
/hooks/useSpend.ts
/hooks/useInvestmentPlan.ts
/hooks/useInsights.ts            NEW — insight state for UI consumption
/hooks/useFirePlanner.ts         NEW — FIRE inputs/outputs for UI
```
