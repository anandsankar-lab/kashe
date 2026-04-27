// /services/userProfileService.ts
// Single builder for UserFinancialProfile.
// Reads from all stores. Never writes to stores directly —
// returns the profile and lets the caller persist it.
// Pure functions at the core — testable in isolation.

import type {
  UserFinancialProfile,
  SophisticationBand,
  ImportFreshness,
  HouseholdType,
  InvestingFrequency,
  SavingsRateBand,
  InvestmentStyle,
} from '../types/userProfile'
import {
  VEHICLE_CATEGORY_MAP,
  CASH_LIKE_VEHICLES,
  ILLIQUID_SPECULATIVE_VEHICLES,
} from '../types/userProfile'
import type { PortfolioHolding } from '../types/portfolio'
import type { SpendTransaction } from '../types/spend'
import storageService, { STORAGE_KEYS } from './storageService'

// ── HELPERS ───────────────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date | string): number {
  const bDate = b instanceof Date ? b : new Date(b)
  return Math.floor(
    (bDate.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
  )
}

function monthsBetween(earlier: Date, later: Date): number {
  return (
    (later.getFullYear() - earlier.getFullYear()) * 12 +
    (later.getMonth() - earlier.getMonth()) +
    1
  )
}

// ── SOPHISTICATION SCORE ──────────────────────────────────────────────────────
// 0–100, five components. NEVER shown to user as a number.

export function computeSophisticationScore(params: {
  financialVehicles: string[]
  growthPct: number
  stabilityPct: number
  lockedPct: number
  protectionMonthsCovered: number
  investingFrequency: string
  geographyExposure: Record<string, number>
}): number {
  // 1. VEHICLE DIVERSITY (0–25 points)
  // Count distinct asset class categories held
  const categories = new Set(
    params.financialVehicles
      .map(v => VEHICLE_CATEGORY_MAP[v])
      .filter((c): c is string => c !== undefined)
  )
  const categoryCount = categories.size
  const diversityScore =
    categoryCount >= 5 ? 25
    : categoryCount === 4 ? 24
    : categoryCount === 3 ? 18
    : categoryCount === 2 ? 12
    : categoryCount === 1 ? 6
    : 0

  // 2. LIQUIDITY BALANCE (0–25 points)
  let liquidityScore: number
  if (params.lockedPct > 60) {
    liquidityScore = 5
  } else if (params.stabilityPct > 70) {
    liquidityScore = 8
  } else if (
    params.growthPct >= 40 &&
    params.stabilityPct >= 10 &&
    params.lockedPct >= 5
  ) {
    liquidityScore = 25
  } else {
    liquidityScore = 15
  }

  // 3. PROTECTION COVERAGE (0–20 points)
  const protectionScore =
    params.protectionMonthsCovered >= 6 ? 20
    : params.protectionMonthsCovered >= 3 ? 15
    : params.protectionMonthsCovered >= 1 ? 8
    : 0

  // 4. INVESTING CONSISTENCY (0–15 points)
  const consistencyScore =
    params.investingFrequency === 'frequent' ? 15
    : params.investingFrequency === 'monthly' ? 12
    : params.investingFrequency === 'rarely' ? 4
    : 0

  // 5. GEOGRAPHIC SPREAD (0–15 points)
  const geographyCount = Object.keys(params.geographyExposure).length
  const geographyScore =
    geographyCount >= 3 ? 15
    : geographyCount === 2 ? 10
    : geographyCount === 1 ? 3
    : 0

  return Math.min(
    100,
    diversityScore + liquidityScore + protectionScore +
    consistencyScore + geographyScore
  )
}

// ── SOPHISTICATION BAND ───────────────────────────────────────────────────────

export function computeSophisticationBand(score: number): SophisticationBand {
  if (score <= 25) return 'foundation'
  if (score <= 50) return 'building'
  if (score <= 75) return 'established'
  return 'sophisticated'
}

// ── PORTFOLIO TIER WITH HYSTERESIS ───────────────────────────────────────────

export function computePortfolioTier(params: {
  financialPosition: number
  previousTier: 1 | 2 | 3 | 4 | null
}): 1 | 2 | 3 | 4 {
  const { financialPosition, previousTier } = params

  const freshTier: 1 | 2 | 3 | 4 =
    financialPosition >= 500_000 ? 4
    : financialPosition >= 100_000 ? 3
    : financialPosition >= 25_000 ? 2
    : 1

  // No previous tier — fresh calculation, no hysteresis
  if (previousTier === null) return freshTier

  // Tier up: immediately when value crosses floor
  if (freshTier > previousTier) return freshTier

  // Tier down: only when 20% below current tier's floor
  if (freshTier < previousTier) {
    const tierFloors: Record<1 | 2 | 3 | 4, number> = {
      1: 0, 2: 25_000, 3: 100_000, 4: 500_000,
    }
    const currentFloor = tierFloors[previousTier]
    const hysteresisThreshold = currentFloor * 0.8
    if (financialPosition < hysteresisThreshold) {
      return freshTier
    }
    return previousTier
  }

  return previousTier
}

// ── VEHICLE PERCENTAGES ───────────────────────────────────────────────────────

export function computeVehiclePercentages(params: {
  holdings: PortfolioHolding[]
  financialPosition: number
}): { cashLikeVehiclePct: number; illiquidSpeculativePct: number } {
  const { holdings, financialPosition } = params
  if (financialPosition === 0) {
    return { cashLikeVehiclePct: 0, illiquidSpeculativePct: 0 }
  }

  let cashLikeTotal = 0
  let illiquidTotal = 0

  for (const h of holdings) {
    if (CASH_LIKE_VEHICLES.has(h.assetSubtype)) {
      cashLikeTotal += h.currentValue
    }
    if (ILLIQUID_SPECULATIVE_VEHICLES.has(h.assetSubtype)) {
      illiquidTotal += h.currentValue
    }
  }

  return {
    cashLikeVehiclePct: Math.min(100, Math.max(0,
      Math.round((cashLikeTotal / financialPosition) * 100)
    )),
    illiquidSpeculativePct: Math.min(100, Math.max(0,
      Math.round((illiquidTotal / financialPosition) * 100)
    )),
  }
}

// ── INVESTING FREQUENCY ───────────────────────────────────────────────────────

export function computeInvestingFrequency(
  transactions: SpendTransaction[],
  monthsOfData: number
): InvestingFrequency {
  if (monthsOfData === 0) return 'unknown'

  const lookbackMonths = Math.min(3, monthsOfData)
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - lookbackMonths)

  const investmentCount = transactions.filter(t =>
    t.category === 'investment_transfer' &&
    t.date >= cutoff
  ).length

  const avgPerMonth = investmentCount / lookbackMonths

  if (avgPerMonth > 3) return 'frequent'
  if (avgPerMonth >= 1) return 'monthly'
  return 'rarely'
}

// ── SAVINGS RATE BAND ─────────────────────────────────────────────────────────

export function computeSavingsRateBand(
  transactions: SpendTransaction[],
  selectedMonth: string   // 'YYYY-MM'
): SavingsRateBand {
  const monthTxns = transactions.filter(t => {
    const d = t.date instanceof Date ? t.date : new Date(t.date)
    return d.toISOString().slice(0, 7) === selectedMonth
  })

  const income = monthTxns
    .filter(t => t.category === 'income' && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0)

  if (income === 0) return 'unknown'

  const spend = monthTxns
    .filter(t =>
      t.category !== 'investment_transfer' &&
      t.category !== 'transfer' &&
      t.category !== 'income'
    )
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  const rate = ((income - spend) / income) * 100

  if (rate < 10) return 'low'
  if (rate <= 30) return 'medium'
  return 'high'
}

// ── IMPORT FRESHNESS ──────────────────────────────────────────────────────────

export function computeImportFreshness(
  lastImportDate: string | null
): ImportFreshness {
  if (!lastImportDate) return 'never'

  const daysSince = daysBetween(new Date(lastImportDate), new Date()) * -1
  // daysBetween returns later - earlier, so for past dates it's negative
  const daysAgo = Math.abs(
    Math.floor(
      (new Date().getTime() - new Date(lastImportDate).getTime()) /
      (1000 * 60 * 60 * 24)
    )
  )

  if (daysAgo < 30) return 'fresh'
  if (daysAgo < 90) return 'stale'
  return 'very_stale'
}

// ── MAIN BUILDER ──────────────────────────────────────────────────────────────

export default async function buildUserFinancialProfile(params: {
  holdings: PortfolioHolding[]
  transactions: SpendTransaction[]
  dataSources: Array<{ institution: string; lastImported?: Date }>
  financialPosition: number
  riskProfile: string
  baseCountry: string
  householdType: HouseholdType
  managedProfileCount: number
  onboardingComplete: boolean
  riskProfileActivelySet: boolean
  protectionDesignated: boolean
  protectionMonthsCovered: number
  budgetsConfigured: boolean
  monthlyTargetSet: boolean
  fireIsSetUp: boolean
  skippedAgeScreen: boolean
  monthlyReviewCount: number
  importCountLifetime: number
  hasMortgage: boolean
  firstSeenDate: string
  firstUploadDate: string | null
  existingProfile: UserFinancialProfile | null
}): Promise<UserFinancialProfile> {
  const {
    holdings,
    transactions,
    dataSources,
    financialPosition,
    existingProfile,
  } = params

  const now = new Date()
  const total = financialPosition > 0 ? financialPosition : 1

  // ── STEP 1: Financial vehicles ──────────────────────────────────────────────
  const financialVehicles = [...new Set(holdings.map(h => h.assetSubtype))]

  // ── STEP 2: Geography exposure (percentages) ────────────────────────────────
  const geoGroups: Record<string, number> = {}
  for (const h of holdings) {
    geoGroups[h.geography] = (geoGroups[h.geography] ?? 0) + h.currentValue
  }
  const geographyExposure: Record<string, number> = {}
  for (const [geo, val] of Object.entries(geoGroups)) {
    geographyExposure[geo] = Math.round((val / total) * 100)
  }

  // ── STEP 3: Currency exposure (percentages) ─────────────────────────────────
  const currencyGroups: Record<string, number> = {}
  for (const h of holdings) {
    currencyGroups[h.currency] =
      (currencyGroups[h.currency] ?? 0) + h.currentValue
  }
  const currencyExposure: Record<string, number> = {}
  for (const [cur, val] of Object.entries(currencyGroups)) {
    currencyExposure[cur] = Math.round((val / total) * 100)
  }

  // ── STEP 4: Portfolio tier with hysteresis ──────────────────────────────────
  const previousTier = existingProfile?.portfolioTier ?? null
  const portfolioTier = computePortfolioTier({ financialPosition, previousTier })

  // ── STEP 5: Tier change detection ──────────────────────────────────────────
  let tierChangedAt = existingProfile?.tierChangedAt ?? null
  let tierChangeDirection: 'up' | 'down' | null =
    existingProfile?.tierChangeDirection ?? null

  if (previousTier !== null && portfolioTier !== previousTier) {
    tierChangeDirection = portfolioTier > previousTier ? 'up' : 'down'
    tierChangedAt = now.toISOString()
  }

  // ── STEP 6: Bucket percentages ──────────────────────────────────────────────
  const growthSum = holdings
    .filter(h => h.bucket === 'GROWTH')
    .reduce((s, h) => s + h.currentValue, 0)
  const stabilitySum = holdings
    .filter(h => h.bucket === 'STABILITY')
    .reduce((s, h) => s + h.currentValue, 0)
  const lockedSum = holdings
    .filter(h => h.bucket === 'LOCKED')
    .reduce((s, h) => s + h.currentValue, 0)

  const growthPct = Math.round((growthSum / total) * 100)
  const stabilityPct = Math.round((stabilitySum / total) * 100)
  const lockedPct = Math.round((lockedSum / total) * 100)

  // ── STEP 7: Vehicle percentages ─────────────────────────────────────────────
  const { cashLikeVehiclePct, illiquidSpeculativePct } =
    computeVehiclePercentages({ holdings, financialPosition })

  // ── STEP 8: Employer stock percentage ──────────────────────────────────────
  const employerStockSum = holdings
    .filter(h =>
      h.assetSubtype === 'employer_rsu' || h.assetSubtype === 'employer_espp'
    )
    .reduce((s, h) => s + h.currentValue, 0)
  const employerStockPct = Math.round((employerStockSum / total) * 100)

  // ── STEP 9: Largest holding percentage ─────────────────────────────────────
  const largestHoldingPct = holdings.length === 0
    ? 0
    : Math.round(
        (Math.max(...holdings.map(h => h.currentValue)) / total) * 100
      )

  // ── STEP 10: Vesting event within 30 days ──────────────────────────────────
  const hasVestingEventSoon = holdings.some(h => {
    if (!h.vestingDate) return false
    const daysUntil = daysBetween(now, h.vestingDate)
    return daysUntil >= 0 && daysUntil <= 30
  })

  // ── STEP 11: Investment style ───────────────────────────────────────────────
  const passiveVehicles = new Set(['eu_etf', 'index_fund'])
  const activeVehicles = new Set([
    'in_mutual_fund', 'active_mutual_fund',
    'direct_equity', 'fractional_equity',
  ])

  const equityHoldings = holdings.filter(h =>
    passiveVehicles.has(h.assetSubtype) || activeVehicles.has(h.assetSubtype)
  )
  const equityTotal = equityHoldings.reduce((s, h) => s + h.currentValue, 0)

  let investmentStyle: InvestmentStyle = 'unknown'
  if (equityTotal > 0) {
    const passiveSum = equityHoldings
      .filter(h => passiveVehicles.has(h.assetSubtype))
      .reduce((s, h) => s + h.currentValue, 0)
    const activeSum = equityHoldings
      .filter(h => activeVehicles.has(h.assetSubtype))
      .reduce((s, h) => s + h.currentValue, 0)
    const passivePct = (passiveSum / equityTotal) * 100
    const activePct = (activeSum / equityTotal) * 100

    if (passivePct > 80) investmentStyle = 'passive'
    else if (activePct > 60) investmentStyle = 'active'
    else if (passivePct > 20 && activePct > 20) investmentStyle = 'mixed'
  }

  // ── STEP 12: NRI profile ────────────────────────────────────────────────────
  const isNriProfile =
    params.baseCountry !== 'IN' &&
    (geographyExposure['india'] ?? 0) > 0

  // ── STEP 13: Data completeness signals ─────────────────────────────────────
  const INDIAN_INSTITUTIONS = new Set([
    'HDFC_BANK', 'HDFC_SECURITIES', 'ICICI_BANK', 'SBI',
    'AXIS_BANK', 'KOTAK', 'ADITYA_BIRLA', 'ZERODHA', 'GROWW',
  ])
  const EUROPEAN_INSTITUTIONS = new Set([
    'ABN_AMRO', 'ING_NL', 'RABOBANK', 'BUNQ', 'SNS_BANK',
    'N26', 'REVOLUT', 'WISE', 'DEGIRO', 'IBKR',
  ])
  const INVESTMENT_PLATFORMS = new Set([
    'DEGIRO', 'IBKR', 'ZERODHA', 'GROWW',
  ])
  const SPEND_INSTITUTIONS = new Set([
    'ABN_AMRO', 'ING_NL', 'RABOBANK', 'BUNQ', 'SNS_BANK',
    'N26', 'REVOLUT', 'WISE', 'HDFC_BANK', 'ICICI_BANK',
    'SBI', 'AXIS_BANK', 'KOTAK', 'BARCLAYS', 'HSBC',
    'MONZO', 'CHASE', 'SCHWAB',
  ])
  const PORTFOLIO_INSTITUTIONS = new Set([
    'DEGIRO', 'IBKR', 'ZERODHA', 'GROWW', 'HDFC_SECURITIES',
  ])

  const hasSpendSource = transactions.length > 0
  const hasPortfolioSource = holdings.length > 0
  const hasIndianSource = dataSources.some(ds =>
    INDIAN_INSTITUTIONS.has(ds.institution)
  )
  const hasEuropeanSource = dataSources.some(ds =>
    EUROPEAN_INSTITUTIONS.has(ds.institution)
  )
  const hasInvestmentPlatform = dataSources.some(ds =>
    INVESTMENT_PLATFORMS.has(ds.institution)
  )

  const salarySlipUploaded = await storageService.get(
    STORAGE_KEYS.SALARY_SLIP_UPLOADED
  )
  const hasSalarySlip = salarySlipUploaded === 'true'

  // Import dates
  const spendSources = dataSources.filter(ds =>
    SPEND_INSTITUTIONS.has(ds.institution)
  )
  const portfolioSources = dataSources.filter(ds =>
    PORTFOLIO_INSTITUTIONS.has(ds.institution)
  )

  const lastSpendImportDate = spendSources
    .map(ds => ds.lastImported)
    .filter((d): d is Date => d !== undefined)
    .sort((a, b) => b.getTime() - a.getTime())[0]
    ?.toISOString().slice(0, 10) ?? null

  const lastPortfolioImportDate = portfolioSources
    .map(ds => ds.lastImported)
    .filter((d): d is Date => d !== undefined)
    .sort((a, b) => b.getTime() - a.getTime())[0]
    ?.toISOString().slice(0, 10) ?? null

  const allImportDates = dataSources
    .map(ds => ds.lastImported)
    .filter((d): d is Date => d !== undefined)
  const latestImport = allImportDates
    .sort((a, b) => b.getTime() - a.getTime())[0]
  const importFreshness = computeImportFreshness(
    latestImport?.toISOString().slice(0, 10) ?? null
  )

  // Data months
  const distinctSpendMonths = new Set(
    transactions.map(t => {
      const d = t.date instanceof Date ? t.date : new Date(t.date)
      return d.toISOString().slice(0, 7)
    })
  )
  const dataMonthsSpend = distinctSpendMonths.size

  const portfolioSourceDates = portfolioSources
    .map(ds => ds.lastImported)
    .filter((d): d is Date => d !== undefined)
    .sort((a, b) => a.getTime() - b.getTime())
  const dataMonthsPortfolio = portfolioSourceDates.length > 0
    ? Math.max(1, monthsBetween(portfolioSourceDates[0], now))
    : 0

  const institutionsConnected = dataSources.length

  // ── STEP 14: Investing frequency ───────────────────────────────────────────
  const investingFrequency = computeInvestingFrequency(
    transactions,
    dataMonthsSpend
  )

  // ── STEP 15: Savings rate band ──────────────────────────────────────────────
  const savingsRateBand = computeSavingsRateBand(
    transactions,
    now.toISOString().slice(0, 7)
  )

  // ── STEP 16: Sophistication score ──────────────────────────────────────────
  const sophisticationScore = computeSophisticationScore({
    financialVehicles,
    growthPct,
    stabilityPct,
    lockedPct,
    protectionMonthsCovered: params.protectionMonthsCovered,
    investingFrequency,
    geographyExposure,
  })
  const sophisticationBand = computeSophisticationBand(sophisticationScore)

  // ── STEP 17: Portfolio tier label ───────────────────────────────────────────
  const tierLabels: Record<1 | 2 | 3 | 4, import('../types/userProfile').PortfolioTierLabel> = {
    1: 'starter', 2: 'growing', 3: 'established', 4: 'significant',
  }
  const portfolioTierLabel = tierLabels[portfolioTier]

  // ── STEP 18: AI insights enabled ───────────────────────────────────────────
  const apiKey = await storageService.get(STORAGE_KEYS.AI_API_KEY)
  const aiInsightsEnabled = !!apiKey && apiKey.trim().length > 40

  // ── STEP 19: Assemble ───────────────────────────────────────────────────────
  return {
    portfolioTier,
    portfolioTierLabel,
    previousPortfolioTier: previousTier,
    tierChangedAt,
    tierChangeDirection,

    sophisticationScore,
    sophisticationBand,

    investmentStyle,
    isNriProfile,
    financialVehicles,

    growthPct,
    stabilityPct,
    lockedPct,
    cashLikeVehiclePct,
    illiquidSpeculativePct,
    employerStockPct,
    largestHoldingPct,
    protectionMonthsCovered: params.protectionMonthsCovered,
    hasVestingEventSoon,

    geographyExposure,
    currencyExposure,

    savingsRateBand,
    investingFrequency,

    dataMonthsSpend,
    dataMonthsPortfolio,
    institutionsConnected,
    hasSpendSource,
    hasPortfolioSource,
    hasIndianSource,
    hasEuropeanSource,
    hasInvestmentPlatform,
    hasSalarySlip,
    importFreshness,
    lastSpendImportDate,
    lastPortfolioImportDate,
    importCountLifetime: params.importCountLifetime,

    onboardingComplete: params.onboardingComplete,
    riskProfileActivelySet: params.riskProfileActivelySet,
    protectionDesignated: params.protectionDesignated,
    aiInsightsEnabled,
    monthlyReviewCount: params.monthlyReviewCount,
    budgetsConfigured: params.budgetsConfigured,
    monthlyTargetSet: params.monthlyTargetSet,
    fireIsSetUp: params.fireIsSetUp,

    householdType: params.householdType,
    managedProfileCount: params.managedProfileCount,
    hasMortgage: params.hasMortgage,

    skippedAgeScreen: params.skippedAgeScreen,
    firstSeenDate: params.firstSeenDate,
    firstUploadDate: params.firstUploadDate,

    lastCalculatedAt: now.toISOString(),
  }
}
