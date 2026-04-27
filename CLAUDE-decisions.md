# Kāshe — CLAUDE-decisions.md
*All locked decisions. Rarely changes.*
*Last updated: 27 April 2026 — Session 14 complete. Section 19 added.*
*If a decision isn't here, it hasn't been made yet — ask the PM.*

---

## HOW TO USE THIS FILE

This is the canonical decision register. Every locked decision is here.
Organised by domain. When in doubt — check here before assuming.

---

## 1. PRODUCT IDENTITY

**What is Kāshe?**
A pocket investment advisor and financial clarity tool for globally mobile
professionals. Anyone managing savings, investments, and spending across
more than one country or currency. Not India-specific — for ALL globally
mobile professionals with a multi-geography financial life.
Target markets: IN, UK, EU, USA.

**North star test**
Would a globally mobile working professional with investments in two
countries trust this with their full financial picture, find it genuinely
insightful, and willingly pay for it?

**Language rules**
- "Your Position" everywhere. Never "Net Worth".
- "Worth exploring" for instruments. Never "Buy" or "Invest in".
- "How close are you to financial independence?" for FIRE. Never "stop working",
  "choose not to work", or "retire early".
- "For information only. Not financial advice." on Invest tab + Education section.
- Compliance footer must appear before beta. Non-negotiable.

---

## 2. NAVIGATION + TABS

**Four tabs — locked forever**
```
Home        Your position at a glance
Spend       Spend tracking + spend-specific AI insights
Portfolio   Holdings + portfolio-specific AI insights
Invest      Risk profile + investment plan + discovery + monthly review
```

**No standalone Insights tab.** AI insights live on native screens.

**Tab 4 is Invest.** Not Insights. Not Finance. Invest.

**Routes (locked)**
```
/app/(tabs)/index.tsx          Home
/app/(tabs)/spend.tsx          Spend
/app/(tabs)/portfolio.tsx      Portfolio
/app/(tabs)/invest.tsx         Invest
/app/spend/[category].tsx      Spend category detail
/app/portfolio/[holdingId].tsx Holding detail
/app/settings.tsx              Settings (stub → full Session 18)
/app/sources.tsx               Sources (Session 17)
/app/invest/fire.tsx           NOT BUILT — V2 only
```

---

## 3. DESIGN SYSTEM

**Fonts — locked**
- Space Grotesk (700, 600, 400): display numbers, hero figures, large amounts
- Inter (500, 400): body text, labels, UI elements
- NEVER: Syne, DM Sans — permanently retired

**Colours — locked**
- Never raw hex values in components. Ever.
- `useTheme()` for adaptive tokens (background, surface, border, text)
- `colours.*` for static tokens (accent, danger, warning, hero tokens)
- `useColorScheme()` called ONLY in `context/ThemeContext.tsx`
- `const theme = useTheme()` — NEVER destructured

**Accent colour**: #C8F04A (acid green) — used sparingly

**Hero card rule**: always dark in both light and dark mode. Hero tokens inside only.

**Empty state pattern — locked**
0.5 opacity ghost of the populated screen + floating acid green pill.
NOT blurred. NOT frosted. 0.5 opacity only.

**Currency formatting — locked**
- Always `formatCurrency()` from `/constants/formatters.ts`
- NEVER `Intl.NumberFormat` — unreliable in Expo web bundler
- NEVER template literals: `€${amount}`
- TextInput: format on blur, parse on save (never format live — breaks cursor)

**Screen layout — locked**
paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48

**Standard card — locked**
theme.surface background, borderRadius: 16, no visible border

**MacronRule** between major sections: marginTop: 24

**Universal AppHeader — locked**
ALL four tab screens use AppHeader from /components/shared/AppHeader.tsx.
NEVER write inline header code in any tab screen file.

**Monthly Review format — locked**
Executive brief. Four storytelling levels. NEVER text document / scrollable paragraphs.
L1: Hero stat + SVG sparkline
L2: Animated bucket allocation bars
L3: Priority action card (accent left border)
L4: Watchlist bullets
System-responsive mode (follows device dark/light) — intentional.

---

## 4. DATA ARCHITECTURE

**The chain — non-negotiable**
Service → Store → Hook → Component
Components never import services. Ever.
Hooks are the only boundary.
EXCEPTION: CSVUploadSheet calls ingestFile() directly — it IS the boundary
for file I/O. No other component may import from services/.

**Single source of truth locations**
- Colours → `constants/colours.ts` + `context/ThemeContext.tsx`
- Spend categories → `types/spend.ts`
- Transactions → `spendStore`
- Typography → `constants/typography.ts`
- Mock data → `constants/mockData.ts`
- Currency formatting → `constants/formatters.ts`
- Instrument catalogue → `constants/instrumentCatalogue.ts`
- Education catalogue → `constants/educationCatalogue.ts`
- Risk profiles → `types/riskProfile.ts`
- Display labels → `constants/displayLabels.ts`
- FIRE defaults → `constants/fireDefaults.ts` (V2 foundation)
- FIRE types → `types/fire.ts` (V2 foundation)
- Merchant keywords → `constants/merchantKeywords.ts`
- Storage keys → `services/storageService.ts` STORAGE_KEYS
- Supported institutions → `services/ingestion/institutionRegistry.ts` INSTITUTION_REGISTRY
- Ingestion entry point → `services/ingestion/index.ts` ingestFile()
- Import audit log → `store/auditStore.ts`
- Insight seed sources → `constants/insightSources.ts`
- Insight trigger conditions → `constants/insightTriggers.ts`
- Insight prompt templates → `constants/insightPrompts.ts`
- User financial profile → `store/householdStore.ts` financialProfile
  Built by: `services/userProfileService.ts`
- PostHog user properties → `services/analyticsService.ts` updateUserProperties()
  Source: UserFinancialProfile always. Never set properties manually.
- Vehicle category taxonomy → `types/userProfile.ts` VEHICLE_CATEGORY_MAP
- **Vehicle intelligence rules → `constants/vehicleRules.ts` VEHICLE_RULES** ← NEW VI-01

**Storage — locked**
- expo-secure-store for ALL persistence on native. Never AsyncStorage directly.
- Web preview: localStorage via secureStorageAdapter fallback (dev only — not encrypted).
- ALL storage access: /services/storageService.ts only.
- secureStorageAdapter: separate file from storageService (single responsibility).
- Raw files: never written to disk. Parse in memory only.
- Write failures: always propagate. Never swallowed silently.

**Caching model — locked (Option A)**
Derived values cached IN stores with lastCalculatedAt.
Hooks check staleness on mount (24h threshold).
If null or stale: recalculate → update store.
If fresh: return cached values directly.
One month at a time for Spend cache. Month switch = cache miss.

**Security pipeline — locked**
Now lives in /services/ingestion/securityPipeline.ts.
Runs as part of ingestFile() pipeline.
sanitiseTransaction(), sanitiseHolding(), isSafeValue(), maskAccountNumber().

**Multi-currency — locked**
Store original currency + converted amount both.
amountOriginal + currencyOriginal always preserved.

**Duplicates — locked (updated W-04)**
Compound key deduplication only. No fuzzy/Dice matching.
Priority 1: transactionId (exact match).
Priority 2: amount + date + normalisedDescription (compound key).
Dedup count reported in toast. Never silent. Never partial import.
ProbableDuplicate interface removed. ProbableDuplicateSheet retired.

**Joint accounts — locked**
DataSource.accountType: 'personal' | 'joint' | 'managed'.
Joint transactions: ownership: 'joint', shown ONCE in household view.
DataSourceConfirmSheet always asks "Is this a joint account?" after every import.

**Audit log — locked**
Every import logged in auditStore at profile level.
100-event FIFO cap. auditStore.clearAuditLog() ONLY from "delete all data".

**Retry queue — locked**
Layer 2 enrichment: 20 calls per upload cap, 30 calls per day drain, 3 attempt limit.
After 3 failures: category = 'other', confidence = 0.3.
Budget gate: always check isWithinBudget() before any call.

---

## 4b. INGESTION PIPELINE

**Single entry point — locked (25 March 2026)**
```
ingestFile(input: IngestionInput): Promise<ParseResult>
Import from: /services/ingestion (index.ts)
NEVER import from csvParser.ts in new code — it is a shim.
csvParser.ts will be removed in Session 18 cleanup.
```

**Four-tier import taxonomy — locked (25 March 2026)**
```
Tier 1 — Route:
  'spend' | 'portfolio'
  Auto-detected. Always confirmed by user in DataSourceConfirmSheet.

Tier 2 — Account Type (user always confirms):
  Spend:     savings_account | current_account |
             credit_card | joint_account
  Portfolio: brokerage | mutual_fund_folio |
             retirement | fixed_deposit_account | other_investment
  Confirm button disabled until selection made when confidence = unknown.

Tier 3 — Line Item Type (parser assigns per row, user can correct later):
  Spend:     SpendCategory (groceries, eating_out, housing...)
             Assigned by spendCategoriser Layer 3→1→2 pipeline
  Portfolio: AssetSubtype (eu_etf, in_mutual_fund, direct_equity...)
             Assigned by holdingsParser per row from ISIN + column signals

Tier 4 — Direction (always auto-detected, never user-facing):
  Spend:     debit | credit (from amount sign)
  Portfolio: buy | sell | dividend | split (from transaction type column)
```

**Detection hierarchy — locked (25 March 2026)**
```
1. Institution fingerprint (PRIMARY):
   Column header fingerprints + sample value fingerprints
   Scored against INSTITUTION_REGISTRY
   Returns: institution + RouteConfidence (high/medium/low/unknown)

2. Column content scoring (FALLBACK — UNKNOWN institution only):
   portfolioSignals: isin, ticker, quantity, koers, nav, price...
   spendSignals: debit, credit, merchant, balance, narration...
   portfolio >= 3 AND > spend → 'portfolio' (medium confidence)
   spend >= 2 AND > portfolio → 'spend' (medium confidence)
   ambiguous → confidence: 'unknown' (user must pick, no pre-selection)

3. User confirmation (FINAL WORD — always):
   DataSourceConfirmSheet always shown after every import
   Pre-selection based on detection confidence
   User's selection overrides everything

NEVER use filename as a detection signal. Users can rename files.
```

**RouteConfidence UI rules — locked**
```
'high' | 'medium' → tier2Suggestion pre-selected, Confirm button enabled
'low' | 'unknown' → no pre-selection, Confirm disabled until user picks
Helper text shown when 'unknown':
  "We couldn't detect this automatically — please select"
```

**Institution registry — locked**
```
Location: /services/ingestion/institutionRegistry.ts
35 institutions:
  NL:  ABN_AMRO, ING, RABOBANK
  IN:  HDFC_BANK, SBI, ICICI_BANK, AXIS_BANK, KOTAK_BANK,
       ZERODHA, GROWW, UPSTOX, ANGEL_ONE,
       HDFC_SECURITIES, ADITYA_BIRLA_CAPITAL, SBI_MF, MIRAE_ASSET
  UK:  BARCLAYS, LLOYDS, HSBC_UK, NATWEST, MONZO, STARLING
  US:  CHASE, BANK_OF_AMERICA, WELLS_FARGO, CITI, CAPITAL_ONE,
       FIDELITY, CHARLES_SCHWAB, VANGUARD, INTERACTIVE_BROKERS
  EU:  DEGIRO
  Fallback: UNKNOWN

To add a new institution: add entry to INSTITUTION_REGISTRY only.
No other pipeline changes needed — registry is read at runtime.
```

**File formats supported — locked**
```
CSV:      Papa Parse, auto-detect delimiter
TXT/TAB:  Papa Parse, auto-detect delimiter
XLSX/XLS: SheetJS → first sheet → rows → column detector
All headers normalised (trim + lowercase) before detection.
```

**Portfolio pending queue — locked**
```
Holdings where assetSubtype cannot be detected →
  portfolioStore.pendingCategorizationQueue
Never blocks import. Atomic rule applies at file level, not row level.
Cap: 50 items FIFO.
resolveHolding(id, assetSubtype) moves item to main holdings.
Surfaced for user resolution in Sources screen (Session 17).
```

**Atomic import rule — locked (unchanged)**
All-or-nothing at the file level.
Any pipeline failure → ParseError ATOMIC_ROLLBACK.
Individual row failures (holdingsParser unknown subtype) → pending queue,
  NOT rollback.

---

## 5. SPEND CATEGORISATION

**Three-layer pipeline — locked**
Layer 3 → Layer 1 → Layer 2 (this order — user corrections checked FIRST)

**Layer 1**: keyword rules (synchronous, fast, free, offline) — confidence: 1.0
- Check merchantOverrides FIRST (user corrections always win)
- Then MERCHANT_KEYWORDS by geography (NL/IN/EU/GLOBAL)
- Then GLOBAL fallback

**Layer 2**: Claude API enrichment — confidence: 0.8
- Option C (Clearbit) → Option A (Claude haiku) fallback
- Clearbit: merchant name ONLY, zero user context, opt-in only
- Only for Layer 1 misses — never for already-matched transactions
- Async, background queue, never blocks UI

**Layer 3**: user correction — confidence: 1.0
- Back-applies to ALL past transactions from same merchantNorm
- correctionCount >= 5 → Layer 1 promotion candidate logged
- V2: Supabase propagates correction to all users

**Merchant enrichment opt-in — locked**
Clearbit: opt-in in Settings → AI Features. OFF by default.
Must be disclosed in privacy policy before beta.

---

## 6. PORTFOLIO

**Terminology — locked**
- "Live" not "liquid" — assets with a current market price
- "Locked" not "illiquid" — assets committed for a period
- "Your Position" not "Net Worth" — everywhere, always

**Three buckets — locked**
GROWTH / STABILITY / LOCKED
Protection is a designation on one STABILITY holding, not a fourth bucket.

**DEFAULT_BUCKET map — locked**
Single source of truth: /types/portfolio.ts DEFAULT_BUCKET
GROWTH:    eu_etf, index_fund, active_mutual_fund, in_mutual_fund,
           direct_equity, fractional_equity, employer_rsu, employer_espp,
           crypto_spot
STABILITY: savings_account, nre_account, nro_account, bond_etf, bond_fund,
           money_market_fund, liquid_fund, debt_fund
LOCKED:    ppf, epf, nps, pension_scheme, govt_savings_scheme,
           endowment_policy, equity_crowdfunding, angel_investment,
           employer_stock_option, ulip

**BucketOverride**: stored per profile. Override triggers immediate
PORTFOLIO_HEALTH insight invalidation.

**Protection designation — locked**
One STABILITY holding designated as emergency fund.
Recommended: 3–6 × average monthly spend.
Shield icon replaces geography flag in PortfolioHoldingRow.
Designation stored in portfolioStore.protectionHoldingId.

---

## 7. AI INSIGHT ENGINE

**Five insight types — locked**
1. MARKET_EVENT_ALERT — highest priority, time-sensitive, web search enabled
2. PORTFOLIO_HEALTH — triggered by T1–T12, local calc + Claude narrative
3. INVESTMENT_OPPORTUNITY — zero cost, fully templated locally
4. MONTHLY_REVIEW — separate card, once per calendar month
5. FIRE_TRAJECTORY — V2 only, returns not_implemented in V1

**Budget cap — locked**
FREE_MONTHLY_LIMIT: 10,000 input tokens
PAID_MONTHLY_LIMIT: 100,000 input tokens
Stop at 90% of cap (BUDGET_CAP_BUFFER).
Pessimistic accounting: deduct BEFORE call, reconcile AFTER.
Clock manipulation defence: if stored monthYear > current → freeze.

**Generation windows — locked**
Window A: 00:00–11:59. Window B: 12:00–23:59.
Maximum ONE generation per window per insight type.
Maximum TWO total insight generations per user per day.

**Hard rules — locked**
NEVER send absolute monetary values to Claude API.
NEVER send raw transactions.
NEVER send UserFinancialProfile directly to Claude.
NEVER recommend specific assets by name.
NEVER guarantee outcomes.
NEVER use affiliate links.
NEVER fabricate sources.
NEVER send injection_detected to analytics.

---

## 8. USERFINANCIALPROFILE

**The intelligence spine — locked (20 March 2026)**
Built by userProfileService.ts. Stored in householdStore.financialProfile.
Everything reads from it. Never re-derive inline.

**Update chain — must fire on every data change**
```
addTransactions() / addHoldings() → buildUserFinancialProfile()
updateHolding() → same
setBucketOverride() → same
setProtection() → same
setRiskProfile() (if changed from default) → same
setOnboardingComplete() → same
setMonthlyTarget() → same
setFireInputs() → same
```

**Sophistication score — locked**
0–100. Five components. NEVER shown to user.
Drives: insight depth, prompt framing, discovery pass eligibility.
Components: vehicle diversity (0–25), liquidity balance (0–25),
protection coverage (0–20), investing consistency (0–15),
geographic spread (0–15).

**Portfolio tier hysteresis — locked**
Tier up: immediately when value crosses floor.
Tier down: only when 20% BELOW floor (prevents oscillation).
Floors: Tier 1 <€25k, Tier 2 €25k–€100k, Tier 3 €100k–€500k, Tier 4 >€500k.

---

## 9. TRIGGER CONDITIONS

**12 triggers T1–T12 — locked**
T1:  Growth bucket >10% below risk profile target
T2:  Single holding >15% of live portfolio
T3:  Employer stock >15% of live portfolio
T4:  No protection designation + cash holdings exist
T5:  Monthly invested < target × 0.8
T6:  INR weakened >3% vs EUR in rolling 90 days + India >20%
T7:  Vesting event within 30 days
T8:  Employer stock >10% AND salary from same employer
T9:  Locked >40% AND protection coverage <3 months
T10: Stability >30% + bond exposure + rising rate environment
T11: Portfolio tier 2+ AND cash-like >70% AND no equity held
T12: Illiquid/speculative >70% AND stability <15% AND protection <2mo

**18 triggers T13–T30 — locked (Session 14, VI-05)**
T13: India equity approaching 12-month STCG→LTCG boundary
T14: German crypto approaching 12-month tax-free threshold
T15: German investment property approaching 10-year tax-free threshold
T16: Sovereign Gold Bond approaching 8-year maturity (tax-free)
T17: ELSS lock-in expiring (3-year)
T18: Fixed Deposit approaching maturity date
T19: US holding approaching 12-month long-term capital gains threshold
T20: UK ISA headroom unused (within 90 days of April 5)
T21: India 80C headroom unused (within 60 days of March 31) — old regime only
T22: NL Box 3 peildatum approaching (within 60 days of January 1)
T23: US 401k employer match not captured
T24: UK pension employer match not captured
T25: India NPS employer contribution (80CCD(2)) — both regimes
T26: German Freistellungsauftrag not filed with broker
T27: PFIC warning — US person holding Indian/non-US mutual funds (priority: 95)
T28: NL Box 3 foreign assets included (since Jan 2025)
T29: UK FIG regime window active (first 4 years of UK residency)
T30: India new regime warning (80C investments but regime unknown or new)

---

## 10. ANALYTICS

**PostHog — locked**
Host: eu.posthog.com (EU data residency, GDPR compliant).
Project ID: 144615.
Key: phc_i9rgKR4VVPTBzHUL1jur68kdn7SvXovSOGubxUKHWJz (write-only, safe in client).
ANALYTICS_ENABLED = false — PM enables only after full checklist.

**User properties — locked**
All PostHog user properties come from UserFinancialProfile only.
updateUserProperties(profile) is the ONLY place properties are set.
Never call ph.register() with individual properties anywhere else.

**Anonymous identity — locked**
Anonymous distinct ID via crypto.randomUUID() on first launch.
Stored in storageService. Never tied to email or Google account.
Never regenerated — consistent across user sessions.

**Zero PII in any event — locked**
No amounts. No merchant names. No account numbers.
No email. No name. No device identifiers beyond anonymous UUID.
Category strings and enum values only.

**Events — locked (17 total)**
```
Loop 1 — Catalogue: instrument_tapped, instrument_added, instrument_skipped
Loop 2 — Spend: category_correction, layer1_promotion_candidate
Loop 3 — Insights: insight_viewed, insight_actioned, insight_dismissed,
          insight_generation_result, monthly_review_opened, monthly_review_section_read
Loop 4 — CSV: csv_uploaded
PM visibility: portfolio_tier_changed, milestone_reached, pm_snapshot_exported
General: screen_viewed, risk_profile_set, app_opened
```

**injection_detected — locked**
NEVER sent to analytics. Log locally only.

**source_discovered — locked as dropped**
Not actionable without domain/URL. Source review via snapshot export only.

---

## 11. PROFILES + HOUSEHOLD

**Profile types — locked**
OWNER: created household, full access.
PARTNER: V2 only (requires Supabase couple sync). Do not build in V1.
MANAGED: no login, administered by OWNER. Primary use: tracking parents' portfolio.

**Age field — locked**
Captured in onboarding screen 4. Optional.
Stored in encrypted Profile record.
Used ONLY for V2 FIRE engine. NOT used for any V1 logic.

**Household view — locked**
Joint transactions appear ONCE in household view.
Individual view: personal + joint for that profile, never partner's personal.

---

## 12. ONBOARDING

**11 screens — updated Session 14**
1. Welcome  2. Household  3. Location  3.5. Tax Profile (NEW — VI-08)
4. Age (skippable)  5. Teach [+]  6. First Add  7. First Payoff
8. Budget Suggestion (conditional — only if screen 6 upload succeeded)
9. Portfolio Teaser  10. Complete

**Tax Profile screen (3.5) — locked (Session 14)**
Captures: citizenships, tax residency country, US person flag, India tax regime.
Skippable — all fields default to 'unknown'. No triggers fire for 'unknown'.
Questions: investments in multiple countries? / tax residency? / citizenships? /
  US citizen or green card? / India tax regime (old/new/unsure)?

**First Add flow — locked**
Universal Add Sheet shown with isOnboarding=true.
Tooltip on bank statement option.
User can upload or skip.

---

## 13. SECURITY + ENCRYPTION

**V1 encryption — locked**
Hardware-backed OS encryption via expo-secure-store.
iOS Keychain / Android Keystore. Same protection level as banking apps.
Web preview: localStorage via secureStorageAdapter — NOT encrypted.
localStorage is acceptable for dev/preview only. Never ship to production web.

**V2 encryption (when Supabase added) — locked**
Key = hash(Google OAuth token + device-specific ID).
E2E encryption before data leaves device.
On logout: invalidate key → stored data becomes unreadable.
Row Level Security on all Supabase tables. Field-level KMS encryption.

**Biometric lock — locked**
Face ID (iOS) / Fingerprint (Android). PIN fallback.
Auto-lock after 5 minutes in background.

**GDPR / Data deletion — locked**
"Delete all my data" in Settings (Session 18).
Calls storageService.clear() + auditStore.clearAuditLog() + signs user out.
V2: also deletes server-side data.

---

## 14. FIRE

**V2 only — locked forever in V1**
No FIRE UI anywhere in V1. Foundation files exist — do not delete.

**Foundation files (do not delete)**
/constants/fireDefaults.ts — country inflation rates, SWR.
/types/fire.ts — FIREInputs, FIREOutputs, FIREAssumptions.
/components/invest/FIRETeaserCard.tsx — built, not rendered.

**fireIsSetUp in UserFinancialProfile**
true if FIRE inputs have been entered.
Affects monthly review (fireUpdate section null if false).
No FIRE insight generation in V1. FIRE_TRAJECTORY → not_implemented.

**FIRE formula (for when V2 builds it)**
FIRE number = targetMonthlySpend × 300 (4% safe withdrawal rate).
Inflation rates from fireDefaults.ts (NL: 3.0%, IN: 5.0%, GB/US: 3.0%, etc.).

---

## 15. FREEMIUM + FEATURE FLAGS

**All features unlocked in V1 — locked**
featureFlags.ts exists but no gates are enforced in V1.
When gates are added: benefit-led bottom sheet, NEVER error state.

---

## 16. VERSION SCOPE BOUNDARIES

**V1 (current build)**
Four tabs, ingestion pipeline (35 institutions, CSV/TXT/XLSX),
security pipeline, spend categoriser, AI insight engine,
UserFinancialProfile, Vehicle Intelligence Engine, analytics (disabled),
onboarding (11 screens including Tax Profile), settings stub,
single OWNER profile, BYOK API keys, local encrypted storage.

**V1b (after V1 stable)**
Couple sync (Supabase E2E). PARTNER profile activated.
API key moves to Supabase Edge Functions (one-line change).
Push notifications (opt-in). Server-side budget enforcement.

**V2**
FIRE planner screen, open banking, ML categorisation, full cross-border
tax computation (not just facts), historical portfolio charts, year-end wrapped,
conversational advisor, property market estimate, Supabase instrument catalogue
+ merchant keywords, partner spend on Home, contextual education tooltips.

**Never built (permanent boundaries)**
Physical assets, tax filing, money transfers, social features, ads,
affiliate links, generic market news feed, gamification, business finances,
buy/sell recommendations, regulated financial advice, property equity UI.

---

## 17. TECH STACK DECISIONS

**Framework decisions — locked**
React Native + Expo SDK 55. TypeScript strict mode. Expo Router.
Zustand with secureStorageAdapter for persistence.
createJSONStorage() pattern (Zustand v5 compatibility).

**Banned in web builds — locked**
react-native-reanimated (breaks web bundler). Restore for native in Session 19.
Intl.NumberFormat (unreliable in Expo web bundler). Use formatCurrency() always.

**Banned everywhere — locked**
@/ import alias. Named exports from component files (default exports only).
Inline style objects (StyleSheet.create() always).
AsyncStorage directly. Raw SecureStore calls outside storageService.ts.
Services imported directly into components.
EXCEPTION: CSVUploadSheet may import ingestFile() from /services/ingestion.

**Ingestion pipeline — locked**
Papa Parse for CSV/TXT. SheetJS for XLSX/XLS.
ingestFile() from /services/ingestion is the SINGLE entry point.
csvParser.ts is a shim — do not add logic to it. Remove in Session 18.

**Model — locked**
claude-haiku-4-5-20251001 for all V1 insight types.
All API calls in aiInsightService.ts. Key from storageService, never bundled.

**npm flag — locked**
--legacy-peer-deps on every npm install. No exceptions.

---

## 18. GIT + WORKFLOW

**Commit format** — [TICKET-ID] Brief description.
**Every commit** includes code + updated MD files together. Never separately.
**Git always** run manually by Anand. Never through Claude Code.
**MD files** always downloaded and replaced in full. Never edited inline.
**Preview** before every commit. Never commit without visual verification.
**API keys** never in commits. (PostHog write-only key is safe in client code.)

---

## 19. VEHICLE INTELLIGENCE ENGINE — LOCKED (Session 14, 27 April 2026)

Vehicle Intelligence is the core cross-border product differentiator.
It surfaces factual, deadline-aware, market-specific investment context for
every holding, based on the user's citizenship, tax residency, and asset location.
No other personal finance app does this for globally mobile professionals.

**Source of truth**

Six reference documents in project root (annually reviewed):
vehicle-rules-IN/GB/NL/US/DE/XBORDER.md — double self-confirmed per market.
VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md — master checklist, due April every year.

constants/vehicleRules.ts — TypeScript implementation of those documents.
The ONLY place investment vehicle facts live in code. Never hardcode elsewhere.

**Locked data model decisions**

citizenships: string[] — required on UserFinancialProfile.
  US citizenship = worldwide US taxation regardless of residence.
  Indian citizenship = NRI status rules, PPF/SCSS/NSC restrictions.

isUSPerson: boolean — required. US citizen or green card holder.
  Drives: PFIC rules, worldwide US income tax, ISA non-recognition.

taxResidencyCountry: string — required.
  Which country's domestic rules apply (Box 3, CGT, income tax bands).
  Different from citizenship. Indian citizen + Dutch tax resident = NL rules primary.

incomePrimaryCountry: string — required.
  Determines pension access (401k, employer pension, NPS employer contribution).

purchaseDate: Date — required on every PortfolioHolding (was optional).
  Entire holding period engine depends on it.
  For historical imports without date: purchaseDateKnown = false.
  NEVER fire holding period alerts when purchaseDateKnown = false.

countryOfAsset: string — required on every PortfolioHolding.
  Determines Box 3 inclusion, PFIC risk, DTAA relevance.
  'IN' | 'NL' | 'GB' | 'US' | 'DE' | 'other' | 'unknown'

isInsideTaxWrapper: boolean — required on every PortfolioHolding.
  ISA-wrapped = no Box 3. US 401k = excluded from Dutch Box 3.
  Wrappers completely change cross-border treatment.

**How vehicleRules.ts enters the insight engine**

vehicleRules.ts is NEVER sent directly to Claude.
It feeds the engine through four channels:
1. insightTriggers.ts — when to fire (T13-T30)
2. holdingsContextBuilder.ts — what structured context to send Claude
3. insightSources.ts — which seed sources to search
4. educationCatalogue.ts — which articles to surface

Claude receives sanitised, structured context — never raw rules.

**The 'unknown' and 'other' rule**

Every classification field must have an 'unknown' or 'other' path.
No enum, map, or lookup may return undefined or throw for unrecognised input.
getVehicleCategory() returns 'unknown' for unrecognised subtypes. Never throws.
No trigger fires when relevant classification is 'unknown'.

**Vehicle Intelligence engineering rules — locked**

RULE V1: Never compute tax liability.
  Surface facts only. Never say "you owe X in tax".
  Correct: "STCG rate is 20% for equity held under 12 months in India."
  Wrong: "You would pay approximately ₹15,000 on this gain."

RULE V2: Cross-border insights always carry a caveat.
  Any insight involving two countries must include:
  "Cross-border tax is complex — verify with a qualified advisor."

RULE V3: purchaseDate required. purchaseDateKnown = false when unknown.
  NEVER fire holding period alerts when purchaseDateKnown = false.

RULE V4: Citizenship drives logic, not residency alone.
  US person in Amsterdam: US worldwide tax STILL applies.
  Never assume single-country rules for US persons.

RULE V5: Unknown India regime = no 80C triggers.
  If indiaTaxRegime = 'unknown', never fire T21. Fire T30 instead.

RULE V6: vehicleRules.ts is the single source of truth for all vehicle facts.
  Never hardcode vehicle-specific facts in components, hooks, prompts, or triggers.

RULE V7: Annual review is mandatory every April.
  VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md must be completed and committed.
  Stale tax rules are worse than no rules.
  Commit format: [ANNUAL] Vehicle Intelligence review — all figures verified April XXXX.

RULE V8: Every enum and classification map must have 'unknown' or 'other'.
  Applies to: VehicleCategory, TaxWrapperType, HoldingPeriodStatus,
  TaxWrapperTaxType, taxResidencyCountry, countryOfAsset, citizenships, usState.

**Known V1 limitations (by design — not bugs)**

PFIC computation: flags risk, does not compute Form 8621 liability.
US state taxes: CA, NY, TX, FL, WA covered. Other states: 'check your state'.
India RNOR: captured, complex rules not fully surfaced in V1.
UK domicile: captured, IHT computation not done in V1.
Dual residency: secondary country captured, interaction not computed in V1.
German church tax: flag present, not added to displayed rate in V1.
Cross-border pension transfer: flagged, specific rules not surfaced.
Actual tax computation: deliberately excluded from all of V1 and V1b.
