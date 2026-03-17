# Kāshe — Engineering Rules
*Read this before starting any ticket. No exceptions.*
*These rules apply to every agent, every session, every component.*
*Last updated: 17 March 2026 — Universal AppHeader locked,
Monthly Review format locked, Invest tab copy principles locked,
instrument catalogue rules added, KasheAsterisk usage rules added.*

---

## THE SIX PRINCIPLES

### 1. Single source of truth
Every piece of data or configuration has exactly one home.
- Colours → `constants/colours.ts` + `context/ThemeContext.tsx`
- Spend categories → `types/spend.ts`
- Transactions → `spendStore`
- Typography → `constants/typography.ts`
- Mock data → `constants/mockData.ts`
- Currency formatting → `constants/formatters.ts`
- Instrument catalogue → `constants/instrumentCatalogue.ts`
- Risk profiles → `types/riskProfile.ts`
- Display labels → `constants/displayLabels.ts`

If you find yourself defining the same thing in two places, stop.
One of them is wrong. Fix the source, not the symptom.

### 2. No component makes infrastructure decisions
Components render. That is all they do.
They do NOT:
- Calculate colours based on conditions
- Fetch data directly
- Decide currency formatting logic
- Call `useColorScheme()` directly
- Access `Colors.dark.X` or any colour object directly
- Contain raw hex values
- Read from instrumentCatalogue.ts directly (use hooks in Session 12+)

All of those decisions belong in hooks, services, or context.
Components receive values via props and hooks. They render those values.

### 3. Hooks are the boundary layer
The hooks are the contract between data and UI.
- `useTheme()` → colours, always, no exceptions
- `useSpend()` → spend data and calculations
- `usePortfolio()` → portfolio data and calculations
- `useHousehold()` → profile and household state
- `useInsights()` → insight state and cache
- `useFirePlanner()` → FIRE inputs and outputs
- `useInstrumentCatalogue()` → catalogue data (Session 12+)

Screens never calculate inline. They call a hook, get a value, render it.

### 4. Types are the spec
If the TypeScript interface doesn't exist in `/types/`, the component
doesn't get built. Full stop.

Build order:
1. Define the interface in `/types/`
2. Add mock data to `/constants/mockData.ts` that satisfies the interface
3. Build the component that renders it

Never build a component and then figure out its types afterwards.

### 5. Mock data is production-shaped
Mock data in `constants/mockData.ts` uses the same types, same field
names, and same structure as real production data will have.

Mock data rules:
- Never Dutch-specific brand names. International neutral only.
- Never random/generated numbers — always fixed constants
- Must look like a real, plausible globally mobile professional
- Same mock data used everywhere — all screens, all empty states

### 6. No raw hex values in components. Ever.
This is the ThemeContext rule. It is non-negotiable.

```typescript
// WRONG
backgroundColor: '#C8F04A'
const { theme } = useTheme()    // WRONG — never destructure

// RIGHT
const theme = useTheme()        // returns theme object directly
backgroundColor: colours.accent // colours.* for static tokens
borderColor: theme.border       // theme.* for mode-adaptive tokens
```

`useColorScheme()` is called ONLY in `context/ThemeContext.tsx`.
`theme.*` for dynamic surface/border/background values.
`colours.*` for static tokens (accent, danger, warning, hero tokens).

---

## UNIVERSAL HEADER RULE — LOCKED (17 March 2026)

```
ALL four tab screens use AppHeader from /components/shared/AppHeader.tsx
NEVER write inline header code in any tab screen file.

Correct:
  import AppHeader from '../../components/shared/AppHeader'
  <AppHeader title="Invest" showAvatar showOverflow showAdd ... />

Wrong:
  <View style={styles.header}>
    <Text>Invest</Text>
    ...
  </View>

AppHeader props:
  title: string
  showAvatar?: boolean       // default false
  avatarInitial?: string     // default 'A'
  showOverflow?: boolean     // default false
  showAdd?: boolean          // default true
  onAdd?: () => void
  onOverflow?: () => void
  onAvatar?: () => void
```

---

## MONTHLY REVIEW FORMAT — LOCKED (17 March 2026)

```
MonthlyReviewSheet is an EXECUTIVE BRIEF — four storytelling levels.
NEVER revert to text document / scrollable paragraphs format.

L1: Hero stat + SVG sparkline
L2: Animated allocation bars per bucket
L3: Priority action card with accent left border
L4: FIRE year + watchlist bullets

Mode: System-responsive (follows device dark/light) — intentional.
      Do NOT force light or dark background.

Reference: /components/invest/MonthlyReviewSheet.tsx
```

---

## INVEST TAB COPY RULES — LOCKED (17 March 2026)

```
PRINCIPLE: Visuals do the work. Copy is minimal and confident.

Rules:
- No verbose explanatory paragraphs in any Invest component
- Use fraction format for progress: €920/€1,500 not "€580 short"
- KasheAsterisk punctuates AI-generated insights and recommendations
- "Worth exploring" always — never "Buy" or "Invest in"
- FIRE framing: "choose not to work" — freedom, not stopping
- Risk profile recommendation: "Balanced is a good starting point"
  Not: "Tell us how you think about risk. We'll tailor your..."

KasheAsterisk usage:
  ✓ Before AI-generated recommendations ("* Balanced is a good...")
  ✓ Before "why" text in instrument cards
  ✓ In MonthlyReviewSheet hero stat row
  ✓ Top-right of FIRE year section
  ✗ As random decoration — only where Kāshe is "speaking"
```

---

## INSTRUMENT CATALOGUE RULES — LOCKED (17 March 2026)

```
track_only instruments NEVER appear in InstrumentDiscoverySection.
EVER. Not even with a disclaimer. Not even at TIER 3.

track_only forever:
  equity_crowdfunding, angel_investment, venture_fund,
  private_equity, nft, stock_options, futures,
  structured_product, employer_rsu, employer_espp, crypto_spot

KasheScore:
  Never shown to user as a number.
  Drives ordering within a tier — best score first.
  Objective criteria only — never derived from user behaviour.

"Worth exploring" framing:
  Every instrument card must use the entry.why field.
  Never write custom copy that recommends buying or selling.
  The catalogue content is the spec — render it, don't override it.

Geography filtering:
  Always filter suggestions by user's residence geography.
  Never show instruments from unrelated geographies unless GLOBAL.
  Unknown geography → show GLOBAL entries + UNKNOWN_GEOGRAPHY_MESSAGE.
```

---

## CURRENCY FORMATTING RULE — LOCKED (March 2026)

```
ALWAYS use formatCurrency() from /constants/formatters.ts
NEVER use Intl.NumberFormat — unreliable in Expo web bundler
NEVER use template literals with raw numbers: `€${amount}`

formatCurrency(1500, 'EUR')     // → "€1,500"
formatCurrency(420000, 'INR')   // → "₹4,20,000"
formatCurrency(48200, 'EUR')    // → "€48,200"

TextInput fields: format on blur, parse on save.
Never format a live TextInput value — breaks cursor position.
```

---

## ENVIRONMENT RULES

```
npm install     ALWAYS use --legacy-peer-deps
                Example: npm install some-package --legacy-peer-deps

Animations      NEVER install react-native-reanimated for web preview
                Use React Native built-in Animated API only
                Reanimated returns in QA session (native builds only)

TypeScript      Strict mode throughout. Zero any types.

Preview         npx expo start → w → localhost:8081
                Every ticket must be visually confirmed before committing

Git             ALWAYS run git commands manually in a normal terminal
                NEVER run git through Claude Code
```

---

## COMMIT RULES

```
Format:   [TICKET-ID] Brief description
Example:  [INV-05] InstrumentDiscoverySection — live catalogue

Rules:
- One commit per logical ticket
- Always preview before committing
- Never commit broken code
- Never commit API keys or tokens
- Every commit includes code + updated MD files together
- Push at end of every session
```

---

## BEFORE YOU WRITE ANY CODE

1. Read `CLAUDE-state.md` — know what exists and what the next ticket is
2. Read the latest `kashe-handoff-session-XX.md`
3. Read only the relevant section of the spec file your ticket needs
4. Check that the TypeScript type exists in `/types/` before building
5. Check that mock data exists in `/constants/mockData.ts` before building

**Read CLAUDE-state.md and the handoff doc. That is enough to start.**

---

## WHAT NEVER GETS BUILT

These are permanent. Do not ask. Do not suggest workarounds.

```
[NEVER] Physical assets (car, art, jewellery, watches, property)
[NEVER] Tax filing or tax calculations of any kind
[NEVER] Money transfers or payments
[NEVER] Social features or comparisons between users
[NEVER] Ads, affiliate links, or data monetisation
[NEVER] Generic market news feed (only holdings-specific news)
[NEVER] Gamification (badges, streaks, scores)
[NEVER] Business or company finances
[NEVER] Specific buy/sell recommendations
[NEVER] Regulated financial advice
[NEVER] Net Worth — always "Your Position" everywhere
[NEVER] Intl.NumberFormat — use formatCurrency() from formatters.ts
[NEVER] react-native-reanimated in web builds
[NEVER] @/ import alias — relative imports only
[NEVER] Named exports from component files — default exports only
[NEVER] Inline style objects — StyleSheet.create() only
[NEVER] Hardcoded hex colour values in components
[NEVER] Raw subtype keys in UI — always use displayLabels.ts
[NEVER] KasheScore shown to user as a number
[NEVER] track_only instruments in InstrumentDiscoverySection
[NEVER] Crypto suggested to user (track_only only)
[NEVER] Equity crowdfunding suggested to user (track_only only)
[NEVER] Inline header code in any tab screen (use AppHeader)
[NEVER] MonthlyReviewSheet as text document (executive brief only)
[NEVER] Buy/sell language in instrument cards
```

---

*Maintained by: Anand (PM)*
*Last updated: 17 March 2026*
