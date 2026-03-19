# Kāshe — Engineering Rules
*Read this before starting any ticket. No exceptions.*
*These rules apply to every agent, every session, every component.*
*Last updated: 19 March 2026 — Session 12 complete.
Data layer rules added: storage chain, caching model, CSV parser
architecture, retry queue caps, atomic imports, merchant enrichment,
joint account rules, audit log rules.*

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

All of those decisions belong in hooks, services, or context.
Components receive values via props and hooks. They render those values.

### 3. Hooks are the boundary layer
The hooks are the contract between data and UI.
- `useTheme()` → colours, always, no exceptions
- `useSpend()` → spend data and calculations
- `usePortfolio()` → portfolio data and calculations
- `useHousehold()` → profile and household state
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

AppHeader props:
  title: string
  showAvatar?: boolean       // default false
  avatarInitial?: string     // default 'A'
  showOverflow?: boolean     // default false
  showAdd?: boolean          // default true
  onAdd?: () => void
  onOverflow?: () => void    // defaults to router.push('/settings')
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

## INVEST TAB COPY RULES — LOCKED (18 March 2026)

```
PRINCIPLE: Visuals do the work. Copy is minimal and confident.

Rules:
- No verbose explanatory paragraphs in any Invest component
- Use fraction format for progress: €920/€1,500 not "€580 short"
- KasheAsterisk punctuates AI-generated insights and recommendations
- "Worth exploring" always — never "Buy" or "Invest in"
- FIRE headline: "How close are you to financial independence?"
  NEVER "choose not to work"
  NEVER "stop working"
  NEVER "retire early"
- Risk profile recommendation: "Balanced is a good starting point"
  Not: "Tell us how you think about risk. We'll tailor your..."

KasheAsterisk usage:
  ✓ Before AI-generated recommendations ("* Balanced is a good...")
  ✓ Before "why" text in instrument cards
  ✓ In MonthlyReviewSheet hero stat row
  ✗ As random decoration — only where Kāshe is "speaking"
```

---

## FIRE — V2 ONLY (LOCKED 18 March 2026)

```
FIRE is deferred to V2. No FIRE UI is built in V1.

What EXISTS (do not delete):
  /constants/fireDefaults.ts  — country-specific engine, V2 foundation
  /types/fire.ts              — full type system, V2 foundation
  /components/invest/FIRETeaserCard.tsx — built, not rendered

What does NOT exist and must NOT be built in V1:
  /app/invest/fire.tsx        — FIRE planner screen

What has been REMOVED from V1 screens:
  FIREProgress component      — removed from index.tsx
  FIRETeaserCard              — removed from invest.tsx

Do not add any FIRE UI to any screen in V1.
Do not re-debate this decision.
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

## EDUCATION CATALOGUE RULES — LOCKED (18 March 2026)

```
/constants/educationCatalogue.ts is the single source of truth.
Components never hardcode education content inline.

Selection logic (always use getEducationArticles()):
  1. Geography: GLOBAL always shown + geography-specific match
  2. Tier: never show articles below user's derived tier
     (use deriveUserTier() — never calculate inline)
  3. excludeIfHoldingTypes: if user holds it, they know it

V1 placement: /app/settings.tsx only
V2 placement: contextual inline tooltips on bucket names,
              instrument fields (TER, regulatory regime, etc.)

Never add education content to the Invest tab scroll.
```

---

## STORAGE RULES — LOCKED (18 March 2026, updated 19 March 2026)

```
ALL persistent data uses expo-secure-store.
ALL storage access goes through /services/storageService.ts.
AsyncStorage is NEVER used directly — anywhere in the codebase.
Raw SecureStore calls are NEVER made outside storageService.ts.

Two files own the storage layer:
  /services/storageService.ts      — vault door, get/set/delete/clear
  /services/secureStorageAdapter.ts — Zustand bridge (createJSONStorage)
  These are SEPARATE files with separate responsibilities.

Zustand persistence pattern (v5):
  import { createJSONStorage, persist } from 'zustand/middleware'
  import secureStorageAdapter from '../services/secureStorageAdapter'
  persist(store, {
    name: STORAGE_KEYS.XXX_STORE,
    storage: createJSONStorage(() => secureStorageAdapter),
  })

What NEVER goes into storage:
  Raw account numbers (only last 4 digits)
  Full IBANs (only masked ****1234)
  BSN / PAN / Aadhaar numbers (stripped entirely)
  API keys in plain text (stored via SecureStore encryption)
  Raw CSV file content (parsed in memory, discarded immediately)

Error handling:
  Read failures: graceful degradation — store starts with empty state
  Write failures: ALWAYS propagate (DEC-06) — never swallow silently
  On storage error: show clear error screen, never continue with
  in-memory state as if save succeeded
```

---

## DATA LAYER RULES — LOCKED (19 March 2026)

### The chain
```
Service → Store → Hook → Component

Services:  Business logic, parsing, API calls. No UI.
Stores:    In-memory state + encrypted persistence. No UI.
Hooks:     Bridge between stores and UI. Translations only.
Components: Render only. Never import services or stores directly.
```

### Derived cache pattern
```
All expensive derived values are cached in their store with a
lastCalculatedAt: string | null timestamp.

null = never calculated (app first launch)
ISO string = when last calculated

Hooks check lastCalculatedAt on every mount:
  If null OR older than 24 hours: recalculate + update store
  If fresh (< 24h): return cached values directly

Event-based invalidation (immediate, ignores time):
  spendStore: new CSV upload, recategorise(), setSelectedMonth()
  portfolioStore: addHolding(), updateHolding(), setBucketOverride()
  insightsStore: per-insight type (see ai-insights.md)

Month caching (Spend screen):
  One month at a time — not all months simultaneously
  Month switch = cache miss = immediate recalculation
  This is intentional for V1 simplicity

Never recalculate derived values inside a component.
Never calculate inline in a hook on every render.
Always use the cached + lastCalculatedAt pattern.
```

### Retail queue rules
```
Layer 2 AI categorisation retry queue:

Per upload batch cap:  20 Layer 2 calls maximum per upload
  Prioritise: shortest/simplest merchant names first
  (complex ref strings like "SEPA REF 9281" won't enrich well)

Daily drain cap:       30 Layer 2 calls per day
  Runs on first app open of each new day
  Processes oldest queued items first (FIFO)

Per transaction retry: 3 attempts maximum (DEC-08)
  After 3 failures: category = 'other', confidence = 0.3
  User can always correct via Layer 3

Budget gate:           ALWAYS check isWithinBudget() before any call
  Over budget: pause entire queue, not just slow it down
  Budget resets at start of each calendar month
```

---

## CSV PARSING RULES — LOCKED (19 March 2026)

### The approach
```
Papa Parse handles mechanical CSV reading — never custom tokeniser.
Smart field detector scores columns — never institution-specific hardcode.
Post-parse confidence scoring — not pre-parse prediction.
Atomic imports — all-or-nothing, never partial state.
```

### Field tier model
```
Tier 1 — BLOCKING (parse fails if any of these missing):
  date, amount, debit/credit direction
  If Tier 1 fields cannot be found: ParseError TIER1_FIELDS_MISSING

Tier 2 — Important, fallbacks available:
  currency (fallback: infer from geography)
  description (fallback: empty string)
  merchant (fallback: description slice)

Tier 3 — Nice to have, always have fallbacks:
  referenceId (fallback: compound dedup key)
  geography (fallback: infer from institution hints)
  isRecurring (fallback: false)
```

### Confidence scoring
```
ParseConfidence is computed AFTER parsing, not before.
It reflects what was actually found, not what we predict.

tier1Complete: boolean   — Tier 1 all found (blocking)
tier2Score: 0–1          — fraction of Tier 2 fields found
tier3Score: 0–1          — fraction of Tier 3 fields found
overallScore: 0–1        — (tier2 × 0.7) + (tier3 × 0.3)

If tier1Complete = false: ParseError (hard fail, always)
If tier1Complete = true:  ParseSuccess regardless of overallScore
  overallScore ≥ 0.8: auto-accept, no warning
  overallScore 0.5–0.8: ParseSuccess + user-facing warnings
  overallScore < 0.5: ParseSuccess + "many fields uncertain"
```

### Atomic import rule
```
Imports are all-or-nothing. No partial state. Ever.

If anything fails mid-import (any row, any field, any error):
  Entire batch is rolled back
  spendStore receives nothing
  auditStore logs status: 'failed'
  User sees clear error + re-upload request

parseCSV() wraps entire body in try/catch.
On any uncaught error: return ParseError ATOMIC_ROLLBACK.
Never return partial results.
```

### Deduplication key hierarchy
```
Priority 1: referenceId (transaction ID from CSV, where present)
  Exact match against existing referenceIds

Priority 2: compound key (where no referenceId)
  key = `${date}|${amount}|${description.slice(0,20).toLowerCase().trim()}`

Priority 3: fuzzy Dice coefficient (Indian banks only)
  For SBI, HDFC, ICICI, AXIS, KOTAK imports:
  Same date + same amount + description similarity > 0.8
  → probableDuplicates[] for USER CONFIRMATION
  → NEVER silently skipped
  User sees ProbableDuplicateSheet and decides per pair

Silent dedup (Priority 1 + 2): automatic, reported in toast count
Fuzzy dedup (Priority 3): always shown to user for confirmation
```

### Supported institutions (24 total)
```
NL:          ABN_AMRO, ING_NL, RABOBANK, BUNQ, SNS_BANK, N26
EU/Digital:  REVOLUT, WISE
Investment:  DEGIRO, IBKR
IN:          HDFC_BANK, HDFC_SECURITIES, ICICI_BANK, SBI,
             AXIS_BANK, KOTAK, ADITYA_BIRLA, ZERODHA, GROWW
UK:          BARCLAYS, HSBC, MONZO
US:          CHASE, SCHWAB
Fallback:    UNKNOWN

Unrecognised format:
  Return ParseError UNRECOGNISED_FORMAT
  Include REQUEST_SUPPORT_URL (Google Form)
  User submits bank name — PM prioritises new parsers from form
```

---

## MERCHANT ENRICHMENT RULES — LOCKED (19 March 2026)

```
Enrichment runs ONLY for Layer 1 misses (confidence = 0.0).
Never called for transactions already matched in Layer 1.
Never blocks the upload UI — always background queue.

Option C (Clearbit) → Option A (Claude API) fallback:

Clearbit rules:
  Send merchant name ONLY
  Zero user context (no user ID, no amount, no date, no account)
  Completely anonymous — "what category is this business?"
  Opt-in only: check Settings enrichment flag before calling
  Privacy policy must disclose before beta

Claude API fallback (when Clearbit misses):
  Same privacy rules as spend categoriser
  Merchant name + 50-char description snippet only
  Never amounts, dates, account info, or any PII

Batch caps (enforced in spendStore, not in service):
  20 enrichment calls per upload
  30 enrichment calls per day
  Budget gate: check isWithinBudget() before every call
```

---

## JOINT ACCOUNT RULES — LOCKED (19 March 2026)

```
Anand and partner have joint accounts at ABN Amro and HDFC.
Joint accounts are a first-class concept, not an edge case.

DataSource.accountType: 'personal' | 'joint' | 'managed'
  Set during DataSourceConfirmSheet (always shown after import)
  "Is this a joint account?" asked for every new DataSource

Transaction.ownership: 'personal' | 'joint' | 'split'
  Joint account imports → ownership: 'joint'
  splitWithProfileId: partner profileId (if exists)
  splitRatio: 0.5 default (user can change)

Household view (activeProfileId = 'household'):
  Joint transactions appear ONCE — never twice
  Deduplication catches same transaction from both exports

Individual view (activeProfileId = specific profile):
  Show personal transactions for that profile
  Show joint transactions for that profile
  Never show partner's personal transactions

Cross-export deduplication for joint accounts:
  Same joint transaction in Anand's export AND partner's export
  Compound key catches exact matches
  Fuzzy match catches format variations between exports
```

---

## AUDIT LOG RULES — LOCKED (19 March 2026)

```
Every CSV import is logged in auditStore at profile level.
The audit log is NEVER wiped except on "delete all data".

ImportAuditEvent logged on every import attempt:
  id, profileId, householdId, timestamp
  institution, transactionCount, duplicatesSkipped
  probableDuplicatesFound, layer2Queued
  parseConfidence (overallScore), status, errorCode?

100-event cap per store. FIFO eviction when over limit.
Failed imports logged with status: 'failed' + errorCode.
Successful imports logged with status: 'success'.

auditStore.clearAuditLog() is ONLY called from:
  "Delete all my data" flow in Settings (Session 16)
  Never called anywhere else.
```

---

## SECURITY PIPELINE RULES — LOCKED (19 March 2026)

```
The security pipeline runs INSIDE csvParser.ts (sanitiseTransaction).
It is NOT a separate post-parse step.
Parse → sanitise → return. Storage happens after.

Raw files NEVER touch disk:
  Read CSV content into memory only
  Pass to parseCSV()
  Security pipeline runs inside parser
  Return sanitised Transaction[] to caller
  Caller (store) persists via storageService
  Raw content discarded — never written anywhere

Sanitisation applied to description AND rawDescription:
  Account numbers → keep last 4 digits (regex: /\b\d{8,}\b/g)
  IBANs → mask (regex: /[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7,}/g)
  BSN → remove entirely (regex: /\bBSN:?\s*\d{8,9}\b/gi)
  PAN → remove entirely (regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g)
  Aadhaar → remove entirely (regex: /\b\d{4}\s\d{4}\s\d{4}\b/g)
```

---

## COMPLIANCE RULES — LOCKED (18 March 2026)

```
Before beta, add to these screens:
  /app/(tabs)/invest.tsx   — footer: "For information only.
                              Not financial advice."
  /app/settings.tsx        — below Education section: same text

FIRE projections (when V2 is built):
  Always label as estimate: "Based on your current inputs"
  Never use guarantee language

Instrument suggestions:
  "Worth exploring" framing is mandatory (already locked)
  No affiliate links — ever (already locked)

Geography-gated instruments:
  All NL-tagged entries in instrumentCatalogue.ts must be
  UCITS-compliant before beta. Verify before first user.
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
Example:  [DL-02] spendCategoriser — three-layer pipeline

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
[NEVER] AsyncStorage used directly (use storageService.ts)
[NEVER] Raw SecureStore calls outside storageService.ts
[NEVER] FIRE UI in V1 (FIRETeaserCard, FIREProgress, fire.tsx)
[NEVER] "Choose not to work" — use financial independence framing
[NEVER] Education content hardcoded in components (use educationCatalogue.ts)
[NEVER] Raw transactions sent to Claude API (aggregated only)
[NEVER] Partial CSV imports — atomic or nothing
[NEVER] Raw CSV files written to disk — parse in memory only
[NEVER] Silent write failures — storage errors always propagate
[NEVER] Services imported directly into components
[NEVER] Derived values recalculated in components or on every hook render
[NEVER] Clearbit sent user ID, amounts, dates, or any user context
[NEVER] Merchant enrichment run on Layer 1 matches (misses only)
[NEVER] Probable duplicates silently skipped (always show to user)
[NEVER] Joint transactions shown twice in household view
[NEVER] auditStore.clearAuditLog() called except in "delete all data"
```

---

*Maintained by: Anand (PM)*
*Last updated: 19 March 2026*
