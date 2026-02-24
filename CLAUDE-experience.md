# Kāshe — CLAUDE-experience.md
*Team Member 2: Experience & Delight*
*Read CLAUDE.md first, then this file.*

---

## Your Role
You own how Kāshe looks and feels. Every pixel, every animation,
every empty state, every moment of delight.
You do NOT write business logic. You do NOT touch data services.
You consume data via hooks and props — you never fetch it yourself.

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
Data viz          Charts, progress bars, allocation views
```

---

## The Empty State Pattern
Every screen and every card has an empty state.
Never show a financial number as zero.

```
Structure:
  Full blurred ghost (realistic mock data)
  + Frosted card centred over blur:
      Kāshe asterisk (slow pulse, 8s rotation)
      One headline
      One [+] CTA button (accent colour)
      One secondary text link (optional)

Implementation:
  iOS:     @react-native-community/blur (BlurView)
  Android: Semi-transparent overlay (#111110 at 70% opacity)
  Mock data: import from /constants/mockData.ts
             Never generate random numbers — use fixed constants
```

---

## The Kāshe Asterisk Component
The brand mark. Used in:
- Loading states (slow pulse animation)
- Empty states (centred, large)
- App icon
- Onboarding screens

```
Structure: 6-point asterisk
5 strokes:  #8A8A85 (textSecondary)
1 stroke:   #C8F04A (accent) — the k-stroke
Animation:  Opacity pulse 0.4 → 1.0 → 0.4, 2s loop
            On loading: slow rotation, 8s full turn
```

---

## The ā Macron Motif
A single 1px horizontal line in accent colour (#C8F04A).
Use it as:
- Divider in Position hero card (assets/liabilities)
- Active tab indicator (bottom nav)
- Progress bar fill colour
- Section separator between India/Europe in portfolio
Never use it as decoration — only as a meaningful divider.

---

## Universal Add Sheet
This is the most important interactive component.
Lives in /components/shared/UniversalAddSheet.tsx

```typescript
interface UniversalAddSheetProps {
  isVisible: boolean
  onClose: () => void
  context: 'home' | 'spend' | 'portfolio' | 'insights'
  isOnboarding?: boolean  // shows tooltip + guided mode
}
```

Context changes visual emphasis only — same 4 options always:
- 💳 Upload bank statement
- 📈 Upload portfolio CSV
- ✋ Add manually
- 👤 Add a profile

isOnboarding=true: shows tooltip arrow on bank statement option,
subtitle becomes "Start here — it's fastest".

---

## Investment Segregation Toggle
Three views. Remember last selected.
```
[Risk]      [Vehicle]    [Geography]
```
Each view: horizontal bar chart, 3-5 rows, labels + percentages.

Risk view shows target (60/20/20) as ghost bar behind actual.
Variance shown: "⚠ Overweight medium risk" in warning colour.

---

## Markets Strip
Horizontal ScrollView, no scroll indicator.
Auto-refreshed data comes via props.
Format: "S&P 500  ↑ 0.4%" with colour on arrow + number.
Green for positive, red for negative, dim for flat.

---

## Portfolio Pulse
5 items max. Vertical list.
Each item: ticker/fund name + movement + one-phrase news hook + →
The → is a chevron, tappable, opens in-app browser.

---

## Notification Dot
6px circle, positioned top-right of [+] button.
Amber (#FFB547): stale data or upcoming vesting
Red (#FF5C5C): spend over 90% of budget
Only one dot at a time — red takes priority over amber.

---

## Spend Progress Bar
```
<80%:   accent green fill
80-99%: warning amber fill
100%+:  danger red fill
Animated fill on mount (0 → actual %, 600ms ease-out)
```

---

## Coverage Score Bar
Thin (4px height). Acid green fill.
"Portfolio coverage: 73%" label above.
"[+ Add missing assets]" link below — accent colour, no underline.

---

## Screen Transitions
Slide (not fade). Standard Expo Router behaviour.
Bottom sheet: slides up from bottom, 300ms ease-out.
Sheet dismiss: slides down, 250ms ease-in.

---

## What You Must NOT Build
```
[NOT YOURS] CSV parsing or data sanitisation
[NOT YOURS] API calls (price refresh, news, FX)
[NOT YOURS] Authentication or storage
[NOT YOURS] Financial calculations (savings rate, FIRE, etc)
[NOT YOURS] Zustand store definitions
```

---

## Your Output Files
```
/constants/colours.ts
/constants/typography.ts
/constants/spacing.ts
/constants/mockData.ts
/components/ui/           Button, Card, Typography, Avatar,
                          Badge, ProgressBar, Divider
/components/shared/       UniversalAddSheet, EmptyState,
                          KasheAsterisk, MacronRule,
                          NotificationDot, MarketsStrip,
                          PortfolioPulse, SegregationToggle
/components/home/         PositionHeroCard, SpendSnapshot,
                          FIREProgress, CoverageCard,
                          SavingsRateBadge
/app/(tabs)/index.tsx     Home screen (assembled from components)
/app/(tabs)/spend.tsx     Spend screen
/app/(tabs)/portfolio.tsx Portfolio screen
/app/(tabs)/insights.tsx  Insights screen
/app/onboarding/          All 8 onboarding screens
```
