# Kāshe — CLAUDE-bugs.md
*Bug registry. Changes when bugs added or resolved.*
*Last updated: 27 April 2026 — Session 14, W-04 complete.*

---

## 🔴 Fix before beta (blocking)

1.  Hero number wrapping in PortfolioTotalsCard at large values
2.  GROWTH section total may be inflated (mock data arithmetic)
3.  Dutch brand names in Spend mock data (Albert Heijn, Jumbo etc.)
4.  "For information only. Not financial advice." missing on Invest tab
5.  REQUEST_SUPPORT_URL needs real Google Form URL (csvParser.ts)
6.  Clearbit opt-in toggle missing from Settings
7.  SpendTransaction vs Transaction alias — csvParser shim, align Session 16
8.  Compliance footer on Invest tab — Session 16
9.  csvParser.ts shim references — Session 16 cleanup:
    Remove shim, update all remaining imports to /services/ingestion

---

## 🟡 Polish — Session 16

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
24. auditStore.ImportAuditEvent still has probableDuplicatesFound field —
    hardcoded to 0 in CSVUploadSheet after W-04. Remove field entirely in
    Session 16 cleanup alongside csvParser.ts shim removal.
40. secureStorageAdapter localStorage: web preview uses unencrypted localStorage —
    acceptable for dev, must not ship to production web.
    Add warning log when Platform.OS === 'web' and not __DEV__.

---

## 🟢 Deferred by design

25. Dark mode device verification — Session 17
26. react-native-reanimated — restore in Session 17 (native build only)
27. Settings route wiring from AppHeader overflow — Session 16
28. FIRE planner screen — V2
29. AUDIT_STORE key missing from STORAGE_KEYS enum — Session 16
30. Price chart mock data — Session 13 wiring
31. V1 → V2 data migration strategy — pre-V2 planning
32. PARTNER profile type — V2 (requires Supabase couple sync)
33. holdingsContextBuilder wiring to UserFinancialProfile — Session 14 (W-09)
34. insightTriggers wiring to UserFinancialProfile — Session 14 (W-10)
35. ANALYTICS_ENABLED = false — flip after full enable checklist complete
36. Portfolio pending queue UX: holdings in pendingCategorizationQueue
    need resolution UI in Sources screen (Session 16).
    Until then, they are imported but not visible to user.

---

## 🔵 Strategic decisions needed pre-beta

37. AI API key UX post-beta (BYOK locked for beta, evaluate proxy backend after)
38. GDPR data export flow — "Download my data" — Session 17
39. Clearbit enrichment disclosure in privacy policy — before beta
40. Merchant enrichment opt-in UI in Settings — Session 17
41. Set per-tester Anthropic API key spend limits (~€6/tester) in Anthropic console
42. PostHog 4 dashboards setup manually in PostHog UI before beta
    (Spend Accuracy, Insight Quality, Catalogue Discovery, CSV Health)
43. ANALYTICS_ENABLED enable checklist — all 8 items must be checked before flip:
    [ ] DL-09 committed and verified
    [ ] updateUserProperties() called on first app open
    [ ] All 17 events verified with correct property names
    [ ] PostHog project 144615 confirmed active
    [ ] 4 PostHog dashboards created
    [ ] Per-tester Anthropic spend limits set in console
    [ ] Privacy policy updated with PostHog disclosure
    [ ] Clearbit disclosure in privacy policy
44. Institution registry quarterly review — same cadence as seed sources.
    As new banks are added or formats change, update INSTITUTION_REGISTRY.
    First review: before beta launch.
45. XLSX vulnerability: SheetJS has 1 known prototype pollution vulnerability
    in old parser code path. Not triggered by our read-only usage.
    Monitor for package updates before beta.

---

## RESOLVED

*(none yet — first beta will generate the first resolutions)*
