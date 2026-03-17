# Kāshe — CLAUDE-state.md
*Current build state. Read this before any new session.*
*Last updated: 17 March 2026 — Session 09 complete.
Instrument catalogue type system rebuilt. Universal AppHeader locked.
Living database architecture decided. KasheScore introduced.
Spend categorisation Layer 1/2/3 architecture decided.*

---

## HOW TO USE THIS DOCUMENT

Before starting any session:
1. Read this file first
2. Read CLAUDE.md
3. Read the latest kashe-handoff-session-XX.md
4. Read engineering-rules.md
5. Read design-system.md for any UI work
6. Then and only then: write the Claude Code prompt

## HOW WE WORK — THE EXACT LOOP

1. Write the Claude Code prompt in the planning chat (Claude.ai)
2. Paste into Claude Code in terminal → runs → preview at localhost:8081
3. Screenshot shared back in planning chat → verified together
4. Planning chat provides exact git commands → Anand commits

MD files are downloaded and replaced in full in the repo.
Never edited inline. Every commit includes code + updated MD files.
Git commands always run manually by Anand. Never through Claude Code.

---

## SESSIONS COMPLETE

### Session 01 — Design System + Home Screen (Part 1)
✅ Environment setup (Node v25.6.1, npm 11.9.0, Claude Code)
✅ Expo SDK 55 + Expo Router + 4-tab navigation
✅ Fonts: Space Grotesk (700, 600, 400) + Inter (500, 400)
✅ Dark/light mode via ThemeContext
✅ /constants/colours.ts — all tokens, both modes, hero tokens
✅ /constants/typography.ts — 8 type styles
✅ /constants/spacing.ts — 4px grid + borderRadius
✅ /constants/mockData.ts
✅ /components/ui/Typography.tsx, Card.tsx, Button.tsx
✅ /components/shared/KasheAsterisk.tsx
✅ /components/shared/MacronRule.tsx
✅ /components/shared/RedactedNumber.tsx
✅ /components/shared/EmptyState.tsx
✅ /components/home/ — all home components

### Session 02 — Home Screen (Complete)
✅ Fonts locked: Space Grotesk + Inter (Syne/DM Sans retired)
✅ ThemeContext pattern introduced and locked
✅ /components/home/SegregationToggle.tsx
✅ /components/home/MonthlyReviewLink.tsx
✅ /components/home/SpendStoryCard.tsx
✅ /components/shared/AppHeader.tsx
✅ /context/ThemeContext.tsx
✅ react-native-svg, expo-linear-gradient installed

### Session 03 — Spend Screen (Complete)
✅ /types/spend.ts
✅ /hooks/useDataSources.ts
✅ All spend components
✅ /app/spend/[category].tsx
✅ /app/(tabs)/spend.tsx — complete

### Session 04 — Portfolio (PORT-01 through PORT-03)
✅ /types/portfolio.ts — two-layer type system + DEFAULT_BUCKET
✅ /constants/mockData.ts — portfolio mock data added
✅ /components/portfolio/PortfolioTotalsCard.tsx
✅ /components/portfolio/PortfolioSectionHeader.tsx
✅ /components/portfolio/PortfolioHoldingRow.tsx

### Session 05 — Portfolio (PORT-06 through PORT-09)
✅ /components/portfolio/PortfolioInsightStrip.tsx
✅ /components/portfolio/InvestmentPlanCard.tsx
✅ /constants/formatters.ts — formatCurrency()
✅ /components/portfolio/InstrumentSuggestionSheet.tsx
✅ /components/portfolio/BucketReassignSheet.tsx

### Session 06 — Portfolio (PORT-10 basic)
✅ /components/portfolio/LockedProjectionCard.tsx
✅ /components/portfolio/ProtectionStatusCard.tsx
✅ /app/portfolio/[holdingId].tsx — basic version

### Session 07 — Colour Audit + PORT-10b + Visual Standardisation
✅ TASK 0: insights.tsx → invest.tsx, _layout.tsx updated
✅ Full colour audit — all components now use theme tokens correctly
✅ /constants/displayLabels.ts — PORT-10b Fix 1
✅ /components/portfolio/HoldingPriceChart.tsx — PORT-10b Fix 2
✅ /components/portfolio/HoldingInsightCard.tsx — PORT-10b Fix 3
✅ /app/portfolio/[holdingId].tsx — PORT-10b Fix 4
✅ Visual standardisation pass complete

### Session 08 — PORT-11 + Mock Data Overhaul + Invest shell
✅ PORT-11: Portfolio empty state
✅ Mock data overhaul — geography-neutral holdings
✅ Tab 4 confirmed as Invest
✅ /app/(tabs)/invest.tsx — shell only

### Session 09 — INV-01 + Catalogue Type System + Universal Header
✅ /types/riskProfile.ts — RiskProfileType + RISK_PROFILES constants
✅ /components/invest/RiskProfileCard.tsx — two states
   STATE 1: "What kind of investor are you?" + Balanced recommendation
   STATE 2: Set profile showing label + description + allocation pills
✅ /components/invest/RiskProfileSheet.tsx — three-option picker
✅ /types/instrumentCatalogue.ts — FULL type system rebuild
   RegulatoryRegime, AccountWrapper, InstrumentType — three distinct concepts
   GeographyCode, RiskTier, LiquidityHorizon, PlatformName
   CatalogueRole (suggest / track_only / educational)
   InstrumentCatalogueEntry — complete interface
   TRACK_ONLY_TYPES, HIGH_RISK_TYPES constants
✅ /constants/instrumentCatalogue.ts — ~40 curated entries
   Coverage: NL/BE/DE/LU, India, US, UK, GLOBAL fallback
   track_only: Crowdcube, Seedrs, Bitcoin
   suggest: ETFs, index funds, pensions, govt schemes
   Helpers: getInstrumentsForGeography(), getSuggestableInstruments(),
            getInstrumentsByTierAndBucket(), isKnownGeography()
   TER_FOOTNOTE and UNKNOWN_GEOGRAPHY_MESSAGE constants
✅ /components/shared/AppHeader.tsx — UNIVERSAL header
   Replaces all inline tab headers
   Props: title, showAvatar, avatarInitial, showOverflow, showAdd
   Used in: index.tsx, spend.tsx, portfolio.tsx, invest.tsx
✅ invest.tsx — Invest header added, STATE 1 copy updated

---

## CONFIRMED FILE TREE (as of Session 09)

```
app/
  (tabs)/
    _layout.tsx           ✅
    index.tsx             ✅ Home (complete)
    spend.tsx             ✅ Spend (complete)
    portfolio.tsx         ✅ PORT-01 through PORT-10b + PORT-11
    invest.tsx            🔄 INV-01 done, INV-02 through INV-08 pending

  _layout.tsx             ✅
  spend/
    [category].tsx        ✅
  portfolio/
    [holdingId].tsx       ✅ PORT-10b complete
  invest/
    fire.tsx              ⬜ Session 10

components/
  home/                   ✅ All complete
  shared/
    AppHeader.tsx         ✅ Universal — used by all four tabs
    KasheAsterisk.tsx     ✅ ⚠️ k-stroke prominence — Polish session
    MacronRule.tsx        ✅
    RedactedNumber.tsx    ✅
    EmptyState.tsx        ✅
  spend/                  ✅ All complete
  portfolio/
    PortfolioTotalsCard.tsx        ✅
    PortfolioSectionHeader.tsx     ✅
    PortfolioHoldingRow.tsx        ✅
    PortfolioInsightStrip.tsx      ✅
    InvestmentPlanCard.tsx         ✅
    InstrumentSuggestionSheet.tsx  ✅
    BucketReassignSheet.tsx        ✅
    LockedProjectionCard.tsx       ✅
    ProtectionStatusCard.tsx       ✅
    HoldingPriceChart.tsx          ✅
    HoldingInsightCard.tsx         ✅
  invest/
    RiskProfileCard.tsx   ✅ INV-01
    RiskProfileSheet.tsx  ✅ INV-01
    InvestmentPlanFull.tsx        ⬜ INV-02
    MonthlyReviewCard.tsx         ⬜ INV-03
    MonthlyReviewSheet.tsx        ⬜ INV-03
    FIRETeaserCard.tsx            ⬜ INV-04
    InstrumentDiscoverySection.tsx ⬜ INV-05
    FinancialEducationSection.tsx  ⬜ INV-06
  ui/                     ✅ All complete

constants/
  colours.ts              ✅ audited + fixed Session 07
  formatters.ts           ✅
  displayLabels.ts        ✅
  mockData.ts             ✅
  spacing.ts              ✅
  typography.ts           ✅
  instrumentCatalogue.ts  ✅ Session 09 — ~40 entries, 6 geographies
  fireDefaults.ts         ⬜ Session 10

types/
  spend.ts                ✅
  portfolio.ts            ✅
  riskProfile.ts          ✅ Session 09
  instrumentCatalogue.ts  ✅ Session 09 — full type system
  fire.ts                 ⬜ Session 10

docs/                     ✅ Updated 17 March 2026
```

---

## LOCKED ARCHITECTURE PRINCIPLES

### ThemeContext Pattern
- useColorScheme() ONLY in context/ThemeContext.tsx
- const theme = useTheme() — never destructured
- theme.* for surface/border/background/text
- colours.* for all static tokens (accent, danger, warning, hero tokens)
- No raw hex in any component. Ever.

### Hero Card Pattern (LOCKED 17 March 2026)
- Always dark gradient regardless of system mode
- LinearGradient: heroGradientStart → heroGradientEnd
- borderRadius 24, overflow hidden, padding 24
- KasheAsterisk watermark: position absolute, top -45, right -45,
  size 200×200, opacity 0.07, all strokes colours.accent
  strokeWidth 14, animated=false, pointerEvents none
- All text inside: colours.hero* tokens only. Never theme.*

### Standard Card Pattern (LOCKED 17 March 2026)
- backgroundColor: theme.surface
- borderRadius: 16
- No border (surface on background provides sufficient separation)
- Internal padding: match SpendCategoryRow/SpendInsightStrip exactly

### Screen Layout (LOCKED 17 March 2026)
- ScrollView contentContainerStyle:
  paddingHorizontal 20, paddingTop 16, paddingBottom 48
- Gap between cards: marginTop 16
- Gap before section headers: marginTop 32
- MacronRule between major sections: marginTop 24
- Reference: spend.tsx — match exactly

### Universal Header (LOCKED 17 March 2026)
- /components/shared/AppHeader.tsx used by ALL four tabs
- Props: title, showAvatar, avatarInitial, showOverflow, showAdd
- No inline header code in any tab file
- Avatar: acid green circle, 40×40, SpaceGrotesk_600SemiBold initial
- Overflow: dark surface circle with notification dot (warning)
- Add button: acid green circle, 36×36, + sign

### Import Paths
- Relative imports only. No @/ alias. Ever.

### Export + Styling
- Default exports everywhere
- StyleSheet.create() always — no inline style objects

### Currency Formatting
- formatCurrency(amount, currency) from /constants/formatters.ts
- Intl.NumberFormat — permanently banned
- Template literals with raw numbers — never

### Animation
- React Native Animated API only
- react-native-reanimated — banned from web builds

---

## INSTRUMENT CATALOGUE ARCHITECTURE (LOCKED 17 March 2026)

### Type System — Three Distinct Concepts
```
RegulatoryRegime  The legal framework the instrument is issued under
                  UCITS / SEBI / SEC / FCA / BaFin / AFM / FSMA /
                  RBI / EPFO / PFRDA / MoF_IN / exchange_listed /
                  unregulated / other / unknown

AccountWrapper    The tax/account structure it can sit inside
                  ISA / LISA / SIPP / Roth_IRA / 401k / PPF / EPF /
                  NPS / ELSS / NRE / NRO / FCNR / Pension_NL / bAV_DE /
                  Pensioensparen_BE / taxable / other / unknown
                  (full list in /types/instrumentCatalogue.ts)

InstrumentType    What the instrument actually is
                  etf / index_fund / active_mutual_fund / bond_etf /
                  direct_equity / fractional_equity / employer_rsu /
                  equity_crowdfunding / govt_savings_scheme /
                  pension_scheme / crypto_spot / p2p_lending /
                  other / unknown
                  (full list in /types/instrumentCatalogue.ts)
```

### CatalogueRole — Critical Distinction
```
suggest      → shown in InstrumentDiscoverySection
track_only   → recordable in portfolio, NEVER suggested
educational  → shown in FinancialEducationSection only

TRACK_ONLY forever:
  equity_crowdfunding, angel_investment, venture_fund,
  private_equity, nft, stock_options, futures,
  structured_product, employer_rsu, employer_espp,
  crypto_spot (track only — never suggest crypto)
```

### KasheScore (0–100) — Internal Quality Score
Built from objective criteria. Never shown to user as a number.
Drives ordering within a tier — best score shown first.
Updated quarterly via Supabase dashboard.

```
Cost efficiency       25pts  TER relative to category peers
Diversification       25pts  Holdings count + index breadth
Liquidity/access      20pts  AUM proxy, platform count, settlement
Regulatory strength   15pts  UCITS/SEBI/SEC=15, unregulated=0
Track record          15pts  Inception date depth
```

### Geography Coverage
```
NL / BE / DE / LU    EU residents — DeGiro, IBKR, Trade Republic,
                     Scalable Capital, Bolero, Comdirect, DKB
IN                   Zerodha, Groww, Kuvera, MFCentral, INDmoney
US                   Fidelity, Vanguard, Schwab, IBKR US
GB                   Vanguard UK, HL, AJ Bell, InvestEngine, Freetrade
GLOBAL               IBKR International — fallback for unknown geographies
```

### Unknown Geography Flow
When user's residence country is not in catalogue:
  Show GLOBAL entries (VWCE + AGGH via IBKR)
  Message: UNKNOWN_GEOGRAPHY_MESSAGE constant
  "We're building your region's instrument list.
   Here's what works globally while we do."

### Living Database — V1 → V2 Migration Path
```
V1:  /constants/instrumentCatalogue.ts (static seed, offline fallback)
V2:  Supabase table instrument_catalogue (identical schema)
     catalogueService.ts fetches from Supabase, falls back to static
     Supabase Realtime pushes updates to all users instantly
     No app release required for catalogue updates
```

---

## SPEND CATEGORISATION ARCHITECTURE (LOCKED 17 March 2026)

Three-layer system — each layer improves the next:

```
LAYER 1 — Keyword rules (fast, free, offline)
  /constants/merchantKeywords.ts (geography-aware)
  NL rules, IN rules, US rules, GB rules
  Updated via Supabase → all users benefit immediately
  MerchantConfidence: 1.0

LAYER 2 — Claude API enrichment (unrecognised merchants only)
  Triggered only when Layer 1 fails to match
  Cost: ~€0.001 per unrecognised transaction
  Result cached permanently in merchantOverrides
  That merchant never sent to API again
  MerchantConfidence: 0.8

LAYER 3 — User correction (highest signal)
  User recategorises → MerchantOverride saved
  PostHog: category_corrected event
  Monthly review: corrections appearing 5+ times →
    promoted to Layer 1 keyword rules
  MerchantConfidence: 1.0
```

---

## LEARNING LOOPS (LOCKED 17 March 2026)

Four distinct loops — not behaviour-only, inherent quality baked in:

```
LOOP 1 — Catalogue freshness
  KasheScore updated quarterly by PM
  TER changes auto-flagged by Supabase Edge Function (weekly)
  review_queue table in Supabase — PM reviews weekly (15 min)
  Supabase Realtime → all users get updates without app release

LOOP 2 — Spend category accuracy
  Layer 1 keywords promoted from Layer 3 user corrections
  PostHog: category_corrected events reviewed monthly
  Merchant keyword updates pushed via Supabase

LOOP 3 — AI insight quality
  PostHog: insight_viewed / insight_actioned / insight_dismissed
  Monthly review: dismiss rate by insight type
  High dismiss rate → tighten trigger threshold or prompt
  NOT just dismissal — actioned / time_visible also tracked

LOOP 4 — Instrument discovery signal
  PostHog: instrument_tapped / instrument_added / instrument_skipped
  Monthly review: tap rate + add rate per instrument
  High tap + low add → description needs work
  High add rate → consider bumping tier
  This supplements KasheScore — never replaces it
```

---

## LOCKED DECISIONS (do not re-debate)

### Tab Structure (16 March 2026 — LOCKED)
Four tabs: Home / Spend / Portfolio / Invest
No standalone Insights tab. AI insights live on native screens.

### Universal AppHeader (17 March 2026 — LOCKED)
/components/shared/AppHeader.tsx used by ALL four tabs.
No inline header code in any tab screen file.

### Risk Profile (16 March 2026 — LOCKED)
Three levels: Conservative / Balanced / Growth
Default: Balanced — RECOMMENDED not silently assumed
STATE 1 shows: "Most people in your situation start with Balanced."
Never pre-select without showing the question.

### Instrument Catalogue Type System (17 March 2026 — LOCKED)
Three distinct concepts: RegulatoryRegime + AccountWrapper + InstrumentType
Every union type ends with 'other' | 'unknown' — nothing unclassifiable
CatalogueRole: suggest / track_only / educational
TRACK_ONLY_TYPES never appear in suggestions — ever
KasheScore: objective quality score, drives ordering, never shown to user

### Living Database Architecture (17 March 2026 — LOCKED)
V1: static file = seed + offline fallback
V2: Supabase table = live source, identical schema
catalogueService.ts: tries Supabase first, falls back to static
review_queue: Supabase table, PM reviews weekly

### Spend Categorisation (17 March 2026 — LOCKED)
Layer 1 (keywords) → Layer 2 (Claude API) → Layer 3 (user correction)
Layer 3 corrections promoted to Layer 1 after 5+ occurrences
MerchantConfidence score: 1.0 / 0.8 / 1.0

### Visual Standardisation (17 March 2026 — LOCKED)
Hero card pattern, standard card pattern, screen layout locked.
Detail screen pattern locked.

### FIRE is Optional
Entry from Invest tab via single low-pressure row.
Route: /app/invest/fire.tsx

### Empty State Pattern
Ghost at 0.5 opacity. RedactedNumber. Floating accent pill. NOT blur.

---

## KNOWN BUG REGISTRY

### 🔴 Fix before beta
1. Hero number wrapping: €123,500 splits across two lines
   in PortfolioTotalsCard two-column layout.
   Fix: reduce hero font size to fit column width. Polish session.

2. GROWTH section total (€102,400) may be inflated.
   Verify when data layer is wired. Data layer session.

3. Dutch brand names in Spend mock data:
   Albert Heijn/Jumbo → "Supermarket" etc.
   Fix: before data layer session.

### 🟡 Polish session
4. Chart spike at end of 1M view — mock random walk issue
5. KasheAsterisk watermark alignment minor offset
6. KasheAsterisk k-stroke needs more visual prominence
7. Vertical MacronRule in TotalsCard (plain View)
8. TextInput monthly target not currency-formatted
9. Category detail screen gap between month selector and tag pills

### 🟢 Deferred by design
10. Dark mode not yet device-verified (web preview limitation)
11. react-native-reanimated returns for native QA session
12. Price chart shows mock data — real feed in data layer

---

## REMAINING BUILD ORDER

```
Session 10  Invest Tab — INV-02 through INV-08
              INV-02: InvestmentPlanFull
              INV-03: MonthlyReviewCard + MonthlyReviewSheet
              INV-04: FIRETeaserCard
              INV-05: InstrumentDiscoverySection
              INV-06: FinancialEducationSection
              INV-07: Wire invest.tsx
              INV-08: Invest tab empty state

Session 11  FIRE Planner screen
              /app/invest/fire.tsx
              FIREHouseholdToggle, FIRESliderHero,
              FIREInputsCard, FIREAssumptionsCard,
              FIREProfileSelector
              /constants/fireDefaults.ts

Session 12  Data Layer (no UI)
              All services and stores
              catalogueService.ts — Supabase + static fallback
              spendCategoriser.ts — Layer 1/2/3 architecture
              merchantKeywords.ts — geography-aware keyword rules
              PostHog event instrumentation — four learning loops

Session 13  Wire UI to Data Layer
              Real CSV data flows — first real test

Session 14  Onboarding (10 screens + UniversalAddSheet)

Session 15  Sources Screen

Session 16  Settings + Polish

Session 17  QA + Native Build Prep

--- YOUR OWN TESTING ---
--- 10 FRIENDS BETA ---
--- INVESTOR READY ---
```

---

## CRITICAL RULES — QUICK REFERENCE

1.  --legacy-peer-deps every npm install
2.  Never react-native-reanimated (web builds)
3.  const theme = useTheme() — never destructured
4.  theme.* surface/border/background/text. colours.* static tokens.
5.  StyleSheet.create() always. No inline styles.
6.  formatCurrency() always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero any.
9.  Space Grotesk numbers/display. Inter body/UI.
10. Hero card always dark — both modes. Hero tokens inside only.
11. Standard card: theme.surface, borderRadius 16, no border.
12. Screen layout: paddingH 20, paddingTop 16, paddingBottom 48.
    Card gap: marginTop 16. Section header gap: marginTop 32.
    MacronRule between major sections: marginTop 24.
13. Detail screens: light bg, dark hero at top.
14. Hero watermark: KasheAsterisk absolute top -45 right -45,
    200×200, opacity 0.07, overflow hidden on parent.
15. Universal AppHeader on every tab — never inline header code.
16. Empty state = 0.5 opacity ghost + floating accent pill.
17. Every commit = code + updated MD files together.
18. Git always manually. MD files replaced in full.
19. Never show raw subtype keys — use displayLabels.ts.
20. No standalone Insights tab. Tab 4 is Invest.
21. Risk profile drives all allocation targets. Never hardcoded.
22. Instrument suggestions: "worth exploring" framing only.
    Never buy/sell. Never affiliate links.
23. CatalogueRole: track_only instruments never suggested. Ever.
24. KasheScore drives tier ordering — objective, not behaviour-based.
25. Spend categorisation: Layer 1 → Layer 2 → Layer 3 pipeline.
26. Default risk profile: RECOMMEND Balanced, never silently assume.
