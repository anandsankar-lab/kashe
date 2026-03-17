export type RiskProfileType = 'conservative' | 'balanced' | 'growth'

export interface RiskProfile {
  type: RiskProfileType
  label: string
  description: string
  targetAllocation: {
    growth: number
    stability: number
    locked: number
  }
}

export const RISK_PROFILES: Record<RiskProfileType, RiskProfile> = {
  conservative: {
    type: 'conservative',
    label: 'Conservative',
    description: 'Protect what I have, grow slowly',
    targetAllocation: { growth: 40, stability: 40, locked: 20 },
  },
  balanced: {
    type: 'balanced',
    label: 'Balanced',
    description: 'Grow steadily, some volatility is fine',
    targetAllocation: { growth: 60, stability: 20, locked: 20 },
  },
  growth: {
    type: 'growth',
    label: 'Growth',
    description: 'Maximise growth, I can ride out dips',
    targetAllocation: { growth: 80, stability: 10, locked: 10 },
  },
}
