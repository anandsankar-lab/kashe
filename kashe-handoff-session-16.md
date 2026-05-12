# Kāshe — Session 16 Handoff
*Written at end of Session 15. Read at start of Session 16.*
*Last updated: 11 May 2026.*

---

## CONFIRMED STATE

Last commit: `9dcc750 [DL-10] PDF extraction via Claude Haiku`

```
9dcc750  [DL-10] PDF extraction via Claude Haiku
934120a  [Session 15] MD files updated
e532685  [W-07] RiskProfileCard — persists to householdStore
5cf9053  [W-06] InstrumentDiscoverySection — via hook
```

All MD files updated and committed. Local and remote in sync.

---

## SESSION 16 FIRST TICKET: W-08 — Real Data Stress Test

**Observation only. No commits during the test itself.**

Files Anand has ready (mix of his and wife Puhoop's):
- HDFC Bank — CSV or XLSX (spend routing expected)
- SBI Bank — XLSX (spend routing expected)
- SBI Life insurance policy — PDF (portfolio routing, assetSubtype unknown → pending queue)
- Indian mutual fund statement — PDF or XLSX
- Indian stock holdings — CSV or XLSX
- ABN Amro transactions — TXT tab-delimited (spend routing expected)
- DeGiro portfolio — CSV (portfolio routing expected)
- Possible joint accounts

**Important notes for W-08:**
- Password-protected files: user must remove password first. If they can't, skip and log.
- PDFs go through pdfExtractor.ts → Haiku → UNKNOWN route → DataSourceConfirmSheet always
- CSVs/XLSXs go through normal column detection → institution registry → route detection
- Personal data (PAN, passport, account numbers) should be masked before uploading to planning chat

**For each file, observe and log:**
1. Institution detected? Correct?
2. RouteConfidence? (spend / portfolio / unknown)
3. Tier 2 account type pre-selected in DataSourceConfirmSheet?
4. Transaction/holding count reasonable?
5. Any dedup triggers?
6. After confirm: UserFinancialProfile updated correctly?
   - financialVehicles[]? portfolioTier? dataMonthsSpend?

**Log all failures to CLAUDE-bugs.md. Fix after full test → single commit.**

---

## SESSION 16 REMAINING TICKETS

### W-09 — Wire UserFinancialProfile → holdingsContextBuilder
FILE: services/holdingsContextBuilder.ts
Add taxProfile, holdingFlags, activeWarnings to what gets sent to AI insight engine.
Run after W-08 fixes are committed.

### W-10 — Wire UserFinancialProfile → insightTriggers
FILE: constants/insightTriggers.ts
Wire profile in so triggers fire conditionally on portfolioTier, financialVehicles[],
sophisticationScore, primaryCurrency.

### VI-01 through VI-08 — Vehicle Intelligence implementation
Run in order. See kashe-handoff-session-15.md for full ticket specs.
VI-01: vehicleRules.ts (NEW FILE)
VI-02: userProfile.ts — cross-border fields
VI-03: portfolio.ts — holding period + tax wrapper fields
VI-04: userProfileService.ts — 5 computed functions
VI-05: insightTriggers.ts — T13 through T30
VI-06: insightPrompts.ts — market-aware context
VI-07: holdingsContextBuilder.ts — cross-border context block
VI-08: Onboarding Tax Profile screen

---

## KEY DECISIONS LOCKED IN SESSION 15 (do not re-debate)

**PDF parsing:** Claude Haiku. UNKNOWN route always. DataSourceConfirmSheet always shows for PDFs.
50 call/month cap (separate from insight budget). Never silent fail.

**Property entry:** UniversalAddSheet — not a blocking onboarding step.
Market-aware form fields:
- All markets: property value, outstanding balance, monthly payment, interest rate, fix end date
- NL only: erfpacht (leasehold) yes/no
- IN only: old/new tax regime (already captured in Tax Profile onboarding screen)
- DE only: owner-occupied vs rented
Non-blocking nudge card in onboarding → taps into UniversalAddSheet. Skippable.

**Aggregator roadmap (V1.5):** Nordigen for NL (ABN Amro, ING, Rabobank), Setu for IN.
Both require licensed API access. V1 stays CSV/PDF upload.

**Password-protected files:** Blocking beta bug #10. Error message required in CSVUploadSheet.

---

## ENGINEERING REMINDERS FOR SESSION 16

- Relative imports only — @/ alias forbidden
- householdStore is a default export — not named import
- trackRiskProfileSet() is the correct analytics function. trackMilestoneReached does not exist.
- formatCurrency() always — Intl.NumberFormat banned
- useInstrumentCatalogue sorts by tier asc (known bug #19 — fix Session 19, not now)
- Zero new TypeScript errors is the bar. ~10 pre-existing errors, do not fix those.
- One commit per ticket. MD files updated together with code in same commit.

---

## COMMIT CONVENTION

```
[W-08] Institution detection fixes — HDFC, SBI, DeGiro (after stress test)
[W-09] holdingsContextBuilder — UserFinancialProfile wired
[W-10] insightTriggers — UserFinancialProfile wired
[VI-01] vehicleRules.ts — VEHICLE_RULES constant
[VI-02] userProfile.ts — cross-border fields
[VI-03] portfolio.ts — holding period + tax wrapper fields
[VI-04] userProfileService.ts — 5 computed functions
[VI-05] insightTriggers.ts — T13 through T30
[VI-06] insightPrompts.ts — market-aware tax context
[VI-07] holdingsContextBuilder.ts — cross-border context
[VI-08] Onboarding Tax Profile screen
[Session 16] MD files updated — W-08 through VI-08 complete
```
