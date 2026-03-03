# Kāshe — CLAUDE-identity.md
*Team Member 1: Identity & Trust*
*Read CLAUDE.md first, then this file.*
*Last updated: March 2026 — age field added to Profile,
onboarding updated to 10 screens, salary slip pipeline noted*

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
Encrypted storage AES-256 via react-native-encrypted-storage
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
                               // used by FIRE engine only
                               // never used for other calculations
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
  Do not build in v1.

MANAGED
  No Google login. No app access.
  Administered entirely by OWNER.
  Primary use case: An Indian professional in Amsterdam
  tracks their parents' investments in India.
  Parents don't use the app — their son/daughter manages
  their Zerodha + LIC + PPF on their behalf.
  This is a common, real use case. Build it well.

  FIRE note: MANAGED profiles can have their own FIRE
  projection in Individual mode. Their age field is set
  by the OWNER when creating the profile.
```

### Age Field — Rules
```
Captured: Onboarding screen 4 (between Location and Teach)
Optional: User can skip — age field = null
Fallback: FIRE planner prompts for age on first open if null
Storage:  Stored in encrypted Profile record
Usage:    FIRE engine only (yearsToFIRE calculation)
          Never used for categorisation, limits, or other logic
Edit:     User can update age in Settings → Profile
```

---

## Security Pipeline (run on every CSV + salary slip upload)
```
This pipeline runs BEFORE any data touches storage.
Team Member 3 does the parsing. You own the sanitisation.

CSV PIPELINE:
1. Receive parsed transaction array from CSV parser
2. Sanitise each transaction:
   - Account numbers → keep last 4 digits only
   - IBANs → mask completely (show ****1234)
   - BSN / PAN / Aadhaar references → remove entirely
   - Full names in transaction refs → partially mask
   - Only retain: date, amount, merchant/description,
                  category, debit/credit flag
3. Encrypt sanitised data with AES-256
4. Write to encrypted storage
5. Emit post-upload confirmation event (see below)
6. Raw CSV: never persisted, discarded immediately after parsing

SALARY SLIP PIPELINE (same rules, different fields):
1. Receive parsed salary fields from salary slip parser
2. Sanitise:
   - BSN / PAN / Aadhaar → remove entirely
   - Full name → remove entirely
   - Employer name → retain (used to name pension holding)
   - Only retain: gross, net, pension contribution,
                  EPF contribution, pay period, employer name
3. Encrypt sanitised data with AES-256
4. Write to encrypted storage
5. Emit post-upload confirmation event (same toast)
6. Raw file: never persisted, discarded immediately

CRITICAL: Raw files must never be written to disk.
Parse in memory → sanitise → encrypt → discard.
```

---

## Encryption Key Derivation
```
Key = hash(Google OAuth token + device-specific ID)

On logout:   Invalidate key → stored data becomes unreadable
On re-login: Key re-derived from new OAuth token

Never store the key in plaintext — ever.
Never log the key or any derived value.
Never include the key in error messages or analytics.
```

---

## Post-Upload Confirmation Event
After every successful import, emit an event that triggers
a confirmation toast in the UI (Team Member 2 renders it):
```
"✓ X transactions imported"
"✓ Account numbers masked"
"✓ Raw file discarded"
"✓ Data encrypted on your device"
```
This builds user trust in the privacy model.
Show it every time — never suppress it.

For salary slip uploads, adapt toast:
```
"✓ Salary data imported"
"✓ Personal identifiers removed"
"✓ Raw file discarded"
"✓ Data encrypted on your device"
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
                 Store PIN hash in encrypted storage (never plaintext)
```

---

## Onboarding Completion Flag
```typescript
// Stored in encrypted storage
interface OnboardingState {
  complete: boolean
  completedAt: Date | null
  skipped: boolean           // user skipped upload — show ghost state
  ageSkipped: boolean        // user skipped age screen (screen 4)
                             // FIRE planner will prompt for age on
                             // first open if ageSkipped = true
}

// On app launch:
// complete = false → load onboarding stack (10 screens)
// complete = true  → load main app (tabs)

// Onboarding screens (10 total):
// 1. Welcome         2. Household       3. Location
// 4. Age (NEW)       5. Teach [+]       6. First Add
// 7. First Payoff    8. Budget Suggest  9. Portfolio Teaser
// 10. Complete
```

---

## What You Must NOT Build
```
[NOT YOURS] Any UI component or screen layout
[NOT YOURS] CSV parsing logic (you own sanitisation only)
[NOT YOURS] Salary slip parsing logic (Team Member 3 parses,
            you sanitise using the same pipeline rules above)
[NOT YOURS] Financial calculations of any kind
[NOT YOURS] FIRE calculations (Team Member 3)
[NOT YOURS] Price refresh or API calls
[V2]        Couple sync (Supabase E2E encryption)
[V2]        Partner invitation flow
[V2]        QR code device pairing
```

---

## Your Output Files
```
/types/profile.ts              Profile + Household interfaces
                               (includes age: number | null)
/store/householdStore.ts       Profiles + auth state (Zustand)
/services/auth.ts              Google OAuth flow
/services/securityPipeline.ts  Sanitisation pipeline
                               (handles both CSV + salary slip)
/services/encryptedStorage.ts  Read/write wrapper
/hooks/useHousehold.ts         Profile data for UI consumption
```
