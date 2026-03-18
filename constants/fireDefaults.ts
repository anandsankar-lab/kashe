export type FireGeography =
  'NL' | 'IN' | 'GB' | 'US' | 'DE' | 'BE' | 'OTHER'

export interface FireCountryDefaults {
  inflationRatePct: number
  expectedReturnPct: number
  label: string
}

export const FIRE_COUNTRY_DEFAULTS: Record<
  FireGeography,
  FireCountryDefaults
> = {
  NL: {
    inflationRatePct: 3.0,
    expectedReturnPct: 7.0,
    label: 'Netherlands',
  },
  IN: {
    inflationRatePct: 5.0,
    expectedReturnPct: 8.5,
    label: 'India',
  },
  GB: {
    inflationRatePct: 3.0,
    expectedReturnPct: 7.0,
    label: 'United Kingdom',
  },
  US: {
    inflationRatePct: 3.0,
    expectedReturnPct: 7.0,
    label: 'United States',
  },
  DE: {
    inflationRatePct: 3.0,
    expectedReturnPct: 7.0,
    label: 'Germany',
  },
  BE: {
    inflationRatePct: 3.0,
    expectedReturnPct: 7.0,
    label: 'Belgium',
  },
  OTHER: {
    inflationRatePct: 3.5,
    expectedReturnPct: 7.0,
    label: 'Other',
  },
}

export const SAFE_WITHDRAWAL_RATE = 4.0
export const DEFAULT_GEOGRAPHY: FireGeography = 'NL'
export const MIN_YEARS_TO_FIRE = 5
export const MAX_YEARS_TO_FIRE = 40

// FIRE number = target monthly spend × 12 ÷ SWR
// = target monthly spend × 300
export function calcFIRENumber(
  targetMonthlySpend: number
): number {
  return targetMonthlySpend * (12 / (SAFE_WITHDRAWAL_RATE / 100))
}

// Years to FIRE via future value formula
// Solves for n in: FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
// Returns null if already at or past FIRE number
export function calcYearsToFIRE(
  currentPortfolioValue: number,
  monthlyContribution: number,
  fireNumber: number,
  annualReturnPct: number
): number | null {
  if (currentPortfolioValue >= fireNumber) return null
  const r = annualReturnPct / 100 / 12  // monthly rate
  if (r === 0) {
    const months =
      (fireNumber - currentPortfolioValue) / monthlyContribution
    return months / 12
  }
  // Binary search for n (months)
  let lo = 0
  let hi = MAX_YEARS_TO_FIRE * 12
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const fv =
      currentPortfolioValue * Math.pow(1 + r, mid) +
      monthlyContribution * (Math.pow(1 + r, mid) - 1) / r
    if (fv < fireNumber) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return hi / 12
}
