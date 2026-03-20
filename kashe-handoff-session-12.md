# Kāshe — Session 12 Handoff Document
*Session 11 → Session 12 → Session 13*
*Date: 19–20 March 2026*
*Status: COMPLETE — DL-01 through DL-09 all committed.*
*This session has no UI. All verification was tsc + grep only.*

---

## SESSION 12 IS COMPLETE

All data layer tickets committed. Move to kashe-handoff-session-13.md.

---

## WHAT WAS BUILT — SESSION 12 (complete record)

### DL-01 ✅ COMMITTED
/services/storageService.ts — expo-secure-store vault door, STORAGE_KEYS, StorageError
/services/secureStorageAdapter.ts — Zustand bridge (Option B — separate file)
- Read failures: graceful degradation
- Write failures: always re-throw (DEC-06)
- createJSONStorage() wrapper for Zustand v5

### DL-02 + DL-03 ✅ COMMITTED
/services/spendCategoriser.ts — three-layer pipeline
/constants/merchantKeywords.ts — NL/IN/EU/GLOBAL geography-aware
- Layer 3 checked FIRST (user corrections always win)
- categorise() synchronous
- categoriseViaAI() never throws
- applyUserCorrection() pure function
- Layer 1 promotion logging at correctionCount >= 5

### DL-04 ✅ COMMITTED
/services/csvParser.ts — smart field detection, atomic imports
- Papa Parse for mechanical CSV reading
- Smart field detector — scores columns, assigns types
- Tier 1/2/3 field model (blocking/fallback/nice-to-have)
- Atomic imports — all-or-nothing, ATOMIC_ROLLBACK on failure
- Hybrid deduplication: ref → compound key → fuzzy Dice (Indian banks)
- Probable duplicates → user confirmation (not silent skip)
- 24 supported institutions (NL/BE/IN/EU/UK/US)
- Google Form fallback for unrecognised formats
- ImportAuditData returned with every ParseSuccess
- NOTE: csvParser imports SpendTransaction as Transaction alias — fix Session 16

### DL-05 ✅ COMMITTED
5 Zustand stores — all using secureStorageAdapter
/store/spendStore.ts — addTransactions runs Layer 1 immediately
/store/portfolioStore.ts — holdings, bucket overrides, protection
/store/insightsStore.ts — AIUsageRecord, monthly token rollover
/store/householdStore.ts — profiles, auth, financialProfile (added DL-09)
/store/auditStore.ts — 100-event FIFO cap, import audit log
- Derived cache in stores (Option A — lastCalculatedAt)
- Zustand v5 fix: createJSONStorage(() => secureStorageAdapter)

### DL-06 ✅ COMMITTED
5 hooks — clean boundary between stores and UI
/hooks/useSpend.ts — 24h staleness, month filtering
/hooks/usePortfolio.ts — bucket overrides, protection months
/hooks/useInsights.ts — reviewState, effectiveActiveInsight
/hooks/useHousehold.ts — activeProfile, currentProfile
/hooks/useInstrumentCatalogue.ts — sorted by tier asc (fix to kasheScore desc in Session 16)

### DL-07 ✅ COMMITTED (5 files, 2383 lines)
/constants/insightSources.ts — PM-curated seed sources, KNOWN_HIGH_AUTHORITY_DOMAINS,
  computeSourceQuality() heuristic, rankSources(), getActiveSeedSources()
  Updated DL-09: getActiveSeedSources() now takes UserFinancialProfile directly
/constants/insightTriggers.ts — 10 trigger conditions (T1–T10), all pure functions
  Updated DL-09: T11 + T12 added, TriggerInput extended with new fields
/constants/insightPrompts.ts — BASE_SYSTEM_PROMPT, prompt builders, injection defence,
  enforceWordLimit(), isSafeForPrompt()
/services/holdingsContextBuilder.ts — ISIN→issuer IR, buildHoldingsContext(),
  formatHoldingsContextForPrompt(), formatSourceListForPrompt(), validateForPromptSafety()
/services/aiInsightService.ts — isGenerating lock, pessimistic accounting,
  clock manipulation detection, 12-hour windows, max 2/day,
  validateApiKey() (sk-ant- prefix), FIRE_TRAJECTORY not_implemented,
  web search enabled for MARKET_EVENT only

### DL-08 ✅ COMMITTED
/services/analyticsService.ts — PostHog EU cloud, ANALYTICS_ENABLED = false
- PostHog project 144615, key in file (write-only, safe)
- 17 events across 4 learning loops + PM visibility
- Anonymous distinct ID via crypto.randomUUID()
- Zero merchant strings in any event
- Updated DL-09: updateUserProperties(profile), trackPortfolioTierChanged,
  trackMilestoneReached added

### TYPE FIXES ✅ COMMITTED
- types/portfolio.ts: added isin?: string to PortfolioHolding
- store/insightsStore.ts: confidence now includes 'sentiment_only'

### PACKAGE.JSON ✅ COMMITTED
- posthog-react-native dependency added

### DL-09 ✅ COMMITTED
/types/userProfile.ts — UserFinancialProfile interface, vehicle taxonomy,
  VEHICLE_CATEGORY_MAP, CASH_LIKE_VEHICLES, ILLIQUID_SPECULATIVE_VEHICLES
/services/userProfileService.ts — buildUserFinancialProfile(), computeSophisticationScore(),
  computeSophisticationBand(), computePortfolioTier() with hysteresis,
  computeVehiclePercentages(), computeInvestingFrequency(), computeSavingsRateBand(),
  computeImportFreshness()
/store/householdStore.ts — financialProfile field + updateFinancialProfile() action
/services/analyticsService.ts — updateUserProperties(profile), new events
/constants/insightTriggers.ts — T11 (cash pile) + T12 (liquidity), TriggerInput extended
/constants/insightSources.ts — getActiveSeedSources(profile: UserFinancialProfile)

---

## FINAL SESSION 12 STATE

TypeScript: 9 pre-existing errors, zero new errors introduced.
AsyncStorage: zero results in source files.
SecureStore: only in services/storageService.ts.
ANALYTICS_ENABLED: false — confirmed at line 14 of analyticsService.ts.
phc_placeholder: zero occurrences — replaced with real key.
File tree: all expected files present.

---

## OPEN ITEMS CARRIED TO SESSION 13

All in bug registry in CLAUDE-state.md. Key items:

🔴 Before beta:
- SpendTransaction vs Transaction alias (csvParser)
- Compliance footer on Invest tab
- REQUEST_SUPPORT_URL real Google Form URL
- Clearbit opt-in toggle in Settings

🟡 Session 16 polish:
- useInstrumentCatalogue sorts by tier asc — fix to kasheScore desc
- Various UI polish issues (see bug registry)
- Comment pass on data layer (DL-01 through DL-09)
- Unit + integration tests

🔵 Before beta flip:
- holdingsContextBuilder wiring to UserFinancialProfile (W-09 in Session 13)
- insightTriggers wiring to UserFinancialProfile (W-10 in Session 13)
- ANALYTICS_ENABLED = true checklist (all 8 items)
- PostHog 4 dashboards setup manually
- Per-tester Anthropic API key spend limits set in console

---

## QUICK REFERENCE

Repo: github.com/anandsandk-lab/kashe
Local: ~/Documents/kashe
Preview: npx expo start → w → localhost:8081
TypeScript check: npx tsc --noEmit
Node: v25.6.1
npm flag: --legacy-peer-deps always
