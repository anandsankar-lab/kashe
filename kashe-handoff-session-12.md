# Kāshe — Session 12 Handoff Document
*Session 11 → Session 12 → Session 13*
*Date: 19 March 2026*
*Status: PARTIAL — DL-01 through DL-05 committed.
DL-06, DL-07, DL-08 remaining.*
*This session has no UI. Verification is tsc + grep only.*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + fintech domain expert helping
Anand build Kāshe — a personal finance app for globally mobile
professionals. Anand is a PM with strong product instincts and is a
coding beginner. One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md (full build state + every locked decision)
2. This file (every section, every decision)
3. engineering-rules.md
4. data-architecture.md
5. CLAUDE-financial.md
6. CLAUDE-identity.md

---

## HOW WE WORK

1. Claude writes the Claude Code prompt in planning chat
2. Anand pastes into Claude Code terminal
3. Terminal output shared back — no UI screenshots this session
4. Claude reviews terminal output + TypeScript errors
5. Claude gives exact git commands
6. Anand runs git commands manually — never through Claude Code
7. Commit confirmed → next ticket

Verification this session:
- `npx tsc --noEmit` returns zero new errors after every ticket
- Zero import errors in terminal on app start
- Both grep checks pass before every commit:
  `grep -r "AsyncStorage"` → zero results in src
  `grep -r "SecureStore"` → only in services/storageService.ts

Every ticket ends with `npx tsc --noEmit`. Non-negotiable.

---

## WHAT WAS BUILT — SESSION 11

All four tabs complete. FIRE removed from all screens.
Foundation files: educationCatalogue, fireDefaults, fire types.
settings.tsx stub with Education section.

---

## WHAT WAS BUILT — SESSION 12 (so far)

### DL-01 ✅ COMMITTED
/services/storageService.ts — expo-secure-store vault door
/services/secureStorageAdapter.ts — Zustand bridge (Option B)

Key decisions made:
- secureStorageAdapter is a SEPARATE file from storageService
  Single responsibility. Easier V2 swap.
- Read failures: graceful degradation (return null, app starts fresh)
- Write failures: always re-throw (DEC-06 — never silent)
- createJSONStorage() wrapper for Zustand v5 compatibility

### DL-02 + DL-03 ✅ COMMITTED
/services/spendCategoriser.ts — three-layer pipeline
/constants/merchantKeywords.ts — geography-aware keywords

Key decisions made:
- Layer 3 checked FIRST (user corrections always win — DEC-01)
- categorise() is SYNCHRONOUS — Layer 2 queued separately
- categoriseViaAI() never throws — always returns a result
- applyUserCorrection() is PURE — returns new array, no side effects
- Layer 1 promotion logging at correctionCount >= 5
- Merchant normalisation: lowercase → strip specials →
  collapse spaces → trim → 40 chars

### DL-04 ✅ COMMITTED
/services/csvParser.ts — smart field detection, atomic imports

MAJOR ARCHITECTURE DECISIONS made this session:
- Papa Parse for mechanical CSV reading (not custom tokeniser)
- Smart field detector — scores columns, assigns types
  NOT institution-specific hardcoding
- Post-parse confidence (not pre-parse prediction)
- Tier 1/2/3 field model (blocking/fallback/nice-to-have)
- Atomic imports — all-or-nothing, ATOMIC_ROLLBACK on failure
- Hybrid deduplication:
    Priority 1: transaction ID (where present)
    Priority 2: compound key (date + amount + desc slice)
    Priority 3: fuzzy Dice coefficient for Indian banks
- Probable duplicates → user confirmation (not silent skip)
- 24 supported institutions (NL/BE/IN/EU/UK/US)
- Google Form fallback for unrecognised formats

NOTE: csvParser imports SpendTransaction as Transaction
(types/spend.ts exports SpendTransaction not Transaction)
This alias is correct for now — align in Session 16 cleanup.

### DL-05 ✅ COMMITTED
5 Zustand stores — all using secureStorageAdapter
/store/spendStore.ts
/store/portfolioStore.ts
/store/insightsStore.ts
/store/householdStore.ts
/store/auditStore.ts — NEW (not in original spec, added this session)

Key decisions made:
- Derived cache in stores (Option A — not recalculated every render)
- lastCalculatedAt: null = never calculated, ISO string = timestamp
- spendStore.addTransactions() runs Layer 1 immediately on import
- Layer 2 misses → retryQueue[] (batch cap: 20/upload, 30/day)
- auditStore: profile-level import audit log, 100-event FIFO cap
- Zustand v5 fix: createJSONStorage(() => secureStorageAdapter)

---

## REMAINING TICKETS — SESSION 12

Build in this exact order. Each depends on the previous.

---

### DL-06: Hooks

**What it builds:**
The clean boundary between stores and UI components.
Components never import stores directly — ever.
Hooks translate raw store data into display-ready values.

**What could go wrong:**
If hooks recalculate on every call instead of using the
derived cache, performance degrades badly with real data.
The 24-hour staleness check (DEC-07) must live here.

**Files:**
  /hooks/useSpend.ts
  /hooks/usePortfolio.ts
  /hooks/useInsights.ts
  /hooks/useHousehold.ts
  /hooks/useInstrumentCatalogue.ts

**Return types: match data-architecture.md exactly.**

useSpend() implementation notes:
- Filter transactions to activeProfileId + selectedMonth
- Exclude 'investment_transfer' and 'transfer' from totalSpend
- hasMinimumHistory: true when ≥2 distinct calendar months of data
- comparisonVsLastMonth: percentage, can be negative
- On mount: check derivedSpend.lastCalculatedAt
  If null OR >24 hours ago: recalculate + call updateDerivedSpend()
  If fresh: return cached values directly
- comparisonVs3MonthAvg: average of previous 3 months

usePortfolio() implementation notes:
- Apply bucketOverrides when computing allocationByBucket
- protectionMonthsCovered = protectionAsset.currentValue
  divided by average monthly spend (from spendStore)
- financialPosition = liveTotal + lockedTotal - liabilities sum
- On mount: check derivedPortfolio.lastCalculatedAt
  If null OR >24h: recalculate + call updateDerived()
- liveTotal: sum of non-illiquid holdings
- lockedTotal: sum of illiquid + LOCKED bucket holdings

useInsights() implementation notes:
- reviewState derives from currentMonthReview + data:
    'unavailable'   → no transactions at all
    'insufficient'  → <3 months of transaction data
    'ready_unread'  → review exists, viewed: false
    'ready_read'    → review exists, viewed: true
- isOverBudget: true if any category exceeds 90% of budget
- dismissInsight: calls insightsStore.dismissInsight()
- pastReviews: last 12 excluding current month

useHousehold() implementation notes:
- activeProfile: Profile object or 'household' literal
- currentProfile: Profile | null (null when household view)
- isAuthenticated: from householdStore

useInstrumentCatalogue() implementation notes:
- V1: reads from /constants/instrumentCatalogue.ts directly
- getSuggestions(bucket, riskProfile, geography) filters by:
    role === 'suggest'
    residence_geographies includes geography
    risk tier appropriate for profile
    NOT track_only (enforced here as safety net)
    Ordered by kasheScore descending
- V2: replace import with Supabase call — zero component changes
  This boundary is exactly why the hook exists.

**Verification:** `npx tsc --noEmit` — zero new errors.
**Commit:** `[DL-06] hooks — useSpend, usePortfolio, useInsights,
           useHousehold, useInstrumentCatalogue`

---

### DL-07: AI Insight Service

**What it builds:**
The engine that generates smart commentary — insight cards
and monthly reviews. Calls Claude API with aggregated data
(never raw transactions). Enforces budget cap. Caches results.

**What could go wrong:**
- Sending raw transaction data to Claude = privacy violation
- Not checking budget before calling = runaway costs (DEC-03)
- Not caching = hammering the API on every app open
- Not handling API failures gracefully = broken insight strip

**File:** /services/aiInsightService.ts

**Privacy rules — non-negotiable:**
```typescript
// WHAT IS SENT TO CLAUDE (aggregated only):
interface SpendSummaryForAI {
  totalSpendRange: 'under_2k' | '2k_5k' | 'over_5k'  // range not exact
  byCategory: Record<SpendCategory, number>            // category totals OK
  comparisonVsLastMonth: number                        // percentage only
  anomalies: string[]                                  // "eating_out 34% above avg"
  monthYear: string
}

interface PortfolioSummaryForAI {
  allocationByBucket: Record<string, number>           // percentages only
  totalPositionRange: 'under_100k' | '100k_500k' | 'over_500k'
  riskProfile: RiskProfileType
  underfundedBuckets: string[]
  savingsRate: number
}
// NEVER: raw amounts, merchant names, transaction descriptions,
//        account numbers, dates of individual transactions
```

**Budget cap (DEC-03):**
```typescript
const FREE_MONTHLY_LIMIT  = 10_000   // input tokens
const PAID_MONTHLY_LIMIT  = 100_000

function isWithinBudget(aiUsage: AIUsageRecord): boolean {
  const limit = aiUsage.tier === 'paid'
    ? PAID_MONTHLY_LIMIT
    : FREE_MONTHLY_LIMIT
  return aiUsage.inputTokensThisMonth < limit * 0.90
}
// When exceeded: return { budgetExceeded: true }
// Existing cached insights stay visible
// No hard paywall — soft banner only
```

**Insight generation rules:**
- One call per app open maximum
- Minimum 1 hour between calls for same insight type
- Generate only highest-priority stale insight
  (MARKET_EVENT → PORTFOLIO_HEALTH → INVESTMENT_OPPORTUNITY)
- FIRE_TRAJECTORY: skip entirely in V1
- Check lastInsightCheck before any call

**Insight priority order:**
1. MARKET_EVENT_ALERT — 24h cache, web search enabled
2. PORTFOLIO_HEALTH — expires on holdings change
3. INVESTMENT_OPPORTUNITY — fully templated, zero API cost
   Template: "{amount} uninvested this month"
   Trigger: savingsRate >20% AND investment_transfer < target * 0.8
   Action: VIEW_SUGGESTIONS → opens InstrumentDiscoverySection

**Model + limits:**
  model: 'claude-haiku-4-5-20251001'
  max_tokens: 500 (insights), 800 (monthly review)
  API key: storageService.get(STORAGE_KEYS.AI_API_KEY)
  Cache duration: 24h (insights), full calendar month (review)

**Monthly review trigger:**
  First app open of new calendar month
  Minimum 3 months spend + portfolio data
  Context: percentages only, no absolute values
  Regeneration: never mid-month (DEC-07 equivalent for reviews)

**Merchant enrichment (Clearbit → Claude fallback):**
  Clearbit call: merchant name only, zero user context
  Claude fallback: same privacy rules as categoriser
  Only for Layer 1 misses — never for matched transactions
  Opt-in: check Settings enrichment flag before calling
  Batch cap: enforced by spendStore retry queue

**Verification:** `npx tsc --noEmit` — zero new errors.
**Commit:** `[DL-07] aiInsightService — budget cap, privacy, caching`

---

### DL-08: Analytics Service

**What it builds:**
PostHog instrumentation for four learning loops.
Built disabled — ANALYTICS_ENABLED = false.
Anand reviews exact event list before enabling.
Enabling is one line change. No rebuild needed.

**File:** /services/analyticsService.ts

```typescript
// FLIP THIS TO true AFTER ANAND REVIEWS THE EVENT LIST BELOW
const ANALYTICS_ENABLED = false
```

**The exact events — Anand reviews before enabling:**

```typescript
// LOOP 1 — Catalogue freshness (editorial signal)
'instrument_tapped'  {
  bucket: string
  risk_tier: string
  geography: string
}
'instrument_added'   {
  bucket: string
  risk_tier: string
}
'instrument_skipped' {
  bucket: string
  position: number
}

// LOOP 2 — Spend accuracy (improves keyword map)
'category_correction' {
  from_category: SpendCategory
  to_category: SpendCategory
  merchant_type: 'known' | 'unknown'
  correction_count: number
}

// LOOP 3 — AI insight quality (improves prompts)
'insight_viewed'     { insight_type: InsightType }
'insight_actioned'   { insight_type: InsightType }
'insight_dismissed'  {
  insight_type: InsightType
  time_visible_ms: number
}

// LOOP 4 — Monthly review quality
'monthly_review_opened'      { month: string }
'monthly_review_section_read' {
  section: string
  month: string
}

// GENERAL
'csv_uploaded'     {
  institution: SupportedInstitution
  count: number
  parse_confidence: number
}
'screen_viewed'    { screen: string }
'risk_profile_set' { profile: RiskProfileType }
```

**Privacy rules:**
- Anonymous distinct_id: UUID generated on first launch
  Stored via storageService. Never tied to email or Google account.
- Zero PII in any event
- No amounts in any event
- No merchant names in any event
- Category strings and interaction types only

**Install:**
```
npm install posthog-react-native --legacy-peer-deps
```

**Verification:** `npx tsc --noEmit` — zero new errors.
Confirm: `grep -n "ANALYTICS_ENABLED" services/analyticsService.ts`
Must show: `const ANALYTICS_ENABLED = false`

**Commit:** `[DL-08] analyticsService — PostHog disabled, pending review`

---

## END-OF-SESSION VERIFICATION

Run all five before pushing Session 12 commits:

```bash
# 1. TypeScript — must be zero new errors (9 pre-existing OK)
npx tsc --noEmit

# 2. No direct AsyncStorage imports anywhere
grep -r "AsyncStorage" --include="*.ts" --include="*.tsx" .
# Must return zero results (or node_modules only)

# 3. No raw SecureStore calls outside storageService
grep -r "SecureStore" --include="*.ts" --include="*.tsx" .
# Must only appear in services/storageService.ts

# 4. Confirm ANALYTICS_ENABLED is false
grep -n "ANALYTICS_ENABLED" services/analyticsService.ts
# Must show: const ANALYTICS_ENABLED = false

# 5. Confirm file tree is complete
ls services/ store/ hooks/
# All expected files present
```

All five must pass before pushing.

---

## WHAT SESSION 13 DOES WITH THIS

Session 13 wires the engine to the dashboard and runs
the first real data stress test.

**Session 13 wiring order:**
1. useSpend() → spend.tsx (replace MOCK_TRANSACTIONS)
2. usePortfolio() → portfolio.tsx (replace MOCK_HOLDINGS)
3. CSV upload flow → AppHeader [+] button → parseCSV
4. useInsights() → MonthlyReviewCard
5. useInstrumentCatalogue() → InstrumentDiscoverySection
6. householdStore → RiskProfileCard save
7. DataSource confirmation screen
8. Post-upload toast (4 confirmations)
9. Probable duplicate confirmation UI

**Session 13 real data stress test:**
- Anand's ABN Amro personal account CSV
- Anand's ABN Amro joint account CSV (with partner)
- Anand's HDFC Bank personal account CSV
- Anand's HDFC Bank joint account CSV (with partner)
- Anand's HDFC Demat / Securities export
- Anand's SBI account CSV
- Anand's DeGiro portfolio export
- Anand's Aditya Birla Capital (MF) export
- Partner's accounts

**What to watch for in Session 13:**
- Joint account deduplication (same transaction in both exports)
- Compound key vs fuzzy match for Indian banks
- SBI format inconsistency (YONO vs NetBanking)
- HDFC demat vs HDFC bank format difference
- Aditya Birla MF export format (NAV + units)
- ABN Amro joint account Rekening column format
- Ownership attribution flow for joint DataSources

**Export all files NOW (before Session 13):**
Do not wait until the session starts. Export from:
  ABN Amro: Internet Banking → Download transactions → CSV
  HDFC: NetBanking → My Accounts → Download Statement → CSV
  SBI: OnlineSBI → Account Statement → Download
  DeGiro: Portfolio → Account → Export → CSV
  Aditya Birla: MF Central or CAMS statement export

---

## KNOWN BUG REGISTRY (carried forward)

### 🔴 Fix before beta
1. Hero number wrapping in PortfolioTotalsCard — Session 16
2. GROWTH total may be inflated — verify in Session 13
3. Dutch brand names in Spend mock data — replaced in Session 13
4. "For information only. Not financial advice." missing
5. REQUEST_SUPPORT_URL needs real Google Form URL
6. Clearbit opt-in toggle missing from Settings
7. SpendTransaction vs Transaction alias — Session 16 cleanup
8. Compliance footer on Invest tab — Session 16

### 🟡 Polish — Session 16
9.  Chart spike at end of 1M view
10. KasheAsterisk k-stroke prominence
11. Vertical MacronRule in TotalsCard
12. TextInput monthly target not currency-formatted
13. Category detail screen gap
14. HomeHeader + SpendScreenHeader showGreeting prop mismatch
15. _layout.tsx @expo/vector-icons types missing
16. [holdingId].tsx MacronRule style array mismatch
17. BucketReassignSheet assetType vs assetSubtype typo

### 🟢 Deferred by design
18. Dark mode device verification — Session 17
19. react-native-reanimated — Session 17
20. Settings route wiring — Session 16
21. FIRE planner screen — V2
22. AUDIT_STORE key in STORAGE_KEYS — Session 16
23. Price chart mock data — Session 13 wiring
24. V1 → V2 data migration strategy
25. PARTNER profile type — V2

### 🔵 Strategic decisions needed pre-beta
26. AI API key UX post-beta (BYOK locked for beta)
27. GDPR data export flow — Session 16
28. Clearbit enrichment disclosure in privacy policy
29. Merchant enrichment opt-in UI in Settings

---

## QUICK REFERENCE

Repo: github.com/anandsankar-lab/kashe
Local: ~/Documents/kashe
Preview: npx expo start → w → localhost:8081
TypeScript check: npx tsc --noEmit
Node: v25.6.1
npm flag: --legacy-peer-deps always

Key reference files for remaining Session 12 tickets:
  data-architecture.md    — hook return types (match exactly)
  CLAUDE-financial.md     — AI prompt rules, insight specs
  CLAUDE-identity.md      — security pipeline
  engineering-rules.md    — storage rules
  types/spend.ts          — SpendTransaction, SpendCategory
  types/portfolio.ts      — PortfolioHolding
  types/riskProfile.ts    — RiskProfileType
  store/spendStore.ts     — derivedSpend cache shape
  store/portfolioStore.ts — derivedPortfolio cache shape
  store/insightsStore.ts  — AIUsageRecord, Insight types
