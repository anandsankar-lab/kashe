# Kāshe — CLAUDE-state.md
*Current build state. ~30 lines. Rewrites every session.*
*Last updated: 27 April 2026 — Session 14 in progress.*

---

## CURRENT STATUS

**Session 14: IN PROGRESS**
W-04 complete and committed. Next ticket: W-05.

**Last commit:** [W-04] Deduplicator — compound key logic, ProbableDuplicate removed

---

## SESSION 14 REMAINING TICKETS

```
W-05  Wire MonthlyReviewCard → useInsights            ← NEXT
W-06  Wire useInstrumentCatalogue → InstrumentDiscoverySection
W-07  Wire householdStore → RiskProfileCard
W-08  Real Data Stress Test (observation only — no commit)
W-09  Wire UserFinancialProfile → holdingsContextBuilder
W-10  Wire UserFinancialProfile → insightTriggers
```

---

## WHAT CHANGED IN W-04

- Deduplication logic replaced: Dice coefficient → compound key
- Compound key: transactionId (Priority 1) + amount + date + normalisedDescription (Priority 2)
- normalisedDescription: lowercase → trim → collapse spaces → strip /–_.#, → collapse again
- ProbableDuplicate interface removed from types.ts entirely
- probableDuplicates[] removed from ParseSuccess
- probableDuplicatesFound removed from ImportAuditData
- ProbableDuplicateSheet never built — spec retired
- CSVUploadSheet: ProbableDuplicateSheet trigger removed
- csvParser.ts shim: ProbableDuplicate re-export removed
- Loose end: auditStore.ImportAuditEvent still has probableDuplicatesFound field
  (hardcoded to 0 in CSVUploadSheet) — clean up Session 16

---

## ACTIVE BLOCKERS

None. W-05 can begin immediately.

---

## REMAINING BUILD ORDER (sessions)

```
Session 14   Complete W-05 through W-10 + real data stress test
Session 15   Onboarding (10 screens + UniversalAddSheet)
Session 16   Sources screen
Session 17   Settings + polish + bug fixes + tests + comment pass
Session 17.5 PM dashboard + snapshot export + PostHog dashboards
Session 18   QA + native build prep
--- YOUR OWN TESTING ---
--- 10 FRIENDS BETA ---
--- INVESTOR READY ---
```

---

## QUICK REFERENCE

```
Repo:     github.com/anandsandk-lab/kashe
Local:    ~/Documents/kashe
Preview:  npx expo start → w → localhost:8081
TS check: npx tsc --noEmit (10 pre-existing errors — zero new is the bar)
Node:     v25.6.1
npm:      --legacy-peer-deps always
PostHog:  eu.posthog.com, project 144615
```

*For full build history → CLAUDE-history.md*
*For current file tree → CLAUDE-filetree.md*
*For all locked decisions → CLAUDE-decisions.md*
*For bug registry → CLAUDE-bugs.md*
