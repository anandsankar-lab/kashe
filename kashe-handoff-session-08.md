# Kāshe — Session 08 Handoff Document
*Session 07 → Session 08*
*Date: 17 March 2026*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + investment domain expert
helping Anand build Kāshe — a personal finance app for globally
mobile professionals managing multi-currency finances across geographies.
Anand is a coding beginner with strong product instincts.
One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md (full build state + locked decisions)
2. This file (what to build)
3. engineering-rules.md
4. design-system.md
5. For any Portfolio component: read SpendCategoryRow + SpendHeroCard
   as the canonical visual reference before building

---

## HOW WE WORK

1. Claude writes prompt in planning chat
2. Anand pastes into Claude Code terminal
3. Anand previews at localhost:8081, shares screenshot
4. Claude reviews — flags all issues
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

---

## WHAT CHANGED THIS SESSION (17 March 2026)

### 1. Full colour system audit completed
All components now use theme tokens correctly.
`colours.textPrimary` in the default export was hardcoded to
light mode ink (#1A1A18) — this caused near-invisible text in
dark mode across the entire app. Fixed globally.
`darkTheme.border` bumped from #252523 → #3A3A38 for visible outlines.

### 2. PORT-10b completed in full
Four fixes delivered to HoldingDetailScreen:
- Fix 1: /constants/displayLabels.ts created. Raw subtype keys
  (in_mutual_fund, india) no longer appear anywhere in the UI.
- Fix 2: HoldingPriceChart — SVG line chart, 1M/6M/1Y tabs,
  mock price history, accent/danger colour based on direction.
- Fix 3: HoldingInsightCard — holding-specific AI insight card
  with mock content per asset subtype.
- Fix 4: Full visual redesign — dark hero card (matching
  PositionHeroCard pattern), light screen background matching
  Spend detail, standardised card/spacing system.

### 3. Visual standardisation pass completed
PortfolioTotalsCard now has dark gradient hero treatment with
KasheAsterisk watermark — matching PositionHeroCard and SpendHeroCard.
All Portfolio cards, section headers, holding rows, and detail screen
components now use the same spacing, token, and card patterns as Spend.
This is now the enforced standard for all future screens.

### 4. Locked visual decisions (from this session)
- HoldingDetailScreen: light background, dark hero card at top.
  Same pattern as Spend category detail. Never dark full-screen.
- PortfolioTotalsCard: always dark gradient, KasheAsterisk watermark.
- Standard card pattern: theme.surface bg, borderRadius 16,
  no border (surface on background is sufficient separation).
- Hero card pattern: LinearGradient heroGradientStart→End,
  borderRadius 24, overflow hidden, KasheAsterisk watermark
  position absolute top -45 right -45, size 200×200, opacity 0.07.
- Screen layout: paddingHorizontal 20, paddingTop 16, paddingBottom 48.
- Gap between cards: marginTop 16. Gap before section headers: marginTop 32.

### 5. TASK 0 completed: insights.tsx → invest.tsx
Tab 4 is now Invest. insights.tsx deleted. _layout.tsx updated.

### 6. V1.5 / V2 backlog section added (see below)

---

## WHAT WAS BUILT — SESSIONS 01 TO 07

Complete screens:
  Home ✅   Spend ✅

Portfolio screen — PORT-01 to PORT-10b:
  PORT-01: PortfolioTotalsCard (dark hero, watermark) ✅
  PORT-02: PortfolioSectionHeader ✅
  PORT-03/04/05: PortfolioHoldingRow (all variants) ✅
  PORT-06: PortfolioInsightStrip ✅
  PORT-07: InvestmentPlanCard ✅
  PORT-08: InstrumentSuggestionSheet ✅
  PORT-09: BucketReassignSheet ✅
  PORT-10: [holdingId].tsx + LockedProjectionCard + ProtectionStatusCard ✅
  PORT-10b: displayLabels.ts + HoldingPriceChart + HoldingInsightCard
            + full visual redesign ✅

Infrastructure:
  /constants/formatters.ts — formatCurrency() ✅
  /constants/displayLabels.ts — getAssetTypeLabel(), getGeographyLabel() ✅

Not yet built:
  PORT-11: Portfolio empty state ⬜
  Invest tab (INV-01 through INV-06) ⬜

---

## CONFIRMED FILE TREE (as of Session 07)

```
app/
  (tabs)/
    _layout.tsx           ✅
    index.tsx             ✅ Home (complete)
    spend.tsx             ✅ Spend (complete)
    portfolio.tsx         ✅ PORT-01 through PORT-10b wired
    invest.tsx            ⬜ Shell only — build this session
  _layout.tsx             ✅
  spend/
    [category].tsx        ✅
  portfolio/
    [holdingId].tsx       ✅ PORT-10b complete
  invest/
    fire.tsx              ⬜ Session 09

components/
  home/                   ✅ All complete
  shared/                 ✅ All complete
  spend/                  ✅ All complete
  portfolio/
    PortfolioTotalsCard.tsx        ✅ dark hero + watermark
    PortfolioSectionHeader.tsx     ✅
    PortfolioHoldingRow.tsx        ✅
    PortfolioInsightStrip.tsx      ✅
    InvestmentPlanCard.tsx         ✅
    InstrumentSuggestionSheet.tsx  ✅
    BucketReassignSheet.tsx        ✅
    LockedProjectionCard.tsx       ✅
    ProtectionStatusCard.tsx       ✅
    HoldingPriceChart.tsx          ✅ PORT-10b
    HoldingInsightCard.tsx         ✅ PORT-10b
  invest/                 ⬜ All new — this session
    RiskProfileCard.tsx
    RiskProfileSheet.tsx
    InvestmentPlanFull.tsx
    MonthlyReviewCard.tsx
    MonthlyReviewSheet.tsx
    FIRETeaserCard.tsx
  ui/                     ✅ All complete

constants/
  colours.ts              ✅ audited + fixed this session
  formatters.ts           ✅
  displayLabels.ts        ✅ PORT-10b
  mockData.ts             ✅
  spacing.ts              ✅
  typography.ts           ✅
  fireDefaults.ts         ⬜ Session 09

types/
  spend.ts                ✅
  portfolio.ts            ✅
  riskProfile.ts          ⬜ this session
```

---

## WHAT TO BUILD — SESSION 08

Build in this exact order. Do not skip ahead.

---

## PORT-11: Portfolio Empty State

Wire into /app/(tabs)/portfolio.tsx.

```
Add at top of component:
  const hasData = true  // toggle false to preview empty state

Wrap ScrollView content in opacity wrapper:
  <View style={{ opacity: hasData ? 1 : 0.5 }}>
    {/* all existing content */}
  </View>

Pass isRedacted={!hasData} to:
  PortfolioTotalsCard
  InvestmentPlanCard
  PortfolioSectionHeader (all 3 instances)
  PortfolioHoldingRow (all instances)

PortfolioInsightStrip: insight={hasData ? mockInsight : null}

Floating pill (outside ScrollView, position absolute):
  Only visible when !hasData

  {!hasData && (
    <View style={styles.emptyPill}>
      <TouchableOpacity
        style={[styles.pillButton,
          { backgroundColor: colours.accent }]}
        onPress={() => console.log('Open invitation sheet')}
      >
        <KasheAsterisk size={14} animated={false}
          direction="neutral" />
        <Text style={styles.pillText}>
          {'  Connect your data'}
        </Text>
      </TouchableOpacity>
    </View>
  )}

Pill styles:
  emptyPill: position absolute, bottom 24,
    left 0, right 0, alignItems center, zIndex 10
  pillButton: flexDirection row, alignItems center,
    paddingHorizontal 20, paddingVertical 12,
    borderRadius 999
  pillText: SpaceGrotesk_600SemiBold, fontSize 14,
    colour colours.textOnAccent
```

Preview: set hasData=false, confirm ghost + pill visible.
Screenshot. Then set hasData=true for commit.
Commit: [PORT-11] Portfolio empty state

---

## SESSION 08b: Invest Tab — INV-01 through INV-06

Only start after PORT-11 is committed.

Visual reference for all Invest tab components:
  Read SpendInsightStrip before building MonthlyReviewCard.
  Read InvestmentPlanCard before building InvestmentPlanFull.
  Read PortfolioTotalsCard before building RiskProfileCard.
  The Invest tab must feel like the same app as Portfolio + Spend.

---

### INV-01: RiskProfileCard + RiskProfileSheet

**Files:**
  /components/invest/RiskProfileCard.tsx
  /components/invest/RiskProfileSheet.tsx

STATE 1 — Not set up:
  Card: theme.surface, borderRadius 16, padding 20
  KasheAsterisk size=16, animated=false, direction="neutral"
  marginBottom 12
  Headline: "What kind of investor are you?"
    SpaceGrotesk_600SemiBold, fontSize 18, theme.textPrimary
  Body: "Tell us how you think about risk. We'll tailor your
         investment plan and suggestions."
    Inter_400Regular, fontSize 14, theme.textSecondary
    marginTop 8
  [Set your risk profile →]
    Full-width, backgroundColor colours.accent
    borderRadius 12, paddingVertical 14
    Inter_500Medium, fontSize 15, colours.textOnAccent
    marginTop 16
    onPress: open RiskProfileSheet

STATE 2 — Set up, showing current profile:
  Card: theme.surface, borderRadius 16, padding 20
  Top row:
    "RISK PROFILE" — Inter_500Medium, fontSize 11,
      theme.textDim, uppercase, letterSpacing 0.8
    [Edit] — Inter_400Regular, fontSize 13,
      colours.accent, right-aligned
  Profile name: SpaceGrotesk_600SemiBold, fontSize 22,
    theme.textPrimary, marginTop 4
  Description: Inter_400Regular, fontSize 14,
    theme.textSecondary, marginTop 4
  Allocation pills row (flexDirection row, gap 8, marginTop 12):
    Three pills: GROWTH X% · STABILITY X% · LOCKED X%
    Each pill: paddingHorizontal 10, paddingVertical 4,
      borderRadius 999, backgroundColor theme.border
    GROWTH pill: backgroundColor rgba(200,240,74,0.15),
      text colours.accent
    Inter_500Medium, fontSize 12

RiskProfileSheet:
  Modal bottom sheet, drag handle at top
  "Your risk profile" — SpaceGrotesk_600SemiBold,
    fontSize 18, theme.textPrimary

  Three option cards stacked, gap 12:
    TouchableOpacity, borderRadius 12, padding 16
    Selected: borderWidth 2, borderColor colours.accent,
      backgroundColor rgba(200,240,74,0.08)
    Unselected: borderWidth 1, borderColor theme.border

    Option 1 — Conservative:
      "Conservative" SpaceGrotesk_600SemiBold, fontSize 16,
        theme.textPrimary
      "Protect what I have, grow slowly"
        Inter_400Regular, fontSize 13, theme.textSecondary
      "Target: 40% Growth · 40% Stability · 20% Locked"
        Inter_400Regular, fontSize 12, theme.textDim
        marginTop 4

    Option 2 — Balanced:
      "Balanced"
      "Grow steadily, some volatility is fine"
      "Target: 60% Growth · 20% Stability · 20% Locked"

    Option 3 — Growth:
      "Growth"
      "Maximise growth, I can ride out dips"
      "Target: 80% Growth · 10% Stability · 10% Locked"

  [Confirm] — full-width accent button, marginTop 24
  [Cancel] — text link, theme.textSecondary, marginTop 12

  Default selection: Balanced (pre-selected on first open)
  onConfirm: console.log for now

State: use useState in invest.tsx to track riskProfile
  ('conservative' | 'balanced' | 'growth', default 'balanced')
  Pass to RiskProfileCard as prop.

Commit: [INV-01] RiskProfileCard + RiskProfileSheet

---

### INV-02: InvestmentPlanFull

**File:** /components/invest/InvestmentPlanFull.tsx

This is the always-expanded version of InvestmentPlanCard.
InvestmentPlanCard on Portfolio tab remains as summary.
This is the full planning view — never collapses.

Read InvestmentPlanCard.tsx before building this.
Share the same visual language but with:
  - Always expanded, no toggle
  - Allocation targets derived from riskProfile prop
    (not hardcoded 60/20/20)
  - Gap analysis section:
    "You're €X short of your {bucket} target"
    Show for each underfunded bucket
    Inter_400Regular, fontSize 13, theme.textSecondary
  - [Explore {bucket} options →] text link
    colours.accent, Inter_500Medium, fontSize 13
    onPress: console.log for now

Props:
  plan: InvestmentPlan (from MOCK_INVESTMENT_PLAN)
  riskProfile: 'conservative' | 'balanced' | 'growth'

Use MOCK_INVESTMENT_PLAN from mockData.ts.

Commit: [INV-02] InvestmentPlanFull

---

### INV-03: MonthlyReviewCard + MonthlyReviewSheet

**Files:**
  /components/invest/MonthlyReviewCard.tsx
  /components/invest/MonthlyReviewSheet.tsx

MonthlyReviewCard — four states:

STATE 1 — Review available, not yet viewed:
  4px left border, colours.accent
  "MONTHLY REVIEW" — Inter_500Medium, fontSize 11,
    theme.textDim, uppercase, letterSpacing 0.8
  "Your March review is ready"
    SpaceGrotesk_700Bold, fontSize 18, theme.textPrimary
  "Generated 16 March 2026"
    Inter_400Regular, fontSize 12, theme.textDim, marginTop 4
  [Read your March review →]
    Full-width accent button, marginTop 16
    onPress: open MonthlyReviewSheet

STATE 2 — Already viewed:
  No accent border
  "March review"
    Inter_500Medium, fontSize 16, theme.textPrimary
  [Open →] Inter_400Regular, theme.textSecondary

STATE 3 — Not yet available:
  "Available once you have 3 months of data"
    Inter_400Regular, fontSize 14, theme.textSecondary
  No CTA

STATE 4 — Insufficient data:
  "Add more data to unlock monthly reviews"
    Inter_400Regular, fontSize 14, theme.textSecondary
  "[+ Upload bank statement]"
    Inter_400Regular, colours.accent
    onPress: console.log

Use STATE 1 for mock preview.

MonthlyReviewSheet — full-height scrollable bottom sheet:
  Drag handle + "March 2026 Review"
    SpaceGrotesk_600SemiBold, fontSize 18, theme.textPrimary

  Five sections, each with label + content:

  "WHERE YOU STAND"
    Mock: "You've invested €920 of your €1,500 monthly target.
    Your live portfolio grew 2.3% this month, outperforming
    the MSCI World by 0.8%."

  "HOW YOUR MONEY IS WORKING"
    Growth: "€115,100 — up 2.3% this month"
    Stability: "€21,200 — emergency fund at 2.8 months"
    Locked: "€48,200 — PPF on track for Mar 2031 unlock"
    Protection: "ABN Amro current account covers 2.8 months"

  "THIS MONTH'S PRIORITY"
    Mock: "Your Growth bucket is €580 below your 60% target.
    Consider directing this month's remaining €580 into
    a diversified ETF before month end."

  "FIRE UPDATE"
    Mock: "Based on your current savings rate and portfolio
    growth, you're projected to reach financial independence
    by 2036. That's unchanged from last month."

  "NEXT MONTH — WATCH FOR"
    Mock: "PPF contribution deadline: 31 March. RBI policy
    meeting on 7 April may affect Indian MF allocation."

  Footer:
    "Generated by Kāshe AI · Based on your data only ·
     Not financial advice"
    Inter_400Regular, fontSize 11, theme.textDim
    textAlign center, marginTop 24, marginBottom 12

Commit: [INV-03] MonthlyReviewCard + MonthlyReviewSheet

---

### INV-04: FIRETeaserCard

**File:** /components/invest/FIRETeaserCard.tsx

STATE 1 — FIRE not set up (default for preview):
  Card: theme.surface, borderRadius 16, padding 20
  "FINANCIAL INDEPENDENCE"
    Inter_500Medium, fontSize 11, theme.textDim
    uppercase, letterSpacing 0.8
  "When could you stop working?"
    SpaceGrotesk_700Bold, fontSize 18, theme.textPrimary
    marginTop 8
  "Set up your FIRE planner — it takes 2 minutes."
    Inter_400Regular, fontSize 14, theme.textSecondary
    marginTop 6
  [Set up FIRE planner →]
    Inter_500Medium, fontSize 14, colours.accent
    marginTop 16
    onPress: console.log for now
    (will route to /invest/fire when built in Session 09)

STATE 2 — FIRE set up (mock data):
  "FINANCIAL INDEPENDENCE" label (same as above)
  "2036"
    SpaceGrotesk_700Bold, fontSize 48, theme.textPrimary
    letterSpacing -2, marginTop 8
  Progress bar (marginTop 12):
    Track: theme.border, height 4, borderRadius 999
    Fill: colours.accent, width 34% (mock)
    Animated on mount: 0 → 34%, 600ms ease-out
  "34% of your independence number"
    Inter_400Regular, fontSize 14, theme.textSecondary
    marginTop 8
  "€X,XXX to go"
    Inter_400Regular, fontSize 13, theme.textDim
    marginTop 4
  [Open FIRE planner →]
    Inter_400Regular, fontSize 13, theme.textSecondary
    marginTop 16

Use STATE 1 for preview.

Commit: [INV-04] FIRETeaserCard

---

### INV-05: Wire /app/(tabs)/invest.tsx

Replace the placeholder screen with the full Invest tab.

Structure (top to bottom):

Header row (not inside ScrollView):
  "Invest" SpaceGrotesk_600SemiBold, fontSize 24,
    theme.textPrimary
  [+] button right — same style as Portfolio header

ScrollView:
  contentContainerStyle:
    paddingHorizontal 20, paddingTop 16, paddingBottom 48

  <RiskProfileCard riskProfile={riskProfile}
    onOpenSheet={() => setRiskProfileSheetVisible(true)} />
  <MacronRule style={{ marginTop: 24 }} />
  <InvestmentPlanFull plan={MOCK_INVESTMENT_PLAN}
    riskProfile={riskProfile} />
  <MacronRule style={{ marginTop: 24 }} />
  <MonthlyReviewCard state="available"
    onOpen={() => setMonthlyReviewVisible(true)} />
  <MacronRule style={{ marginTop: 24 }} />
  <FIRETeaserCard fireSetUp={false} />

Outside ScrollView (sheets):
  <RiskProfileSheet
    visible={riskProfileSheetVisible}
    currentProfile={riskProfile}
    onConfirm={(p) => {
      setRiskProfile(p)
      setRiskProfileSheetVisible(false)
    }}
    onClose={() => setRiskProfileSheetVisible(false)}
  />
  <MonthlyReviewSheet
    visible={monthlyReviewVisible}
    onClose={() => setMonthlyReviewVisible(false)}
  />

State:
  riskProfileSheetVisible: boolean (default false)
  monthlyReviewVisible: boolean (default false)
  riskProfile: 'conservative' | 'balanced' | 'growth'
    (default 'balanced')

Commit: [INV-05] Wire invest.tsx

---

### INV-06: Invest Tab Empty State

Add to /app/(tabs)/invest.tsx:

  const hasData = true  // toggle false to preview

  Wrap ScrollView content:
    <View style={{ opacity: hasData ? 1 : 0.5 }}>
      {/* all invest content */}
    </View>

  Floating pill (outside ScrollView, position absolute):
    Same pattern as Portfolio empty state.
    Only visible when !hasData.
    "+ Connect your data"
    onPress: console.log

Preview: set hasData=false, screenshot.
Then set hasData=true for commit.

Commit: [INV-06] Invest tab empty state

---

## END OF SESSION 08 — VERIFICATION

After INV-06 is committed, run full tab check:
  Home → Spend → Portfolio → Invest
  All four tabs render without errors
  Both hasData=true states confirmed
  Dark mode check (system dark mode)

Then share screenshots of all four tabs for sign-off
before producing Session 09 handoff.

---

## SESSION 09 PREVIEW

Session 09 = FIRE Planner screen
Route: /app/invest/fire.tsx

Components to build:
  FIREHouseholdToggle
  FIRESliderHero (5–30 year range, real-time update)
  FIREInputsCard (6 inputs, collapsible)
  FIREAssumptionsCard (country inflation defaults, always visible)
  FIREProfileSelector (individual vs household toggle)

Spec: CLAUDE-experience.md → "FIRE Planner Screen"
      CLAUDE-financial.md → "FIRE Engine"
      /constants/fireDefaults.ts (create this session)

---

## KNOWN BUG REGISTRY

Every known issue. Session target in brackets.

### 🔴 Data / correctness (fix before beta)
1. PPF Account showing ₹420,000 instead of EUR equivalent
   on the portfolio list row — data layer session
2. GROWTH section total inflated (mock data arithmetic) —
   data layer session
3. Dutch brand names in Spend mock data — fix before data
   layer session:
   Albert Heijn/Jumbo → "Supermarket"
   Thuisbezorgd → "Food Delivery App"
   Bol.com → "Online Store"
   NS/GVB → "Public Transport"

### 🟡 Visual / polish (fix in polish session)
4. Chart spike at end of 1M view — mock random walk too
   aggressive on last data point
5. KasheAsterisk watermark on PortfolioTotalsCard sits
   slightly lower/right vs Home hero — minor alignment
6. KasheAsterisk k-stroke needs more visual prominence
7. Vertical MacronRule in PortfolioTotalsCard uses plain
   View — standardise to MacronRule component
8. TextInput monthly target field not going through
   currency formatter (expected limitation)
9. Category detail screen large gap between month selector
   and tag pills

### 🟢 Deferred by design (known, not bugs)
10. Dark mode not yet verified on device (system toggle not
    easily accessible in web preview)
11. react-native-reanimated banned for web — returns for
    native builds in QA session
12. Price chart shows mock data — real feed in data layer

---

## V1.5 / V2 / NEVER BACKLOG

Ideas captured during Session 07. To be discussed at
end of V1 before starting V1b planning.

### V1.5 candidates (after V1 stable, before V2)
- SMS parsing for Indian bank accounts — CRED-style passive
  detection of holdings, balances, transactions from HDFC/
  ICICI/SBI structured SMS alerts. High-value for the Indian
  side of Kāshe's user base. GDPR not applicable for SMS.
  Would dramatically reduce onboarding friction.

### V2 candidates (already in plan)
- Open banking: Nordigen for EU, Account Aggregator for
  India, Plaid for US
- Email parsing for financial data (GDPR-careful, explicit
  consent required)
- Couple sync via Supabase Edge Functions
- ML-based spend categorisation
- Conversational advisor ("ask Kāshe anything")
- Push notifications (opt-in)
- Year-end wrapped
- Real price chart data (chart shell built in V1)

### Never
- Physical assets (car, art, jewellery)
- Tax filing or calculations
- Money transfers or payments
- Social features or comparisons
- Ads, affiliate links, data monetisation
- Buy/sell recommendations
- Regulated financial advice

---

## QUICK REFERENCE

1.  --legacy-peer-deps every npm install
2.  Never react-native-reanimated
3.  const theme = useTheme() — never destructured
4.  theme.* surface/border/background/text. colours.* static.
5.  StyleSheet.create() always. No inline styles.
6.  formatCurrency() always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero any.
9.  Space Grotesk numbers/display. Inter body/UI.
10. Hero card always dark — both modes. Hero tokens inside.
11. Standard card: theme.surface, borderRadius 16, no border.
12. Screen layout: paddingHorizontal 20, paddingTop 16,
    paddingBottom 48. Gap between cards: marginTop 16.
    Gap before section headers: marginTop 32.
13. Detail screens: light background, dark hero card at top.
    Same pattern as Spend category detail.
14. KasheAsterisk watermark on hero cards: position absolute,
    top -45, right -45, size 200×200, opacity 0.07.
15. Empty state = 0.5 opacity ghost + floating accent pill.
16. Git always manually. MD files replaced in full. Never inline.
17. Never show raw subtype keys — use displayLabels.ts always.
18. No standalone Insights tab. Insights on native screens.
19. Tab 4 is Invest. Route: /app/(tabs)/invest.tsx.
20. Risk profile drives allocation targets. Never hardcoded.
