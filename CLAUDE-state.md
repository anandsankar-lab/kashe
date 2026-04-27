# Kāshe — CLAUDE-state.md
*Current build state. ~30 lines. Rewrites every session.*
*Last updated: 25 March 2026 — Session 13 in progress.*

---

## CURRENT STATUS

**Session 13: IN PROGRESS**
W-01 ✅ W-02 ✅ W-03 ✅ W-03b ✅
W-04 through W-10 remain.

**Next active ticket: W-04 — ProbableDuplicateSheet**

**Last commit:** [W-03b] Ingestion pipeline — tiered taxonomy,
35-institution registry, XLSX/TXT support, portfolio pending queue.

---

## ACTIVE BLOCKERS

None. W-04 can begin immediately.

**Pre-requisite for W-08:** Export all real bank files before
the stress test. CSV, TXT, or XLSX from:
ABN Amro (personal + joint), HDFC (personal + joint + demat),
SBI, DeGiro, Aditya Birla Capital. Partner accounts too.

---

## SESSION 13 REMAINING TICKETS

```
W-04  ProbableDuplicateSheet — fuzzy dedup UI
W-05  Wire MonthlyReviewCard → useInsights
W-06  Wire useInstrumentCatalogue → InstrumentDiscoverySection
W-07  Wire householdStore → RiskProfileCard
W-08  Real Data Stress Test (observation only — no commit)
W-09  Wire UserFinancialProfile → holdingsContextBuilder
W-10  Wire UserFinancialProfile → insightTriggers
```

---

## KEY SESSION 13 INFRASTRUCTURE (already committed)

New packages installed:
  expo-document-picker, expo-file-system, xlsx (SheetJS),
  @expo/vector-icons, babel-preset-expo

New root config files:
  metro.config.js — unstable_enablePackageExports: false
                    fixes PostHog/ES module bundler crash
  babel.config.js — babel-preset-expo preset

secureStorageAdapter.ts: web localStorage fallback added.
  Web preview → localStorage. Native build → expo-secure-store.

New ingestion pipeline: /services/ingestion/ (10 files)
  csvParser.ts is now a re-export shim — do not add logic to it.

---

## REMAINING BUILD ORDER (sessions)

```
Session 13   Wire UI to data layer + real data stress test  ← IN PROGRESS
Session 14   Onboarding (10 screens + UniversalAddSheet)
Session 15   Sources screen
Session 16   Settings + polish + bug fixes + tests + comment pass
Session 16.5 PM dashboard + snapshot export + PostHog dashboards
Session 17   QA + native build prep
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
TS check: npx tsc --noEmit (9 pre-existing errors — zero new is the bar)
Node:     v25.6.1
npm:      --legacy-peer-deps always
PostHog:  eu.posthog.com, project 144615 (ANALYTICS_ENABLED = false)
```

*For full build history → CLAUDE-history.md*
*For current file tree → CLAUDE-filetree.md*
*For all locked decisions → CLAUDE-decisions.md*
*For bug registry → CLAUDE-bugs.md*
