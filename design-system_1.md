# Kāshe — Design System
*Read this before building any UI component or screen.*
*All decisions here are locked. Do not re-debate.*
*Last updated: 17 March 2026 — Hero card pattern, standard card
pattern, screen layout, and detail screen pattern locked after
full visual standardisation pass.*

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

All colours come from `useTheme()` or `colours.*`. Never raw hex.

```typescript
// THEME TOKENS — adapt to light/dark mode
theme.background      // Light: #F5F4F0  Dark: #111110
theme.surface         // Light: #FFFFFF  Dark: #1C1C1A
theme.border          // Light: #EEEEEA  Dark: #3A3A38
theme.textPrimary     // Light: #1A1A18  Dark: #F5F4F0
theme.textSecondary   // #8A8A85  (same both modes)
theme.textDim         // #C4C4BF  (same both modes)

// STATIC COLOUR TOKENS — same in both modes
colours.accent        // #C8F04A  (acid green — use sparingly)
colours.danger        // #FF5C5C
colours.warning       // #FFB547
colours.success       // #C8F04A  (same as accent)
colours.textOnAccent  // #1A1A18  (dark ink on green)

// HERO CARD TOKENS — always dark, both light and dark mode
// Used ONLY inside hero cards — never on standard surfaces
colours.heroGradientStart   // #1E1E1B
colours.heroGradientEnd     // #131311
colours.heroTextPrimary     // #F5F4F0
colours.heroTextSecondary   // rgba(245, 244, 240, 0.55)
colours.heroTextDim         // rgba(245, 244, 240, 0.35)
colours.heroAccent          // #C8F04A
colours.heroBorder          // rgba(200, 240, 74, 0.2)
colours.heroDanger          // #FF8080  (softened danger on dark)
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
borderRadius.hero   24   // hero cards only
borderRadius.input  12   // text inputs
borderRadius.pill   999  // pills, tags, badges
borderRadius.small  8    // icon containers, small elements
```

---

## SCREEN LAYOUT — LOCKED (17 March 2026)

Every screen's ScrollView uses these values exactly.
Reference: spend.tsx — the canonical screen layout.

```
ScrollView contentContainerStyle:
  paddingHorizontal: 20
  paddingTop: 16
  paddingBottom: 48

Gap between cards:         marginTop: 16
Gap before section headers: marginTop: 32
```

No exceptions. Do not invent new spacing values for screens.

---

## HERO CARDS — LOCKED (17 March 2026)

Three hero cards exist:
  PositionHeroCard (Home)
  SpendHeroCard (Spend)
  PortfolioTotalsCard (Portfolio)

Plus the hero section inside HoldingDetailScreen.
All follow identical rules:

```
ALWAYS dark gradient background — in both light AND dark mode
  LinearGradient: [colours.heroGradientStart, colours.heroGradientEnd]
  = ['#1E1E1B', '#131311']

borderRadius: 24 (borderRadius.hero)
padding: 24
overflow: 'hidden'  ← required to clip watermark bleed
No border — the gradient IS the card boundary

Background asterisk watermark (REQUIRED on all hero cards):
  Position: absolute, top: -45, right: -45
  Size: 200 × 200
  Opacity: 0.07
  All 6 strokes: colours.accent (all accent, purely decorative)
  strokeWidth: 14, strokeLinecap: 'round'
  animated={false}, direction="neutral"
  Wrap in <View pointerEvents="none"> to prevent touch capture

Text uses hero tokens ONLY — never standard theme tokens inside hero:
  colours.heroTextPrimary     primary values
  colours.heroTextSecondary   labels, supporting text
  colours.heroTextDim         timestamps, fine print
  colours.heroAccent          positive deltas
  colours.heroDanger          negative deltas
```

The hero card is the one premium moment on its screen.
It signals: this is your data, it matters.

---

## STANDARD CARDS — LOCKED (17 March 2026)

Every non-hero card follows this pattern exactly.
Reference: SpendCategoryRow, SpendInsightStrip.

```
backgroundColor: theme.surface
borderRadius: 16
padding: (match SpendCategoryRow/SpendInsightStrip exactly)
borderWidth: 0

NO borders on standard cards.
Surface on background provides sufficient visual separation.
```

---

## DETAIL SCREENS — LOCKED (17 March 2026)

Any screen that is a detail view of a list item.
Reference: /app/spend/[category].tsx — match exactly.

```
Screen background: theme.background (light in light mode)
ScrollView: same padding as standard screen layout

At the very top: hero card (always dark)
  Same pattern as PositionHeroCard / SpendHeroCard.
  The hero is always dark regardless of screen mode.

All cards below the hero:
  Standard card pattern (theme.surface, borderRadius 16)

Never force a dark full-screen for detail views.
The contrast between the dark hero and light screen
creates the premium feeling — not a dark background.
```

---

## THE KĀSHE ASTERISK — RULES

The brand mark. It does meaningful work — it is never pure decoration.

```
Props:
  size?: number           default 16
  animated?: boolean      default false
  direction?: 'up' | 'down' | 'neutral'   default 'neutral'

DIRECTIONAL SYSTEM — replaces ↑↓ text arrows everywhere:
  direction="up"      top stroke + k-stroke: colours.accent
                      all others: colours.textDim
  direction="down"    bottom stroke: colours.danger
                      k-stroke: colours.textDim
                      all others: colours.textDim
  direction="neutral" k-stroke: colours.accent
                      all others: colours.textDim

ANIMATIONS (animated=true):
  Idle / empty state:  opacity pulse 0.4 → 1.0 → 0.4, 2s loop
  Loading:             slow rotation, 8s full turn
  Success:             scale 1.0 → 1.2 → 1.0, 300ms

STATIC (animated=false):
  No animation — used inline as directional indicator in rows

WATERMARK (in hero cards):
  All 6 strokes: colours.accent
  strokeWidth 14, size 200×200, opacity 0.07
  This is a special decorative use — does not follow
  the directional colour system above.

⚠️ k-stroke needs more visual prominence — fix in Polish session
```

---

## THE ā MACRON RULE

1px horizontal line in `colours.accent` (#C8F04A).
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

On hero card background: use `colours.heroBorder`
(rgba(200,240,74,0.2)) — the standard accent is too bright
on dark background.

---

## EMPTY STATE PATTERN — LOCKED (March 2026)

```
Ghost screen:
  Full scrollable version of the populated screen
  All financial numbers → RedactedNumber component (XXXXXX)
  Screen opacity: 0.5 — intentionally muted, not blur
  NOT a blur — opacity only

Floating pill (position absolute, always visible over ghost):
  "+ Connect your data"
  Background: colours.accent (#C8F04A)
  BorderRadius: 999 (pill)
  KasheAsterisk size 14 + SpaceGrotesk_600SemiBold text
  Text colour: colours.textOnAccent
  Position: bottom 24, centered, zIndex 10

isRedacted prop pattern:
  Every component that displays financial data accepts
  isRedacted?: boolean
  When true: all numbers → RedactedNumber, all bars → 0 width
  Structure (labels, icons, layout) stays visible
```

---

## COMPONENT RULES

```
SpendCategoryRow — THREE variants (canonical list row reference):
  standard  ~72px   icon + name + amount + proportion bar + chevron
  insight   ~96px   + one-line insight beneath
  mortgage  muted   MacronRule replaces bar, excluded from totals

Proportion bar:
  Animated on mount: Animated.Value 0 → actual%, 600ms ease-out
  Under budget:  colours.accent fill
  80–99%:        colours.warning fill
  100%+:         colours.danger fill

Category icon container:
  36 × 36, borderRadius: 8
  Background: rgba(200, 240, 74, 0.12) — faint green tint

PortfolioHoldingRow — SVG ICON SYSTEM (LOCKED March 2026):
  NO emoji flags. NO text codes. NO icon container boxes.
  SVG stroke-only icons rendered directly.
  All strokes: theme.textSecondary, strokeWidth 1.6, fill "none"
  Icon size: 22 × 22, viewBox "0 0 24 24"

  LIVE variant — India geography (rupee symbol):
    Line x1="5" y1="6"  x2="19" y2="6"
    Line x1="5" y1="11" x2="19" y2="11"
    Line x1="5" y1="6"  x2="5"  y2="20"
    Line x1="5" y1="11" x2="15" y2="20"

  LIVE variant — Europe/US/Global (trend line):
    Polyline points="3,18 8,12 13,15 21,6"
    Circle cx="21" cy="6" r="2" fill={colour}

  LOCKED variant (padlock):
    Rect x="5" y="11" width="14" height="10" rx="2"
    Path d="M8 11V7a4 4 0 0 1 8 0v4"

  PROTECTION variant (shield + check):
    Path d="M12 2 L19 5 L19 12 Q19 17 12 21 Q5 17 5 12 L5 5 Z"
    Polyline points="9,12 11,14 15,10"
```

---

## ANIMATION SPEC

```
Micro-interactions:  200–300ms ease-out
Progress bar fill:   600ms ease-out, animates from 0 on mount
Price updates:       gentle tick on number change
Transitions:         slide (not fade) — feels native
Loading:             single pulsing accent dot — no spinners
FIRE slider:         smooth real-time update, no lag
Bottom sheets:       slide up from bottom, 300ms ease-out
Sheet dismiss:       slide down, 250ms ease-in
Expand/collapse:     React Native Animated API, 300ms
```

Never use `react-native-reanimated` until QA session (native builds).
All animations use React Native's built-in `Animated` API.

---

## BOTTOM SHEET PATTERN

```
Drag handle: top centre, height 4, width 40, borderRadius 2,
             backgroundColor theme.border
Dark scrim behind sheet when open
Dismiss on scrim tap
[Cancel] always available as text link at bottom
[Primary action] accent button above [Cancel]
```

---

## NOTIFICATION DOT

```
Size: 6px circle, positioned top-right of [+] button
Amber (colours.warning): stale data or upcoming vesting event
Red (colours.danger):    spend over 90% of monthly budget
Priority: Red takes over Amber — only one dot shown at a time
```

---

## VISUAL REFERENCE HIERARCHY

When building a new component, always read the reference
component first. Never guess at spacing or tokens.

```
Building a hero card?
  → Read PositionHeroCard.tsx

Building any list row?
  → Read SpendCategoryRow.tsx

Building an insight strip?
  → Read SpendInsightStrip.tsx

Building a detail screen?
  → Read /app/spend/[category].tsx

Building a bottom sheet?
  → Read BucketReassignSheet.tsx

Building a portfolio component?
  → Read the Spend equivalent first, then adapt
```

---

*Maintained by: Anand (PM)*
*Last updated: 17 March 2026*
