# Kāshe — CLAUDE-experience.md
*Team Member 2: Experience & Delight*
*Read CLAUDE.md first, then this file.*

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
Every screen and every card must have an empty state.
Never show a financial number as zero.

```
Structure:
  Full-screen blurred ghost (realistic mock data)
  + Frosted card centred over blur:
      Kāshe asterisk (slow pulse animation)
      One headline — what this screen shows when populated
      One [+] CTA button in accent colour
      One secondary text link (optional)

iOS:     @react-native-community/blur (BlurView)
Android: Semi-transparent overlay (#111110 at 70% opacity)
Mock data: always import from /constants/mockData.ts
           Never generate random numbers — fixed constants only
           Mock data must look like a real, plausible user
```

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
  Section separator between India / Europe in Portfolio

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

// Four options always present — context changes emphasis only:
// 💳  Upload bank statement
// 📈  Upload portfolio CSV
// ✋  Add manually
// 👤  Add a profile

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

[Coverage Score]
  Thin 4px bar, acid green fill
  "Portfolio coverage: 73%" label above
  "[+ Add missing assets]" link below — accent, no underline
  Hidden if 100% coverage (essentially never)

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
  Each bar shows % of total liquid portfolio
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

7. Budget Suggestion  ← NEW (conditional)
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

## Screen Transitions
```
Between tabs:         Slide (standard Expo Router tab behaviour)
Push navigation:      Slide left (standard)
Bottom sheets:        Slide up from bottom, 300ms ease-out
Sheet dismiss:        Slide down, 250ms ease-in
Number updates:       Gentle tick animation on change
Progress bar fill:    Animate on mount, 600ms ease-out
```

---

## What You Must NOT Build
```
[NOT YOURS] CSV parsing or data sanitisation
[NOT YOURS] API calls (price refresh, news, FX, AI)
[NOT YOURS] Authentication or storage
[NOT YOURS] Financial calculations (savings rate, FIRE, etc)
[NOT YOURS] Zustand store definitions
[NOT YOURS] TypeScript type definitions for data models
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
  CoverageCard.tsx
  SavingsRateBadge.tsx
/components/spend/
  SpendScreenHeader.tsx
  SpendSummaryStrip.tsx           Zone 1: month selector + net + context
  SpendInsightStrip.tsx           Zone 2: conditional AI insight card
  SpendCategoryList.tsx           Zone 3: scrollable category rows
  SpendCategoryRow.tsx            Single category row + proportion bar
  SpendTransactionRow.tsx         Single transaction row
  TransactionEditSheet.tsx        Recategorise a transaction
  SpendBudgetSheet.tsx            Set/edit category budgets
  InsightDetailSheet.tsx          Expanded insight detail
/app/(tabs)/index.tsx
/app/(tabs)/spend.tsx
/app/spend/[category].tsx         Category detail + transactions
/app/(tabs)/portfolio.tsx
/app/(tabs)/insights.tsx
/app/onboarding/                  All 9 screens
/app/settings/index.tsx
```
