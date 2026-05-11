# Kāshe — CLAUDE-history.md
*Append-only. Never rewritten. Add 3–4 lines per session.*
*Format: [Session N] Date. What was built. Key decisions locked. Why.*

---

[Session 01] March 2026. Design system + Home screen part 1.
Fonts locked: Space Grotesk + Inter (Syne/DM Sans retired).
ThemeContext pattern locked — useColorScheme() only in context/ThemeContext.tsx.
Empty state pattern locked: 0.5 opacity ghost + floating accent pill (NOT blur).

[Session 02] March 2026. Home screen complete.
AppHeader introduced as shared component — inline header code banned from tabs.
SpendStoryCard, SegregationToggle, MonthlyReviewLink built.

[Session 03] March 2026. Spend screen complete.
/types/spend.ts: SpendTransaction, SpendCategory, Budget, DataSource interfaces.
useDataSources.ts introduced. Layer pattern established: Service → Store → Hook → Component.

[Session 04] March 2026. Portfolio screen part 1 (PORT-01 through PORT-03).
/types/portfolio.ts: two-layer type system, DEFAULT_BUCKET map, PortfolioHolding.
Portfolio mock data added. PortfolioTotalsCard, SectionHeader, HoldingRow built.

[Session 05] March 2026. Portfolio continued (PORT-06 through PORT-09).
/constants/formatters.ts introduced with formatCurrency() — Intl.NumberFormat banned.
InvestmentPlanCard, InstrumentSuggestionSheet, BucketReassignSheet built.

[Session 06] March 2026. Portfolio PORT-10 basic.
LockedProjectionCard, ProtectionStatusCard, HoldingDetailScreen basic version.

[Session 07] March 2026. Colour audit + PORT-10b + visual standardisation.
Full colour audit — all components verified to use theme tokens correctly.
/constants/displayLabels.ts added — raw subtype keys banned from UI.
HoldingPriceChart, HoldingInsightCard built. Tab 4 renamed invest.

[Session 08] March 2026. PORT-11 + mock data overhaul + Invest shell.
Mock data made geography-neutral (no Dutch brand names).
Tab 4 confirmed as Invest. invest.tsx shell created.

[Session 09] March 2026. INV-01 + catalogue type system + universal header.
/types/riskProfile.ts, /types/instrumentCatalogue.ts built.
~40 curated catalogue entries. AppHeader rebuilt as universal — all tabs use it.
Risk profile: RECOMMEND Balanced, never silently assume. Locked.

[Session 10] March 2026. INV-02 through INV-05 + copy tightening.
MonthlyReviewSheet locked as executive brief (four storytelling levels — never text doc).
FIRETeaserCard built but NOT rendered — V2 deferred here.
Invest tab copy rules locked: visuals first, fraction format, "worth exploring" always.

[Session 11] March 2026. Invest tab complete + FIRE foundation.
FIRE confirmed V2 only — FIREProgress and FIRETeaserCard removed from V1 screens.
/constants/fireDefaults.ts, /types/fire.ts built as V2 foundations (do not delete).
settings.tsx stub with Education section. FIRE copy locked.

[Session 12] 19–20 March 2026. Complete data layer DL-01 through DL-09.
DL-01: storageService + secureStorageAdapter. All storage through storageService only. Write failures always propagate.
DL-02+03: spendCategoriser (Layer 3→1→2) + merchantKeywords (NL/IN/EU/GLOBAL). Layer 3 checked FIRST.
DL-04: csvParser. Papa Parse. Smart field detector. Atomic imports. Hybrid dedup. 24 institutions.
DL-05: 5 Zustand stores. Derived cache with lastCalculatedAt. auditStore (100-event FIFO).
DL-06: 5 hooks. 24h staleness check. Clean boundary between stores and UI.
DL-07: AI insight engine — 5 files, 2383 lines. Tiered source architecture, 10 triggers,
  prompt injection defence, pessimistic budget accounting, 12-hour generation windows,
  ISIN→issuer IR mapping, discovery pass for tier 2+ portfolios.
DL-08: analyticsService. PostHog EU cloud, project 144615. ANALYTICS_ENABLED=false.
  17 events across 4 learning loops. Zero PII. Anonymous distinct ID.
DL-09: UserFinancialProfile — the intelligence spine.
  types/userProfile.ts, services/userProfileService.ts built.
  householdStore updated (financialProfile field).
  analyticsService updated (updateUserProperties(profile) — single source for all PostHog props).
  insightTriggers updated (T11 cash pile + T12 liquidity concentration added).
  insightSources updated (getActiveSeedSources takes UserFinancialProfile).
  Sophistication score (0–100) added — drives insight depth, never shown to user.
  Portfolio tier hysteresis: 20% below floor before tiering down.
  financialVehicles[] drives source selection — not re-derived per call.
  MD file structure restructured: CLAUDE-state, CLAUDE-history, CLAUDE-filetree,
  CLAUDE-decisions, CLAUDE-bugs created. Monolithic CLAUDE-state replaced.

[Session 13] 25 March 2026. Wire UI to data layer + ingestion pipeline restructure.
W-01: spend.tsx wired to useSpend(). W-02: portfolio.tsx wired to usePortfolio().
W-03: CSV upload flow — CSVUploadSheet, DataSourceConfirmSheet, UploadToast.
  DataSourceConfirmSheet: Tier 2 account type selector always shown.
  Confirm disabled until user picks when routeConfidence = unknown.
Infrastructure fixed: secureStorageAdapter web localStorage fallback,
  metro.config.js (unstable_enablePackageExports:false), babel.config.js,
  babel-preset-expo, @expo/vector-icons, expo-document-picker, SheetJS installed.
W-03b: csvParser.ts decomposed into /services/ingestion/ (10 files).
  Four-tier import taxonomy locked: Tier1=Route, Tier2=AccountType,
  Tier3=LineItemType, Tier4=Direction (auto).
  35 institutions in registry: NL(ABN Amro, ING, Rabobank),
  IN(HDFC Bank, SBI, ICICI, Axis, Kotak, Zerodha, Groww, Upstox,
  Angel One, HDFC Securities, Aditya Birla Capital, SBI MF, Mirae Asset),
  UK(Barclays, Lloyds, HSBC UK, NatWest, Monzo, Starling),
  US(Chase, BofA, Wells Fargo, Citi, Capital One, Fidelity, Schwab,
  Vanguard, Interactive Brokers), EU(DeGiro), UNKNOWN.
  Detection: column header + sample value fingerprints only. Filename never used.
  File formats: CSV, TXT/TAB (auto-detect), XLSX/XLS (SheetJS).
  Portfolio pending queue in portfolioStore — unknown assetSubtype held for resolution.
  portfolioStore: addHoldings(), addPendingHoldings(), resolveHolding() added.
  Target user confirmed: any globally mobile working professional (IN/UK/EU/US).
W-04 redefined and completed: ProbableDuplicateSheet spec retired entirely.
  Dice coefficient fuzzy matching removed from deduplicator.ts.
  Replaced with compound key: transactionId (Priority 1) +
  amount + date + normalisedDescription (Priority 2).
  Deduplication geography-agnostic — works for all banks, all markets.
  ProbableDuplicate interface removed. probableDuplicates[] removed from ParseSuccess.
W-05 completed: MonthlyReviewCard wired to useInsights().
  Four review states live: unavailable / insufficient / ready_unread / ready_read.

[Session 14] 27 April 2026. Architecture and documentation session.
Vehicle Intelligence Engine designed — the cross-border product differentiator.
Six reference documents written, double self-confirmed as expert per market:
  vehicle-rules-IN/GB/NL/US/DE/XBORDER.md + VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md.
Complete code spec locked: VI-01 (vehicleRules.ts), VI-02 (userProfile types),
  VI-03 (portfolio types — purchaseDate required, countryOfAsset, taxWrapperType),
  VI-04 (userProfileService computed functions), VI-05 (triggers T13-T30),
  VI-06 (insightPrompts market-aware), VI-07 (holdingsContextBuilder cross-border),
  VI-08 (onboarding Tax Profile screen).
8 Vehicle Intelligence engineering rules locked. All docs committed to repo.
Session 15 fully specced: W-06/W-07/W-08 then VI-01 through VI-10.

[Session 15] 11 May 2026. Wiring tickets W-06 and W-07 completed.
W-06: InstrumentDiscoverySection wired to useInstrumentCatalogue() hook.
  Direct import of getInstrumentsByTierAndBucket removed. Hook call added.
  getSuggestions(bucketLabel, resolvedGeography) replaces direct catalogue access.
  commit 5cf9053.
W-07: RiskProfileCard wired to householdStore for risk profile persistence.
  useEffect syncs riskProfile prop → store on change.
  trackRiskProfileSet() fires for any non-balanced selection.
  Claude Code self-corrected two wrong prompt assumptions:
  trackMilestoneReached does not exist (correct fn: trackRiskProfileSet);
  householdStore is a default export not named; component has no local selected state.
W-08 (real data stress test) deferred to Session 16 — Anand has IN + NL files ready.
CLAUDE-state.md confirmed stale across sessions — root cause: project file cached
  in planning chat, not read from local repo. Verbal confirmation always takes precedence.
