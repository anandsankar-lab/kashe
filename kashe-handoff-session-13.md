# Kāshe — Session 13 Handoff Document
*Session 12 → Session 13*
*Date: TBD (after Session 12 fully committed and verified)*
*This session wires the data engine to the UI and runs the
first real data stress test with Anand's actual bank exports.*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + fintech domain expert helping
Anand build Kāshe. Anand is a PM with strong product instincts and is a
coding beginner. One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md (full build state + every locked decision)
2. This file (every section, every decision)
3. engineering-rules.md
4. data-architecture.md
5. CLAUDE-financial.md

---

## HOW WE WORK

1. Claude writes prompt in planning chat
2. Anand pastes into Claude Code terminal
3. Screenshot shared back from localhost:8081
4. Claude reviews — flags ALL issues before git commands
5. Claude gives exact git commands
6. Anand runs manually — never through Claude Code
7. Commit confirmed → next ticket

---

## PREREQUISITE: BEFORE SESSION 13 STARTS

**Export all bank files NOW. Do not wait.**

| Account | Where to export | Format |
|---|---|---|
| ABN Amro (personal) | Internet Banking → Download transactions → CSV | Semicolon-delimited |
| ABN Amro (joint) | Same, different account | Semicolon-delimited |
| HDFC Bank (personal) | NetBanking → My Accounts → Download Statement → CSV | Comma-delimited |
| HDFC Bank (joint) | Same, joint account | Comma-delimited |
| HDFC Demat / Securities | HDFC Sky or HDFC Securities → Portfolio → Export | CSV |
| SBI | OnlineSBI → Account Statement → CSV | Comma-delimited |
| DeGiro | Portfolio → Account → Export → CSV | Comma-delimited |
| Aditya Birla Capital | MF Central or CAMS → Statement | CSV or XLS |

Also have partner's account exports ready.

**Why this matters:** Session 13's entire value is real data.
If exports aren't ready, we spend the session waiting.

---

## WHAT SESSION 12 BUILT

The complete data engine — DL-01 through DL-09:

**DL-01 through DL-08:** storageService, secureStorageAdapter,
spendCategoriser, merchantKeywords, csvParser, all 5 stores,
all 5 hooks, full AI insight engine (5 files), analyticsService.

**DL-09 (new — critical):** UserFinancialProfile architecture.
- /types/userProfile.ts — the intelligence spine interface
- /services/userProfileService.ts — builds profile from all stores
- householdStore updated — financialProfile field
- analyticsService updated — updateUserProperties(profile)
- insightTriggers updated — T11 + T12 added
- insightSources updated — takes UserFinancialProfile directly

At the start of Session 13: the engine exists.
The UserFinancialProfile is built but not yet wired to:
  - holdingsContextBuilder (reads from raw holdings, not profile)
  - aiInsightService (doesn't call updateUserProfile yet)
  - any store action (updateUserProfile not called on data changes)

At the end of Session 13: Anand's real transactions appear
in the Spend tab. Real holdings in Portfolio. UserFinancialProfile
updates automatically on every data change. The app stops
being a prototype.

---

## SESSION 13 TICKETS

Build in this exact order. Wire one thing at a time.
Screenshot after each. Commit before the next.

---

### W-01: Wire useSpend to spend.tsx

Replace MOCK_TRANSACTIONS in /app/(tabs)/spend.tsx
with live data from useSpend().

Implementation:
- Import useSpend from '../hooks/useSpend'
- Remove MOCK_TRANSACTIONS import
- Replace all mock data references with hook values
- totalSpend, spendByCategory, comparisonVsLastMonth,
  selectedMonth, setSelectedMonth all from hook
- Empty state: hasData = transactions.length > 0

Screenshot check:
- Empty state renders correctly (ghost + floating pill)
- No console errors, no TypeScript errors

Commit: `[W-01] spend.tsx — wired to useSpend hook`

---

### W-02: Wire usePortfolio to portfolio.tsx

Replace MOCK_HOLDINGS in /app/(tabs)/portfolio.tsx
with live data from usePortfolio().

Implementation:
- Import usePortfolio from '../hooks/usePortfolio'
- Remove MOCK_HOLDINGS import
- holdings, liveTotal, lockedTotal, financialPosition,
  allocationByBucket all from hook
- Empty state: hasData = holdings.length > 0

Screenshot check:
- Empty state renders correctly

Commit: `[W-02] portfolio.tsx — wired to usePortfolio hook`

---

### W-03: CSV Upload Flow

The [+] button in AppHeader triggers a document picker.
User selects a CSV. parseCSV runs. Transactions land in
spendStore. DataSource confirmation screen shown.
Post-upload toast shown.

Install:
  npm install expo-document-picker --legacy-peer-deps

Components to build:

/components/shared/CSVUploadSheet.tsx
  Bottom sheet triggered by AppHeader [+] onAdd
  Options: "Upload bank statement", "Upload portfolio CSV"
  Opens expo-document-picker (CSV only)

/components/shared/DataSourceConfirmSheet.tsx
  Shown after successful parse
  Displays: detected institution, account label (editable)
  Toggle: "Is this a joint account?"
  Button: "Confirm import" → addTransactions + logImport
           + updateUserProfile() call after addTransactions

/components/shared/UploadToast.tsx
  4-line confirmation toast:
  "✓ X transactions imported"
  "✓ Account numbers masked"
  "✓ Raw file discarded"
  "✓ Data stored securely on your device"

Upload flow:
1. Tap [+] → CSVUploadSheet opens
2. Tap "Upload bank statement"
3. expo-document-picker opens (CSV only)
4. File content read into MEMORY ONLY
5. parseCSV() called
6. If ParseError: show error + REQUEST_SUPPORT_URL
7. If ParseSuccess + probableDuplicates: show W-04 sheet first
8. Show DataSourceConfirmSheet
9. User confirms → spendStore.addTransactions()
   THEN: userProfileService.buildUserFinancialProfile()
         → householdStore.updateFinancialProfile(profile)
         → analyticsService.updateUserProperties(profile)
   auditStore.logImport(auditData)
10. UploadToast shown
11. CSVUploadSheet closes
12. Spend screen updates reactively

Security: CSV content never written to disk.
Raw content discarded after parseCSV() returns.

Commit: `[W-03] CSV upload flow — picker, confirm, toast`

---

### W-04: Probable Duplicate Confirmation UI

/components/shared/ProbableDuplicateSheet.tsx

Shows for each probable duplicate:
  Incoming: date, amount, merchant (sanitised)
  Existing: same fields
  Similarity score (as % match, not raw Dice)

User actions per pair:
  "Skip (duplicate)" → do not import
  "Import anyway" → add to unique[]

"Confirm all" button → proceeds with decisions.

Only appears for Indian bank imports (fuzzy match).
ABN Amro dedup is exact — never surfaces this sheet.

Commit: `[W-04] ProbableDuplicateSheet — fuzzy dedup UI`

---

### W-05: Wire MonthlyReviewCard to useInsights

Replace mock review state in MonthlyReviewCard with
live reviewState from useInsights().

Implementation:
- Import useInsights from '../hooks/useInsights'
- reviewState drives MonthlyReviewCard state:
    'unavailable'   → STATE 4 (no data)
    'insufficient'  → STATE 3 (< 3 months)
    'ready_unread'  → STATE 1 (accent border, "Read now →")
    'ready_read'    → STATE 2 (viewed state)
- dismissInsight from useInsights for insight strip

Commit: `[W-05] MonthlyReviewCard — wired to useInsights`

---

### W-06: Wire useInstrumentCatalogue to InstrumentDiscoverySection

Replace direct instrumentCatalogue import in
InstrumentDiscoverySection with useInstrumentCatalogue().

Small change — hook reads from same static file in V1.
Value: V2 just changes hook internals, zero component changes.

Commit: `[W-06] InstrumentDiscoverySection — via hook`

---

### W-07: Wire householdStore to RiskProfileCard

RiskProfileCard save persists risk profile to householdStore.
Currently: local state, lost on restart.
After: persists across app restarts.

Implementation:
- Import householdStore
- On confirm: setRiskProfile()
  If changed from 'balanced' default: also log
    trackMilestoneReached({ milestone: 'risk_profile_actively_set' })
- On mount: read riskProfile from store for initial state

Commit: `[W-07] RiskProfileCard — persists to householdStore`

---

### W-08: Real Data Stress Test

**Not a code ticket. A verification session.**

Upload every real bank export, one at a time.
For each upload, check:
1. Parser detects institution correctly?
2. Tier 1 confidence passes (date + amount + debit/credit)?
3. Transaction count?
4. Layer 1 categorisation rate?
5. Layer 2 queue depth?
6. Spend screen updates correctly?
7. Any probable duplicates flagged?
8. UserFinancialProfile updated correctly after import?
   - Check: financialVehicles[], portfolioTier, dataMonthsSpend

Upload order:
1. ABN Amro personal
2. ABN Amro joint → check joint deduplication
3. HDFC personal
4. HDFC joint → check fuzzy dedup for Indian format variations
5. SBI → check YONO vs NetBanking format
6. DeGiro → check portfolioStore updates
7. Aditya Birla (MF) → check NAV + units → currentValue
8. HDFC Demat → check holdings imported to portfolioStore

Capture for each:
- ParseConfidence.overallScore
- Any TIER1_FIELDS_MISSING errors → spec new parsers
- Any unexpected duplicate behaviour
- UserFinancialProfile before/after (financialVehicles diff)

Stress test output becomes spec for Session 13 parser improvements.

No commit for this ticket (observation only).

---

### W-09: Wire UserFinancialProfile to holdingsContextBuilder

**This completes the AI intelligence wiring.**

Currently: holdingsContextBuilder derives geographyExposure,
currencyExposure, portfolioTier, instrumentTypesHeld from raw
holdings on every call.

After: reads from householdStore.financialProfile instead.
Only derives HoldingIdentifier[] from raw holdings (ISIN/ticker
lookup can't be precomputed).

Implementation:
- Update buildHoldingsContext() to accept UserFinancialProfile
  as parameter alongside raw holdings array
- Read portfolioTier, financialVehicles, geographyExposure,
  currencyExposure directly from profile
- Remove redundant derivation code
- Pass profile to getActiveSeedSources() (already updated in DL-09)

Also wire: updateUserProfile() call after every holdings change
  addHolding() → userProfileService.buildUserFinancialProfile()
  updateHolding() → same
  setBucketOverride() → same
  setProtection() → same

Commit: `[W-09] holdingsContextBuilder — reads from UserFinancialProfile`

---

### W-10: Wire UserFinancialProfile to insightTriggers

Currently: TriggerInput built ad-hoc with individual fields
passed manually from wherever it's called.

After: evaluateAllTriggers receives UserFinancialProfile and
builds TriggerInput from it internally.

Implementation:
- Add helper: buildTriggerInputFromProfile(profile, fxParams)
  Maps profile fields to TriggerInput exactly
  fxParams: { hasInrWeakened: boolean; indiaPct: number }
  (FX check still done externally — checked against live FX data)
- evaluateAllTriggers signature simplified:
  evaluateAllTriggers(profile, fxParams) instead of
  evaluateAllTriggers(input, fxParams)

This means T11 and T12 now receive cashLikeVehiclePct,
illiquidSpeculativePct, financialVehicles, portfolioTier
automatically from the profile — no manual passing.

Commit: `[W-10] insightTriggers — evaluates from UserFinancialProfile`

---

## WHAT TO WATCH FOR — SESSION 13

### UserFinancialProfile update chain
Every time a real CSV lands, the update chain must fire:
  CSV parsed → addTransactions() → userProfileService builds profile
  → householdStore.updateFinancialProfile() → analyticsService.updateUserProperties()

Verify after W-03: check householdStore.financialProfile is populated
with real data values (financialVehicles not empty, portfolioTier set,
dataMonthsSpend > 0).

### Joint account handling
Both Anand and partner have joint accounts at ABN Amro and HDFC.

Expected behaviour:
- First upload (Anand's): all transactions import as ownership: 'joint'
- Second upload (partner's): duplicates caught by compound key
- duplicatesSkipped count shown in toast
- Household view: joint transactions appear once

If deduplication fails: compound key needs debugging.

### SBI format risk
SBI exports differ between YONO, OnlineSBI, and branch statements.
If SBI fails Tier 1: note exact column headers, add SBI hint.

### HDFC demat vs HDFC bank
Completely different CSV formats — smart detector should handle both.
If not: separate institution hint needed for HDFC_SECURITIES.

### Aditya Birla MF format
Typically: scheme name, folio number, units, NAV, current value.
Should route to portfolioStore. Verify holdings appear in Portfolio tab.

---

## OWNERSHIP ATTRIBUTION FLOW

When user confirms DataSource as joint:
  DataSource.accountType = 'joint'
  All transactions: ownership = 'joint'
  splitWithProfileId = partner profileId (if exists)
  splitRatio = 0.5 (default)

Household view: all transactions once
Individual view: personal + joint for that profile only

---

## LOCKED DECISIONS CARRIED INTO SESSION 13

- Atomic imports: roll back on any failure
- Security pipeline: runs inside parseCSV — trust it
- Derived cache: hooks check lastCalculatedAt on mount
- Layer 2 queue: addTransactions queues misses automatically
- Joint ownership: DataSourceConfirmSheet always asks
- auditStore: logImport called after every successful import
- ANALYTICS_ENABLED = false: never enable without review
- UserFinancialProfile: must update on every data change event
- holdingsContextBuilder: must read from profile after W-09
- insightTriggers: must evaluate from profile after W-10

---

## QUICK REFERENCE

Repo: github.com/anandsandk-lab/kashe
Local: ~/Documents/kashe
Preview: npx expo start → w → localhost:8081
TypeScript check: npx tsc --noEmit
Node: v25.6.1
npm flag: --legacy-peer-deps always

Files most relevant to Session 13:
  services/csvParser.ts               — parseCSV, ParseResult types
  services/spendCategoriser.ts        — categorise, Layer 1/2/3
  services/userProfileService.ts      — buildUserFinancialProfile()
  services/holdingsContextBuilder.ts  — to be updated W-09
  store/spendStore.ts                 — addTransactions, retryQueue
  store/portfolioStore.ts             — addHolding
  store/householdStore.ts             — financialProfile, updateFinancialProfile
  store/auditStore.ts                 — logImport
  hooks/useSpend.ts                   — W-01 target
  hooks/usePortfolio.ts               — W-02 target
  hooks/useInsights.ts                — W-05 target
  types/userProfile.ts                — UserFinancialProfile interface
  constants/insightTriggers.ts        — W-10 target
  app/(tabs)/spend.tsx                — W-01 target
  app/(tabs)/portfolio.tsx            — W-02 target
  components/shared/AppHeader.tsx     — [+] button entry point

---

## KNOWN BUG REGISTRY (carried forward from Session 12)

### 🔴 Fix before beta
1.  Hero number wrapping in PortfolioTotalsCard
2.  GROWTH total may be inflated
3.  Dutch brand names in Spend mock data
4.  "For information only. Not financial advice." missing
5.  REQUEST_SUPPORT_URL needs real Google Form URL
6.  Clearbit opt-in toggle missing from Settings
7.  SpendTransaction vs Transaction alias — Session 16
8.  Compliance footer on Invest tab

### 🟡 Polish — Session 16
9–19. (see CLAUDE-state.md full registry)

### 🔵 Strategic pre-beta
31. AI API key UX post-beta
32. GDPR data export flow
33. Clearbit privacy policy disclosure
34. Merchant enrichment opt-in UI
35. Per-tester Anthropic API key spend limits
36. PostHog 4 dashboards manual setup
37. Unit + integration tests — Session 16
