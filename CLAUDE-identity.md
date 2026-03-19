# Kāshe — CLAUDE-identity.md
*Team Member 1: Identity & Trust*
*Read CLAUDE.md first, then this file.*
*Last updated: 19 March 2026 — Session 12 complete.
Security pipeline clarified: sanitisation runs INSIDE csvParser,
not as a separate post-parse step.
secureStorageAdapter location corrected: /services/ not /store/.
Output files updated to reflect what is built.*

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
                               // reserved for V2 FIRE engine
                               // not used for any V1 calculations
  createdAt: Date
}

interface Household {
  id: string
  name: string
  baseCurrency: string         // display currency for household view
  createdBy: string            // Profile id of OWNER
  profiles: Profile[]
}

// Every asset and transaction has an owner field
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
  Primary use case: An Indian professional in Amsterdam
  tracks their parents' investments in India.
  Parents don't use the app — their son/daughter manages
  their Zerodha + LIC + PPF on their behalf.
  This is a common, real use case. Build it well.

  V2 note: MANAGED profiles will have their own FIRE
  projection in Individual mode. Their age field is set
  by the OWNER when creating the profile. This is V2 only.
```

### Age Field — Rules
```
Captured: Onboarding screen 4 (between Location and Teach)
Optional: User can skip — age field = null
Storage:  Stored in encrypted Profile record
Usage:    Reserved for V2 FIRE engine only
          NOT used for any V1 logic or calculations
          NOT used for categorisation, limits, or UI logic
Edit:     User can update age in Settings → Profile (Session 16)

Note: The field is captured now so the data exists
when FIRE is built in V2. Do not use it for anything in V1.
```

---

## Security Pipeline — LOCKED (19 March 2026)

```
IMPORTANT ARCHITECTURE CLARIFICATION:
The security pipeline (sanitiseTransaction) runs INSIDE
/services/csvParser.ts — not as a separate post-parse step.

The flow is:
  Read CSV into memory
  → Papa Parse
  → detectColumnMapping()
  → parseRow() calls sanitiseTransaction() for EACH ROW
  → deduplicateTransactions()
  → Return sanitised Transaction[] to caller

The caller (spendStore.addTransactions) stores via storageService.
sanitiseTransaction is a named export from csvParser.ts.
There is NO separate securityPipeline.ts service in V1.

RAW FILE RULES:
  CSV content read into memory only — never written to disk
  After parseCSV() returns: raw content discarded
  Store receives only sanitised Transaction[]
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
  Full name in transaction refs → partial mask (keep first name)
  Only retain: date, amount, sanitised description,
               merchantNorm, category, debit/credit flag

SALARY SLIP PIPELINE (same rules, slightly different fields):
  Parsed by salary slip parser
  Same sanitisation pipeline applied to text fields
  BSN / PAN / Aadhaar → remove entirely
  Full name → remove entirely (only employer name retained)
  Only retain: gross, net, pension contribution,
               EPF contribution, pay period, employer name
  Raw file: never persisted, discarded immediately
```

---

## Encryption Model
```
Storage layer: expo-secure-store
  All data stored via /services/storageService.ts
  Uses iOS Keychain / Android Keystore (hardware-backed)
  Never AsyncStorage. Never raw file system writes.

V1 encryption:
  Hardware-backed OS encryption
  expo-secure-store handles key management transparently
  Protection level: same as banking apps on iOS/Android

V2 encryption (when Supabase backend added):
  Key = hash(Google OAuth token + device-specific ID)
  End-to-end encryption before data leaves device
  On logout: Invalidate key → stored data becomes unreadable
  On re-login: Key re-derived from new OAuth token
  Row Level Security on all Supabase tables
  auth.uid() = user_id enforcement on every table
  Field-level encryption for sensitive columns via KMS
  Separate data keys per user, encrypted with master KMS key

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
"✓ X transactions imported"
"✓ Account numbers masked"
"✓ Raw file discarded"
"✓ Data stored securely on your device"
```
Show it every time — never suppress it. Builds user trust.

For salary slip uploads:
```
"✓ Salary data imported"
"✓ Personal identifiers removed"
"✓ Raw file discarded"
"✓ Data stored securely on your device"
```

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
// Stored via storageService.ts
interface OnboardingState {
  complete: boolean
  completedAt: Date | null
  skipped: boolean           // user skipped upload — show ghost state
  ageSkipped: boolean        // user skipped age screen (screen 4)
                             // V2 FIRE planner will prompt for age
                             // on first open if ageSkipped = true
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
  Helps track usage patterns per user
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
[NOT YOURS] CSV parsing logic (sanitiseTransaction is in csvParser)
[NOT YOURS] Salary slip parsing logic (parser runs sanitisation)
[NOT YOURS] Financial calculations of any kind
[NOT YOURS] FIRE calculations (V2)
[NOT YOURS] Price refresh or API calls
[V2]        Couple sync (Supabase E2E encryption)
[V2]        Partner invitation flow
[V2]        QR code device pairing
[V2]        FIRE engine integration (age field stored, not used in V1)
```

---

## Your Output Files
```
/types/profile.ts              ⬜ Profile + Household interfaces
                               (age: number | null included)

/store/householdStore.ts       ✅ Session 12
                               Profiles + auth state (Zustand)
                               Uses secureStorageAdapter for persistence

/services/auth.ts              ⬜ Google OAuth flow (Session 14)

/services/storageService.ts    ✅ Session 12
                               expo-secure-store abstraction
                               Single storage interface — vault door
                               All other services call this only

/services/secureStorageAdapter.ts  ✅ Session 12
                               NOTE: Lives in /services/ not /store/
                               Zustand bridge using createJSONStorage()
                               Separate file from storageService (single responsibility)

/hooks/useHousehold.ts         ⬜ Session 12 remaining
                               Profile data for UI consumption
```
