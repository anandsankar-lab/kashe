# Kāshe — CLAUDE-state.md
*Current build state. ~30 lines. Rewrites every session.*
*Last updated: 11 May 2026 — Session 15 complete. Session 16 ready.*

---

## CURRENT STATUS

**Session 15: COMPLETE**
W-06, W-07, DL-10 committed and pushed.
Last commit: 9dcc750

**Next session: Session 16**
First ticket: W-08 — real data stress test

---

## SESSION 15 COMPLETED TICKETS

```
W-06  InstrumentDiscoverySection → useInstrumentCatalogue    ✅ commit 5cf9053
W-07  RiskProfileCard → householdStore                       ✅ commit e532685
DL-10 PDF extraction via Claude Haiku                        ✅ commit 9dcc750
      - pdfExtractor.ts (NEW)
      - fileReader.ts updated (pdf branch)
      - index.ts updated (pdf routing)
      - storageService.ts (PDF_EXTRACTION_BUDGET key)
      - types.ts (PdfBudget, PdfExtractionResult)
      - 50 call/month cap, separate from insight budget
      - UNKNOWN route always forces DataSourceConfirmSheet
```

---

## SESSION 16 PLAN

```
W-08   Real data stress test — observation only, no commits during test
       Files: HDFC, SBI, insurance (IN) + ABN Amro, DeGiro (NL) + PDFs
       Also: wife's files, some joint accounts
       Log all failures → CLAUDE-bugs.md
       Fix registry/parser gaps → commit after full test

W-09   Wire UserFinancialProfile → holdingsContextBuilder
W-10   Wire UserFinancialProfile → insightTriggers

VI-01  vehicleRules.ts — VEHICLE_RULES constant, enums, getVehicleCategory()
VI-02  userProfile.ts — cross-border fields
VI-03  portfolio.ts — purchaseDate, taxWrapperType, holdingPeriodStatus
VI-04  userProfileService.ts — 5 computed functions
VI-05  insightTriggers.ts — T13 through T30
VI-06  insightPrompts.ts — market-aware context
VI-07  holdingsContextBuilder.ts — cross-border context
VI-08  Onboarding Tax Profile screen
```

---

## KEY DECISIONS MADE SESSION 15

```
- PDF parsing: Claude Haiku (UNKNOWN route always, user confirms in DataSourceConfirmSheet)
- Property entry: UniversalAddSheet (not onboarding blocking)
  Market-aware form: NL (erfpacht), IN (old/new regime), UK, US, DE (owner/rented)
  Non-blocking nudge card in onboarding
- Aggregator strategy: Nordigen (NL) + Setu (IN) for V1.5 post-beta
- Password-protected files: user must remove password first
  Error message needed in UI — added to CLAUDE-bugs.md as blocking beta issue
```

---

## REMAINING BUILD ORDER

```
Session 16   W-08 stress test + W-09 + W-10 + VI-01 through VI-08
Session 17   Onboarding (10 screens) + UniversalAddSheet + property form (market-aware)
Session 18   Sources screen
Session 19   Settings + polish + bug fixes + comment pass
Session 19.5 PM dashboard + snapshot export + PostHog dashboards
Session 20   QA + native build prep
```

---

## QUICK REFERENCE

```
Repo:        github.com/anandsankar-lab/kashe
Local:       ~/Documents/kashe
Preview:     npx expo start → w → localhost:8081
TS check:    npx tsc --noEmit (~10 pre-existing errors — zero new is the bar)
Node:        v25.6.1
npm:         --legacy-peer-deps always
PostHog:     eu.posthog.com, project 144615
Last commit: 9dcc750
```

*For full build history → CLAUDE-history.md*
*For current file tree → CLAUDE-filetree.md*
*For all locked decisions → CLAUDE-decisions.md*
*For bug registry → CLAUDE-bugs.md*
