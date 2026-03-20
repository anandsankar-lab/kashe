# Kāshe — Engineering Rules
*Read this before starting any ticket. No exceptions.*
*These rules apply to every agent, every session, every component.*
*Last updated: 20 March 2026 — Session 12 complete.*
*UserFinancialProfile rules added: single intelligence spine.*
*Analytics rules added: updateUserProperties pattern.*
*AI insight engine rules added: budget, windows, wiring.*

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
- Education catalogue → `constants/educationCatalogue.ts`
- Risk profiles → `types/riskProfile.ts`
- Display labels → `constants/displayLabels.ts`
- FIRE defaults → `constants/fireDefaults.ts` (V2 foundation)
- FIRE types → `types/fire.ts` (V2 foundation)
- Merchant keywords → `constants/merchantKeywords.ts`
- Storage keys → `services/storageService.ts` STORAGE_KEYS
- Supported institutions → `services/csvParser.ts` SupportedInstitution
- Import audit log → `store/auditStore.ts`
- Insight seed sources → `constants/insightSources.ts`
- Insight trigger conditions → `constants/insightTriggers.ts`
- Insight prompt templates → `constants/insightPrompts.ts`
- User financial profile → `store/householdStore.ts` financialProfile
  Built by: `services/userProfileService.ts`
- PostHog user properties → `services/analyticsService.ts` updateUserProperties()
  Source: UserFinancialProfile always. Never set properties manually.
- Vehicle category taxonomy → `types/userProfile.ts` VEHICLE_CATEGORY_MAP

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
- Read from instrumentCatalogue.ts directly (use hooks)
- Write to storage directly (use storageService.ts)
- Import from services/ directly (use hooks)
- Import from store/ directly (use hooks)
- Re-derive values already in UserFinancialProfile

All of those decisions belong in hooks, services, or context.
Components receive values via props and hooks. They render those values.

### 3. Hooks are the boundary layer
The hooks are the contract between data and UI.
- `useTheme()` → colours, always, no exceptions
- `useSpend()` → spend data and calculations
- `usePortfolio()` → portfolio data and calculations
- `useHousehold()` → profile, household state, financialProfile
- `useInsights()` → insight state and cache
- `useFirePlanner()` → FIRE inputs and outputs [V2]
- `useInstrumentCatalogue()` → catalogue data

Screens never calculate inline. They call a hook, get a value, render it.
The chain is always: **Service → Store → Hook → Component**
If you are importing a service into a component, you are doing it wrong.

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
```

---

## USERFINANCIALPROFILE RULES — LOCKED (20 March 2026)

```
UserFinancialProfile is the spine of all financial intelligence.
It is built by userProfileService.ts and stored in householdStore.

RULE 1: Read from the profile, never re-derive.
  If you need portfolioTier, read profile.portfolioTier.
  If you need geographyExposure, read profile.geographyExposure.
  NEVER recalculate these from raw holdings inline.

RULE 2: Update the profile on every data change.
  After addTransactions():     call userProfileService, update householdStore
  After addHolding():          same
  After updateHolding():       same
  After setBucketOverride():   same
  After setProtection():       same
  After setRiskProfile()
    (if actively changed):     same
  After onboardingComplete():  same
  After setMonthlyTarget():    same
  After setFireInputs():       same

RULE 3: Never send UserFinancialProfile directly to Claude.
  Use holdingsContextBuilder which sanitises it first.
  Only percentages and identifiers go into prompts.
  Never absolute values. Never account numbers.

RULE 4: Analytics properties come from the profile only.
  analyticsService.updateUserProperties(profile) is the ONLY
  place PostHog user properties are set.
  Never call ph.register() with individual properties elsewhere.

RULE 5: sophisticationScore is never shown to the user.
  It drives insight depth and prompt framing internally.
  Never surface it in any UI component.
```

---

## AI INSIGHT ENGINE RULES — LOCKED (20 March 2026)

```
RULE 1: Budget check before every API call.
  isWithinBudget() must return true before callClaudeAPI().
  Pessimistic accounting: deduct BEFORE call, reconcile AFTER.
  On failure: restore the deducted estimate.

RULE 2: Generation windows.
  Window A: 00:00–11:59. Window B: 12:00–23:59.
  Maximum ONE generation per window per insight type.
  Maximum TWO total generations per day per user.
  Check lastGenerationWindow before generating.

RULE 3: isGenerating lock.
  In-memory lock. Never persisted.
  Checked BEFORE budget check.
  Prevents parallel calls from both passing the budget check.

RULE 4: API key handling.
  Read from storageService inside the function.
  Never assign to module-level variable.
  Discarded after the call — not referenced again.
  Never logged. Never in error messages.

RULE 5: Clock manipulation defence.
  If stored monthYear > current monthYear: do NOT reset budget.
  Log the anomaly locally. Return budget_exceeded.

RULE 6: FIRE_TRAJECTORY.
  Returns { success: false, reason: 'not_implemented' } in V1.
  No FIRE insight generation. No FIRE web search.

RULE 7: Web search.
  MARKET_EVENT_ALERT: web search ENABLED.
  All other insight types: web search DISABLED.

RULE 8: Injection defence.
  isSafeForPrompt() on all user-influenced string fields.
  If injection detected: return injection_detected reason.
  Never log injection_detected to analytics.

RULE 9: Context builders.
  holdingsContextBuilder sanitises before sending to Claude.
  Only percentages and public identifiers (ISIN, ticker).
  Never absolute values. Never account numbers. Never PII.
```

---

## ANALYTICS RULES — LOCKED (20 March 2026)

```
RULE 1: ANALYTICS_ENABLED = false always, until PM review.
  Never flip to true without completing the enable checklist.

RULE 2: User properties come from UserFinancialProfile only.
  Call analyticsService.updateUserProperties(profile).
  Never set PostHog properties manually anywhere else.

RULE 3: Zero PII in any event.
  No amounts. No merchant names. No account numbers.
  No email. No name. No device identifiers beyond anonymous UUID.
  Category strings and enum values only.

RULE 4: injection_detected never goes to analytics.
  Log locally (console.warn in dev). Never capture to PostHog.
  Sending this would reveal that a user's data contains suspicious strings.

RULE 5: Anonymous distinct ID only.
  Generated via crypto.randomUUID() on first launch.
  Stored in storageService. Never tied to email or Google account.
  Never regenerated — consistent across the user's sessions.

RULE 6: source_discovered event does not exist.
  Dropped — not actionable without domain/URL.
  Source quality review happens via snapshot export.
```

---

## INVEST TAB COPY RULES — LOCKED (18 March 2026)

```
PRINCIPLE: Visuals do the work. Copy is minimal and confident.

Rules:
- No verbose explanatory paragraphs in any Invest component
- Use fraction format for progress: €920/€1,500 not "€580 short"
- KasheAsterisk punctuates AI-generated insights and recommendations
- "Worth exploring" always — never "Buy" or "Invest in"
- FIRE headline: "How close are you to financial independence?"
  NEVER "choose not to work" / "stop working" / "retire early"
- Risk profile recommendation: "Balanced is a good starting point"
```

---

## FIRE — V2 ONLY (LOCKED 18 March 2026)

```
FIRE is deferred to V2. No FIRE UI is built in V1.

What EXISTS (do not delete):
  /constants/fireDefaults.ts  — country-specific defaults
  /types/fire.ts              — full type system
  /components/invest/FIRETeaserCard.tsx — built, not rendered

What does NOT exist:
  /app/invest/fire.tsx

Removed from V1 screens:
  FIREProgress — removed from index.tsx
  FIRETeaserCard — removed from invest.tsx

fireIsSetUp in UserFinancialProfile:
  true if FIRE inputs have been entered
  Affects monthly review (fireUpdate section null if false)
  No FIRE insight generation in V1.
  FIRE_TRAJECTORY returns not_implemented.
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
```

---

## STORAGE + SECURITY RULES — LOCKED (19 March 2026)

```
expo-secure-store for ALL persistence. Never AsyncStorage directly.
ALL storage access: /services/storageService.ts only.
secureStorageAdapter: Zustand bridge. Separate from storageService.
Raw CSV files: never written to disk. Parse in memory only.
Security pipeline: runs INSIDE csvParser.ts (sanitiseTransaction).
Write failures: always propagate. Never swallowed silently.
API key: never in source code, bundle, or GitHub.
  Read from storageService in each function call. Discarded after use.
```

---

## JOINT ACCOUNT RULES — LOCKED (19 March 2026)

```
DataSource.accountType: 'personal' | 'joint' | 'managed'
Transaction.ownership: 'personal' | 'joint' | 'split'
  Joint account imports → ownership: 'joint'
  splitWithProfileId: partner profileId
  splitRatio: 0.5 default

Household view: joint transactions appear ONCE
Individual view: personal + joint for that profile, never partner's personal
```

---

## AUDIT LOG RULES — LOCKED (19 March 2026)

```
Every CSV import logged in auditStore at profile level.
100-event cap, FIFO eviction.
auditStore.clearAuditLog() ONLY called from "delete all data" flow.
Never called anywhere else.
```

---

## COMPLIANCE RULES — LOCKED (18 March 2026)

```
Before beta, add to these screens:
  /app/(tabs)/invest.tsx   — "For information only. Not financial advice."
  /app/settings.tsx        — below Education section: same text

Instrument suggestions: "Worth exploring" framing mandatory.
No affiliate links — ever.
```

---

## CURRENCY FORMATTING RULE — LOCKED (March 2026)

```
ALWAYS use formatCurrency() from /constants/formatters.ts
NEVER use Intl.NumberFormat — unreliable in Expo web bundler
NEVER use template literals: `€${amount}`

TextInput fields: format on blur, parse on save.
Never format a live TextInput value — breaks cursor position.
```

---

## ENVIRONMENT RULES

```
npm install     ALWAYS use --legacy-peer-deps
Animations      NEVER install react-native-reanimated for web preview
TypeScript      Strict mode throughout. Zero any types.
Preview         npx expo start → w → localhost:8081
Git             ALWAYS run git commands manually in a normal terminal
                NEVER run git through Claude Code
```

---

## COMMIT RULES

```
Format:   [TICKET-ID] Brief description
Example:  [DL-09] UserFinancialProfile — intelligence spine

Rules:
- One commit per logical ticket
- Always preview before committing
- Never commit broken code
- Never commit API keys or tokens
  (PostHog write-only key is safe in client code)
- Every commit includes code + updated MD files together
- Push at end of every session
```

---

## BEFORE YOU WRITE ANY CODE

1. Read `CLAUDE-state.md` — know what exists and what the next ticket is
2. Read the latest `kashe-handoff-session-XX.md`
3. Check that UserFinancialProfile has the fields your ticket needs
4. Check that the TypeScript type exists in `/types/` before building
5. Check that mock data exists in `/constants/mockData.ts` before building

---

## WHAT NEVER GETS BUILT

```
[NEVER] Physical assets
[NEVER] Tax filing or calculations
[NEVER] Money transfers or payments
[NEVER] Social features or comparisons between users
[NEVER] Ads, affiliate links, or data monetisation
[NEVER] Generic market news feed
[NEVER] Gamification
[NEVER] Business finances
[NEVER] Specific buy/sell recommendations
[NEVER] Regulated financial advice
[NEVER] Net Worth — always "Your Position"
[NEVER] Intl.NumberFormat — use formatCurrency()
[NEVER] react-native-reanimated in web builds
[NEVER] @/ import alias
[NEVER] Named exports from component files — default exports only
[NEVER] Inline style objects
[NEVER] Hardcoded hex colour values in components
[NEVER] Raw subtype keys in UI — use displayLabels.ts
[NEVER] KasheScore shown to user as a number
[NEVER] Sophistication score shown to user as a number
[NEVER] track_only instruments in InstrumentDiscoverySection
[NEVER] Crypto suggested to user
[NEVER] Equity crowdfunding suggested to user
[NEVER] Inline header code in any tab screen
[NEVER] MonthlyReviewSheet as text document
[NEVER] Buy/sell language in instrument cards
[NEVER] AsyncStorage used directly
[NEVER] Raw SecureStore calls outside storageService.ts
[NEVER] FIRE UI in V1
[NEVER] "Choose not to work" — financial independence framing only
[NEVER] Education content hardcoded in components
[NEVER] Raw transactions sent to Claude API
[NEVER] Partial CSV imports — atomic or nothing
[NEVER] Raw CSV files written to disk
[NEVER] Silent write failures
[NEVER] Services imported directly into components
[NEVER] Derived values recalculated inline in components
[NEVER] Clearbit sent user ID, amounts, dates, or any context
[NEVER] Merchant enrichment on Layer 1 matches
[NEVER] Probable duplicates silently skipped
[NEVER] Joint transactions shown twice in household view
[NEVER] auditStore.clearAuditLog() except in "delete all data"
[NEVER] ANALYTICS_ENABLED = true without PM checklist complete
[NEVER] UserFinancialProfile sent directly to Claude API
[NEVER] PostHog properties set manually — use updateUserProperties(profile)
[NEVER] Re-derive values already computed in UserFinancialProfile
[NEVER] injection_detected sent to analytics
```

---

*Maintained by: Anand (PM)*
*Last updated: 20 March 2026*
