# Kāshe — CLAUDE-state.md
*Current build state. Read this before any new session.*
*Last updated: 17 March 2026 — PORT-10b complete, full colour
audit done, visual standardisation across Portfolio, Session 07
(Invest tab + PORT-11) ready to build.*

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
✅ /constants/spacing.ts — 4px grid + borderRadius
✅ /constants/mockData.ts
✅ /components/ui/Typography.tsx, Card.tsx, Button.tsx
✅ /components/shared/KasheAsterisk.tsx
✅ /components/shared/MacronRule.tsx
✅ /components/shared/RedactedNumber.tsx
✅ /components/shared/EmptyState.tsx
✅ /components/home/ — all home components

### Session 02 — Home Screen (Complete)
✅ Fonts locked: Space Grotesk + Inter (Syne/DM Sans retired)
✅ ThemeContext pattern introduced and locked
✅ /components/home/SegregationToggle.tsx
✅ /components/home/MonthlyReviewLink.tsx
✅ /components/home/SpendStoryCard.tsx
✅ /components/shared/AppHeader.tsx
✅ /context/ThemeContext.tsx
✅ react-native-svg, expo-linear-gradient installed

### Session 03 — Spend Screen (Complete)
✅ /types/spend.ts
✅ /hooks/useDataSources.ts
✅ All spend components
✅ /app/spend/[category].tsx
✅ /app/(tabs)/spend.tsx — complete

### Session 04 — Portfolio (PORT-01 through PORT-03)
✅ /types/portfolio.ts — two-layer type system + DEFAULT_BUCKET
✅ /constants/mockData.ts — portfolio mock data added
✅ /components/portfolio/PortfolioTotalsCard.tsx
✅ /components/portfolio/PortfolioSectionHeader.tsx
✅ /components/portfolio/PortfolioHoldingRow.tsx

### Session 05 — Portfolio (PORT-06 through PORT-09)
✅ /components/portfolio/PortfolioInsightStrip.tsx
✅ /components/portfolio/InvestmentPlanCard.tsx
✅ /constants/formatters.ts — formatCurrency()
✅ /components/portfolio/InstrumentSuggestionSheet.tsx
✅ /components/portfolio/BucketReassignSheet.tsx

### Session 06 — Portfolio (PORT-10 basic)
✅ /components/portfolio/LockedProjectionCard.tsx
✅ /components/portfolio/ProtectionStatusCard.tsx
✅ /app/portfolio/[holdingId].tsx — basic version

### Session 07 — Colour Audit + PORT-10b + Visual Standardisation
✅ TASK 0: insights.tsx → invest.tsx, _layout.tsx updated
✅ Full colour audit — all components now use theme tokens correctly
   Root cause: colours.textPrimary was hardcoded to light mode ink.
   Fixed globally. darkTheme.border bumped for visible outlines.
✅ /constants/displayLabels.ts — PORT-10b Fix 1
   getAssetTypeLabel(), getGeographyLabel()
   All raw subtype keys removed from UI everywhere.
✅ /components/portfolio/HoldingPriceChart.tsx — PORT-10b Fix 2
   SVG line chart, 1M/6M/1Y tabs, mock history, accent/danger colour
✅ /components/portfolio/HoldingInsightCard.tsx — PORT-10b Fix 3
   Holding-specific AI insight, mock content per assetSubtype
✅ /app/portfolio/[holdingId].tsx — PORT-10b Fix 4
   Dark hero card (matches PositionHeroCard pattern)
   Light screen background (matches Spend category detail)
   Standardised card/spacing system throughout
✅ Visual standardisation pass:
   PortfolioTotalsCard: dark gradient hero + KasheAsterisk watermark
   All Portfolio cards/rows: standardised spacing + tokens
   All Portfolio screens: consistent with Home + Spend visual language

---

## CONFIRMED FILE TREE (as of Session 07)

```
app/
  (tabs)/
    _layout.tsx           ✅
    index.tsx             ✅ Home (complete)
    spend.tsx             ✅ Spend (complete)
    portfolio.tsx         ✅ PORT-01 through PORT-10b wired
    invest.tsx            ⬜ Shell only — build Session 08
  _layout.tsx             ✅
  spend/
    [category].tsx        ✅
  portfolio/
    [holdingId].tsx       ✅ PORT-10b complete
  invest/
    fire.tsx              ⬜ Session 09

components/
  home/                   ✅ All complete
  shared/                 ✅ All complete
    ⚠️ KasheAsterisk k-stroke prominence — Polish session
  spend/                  ✅ All complete
  portfolio/
    PortfolioTotalsCard.tsx        ✅ dark hero + watermark
    PortfolioSectionHeader.tsx     ✅
    PortfolioHoldingRow.tsx        ✅
    PortfolioInsightStrip.tsx      ✅
    InvestmentPlanCard.tsx         ✅
    InstrumentSuggestionSheet.tsx  ✅
    BucketReassignSheet.tsx        ✅
    LockedProjectionCard.tsx       ✅
    ProtectionStatusCard.tsx       ✅
    HoldingPriceChart.tsx          ✅ PORT-10b
    HoldingInsightCard.tsx         ✅ PORT-10b
  invest/                 ⬜ All new — Session 08
    RiskProfileCard.tsx
    RiskProfileSheet.tsx
    InvestmentPlanFull.tsx
    MonthlyReviewCard.tsx
    MonthlyReviewSheet.tsx
    FIRETeaserCard.tsx
  ui/                     ✅ All complete

constants/
  colours.ts              ✅ audited + fixed Session 07
  formatters.ts           ✅
  displayLabels.ts        ✅ PORT-10b
  mockData.ts             ✅
  spacing.ts              ✅
  typography.ts           ✅
  fireDefaults.ts         ⬜ Session 09

types/
  spend.ts                ✅
  portfolio.ts            ✅
  riskProfile.ts          ⬜ Session 08

docs/                     ✅ Updated 17 March 2026
```

---

## LOCKED ARCHITECTURE PRINCIPLES

### ThemeContext Pattern
- useColorScheme() ONLY in context/ThemeContext.tsx
- const theme = useTheme() — never destructured
- theme.* for surface/border/background/text
- colours.* for all static tokens (accent, danger, warning,
  hero tokens, textOnAccent)
- No raw hex in any component. Ever.

### Hero Card Pattern (LOCKED 17 March 2026)
- Always dark gradient regardless of system mode
- LinearGradient: heroGradientStart → heroGradientEnd
- borderRadius 24, overflow hidden, padding 24
- KasheAsterisk watermark: position absolute, top -45, right -45,
  size 200×200, opacity 0.07, all strokes colours.accent
  strokeWidth 14, animated=false, pointerEvents none
- All text inside: colours.hero* tokens only. Never theme.*.
- Components: PositionHeroCard, SpendHeroCard, PortfolioTotalsCard,
  HoldingDetailScreen hero section

### Standard Card Pattern (LOCKED 17 March 2026)
- backgroundColor: theme.surface
- borderRadius: 16
- No border (surface on background provides sufficient separation)
- Internal padding: match SpendCategoryRow/SpendInsightStrip exactly

### Screen Layout (LOCKED 17 March 2026)
- ScrollView contentContainerStyle:
  paddingHorizontal 20, paddingTop 16, paddingBottom 48
- Gap between cards: marginTop 16
- Gap before section headers: marginTop 32
- Reference: spend.tsx — match exactly

### Detail Screen Pattern (LOCKED 17 March 2026)
- Light background (theme.background) — same as Spend category detail
- Dark hero card at very top — always
- All cards below: standard card pattern (theme.surface, radius 16)
- Reference: /app/spend/[category].tsx — match exactly

### Import Paths
- Relative imports only. No @/ alias. Ever.

### Export + Styling
- Default exports everywhere
- StyleSheet.create() always — no inline style objects

### Currency Formatting
- formatCurrency(amount, currency) from /constants/formatters.ts
- Intl.NumberFormat — permanently banned
- Template literals with raw numbers — never

### Display Labels
- Never show raw subtype keys (in_mutual_fund, india) in any UI
- Always use getAssetTypeLabel() / getGeographyLabel()
  from /constants/displayLabels.ts

### Animation
- React Native Animated API only
- react-native-reanimated — banned from web builds

---

## LOCKED DECISIONS (do not re-debate)

### Tab Structure (16 March 2026 — LOCKED)
Four tabs: Home / Spend / Portfolio / Invest
No standalone Insights tab.
AI insights live on their native screens.
Invest tab = Risk Profile + Investment Plan + Monthly Review
  + optional FIRE entry.
Route: /app/(tabs)/invest.tsx

### Risk Profile (16 March 2026 — LOCKED)
Three levels: Conservative / Balanced / Growth
Plain language — not numbers, not a quiz. Default: Balanced.
Conservative: 40/40/20   Balanced: 60/20/20   Growth: 80/10/10
Drives allocation targets, instrument suggestions, health alerts.
Captured in onboarding screen 5. Stored in householdStore.

### Product Vision (16 March 2026 — LOCKED)
For ALL globally mobile professionals — not India-specific.
Any expat with multi-geography finances is the target user.
Mock data must feel relevant to any nationality.

### Display Labels (16 March 2026 — LOCKED)
Never show raw subtype keys (in_mutual_fund, india) in UI.
All labels from /constants/displayLabels.ts.

### Visual Standardisation (17 March 2026 — LOCKED)
Hero card pattern, standard card pattern, screen layout,
and detail screen pattern are now locked.
All future screens must match these patterns.
Reference: SpendHeroCard (hero), SpendCategoryRow (standard card),
  spend/[category].tsx (detail screen).

### FIRE is Optional
FIRE planner at /app/invest/fire.tsx.
Entry from Invest tab via single low-pressure row.
Not shown prominently until user opts in.

### BucketReassign Entry Point
Only from HoldingDetailScreen PURPOSE bucket row or back-compat
[Reassign bucket] button. Never from holding list.

### Empty State Pattern
Ghost at 0.5 opacity. RedactedNumber. Floating accent pill. NOT blur.

---

## KNOWN BUG REGISTRY

### 🔴 Data / correctness (fix before beta)
1. PPF Account showing ₹420,000 instead of EUR equivalent
   on portfolio list row — data layer session
2. GROWTH section total inflated — mock data arithmetic —
   data layer session
3. Dutch brand names in Spend mock data — fix before data
   layer session (Albert Heijn → "Supermarket" etc)

### 🟡 Visual / polish (fix in polish session)
4. Chart spike at end of 1M view — mock random walk issue
5. KasheAsterisk watermark on PortfolioTotalsCard alignment
   vs Home hero — minor
6. KasheAsterisk k-stroke needs more visual prominence
7. Vertical MacronRule in PortfolioTotalsCard is plain View —
   standardise to MacronRule component
8. TextInput monthly target not through currency formatter
9. Category detail screen gap between month selector + pills

### 🟢 Deferred by design
10. Dark mode not yet device-verified (web preview limitation)
11. react-native-reanimated returns for native QA session
12. Price chart shows mock data — real feed in data layer

---

## V1.5 / V2 / NEVER BACKLOG
*(Review at end of V1 before starting V1b planning)*

### V1.5 candidates
- SMS parsing for Indian bank accounts (CRED-style) — high
  value for Indian expat users, low GDPR risk for SMS

### V2 (already in plan)
- Open banking (Nordigen EU, Account Aggregator India, Plaid US)
- Email parsing for financial data (GDPR-careful)
- Couple sync via Supabase Edge Functions
- ML spend categorisation
- Conversational advisor
- Push notifications
- Year-end wrapped
- Real price chart data

### Never
See CLAUDE.md [NEVER] list.

---

## REMAINING BUILD ORDER

```
Session 08  PORT-11 + Invest Tab
              PORT-11: Portfolio empty state
              INV-01: RiskProfileCard + RiskProfileSheet
              INV-02: InvestmentPlanFull
              INV-03: MonthlyReviewCard + MonthlyReviewSheet
              INV-04: FIRETeaserCard
              INV-05: Wire invest.tsx
              INV-06: Invest empty state

Session 09  FIRE Planner screen
              /app/invest/fire.tsx
              FIREHouseholdToggle, FIRESliderHero,
              FIREInputsCard, FIREAssumptionsCard,
              FIREProfileSelector
              /constants/fireDefaults.ts

Session 10  Data Layer (no UI)
              All services and stores

Session 11  Wire UI to Data Layer
              Real CSV data flows — first real test

Session 12  Onboarding (10 screens + UniversalAddSheet)

Session 13  Sources Screen

Session 14  Settings + Polish

Session 15  QA + Native Build Prep

--- YOUR OWN TESTING ---
--- 10 FRIENDS BETA ---
--- INVESTOR READY ---
```

---

## CRITICAL RULES — QUICK REFERENCE

1.  --legacy-peer-deps every npm install
2.  Never react-native-reanimated (web builds)
3.  const theme = useTheme() — never destructured
4.  theme.* surface/border/background/text. colours.* static tokens.
5.  StyleSheet.create() always. No inline styles.
6.  formatCurrency() always. Never Intl.NumberFormat.
7.  Default exports. Relative imports. No @/ alias.
8.  TypeScript strict. Zero any.
9.  Space Grotesk numbers/display. Inter body/UI. Never Syne/DM Sans.
10. Hero card always dark — both modes. Hero tokens inside only.
11. Standard card: theme.surface, borderRadius 16, no border.
12. Screen layout: paddingH 20, paddingTop 16, paddingBottom 48.
    Card gap: marginTop 16. Section header gap: marginTop 32.
13. Detail screens: light bg, dark hero at top. Matches Spend detail.
14. Hero watermark: KasheAsterisk absolute top -45 right -45,
    200×200, opacity 0.07, overflow hidden on parent.
15. KasheAsterisk replaces ↑↓ arrows everywhere.
16. Empty state = 0.5 opacity ghost + floating accent pill.
17. Every commit = code + updated MD files together.
18. Read reference component BEFORE building equivalent.
    SpendHeroCard → any hero card
    SpendCategoryRow → any list row
    SpendInsightStrip → any insight card
    spend/[category].tsx → any detail screen
19. Git always manually. MD files replaced in full.
20. Never show raw subtype keys — use displayLabels.ts.
21. No standalone Insights tab. Insights on native screens.
22. Tab 4 is Invest. Route: invest.tsx.
23. Risk profile drives allocation. Never hardcoded 60/20/20.
