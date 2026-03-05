# Kāshe — Session Handoff Document
*Session 02 → Session 03*
*Date: 5 March 2026*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer and product-aware AI assistant
helping Anand build Kāshe — a personal finance app for globally mobile
Indian professionals. Anand is a coding beginner with strong product
instincts. He needs patient, step-by-step guidance with explanations
of *why*, not just instructions.

**Read this document fully before doing anything.**
**Then read the four spec files in /mnt/project/ before writing any code.**

The four spec files are the single source of truth:
- CLAUDE.md — tech stack, design tokens, non-negotiables
- CLAUDE-identity.md — auth, profiles, security pipeline
- CLAUDE-experience.md — all UI specs, every screen, every component
- CLAUDE-financial.md — calculations, CSV parser, FIRE engine, AI insights

---

## HOW WE WORK — THE PROCESS

Follow this exactly. This is how every session runs.

1. **One ticket at a time.** Never build ahead of the current ticket.
2. **Claude Code for execution.** Anand types `claude` in terminal,
   pastes the prompt, Claude Code builds the files.
3. **This chat for planning and prompts.** We write prompts here,
   review screenshots, catch issues, decide next steps.
4. **Preview before confirming.** Every ticket must be visible in
   the browser preview before it is considered done.
5. **Commit after every ticket.** Every completed ticket gets a
   git commit before moving to the next one.
6. **Push at end of session.** All commits pushed to main.
7. **npm installs always use --legacy-peer-deps.** SDK 55 ships
   with React 19.2. Every npm install needs this flag or it fails.
   Example: `npm install some-package --legacy-peer-deps`
8. **Never install react-native-reanimated for web preview.**
   It breaks the web bundler. Use React Native's built-in
   Animated API for all animations. Reanimated returns for
   native builds in Session 09.

---

## PROJECT DETAILS

**Repo:** github.com/anandsankar-lab/kashe
**Local path:** ~/Documents/kashe
**Framework:** React Native / Expo SDK 55, TypeScript, Expo Router
**Preview:** Web browser at localhost:8081 (run `npx expo start` → `w`)
**Node:** v25.6.1, npm 11.9.0

---

## WHAT HAS BEEN BUILT — SESSIONS 01 + 02

All commits pushed to main on GitHub.

### ✅ SETUP-01: Environment
Claude Code installed, Node/npm/git verified.

### ✅ SETUP-02: Expo Router + Navigation Shell
- Expo SDK 55 project initialised
- Expo Router configured
- 4-tab navigation: Home / Spend / Portfolio / Insights
- Dark/light mode working via useColorScheme
- Fonts loaded: Space Grotesk (700, 600, 400) + Inter (500, 400)
  NOTE: Original fonts were Syne + DM Sans. These were REPLACED
  in Session 02 with Space Grotesk + Inter. All components updated.

### ✅ SETUP-03: Web Preview Working
All web dependencies resolved. Browser preview confirmed working.
Key fix: removed react-native-reanimated (breaks web bundler).

### ✅ DESIGN-01: Core UI Components
Files:
- /constants/colours.ts — all colour tokens, both modes
  Includes hero card tokens (heroGradientStart/End, heroTextPrimary etc)
  Border colours softened: light #EEEEEA, dark #252523
- /constants/typography.ts — 8 type styles
  Space Grotesk: display, heading, headingLarge, mono
  Inter: body, bodyMedium, label, caption
  Tight kerning throughout (Apple-esque)
- /constants/spacing.ts — 4px grid + borderRadius tokens
  Includes borderRadius.hero: 24 (hero card only)
- /constants/mockData.ts — fixed mock data for all empty states
- /components/ui/Typography.tsx — variant-based text component
- /components/ui/Card.tsx — flat surface card, dark/light
- /components/ui/Button.tsx — primary/secondary/text variants
- /components/shared/KasheAsterisk.tsx — SVG asterisk
  DIRECTIONAL SYSTEM: direction="up/down/neutral"
  up: top stroke + k-stroke in accent (#C8F04A)
  down: bottom stroke in danger (#FF5C5C), k-stroke dimmed
  neutral: k-stroke accent, rest textDim
  animated prop: opacity pulse (idle) or rotation (loading)
  ⚠️ k-stroke still needs more visual prominence.
     Fix this during Onboarding session.
- /components/shared/MacronRule.tsx — 1px acid green divider
- /components/shared/RedactedNumber.tsx — XXXXXX number replacement
  Props: length (default 6), style, onPress
  SpaceGrotesk_700Bold, color textDim, letterSpacing 2
- /components/shared/EmptyState.tsx — empty state wrapper
  See "Empty State Pattern" below for full details.
- react-native-svg installed
- expo-linear-gradient installed

### ✅ HOME-01: PositionHeroCard
File: /components/home/PositionHeroCard.tsx
- ALWAYS dark gradient background (both light + dark mode)
  LinearGradient: #1E1E1B → #131311
  borderRadius: 24 (more premium than standard 16)
  No border — gradient IS the card boundary
- Background asterisk watermark:
  Size 200, opacity 0.07, all strokes #C8F04A, strokeWidth 14
  Positioned top: -45, right: -45 (bleeds off edge)
  overflow: hidden clips it cleanly
- "YOUR POSITION" label + savings rate pill top-right
- Large position number: dynamic fontSize (52px ≤5 digits, down to 28px)
  Never truncates. Uses getPositionFontSize helper.
- Directional KasheAsterisk for month delta + YTD delta
- MacronRule divider (rgba(200,240,74,0.2) on dark bg)
- Expandable breakdown: liquid / illiquid / liabilities
  Animated expand/collapse, React Native Animated API
- Props: position, savingsRate, deltaMonth, deltaYTD,
         liquidAssets, illiquidAssets, liabilities, isRedacted
- When isRedacted=true: position number → RedactedNumber(6)
  deltas → RedactedNumber(4), savings rate → RedactedNumber(2)

### ✅ HOME-02: SpendSnapshot + MarketsStrip
Files:
- /components/home/SpendSnapshot.tsx
  Animated progress bar (600ms ease-out on mount)
  Green <80% / Amber 80-99% / Red 100%+
  isRedacted: spend amount → RedactedNumber(5),
              budget → RedactedNumber(4), bar fill → 0
- /components/home/MarketsStrip.tsx
  Horizontal scroll, no scroll indicator
  KasheAsterisk directional indicators (not text arrows)
  Items: S&P 500, NIFTY 50, EUR/INR, Gold
  isRedacted: change percentages → RedactedNumber(2)
  Labels (S&P 500, NIFTY 50 etc) stay visible — structure not data

### ✅ HOME-03: FIREProgress + PortfolioPulse
Files:
- /components/home/FIREProgress.tsx
  Single progress bar, acid green fill
  Animated fill on mount
  isRedacted: percentage → RedactedNumber(2),
              year → RedactedNumber(4), bar fill → 0
  Returns null when isSetUp=false
- /components/home/PortfolioPulse.tsx
  Max 5 items, ticker + KasheAsterisk + change + headline
  isRedacted: change percentages → RedactedNumber(2)
  Ticker names + headlines stay visible
  Returns null when items empty

### ✅ HOME-04: HomeHeader
File: /components/home/HomeHeader.tsx
- Avatar circle (acid green bg, first initial, SpaceGrotesk_600)
- Time-aware greeting (Good morning/afternoon/evening/night)
- Date display ("Thursday, 5 March")
- [+] button: acid green background, SpaceGrotesk_600SemiBold
- Notification dot support (amber/red)

### ✅ HOME-05: SegregationToggle
File: /components/home/SegregationToggle.tsx
- Three pill selector: RISK / VEHICLE / GEOGRAPHY
- RISK view:
  MEDIUM / HIGH / CASH_LOW bars
  Ghost bars showing 60/20/20 targets behind actual
  Variance text: "⚠ Overweight X by XX%" in warning colour
- VEHICLE view: MFs, Direct Equity, ETFs, Employer, Crypto, Cash
- GEOGRAPHY view: India 🇮🇳, Europe 🇪🇺, US 🇺🇸, Other 🌍
- 300ms animated bar transitions
- isRedacted: all percentages → RedactedNumber(2)
  Bar widths → fixed 40% (structure visible, data hidden)
  Variance numbers redacted, label text kept

### ✅ HOME-06: Empty State
Files:
- /components/shared/EmptyState.tsx (see pattern below)
- /constants/mockData.ts (fixed mock constants)

EMPTY STATE PATTERN — LOCKED (March 2026):
  Ghost screen is FULLY SCROLLABLE with redacted numbers.
  Numbers replaced with XXXXXX (RedactedNumber component).
  Screen opacity: 0.5 (intentionally muted, not blurred).
  
  FLOATING PILL (always visible, position absolute):
    "+ Connect your data"
    Acid green (#C8F04A), borderRadius 999
    KasheAsterisk size 14 + SpaceGrotesk_600SemiBold
    bottom: 24, centered, zIndex 10
  
  INVITATION SHEET (on pill tap):
    Slides up from bottom, 350ms ease-out
    Dark scrim behind sheet
    Drag handle top centre
    KasheAsterisk animated
    Headline + description + CTA button + secondary link
    Dismisses on scrim tap or CTA/secondary action
  
  isRedacted prop pattern:
    Every Home component accepts isRedacted?: boolean
    When true: numbers → RedactedNumber, bars → 0
    MonthlyReviewLink: return null when isRedacted

### ✅ HOME-07: MonthlyReviewLink
File: /components/home/MonthlyReviewLink.tsx
- Conditional banner below FIREProgress
- Green left border (3px, #C8F04A) — distinctive signal
- "Your {month} review is ready →"
- Returns null when isVisible=false OR isRedacted=true

MONTHLY REVIEW LOGIC — LOCKED DECISION:
  Always shows previous month's review.
  Never waits for end of current month.
  isVisible=true whenever a previous month review exists.
  Logic lives in parent (index.tsx), not the component.
  Will be wired to real data in Session 06.

---

## CURRENT STATE OF /app/(tabs)/index.tsx

Home screen renders all components with mock data:
- HomeHeader (name="Anand")
- PositionHeroCard (€450,200 position, 45% savings rate)
- SpendSnapshot (€2,847 of €4,500 budget)
- MarketsStrip (S&P 500, NIFTY 50, EUR/INR, Gold)
- SegregationToggle (Risk view default)
- PortfolioPulse (VWRL, INFY, PPFCF mock items)
- FIREProgress (63%, projected 2036)
- MonthlyReviewLink (month="March", isVisible=true)

hasData=false → EmptyState wraps everything, shows
redacted ghost + floating pill + invitation sheet.
hasData=true → full populated Home screen.

hasData is currently hardcoded as useState(false).
Will be wired to real auth/data state in Session 06.

---

## KNOWN OPEN REFINEMENTS (log, fix later)

1. KasheAsterisk k-stroke needs more visual prominence.
   Fix during Onboarding session (Session 07).
2. Gold in MarketsStrip — in spec, relevant for Indian
   diaspora. PM decision to keep or remove. One line change.
3. MonthlyReviewLink not yet verified with hasData=true.
   Will be confirmed in Session 06 when data is wired.

---

## WHAT TO BUILD NEXT — SESSION 03: SPEND SCREEN

9 tickets. Build in this exact order.
Spec for all: CLAUDE-experience.md → "Spend Screen"

### SPEND-01: SpendScreenHeader + Month Selector
Component: /components/spend/SpendScreenHeader.tsx
- "Spend" heading (Syne 700) + [+] button + [⋯] overflow
- Month selector: left/right chevrons, current month centred
- Default: current month. Navigate back up to 12 months.
- [⋯] → "Set budgets" action (wires to SpendBudgetSheet)

### SPEND-02: SpendSummaryStrip
Component: /components/spend/SpendSummaryStrip.tsx
- Large net spend number (SpaceGrotesk_700, display size)
- investment_transfer and transfer EXCLUDED from total
- Context line: "↑ 12% vs last month · ↑ 8% vs 3-month avg"
  Hidden if <2 months of data
- Budget summary: "€2,847 of €4,500 budget" (if budget set)

### SPEND-03: SpendCategoryList + SpendCategoryRow
Components:
  /components/spend/SpendCategoryList.tsx
  /components/spend/SpendCategoryRow.tsx
- Sorted by spend amount descending
- Each row: category icon + name + amount + proportion bar
- Proportion bar colours:
  No budget set: accent green, width = % of total spend
  Under budget: accent green
  80-99% of budget: warning (#FFB547)
  100%+: danger (#FF5C5C)
- Chevron right, tap → SpendCategoryDetailScreen

### SPEND-04: Transfers Section
Below a MacronRule divider at bottom of category list
Section label: "Transfers & Investments" (label style)
investment_transfer + transfer rows shown here
Dim note: "excluded from totals"
Same row visual but muted (textDim amounts)

### SPEND-05: SpendInsightStrip
Component: /components/spend/SpendInsightStrip.tsx
- CONDITIONAL — only renders when SPEND_ANOMALY triggered
- Trigger: any category >150% of 3-month average
- Hidden entirely if nothing anomalous — NO placeholder
- Requires minimum 2 months history to ever render
- One compact card: KasheAsterisk (small, static) +
  headline (10 words max) + body (40 words max)
- Dismiss: swipe left or tap × → hidden 24 hours
- Tap → InsightDetailSheet

### SPEND-06: Spend Empty State
Uses EmptyState component (already built).
Headline: "See where your money goes"
CTA: "+ Upload bank statement"
Secondary: "Add manually instead"
Redacted ghost: SpendSummaryStrip with XXXXX,
               SpendCategoryList with redacted amounts

### SPEND-07: SpendBudgetSheet
Component: /components/spend/SpendBudgetSheet.tsx
Bottom sheet triggered by [⋯] → "Set budgets"
One row per spend category: icon + name + editable amount
Total row at bottom: "Total budgeted: €X"
[Save budgets] + [Cancel]
investment_transfer and transfer never appear here

### SPEND-08: Spend Category Detail Screen
Route: /app/spend/[category].tsx
Back chevron + category name as header
Same month selector (stays in sync with parent)
Subcategory breakdown rows
Tap subcategory → expands to show transactions inline
SpendTransactionRow: date + merchant + amount + category chip

### SPEND-09: TransactionEditSheet
Component: /components/spend/TransactionEditSheet.tsx
Bottom sheet on transaction row tap
Merchant name heading
Current category + subcategory shown
[Change category] → scrollable category picker
On confirm: saves merchant memory, reassigns all past
            + future transactions from same merchant
Toast: "Albert Heijn will always be Groceries"

---

## FULL REMAINING BUILD ORDER

### Session 03 — Spend Screen (current)
SPEND-01 through SPEND-09 (above)

### Session 04 — Portfolio Screen
- PORT-01: PortfolioTotalsCard (Live / Locked, macron rule)
- PORT-02: PortfolioSectionHeader (Growth / Stability / Locked)
- PORT-03: PortfolioHoldingRow — Live variant
- PORT-04: PortfolioHoldingRow — Locked variant
- PORT-05: PortfolioHoldingRow — Protection variant
- PORT-06: PortfolioInsightStrip (conditional)
- PORT-07: InvestmentPlanCard (collapsed + expanded)
- PORT-08: InstrumentSuggestionSheet
- PORT-09: BucketReassignSheet
- PORT-10: /app/portfolio/[holdingId].tsx (holding detail)
  - LockedProjectionCard
  - ProtectionStatusCard
- PORT-11: Portfolio empty state
Spec: CLAUDE-experience.md → "Portfolio Screen — Full Spec"

### Session 05 — Insights Screen + FIRE Planner
- INS-01: InsightsHeader
- INS-02: InsightsActiveInsightCard (all 4 insight types)
- INS-03: InsightsEmptyInsightState ("Nothing needs attention")
- INS-04: MonthlyReviewCard (all 4 states)
- INS-05: MonthlyReviewSheet (full bottom sheet)
- INS-06: FIRETeaserCard (both states)
- INS-07: PastReviewsList
- INS-08: InsightDetailSheet (shared — Spend, Portfolio, Insights)
- INS-09: /app/insights/fire.tsx — FIRE Planner screen
  FIREHouseholdToggle, FIRESliderHero, FIREInputsCard,
  FIREAssumptionsCard, FIREProfileSelector
- INS-10: Insights empty state
Spec: CLAUDE-experience.md → "Insights Screen — Full Spec"
      CLAUDE-experience.md → "FIRE Planner Screen — Full Spec"
      CLAUDE-financial.md → "FIRE Engine — Full Spec"

### Session 06 — Data Layer (no UI)
All services and stores. No screens touched.

Identity (Team Member 1):
- /types/profile.ts
- /store/householdStore.ts
- /services/auth.ts (Google OAuth)
- /services/securityPipeline.ts
- /services/encryptedStorage.ts
- /hooks/useHousehold.ts
Spec: CLAUDE-identity.md

Financial (Team Member 3):
- /types/ (asset, liability, transaction, insight, portfolio, fire)
- /constants/featureFlags.ts
- /constants/fireDefaults.ts
- /services/dataSource.ts (abstract interface)
- /services/csvDataSource.ts + universalParser.ts
- /services/salarySlipParser.ts
- /services/priceRefresh.ts + amfiNavFeed.ts + fxRefresh.ts
- /services/portfolioCalc.ts + savingsRate.ts + spendCategoriser.ts
- /services/fireEngine.ts
- /services/aiInsights.ts (Claude API, 5-insight engine)
- /services/budgetCap.ts
- /store/portfolioStore.ts + spendStore.ts + insightsStore.ts
- /hooks/usePortfolio.ts + useSpend.ts + useInsights.ts + useFirePlanner.ts
Spec: CLAUDE-financial.md

### Session 07 — Wire UI to Data Layer
Connect all screens to real Zustand stores.
Replace mock data with live store data.
Wire CSV upload flow end to end.
Test price refresh service.

### Session 08 — Onboarding Stack
10 screens + UniversalAddSheet component:
1. Welcome (KasheAsterisk + Google OAuth)
2. Household
3. Location
4. Age (skippable — FIRE asks on first open if skipped)
5. Teach [+]
6. First Add (isOnboarding=true on UniversalAddSheet)
7. First Payoff
8. Budget Suggestion (conditional — only if upload succeeded)
9. Portfolio Teaser
10. Complete
Spec: CLAUDE-experience.md → "Onboarding Stack"
      CLAUDE-experience.md → "Universal Add Sheet"
      CLAUDE-identity.md → "Onboarding Completion Flag"

### Session 09 — Settings + Polish
- /app/settings/index.tsx
- Dark mode testing on all components
- Freshness dots on all relevant components
- Notification dot logic on [+] button
- Profile switcher sheet (tap avatar → household/profile list)
- Post-upload confirmation toast

### Session 10 — QA + Native Build Prep
- Add react-native-reanimated back for native animations
- Test on real iPhone via EAS build or Xcode
- Fix any web vs native rendering differences
- Check all empty states, all dark mode states
- Full spec compliance review against PRD

---

## COMPONENTS BUILT — QUICK REFERENCE

```
/constants/
  colours.ts          ✅ All tokens, both modes, hero card tokens
  typography.ts       ✅ Space Grotesk + Inter, 8 type styles
  spacing.ts          ✅ 4px grid + borderRadius (incl hero: 24)
  mockData.ts         ✅ Fixed mock data for all empty states

/components/ui/
  Typography.tsx      ✅ variant-based text
  Card.tsx            ✅ flat surface card, softened borders
  Button.tsx          ✅ primary/secondary/text variants

/components/shared/
  KasheAsterisk.tsx   ✅ SVG asterisk, directional system
                         ⚠️ k-stroke needs more prominence (fix Session 08)
  MacronRule.tsx      ✅ 1px acid green divider
  RedactedNumber.tsx  ✅ XXXXXX number replacement
  EmptyState.tsx      ✅ scrollable ghost + floating pill + sheet

/components/home/
  HomeHeader.tsx         ✅ avatar + greeting + [+]
  PositionHeroCard.tsx   ✅ dark gradient, watermark, expand/collapse
  SpendSnapshot.tsx      ✅ progress bar, redaction support
  MarketsStrip.tsx       ✅ horizontal scroll, directional asterisks
  PortfolioPulse.tsx     ✅ ticker + headline items
  SegregationToggle.tsx  ✅ Risk / Vehicle / Geography views
  FIREProgress.tsx       ✅ progress bar + projected year
  MonthlyReviewLink.tsx  ✅ conditional review banner, green left border

NOT YET BUILT:
  All /components/spend/
  All /components/portfolio/
  All /components/insights/
  All /components/fire/
  UniversalAddSheet.tsx
  NotificationDot.tsx (notification dot is inline in HomeHeader for now)
```

---

## CRITICAL THINGS TO NEVER FORGET

1. **--legacy-peer-deps on every npm install.** No exceptions.
2. **Never use react-native-reanimated for web preview.**
   Use React Native's Animated API. Returns in Session 10.
3. **Never hardcode a colour.** Tokens from colours.ts only.
4. **Every component needs dark AND light mode.**
5. **Every screen needs an empty state.**
6. **Never show a financial number as zero.** Redact instead.
7. **"Your Position" not "Net Worth."** Everywhere.
8. **No new dependencies without PM approval.**
9. **TypeScript strict. No `any` types.**
10. **investment_transfer is NOT spend.** Excluded from savings
    rate and spend totals everywhere.
11. **Physical assets (car, art, jewellery) — NEVER build.**
12. **[V2] and [NEVER] tags in spec — skip entirely.**
13. **Commit after every ticket. Preview before committing.**
14. **Typography: Space Grotesk for numbers/display,
    Inter for all body/UI text. Never Syne or DM Sans.**
15. **Hero card is ALWAYS dark** — both light and dark mode.
    It uses its own hero token set, not the standard tokens.
16. **Directional asterisks replace ↑↓ arrows everywhere.**
    Never use text arrows for financial deltas.
17. **Empty state = redacted ghost, not blurred overlay.**
    RedactedNumber component. Scrollable. Floating pill CTA.

---

## DEPENDENCIES INSTALLED

```
react-native-svg              ✅ (for KasheAsterisk)
expo-linear-gradient          ✅ (for PositionHeroCard)
@expo-google-fonts/space-grotesk  ✅
@expo-google-fonts/inter          ✅
```

All installed with --legacy-peer-deps.

---

*Handoff prepared: 5 March 2026*
*Session 02 completed by: Anand + Claude*
*Next session starts at: SPEND-01 — SpendScreenHeader + Month Selector*
