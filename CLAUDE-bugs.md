# Kāshe — CLAUDE-bugs.md
*Bug registry. Changes when bugs added or resolved.*
*Last updated: 11 May 2026 — Session 15 complete.*

---

## 🔴 Fix before beta (blocking)

1.  Hero number wrapping in PortfolioTotalsCard at large values
2.  GROWTH section total may be inflated (mock data arithmetic)
3.  Dutch brand names in Spend mock data (Albert Heijn, Jumbo etc.)
4.  "For information only. Not financial advice." missing on Invest tab
5.  REQUEST_SUPPORT_URL needs real Google Form URL (csvParser.ts)
6.  Clearbit opt-in toggle missing from Settings
7.  SpendTransaction vs Transaction alias — csvParser shim, align Session 19
8.  Compliance footer on Invest tab — Session 19
9.  csvParser.ts shim references — Session 19 cleanup:
    Remove shim, update all remaining imports to /services/ingestion
10. Password-protected file error message missing (added Session 15).
    Indian bank XLSX exports (HDFC, SBI, Zerodha etc.) are password-protected by default.
    SheetJS cannot read them. User currently gets a silent failure or generic parse error.
    Fix: detect password-protected XLSX in fileReader.ts and return a human-readable error:
    "This file appears to be password protected. Please open it, remove the password,
    and re-upload." Surface this in CSVUploadSheet as a named error state.

---

## 🟡 Polish — Session 19

11. Chart spike at end of 1M view in HoldingPriceChart
12. KasheAsterisk k-stroke weight/prominence
13. Vertical MacronRule in PortfolioTotalsCard as plain View not MacronRule component
14. TextInput monthly target field not going through currency formatter (known limitation)
15. Category detail screen layout gap
16. HomeHeader + SpendScreenHeader showGreeting prop mismatch vs AppHeaderProps
17. _layout.tsx @expo/vector-icons TypeScript types missing
18. [holdingId].tsx MacronRule style array type mismatch
19. useInstrumentCatalogue sorts by tier ascending — fix to kasheScore descending
20. Comment pass on data layer services (DL-01 through DL-10) — document WHY not WHAT
21. Unit tests: insightTriggers, ingestion pipeline, spendCategoriser,
    holdingsContextBuilder, userProfileService — all pure functions, all testable
22. Integration tests: CSV/TXT/XLSX/PDF upload pipeline, budget cap enforcement,
    categoriser pipeline, portfolio pending queue resolution
23. SALARY_SLIP_UPLOADED missing from STORAGE_KEYS enum in storageService.ts
24. auditStore.ImportAuditEvent.probableDuplicatesFound hardcoded 0 — clean up Session 19
    (ProbableDuplicate interface removed in W-04; field left as 0 stub)
40. secureStorageAdapter localStorage: web preview uses unencrypted localStorage —
    acceptable for dev, must not ship to production web.
    Add warning log when Platform.OS === 'web' and not __DEV__.

---

## 🟢 Deferred by design

25. Dark mode device verification — Session 20
26. react-native-reanimated — restore in Session 20 (native build only)
27. Settings route wiring from AppHeader overflow — Session 19
28. FIRE planner screen — V2
29. AUDIT_STORE key missing from STORAGE_KEYS enum — Session 19
30. Price chart mock data — deferred
31. V1 → V2 data migration strategy — pre-V2 planning
32. PARTNER profile type — V2 (requires Supabase couple sync)
33. holdingsContextBuilder wiring to UserFinancialProfile — W-09 Session 16
34. insightTriggers wiring to UserFinancialProfile — W-10 Session 16
35. ANALYTICS_ENABLED = false — flip after full enable checklist complete
36. Portfolio pending queue UX: holdings in pendingCategorizationQueue
    need resolution UI in Sources screen (Session 18).
    Until then, they are imported but not visible to user.
37. PDF extraction: 50 call/month cap is generous for beta.
    Revisit post-beta once real usage data exists.
38. Property entry form: market-aware form for NL/IN/UK/US/DE — Session 17
    (UniversalAddSheet). Non-blocking onboarding nudge card.

--- VEHICLE INTELLIGENCE KNOWN LIMITATIONS (added Session 14) ---

45. PFIC computation: T27 flags risk but does not compute Form 8621 liability.
46. US state taxes: CA, NY, TX, FL, WA covered. Other states: 'check your state' fallback.
47. India RNOR status: captured but RNOR-specific rules not fully surfaced in V1.
48. UK domicile: IHT planning computation not done in V1.
49. Dual residency: interaction with primary country not computed in V1.
50. German church tax: deChurchTaxApplicable flag present but not added to displayed rate.
51. 30% ruling tracking: not tracked in V1.
52. Cross-border pension transfer: flagged but specific rules not surfaced.
53. purchaseDate migration: holdings imported before VI-03 have purchaseDateKnown = false.
54. countryOfAsset: defaults to 'unknown' for holdings imported before VI-03.
55. VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md: First review due April 2027.

---

## 🔵 Strategic decisions needed pre-beta

36. AI API key UX post-beta (BYOK locked for beta, evaluate proxy backend after)
37. GDPR data export flow — "Download my data" — Session 19
38. Clearbit enrichment disclosure in privacy policy — before beta
39. Merchant enrichment opt-in UI in Settings — Session 19
40. Set per-tester Anthropic API key spend limits (~€6/tester) in Anthropic console
41. PostHog 4 dashboards setup manually in PostHog UI before beta
42. ANALYTICS_ENABLED enable checklist — all 8 items must be checked before flip
43. Institution registry quarterly review — first review before beta launch
44. XLSX vulnerability: SheetJS prototype pollution in old parser path. Monitor for updates.

---

## RESOLVED

*(none yet — first beta will generate the first resolutions)*
