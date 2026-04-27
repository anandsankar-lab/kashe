[Session 13] 23–25 March 2026. W-01 through W-05 complete. Full ingestion pipeline (10 files).
csvParser.ts replaced with /services/ingestion/ tiered pipeline. Four-tier import taxonomy locked.
35 institutions in INSTITUTION_REGISTRY. Deduplicator restructured (compound key, Dice removed).
Infrastructure: PostHog ES module crash resolved (metro.config.js + babel.config.js). expo-secure-store web fallback.
MonthlyReviewCard wired to useInsights (W-05). Fuzzy dedup UI removed — compound key approach locked.

[Session 14] 27 April 2026. W-04 (deduplicator refactor) and W-05 (MonthlyReviewCard) committed.
Vehicle Intelligence Engine fully designed and documented — the core cross-border product differentiator.
Six reference documents written with double self-confirmation: vehicle-rules-IN/GB/NL/US/DE/XBORDER.md.
VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md — master review checklist with every figure and official source.
Full code-level change specification: types/userProfile.ts (citizenship, tax residency, isUSPerson),
types/portfolio.ts (purchaseDate required, countryOfAsset, taxWrapperType, holdingPeriodStatus),
constants/vehicleRules.ts (new — full TypeScript vehicle rule engine),
constants/insightTriggers.ts (T13-T30 — holding period, allowance headroom, cross-border triggers),
constants/insightPrompts.ts (market-aware templates), services/holdingsContextBuilder.ts (cross-border context),
services/userProfileService.ts (5 new computed functions), onboarding screen 2.5 (Tax Profile).
New engineering rules locked: 8 Vehicle Intelligence rules including "never compute tax, surface facts only".
All reference docs added to local repo, Claude project, and GitHub.
VI-01 through VI-10 tickets ready for Session 15 execution.
