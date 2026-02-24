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
CSV parsers       One parser per supported institution
Price refresh     All market price API integrations
FX rates          Currency conversion service
AMFI NAV feed     Indian mutual fund prices
Spend categoriser Transaction → category mapping
Portfolio calc    Position, allocation, coverage score
Savings rate      Formula + monthly tracking
FIRE engine       Calculator + projection logic
AI insights       Claude API integration
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
  // V1 implementation
}

// V2: class OpenBankingDataSource implements DataSource {}
// Adding v2 source must NOT require changes to consumers
```

---

## Supported CSV Formats (v1)

```
Institution          CSV characteristics
─────────────────────────────────────────────────
ABN Amro (NL)        Semicolon-delimited. Columns:
                     Datum, Naam/Omschrijving, Rekening,
                     Tegenrekening, Code, Af Bij,
                     Bedrag (EUR), Mutatiesoort, Mededelingen
                     Date format: YYYY-MM-DD
                     Decimal: comma (1.234,56)

HDFC Bank (IN)       Comma-delimited.
                     Date format: DD/MM/YY
                     Amount: debit/credit separate columns

Revolut (EU)         Comma-delimited.
                     Columns: Type, Product, Started Date,
                     Completed Date, Description, Amount,
                     Fee, Currency, State, Balance
                     Standard ISO date format

DeGiro (EU)          Comma-delimited portfolio export.
                     Columns: Product, Symbol/ISIN,
                     Exchange, Closing, Currency, Value

CAMS (IN)            Pipe-delimited or CSV.
                     All MF holdings across all AMCs.
                     NAV from AMFI feed (not from file).

Zerodha/Groww (IN)   Comma-delimited holdings export.
                     Columns vary — parse by header detection.

Morgan Stanley       CSV export from StockPlan Connect.
(RSU/ESPP)           Columns: Award Type, Grant Date,
                     Vest Date, Shares, Grant Price,
                     Market Price at Vest
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
  | 'transfer'
  | 'other'

// Keywords per category — build comprehensive list
// ABN Amro transactions are in Dutch — include Dutch keywords
// HDFC transactions may be in English or abbreviated
// Case-insensitive matching
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
```

### Risk Allocation
```typescript
type RiskTier = 'MEDIUM' | 'HIGH' | 'CASH_LOW'

// Target: 60% MEDIUM / 20% HIGH / 20% CASH_LOW
// Calculate actual vs target
// Surface variance: "Overweight medium by 8%"
```

### Coverage Score
```typescript
// Honest completeness indicator
// Never shows 100% — always more to add
const ASSET_TYPES_TOTAL = 12  // all possible categories
coverageScore = (assetTypesAdded / ASSET_TYPES_TOTAL) * 100
```

### Savings Rate
```typescript
// The v1 financial health metric
// Calculated locally — no AI
savingsRate = ((income - spend) / income) * 100
// income: sum of credit transactions marked as salary/income
// spend: sum of debit transactions in current month
// Show monthly delta vs previous month
```

---

## FIRE Calculator
```typescript
interface FIREInputs {
  currentPortfolioValue: number    // from portfolio store
  monthlyExpenses: number          // user-declared
  monthlyInvestment: number        // calculated or declared
  currentAge: number               // from profile
  targetAge?: number               // optional
  expectedAnnualReturn: number     // default 7%
  safeWithdrawalRate: number       // default 4%
}

interface FIREResult {
  fireNumber: number               // monthlyExpenses * 12 * 25
  currentProgress: number          // % of fire number
  projectedYear: number            // when target reached
  monthsToFire: number
  projectedAge: number
}

// Note in output: primary residence typically excluded from
// FIRE calculations — flag this but don't enforce it
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
```typescript
// Use claude-sonnet-4-20250514
// max_tokens: 500 per insight
// Never send raw transaction data
// Send aggregated summaries only (privacy)

// Context to include in every prompt:
// - Spend category totals (not individual transactions)
// - Portfolio allocation percentages (not exact values)
// - Savings rate
// - FIRE progress percentage
// - User's geography profile (India + Europe etc)

// Never include in prompts:
// - Account numbers (even masked)
// - Individual transaction descriptions
// - Exact portfolio values
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
/types/asset.ts
/types/liability.ts
/types/transaction.ts
/types/dataSource.ts
/services/dataSource.ts             Abstract interface
/services/csvDataSource.ts          V1 implementation
/services/csvParsers/               One file per institution
  abnAmroParser.ts
  hdfcParser.ts
  revolutParser.ts
  deGiroParser.ts
  camsParser.ts
  zerodhaParser.ts
  morganStanleyParser.ts
/services/priceRefresh.ts           Orchestrates all price APIs
/services/amfiNavFeed.ts            AMFI specific
/services/fxRefresh.ts              Exchange rates
/services/portfolioCalc.ts          Position + allocation calcs
/services/savingsRate.ts            Savings rate formula
/services/spendCategoriser.ts       Keyword → category
/services/fireEngine.ts             FIRE calculations
/services/aiInsights.ts             Claude API integration
/store/portfolioStore.ts            Assets + liabilities state
/store/spendStore.ts                Transactions state
/hooks/usePortfolio.ts              Portfolio data for UI
/hooks/useSpend.ts                  Spend data for UI
```
