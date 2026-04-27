# Kāshe — CLAUDE-identity.md
*Team Member 1: Identity & Trust*
*Read CLAUDE.md first, then this file.*
*Last updated: 25 March 2026 — Session 13 complete.*
*Security pipeline location updated: now in /services/ingestion/securityPipeline.ts*
*secureStorageAdapter: web localStorage fallback added Session 13.*

---

## Your Role
You own everything to do with who the user is, how they're
authenticated, and whether their data is safe.
You do NOT touch UI screens. You do NOT write financial logic.
You produce services, stores, and type definitions only.

---

## Your Domain
```
Authentication    Google OAuth via expo-auth-session
Profiles          OWNER / PARTNER / MANAGED types
Household model   Aggregation of profiles + view switching
Secure storage    expo-secure-store via storageService.ts
Security pipeline CSV + salary slip sanitisation before any storage
Biometric lock    Face ID / fingerprint + PIN fallback
Session management Auto-lock after 5 min background
```

---

## Profile & Household Model
```typescript
type ProfileType = 'OWNER' | 'PARTNER' | 'MANAGED'

interface Profile {
  id: string
  householdId: string
  name: string
  type: ProfileType
  googleAuthId: string | null  // null for MANAGED profiles
  baseCountry: string          // ISO 3166-1 alpha-2
  baseCurrency: string         // ISO 4217
  age: number | null           // captured in onboarding screen 4
                               // null if user skipped
                               // reserved for V2 FIRE engine only
  createdAt: Date
}

interface Household {
  id: string
  name: string
  baseCurrency: string
  createdBy: string            // Profile id of OWNER
  profiles: Profile[]
}

type AssetOwner = 'household' | string  // string = profile id
```

### Profile Types — Important Nuance
```
OWNER
  The person who created the household.
  Full access to everything.
  Can add, edit, and remove other profiles.

PARTNER
  Another adult with their own Google login.
  Full access. Manages their own assets.
  [V2] — requires couple sync via Supabase.
  Do not build in V1.

MANAGED
  No Google login. No app access.
  Administered entirely by OWNER.
  Primary use case: A globally mobile professional
  tracks their parents' investments in their home country.
  Parents don't use the app — their child manages
  their portfolio on their behalf.
  This is a common, real use case. Build it well.
```

### Age Field — Rules
```
Captured: Onboarding screen 4 (between Location and Teach)
Optional: User can skip — age field = null
Storage:  Stored in encrypted Profile record
Usage:    Reserved for V2 FIRE engine only
          NOT used for any V1 logic or calculations
Edit:     User can update age in Settings → Profile (Session 16)
```

---

## Security Pipeline — LOCKED (updated 25 March 2026)

```
ARCHITECTURE UPDATE (Session 13):
The security pipeline now lives in:
  /services/ingestion/securityPipeline.ts

It runs as part of ingestFile() — called by:
  transactionParser.ts → sanitiseTransaction() per row
  holdingsParser.ts → sanitiseHolding() per row

The caller (spendStore.addTransactions or portfolioStore.addHoldings)
receives only sanitised data. Raw file content is discarded
from memory after ingestFile() returns.

THERE IS NO SEPARATE securityPipeline.ts AT /services/ LEVEL.
The security pipeline is internal to /services/ingestion/.

RAW FILE RULES:
  File content read into memory only — never written to disk
  After ingestFile() returns: raw content discarded
  Store receives only sanitised SpendTransaction[] or PortfolioHolding[]
  Raw file is GONE before any persistence happens

SANITISATION RULES (applied to description AND rawDescription):
  Account numbers → keep last 4 digits
    Regex: /\b\d{8,}\b/g → '····' + match.slice(-4)
  IBANs → mask completely
    Regex: /[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7,}/g → '····' + last4
  BSN → remove entirely
    Regex: /\bBSN:?\s*\d{8,9}\b/gi → ''
  PAN → remove entirely
    Regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g → ''
  Aadhaar → remove entirely
    Regex: /\b\d{4}\s\d{4}\s\d{4}\b/g → ''
  Full name in transaction refs → partial mask (keep first name only)
  Only retain: date, amount, sanitised description,
               merchantNorm, category, debit/credit flag

SALARY SLIP PIPELINE (same rules, different fields):
  Parsed by salary slip parser (Session 14+)
  Same sanitisation applied to text fields
  BSN / PAN / Aadhaar → remove entirely
  Full name → remove entirely (only employer name retained)
  Only retain: gross, net, pension contribution,
               EPF contribution, pay period, employer name
  Raw file: never persisted, discarded immediately
```

---

## Encryption Model
```
Storage layer: expo-secure-store (native) / localStorage (web preview)

Web preview (development only):
  secureStorageAdapter uses localStorage as fallback
  localStorage is NOT encrypted — acceptable for dev/preview only
  Never ship to production web without proper encryption
  Warning log added when Platform.OS === 'web' and not __DEV__

Native (iOS + Android):
  expo-secure-store — hardware-backed encryption
  iOS Keychain / Android Keystore
  Protection level: same as banking apps

V1 encryption:
  Hardware-backed OS encryption via expo-secure-store
  All code uses storageService.ts — adapter handles platform difference

V2 encryption (when Supabase backend added):
  Key = hash(Google OAuth token + device-specific ID)
  End-to-end encryption before data leaves device
  On logout: Invalidate key → stored data becomes unreadable
  Row Level Security on all Supabase tables
  Field-level encryption for sensitive columns via KMS

Rules (non-negotiable in both V1 and V2):
  Never store the key in plaintext — ever
  Never log the key or any derived value
  Never include the key in error messages or analytics
  Never expose the key to any component or hook
```

---

## Post-Upload Confirmation Toast
After every successful import, show this toast (always):
```
For spend imports:
  "✓ X transactions imported"
  "✓ Account numbers masked"
  "✓ Raw file discarded"
  "✓ Data stored securely on your device"

For portfolio imports:
  "✓ X holdings imported"
  "⚠ Y holdings need categorisation"  (only if pendingHoldings > 0)
  "✓ Account numbers masked"
  "✓ Raw file discarded"
  "✓ Data stored securely on your device"

For salary slip uploads:
  "✓ Salary data imported"
  "✓ Personal identifiers removed"
  "✓ Raw file discarded"
  "✓ Data stored securely on your device"
```
Show it every time — never suppress it. Builds user trust.

---

## Biometric Lock
```
On app launch:   Check if onboardingComplete + user logged in
                 If yes → show biometric prompt
                 Face ID (iOS) / Fingerprint (Android)
                 Fallback: 6-digit PIN

Auto-lock:       After 5 minutes in background
                 User returns → biometric prompt again

Settings:        User can disable biometric (PIN only)
                 User can change PIN

Implementation:  expo-local-authentication
                 Store PIN hash via storageService (never plaintext)
```

---

## Onboarding Completion Flag
```typescript
interface OnboardingState {
  complete: boolean
  completedAt: Date | null
  skipped: boolean           // user skipped upload — show ghost state
  ageSkipped: boolean        // user skipped age screen (screen 4)
}

// On app launch:
// complete = false → load onboarding stack (10 screens)
// complete = true  → load main app (tabs)

// Onboarding screens (10 total):
// 1. Welcome         2. Household       3. Location
// 4. Age (skippable) 5. Teach [+]       6. First Add
// 7. First Payoff    8. Budget Suggest  9. Portfolio Teaser
// 10. Complete
```

---

## GDPR / Data Deletion — LOCKED (19 March 2026)
```
V1 data deletion: "Delete all my data" in Settings (Session 16)
  Calls storageService.clear() — wipes all STORAGE_KEYS
  Calls auditStore.clearAuditLog()
  Signs user out (clears auth state from householdStore)
  Navigates to onboarding / welcome screen

User has the right to erasure.
This must be a clearly labelled option in Settings.
Deletion is complete and irreversible — all local data gone.

V2 (when Supabase backend added):
  Also deletes all server-side data
  Supabase row deletion + key invalidation
  Confirmation email to user
```

---

## Beta API Key Model — LOCKED (19 March 2026)
```
V1 beta: BYOK (Bring Your Own Key)
  PM (Anand) provides one API key per beta tester
  One key per person — not one shared key
  PM funds beta API costs (target: €50 total)
  Keys entered by user in Settings → AI Features → API Key
  Stored via storageService (STORAGE_KEYS.AI_API_KEY)
  Never in app bundle. Never in source code. Never in GitHub.

V1b (after beta, when backend added):
  API key moves to Supabase Edge Functions
  Users no longer need to manage their own key
  One-line change in aiInsightService.ts
```

---

## What You Must NOT Build
```
[NOT YOURS] Any UI component or screen layout
[NOT YOURS] CSV/file parsing logic (lives in /services/ingestion/)
[NOT YOURS] Salary slip parsing logic
[NOT YOURS] Financial calculations of any kind
[NOT YOURS] FIRE calculations (V2)
[NOT YOURS] Price refresh or API calls
[V2]        Couple sync (Supabase E2E encryption)
[V2]        Partner invitation flow
[V2]        QR code device pairing
[V2]        FIRE engine integration
```

---

## Your Output Files
```
/types/profile.ts              ⬜ Profile + Household interfaces

/store/householdStore.ts       ✅ Session 12 + Session 13
                               Profiles + auth state (Zustand)
                               financialProfile field (DL-09)
                               Uses secureStorageAdapter for persistence

/services/auth.ts              ⬜ Google OAuth flow (Session 14)

/services/storageService.ts    ✅ Session 12
                               expo-secure-store abstraction
                               Single storage interface — vault door

/services/secureStorageAdapter.ts  ✅ Session 12 + Session 13
                               Lives in /services/ (not /store/)
                               Zustand bridge using createJSONStorage()
                               Web: localStorage fallback (Session 13)
                               Native: expo-secure-store (unchanged)
                               Separate file from storageService

/hooks/useHousehold.ts         ✅ Session 12
                               Profile data for UI consumption
```
