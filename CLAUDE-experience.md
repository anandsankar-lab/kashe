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

## Onboarding Stack (8 screens, linear, runs once)
```
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
   "Bank statements, investments, manual entries"
   [Got it →]

5. First Add (Guided)
   Universal Add Sheet with isOnboarding=true
   Tooltip on bank statement option
   User uploads or skips

6. First Payoff
   If data uploaded: real Home screen preview
   If skipped: full ghost empty state
   Both are valid — ghost is an invitation, not failure

7. Portfolio Teaser
   Blurred portfolio ghost
   "Your investments, one view"
   [+ Add your investments]

8. Complete
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
/constants/mockData.ts            Realistic fixed mock data
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
/app/(tabs)/index.tsx             Home screen (assembled)
/app/(tabs)/spend.tsx             Spend screen
/app/(tabs)/portfolio.tsx         Portfolio screen
/app/(tabs)/insights.tsx          Insights screen
/app/onboarding/                  All 8 onboarding screens
/app/settings/index.tsx
```
