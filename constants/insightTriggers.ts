// Ten trigger conditions. Each is a pure function.
// Testable independently. No side effects. No API calls.

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface TriggerResult {
  triggered: boolean
  triggerCode: string    // e.g. 'T1_GROWTH_UNDERFUNDED'
  severity: 'high' | 'medium' | 'low'
  contextForPrompt: Record<string, string | number | boolean>
  // Values to inject into the prompt — percentages only, no absolutes
}

export interface TriggerInput {
  // Portfolio (percentages and flags — never absolute values)
  growthPct: number
  stabilityPct: number
  lockedPct: number
  largestHoldingPct: number
  employerStockPct: number
  hasProtectionDesignation: boolean
  protectionMonthsCovered: number
  hasStabilityBondExposure: boolean
  upcomingVestingDays: number | null  // null if no vesting

  // Spend
  monthlyInvestedVsTargetPct: number  // e.g. 75 = invested 75% of target
  savingsRate: number
  hasEmployerSalaryTransaction: boolean  // income from same employer as RSU

  // Risk profile targets
  riskProfile: 'conservative' | 'balanced' | 'growth'
  // Targets derived from riskProfile:
  // conservative: growth 40 / stability 40 / locked 20
  // balanced:     growth 60 / stability 20 / locked 20
  // growth:       growth 80 / stability 10 / locked 10

  // Market signals (from last MARKET_EVENT insight)
  rateEnvironmentRising: boolean  // ECB/RBI raising rates signal
}

// ── T1 — Growth bucket underfunded ────────────────────────────────────────────

export function checkT1GrowthUnderfunded(
  input: TriggerInput
): TriggerResult {
  const target = input.riskProfile === 'conservative' ? 40
    : input.riskProfile === 'growth' ? 80 : 60
  const gap = target - input.growthPct
  const triggered = gap > 10
  return {
    triggered,
    triggerCode: 'T1_GROWTH_UNDERFUNDED',
    severity: gap > 20 ? 'high' : 'medium',
    contextForPrompt: {
      growthPct: input.growthPct,
      growthTarget: target,
      gapPct: gap,
      riskProfile: input.riskProfile,
    },
  }
}

// ── T2 — Single holding concentration ────────────────────────────────────────

export function checkT2SingleHolding(
  input: TriggerInput
): TriggerResult {
  const triggered = input.largestHoldingPct > 15
  return {
    triggered,
    triggerCode: 'T2_SINGLE_HOLDING_CONCENTRATION',
    severity: input.largestHoldingPct > 25 ? 'high' : 'medium',
    contextForPrompt: {
      largestHoldingPct: input.largestHoldingPct,
    },
  }
}

// ── T3 — Employer stock concentration ────────────────────────────────────────

export function checkT3EmployerStock(
  input: TriggerInput
): TriggerResult {
  const triggered = input.employerStockPct > 15
  return {
    triggered,
    triggerCode: 'T3_EMPLOYER_STOCK_CONCENTRATION',
    severity: input.employerStockPct > 25 ? 'high' : 'medium',
    contextForPrompt: {
      employerStockPct: input.employerStockPct,
    },
  }
}

// ── T4 — No protection designation despite cash holdings ─────────────────────

export function checkT4NoProtection(
  input: TriggerInput
): TriggerResult {
  // stabilityPct > 0 means they have some cash/savings
  const triggered = !input.hasProtectionDesignation &&
                    input.stabilityPct > 0
  return {
    triggered,
    triggerCode: 'T4_NO_PROTECTION_DESIGNATION',
    severity: 'medium',
    contextForPrompt: {
      hasProtection: input.hasProtectionDesignation,
      stabilityPct: input.stabilityPct,
    },
  }
}

// ── T5 — Under-investing vs monthly target ────────────────────────────────────

export function checkT5UnderInvesting(
  input: TriggerInput
): TriggerResult {
  const triggered = input.monthlyInvestedVsTargetPct < 80
  return {
    triggered,
    triggerCode: 'T5_UNDER_INVESTING',
    severity: input.monthlyInvestedVsTargetPct < 50 ? 'high' : 'low',
    contextForPrompt: {
      investedVsTargetPct: input.monthlyInvestedVsTargetPct,
    },
  }
}

// ── T6 — INR weakening ────────────────────────────────────────────────────────
// Caller passes hasInrWeakened after checking FX store.

export function checkT6InrWeakening(params: {
  hasInrWeakened: boolean  // >3% vs EUR in 90 days
  indiaPct: number
}): TriggerResult {
  const triggered = params.hasInrWeakened && params.indiaPct > 20
  return {
    triggered,
    triggerCode: 'T6_INR_WEAKENING',
    severity: 'medium',
    contextForPrompt: {
      indiaPct: params.indiaPct,
    },
  }
}

// ── T7 — Upcoming vesting event ───────────────────────────────────────────────

export function checkT7VestingEvent(
  input: TriggerInput
): TriggerResult {
  const triggered = input.upcomingVestingDays !== null &&
                    input.upcomingVestingDays <= 30
  return {
    triggered,
    triggerCode: 'T7_VESTING_EVENT_APPROACHING',
    severity: 'high',
    contextForPrompt: {
      vestingDays: input.upcomingVestingDays ?? 0,
      employerStockPct: input.employerStockPct,
    },
  }
}

// ── T8 — Double employer exposure ─────────────────────────────────────────────
// Income AND equity from the same company.

export function checkT8DoubleEmployerExposure(
  input: TriggerInput
): TriggerResult {
  const triggered = input.employerStockPct > 10 &&
                    input.hasEmployerSalaryTransaction
  return {
    triggered,
    triggerCode: 'T8_DOUBLE_EMPLOYER_EXPOSURE',
    severity: input.employerStockPct > 20 ? 'high' : 'medium',
    contextForPrompt: {
      employerStockPct: input.employerStockPct,
      hasSalaryFromSameEmployer: true,
    },
  }
}

// ── T9 — Liquidity gap ────────────────────────────────────────────────────────
// Too much locked up with not enough protection coverage.

export function checkT9LiquidityGap(
  input: TriggerInput
): TriggerResult {
  const triggered = input.lockedPct > 40 &&
                    input.protectionMonthsCovered < 3
  return {
    triggered,
    triggerCode: 'T9_LIQUIDITY_GAP',
    severity: 'high',
    contextForPrompt: {
      lockedPct: input.lockedPct,
      protectionMonthsCovered: input.protectionMonthsCovered,
    },
  }
}

// ── T10 — Interest rate sensitivity in Stability bucket ───────────────────────

export function checkT10RateSensitivity(
  input: TriggerInput
): TriggerResult {
  const triggered = input.stabilityPct > 30 &&
                    input.hasStabilityBondExposure &&
                    input.rateEnvironmentRising
  return {
    triggered,
    triggerCode: 'T10_RATE_SENSITIVITY',
    severity: 'medium',
    contextForPrompt: {
      stabilityPct: input.stabilityPct,
      hasStabilityBondExposure: true,
      rateEnvironmentRising: true,
    },
  }
}

// ── EVALUATE ALL TRIGGERS ─────────────────────────────────────────────────────
// Run all triggers, return all that fired.
// Sorted by severity: high → medium → low.

export function evaluateAllTriggers(
  input: TriggerInput,
  fxParams: { hasInrWeakened: boolean; indiaPct: number }
): TriggerResult[] {
  const results = [
    checkT1GrowthUnderfunded(input),
    checkT2SingleHolding(input),
    checkT3EmployerStock(input),
    checkT4NoProtection(input),
    checkT5UnderInvesting(input),
    checkT6InrWeakening(fxParams),
    checkT7VestingEvent(input),
    checkT8DoubleEmployerExposure(input),
    checkT9LiquidityGap(input),
    checkT10RateSensitivity(input),
  ].filter(r => r.triggered)

  const order: Record<'high' | 'medium' | 'low', number> = {
    high: 0, medium: 1, low: 2,
  }
  return results.sort((a, b) =>
    order[a.severity] - order[b.severity]
  )
}
