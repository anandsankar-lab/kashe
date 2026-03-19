import { useEffect, useMemo } from 'react'
import usePortfolioStore from '../store/portfolioStore'
import type { PortfolioDerived } from '../store/portfolioStore'
import useSpendStore from '../store/spendStore'
import useHouseholdStore from '../store/householdStore'
import type { PortfolioHolding } from '../types/portfolio'

// ── STALENESS ─────────────────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000

function isStale(lastCalculatedAt: string | null): boolean {
  if (lastCalculatedAt === null) return true
  return Date.now() - new Date(lastCalculatedAt).getTime() > STALE_THRESHOLD_MS
}

// ── RETURN TYPE ───────────────────────────────────────────────────────────────

export interface UsePortfolioReturn {
  holdings: PortfolioHolding[]
  liveTotal: number
  lockedTotal: number
  financialPosition: number
  allocationByBucket: Record<string, number>
  allocationByGeography: Record<string, number>
  protectionAsset: PortfolioHolding | null
  protectionMonthsCovered: number
  savingsRate: number
  hasData: boolean
}

// ── HOOK ──────────────────────────────────────────────────────────────────────

export function usePortfolio(): UsePortfolioReturn {
  const holdings = usePortfolioStore((s) => s.holdings)
  const bucketOverrides = usePortfolioStore((s) => s.bucketOverrides)
  const protectionHoldingId = usePortfolioStore((s) => s.protectionHoldingId)
  const derived = usePortfolioStore((s) => s.derived)
  const updateDerived = usePortfolioStore((s) => s.updateDerived)

  const allTransactions = useSpendStore((s) => s.transactions)
  const derivedSpend = useSpendStore((s) => s.derivedSpend)

  const activeProfileId = useHouseholdStore((s) => s.activeProfileId)

  // ── APPLY BUCKET OVERRIDES ────────────────────────────────────────────────
  const effectiveHoldings = useMemo(() => {
    return holdings.map((h) => {
      const override = bucketOverrides.find((o) => o.holdingId === h.id)
      return override ? { ...h, bucket: override.overrideBucket } : h
    })
  }, [holdings, bucketOverrides])

  // ── STALENESS CHECK ON MOUNT ──────────────────────────────────────────────
  useEffect(() => {
    if (!isStale(derived.lastCalculatedAt)) return

    const total = effectiveHoldings.reduce((sum, h) => sum + h.currentValue, 0)

    // LIVE TOTAL: non-LOCKED holdings
    const liveTotal = effectiveHoldings
      .filter((h) => h.bucket !== 'LOCKED')
      .reduce((sum, h) => sum + h.currentValue, 0)

    // LOCKED TOTAL: LOCKED bucket
    const lockedTotal = effectiveHoldings
      .filter((h) => h.bucket === 'LOCKED')
      .reduce((sum, h) => sum + h.currentValue, 0)

    // FINANCIAL POSITION (liabilities not yet built — added in Session when /types/liability.ts built)
    const financialPosition = liveTotal + lockedTotal

    // ALLOCATION BY BUCKET
    const growthSum = effectiveHoldings
      .filter((h) => h.bucket === 'GROWTH')
      .reduce((sum, h) => sum + h.currentValue, 0)
    const stabilitySum = effectiveHoldings
      .filter((h) => h.bucket === 'STABILITY')
      .reduce((sum, h) => sum + h.currentValue, 0)
    const lockedSum = lockedTotal

    const allocationByBucket: Record<string, number> =
      total > 0
        ? {
            GROWTH: (growthSum / total) * 100,
            STABILITY: (stabilitySum / total) * 100,
            LOCKED: (lockedSum / total) * 100,
          }
        : { GROWTH: 0, STABILITY: 0, LOCKED: 0 }

    // ALLOCATION BY GEOGRAPHY
    const geographyTotals: Record<string, number> = {}
    effectiveHoldings.forEach((h) => {
      geographyTotals[h.geography] = (geographyTotals[h.geography] ?? 0) + h.currentValue
    })
    const allocationByGeography: Record<string, number> = {}
    Object.entries(geographyTotals).forEach(([geo, val]) => {
      allocationByGeography[geo] = total > 0 ? (val / total) * 100 : 0
    })

    // PROTECTION ASSET
    const protectionAsset = protectionHoldingId
      ? (holdings.find((h) => h.id === protectionHoldingId) ?? null)
      : null

    // PROTECTION MONTHS COVERED
    const avgMonthlySpend = derivedSpend.totalSpend
    const protectionMonthsCovered =
      protectionAsset !== null && avgMonthlySpend > 0
        ? protectionAsset.currentValue / avgMonthlySpend
        : 0

    const nextDerived: PortfolioDerived = {
      liveTotal,
      lockedTotal,
      financialPosition,
      allocationByBucket,
      allocationByGeography,
      protectionAsset,
      protectionMonthsCovered,
      lastCalculatedAt: new Date().toISOString(),
    }

    updateDerived(nextDerived)
    // Run on mount only — store invalidates lastCalculatedAt on holdings changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── SAVINGS RATE (current month, from spendStore) ─────────────────────────
  const savingsRate = useMemo(() => {
    const currentMonth = derivedSpend.selectedMonth
    const income = allTransactions
      .filter((t) => {
        const profileMatch =
          activeProfileId === 'household' || t.profileId === activeProfileId
        const monthMatch = t.date instanceof Date
          ? t.date.toISOString().slice(0, 7) === currentMonth
          : new Date(t.date as unknown as string).toISOString().slice(0, 7) === currentMonth
        return profileMatch && monthMatch && t.category === 'income' && t.amount > 0
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const spend = derivedSpend.totalSpend
    return income > 0 ? ((income - spend) / income) * 100 : 0
  }, [allTransactions, derivedSpend.selectedMonth, derivedSpend.totalSpend, activeProfileId])

  const hasData = holdings.length > 0

  return {
    holdings,
    liveTotal: derived.liveTotal,
    lockedTotal: derived.lockedTotal,
    financialPosition: derived.financialPosition,
    allocationByBucket: derived.allocationByBucket,
    allocationByGeography: derived.allocationByGeography,
    protectionAsset: derived.protectionAsset,
    protectionMonthsCovered: derived.protectionMonthsCovered,
    savingsRate,
    hasData,
  }
}

export default usePortfolio
