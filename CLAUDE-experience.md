# Kāshe — CLAUDE-experience.md
*Team Member 2: Experience & Delight*
*Read CLAUDE.md first, then this file.*
*Last updated: March 2026 — Portfolio screen spec added*

---

## Your Role
You own how Kāshe looks and feels. Every pixel, every animation,
every empty state, every moment of delight.
You do NOT write business logic. You do NOT touch data services.
You consume data via hooks and props — you never fetch directly.

---

## Your Domain
```
Design system     Implement tokens from CLAUDE.md exactly
UI components     All reusable components in /components
Screen layouts    All 4 tabs + onboarding + settings
Navigation        Expo Router setup + bottom tab bar
Animations        Micro-interactions, price ticks, transitions
Empty states      Blurred ghost pattern on every screen
Dark/light mode   Both modes on every single component
Data viz          Progress bars, allocation bars, coverage scores
```

---

## The Empty State Pattern
EMPTY STATE PATTERN — LOCKED (March 2026)

CONCEPT: Redacted ghost screen, not blurred overlay.
Numbers replaced with XXXXX. Screen fully scrollable.
User sees the structure of their data before acting.

IMPLEMENTATION:
  RedactedNumber component:
    /components/shared/RedactedNumber.tsx
    Props: length (default 6), style, onPress
    Renders 'X'.repeat(length)
    SpaceGrotesk_700Bold, color textDim (#C4C4BF)
    letterSpacing: 2

  All Home components accept isRedacted?: boolean.
  When true: replace every number with RedactedNumber.
  Progress bar fills: set to 0 when isRedacted.
  MonthlyReviewLink: return null when isRedacted.

FLOATING PILL (always visible in empty state):
  '+ Connect your data'
  Acid green (#C8F04A), pill shape, borderRadius 999
  Positioned absolute, bottom 24, centered
  KasheAsterisk size 14 + SpaceGrotesk_600SemiBold text

INVITATION SHEET (on pill tap or redacted number tap):
  Slides up from bottom, 350ms ease-out
  Drag handle top centre
  KasheAsterisk animated
  Headline + description + CTA button + secondary link
  Dismisses on scrim tap or action

MONTHLY REVIEW LOGIC (locked decision):
  Always shows previous month's review.
  Never waits for end of current month.
  isVisible=true when previous month review exists.
  isRedacted=true hides it in empty state.

---

## The Kāshe Asterisk Component
The brand mark. Used in loading states, empty states, onboarding.

```
Structure: 6-point asterisk SVG
5 strokes:  #8A8A85 (textSecondary)
1 stroke:   #C8F04A (accent) — the k-stroke

Animations:
  Idle/empty:  Opacity pulse 0.4 → 1.0 → 0.4, 2s loop
  Loading:     Slow rotation, 8s full turn
  Success:     Brief scale-up (1.0 → 1.2 → 1.0, 300ms)
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
// 📄  Upload salary slip          ← NEW V1
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
  Large number in display font (Syne 800)
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

[Spend This Month]
  Progress bar (accent green < 80%, amber 80-99%, red 100%+)
  Animated fill on mount: 0 → actual%, 600ms ease-out
  "€X of €Y budget" label
  Tap → navigates to Spend tab

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
  "Projected: 2041" in secondary text
  Tap → navigates to Insights tab
  Visible with manual inputs only — no upload required

[Monthly Review Ready] ← conditional
  Only shown when a new monthly review is available
  "Your March review is ready →"
  Accent colour, DM Sans medium
  Tap → Insights tab, MonthlyReviewSheet opens
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

  Net spend number (large, Syne 800)
    Total debits for selected month, base currency
    investment_transfer and transfer EXCLUDED
    Multi-currency: base total shown
                    dim note beneath: "inc. amounts converted from INR"

  Context line (DM Sans, textSecondary)
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
    Category name (DM Sans medium)
    Amount in base currency (Syne, right-aligned)
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
  Date        DM Sans, textSecondary, short format ("12 Jan")
  Merchant    DM Sans medium, textPrimary
  Amount      Syne, right-aligned, textPrimary
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
    Editable amount field (right, Syne font)
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
Trigger: Tap insight card in Zone 2 of Spend screen

LAYOUT (bottom sheet):
  Kāshe asterisk (small, static)
  Insight headline (Syne, heading size)
  Full insight body (DM Sans, up to 80 words)
  Data points that triggered it (dim, small text)
    e.g. "Eating out: €340 this month vs €160 average"
  Optional action suggestion (textSecondary)
  [Dismiss] text link at bottom

RULES:
  Same 24-hour dismiss behaviour as inline card
  No navigation to external content from this sheet
```

---

## Budget Suggestion Screen (Onboarding — screen 7)
```
Appears:   After first successful CSV upload in onboarding
Position:  Between First Payoff (screen 6) and Portfolio Teaser (screen 8)
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
  If user skipped upload in screen 5: this screen skipped entirely
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
  Left:  "Portfolio" (Syne 700, heading style)
  Right: [+] button with notification dot

COMPONENT: PortfolioTotalsCard

  Two columns, clearly separated:

  Live                      Locked
  €312,400                 €48,200
  Syne 800, textPrimary    Syne 800, textPrimary

  ā macron rule between columns — meaningful divider ✓

  Combined dim total beneath:
  "€360,600 across all holdings"
  DM Sans, textSecondary, small

  Monthly delta (live holdings only):
  "↑ €2,340 this month"
  textSecondary, DM Sans
  No delta shown for Locked — stale values, no meaning

  Last refreshed:
  "Prices updated 4 min ago"
  textDim, DM Sans, bottom of card
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
  Tap → PortfolioInsightDetailSheet

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
  "Monthly investment plan"   DM Sans medium, textPrimary
  "Set a target to get personalised guidance →"
                              DM Sans, accent colour
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
    Editable number field, Syne font, large
    Currency: base currency symbol prefix

  Salary-detected contributions (if salary slip uploaded):
    Section label: "Already going in automatically"
    textSecondary, label style

    COMPONENT: SalaryContributionRow (one per detected contribution)
      Contribution name (e.g. "ABN Amro Pension")
      Amount per month
      Bucket pill: LOCKED (always — pension/EPF are locked)

    "Remaining to actively allocate: €920/month"
    textPrimary, Syne 800
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
    DM Sans, textDim, small

RULES:
  No affiliate links. Ever.
  Links open in in-app browser
  Framing B throughout: "worth exploring" language
  Static curated list — not dynamically fetched
  Updated manually by PM quarterly
  External links: AMFI, Groww, Zerodha Coin,
                  justETF, Morningstar, DeGiro ETF list
```

### Zone 4 — Holdings List

```
Fixed section order: Growth → Stability → Locked
Within each section: sorted by value descending

COMPONENT: PortfolioSectionHeader
  Section name (DM Sans 500, label style, uppercase)
  Section total (Syne 800, right-aligned)
  ā macron rule beneath — meaningful divider ✓

  GROWTH                    €198,400

  Empty bucket state (gentle, not full empty state):
    "No {bucket} holdings yet"
    "[+ Add one]" textSecondary, small, tappable
    → Universal Add Sheet

COMPONENT: PortfolioHoldingRow — LIVE variant
  [🇮🇳/🇪🇺/🌍]  Holding name          €3,240
                GROWTH · India        ↑ 2.3%
                [freshness dot]

  Geography flag: emoji flag, left
  Holding name: DM Sans medium, textPrimary
  Value: Syne 800, right-aligned, textPrimary
  Bucket · Geography: DM Sans, textSecondary, small
  Daily movement: ↑/↓ %, textSecondary
    Accent/success for positive
    Danger for negative
    Dim for flat
  Freshness dot: 6px circle, left of value
    Green: updated today
    Amber: 7–30 days stale
    Red: >30 days stale
  Tap → HoldingDetailScreen

COMPONENT: PortfolioHoldingRow — LOCKED variant
  [🔒]  PPF                    ₹4,20,000
        LOCKED · India         Unlocks Mar 2031
        [freshness dot]

  Lock icon replaces geography flag
  No daily movement (no live price)
  Unlock date in textDim if known
  "Outcome unknown" in textDim for Crowdcube/angel
  Tap → HoldingDetailScreen

COMPONENT: PortfolioHoldingRow — PROTECTION variant
  [🛡️]  ABN Amro Current      €8,400
        PROTECTION · Europe    2.8 months covered
        [freshness dot]

  Shield icon replaces geography flag
  "X months covered" = holding value ÷ avg monthly spend
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
    Current value (Syne 800, large, textPrimary)
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
    Syne 700, textPrimary
    "Unlocks March 2031"

  COMPONENT: LockedProjectionCard (if unlock date known):
    "Projected value at unlock"
    Formula: currentValue × (1 + rate)^yearsToUnlock
    Rate source shown: "at 7.1% PPF rate (current)"
    DM Sans, textSecondary
    Dim note: "Projection only — actual returns may vary"

  For Crowdcube/angel:
    "Unlock date: Unknown"
    "Value at exit: Dependent on company outcome"
    Last known valuation + date entered

PROTECTION HOLDING (additional section):
  COMPONENT: ProtectionStatusCard
    "Emergency fund" label, shield icon

    Current amount: €8,400 (Syne 800)
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
TRIGGER: Tap insight card in Zone 2

LAYOUT (bottom sheet):
  Kāshe asterisk (small, static)
  Insight headline (Syne, heading size)
  Full insight body (DM Sans, up to 80 words)
  Data points that triggered insight (dim, small)
  Source citation (for market event insights)
  Forum signal summary (if present)
  Action suggestion (textSecondary, optional)
  [View holding →] deep link where relevant
  [Dismiss] text link, bottom
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

### Screen Transitions
```
Between tabs:         Slide (standard Expo Router tab behaviour)
Push navigation:      Slide left (standard)
Bottom sheets:        Slide up from bottom, 300ms ease-out
Sheet dismiss:        Slide down, 250ms ease-in
Number updates:       Gentle tick animation on change
Progress bar fill:    Animate on mount, 600ms ease-out
```

---

## Onboarding Stack (9 screens, linear, runs once)
```
Screen 7 (Budget Suggestion) added after first spec session.
Only appears if upload succeeded in screen 5. Otherwise skipped.

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

4. Teach [+]
   Static illustration showing [+] button
   "This button is how you add everything"
   [Got it →]

5. First Add (Guided)
   Universal Add Sheet with isOnboarding=true
   Tooltip on bank statement option
   User uploads or skips

6. First Payoff
   If data uploaded: real Home screen preview
   If skipped: full ghost empty state

7. Budget Suggestion  ← conditional
   See Budget Suggestion Screen spec above
   Only shown if screen 5 upload succeeded

8. Portfolio Teaser
   Blurred portfolio ghost
   "Your investments, one view"
   [+ Add your investments]

9. Complete
   "Kāshe is ready."
   "Tap [+] anytime to add more"
   [Go to Kāshe →] → loads main app
```

---

## What You Must NOT Build
```
[NOT YOURS] CSV parsing or data sanitisation
[NOT YOURS] Salary slip parsing logic (Team Member 3)
[NOT YOURS] API calls (price refresh, news, FX, AI)
[NOT YOURS] Authentication or storage
[NOT YOURS] Financial calculations (savings rate, FIRE, etc)
[NOT YOURS] Zustand store definitions
[NOT YOURS] TypeScript type definitions for data models
[NOT YOURS] Coverage score (removed from V1)
[NOT YOURS] Property equity UI (out of scope V1)
```

---

## Your Output Files
```
/constants/colours.ts
/constants/typography.ts
/constants/spacing.ts
/constants/mockData.ts
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
/components/home/
  PositionHeroCard.tsx
  SpendSnapshot.tsx
  MarketsStrip.tsx
  PortfolioPulse.tsx
  SegregationToggle.tsx
  FIREProgress.tsx
  CoverageCard.tsx          REMOVED — do not build
  SavingsRateBadge.tsx
  MonthlyReviewLink.tsx     NEW — conditional link to monthly review
/components/spend/
  SpendScreenHeader.tsx
  SpendSummaryStrip.tsx
  SpendInsightStrip.tsx
  SpendCategoryList.tsx
  SpendCategoryRow.tsx
  SpendTransactionRow.tsx
  TransactionEditSheet.tsx
  SpendBudgetSheet.tsx
  InsightDetailSheet.tsx
/components/portfolio/
  PortfolioTotalsCard.tsx
  PortfolioInsightStrip.tsx
  PortfolioInsightDetailSheet.tsx
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
/app/(tabs)/index.tsx
/app/(tabs)/spend.tsx
/app/spend/[category].tsx
/app/(tabs)/portfolio.tsx
/app/portfolio/[holdingId].tsx
/app/(tabs)/insights.tsx
/app/onboarding/
/app/settings/index.tsx
```

---

## V1 / V2 / Never — Portfolio Screen
```
V1:
  All zones above
  Growth / Stability / Locked taxonomy
  Protection designation
  Investment plan (Level 3 — category guidance)
  Salary slip upload + pension detection prompt
  Locked holding projections (where calculable)
  AI insight strip (market events + portfolio health)
  Monthly review link (review lives in Insights tab)
  Instrument suggestion sheet (static curated list)
  BucketReassignSheet

[V2]:
  Specific fund recommendations by name
  Dynamic fund data from external APIs
  Performance charts per holding
  Tax gain/loss harvesting surface
  Conversational advisor chat
  Push notifications for market events

[NEVER]:
  Property equity (V1 — may revisit in V2)
  Physical assets (car, gold, art, jewellery)
  Regulated financial advice
  Specific buy/sell recommendations without legal wrapper
  Affiliate links of any kind
  Coverage score
```
