import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import secureStorageAdapter from '../services/secureStorageAdapter'
import { STORAGE_KEYS } from '../services/storageService'
import {
  categorise,
  applyUserCorrection,
  type MerchantOverride,
  type PendingCategorization,
} from '../services/spendCategoriser'
import type {
  SpendTransaction,
  SpendCategory,
  SpendBudget as Budget,
  DataSource,
} from '../types/spend'

// ── INTERNAL HELPER ───────────────────────────────────────────────────────────

function toCategorizerGeography(
  geo: string,
): 'NL' | 'IN' | 'EU' | 'GLOBAL' {
  if (geo === 'europe') return 'NL'
  if (geo === 'india') return 'IN'
  return 'GLOBAL'
}

// ── STATE SHAPE ───────────────────────────────────────────────────────────────

interface DerivedSpend {
  spendByCategory: Record<SpendCategory, number>
  totalSpend: number
  comparisonVsLastMonth: number
  comparisonVs3MonthAvg: number
  selectedMonth: string
  lastCalculatedAt: string | null
}

interface SpendState {
  transactions: SpendTransaction[]
  budgets: Budget[]
  dataSources: DataSource[]
  merchantOverrides: MerchantOverride[]
  retryQueue: PendingCategorization[]
  derivedSpend: DerivedSpend
}

interface SpendActions {
  addTransactions(
    incoming: SpendTransaction[],
    geography: 'NL' | 'IN' | 'EU' | 'GLOBAL',
  ): void
  setBudget(budget: Budget): void
  recategorise(txnId: string, newCategory: SpendCategory): void
  setSelectedMonth(month: string): void
  updateDerivedSpend(derived: {
    spendByCategory: Record<SpendCategory, number>
    totalSpend: number
    comparisonVsLastMonth: number
    comparisonVs3MonthAvg: number
  }): void
  addDataSource(source: DataSource): void
  updateRetryQueue(queue: PendingCategorization[]): void
}

type SpendStore = SpendState & SpendActions

// ── STORE ─────────────────────────────────────────────────────────────────────

const useSpendStore = create<SpendStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: [],
      dataSources: [],
      merchantOverrides: [],
      retryQueue: [],
      derivedSpend: {
        spendByCategory: {} as Record<SpendCategory, number>,
        totalSpend: 0,
        comparisonVsLastMonth: 0,
        comparisonVs3MonthAvg: 0,
        selectedMonth: new Date().toISOString().slice(0, 7),
        lastCalculatedAt: null,
      },

      addTransactions(incoming, _geography) {
        const { merchantOverrides } = get()
        const firstGeo = incoming[0]?.geography ?? 'other'
        const categorizerGeo = toCategorizerGeography(firstGeo)

        const newRetryItems: PendingCategorization[] = []
        const categorised: SpendTransaction[] = incoming.map((txn) => {
          const result = categorise(txn.description, merchantOverrides, categorizerGeo)
          if (result.confidence > 0.0) {
            return { ...txn, category: result.category }
          }
          newRetryItems.push({
            transactionId: txn.id,
            merchantNorm: result.merchantNorm,
            description: txn.description,
            failedAttempts: 0,
          })
          return txn
        })

        set((state) => ({
          transactions: [...state.transactions, ...categorised],
          retryQueue: [...state.retryQueue, ...newRetryItems],
          derivedSpend: { ...state.derivedSpend, lastCalculatedAt: null },
        }))
      },

      setBudget(budget) {
        set((state) => {
          const idx = state.budgets.findIndex(
            (b) => b.category === budget.category && b.profileId === budget.profileId,
          )
          if (idx !== -1) {
            return {
              budgets: [
                ...state.budgets.slice(0, idx),
                budget,
                ...state.budgets.slice(idx + 1),
              ],
            }
          }
          return { budgets: [...state.budgets, budget] }
        })
      },

      recategorise(txnId, newCategory) {
        const state = get()
        const txn = state.transactions.find((t) => t.id === txnId)
        if (!txn) return

        const merchantNorm = txn.merchantNorm ?? ''

        const updatedOverrides = applyUserCorrection(
          merchantNorm,
          newCategory,
          state.merchantOverrides,
        )

        const updatedTransactions = state.transactions.map((t) => {
          if (t.id === txnId) {
            return { ...t, category: newCategory }
          }
          if ((t.merchantNorm ?? '') === merchantNorm && merchantNorm !== '') {
            const result = categorise(
              t.description,
              updatedOverrides,
              toCategorizerGeography(t.geography),
            )
            return { ...t, category: result.category }
          }
          return t
        })

        const updatedOverride = updatedOverrides.find(
          (o) => o.merchantNorm === merchantNorm,
        )
        if (updatedOverride !== undefined && updatedOverride.correctionCount >= 5) {
          console.log('[Layer 1 promotion]', merchantNorm, newCategory)
        }

        set({
          transactions: updatedTransactions,
          merchantOverrides: updatedOverrides,
          derivedSpend: { ...state.derivedSpend, lastCalculatedAt: null },
        })
      },

      setSelectedMonth(month) {
        set((state) => ({
          derivedSpend: {
            ...state.derivedSpend,
            selectedMonth: month,
            lastCalculatedAt: null,
          },
        }))
      },

      updateDerivedSpend(derived) {
        set((state) => ({
          derivedSpend: {
            ...state.derivedSpend,
            ...derived,
            lastCalculatedAt: new Date().toISOString(),
          },
        }))
      },

      addDataSource(source) {
        set((state) => {
          if (state.dataSources.some((ds) => ds.id === source.id)) {
            return state
          }
          return { ...state, dataSources: [...state.dataSources, source] }
        })
      },

      updateRetryQueue(queue) {
        set({ retryQueue: queue })
      },
    }),
    {
      name: STORAGE_KEYS.SPEND_STORE,
      storage: createJSONStorage(() => secureStorageAdapter),
    },
  ),
)

export default useSpendStore
