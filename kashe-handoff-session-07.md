# Kāshe — Session 07 Handoff Document
*Session 06 → Session 07*
*Date: 16 March 2026*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + investment domain expert
helping Anand build Kāshe — a personal finance app for globally
mobile professionals managing multi-currency finances.
Anand is a coding beginner with strong product instincts.
One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md (full build state + locked decisions)
2. This file (what to build)
3. engineering-rules.md
4. design-system.md

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

---

## WHAT CHANGED THIS SESSION (structural decisions)

Read this carefully — these are locked decisions made on 16 March 2026
that affect every remaining session.

### 1. No standalone Insights tab
The Insights tab has been removed. AI insights live on the screens
they are relevant to:
  - SpendInsightStrip → on Spend screen (already built)
  - PortfolioInsightStrip → on Portfolio screen (already built)
  - HoldingInsightCard → on HoldingDetailScreen (PORT-10b)

### 2. Tab 4 is now "Invest"
  Old: /app/(tabs)/insights.tsx   "Insights"
  New: /app/(tabs)/invest.tsx     "Invest"
  FIRST TASK of this session: rename the file.

  Invest tab contains:
    RiskProfileCard        — setup + display, anchor of the tab
    InvestmentPlanFull     — promoted from Portfolio summary card
    InstrumentSuggestions  — filtered by risk profile + bucket
    MonthlyReviewCard      — cross-domain monthly synthesis
    FIRETeaserCard         — optional FIRE entry point, low pressure

### 3. Risk Profile is a V1 feature
  Three levels: Conservative / Balanced / Growth
  Drives allocation targets for InvestmentPlanCard everywhere.
  Replaces hardcoded 60/20/20 split.
  Conservative: 40/40/20   Balanced: 60/20/20   Growth: 80/10/10

### 4. Product vision broadened
  Kāshe is for ALL globally mobile professionals — not India-specific.
  Any expat with investments in multiple countries is the target user.
  This does not change any existing component — just the framing.

### 5. HoldingDetailScreen needs enrichment (PORT-10b)
  Current screen is too sparse and data-sheet-like.
  Needs: display label fixes + price chart + insight card + redesign.

---

## WHAT WAS BUILT — SESSIONS 01 TO 06

Complete screens:
  Home ✅   Spend ✅

Portfolio screen — PORT-01 to PORT-10 (basic):
  PORT-01: PortfolioTotalsCard
  PORT-02: PortfolioSectionHeader
  PORT-03/04/05: PortfolioHoldingRow (all variants)
  PORT-06: PortfolioInsightStrip
  PORT-07: InvestmentPlanCard
  PORT-08: InstrumentSuggestionSheet
  PORT-09: BucketReassignSheet
  PORT-10: [holdingId].tsx + LockedProjectionCard + ProtectionStatusCard
           ⚠️ Basic version only — PORT-10b enrichment needed

Infrastructure:
  /constants/formatters.ts — formatCurrency()
  /constants/displayLabels.ts — ⬜ NOT YET BUILT (PORT-10b)

---

## WHAT TO BUILD — SESSION 07

Build in this exact order. Do not skip ahead.

---

## TASK 0: Rename insights.tsx → invest.tsx

Before any new code:

```
In /app/(tabs)/, rename insights.tsx to invest.tsx.
Update /app/(tabs)/_layout.tsx to reference invest.tsx
and change the tab label from "Insights" to "Invest".
Update the tab icon if needed — keep the lightbulb or
use a chart/growth icon from the existing icon set.
No other changes.
```

Commit: [CHORE] Rename insights tab → invest

---

## PORT-10b: HoldingDetailScreen Enrichment

Four changes to the existing detail screen. Build all four
in a single Claude Code prompt, in this order.

---

### PORT-10b Fix 1 — Display Labels

**New file:** `/constants/displayLabels.ts`

```typescript
export const ASSET_TYPE_LABELS: Record<string, string> = {
  in_mutual_fund:      'Mutual Fund',
  in_direct_equity:    'Direct Equity',
  in_nre_nro:          'NRE/NRO Account',
  in_ppf:              'PPF',
  in_epf:              'EPF',
  in_fd:               'Fixed Deposit',
  in_nsc:              'NSC',
  eu_etf:              'ETF',
  eu_pension:          'Pension Fund',
  us_equity:           'US Equity',
  employer_rsu:        'RSU',
  employer_espp:       'ESPP',
  cash_general:        'Cash',
  crypto_general:      'Crypto',
  alternative_general: 'Private Investment',
}

export const GEOGRAPHY_LABELS: Record<string, string> = {
  india:   'India',
  europe:  'Europe',
  us:      'United States',
  uk:      'United Kingdom',
  global:  'Global',
  uae:     'UAE',
  other:   'Other',
}

export function getAssetTypeLabel(subtype: string): string {
  return ASSET_TYPE_LABELS[subtype] ?? subtype
}

export function getGeographyLabel(geography: string): string {
  return GEOGRAPHY_LABELS[geography] ?? geography
}
```

**Update /app/portfolio/[holdingId].tsx:**
  Import getAssetTypeLabel, getGeographyLabel from displayLabels.ts
  Replace all instances of holding.assetType with
    getAssetTypeLabel(holding.assetSubtype ?? holding.assetType)
  Replace holding.geography with getGeographyLabel(holding.geography)

**Update /components/portfolio/BucketReassignSheet.tsx:**
  Import getAssetTypeLabel
  Fix reasoning text:
    "We placed this in {holding.bucket} because it's a
     {getAssetTypeLabel(holding.assetSubtype ?? holding.assetType)}.
     Change it if that doesn't fit how you think about this money."

---

### PORT-10b Fix 2 — HoldingPriceChart

**New file:** `/components/portfolio/HoldingPriceChart.tsx`

Only renders for live holdings where priceHistory is available.
Does NOT render for: cash_general, in_ppf, in_epf, in_fd, in_nsc,
eu_pension, alternative_general (no meaningful price series).

Props:
  holding: PortfolioHolding
  currency: string

Mock time-series data (hardcode in this component for now —
real data comes from price refresh service in data layer session):

```typescript
// Generate mock price history inside the component
// 365 days of plausible data points
// Use a seeded random walk from holding.currentValue
// going back 12 months
function generateMockHistory(currentValue: number, days: number) {
  const points = []
  let value = currentValue * 0.82  // start ~18% lower 12mo ago
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    value = value * (1 + (Math.random() - 0.46) * 0.015)
    points.push({ date: date.toISOString().split('T')[0], value })
  }
  points[points.length - 1].value = currentValue  // end at current
  return points
}
```

Tab selector: 1M / 6M / 1Y
  Active tab: accent green text, small underline bar
  Inactive: textSecondary

Chart visual (SVG-based using react-native-svg, already installed):
  Container: marginTop 16, marginHorizontal -20 (bleed to edges)
  Height: 140px
  Background: transparent

  Line: single SVG path, stroke colours.accent, strokeWidth 1.5
  Gradient fill beneath line:
    LinearGradient from colours.accent at 30% opacity (top)
    to transparent (bottom)

  Y-axis: no labels — let the shape tell the story
  X-axis: 3 date labels only (start, middle, end of range)
    Inter_400Regular, fontSize 10, colours.textDim

  Touch interaction: on web, skip touch interaction for now.
    (Native gesture handling in QA session)

  Current value dot: filled circle at rightmost data point
    radius 4, fill colours.accent

  If holding.currentValue > history[0].value:
    Gradient tint: accent green (up)
  Else:
    Line stroke: colours.danger
    Gradient fill: colours.danger at 20% opacity

Position in [holdingId].tsx:
  Render HoldingPriceChart immediately after the hero value
  section and before the MacronRule + details section.
  Only for live holdings (holding.bucket !== 'LOCKED' and
  holding.assetSubtype !== 'cash_general' and
  holding.assetSubtype !== 'alternative_general')

---

### PORT-10b Fix 3 — HoldingInsightCard

**New file:** `/components/portfolio/HoldingInsightCard.tsx`

Props:
  holding: PortfolioHolding

Mock insight data (hardcode based on assetSubtype for now):

```typescript
const MOCK_HOLDING_INSIGHTS: Partial<Record<string, {
  label: string
  headline: string
  body: string
  source: string
  hoursAgo: number
}>> = {
  in_mutual_fund: {
    label: 'FUND UPDATE',
    headline: 'PPFAS filed updated portfolio disclosure',
    body: 'Fund house increased allocation to US tech by 3.2% in February. Top 10 holdings unchanged. Expense ratio stable at 0.58%.',
    source: 'PPFAS Investor Letter',
    hoursAgo: 14,
  },
  eu_etf: {
    label: 'MARKET EVENT',
    headline: 'ECB holds rates — broad ETF impact limited',
    body: 'ECB held rates at 3.15% as expected. European equity ETFs saw modest inflows. VWRL exposure is geographically diversified.',
    source: 'ECB Announcement',
    hoursAgo: 6,
  },
  in_direct_equity: {
    label: 'EARNINGS',
    headline: 'Q3 results beat estimates by 4%',
    body: 'Revenue up 18% YoY, margins expanded 120bps. Management guided for continued growth in FY26. Analyst consensus positive.',
    source: 'NSE Filings',
    hoursAgo: 22,
  },
  employer_rsu: {
    label: 'COMPANY NEWS',
    headline: 'Q4 earnings call scheduled for next week',
    body: 'Management to address guidance revision and buyback programme. Analyst consensus: hold. RSU vesting schedule unaffected.',
    source: 'Company IR',
    hoursAgo: 31,
  },
}
```

If no mock insight for this subtype: return null (don't render).

Visual:
  Card: theme.surface, borderRadius 16, padding 16
  marginTop 12, marginBottom 4

  Top row (flexDirection row, alignItems center, marginBottom 8):
    KasheAsterisk size=12, animated=false, direction="neutral"
    Label text: insight.label
      Inter_500Medium, fontSize 11, colours.textDim
      textTransform uppercase, letterSpacing 0.8, marginLeft 6
    Spacer (flex 1)
    Source + time: "{source} · {hoursAgo}h ago"
      Inter_400Regular, fontSize 11, colours.textDim

  Headline:
    SpaceGrotesk_600SemiBold, fontSize 15, colours.textPrimary
    marginBottom 4

  Body:
    Inter_400Regular, fontSize 13, colours.textSecondary
    lineHeight 19

  Footer note (marginTop 8):
    "Powered by Kāshe AI · Not financial advice"
    Inter_400Regular, fontSize 10, colours.textDim

Position in [holdingId].tsx:
  Render HoldingInsightCard after HoldingPriceChart
  and before the details section MacronRule.
  Only for live holdings.

---

### PORT-10b Fix 4 — Visual Redesign of Detail Screen

The current screen feels like a spreadsheet row.
Redesign the layout so it feels alive and premium.

Key changes to /app/portfolio/[holdingId].tsx:

HERO SECTION — make it breathe:
  Add paddingTop 32 (was 20)
  Current value: fontSize 40 (was 36), letterSpacing -1.5
  Daily change row: add a subtle background pill around the change
    paddingHorizontal 10, paddingVertical 4, borderRadius 999
    backgroundColor: positive → rgba(200,240,74,0.12)
                    negative → rgba(255,92,92,0.10)
                    neutral  → theme.border
  "X% of live portfolio": add marginTop 6, fontSize 14

ONE-LINE NARRATIVE (new — add between hero and chart):
  A single human sentence summarising this holding's story.
  Constructed from holding data — not AI-generated.

  Logic:
    LOCKED: "Locked until {unlockDate} · projected {FV} at unlock"
    PROTECTION: "Your emergency fund · {months} months of expenses covered"
    GROWTH positive: "Up {pct}% this month · {allocationPct}% of your portfolio"
    GROWTH negative: "Down {pct}% this month · {allocationPct}% of your portfolio"
    STABILITY: "{allocationPct}% of live portfolio · last updated {date}"

  Style: Inter_400Regular, fontSize 14, colours.textSecondary
  marginBottom 16

DETAILS SECTION — reduce visual weight:
  Group into two logical sections with a subtle label:

  "POSITION DETAILS" (label style, uppercase, textDim, letterSpacing 0.8)
    Rows: Units · Price per unit · Purchase price · Unrealised gain/loss

  "ABOUT THIS HOLDING" (label style, uppercase, textDim, letterSpacing 0.8)
    marginTop 16
    Rows: Asset type · Geography · Tax wrapper · Data source · Last updated

  Each row: paddingVertical 10 (was 12 — slightly tighter)
  Left label: fontSize 13, colours.textSecondary (unchanged)
  Right value: fontSize 13, colours.textPrimary (unchanged)

PURPOSE BUCKET ROW — make it feel more intentional:
  Add a subtle background: theme.surface, borderRadius 12
  padding 14 inside the row
  "Purpose bucket" label: unchanged
  Right side: add a small bucket colour pill before the bucket name
    4px × 16px pill, borderRadius 2
    GROWTH: colours.accent at 60% opacity
    STABILITY: colours.warning at 60% opacity
    LOCKED: colours.textDim at 60% opacity

ACTION BUTTONS — cleaner spacing:
  Add marginTop 32 (was 24) before the button group
  Buttons: paddingVertical 16 (was 14) — slightly more generous

---

## PORT-11: Portfolio Empty State

Wire into /app/(tabs)/portfolio.tsx.

```
Add at top of component:
  const hasData = true  // toggle false to preview

Wrap ScrollView content:
  <View style={{ opacity: hasData ? 1 : 0.5 }}>
    {/* all existing content */}
  </View>

Pass isRedacted={!hasData} to:
  PortfolioTotalsCard, InvestmentPlanCard,
  PortfolioSectionHeader (all 3), PortfolioHoldingRow (all)

PortfolioInsightStrip: insight={hasData ? mockInsight : null}

Floating pill (outside ScrollView, position absolute):
  Only visible when !hasData
  {!hasData && (
    <View style={styles.emptyPill}>
      <TouchableOpacity
        style={[styles.pillButton, { backgroundColor: colours.accent }]}
        onPress={() => console.log('Open invitation sheet')}
      >
        <KasheAsterisk size={14} animated={false} direction="neutral" />
        <Text style={styles.pillText}>  Connect your data</Text>
      </TouchableOpacity>
    </View>
  )}

  Pill styles:
    emptyPill: position absolute, bottom 24, left/right 0, alignItems center, zIndex 10
    pillButton: flexDirection row, alignItems center, paddingHorizontal 20,
                paddingVertical 12, borderRadius 999
    pillText: SpaceGrotesk_600SemiBold, fontSize 14, colour colours.textPrimary

Test hasData=true and hasData=false. Screenshot both.
```

---

## SESSION 07b: Invest Tab — INV-01 through INV-06

Only start this after PORT-10b and PORT-11 are committed.

---

### INV-00: Rename + shell

Already done in TASK 0 above.

---

### INV-01: RiskProfileCard + RiskProfileSheet

**File:** `/components/invest/RiskProfileCard.tsx`
**Sheet:** `/components/invest/RiskProfileSheet.tsx`

RiskProfileCard — two states:

STATE 1 — Not set up:
  Card: theme.surface, borderRadius 16, padding 20
  KasheAsterisk size=16, direction="neutral", marginBottom 12
  Headline: "What kind of investor are you?"
    SpaceGrotesk_600SemiBold, fontSize 18, colours.textPrimary
  Body: "Tell us how you think about risk. We'll tailor your
         investment plan and suggestions."
    Inter_400Regular, fontSize 14, colours.textSecondary, marginTop 8
  [Set your risk profile →]
    Full-width, accent background, borderRadius 12
    Inter_500Medium, fontSize 15, dark text
    marginTop 16
    onPress: open RiskProfileSheet

STATE 2 — Set up, showing current profile:
  Card: theme.surface, borderRadius 16, padding 20
  Top row: "RISK PROFILE" label (textDim, uppercase) + [Edit] text link right
  Profile name: SpaceGrotesk_600SemiBold, fontSize 22, colours.textPrimary
    e.g. "Balanced"
  Description: Inter_400Regular, fontSize 14, colours.textSecondary
    e.g. "Grow steadily, some volatility is fine"
  Allocation targets row (3 pills, marginTop 12):
    GROWTH 60% · STABILITY 20% · LOCKED 20%
    Each pill: rounded, textDim background, Inter_500Medium, fontSize 12
    Growth pill: accent background

RiskProfileSheet — bottom sheet, 3 questions:
  Drag handle + "Your risk profile" heading

  Visual: three option cards stacked, not a quiz
  Each card: TouchableOpacity, borderRadius 12, padding 16
    Selected: border 2px colours.accent, backgroundColor rgba(200,240,74,0.08)
    Unselected: border 1px theme.border

  Option 1 — Conservative:
    "Conservative"   SpaceGrotesk_600SemiBold, fontSize 16
    "Protect what I have, grow slowly"
      Inter_400Regular, fontSize 13, colours.textSecondary
    "Target: 40% Growth · 40% Stability · 20% Locked"
      Inter_400Regular, fontSize 12, colours.textDim, marginTop 4

  Option 2 — Balanced:
    "Balanced"
    "Grow steadily, some volatility is fine"
    "Target: 60% Growth · 20% Stability · 20% Locked"

  Option 3 — Growth:
    "Growth"
    "Maximise growth, I can ride out dips"
    "Target: 80% Growth · 10% Stability · 10% Locked"

  [Confirm] accent button
  [Cancel] text link

  Default selection: Balanced (pre-selected on first open)
  onConfirm: console.log for now — data layer session wires this

---

### INV-02: InvestmentPlanFull

**File:** `/components/invest/InvestmentPlanFull.tsx`

This is the promoted, full version of InvestmentPlanCard.
InvestmentPlanCard on Portfolio tab remains as a summary.
This is the expanded view — always open, no collapse.

Shares visual language with InvestmentPlanCard but:
  - Always expanded (no collapse toggle)
  - Allocation targets from risk profile (not hardcoded)
  - Shows gap clearly: "You're €X short of your Growth target"
  - [Explore Growth options →] links to InstrumentSuggestions section

Use MOCK_INVESTMENT_PLAN from mockData.ts.
Risk profile mock: assume Balanced (60/20/20) for now.

---

### INV-03: MonthlyReviewCard + MonthlyReviewSheet

**File:** `/components/invest/MonthlyReviewCard.tsx`
**Sheet:** `/components/invest/MonthlyReviewSheet.tsx`

MonthlyReviewCard — four states per CLAUDE-experience.md spec:

STATE 1 — Review available, not yet viewed:
  4px left border in colours.accent
  "MONTHLY REVIEW" label (textDim, uppercase, letterSpacing 0.8)
  "Your {month} review is ready"
    SpaceGrotesk_700Bold, fontSize 18, colours.textPrimary
  "Generated {date}" Inter_400Regular, fontSize 12, colours.textDim
  [Read your {month} review →] accent button, full width

STATE 2 — Review available, already viewed:
  No accent border
  "{month} review" Inter_500Medium, fontSize 16, colours.textPrimary
  [Open →] text link, colours.textSecondary

STATE 3 — Review not yet available:
  "Available once you have 3 months of data"
  No CTA

STATE 4 — Insufficient data:
  "Add more data to unlock monthly reviews"
  "[+ Upload bank statement]" text link

Use STATE 1 as mock for preview.
Month: "March"  Date: "16 March 2026"

MonthlyReviewSheet — full-height scrollable bottom sheet:
  Header: "March 2026 Review" + drag handle
  Five sections per CLAUDE-experience.md spec:
    WHERE YOU STAND
    HOW YOUR MONEY IS WORKING (Growth / Stability / Locked / Protection)
    THIS MONTH'S PRIORITY
    FIRE UPDATE (null if not set up — show "Set up FIRE planner" prompt)
    NEXT MONTH — WATCH FOR

  Mock content for all sections — realistic, plausible.
  Footer: "Generated by Kāshe AI · Based on your data only · Not financial advice"

---

### INV-04: FIRETeaserCard

**File:** `/components/invest/FIRETeaserCard.tsx`

Two states per CLAUDE-experience.md spec.

STATE 1 — FIRE not set up:
  "FINANCIAL INDEPENDENCE" label (textDim, uppercase)
  "When could you stop working?"
    SpaceGrotesk_700Bold, fontSize 18, colours.textPrimary
  "Set up your FIRE planner — it takes 2 minutes."
    Inter_400Regular, fontSize 14, colours.textSecondary
  [Set up FIRE planner →] text link, colours.accent
    → console.log for now (routes to /invest/fire when built)

STATE 2 — FIRE set up (mock data):
  "FINANCIAL INDEPENDENCE" label
  "2036" — SpaceGrotesk_700Bold, fontSize 48, colours.textPrimary
  Progress bar: 600ms ease-out on mount, accent fill
    Mock: 34% of FIRE number
  "34% of your independence number"
    Inter_400Regular, fontSize 14, colours.textSecondary
  "€X,XXX to go" — Inter_400Regular, fontSize 13, colours.textDim
  [Open FIRE planner →] text link, colours.textSecondary

Use STATE 1 for default mock preview.

---

### INV-05: Wire /app/(tabs)/invest.tsx

```
Structure (top to bottom, ScrollView):

Header row:
  "Invest" SpaceGrotesk_600SemiBold, fontSize 24
  [+] button right (same style as Portfolio)

<RiskProfileCard />          always first
<MacronRule marginTop 24 />
<InvestmentPlanFull />
<MacronRule marginTop 24 />
<MonthlyReviewCard />
<MacronRule marginTop 24 />
<FIRETeaserCard />

Sheets (outside ScrollView):
<RiskProfileSheet ... />
<MonthlyReviewSheet ... />

State:
  riskProfileSheet: { visible: boolean }
  monthlyReviewSheet: { visible: boolean }
  riskProfile: 'conservative' | 'balanced' | 'growth' — default 'balanced'
```

---

### INV-06: Invest Tab Empty State

Same ghost pattern as other tabs.
hasData = true to preview populated state.
hasData = false → 0.5 opacity + floating pill.

---

## AFTER SESSION 07

Run full tab-bar check:
  Home → Spend → Portfolio → Invest
  All four tabs render without errors
  Both light and dark mode
  hasData=true and hasData=false on Portfolio + Invest

Then produce kashe-handoff-session-08.md.
Session 08 = FIRE Planner screen (/app/invest/fire.tsx)

---

## KNOWN OPEN ISSUES (carry forward)

1. Display labels (in_mutual_fund etc) — fix in PORT-10b
2. Dutch brand names in mock data — data layer session
3. Category detail screen layout gap — Polish session
4. KasheAsterisk k-stroke prominence — Polish session
5. Vertical MacronRule in PortfolioTotalsCard — Polish session
6. TextInput monthly target formatting — Polish session
7. PPF Account currency (₹420,000) — data layer session

---

## QUICK REFERENCE

1.  --legacy-peer-deps every npm install
2.  Never react-native-reanimated
3.  const theme = useTheme() — never destructured
4.  theme.* surface/border/background. colours.* everything else.
5.  StyleSheet.create() always. No inline styles.
6.  formatCurrency() always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero any.
9.  Space Grotesk numbers. Inter body. Never Syne/DM Sans.
10. Git manually. MD files replaced in full. Never edited inline.
