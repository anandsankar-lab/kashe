# Kāshe — Design System
*Read this before building any UI component or screen.*
*All decisions here are locked. Do not re-debate.*

---

## TYPOGRAPHY — LOCKED

```
Space Grotesk 700Bold    display numbers, hero figures, large amounts
Space Grotesk 600SemiBold  card headings, prominent labels
Space Grotesk 400Regular   monospaced-feel secondary numbers
Inter 500Medium          labels (uppercase), medium body, pills, CTAs
Inter 400Regular         body text, captions, secondary content, dates

NEVER USE: Syne, DM Sans — these are retired fonts. Do not import them.

Kerning philosophy: tight throughout. Apple-esque. Precise.
  Display:   letterSpacing: -1.5
  Headings:  letterSpacing: -0.5 to -0.8
  Body:      letterSpacing: -0.2
  Labels:    letterSpacing: +0.8  (uppercase labels only)
  Caption:   letterSpacing: -0.1
```

Always use the typography constants from `constants/typography.ts`.
Never hardcode fontFamily, fontSize, or letterSpacing in a component.

---

## COLOUR TOKENS — LOCKED

All colours come from `useTheme()`. Never raw hex. Never `Colors.dark.X`.

```typescript
// STANDARD TOKENS (both modes)
colors.background      // Light: #F5F4F0  Dark: #111110
colors.surface         // Light: #FFFFFF  Dark: #1C1C1A
colors.border          // Light: #EEEEEA  Dark: #252523  (barely-there, softened)
colors.textPrimary     // #1A1A18  (same both modes)
colors.textSecondary   // #8A8A85  (same both modes)
colors.textDim         // #C4C4BF  (same both modes)
colors.accent          // #C8F04A  (acid green — use sparingly)
colors.danger          // #FF5C5C
colors.warning         // #FFB547
colors.success         // #C8F04A  (same as accent)

// HERO CARD TOKENS (always dark — both light and dark mode)
// Used in PositionHeroCard and SpendHeroCard only
colors.heroGradientStart   // #1E1E1B
colors.heroGradientEnd     // #131311
colors.heroTextPrimary     // #F5F4F0
colors.heroTextSecondary   // rgba(245, 244, 240, 0.55)
colors.heroTextDim         // rgba(245, 244, 240, 0.35)
colors.heroAccent          // #C8F04A
colors.heroBorder          // rgba(200, 240, 74, 0.2)
colors.heroDanger          // #FF8080  (softened danger on dark background)
```

---

## SPACING — 4px BASE GRID

```typescript
// From constants/spacing.ts
spacing.xs    4
spacing.sm    8
spacing.md    12
spacing.lg    16
spacing.xl    20
spacing.xxl   24
spacing.xxxl  32

// Border radius
borderRadius.card   16   // standard cards
borderRadius.hero   24   // hero cards only (more generous = more premium)
borderRadius.input  12   // text inputs
borderRadius.pill   999  // pills, tags, badges
borderRadius.small  8    // icon containers, small elements
```

---

## HERO CARDS — RULES

Two hero cards exist: `PositionHeroCard` and `SpendHeroCard`.
Both follow identical rules:

```
ALWAYS dark gradient background — in both light AND dark mode
  LinearGradient: [colors.heroGradientStart, colors.heroGradientEnd]
  = ['#1E1E1B', '#131311']

borderRadius: 24 (borderRadius.hero)
No border — the gradient IS the card boundary
marginHorizontal: 20

Background asterisk watermark:
  Position: absolute, top: -45, right: -45
  Size: 200 × 200
  Opacity: 0.07
  All 6 strokes: #C8F04A (all accent — purely decorative)
  strokeWidth: 14, strokeLinecap: 'round'
  pointerEvents: 'none'
  Card must have overflow: 'hidden' to clip the bleed cleanly

Text uses hero tokens only — never standard tokens inside a hero card
```

The hero card is the one premium moment on its screen.
It signals: this is your data, it matters.

---

## THE KĀSHE ASTERISK — RULES

The brand mark. It does meaningful work — it is never decoration.

```
Props:
  size?: number           default 16
  animated?: boolean      default false
  direction?: 'up' | 'down' | 'neutral'   default 'neutral'

DIRECTIONAL SYSTEM — replaces ↑↓ text arrows everywhere:
  direction="up"      top stroke + k-stroke: #C8F04A (accent)
                      all others: #C4C4BF (textDim)
  direction="down"    bottom stroke: #FF5C5C (danger)
                      k-stroke: #C4C4BF (dimmed)
                      all others: #C4C4BF
  direction="neutral" k-stroke: #C8F04A
                      all others: #C4C4BF

ANIMATIONS (animated=true):
  Idle / empty state:  opacity pulse 0.4 → 1.0 → 0.4, 2s loop
  Loading:             slow rotation, 8s full turn
  Success:             scale 1.0 → 1.2 → 1.0, 300ms

STATIC (animated=false):
  No animation — used inline as directional indicator in rows

USED FOR:
  Loading states, empty states (slow pulse)
  AI-generated content signal (small, static)
  Directional delta indicators in rows (replaces ↑↓)
  Onboarding (large, slow pulse)

⚠️ k-stroke needs more visual prominence — fix in Session 08 (Onboarding)
```

---

## THE ā MACRON RULE

1px horizontal line in `colors.accent` (#C8F04A).
Use ONLY as a meaningful divider. Never decoration.

```
CORRECT uses:
  Between assets and liabilities in PositionHeroCard
  Active tab indicator in bottom navigation bar
  Progress bar fill colour
  Between Growth / Stability / Locked sections in Portfolio
  Between Live and Locked columns in PortfolioTotalsCard
  Between sections in MonthlyReviewSheet
  Between category list and Transfers section in Spend screen

INCORRECT uses:
  Random decorative lines between cards
  Header underlines
  Any purely visual separation
  Anything not listed above — ask the PM first
```

On hero card background: use `colors.heroBorder` (rgba(200,240,74,0.2))
— the standard accent is too bright on the dark background.

---

## EMPTY STATE PATTERN — LOCKED (March 2026)

The current locked pattern. This replaced the blurred overlay approach.

```
Ghost screen:
  Full scrollable version of the populated screen
  All financial numbers replaced with RedactedNumber component (XXXXXX)
  Screen opacity: 0.5 — intentionally muted, visible but clearly not real
  NOT a blur — opacity only

Floating pill (position absolute, always visible over ghost):
  "+ Connect your data"
  Background: colors.accent (#C8F04A)
  BorderRadius: 999 (pill)
  KasheAsterisk size 14 + SpaceGrotesk_600SemiBold text
  Position: bottom 24, centered, zIndex 10

Invitation sheet (on pill tap):
  Slides up from bottom, 350ms ease-out
  Dark scrim behind sheet
  Drag handle top centre
  KasheAsterisk animated (slow pulse)
  Headline + description
  [+ Upload now] accent CTA button
  Secondary text link ("Add manually instead")
  Dismisses on scrim tap or action

isRedacted prop pattern:
  Every component that displays financial data accepts isRedacted?: boolean
  When true: all numbers → RedactedNumber, all bars → 0 width
  Structure (labels, icons, layout) stays visible — only data is hidden
  MonthlyReviewLink: returns null when isRedacted=true
```

EXCEPTIONS — do not use the ghost pattern for:
- `InsightsEmptyInsightState` — clean quiet card, not a ghost
- FIRE planner not set up — clean prompt card, one input shown immediately

---

## COMPONENT RULES

```
SpendCategoryRow — THREE variants:
  standard  ~72px   icon + name + amount + proportion bar + chevron
  insight   ~96px   + one-line insight beneath (zero API cost, templated)
  mortgage  muted   MacronRule replaces proportion bar, excluded from totals

Proportion bar:
  Animated on mount: Animated.Value 0 → actual%, 600ms, Easing.out(Easing.quad)
  No budget set: accent green, width = % of total spend
  Under budget:  accent green fill
  80–99%:        warning (#FFB547) fill
  100%+:         danger (#FF5C5C) fill

Category icon container:
  36 × 36, borderRadius: 8
  Background: rgba(200, 240, 74, 0.12)  — faint green tint

SpendHeroCard month selector:
  Lives INSIDE the hero card — not in SpendScreenHeader
  SpendScreenHeader contains only: AppHeader row + (nothing else)
```

---

## ANIMATION SPEC

```
Micro-interactions:  200–300ms ease-out
Progress bar fill:   600ms ease-out, animates on mount from 0 to actual
Price updates:       gentle tick on number change
Transitions:         slide (not fade) — feels native
Loading:             single pulsing accent dot — no spinners
FIRE slider:         smooth real-time update, no animation lag
Bottom sheets:       slide up from bottom, 300ms ease-out
Sheet dismiss:       slide down, 250ms ease-in
Expand/collapse:     React Native Animated API, 300ms
```

Never use `react-native-reanimated` until Session 10 (native builds).
All animations use React Native's built-in `Animated` API.

---

## BOTTOM SHEET PATTERN

```
Drag handle: top centre, 4px height, 40px width, borderRadius 2,
             background: colors.border
Dark scrim behind sheet when open
Dismiss on scrim tap
[Cancel] always available as text link at bottom
[Primary action] accent button above [Cancel]
```

---

## NOTIFICATION DOT

```
Size: 6px circle, positioned top-right of [+] button
Amber (#FFB547): stale data or upcoming vesting event within 7 days
Red (#FF5C5C):   spend over 90% of monthly budget
Priority: Red takes over Amber — only one dot shown at a time
```

---

*Maintained by: Anand (PM)*
*Last updated: 10 March 2026*
