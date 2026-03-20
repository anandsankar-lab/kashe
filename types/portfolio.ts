// /types/portfolio.ts

export type BucketType = 'GROWTH' | 'STABILITY' | 'LOCKED'

// Broad class — used for display grouping and UI hints only.
// DO NOT use for bucket assignment — use assetSubtype instead.
export type AssetClass =
  | 'equity'
  | 'fixed_income'
  | 'cash'
  | 'retirement'      // regulated lock-in instruments
  | 'alternative'     // illiquid, unlisted
  | 'crypto'

// Specific instrument — drives bucket defaults, lock logic,
// projection rates, and parser detection.
export type AssetSubtype =
  // ── India ──────────────────────────────────────────────
  | 'in_mutual_fund'       // equity MFs, ELSS, flexi-cap
  | 'in_debt_fund'         // debt MFs, liquid funds → STABILITY
  | 'in_direct_equity'     // NSE/BSE stocks
  | 'in_nre_nro'           // NRE/NRO savings accounts
  | 'in_ppf'               // Public Provident Fund
  | 'in_epf'               // Employee Provident Fund
  | 'in_nps'               // National Pension System
  | 'in_fd'                // Fixed Deposit (bank)
  | 'in_nsc'               // National Savings Certificate
  | 'in_bonds'             // RBI Bonds, Sovereign Gold Bonds
  // ── Europe ─────────────────────────────────────────────
  | 'eu_etf'               // DeGiro, IBKR ETFs
  | 'eu_direct_equity'     // European listed stocks
  | 'eu_pension'           // Occupational pension (NL/DE/FR)
  | 'eu_savings'           // High-yield savings accounts
  // ── UK ─────────────────────────────────────────────────
  | 'uk_isa'               // Stocks & Shares ISA
  | 'uk_cash_isa'          // Cash ISA (distinct tax treatment)
  | 'uk_sipp'              // Self-Invested Personal Pension
  | 'uk_lisa'              // Lifetime ISA (25% bonus, lock-in)
  | 'uk_direct_equity'     // UK listed stocks
  | 'uk_premium_bonds'     // NS&I Premium Bonds
  // ── US ─────────────────────────────────────────────────
  | 'us_401k'              // Traditional 401(k)
  | 'us_roth_401k'         // Roth 401(k)
  | 'us_ira'               // Traditional IRA
  | 'us_roth_ira'          // Roth IRA
  | 'us_brokerage'         // Taxable brokerage (Fidelity, Schwab)
  | 'us_hsa'               // Health Savings Account
  | 'us_529'               // Education savings plan
  // ── Employer ───────────────────────────────────────────
  | 'employer_rsu'         // Restricted Stock Units
  | 'employer_espp'        // Employee Stock Purchase Plan
  // ── Universal ──────────────────────────────────────────
  | 'crypto_general'       // Any cryptocurrency
  | 'alternative_general'  // Crowdcube, Seedrs, angel
  | 'cash_general'         // Any savings/current not above

// Optional tax wrapper — same instrument can be sheltered or not.
// V1: store + display only. V2: feeds FIRE tax projections.
export type TaxWrapper =
  | 'uk_isa'
  | 'uk_sipp'
  | 'uk_lisa'
  | 'us_401k'
  | 'us_roth_ira'
  | 'us_ira'
  | 'us_hsa'
  | 'us_529'
  | 'in_elss'         // 80C tax benefit
  | 'in_nps'          // 80C + 80CCD benefit
  | 'eu_pension'      // employer pension (tax-deferred contributions)
  | 'none'

export type Geography = 'india' | 'europe' | 'uk' | 'us' | 'other'

export type FreshnessStatus = 'fresh' | 'amber' | 'stale'

export interface PortfolioHolding {
  id: string
  name: string
  ticker?: string
  isin?: string              // ISIN code e.g. 'IE00B3RBWM25'
  assetClass: AssetClass        // display/grouping hint
  assetSubtype: AssetSubtype    // drives all logic
  taxWrapper?: TaxWrapper       // V1: display only
  bucket: BucketType
  bucketOverride?: BucketType
  geography: Geography
  currentValue: number
  currency: string              // ISO 4217
  valueInBaseCurrency: number
  dailyChangePercent?: number
  purchasePrice?: number
  quantity?: number
  lastUpdated: string           // ISO date string
  freshnessStatus: FreshnessStatus
  isProtection?: boolean
  avgMonthlySpend?: number      // protection calc only
  // Locked-specific
  unlockDate?: string
  lockedReason?: string
  projectedRate?: number        // e.g. 0.071 for PPF
  domicile?: string             // e.g. 'Ireland', 'United States', 'Netherlands'
  // Employer stock
  vestingDate?: string
  unvested?: boolean            // excluded from FIRE PV if true
}

export interface PortfolioTotals {
  liveTotal: number
  lockedTotal: number
  combinedTotal: number
  monthlyDeltaLive: number
  baseCurrency: string
  lastRefreshed: string
}

export interface SalaryContribution {
  id: string
  name: string
  amountPerMonth: number
  currency: string
  bucket: BucketType
}

export interface InvestmentPlan {
  monthlyTarget?: number
  investedThisMonth: number
  salaryContributions: SalaryContribution[]
}

export interface AllocationSuggestion {
  bucket: BucketType
  suggestedAmount: number
  suggestedPercent: number
}

export interface PortfolioInsight {
  id: string
  headline: string
  body: string
}

// Default bucket per subtype — single source of truth.
// UI and services both import this. Never duplicated.
export const DEFAULT_BUCKET: Record<AssetSubtype, BucketType> = {
  in_mutual_fund:      'GROWTH',
  in_debt_fund:        'STABILITY',
  in_direct_equity:    'GROWTH',
  in_nre_nro:          'STABILITY',
  in_ppf:              'LOCKED',
  in_epf:              'LOCKED',
  in_nps:              'LOCKED',
  in_fd:               'STABILITY',
  in_nsc:              'LOCKED',
  in_bonds:            'STABILITY',
  eu_etf:              'GROWTH',
  eu_direct_equity:    'GROWTH',
  eu_pension:          'LOCKED',
  eu_savings:          'STABILITY',
  uk_isa:              'GROWTH',
  uk_cash_isa:         'STABILITY',
  uk_sipp:             'LOCKED',
  uk_lisa:             'LOCKED',
  uk_direct_equity:    'GROWTH',
  uk_premium_bonds:    'STABILITY',
  us_401k:             'LOCKED',
  us_roth_401k:        'LOCKED',
  us_ira:              'LOCKED',
  us_roth_ira:         'LOCKED',
  us_brokerage:        'GROWTH',
  us_hsa:              'LOCKED',
  us_529:              'LOCKED',
  employer_rsu:        'GROWTH',
  employer_espp:       'GROWTH',
  crypto_general:      'GROWTH',
  alternative_general: 'LOCKED',
  cash_general:        'STABILITY',
}
