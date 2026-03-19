import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import secureStorageAdapter from '../services/secureStorageAdapter'
import { STORAGE_KEYS } from '../services/storageService'

// ── LOCAL TYPES ───────────────────────────────────────────────────────────────

export type ProfileType = 'OWNER' | 'PARTNER' | 'MANAGED'

export interface Profile {
  id: string
  householdId: string
  name: string
  type: ProfileType
  googleAuthId: string | null
  baseCountry: string
  baseCurrency: string
  age: number | null
  createdAt: string
}

export interface Household {
  id: string
  name: string
  baseCurrency: string
  createdBy: string
}

export type RiskProfileType = 'conservative' | 'balanced' | 'growth'

// ── STATE SHAPE ───────────────────────────────────────────────────────────────

interface HouseholdState {
  household: Household | null
  profiles: Profile[]
  activeProfileId: string | 'household'
  isAuthenticated: boolean
  riskProfile: RiskProfileType
  onboardingComplete: boolean
}

interface HouseholdActions {
  setHousehold(household: Household): void
  addProfile(profile: Profile): void
  setActiveProfile(id: string | 'household'): void
  setAuthenticated(value: boolean): void
  setRiskProfile(profile: RiskProfileType): void
  setOnboardingComplete(value: boolean): void
}

type HouseholdStore = HouseholdState & HouseholdActions

// ── STORE ─────────────────────────────────────────────────────────────────────

const useHouseholdStore = create<HouseholdStore>()(
  persist(
    (set) => ({
      household: null,
      profiles: [],
      activeProfileId: 'household',
      isAuthenticated: false,
      riskProfile: 'balanced',
      onboardingComplete: false,

      setHousehold(household) {
        set({ household })
      },

      addProfile(profile) {
        set((state) => {
          if (state.profiles.some((p) => p.id === profile.id)) {
            return state
          }
          return { ...state, profiles: [...state.profiles, profile] }
        })
      },

      setActiveProfile(id) {
        set({ activeProfileId: id })
      },

      setAuthenticated(value) {
        set({ isAuthenticated: value })
      },

      setRiskProfile(profile) {
        set({ riskProfile: profile })
      },

      setOnboardingComplete(value) {
        set({ onboardingComplete: value })
      },
    }),
    {
      name: STORAGE_KEYS.HOUSEHOLD_STORE,
      storage: createJSONStorage(() => secureStorageAdapter),
    },
  ),
)

export default useHouseholdStore
