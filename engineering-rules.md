# Kāshe — Engineering Rules
*Read this before starting any ticket. No exceptions.*
*These rules apply to every agent, every session, every component.*

---

## THE SIX PRINCIPLES

### 1. Single source of truth
Every piece of data or configuration has exactly one home.
- Colours → `constants/colours.ts` + `context/ThemeContext.tsx`
- Spend categories → `types/spend.ts`
- Transactions → `spendStore`
- Typography → `constants/typography.ts`
- Mock data → `constants/mockData.ts`

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

Screens never calculate inline. They call a hook, get a value, render it.
If a calculation needs to happen, it belongs in a hook or service.

### 4. Types are the spec
If the TypeScript interface doesn't exist in `/types/`, the component
doesn't get built. Full stop.

Build order:
1. Define the interface in `/types/`
2. Add mock data to `/constants/mockData.ts` that satisfies the interface
3. Build the component that renders it

Never build a component and then figure out its types afterwards.
That produces `any` creep and structural debt.

### 5. Mock data is production-shaped
Mock data in `constants/mockData.ts` uses the same types, same field names,
and same structure as real production data will have.

Mock data rules:
- Never Dutch-specific brand names. International neutral only:
  ✅ "Food Delivery App" not "Thuisbezorgd"
  ✅ "Supermarket" not "Albert Heijn" or "Jumbo"
  ✅ "Online Store" not "Bol.com"
  ✅ "Public Transport" not "NS" or "GVB"
- Never random/generated numbers — always fixed constants
- Must look like a real, plausible user (38-year-old Indian engineer
  in Amsterdam with Indian MFs, DeGiro ETFs, NRE savings)
- Same mock data used everywhere — Home ghost, Spend ghost, Portfolio ghost

### 6. No raw hex values in components. Ever.
This is the ThemeContext rule. It is non-negotiable.

```typescript
// WRONG — never do this
backgroundColor: '#C8F04A'
color: '#FF5C5C'
borderColor: Colors.dark.border

// RIGHT — always do this
const { colors } = useTheme()
backgroundColor: colors.accent
color: colors.danger
borderColor: colors.border
```

`useColorScheme()` is called ONLY in `context/ThemeContext.tsx`.
Every other file in the entire codebase calls `useTheme()` instead.
This rule applies to every component, every screen, every hook.

---

## ENVIRONMENT RULES

```
npm install     ALWAYS use --legacy-peer-deps
                SDK 55 ships with React 19.2 — it breaks without this
                Example: npm install some-package --legacy-peer-deps
                Via expo: npx expo install some-package -- --legacy-peer-deps

Animations      NEVER install react-native-reanimated for web preview
                It breaks the web bundler completely
                Use React Native built-in Animated API only
                Reanimated returns in Session 10 (native builds only)

TypeScript      Strict mode throughout. Zero `any` types.
                If you can't type it, you don't understand it yet.

Preview         npx expo start → w → localhost:8081
                Every ticket must be visually confirmed before committing
```

---

## COMMIT RULES

```
Format:   [TICKET-ID] Brief description
Example:  [HOME-02] Build PositionHeroCard component

Rules:
- One commit per logical ticket
- Always preview before committing
- Never commit broken code
- Never commit API keys or tokens
- Never commit .env files
- Push at end of every session
```

---

## BEFORE YOU WRITE ANY CODE

1. Read `CLAUDE-state.md` — know what exists and what the next ticket is
2. Read the skill file(s) for your domain
3. Read only the relevant section of the spec file your ticket needs
4. Check that the TypeScript type exists in `/types/` before building
5. Check that mock data exists in `/constants/mockData.ts` before building

**If you find yourself reading all four spec files upfront — stop.**
That is not the process. Read CLAUDE-state.md and the relevant skill.
That is enough to start.

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
```

---

*Maintained by: Anand (PM)*
*Last updated: 10 March 2026*
