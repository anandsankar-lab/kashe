# Kāshe — Session 12 Handoff Document
*Session 11 → Session 12*
*Date: 18 March 2026*
*This session has no UI. No screenshots. The spec is the only safety net.*
*Read every word before writing any code.*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + fintech domain expert helping
Anand build Kāshe — a personal finance app for globally mobile
professionals. Anand is a PM with strong product instincts and is a
coding beginner. One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md
2. This file (every section, every decision)
3. engineering-rules.md
4. data-architecture.md
5. CLAUDE-financial.md
6. CLAUDE-identity.md

---

## HOW WE WORK

1. Claude writes the Claude Code prompt in planning chat
2. Anand pastes into Claude Code terminal
3. Terminal output shared back — no UI screenshots this session
4. Claude reviews terminal output + TypeScript errors
5. Claude gives exact git commands
6. Anand runs git commands manually — never through Claude Code
7. Commit confirmed → next ticket

**Key difference this session:** There are no localhost:8081 screenshots.
Verification is:
- `npx tsc --noEmit` returns zero errors after every ticket
- Zero import errors in terminal on app start
- Logic verified by reading the code before committing

Every ticket ends with `npx tsc --noEmit`. Non-negotiable.

---

## WHAT WAS BUILT — SESSION 11

### All four tabs complete ✅
Home, Spend, Portfolio, Invest — all screens, all empty states.

### FIRE removed from all screens ✅
FIREProgress gone from Home. FIRETeaserCard gone from Invest.
Both removed (not commented out). V2 foundation types exist.

### Foundation files built ✅
- /constants/educationCatalogue.ts — 20 articles, 5 geographies
- /constants/fireDefaults.ts — country-specific FIRE engine [V2]
- /types/fire.ts — full FIRE type system [V2]
- /app/settings.tsx — stub with Education section

### What does NOT exist yet (Session 12 builds all of this)
- /services/ — empty
- /store/ — empty
- /hooks/ — only useDataSources.ts exists

---

## WHY THE DATA LAYER MATTERS — PLAIN ENGLISH

Before Session 12: Kāshe is a beautiful prototype.
Every number comes from /constants/mockData.ts.
Nothing is real. Nothing persists. Nothing is private.

After Session 12: Kāshe becomes a real app.
User data is encrypted. CSV uploads are parsed and categorised.
Stores hold real state across sessions. Hooks expose clean data to UI.

Think of it this way:
**Session 12 = building the engine**
**Session 13 = connecting the engine to the dashboard**

Session 13's first task: Anand exports a real ABN Amro CSV,
uploads it, and sees his own transactions categorised in the Spend tab.
That's the moment it stops feeling like a prototype.

---

## ALL PM DECISIONS — LOCKED (18 March 2026)

These were discussed and agreed before this handoff was written.
Do not re-debate. Do not assume alternatives.

### DEC-01: User corrections always beat the rulebook (Layer 3 > Layer 1)
When a user manually corrects a merchant's category, that correction
ALWAYS wins — even if the merchant is in our keyword rulebook.
The user knows their own spending better than any hardcoded list.

**Implementation impact:** In spendCategoriser.ts, check
merchantOverrides FIRST before checking merchantKeywords.
If an override exists, return it immediately and skip all other layers.

### DEC-02: CSV parse failure → re-upload with format guidance
If a CSV cannot be parsed (corrupted file, wrong format,
unrecognised bank), return a structured error with:
- What went wrong (human-readable)
- Which bank formats are supported
- Exactly how to export from each supported bank

Never silently fail on a financial data import.

### DEC-03: AI budget cap → soft banner, not hard paywall
When the monthly Claude API token budget is reached, show a soft
non-blocking banner on the Invest tab:
**"AI insights paused this month."**
Do NOT show a paywall immediately. Do NOT block the app.
Existing cached insights remain visible. New generation pauses.

### DEC-04: Multi-currency → store original + convert on display
Always store BOTH the original currency/amount AND the converted
base currency amount. Never store only the converted amount.

Why: FX rates change over time. If you convert on import and rates
shift, your historical data becomes wrong. Storing originals means
you can always recalculate correctly.

Transaction fields: currencyOriginal, amountOriginal, fxRateApplied,
currency (base), amount (converted at time of import).

### DEC-05: Duplicates → deduplicate + report count
When overlapping CSVs are uploaded from the same account,
deduplicate silently but honestly report the count:
**"✓ 127 transactions imported · 3 duplicates skipped"**

Deduplication key: date + amount + first 20 chars of description
(normalised). Do NOT use transaction ID alone — different banks
format IDs differently and the same transaction may have different IDs
across export files.

### DEC-06: Storage error → clear error screen (never silent)
If expo-secure-store throws an error (device full, hardware issue,
permissions revoked), show a clear, honest error screen.
Do NOT silently continue with in-memory state.

Error copy: *"Kāshe couldn't save your data securely. Please free up
space on your device and try again."*

Data safety is non-negotiable. Never pretend a write succeeded.

### DEC-07: Data staleness → 24-hour refresh
On every app open, check if stored derived data (spendByCategory,
totals, allocations) was last calculated more than 24 hours ago.
If yes: recalculate from raw stored transactions and assets.
If no: use cached derived values from the store directly.

This means the first open of each day is always fresh.
Mid-session tab switching never triggers unnecessary recalculation.

### DEC-08: Layer 2 retry → queue, retry on next day's first open
If Claude API categorisation fails (network down, no API key,
rate limited), mark the transaction as pending and store its ID
in a retry queue in the spendStore.

On the first app open of each new day (same 24-hour check as DEC-07),
retry all pending transactions automatically.

After 3 failed daily retries: mark as 'other', confidence 0.3.
User can always manually correct at any time (Layer 3 — DEC-01).

### DEC-09: PostHog → build disabled, Anand reviews before enabling
Build the full analyticsService.ts with all events implemented.
Wrap every posthog.capture() call with:
```typescript
if (ANALYTICS_ENABLED) { posthog.capture(...) }
```
Set `ANALYTICS_ENABLED = false` in the file.

Anand reviews the exact event list (documented in DL-08 below)
before enabling. Enabling is a one-line change. No rebuild needed.

### DEC-10: ABN Amro is the priority parser
The ABN Amro parser gets the most care and is tested first.
Anand will export a real ABN Amro CSV at the end of Session 12
for the Session 13 first real data test.

---

## SESSION 12 TICKETS

**Build in this exact order. Each ticket depends on the previous.**
DL-01 must be committed before DL-03, DL-05, DL-07, DL-08.
DL-02 must be committed before DL-03.
DL-05 (secureStorageAdapter first) must be committed before DL-06.

---

### DL-01: Storage Service

**What is it?**
The single gatekeeper for all data storage in Kāshe.
Nothing else in the app reads from or writes to storage directly —
everything goes through this service. Think of it as the vault door.

**Why first?**
Every other service and store in this session depends on it.
DL-03, DL-05, DL-07 all import storageService. Build it first.

**What could go wrong without it?**
If any service calls SecureStore directly, storage becomes fragmented
across the codebase. When we need to change storage (e.g. add
encryption layer, switch providers), we'd have to touch every file.
One central service means one change point.

**Install:**
```
npm install expo-secure-store --legacy-peer-deps
```

**File:** /services/storageService.ts

```typescript
import * as SecureStore from 'expo-secure-store'

export const STORAGE_KEYS = {
  AUTH_TOKEN:             'kashe_auth_token',
  USER_PROFILE:           'kashe_user_profile',
  ONBOARDING_COMPLETE:    'kashe_onboarding_complete',
  RISK_PROFILE:           'kashe_risk_profile',
  AI_API_KEY:             'kashe_ai_api_key',
  ACTIVE_PROFILE_ID:      'kashe_active_profile_id',
  LAST_INSIGHT_CHECK:     'kashe_last_insight_check',
  LAST_DERIVE_TIMESTAMP:  'kashe_last_derive_timestamp',
  PENDING_CATEGORISATION: 'kashe_pending_categorisation',
  SPEND_STORE:            'kashe_spend_store',
  PORTFOLIO_STORE:        'kashe_portfolio_store',
  INSIGHTS_STORE:         'kashe_insights_store',
  HOUSEHOLD_STORE:        'kashe_household_store',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

export class StorageError extends Error {
  constructor(
    public operation: 'read' | 'write' | 'delete',
    public key: string,
    public originalError: unknown
  ) {
    super(`Storage ${operation} failed for key: ${key}`)
    this.name = 'StorageError'
  }
}

class StorageService {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key)
    } catch (error) {
      throw new StorageError('read', key, error)
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch (error) {
      // Per DEC-06: write failures are critical — never swallow
      throw new StorageError('write', key, error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (error) {
      throw new StorageError('delete', key, error)
    }
  }

  async clear(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS)
    await Promise.allSettled(keys.map(k => this.delete(k)))
  }
}

// Singleton — import this everywhere, never instantiate directly
export const storageService = new StorageService()
```

**Verification:** `npx tsc --noEmit` — zero errors.
**Commit:** `[DL-01] storageService — expo-secure-store abstraction`

---

### DL-02: Merchant Keywords

**What is it?**
A geography-aware lookup table: merchant name → spend category.
This is the instant-answer layer of the categorisation pipeline.
No API call. No network. Runs in milliseconds.

**Why geography matters:**
"Shell" in the Netherlands = petrol (transport).
"Shell" in India = potentially a hotel.
Geography tags prevent mis-categorisation across markets.

**Why this is the only file allowed to contain brand names:**
Every other Kāshe file uses neutral, geography-agnostic language.
This file is the explicit exception — brand names ARE the point.

**File:** /constants/merchantKeywords.ts

Implement the full map with at minimum:
- NL: albert heijn, jumbo, lidl, aldi, ns, gvb, ret, connexxion,
  thuisbezorgd, tikkie, belastingdienst, ziggo, kpn, coolblue,
  bol com, action, kruidvat, hema, apotheek, eneco, vattenfall
- IN: swiggy, zomato, bigbasket, blinkit, zepto, irctc, ola, rapido,
  zerodha, groww, kuvera, phonepe, gpay, paytm, flipkart, myntra,
  amazon in, jio, airtel
- GB: tesco, sainsburys, waitrose, asda, morrisons, deliveroo,
  just eat, tfl, national rail, trainline, bt group, boots, superdrug
- US: whole foods, trader joes, kroger, target, walmart, cvs,
  walgreens, lyft, doordash, grubhub, verizon, att
- GLOBAL: uber, netflix, spotify, apple, google, microsoft, amazon,
  airbnb, booking com, revolut, wise, paypal, h m, zara, ikea,
  starbucks, mcdonalds

Also export:
```typescript
// Strips punctuation, legal suffixes, takes first 3 words, lowercase
export function normaliseMerchant(raw: string): string

// Returns matching entry or null
export function lookupMerchant(
  merchantNorm: string,
  geography: 'NL' | 'IN' | 'GB' | 'US' | 'GLOBAL'
): MerchantKeywordEntry | null
```

**Verification:** `npx tsc --noEmit` — zero errors.
**Commit:** `[DL-02] merchantKeywords — geography-aware keyword map`

---

### DL-03: Spend Categoriser

**What is it?**
The brain behind every transaction category. Receives a raw
transaction description and returns a category + confidence score.

**The three layers — in plain English:**

*Layer 3 (checked FIRST per DEC-01):*
Has the user ever manually corrected this merchant before?
If yes → use that category. Always. No debate.

*Layer 1 (checked SECOND):*
Is this merchant in our keyword map (DL-02)?
If yes → return that category instantly. No API call.

*Layer 2 (checked LAST, only if Layers 3 and 1 both miss):*
Ask Claude API to categorise the merchant.
Send only: normalised merchant name + 50-char description snippet.
Never send amounts, dates, account numbers, or any PII.
If the API call fails → queue for retry next day (DEC-08).

**What could go wrong without careful implementation?**
- If Layer 3 isn't checked first, user corrections get silently overridden
  by the keyword map — breaking DEC-01 and user trust.
- If Layer 2 sends raw transaction data, we have a privacy violation.
- If Layer 2 failures aren't queued, transactions are stuck as 'other' forever.

**File:** /services/spendCategoriser.ts

```typescript
import { SpendCategory } from '../types/spend'
import { normaliseMerchant, lookupMerchant } from '../constants/merchantKeywords'
import { storageService, STORAGE_KEYS } from './storageService'

export interface MerchantOverride {
  merchantNorm: string
  category: SpendCategory
  correctionCount: number
  lastCorrectedAt: Date
}

export interface CategorisedResult {
  category: SpendCategory
  confidence: number       // 1.0 | 0.8 | 0.3
  layer: 1 | 2 | 3
  merchantNorm: string
  pendingRetry: boolean    // true if Layer 2 failed, queued for DEC-08
}

// LAYER 3: User corrections (ALWAYS first — DEC-01)
function applyMerchantOverrides(
  merchantNorm: string,
  overrides: MerchantOverride[]
): SpendCategory | null {
  return overrides.find(o => o.merchantNorm === merchantNorm)?.category ?? null
}

// LAYER 1: Keyword rulebook
function runLayer1(
  merchantNorm: string,
  geography: 'NL' | 'IN' | 'GB' | 'US' | 'GLOBAL'
): SpendCategory | null {
  return lookupMerchant(merchantNorm, geography)?.category ?? null
}

// LAYER 2: Claude API — privacy rules enforced here
// Only called when Layers 3 and 1 both return null
// Never sends amounts, dates, account info
async function runLayer2(
  merchantNorm: string,
  descriptionSnippet: string
): Promise<SpendCategory | null> {
  try {
    const apiKey = await storageService.get(STORAGE_KEYS.AI_API_KEY)
    if (!apiKey) return null  // No key → queue for DEC-08 retry

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 20,
        messages: [{
          role: 'user',
          content: `Categorise this merchant for a personal finance app.
Merchant: "${merchantNorm}"
Snippet: "${descriptionSnippet.slice(0, 50)}"
Reply with exactly one word from:
housing groceries eating_out transport family health personal_care
subscriptions utilities shopping travel education insurance
gifts_giving investment_transfer transfer income other`
        }]
      })
    })
    const data = await response.json()
    const raw = data.content?.[0]?.text?.trim().toLowerCase() as SpendCategory
    const VALID: SpendCategory[] = [
      'housing','groceries','eating_out','transport','family','health',
      'personal_care','subscriptions','utilities','shopping','travel',
      'education','insurance','gifts_giving','investment_transfer',
      'transfer','income','other'
    ]
    return VALID.includes(raw) ? raw : null
  } catch {
    return null  // Network failure → pendingRetry: true
  }
}

// MAIN FUNCTION — Layer 3 → Layer 1 → Layer 2
export async function categorise(
  description: string,
  geography: 'NL' | 'IN' | 'GB' | 'US' | 'GLOBAL',
  overrides: MerchantOverride[]
): Promise<CategorisedResult> {
  const merchantNorm = normaliseMerchant(description)

  // Layer 3 FIRST — DEC-01
  const l3 = applyMerchantOverrides(merchantNorm, overrides)
  if (l3) return { category: l3, confidence: 1.0, layer: 3,
                   merchantNorm, pendingRetry: false }

  // Layer 1 SECOND
  const l1 = runLayer1(merchantNorm, geography)
  if (l1) return { category: l1, confidence: 1.0, layer: 1,
                   merchantNorm, pendingRetry: false }

  // Layer 2 LAST — API call
  const l2 = await runLayer2(merchantNorm, description)
  if (l2) return { category: l2, confidence: 0.8, layer: 2,
                   merchantNorm, pendingRetry: false }

  // Layer 2 failed — queue for next day (DEC-08)
  return { category: 'other', confidence: 0.3, layer: 2,
           merchantNorm, pendingRetry: true }
}

// Returns true when merchant has 5+ corrections
// Signals PM review to promote to Layer 1 keyword map
export function shouldPromoteToLayer1(
  merchantNorm: string,
  overrides: MerchantOverride[]
): boolean {
  return (overrides.find(o => o.merchantNorm === merchantNorm)
    ?.correctionCount ?? 0) >= 5
}
```

**Verification:** `npx tsc --noEmit` — zero errors.
**Commit:** `[DL-03] spendCategoriser — Layer 3 wins, Layer 2 retry queue`

---

### DL-04: CSV Parser

**What is it?**
The file reader. When a user uploads a bank statement, this service
detects which bank it came from, reads the transactions, strips
sensitive data, deduplicates against existing transactions, and
returns clean, safe transaction objects ready for storage.

**What makes this fintech-grade:**
- Raw file never touches disk — parsed in memory, then discarded
- Security pipeline strips BSN, PAN, Aadhaar, account numbers
- Duplicate detection is honest (DEC-05)
- Multi-currency stored correctly (DEC-04)
- Failures return structured errors, not crashes (DEC-02)

**Priority order for parsers (per DEC-10):**
ABN Amro first. Get it right. Then ING, Revolut, HDFC, ICICI, Monzo.

**File:** /services/csvParser.ts

Core interfaces:
```typescript
export type SupportedInstitution =
  'ABN_AMRO' | 'ING' | 'REVOLUT' | 'HDFC' | 'ICICI' | 'MONZO' | 'GENERIC'

export interface ParseResult {
  transactions: Transaction[]
  institution: SupportedInstitution
  confidence: number           // 0.0–1.0
  mappingRequired: boolean     // true if 0.60–0.85 — show confirmation UI
  duplicatesSkipped: number    // DEC-05
  toastMessages: string[]      // shown post-upload in this order:
                               // "✓ X transactions imported · Y duplicates skipped"
                               // "✓ Account numbers masked"
                               // "✓ Raw file discarded"
                               // "✓ Data stored securely on your device"
  error: ParseError | null
}

export interface ParseError {
  code: 'UNSUPPORTED_FORMAT' | 'CORRUPTED_FILE' | 'EMPTY_FILE' | 'PARSE_FAILED'
  message: string              // human-readable, shown to user
  supportedFormats: string[]   // ['ABN Amro', 'ING', 'Revolut', ...]
  suggestion: string           // actionable: "Export a CSV (not Excel) from..."
}
```

Security pipeline (runs on every raw row before it becomes a Transaction):
```typescript
function sanitiseRow(raw: Record<string, string>): void {
  Object.keys(raw).forEach(key => {
    // Account numbers (8+ consecutive digits) → last 4
    raw[key] = raw[key].replace(/\b\d{8,}\b/g,
      match => '****' + match.slice(-4))
    // IBANs → last 4
    raw[key] = raw[key].replace(
      /[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7,}/g,
      match => '****' + match.slice(-4))
    // Dutch BSN (9 digits) → remove
    raw[key] = raw[key].replace(/\b\d{9}\b/g, '[REMOVED]')
    // Indian PAN (AAAAA9999A) → remove
    raw[key] = raw[key].replace(/[A-Z]{5}\d{4}[A-Z]/g, '[REMOVED]')
    // Aadhaar (12 digits, optional spaces) → remove
    raw[key] = raw[key].replace(/\d{4}\s?\d{4}\s?\d{4}/g, '[REMOVED]')
  })
}
```

Deduplication (DEC-05):
```typescript
// Key: date + amount + first 20 chars of description
function dedupKey(t: Transaction): string {
  return [
    t.date.toISOString().slice(0, 10),
    t.amount.toFixed(2),
    t.description.slice(0, 20).toLowerCase().trim()
  ].join('|')
}

export function deduplicateTransactions(
  incoming: Transaction[],
  existing: Transaction[]
): { unique: Transaction[], duplicatesSkipped: number }
```

Institution detection:
```
ABN Amro:  headers contain "tegenrekening" + "mutatiesoort" → confidence 0.95
ING:       headers contain "tegenrekening" + "mededelingen" → confidence 0.92
Revolut:   headers contain "started date" + "completed date" → confidence 0.95
HDFC:      headers contain "narration" + "chq" → confidence 0.90
ICICI:     headers contain "narration" + "tran id" → confidence 0.88
Monzo:     headers contain "transaction id" + "emoji" → confidence 0.93
Generic:   nothing matches → confidence 0.40
```

Confidence thresholds:
```
>0.85  → parse silently, no user confirmation needed
0.60–0.85 → show mapping confirmation: "We detected ABN Amro. Is this right?"
<0.60  → return UNSUPPORTED_FORMAT error per DEC-02
```

ABN Amro format specifics:
- Delimiter: semicolon
- Date column: YYYYMMDD (col 0)
- Description: col 1 (Naam/Omschrijving)
- Debit/Credit flag: col 5 ("Af" = debit, "Bij" = credit)
- Amount: col 6 (comma as decimal separator → replace with dot)
- Currency: always EUR

**Verification:** `npx tsc --noEmit` — zero errors.
**Commit:** `[DL-04] csvParser — ABN Amro priority, security pipeline, dedup`

---

### DL-05: Zustand Stores + Secure Storage Adapter

**What is it?**
The in-memory state the app reads while it's open.
Zustand stores hold all user data in memory during a session.
The secure storage adapter persists that data to expo-secure-store
when anything changes.

**The adapter is the bridge.**
Zustand's persist() middleware normally uses AsyncStorage.
We never use AsyncStorage directly. The adapter intercepts
Zustand's storage calls and routes them through storageService.

**Build the adapter first — the stores depend on it.**

**Files:**
```
/store/secureStorageAdapter.ts  ← build first
/store/spendStore.ts
/store/portfolioStore.ts
/store/insightsStore.ts
/store/householdStore.ts
```

**Install:**
```
npm install zustand --legacy-peer-deps
```

**secureStorageAdapter.ts:**
```typescript
import { StateStorage } from 'zustand/middleware'
import { storageService } from '../services/storageService'

export const secureStorageAdapter: StateStorage = {
  getItem: async (name) => {
    try { return await storageService.get(name) }
    catch { return null }  // Read failure: store starts fresh
  },
  setItem: async (name, value) => {
    // Write failure is critical per DEC-06 — let it propagate
    await storageService.set(name, value)
  },
  removeItem: async (name) => {
    try { await storageService.delete(name) }
    catch { }  // Delete failure: non-critical
  },
}
```

**spendStore.ts** — owns all transaction, budget, and override state:

Key actions:
- `addTransactions(txns)` — append new transactions
- `setBudget(budget)` — upsert budget by id
- `recategorise(txnId, category, merchantNorm)` — per DEC-01:
  saves override AND re-applies to all transactions from same merchant
- `addPendingCategorisation(txnId)` — DEC-08 retry queue
- `clearPendingCategorisation(txnId)` — after successful retry
- `setLastDerivedAt(date)` — DEC-07 staleness tracking
- `addDataSource(ds)` — upsert data source by id

Also stores: `pendingCategorisation: string[]` (IDs awaiting retry)

**portfolioStore.ts** — owns holdings, liabilities, bucket overrides:

Key actions:
- `addHolding(holding)` — upsert by id
- `updateHoldingPrice(holdingId, price)` — updates currentPrice + lastPriceUpdate
- `setBucketOverride(override)` — upsert bucket reassignment
- `setProtection(holdingId)` — designates protection holding
- `setLastDerivedAt(date)` — DEC-07 staleness tracking

**insightsStore.ts** — owns insight state and AI usage tracking:

Owns: activeInsight, monthlyReviews (last 12), aiUsage record
aiUsage tracks: inputTokensThisMonth, outputTokensThisMonth,
resetDate (first of month), tier ('free' | 'paid')
Used by DL-07 for the hard budget cap check (DEC-03)

**householdStore.ts** — owns profiles and auth state:

Owns: household, profiles, activeProfileId, isAuthenticated
All other stores filter their data by activeProfileId

**All stores use the same persist pattern:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../services/storageService'
import { secureStorageAdapter } from './secureStorageAdapter'

export const useXxxStore = create<XxxStore>()(
  persist(
    (set, get) => ({ /* state + actions */ }),
    { name: STORAGE_KEYS.XXX_STORE, storage: secureStorageAdapter }
  )
)
```

**Verification:** `npx tsc --noEmit` — zero errors.
**Commit:** `[DL-05] stores — spend, portfolio, insights, household + adapter`

---

### DL-06: Hooks

**What is it?**
The clean interface between stores and UI components.
Components never import stores directly — ever.
They call a hook and get back exactly what they need.

Think of hooks as the query layer: stores are the raw database,
hooks are the queries that turn raw data into display-ready values.

**The 24-hour staleness check lives here (DEC-07).**
On mount, each hook checks if lastDerivedAt is >24 hours ago.
If stale: trigger recalculation, update lastDerivedAt.
If fresh: return cached derived values directly.

**Files:**
```
/hooks/useSpend.ts
/hooks/usePortfolio.ts
/hooks/useInsights.ts
/hooks/useHousehold.ts
/hooks/useInstrumentCatalogue.ts
```

Match the return types in data-architecture.md exactly.

**useSpend() key implementation notes:**
- Filter transactions to activeProfileId + selectedMonth
- Exclude 'investment_transfer' and 'transfer' from totalSpend
- hasMinimumHistory: true when ≥2 distinct calendar months of data
- comparisonVsLastMonth: percentage, can be negative (underspent)
- On mount: check lastDerivedAt — if >24h, recalculate + update

**usePortfolio() key implementation notes:**
- Apply bucketOverrides when computing allocationByBucket
- protectionMonthsCovered = protectionAsset.currentValue / monthlySpend
  where monthlySpend comes from useSpend() totalSpend
- financialPosition = liveTotal + lockedTotal - sum(liabilities)

**useInsights() key implementation notes:**
- reviewState derives from currentMonthReview + transaction count:
  'unavailable': no data at all
  'insufficient': <3 months data
  'ready_unread': review exists, viewed=false
  'ready_read': review exists, viewed=true
- isOverBudget: true if any category exceeds 90% of its budget

**useInstrumentCatalogue() key implementation notes:**
- V1: reads from /constants/instrumentCatalogue.ts directly
- getSuggestions() filters by: riskProfile bucket targets,
  user tier (derived from holdings), geography, role='suggest'
- V2: replace the import with Supabase call — zero component changes
  This is exactly why the hook exists as a boundary layer.

**Verification:** `npx tsc --noEmit` — zero errors.
**Commit:** `[DL-06] hooks — useSpend, usePortfolio, useInsights,
           useHousehold, useInstrumentCatalogue`

---

### DL-07: AI Insight Service

**What is it?**
The engine that generates the smart commentary in Monthly Reviews
and insight cards. Calls Claude API with aggregated (never raw)
data and returns structured Insight and MonthlyReview objects.

**Why privacy rules matter here more than anywhere else:**
We never send real amounts or merchant names to the API.
We send category totals and percentage ranges only.
A request interceptor would see "eating_out 34% above average"
— not "€847 at Vapiano and Deliveroo last month."

**The budget cap is hard (DEC-03):**
When the monthly token limit is reached, insight generation stops.
The soft banner appears. No silent failure. No infinite loop.

**File:** /services/aiInsightService.ts

What gets sent to Claude (never raw data):
```typescript
interface SpendSummaryForAI {
  totalSpendRange: 'under_2k' | '2k_5k' | 'over_5k'  // range, not exact
  byCategory: Record<SpendCategory, number>            // category totals OK
  comparisonVsLastMonth: number                        // percentage only
  anomalies: string[]                                  // "eating_out 34% above avg"
  monthYear: string
}

interface PortfolioSummaryForAI {
  allocationByBucket: Record<string, number>           // percentages only
  totalPositionRange: 'under_100k' | '100k_500k' | 'over_500k'
  riskProfile: RiskProfileType
  underfundedBuckets: string[]
  savingsRate: number
}
```

Budget cap check:
```typescript
const FREE_MONTHLY_LIMIT  = 10_000   // input tokens
const PAID_MONTHLY_LIMIT  = 100_000

function isWithinBudget(aiUsage: AIUsageRecord): boolean {
  const limit = aiUsage.tier === 'paid'
    ? PAID_MONTHLY_LIMIT
    : FREE_MONTHLY_LIMIT
  return aiUsage.inputTokensThisMonth < limit * 0.90  // 90% threshold
}
```

Insight priority order (generate only the highest priority):
1. MARKET_EVENT_ALERT
2. PORTFOLIO_HEALTH
3. INVESTMENT_OPPORTUNITY
(FIRE_TRAJECTORY is V2 — skip in V1)

Model: claude-haiku-4-5-20251001 — cost-optimised
Max tokens per call: 500 (insights), 800 (monthly review)
Cache duration: 24 hours (insights), 30 days (monthly reviews)
API key source: `storageService.get(STORAGE_KEYS.AI_API_KEY)`

**Verification:** `npx tsc --noEmit` — zero errors.
**Commit:** `[DL-07] aiInsightService — budget cap, privacy rules, caching`

---

### DL-08: Analytics Service

**What is it?**
Tracks anonymised user interactions so the app's learning loops
actually learn. Zero PII. No amounts. No merchant names.
Category strings and interaction types only.

**Built disabled per DEC-09.**
`ANALYTICS_ENABLED = false` in the file.
Nothing fires until Anand reviews the exact event list below
and confirms it's acceptable. Enabling is one line change.

**The exact events Anand will review before enabling:**

```typescript
// LOOP 2 — Spend accuracy (helps improve keyword map)
'category_correction' {
  from_category: SpendCategory,
  to_category: SpendCategory,
  merchant_type: 'known' | 'unknown',  // was it in Layer 1?
  correction_count: number              // how many times corrected total
}

// LOOP 3 — AI insight quality (helps improve prompts)
'insight_viewed'     { insight_type: InsightType }
'insight_actioned'   { insight_type: InsightType }
'insight_dismissed'  { insight_type: InsightType, time_visible_ms: number }

// LOOP 4 — Discovery signal (editorial, not algorithmic)
'instrument_tapped'  { bucket: string, risk_tier: string }
'instrument_added'   { bucket: string, risk_tier: string }
'instrument_skipped' { bucket: string, position: number }

// GENERAL
'csv_uploaded'       { institution: SupportedInstitution, count: number }
'screen_viewed'      { screen: string }
'risk_profile_set'   { profile: RiskProfileType }
```

Anonymous distinct_id: UUID generated on first launch, stored via
storageService. Never tied to email, name, or Google account.

**Install:**
```
npm install posthog-react-native --legacy-peer-deps
```

**File:** /services/analyticsService.ts

```typescript
// FLIP THIS TO true AFTER ANAND REVIEWS THE EVENT LIST ABOVE
const ANALYTICS_ENABLED = false

// All capture calls wrapped:
// if (ANALYTICS_ENABLED) { posthog.capture('event_name', { ... }) }
```

**Verification:** `npx tsc --noEmit` — zero errors.
**Commit:** `[DL-08] analyticsService — PostHog disabled, pending review`

---

## END-OF-SESSION VERIFICATION

Run all of these before pushing Session 12 commits:

```bash
# 1. TypeScript — must be zero errors
npx tsc --noEmit

# 2. No direct AsyncStorage imports anywhere
grep -r "AsyncStorage" --include="*.ts" --include="*.tsx" .
# Must return zero results

# 3. No raw SecureStore calls outside storageService
grep -r "SecureStore" --include="*.ts" --include="*.tsx" .
# Must only appear in services/storageService.ts

# 4. Confirm ANALYTICS_ENABLED is false
grep -n "ANALYTICS_ENABLED" services/analyticsService.ts
# Must show: const ANALYTICS_ENABLED = false

# 5. Confirm file tree is complete
ls services/ store/ hooks/
# All expected files present
```

All five must pass before pushing.

---

## WHAT SESSION 13 DOES WITH THIS

Session 13 wires the engine to the dashboard.
Every mock data import in every component gets replaced with
a real hook call, one component at a time.

**Session 13 first task:**
Anand exports a real ABN Amro CSV. Uploads it through the app.
csvParser runs. Security pipeline runs. Categoriser runs.
127 (or however many) real transactions appear in the Spend tab.

That is the moment Kāshe stops being a prototype.

**Session 13 wiring order:**
1. useSpend() → spend.tsx (replace MOCK_TRANSACTIONS)
2. usePortfolio() → portfolio.tsx (replace MOCK_HOLDINGS)
3. CSV upload flow → AppHeader [+] button → csvParser
4. useInsights() → MonthlyReviewCard
5. useInstrumentCatalogue() → InstrumentDiscoverySection
6. householdStore → RiskProfileCard save
7. First real ABN Amro CSV upload and verification

---

## LOCKED DECISIONS — QUICK REFERENCE TABLE

| Decision | Question | Answer |
|---|---|---|
| DEC-01 | Layer 3 vs Layer 1 conflict | Layer 3 always wins |
| DEC-02 | CSV parse failure | Re-upload with format guidance |
| DEC-03 | AI budget cap hit | Soft banner, insights pause |
| DEC-04 | Multi-currency storage | Store original + convert on display |
| DEC-05 | Duplicate detection | Deduplicate + report count in toast |
| DEC-06 | Storage error | Clear error screen — never silent |
| DEC-07 | Data staleness | Re-derive if older than 24 hours |
| DEC-08 | Layer 2 retry | Queue, retry on next day's first open |
| DEC-09 | PostHog | Build disabled, Anand reviews before enabling |
| DEC-10 | Priority test bank | ABN Amro |

---

## KNOWN BUG REGISTRY (carried forward)

### 🔴 Fix before beta
1. Hero number wrapping in PortfolioTotalsCard — Session 16
2. GROWTH total may be inflated — verify in Session 13
3. Dutch brand names in Spend mock data — replaced in Session 13
4. "For information only. Not financial advice." disclaimer missing

### 🟡 Polish — Session 16
5. Chart spike at end of 1M view
6. KasheAsterisk k-stroke prominence
7. Vertical MacronRule in TotalsCard
8. TextInput monthly target not currency-formatted
9. Category detail screen gap

### 🟢 Deferred by design
10. Dark mode device verification — Session 17
11. react-native-reanimated — Session 17
12. Settings route wiring — Session 16
13. FIRE planner — V2

---

## QUICK REFERENCE

Repo: github.com/anandsankar-lab/kashe
Local: ~/Documents/kashe
Preview: npx expo start → w → localhost:8081
TypeScript check: npx tsc --noEmit
Node: v25.6.1

Key reference files for Session 12:
  data-architecture.md      — store interfaces, hook return types
  CLAUDE-financial.md       — spend categories, AI prompt rules
  CLAUDE-identity.md        — security pipeline, encryption model
  engineering-rules.md      — storage rules, what never gets built
  types/spend.ts            — Transaction, Budget, DataSource
  types/portfolio.ts        — PortfolioHolding
  types/riskProfile.ts      — RiskProfileType
