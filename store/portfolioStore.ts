import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import secureStorageAdapter from '../services/secureStorageAdapter'
import { STORAGE_KEYS } from '../services/storageService'
import type { PortfolioHolding } from '../types/portfolio'
import type { AssetSubtype } from '../types/portfolio'
import { DEFAULT_BUCKET } from '../types/portfolio'

// ── LOCAL TYPES ───────────────────────────────────────────────────────────────

export interface BucketOverride {
  holdingId: string
  overrideBucket: 'GROWTH' | 'STABILITY' | 'LOCKED'
  systemBucket: 'GROWTH' | 'STABILITY' | 'LOCKED'
  overriddenAt: string
  profileId: string
}

export interface PortfolioDerived {
  liveTotal: number
  lockedTotal: number
  financialPosition: number
  allocationByBucket: Record<string, number>
  allocationByGeography: Record<string, number>
  protectionAsset: PortfolioHolding | null
  protectionMonthsCovered: number
  lastCalculatedAt: string | null
}

// ── STATE SHAPE ───────────────────────────────────────────────────────────────

interface PortfolioState {
  holdings: PortfolioHolding[]
  bucketOverrides: BucketOverride[]
  protectionHoldingId: string | null
  derived: PortfolioDerived
  pendingCategorizationQueue: PortfolioHolding[]
}

interface PortfolioActions {
  addHolding(holding: PortfolioHolding): void
  updateHolding(holdingId: string, updates: Partial<PortfolioHolding>): void
  setBucketOverride(override: BucketOverride): void
  setProtection(holdingId: string): void
  updateDerived(derived: PortfolioDerived): void
  addHoldings(holdings: PortfolioHolding[]): void
  addPendingHoldings(holdings: PortfolioHolding[]): void
  resolveHolding(holdingId: string, assetSubtype: AssetSubtype): void
}

type PortfolioStore = PortfolioState & PortfolioActions

// ── STORE ─────────────────────────────────────────────────────────────────────

const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      holdings: [],
      bucketOverrides: [],
      protectionHoldingId: null,
      pendingCategorizationQueue: [],
      derived: {
        liveTotal: 0,
        lockedTotal: 0,
        financialPosition: 0,
        allocationByBucket: {},
        allocationByGeography: {},
        protectionAsset: null,
        protectionMonthsCovered: 0,
        lastCalculatedAt: null,
      },

      addHolding(holding) {
        set((state) => {
          if (state.holdings.some((h) => h.id === holding.id)) {
            return state
          }
          return {
            ...state,
            holdings: [...state.holdings, holding],
            derived: { ...state.derived, lastCalculatedAt: null },
          }
        })
      },

      updateHolding(holdingId, updates) {
        set((state) => {
          const idx = state.holdings.findIndex((h) => h.id === holdingId)
          if (idx === -1) return state
          return {
            ...state,
            holdings: [
              ...state.holdings.slice(0, idx),
              { ...state.holdings[idx], ...updates } as PortfolioHolding,
              ...state.holdings.slice(idx + 1),
            ],
            derived: { ...state.derived, lastCalculatedAt: null },
          }
        })
      },

      setBucketOverride(override) {
        set((state) => {
          const idx = state.bucketOverrides.findIndex(
            (o) => o.holdingId === override.holdingId,
          )
          const updated =
            idx !== -1
              ? [
                  ...state.bucketOverrides.slice(0, idx),
                  override,
                  ...state.bucketOverrides.slice(idx + 1),
                ]
              : [...state.bucketOverrides, override]
          return {
            ...state,
            bucketOverrides: updated,
            derived: { ...state.derived, lastCalculatedAt: null },
          }
        })
      },

      setProtection(holdingId) {
        set((state) => ({
          ...state,
          protectionHoldingId: holdingId,
          derived: { ...state.derived, lastCalculatedAt: null },
        }))
      },

      updateDerived(derived) {
        set({ derived })
      },

      addHoldings(holdings) {
        set((state) => {
          const existingIds = new Set(state.holdings.map(h => h.id))
          const newHoldings = holdings.filter(h => !existingIds.has(h.id))
          if (newHoldings.length === 0) return state
          return {
            ...state,
            holdings: [...state.holdings, ...newHoldings],
            derived: { ...state.derived, lastCalculatedAt: null },
          }
        })
      },

      addPendingHoldings(holdings) {
        set((state) => {
          const appended = [...state.pendingCategorizationQueue, ...holdings]
          return {
            ...state,
            pendingCategorizationQueue: appended.length > 50
              ? appended.slice(appended.length - 50)
              : appended,
          }
        })
      },

      resolveHolding(holdingId, assetSubtype) {
        set((state) => {
          const idx = state.pendingCategorizationQueue.findIndex(h => h.id === holdingId)
          if (idx === -1) return state
          const holding = state.pendingCategorizationQueue[idx]
          if (!holding) return state
          const resolved: PortfolioHolding = {
            ...holding,
            assetSubtype,
            bucket: DEFAULT_BUCKET[assetSubtype],
          }
          return {
            ...state,
            holdings: [...state.holdings, resolved],
            pendingCategorizationQueue: [
              ...state.pendingCategorizationQueue.slice(0, idx),
              ...state.pendingCategorizationQueue.slice(idx + 1),
            ],
            derived: { ...state.derived, lastCalculatedAt: null },
          }
        })
      },
    }),
    {
      name: STORAGE_KEYS.PORTFOLIO_STORE,
      storage: createJSONStorage(() => secureStorageAdapter),
    },
  ),
)

export default usePortfolioStore
