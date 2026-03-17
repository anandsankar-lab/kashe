# Kāshe — CLAUDE-state.md
*Current build state. Read this before any new session.*
*Last updated: 17 March 2026 — Session 10 complete.
INV-02 through INV-05 done. Monthly Review redesigned as executive brief.
Copy tightening across Invest tab. FIRE copy locked.
INV-06 through INV-08 + FIRE planner remain for Session 11.*

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
✅ /components/shared/AppHeader.tsx (initial)
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
✅ insights.tsx → invest.tsx, _layout.tsx updated
✅ Full colour audit — all components use theme tokens correctly
✅ /constants/displayLabels.ts
✅ /components/portfolio/HoldingPriceChart.tsx
✅ /components/portfolio/HoldingInsightCard.tsx
✅ /app/portfolio/[holdingId].tsx — PORT-10b complete
✅ Visual standardisation pass complete

### Session 08 — PORT-11 + Mock Data Overhaul + Invest shell
✅ PORT-11: Portfolio empty state
✅ Mock data overhaul — geography-neutral holdings
✅ Tab 4 confirmed as Invest, invest.tsx shell created

### Session 09 — INV-01 + Catalogue Type System + Universal Header
✅ /types/riskProfile.ts — RiskProfileType + RISK_PROFILES
✅ /components/invest/RiskProfileCard.tsx — two states
✅ /components/invest/RiskProfileSheet.tsx — three-option picker
✅ /types/instrumentCatalogue.ts — full type system
   RegulatoryRegime + AccountWrapper + InstrumentType (three concepts)
   CatalogueRole, KasheScore, riskTier, liquidityHorizon
   TRACK_ONLY_TYPES, HIGH_RISK_TYPES
✅ /constants/instrumentCatalogue.ts — ~40 curated entries
   NL/BE/DE/LU, India, US, UK, GLOBAL fallback
   Helper functions for geography/tier/bucket filtering
✅ /components/shared/AppHeader.tsx — rebuilt as universal
   All four tabs. No inline header code anywhere.

### Session 10 — INV-02 through INV-05 + Copy Tightening
✅ /components/invest/InvestmentPlanFull.tsx — INV-02
   Always-expanded, risk-profile-driven targets
   Progress fraction (€920/€900), "Explore →" CTA

✅ /components/invest/MonthlyReviewCard.tsx — INV-03
   Four states. "March review ready" + "Read now →"
   Accent left border on STATE 1

✅ /components/invest/MonthlyReviewSheet.tsx — INV-03 REDESIGN
   Executive brief, four storytelling levels:
   L1: Hero stat + SVG sparkline (acid green, animated)
   L2: Animated allocation bars per bucket
   L3: Priority action card with accent left border
   L4: FIRE year large + "On track" pill + watchlist
   System-responsive dark/light mode (intentional)

✅ /components/invest/FIRETeaserCard.tsx — INV-04
   "When could you choose not to work?" — freedom framing
   STATE 2: animated progress bar + 2036 large

✅ /components/invest/InstrumentDiscoverySection.tsx — INV-05
   Reads live from /constants/instrumentCatalogue.ts
   Derives underfunded bucket, user tier, geography
   Up to 3 suggestions, KasheAsterisk on "why" text
   Risk tier pill colour-coded, TER footnote, numberOfLines={2}

✅ Invest tab copy tightening — all components updated

---

## CONFIRMED FILE TREE (as of Session 10)

```
app/
  (tabs)/
    _layout.tsx           ✅
    index.tsx             ✅ Home (complete)
    spend.tsx             ✅ Spend (complete)
    portfolio.tsx         ✅ All portfolio tickets complete
    invest.tsx            🔄 INV-01 through INV-05 done
                             INV-06, INV-07, INV-08 pending
  _layout.tsx             ✅
  spend/
    [category].tsx        ✅
  portfolio/
    [holdingId].tsx       ✅ PORT-10b complete
  invest/
    fire.tsx              ⬜ Session 11

components/
  home/                   ✅ All complete
  shared/
    AppHeader.tsx         ✅ Universal — all four tabs
    KasheAsterisk.tsx     ✅ ⚠️ k-stroke — Polish session
    MacronRule.tsx        ✅
    RedactedNumber.tsx    ✅
    EmptyState.tsx        ✅
  spend/                  ✅ All complete
  portfolio/              ✅ All complete
  invest/
    RiskProfileCard.tsx            ✅ INV-01
    RiskProfileSheet.tsx           ✅ INV-01
    InvestmentPlanFull.tsx         ✅ INV-02
    MonthlyReviewCard.tsx          ✅ INV-03
    MonthlyReviewSheet.tsx         ✅ INV-03 executive brief
    FIRETeaserCard.tsx             ✅ INV-04
    InstrumentDiscoverySection.tsx ✅ INV-05
    FinancialEducationSection.tsx  ⬜ INV-06
  ui/                     ✅ All complete

constants/
  colours.ts              ✅
  formatters.ts           ✅
  displayLabels.ts        ✅
  mockData.ts             ✅
  spacing.ts              ✅
  typography.ts           ✅
  instrumentCatalogue.ts  ✅ ~40 entries, 6 geographies
  fireDefaults.ts         ⬜ Session 11

types/
  spend.ts                ✅
  portfolio.ts            ✅
  riskProfile.ts          ✅
  instrumentCatalogue.ts  ✅ full type system
  fire.ts                 ⬜ Session 11
```

---

## LOCKED ARCHITECTURE PRINCIPLES

### ThemeContext Pattern
- useColorScheme() ONLY in context/ThemeContext.tsx
- const theme = useTheme() — never destructured
- theme.* for surface/border/background/text
- colours.* for all static tokens
- No raw hex in any component. Ever.

### Hero Card Pattern (LOCKED 17 March 2026)
- Always dark gradient regardless of system mode
- LinearGradient: heroGradientStart → heroGradientEnd
- borderRadius 24, overflow hidden, padding 24
- KasheAsterisk watermark: top -45, right -45, 200×200, opacity 0.07

### Standard Card Pattern (LOCKED 17 March 2026)
- backgroundColor: theme.surface, borderRadius 16, no border

### Screen Layout (LOCKED 17 March 2026)
- paddingHorizontal 20, paddingTop 16, paddingBottom 48
- Card gap: marginTop 16
- MacronRule between major sections: marginTop 24

### Universal Header (LOCKED 17 March 2026)
- AppHeader.tsx — all four tabs. No inline header code.

### Monthly Review (LOCKED 17 March 2026)
- Executive brief format. Four levels. System-responsive.
- SVG sparkline, animated bars, priority card, FIRE + watchlist.
- Never revert to text document.

### Invest Tab Copy (LOCKED 17 March 2026)
- Visuals do the work. No verbose paragraphs.
- KasheAsterisk punctuates AI insights.
- Fraction format for progress (€920/€1,500).
- FIRE: "choose not to work" — freedom framing.
- "Worth exploring" always. Never buy/sell.

### Import Paths
- Relative only. No @/ alias.

### Export + Styling
- Default exports. StyleSheet.create() always.

### Currency Formatting
- formatCurrency() always. Intl.NumberFormat banned.

### Animation
- React Native Animated API only.
- react-native-reanimated — banned from web builds.

---

## INSTRUMENT CATALOGUE ARCHITECTURE (LOCKED 17 March 2026)

### Three Concepts
```
RegulatoryRegime  Legal framework — UCITS/SEBI/SEC/FCA/BaFin/
                  AFM/FSMA/RBI/EPFO/PFRDA/MoF_IN/
                  exchange_listed/unregulated/other/unknown

AccountWrapper    Tax structure — ISA/LISA/SIPP/Roth_IRA/401k/
                  PPF/EPF/NPS/ELSS/NRE/NRO/FCNR/Pension_NL/
                  bAV_DE/Pensioensparen_BE/taxable/other/unknown

InstrumentType    What it is — etf/index_fund/active_mutual_fund/
                  bond_etf/direct_equity/fractional_equity/
                  equity_crowdfunding/govt_savings_scheme/
                  pension_scheme/crypto_spot/p2p_lending/
                  other/unknown
```

### CatalogueRole
```
suggest      → InstrumentDiscoverySection
track_only   → portfolio only, never suggested
educational  → FinancialEducationSection only

TRACK_ONLY forever: equity_crowdfunding, angel_investment,
  venture_fund, private_equity, nft, stock_options, futures,
  structured_product, employer_rsu, employer_espp, crypto_spot
```

### KasheScore (0–100)
Objective quality score. Never shown to user.
Drives ordering within tier. PM updates quarterly via Supabase.
Components: cost (25) + diversification (25) + liquidity (20)
            + regulatory (15) + track record (15)

### Geography
```
NL/BE/DE/LU   DeGiro, IBKR, Trade Republic, Scalable, Bolero
IN            Zerodha, Groww, Kuvera, MFCentral, INDmoney
US            Fidelity, Vanguard, Schwab, IBKR US
GB            Vanguard UK, HL, AJ Bell, InvestEngine, Freetrade
GLOBAL        IBKR International — fallback
```

### V1 → V2
```
V1: /constants/instrumentCatalogue.ts — seed + offline fallback
V2: Supabase table instrument_catalogue (identical schema)
    Realtime pushes — no app release needed
```

---

## SPEND CATEGORISATION (LOCKED 17 March 2026)

```
Layer 1 → keyword rules (fast, free, offline) — confidence 1.0
Layer 2 → Claude API enrichment (unrecognised only) — confidence 0.8
Layer 3 → user correction (highest signal) — confidence 1.0
5+ corrections = promoted to Layer 1
```

---

## LEARNING LOOPS (LOCKED 17 March 2026)

```
Loop 1 — Catalogue freshness
  KasheScore: quarterly objective update
  TER changes: weekly Edge Function auto-flag
  review_queue: PM reviews weekly (15 min)

Loop 2 — Spend accuracy
  category_corrected PostHog events → Layer 1 promotion

Loop 3 — AI insight quality
  insight_viewed / actioned / dismissed + time_visible

Loop 4 — Discovery signal
  instrument_tapped / added / skipped — editorial, not algorithmic
```

---

## LOCKED DECISIONS (do not re-debate)

- Four tabs: Home/Spend/Portfolio/Invest. No Insights tab.
- Universal AppHeader all tabs. No inline headers.
- Risk profile: RECOMMEND Balanced. Never silently assume.
- Catalogue: three concepts. Every type ends other|unknown.
- KasheScore: objective, quarterly, never shown as number.
- track_only never suggested. Ever.
- Living database: V1 static → V2 Supabase (one hook change).
- Spend: Layer 1 → Layer 2 → Layer 3 pipeline.
- Monthly Review: executive brief format. System-responsive mode.
- FIRE copy: "choose not to work" — freedom framing always.
- Empty state: 0.5 opacity ghost + floating accent pill. NOT blur.

---

## KNOWN BUG REGISTRY

### 🔴 Fix before beta
1. Hero number wrapping in PortfolioTotalsCard — Polish session
2. GROWTH total may be inflated — Data layer session
3. Dutch brand names in Spend mock data — Data layer session

### 🟡 Polish session
4. Chart spike at end of 1M view
5. KasheAsterisk watermark alignment
6. KasheAsterisk k-stroke prominence
7. Vertical MacronRule in TotalsCard
8. TextInput monthly target not currency-formatted
9. Category detail screen gap
10. InstrumentDiscoverySection shows 1 card for STABILITY
    (catalogue thin for this tier — grows over time, not a bug)

### 🟢 Deferred by design
11. Dark mode device verification — QA session
12. react-native-reanimated — native QA session
13. Price chart mock data — Data layer session

---

## REMAINING BUILD ORDER

```
Session 11  Invest Tab completion + FIRE Planner
              INV-06: FinancialEducationSection
              INV-07: Wire invest.tsx — full assembly
              INV-08: Invest tab empty state
              FIRE-01: fireDefaults.ts + fire.ts types
              FIRE-02+: /app/invest/fire.tsx full screen

Session 12  Data Layer (no UI)
              catalogueService.ts — Supabase + fallback
              spendCategoriser.ts — Layer 1/2/3
              merchantKeywords.ts — geography-aware
              All services, stores, hooks
              PostHog instrumentation — four loops

Session 13  Wire UI to Data Layer
              Real CSV data — first real test

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
4.  theme.* surface/border/text. colours.* static tokens.
5.  StyleSheet.create() always. No inline styles.
6.  formatCurrency() always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero any.
9.  Space Grotesk numbers/display. Inter body/UI.
10. Hero card always dark. Hero tokens inside only.
11. Standard card: theme.surface, borderRadius 16, no border.
12. Screen layout: paddingH 20, paddingTop 16, paddingBottom 48.
13. Universal AppHeader — never inline header code.
14. Empty state = 0.5 opacity ghost + floating accent pill.
15. Every commit = code + updated MD files together.
16. Git always manually. MD files replaced in full.
17. Never show raw subtype keys — use displayLabels.ts.
18. Tab 4 is Invest. No Insights tab.
19. Risk profile drives allocation. Never hardcoded.
20. "Worth exploring" always. Never buy/sell. No affiliate links.
21. track_only never suggested. Ever.
22. KasheScore drives ordering — objective, never behaviour-based.
23. Spend: Layer 1 → Layer 2 → Layer 3.
24. RECOMMEND Balanced — never silently assume.
25. Monthly Review: executive brief. Never text document.
26. FIRE: "choose not to work" — freedom framing.
27. Invest copy: visuals first. No verbose paragraphs.
28. KasheAsterisk punctuates AI-generated insights.
29. MacronRule between major sections: marginTop 24.
30. Detail screens: light bg, dark hero at top.
