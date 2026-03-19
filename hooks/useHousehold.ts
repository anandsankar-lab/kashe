import { useMemo } from 'react'
import useHouseholdStore from '../store/householdStore'

// Re-export types from householdStore for consumers
export type { Profile, Household, RiskProfileType } from '../store/householdStore'

// ── RETURN TYPE ───────────────────────────────────────────────────────────────

import type { Profile, Household, RiskProfileType } from '../store/householdStore'

export interface UseHouseholdReturn {
  household: Household | null
  profiles: Profile[]
  activeProfile: Profile | 'household'
  currentProfile: Profile | null
  setActiveProfile: (id: string | 'household') => void
  isAuthenticated: boolean
  riskProfile: RiskProfileType
  setRiskProfile: (profile: RiskProfileType) => void
  onboardingComplete: boolean
}

// ── HOOK ──────────────────────────────────────────────────────────────────────

export function useHousehold(): UseHouseholdReturn {
  const household = useHouseholdStore((s) => s.household)
  const profiles = useHouseholdStore((s) => s.profiles)
  const activeProfileId = useHouseholdStore((s) => s.activeProfileId)
  const isAuthenticated = useHouseholdStore((s) => s.isAuthenticated)
  const riskProfile = useHouseholdStore((s) => s.riskProfile)
  const onboardingComplete = useHouseholdStore((s) => s.onboardingComplete)
  const storeSetActiveProfile = useHouseholdStore((s) => s.setActiveProfile)
  const storeSetRiskProfile = useHouseholdStore((s) => s.setRiskProfile)

  // ── ACTIVE PROFILE ────────────────────────────────────────────────────────
  const activeProfile = useMemo<Profile | 'household'>(() => {
    if (activeProfileId === 'household') return 'household'
    return profiles.find((p) => p.id === activeProfileId) ?? 'household'
  }, [activeProfileId, profiles])

  // ── CURRENT PROFILE ───────────────────────────────────────────────────────
  const currentProfile = useMemo<Profile | null>(() => {
    if (activeProfileId === 'household') return null
    return profiles.find((p) => p.id === activeProfileId) ?? null
  }, [activeProfileId, profiles])

  return {
    household,
    profiles,
    activeProfile,
    currentProfile,
    setActiveProfile: storeSetActiveProfile,
    isAuthenticated,
    riskProfile,
    setRiskProfile: storeSetRiskProfile,
    onboardingComplete,
  }
}

export default useHousehold
