# Kāshe — Session 09 Handoff Document
*Session 08 → Session 09*
*Date: 17 March 2026*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + investment domain expert
helping Anand build Kāshe — a personal finance app for globally
mobile professionals managing multi-currency finances across
geographies. Anand is a coding beginner with strong product
instincts. One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md (full build state + locked decisions)
2. This file (what to build)
3. engineering-rules.md
4. design-system.md
5. CLAUDE-financial.md (instrument suggestion logic lives here)

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

## WHAT WAS BUILT — SESSION 08

### PORT-11: Portfolio empty state ✅
- 0.5 opacity ghost over all content
- Full redaction: name blocks (grey pill), no values,
  no percentages, no "months covered", no unlock dates
- Floating acid green pill: "Connect your data"
- hasData toggle wired in portfolio.tsx

### Mock data overhaul ✅
- All Indian-specific holdings replaced with geography-neutral set
- New holdings: VWRL (Ireland), Invesco Nasdaq 100 (Ireland),
  Apple RSU (United States), Current Account (Netherlands),
  High-Yield Savings (United States), Roth IRA (United States),
  Seedrs Portfolio (United Kingdom)
- domicile field added to PortfolioHolding type
- HoldingRow subtitle now shows domicile country
- Geography labels title-cased in displayLabels.ts
- Seedrs shows "Outcome unknown" (no unlockDate)

### Tab 4 confirmed as Invest ✅
- insights.tsx deleted, invest.tsx shell in place
- _layout.tsx updated

---

## KNOWN BUG REGISTRY (carried forward)

### 🔴 Fix before beta
1. Hero number wrapping: €123,500 splits across two lines
   in PortfolioTotalsCard two-column layout.
   Fix: reduce hero font size to fit column width.
   Session: Polish.

2. PPF Account was replaced in mock data but the
   GROWTH section total (€102,400) may still be
   inflated. Verify when data layer is wired.

3. Dutch brand names in Spend mock data:
   Albert Heijn/Jumbo → "Supermarket" etc.
   Fix: before data layer session.

### 🟡 Polish session
4. Chart spike at end of 1M view
5. KasheAsterisk watermark alignment minor offset
6. KasheAsterisk k-stroke prominence
7. Vertical MacronRule in TotalsCard (plain View)
8. TextInput monthly target not currency-formatted
9. Category detail screen gap between month selector
   and tag pills

---

## WHAT TO BUILD — SESSION 09

Build in this exact order. Do not skip ahead.

---

## INV-01: RiskProfileCard + RiskProfileSheet

**Files:**
  /components/invest/RiskProfileCard.tsx
  /components/invest/RiskProfileSheet.tsx
  /types/riskProfile.ts (new)

### /types/riskProfile.ts
```typescript
export type RiskProfileType = 'conservative' | 'balanced' | 'growth'

export interface RiskProfile {
  type: RiskProfileType
  label: string           // "Conservative" | "Balanced" | "Growth"
  description: string     // one line user-facing
  targetAllocation: {
    growth: number        // percentage 0-100
    stability: number
    locked: number
  }
}

export const RISK_PROFILES: Record<RiskProfileType, RiskProfile> = {
  conservative: {
    type: 'conservative',
    label: 'Conservative',
    description: 'Protect what I have, grow slowly',
    targetAllocation: { growth: 40, stability: 40, locked: 20 },
  },
  balanced: {
    type: 'balanced',
    label: 'Balanced',
    description: 'Grow steadily, some volatility is fine',
    targetAllocation: { growth: 60, stability: 20, locked: 20 },
  },
  growth: {
    type: 'growth',
    label: 'Growth',
    description: 'Maximise growth, I can ride out dips',
    targetAllocation: { growth: 80, stability: 10, locked: 10 },
  },
}
```

### RiskProfileCard — two states

STATE 1 — Not set up:
  Card: theme.surface, borderRadius 16, padding 20
  KasheAsterisk size=16, animated=false, direction="neutral"
  marginBottom 12
  "What kind of investor are you?"
    SpaceGrotesk_600SemiBold, fontSize 18, theme.textPrimary
  "Tell us how you think about risk. We'll tailor your
   investment plan and suggestions."
    Inter_400Regular, fontSize 14, theme.textSecondary, marginTop 8
  [Set your risk profile →]
    Full-width, backgroundColor colours.accent
    borderRadius 12, paddingVertical 14
    Inter_500Medium, fontSize 15, colour '#111110'
    marginTop 16
    onPress: open RiskProfileSheet

STATE 2 — Set (showing current profile):
  Card: theme.surface, borderRadius 16, padding 20
  Top row:
    "RISK PROFILE" Inter_500Medium, fontSize 11,
      theme.textDim, uppercase, letterSpacing 0.8
    [Edit] Inter_400Regular, fontSize 13,
      colours.accent, right-aligned
  Profile label: SpaceGrotesk_600SemiBold, fontSize 22,
    theme.textPrimary, marginTop 4
  Description: Inter_400Regular, fontSize 14,
    theme.textSecondary, marginTop 4
  Allocation pills (flexDirection row, gap 8, marginTop 12):
    GROWTH X% — backgroundColor rgba(200,240,74,0.15),
      text colours.accent
    STABILITY X% — backgroundColor theme.border,
      text theme.textSecondary
    LOCKED X% — backgroundColor theme.border,
      text theme.textSecondary
    Each pill: paddingHorizontal 10, paddingVertical 4,
      borderRadius 999, Inter_500Medium, fontSize 12

Props:
  riskProfile: RiskProfileType | null
  onOpenSheet: () => void

### RiskProfileSheet

Modal bottom sheet, drag handle at top.
"Your risk profile"
  SpaceGrotesk_600SemiBold, fontSize 18, theme.textPrimary
  marginBottom 20

Three option cards stacked, gap 12:
  TouchableOpacity, borderRadius 12, padding 16
  Selected: borderWidth 2, borderColor colours.accent,
    backgroundColor rgba(200,240,74,0.08)
  Unselected: borderWidth 1, borderColor theme.border

  Each card shows:
    Profile label: SpaceGrotesk_600SemiBold, fontSize 16,
      theme.textPrimary
    Description: Inter_400Regular, fontSize 13,
      theme.textSecondary, marginTop 2
    "Target: X% Growth · X% Stability · X% Locked"
      Inter_400Regular, fontSize 12, theme.textDim, marginTop 4

[Confirm] full-width accent button, marginTop 24
[Cancel] text link, theme.textSecondary, marginTop 12,
  textAlign center

Default selection on first open: 'balanced'
onConfirm(profile: RiskProfileType): void
onClose: () => void

Commit: [INV-01] RiskProfileCard + RiskProfileSheet

---

## INV-02: InvestmentPlanFull

**File:** /components/invest/InvestmentPlanFull.tsx

Always-expanded version of InvestmentPlanCard.
InvestmentPlanCard on Portfolio remains as collapsed summary.
This is the full planning view — never collapses.

Read InvestmentPlanCard.tsx before building.
Same visual language. Key differences:
- Always expanded, no toggle, no chevron
- Allocation targets from riskProfile prop (not hardcoded)
- Gap analysis per bucket:
  "You're €X short of your GROWTH target this month"
  Inter_400Regular, fontSize 13, theme.textSecondary
  Only show for underfunded buckets
- [Explore {bucket} options →] per underfunded bucket
  colours.accent, Inter_500Medium, fontSize 13
  onPress: console.log for now

Props:
  plan: InvestmentPlan (from MOCK_INVESTMENT_PLAN)
  riskProfile: RiskProfileType (default 'balanced')

Gap calculation:
  targetAmount = (allocation% / 100) * plan.monthlyTarget
  invested = investedThisBucket (mock: use 0 for simplicity)
  gap = targetAmount - invested
  Show gap row only if gap > 0

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
  "MONTHLY REVIEW" Inter_500Medium, fontSize 11,
    theme.textDim, uppercase, letterSpacing 0.8
  "Your March review is ready"
    SpaceGrotesk_700Bold, fontSize 18, theme.textPrimary
    marginTop 4
  "Generated 16 March 2026"
    Inter_400Regular, fontSize 12, theme.textDim, marginTop 4
  [Read your March review →]
    Full-width accent button, marginTop 16
    onPress: open MonthlyReviewSheet

STATE 2 — already viewed:
  No accent border
  "March review"
    Inter_500Medium, fontSize 16, theme.textPrimary
  [Open →] Inter_400Regular, theme.textSecondary
    marginTop 8

STATE 3 — not yet available (<3 months data):
  "Available once you have 3 months of data"
    Inter_400Regular, fontSize 14, theme.textSecondary

STATE 4 — insufficient data:
  "Add more data to unlock monthly reviews"
    Inter_400Regular, fontSize 14, theme.textSecondary
  "[+ Upload bank statement]"
    Inter_400Regular, colours.accent, marginTop 8
    onPress: console.log

Props:
  state: 'available' | 'viewed' | 'pending' | 'insufficient'
  onOpen: () => void
Use state='available' for preview.

### MonthlyReviewSheet

Full-height scrollable bottom sheet.
Drag handle + "March 2026 Review"
  SpaceGrotesk_600SemiBold, fontSize 18, theme.textPrimary

Five sections. Each section:
  Label: Inter_500Medium, fontSize 11, theme.textDim,
    uppercase, letterSpacing 0.8, marginBottom 8
  Content: Inter_400Regular, fontSize 14, theme.textSecondary

"WHERE YOU STAND"
  "You've invested €920 of your €1,500 monthly target.
   Your live portfolio grew 2.3% this month, outperforming
   the MSCI World by 0.8%."

"HOW YOUR MONEY IS WORKING"
  "Growth: €102,400 — up 2.3% this month"
  "Stability: €21,100 — emergency fund at 2.8 months"
  "Locked: €48,200 — Roth IRA on track for Jan 2041"

"THIS MONTH'S PRIORITY"
  "Your Growth bucket is €580 below your 60% target.
   Consider directing this month's remaining €580 into
   a diversified ETF before month end."

"FIRE UPDATE"
  "Based on your current savings rate and portfolio growth,
   you're projected to reach financial independence by 2036.
   That's unchanged from last month."

"NEXT MONTH — WATCH FOR"
  "Federal Reserve meeting on 7 April may affect US equity
   allocation. Roth IRA contribution deadline: 15 April."

Footer:
  "Generated by Kāshe AI · Based on your data only ·
   Not financial advice"
  Inter_400Regular, fontSize 11, theme.textDim
  textAlign center, marginTop 24, marginBottom 12

Commit: [INV-03] MonthlyReviewCard + MonthlyReviewSheet

---

## INV-04: FIRETeaserCard

**File:** /components/invest/FIRETeaserCard.tsx

Props:
  fireSetUp: boolean
  onSetUp?: () => void
  onOpen?: () => void

STATE 1 — not set up (use for preview):
  Card: theme.surface, borderRadius 16, padding 20
  "FINANCIAL INDEPENDENCE"
    Inter_500Medium, fontSize 11, theme.textDim,
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
    onPress: onSetUp (console.log for now)

STATE 2 — set up (mock):
  "FINANCIAL INDEPENDENCE" label (same)
  "2036"
    SpaceGrotesk_700Bold, fontSize 48, theme.textPrimary
    letterSpacing -2, marginTop 8
  Progress bar (marginTop 12):
    Track: theme.border, height 4, borderRadius 999
    Fill: colours.accent, width 34% animated on mount
      0 → 34%, 600ms ease-out (Animated API)
  "34% of your independence number"
    Inter_400Regular, fontSize 14, theme.textSecondary
    marginTop 8
  "€583,380 to go"
    Inter_400Regular, fontSize 13, theme.textDim
    marginTop 4
  [Open FIRE planner →]
    Inter_400Regular, fontSize 13, theme.textSecondary
    marginTop 16
    onPress: onOpen (console.log for now)

Commit: [INV-04] FIRETeaserCard

---

## INV-05: InstrumentDiscoverySection

**File:** /components/invest/InstrumentDiscoverySection.tsx

This is the new component PM confirmed in Session 08.
Dedicated discovery section: "Worth exploring for your
GROWTH gap" — separate from portfolio, separate from
InvestmentPlanFull suggestions.

This is THE most important component on the Invest tab.
Read the full instrument logic spec below before building.

### The suggestion logic (implement as static for now)

Suggestion engine runs client-side. In V1 it uses static
curated lists. In V2 it will query a live instrument feed.

**Step 1 — Identify the gap:**
  Most underfunded bucket relative to risk profile target.
  Example: riskProfile=balanced (60% Growth target),
  current Growth = 59% → gap = 1% → not significant.
  Threshold: only show suggestions if gap > 5%.

**Step 2 — Identify user's current tier:**
  Based on existing holdings, classify user tier per bucket:

  GROWTH tiers:
    TIER_0 — No growth holdings → suggest broad market ETFs
    TIER_1 — Has broad ETF (VWRL/MSCI World equiv) →
              suggest regional tilt or factor ETFs
    TIER_2 — Has broad + regional → suggest thematic or
              individual equity exposure
    TIER_3 — Diversified across styles → suggest
              10% experimentation budget instruments

  STABILITY tiers:
    TIER_0 — No stability → suggest emergency fund first
    TIER_1 — Has emergency fund < 3 months → top it up
    TIER_2 — Has 3+ months → suggest bond ETFs / MMFs
    TIER_3 — Well covered → suggest short-duration bonds

  LOCKED tiers:
    TIER_0 — No locked → suggest pension/retirement wrapper
    TIER_1 — Has one locked → suggest second geography
    TIER_2 — Multi-geography locked → no suggestions needed

**Step 3 — Filter by geography:**
  User's existing holding geographies drive suggestions.
  Never suggest instruments outside user's known geographies
  until TIER_2+ (when diversification itself is the point).

**Step 4 — Apply "worth exploring" framing:**
  Never: "Buy X" or "Invest in Y"
  Always: "Worth exploring", "Used by investors like you",
  "A common next step from where you are"

### Instrument catalogue (static, curated)

Build this as /constants/instrumentCatalogue.ts

```typescript
// Tier-tagged instrument catalogue
// Never affiliate links. Never buy/sell language.
// "Worth exploring" framing only.

GROWTH — TIER_0 (starting point, broad market):
  { name: 'VWRL — Vanguard FTSE All-World',
    type: 'eu_etf', domicile: 'Ireland',
    description: 'One ETF, the entire world. The default
      starting point for long-term global equity exposure.',
    why: 'Low cost, maximum diversification, UCITS-compliant
      for EU residents.',
    tier: 0, bucket: 'GROWTH' }

  { name: 'IWDA — iShares Core MSCI World',
    type: 'eu_etf', domicile: 'Ireland',
    description: 'Developed markets only. Slightly lower
      volatility than VWRL by excluding emerging markets.',
    why: 'Popular alternative to VWRL for conservative
      growth investors.',
    tier: 0, bucket: 'GROWTH' }

GROWTH — TIER_1 (regional tilt):
  { name: 'CSPX — iShares Core S&P 500',
    type: 'eu_etf', domicile: 'Ireland',
    description: 'US large-cap exposure. Complements a
      global ETF with a tilt toward US tech and growth.',
    why: 'A common addition once you have broad market
      exposure.',
    tier: 1, bucket: 'GROWTH' }

  { name: 'XNAS — Xtrackers Nasdaq 100',
    type: 'eu_etf', domicile: 'Luxembourg',
    description: 'US tech concentration. Higher growth
      potential, higher volatility.',
    why: 'Used by investors who want explicit tech exposure
      beyond what VWRL provides.',
    tier: 1, bucket: 'GROWTH' }

  { name: 'NIFTY 50 Index Fund',
    type: 'in_mutual_fund', domicile: 'India',
    description: 'India\'s 50 largest companies. Low-cost
      passive exposure to Indian equities.',
    why: 'Natural complement if you have EU/US equity but
      no India exposure.',
    tier: 1, bucket: 'GROWTH' }

GROWTH — TIER_2 (thematic / factor):
  { name: 'IQQH — iShares Global Clean Energy',
    type: 'eu_etf', domicile: 'Ireland',
    description: 'Clean energy companies globally.
      Thematic exposure with higher tracking error.',
    why: 'A thematic satellite position for investors
      already well-diversified at the core.',
    tier: 2, bucket: 'GROWTH' }

  { name: 'IWFQ — iShares Edge MSCI World Quality Factor',
    type: 'eu_etf', domicile: 'Ireland',
    description: 'Quality factor tilt — companies with
      strong balance sheets and stable earnings.',
    why: 'Factor investing complement for investors who
      want to go beyond market-cap weighting.',
    tier: 2, bucket: 'GROWTH' }

GROWTH — TIER_3 (experimentation budget):
  { name: 'Individual equities',
    type: 'eu_direct_equity',
    description: 'Single stock positions. Higher risk,
      requires research and conviction.',
    why: 'Only for the 5-10% of your portfolio you\'re
      willing to actively manage.',
    tier: 3, bucket: 'GROWTH' }

STABILITY — TIER_0:
  { name: 'High-yield savings account',
    type: 'cash_general',
    description: 'The foundation. 3-6 months of expenses
      in an accessible account.',
    why: 'Before anything else — your protection buffer.',
    tier: 0, bucket: 'STABILITY' }

STABILITY — TIER_1:
  { name: 'AGGH — iShares Core Global Aggregate Bond',
    type: 'eu_etf', domicile: 'Ireland',
    description: 'Global bonds, hedged to EUR. Lower
      volatility than equities.',
    why: 'Standard bond allocation for the Stability
      bucket once emergency fund is covered.',
    tier: 1, bucket: 'STABILITY' }

  { name: 'IEAG — iShares Core Euro Aggregate Bond',
    type: 'eu_etf', domicile: 'Ireland',
    description: 'Eurozone bonds only. No currency risk
      for EUR-based investors.',
    why: 'Simpler than global bonds if your liabilities
      are EUR-denominated.',
    tier: 1, bucket: 'STABILITY' }

STABILITY — TIER_2:
  { name: 'Money market fund',
    type: 'cash_general',
    description: 'Cash-like returns with slightly higher
      yield than a savings account.',
    why: 'Parking excess stability allocation while
      maintaining near-instant liquidity.',
    tier: 2, bucket: 'STABILITY' }

LOCKED — TIER_0:
  { name: 'Employer pension',
    type: 'eu_pension',
    description: 'If your employer offers a pension
      scheme, maximising contributions is typically
      the highest-return move available.',
    why: 'Employer match is free money. Always maximise
      before anything else.',
    tier: 0, bucket: 'LOCKED' }

  { name: 'Roth IRA (US residents/citizens)',
    type: 'us_roth_ira',
    description: 'Tax-free growth and withdrawals.
      $7,000 annual contribution limit (2024).',
    why: 'One of the most tax-efficient wrappers
      available. Prioritise before taxable accounts.',
    tier: 0, bucket: 'LOCKED' }

LOCKED — TIER_1:
  { name: 'ISA — Stocks & Shares (UK)',
    type: 'uk_isa',
    description: '£20,000/year tax-free. If you have
      UK income or residency history, worth maintaining.',
    why: 'Tax wrapper that travels with you — useful for
      globally mobile professionals with UK ties.',
    tier: 1, bucket: 'LOCKED' }

  { name: 'NPS — National Pension System (India)',
    type: 'in_nps',
    description: 'Indian government pension scheme.
      Tax benefits under 80CCD.',
    why: 'If you have Indian income or plan to retire
      partially in India.',
    tier: 1, bucket: 'LOCKED' }
```

### Component visual spec

Card: theme.surface, borderRadius 16, padding 20

Header row:
  "WORTH EXPLORING" Inter_500Medium, fontSize 11,
    theme.textDim, uppercase, letterSpacing 0.8
  Bucket pill (accent for GROWTH, theme.border for others)
    Inter_500Medium, fontSize 11, borderRadius 999,
    paddingHorizontal 10, paddingVertical 3

Context line (below header, marginTop 4):
  "Based on your {riskProfile} profile and GROWTH gap"
  Inter_400Regular, fontSize 13, theme.textSecondary

Instrument rows (2 shown by default, expandable):
  Each row:
    Instrument name: Inter_500Medium, fontSize 15,
      theme.textPrimary
    Type · Domicile: Inter_400Regular, fontSize 12,
      theme.textDim
    Description: Inter_400Regular, fontSize 13,
      theme.textSecondary, marginTop 4
    "Why this?" label + why text collapsed behind
      [+ Why this?] Inter_400Regular, fontSize 12,
      colours.accent — tap expands inline
    Thin separator between rows

[Show more] link if >2 suggestions
  Inter_400Regular, fontSize 13, colours.accent
  marginTop 12

"Search for instruments →" at bottom
  Inter_400Regular, fontSize 13, theme.textSecondary
  onPress: console.log ('instrument search — V2')

Footer note:
  "Curated by Kāshe · No affiliate links ·
   Not financial advice"
  Inter_400Regular, fontSize 11, theme.textDim
  marginTop 16

Props:
  riskProfile: RiskProfileType
  holdings: PortfolioHolding[]
  (component computes tier + gap internally)

For mock preview: hardcode riskProfile='balanced',
use MOCK_PORTFOLIO_HOLDINGS, show GROWTH suggestions
at TIER_1 (user already has VWRL = TIER_0 covered).

Commit: [INV-05] InstrumentDiscoverySection

---

## INV-06: FinancialEducationSection

**File:** /components/invest/FinancialEducationSection.tsx

The "learn as you grow" section. Tied to user's current
tier — never shows concepts the user already demonstrates
understanding of through their holdings.

### Education logic

Tier mapping (same as discovery):
  User at TIER_0 → show "What is an ETF?"
  User at TIER_1 → show "What is a factor ETF?"
  User at TIER_2 → show "What is a thematic ETF?"
  User at TIER_3 → show "What is position sizing?"

Content catalogue (/constants/educationContent.ts):

```typescript
{
  id: 'what_is_etf',
  tier: 0,
  bucket: 'GROWTH',
  title: 'What is an ETF?',
  tagline: 'The building block of modern investing',
  body: 'An ETF (Exchange-Traded Fund) holds a basket of
    assets — stocks, bonds, or both — and trades on an
    exchange like a single stock. When you buy VWRL, you
    own a tiny slice of ~3,600 companies worldwide.',
  keyPoints: [
    'Instant diversification in one purchase',
    'Lower fees than actively managed funds',
    'UCITS ETFs are regulated for EU investors',
  ],
  readMore: 'Bogleheads wiki · Justetf.com',
},
{
  id: 'what_is_factor',
  tier: 1,
  bucket: 'GROWTH',
  title: 'What is factor investing?',
  tagline: 'Going beyond market-cap weighting',
  body: 'Factor ETFs tilt toward companies with specific
    characteristics — quality, value, momentum, low
    volatility. Research suggests certain factors have
    delivered excess returns over long periods.',
  keyPoints: [
    'Quality factor: strong balance sheets, stable earnings',
    'Value factor: cheap relative to fundamentals',
    'Higher tracking error than broad market ETFs',
  ],
  readMore: 'MSCI Factor Indexes · AQR research',
},
{
  id: 'what_is_thematic',
  tier: 2,
  bucket: 'GROWTH',
  title: 'What is a thematic ETF?',
  tagline: 'Concentrated bets on specific trends',
  body: 'Thematic ETFs concentrate on a single trend —
    clean energy, AI, robotics, healthcare innovation.
    Higher conviction required. These are satellites,
    not cores.',
  keyPoints: [
    'Higher volatility than broad market ETFs',
    'Best used as 5-15% of total equity allocation',
    'Trend may already be priced in by the time you buy',
  ],
  readMore: 'Morningstar thematic research',
},
{
  id: 'emergency_fund_first',
  tier: 0,
  bucket: 'STABILITY',
  title: 'Why emergency fund first?',
  tagline: 'The rule that protects everything else',
  body: 'Without 3-6 months of expenses in cash, a job
    loss or emergency forces you to sell investments at
    the worst time. The emergency fund is what lets you
    stay invested through market downturns.',
  keyPoints: [
    '3 months minimum, 6 months comfortable',
    'Keep it in an accessible account, not invested',
    'Replenish immediately if you ever use it',
  ],
  readMore: 'Freefincal · Mr Money Mustache',
},
{
  id: 'what_is_bond_etf',
  tier: 1,
  bucket: 'STABILITY',
  title: 'What is a bond ETF?',
  tagline: 'Lower volatility, steady income',
  body: 'Bonds are loans to governments or companies.
    Bond ETFs hold many bonds, providing steady income
    and lower correlation to equities. They dampen
    portfolio swings without sacrificing all returns.',
  keyPoints: [
    'Inverse relationship with interest rates',
    'Duration matters — shorter = less rate risk',
    'AGGH hedges currency risk for EUR investors',
  ],
  readMore: 'iShares bond investing guide',
},
```

### Component visual spec

Card: theme.surface, borderRadius 16, padding 20

Header row:
  "LEARN" Inter_500Medium, fontSize 11,
    theme.textDim, uppercase, letterSpacing 0.8
  "Matched to where you are"
    Inter_400Regular, fontSize 12, theme.textSecondary

Content card (single article, most relevant to current tier):
  Title: SpaceGrotesk_600SemiBold, fontSize 16,
    theme.textPrimary
  Tagline: Inter_400Regular, fontSize 13,
    theme.textSecondary, marginTop 2
  Body: collapsed by default — tap title to expand
    Inter_400Regular, fontSize 14, theme.textSecondary
    marginTop 8, lineHeight 22
  Key points (when expanded):
    3 bullet points, Inter_400Regular, fontSize 13,
    theme.textSecondary, marginTop 4
    Bullet: 4px × 4px accent circle, marginRight 8
  "Read more: {sources}"
    Inter_400Regular, fontSize 11, theme.textDim
    marginTop 12

[Next topic →] at bottom
  Shows title of next tier's topic
  Inter_400Regular, fontSize 13, colours.accent
  marginTop 16
  onPress: cycles to next content item

Props:
  riskProfile: RiskProfileType
  holdings: PortfolioHolding[]
  (computes current tier, selects most relevant article)

For mock: show 'what_is_factor' (user has VWRL = past TIER_0).

Commit: [INV-06] FinancialEducationSection

---

## INV-07: Wire /app/(tabs)/invest.tsx

Replace shell with full Invest tab.

Structure (top to bottom):

Header row (not inside ScrollView):
  "Invest" SpaceGrotesk_600SemiBold, fontSize 24,
    theme.textPrimary
  [+] button right — same style as Portfolio header

ScrollView:
  contentContainerStyle:
    paddingHorizontal 20, paddingTop 16, paddingBottom 48

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

Same pattern as Portfolio.

  const hasData = true  // toggle false to preview

  Wrap ScrollView content:
    <View style={{ opacity: hasData ? 1 : 0.5 }}>

  Floating pill (outside, position absolute):
    Same pattern as Portfolio.
    Only visible when !hasData.
    "+ Connect your data"

Preview: hasData=false, screenshot.
Set hasData=true for commit.

Commit: [INV-08] Invest tab empty state

---

## END OF SESSION 09 — VERIFICATION

After INV-08 committed:
  Home → Spend → Portfolio → Invest
  All four tabs render without errors
  Risk profile sheet opens and closes
  Monthly review sheet opens and closes
  Instrument discovery shows correct tier suggestions
  Education section shows correct tier content
  Both empty states confirmed

Then share screenshots of all four tabs.

---

## SESSION 10 PREVIEW

Session 10 = FIRE Planner screen
Route: /app/invest/fire.tsx (note: under invest/, not insights/)

Components:
  FIREHouseholdToggle
  FIRESliderHero (5–30 year range, real-time)
  FIREInputsCard (6 inputs, collapsible)
  FIREAssumptionsCard (country inflation defaults)
  FIREProfileSelector (individual vs household)

New file: /constants/fireDefaults.ts
  Netherlands: inflation 3.0%, equity return 7.0%
  India: inflation 5.0%, equity return 11.0%
  UK: inflation 3.0%, equity return 7.0%
  US: inflation 3.0%, equity return 7.0%
  Fallback: inflation 3.5%, equity return 7.0%

Spec: CLAUDE-experience.md → FIRE Planner Screen
      CLAUDE-financial.md → FIRE Engine

---

## V1.5 / V2 / NEVER BACKLOG

### V1.5 candidates
- SMS parsing for Indian bank accounts (CRED-style)
- Instrument search: live feed behind search icon
  (currently console.log placeholder)

### V2 candidates
- Open banking: Nordigen EU, AA India, Plaid US
- Email parsing (GDPR-careful, explicit consent)
- Couple sync via Supabase
- ML spend categorisation
- Conversational advisor ("ask Kāshe anything")
- Push notifications (opt-in)
- Year-end wrapped
- Real price chart data
- Live instrument catalogue (replaces static list)

### Never
- Physical assets
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
10. Hero card always dark — both modes.
11. Standard card: theme.surface, borderRadius 16, no border.
12. Screen layout: paddingHorizontal 20, paddingTop 16,
    paddingBottom 48. Gap between cards: marginTop 16.
    MacronRule between major sections: marginTop 24.
13. Detail screens: light background, dark hero card at top.
14. KasheAsterisk watermark on hero cards: position absolute,
    top -45, right -45, size 200×200, opacity 0.07.
15. Empty state = 0.5 opacity ghost + floating accent pill.
16. Git always manually. MD files replaced in full.
17. Never show raw subtype keys — use displayLabels.ts.
18. No standalone Insights tab. Tab 4 is Invest.
19. Risk profile drives all allocation targets. Never hardcoded.
20. Instrument suggestions: "worth exploring" framing only.
    Never buy/sell language. Never affiliate links.
21. Education content tier-matched to user's current holdings.
    Never show concepts user already demonstrates.
22. Numbers never truncate. Always wrap. (Polish: fix hero
    number font size for two-column layout.)
