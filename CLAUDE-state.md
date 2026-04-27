# Kāshe — CLAUDE-state.md
*Current build state. ~30 lines. Rewrites every session.*
*Last updated: 27 April 2026 — Session 14 complete.*

---

## CURRENT STATUS

**Session 14: COMPLETE**
W-04 and W-05 committed and pushed.
Vehicle Intelligence Engine fully designed and documented.
Six reference documents added to repo.
All MD files updated.

**Next session: Session 15**
First ticket: W-06 (InstrumentDiscoverySection → useInstrumentCatalogue)

**Last commit:** [Session 14] Vehicle Intelligence — all docs, architecture, Session 15 handoff ready

---

## ACTIVE BLOCKERS

None. Session 15 can begin immediately.

**Pre-session prep:**
- Have real bank CSV files ready for W-08 stress test
  (ABN Amro TXT, HDFC CSV, DeGiro CSV, Aditya Birla XLSX)

---

## SESSION 15 TICKET ORDER

```
W-06   Wire useInstrumentCatalogue → InstrumentDiscoverySection
W-07   Wire householdStore → RiskProfileCard
W-08   Real Data Stress Test (observation only — no commit)
       [fix any parser issues found in W-08 before continuing]
W-09   Wire UserFinancialProfile → holdingsContextBuilder
W-10   Wire UserFinancialProfile → insightTriggers

VI-01  constants/vehicleRules.ts (NEW) — full VehicleRule[] constant
VI-02  types/userProfile.ts — citizenship, tax residency, cross-border fields
VI-03  types/portfolio.ts — purchaseDate required, countryOfAsset, taxWrapperType
VI-04  services/userProfileService.ts — 5 new computed functions
VI-05  constants/insightTriggers.ts — T13 through T30
VI-06  constants/insightPrompts.ts — market-aware tax profile context
VI-07  services/holdingsContextBuilder.ts — cross-border context
VI-08  Onboarding Tax Profile screen (screen 2.5)
VI-09  End-to-end wire verification
VI-10  All MD files updated — Vehicle Intelligence locked
```

---

## REMAINING BUILD ORDER (sessions)

```
Session 15   W-06–W-10 + VI-01–VI-10 (Vehicle Intelligence Engine)
Session 16   Onboarding (10 screens + Tax Profile screen + UniversalAddSheet)
Session 17   Sources screen
Session 18   Settings + polish + bug fixes + tests + comment pass
Session 18.5 PM dashboard + snapshot export + PostHog dashboards
Session 19   QA + native build prep
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
PostHog:  eu.posthog.com, project 144615
```

*For full build history → CLAUDE-history.md*
*For current file tree → CLAUDE-filetree.md*
*For all locked decisions → CLAUDE-decisions.md*
*For bug registry → CLAUDE-bugs.md*
