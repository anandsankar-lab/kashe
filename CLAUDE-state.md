# Kāshe — CLAUDE-state.md
*Current build state. Read this before any new session.*
*Last updated: 16 March 2026 — Tab 4 renamed to Invest, Risk Profile
added V1, product vision broadened, AI insights baked into screens,
HoldingDetailScreen to be enriched with chart + insight card.*

---

## HOW TO USE THIS DOCUMENT

Before starting any session:
1. Read this file first
2. Read CLAUDE.md
3. Read the latest kashe-handoff-session-XX.md
4. Read engineering-rules.md
5. Read design-system.md for any UI work
6. Then and only then: write the Claude Code prompt

## HOW WE WORK — THE EXACT LOOP

1. Write the Claude Code prompt in the planning chat (Claude.ai)
2. Paste into Claude Code in terminal → runs → preview at localhost:8081
3. Screenshot shared back in planning chat → verified together
4. Planning chat provides exact git commands → Anand commits

MD files are downloaded and replaced in full in the repo.
Never edited inline. Every commit includes code + updated MD files.
Git commands always run manually by Anand. Never through Claude Code.

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
✅ Fonts locked: Space Grotesk + Inter (Syne/DM Sans permanently retired)
✅ ThemeContext pattern introduced and locked
✅ /components/home/SegregationToggle.tsx
✅ /components/home/MonthlyReviewLink.tsx
✅ /components/home/SpendStoryCard.tsx
✅ /components/shared/AppHeader.tsx
✅ /context/ThemeContext.tsx
✅ /hooks/useColors.ts
✅ react-native-svg, expo-linear-gradient installed

### Session 03 — Spend Screen (Complete)
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

### Session 04 — Portfolio Screen (PORT-01 through PORT-03)
✅ /types/portfolio.ts — two-layer type system + DEFAULT_BUCKET map
✅ /constants/mockData.ts — extended with portfolio mock data
✅ /components/portfolio/PortfolioTotalsCard.tsx — PORT-01
✅ /components/portfolio/PortfolioSectionHeader.tsx — PORT-02
✅ /components/portfolio/PortfolioHoldingRow.tsx — PORT-03/04/05
✅ /app/(tabs)/portfolio.tsx — partially wired

### Session 05 — Portfolio Screen (PORT-06 through PORT-09)
✅ /components/portfolio/PortfolioInsightStrip.tsx — PORT-06
✅ /components/portfolio/InvestmentPlanCard.tsx — PORT-07
✅ /constants/formatters.ts — formatCurrency()
✅ /components/portfolio/InstrumentSuggestionSheet.tsx — PORT-08
✅ /components/portfolio/BucketReassignSheet.tsx — PORT-09
✅ /app/(tabs)/portfolio.tsx — reassignSheet state wired

### Session 06 — Portfolio Screen (PORT-10 in progress)
✅ /components/portfolio/LockedProjectionCard.tsx — PORT-10 sub
✅ /components/portfolio/ProtectionStatusCard.tsx — PORT-10 sub
✅ /app/portfolio/[holdingId].tsx — PORT-10 basic version
   Routing working. Raw labels issue to fix in PORT-10b.
🔄 PORT-11: Portfolio empty state — not yet done

---

## CONFIRMED FILE TREE (as of Session 06)

```
app/
  (tabs)/
    _layout.tsx
    index.tsx           ✅ Home (complete)
    spend.tsx           ✅ Spend (complete)
    portfolio.tsx       🔄 PORT-01 through PORT-09 wired
    invest.tsx          ⬜ Rename from insights.tsx + build Session 07
  _layout.tsx
  spend/
    [category].tsx      ✅
  portfolio/
    [holdingId].tsx     🔄 PORT-10 basic — needs PORT-10b enrichment
  invest/
    fire.tsx            ⬜ Session 08

components/
  home/                 ✅ All complete
  shared/               ✅ All complete
    ⚠️ KasheAsterisk k-stroke — fix Polish session
  spend/                ✅ All complete
  portfolio/
    PortfolioTotalsCard.tsx        ✅ PORT-01
    PortfolioSectionHeader.tsx     ✅ PORT-02
    PortfolioHoldingRow.tsx        ✅ PORT-03/04/05
    PortfolioInsightStrip.tsx      ✅ PORT-06
    InvestmentPlanCard.tsx         ✅ PORT-07
    InstrumentSuggestionSheet.tsx  ✅ PORT-08
    BucketReassignSheet.tsx        ✅ PORT-09
    LockedProjectionCard.tsx       ✅ PORT-10
    ProtectionStatusCard.tsx       ✅ PORT-10
    HoldingPriceChart.tsx          ⬜ PORT-10b
    HoldingInsightCard.tsx         ⬜ PORT-10b
  invest/               ⬜ All new — Session 07
    RiskProfileCard.tsx
    RiskProfileSheet.tsx
    InvestmentPlanFull.tsx
    MonthlyReviewCard.tsx
    MonthlyReviewSheet.tsx
    FIRETeaserCard.tsx
  fire/                 ⬜ Session 08
  ui/                   ✅ All complete

constants/
  colours.ts     ✅
  formatters.ts  ✅
  mockData.ts    ✅
  spacing.ts     ✅
  typography.ts  ✅
  displayLabels.ts ⬜ PORT-10b (assetType + geography display maps)
  fireDefaults.ts  ⬜ Session 08

types/
  spend.ts          ✅
  portfolio.ts      ✅
  riskProfile.ts    ⬜ Session 07

docs/               ✅ All updated 16 March 2026
```

---

## LOCKED ARCHITECTURE PRINCIPLES

### ThemeContext Pattern
- useColorScheme() ONLY in context/ThemeContext.tsx
- const theme = useTheme() — never destructured
- theme.* for surface/border/background only
- colours.* for all static tokens
- No raw hex in any component. Ever.

### Import Paths
- Relative imports only. No @/ alias. Ever.

### Export + Styling
- Default exports everywhere
- StyleSheet.create() always — no inline style objects

### Currency Formatting
- formatCurrency(amount, currency) from /constants/formatters.ts
- Intl.NumberFormat — permanently banned
- Template literals with raw numbers — never

### Animation
- React Native Animated API only
- react-native-reanimated — banned from web builds

---

## LOCKED DECISIONS (do not re-debate)

### Tab Structure (16 March 2026 — LOCKED)
Four tabs: Home / Spend / Portfolio / Invest
No standalone Insights tab.
AI insights live on their native screens (Spend + Portfolio).
Invest tab = Risk Profile + Investment Plan + Monthly Review + optional FIRE.
Route: /app/(tabs)/invest.tsx (rename from insights.tsx)

### Risk Profile (16 March 2026 — LOCKED)
Three levels: Conservative / Balanced / Growth
Plain language descriptions — not numbers, not a quiz.
Default: Balanced.
Drives allocation targets, instrument suggestions, health alerts.
Conservative: 40/40/20   Balanced: 60/20/20   Growth: 80/10/10
Captured in onboarding screen 5. Stored in householdStore per profile.

### Product Vision (16 March 2026 — LOCKED)
For ALL globally mobile professionals — not India-specific.
Any expat with multi-geography finances is the target user.
Mock data must feel relevant to any nationality.

### Display Labels (16 March 2026 — LOCKED)
Never show raw subtype keys (in_mutual_fund, india) in any UI.
All display labels come from /constants/displayLabels.ts maps.
Fix required in PORT-10b.

### FIRE is Optional
FIRE planner lives at /app/invest/fire.tsx.
Entry from Invest tab via a single low-pressure row.
Not shown prominently until user opts in.

### BucketReassign Entry Point
Only from HoldingDetailScreen [Reassign bucket] button.

### Empty State Pattern
Ghost at 0.5 opacity. RedactedNumber. Floating pill. NOT blur.

---

## KNOWN OPEN ISSUES

1. **Raw subtype labels** — assetType/geography showing keys not labels.
   Fix in PORT-10b: create /constants/displayLabels.ts

2. **BucketReassignSheet reasoning text** — "it's a in_mutual_fund".
   Fix in PORT-10b using same display label map.

3. **Dutch brand names in mock data** — fix before data layer session.

4. **PORT-11 portfolio empty state** — not committed yet.

5. **insights.tsx rename** — rename to invest.tsx before Session 07.

6. **Category detail screen layout gap** — Polish session.

7. **KasheAsterisk k-stroke prominence** — Polish session.

8. **Vertical MacronRule in PortfolioTotalsCard** — Polish session.

9. **TextInput monthly target formatting** — Polish session.

10. **PPF Account currency** — shows ₹420,000. Data layer session.

---

## NEXT — PORT-10b: HoldingDetailScreen Enrichment

Full spec in kashe-handoff-session-07.md.

Summary:
1. /constants/displayLabels.ts — human-readable label maps
2. Fix [holdingId].tsx + BucketReassignSheet to use display labels
3. HoldingPriceChart — line chart, 1M/6M/1Y, mock data, SVG-based
4. HoldingInsightCard — holding-specific insight, mock content
5. Visual redesign — detail screen should feel alive, not data-sheet

---

## REMAINING BUILD ORDER

```
PORT-10b   HoldingDetailScreen enrichment (display labels,
             chart, insight card, visual redesign)
PORT-11    Portfolio empty state

Session 07  Invest Tab
             Rename insights.tsx → invest.tsx
             RiskProfileCard + RiskProfileSheet
             InvestmentPlanFull
             MonthlyReviewCard + MonthlyReviewSheet
             FIRETeaserCard

Session 08  FIRE Planner screen
             /app/invest/fire.tsx

Session 09  Data Layer (no UI)

Session 10  Wire UI to Data Layer
             Real CSV data flows in — first real test

Session 11  Onboarding (10 screens including Risk Profile)

Session 12  Sources Screen

Session 13  Settings + Polish

Session 14  QA + Native Build Prep

--- YOUR OWN TESTING ---
--- 10 FRIENDS BETA ---
--- INVESTOR READY ---
```

---

## CRITICAL RULES — QUICK REFERENCE

1.  --legacy-peer-deps every npm install
2.  Never react-native-reanimated (web builds)
3.  const theme = useTheme() — never destructured
4.  theme.* surface/border/background. colours.* everything else.
5.  StyleSheet.create() always. No inline styles.
6.  formatCurrency() always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero any.
9.  Space Grotesk numbers. Inter body. Never Syne/DM Sans.
10. Hero card always dark — both modes.
11. KasheAsterisk replaces arrows everywhere.
12. Empty state = 0.5 opacity ghost + floating pill. NOT blur.
13. Every commit = code + updated MD files together.
14. Read existing component BEFORE building its equivalent.
15. Git always run manually. Never through Claude Code.
16. MD files always downloaded and replaced. Never edited inline.
17. Never show raw subtype keys in UI — use displayLabels.ts maps.
18. No standalone Insights tab. Insights live on native screens.
19. Tab 4 is Invest. Route: invest.tsx.
20. Risk profile drives allocation targets. Not hardcoded.
