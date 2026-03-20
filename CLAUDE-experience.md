# Kāshe — CLAUDE-experience.md
*Team Member 2: Experience & Delight*
*Read CLAUDE.md first, then this file.*
*Last updated: 20 March 2026 — font refs corrected, FIRE screen marked V2.*

---

## Typography System — LOCKED
```
Space Grotesk 700  — display numbers, hero figures
Space Grotesk 600  — card headings, prominent labels
Space Grotesk 400  — monospaced-feel secondary numbers
Inter 500          — labels (uppercase), medium body, pills
Inter 400          — body text, captions, secondary content

Kerning philosophy: tight throughout. Apple-esque.
  Display: letterSpacing -1.5
  Headings: letterSpacing -0.5 to -0.8
  Body: letterSpacing -0.2
  Labels: letterSpacing +0.8 (uppercase labels only)

Never use Syne or DM Sans — these are retired.
```

---
You own how Kāshe looks and feels. Every pixel, every animation,
every empty state, every moment of delight.
You do NOT write business logic. You do NOT touch data services.
You consume data via hooks and props — you never fetch directly.

---

## Your Domain
```
Design system     Implement tokens from CLAUDE.md exactly
UI components     All reusable components in /components
Screen layouts    All 4 tabs + onboarding + settings + FIRE planner
Navigation        Expo Router setup + bottom tab bar
Animations        Micro-interactions, price ticks, transitions
Empty states      Blurred ghost pattern on every screen
Dark/light mode   Both modes on every single component
Data viz          Progress bars, allocation bars, FIRE slider
```

---

## The Empty State Pattern
*LOCKED — March 2026. Do not revert to blurred overlay.*
Every screen and every card must have an empty state.
Never show a financial number as zero.

```
STANDARD PATTERN:
  Ghost screen fully rendered at 0.5 opacity — NOT blurred.
  All financial numbers → RedactedNumber component (XXXXXX chars).
  Screen is fully scrollable — user sees structure, not data.
  Mock data: always from /constants/mockData.ts — fixed constants only.
  Neutral brand names (e.g. "Supermarket" not "Albert Heijn").

  FLOATING PILL (always visible, position absolute):
    "+ Connect your data"
    Acid green (#C8F04A) background, borderRadius 999
    KasheAsterisk size 14 + SpaceGrotesk_600SemiBold
    bottom: 24, centred horizontally, zIndex 10

  INVITATION SHEET (on pill tap):
    Slides up from bottom, 350ms ease-out
    Dark scrim behind sheet
    Drag handle top centre (4px × 40px, borderRadius 2)
    KasheAsterisk (animated — idle pulse)
    Headline + description
    [+ Upload now] accent CTA button
    "Add manually instead" text link, textSecondary
    Dismisses on scrim tap or CTA/link action

  isRedacted prop pattern:
    Every financial component accepts isRedacted?: boolean
    When true: numbers → RedactedNumber, bar widths → 0
    Components with no meaningful redacted state: return null
      (e.g. MonthlyReviewLink returns null when isRedacted=true)

EXCEPTIONS (do not use standard pattern for these):

  InsightsEmptyInsightState — "no active insight"
    Data exists, nothing to flag right now.
    NOT a full empty state. Clean quiet card instead.
    Kāshe asterisk (small, static)
    "Nothing needs your attention right now."
    "Checked X hours ago" (textDim, small)
    This is silence from a trusted advisor — it is good news.
    No CTA. No encouragement to add data.

  FIRE planner — not set up yet
    FIRE has no meaningful populated ghost to mirror.
    Clean prompt card instead.
    One input shown immediately to lower activation energy.
    "Your FIRE number starts here"
    See FIRETeaserCard and FIREPlannerScreen specs below.
```

---

## The Kāshe Asterisk Component
The brand mark. Used in loading states, empty states, onboarding,
directional indicators, and as a signal on AI-generated content.
It does meaningful work — it is never just decoration.

```
Structure: 6-point asterisk SVG (3 lines through center)
5 strokes:  #8A8A85 (grey — fixed, not a token)
1 stroke:   #C8F04A (accent) — the k-stroke

Props:
  size?: number          default 16
  animated?: boolean     default false
  direction?: 'up' | 'down' | 'neutral'

DIRECTIONAL SYSTEM — replaces ↑↓ arrows everywhere:
  direction="up":
    Top stroke + k-stroke: #C8F04A (accent)
    All others: #C4C4BF (textDim)
  direction="down":
    Bottom stroke: #FF5C5C (danger)
    k-stroke: #C4C4BF (dimmed)
    All others: #C4C4BF
  direction="neutral" (default):
    k-stroke: #C8F04A
    All others: #C4C4BF

Animations:
  Idle/empty:  Opacity pulse 0.4 → 1.0 → 0.4, 2s loop
  Loading:     Slow rotation, 8s full turn
  Success:     Brief scale-up (1.0 → 1.2 → 1.0, 300ms)
  Static:      No animation — used inline as direction indicator

HERO CARD WATERMARK (special use):
  Size: 200, opacity: 0.07
  All 6 strokes: #C8F04A (all accent — purely decorative)
  strokeWidth: 14, strokeLinecap: round
  Position: absolute, top: -45, right: -45
  pointerEvents: none
  Clipped by card overflow: hidden
  This is a separate decorative instance — not the
  standard KasheAsterisk component with direction props.
  Render it inline in PositionHeroCard only.
```

---

## The ā Macron Rule
A single 1px horizontal line in accent colour (#C8F04A).
Use ONLY as a meaningful divider — never as decoration.

```
Correct uses:
  Between assets section and liabilities section
  in the Position hero card (most important use)
  Active tab indicator in bottom navigation bar
  Progress bar fill colour
  Section separator between Growth / Stability / Locked
  in Portfolio screen
  Between Live and Locked columns in Portfolio totals card
  Between sections in Monthly Review sheet

Incorrect uses:
  Random decorative lines between cards
  Header underlines
  Any purely visual separation
```

---

## Universal Add Sheet
The most important interactive component in the app.
Always accessible. Never buried.

```typescript
// Lives at /components/shared/UniversalAddSheet.tsx

interface UniversalAddSheetProps {
  isVisible: boolean
  onClose: () => void
  context: 'home' | 'spend' | 'portfolio' | 'insights'
  isOnboarding?: boolean
}

// Five options always present — context changes emphasis only:
// 💳  Upload bank statement
// 📈  Upload portfolio CSV
// 📄  Upload salary slip
// ✋  Add manually
// 👤  Add a profile

// Salary slip option behaviour:
//   Triggers SalarySlipUploadFlow
//   Parser detects pension/EPF contributions
//   Prompts user to add detected holdings
//   "We found a pension contribution of €380/month.
//    Want to add this as a holding? [+ Add pension] [Skip]"

// isOnboarding=true:
//   Tooltip arrow pointing to "Upload bank statement"
//   Subtitle: "Start here — it's fastest"
//   Disappears after onboarding complete flag is set

// Context emphasis:
//   'spend'     → bank statement option highlighted
//   'portfolio' → portfolio CSV option highlighted
//   'home'      → no emphasis (balanced)
//   'insights'  → no emphasis (balanced)
```

---

## Home Screen — Component Inventory
The Home screen is fully specced. Build exactly this.

```
LAYOUT (top to bottom):

[Header Row]
  Left:  Avatar (tappable → profile sheet)
  Right: [+] button with optional notification dot

[Position Hero Card]
  "Your Position" label (label style, uppercase)
  Large number in display font (SpaceGrotesk 700)
  Monthly delta + YTD delta (secondary text)
  ā macron rule (1px acid green divider)
  Expandable breakdown (collapsed by default):
    Liquid assets subtotal
    Illiquid assets subtotal (clearly labelled)
    Liabilities subtotal
  Savings rate % badge (top right of card)
  Tap card → expand/collapse breakdown

[Investment Segregation Toggle]
  Three pills: [Risk]  [Vehicle]  [Geography]
  Remembers last selected view

  Risk view:
    Horizontal allocation bars: MEDIUM / HIGH / CASH_LOW
    Target (60/20/20) shown as ghost bar behind actual
    Variance: "⚠ Overweight HIGH by 8%" in warning colour
  Vehicle view:
    MF / Direct Equity / ETF / Employer Stock / Crypto / Cash
  Geography view:
    India / Europe / US / Other

[Spend Story Card]
  Three lines, each independently tappable.
  COMPONENT: SpendStoryCard (replaces SpendSnapshot)

  Line 1 — Spend:
    "€X spent · ↑12% vs avg" or "↓8% vs avg"
    KasheAsterisk directional indicator (not text arrows)
    Tap → navigates to Spend tab
    isRedacted: amounts → RedactedNumber, delta → RedactedNumber

  Line 2 — Invested:
    "€X invested · on track" or "€X invested · behind target"
    "on track" in accent, "behind target" in warning
    Tap → navigates to Portfolio tab
    isRedacted: amount → RedactedNumber, status text kept

  Line 3 — Anomaly (CONDITIONAL):
    "⚡ Eating out is 2× your usual"
    Only shown when any category >150% of 3-month average
    Hidden entirely if nothing anomalous — no placeholder
    Requires minimum 2 months of history to ever render
    isRedacted: return null for this line

[Markets Strip]
  Horizontal ScrollView, no scroll indicator
  Items: S&P 500 / NIFTY 50 / EUR/INR / Gold
  Format: "S&P 500  ↑ 0.4%"
  Green for positive, red for negative, dim for flat
  Auto-refreshed on app open

[Portfolio Pulse]
  Max 5 items. Holdings-specific news only (Finnhub filtered).
  Each item: Ticker + movement + one-phrase news hook + →
  → is a chevron, opens article in in-app browser
  Only shows tickers the user actually holds

[FIRE Progress]
  Single progress bar, acid green fill
  "X% to FIRE" label
  "Projected: 2036" in secondary text
  Tap → navigates to /app/insights/fire.tsx directly
  Visible with manual inputs only — no upload required

[Monthly Review Ready] ← conditional
  Only shown when a new monthly review is available
  "Your March review is ready →"
  Accent colour, Inter 500
  Tap → Insights tab, MonthlyReviewSheet opens immediately
  Hidden once user has viewed the review

[Coverage Score]
  REMOVED — not in V1

NOTIFICATION DOT (on [+] button):
  6px circle, top-right of button
  Amber (#FFB547): stale data or upcoming vesting event
  Red (#FF5C5C): spend over 90% of monthly budget
  Only one dot at a time — red takes priority over amber
```

---

## Investment Segregation Toggle — Detail
```
Three views. Pill selector. Remember last view in local state.

[Risk]  [Vehicle]  [Geography]

RISK VIEW:
  MEDIUM risk bar  60% target  (actual vs ghost target)
  HIGH risk bar    20% target
  CASH/LOW bar     20% target
  Show variance if >5% off target: "⚠ Overweight medium by 8%"
  Colour: accent for on-target, warning for over, dim for under

VEHICLE VIEW:
  Mutual Funds
  Direct Equity
  ETFs
  Employer Stock
  Crypto
  Cash & Savings

GEOGRAPHY VIEW:
  India
  Europe
  US
  Other
  Each bar shows % of total live portfolio
```

---

## Spend Screen — Component Inventory
The Spend screen job: "Show me where my money went this month
— and whether that's normal for me."

```
LAYOUT (top to bottom):

[Header Row]
  Left:  "Spend" label (heading style)
  Right: [+] button (upload bank statement emphasis)
         [⋯] overflow menu → "Set budgets"

[Zone 1 — Monthly Summary]  ← FIXED, does not scroll
  Month selector
    Left/right chevrons, current month centred
    Default: current month
    Can navigate back up to 12 months of history
    Partial months shown as-is (no warning needed)

  Net spend number (large, SpaceGrotesk 700)
    Total debits for selected month, base currency
    investment_transfer and transfer EXCLUDED
    Multi-currency: base total shown
                    dim note beneath: "inc. amounts converted from INR"

  Context line (Inter 400, textSecondary)
    "↑ 12% vs last month  ·  ↑ 8% vs 3-month avg"
    Uses ↑ / ↓ text indicators only — no red/green colouring here
    Colours: textPrimary, textSecondary, textDim, accent only
    Hidden entirely if <2 months of data

  Budget summary (only if budget is set)
    "€2,847 of €4,500 budget" in textSecondary
    Shown beneath net number

[Zone 2 — AI Insight Strip]  ← conditional
  Only renders when SPEND_ANOMALY is triggered
  Trigger: any category >150% of its 3-month average
  Hidden entirely if nothing anomalous — no placeholder
  Requires minimum 2 months of history to ever render

  One compact card when visible:
    Kāshe asterisk (small, static — not pulsing)
    Headline: max 10 words
    Body: max 40 words
    Dismiss: swipe left or tap × → hidden for 24 hours
    Tap card body → InsightDetailSheet

[Zone 3 — Category Rows]  ← scrollable
  Sorted by spend amount descending

  Each SpendCategoryRow:
    Category icon (left)
    Category name (Inter 500)
    Amount in base currency (SpaceGrotesk 700, right-aligned)
    Thin proportion bar beneath row:
      No budget set:        accent green, width = % of total spend
      Under budget:         accent green fill
      80–99% of budget:     warning (#FFB547) fill
      100%+ of budget:      danger (#FF5C5C) fill
    Chevron (right edge)
    Tap → SpendCategoryDetailScreen

  Transfers section (bottom, below ā macron divider):
    Section label: "Transfers & Investments" (label style)
    investment_transfer and transfer rows shown here
    Dim note: "excluded from totals"
    Same row visual but muted — textDim for amount

EMPTY STATE (no data uploaded):
  Full-screen blurred ghost of populated Spend screen
  Frosted card centred:
    Kāshe asterisk (slow pulse)
    "See where your money goes"
    [+ Upload bank statement] (accent button)
    "Add manually instead" (text link, textSecondary)

PARTIAL STATE (1 month of data only):
  Zone 1: shown normally, context line hidden
  Zone 2: never renders (insufficient history)
  Zone 3: shown normally
  No error message — this is normal first-use state
```

---

## Spend Category Detail Screen
```
Route: /app/spend/[category].tsx

LAYOUT:
  Back chevron + category name as header
  Same month selector as parent (stays in sync)
  Subcategory breakdown rows (same visual as category rows)
  Tap subcategory → expands inline to show transactions

TRANSACTION ROW (SpendTransactionRow):
  Date        Inter 400, textSecondary, short format ("12 Jan")
  Merchant    Inter 500, textPrimary
  Amount      SpaceGrotesk 700, right-aligned, textPrimary
  Category chip  small pill, textDim background
  Tap → TransactionEditSheet

TRANSACTION EDIT SHEET (TransactionEditSheet):
  Bottom sheet
  Merchant name (heading)
  Current category + subcategory shown
  [Change category] → scrollable category + subcategory picker
  On confirm:
    Merchant name saved to merchant memory
    All past + future transactions from same merchant
    → reassigned to new category automatically
  Confirmation toast: "Albert Heijn will always be Groceries"
```

---

## Spend Budget Sheet
```
Component: SpendBudgetSheet.tsx
Trigger: [⋯] overflow menu → "Set budgets" on Spend screen header

LAYOUT (bottom sheet, scrollable):
  Header: "Monthly budgets"
  Dim note: "Set a limit for each category"

  One row per spend category:
    Category icon + name (left)
    Editable amount field (right, SpaceGrotesk font)
    Clear button (×) to remove budget for that category

  Total row (bottom of list, above actions):
    "Total budgeted: €X" in textSecondary

  Actions:
    [Save budgets]  accent button — saves all, dismisses sheet
    [Cancel]        text link — dismisses without saving

RULES:
  investment_transfer and transfer never appear in this list
  Empty field = no budget set for that category
  Budgets stored locally per profile (not household-level)
  Budgets persist across months (not month-specific in v1)
```

---

## Insight Detail Sheet
```
Component: InsightDetailSheet.tsx
Shared between: Spend screen, Portfolio screen, Insights tab
Trigger: Tap insight card anywhere in the app

LAYOUT (bottom sheet):
  Kāshe asterisk (small, static)
  Insight type label (label style, textDim, uppercase)
    e.g. "MARKET EVENT" / "PORTFOLIO HEALTH" / "SPEND ANOMALY"
  Insight headline (SpaceGrotesk 700, heading size)
  Full insight body (Inter 400, up to 80 words)
  Data points that triggered it (dim, small text)
    e.g. "Eating out: €340 this month vs €160 average"
  Source citation (MARKET_EVENT only)
  Forum signal summary (MARKET_EVENT only, if present)
  Action suggestion (textSecondary, optional)
  [View holding →] deep link where relevant → HoldingDetailScreen
  [View in Insights →] text link → Insights tab
  [Dismiss] text link, bottom → 24-hour dismiss
```

---

## Budget Suggestion Screen (Onboarding — screen 8)
```
Appears:   After first successful CSV upload in onboarding
Position:  Between First Payoff (screen 7) and Portfolio Teaser (screen 9)
Skippable: Always — user never forced to set budgets

CONTENT:
  Headline: "Here's what we found"
  Subheadline: "Based on your [Month] transactions"

  Category rows (same visual as Spend screen):
    Category name + amount spent this month
    + editable suggested budget field
    Suggested budget = actual spend rounded up to nearest 50
    User can tap field to adjust, accept as-is, or clear

  Three actions (bottom, stacked):
    [Use these budgets →]   accepts all suggestions, proceeds
    [Set manually]          clears suggestions, shows blank fields
    [Skip for now]          skips budget setup entirely

  Dim note beneath actions:
    "You can update budgets anytime in Settings or on the Spend screen"

RULES:
  Only shown if ≥1 month of spend data imported successfully
  investment_transfer and transfer never shown in this list
  If user skipped upload in screen 6: this screen skipped entirely
```

---

## Portfolio Screen — Full Spec

**The job of this screen:**
"Show me everything I own, organised by what it's
doing for me — and tell me if I should be doing
something differently."

### Key decisions — locked
```
TERMINOLOGY:
  "Live" not "liquid" — assets with a current market price
  "Locked" not "illiquid" — assets committed for a period
  "Growth / Stability / Locked" — the three purpose buckets
  "Protection" — a designation on a Stability holding,
                 not a standalone bucket

ORGANISATION:
  One fixed opinionated view — no grouping toggle
  (Toggle lives on Home screen for overview)
  Portfolio goes deep into one view

BUCKET TAXONOMY:
  GROWTH    Equity MFs, direct equity, ETFs,
            employer stock, crypto
  STABILITY Cash, savings, NRE/NRO, debt funds
  LOCKED    PPF, EPF, FDs, Crowdcube, angel investments

PROTECTION DESIGNATION:
  User designates one Stability holding as emergency fund
  Shield icon (🛡️) replaces geography flag on that row
  Recommended amount = 3–6× average monthly spend
  Calculated from Spend screen data
  Powers emergency fund AI insight

BUCKET ASSIGNMENT:
  System assigns default bucket per asset type
  User can override via BucketReassignSheet
  Override triggers immediate insight regeneration

PROPERTY EQUITY: OUT OF SCOPE V1
PHYSICAL ASSETS: NEVER BUILD
```

### Layout overview
```
ZONE 1 — HEADER + TOTALS        fixed, does not scroll
ZONE 2 — AI INSIGHT STRIP       conditional
ZONE 3 — INVESTMENT PLAN        collapsible card
ZONE 4 — HOLDINGS LIST          scrollable
  Section: GROWTH
  Section: STABILITY
  Section: LOCKED
```

### Zone 1 — Header + Totals

```
HEADER ROW
  Left:  "Portfolio" (SpaceGrotesk 700, heading style)
  Right: [+] button with notification dot

COMPONENT: PortfolioTotalsCard

  Two columns, clearly separated:

  Live                      Locked
  €312,400                 €48,200
  SpaceGrotesk 700, textPrimary    SpaceGrotesk 700, textPrimary

  ā macron rule between columns — meaningful divider ✓

  Combined dim total beneath:
  "€360,600 across all holdings"
  Inter 400, textSecondary, small

  Monthly delta (live holdings only):
  "↑ €2,340 this month"
  textSecondary, Inter 400
  No delta shown for Locked — stale values, no meaning

  Last refreshed:
  "Prices updated 4 min ago"
  textDim, Inter 400, bottom of card
```

### Zone 2 — AI Insight Strip

```
COMPONENT: PortfolioInsightStrip

Same visual pattern as SpendInsightStrip.
Conditional — only renders when AI has something worth saying.
Never a permanent fixture. Never a placeholder.

TRIGGER CONDITIONS (any one sufficient):
  Growth bucket >10% below 60% target allocation
  Single holding >15% of live portfolio value
  Employer stock crosses 15% of live portfolio
  No Protection designation exists + cash holdings present
  Monthly investment target being missed
  Salary slip detected pension not yet added as holding
  Live/Locked ratio significantly off for user's age
  INR weakened >3% vs EUR in rolling 90 days
    AND user has >20% of portfolio in India

SALARY SLIP PROMPT (one-time, shown before any AI insight):
  Shown if: no salary slip uploaded yet
  "Upload your salary slip to detect pension
   contributions automatically"
  [+ Upload salary slip] accent button
  [Skip] text link
  Dismissed permanently once salary slip uploaded
  or user explicitly skips
  Never shown again after dismissal

MARKET EVENT INSIGHT (highest priority):
  Kāshe asterisk (small, static)
  Headline: max 10 words
  Body: max 40 words
  Source citation: "via Reuters · 3 hours ago"
  Forum signal (when divergence meaningful):
    "⚡ Stocktwits 68% bearish · r/stocks mixed"
    Only shown when institutional/retail sentiment diverges
  Confidence indicator:
    LOW confidence: dim note "Limited sources available"
    MEDIUM/HIGH: no indicator (clean)
  Dismiss: swipe left or tap × → hidden 24 hours
  Tap → InsightDetailSheet (shared component)

ALL OTHER INSIGHTS:
  Same visual, no source citation line
  No forum signal line
  Same dismiss behaviour
```

### Zone 3 — Investment Plan

```
COMPONENT: InvestmentPlanCard
COMPONENT: InvestmentPlanExpanded

COLLAPSED — no target set:
  "Monthly investment plan"   Inter 500, textPrimary
  "Set a target to get personalised guidance →"
                              Inter 400, accent colour
  Chevron right
  Tap → expands inline

COLLAPSED — target set:
  "Monthly investment plan"
  Progress bar (accent green fill)
  "€920 of €1,500 invested this month"
  Chevron → tap to expand

EXPANDED STATE:

  Monthly target field:
    Label: "Monthly target"
    Editable number field, SpaceGrotesk font, large
    Currency: base currency symbol prefix

  Salary-detected contributions (if salary slip uploaded):
    Section label: "Already going in automatically"
    textSecondary, label style

    COMPONENT: SalaryContributionRow (one per detected contribution)
      Contribution name (e.g. "ABN Amro Pension")
      Amount per month
      Bucket pill: LOCKED (always — pension/EPF are locked)

    "Remaining to actively allocate: €920/month"
    textPrimary, SpaceGrotesk 700
    ā macron rule beneath

  Suggested allocation breakdown:
    COMPONENT: AllocationSuggestionRow (one per bucket)
      Bucket name
      Suggested amount (calculated from gap analysis)
      Percentage of remaining allocation

      GROWTH     €552   60%
      STABILITY  €184   20%
      LOCKED     €184   20%

  Gap analysis (templated, not AI-generated):
    Shown when any bucket is off target
    Template: "Your {bucket} allocation is {gap_amount}
               below target this month."
    Instrument category suggestion:
    Template: "{instrument_category} are commonly used
               for {bucket} allocation."
    [Explore options →] → InstrumentSuggestionSheet

  [Save target] accent button
  [Cancel] text link

RULES:
  investment_transfer transactions from Spend screen
  populate the "invested this month" progress
  Salary contributions always shown as LOCKED
  Never show specific fund names in suggestion text
  Instrument suggestions are templated — not AI-generated
```

### Instrument Suggestion Sheet

```
COMPONENT: InstrumentSuggestionSheet
TRIGGER: [Explore options →] in Investment Plan expanded

LAYOUT (bottom sheet, scrollable):
  Header: "{Bucket} — commonly used instruments"

  Grouped by geography:

  INDIA
    [INDEX FUNDS — lower cost]
      UTI Nifty 50 Index Fund
      "Tracks NIFTY 50. Expense ratio ~0.18%"
      [View on AMFI →]  [View on Groww →]

    [LARGE-CAP ACTIVE]
      Mirae Asset Large Cap
      "Consistently well-regarded. Check Morningstar."
      [View on AMFI →]  [View on Groww →]

    [FLEXI-CAP]
      Parag Parikh Flexi Cap
      "Holds international stocks too — adds diversification."
      [View on AMFI →]  [View on Groww →]

  EUROPE
    [BROAD MARKET ETFs]
      VWRL — Vanguard FTSE All-World
      "Global exposure. Available on DeGiro."
      [View on justETF →]

      IWDA — iShares Core MSCI World
      "Developed markets focus."
      [View on justETF →]

  Disclaimer (always visible, never hidden):
    "These are educational suggestions, not financial advice.
     Kāshe earns nothing from these links.
     Always do your own research."
    Inter 400, textDim, small

RULES:
  No affiliate links. Ever.
  Links open in in-app browser
  Framing: "worth exploring" language throughout
  Static curated list — not dynamically fetched
  Updated manually by PM quarterly
```

### Zone 4 — Holdings List

```
Fixed section order: Growth → Stability → Locked
Within each section: sorted by value descending

COMPONENT: PortfolioSectionHeader
  Section name (Inter 500, label style, uppercase, letterSpacing +0.8)
  Section total (SpaceGrotesk 700, right-aligned)
  ā macron rule beneath — meaningful divider ✓

  GROWTH                    €198,400

  Empty bucket state (gentle, not full empty state):
    "No {bucket} holdings yet"
    "[+ Add one]" accent colour, small, tappable
    → Universal Add Sheet

COMPONENT: PortfolioHoldingRow — LIVE variant
  [rupee SVG / trend SVG]  Holding name          €54,200
                           Mutual Fund · India   * 2.3%
                           [freshness dot]

  Left icon: SVG stroke-only, 22×22, no container box
    India geography  → rupee symbol SVG
    Europe/US/Global → trend line SVG + circle
    See design-system.md → "PortfolioHoldingRow SVG ICON SYSTEM" for paths
  Holding name: Inter 500Medium, textPrimary, fontSize 15
  Value: SpaceGrotesk 600SemiBold, right-aligned, textPrimary
  assetType · geography: Inter 400, textSecondary, small
    e.g. "Mutual Fund · India", "ETF · Europe"
  Daily movement: KasheAsterisk direction + % change
    Accent/success for positive
    Danger for negative
    Dim for flat (dailyChangePercent === 0 or undefined)
  Freshness dot: 6px circle, positioned left of value
    Green: updated today (fresh)
    Amber: 7–30 days stale
    Red: >30 days stale (stale)
  Tap → HoldingDetailScreen

COMPONENT: PortfolioHoldingRow — LOCKED variant
  [padlock SVG]  PPF                     ₹4,20,000
                 Provident Fund · India  Unlocks Mar 2031
                 [freshness dot]

  Padlock SVG icon — see design-system.md for path
  No daily movement (no live price)
  Unlock date shown in textDim if known
  "Outcome unknown" in textDim for alternative_general holdings
  Tap → HoldingDetailScreen

COMPONENT: PortfolioHoldingRow — PROTECTION variant
  [shield+check SVG]  Current Account      €8,400
                      Cash · Europe        2.8 months covered
                      [freshness dot]

  Shield + check SVG icon — see design-system.md for path
  "X.X months covered" = holding value ÷ avg monthly spend
  Accent colour if ≥3 months
  Warning colour if <3 months
  Tap → HoldingDetailScreen
```

### Bucket Reassign Sheet

```
COMPONENT: BucketReassignSheet
TRIGGER: "Reassign bucket" action in HoldingDetailScreen

LAYOUT (bottom sheet):
  Header: "Reassign {holding name}"

  System reasoning (dim, small, above options):
    "We assigned this to {bucket} because it's a
     {asset type}. Change it if that doesn't fit
     how you think about this money."

  Three options (radio select):
    ○  Growth      Equity, high growth potential
    ○  Stability   Cash, savings, lower risk
    ○  Locked      Committed for a period

  [Confirm] accent button
  [Cancel] text link

RULES:
  Confirming triggers immediate AI insight regeneration
  Does not change the asset type — only the bucket label
  Override stored locally per profile
  System default shown as currently selected on open
```

### Holding Detail Screen

```
ROUTE: /app/portfolio/[holdingId].tsx
COMPONENT: HoldingDetailScreen

LIVE HOLDING:

  HEADER:
    Back chevron + holding name
    Geography flag

  HERO:
    Current value (SpaceGrotesk 700, large, textPrimary)
    Daily change ↑↓ amount + percentage
    "X% of live portfolio" (textSecondary, small)

  DETAILS SECTION:
    Quantity / units
    Current price per unit
    Purchase price (if known)
    Unrealised gain/loss (if purchase price exists)
      Accent for gain, danger for loss
    Geography
    Purpose bucket (tappable → BucketReassignSheet)
    Data source: CSV / Manual / API
    Last updated timestamp

  ACTIONS (bottom):
    [Edit holding]      → edit form (quantity, purchase price)
    [Reassign bucket]   → BucketReassignSheet
    [Remove holding]    → confirmation sheet

LOCKED HOLDING (additional fields):
  Lock reason label:
    PPF: "Locked until maturity"
    EPF: "Locked until employment ends"
    FD: "Fixed term deposit"
    Crowdcube/angel: "Locked — exit event required"

  Unlock date (prominent if known):
    SpaceGrotesk 700, textPrimary
    "Unlocks March 2031"

  COMPONENT: LockedProjectionCard (if unlock date known):
    "Projected value at unlock"
    Formula: currentValue × (1 + rate)^yearsToUnlock
    Rate source shown: "at 7.1% PPF rate (current)"
    Inter 400, textSecondary
    Dim note: "Projection only — actual returns may vary"

  For Crowdcube/angel:
    "Unlock date: Unknown"
    "Value at exit: Dependent on company outcome"
    Last known valuation + date entered

PROTECTION HOLDING (additional section):
  COMPONENT: ProtectionStatusCard
    "Emergency fund" label, shield icon

    Current amount: €8,400 (SpaceGrotesk 700)
    Recommended range: €7,200 – €14,400
    Based on: "€2,560 average monthly spend (last 3 months)"
    Coverage: 2.8 – 5.6 months

    Status bar:
      <3 months: danger colour
      3–6 months: accent/success colour
      >6 months: textSecondary
                 dim note: "Consider investing the surplus"

    [Remove protection designation] text link, textSecondary
    "This won't delete the holding, just the designation"
```

### Portfolio Insight Detail Sheet

```
COMPONENT: PortfolioInsightDetailSheet
NOTE: Now superseded by shared InsightDetailSheet.tsx
      Use InsightDetailSheet with appropriate props.
      See Insight Detail Sheet spec above.
```

### Portfolio Empty State

```
Full-screen blurred ghost of populated Portfolio
Mock data: realistic holdings across all three buckets
           Growth: VWRL, Infosys, Parag Parikh MF
           Stability: NRE/NRO savings, current account
           Locked: PPF, Crowdcube investment
Fixed constants from /constants/mockData.ts

Frosted card centred:
  Kāshe asterisk (slow pulse)
  "See your full financial picture"
  [+ Add your first holding] accent button
  "Upload a portfolio CSV instead" text link, textSecondary
```

### Portfolio Partial State

```
Some holdings added, buckets are sparse.
Show what exists normally.
Each empty bucket shows gentle prompt:
  "No Stability holdings yet"
  "[+ Add one]" textSecondary, small
Never a full empty state — just bucket-level nudges.
No coverage score — removed from V1.
```

---

## Insights Screen — Full Spec

**Route:** `/app/(tabs)/insights.tsx`
**Job:** "Show me whether my financial life is on track —
and what, if anything, I should do about it."

### What Anand is asking
When Anand opens this screen, he is asking one of three things
depending on the day:
- "Is my FIRE date still 2036, or did something shift?" (planning)
- "Is there anything I should know or do right now?" (advisory)
- "How did my financial month actually go?" (reflection)

The screen must serve all three without making any feel secondary.

### Structure
Scrollable page. No fixed zones. Everything stacks vertically.
No fixed header zone — Insights is not list-heavy enough to need one.

```
[InsightsHeader]
[InsightsActiveInsightCard]    ← conditional
[MonthlyReviewCard]            ← always present
[FIRETeaserCard]               ← always present
[PastReviewsList]              ← conditional (≥2 past reviews)
```

### InsightsHeader

```
COMPONENT: InsightsHeader

Left:   "Insights" (SpaceGrotesk 700, heading style)
Right:  [+] button with notification dot

No month selector — Insights is not time-bounded.
```

### InsightsActiveInsightCard

```
COMPONENT: InsightsActiveInsightCard

Conditional — only renders when an active insight exists.
If no insight: renders InsightsEmptyInsightState instead.

When visible:
  Kāshe asterisk (small, static — not pulsing)
  Insight type label (label style, textDim, uppercase)
    e.g. "MARKET EVENT" / "PORTFOLIO HEALTH" / "FIRE UPDATE"
  Headline (SpaceGrotesk 700, textPrimary, max 10 words)
  Body (Inter 400, textSecondary, max 40 words)

  MARKET_EVENT only — source + confidence:
    "via Reuters · 3 hours ago" (textDim, small)
    LOW confidence: dim note "Limited sources available"
    MEDIUM/HIGH: no indicator shown

  MARKET_EVENT only — forum signal (when meaningful):
    "⚡ Stocktwits 68% bearish · r/stocks mixed"
    textDim, small
    Only when institutional/retail sentiment diverges

  [See full insight →] Inter 500, accent colour
    → opens InsightDetailSheet

  Dismiss: swipe left or tap ×
    → hidden for 24 hours
    → InsightsEmptyInsightState renders in its place

PRIORITY ORDER (one shown at a time — locked):
  MARKET_EVENT_ALERT > PORTFOLIO_HEALTH >
  FIRE_TRAJECTORY > INVESTMENT_OPPORTUNITY

INVESTMENT_OPPORTUNITY renders slightly differently:
  No asterisk — this is templated, not AI-generated
  Label: "OPPORTUNITY" (label style, textDim)
  [Explore options →] → InstrumentSuggestionSheet
```

### InsightsEmptyInsightState

```
COMPONENT: InsightsEmptyInsightState

Renders in place of InsightsActiveInsightCard
when no current insight is active.

NOT a full empty state. NOT a blurred ghost.
The rest of the screen renders normally around it.

Simple card:
  Kāshe asterisk (small, static — not pulsing)
  "Nothing needs your attention right now."
  Inter 400, textSecondary
  "Checked [X] hours ago" textDim, small

DESIGN INTENT:
  This is a trusted advisor being quiet.
  Silence should feel like a green light, not a broken feature.
  No CTA. No encouragement to "add more data."
  Just honest stillness.
```

### MonthlyReviewCard

```
COMPONENT: MonthlyReviewCard

Always present on Insights screen.
Four states:

STATE 1 — Review available, not yet viewed:
  4px left border in accent colour (#C8F04A)
  Label: "MONTHLY REVIEW" (label style, textDim)
  Headline: "Your [Month] review is ready"
    SpaceGrotesk 700, textPrimary
  Subtext: "Generated [date]" textDim, small
  [Read your [Month] review →] accent button
  → opens MonthlyReviewSheet

STATE 2 — Review available, already viewed:
  No accent border
  Label: "MONTHLY REVIEW" (label style, textDim)
  "[Month] review" textPrimary, Inter 500
  [Open →] text link, textSecondary
  → opens MonthlyReviewSheet

STATE 3 — Review not yet available (< 3 months data):
  Label: "MONTHLY REVIEW" (label style, textDim)
  "Available once you have 3 months of data"
  textSecondary, Inter 400
  No CTA — nothing to tap

STATE 4 — Some data exists, insufficient for review:
  Label: "MONTHLY REVIEW" (label style, textDim)
  "Add more data to unlock monthly reviews"
  textSecondary, Inter 400
  "[+ Upload bank statement]" text link → universal add sheet
```

### MonthlyReviewSheet

```
COMPONENT: MonthlyReviewSheet
TRIGGER: Tap MonthlyReviewCard (any state with CTA)
         Also triggered on Insights tab arrival when
         navigation param openReview=true is passed
         (from "Your March review is ready →" on Home)

Full-height bottom sheet, scrollable

HEADER:
  "[Month Year] Review" (SpaceGrotesk 700, heading)
  "Generated [date]" (textDim, small)
  Dismiss handle (top centre)

SECTIONS (maps directly to Claude JSON response):

  1. WHERE YOU STAND
     Label: "WHERE YOU STAND" (label style, uppercase, textDim)
     Body: whereYouStand string from Claude
     Inter 400, textPrimary

  ā macron rule

  2. HOW YOUR MONEY IS WORKING
     Label: "HOW YOUR MONEY IS WORKING" (label style, textDim)
     Four sub-rows:
       Growth / Stability / Locked / Protection
       Each: bucket name (textSecondary, Inter 500)
             + Claude's one-line assessment (textPrimary, Inter 400)

  ā macron rule

  3. THIS MONTH'S PRIORITY
     Label: "THIS MONTH'S PRIORITY" (label style, textDim)
     Headline (SpaceGrotesk 700, textPrimary)
     Reasoning (Inter 400, textSecondary)
     Bucket pill (if bucketTarget set):
       GROWTH / STABILITY / LOCKED pill, accent colour
       Tappable → navigates to Portfolio screen,
                  bucket section highlighted

  ā macron rule

  4. FIRE UPDATE
     Label: "FIRE UPDATE" (label style, textDim)
     Headline (SpaceGrotesk 700, textPrimary)
     Detail (Inter 400, textSecondary)
     Only renders if FIRE planner is set up
     If not set up:
       "Set up your FIRE planner to unlock this"
       text link → /app/insights/fire.tsx

  ā macron rule

  5. NEXT MONTH — WATCH FOR
     Label: "NEXT MONTH — WATCH FOR" (label style, textDim)
     2–3 items (Inter 400, textPrimary)
     Simple dot markers (·), no icons

FOOTER (always visible, pinned, not scrollable):
  "Generated by Kāshe AI · Based on your data only ·
   Not financial advice"
  Inter 400, textDim, very small, centred
  [Close] text link above disclaimer
```

### FIRETeaserCard

```
COMPONENT: FIRETeaserCard

Always present on Insights screen.
Opens FIRE Planner detail screen — it is not the planner itself.

STATE 1 — FIRE not set up:
  Label: "FINANCIAL INDEPENDENCE" (label style, textDim)
  "When could you stop working?"
  SpaceGrotesk 700, textPrimary
  "Set up your FIRE planner to find out."
  Inter 400, textSecondary
  [Set up FIRE planner →] accent button
  → navigates to /app/insights/fire.tsx

STATE 2 — FIRE set up, projection exists:
  Label: "FINANCIAL INDEPENDENCE" (label style, textDim)
  Projected year: SpaceGrotesk 700, very large, textPrimary
    e.g. "2036"
  Progress bar (acid green fill, 600ms ease-out on mount)
    Width = currentPortfolio / FIRENumber as percentage
  "X% of your FIRE number" Inter 400, textSecondary
  "€X,XXX to go" Inter 400, textDim, small
  [Open FIRE planner →] text link, textSecondary
  → navigates to /app/insights/fire.tsx
```

### PastReviewsList

```
COMPONENT: PastReviewsList

Conditional — only renders when ≥2 past reviews exist.
If <2: section does not render at all. No placeholder.

Header row:
  "Past reviews" (Inter 400 500, textSecondary, label style)

Each row:
  Month + Year (Inter 500, textPrimary)
    e.g. "February 2026"
  Chevron right
  Tap → opens MonthlyReviewSheet for that month

RULES:
  Last 12 months only (rolling — oldest drops as new arrives)
  Current month's review lives in MonthlyReviewCard above —
    NOT duplicated here
  [V2]: Year-end wrapped built from this 12-month archive
    Trigger: first app open of January each year
    Uses all 12 monthly reviews as source material
```

### Insights Screen — Empty State

```
FULL EMPTY STATE (no data, FIRE not set up):
  Full-screen blurred ghost of populated Insights screen
  Mock data: realistic insight card + FIRE projection 2036
             + Monthly Review card (State 2)
             + one past review row
  Fixed constants from /constants/mockData.ts

  Frosted card centred:
    Kāshe asterisk (slow pulse)
    "Your financial picture, interpreted"
    [+ Upload bank statement] accent button
    "Set up FIRE planner instead" text link, textSecondary
    → /app/insights/fire.tsx (FIRE works without any upload)

PARTIAL STATE (1–2 months of data):
  InsightsActiveInsightCard: may render if PORTFOLIO_HEALTH
    or INVESTMENT_OPPORTUNITY triggered (no history needed)
    MARKET_EVENT_ALERT: always renders if triggered (time-based)
    FIRE_TRAJECTORY: never renders (needs 3+ months)
    If nothing triggered: InsightsEmptyInsightState renders
  MonthlyReviewCard: State 3 or 4 — not yet available
  FIRETeaserCard: always renders
  PastReviewsList: hidden (< 2 reviews)
```

---

## FIRE Planner Screen — Full Spec [V2 — DO NOT BUILD IN V1]

*This screen is deferred to V2. The spec is preserved here for when V2 is built.*
*In V1: /app/invest/fire.tsx does not exist. FIRETeaserCard is built but not rendered.*
*fireIsSetUp in UserFinancialProfile affects monthly review content only.*

**Route:** `/app/insights/fire.tsx`
**Job:** "Let me model my path to financial independence —
and adjust the levers until the numbers feel possible."

This is the flight simulator, not the report card.
Anand is the pilot. Show the trajectory, then let him adjust it.

### Structure

```
[FIREPlannerHeader]
[FIREHouseholdToggle]      ← household / individual selector
[FIRESliderHero]           ← the main interaction
[FIREInputsCard]           ← collapsible on return visits
[FIREAssumptionsCard]      ← always visible, never hidden
[FIREProfileSelector]      ← only when individual mode active
```

### FIREPlannerHeader

```
COMPONENT: FIREPlannerHeader

Back chevron (slides back to Insights tab)
"FIRE Planner" (SpaceGrotesk 700, heading style)
No [+] button — this screen is purely analytical
```

### FIREHouseholdToggle

```
COMPONENT: FIREHouseholdToggle

Pill toggle, top of screen beneath header:
  [Household]  [Individual]

Default: Household
Individual mode: FIREProfileSelector appears below inputs
```

### FIRESliderHero

```
COMPONENT: FIRESliderHero

The primary interaction. Hero element of the screen.

Label:
  "Years to financial independence"
  Inter 400, textSecondary

Large display:
  "[X] years" (SpaceGrotesk 700, display size, textPrimary)
  "That's [year]" (Inter 400, textSecondary, beneath)
  e.g. "12 years" / "That's 2038"

Slider:
  Range: 5 → 30 years, 1-year steps
  Accent green fill on active (left) portion
  Thumb: circle, accent green fill, 24px
  Updates projection output in real time on drag
  Smooth animation as numbers update (gentle tick)

Projection output (updates live with slider):
  Primary line:
    "You'd need to save [€X/month]"
    SpaceGrotesk 700, textPrimary
  Secondary line:
    "to retire in [year] with [€X/month] to live on"
    Inter 400, textSecondary

Current trajectory indicator (if data available):
  "At your current pace: [year]"
  textDim, Inter 400, small
  Shown only if investment_transfer data exists
  A dot marker on the slider track at the current pace year

Mortgage step-down annotation (conditional):
  Only shown if a mortgage exists in liabilities AND
  its end date falls within the projection window
  Displayed as a subtle note beneath the projection output:
    "Your mortgage ends in [year] — this reduces your
     required monthly spend by ~€[X] from that point"
    textDim, Inter 400, small
  The FIRE engine accounts for this automatically in calc
```

### FIREInputsCard

```
COMPONENT: FIREInputsCard

Collapsible card.
Expanded by default on first visit.
Collapsed by default on return visits (show summary line).

Collapsed summary line:
  "€[portfolio] portfolio · €[savings]/mo savings ·
   [age] years old" textSecondary, Inter 400, small
  Chevron to expand

Expanded:

  FIELD: Current portfolio value
    Label: "Current portfolio value"
    Value: SpaceGrotesk font, large, editable inline
    Pre-filled from portfolio total if data exists
    Dim note: "From your portfolio" or "Enter manually"
    Currency symbol prefix (base currency)

  FIELD: Monthly savings / investments
    Label: "Monthly savings"
    Pre-filled from average investment_transfer last 3 months
    Dim note: "Based on your last 3 months" or "Enter manually"

  FIELD: Target monthly spend in retirement
    Label: "Monthly spend in retirement"
    Pre-filled from average monthly spend last 3 months
    Editable — user may want to adjust down
    Dim note: "Based on your last 3 months of spending"

  FIELD: Current age
    Label: "Your age"
    Pre-filled from onboarding
    Editable

  FIELD: Expected annual return
    Label: "Expected annual return"
    Default: 7%
    Editable. Shows: "7% (conservative blended default)"
    User can tap to edit

  FIELD: Inflation rate
    Label: "Inflation rate"
    Default: country-based from /constants/fireDefaults.ts
    Shows: "3.0% (Netherlands default)"
    Editable

  [Recalculate] accent button
    Enabled only when any field value has changed
    Slider hero updates in real time on drag —
    [Recalculate] only needed after input field edits
```

### FIREAssumptionsCard

```
COMPONENT: FIREAssumptionsCard

Always visible. Never collapsible.
Transparency is non-negotiable.

"These projections are based on:"
Inter 400, textSecondary

Bullet list (Inter 400, textDim, small):
  · 4% safe withdrawal rate (Bengen rule)
  · [X]% expected annual return
  · [X]% annual inflation ([country] default)
  · Primary residence excluded from FIRE number
  · Unvested employer stock excluded
  · Crowdcube and angel investments excluded
  · FIRE number = target monthly spend × 300

"Projections are estimates, not guarantees."
Inter 400, textDim, small
```

### FIREProfileSelector

```
COMPONENT: FIREProfileSelector
RENDERS: Only when Individual toggle is active

Profile list (radio select):
  ○ [Household name] (default, Household)
  ○ [Owner name] (OWNER)
  ○ [Managed profile name] (MANAGED)
    Dim note: "Using assets managed under this profile"
  ○ [Partner name] (PARTNER — V2, shown greyed out)
    Dim note: "[V2] — requires couple sync"

Selecting a profile recalculates the FIRE projection
using only that profile's assets.
```

### FIRE Screen — Empty / First Launch State

```
Not set up (no inputs entered, no age from onboarding):
  No blurred ghost — FIRE has no meaningful ghost to show.
  Clean, low-friction prompt instead.

  Kāshe asterisk (slow pulse, medium size)
  "Your FIRE number starts here"
  SpaceGrotesk 700, textPrimary

  One field shown immediately (lowest barrier to entry):
    "Monthly spend in retirement"
    Large editable field, SpaceGrotesk font
    Dim placeholder: "€3,000"

  Beneath field:
    "Start with one number. We'll calculate the rest."
    Inter 400, textDim, small

  [Start calculating →] accent button
    On tap: reveals full FIREInputsCard (expanded)
            with this field pre-filled

DESIGN INTENT:
  One question. One number. No intimidation.
  The slider appears once Anand has entered enough to calculate.
```

---

## Insights Screen — V1 / V2 / Never

```
V1:
  Scrollable page structure
  InsightsActiveInsightCard (all 4 insight types)
  InsightsEmptyInsightState ("nothing needs attention")
  MonthlyReviewCard (all 4 states)
  MonthlyReviewSheet (full Claude-generated review)
  FIRETeaserCard (both states)
  FIRE Planner detail screen (/app/insights/fire.tsx)
  FIRESliderHero (5–30 year range, real-time)
  FIREInputsCard (6 inputs, collapsible)
  FIREAssumptionsCard (always visible)
  FIREProfileSelector (household / individual)
  PastReviewsList (last 12 months)
  Mortgage step-down in FIRE projection
  InsightDetailSheet (shared, used across all screens)

[V2]:
  Year-end wrapped (built from 12-month review archive)
  FIRE projection comparison vs same time last year
  Partner FIRE view (requires couple sync)
  Push notification when FIRE date shifts >6 months
  Conversational advisor ("ask Kāshe anything")
  Historical insight log beyond monthly reviews
  FIRE "what if" scenarios (job change, windfall, etc.)

[NEVER]:
  Specific fund or stock recommendations
  Buy/sell signals
  Regulated financial advice
  Affiliate links of any kind
  Guarantee language on projections
```

---

## Onboarding Stack — 10 Screens (updated)

```
Screen 4 (Age) is new. Budget Suggestion is screen 8.

1. Welcome
   Kāshe asterisk (large, pulsing)
   "Your money. Both worlds."
   [Continue with Google] button

2. Household
   "Just you, or you and a partner?"
   [Just me]  [Me and my partner]
   Note: partner sync is v2 — both lead to same v1 experience

3. Location
   Country selector (country of residence)
   Base currency auto-selected from country
   User can override currency

4. Age  ← NEW
   "How old are you?"
   Large number input, SpaceGrotesk font
   [Continue →] accent button
   [Skip for now] text link, textSecondary
   Dim note: "Used for your FIRE projection only"
   If skipped: FIRE planner prompts for age on first open

5. Teach [+]
   Static illustration showing [+] button
   "This button is how you add everything"
   [Got it →]

6. First Add (Guided)
   Universal Add Sheet with isOnboarding=true
   Tooltip on bank statement option
   User uploads or skips

7. First Payoff
   If data uploaded: real Home screen preview
   If skipped: full ghost empty state

8. Budget Suggestion  ← conditional
   Only shown if screen 6 upload succeeded
   See Budget Suggestion Screen spec above

9. Portfolio Teaser
   Blurred portfolio ghost
   "Your investments, one view"
   [+ Add your investments]

10. Complete
    "Kāshe is ready."
    "Tap [+] anytime to add more"
    [Go to Kāshe →] → loads main app
```

---

## Screen Transitions
```
Between tabs:         Slide (standard Expo Router tab behaviour)
Push navigation:      Slide left (standard)
Back navigation:      Slide right
Bottom sheets:        Slide up from bottom, 300ms ease-out
Sheet dismiss:        Slide down, 250ms ease-in
Number updates:       Gentle tick animation on change
Progress bar fill:    Animate on mount, 600ms ease-out
FIRE slider:          Smooth real-time update, no animation lag
```

---

## What You Must NOT Build
```
[NOT YOURS] CSV parsing or data sanitisation
[NOT YOURS] Salary slip parsing logic (Team Member 3)
[NOT YOURS] API calls (price refresh, news, FX, AI)
[NOT YOURS] Authentication or storage
[NOT YOURS] Financial calculations (savings rate, FIRE math, etc)
[NOT YOURS] Zustand store definitions
[NOT YOURS] TypeScript type definitions for data models
[NOT YOURS] Coverage score (removed from V1)
[NOT YOURS] Property equity UI (out of scope V1)
[NOT YOURS] fireDefaults.ts (Team Member 3 owns constants)
```

---

## Your Output Files

```
/constants/colours.ts
/constants/typography.ts
/constants/spacing.ts
/constants/mockData.ts           include Insights mock data

/components/ui/
  Button.tsx
  Card.tsx
  Typography.tsx
  Avatar.tsx
  Badge.tsx
  ProgressBar.tsx
  Divider.tsx

/components/shared/
  UniversalAddSheet.tsx
  EmptyState.tsx
  KasheAsterisk.tsx
  MacronRule.tsx
  NotificationDot.tsx
  InsightDetailSheet.tsx         SHARED — used by Spend, Portfolio, Insights

/components/home/
  PositionHeroCard.tsx
  SpendStoryCard.tsx
  MarketsStrip.tsx
  PortfolioPulse.tsx
  SegregationToggle.tsx
  FIREProgress.tsx
  SavingsRateBadge.tsx
  MonthlyReviewLink.tsx

/components/spend/
  SpendScreenHeader.tsx
  SpendSummaryStrip.tsx
  SpendInsightStrip.tsx
  SpendCategoryList.tsx
  SpendCategoryRow.tsx
  SpendTransactionRow.tsx
  TransactionEditSheet.tsx
  SpendBudgetSheet.tsx

/components/portfolio/
  PortfolioTotalsCard.tsx
  PortfolioInsightStrip.tsx
  InvestmentPlanCard.tsx
  InvestmentPlanExpanded.tsx
  SalaryContributionRow.tsx
  AllocationSuggestionRow.tsx
  InstrumentSuggestionSheet.tsx
  PortfolioSectionHeader.tsx
  PortfolioHoldingRow.tsx
  BucketReassignSheet.tsx
  LockedProjectionCard.tsx
  ProtectionStatusCard.tsx

/components/insights/
  InsightsHeader.tsx
  InsightsActiveInsightCard.tsx
  InsightsEmptyInsightState.tsx
  MonthlyReviewCard.tsx
  MonthlyReviewSheet.tsx
  FIRETeaserCard.tsx
  PastReviewsList.tsx

/components/fire/
  FIRESliderHero.tsx
  FIREInputsCard.tsx
  FIREAssumptionsCard.tsx
  FIREProfileSelector.tsx
  FIREHouseholdToggle.tsx

/app/(tabs)/index.tsx
/app/(tabs)/spend.tsx
/app/(tabs)/portfolio.tsx
/app/(tabs)/insights.tsx
/app/spend/[category].tsx
/app/portfolio/[holdingId].tsx
/app/insights/fire.tsx           NEW SCREEN
/app/onboarding/
  index.tsx
  household.tsx
  location.tsx
  age.tsx                        NEW SCREEN
  teach.tsx
  first-add.tsx
  payoff.tsx
  budget-suggest.tsx
  portfolio-teaser.tsx
  complete.tsx
/app/settings/index.tsx
```
