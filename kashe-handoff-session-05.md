# Kāshe — Session 05 Handoff Document
*Session 04 → Session 05*
*Date: 11 March 2026*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer helping Anand build Kāshe —
a personal finance app for globally mobile Indian professionals.
Anand is a coding beginner with strong product instincts.
Be patient. Explain your reasoning. One ticket at a time.

**Read this document fully before doing anything.**
**Then read ALL FOUR spec files before writing any code:**

1. `CLAUDE.md` — tech stack, design tokens, non-negotiables
2. `CLAUDE-experience.md` — all UI specs, every screen, every component
3. `CLAUDE-financial.md` — calculations, CSV parser, FIRE engine, AI insights
4. `CLAUDE-identity.md` — auth, profiles, security pipeline

These files are the single source of truth. This handoff doc
is orientation. The spec files have the detail.

---

## HOW WE WORK — THE PROCESS

1. **One ticket at a time.** Never build ahead.
2. **Claude Code (terminal) for execution.** Anand types `claude`
   in terminal and pastes the prompt. Claude Code builds files.
3. **This planning chat for prompts and review.** Prompts written
   here, screenshots reviewed here, decisions made here.
4. **Preview before confirming.** Every ticket must render in
   browser before it is considered done.
5. **Commit after every ticket.** git commit before moving on.
6. **Push at end of session.**
7. **npm installs always use --legacy-peer-deps.** No exceptions.
8. **Never install react-native-reanimated.** Breaks web bundler.
   Use React Native's Animated API. Returns for native in Session 10.

---

## PROJECT DETAILS

**Repo:** github.com/anandsandk-lab/kashe (keep PRIVATE)
**Local:** ~/Documents/kashe
**Framework:** React Native / Expo SDK 55, TypeScript strict, Expo Router
**Preview:** `npx expo start` → press `w` → localhost:8081
**Node:** v25.6.1, npm 11.9.0

---

## CRITICAL ARCHITECTURE RULES — NON-NEGOTIABLE

### 1. ThemeContext Pattern (locked March 2026)
```
useColorScheme() is called ONLY in context/ThemeContext.tsx
Raw hex values ONLY in constants/colours.ts
Every component calls: const theme = useTheme()
  Note: useTheme() returns the theme object DIRECTLY.
  Correct:   const theme = useTheme()
  WRONG:     const { theme } = useTheme()

theme.* for dynamic surface/border/background values.
colours.* (import from constants/colours) for static tokens:
  textPrimary, textSecondary, textDim, accent, danger, warning, success
  These don't change with mode — import from colours, not theme.

Reference: SpendCategoryRow.tsx is the canonical example of this pattern.
No inline colour decisions. No Colors.dark.X. No hardcoded hex.
```

### 2. Import Paths
```
This project uses RELATIVE imports — NOT the @/ alias.
  From app/(tabs)/portfolio.tsx:  '../../context/ThemeContext'
  From components/portfolio/:     '../../context/ThemeContext'
  From components/portfolio/:     '../shared/MacronRule'
Check how spend.tsx imports ThemeContext — copy that pattern.
```

### 3. Export Pattern
```
All components use DEFAULT exports.
  Correct:   export default function MyComponent(...)
  WRONG:     export function MyComponent(...)
```

### 4. Typography
```
Space Grotesk — display numbers, hero figures, headings
Inter — all body text, labels, captions, UI text
Never Syne. Never DM Sans. These are retired permanently.
Always use constants from constants/typography.ts.
```

### 5. StyleSheet Pattern
```
StyleSheet.create() for ALL styles — no inline style objects.
This is the SpendCategoryRow pattern — locked for all components.
```

### 6. Empty State Pattern (locked March 2026)
```
Ghost screen at 0.5 opacity — NOT blurred.
All financial numbers → RedactedNumber component.
Screen is fully scrollable.
Floating acid green pill at bottom: "+ Connect your data"
Pill tap → invitation sheet (350ms ease-out).
```

### 7. PortfolioHoldingRow Icons (locked March 2026)
```
SVG stroke-only icons — no emoji, no icon container boxes.
Direct render, same pattern as CategoryIcon in SpendCategoryRow.
All strokes: colours.textSecondary, strokeWidth 1.6, fill "none"
Icon size: 22 × 22, viewBox "0 0 24 24"
Full SVG paths in design-system.md → "PortfolioHoldingRow SVG ICON SYSTEM"
```

---

## WHAT WAS BUILT IN SESSION 04

### ✅ PORT-01: Types + Mock Data + PortfolioTotalsCard
`/types/portfolio.ts` — Two-layer type system + DEFAULT_BUCKET map
`/constants/mockData.ts` — MOCK_PORTFOLIO_HOLDINGS, MOCK_PORTFOLIO_TOTALS,
  MOCK_INVESTMENT_PLAN added
`/components/portfolio/PortfolioTotalsCard.tsx` — Complete
`/app/(tabs)/portfolio.tsx` — Header + TotalsCard wired

### ✅ PORT-02: PortfolioSectionHeader
`/components/portfolio/PortfolioSectionHeader.tsx`
Label, total, MacronRule divider, empty bucket state ("[+ Add one]")

### ✅ PORT-03/04/05: PortfolioHoldingRow
`/components/portfolio/PortfolioHoldingRow.tsx`
Three variants: live / locked / protection
SVG icons: rupee (India), trend line (Europe/Global),
  padlock (locked), shield+check (protection)
Allocation bar animated on mount (600ms ease-out)
Sub-label format: `${assetType} · ${geography}` (e.g. "Mutual Fund · India")
All wired in portfolio.tsx with mock holdings

---

## NEXT TICKETS — SESSION 05

Build in this exact order. Full spec: CLAUDE-experience.md

### PORT-06: PortfolioInsightStrip
**File:** `/components/portfolio/PortfolioInsightStrip.tsx`

**Before writing any code, read:**
- `/components/spend/SpendInsightStrip.tsx` ← copy this pattern exactly
- CLAUDE-experience.md → "Zone 2 — AI Insight Strip"

```
Props:
  insight: PortfolioInsight | null
  onDismiss: () => void
  onPress: () => void

Returns null entirely when insight is null.
Never a placeholder. Never permanent.

Visual (identical to SpendInsightStrip):
  KasheAsterisk (small, static, direction="neutral")
  Insight type label: Inter 500, uppercase, textDim, letterSpacing +0.8
  [×] dismiss button, top right
  Headline: SpaceGrotesk 600, textPrimary, max 10 words
  Body: Inter 400, textSecondary, max 40 words
  Source citation (MARKET_EVENT only): "via Reuters · 3 hours ago"
  Forum signal (MARKET_EVENT only): "⚡ Stocktwits 68% bearish"
  Confidence LOW: dim note "Limited sources available"
  Dismiss: swipe left OR tap × → onDismiss()
  Tap body → onPress()

Wire in portfolio.tsx with hardcoded mock insight:
  type: 'PORTFOLIO_HEALTH'
  headline: "Employer stock above 15% of portfolio"
  body: "Your employer stock is 18% of your live portfolio.
         Consider diversifying to reduce concentration risk."
```

---

### PORT-07: InvestmentPlanCard
**File:** `/components/portfolio/InvestmentPlanCard.tsx`

```
Props:
  plan: InvestmentPlan
  onSaveTarget: (target: number) => void
  onExploreOptions: (bucket: BucketType) => void
  isRedacted?: boolean

Two states: collapsed + expanded
Animated: React Native Animated API, 300ms. Never reanimated.

COLLAPSED — no target set:
  "Monthly investment plan"  Inter 500, textPrimary
  "Set a target to get personalised guidance →"  accent colour
  Tap → expands

COLLAPSED — target set:
  "Monthly investment plan"
  Progress bar (accent fill, animated on mount)
  "€920 of €1,500 invested this month"  Inter 400, textSecondary
  Tap → expands

EXPANDED:
  Monthly target editable field (SpaceGrotesk, large)
  Salary contributions section (mock: ABN Amro Pension €380/month)
  "Remaining to actively allocate: €1,120/month"  SpaceGrotesk 700
  ā macron rule
  Suggested allocation rows: GROWTH €672 (60%), STABILITY €224 (20%),
    LOCKED €224 (20%)
  Gap analysis text (templated, never AI-generated)
  [Explore options →] → onExploreOptions('GROWTH')
  [Save target] accent button
  [Cancel] text link

RULES:
  Never show specific fund names in suggestion text
  Suggestions are templated — not AI
```

---

### PORT-08: InstrumentSuggestionSheet
**File:** `/components/portfolio/InstrumentSuggestionSheet.tsx`

```
Props:
  bucket: BucketType
  isVisible: boolean
  onClose: () => void

Bottom sheet, scrollable.
Header: "{Bucket} — commonly used instruments"

Content grouped by geography (see CLAUDE-experience.md for full list):
  INDIA — index funds, flexi-cap with AMFI/Groww links
  EUROPE — VWRL, IWDA with justETF links

Disclaimer always visible at bottom:
  "These are educational suggestions, not financial advice.
   Kāshe earns nothing from these links. Always do your own research."
  Inter 400, textDim, small

RULES:
  No affiliate links — ever
  Links: Linking.openURL (in-app browser behaviour)
  Framing: "worth exploring" language throughout
```

---

### PORT-09: BucketReassignSheet
**File:** `/components/portfolio/BucketReassignSheet.tsx`

```
Props:
  holding: PortfolioHolding
  isVisible: boolean
  onClose: () => void
  onConfirm: (holdingId: string, newBucket: BucketType) => void

Bottom sheet.
Header: "Reassign {holding name}"

System reasoning (Inter 400, textDim, small):
  "We assigned this to {bucket} because it's a {assetType}.
   Change it if that doesn't fit how you think about this money."

Three radio options:
  ○  Growth      Equity, high growth potential
  ○  Stability   Cash, savings, lower risk
  ○  Locked      Committed for a period

Current bucket pre-selected.
[Confirm] accent button → onConfirm(holding.id, selectedBucket)
[Cancel] text link → onClose()

RULES:
  Does not change asset type — only bucket label
  Confirm → console.log for now (data layer later)
```

---

### PORT-10: HoldingDetailScreen
**File:** `/app/portfolio/[holdingId].tsx`

Full spec: CLAUDE-experience.md → "Holding Detail Screen"

Key summary:
```
Three layouts by variant:

LIVE HOLDING:
  Header: name + geography SVG icon
  Current value (SpaceGrotesk 700, display size)
  Daily + monthly movement (KasheAsterisk directional)
  Allocation bar (% of live portfolio)
  Bucket pill + [Reassign bucket] → BucketReassignSheet
  Freshness row + [Request update] (console.log)
  Protection toggle (Stability holdings only)

LOCKED HOLDING:
  Name + padlock SVG
  Current value (SpaceGrotesk 700)
  Unlock date or "Outcome unknown"
  Freshness row

PROTECTION HOLDING:
  Name + shield SVG
  Current value (SpaceGrotesk 700)
  "X.X months covered" (accent ≥3, warning <3)
  [Remove protection designation] danger colour text link
  Freshness row
```

---

### PORT-11: Portfolio Empty State
**File:** `/app/(tabs)/portfolio.tsx` — add empty state wrapper

```
Standard ghost pattern:
  isRedacted=true passed to all components
  All values → RedactedNumber, bars → 0
  0.5 opacity wrapper
  Floating "+ Connect your data" pill

PortfolioInsightStrip: returns null when isRedacted=true
All other components already accept isRedacted prop.

Empty state condition:
  No holdings → ghost + pill
  Any holdings → normal render
```

---

## REMAINING SESSION ORDER

```
Session 05  PORT-06 to PORT-11 (this session)
Session 06  Insights Screen + FIRE Planner (INS-01 to INS-10)
Session 07  Data Layer — services, stores, hooks (no UI)
Session 08  Wire UI to Data Layer
Session 09  Onboarding Stack (10 screens + UniversalAddSheet)
Session 10  Settings + Polish
Session 11  QA + Native Build Prep
```

---

## KNOWN OPEN ISSUES

1. Dutch brand names in Spend mock data — fix before data layer session
2. Category detail screen layout bug — empty space between month selector
   and tag pills — fix in polish session
3. KasheAsterisk k-stroke needs more prominence — fix in polish session
4. Vertical MacronRule in PortfolioTotalsCard uses plain View — standardise
   in polish session

---

## QUICK REFERENCE

1. `--legacy-peer-deps` on every npm install
2. Never react-native-reanimated
3. `const theme = useTheme()` — never `const { theme } = useTheme()`
4. `theme.*` for surface/border/background. `colours.*` for static tokens.
5. `StyleSheet.create()` always. No inline style objects.
6. Default exports. Relative imports.
7. TypeScript strict. Zero `any`.
8. Space Grotesk for numbers/display. Inter for body/UI. Never Syne/DM Sans.
9. SVG icons in PortfolioHoldingRow — never emoji, never containers.
10. Read the reference component BEFORE building its portfolio equivalent.
    SpendInsightStrip → PortfolioInsightStrip
