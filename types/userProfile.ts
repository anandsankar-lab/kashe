// /types/userProfile.ts
// The spine of Kāshe's intelligence layer.
// Every insight, trigger, source selector, and analytics call reads from this.
// Computed from raw store data and cached.
// NEVER sent directly to Claude — feeds context builders which sanitise first.

import type { SpendCategory } from './spend'

export type PortfolioTierLabel =
  'starter' | 'growing' | 'established' | 'significant'

export type SophisticationBand =
  'foundation' | 'building' | 'established' | 'sophisticated'

export type ImportFreshness =
  'fresh' | 'stale' | 'very_stale' | 'never'

export type HouseholdType =
  'individual' | 'couple' | 'family' | 'multi_managed'

export type InvestingFrequency =
  'rarely' | 'monthly' | 'frequent' | 'unknown'

export type SavingsRateBand =
  'low' | 'medium' | 'high' | 'unknown'

export type InvestmentStyle =
  'passive' | 'active' | 'mixed' | 'unknown'

export interface UserFinancialProfile {

  // ── PORTFOLIO TIER ────────────────────────────────
  // Size-based tier with hysteresis
  // Tier up: immediately on crossing floor
  // Tier down: only when 20% below floor
  //   (prevents oscillation on market movements)
  // Tier 1: < €25k
  // Tier 2: €25k–€100k
  // Tier 3: €100k–€500k
  // Tier 4: > €500k
  portfolioTier: 1 | 2 | 3 | 4
  portfolioTierLabel: PortfolioTierLabel
  previousPortfolioTier: 1 | 2 | 3 | 4 | null
  tierChangedAt: string | null           // ISO string
  tierChangeDirection: 'up' | 'down' | null

  // ── SOPHISTICATION SCORE ──────────────────────────
  // 0–100, computed from vehicle diversity, liquidity
  // balance, protection coverage, investing consistency,
  // and geographic spread.
  // Adjusts insight depth and PORTFOLIO_HEALTH framing.
  // NEVER shown to user as a number.
  sophisticationScore: number
  sophisticationBand: SophisticationBand
  // foundation  (0–25):   basics missing
  // building   (26–50):   progress, gaps remain
  // established (51–75):  solid foundations
  // sophisticated (76–100): diversified, consistent

  // ── INVESTMENT IDENTITY ───────────────────────────
  investmentStyle: InvestmentStyle
  isNriProfile: boolean

  // ── FINANCIAL VEHICLES ────────────────────────────
  // Every assetSubtype held across ALL holdings.
  // Drives source selection in the insight engine —
  // not instrument types on the fly.
  financialVehicles: string[]

  // ── PRECOMPUTED TRIGGER INPUTS ───────────────────
  // Avoids re-deriving on every trigger evaluation.
  // All percentages — never absolute values.
  growthPct: number
  stabilityPct: number
  lockedPct: number
  cashLikeVehiclePct: number       // % in cash-like vehicles
  illiquidSpeculativePct: number   // locked + alternative + crypto %
  employerStockPct: number
  largestHoldingPct: number
  protectionMonthsCovered: number
  hasVestingEventSoon: boolean     // any vesting within 30 days

  // ── GEOGRAPHIC + CURRENCY EXPOSURE ───────────────
  // Percentages only — never absolute values
  geographyExposure: Record<string, number>
  currencyExposure: Record<string, number>

  // ── SPEND BEHAVIOUR ───────────────────────────────
  savingsRateBand: SavingsRateBand
  investingFrequency: InvestingFrequency

  // ── DATA COMPLETENESS ─────────────────────────────
  dataMonthsSpend: number
  dataMonthsPortfolio: number
  institutionsConnected: number
  hasSpendSource: boolean
  hasPortfolioSource: boolean
  hasIndianSource: boolean
  hasEuropeanSource: boolean
  hasInvestmentPlatform: boolean
  hasSalarySlip: boolean
  importFreshness: ImportFreshness
  lastSpendImportDate: string | null    // 'YYYY-MM-DD'
  lastPortfolioImportDate: string | null
  importCountLifetime: number

  // ── ENGAGEMENT MILESTONES ─────────────────────────
  onboardingComplete: boolean
  riskProfileActivelySet: boolean
  // true ONLY if user changed from Balanced default
  protectionDesignated: boolean
  aiInsightsEnabled: boolean
  monthlyReviewCount: number
  budgetsConfigured: boolean
  monthlyTargetSet: boolean
  fireIsSetUp: boolean
  // true if FIRE inputs have been entered.
  // Affects monthly review — fireUpdate section is null
  // when false. No FIRE generation in V1.

  // ── HOUSEHOLD ─────────────────────────────────────
  householdType: HouseholdType
  managedProfileCount: number
  hasMortgage: boolean

  // ── ONBOARDING PATH ───────────────────────────────
  skippedAgeScreen: boolean
  firstSeenDate: string              // 'YYYY-MM'
  firstUploadDate: string | null     // 'YYYY-MM-DD'

  // ── CACHE ─────────────────────────────────────────
  lastCalculatedAt: string | null    // ISO string
  // Staleness: 24 hours — recalculate on stale + on
  // any data change event
}

// Vehicle → asset class category mapping.
// Used for sophistication score diversity calculation.
export const VEHICLE_CATEGORY_MAP: Record<string, string> = {
  // Cash-like
  savings_account:     'cash_like',
  nre_account:         'cash_like',
  nro_account:         'cash_like',
  fixed_deposit:       'cash_like',
  money_market_fund:   'cash_like',
  liquid_fund:         'cash_like',
  // Fixed income
  bond_etf:            'fixed_income',
  bond_fund:           'fixed_income',
  debt_fund:           'fixed_income',
  // Equity
  eu_etf:              'equity',
  index_fund:          'equity',
  in_mutual_fund:      'equity',
  active_mutual_fund:  'equity',
  direct_equity:       'equity',
  fractional_equity:   'equity',
  employer_rsu:        'equity',
  employer_espp:       'equity',
  crypto_spot:         'equity',   // track only — but counts as equity for diversity
  // Locked
  ppf:                 'locked',
  epf:                 'locked',
  nps:                 'locked',
  pension_scheme:      'locked',
  govt_savings_scheme: 'locked',
  endowment_policy:    'locked',
  // Alternative
  equity_crowdfunding: 'alternative',
  angel_investment:    'alternative',
}

// Cash-like vehicles for cashLikeVehiclePct calculation
export const CASH_LIKE_VEHICLES = new Set([
  'savings_account', 'nre_account', 'nro_account',
  'fixed_deposit', 'money_market_fund', 'liquid_fund',
])

// Illiquid/speculative vehicles for illiquidSpeculativePct
export const ILLIQUID_SPECULATIVE_VEHICLES = new Set([
  'ppf', 'epf', 'nps', 'pension_scheme',
  'govt_savings_scheme', 'endowment_policy',
  'equity_crowdfunding', 'angel_investment', 'crypto_spot',
])

// SpendCategory is used by callers composing profiles from transaction data
export type { SpendCategory }
