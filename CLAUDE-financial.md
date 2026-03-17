# Kāshe — CLAUDE-financial.md
*Team Member 3: Financial Intelligence*
*Read CLAUDE.md first, then this file.*
*Last updated: 17 March 2026 — Instrument catalogue service added,
KasheScore formula locked, spend categorisation Layer 1/2/3 architecture
locked, catalogueService.ts spec added, merchantKeywords.ts spec added,
PostHog event taxonomy added for four learning loops.*

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
Universal CSV parser    Auto-detect any bank CSV format
Salary slip parser      Dutch loonstrook + Indian salary slip
Price refresh           All market price API integrations
FX rates                Currency conversion service
AMFI NAV feed           Indian mutual fund prices (free, daily)
Spend categoriser       Transaction to category — 3-layer pipeline
Portfolio calc          Position, allocation, bucket assignment
Savings rate            Formula + monthly trend tracking
FIRE engine             Calculator + projection logic
AI insights             Claude API integration — full 5-insight engine
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
      type: pension_scheme
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
  Parsed in memory — never persisted raw
  BSN / PAN / Aadhaar / full name stripped before storage
  Same security pipeline as CSV uploads
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

### Layer 1 — Keyword Rules
```
File: /constants/merchantKeywords.ts
Geography-aware. Fast, free, offline.
Updated via Supabase merchant_keywords table → all users benefit.

Structure:
  Record<GeographyCode, Record<SpendCategory, string[]>>

Examples:
  NL: {
    groceries: ['albert heijn', 'jumbo', 'lidl', 'aldi', 'plus supermarkt'],
    eating_out: ['thuisbezorgd', 'uber eats', 'deliveroo', 'mcdonalds'],
    transport: ['ns ', 'gvb', 'ret ', 'htm ', 'arriva', 'connexxion', 'ov-chipkaart'],
    utilities: ['eneco', 'vattenfall', 'nuon', 'ziggo', 'kpn', 't-mobile nl'],
  }
  IN: {
    groceries: ['bigbasket', 'zepto', 'blinkit', 'swiggy instamart', 'jiomart'],
    eating_out: ['swiggy', 'zomato', 'eatsure'],
    investment_transfer: ['zerodha', 'groww', 'kuvera', 'mfcentral', 'cams'],
    income: ['salary', 'neft cr', 'imps cr'],
  }

MerchantConfidence: 1.0 for all Layer 1 matches
```

### Layer 2 — Claude API Enrichment
```
Triggered ONLY when Layer 1 produces no match.
Cost: ~€0.001 per transaction.

Prompt structure:
  "You are a transaction categoriser for a personal finance app
   serving globally mobile professionals.
   
   Categorise this transaction into exactly one category from this list:
   [housing, groceries, eating_out, transport, family, health,
    personal_care, subscriptions, utilities, shopping, travel,
    education, insurance, gifts_giving, investment_transfer,
    transfer, income, other]
   
   Transaction: '{raw_description}'
   Amount: {amount} {currency}
   Country: {country_code}
   
   Return only the category name. Nothing else."

Result cached in merchantOverrides table (Supabase):
  merchant_norm: string
  category: SpendCategory
  source: 'claude_api'
  confidence: 0.8
  createdAt: Date

That merchant never sent to API again.
MerchantConfidence: 0.8
```

### Layer 3 — User Correction
```
User recategorises via TransactionEditSheet.
MerchantOverride saved locally + to Supabase.
MerchantConfidence: 1.0 (highest)

PostHog event:
  category_corrected {
    merchant_norm: string,
    from_category: SpendCategory,
    to_category: SpendCategory,
    geography: GeographyCode,
  }

Monthly review by PM:
  Query PostHog for category_corrected events
  Corrections appearing 5+ times for same merchant:
    → Add to Layer 1 keyword list in Supabase
    → All users benefit immediately
```

---

## Catalogue Service — Supabase + Static Fallback

### catalogueService.ts
```typescript
// /services/catalogueService.ts

import { INSTRUMENT_CATALOGUE } from '../constants/instrumentCatalogue'
import type { InstrumentCatalogueEntry } from '../types/instrumentCatalogue'

const CACHE_KEY = 'kashe_catalogue_cache'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000  // 24 hours

async function fetchCatalogue(): Promise<InstrumentCatalogueEntry[]> {
  // 1. Check local cache
  const cached = await getCachedCatalogue()
  if (cached) return cached

  // 2. Try Supabase
  try {
    const { data, error } = await supabase
      .from('instrument_catalogue')
      .select('*')
      .eq('is_active', true)
    
    if (!error && data && data.length > 0) {
      await setCatalogueCache(data)
      return data
    }
  } catch {
    // Network unavailable — fall through to static
  }

  // 3. Static fallback (offline or Supabase unavailable)
  return INSTRUMENT_CATALOGUE
}

function subscribeToCatalogueUpdates(
  onUpdate: (entries: InstrumentCatalogueEntry[]) => void
): () => void {
  const subscription = supabase
    .channel('catalogue_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'instrument_catalogue',
    }, async () => {
      // Invalidate cache and re-fetch
      await invalidateCatalogueCache()
      const fresh = await fetchCatalogue()
      onUpdate(fresh)
    })
    .subscribe()

  return () => supabase.removeChannel(subscription)
}
```

### Supabase table schema
```sql
-- instrument_catalogue table
-- Schema mirrors InstrumentCatalogueEntry exactly
-- Seed from /constants/instrumentCatalogue.ts on first deploy

CREATE TABLE instrument_catalogue (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT,
  isin TEXT,
  type TEXT NOT NULL,
  bucket TEXT NOT NULL,
  tier INTEGER NOT NULL,
  role TEXT NOT NULL,
  residence_geographies TEXT[] NOT NULL,
  domicile TEXT NOT NULL,
  regulatory_regime TEXT NOT NULL,
  eligible_wrappers TEXT[] NOT NULL,
  currency TEXT NOT NULL,
  platforms JSONB NOT NULL,
  description TEXT NOT NULL,
  why TEXT NOT NULL,
  expense_ratio TEXT,
  ter_footnote BOOLEAN NOT NULL DEFAULT false,
  kashe_score INTEGER NOT NULL DEFAULT 50,  -- 0-100
  risk_tier TEXT NOT NULL,
  liquidity_horizon TEXT NOT NULL,
  risk_warning TEXT,
  tags TEXT[] NOT NULL,
  added_at DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_verified DATE,           -- when PM last reviewed this entry
  next_review_due DATE          -- drives review_queue
);

-- review_queue view — what PM sees in Supabase dashboard
CREATE VIEW review_queue AS
SELECT id, name, expense_ratio, last_verified, next_review_due
FROM instrument_catalogue
WHERE next_review_due <= CURRENT_DATE
  AND is_active = true
ORDER BY next_review_due ASC;
```

### KasheScore calculation
```typescript
// Calculated and stored by PM in Supabase dashboard
// Not calculated in app — editorial decision

function calculateKasheScore(entry: InstrumentCatalogueEntry): number {
  let score = 0

  // Cost efficiency (25pts)
  const ter = parseFloat(entry.expenseRatio ?? '99')
  if (ter === 0)      score += 25
  else if (ter < 0.10) score += 25
  else if (ter < 0.25) score += 20
  else if (ter < 0.50) score += 15
  else if (ter < 1.00) score += 8
  else                score += 2
  // No TER (govt scheme, pension): 25pts
  if (!entry.expenseRatio && entry.type !== 'etf') score += 25

  // Diversification quality (25pts)
  // Set manually based on holdings count + index breadth
  // VWCE/VWRL: 25  |  CSPX: 18  |  Thematic: 8  |  Direct equity: 2

  // Liquidity/accessibility (20pts)
  const platformCount = entry.platforms.length
  if (platformCount >= 4) score += 20
  else if (platformCount >= 2) score += 15
  else score += 8

  // Regulatory strength (15pts)
  const strongRegimes = ['UCITS', 'SEBI', 'SEC', 'FCA', 'BaFin', 'MoF_IN', 'EPFO']
  if (strongRegimes.includes(entry.regulatoryRegime)) score += 15
  else if (entry.regulatoryRegime === 'exchange_listed') score += 8
  else if (entry.regulatoryRegime === 'unregulated') score += 0
  else score += 10

  // Track record (15pts) — based on addedAt as proxy
  // Set manually by PM based on fund inception date

  return Math.min(100, score)
}
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
        equity_crowdfunding/angel, primary residence)
  PMT = monthly savings / investments
  r   = monthly equivalent of annual return
        (1 + annualReturn)^(1/12) - 1

yearsToFIRE = n / 12
projectedFIREYear = currentYear + yearsToFIRE
```

### Inflation adjustment
```
All monetary values inflation-adjusted to today's terms.
targetMonthlySpend is in today's money.
Projection shows real purchasing power, not nominal.

Inflation rates — from /constants/fireDefaults.ts:
  NL: 3.0%  IN: 5.0%  GB: 3.0%  US: 3.0%
  DE: 2.5%  FR: 2.5%  BE: 3.0%  OTHER: 3.5%
  Source: conservative long-term planning assumptions.
  Not current CPI. User can always override.
```

### Mortgage step-down
```
If mortgage liability exists with fixed end date:
  Before mortgageEndDate:  targetMonthlySpend (unchanged)
  From mortgageEndDate:    targetMonthlySpend - monthlyMortgagePayment

  FIRE number recalculated for each phase:
    Phase 1 FIRE number = currentSpend × 300
    Phase 2 FIRE number = reducedSpend × 300
  Projection solves across both phases.

  Surfaced in UI:
    "Your mortgage ends in [year] — this reduces your
     required monthly spend by ~€[X] from that point"
```

### FIRE inputs model
```typescript
interface FIREInputs {
  currentPortfolioValue: number
  monthlyInvestmentAmount: number
  targetMonthlySpendRetirement: number
  currentAge: number
  expectedAnnualReturnPct: number     // default 7.0
  inflationRatePct: number            // from fireDefaults by country
  mortgageEndDate?: Date
  monthlyMortgagePayment?: number
}
```

### FIRE outputs model
```typescript
interface FIREOutputs {
  fireNumber: number
  yearsToFIRE: number
  projectedFIREYear: number
  requiredMonthlySavings: number
  safeWithdrawalAmount: number
  currentTrajectoryYear?: number
  portfolioAtFIRE: number
  assumptions: FIREAssumptions
}

interface FIREAssumptions {
  safeWithdrawalRatePct: 4            // locked, not editable
  expectedReturnPct: number
  inflationRatePct: number
  inflationCountry: string
  primaryResidenceExcluded: true
  unvestedStockExcluded: true
  illiquidAlternativesExcluded: true
}
```

### FIRE scope
```
Household mode (default):
  Aggregate all OWNER + MANAGED profile assets
  PARTNER: V2 only

Individual mode:
  Filter assets to selected profileId only
```

### Exclusions from FIRE number
```
Always excluded:
  Unvested employer stock
  equity_crowdfunding, angel_investment, venture_fund
  Primary residence (out of scope V1)

Included despite being Locked:
  PPF / EPF — real, realisable value at retirement
  FDs — included at maturity projection
```

---

## fireDefaults.ts

```typescript
// /constants/fireDefaults.ts
export const FIRE_INFLATION_DEFAULTS: Record<string, number> = {
  NL: 3.0,   // Netherlands — EC forecast
  IN: 5.0,   // India — RBI 4% target, structural ~5%
  GB: 3.0,   // United Kingdom
  US: 3.0,   // United States
  DE: 2.5,   // Germany
  FR: 2.5,   // France
  BE: 3.0,   // Belgium
  OTHER: 3.5 // Conservative fallback
}

export const FIRE_RETURN_DEFAULT = 7.0
// 7% blended conservative:
//   Indian equity (EUR real): ~8.5%
//   European equity: ~7–8%
//   Blended 60/40: ~8% → 7% for conservatism

export const FIRE_SWR = 4.0
// Bengen rule. Fixed. Not user-editable.

export const FIRE_MULTIPLIER = 300
// = 1/SWR * 12 = 300
```

---

## PostHog Event Taxonomy — Four Learning Loops

All events anonymised. No PII. Never user-identifiable.

### Loop 1 — Catalogue freshness
```typescript
// Instrument discovery interactions
posthog.capture('instrument_tapped', {
  instrument_id: string,
  tier: DiscoveryTier,
  bucket: InstrumentBucket,
  geography: GeographyCode,
  risk_profile: RiskProfileType,
  kashe_score: number,
})

posthog.capture('instrument_added', {
  instrument_id: string,
  source: 'discovery' | 'manual',
  tier: DiscoveryTier,
  bucket: InstrumentBucket,
})

posthog.capture('instrument_skipped', {
  instrument_id: string,
  position: number,  // position in list when skipped
  tier: DiscoveryTier,
})
```

### Loop 2 — Spend category accuracy
```typescript
posthog.capture('category_corrected', {
  merchant_norm: string,        // normalised, never raw
  from_category: SpendCategory,
  to_category: SpendCategory,
  geography: GeographyCode,
  categorisation_source: 'layer1' | 'layer2' | 'layer3',
})
```

### Loop 3 — AI insight quality
```typescript
posthog.capture('insight_viewed', {
  insight_type: InsightType,
  trigger: string,
  risk_profile: RiskProfileType,
})

posthog.capture('insight_actioned', {
  insight_type: InsightType,
  action_type: string,  // 'view_suggestions' | 'open_fire' etc.
})

posthog.capture('insight_dismissed', {
  insight_type: InsightType,
  time_visible_ms: number,  // how long before dismissed
})
```

### Loop 4 — Monthly review quality
```typescript
posthog.capture('monthly_review_opened', {
  month: string,  // '2026-03'
  sections_scrolled: number,  // how far they read
})

posthog.capture('monthly_review_section_read', {
  section: 'whereYouStand' | 'howMoneyWorking' | 
           'priority' | 'fireUpdate' | 'watchlist',
  month: string,
})
```

---

## AI Insight Engine — Full Spec

### Five insight types, priority ordered

```
1. MARKET_EVENT_ALERT      time-sensitive, web search
2. PORTFOLIO_HEALTH        action-needed, local calc + Claude
3. FIRE_TRAJECTORY         important, not urgent
4. INVESTMENT_OPPORTUNITY  helpful, fully templated, zero API cost
5. MONTHLY_REVIEW          scheduled, own card in Invest tab

One insight shows in strip at a time.
Priority order determines which shows when multiple exist.
Monthly Review has its own card — never competes with strip.
```

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

### API key security

```
API key stored in encrypted storage — NEVER in app bundle.
Never in source code. Never in GitHub.

Setup flow: Settings → AI Features → Enter API key
Stored via react-native-encrypted-storage (AES-256)
```

### Insight 1 — Market Event Alert

```
Trigger: once per 24 hours on app open
Source:  Claude API + web search tool enabled
Cost:    ~0.01–0.02 EUR per call
Cache:   24 hours

holdingsContext — percentages only, never absolute values:
  Growth bucket: X% of live portfolio
    EU/US equity: X%
    India equity: X%
    Employer stock: X% (sector: Y)
  Stability bucket: X%
  Locked bucket: X%
  Currency exposure: X% INR, X% EUR etc.

RESEARCH TIERS:
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

TIER 2 — ANALYSIS:
  Seeking Alpha, ValueResearch, Moneycontrol
  Bogleheads forums, Zerodha Varsity community

TIER 3 — SOCIAL:
  Reddit: r/IndiaInvestments, r/DutchFIRE, r/EuropeFIRE,
          r/financialindependence, r/wallstreetbets
  Stocktwits: bullish/bearish ratio for held stocks

Prompt rules:
  Run 5–7 searches across tiers.
  Find ONE most actionable event.
  Return null if nothing material in 48 hours.
  Never fabricate. Never recommend buy/sell.

JSON response:
{
  headline: string,          // max 10 words
  body: string,              // max 40 words
  holdingType: string,
  source: string,
  sourceUrl: string,
  sentiment: 'bullish' | 'bearish' | 'mixed' | 'neutral',
  confidence: 'high' | 'medium' | 'low',
  forumSignal: { summary: string, platforms: string[] } | null
} | null
```

### Insight 2 — Portfolio Health Alert

```
Trigger: data change OR weekly check
Source:  local calculation + Claude for narrative
Cost:    ~0.002 EUR per call

Trigger conditions (any one sufficient):
  Growth bucket <50% (>10% below target per risk profile)
  Single holding >15% of live portfolio
  Employer stock >15% of live portfolio
  No protection designation + cash holdings exist
  Monthly invested < target * 0.8
  INR weakened >3% vs EUR in 90 days + India >20%
  Vesting event within 30 days

Output: { headline, body, action | null }
```

### Insight 3 — FIRE Trajectory Change

```
Trigger: projected FIRE year shifts >6 months vs last month
Both directions trigger — good news too.

Context includes:
  previousProjectedYear, currentProjectedYear
  shiftMonths, direction ('earlier' | 'later')
  spendChangePct, investmentChangePct, portfolioChangePct
  mortgageStepDownOccurring: boolean

Output: { headline, body, action | null }
Max 10 word headline, 40 word body.
```

### Insight 4 — Investment Opportunity

```
Trigger: savingsRate >20% AND investment_transfer < target * 0.8
Source:  local calculation only
Cost:    ZERO — fully templated, no Claude call

Template:
  headline: "{amount} uninvested this month"
  body: "Your {bucket} bucket is furthest from target.
         Explore suggested instruments to put this to work."
  action: VIEW_SUGGESTIONS → opens InstrumentDiscoverySection
```

### Insight 5 — Monthly Review

```
Trigger: first app open of new calendar month
Minimum: 3 months spend + portfolio data
Source:  rich Claude API call, structured JSON output
Cost:    ~0.008 EUR per call (largest prompt)
Cache:   entire calendar month — never regenerates mid-month

Context sent to Claude (percentages only, no absolute values):
  Portfolio allocation by bucket
  Spend last month vs 3-month average
  FIRE progress and projection (if set up)
  Protection coverage months
  Investment plan gap
  Whether mortgage step-down occurred
  Risk profile
  KasheScore of held instruments (as quality signal)

JSON response:
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
  fireUpdate: { headline: string, detail: string } | null,
  nextMonthWatchlist: string[],  // 2–3 items max
}

Prompt rules:
  Specific — use the data, not generalities.
  Never recommend specific funds by name.
  Category-level guidance only.
  Warm but direct — no jargon.
  If data insufficient for a section: say so honestly.
```

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
Finnhub:       news + prices, key required, 60/min
```

---

## What You Must NOT Build

```
[NOT YOURS] UI, navigation, auth, storage encryption
[NOT YOURS] Coverage score (removed V1)
[NOT YOURS] Property equity (out of scope V1)
[V2] ML categorisation, open banking, Supabase Edge Functions
     (V2 adds Edge Function for catalogue freshness — not V1)
[V2] Historical performance charts
[V2] Year-end wrapped generation
[NEVER] Buy/sell recommendations
[NEVER] Regulated advice
[NEVER] Affiliate links
[NEVER] KasheScore shown to user as a number
[NEVER] Crypto suggestions (track_only — never suggest)
[NEVER] Equity crowdfunding suggestions (track_only)
```

---

## Your Output Files

```
/types/instrumentCatalogue.ts    ✅ Session 09 — full type system
/types/asset.ts
/types/liability.ts
/types/transaction.ts
/types/dataSource.ts
/types/insight.ts
/types/portfolio.ts
/types/investmentPlan.ts
/types/fire.ts

/constants/instrumentCatalogue.ts  ✅ Session 09 — ~40 entries
/constants/fireDefaults.ts
/constants/merchantKeywords.ts     Session 12 — geography-aware keywords

/services/catalogueService.ts      Session 12 — Supabase + static fallback
/services/dataSource.ts
/services/csvDataSource.ts
/services/universalParser.ts
/services/salarySlipParser.ts
/services/priceRefresh.ts
/services/amfiNavFeed.ts
/services/fxRefresh.ts
/services/portfolioCalc.ts
/services/savingsRate.ts
/services/spendCategoriser.ts      Session 12 — Layer 1/2/3 pipeline
/services/fireEngine.ts
/services/aiInsights.ts
/services/budgetCap.ts

/store/portfolioStore.ts
/store/spendStore.ts
/store/investStore.ts
/store/insightsStore.ts

/hooks/usePortfolio.ts
/hooks/useSpend.ts
/hooks/useInvestmentPlan.ts
/hooks/useInsights.ts
/hooks/useFirePlanner.ts
/hooks/useInstrumentCatalogue.ts   Session 12 — catalogueService wrapper
```
