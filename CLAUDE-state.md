# Kāshe — CLAUDE-state.md
*Current build state. Read this before any new session.*
*Last updated: 16 March 2026*

---

## HOW TO USE THIS DOCUMENT

Before starting any session:
1. Read this file first
2. Read CLAUDE.md (in project root)
3. Read the relevant skill file(s) in /docs/skills/
4. Then and only then: write the Claude Code prompt

## HOW WE WORK — THE EXACT LOOP

Every ticket follows these four steps. No exceptions.

1. Write the Claude Code prompt in the planning chat (Claude.ai)
2. Paste into Claude Code in terminal → runs → preview at localhost:8081
3. Screenshot shared back in planning chat → verified together
4. Planning chat provides exact git commands → Anand commits

MD files are updated in the planning chat, downloaded directly
into the repo, and committed together with code. Never separately.

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
✅ Fonts replaced: Syne + DM Sans → Space Grotesk + Inter (locked permanently)
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

Key commit: c68d998 [SPEND-03] Spend components — final versions post-ThemeContext migration

### Session 04 — Portfolio Screen (PORT-01 through PORT-03 complete)
✅ /types/portfolio.ts — two-layer type system + DEFAULT_BUCKET map
✅ /constants/mockData.ts — extended with MOCK_PORTFOLIO_HOLDINGS,
   MOCK_PORTFOLIO_TOTALS, MOCK_INVESTMENT_PLAN
✅ /components/portfolio/PortfolioTotalsCard.tsx — PORT-01
✅ /components/portfolio/PortfolioSectionHeader.tsx — PORT-02
   label, total, MacronRule divider, empty bucket state ("[+ Add one]")
✅ /components/portfolio/PortfolioHoldingRow.tsx — PORT-03/04/05
   Three variants: live / locked / protection
   SVG icons: rupee (India), trend line (Europe/Global),
   padlock (locked), shield+check (protection)
   Allocation bar animated on mount (600ms ease-out)
   Freshness dot, KasheAsterisk movement direction,
   assetType · geography sub-label
✅ /app/(tabs)/portfolio.tsx — header + TotalsCard + SectionHeaders
   + HoldingRows wired with mock data

PM decisions locked this session:
- Two-layer type system: assetClass (display/grouping only) +
  assetSubtype (drives ALL logic — buckets, lock rules, projections)
- DEFAULT_BUCKET in /types/portfolio.ts is single source of truth
  for bucket assignment. Never duplicated elsewhere.
- BucketReassign entry point = HoldingDetailScreen only. No long-press on rows.
- Relative imports only — @/ alias not used in this project.
- colours.* for static colour values; theme.* for surface/border/background only.
  (Same pattern as SpendCategoryRow — locked for all portfolio components.)
- StyleSheet.create() for all styles — no inline style objects in components.
- HoldingRow icons: SVG stroke-only, no icon container box, no emoji,
  direct render matching CategoryIcon pattern exactly.
- PortfolioHoldingRow assetType prop carries display label
  (e.g. "Mutual Fund", "ETF", "Cash") — separate from geography.
- MD files downloaded and replaced in repo. Every commit = code + docs together.

### Session 05 — Portfolio Screen (PORT-06 through PORT-09 complete)
✅ /components/portfolio/PortfolioInsightStrip.tsx — PORT-06
   Conditional insight card, swipe-left/tap-dismiss, KasheAsterisk,
   PanResponder, returns null when no insight active
✅ /components/portfolio/InvestmentPlanCard.tsx — PORT-07
   Three-state card, animated progress bar, editable monthly target,
   salary contributions, suggested allocation rows
✅ /constants/formatters.ts — manual regex currency formatter
   Intl.NumberFormat permanently banned — unreliable in Expo web bundler
   formatCurrency() is the only permitted formatter everywhere
✅ /components/portfolio/InstrumentSuggestionSheet.tsx — PORT-08
   Bottom sheet, GROWTH/STABILITY/LOCKED content variants,
   disclaimer pinned at bottom
✅ /components/portfolio/BucketReassignSheet.tsx — PORT-09
   Slide-up sheet, radio bucket selector, pre-selects current bucket,
   isProtection=true hides Locked option with dim note,
   maxHeight constraint keeps buttons always visible
✅ /app/(tabs)/portfolio.tsx — updated with reassignSheet state +
   temporary TEST trigger button (remove during PORT-10 wiring)

Key commits this session:
  5ef86a3  [PORT-06] PortfolioInsightStrip
  7a0b244  [PORT-07] InvestmentPlanCard
  f2a7991  [PORT-08] InstrumentSuggestionSheet + ai-insights.md rewrite
  [PORT-09] BucketReassignSheet + ai-insights.md instrument-class routing

---

## CONFIRMED FILE TREE (as of Session 05, PORT-09 complete)

```
app/
  (tabs)/
    _layout.tsx
    index.tsx          ✅ Home screen (complete)
    spend.tsx          ✅ Spend screen (complete)
    portfolio.tsx      🔄 In progress — PORT-01 through PORT-09 wired
                          ⚠️ TEST button present — remove in PORT-10
    insights.tsx       ⬜ Empty shell
  _layout.tsx
  spend/
    [category].tsx     ✅ Spend category detail
  portfolio/
    [holdingId].tsx    ⬜ PORT-10

components/
  home/                ✅ All complete
    FIREProgress.tsx
    HomeHeader.tsx
    MarketsStrip.tsx
    MonthlyReviewLink.tsx
    PortfolioPulse.tsx
    PositionHeroCard.tsx
    SegregationToggle.tsx
    SpendSnapshot.tsx
    SpendStoryCard.tsx
  shared/              ✅ All complete
    AppHeader.tsx
    DataSourceSheet.tsx
    EmptyState.tsx
    KasheAsterisk.tsx  ⚠️ k-stroke needs more prominence (fix Polish session)
    MacronRule.tsx
    RedactedNumber.tsx
  spend/               ✅ All complete
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
  portfolio/
    PortfolioTotalsCard.tsx        ✅ PORT-01
    PortfolioSectionHeader.tsx     ✅ PORT-02
    PortfolioHoldingRow.tsx        ✅ PORT-03/04/05
    PortfolioInsightStrip.tsx      ✅ PORT-06
    InvestmentPlanCard.tsx         ✅ PORT-07
    InstrumentSuggestionSheet.tsx  ✅ PORT-08
    BucketReassignSheet.tsx        ✅ PORT-09
    LockedProjectionCard.tsx       ⬜ PORT-10
    ProtectionStatusCard.tsx       ⬜ PORT-10
  ui/                  ✅ All complete
    Button.tsx
    Card.tsx
    Typography.tsx

constants/
  colours.ts     ✅
  formatters.ts  ✅ formatCurrency() — Intl.NumberFormat permanently banned
  mockData.ts    ✅ Includes portfolio mock data
  spacing.ts     ✅
  typography.ts  ✅

context/
  ThemeContext.tsx  ✅

hooks/
  useColors.ts      ✅
  useDataSources.ts ✅

types/
  spend.ts          ✅
  portfolio.ts      ✅ Two-layer type system, DEFAULT_BUCKET

docs/
  skills/
    engineering-rules.md
    design-system.md
    data-architecture.md
    ai-insights.md     ✅ Updated — instrument-class source routing,
                          stale app handling, currency concentration trigger,
                          portfolio data sufficiency rules
    freemium-boundaries.md
  CLAUDE-state.md       ← this file
```

---

## LOCKED ARCHITECTURE PRINCIPLES

### ThemeContext Pattern — Non-Negotiable
- `useColorScheme()` called ONLY in `context/ThemeContext.tsx`
- Raw hex values ONLY in `constants/colours.ts`
- Every component calls `const theme = useTheme()` — no exceptions
  Note: useTheme() returns the theme object DIRECTLY.
  Correct:  const theme = useTheme()
  WRONG:    const { theme } = useTheme()
- theme.* used ONLY for dynamic surface/border/background values
- colours.* used for static colour values (textPrimary, textSecondary, accent etc)
  This is the SpendCategoryRow pattern — all portfolio components follow it.
- No inline colour decisions. No Colors.dark.X. No hardcoded hex.

### Import Paths
- Relative imports only. The @/ alias is NOT used in this project.
- Check how spend.tsx imports ThemeContext and copy that pattern.

### Export Pattern
- All components use DEFAULT exports.
  Correct:  export default function MyComponent
  WRONG:    export function MyComponent

### Styling Pattern
- StyleSheet.create() for all styles — no inline style objects in components.
  This is the SpendCategoryRow pattern — locked for all portfolio components.

### Currency Formatting Pattern
- formatCurrency(amount, currency) from /constants/formatters.ts — always
- Intl.NumberFormat — permanently banned, breaks Expo web bundler
- Template literals with raw numbers — never (`€${amount}`)
- TextInput fields: format on blur, parse on save. Never format live.

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

### Portfolio Type System (March 2026 — LOCKED)
Two-layer model:
  assetClass   — display and grouping ONLY
  assetSubtype — drives ALL logic (bucket defaults, lock rules,
                 projection rates, CSV parsers)
DEFAULT_BUCKET in /types/portfolio.ts is the single source of truth.
Never duplicate this mapping. Both UI and services import from there.

### BucketReassign Entry Point (March 2026 — LOCKED)
Only accessible from HoldingDetailScreen [Reassign bucket] button.
No long-press on holding rows.

### PortfolioHoldingRow Icon System (March 2026 — LOCKED)
SVG stroke-only icons. No icon container box. No emoji. No text codes.
Direct render — same pattern as CategoryIcon in SpendCategoryRow.
  India geography (live)    → rupee symbol SVG
  Europe/US/Global (live)   → trend line SVG
  locked variant            → padlock SVG
  protection variant        → shield + checkmark SVG
All strokes: colours.textSecondary, strokeWidth 1.6, fill none.

### Onboarding (10 screens)
Screen 2: "What's your name?" (not Household setup)
Household created silently with one OWNER profile.
Partner added via Settings later.
Screen 4: Age (skippable).
Screen 8: Budget Suggestion (conditional — only if upload succeeded).

---

## KNOWN OPEN ISSUES (log here, fix when scheduled)

1. **Dutch brand names in mock data** — Fix before data layer session.
   Replace: Albert Heijn/Jumbo → "Supermarket",
   Thuisbezorgd → "Food Delivery App",
   Bol.com → "Online Store", NS/GVB → "Public Transport"
   File: /constants/mockData.ts

2. **Category detail screen layout bug** — Large empty space between
   month selector and tag pills. Fix in Polish session.

3. **KasheAsterisk k-stroke** — Needs more visual prominence.
   Fix in Polish session.

4. **Vertical MacronRule in PortfolioTotalsCard** — Currently a plain
   View with theme.accent background instead of the MacronRule component.
   Standardise in Polish session.

5. **TextInput monthly target formatting** — InvestmentPlanCard shows
   "1500" not "1,500". Fix: format on blur, parse on save. Polish session.

6. **PPF Account currency** — Still shows ₹420,000 in some paths.
   Full fix when FX service wired in data layer session.

7. **BucketReassignSheet TEST button** — Temporary trigger in
   portfolio.tsx. Remove and replace with HoldingRow onPress →
   router.push during PORT-10.

8. **InstrumentSuggestionSheet drag handle** — Check visibility
   during PORT-10 pass.

---

## NEXT — PORT-10: HoldingDetailScreen

File: /app/portfolio/[holdingId].tsx
Sub-components:
  /components/portfolio/LockedProjectionCard.tsx
  /components/portfolio/ProtectionStatusCard.tsx

Spec: kashe-handoff-session-06.md → PORT-10 section

Key points:
- Dynamic Expo Router route — read holdingId from useLocalSearchParams()
- Look up holding in MOCK_PORTFOLIO_HOLDINGS by id
- Back chevron + holding name as header
- Live, Locked, Protection variants render different layouts
- BucketReassignSheet wired here via [Reassign bucket] button
- Remove TEST button from portfolio.tsx in this pass
- LockedProjectionCard: FV projection by subtype rate, alternative_general
  shows last known valuation only
- ProtectionStatusCard: coverage months, status bar, surplus note

---

## REMAINING PORTFOLIO TICKETS

```
PORT-10  /app/portfolio/[holdingId].tsx    ← NEXT
           LockedProjectionCard
           ProtectionStatusCard
PORT-11  Portfolio empty state
```

Full spec: kashe-handoff-session-06.md

---

## FULL REMAINING SESSION ORDER

```
Session 06 (cont.) — PORT-10, PORT-11
Session 07  Insights Screen + FIRE Planner (INS-01 to INS-10)
Session 08  Data Layer — services, stores, hooks (no UI)
Session 09  Wire UI to Data Layer
Session 10  Onboarding Stack (10 screens + UniversalAddSheet)
Session 11  Settings + Polish
Session 12  QA + Native Build Prep
```

---

## CRITICAL RULES — QUICK REFERENCE

1.  `--legacy-peer-deps` on every npm install. No exceptions.
2.  Never use react-native-reanimated. Animated API only.
3.  Never hardcode a colour. useTheme() + colours.* only.
4.  const theme = useTheme() — NOT const { theme } = useTheme()
5.  theme.* for surface/border/background. colours.* for everything else.
6.  Default exports everywhere.
7.  Relative imports everywhere. No @/ alias.
8.  StyleSheet.create() for all styles — no inline style objects.
9.  Every component: dark AND light mode.
10. Every screen: empty state.
11. Never show a financial number as zero. Redact instead.
12. "Your Position" not "Net Worth." Everywhere.
13. No new dependencies without PM approval.
14. TypeScript strict. Zero `any` types.
15. investment_transfer is NOT spend. Excluded from totals/savings rate.
16. Physical assets — NEVER build.
17. [V2] and [NEVER] tags — skip entirely.
18. Commit after every ticket. Preview before committing.
19. Space Grotesk for numbers/display. Inter for body/UI. Never Syne/DM Sans.
20. Hero card ALWAYS dark — both modes.
21. Directional KasheAsterisk replaces ↑↓ arrows everywhere.
22. Empty state = redacted ghost + floating pill. NOT blurred overlay.
23. Every commit = code + updated MD files together.
24. Read the existing working component BEFORE building its portfolio equivalent.
25. formatCurrency() from formatters.ts always. Never Intl.NumberFormat.
26. MD files are always downloaded and replaced in full. Never edited inline.
27. Git commands always run manually by Anand. Never through Claude Code.

---

## SKILL FILES IN /docs/skills/

```
engineering-rules.md    Read before EVERY session
design-system.md        Read before any UI work
data-architecture.md    Read before data layer session
ai-insights.md          Read before Insights session
freemium-boundaries.md  Reference for feature flag decisions
```
