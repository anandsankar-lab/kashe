# Kāshe — Session 14 Handoff Document
*Session 13 → Session 14*
*Date: TBD (after Session 13 fully committed and verified)*
*This session completes the remaining Session 13 wiring tickets
(W-04 through W-10), runs the real data stress test, then begins
onboarding if time permits.*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + fintech domain expert helping
Anand build Kāshe — a personal finance app for globally mobile
working professionals. Target user: any globally mobile professional
in IN, UK, EU, USA — NOT India-specific.

Anand is a PM with strong product instincts and is a coding beginner.
One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md
2. CLAUDE-filetree.md
3. This file
4. CLAUDE-decisions.md (especially section 4b — ingestion pipeline)
5. engineering-rules.md

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

## CRITICAL ARCHITECTURE CONTEXT

**The ingestion pipeline** (built Session 13) replaced the monolithic
csvParser.ts. It lives at /services/ingestion/ (10 files).
csvParser.ts is now a re-export shim — never import from it in new code.

**Single entry point:** ingestFile(IngestionInput) from /services/ingestion

**Four-tier import taxonomy (locked Session 13):**
  Tier 1: Route — 'spend' | 'portfolio' (auto-detected, user confirms)
  Tier 2: Account Type — savings_account | current_account | credit_card |
          joint_account | brokerage | mutual_fund_folio | retirement |
          fixed_deposit_account | other_investment (user always picks)
  Tier 3: Line Item — SpendCategory | AssetSubtype (parser assigns per row)
  Tier 4: Direction — debit/credit | buy/sell/dividend (auto-detected)

**Detection:** column header + sample value fingerprints only. Never filename.
35 institutions in INSTITUTION_REGISTRY. To add one: only edit that file.

**portfolioStore new actions (Session 13):**
  addHoldings(holdings[]) — batch, dedup by id
  addPendingHoldings(holdings[]) — FIFO cap 50
  resolveHolding(id, assetSubtype) — moves pending → holdings

**secureStorageAdapter:** web localStorage fallback now exists.
  Web preview → localStorage. Native → expo-secure-store. Transparent.

---

## SESSION 13 REMAINING TICKETS (complete these first)

### W-04: ProbableDuplicateSheet

/components/shared/ProbableDuplicateSheet.tsx

Shows for each probable duplicate pair:
  Incoming: date, amount, merchant (sanitised)
  Existing: same fields
  Similarity score shown as % match (not raw Dice coefficient)

User actions per pair:
  "Skip (duplicate)" → do not import
  "Import anyway" → add to unique[]

"Confirm all" button → proceeds with all decisions made.

Only appears for Indian bank imports (fuzzy Dice match).
ABN Amro dedup is exact — never surfaces this sheet.

Triggered from CSVUploadSheet when:
  parseResult.probableDuplicates.length > 0

Commit: [W-04] ProbableDuplicateSheet — fuzzy dedup UI

---

### W-05: Wire MonthlyReviewCard → useInsights

Replace mock review state in MonthlyReviewCard with live
reviewState from useInsights().

  'unavailable'   → STATE 4 (no data)
  'insufficient'  → STATE 3 (< 3 months)
  'ready_unread'  → STATE 1 (accent border, "Read now →")
  'ready_read'    → STATE 2 (viewed state)

dismissInsight from useInsights for insight strip.

Commit: [W-05] MonthlyReviewCard — wired to useInsights

---

### W-06: Wire useInstrumentCatalogue → InstrumentDiscoverySection

Replace direct instrumentCatalogue import in
InstrumentDiscoverySection with useInstrumentCatalogue().

Small change — hook reads from same static file in V1.
Value: V2 just changes hook internals, zero component changes.

Commit: [W-06] InstrumentDiscoverySection — via hook

---

### W-07: Wire householdStore → RiskProfileCard

RiskProfileCard save persists risk profile to householdStore.
Currently: local state, lost on restart.
After: persists across app restarts.

On confirm: setRiskProfile()
  If changed from 'balanced' default: also log
    trackMilestoneReached({ milestone: 'risk_profile_actively_set' })
On mount: read riskProfile from store for initial state.

Commit: [W-07] RiskProfileCard — persists to householdStore

---

### W-08: Real Data Stress Test

**Not a code ticket. A structured observation session.**

Upload every real bank/portfolio export one at a time.
Have files ready before starting:
  1. ABN Amro personal (TXT format)
  2. ABN Amro joint (TXT format) → check dedup
  3. HDFC personal (CSV or XLSX)
  4. HDFC joint → check fuzzy dedup
  5. SBI (XLSX or PDF-converted)
  6. DeGiro (CSV) → check portfolioStore routing
  7. Aditya Birla Capital (XLSX) → check holdings + pending queue
  8. HDFC Securities (XLSX) → check portfolio routing

For each upload check:
  1. Institution detected correctly?
  2. RouteConfidence level?
  3. Tier 2 pre-selection correct?
  4. Transaction/holding count?
  5. Any probable duplicates flagged?
  6. Portfolio path: holdings vs pendingHoldings split?
  7. After confirm: UserFinancialProfile updated?
     Check: financialVehicles[], portfolioTier, dataMonthsSpend

Key watch-outs:
  - ABN Amro: TXT format, tab-delimited. fileReader auto-detects delimiter.
  - HDFC Bank vs HDFC Securities: completely different formats.
    Both from "HDFC" — detection must be by column fingerprint, not name.
  - SBI: format varies (YONO vs NetBanking vs branch).
    If Tier 1 fails: note exact column headers and flag for parser fix.
  - DeGiro: should route to portfolio automatically (high confidence).
    Check: holdings appear in Portfolio tab after import.
  - Joint accounts: upload Anand's first, then partner's.
    Expect duplicates to be caught on second upload.

Output of W-08: list of any parser fixes needed.
These become follow-up tickets before W-09.

No commit for this ticket.

---

### W-09: Wire UserFinancialProfile → holdingsContextBuilder

Currently: holdingsContextBuilder re-derives geographyExposure,
currencyExposure, portfolioTier from raw holdings on every call.

After: reads from householdStore.financialProfile instead.
Only derives HoldingIdentifier[] from raw holdings (ISIN lookup
can't be precomputed).

Update buildHoldingsContext() to accept UserFinancialProfile
alongside raw holdings array. Read portfolioTier, financialVehicles,
geographyExposure, currencyExposure directly from profile.
Remove redundant derivation code.

Also wire: updateUserProfile() call after every holdings change:
  addHolding() → userProfileService.buildUserFinancialProfile()
  addHoldings() → same
  updateHolding() → same
  setBucketOverride() → same
  setProtection() → same

Commit: [W-09] holdingsContextBuilder — reads from UserFinancialProfile

---

### W-10: Wire UserFinancialProfile → insightTriggers

Currently: TriggerInput built ad-hoc with individual fields
passed manually from wherever it's called.

After: evaluateAllTriggers receives UserFinancialProfile and
builds TriggerInput from it internally.

Add helper: buildTriggerInputFromProfile(profile, fxParams)
  Maps profile fields to TriggerInput exactly.
  fxParams: { hasInrWeakened: boolean; indiaPct: number }
  (FX check still done externally against live FX data)

evaluateAllTriggers signature simplified:
  evaluateAllTriggers(profile, fxParams) instead of
  evaluateAllTriggers(input, fxParams)

This means T11 and T12 now receive cashLikeVehiclePct,
illiquidSpeculativePct, financialVehicles, portfolioTier
automatically from the profile.

Commit: [W-10] insightTriggers — evaluates from UserFinancialProfile

---

## WHAT TO WATCH FOR

**After W-08 stress test:**
If any institution fails Tier 1 (date + amount + debit/credit not detected):
  Note exact column headers from the file
  Add/update institution entry in INSTITUTION_REGISTRY
  Add column fingerprints that match that specific file
  Re-run the upload — should now detect correctly

If ABN Amro TXT fails:
  The TXT file is tab-delimited with specific Dutch column names
  Af Bij, Tegenrekening, Naam, Bedrag — these are the fingerprints
  Papa Parse auto-detects delimiter — if it doesn't work, set delimiter: '\t'

If joint account dedup fails:
  The compound key normalisation needs debugging
  Check Dutch vs English description variant handling in deduplicator.ts

**UserFinancialProfile after first real upload:**
Verify householdStore.financialProfile is populated:
  financialVehicles[] — should contain real asset subtypes
  portfolioTier — should reflect real position size
  dataMonthsSpend — should be > 0
  importFreshness — should be 'fresh'
If not: the update chain in CSVUploadSheet.handleConfirm() needs debugging.

---

## LOCKED DECISIONS CARRIED IN

- Atomic imports: roll back on any failure (file level)
- Portfolio pending queue: row-level failures go to queue, not rollback
- Security pipeline: runs inside ingestion pipeline (securityPipeline.ts)
- Derived cache: hooks check lastCalculatedAt on mount
- Layer 2 queue: addTransactions queues misses automatically
- Joint ownership: DataSourceConfirmSheet always asks
- auditStore: logImport called after every successful import
- ANALYTICS_ENABLED = false: never enable without PM review
- UserFinancialProfile: must update on every data change event
- holdingsContextBuilder: must read from profile after W-09
- insightTriggers: must evaluate from profile after W-10
- Four-tier taxonomy: locked Session 13 (see CLAUDE-decisions.md 4b)
- Institution detection: fingerprints only, never filename

---

## QUICK REFERENCE

```
Repo:     github.com/anandsandk-lab/kashe
Local:    ~/Documents/kashe
Preview:  npx expo start → w → localhost:8081
TS check: npx tsc --noEmit (9 pre-existing errors — zero new is the bar)
Node:     v25.6.1
npm:      --legacy-peer-deps always
PostHog:  eu.posthog.com, project 144615 (ANALYTICS_ENABLED = false)
```

Files most relevant to remaining Session 13 tickets:
  services/ingestion/index.ts           — ingestFile() entry point
  services/ingestion/institutionRegistry.ts — add/fix institutions here
  services/ingestion/deduplicator.ts    — fuzzy dedup for W-04
  services/holdingsContextBuilder.ts    — W-09 target
  constants/insightTriggers.ts          — W-10 target
  store/portfolioStore.ts               — addHoldings, pendingCategorizationQueue
  store/householdStore.ts               — financialProfile, updateFinancialProfile
  hooks/useInsights.ts                  — W-05 target
  components/invest/MonthlyReviewCard.tsx — W-05 target
  components/invest/InstrumentDiscoverySection.tsx — W-06 target
  components/invest/RiskProfileCard.tsx — W-07 target
  components/shared/CSVUploadSheet.tsx  — W-08 testing entry point
