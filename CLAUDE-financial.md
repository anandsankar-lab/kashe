# Kāshe — CLAUDE-financial.md
*Team Member 3: Financial Intelligence*
*Read CLAUDE.md first, then this file.*

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
Universal CSV parser   Auto-detect any bank's CSV format
                       Known formats: zero friction
                       Unknown formats: one confirmation screen
Price refresh          All market price API integrations
FX rates               Currency conversion service
AMFI NAV feed          Indian mutual fund prices (free, daily)
Spend categoriser      Transaction → category (multilingual)
Portfolio calc         Position, allocation, concentration risk
Savings rate           Formula + monthly trend tracking
FIRE engine            Calculator + projection logic
AI insights            Claude API integration (10 insight types)
```

---

## The DataSource Abstraction (critical architecture)
```typescript
// All data ingestion goes through this interface
// V1 implements CSVDataSource
// V2 will add OpenBankingDataSource
// Never break this contract

interface DataSource {
  type: 'CSV' | 'API' | 'MANUAL'
  fetchTransactions(params: FetchParams): Promise<Transaction[]>
  fetchHoldings(params: FetchParams): Promise<Asset[]>
}

class CSVDataSource implements DataSource {
  // V1 implementation — smart universal parser
}

// V2: class OpenBankingDataSource implements DataSource {}
// Adding v2 source must NOT require changes to consumers
```

---

## Smart Universal CSV Parser

```
APPROACH: Auto-detect, not fixed format list.

Any CSV from any bank works.
Known banks get zero-friction instant parse.
Unknown banks get one confirmation screen.

PIPELINE:
1. User uploads any CSV file
2. Read header row
3. Score each column against known field types:
     date_field:        contains 'date', 'datum', 'dt'
     amount_field:      contains 'amount', 'bedrag', 'amt'
     description_field: contains 'desc', 'omschrijving',
                        'narration', 'details', 'memo'
     debit_credit_flag: contains 'af bij', 'dr/cr', 'type'
     balance_field:     contains 'balance', 'saldo'
4. If confidence > 85%: auto-map, proceed silently
5. If confidence 60-85%: show mapping confirmation screen
6. If confidence < 60%: ask user to map columns manually

KNOWN FORMATS (instant parse, skip confirmation):
  ABN Amro        Semicolon-delimited, Dutch headers
                  Datum, Naam/Omschrijving, Bedrag (EUR), Af Bij
  DeGiro          Portfolio export, ISIN column present
  HDFC Bank       Comma-delimited, DD/MM/YY dates
  CAMS            Pipe-delimited, scheme code present
  Zerodha/Groww   Holdings export, symbol column
  Morgan Stanley  StockPlan Connect format, vest date column
  Revolut         Started Date + Completed Date pattern

UNKNOWN FORMAT (one confirmation screen):
  Show detected column mapping to user:
  "We found these columns — does this look right?"
  Date       → [detected column] ✓/✗
  Amount     → [detected column] ✓/✗
  Description→ [detected column] ✓/✗
  User corrects if wrong, confirms, parse proceeds.

AMOUNT PARSING:
  Handle both decimal formats:
  European: 1.234,56 (period = thousands, comma = decimal)
  Standard: 1,234.56 (comma = thousands, period = decimal)
  Auto-detect from first numeric cell.

DEBIT/CREDIT DETECTION:
  Some CSVs: separate debit + credit columns
  Some CSVs: single amount, negative = debit
  Some CSVs: Af/Bij or Dr/Cr flag column
  Handle all three patterns.

[V2] Learn from confirmed mappings:
  Store confirmed mappings per institution fingerprint
  Next upload from same bank = instant parse
```

---

## Spend Categorisation
Map transaction descriptions to categories.
Use keyword matching first, ML/AI later (v2).

```typescript
type SpendCategory =
  | 'groceries'
  | 'mortgage_rent'
  | 'childcare'
  | 'eating_out'
  | 'subscriptions'
  | 'transport'
  | 'health'
  | 'utilities'
  | 'shopping'
  | 'travel'
  | 'income'
  | 'investment_transfer'  // money moved to brokerage — NOT spend
  | 'transfer'             // inter-account — NOT spend
  | 'other'

// CRITICAL: investment_transfer and transfer must be
// excluded from spend totals and savings rate calculation.
// Paying into DeGiro or CAMS is NOT spending.

// Keywords per category — multilingual required:
// ABN Amro: Dutch descriptions (Albert Heijn, NS, GVB, etc.)
// HDFC: English abbreviations (NEFT, IMPS, UPI/merchant names)
// Revolut: English, often merchant name only
// Case-insensitive matching always.

// Dutch keyword examples:
// groceries:    'albert heijn', 'jumbo', 'lidl', 'ah to go'
// transport:    'ns ', 'gvb', 'ov-chipkaart', 'connexxion'
// eating_out:   'thuisbezorgd', 'uber eats', 'deliveroo'
// utilities:    'vattenfall', 'nuon', 'eneco', 'ziggo'

// Indian keyword examples:
// groceries:    'bigbasket', 'zepto', 'blinkit', 'swiggy instamart'
// eating_out:   'swiggy', 'zomato'
// investment:   'zerodha', 'groww', 'cams', 'nse clearing'
// income:       'salary', 'neft cr', 'sal ', 'stipend'
```

---

## Merchant Memory
User can manually recategorise any transaction from the
Spend Category Detail screen. When they do:

```typescript
interface MerchantOverride {
  merchantName: string       // normalised, lowercase, trimmed
  category: SpendCategory
  profileId: string          // overrides are per-profile
  createdAt: Date
}

// On recategorisation:
// 1. Save MerchantOverride to encrypted storage
// 2. Re-run categorisation on ALL past transactions
//    from the same merchant → update to new category
// 3. All future imports: merchant override takes priority
//    over keyword matching

// Merchant name normalisation:
// Lowercase, trim whitespace, remove trailing numbers
// "ALBERT HEIJN 1234" → "albert heijn"
// "Thuisbezorgd.nl" → "thuisbezorgd.nl"

// Conflict resolution:
// MerchantOverride always wins over keyword match
// User's explicit choice is never overridden by the system
```

---

## Budget Storage
```typescript
interface CategoryBudget {
  category: SpendCategory
  monthlyLimit: number        // in profile's base currency
  profileId: string           // budgets are per-profile
}

// Budgets are NOT month-specific in v1
// Same budget applies to every month
// Stored in encrypted storage alongside transactions

// Budget suggestion in onboarding:
// suggestedBudget = Math.ceil(actualSpend / 50) * 50
// e.g. actual €347 → suggested €350
// User can edit before accepting

// Services that consume budgets:
// spendCategoriser.ts  → category totals vs limits
// savingsRate.ts       → budget context for home screen
// aiInsights.ts        → SPEND_ANOMALY uses actuals, not budgets
```

---

## Portfolio Calculations

### Financial Position
```typescript
// NOT "net worth" — "Financial Position"
financialPosition = liquidAssets + illiquidAssets - liabilities

// Liquid: stocks, ETFs, MFs, crypto, cash, employer stock
// Illiquid: Crowdcube/Seedrs, property equity
// Liabilities: mortgage, loans, credit card balances

// Display separately — never obscure the liquid number
// A user with €800K position but €700K illiquid
// has a very different real picture than one with €800K liquid
```

### Risk Allocation
```typescript
type RiskTier = 'MEDIUM' | 'HIGH' | 'CASH_LOW'

// Asset → RiskTier mapping:
// CASH_LOW:  Cash, savings accounts, NRE/NRO, PPF, FDs,
//            money market funds, government bonds
// MEDIUM:    Diversified equity MFs (large cap, flexi cap),
//            broad ETFs (VWRL, S&P 500 ETF), balanced funds,
//            blue chip direct equity
// HIGH:      Small/mid cap MFs, sector funds, individual stocks,
//            employer stock (single stock = high risk),
//            crypto, Crowdcube/Seedrs, angel investments,
//            leveraged products

// Default target allocation:
// 60% MEDIUM / 20% HIGH / 20% CASH_LOW
// Justification: age-appropriate for 32-45 professional
// with stable income and long investment horizon.
// Rule of thumb: HIGH % ≈ max(100 - age, 15)
// At 38: max(62, 15) = 62% — but we cap growth assets
// at 80% total (MEDIUM + HIGH) for stability.

// Important: this is a GUIDE not a prescription.
// App surfaces variance, user decides action.
// Never tell user what to do — show them the picture.
```

### Concentration Risk (flag these proactively)
```typescript
// Single stock threshold
CONCENTRATION_WARN  = 0.15   // 15% — yellow flag
CONCENTRATION_ALERT = 0.25   // 25% — red flag

// Employer stock is the most common concentration problem.
// RSUs vest and accumulate silently. Flag early.
// Message: "Your employer stock is now 28% of your portfolio.
//           Consider diversifying after your next vest."

// Geography concentration
GEOGRAPHY_WARN = 0.75        // 75% in one geography — flag

// Single asset type
ASSET_TYPE_WARN = 0.65       // 65% in one type — flag
```

### Indian MF Overlap Detection
```typescript
// Many Indian investors hold 4-6 MFs that all own
// the same NIFTY 50 stocks. Hidden concentration.
// Common overlap culprits:
//   HDFC Flexi Cap + Mirae Asset Large Cap +
//   Axis Bluechip + Kotak Standard Multicap
//   → all >60% large cap, top 10 holdings overlap heavily

// Approach:
// 1. Identify fund categories from AMFI scheme data
// 2. If user holds >2 large-cap/flexi-cap funds → flag overlap
// 3. Message: "Your 4 Indian MFs may hold similar stocks.
//             Consider consolidating to 2-3 funds."
// Full overlap calculation requires AMFI portfolio data — v2.
// v1: category-level overlap flag only.
```

### Coverage Score
```typescript
// Honest completeness indicator
// Never shows 100% — always more to add
const ASSET_TYPES = [
  'indian_mf', 'indian_equity', 'nre_nro',
  'ppf_epf', 'eu_brokerage', 'employer_stock',
  'crypto', 'alternative', 'property_equity',
  'mortgage', 'other_loans', 'credit_card'
]
const ASSET_TYPES_TOTAL = 12
coverageScore = (assetTypesAdded / ASSET_TYPES_TOTAL) * 100
```

### Savings Rate
```typescript
// The v1 financial health metric — calculated locally
savingsRate = ((income - spend) / income) * 100

// income: sum of transactions categorised as 'income'
//         in current calendar month
// spend:  sum of debits EXCLUDING 'investment_transfer'
//         and 'transfer' categories
// CRITICAL: investment transfers are NOT spend.
//           Moving €500 to DeGiro is wealth-building,
//           not consumption.

// Show:
//   Current month rate: 45%
//   vs last month: ↑ 3%
//   vs 3-month average: ↑ 1%  (context matters)

// Healthy savings rate benchmarks (for context only):
//   <10%:  Low — worth flagging gently
//   10-20%: Moderate
//   20-35%: Good
//   >35%:   Strong (FIRE-track)
// Never show these benchmarks as grades — show as context.
```

---

## FIRE Calculator
```typescript
interface FIREInputs {
  currentPortfolioValue: number    // liquid assets only
  monthlyExpenses: number          // user-declared (EUR base)
  monthlyInvestment: number        // calculated or declared
  currentAge: number               // from profile
  targetAge?: number               // optional target
  expectedAnnualReturn: number     // default 7% (see below)
  safeWithdrawalRate: number       // default 4%
  indiaPortfolioFraction: number   // % of portfolio in India
}

interface FIREResult {
  fireNumber: number               // monthlyExpenses * 12 * 25
  currentProgress: number          // % of fire number
  projectedYear: number            // when target reached
  monthsToFire: number
  projectedAge: number
  assumptions: FIREAssumptions     // always show what we assumed
}

// DEFAULT RETURN ASSUMPTIONS (important nuance):
// A globally mobile Indian investor needs blended return thinking.
//
// Indian equity (INR):  ~12% historical CAGR (NIFTY 50, 20yr)
// INR depreciation:     ~3.5% per year vs EUR (historical avg)
// Indian equity (EUR):  ~8.5% real return in base currency
//
// European equity (EUR): ~7-8% historical (broad market)
// Employer stock:        Unpredictable — exclude from FIRE calc
//                        or treat conservatively at 6%
//
// Blended default at 60/40 India/Europe split: ~8%
// Conservative default used: 7% (accounts for sequence risk)
//
// Always show assumptions to user. Never hide them.
// Let user adjust return assumption manually.

// SAFE WITHDRAWAL RATE:
// 4% (Bengen rule, US-based research)
// May be conservative for shorter retirements
// May be aggressive for 40+ year retirements
// Show sensitivity: "At 3.5% SWR your FIRE number is €X"

// WHAT TO INCLUDE:
// ✓ Liquid investment portfolio
// ✓ Cash savings
// ✓ Indian MFs and Demat
// ✗ Primary residence (flag: "excluded — illiquid")
// ✗ Employer stock unvested (flag: "excluded — not yet yours")
// ✗ Crowdcube/Seedrs (flag: "excluded — illiquid")
// User can manually override inclusions

// FIRE NUMBER FORMULA:
// fireNumber = annualExpenses / safeWithdrawalRate
//            = (monthlyExpenses * 12) / 0.04
//            = monthlyExpenses * 300  (at 4% SWR)

// PROJECTION FORMULA (compound growth):
// Future value = PV * (1+r)^n + PMT * ((1+r)^n - 1) / r
// Solve for n where future value >= fireNumber
```

---

## Price Refresh Services

### Auto-refresh trigger
On every app open. Background, non-blocking.

### Alpha Vantage (stocks/ETFs)
```
Base URL: https://www.alphavantage.co/query
Function: GLOBAL_QUOTE for individual stocks
          TIME_SERIES_DAILY for history (v2)
Key: Required — free tier 25 calls/day
Rate limit carefully — batch calls
```

### AMFI NAV Feed (Indian MFs — no key needed)
```
URL: https://www.amfiindia.com/spages/NAVAll.txt
Format: Pipe-delimited
Update: Daily after 6pm IST
Parse: schemeCode → NAV mapping
Match CAMS fund names to AMFI scheme codes
Cache: 24 hours (only update daily)
```

### CoinGecko (crypto — no key needed)
```
URL: https://api.coingecko.com/api/v3/simple/price
Params: ids=[coin-id]&vs_currencies=eur,inr,usd
Free tier: 10-50 calls/min
```

### ExchangeRate-API (FX rates)
```
URL: https://open.er-api.com/v6/latest/{base}
No key for basic usage
Base: user's display currency
Cache: 1 hour
```

### Finnhub (news + prices)
```
Base URL: https://finnhub.io/api/v1
News: /company-news?symbol={ticker}&from={date}&to={date}
Key: Required — free tier 60 calls/min
Use for Portfolio Pulse on Home screen
Filter: only tickers user actually holds
Max 5 news items, most recent first
```

---

## AI Insights (Claude API)

### Privacy rules (non-negotiable)
```typescript
// Model: claude-sonnet-4-20250514
// max_tokens: 500 per insight
// Cache insights: 24 hours (don't regenerate on every open)
// Cost control: max 1 API call per insight type per day

// NEVER send to API:
//   Raw transaction descriptions
//   Account numbers (even masked)
//   Exact portfolio values (use % ranges instead)
//   Any PII

// ALWAYS send as aggregated context:
//   Spend category totals as % of income
//   Portfolio allocation % by risk tier
//   Portfolio allocation % by geography
//   Savings rate (current + 3-month trend)
//   FIRE progress %
//   Concentration flags (boolean — is employer stock >20%?)
//   User geography profile (lives in NL, assets in IN + EU)
```

### The 10 Insight Types
```typescript
type InsightType =
  | 'SPEND_ANOMALY'           // unusual spend vs personal baseline
  | 'CONCENTRATION_RISK'      // single stock/geography overweight
  | 'MF_OVERLAP'              // Indian MF category overlap
  | 'CURRENCY_RISK'           // INR weakening impact on position
  | 'SAVINGS_TRAJECTORY'      // savings rate trend (improving/declining)
  | 'ALLOCATION_DRIFT'        // portfolio drifted from target
  | 'VESTING_ALERT'           // upcoming vest + concentration impact
  | 'SPEND_TO_INVEST_RATIO'   // are savings actually being invested?
  | 'EMERGENCY_FUND'          // months of expenses covered by liquid cash
  | 'FIRE_TRAJECTORY'         // has projected FIRE date moved?

// Each insight has:
interface Insight {
  type: InsightType
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  headline: string            // max 10 words
  body: string                // max 40 words
  action?: string             // optional — one suggested next step
  dataPoints: string[]        // what triggered this insight
  generatedAt: Date
  expiresAt: Date             // 24 hours default
}
```

### Insight Generation Rules
```typescript
// Generate insights in priority order.
// Only generate if sufficient data exists.
// Never fabricate — if data is insufficient, say so.

// SPEND_ANOMALY triggers when:
//   Any category >150% of that category's 3-month average
//   Minimum 2 months of data required

// CONCENTRATION_RISK triggers when:
//   Single stock > 15% of liquid portfolio
//   Single geography > 75%
//   Always check employer stock first — most common

// MF_OVERLAP triggers when:
//   User holds >2 Indian MFs in same AMFI category
//   v1: category-level detection only

// CURRENCY_RISK triggers when:
//   INR has weakened >3% vs EUR in rolling 90 days
//   AND user has >20% of portfolio in India

// SAVINGS_TRAJECTORY triggers when:
//   Savings rate has declined >5% for 2 consecutive months
//   OR savings rate has improved >10% (positive insight)

// ALLOCATION_DRIFT triggers when:
//   Any risk tier is >10% off target
//   e.g. HIGH at 32% vs 20% target = 12% drift → flag

// VESTING_ALERT triggers when:
//   Vesting event within 30 days
//   AND employer stock would exceed 20% post-vest

// SPEND_TO_INVEST_RATIO triggers when:
//   Savings rate > 20% BUT investment_transfer < 10% of income
//   "You're saving but not investing — cash is losing to inflation"

// EMERGENCY_FUND triggers when:
//   Liquid cash < 3 months of monthly expenses
//   Flag gently — this is a safety net question

// FIRE_TRAJECTORY triggers when:
//   Projected FIRE year has shifted by >1 year vs last month
//   Either direction — good news too
```

### AI Prompt Structure
```typescript
// System prompt (constant):
const INSIGHT_SYSTEM_PROMPT = `
You are a financial analysis engine for a personal finance app.
You provide clear, specific, actionable insights.
You never give investment advice or tell users what to do.
You surface facts and patterns — the user decides action.
Respond in 1-2 sentences maximum.
Be direct. No filler words.
`

// User prompt example (SPEND_ANOMALY):
const buildSpendAnomalyPrompt = (data: InsightContext) => `
User profile: Indian professional living in ${data.country}.
This month's spend breakdown (% of income):
${JSON.stringify(data.spendByCategory)}
3-month average breakdown:
${JSON.stringify(data.spendByCategory3mAvg)}
Savings rate: ${data.savingsRate}%

Identify the most significant spend anomaly this month.
Write one insight headline (max 10 words) and one body sentence (max 40 words).
Format: {"headline": "...", "body": "...", "action": "..."}
`
```

---

## What You Must NOT Build
```
[NOT YOURS] Any UI component or screen layout
[NOT YOURS] Navigation or routing
[NOT YOURS] Authentication or session management
[NOT YOURS] Storage encryption (that's Team Member 1)
[V2]        ML-based spend categorisation
[V2]        Tax calculations (capture fields only)
[V2]        Open banking data source
[V2]        Historical performance charts data
```

---

## Your Output Files
```
/types/asset.ts                     Asset interface + AssetType enum
/types/liability.ts                 Liability interface + LiabilityType enum
/types/transaction.ts               Transaction interface + SpendCategory enum
/types/dataSource.ts                DataSource interface
/types/insight.ts                   Insight interface + InsightType enum
/services/dataSource.ts             Abstract DataSource interface
/services/csvDataSource.ts          CSVDataSource implementation
/services/universalParser.ts        Column detection + confidence scoring
                                    Known format fingerprints
                                    Amount format detection (EU vs standard)
                                    Debit/credit pattern detection
/services/priceRefresh.ts           Orchestrates all price API calls
/services/amfiNavFeed.ts            AMFI NAV feed parser + cache
/services/fxRefresh.ts              ExchangeRate-API + 1hr cache
/services/portfolioCalc.ts          Position, allocation, coverage score,
                                    concentration risk flags,
                                    liquid/illiquid split
/services/savingsRate.ts            Savings rate formula + trend tracking
/services/spendCategoriser.ts       Keyword → category (multilingual)
/services/fireEngine.ts             FIRE number, projection, sensitivity
/services/aiInsights.ts             Claude API integration, all 10 insight types
/store/portfolioStore.ts            Assets + liabilities (Zustand)
/store/spendStore.ts                Transactions (Zustand)
/hooks/usePortfolio.ts              Portfolio data shaped for UI
/hooks/useSpend.ts                  Spend data shaped for UI
```
