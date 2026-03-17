# Kāshe — Session 11 Handoff Document
*Session 10 → Session 11*
*Date: 17 March 2026*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + investment domain expert
helping Anand build Kāshe — a personal finance app for globally
mobile professionals managing multi-currency finances across
geographies. Anand is a coding beginner with strong product
instincts. One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md (full build state + all locked decisions)
2. This file (what to build this session)
3. engineering-rules.md
4. design-system.md
5. CLAUDE-financial.md

---

## HOW WE WORK

1. Claude writes prompt in planning chat
2. Anand pastes into Claude Code terminal
3. Anand previews at localhost:8081, shares screenshot
4. Claude reviews — flags ALL issues
5. Claude gives exact git commands
6. Anand runs git commands manually (NEVER through Claude Code)
7. Commit confirmed → next ticket

Rules:
- One ticket at a time. Preview before commit. Commit before next.
- --legacy-peer-deps on every npm install. No exceptions.
- Never react-native-reanimated. Animated API only.
- Git always run manually. Never through Claude Code.
- MD files downloaded and replaced in full. Never edited inline.
- Every commit includes code + updated MD files together.
- After every screenshot: approve + git commands, OR fix prompt.
  Never both at once.

---

## WHAT WAS BUILT — SESSION 10

### INV-02: InvestmentPlanFull ✅
- /components/invest/InvestmentPlanFull.tsx
- Always-expanded plan, allocation targets from risk profile
- Progress fraction format: €920/€900 (not gap copy)
- "Invest X more" → "Explore →" CTA per underfunded bucket
- Wired into invest.tsx with MOCK_INVESTMENT_PLAN

### INV-03: MonthlyReviewCard + MonthlyReviewSheet ✅
- /components/invest/MonthlyReviewCard.tsx — four states
  STATE 1: "March review ready" + "Read now →" (accent border)
  STATE 2: viewed state
  STATE 3: pending (<3 months data)
  STATE 4: insufficient data
- /components/invest/MonthlyReviewSheet.tsx — full redesign
  Executive brief format, four storytelling levels:
  LEVEL 1: Hero stat (€920) + sparkline chart (SVG)
  LEVEL 2: Bucket allocation bars (animated, Growth/Stability/Locked)
  LEVEL 3: Priority action card ("€580 into Growth" + accent border)
  LEVEL 4: FIRE year (2036) + watchlist bullets
  Light/dark responsive (follows system mode — intentional)

### INV-04: FIRETeaserCard ✅
- /components/invest/FIRETeaserCard.tsx
- STATE 1: "When could you choose not to work?" + KasheAsterisk
- STATE 2: "2036" large + animated progress bar + pill
- Copy: "choose not to work" — freedom framing, not stopping

### INV-05: InstrumentDiscoverySection ✅
- /components/invest/InstrumentDiscoverySection.tsx
- Reads live from /constants/instrumentCatalogue.ts
- Derives most underfunded bucket vs risk profile targets
- Determines user tier from existing holdings
- Filters by geography (default 'NL')
- Shows up to 3 suggestions per tier/bucket/geography
- KasheAsterisk before "why" text
- Risk tier pill (colour-coded)
- TER + regulatory regime meta row
- TER footnote when terFootnote=true
- why text capped at numberOfLines={2}
- "Explore more options →" footer CTA

### Copy tightening across Invest tab ✅
- RiskProfileCard STATE 1: KasheAsterisk + "Balanced is a good
  starting point for most" (removed verbose paragraph)
- RiskProfileSheet: "60 · 20 · 20" numbers only
- InvestmentPlanFull: fraction format, "Explore →" CTA
- MonthlyReviewCard: "March review ready" / "Read now →"
- FIRETeaserCard: "When could you choose not to work?"

### Universal AppHeader ✅ (Session 09, confirmed working)
- All four tabs use AppHeader consistently

---

## REMAINING INVEST TAB TICKETS

### INV-06: FinancialEducationSection ⬜ — BUILD FIRST

**File:** /components/invest/FinancialEducationSection.tsx

Education matched to user tier. Never shows what user already knows.
Collapsible article with key points. Cycles through topics.

Hardcoded content (4 articles):
  what_is_etf (tier 0, GROWTH)
  what_is_emergency_fund (tier 0, STABILITY)
  what_is_factor (tier 1, GROWTH)
  what_is_bond_etf (tier 1, STABILITY)

Visual:
  Card: theme.surface, borderRadius 16, padding 20
  "LEARN" label + "Matched to where you are" subtext
  Title (tappable to expand) + tagline
  Body (collapsed by default, expands on tap)
  3 bullet points with 4×4 accent circle bullet
  "Read more: {sources}" in textDim
  "[Next topic →]" cycles to next article

Props:
  riskProfile: RiskProfileType
  holdings: PortfolioHolding[]

For mock: show 'what_is_factor' (user has ETF = past TIER_0)

Commit: [INV-06] FinancialEducationSection

---

### INV-07: Wire /app/(tabs)/invest.tsx ⬜

Replace current preview assembly with full ordered layout:

1. RiskProfileCard
2. MacronRule (marginTop 24)
3. InvestmentPlanFull
4. MacronRule (marginTop 24)
5. InstrumentDiscoverySection
6. MacronRule (marginTop 24)
7. MonthlyReviewCard
8. MacronRule (marginTop 24)
9. FinancialEducationSection
10. MacronRule (marginTop 24)
11. FIRETeaserCard

State:
  riskProfile: RiskProfileType (default 'balanced')
  riskSheetVisible: boolean (default false)
  reviewVisible: boolean (default false)

Outside ScrollView:
  RiskProfileSheet
  MonthlyReviewSheet

Commit: [INV-07] Wire invest.tsx — full tab assembly

---

### INV-08: Invest Tab Empty State ⬜

Same pattern as Portfolio.
const hasData = true (toggle false to preview)
Wrap ScrollView content in opacity wrapper.
Floating "+ Connect your data" pill when !hasData.
Preview with hasData=false, screenshot, commit with hasData=true.

Commit: [INV-08] Invest tab empty state

---

## SESSION 11 THEN CONTINUES WITH: FIRE Planner

### FIRE-01: /constants/fireDefaults.ts + /types/fire.ts

fireDefaults.ts already specced in CLAUDE-financial.md.
fire.ts interfaces: FIREInputs, FIREOutputs, FIREAssumptions.

### FIRE-02 through FIRE-06: /app/invest/fire.tsx

Components:
  FIREHouseholdToggle
  FIRESliderHero (5–30 year range, real-time)
  FIREInputsCard (6 inputs, collapsible)
  FIREAssumptionsCard (always visible, country defaults)
  FIREProfileSelector (individual vs household)

Full spec: CLAUDE-experience.md → FIRE Planner Screen
           CLAUDE-financial.md → FIRE Engine

---

## KNOWN BUG REGISTRY (carried forward)

### 🔴 Fix before beta
1. Hero number wrapping: €123,500 splits in PortfolioTotalsCard.
   Fix: reduce hero font size. Polish session.
2. GROWTH total (€102,400) may be inflated. Verify at data layer.
3. Dutch brand names in Spend mock data. Fix before data layer.

### 🟡 Polish session
4. Chart spike at end of 1M view
5. KasheAsterisk watermark alignment
6. KasheAsterisk k-stroke prominence
7. Vertical MacronRule in TotalsCard
8. TextInput monthly target not currency-formatted
9. Category detail screen gap
10. InstrumentDiscoverySection shows only 1 card for STABILITY
    (correct — thin catalogue for this tier/geo, grows over time)

---

## CURRENT FILE STATE

```
components/invest/
  RiskProfileCard.tsx            ✅ INV-01
  RiskProfileSheet.tsx           ✅ INV-01
  InvestmentPlanFull.tsx         ✅ INV-02
  MonthlyReviewCard.tsx          ✅ INV-03
  MonthlyReviewSheet.tsx         ✅ INV-03 (executive brief redesign)
  FIRETeaserCard.tsx             ✅ INV-04
  InstrumentDiscoverySection.tsx ✅ INV-05
  FinancialEducationSection.tsx  ⬜ INV-06
```

---

## LOCKED DECISIONS — KEY REMINDERS

1. Universal AppHeader on all tabs. No inline header code.
2. Risk profile default: RECOMMEND Balanced, never silently assume.
3. "Worth exploring" framing. Never buy/sell. No affiliate links.
4. track_only instruments never suggested. Ever.
5. KasheScore drives ordering — objective, not behaviour-based.
6. Monthly Review: system-responsive dark/light (intentional).
7. FIRE copy: "choose not to work" — freedom framing.
8. formatCurrency() always. Never Intl.NumberFormat.
9. StyleSheet.create() always. No inline styles.
10. Default exports. Relative imports. No @/ alias.
11. react-native-reanimated banned. Animated API only.
12. --legacy-peer-deps every npm install.
13. Git manually always. MD files replaced in full.
14. Every commit: code + updated MD files together.

---

## QUICK REFERENCE

Repo: github.com/anandsankar-lab/kashe
Local: ~/Documents/kashe
Preview: npx expo start → w → localhost:8081
Node: v25.6.1

Reference components:
  SpendHeroCard → hero cards
  SpendCategoryRow → list rows
  SpendInsightStrip → insight cards
  spend/[category].tsx → detail screens
  InvestmentPlanFull.tsx → invest tab cards
  MonthlyReviewSheet.tsx → sheet pattern
```
