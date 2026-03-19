import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import secureStorageAdapter from '../services/secureStorageAdapter'
import { STORAGE_KEYS } from '../services/storageService'

// ── LOCAL TYPES ───────────────────────────────────────────────────────────────

export type InsightType =
  | 'MARKET_EVENT_ALERT'
  | 'PORTFOLIO_HEALTH'
  | 'INVESTMENT_OPPORTUNITY'
  | 'MONTHLY_REVIEW'

export interface Insight {
  id: string
  type: InsightType
  headline: string
  body: string
  generatedAt: string
  expiresAt: string
  dismissed: boolean
  dismissedAt: string | null
  source?: string
  sourceUrl?: string
  sentiment?: 'bullish' | 'bearish' | 'mixed' | 'neutral'
  confidence?: 'high' | 'medium' | 'low'
  action?: {
    label: string
    type: 'VIEW_HOLDING' | 'VIEW_SUGGESTIONS' | 'VIEW_FIRE'
    payload?: string
  }
}

export interface MonthlyReview {
  monthYear: string
  generatedAt: string
  viewed: boolean
  whereYouStand: string
  howMoneyIsWorking: {
    growth: string
    stability: string
    locked: string
    protection: string
  }
  thisMonthsPriority: {
    headline: string
    reasoning: string
    bucketTarget: 'GROWTH' | 'STABILITY' | 'LOCKED' | null
  }
  fireUpdate: {
    headline: string
    detail: string
  } | null
  nextMonthWatchlist: string[]
}

export interface AIUsageRecord {
  inputTokensThisMonth: number
  outputTokensThisMonth: number
  callCount: number
  monthYear: string
  tier: 'free' | 'paid'
  lastUpdated: string
}

// ── STATE SHAPE ───────────────────────────────────────────────────────────────

interface InsightsState {
  activeInsight: Insight | null
  monthlyReviews: MonthlyReview[]
  aiUsage: AIUsageRecord
  lastInsightCheck: string | null
}

interface InsightsActions {
  setActiveInsight(insight: Insight | null): void
  dismissInsight(insightId: string): void
  setMonthlyReview(review: MonthlyReview): void
  markReviewViewed(monthYear: string): void
  logAPIUsage(tokens: { input: number; output: number }): void
  setLastInsightCheck(timestamp: string): void
}

type InsightsStore = InsightsState & InsightsActions

// ── STORE ─────────────────────────────────────────────────────────────────────

const useInsightsStore = create<InsightsStore>()(
  persist(
    (set) => ({
      activeInsight: null,
      monthlyReviews: [],
      aiUsage: {
        inputTokensThisMonth: 0,
        outputTokensThisMonth: 0,
        callCount: 0,
        monthYear: new Date().toISOString().slice(0, 7),
        tier: 'free',
        lastUpdated: new Date().toISOString(),
      },
      lastInsightCheck: null,

      setActiveInsight(insight) {
        set({ activeInsight: insight })
      },

      dismissInsight(insightId) {
        set((state) => {
          if (state.activeInsight?.id !== insightId) return state
          return {
            ...state,
            activeInsight: {
              ...state.activeInsight,
              dismissed: true,
              dismissedAt: new Date().toISOString(),
            },
          }
        })
      },

      setMonthlyReview(review) {
        set((state) => {
          const idx = state.monthlyReviews.findIndex(
            (r) => r.monthYear === review.monthYear,
          )
          const upserted =
            idx !== -1
              ? [
                  ...state.monthlyReviews.slice(0, idx),
                  review,
                  ...state.monthlyReviews.slice(idx + 1),
                ]
              : [...state.monthlyReviews, review]

          const sorted = [...upserted].sort((a, b) =>
            a.monthYear.localeCompare(b.monthYear),
          )
          const trimmed = sorted.length > 12 ? sorted.slice(sorted.length - 12) : sorted

          return { ...state, monthlyReviews: trimmed }
        })
      },

      markReviewViewed(monthYear) {
        set((state) => {
          const idx = state.monthlyReviews.findIndex(
            (r) => r.monthYear === monthYear,
          )
          if (idx === -1) return state
          return {
            ...state,
            monthlyReviews: [
              ...state.monthlyReviews.slice(0, idx),
              { ...state.monthlyReviews[idx], viewed: true } as MonthlyReview,
              ...state.monthlyReviews.slice(idx + 1),
            ],
          }
        })
      },

      logAPIUsage(tokens) {
        const currentMonth = new Date().toISOString().slice(0, 7)
        set((state) => {
          const base =
            state.aiUsage.monthYear === currentMonth
              ? state.aiUsage
              : {
                  ...state.aiUsage,
                  inputTokensThisMonth: 0,
                  outputTokensThisMonth: 0,
                  callCount: 0,
                  monthYear: currentMonth,
                }
          return {
            ...state,
            aiUsage: {
              ...base,
              inputTokensThisMonth: base.inputTokensThisMonth + tokens.input,
              outputTokensThisMonth: base.outputTokensThisMonth + tokens.output,
              callCount: base.callCount + 1,
              lastUpdated: new Date().toISOString(),
            },
          }
        })
      },

      setLastInsightCheck(timestamp) {
        set({ lastInsightCheck: timestamp })
      },
    }),
    {
      name: STORAGE_KEYS.INSIGHTS_STORE,
      storage: createJSONStorage(() => secureStorageAdapter),
    },
  ),
)

export default useInsightsStore
