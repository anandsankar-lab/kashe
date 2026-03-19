import { useEffect, useMemo, useCallback } from 'react'
import useInsightsStore from '../store/insightsStore'
import type { Insight, MonthlyReview } from '../store/insightsStore'
import useSpendStore from '../store/spendStore'

// ── RETURN TYPE ───────────────────────────────────────────────────────────────

export type ReviewState = 'unavailable' | 'insufficient' | 'ready_unread' | 'ready_read'

export interface UseInsightsReturn {
  activeInsight: Insight | null
  currentMonthReview: MonthlyReview | null
  pastReviews: MonthlyReview[]
  reviewState: ReviewState
  isOverBudget: boolean
  dismissInsight: () => void
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getMonthString(date: Date): string {
  const d = date instanceof Date ? date : new Date(date as unknown as string)
  return d.toISOString().slice(0, 7)
}

// ── HOOK ──────────────────────────────────────────────────────────────────────

export function useInsights(): UseInsightsReturn {
  const activeInsight = useInsightsStore((s) => s.activeInsight)
  const monthlyReviews = useInsightsStore((s) => s.monthlyReviews)
  const setActiveInsight = useInsightsStore((s) => s.setActiveInsight)
  const storeInsightDismiss = useInsightsStore((s) => s.dismissInsight)

  const allTransactions = useSpendStore((s) => s.transactions)
  const budgets = useSpendStore((s) => s.budgets)
  const derivedSpend = useSpendStore((s) => s.derivedSpend)

  // ── CURRENT MONTH vs PAST REVIEWS ────────────────────────────────────────
  const currentMonthYYYYMM = new Date().toISOString().slice(0, 7)

  const currentMonthReview = useMemo(
    () => monthlyReviews.find((r) => r.monthYear === currentMonthYYYYMM) ?? null,
    [monthlyReviews, currentMonthYYYYMM],
  )

  const pastReviews = useMemo(
    () =>
      monthlyReviews
        .filter((r) => r.monthYear !== currentMonthYYYYMM)
        .sort((a, b) => b.monthYear.localeCompare(a.monthYear)),
    [monthlyReviews, currentMonthYYYYMM],
  )

  // ── DISTINCT MONTHS IN ALL TRANSACTIONS ───────────────────────────────────
  const monthCount = useMemo(() => {
    const months = new Set<string>()
    allTransactions.forEach((t) => months.add(getMonthString(t.date)))
    return months.size
  }, [allTransactions])

  // ── REVIEW STATE ──────────────────────────────────────────────────────────
  const reviewState = useMemo<ReviewState>(() => {
    if (monthCount === 0) return 'unavailable'
    if (monthCount < 3) return 'insufficient'
    if (currentMonthReview !== null && !currentMonthReview.viewed) return 'ready_unread'
    if (currentMonthReview !== null && currentMonthReview.viewed) return 'ready_read'
    return 'insufficient'
  }, [monthCount, currentMonthReview])

  // ── IS OVER BUDGET ────────────────────────────────────────────────────────
  const isOverBudget = useMemo(() => {
    return budgets.some((budget) => {
      const spent = derivedSpend.spendByCategory[budget.category] ?? 0
      return spent > budget.monthlyAmount * 0.9
    })
  }, [budgets, derivedSpend.spendByCategory])

  // ── ACTIVE INSIGHT: expiry check ──────────────────────────────────────────
  const effectiveActiveInsight = useMemo<Insight | null>(() => {
    if (activeInsight === null) return null
    if (new Date() > new Date(activeInsight.expiresAt)) return null
    return activeInsight
  }, [activeInsight])

  // Clear expired insight from store as a side effect
  useEffect(() => {
    if (activeInsight !== null && new Date() > new Date(activeInsight.expiresAt)) {
      setActiveInsight(null)
    }
  }, [activeInsight, setActiveInsight])

  // ── DISMISS INSIGHT ───────────────────────────────────────────────────────
  const dismissInsight = useCallback(() => {
    if (activeInsight !== null) {
      storeInsightDismiss(activeInsight.id)
    }
  }, [activeInsight, storeInsightDismiss])

  return {
    activeInsight: effectiveActiveInsight,
    currentMonthReview,
    pastReviews,
    reviewState,
    isOverBudget,
    dismissInsight,
  }
}

export default useInsights
