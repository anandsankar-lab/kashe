# Kāshe — CLAUDE-financial.md
*Team Member 3: Financial Intelligence*
*Read CLAUDE.md first, then this file.*
*Last updated: 19 March 2026 — Session 12 complete.
CSV parser architecture overhauled: Papa Parse, smart field detector,
Tier 1/2/3 field model, atomic imports, 24 institutions.
Merchant enrichment locked: Option C (Clearbit) → Option A (Claude).
Retry queue caps locked. Audit data added to CSV output.
Output files updated to reflect what is built vs remaining.*

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
Universal CSV parser    Smart column detection, 24 institutions
Salary slip parser      Dutch loonstrook + Indian salary slip
Price refresh           All market price API integrations
FX rates                Currency conversion service
AMFI NAV feed           Indian mutual fund prices (free, daily)
Spend categoriser       Transaction to category — 3-layer pipeline
Merchant enrichment     Clearbit → Claude API fallback
Portfolio calc          Position, allocation, bucket assignment
Savings rate            Formula + monthly trend tracking
FIRE engine             Calculator + projection logic [V2]
AI insights             Claude API integration — insight engine
Budget cap              Client-side token usage enforcement
fireDefaults            Country-based inflation + return defaults
Catalogue service       Supabase + static fallback for instrument data
Merchant keywords       Geography-aware keyword database
PostHog events          Four learning loop instrumentation
```

---

## The DataSource Abstraction (critical architecture)
```typescript
interface DataSource {
  type: 'CSV' | 'API' | 'MANUAL'
  fetchTransactions(params: FetchParams): Promise<SpendTransaction[]>
  fetchHoldings(params: FetchParams): Promise<Asset[]>
}

class CSVDataSource implements DataSource {
  // V1 implementation
}
// V2: class OpenBankingDataSource implements DataSource {}
// Adding V2 source must NOT require changes to consumers
```

---

## Smart Universal CSV Parser — LOCKED (19 March 2026)

```
LIBRARY: Papa Parse (papaparse npm package)
  Never write a custom CSV tokeniser.
  Papa Parse handles: delimiter detection, encoding,
  malformed rows, streaming large files.

APPROACH: Smart field detection, not institution hardcoding.
  Score every column against field types.
  Institution hints are display labels only — not parse logic.

PIPELINE:
1. Papa Parse reads raw CSV → rows + headers
2. detectColumnMapping(headers, sampleRows) scores each column:
   DATE: header keywords + date pattern matching in data
   AMOUNT: header keywords + numeric detection
   DEBIT_CREDIT_FLAG: header keywords + small unique value set
   DESCRIPTION: header keywords + longest text column
   CURRENCY: header keywords + ISO 4217 codes in data
   REFERENCE: header keywords + high-uniqueness alphanumeric

3. Tier model:
   Tier 1 — BLOCKING (parse fails if missing):
     date, amount, debit/credit direction
   Tier 2 — fallback available:
     currency (infer from geography), description, merchant
   Tier 3 — always has fallback:
     referenceId, geography, isRecurring

4. ParseConfidence computed AFTER parsing:
   tier1Complete: boolean
   tier2Score: 0–1 (fraction of Tier 2 fields found)
   tier3Score: 0–1 (fraction of Tier 3 fields found)
   overallScore: (tier2 × 0.7) + (tier3 × 0.3)
   If tier1Complete = false: ParseError TIER1_FIELDS_MISSING
   If tier1Complete = true: always ParseSuccess (warn if low score)

5. Atomic import — all-or-nothing:
   Any failure mid-import: ParseError ATOMIC_ROLLBACK
   Never return partial results. Never partial state in store.

6. Security pipeline runs INSIDE csvParser (sanitiseTransaction):
   Account numbers → last 4 digits
   IBANs → masked ****1234
   BSN / PAN / Aadhaar → removed entirely
   Raw files: NEVER written to disk

SUPPORTED INSTITUTIONS (24):
  NL:          ABN_AMRO, ING_NL, RABOBANK, BUNQ, SNS_BANK, N26
  EU/Digital:  REVOLUT, WISE
  Investment:  DEGIRO, IBKR
  IN:          HDFC_BANK, HDFC_SECURITIES, ICICI_BANK, SBI,
               AXIS_BANK, KOTAK, ADITYA_BIRLA, ZERODHA, GROWW
  UK:          BARCLAYS, HSBC, MONZO
  US:          CHASE, SCHWAB
  Fallback:    UNKNOWN

Institution hints (lightweight only — display label + amount format):
  Used to name the detected institution for display.
  NOT used to control parse logic — smart detector handles parsing.

AMOUNT PARSING:
  European format: 1.234,56 (remove periods, replace comma → period)
  Standard format: 1,234.56 (remove commas)
  Auto-detected from institution hint or sample data analysis

DEBIT/CREDIT DETECTION (three patterns handled):
  Separate debit + credit columns (HDFC, Revolut)
  Single amount column + flag column (ABN Amro: Af/Bij, SBI: Dr/Cr)
  Single signed amount column (negative = debit)

DEDUPLICATION KEY HIERARCHY:
  Priority 1: referenceId (transaction ID from CSV, where present)
    Exact match against existing transaction referenceIds
  Priority 2: compound key (where no referenceId present)
    key = `${date}|${amount}|${description.slice(0,20).toLowerCase()}`
  Priority 3: fuzzy Dice coefficient (Indian banks only)
    For SBI, HDFC, ICICI, AXIS, KOTAK:
    Same date + same amount + description similarity > 0.8
    → probableDuplicates[] for USER CONFIRMATION
    → never silently skipped

UNRECOGNISED FORMAT:
  Return ParseError with REQUEST_SUPPORT_URL (Google Form)
  User submits bank name + country
  PM prioritises new parsers from form data
  Never leave user without guidance

CSV PARSER OUTPUT (ParseSuccess):
  transactions: SpendTransaction[]   — sanitised, deduplicated
  duplicatesSkipped: number
  probableDuplicates: ProbableDuplicate[]  — for user confirmation
  accountLabel: string               — detected, user-editable
  currency: string
  confidence: ParseConfidence        — for UI feedback
  auditData: ImportAuditData         — for auditStore.logImport()
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
    UI prompts user:
    "We found a pension contribution of X/month.
     Want to add this as a holding?"
    [+ Add pension]  [Skip]

INVESTABLE SURPLUS:
  investableSurplus = monthlyTarget - detectedLockedContributions

PRIVACY:
  Same security pipeline as CSV uploads
  BSN / PAN / Aadhaar / full name stripped before storage
  Raw file discarded immediately after parsing
```

---

## Portfolio Bucket Assignment

```
DEFAULT_BUCKET per asset type:
  etf, index_fund, active_mutual_fund,
  direct_equity, fractional_equity,
  employer_rsu, employer_espp, crypto_spot  →  GROWTH

  savings_account, nre_account, nro_account,
  bond_etf, bond_fund, money_market_fund,
  liquid_fund, debt_fund                    →  STABILITY

  pension_scheme, retirement_account,
  govt_savings_scheme (PPF, NSC, KVP),
  equity_crowdfunding, angel_investment,
  employer_stock_option, ulip,
  endowment_policy                          →  LOCKED

BucketOverride:
  holdingId, overrideBucket, systemBucket,
  overriddenAt, profileId
  Override triggers immediate PORTFOLIO_HEALTH insight invalidation.
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
Only where unlock date known. Never for equity_crowdfunding/angel.
Formula: FV = PV × (1 + r)^n

Default rates (update as announced):
  PPF: 7.1%   EPF: 8.25%   FD: user-entered   NSC: 7.2%

Always show rate source.
Always show: "Projection only — actual returns may vary"
```

---

## Investment Plan Gap Analysis

```
monthlyTarget - salaryDetectedLocked = remainingToAllocate
remainingToAllocate - currentMonthInvested = gapAmount
mostUnderfundedBucket -> drives Investment Opportunity insight

TARGET ALLOCATION — from risk profile (never hardcoded):
  Conservative: GROWTH 40%  STABILITY 40%  LOCKED 20%
  Balanced:     GROWTH 60%  STABILITY 20%  LOCKED 20%
  Growth:       GROWTH 80%  STABILITY 10%  LOCKED 10%

Gap calculation per bucket:
  targetAmount = (allocationPct / 100) * monthlyTarget
  invested = investedThisBucket (from investment_transfer transactions)
  gap = targetAmount - invested
  Show gap and suggestion only if gap > 0
```

---

## Spend Categorisation — Three-Layer Pipeline

### Layer 3 — User Corrections (CHECKED FIRST — DEC-01)
```
User corrections ALWAYS win over any other layer.
merchantOverrides checked BEFORE keyword matching.

On user correction:
  MerchantOverride saved (merchantNorm, category, correctionCount)
  Re-run categorise() on ALL past + future transactions
  from same merchantNorm
  correctionCount >= 5 → log Layer 1 promotion candidate
  V2: 5+ corrections → Supabase merchant_keywords update
  All users benefit

MerchantConfidence: 1.0
```

### Layer 1 — Keyword Rules (CHECKED SECOND)
```
File: /constants/merchantKeywords.ts
Geography-aware. Fast, free, offline.

Structure:
  Record<GeographyCode, Record<SpendCategory, string[]>>

Coverage (minimum):
  NL: albert heijn, jumbo, lidl, aldi, ns, gvb, ret, connexxion,
      thuisbezorgd, tikkie, belastingdienst, ziggo, kpn, coolblue,
      bol com, action, kruidvat, hema, apotheek, eneco, vattenfall
  IN: swiggy, zomato, bigbasket, blinkit, zepto, irctc, ola, rapido,
      zerodha, groww, kuvera, phonepe, gpay, paytm, flipkart, myntra,
      amazon in, jio, airtel
  GB: tesco, sainsburys, waitrose, deliveroo, just eat, tfl,
      national rail, trainline, bt group, boots, superdrug
  US: whole foods, trader joes, kroger, target, walmart, cvs,
      lyft, doordash, grubhub, verizon, att
  GLOBAL: uber, netflix, spotify, apple, google, microsoft, amazon,
          airbnb, booking com, revolut, wise, paypal, h m, zara,
          ikea, starbucks, mcdonalds

Matching: merchantNorm.includes(keyword) — partial match correct
MerchantConfidence: 1.0
```

### Layer 2 — Enrichment (LAST — only for Layer 1/3 misses)
```
Triggered ONLY when Layer 1 AND Layer 3 both miss (confidence = 0.0).
Never called for transactions already matched.

Option C — Clearbit merchant lookup (PRIMARY):
  Send merchant name ONLY — zero user context
  No user ID, no amount, no date, no account info
  Completely anonymous request
  MUST be opt-in: check Settings enrichment toggle before calling
  Privacy policy must disclose use before beta

Option A — Claude API fallback (when Clearbit misses):
  Model: claude-haiku-4-5-20251001
  Send: merchant name + 50-char description snippet ONLY
  Never: amounts, dates, account numbers, PII
  Prompt: classify into SpendCategory, return JSON
  On any failure: return { category: 'other', confidence: 0.3 }
  Never throw from categoriseViaAI()

Retry queue (managed by spendStore):
  Per upload batch cap:  20 enrichment calls maximum
  Daily drain cap:       30 calls per day (first app open)
  Per transaction limit: 3 attempts, then 'other' at 0.3
  Budget gate:           always check isWithinBudget() first
  Over budget:           pause queue entirely

Progressive UI:
  Show results immediately after upload (Layer 1 matched)
  Background queue drains over subsequent days
  UI updates reactively as enrichment completes (Zustand)
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

## FIRE Engine — Full Spec [V2]

### Core formula
```
FIRE number = targetMonthlySpend × 300
  (derived from 4% safe withdrawal rate — Bengen rule)

Projection formula:
  FV = PV × (1 + r)^n + PMT × ((1 + r)^n - 1) / r
  Solve for n where FV >= FIRE number

yearsToFIRE = n / 12
projectedFIREYear = currentYear + yearsToFIRE
```

### Inflation adjustment
```
All monetary values inflation-adjusted to today's terms.
Inflation rates from /constants/fireDefaults.ts:
  NL: 3.0%  IN: 5.0%  GB: 3.0%  US: 3.0%
  DE: 2.5%  FR: 2.5%  BE: 3.0%  OTHER: 3.5%
```

### Mortgage step-down
```
If mortgage liability exists with fixed end date:
  Before mortgageEndDate:  targetMonthlySpend (unchanged)
  From mortgageEndDate:    targetMonthlySpend - monthlyMortgagePayment
```

---

## AI Insight Engine

### Budget cap
```
FREE_MONTHLY_LIMIT:  10,000 input tokens
PAID_MONTHLY_LIMIT: 100,000 input tokens

isWithinBudget check: inputTokensThisMonth < limit × 0.90
When exceeded: return { budgetExceeded: true }
No hard paywall. Soft banner only.
Existing cached insights remain visible.
```

### Insight generation rules
```
One call per app open maximum.
Minimum 1 hour between calls for same insight type.
Generate ONLY highest-priority stale insight.
Priority: MARKET_EVENT → PORTFOLIO_HEALTH → INVESTMENT_OPPORTUNITY
FIRE_TRAJECTORY: V2, skip entirely in V1.

Check lastInsightCheck before any call.
```

### AI privacy rules (non-negotiable)
```
NEVER send raw transactions
NEVER send absolute monetary values
NEVER send merchant names to insight API
Send ONLY: category totals, bucket percentages, savings rate
Send ONLY: portfolio allocation percentages, instrument types

SpendSummaryForAI:
  totalSpendRange: 'under_2k' | '2k_5k' | 'over_5k'  // range not exact
  byCategory: Record<SpendCategory, number>             // totals OK
  comparisonVsLastMonth: number                         // percentage only
  anomalies: string[]                                   // "eating_out 34% above avg"
  monthYear: string

PortfolioSummaryForAI:
  allocationByBucket: Record<string, number>            // percentages only
  totalPositionRange: 'under_100k' | '100k_500k' | 'over_500k'
  riskProfile: RiskProfileType
  underfundedBuckets: string[]
  savingsRate: number
```

### Insight 1 — Market Event Alert
```
Trigger: once per 24 hours on app open
Model:   claude-haiku-4-5-20251001 (with web search enabled)
Cost:    ~0.025 EUR per call (includes discovery pass)
Cache:   24 hours

Research tier system, confidence scoring, instrument-class
source routing — see ai-insights.md for full spec.
```

### Insight 2 — Portfolio Health Alert
```
Trigger: data change OR weekly check
Model:   claude-sonnet-4-20250514 (no web search)
Cost:    ~0.002 EUR per call
Cache:   invalidated on holdings change

Trigger conditions (any one sufficient):
  Growth bucket <50% (>10% below target per risk profile)
  Single holding >15% of live portfolio
  Employer stock >15% of live portfolio
  No protection designation + cash holdings exist
  Monthly invested < target * 0.8
  INR weakened >3% vs EUR in 90 days + India >20%
  Vesting event within 30 days
```

### Insight 3 — Investment Opportunity
```
Cost:    ZERO — fully templated, no Claude call
Trigger: savingsRate >20% AND investment_transfer < target * 0.8

Template:
  headline: "{amount} uninvested this month"
  body: "Your {bucket} bucket is furthest from target.
         Explore suggested instruments to put this to work."
  action: VIEW_SUGGESTIONS → opens InstrumentDiscoverySection
```

### Insight 4 — Monthly Review
```
Trigger: first app open of new calendar month
Minimum: 3 months spend + 1 month portfolio data
Model:   claude-sonnet-4-20250514 (no web search)
Cost:    ~0.008 EUR per call
Cache:   entire calendar month — never regenerates mid-month

Context: percentages only, no absolute values
  allocationByBucket, spendLastMonthVs3MonthAvg,
  protectionCoverageMonths, investmentPlanGapPct,
  mortgageStepDownOccurredThisPeriod,
  dataMonthsAvailable: { spend, portfolio }

If data insufficient for any section: return null for that field.
Never fabricate. Never pad with generalities.
```

---

## Cache Management

```
MARKET_EVENT_ALERT:     expiresAt = generatedAt + 24h
PORTFOLIO_HEALTH:       invalidated on holdings data change
INVESTMENT_OPPORTUNITY: invalidated on investment_transfer change
MONTHLY_REVIEW:         invalidated at midnight on 1st of next month

Implementation:
  Insight has expiresAt field (ISO string)
  On app open: compare expiresAt vs now
  If expired: regenerate (subject to budget + throttle)
  On bucket reassign: immediately invalidate PORTFOLIO_HEALTH
```

---

## Price Refresh Services

```
Alpha Vantage: stocks/ETFs, key required, 25 calls/day free
AMFI NAV:      amfiindia.com/spages/NAVAll.txt, no key, cache 24h
CoinGecko:     crypto, no key, 10–50 calls/min
ExchangeRate:  open.er-api.com, no key basic, cache 1h
Finnhub:       news + prices, key required, 60/min
```

---

## What You Must NOT Build

```
[NOT YOURS] UI, navigation, auth, storage encryption
[NOT YOURS] Coverage score (removed V1)
[NOT YOURS] Property equity (out of scope V1)
[V2] ML categorisation, open banking, Supabase Edge Functions
[V2] Historical performance charts
[V2] Year-end wrapped generation
[V2] FIRE engine integration (types built, not used in V1)
[NEVER] Buy/sell recommendations
[NEVER] Regulated advice
[NEVER] Affiliate links
[NEVER] KasheScore shown to user as a number
[NEVER] Crypto suggestions (track_only — never suggest)
[NEVER] Equity crowdfunding suggestions (track_only)
[NEVER] Raw transactions sent to Claude API
[NEVER] Clearbit sent user ID, amounts, dates, or any context
[NEVER] Merchant enrichment on Layer 1 matches
[NEVER] Partial CSV imports
[NEVER] Raw CSV files written to disk
```

---

## Your Output Files

```
/constants/merchantKeywords.ts     ✅ Session 12
/constants/fireDefaults.ts         ✅ Session 11 (V2 foundation)

/services/storageService.ts        ✅ Session 12
/services/secureStorageAdapter.ts  ✅ Session 12
/services/spendCategoriser.ts      ✅ Session 12
/services/csvParser.ts             ✅ Session 12
/services/aiInsightService.ts      ⬜ Session 12 remaining
/services/analyticsService.ts      ⬜ Session 12 remaining

/store/spendStore.ts               ✅ Session 12
/store/portfolioStore.ts           ✅ Session 12
/store/insightsStore.ts            ✅ Session 12
/store/householdStore.ts           ✅ Session 12
/store/auditStore.ts               ✅ Session 12

/hooks/useSpend.ts                 ⬜ Session 12 remaining
/hooks/usePortfolio.ts             ⬜ Session 12 remaining
/hooks/useInsights.ts              ⬜ Session 12 remaining
/hooks/useHousehold.ts             ⬜ Session 12 remaining
/hooks/useInstrumentCatalogue.ts   ⬜ Session 12 remaining

Not building in V1 (spec only):
/types/asset.ts                    ⬜ types spec in data-architecture.md
/types/liability.ts                ⬜ types spec in data-architecture.md
/services/salarySlipParser.ts      ⬜ Session 14+
/services/priceRefresh.ts          ⬜ Session 13+
/services/amfiNavFeed.ts           ⬜ Session 13+
/services/fxRefresh.ts             ⬜ Session 13+
/services/portfolioCalc.ts         ⬜ Session 13+
/services/savingsRate.ts           ⬜ Session 13+
/services/fireEngine.ts            ⬜ V2
/services/catalogueService.ts      ⬜ V2 (Supabase)
```
