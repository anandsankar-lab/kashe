# Kāshe — CLAUDE-state.md
*Current build state. Read this before any new session.*
*Last updated: 10 March 2026*

---

## HOW TO USE THIS DOCUMENT

Before starting any session:
1. Read this file first
2. Read CLAUDE.md (in project root)
3. Read the relevant skill file(s) in /docs/skills/
4. Then and only then: write the Claude Code prompt

---

## SESSIONS COMPLETE

### Session 01 — Design System + Home Screen (Part 1)
✅ Environment setup (Node v25.6.1, npm 11.9.0, Claude Code)
✅ Expo SDK 55 + Expo Router + 4-tab navigation
✅ Fonts: Space Grotesk (700, 600, 400) + Inter (500, 400)
✅ Dark/light mode via ThemeContext
✅ /constants/colours.ts — all tokens, both modes, hero tokens
✅ /constants/typography.ts — 8 type styles
✅ /constants/spacing.ts — 4px grid + borderRadius (incl hero: 24)
✅ /constants/mockData.ts — fixed mock data
✅ /components/ui/Typography.tsx, Card.tsx, Button.tsx
✅ /components/shared/KasheAsterisk.tsx (directional system)
✅ /components/shared/MacronRule.tsx
✅ /components/shared/RedactedNumber.tsx
✅ /components/shared/EmptyState.tsx
✅ /components/home/HomeHeader.tsx
✅ /components/home/PositionHeroCard.tsx (always dark, watermark)
✅ /components/home/SpendSnapshot.tsx
✅ /components/home/MarketsStrip.tsx
✅ /components/home/PortfolioPulse.tsx
✅ /components/home/FIREProgress.tsx

### Session 02 — Home Screen (Complete)
✅ Fonts replaced: Syne + DM Sans → Space Grotesk + Inter
✅ ThemeContext pattern introduced and locked
✅ /components/home/SegregationToggle.tsx
✅ /components/home/MonthlyReviewLink.tsx
✅ /components/home/SpendStoryCard.tsx
✅ /components/shared/AppHeader.tsx
✅ /context/ThemeContext.tsx
✅ /hooks/useColors.ts
✅ react-native-svg, expo-linear-gradient installed

### Session 03 — Spend Screen
✅ /types/spend.ts
✅ /hooks/useDataSources.ts
✅ /components/shared/DataSourceSheet.tsx
✅ /components/spend/SpendScreenHeader.tsx
✅ /components/spend/SpendSummaryStrip.tsx
✅ /components/spend/SpendCategoryList.tsx
✅ /components/spend/SpendCategoryRow.tsx
✅ /components/spend/SpendInsightStrip.tsx
✅ /components/spend/SpendHeroCard.tsx
✅ /components/spend/SpendTransactionRow.tsx
✅ /components/spend/TransactionEditSheet.tsx
✅ /components/spend/SpendBudgetSheet.tsx
✅ /components/spend/TagFilterPills.tsx
✅ /components/spend/BulkTagSheet.tsx
✅ /components/spend/CategoryIcon.tsx
✅ /app/spend/[category].tsx
✅ /app/(tabs)/spend.tsx wired with mock data

Key commit: c68d998 [SPEND-03] Spend components — final versions post-ThemeContext migration

---

## CONFIRMED FILE TREE (as of Session 03 end)

```
app/
  (tabs)/
    _layout.tsx
    index.tsx          Home screen
    spend.tsx          Spend screen
    portfolio.tsx      Empty shell (Session 06)
    insights.tsx       Empty shell (Session 07)
  _layout.tsx
  spend/
    [category].tsx     Spend category detail

components/
  home/
    FIREProgress.tsx
    HomeHeader.tsx
    MarketsStrip.tsx
    MonthlyReviewLink.tsx
    PortfolioPulse.tsx
    PositionHeroCard.tsx
    SegregationToggle.tsx
    SpendSnapshot.tsx
    SpendStoryCard.tsx
  shared/
    AppHeader.tsx
    DataSourceSheet.tsx
    EmptyState.tsx
    KasheAsterisk.tsx
    MacronRule.tsx
    RedactedNumber.tsx
  spend/
    BulkTagSheet.tsx
    CategoryIcon.tsx
    SpendBudgetSheet.tsx
    SpendCategoryList.tsx
    SpendCategoryRow.tsx
    SpendHeroCard.tsx
    SpendInsightStrip.tsx
    SpendScreenHeader.tsx
    SpendSummaryStrip.tsx
    SpendTransactionRow.tsx
    TagFilterPills.tsx
    TransactionEditSheet.tsx
  ui/
    Button.tsx
    Card.tsx
    Typography.tsx

constants/
  colours.ts
  mockData.ts
  spacing.ts
  typography.ts

context/
  ThemeContext.tsx

hooks/
  useColors.ts
  useDataSources.ts

types/
  spend.ts

docs/
  skills/
    engineering-rules.md
    design-system.md
    data-architecture.md
    ai-insights.md
    freemium-boundaries.md
  CLAUDE-state.md       ← this file
```

---

## LOCKED ARCHITECTURE PRINCIPLE (March 2026)

**ThemeContext Pattern — Non-Negotiable**

Every new component, screen, or service must follow this:
- `useColorScheme()` called ONLY in `context/ThemeContext.tsx`
- Raw hex values ONLY in `constants/colours.ts`
- Every component calls `useTheme()` — no exceptions
- No inline colour decisions
- No `Colors.dark.X` access
- No hardcoded hex in components

This rule applies to ALL future sessions: Portfolio, Insights,
FIRE, Onboarding, Settings.

---

## LOCKED DECISIONS (do not re-debate)

### SpendStoryCard (replaces SpendSnapshot)
Three lines, each tappable:
- Line 1: "€X spent · X% vs avg" → Spend tab
- Line 2: "€X invested · [on track / behind target]" → Portfolio tab
- Line 3: "⚡ [Top anomaly]" — only shown when category >150% avg.
  Hidden entirely if nothing anomalous.

### Monthly Review Link
Always shows previous month's review.
Never waits for end of current month.
`isVisible=true` whenever any previous month review exists.

### Empty State Pattern (March 2026 — LOCKED)
Ghost screen at 0.5 opacity (NOT blur/frosted).
All financial numbers → RedactedNumber (XXXXXX chars).
Screen is fully scrollable — user can see structure.
Floating acid green pill centred at bottom: "+ Connect your data"
Pill tap → invitation sheet (350ms ease-out):
  - Dark scrim
  - Drag handle
  - KasheAsterisk (animated)
  - Headline + description
  - [+ Upload now] accent CTA
  - "Add manually instead" text link

EXCEPTIONS:
  InsightsEmptyInsightState: clean quiet card, no ghost
  FIRE planner not set up: clean prompt card, one input shown

### Onboarding (10 screens)
Screen 2: "What's your name?" (not Household setup)
Household created silently with one OWNER profile.
Partner added via Settings later.
Screen 4: Age (skippable).
Screen 8: Budget Suggestion (conditional — only if upload succeeded).

---

## KNOWN OPEN ISSUES (log here, fix when scheduled)

1. **Dutch brand names in mock data** — Fix before Session 06 starts.
   Replace: Albert Heijn/Jumbo → "Supermarket",
   Thuisbezorgd → "Food Delivery App",
   Bol.com → "Online Store", NS/GVB → "Public Transport"
   File: /constants/mockData.ts

2. **Category detail screen layout bug** — Large empty space between
   month selector and tag pills. Fix in Session 09 (Polish).

3. **KasheAsterisk k-stroke** — Needs more visual prominence.
   The acid green stroke is there but too subtle.
   Fix in Session 08 (Onboarding/Polish).

---

## NEXT SESSION — Session 06: Portfolio Screen

### Before writing any code:
1. Read this file
2. Read /docs/skills/engineering-rules.md
3. Read /docs/skills/design-system.md
4. For PORT-07 (InvestmentPlanCard): also read /docs/skills/data-architecture.md

### Tickets in order:
```
PORT-01  PortfolioTotalsCard
         Live / Locked columns, MacronRule divider
         Monthly delta (Live only), "Last refreshed X min ago"

PORT-02  PortfolioSectionHeader
         GROWTH / STABILITY / LOCKED headers with section totals
         MacronRule beneath each header
         Empty bucket state: "No X holdings yet · [+ Add one]"

PORT-03  PortfolioHoldingRow — Live variant
         Geography flag / name / value / bucket · geography / daily movement
         Freshness dot (green/amber/red)
         Tap → HoldingDetailScreen

PORT-04  PortfolioHoldingRow — Locked variant
         Lock icon / name / value / unlock date or "Outcome unknown"
         No daily movement
         Tap → HoldingDetailScreen

PORT-05  PortfolioHoldingRow — Protection variant
         Shield icon / name / value / "X months covered"
         Accent if ≥3 months, warning if <3 months
         Tap → HoldingDetailScreen

PORT-06  PortfolioInsightStrip
         Same visual pattern as SpendInsightStrip
         Conditional — never a permanent fixture
         Salary slip prompt (one-time, before any AI insight)
         Dismiss: swipe left or ×, 24 hours

PORT-07  InvestmentPlanCard (collapsed + expanded)
         Collapsed: progress bar if target set, "Set a target" if not
         Expanded: monthly target field, salary contributions,
         remaining to allocate, allocation suggestion rows, gap analysis
         SalaryContributionRow + AllocationSuggestionRow sub-components

PORT-08  InstrumentSuggestionSheet
         Static curated list (not dynamic, not AI-generated)
         India + Europe grouped by geography
         Educational framing, "worth exploring" language
         Permanent disclaimer, no affiliate links

PORT-09  BucketReassignSheet
         3-option radio: Growth / Stability / Locked
         System reasoning shown above options (dim, small)
         Confirming triggers insight cache invalidation

PORT-10  /app/portfolio/[holdingId].tsx
         Live variant: hero value, daily change, details, actions
         Locked variant: adds LockedProjectionCard + unlock info
         Protection variant: adds ProtectionStatusCard
         [Edit holding] / [Reassign bucket] / [Remove holding]

PORT-11  Portfolio empty state
         Uses EmptyState component (already built)
         Mock: VWRL, Infosys, Parag Parikh MF (Growth)
               NRE/NRO savings, current account (Stability)
               PPF, Crowdcube investment (Locked)
         Headline: "See your full financial picture"
         CTA: [+ Add your first holding]
         Secondary: "Upload a portfolio CSV instead"
```

### File outputs for Session 06:
```
/types/asset.ts           NEW — Asset, AssetType, PortfolioBucket
/types/liability.ts       NEW — Liability, LiabilityType
/components/portfolio/
  PortfolioTotalsCard.tsx
  PortfolioSectionHeader.tsx
  PortfolioHoldingRow.tsx  (handles all 3 variants via prop)
  PortfolioInsightStrip.tsx
  InvestmentPlanCard.tsx
  InvestmentPlanExpanded.tsx
  SalaryContributionRow.tsx
  AllocationSuggestionRow.tsx
  InstrumentSuggestionSheet.tsx
  BucketReassignSheet.tsx
  LockedProjectionCard.tsx
  ProtectionStatusCard.tsx
/app/(tabs)/portfolio.tsx  (full screen, mock data)
/app/portfolio/[holdingId].tsx
/constants/mockData.ts     (update: add portfolio mock data)
```

---

## FULL REMAINING SESSION ORDER

```
Session 06  Portfolio Screen (current — PORT-01 to PORT-11)
Session 07  Insights Screen + FIRE Planner (INS-01 to INS-10)
Session 08  Data Layer — services, stores, hooks (no UI)
Session 09  Wire UI to Data Layer + fix KasheAsterisk k-stroke
Session 10  Onboarding Stack (10 screens + UniversalAddSheet)
Session 11  Settings + Polish
            - /app/settings/index.tsx
            - Fix layout bugs (category detail empty space)
            - Notification dot logic on [+] button
            - Profile switcher sheet
            - Post-upload confirmation toast
Session 12  QA + Native Build Prep
            - Add react-native-reanimated back for native
            - Test on real iPhone (EAS build or Xcode)
            - Fix web vs native rendering differences
            - Full spec compliance review
```

---

## CRITICAL RULES — QUICK REFERENCE

1. `--legacy-peer-deps` on every npm install. No exceptions.
2. Never use react-native-reanimated until Session 12.
   Use React Native's Animated API for all animations.
3. Never hardcode a colour. Tokens from colours.ts + useTheme() only.
4. Every component handles dark AND light mode.
5. Every screen has an empty state.
6. Never show a financial number as zero. Redact instead.
7. "Your Position" not "Net Worth." Everywhere.
8. No new dependencies without PM approval.
9. TypeScript strict. Zero `any` types.
10. investment_transfer is NOT spend. Excluded from totals/savings rate.
11. Physical assets (car, art, jewellery) — NEVER build.
12. [V2] and [NEVER] tags — skip entirely.
13. Commit after every ticket. Preview before committing.
14. Space Grotesk for numbers/display. Inter for all body/UI text.
    Never Syne or DM Sans.
15. Hero card ALWAYS dark — both light and dark mode.
16. Directional KasheAsterisk replaces ↑↓ arrows everywhere.
17. Empty state = redacted ghost + floating pill. Not blurred overlay.
18. ThemeContext pattern — useTheme() in every component, no exceptions.

---

## SKILL FILES IN /docs/skills/

```
engineering-rules.md    Read before EVERY session
design-system.md        Read before any UI work
data-architecture.md    Read before PORT-07 and all data layer work
ai-insights.md          Read before Session 07 (Insights)
freemium-boundaries.md  Reference for feature flag decisions
```
