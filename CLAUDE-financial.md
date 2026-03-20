# Kāshe — CLAUDE-financial.md
*Team Member 3: Financial Intelligence*
*Read CLAUDE.md first, then this file.*
*Last updated: 20 March 2026 — Session 12 complete.*
*AI insight engine fully built (5 files, DL-07).*
*UserFinancialProfile architecture complete (DL-09).*
*Analytics events and user properties finalised.*
*Sophistication score added. T11 + T12 triggers added.*
*FIRE confirmed V2 only — no generation in V1.*

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
User profile service    UserFinancialProfile builder
Budget cap              Client-side token usage enforcement
fireDefaults            Country-based inflation + return defaults
Catalogue service       Supabase + static fallback for instrument data
Merchant keywords       Geography-aware keyword database
Analytics               PostHog instrumentation — four learning loops
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

See data-architecture.md for full spec.

Key locked decisions:
- Papa Parse for mechanical parsing (never custom tokeniser)
- Smart field detector — scores columns, assigns types
- Post-parse confidence scoring (not pre-parse prediction)
- Tier 1/2/3 field model
- Atomic imports — all-or-nothing
- Hybrid dedup: referenceId → compound key → Dice (Indian banks)
- 24 institutions across NL/EU/IN/UK/US + UNKNOWN fallback
- NOTE: csvParser imports SpendTransaction as Transaction — fix Session 16

---

## UserFinancialProfile Architecture — LOCKED (20 March 2026)

This is the central intelligence spine. Everything reads from it.

```
/types/userProfile.ts
  UserFinancialProfile interface
  VEHICLE_CATEGORY_MAP — vehicle → asset class category
  CASH_LIKE_VEHICLES — vehicles that count as cash-like
  ILLIQUID_SPECULATIVE_VEHICLES — locked + alternative + crypto

/services/userProfileService.ts
  buildUserFinancialProfile() — main builder, async
  computeSophisticationScore() — 0–100, five components
  computeSophisticationBand() — maps score to band label
  computePortfolioTier() — with 20% hysteresis for tier-down
  computeVehiclePercentages() — cashLikePct + illiquidPct
  computeInvestingFrequency() — from investment_transfer cadence
  computeSavingsRateBand() — from income vs spend
  computeImportFreshness() — from last import date
```

### Sophistication score components (0–100):
```
1. Vehicle diversity  (0–25)  — distinct asset class categories held
   Mapping via VEHICLE_CATEGORY_MAP:
     cash_like, fixed_income, equity, locked, alternative
   1 category = 6pts → 5 categories = 25pts (cap)

2. Liquidity balance  (0–25)  — all three buckets meaningfully funded
   lockedPct > 60%: 5pts (too locked)
   stabilityPct > 70%: 8pts (too much cash, under-invested)
   growthPct >= 40 + stability >= 10 + locked >= 5: 25pts (balanced)
   else: 15pts

3. Protection coverage (0–20) — emergency fund months
   >= 6 months: 20pts
   >= 3 months: 15pts
   >= 1 month:  8pts
   < 1 month:   0pts

4. Investing consistency (0–15) — regular investing cadence
   'frequent' (>4/mo): 15pts
   'monthly' (1–3/mo): 12pts
   'rarely' (<1/mo):    4pts
   'unknown':           0pts

5. Geographic spread (0–15)  — home bias reduction
   3+ geographies: 15pts
   2 geographies:  10pts
   1 geography:     3pts
```

### Bands:
```
0–25:   'foundation'    — basics missing, PORTFOLIO_HEALTH always priority
26–50:  'building'      — progress, standard priority order
51–75:  'established'   — solid, full suite
76–100: 'sophisticated' — rich context, maximum source depth
```

### Key scenarios (illustrative):
```
€500k all in savings/FD → sophisticationScore ~20
  → T11_CASH_PILE_CONCENTRATION fires
  → Insight: "Substantial savings eroding to inflation"
  → Action: VIEW_SUGGESTIONS → GROWTH bucket

€100k overleveraged on illiquid → sophisticationScore ~15
  → T12_LIQUIDITY_CONCENTRATION fires
  → Insight: "Portfolio locked up — no liquid buffer"
  → Action: VIEW_SUGGESTIONS → STABILITY bucket

€80k ETFs + MFs + savings + PPF → sophisticationScore ~78
  → No vehicle trigger fires
  → MARKET_EVENT is priority
  → Discovery pass searches Vanguard IR, PPFAS blog, RBI FEMA
```

---

## Portfolio Bucket Assignment

```
DEFAULT_BUCKET per asset type:
  GROWTH:    eu_etf, index_fund, active_mutual_fund, in_mutual_fund,
             direct_equity, fractional_equity, employer_rsu, employer_espp,
             crypto_spot

  STABILITY: savings_account, nre_account, nro_account, bond_etf, bond_fund,
             money_market_fund, liquid_fund, debt_fund

  LOCKED:    ppf, epf, nps, pension_scheme, govt_savings_scheme,
             endowment_policy, equity_crowdfunding, angel_investment,
             employer_stock_option, ulip

BucketOverride: stored per profile. Override triggers immediate
PORTFOLIO_HEALTH insight invalidation.
```

---

## Protection Designation

```
One Stability holding designated as emergency fund.
Recommended: 3–6 × average monthly spend.
Average spend: from spendStore last 3 months.
Shield icon replaces geography flag in PortfolioHoldingRow.
Designation stored in portfolioStore.protectionHoldingId.
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

FIRE is entirely V2. No FIRE generation in V1.
fireIsSetUp in UserFinancialProfile affects monthly review.
FIRE_TRAJECTORY insight type: returns not_implemented in V1.

```
FIRE number = targetMonthlySpend × 300
Projection: FV = PV × (1 + r)^n + PMT × ((1 + r)^n - 1) / r
Inflation rates (from fireDefaults.ts):
  NL: 3.0%  IN: 5.0%  GB/US: 3.0%  DE/FR: 2.5%  BE: 3.0%  OTHER: 3.5%
Mortgage step-down: if endDate within projection, reduce targetSpend
```

---

## AI Insight Engine — Full Architecture

### Five files (all committed)
```
/constants/insightSources.ts      Seed sources, PM-curated quarterly
                                   KNOWN_HIGH_AUTHORITY_DOMAINS
                                   computeSourceQuality() heuristic
                                   rankSources(), getActiveSeedSources(profile)

/constants/insightTriggers.ts     12 trigger conditions (T1–T12)
                                   evaluateAllTriggers(input, fxParams)
                                   All pure functions, testable independently

/constants/insightPrompts.ts      BASE_SYSTEM_PROMPT (injection defence)
                                   buildMarketEventPrompt()
                                   buildPortfolioHealthPrompt()
                                   buildMonthlyReviewPrompt()
                                   enforceWordLimit(), isSafeForPrompt()

/services/holdingsContextBuilder.ts
                                   HoldingIdentifier — ISIN/ticker, % only
                                   HoldingsContextForAI — never absolute values
                                   buildHoldingsContext() — from stores
                                   ISSUER_IR_URLS — ISIN → issuer IR page
                                   TICKER_IR_URLS — ticker → company IR
                                   TODO Session 13: wire to UserFinancialProfile

/services/aiInsightService.ts     isGenerating in-memory lock
                                   pessimistic budget accounting
                                   clock manipulation detection
                                   12-hour generation windows
                                   max 2 generations per day
                                   validateApiKey() (sk-ant- prefix)
                                   runDiscoveryPass() for tier 2+
                                   FIRE_TRAJECTORY not_implemented
```

### Insight types + costs
```
MARKET_EVENT_ALERT:     ~€0.025/call (includes discovery pass ~€0.005)
                        Web search ENABLED. 24h cache.
                        Trigger: first app open per 12-hour window.

PORTFOLIO_HEALTH:       ~€0.002/call
                        No web search. Local calc → Claude narrative.
                        Trigger: any T1–T12 condition fires.
                        12 trigger conditions total.

INVESTMENT_OPPORTUNITY: ZERO cost — fully templated, no Claude call
                        savingsRate >20% AND invested < target × 0.8

MONTHLY_REVIEW:         ~€0.008/call
                        No web search. Rich context.
                        Trigger: first app open of new calendar month.
                        Requires 3mo spend + 1mo portfolio data.
                        Never regenerates mid-month.

FIRE_TRAJECTORY:        not_implemented in V1
                        Returns { success: false, reason: 'not_implemented' }
```

### Budget cap
```
FREE_MONTHLY_LIMIT:   10,000 input tokens
PAID_MONTHLY_LIMIT:  100,000 input tokens
BUDGET_CAP_BUFFER:    0.90 (stop at 90% of limit)

Pessimistic accounting:
  Deduct estimated tokens BEFORE the API call
  Reconcile actual tokens AFTER success
  Restore estimated tokens on failure
  → Budget always at worst-case, never under-counted

Clock manipulation defence:
  If stored monthYear > current monthYear: do NOT reset
  Freeze at current usage. Return budget_exceeded.

Per-insight failure counter:
  After MAX_FAILURES_PER_TYPE_PER_DAY (3): pause that type 24h
  Resets each calendar day
```

### Portfolio tier → search depth
```
Tier 1 (< €25k):      3 sources, seed only, no discovery pass
Tier 2 (€25k–€100k):  6 sources, discovery pass runs
Tier 3 (€100k–€500k): 10 sources, full tiered system
Tier 4 (> €500k):     14 sources, full + instrument routing
```

### Sophistication score → insight framing
```
foundation:    PORTFOLIO_HEALTH always priority over MARKET_EVENT
               Monthly review: basics first
building:      Standard priority order
established:   Full suite, standard depth
sophisticated: Richest context, all sources active
```

### Trigger conditions (T1–T12)
```
T1:  Growth bucket >10% below risk profile target
T2:  Single holding >15% of live portfolio
T3:  Employer stock >15% of live portfolio
T4:  No protection designation + cash holdings exist
T5:  Monthly invested < target × 0.8
T6:  INR weakened >3% vs EUR in rolling 90 days + India >20%
T7:  Vesting event within 30 days
T8:  Employer stock >10% AND salary from same employer
     (double exposure — income + portfolio tied to one company)
T9:  Locked >40% AND protection coverage <3 months
     (liquidity gap — can't access money when needed)
T10: Stability >30% + bond ETF/fund exposure + rising rate environment
     (interest rate sensitivity)
T11: Portfolio tier 2+ AND cash-like vehicles >70% AND no equity held
     (large cash pile not working)
T12: Illiquid/speculative >70% AND stability <15% AND protection <2mo
     (overleveraged on illiquid — financially fragile)
```

### financialVehicles → source activation
```
eu_etf / index_fund      → justETF, Curvo, Euronext, Vanguard/iShares IR
in_mutual_fund           → AMFI, fund house IR, ValueResearch, Freefincal,
                           Capitalmind, Morningstar India
employer_rsu / espp      → SEC EDGAR, company IR, Glassdoor
ppf / epf / govt_savings → Ministry of Finance, EPFO, RBI small savings
nre_account / nro_account → RBI FEMA, SEBI NRI guidelines, SBNRI, Cleartax NRI
pension_scheme           → DNB, pension fund pages, Pensioenfederatie
direct_equity            → NSE/BSE + company IR via ISIN/ticker lookup
crypto_spot              → CoinDesk, The Block, Decrypt (track-only)
bond_etf / bond_fund     → ECB, RBI rate decision sources
```

### Source quality heuristics
```
computeSourceQuality() — free signals, no API:
  isRegulator → 95 (sebi.gov.in, rbi.org.in, ecb.europa.eu)
  isOfficialIssuer → 90 (fund house IR pages, company IR)
  parentBrand → 85 (subdomain of known issuer)
  knownHighAuthority → 80 (KNOWN_HIGH_AUTHORITY_DOMAINS list)
  TLD: .gov → 88, .edu → 68, .org → 52, social → 40
  commercial unknown → 30 (earns up via useCount + avgRelevanceScore)

SimilarWeb enrichment: PM workflow, not runtime API call
  PM checks manually during weekly review for pendingReview sources
  Sets similarWebGlobalRank, googleNewsIndexed, pmQualityAdjustment
  effectiveQualityScore = pmVerifiedQualityScore if reviewed, else computedQualityScore
```

### Auto-evolving sources (Option B)
```
Discovered sources: accumulate in insightsStore.discoveredSources[]
  NOT in constants file — PM-curated seed stays clean
  PM reviews pendingReview: true sources weekly (15 min)
  Computed quality score applied immediately on discovery
  PM can set pmVerifiedQualityScore on review
  PM can soft-delete via removed: true
  Source cap per tier enforced on rankSources() output
```

### Prompt injection defence
```
BASE_SYSTEM_PROMPT includes injection defence string
isSafeForPrompt() validates all user-influenced string fields:
  /ignore\s+(all\s+)?(previous\s+)?instructions/i
  /system\s*:/i
  /you\s+are\s+(now\s+)?a/i
  /forget\s+(everything|all)/i
  /new\s+instruction/i
  /override\s+(your\s+)?prompt/i
  /\bDAN\b/
  /jailbreak/i
  /act\s+as\s+if/i
validateForPromptSafety() checks all holdings identifiers
If injection detected: return injection_detected reason
  → NEVER send to analytics (log locally only)
```

### API privacy rules (non-negotiable)
```
NEVER send raw transactions to Claude API
NEVER send absolute monetary values
NEVER send merchant names to insight API
NEVER send UserFinancialProfile directly to Claude
Send ONLY via context builders:
  - Category totals, bucket percentages, savings rate band
  - Portfolio allocation percentages (not absolute values)
  - Instrument types and geographies (percentages + enum values)
  - ISIN/ticker identifiers (public — not PII)
  - totalPositionRange (band, not exact value)
```

---

## Analytics Architecture — LOCKED (20 March 2026)

### PostHog project
```
Host: eu.posthog.com (EU data residency, GDPR compliant)
Project ID: 144615
Key: phc_i9rgKR4VVPTBzHUL1jur68kdn7SvXovSOGubxUKHWJz
     Write-only client key — safe in app code
     Cannot read data. No risk from exposure.
ANALYTICS_ENABLED = false — PM enables after full checklist
```

### updateUserProperties(profile) — single call pattern
```
Called by userProfileService after every profile update.
Maps ALL PostHog user properties from UserFinancialProfile.
NEVER set PostHog properties anywhere else.

Key properties:
  financial_vehicles[]     — PostHog array, filterable by 'contains'
  portfolio_tier           — 1/2/3/4
  sophistication_band      — foundation/building/established/sophisticated
  is_nri_profile           — boolean
  import_freshness         — fresh/stale/very_stale/never
  household_type           — individual/couple/family/multi_managed
  investing_frequency      — rarely/monthly/frequent/unknown
  savings_rate_band        — low/medium/high/unknown
  (full list in CLAUDE-state.md)
```

### Events (17 total)
```
Loop 1 — Catalogue freshness:
  instrument_tapped, instrument_added, instrument_skipped

Loop 2 — Spend accuracy:
  category_correction (pattern_known not merchant_type)
  layer1_promotion_candidate

Loop 3 — Insight quality:
  insight_viewed, insight_actioned, insight_dismissed (+ time_visible_ms)
  insight_generation_result (result enum, no injection_detected)
  monthly_review_opened, monthly_review_section_read

Loop 4 — CSV + data:
  csv_uploaded (institution, transaction_count, parse_confidence)

PM visibility:
  portfolio_tier_changed (from_tier, to_tier, direction — no amounts)
  milestone_reached (first_upload | protection_designated |
    budget_configured | monthly_target_set | risk_profile_actively_set |
    first_monthly_review | api_key_added | second_institution_added |
    first_category_correction | salary_slip_uploaded)
  pm_snapshot_exported (session_number, data months)

General:
  screen_viewed, risk_profile_set, app_opened
```

### Analytics → action loop
```
Signal: insight dismiss rate > 70% for MARKET_EVENT
Action: tighten prompt in insightPrompts.ts, commit

Signal: category_correction from='other' to='eating_out' × 5+ users
Action: ask beta users for merchant name, add to merchantKeywords.ts

Signal: instrument_skipped at position=0 for STABILITY bucket
Action: review STABILITY first suggestion 'why' copy

Signal: csv_uploaded parse_confidence < 0.6 for ABN_AMRO
Action: add institution hint to INSTITUTION_HINTS in csvParser

Signal: import_freshness='stale' for user
Action: nudge on next app open (Session 16 feature)
```

---

## Snapshot Export (Session 16.5)

```
/services/snapshotService.ts
  Reads from all stores. Builds export JSON. Zero PII.
  Contains: dataHealth, spendAccuracy (layer distribution),
  insightEngagement (by type, dismiss rates, budget %),
  portfolioHealth (triggers fired, freshness), csvParsing
  (confidence by institution), catalogueDiscovery, appUsage,
  feedbackNotes (500 char free text from tester)
  NEVER: transaction descriptions, merchant names, amounts,
         account numbers

/services/shareService.ts
  JSON file attachment + readable text summary
  Native share sheet (WhatsApp, email, etc.)
  File deleted after share completes

Trigger: 5-second long press on KasheAsterisk in AppHeader
  Always available (no __DEV__ wrapper) — for beta device testing
  PM receives files, reviews weekly, drops to Dropbox/Drive folder
```

---

## PM Dashboard (Session 16.5)

```
/components/shared/PMDashboard.tsx
  Trigger: 5-second long press on KasheAsterisk in AppHeader
  Shows: analytics signals, pending source review queue,
         catalogue review queue, Layer 1 promotion candidates,
         bug registry snapshot (counts only), session progress

PostHog dashboards (setup manually in PostHog UI):
  Dashboard 1: Spend Accuracy
    - Category correction rate over time (by merchant_type)
    - Top corrected category pairs
    - Layer 1/2/3 distribution

  Dashboard 2: Insight Quality
    - Dismiss rate by insight type (filter: time_visible_ms < 5000)
    - Action rate by insight type
    - Monthly review section read completeness

  Dashboard 3: Catalogue Discovery
    - Skip rate by bucket (position=0 separately)
    - Instrument tap-to-add funnel

  Dashboard 4: CSV Health
    - Parse confidence by institution
    - Upload success rate over time
    - Institution distribution

Weekly PM workflow: 20 min Monday
  1. Check 4 PostHog dashboards — 4 key metrics
  2. Review snapshot exports — sources pending review, failures
  3. One change maximum per week
  4. Commit: "Analytics-driven: [what] from [signal]"
```

---

## Price Refresh Services

```
Alpha Vantage: stocks/ETFs, key required, 25 calls/day free
AMFI NAV:      amfiindia.com/spages/NAVAll.txt, no key, cache 24h
CoinGecko:     crypto, no key, 10–50 calls/min
ExchangeRate:  open.er-api.com, no key basic, cache 1h
Finnhub:       news + prices, key required, 60/min
               Filters to tickers user actually holds
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
[V2] FIRE engine integration (types built, not used V1)
[NEVER] Buy/sell recommendations
[NEVER] Regulated advice
[NEVER] Affiliate links
[NEVER] KasheScore shown to user as a number
[NEVER] Sophistication score shown to user as a number
[NEVER] Crypto suggestions (track_only — never suggest)
[NEVER] Equity crowdfunding suggestions (track_only)
[NEVER] Raw transactions sent to Claude API
[NEVER] Clearbit sent user ID, amounts, dates, or any context
[NEVER] Merchant enrichment on Layer 1 matches
[NEVER] Partial CSV imports
[NEVER] Raw CSV files written to disk
[NEVER] UserFinancialProfile sent directly to Claude
[NEVER] FIRE UI in V1 — FIRE_TRAJECTORY returns not_implemented
[NEVER] injection_detected sent to analytics
[NEVER] PostHog properties set manually outside updateUserProperties()
```

---

## Your Output Files

```
/constants/merchantKeywords.ts     ✅ Session 12
/constants/fireDefaults.ts         ✅ Session 11 (V2 foundation)
/constants/insightSources.ts       ✅ Session 12 (DL-07, updated DL-09)
/constants/insightTriggers.ts      ✅ Session 12 (DL-07, updated DL-09)
/constants/insightPrompts.ts       ✅ Session 12 (DL-07)

/types/userProfile.ts              ✅ Session 12 (DL-09)

/services/storageService.ts        ✅ Session 12
/services/secureStorageAdapter.ts  ✅ Session 12
/services/spendCategoriser.ts      ✅ Session 12
/services/csvParser.ts             ✅ Session 12
/services/holdingsContextBuilder.ts ✅ Session 12 (DL-07)
                                   TODO Session 13: wire to UserFinancialProfile
/services/aiInsightService.ts      ✅ Session 12 (DL-07)
/services/analyticsService.ts      ✅ Session 12 (DL-08, updated DL-09)
/services/userProfileService.ts    ✅ Session 12 (DL-09)
/services/snapshotService.ts       ⬜ Session 16.5
/services/shareService.ts          ⬜ Session 16.5

/store/spendStore.ts               ✅ Session 12
/store/portfolioStore.ts           ✅ Session 12
/store/insightsStore.ts            ✅ Session 12
/store/householdStore.ts           ✅ Session 12 (updated DL-09)
/store/auditStore.ts               ✅ Session 12

/hooks/useSpend.ts                 ✅ Session 12
/hooks/usePortfolio.ts             ✅ Session 12
/hooks/useInsights.ts              ✅ Session 12
/hooks/useHousehold.ts             ✅ Session 12
/hooks/useInstrumentCatalogue.ts   ✅ Session 12

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
