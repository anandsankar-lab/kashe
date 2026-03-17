# Kāshe — Session 10 Handoff Document
*Session 09 → Session 10*
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
5. CLAUDE-financial.md (investment plan, instrument logic, FIRE)

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

## WHAT WAS BUILT — SESSION 09

### INV-01: RiskProfileCard + RiskProfileSheet ✅
- /types/riskProfile.ts — RiskProfileType + RISK_PROFILES constants
- /components/invest/RiskProfileCard.tsx
  STATE 1: "What kind of investor are you?"
           + "Most people in your situation start with Balanced."
  STATE 2: Profile label + description + allocation pills
- /components/invest/RiskProfileSheet.tsx
  Three-option picker, Balanced pre-selected, Confirm/Cancel

### Instrument Catalogue Type System ✅
- /types/instrumentCatalogue.ts — full rebuild
  Three distinct concepts: RegulatoryRegime, AccountWrapper, InstrumentType
  Every union type ends with 'other' | 'unknown'
  CatalogueRole: suggest / track_only / educational
  KasheScore field, DataQuality concept, riskTier, liquidityHorizon
  TRACK_ONLY_TYPES, HIGH_RISK_TYPES constants

### Instrument Catalogue Content ✅
- /constants/instrumentCatalogue.ts — ~40 curated entries
  NL/BE/DE/LU: VWCE, VWRL, IWDA, EUNL, XDWD, CSPX, EMIM, XNAS,
               IWFQ, WSML, IQQH, XEON, AGGH, DeGiro/IBKR direct equity
  India: Nifty 50, Nifty Next 50, PPFAS, Zerodha direct equity,
         Liquid MF, Short Duration Debt, PPF, EPF, ELSS, NPS
  US: VTI, VXUS, FZROX, BND, HYSA, I Bonds, Roth IRA
  GB: VWRL (LSE), Vanguard UK, ISA, LISA, Premium Bonds
  Track only: Crowdcube, Seedrs, Bitcoin
  GLOBAL fallback: VWCE + AGGH via IBKR

### Universal AppHeader ✅
- /components/shared/AppHeader.tsx
  Props: title, showAvatar, avatarInitial, showOverflow, showAdd
  Used by all four tabs — no inline header code anywhere

### invest.tsx updates ✅
- Universal header added
- STATE 1 copy: "Most people in your situation start with Balanced."

---

## KNOWN BUG REGISTRY (carried forward)

### 🔴 Fix before beta
1. Hero number wrapping: €123,500 splits in PortfolioTotalsCard
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

---

## WHAT TO BUILD — SESSION 10

Build in this exact order. Do not skip ahead.

---

## INV-02: InvestmentPlanFull

**File:** /components/invest/InvestmentPlanFull.tsx

Always-expanded version of InvestmentPlanCard from Portfolio tab.
Read InvestmentPlanCard.tsx before building — same visual language.

Key differences from InvestmentPlanCard:
- Always expanded, no toggle, no chevron
- Allocation targets from riskProfile prop (NOT hardcoded)
- Gap analysis per bucket shown inline
- [Explore {bucket} options →] CTA per underfunded bucket

Props:
  plan: InvestmentPlan (from MOCK_INVESTMENT_PLAN)
  riskProfile: RiskProfileType (default 'balanced')

Gap calculation:
  targetAmount = (allocationPct / 100) * plan.monthlyTarget
  gap = targetAmount - 0  (mock: assume 0 invested per bucket)
  Show gap row only if gap > 0

Gap row visual:
  "You're €{gap} short of your GROWTH target this month"
  Inter_400Regular, fontSize 13, theme.textSecondary

CTA visual:
  "[Explore {bucket} options →]"
  Inter_500Medium, fontSize 13, colours.accent
  onPress: console.log for now

Commit: [INV-02] InvestmentPlanFull

---

## INV-03: MonthlyReviewCard + MonthlyReviewSheet

**Files:**
  /components/invest/MonthlyReviewCard.tsx
  /components/invest/MonthlyReviewSheet.tsx

### MonthlyReviewCard — four states

STATE 1 — available, not viewed:
  4px left accent border (colours.accent)
  Card: theme.surface, borderRadius 16, padding 20,
    paddingLeft 16 (border takes 4px)
  "MONTHLY REVIEW" label — uppercase, textDim
  "Your March review is ready"
    SpaceGrotesk_700Bold, fontSize 18, theme.textPrimary, marginTop 4
  "Generated 16 March 2026"
    Inter_400Regular, fontSize 12, theme.textDim, marginTop 4
  [Read your March review →]
    Full-width accent button, marginTop 16

STATE 2 — already viewed:
  No accent border
  "March review" Inter_500Medium, fontSize 16, theme.textPrimary
  [Open →] Inter_400Regular, theme.textSecondary, marginTop 8

STATE 3 — pending (<3 months data):
  "Available once you have 3 months of data"
  Inter_400Regular, fontSize 14, theme.textSecondary

STATE 4 — insufficient:
  "Add more data to unlock monthly reviews"
  "[+ Upload bank statement]" in accent, marginTop 8

Props:
  state: 'available' | 'viewed' | 'pending' | 'insufficient'
  onOpen: () => void
Use state='available' for preview.

### MonthlyReviewSheet

Full-height scrollable Modal bottom sheet.
Drag handle + "March 2026 Review" header.

Five sections, each with uppercase label + Inter_400Regular content:

WHERE YOU STAND
  "You've invested €920 of your €1,500 monthly target.
   Your live portfolio grew 2.3% this month."

HOW YOUR MONEY IS WORKING
  "Growth: €102,400 — up 2.3% this month"
  "Stability: €21,100 — emergency fund at 2.8 months"
  "Locked: €48,200 — on track"

THIS MONTH'S PRIORITY
  "Your Growth bucket is €580 below your 60% target.
   Consider directing remaining €580 into a diversified ETF."

FIRE UPDATE
  "Based on current savings rate and portfolio growth,
   you're projected to reach financial independence by 2036."

NEXT MONTH — WATCH FOR
  "Federal Reserve meeting on 7 April may affect
   US equity allocation."

Footer:
  "Generated by Kāshe AI · Based on your data only ·
   Not financial advice"
  Inter_400Regular, fontSize 11, theme.textDim
  textAlign center, marginTop 24

Commit: [INV-03] MonthlyReviewCard + MonthlyReviewSheet

---

## INV-04: FIRETeaserCard

**File:** /components/invest/FIRETeaserCard.tsx

Props:
  fireSetUp: boolean
  onSetUp?: () => void
  onOpen?: () => void

STATE 1 — not set up (use for preview):
  "FINANCIAL INDEPENDENCE" label — uppercase, textDim
  "When could you stop working?"
    SpaceGrotesk_700Bold, fontSize 18, marginTop 8
  "Set up your FIRE planner — it takes 2 minutes."
    Inter_400Regular, fontSize 14, textSecondary, marginTop 6
  [Set up FIRE planner →]
    Inter_500Medium, fontSize 14, colours.accent, marginTop 16
    onPress: onSetUp

STATE 2 — set up:
  "FINANCIAL INDEPENDENCE" label
  "2036" SpaceGrotesk_700Bold, fontSize 48, letterSpacing -2, marginTop 8
  Progress bar:
    Track: theme.border, height 4, borderRadius 999, marginTop 12
    Fill: colours.accent, width animated 0 → 34%, 600ms ease-out
  "34% of your independence number"
    Inter_400Regular, fontSize 14, textSecondary, marginTop 8
  "€583,380 to go"
    Inter_400Regular, fontSize 13, textDim, marginTop 4
  [Open FIRE planner →] textSecondary, marginTop 16

Commit: [INV-04] FIRETeaserCard

---

## INV-05: InstrumentDiscoverySection

**File:** /components/invest/InstrumentDiscoverySection.tsx

This is the most important component on the Invest tab.
Read /constants/instrumentCatalogue.ts and
/types/instrumentCatalogue.ts before building.

### Suggestion logic (static for now, Supabase in Session 12)

Step 1 — Identify gap:
  Most underfunded bucket relative to risk profile target.
  Only show suggestions if gap > 5%.

Step 2 — Identify user tier per bucket:
  GROWTH:
    TIER_0 — no growth holdings → broad market ETFs
    TIER_1 — has broad ETF → regional/factor ETFs
    TIER_2 — has broad + regional → thematic ETFs
    TIER_3 — well diversified → direct equity option

  STABILITY:
    TIER_0 — no stability → emergency fund first
    TIER_1 — has emergency fund < 3 months → top up
    TIER_2 — has 3+ months → bond ETFs / MMFs
    TIER_3 — well covered → short-duration bonds

  LOCKED:
    TIER_0 — no locked → pension/retirement wrapper
    TIER_1 — has one → second geography
    TIER_2 — multi-geography → no suggestions needed

Step 3 — Filter by geography:
  Use getInstrumentsByTierAndBucket() from instrumentCatalogue.ts
  Pass user's holding geographies (mock: ['NL', 'US'])

Step 4 — "Worth exploring" framing ALWAYS:
  Never: "Buy X" or "Invest in Y"
  Always: description + why from catalogue entry

Step 5 — KasheScore ordering:
  Within a tier, show highest KasheScore first
  (For now: use catalogue order as proxy)

### Component visual spec

Card: theme.surface, borderRadius 16, padding 20

Header row:
  Left: "WORTH EXPLORING"
    Inter_500Medium, fontSize 11, textDim, uppercase, letterSpacing 0.8
  Right: "For your {bucket} gap"
    Inter_400Regular, fontSize 12, textSecondary

Gap indicator (if gap exists):
  "Your {bucket} bucket is {gap}% below target"
  Inter_400Regular, fontSize 13, textSecondary, marginBottom 16

Instrument cards (show max 3):
  Each card: borderWidth 1, borderColor theme.border,
    borderRadius 12, padding 16, marginBottom 10

  Name row:
    Instrument name: SpaceGrotesk_600SemiBold, fontSize 15, textPrimary
    Ticker (if exists): Inter_400Regular, fontSize 12, textDim, marginLeft 8

  Description:
    Inter_400Regular, fontSize 13, textSecondary, marginTop 4

  Why row:
    Inter_400Regular, fontSize 12, colours.accent, marginTop 6

  Bottom row (flexDirection row, justifyContent space-between):
    Left: TER if exists — "TER {expenseRatio}" textDim, fontSize 11
    Right: RiskTier pill — paddingH 8, paddingV 3, borderRadius 999
      medium: rgba(200,240,74,0.15) background, colours.accent text
      high: rgba(255,92,92,0.12) background, colours.danger text
      very_high: colours.danger background, white text

  Risk warning (if exists):
    Inter_400Regular, fontSize 11, colours.danger, marginTop 6

  TER footnote (if terFootnote=true):
    "* Verify current TER before investing"
    Inter_400Regular, fontSize 10, textDim, marginTop 4

[Explore more options →] at bottom:
  Inter_400Regular, fontSize 13, colours.accent
  onPress: console.log for now

Props:
  riskProfile: RiskProfileType
  holdings: PortfolioHolding[]

For mock: riskProfile='balanced', use MOCK_PORTFOLIO_HOLDINGS

Commit: [INV-05] InstrumentDiscoverySection

---

## INV-06: FinancialEducationSection

**File:** /components/invest/FinancialEducationSection.tsx

Education matched to user tier. Never shows what user already knows.

### Content (hardcoded for now)

```typescript
const EDUCATION_CONTENT = [
  {
    id: 'what_is_etf',
    tier: 0,
    bucket: 'GROWTH',
    title: 'What is an ETF?',
    tagline: 'Own thousands of companies in one purchase',
    body: 'An ETF (exchange-traded fund) is a basket of investments
      you can buy and sell like a single stock. When you buy VWCE,
      you own tiny pieces of ~3,700 companies worldwide. One
      transaction, instant diversification.',
    keyPoints: [
      'Lower cost than buying stocks individually',
      'Instant diversification reduces single-company risk',
      'Accumulating ETFs reinvest dividends automatically',
    ],
    readMore: 'justETF · Bogleheads wiki',
  },
  {
    id: 'what_is_emergency_fund',
    tier: 0,
    bucket: 'STABILITY',
    title: 'Why 3–6 months of expenses in cash?',
    tagline: 'The cushion that lets you stay invested',
    body: 'Without 3–6 months of expenses in cash, a job loss or
      emergency forces you to sell investments at the worst moment.
      The emergency fund is what lets you stay invested through
      market downturns.',
    keyPoints: [
      '3 months minimum, 6 months comfortable',
      'Keep it in an accessible account, not invested',
      'Replenish immediately if you ever use it',
    ],
    readMore: 'Freefincal · Mr Money Mustache',
  },
  {
    id: 'what_is_factor',
    tier: 1,
    bucket: 'GROWTH',
    title: 'What is factor investing?',
    tagline: 'Tilt your portfolio toward historically rewarded risks',
    body: 'Factor investing selects stocks based on characteristics
      that have historically delivered higher returns: quality
      (strong balance sheets), size (small-cap), and value.
      Factor ETFs tilt your portfolio without stock-picking.',
    keyPoints: [
      'Quality factor: companies with stable earnings, low debt',
      'Small-cap premium: documented across 90+ years of data',
      'Factor tilts are satellites — keep your core broad',
    ],
    readMore: 'AQR research · Fama-French academic papers',
  },
  {
    id: 'what_is_bond_etf',
    tier: 1,
    bucket: 'STABILITY',
    title: 'What is a bond ETF?',
    tagline: 'Lower volatility, steady income',
    body: 'Bonds are loans to governments or companies. Bond ETFs
      hold many bonds, providing steady income and lower correlation
      to equities. They dampen portfolio swings without sacrificing
      all returns.',
    keyPoints: [
      'Inverse relationship with interest rates',
      'Duration matters — shorter = less rate risk',
      'AGGH hedges currency risk for EUR investors',
    ],
    readMore: 'iShares bond investing guide',
  },
]
```

### Component visual spec

Card: theme.surface, borderRadius 16, padding 20

Header row:
  "LEARN" Inter_500Medium, fontSize 11, textDim, uppercase, letterSpacing 0.8
  "Matched to where you are" Inter_400Regular, fontSize 12, textSecondary

Content card (single article — most relevant to current tier):
  Title: SpaceGrotesk_600SemiBold, fontSize 16, textPrimary
  Tagline: Inter_400Regular, fontSize 13, textSecondary, marginTop 2

  Body: collapsed by default — tap title to expand
    Inter_400Regular, fontSize 14, textSecondary
    marginTop 8, lineHeight 22

  Key points (when expanded):
    3 bullet points with 4×4 accent circle bullet
    Inter_400Regular, fontSize 13, textSecondary, marginTop 4

  "Read more: {sources}"
    Inter_400Regular, fontSize 11, textDim, marginTop 12

[Next topic →] at bottom:
  Shows title of next content item
  Inter_400Regular, fontSize 13, colours.accent, marginTop 16
  onPress: cycles to next content item

Props:
  riskProfile: RiskProfileType
  holdings: PortfolioHolding[]

For mock: show 'what_is_factor' (user has VWRL = past TIER_0).

Commit: [INV-06] FinancialEducationSection

---

## INV-07: Wire /app/(tabs)/invest.tsx

Replace current preview shell with full Invest tab.

Structure (top to bottom):

<AppHeader
  title="Invest"
  showAvatar={true}
  avatarInitial="A"
  showOverflow={true}
  showAdd={true}
  onAdd={() => console.log('add investment')}
  onOverflow={() => console.log('overflow')}
  onAvatar={() => console.log('avatar')}
/>

<ScrollView contentContainerStyle={{
  paddingHorizontal: 20,
  paddingTop: 16,
  paddingBottom: 48,
}}>

  <RiskProfileCard
    riskProfile={riskProfile}
    onOpenSheet={() => setRiskSheetVisible(true)} />

  <MacronRule style={{ marginTop: 24 }} />

  <InvestmentPlanFull
    plan={MOCK_INVESTMENT_PLAN}
    riskProfile={riskProfile} />

  <MacronRule style={{ marginTop: 24 }} />

  <InstrumentDiscoverySection
    riskProfile={riskProfile}
    holdings={MOCK_PORTFOLIO_HOLDINGS} />

  <MacronRule style={{ marginTop: 24 }} />

  <MonthlyReviewCard
    state="available"
    onOpen={() => setReviewVisible(true)} />

  <MacronRule style={{ marginTop: 24 }} />

  <FinancialEducationSection
    riskProfile={riskProfile}
    holdings={MOCK_PORTFOLIO_HOLDINGS} />

  <MacronRule style={{ marginTop: 24 }} />

  <FIRETeaserCard fireSetUp={false} />

</ScrollView>

Outside ScrollView:
  <RiskProfileSheet
    visible={riskSheetVisible}
    currentProfile={riskProfile}
    onConfirm={(p) => {
      setRiskProfile(p)
      setRiskSheetVisible(false)
    }}
    onClose={() => setRiskSheetVisible(false)}
  />
  <MonthlyReviewSheet
    visible={reviewVisible}
    onClose={() => setReviewVisible(false)}
  />

State:
  riskProfile: RiskProfileType (default 'balanced')
  riskSheetVisible: boolean (default false)
  reviewVisible: boolean (default false)

Commit: [INV-07] Wire invest.tsx

---

## INV-08: Invest Tab Empty State

Same pattern as Portfolio empty state.

  const hasData = true  // toggle false to preview

  Wrap ScrollView content in:
    <View style={{ opacity: hasData ? 1 : 0.5 }}>

  Floating pill (outside View, position absolute):
    Same pattern as Portfolio.
    Only visible when !hasData.
    "+ Connect your data"
    backgroundColor colours.accent, borderRadius 999
    bottom 24, centred, zIndex 10

Preview: set hasData=false, screenshot, then set hasData=true for commit.

Commit: [INV-08] Invest tab empty state

---

## END OF SESSION 10 VERIFICATION

After INV-08 committed:
  Navigate all four tabs — no errors
  Risk profile sheet opens and closes cleanly
  Monthly review sheet opens and closes cleanly
  Instrument discovery shows correct tier suggestions
  Education section shows correct tier content
  Both empty states (Portfolio + Invest) confirmed working

Then share screenshots of all four tabs.

---

## SESSION 11 PREVIEW

FIRE Planner screen at /app/invest/fire.tsx

Components:
  FIREHouseholdToggle
  FIRESliderHero (5–30 year range, real-time recalculation)
  FIREInputsCard (6 inputs, collapsible)
  FIREAssumptionsCard (country inflation defaults, always shown)
  FIREProfileSelector (individual vs household)

New file: /constants/fireDefaults.ts
New type: /types/fire.ts

Spec: CLAUDE-experience.md → FIRE Planner Screen
      CLAUDE-financial.md → FIRE Engine

---

## QUICK REFERENCE — CRITICAL RULES

1.  --legacy-peer-deps every npm install
2.  Never react-native-reanimated
3.  const theme = useTheme() — never destructured
4.  theme.* for surface/border/text. colours.* for static tokens.
5.  StyleSheet.create() always. No inline styles.
6.  formatCurrency() always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero any.
9.  Space Grotesk numbers/display. Inter body/UI.
10. Hero card always dark — both modes.
11. Standard card: theme.surface, borderRadius 16, no border.
12. Screen layout: paddingH 20, paddingTop 16, paddingBottom 48.
    Card gap: marginTop 16. MacronRule between sections: marginTop 24.
13. Universal AppHeader on all four tabs. Never inline header code.
14. Empty state = 0.5 opacity ghost + floating accent pill.
15. Git always manually. MD files replaced in full.
16. Never show raw subtype keys — use displayLabels.ts.
17. Tab 4 is Invest. No standalone Insights tab.
18. Risk profile drives allocation. Never hardcoded.
19. Instrument suggestions: "worth exploring" only.
    Never buy/sell. Never affiliate links.
20. track_only instruments never appear in suggestions. Ever.
21. Default risk: RECOMMEND Balanced — never silently assume.
22. KasheScore drives ordering — objective, not behaviour-based.
