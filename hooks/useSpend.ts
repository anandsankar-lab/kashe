import { useEffect, useMemo, useCallback } from 'react'
import useSpendStore from '../store/spendStore'
import useHouseholdStore from '../store/householdStore'
import type { SpendTransaction, SpendCategory, SpendBudget as Budget } from '../types/spend'

// ── STALENESS ─────────────────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000

function isStale(lastCalculatedAt: string | null): boolean {
  if (lastCalculatedAt === null) return true
  return Date.now() - new Date(lastCalculatedAt).getTime() > STALE_THRESHOLD_MS
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getMonthString(date: Date): string {
  const d = date instanceof Date ? date : new Date(date as unknown as string)
  return d.toISOString().slice(0, 7)
}

function prevMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-').map(Number)
  if (month === 1) return `${year - 1}-12`
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

function nthPrevMonth(yyyyMM: string, n: number): string {
  let m = yyyyMM
  for (let i = 0; i < n; i++) m = prevMonth(m)
  return m
}

const EXCLUDED_CATEGORIES: SpendCategory[] = ['income', 'investment_transfer', 'transfer']

// ── RETURN TYPE ───────────────────────────────────────────────────────────────

export interface UseSpendReturn {
  transactions: SpendTransaction[]
  budgets: Budget[]
  spendByCategory: Record<SpendCategory, number>
  totalSpend: number
  comparisonVsLastMonth: number
  comparisonVs3MonthAvg: number
  hasMinimumHistory: boolean
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  hasData: boolean
}

// ── HOOK ──────────────────────────────────────────────────────────────────────

export function useSpend(): UseSpendReturn {
  const allTransactions = useSpendStore((s) => s.transactions)
  const budgets = useSpendStore((s) => s.budgets)
  const derivedSpend = useSpendStore((s) => s.derivedSpend)
  const updateDerivedSpend = useSpendStore((s) => s.updateDerivedSpend)
  const storeSetSelectedMonth = useSpendStore((s) => s.setSelectedMonth)

  const activeProfileId = useHouseholdStore((s) => s.activeProfileId)

  const selectedMonth = derivedSpend.selectedMonth

  // ── FILTER: active profile + selected month ──────────────────────────────
  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      const profileMatch =
        activeProfileId === 'household' || t.profileId === activeProfileId
      const monthMatch = getMonthString(t.date) === selectedMonth
      return profileMatch && monthMatch
    })
  }, [allTransactions, activeProfileId, selectedMonth])

  // ── HELPER: spend total for any given month ──────────────────────────────
  const getMonthSpend = useCallback(
    (month: string, txns: SpendTransaction[]): number => {
      return txns
        .filter((t) => {
          const profileMatch =
            activeProfileId === 'household' || t.profileId === activeProfileId
          const monthMatch = getMonthString(t.date) === month
          return profileMatch && monthMatch
        })
        .filter((t) => t.amount < 0 && !EXCLUDED_CATEGORIES.includes(t.category))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    },
    [activeProfileId],
  )

  // ── STALENESS CHECK ON MOUNT ──────────────────────────────────────────────
  useEffect(() => {
    if (!isStale(derivedSpend.lastCalculatedAt)) return

    // SPEND BY CATEGORY: debits only, excluding income/transfer/investment
    const spendByCategory = filtered
      .filter((t) => t.amount < 0 && !EXCLUDED_CATEGORIES.includes(t.category))
      .reduce<Partial<Record<SpendCategory, number>>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount)
        return acc
      }, {}) as Record<SpendCategory, number>

    // TOTAL SPEND
    const totalSpend = Object.values(spendByCategory).reduce((s, v) => s + v, 0)

    // COMPARISON VS LAST MONTH
    const prevMonthStr = prevMonth(selectedMonth)
    const prevTotal = getMonthSpend(prevMonthStr, allTransactions)
    const comparisonVsLastMonth =
      prevTotal > 0 ? ((totalSpend - prevTotal) / prevTotal) * 100 : 0

    // COMPARISON VS 3-MONTH AVERAGE
    const m1 = getMonthSpend(nthPrevMonth(selectedMonth, 1), allTransactions)
    const m2 = getMonthSpend(nthPrevMonth(selectedMonth, 2), allTransactions)
    const m3 = getMonthSpend(nthPrevMonth(selectedMonth, 3), allTransactions)
    const avg = (m1 + m2 + m3) / 3
    const comparisonVs3MonthAvg = avg > 0 ? ((totalSpend - avg) / avg) * 100 : 0

    updateDerivedSpend({
      spendByCategory,
      totalSpend,
      comparisonVsLastMonth,
      comparisonVs3MonthAvg,
    })
    // Run on mount only — store invalidates lastCalculatedAt on data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── DISTINCT MONTHS (for hasMinimumHistory) ──────────────────────────────
  const distinctMonths = useMemo(() => {
    const months = new Set<string>()
    allTransactions.forEach((t) => months.add(getMonthString(t.date)))
    return months
  }, [allTransactions])

  const hasMinimumHistory = distinctMonths.size >= 2
  const hasData = allTransactions.length > 0

  const setSelectedMonth = useCallback(
    (month: string) => {
      storeSetSelectedMonth(month)
    },
    [storeSetSelectedMonth],
  )

  return {
    transactions: filtered,
    budgets,
    spendByCategory: derivedSpend.spendByCategory,
    totalSpend: derivedSpend.totalSpend,
    comparisonVsLastMonth: derivedSpend.comparisonVsLastMonth,
    comparisonVs3MonthAvg: derivedSpend.comparisonVs3MonthAvg,
    hasMinimumHistory,
    selectedMonth,
    setSelectedMonth,
    hasData,
  }
}

export default useSpend
