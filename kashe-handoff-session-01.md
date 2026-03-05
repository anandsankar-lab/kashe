# Kāshe — Session Handoff Document
*Session 01 → Session 02*
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

This is important. Follow this exactly.

1. **One ticket at a time.** Never build ahead of the current ticket.
2. **Claude Code for execution.** Anand types `claude` in his terminal,
   pastes the prompt, and Claude Code builds the files.
3. **This chat for planning and prompts.** We write the Claude Code
   prompts here, review screenshots, catch issues, decide next steps.
4. **Commit after every ticket.** Every completed ticket gets a git
   commit and push before moving to the next one.
5. **Preview in browser.** `npx expo start` → press `w` → screenshot.
6. **npm installs always use --legacy-peer-deps.** SDK 55 ships with
   React 19.2 — every npm install needs this flag or it will fail.
   Example: `npm install some-package --legacy-peer-deps`
   Or via expo: `npx expo install some-package -- --legacy-peer-deps`
7. **Never install react-native-reanimated for web preview.** It breaks
   the web bundler. Use React Native's built-in `Animated` API for all
   animations in web preview. Reanimated comes back when we do native
   builds (2–3 sessions from now).

---

## PROJECT DETAILS

**Repo:** github.com/anandsankar-lab/kashe
**Local path:** ~/Documents/kashe
**Framework:** React Native / Expo SDK 55, TypeScript, Expo Router
**Preview:** Web browser at localhost:8081 (run `npx expo start` → `w`)
**Node:** v25.6.1, npm 11.9.0

---

## WHAT HAS BEEN BUILT — SESSION 01

All commits are pushed to main on GitHub.

### ✅ SETUP-01: Environment
Claude Code installed, Node/npm/git verified.

### ✅ SETUP-02: Expo Router + Navigation Shell
- Expo SDK 55 project initialised
- Expo Router configured
- 4-tab navigation: Home / Spend / Portfolio / Insights
- Dark/light mode working via useColorScheme
- Fonts loaded: Syne (800, 700) + DM Sans (400, 500)

### ✅ SETUP-03: Web Preview Working
All web dependencies resolved. Browser preview confirmed working.
Key fix: removed react-native-reanimated (breaks web bundler).

### ✅ DESIGN-01: Core UI Components
Files created:
- /constants/typography.ts — 8 type styles
- /constants/spacing.ts — 4px grid + borderRadius tokens
- /components/ui/Typography.tsx — variant-based text component
- /components/ui/Card.tsx — flat surface card, dark/light
- /components/ui/Button.tsx — primary/secondary/text variants
- /components/shared/KasheAsterisk.tsx — SVG asterisk, animated prop
- /components/shared/MacronRule.tsx — 1px acid green divider
- react-native-svg installed

**Known refinement needed:** KasheAsterisk k-stroke needs to be more
visually prominent. The acid green stroke is there but subtle.
Fix this when building the Welcome/Onboarding screen.

### ✅ HOME-01: PositionHeroCard
File: /components/home/PositionHeroCard.tsx
- "YOUR POSITION" label + savings rate pill (acid green)
- Large position number (Syne 800, fontSize 48)
- Month delta + YTD delta
- MacronRule divider
- Expandable breakdown (liquid / illiquid / liabilities)
- Animated expand/collapse using React Native Animated API
- Liabilities in danger colour

### ✅ HOME-02: SpendSnapshot + MarketsStrip
Files:
- /components/home/SpendSnapshot.tsx
  - Animated progress bar (600ms ease-out on mount)
  - Green <80% / Amber 80-99% / Red 100%+
- /components/home/MarketsStrip.tsx
  - Horizontal scroll, no scroll indicator
  - Colour-coded changes (green/red)
  - Current items: S&P 500, NIFTY 50, EUR/INR, Gold
  - NOTE: Anand questioned Gold — it's in spec (Section 3.3) as
    relevant for Indian diaspora audience. Left in for now.
    PM can remove if desired — one line change in index.tsx.

### ✅ HOME-03: FIREProgress + PortfolioPulse
Files:
- /components/home/FIREProgress.tsx
  - Single progress bar, projected year label
  - Animated fill on mount
  - Returns null when isSetUp=false
- /components/home/PortfolioPulse.tsx
  - Max 5 items, ticker + change + headline
  - Returns null when items empty

### ✅ HOME-04: HomeHeader
File: /components/home/HomeHeader.tsx
- Avatar circle (acid green, first initial)
- Time-aware greeting ("Good morning/afternoon/evening/night, [name]")
- Date display ("Thursday, 5 March")
- [+] button with notification dot support (amber/red)

---

## CURRENT STATE OF /app/(tabs)/index.tsx

The Home screen currently renders all components with mock data:
- HomeHeader (name="Anand")
- PositionHeroCard (€450,200 position, 45% savings rate)
- SpendSnapshot (€2,847 of €4,500 budget)
- MarketsStrip (S&P 500, NIFTY 50, EUR/INR, Gold)
- PortfolioPulse (VWRL, INFY, PPFCF mock items)
- FIREProgress (63%, projected 2036)

This mock data doubles as the ghost content for the empty state
(blurred behind a frosted card for non-authenticated users).

---

## WHAT STILL NEEDS TO BE BUILT — HOME SCREEN

### HOME-05: Investment Segregation Toggle
Component: /components/home/SegregationToggle.tsx
Three pill views: Risk / Vehicle / Geography
Spec: CLAUDE-experience.md → "Investment Segregation Toggle — Detail"

### HOME-06: Empty State (Blurred Ghost)
The full-screen blur wrapper for unauthenticated users.
Uses @react-native-community/blur (iOS) / semi-transparent overlay (Android).
Frosted card: KasheAsterisk (pulsing) + "Build your picture" + [+ Upload now]
Mock data already in place from current index.tsx.
Spec: CLAUDE-experience.md → "The Empty State Pattern"
Also needs: /constants/mockData.ts with fixed constants

### HOME-07: MonthlyReviewLink (conditional)
Component: /components/home/MonthlyReviewLink.tsx
Only shown when a new monthly review is available.
"Your March review is ready →"
Spec: CLAUDE-experience.md → Home Screen component inventory

---

## FULL BUILD ORDER — REMAINING WORK

Work through this in order. Do not skip ahead.

### SESSION 02 — Complete Home + Spend Screen

**Remaining Home tickets:**
- HOME-05: SegregationToggle
- HOME-06: Empty State + mockData.ts
- HOME-07: MonthlyReviewLink

**Spend Screen tickets:**
- SPEND-01: SpendScreenHeader + month selector
- SPEND-02: SpendSummaryStrip (net spend, context line, budget summary)
- SPEND-03: SpendCategoryList + SpendCategoryRow (with proportion bars)
- SPEND-04: Transfers section (below macron rule)
- SPEND-05: SpendInsightStrip (conditional AI insight strip)
- SPEND-06: Empty state for Spend screen
- SPEND-07: SpendBudgetSheet (bottom sheet, set budgets)
- SPEND-08: /app/spend/[category].tsx — category detail screen
- SPEND-09: SpendTransactionRow + TransactionEditSheet

Spec for all Spend work: CLAUDE-experience.md → "Spend Screen"

### SESSION 03 — Portfolio Screen

**Portfolio tickets:**
- PORT-01: PortfolioTotalsCard (Live / Locked columns, macron rule)
- PORT-02: PortfolioSectionHeader (Growth / Stability / Locked)
- PORT-03: PortfolioHoldingRow — Live variant
- PORT-04: PortfolioHoldingRow — Locked variant
- PORT-05: PortfolioHoldingRow — Protection variant
- PORT-06: PortfolioInsightStrip (conditional)
- PORT-07: InvestmentPlanCard (collapsed + expanded)
- PORT-08: InstrumentSuggestionSheet
- PORT-09: BucketReassignSheet
- PORT-10: /app/portfolio/[holdingId].tsx — holding detail
  - LockedProjectionCard
  - ProtectionStatusCard
- PORT-11: Portfolio empty state

Spec: CLAUDE-experience.md → "Portfolio Screen — Full Spec"

### SESSION 04 — Insights Screen + FIRE Planner

**Insights tickets:**
- INS-01: InsightsHeader
- INS-02: InsightsActiveInsightCard (all 4 insight types)
- INS-03: InsightsEmptyInsightState ("Nothing needs your attention")
- INS-04: MonthlyReviewCard (all 4 states)
- INS-05: MonthlyReviewSheet (full bottom sheet)
- INS-06: FIRETeaserCard (both states)
- INS-07: PastReviewsList
- INS-08: InsightDetailSheet (shared — used by Spend, Portfolio, Insights)
- INS-09: /app/insights/fire.tsx — FIRE Planner screen
  - FIREHouseholdToggle
  - FIRESliderHero (5–30 year range, real-time)
  - FIREInputsCard (6 inputs, collapsible)
  - FIREAssumptionsCard (always visible)
  - FIREProfileSelector
- INS-10: Insights empty state

Spec: CLAUDE-experience.md → "Insights Screen — Full Spec"
      CLAUDE-experience.md → "FIRE Planner Screen — Full Spec"
      CLAUDE-financial.md → "FIRE Engine — Full Spec"

### SESSION 05 — Data Layer (no UI)

All services and stores. No screens touched.

**Identity (Team Member 1):**
- /types/profile.ts
- /store/householdStore.ts
- /services/auth.ts (Google OAuth)
- /services/securityPipeline.ts
- /services/encryptedStorage.ts
- /hooks/useHousehold.ts

Spec: CLAUDE-identity.md

**Financial (Team Member 3):**
- /types/ (asset, liability, transaction, insight, portfolio, fire)
- /constants/featureFlags.ts
- /constants/mockData.ts (if not already done in HOME-06)
- /constants/fireDefaults.ts
- /services/dataSource.ts (abstract interface)
- /services/csvDataSource.ts + universalParser.ts
- /services/salarySlipParser.ts
- /services/priceRefresh.ts + amfiNavFeed.ts + fxRefresh.ts
- /services/portfolioCalc.ts
- /services/savingsRate.ts
- /services/spendCategoriser.ts
- /services/fireEngine.ts
- /services/aiInsights.ts (Claude API, 5-insight engine)
- /services/budgetCap.ts
- /store/portfolioStore.ts + spendStore.ts + insightsStore.ts
- /hooks/usePortfolio.ts + useSpend.ts + useInsights.ts + useFirePlanner.ts

Spec: CLAUDE-financial.md

### SESSION 06 — Wire UI to Data Layer

Connect all screens to real Zustand stores.
Replace mock data with live store data.
Wire up CSV upload flow end to end.
Test price refresh service.

### SESSION 07 — Onboarding Stack

10 screens in order:
1. Welcome (KasheAsterisk + Google OAuth)
2. Household
3. Location
4. Age (skippable)
5. Teach [+]
6. First Add (isOnboarding=true on UniversalAddSheet)
7. First Payoff
8. Budget Suggestion (conditional)
9. Portfolio Teaser
10. Complete

Also: UniversalAddSheet component (shared, used everywhere)
Spec: CLAUDE-experience.md → "Onboarding Stack" + "Universal Add Sheet"
      CLAUDE-identity.md → "Onboarding Completion Flag"

### SESSION 08 — Settings + Polish

- /app/settings/index.tsx
- Dark mode testing on all components
- Freshness dots on all relevant components
- Notification dot logic on [+] button
- Profile switcher sheet (tap avatar → household/profile list)
- Post-upload confirmation toast

### SESSION 09 — QA + Native Build Prep

- Add react-native-reanimated back for native animations
- Test on real iPhone via EAS build or Xcode
- Fix any web vs native rendering differences
- Check all empty states
- Check all dark mode states
- Spec compliance review against PRD

---

## CRITICAL THINGS TO NEVER FORGET

1. **--legacy-peer-deps on every npm install.** No exceptions.
2. **Never use react-native-reanimated for web preview.** Use
   React Native's Animated API. Reanimated returns for native builds.
3. **Never hardcode a colour.** Always use tokens from colours.ts.
4. **Every component needs dark AND light mode.**
5. **Every screen needs an empty state.**
6. **Never show a financial number as zero.** Use empty state instead.
7. **"Your Position" not "Net Worth."** Everywhere.
8. **No new dependencies without PM approval.**
9. **TypeScript strict. No `any` types.**
10. **investment_transfer is NOT spend.** Excluded from savings rate
    and spend totals everywhere.
11. **Physical assets (car, art, jewellery) — NEVER build.**
12. **[V2] and [NEVER] tags in spec — skip entirely.**
13. **Commit after every ticket before moving on.**

---

## COMPONENTS BUILT — QUICK REFERENCE

```
/constants/
  colours.ts          ✅ Design tokens, both modes
  typography.ts       ✅ 8 type styles
  spacing.ts          ✅ 4px grid + borderRadius

/components/ui/
  Typography.tsx      ✅ variant-based text
  Card.tsx            ✅ flat surface card
  Button.tsx          ✅ primary/secondary/text

/components/shared/
  KasheAsterisk.tsx   ✅ SVG asterisk, animated prop
                         ⚠️ k-stroke needs more prominence
  MacronRule.tsx      ✅ 1px acid green divider

/components/home/
  HomeHeader.tsx      ✅ avatar + greeting + [+]
  PositionHeroCard.tsx ✅ position number + breakdown
  SpendSnapshot.tsx   ✅ progress bar + spend amount
  MarketsStrip.tsx    ✅ horizontal scroll, colour-coded
  PortfolioPulse.tsx  ✅ ticker + headline items
  FIREProgress.tsx    ✅ progress bar + projected year

NOT YET BUILT:
  SegregationToggle.tsx    (HOME-05)
  MonthlyReviewLink.tsx    (HOME-07)
  All /components/spend/
  All /components/portfolio/
  All /components/insights/
  All /components/fire/
  UniversalAddSheet.tsx
  EmptyState.tsx
  NotificationDot.tsx
```

---

## OPEN QUESTIONS / DECISIONS FOR ANAND

1. **Gold in MarketsStrip** — currently included per spec. Remove?
2. **KasheAsterisk k-stroke** — needs to be more prominent/visible.
   Will fix in onboarding session. Confirm this is priority.
3. **SegregationToggle target allocation** — spec says 60/20/20
   (Medium/High/Cash). User cannot change this in V1. Confirmed?

---

*Handoff prepared: 5 March 2026*
*Next session starts at: HOME-05 — SegregationToggle*
