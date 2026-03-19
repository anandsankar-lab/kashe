# Kāshe — Session 13 Handoff Document
*Session 12 → Session 13*
*Date: TBD (after Session 12 DL-06/07/08 complete)*
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

The complete data engine:
- storageService + secureStorageAdapter (encrypted storage)
- spendCategoriser (three-layer pipeline)
- merchantKeywords (NL/IN/EU/GLOBAL)
- csvParser (smart detection, atomic, 24 institutions)
- spendStore, portfolioStore, insightsStore,
  householdStore, auditStore
- useSpend, usePortfolio, useInsights, useHousehold,
  useInstrumentCatalogue (hooks)
- aiInsightService (budget cap, privacy, caching)
- analyticsService (PostHog, disabled)

At the start of Session 13: the engine exists.
Nothing in the UI uses it yet. All screens still
read from mockData.ts.

At the end of Session 13: Anand's real transactions
appear in the Spend tab. Real holdings in Portfolio.
The app stops being a prototype.

---

## SESSION 13 TICKETS

Build in this exact order. Wire one screen at a time.
Screenshot after each. Commit before the next.

---

### W-01: Wire useSpend to spend.tsx

**What it builds:**
Replace MOCK_TRANSACTIONS in /app/(tabs)/spend.tsx
with live data from useSpend().

**What this means:**
After this ticket, if there are no uploaded transactions,
the empty state shows. If there are transactions (from
mock or real upload), the real spend screen shows.

The spend screen must work correctly in both states.

**Implementation:**
- Import useSpend from '../hooks/useSpend'
- Remove MOCK_TRANSACTIONS import
- Replace all mock data references with hook values
- totalSpend, spendByCategory, comparisonVsLastMonth,
  selectedMonth, setSelectedMonth all from hook
- Empty state: hasData = transactions.length > 0

**Screenshot check:**
- Empty state renders correctly (ghost + floating pill)
- No console errors
- No TypeScript errors

**Commit:** `[W-01] spend.tsx — wired to useSpend hook`

---

### W-02: Wire usePortfolio to portfolio.tsx

**What it builds:**
Replace MOCK_HOLDINGS in /app/(tabs)/portfolio.tsx
with live data from usePortfolio().

**Implementation:**
- Import usePortfolio from '../hooks/usePortfolio'
- Remove MOCK_HOLDINGS import
- Replace all mock data with hook values
- holdings, liveTotal, lockedTotal, financialPosition,
  allocationByBucket all from hook
- Empty state: hasData = assets.length > 0

**Screenshot check:**
- Empty state renders correctly
- No console errors

**Commit:** `[W-02] portfolio.tsx — wired to usePortfolio hook`

---

### W-03: CSV Upload Flow

**What it builds:**
The [+] button in AppHeader triggers a document picker.
User selects a CSV. parseCSV runs. Transactions land in
spendStore. DataSource confirmation screen shown.
Post-upload toast shown.

This is the most complex ticket in Session 13.

**Components needed (build in this ticket):**
- /components/shared/CSVUploadSheet.tsx
  Bottom sheet triggered by AppHeader [+] onAdd
  Shows: "Upload bank statement" option
  Opens: expo-document-picker for CSV files

- /components/shared/DataSourceConfirmSheet.tsx
  Shown after successful parse
  Displays: detected institution, account label
  Field: editable account label (default from parser)
  Toggle: "Is this a joint account?"
  Button: "Confirm import" → addTransactions + logImport

- /components/shared/UploadToast.tsx
  4-line confirmation toast after successful import:
  "✓ X transactions imported"
  "✓ Account numbers masked"
  "✓ Raw file discarded"
  "✓ Data stored securely on your device"

**Install:**
  npm install expo-document-picker --legacy-peer-deps

**Upload flow:**
1. User taps [+] → CSVUploadSheet opens
2. User taps "Upload bank statement"
3. expo-document-picker opens (CSV only)
4. User selects file
5. File content read as string (never saved to disk)
6. parseCSV() called with content + dataSourceId + profileId
7. If ParseError: show error message + REQUEST_SUPPORT_URL
8. If ParseSuccess + probableDuplicates.length > 0:
   Show ProbableDuplicateSheet first (W-04)
9. If ParseSuccess: show DataSourceConfirmSheet
10. User confirms → spendStore.addTransactions()
    auditStore.logImport() with auditData
11. UploadToast shown
12. CSVUploadSheet closes
13. Spend screen updates reactively (Zustand reactivity)

**Security rules:**
- CSV content read into memory only — never written to disk
- Pass to parseCSV() → security pipeline runs automatically
- Raw content discarded after parse

**Commit:** `[W-03] CSV upload flow — picker, confirm, toast`

---

### W-04: Probable Duplicate Confirmation UI

**What it builds:**
When the CSV parser finds probable duplicates (fuzzy
Dice coefficient match for Indian banks), show user
a confirmation sheet before skipping them.

**Component:** /components/shared/ProbableDuplicateSheet.tsx

Shows for each probable duplicate:
  Incoming transaction: date, amount, merchant (sanitised)
  Existing transaction: same fields
  Similarity score (shown as % match, not raw number)

User actions per pair:
  "Skip (duplicate)" → do not import
  "Import anyway" → add to unique[]

"Confirm all" button → proceeds with user decisions.

This only appears for Indian bank imports where
fuzzy matching finds candidates. ABN Amro dedup
is exact and never surfaces this sheet.

**Commit:** `[W-04] ProbableDuplicateSheet — fuzzy dedup UI`

---

### W-05: Wire MonthlyReviewCard to useInsights

**What it builds:**
Replace mock review state in MonthlyReviewCard with
live reviewState from useInsights().

**Implementation:**
- Import useInsights from '../hooks/useInsights'
- reviewState drives which MonthlyReviewCard state shows:
    'unavailable'   → STATE 4 (no data)
    'insufficient'  → STATE 3 (< 3 months)
    'ready_unread'  → STATE 1 (accent border, "Read now →")
    'ready_read'    → STATE 2 (viewed state)
- dismissInsight from useInsights for insight strip

**Commit:** `[W-05] MonthlyReviewCard — wired to useInsights`

---

### W-06: Wire useInstrumentCatalogue to InstrumentDiscoverySection

**What it builds:**
Replace direct instrumentCatalogue import in
InstrumentDiscoverySection with useInstrumentCatalogue().

This is a small change — the hook reads from the same
static file in V1. The value is architectural: V2 just
changes the hook internals, zero component changes.

**Commit:** `[W-06] InstrumentDiscoverySection — via hook`

---

### W-07: Wire householdStore to RiskProfileCard

**What it builds:**
RiskProfileCard save button persists risk profile
selection to householdStore (and therefore to
encrypted storage via secureStorageAdapter).

Currently: risk profile is local state, lost on restart.
After this: risk profile persists across app restarts.

**Implementation:**
- Import householdStore
- On profile selection confirm: setRiskProfile()
- On mount: read riskProfile from store for initial state

**Commit:** `[W-07] RiskProfileCard — persists to householdStore`

---

### W-08: Real Data Stress Test

**This is not a code ticket. This is a verification session.**

Anand uploads every real bank export, one at a time.
For each upload:
  1. Does the parser detect the institution correctly?
  2. Does Tier 1 confidence pass (date + amount + debit/credit)?
  3. How many transactions parsed?
  4. How many categorised by Layer 1 keywords?
  5. How many queued for Layer 2?
  6. Does the Spend screen update correctly?
  7. Any probable duplicates flagged?

**Upload order:**
1. ABN Amro personal
2. ABN Amro joint
   → Check: joint transactions deduplicated correctly?
3. HDFC personal
4. HDFC joint
   → Check: fuzzy dedup catches Indian format variations?
5. SBI
   → Check: YONO vs NetBanking format handled?
6. DeGiro
   → Check: Portfolio screen updates?
7. Aditya Birla (MF)
   → Check: NAV + units → currentValue calculation?
8. HDFC Demat
   → Check: Holdings imported to portfolioStore?

**What to capture:**
- Terminal output from each parseCSV call
- ParseConfidence.overallScore for each institution
- Any TIER1_FIELDS_MISSING errors → spec new parsers
- Any unexpected duplicate behaviour

**This stress test output becomes the spec for
Session 13's follow-up parser improvements.**

---

## WHAT TO WATCH FOR — SESSION 13

### Joint account handling
Both Anand and partner have joint accounts at ABN Amro
and HDFC. The same transactions will appear in both exports.

Expected behaviour:
- First upload (Anand's): all transactions import as ownership: 'joint'
- Second upload (partner's): duplicates caught by compound key
- duplicatesSkipped count shown in toast
- Household view: joint transactions appear once
- Individual view: show personal + joint for that profile

If deduplication fails and transactions appear twice:
  → compound key needs debugging
  → check normalisation of Dutch vs English description variants

### SBI format risk
SBI exports differ between:
  - YONO app export (newer format)
  - OnlineSBI NetBanking (older format)
  - Branch-generated statements (sometimes PDF converted to CSV)

If SBI export fails Tier 1:
  → Note exact column headers from Anand's file
  → Add SBI hint to INSTITUTION_HINTS in csvParser
  → This is expected — one of the harder banks

### HDFC demat vs HDFC bank
These are completely different CSV formats:
  HDFC Bank: spend transactions (Withdrawal/Deposit columns)
  HDFC Securities: holdings (ISIN, quantity, current price)

The parser's smart detector should handle both.
If not: separate institution hint needed for HDFC_SECURITIES.

### Aditya Birla MF format
Mutual fund exports typically contain:
  Scheme name, folio number, units, NAV, current value
The csvParser should detect this as a holdings export
(ADITYA_BIRLA institution hint) and route to portfolioStore.

---

## OWNERSHIP ATTRIBUTION FLOW

When user confirms DataSource as joint:
  DataSource.accountType = 'joint'
  All transactions from this DataSource:
    transaction.ownership = 'joint'
    transaction.splitWithProfileId = partner profileId
      (if partner profile exists in householdStore)
    transaction.splitRatio = 0.5 (default, user can change)

Household view (activeProfileId = 'household'):
  Show ALL transactions once
  Joint transactions shown with a subtle indicator

Individual view (activeProfileId = specific profile):
  Show personal transactions for that profile
  Show joint transactions for that profile
  Do NOT show partner's personal transactions

---

## LOCKED DECISIONS CARRIED INTO SESSION 13

All decisions from Session 12 apply. Key ones to keep
front of mind during wiring:

- Atomic imports: if anything fails mid-wire, roll back
- Security pipeline: already runs inside parseCSV — trust it
- Derived cache: hooks check lastCalculatedAt on mount
  First load of each screen may trigger recalculation
- Layer 2 queue: addTransactions queues misses automatically
  UI should show some "still categorising..." indicator
- Joint ownership: DataSourceConfirmSheet always asks
- auditStore: logImport called after every successful import
- ANALYTICS_ENABLED = false: never enable without review

---

## QUICK REFERENCE

Repo: github.com/anandsankar-lab/kashe
Local: ~/Documents/kashe
Preview: npx expo start → w → localhost:8081
TypeScript check: npx tsc --noEmit
Node: v25.6.1
npm flag: --legacy-peer-deps always

Files most relevant to Session 13:
  services/csvParser.ts         — parseCSV, ParseResult types
  services/spendCategoriser.ts  — categorise, Layer 1/2/3
  store/spendStore.ts           — addTransactions, retryQueue
  store/portfolioStore.ts       — addHolding
  store/auditStore.ts           — logImport
  hooks/useSpend.ts             — return type for spend.tsx
  hooks/usePortfolio.ts         — return type for portfolio.tsx
  hooks/useInsights.ts          — reviewState for MonthlyReviewCard
  app/(tabs)/spend.tsx          — W-01 target
  app/(tabs)/portfolio.tsx      — W-02 target
  components/shared/AppHeader.tsx — [+] button entry point
