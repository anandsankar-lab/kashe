import { FireGeography } from '../constants/fireDefaults'

export interface FIREInputs {
  currentPortfolioValue: number
  monthlyInvestmentAmount: number
  targetMonthlySpendRetirement: number
  currentAge: number
  expectedAnnualReturnPct: number    // default 7.0
  inflationRatePct: number           // from fireDefaults by country
  geography: FireGeography
  mortgageEndDate?: Date
  monthlyMortgagePayment?: number
  isHousehold: boolean               // true = household view
}

export interface FIREOutputs {
  fireNumber: number                 // targetSpend × 300
  yearsToFIRE: number | null         // null = already there
  projectedFIREYear: number | null
  currentTrajectoryYear: number | null
  portfolioAtFIRE: number
  safeWithdrawalAmount: number       // 4% of portfolioAtFIRE / 12
  monthlyShortfall: number           // 0 if on track
  assumptions: FIREAssumptions
}

export interface FIREAssumptions {
  safeWithdrawalRatePct: 4           // locked, never editable
  expectedReturnPct: number
  inflationRatePct: number
  inflationCountry: string
  geography: FireGeography
  primaryResidenceExcluded: true
  unvestedStockExcluded: true
  illiquidAlternativesExcluded: true
}

export interface FIRESliderState {
  targetYears: number                // 5–40, user-draggable
  impliedMonthlyContribution: number // back-calculated from targetYears
}

// Mock inputs for UI preview
export const MOCK_FIRE_INPUTS: FIREInputs = {
  currentPortfolioValue: 171700,
  monthlyInvestmentAmount: 920,
  targetMonthlySpendRetirement: 4500,
  currentAge: 38,
  expectedAnnualReturnPct: 7.0,
  inflationRatePct: 3.0,
  geography: 'NL',
  mortgageEndDate: new Date('2031-01-01'),
  monthlyMortgagePayment: 1850,
  isHousehold: true,
}
