# Kāshe — Session 16 Handoff
*Written at end of Session 15. Read at start of Session 16.*
*Last updated: 11 May 2026.*

---

## WHERE WE ARE

Session 15 complete. W-06 and W-07 committed and pushed.

All wiring tickets are done except W-08, W-09, W-10.
Vehicle Intelligence (VI-01 through VI-08) is fully specced but not yet built.
Onboarding is not yet built.

---

## SESSION 16 PLAN

### W-08 — Real Data Stress Test (FIRST — observation only)

Files to test (Anand to supply):
- HDFC Bank (CSV or XLSX) — spend routing expected
- SBI Bank (XLSX) — spend routing expected
- SBI Insurance — portfolio routing expected, assetSubtype likely unknown → pending queue
- Indian mutual fund statement — portfolio routing expected
- Indian stock holdings — portfolio routing expected
- ABN Amro (TXT tab-delimited) — spend routing expected
- DeGiro (CSV) — portfolio routing expected

For each file, observe and log:
1. Institution detected? Which one? Correct?
2. RouteConfidence returned? (spend / portfolio / unknown)
3. Tier 2 account type pre-selected in DataSourceConfirmSheet?
4. Transaction/holding count correct?
5. Any dedup triggers?
6. After confirm: does UserFinancialProfile update correctly?
   - financialVehicles[] updated?
   - portfolioTier updated?
   - dataMonthsSpend updated?

No commits during observation. Log all failures to CLAUDE-bugs.md.
Fix registry/parser gaps after full test → single commit with all fixes.

---

### W-09 — Wire UserFinancialProfile → holdingsContextBuilder

FILE: services/holdingsContextBuilder.ts

The builder currently assembles context for Claude without knowing the user's
tax residency, citizenship, or cross-border complexity. VI-07 adds this.

After W-08 fixes are committed, wire UserFinancialProfile into the context builder
so that taxProfile, holdingFlags, and activeWarnings are included in what is sent
to the AI insight engine.

---

### W-10 — Wire UserFinancialProfile → insightTriggers

FILE: constants/insightTriggers.ts

Triggers T01–T12 exist. They don't yet consume UserFinancialProfile fields.
Wire the profile in so triggers can fire conditionally on:
- portfolioTier
- financialVehicles[]
- sophisticationScore
- primaryCurrency

---

### VI-01 through VI-08 — Vehicle Intelligence implementation

See kashe-handoff-session-15.md for the full spec of each ticket.
Run in order — each builds on the previous.

VI-01: vehicleRules.ts (NEW FILE)
VI-02: userProfile.ts — cross-border fields
VI-03: portfolio.ts — holding period + tax wrapper fields
VI-04: userProfileService.ts — 5 computed functions
VI-05: insightTriggers.ts — T13 through T30
VI-06: insightPrompts.ts — market-aware context
VI-07: holdingsContextBuilder.ts — cross-border context block
VI-08: Onboarding Tax Profile screen

---

## KEY REMINDERS FOR SESSION 16

- W-08 is observation only. Do not commit during the stress test.
- No TypeScript errors introduced — pre-existing set is ~10, zero new is the bar.
- Relative imports only — @/ alias is forbidden.
- householdStore is a default export — not named import.
- trackRiskProfileSet() is the correct analytics function. trackMilestoneReached does not exist.
- formatCurrency() always — Intl.NumberFormat is banned.
- useInstrumentCatalogue sorts by tier asc currently — known bug, fix Session 19.

---

## PRE-EXISTING BUGS (do not fix during VI block — Session 19)

See CLAUDE-bugs.md for full list. Key ones to not accidentally touch:
- useInstrumentCatalogue sort order (bug 19)
- csvParser.ts shim (bug 9) — remove shim Session 19
- auditStore probableDuplicatesFound hardcoded 0 (bug 24)

---

## COMMIT CONVENTION

```
[W-08] Institution detection fixes — HDFC, SBI, DeGiro
[W-09] holdingsContextBuilder — UserFinancialProfile wired
[W-10] insightTriggers — UserFinancialProfile wired
[VI-01] vehicleRules.ts — VEHICLE_RULES constant
[VI-02] userProfile.ts — cross-border fields
...etc
```

One commit per ticket. MD files updated and committed together with code.
