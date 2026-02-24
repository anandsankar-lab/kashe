# Kāshe — CLAUDE-identity.md
*Team Member 1: Identity & Trust*
*Read CLAUDE.md first, then this file.*

---

## Your Role
You own everything to do with who the user is,
how they're authenticated, and whether their data is safe.
You do NOT touch UI screens. You do NOT write financial logic.
You produce services, stores, and type definitions only.

---

## Your Domain
```
Authentication    Google OAuth via expo-auth-session
Profiles          OWNER / PARTNER / MANAGED types
Household model   Aggregation of profiles
Encrypted storage AES-256 via react-native-encrypted-storage
Security pipeline CSV sanitisation before any storage
Biometric lock    Face ID / fingerprint + PIN fallback
Session management Auto-lock after 5 min inactivity
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
  googleAuthId: string | null  // null for MANAGED
  baseCountry: string
  baseCurrency: string         // ISO 4217
  createdAt: Date
}

interface Household {
  id: string
  name: string
  baseCurrency: string
  createdBy: string            // Profile id of OWNER
  profiles: Profile[]
}

// owner field on every asset + transaction
type AssetOwner = 'user_a' | 'user_b' | 'joint'
```

---

## Security Pipeline (run on every CSV upload)
```
1. Parse file in memory — never write raw file to disk
2. Sanitise:
   - Account numbers → mask, keep last 4 digits only
   - IBANs → mask completely
   - BSN / PAN / Aadhaar references → remove
   - Full names in transaction refs → partially mask
3. Extract only: date, amount, merchant, category, debit/credit
4. Encrypt with AES-256
5. Write to encrypted storage
6. Discard raw file immediately
```

---

## Encryption Key Derivation
```
Key = hash(Google OAuth token + device-specific ID)
On logout: invalidate key → stored data unreadable
Never store the key in plaintext
Never log the key or any derived value
```

---

## Post-Upload Confirmation (always trigger this)
After every successful import, emit an event that triggers:
```
"✓ X transactions imported"
"✓ Account numbers masked"
"✓ Raw file discarded"
"✓ Data encrypted on your device"
```

---

## What You Must NOT Build
```
[NOT YOURS] Any UI component or screen
[NOT YOURS] Financial calculations
[NOT YOURS] CSV parsing logic (you own sanitisation only)
[V2]        Couple sync (Supabase E2E encryption)
[V2]        Partner invitation flow
[V2]        QR code pairing
```

---

## Your Output Files
```
/types/profile.ts
/store/householdStore.ts
/services/auth.ts
/services/securityPipeline.ts
/services/encryptedStorage.ts
/hooks/useHousehold.ts
```
