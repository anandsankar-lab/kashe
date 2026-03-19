import { useCallback, useMemo } from 'react'
import { INSTRUMENT_CATALOGUE } from '../constants/instrumentCatalogue'
import useHouseholdStore from '../store/householdStore'
import type { InstrumentCatalogueEntry } from '../types/instrumentCatalogue'

// ── RETURN TYPE ───────────────────────────────────────────────────────────────

export interface UseInstrumentCatalogueReturn {
  getSuggestions: (bucket: string, geography: string) => InstrumentCatalogueEntry[]
  getEntry: (id: string) => InstrumentCatalogueEntry | null
  allEntries: InstrumentCatalogueEntry[]
}

// ── HOOK ──────────────────────────────────────────────────────────────────────

export function useInstrumentCatalogue(): UseInstrumentCatalogueReturn {
  // riskProfile available for V2 filtering — stored for future use
  const _riskProfile = useHouseholdStore((s) => s.riskProfile)

  // ── GET SUGGESTIONS ───────────────────────────────────────────────────────
  // V1: reads from static constant.
  // V2: replace INSTRUMENT_CATALOGUE import with Supabase fetch.
  // Zero changes needed in any component — this hook is the boundary.
  const getSuggestions = useCallback(
    (bucket: string, geography: string): InstrumentCatalogueEntry[] => {
      return INSTRUMENT_CATALOGUE
        .filter(
          (entry) => {
            const geos = entry.residenceGeographies as string[]
            return (
              entry.role === 'suggest' && // Safety net: ensures track_only and educational are never returned
              entry.bucket === bucket &&
              (geos.includes(geography) || geos.includes('GLOBAL')) &&
              entry.isActive
            )
          },
        )
        .sort((a, b) => {
          // Sort by tier ascending (Tier 0 first — primary recommendations).
          // TODO: replace with kasheScore once added to InstrumentCatalogueEntry type.
          return a.tier - b.tier
        })
    },
    [],
  )

  // ── GET ENTRY ─────────────────────────────────────────────────────────────
  const getEntry = useCallback((id: string): InstrumentCatalogueEntry | null => {
    return INSTRUMENT_CATALOGUE.find((e) => e.id === id) ?? null
  }, [])

  // ── ALL ENTRIES ───────────────────────────────────────────────────────────
  const allEntries = useMemo(() => INSTRUMENT_CATALOGUE, [])

  return {
    getSuggestions,
    getEntry,
    allEntries,
  }
}

export default useInstrumentCatalogue
