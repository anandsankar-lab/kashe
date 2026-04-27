# Kāshe — CLAUDE-bugs.md
*Bug registry. Changes when bugs added or resolved.*
*Last updated: 27 April 2026 — Session 14 complete.*

---

## 🔴 Fix before beta (blocking)

1.  Hero number wrapping in PortfolioTotalsCard at large values
2.  GROWTH section total may be inflated (mock data arithmetic)
3.  Dutch brand names in Spend mock data (Albert Heijn, Jumbo etc.)
4.  "For information only. Not financial advice." missing on Invest tab
5.  REQUEST_SUPPORT_URL needs real Google Form URL (csvParser.ts)
6.  Clearbit opt-in toggle missing from Settings
7.  SpendTransaction vs Transaction alias — csvParser shim, align Session 18
8.  Compliance footer on Invest tab — Session 18
9.  csvParser.ts shim references — Session 18 cleanup:
    Remove shim, update all remaining imports to /services/ingestion

---

## 🟡 Polish — Session 18

10. Chart spike at end of 1M view in HoldingPriceChart
11. KasheAsterisk k-stroke weight/prominence
12. Vertical MacronRule in PortfolioTotalsCard as plain View not MacronRule component
13. TextInput monthly target field not going through currency formatter (known limitation)
14. Category detail screen layout gap
15. HomeHeader + SpendScreenHeader showGreeting prop mismatch vs AppHeaderProps
16. _layout.tsx @expo/vector-icons TypeScript types missing
17. [holdingId].tsx MacronRule style array type mismatch
18. BucketReassignSheet assetType vs assetSubtype typo
19. useInstrumentCatalogue sorts by tier ascending — fix to kasheScore descending
20. Comment pass on data layer services (DL-01 through DL-09) — document WHY not WHAT
21. Unit tests: insightTriggers, ingestion pipeline, spendCategoriser,
    holdingsContextBuilder, userProfileService — all pure functions, all testable
22. Integration tests: CSV/TXT/XLSX upload pipeline, budget cap enforcement,
    categoriser pipeline, portfolio pending queue resolution
23. SALARY_SLIP_UPLOADED missing from STORAGE_KEYS enum in storageService.ts
24. auditStore.ImportAuditEvent.probableDuplicatesFound hardcoded 0 — clean up Session 18
    (ProbableDuplicate interface removed in W-04; field left as 0 stub)
40. secureStorageAdapter localStorage: web preview uses unencrypted localStorage —
    acceptable for dev, must not ship to production web.
    Add warning log when Platform.OS === 'web' and not __DEV__.

---

## 🟢 Deferred by design

24. Dark mode device verification — Session 19
25. react-native-reanimated — restore in Session 19 (native build only)
26. Settings route wiring from AppHeader overflow — Session 18
27. FIRE planner screen — V2
28. AUDIT_STORE key missing from STORAGE_KEYS enum — Session 18
29. Price chart mock data — Session 15 wiring
30. V1 → V2 data migration strategy — pre-V2 planning
31. PARTNER profile type — V2 (requires Supabase couple sync)
32. holdingsContextBuilder wiring to UserFinancialProfile — Session 15 (W-09)
33. insightTriggers wiring to UserFinancialProfile — Session 15 (W-10)
34. ANALYTICS_ENABLED = false — flip after full enable checklist complete
35. Portfolio pending queue UX: holdings in pendingCategorizationQueue
    need resolution UI in Sources screen (Session 17).
    Until then, they are imported but not visible to user.

--- VEHICLE INTELLIGENCE KNOWN LIMITATIONS (added Session 14) ---

45. PFIC computation: T27 flags risk but does not compute Form 8621 liability.
    US persons with Indian MFs: trigger fires, actual PFIC tax exposure not computed.
    V2: integrate PFIC calculation or external advisor referral.

46. US state taxes: CA, NY, TX, FL, WA covered by usState field.
    Other US states show 'check your state' fallback in context.
    V2: complete 50-state coverage.

47. India RNOR status: 'rnor' captured in indiaResidencyStatus but RNOR-specific
    rules not fully surfaced in V1. RNOR users see standard NRI insights.
    V2: full RNOR treatment.

48. UK domicile: ukDomicileStatus captured but IHT planning computation not done.
    V2: IHT exposure modelling.

49. Dual residency: taxResidencyCountrySecondary captured but interaction with
    primary country not computed in V1. Specialist advice caveat shown.

50. German church tax: deChurchTaxApplicable flag present but 8-9% not added
    to displayed effective Abgeltungsteuer rate in V1. V2: include in display.

51. 30% ruling tracking: not tracked in V1. NL residents with 30% ruling may see
    slightly off Box 3 context until they confirm status manually.

52. Cross-border pension transfer: bAV/Rürup/lijfrente portability flagged.
    Specific transfer rules not surfaced. Always "verify with specialist" caveat.

53. purchaseDate migration for existing holdings: Holdings imported before VI-03
    will have purchaseDateKnown = false. No holding period alerts fire for these
    until date is confirmed. This is correct behaviour.

54. countryOfAsset for existing holdings: defaults to 'unknown' for holdings
    imported before VI-03. No cross-border triggers fire for 'unknown' assets.

55. VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md: First review due April 2027.
    All figures verified April 2026. Calendar reminder required.
    Stale tax rules are worse than no rules — they give false confidence.

---

## 🔵 Strategic decisions needed pre-beta

36. AI API key UX post-beta (BYOK locked for beta, evaluate proxy backend after)
37. GDPR data export flow — "Download my data" — Session 18
38. Clearbit enrichment disclosure in privacy policy — before beta
39. Merchant enrichment opt-in UI in Settings — Session 18
40. Set per-tester Anthropic API key spend limits (~€6/tester) in Anthropic console
41. PostHog 4 dashboards setup manually in PostHog UI before beta
    (Spend Accuracy, Insight Quality, Catalogue Discovery, CSV Health)
42. ANALYTICS_ENABLED enable checklist — all 8 items must be checked before flip:
    [ ] DL-09 committed and verified
    [ ] updateUserProperties() called on first app open
    [ ] All 17 events verified with correct property names
    [ ] PostHog project 144615 confirmed active
    [ ] 4 PostHog dashboards created
    [ ] Per-tester Anthropic spend limits set in console
    [ ] Privacy policy updated with PostHog disclosure
    [ ] Clearbit disclosure in privacy policy
43. Institution registry quarterly review — same cadence as seed sources.
    As new banks are added or formats change, update INSTITUTION_REGISTRY.
    First review: before beta launch.
44. XLSX vulnerability: SheetJS has 1 known prototype pollution vulnerability
    in old parser code path. Not triggered by our read-only usage.
    Monitor for package updates before beta.

---

## RESOLVED

*(none yet — first beta will generate the first resolutions)*
