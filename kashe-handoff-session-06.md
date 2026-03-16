# Kāshe — Session 06 Handoff Document
*Session 05 → Session 06*
*Date: 16 March 2026*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + investment domain expert
helping Anand build Kāshe — a personal finance app for globally
mobile professionals managing multi-currency finances.
Anand is a coding beginner with strong product instincts.
One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. This file (orientation)
2. CLAUDE-state.md (full build state + locked decisions)
3. CLAUDE-experience.md → "Portfolio Screen — Full Spec"
4. engineering-rules.md (architecture rules)
5. design-system.md (tokens, typography, spacing)

The spec files are the source of truth.
This handoff doc is orientation only.

---

## HOW WE WORK

1. Claude writes prompt in planning chat (Claude.ai project)
2. Anand pastes into Claude Code terminal
3. Anand previews at localhost:8081, shares screenshot
4. Claude reviews screenshot thoroughly — flags all issues
5. Claude gives exact git commands
6. Anand runs git commands manually in normal terminal
   (NEVER through Claude Code — git is always run by hand)
7. Commit confirmed → next ticket

**Rules:**
- One ticket at a time. Preview before commit. Commit before next.
- `--legacy-peer-deps` on every npm install. No exceptions.
- Never react-native-reanimated. Animated API only.
- Git always run manually by Anand, never by Claude Code.
- MD files updated in planning chat, downloaded, committed with code.

---

## PROJECT DETAILS

**Repo:** github.com/anandsankar-lab/kashe (private)
**Local:** ~/Documents/kashe
**Framework:** React Native / Expo SDK 55, TypeScript strict, Expo Router
**Preview:** `npx expo start` → press `w` → localhost:8081
**Node:** v25.6.1, npm 11.9.0

---

## WHAT WAS BUILT — SESSIONS 01 TO 05

### Complete screens
- Home screen ✅ (all components, dark/light, mock data)
- Spend screen ✅ (all components, category detail, transaction edit)

### Portfolio screen — PORT-01 to PORT-08 complete
- PORT-01: PortfolioTotalsCard (Live/Locked, macron rule, freshness)
- PORT-02: PortfolioSectionHeader (GROWTH/STABILITY/LOCKED)
- PORT-03/04/05: PortfolioHoldingRow (live/locked/protection variants,
  SVG icons, animated allocation bar, freshness dot)
- PORT-06: PortfolioInsightStrip (conditional, swipe dismiss, PanResponder)
- PORT-07: InvestmentPlanCard (collapsed/expanded, progress bar,
  salary contributions, suggested allocation, formatCurrency applied)
- PORT-08: InstrumentSuggestionSheet (bottom sheet, GROWTH/STABILITY/LOCKED
  content variants, disclaimer pinned at bottom)

### Infrastructure built this session
- /constants/formatters.ts — manual regex currency formatter.
  Intl.NumberFormat is permanently banned — unreliable in Expo web.
  Use formatCurrency() everywhere a currency value is rendered.
- ai-insights.md — full rewrite with scalable source architecture:
  Seed + Discover + Weight, Tier 1/2/3 (50/30/20 points),
  dynamic discovery pass, 6-step reasoning chain,
  confidence scoring, social sentiment threshold rules.

### Key commits this session
```
5ef86a3  [PORT-06] PortfolioInsightStrip
7a0b244  [PORT-07] InvestmentPlanCard
f2a7991  [PORT-08] InstrumentSuggestionSheet + ai-insights.md rewrite
```

---

## CRITICAL ARCHITECTURE RULES — NON-NEGOTIABLE

### 1. ThemeContext Pattern
```
useColorScheme() ONLY in context/ThemeContext.tsx
const theme = useTheme()  ← correct
const { theme } = useTheme()  ← WRONG, never do this

theme.*    → surface, border, background (mode-switching values)
colours.*  → textPrimary, textSecondary, textDim, accent,
             danger, warning, success (static values, import from colours.ts)

Reference: SpendCategoryRow.tsx is the canonical example.
No hardcoded hex anywhere in components.
```

### 2. Imports
```
Relative imports only. Never @/ alias.
From app/(tabs)/: '../../components/portfolio/X'
From components/portfolio/: '../shared/X', '../../context/ThemeContext'
Check spend.tsx for the exact import pattern and copy it.
```

### 3. Exports + Styling
```
Default exports only: export default function MyComponent
StyleSheet.create() for all styles — no inline style objects
```

### 4. Typography
```
Space Grotesk — display numbers, hero figures, headings
Inter — all body text, labels, captions, UI text
Never Syne. Never DM Sans. Permanently retired.
```

### 5. Currency Formatting
```
Always: formatCurrency(amount, currency) from constants/formatters.ts
Never: Intl.NumberFormat (banned — breaks Expo web bundler)
Never: template literals with raw numbers e.g. `€${amount}`
```

### 6. Animation
```
React Native Animated API only.
react-native-reanimated = permanently banned from web builds.
Will return for native-only builds in QA session.
```

---

## WHAT TO BUILD — SESSION 06

Build in this exact order. Do not skip ahead.
Full spec: CLAUDE-experience.md → "Portfolio Screen — Full Spec"

---

### PORT-09: BucketReassignSheet
**File:** `/components/portfolio/BucketReassignSheet.tsx`

```
Props:
  holding: PortfolioHolding | null
  isVisible: boolean
  onClose: () => void
  onConfirm: (holdingId: string, newBucket: BucketType) => void

BEHAVIOUR:
  Slides up from bottom when isVisible=true
  350ms ease-out using Animated API
  Dark scrim (rgba 0,0,0,0.5) — tap scrim → onClose()
  Returns null when !isVisible AND animation complete

VISUAL STRUCTURE:
  Drag handle: 4px × 40px, borderRadius 2, theme.border, centered
  Header: "Reassign {holding.name}"
    SpaceGrotesk_600SemiBold, fontSize 18, colours.textPrimary
    paddingHorizontal 20, paddingTop 20, paddingBottom 8

  System reasoning text:
    "We placed this in {holding.bucket} because it's a
     {holding.assetType}. Change it if that doesn't fit
     how you think about this money."
    Inter_400Regular, fontSize 13, colours.textDim
    paddingHorizontal 20, paddingBottom 16

  MacronRule full width

  Three radio options (paddingHorizontal 20):
    Each option: TouchableOpacity, paddingVertical 14,
    row layout: radio circle left + text right

    Radio circle: 20px diameter, borderRadius 10
      Unselected: border 2px colours.textDim, fill transparent
      Selected:   border 2px colours.accent, filled circle
                  8px inner circle colours.accent

    Option 1: GROWTH
      Label: "Growth"  Inter_500Medium, fontSize 15, colours.textPrimary
      Description: "Equity, high growth potential"
                   Inter_400Regular, fontSize 13, colours.textSecondary

    Option 2: STABILITY
      Label: "Stability"
      Description: "Cash, savings, lower risk"

    Option 3: LOCKED
      Label: "Locked"
      Description: "Committed for a period"

    Currently held bucket pre-selected when sheet opens.
    Selecting different option updates local state only.

  MacronRule full width

  Buttons (paddingHorizontal 20, paddingTop 16, paddingBottom 32):
    [Confirm] — full width, accent background, borderRadius 12
      Inter_500Medium, fontSize 15, dark text
      onPress: onConfirm(holding.id, selectedBucket)
      → console.log for now ("Reassigned {id} to {bucket}")

    [Cancel] — text link, centered, marginTop 12
      Inter_400Regular, fontSize 14, colours.textSecondary
      onPress: onClose()

RULES:
  Does NOT change asset type — only the bucket label
  Never allows LOCKED bucket for protection-designated holdings
    (isProtection=true → hide LOCKED option, show dim note:
    "Protection holdings stay in Stability")
  Entry point is HoldingDetailScreen [Reassign bucket] ONLY
  No long-press trigger anywhere — PM decision, locked.
```

**Wire into:** `/app/(tabs)/portfolio.tsx`

Add state:
```typescript
const [reassignSheet, setReassignSheet] = useState<{
  visible: boolean;
  holding: PortfolioHolding | null;
}>({ visible: false, holding: null });
```

Add BucketReassignSheet at end of return (outside ScrollView):
```typescript
<BucketReassignSheet
  holding={reassignSheet.holding}
  isVisible={reassignSheet.visible}
  onClose={() => setReassignSheet({ visible: false, holding: null })}
  onConfirm={(holdingId, newBucket) => {
    console.log('Reassign:', holdingId, '->', newBucket);
    setReassignSheet({ visible: false, holding: null });
  }}
/>
```

For preview: add a test button temporarily below the section headers
to open the sheet with a mock holding. Remove before PORT-10.

---

### PORT-10: HoldingDetailScreen
**File:** `/app/portfolio/[holdingId].tsx`

This is a full screen, not a sheet. Expo Router dynamic route.
Read holdingId from `useLocalSearchParams()`.
Look up holding in MOCK_PORTFOLIO_HOLDINGS by id.

```
SHARED HEADER (all variants):
  Back chevron + holding name
  Standard Expo Router back navigation

LIVE HOLDING LAYOUT:
  Geography flag text (large, 48px, top of content area)
  Current value: SpaceGrotesk_700Bold, 36px, colours.textPrimary
  Daily change row:
    KasheAsterisk direction="up/down/neutral" size=14
    "€{dailyChange} ({dailyChangePercent}%)" Inter_400Regular
    Accent if positive, danger if negative, textDim if flat

  "X.X% of live portfolio"
    Inter_400Regular, fontSize 13, colours.textSecondary, marginTop 4

  MacronRule, marginTop 16

  DETAILS SECTION (labelled rows):
    Each row: paddingVertical 12, space-between
    Left: Inter_400Regular, fontSize 13, colours.textSecondary
    Right: Inter_500Medium, fontSize 13, colours.textPrimary

    Rows to show (if data exists):
      Quantity / Units
      Current price per unit
      Purchase price
      Unrealised gain/loss:
        If purchasePrice exists: show (currentValue - purchasePrice)
        Accent colour if gain, danger if loss
      Asset type (e.g. "EU ETF")
      Geography
      Tax wrapper (if not 'none')
      Data source ("Manual" for now)
      Last updated

  MacronRule, marginTop 8

  PURPOSE BUCKET ROW:
    Left: "Purpose bucket"  Inter_400Regular, colours.textSecondary
    Right: TouchableOpacity row
      Bucket name: Inter_500Medium, colours.textPrimary
      "›" chevron: colours.textDim
      onPress: open BucketReassignSheet with this holding

  MacronRule, marginTop 8

  For LOCKED holdings: render LockedProjectionCard here (see below)
  For PROTECTION holdings: render ProtectionStatusCard here (see below)

  ACTIONS (bottom, stacked, paddingHorizontal 20, paddingBottom 40):
    [Edit holding]    — outlined button, Inter_500Medium
      → console.log for now
    [Reassign bucket] — outlined button
      → open BucketReassignSheet
    [Remove holding]  — text link, colours.danger, centered, marginTop 8
      → console.log for now


SUB-COMPONENT: LockedProjectionCard
File: /components/portfolio/LockedProjectionCard.tsx
Renders on LOCKED holdings where unlockDate is known.

Props:
  holding: PortfolioHolding

Visual:
  Card: theme.surface, borderRadius 16, padding 16, marginTop 12

  Header row:
    "🔒 Projected at unlock"
    Inter_500Medium, fontSize 13, colours.textDim, uppercase, letterSpacing 0.8

  Projected value (large):
    Calculate: FV = currentValue × (1 + rate)^yearsToUnlock
    Rate by subtype:
      in_ppf: 7.1%   in_epf: 8.2%   in_fd: 6.5% (default)
      in_nsc: 7.2%   eu_pension: 5.0%  alternative_general: null
    SpaceGrotesk_700Bold, fontSize 28, colours.accent

  Rate source line:
    "at {rate}% {instrument} rate (current)"
    Inter_400Regular, fontSize 12, colours.textSecondary

  Unlock date line:
    "Unlocks {month} {year}" e.g. "Unlocks Mar 2031"
    Inter_400Regular, fontSize 12, colours.textSecondary

  Disclaimer:
    "Projection only — actual returns may vary"
    Inter_400Regular, fontSize 11, colours.textDim, marginTop 8

  For alternative_general (Crowdcube etc):
    Do NOT show projection formula.
    Show: "Last known valuation: €{currentValue}"
    Show: "Illiquid alternative — outcome uncertain"
    colours.textDim, small


SUB-COMPONENT: ProtectionStatusCard
File: /components/portfolio/ProtectionStatusCard.tsx
Renders on holdings where isProtection=true.

Props:
  holding: PortfolioHolding
  avgMonthlySpend: number  (use 2847 from mock data for now)

Visual:
  Card: theme.surface, borderRadius 16, padding 16, marginTop 12

  Header row:
    "🛡️ Emergency fund"
    Inter_500Medium, fontSize 13, colours.textDim, uppercase, letterSpacing 0.8

  Coverage months (large):
    months = holding.currentValue / avgMonthlySpend
    SpaceGrotesk_700Bold, fontSize 28
    Colour:
      < 3 months: colours.danger
      3–6 months: colours.accent
      > 6 months: colours.textSecondary

  Coverage label:
    "{months} months covered"
    Inter_400Regular, fontSize 14, colours.textSecondary

  Status bar:
    Outer: height 6, borderRadius 3, theme.border, width 100%
    Inner fill:
      width = min(months / 6, 1) × 100%
      < 3 months: colours.danger
      3–6 months: colours.accent
      > 6 months: colours.textSecondary

  Recommended range row:
    Left: "Recommended"  Inter_400Regular, colours.textSecondary, fontSize 12
    Right: "€{min} – €{max}"  Inter_500Medium, colours.textPrimary, fontSize 12
    min = avgMonthlySpend × 3
    max = avgMonthlySpend × 6

  Based on line:
    "Based on €{avgMonthlySpend} avg monthly spend"
    Inter_400Regular, fontSize 11, colours.textDim

  If > 6 months: dim note below bar
    "You may have more than you need here. Consider investing the surplus."
    Inter_400Regular, fontSize 12, colours.textDim, marginTop 8

  MacronRule marginTop 12

  [Remove protection designation] — text link
    Inter_400Regular, fontSize 13, colours.textSecondary, textAlign center
    "This won't delete the holding, just the designation."
    Inter_400Regular, fontSize 11, colours.textDim, textAlign center, marginTop 4
    onPress: console.log for now


ROUTING:
  From PortfolioHoldingRow tap → navigate to /portfolio/{holding.id}
  Wire onPress in portfolio.tsx:
    onPress={(id) => router.push(`/portfolio/${id}`)}
  Import: import { useRouter } from 'expo-router'
```

---

### PORT-11: Portfolio Empty State
**Wire into:** `/app/(tabs)/portfolio.tsx`

```
Standard ghost pattern per CLAUDE-state.md locked spec.

Add boolean at top of portfolio.tsx:
  const hasData = true  // toggle to false to preview empty state

Wrap ScrollView content in a View with opacity:
  <View style={{ opacity: hasData ? 1 : 0.5 }}>
    {/* all existing content */}
  </View>

Pass isRedacted={!hasData} to all components that accept it:
  PortfolioTotalsCard, InvestmentPlanCard, PortfolioSectionHeader,
  PortfolioHoldingRow

PortfolioInsightStrip: pass insight={hasData ? activeInsight : null}
  (returns null automatically when no insight)

Floating pill (position absolute, bottom 24, centered, zIndex 10):
  Only visible when !hasData
  Acid green background (#C8F04A), borderRadius 999
  KasheAsterisk size=14 + "  Connect your data"
  SpaceGrotesk_600SemiBold, fontSize 14, dark text
  paddingHorizontal 20, paddingVertical 12
  onPress: console.log('Open invitation sheet')
  — full UniversalAddSheet wired in onboarding session

Test both states:
  hasData=true  → normal populated screen
  hasData=false → ghost at 0.5 opacity + floating pill
  Screenshot both before committing.
```

---

## AFTER PORT-11: Portfolio Screen Complete

Run final portfolio.tsx assembly check:
- All 8 components rendering in correct order
- Scroll works end to end
- Both light and dark mode
- hasData=true and hasData=false both look correct
- No TypeScript errors

Then update CLAUDE-state.md and write kashe-handoff-session-07.md.

---

## SESSION 07 PREVIEW — Insights Screen + FIRE Planner

Next session builds INS-01 through INS-10:
```
INS-01  InsightsHeader
INS-02  InsightsActiveInsightCard (all 4 insight types)
INS-03  InsightsEmptyInsightState ("Nothing needs attention")
INS-04  MonthlyReviewCard (all 4 states)
INS-05  MonthlyReviewSheet (full bottom sheet)
INS-06  FIRETeaserCard (both states)
INS-07  PastReviewsList
INS-08  InsightDetailSheet (shared — Spend, Portfolio, Insights)
INS-09  /app/insights/fire.tsx — FIRE Planner screen
          FIREHouseholdToggle, FIRESliderHero (5–30yr, real-time)
          FIREInputsCard (6 inputs, collapsible)
          FIREAssumptionsCard (always visible)
          FIREProfileSelector
INS-10  Insights empty state
```
Spec: CLAUDE-experience.md → "Insights Screen — Full Spec"
      CLAUDE-experience.md → "FIRE Planner Screen — Full Spec"
      CLAUDE-financial.md → "FIRE Engine — Full Spec"

---

## KNOWN OPEN ISSUES (carry forward)

1. **Number formatting in TextInput** — InvestmentPlanCard monthly target
   shows "1500" not "1,500". Fix: format on blur, parse on save. Polish session.

2. **PPF Account currency** — Still shows ₹420,000 in some paths.
   Full fix when FX service wired in data layer session.

3. **Dutch brand names in Spend mock data** — Fix in data layer session.
   Albert Heijn → "Supermarket", Thuisbezorgd → "Food Delivery",
   Bol.com → "Online Store", NS/GVB → "Public Transport"

4. **Category detail screen layout gap** — Polish session.

5. **KasheAsterisk k-stroke prominence** — Polish session.

6. **Vertical MacronRule in PortfolioTotalsCard** — Polish session.

7. **InstrumentSuggestionSheet drag handle** — Check visibility in PORT-09 pass.

---

## QUICK REFERENCE

1.  `--legacy-peer-deps` every npm install
2.  Never react-native-reanimated (web builds)
3.  `const theme = useTheme()` — never destructured
4.  `theme.*` surface/border/background only. `colours.*` everything else.
5.  `StyleSheet.create()` always. No inline styles.
6.  `formatCurrency()` from formatters.ts always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero `any`.
9.  Space Grotesk numbers. Inter body. Never Syne/DM Sans.
10. SVG icons in HoldingRow — no emoji, no containers.
11. Git commands run manually by Anand — never through Claude Code.
12. Preview → approve → commit. One ticket at a time.
