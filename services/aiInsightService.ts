// The orchestrator. Imports all four files above.
// Handles budget enforcement, lock, key security, storage.
// Single entry point for all insight generation.

import storageService, { STORAGE_KEYS } from './storageService'
import {
  SEED_SOURCES,
  getActiveSeedSources,
  computeSourceQuality,
  rankSources,
  KNOWN_HIGH_AUTHORITY_DOMAINS,
  type SourceTier,
  type DiscoveredSource,
} from '../constants/insightSources'
import {
  evaluateAllTriggers,
} from '../constants/insightTriggers'
import {
  buildMarketEventPrompt,
  buildPortfolioHealthPrompt,
  buildMonthlyReviewPrompt,
  enforceWordLimit,
  isSafeForPrompt,
  WORD_LIMITS,
} from '../constants/insightPrompts'
import {
  buildHoldingsContext,
  formatHoldingsContextForPrompt,
  formatSourceListForPrompt,
  validateForPromptSafety,
  type HoldingsContextForAI,
} from './holdingsContextBuilder'
import type {
  AIUsageRecord,
  Insight,
  MonthlyReview,
  InsightType,
} from '../store/insightsStore'
import type { SpendCategory } from '../types/spend'
import { formatCurrency } from '../constants/formatters'

// Suppress unused import warnings — these are used for future callers
void SEED_SOURCES
void KNOWN_HIGH_AUTHORITY_DOMAINS
void buildHoldingsContext

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

export const FREE_MONTHLY_TOKEN_LIMIT  = 10_000
export const PAID_MONTHLY_TOKEN_LIMIT  = 100_000
export const BUDGET_CAP_BUFFER         = 0.90
export const MAX_TOKENS_INSIGHT        = 500
export const MAX_TOKENS_MONTHLY_REVIEW = 800
export const MAX_TOKENS_DISCOVERY      = 300
export const MIN_HOURS_BETWEEN_CALLS   = 1
export const MAX_FAILURES_PER_TYPE_PER_DAY = 3

// Generation windows: A = 00:00–11:59, B = 12:00–23:59
// Max one generation per window per insight type
export type GenerationWindow = 'A' | 'B'

export function getCurrentGenerationWindow(): GenerationWindow {
  return new Date().getHours() < 12 ? 'A' : 'B'
}

// Estimated input tokens per call type (pessimistic)
const ESTIMATED_INPUT_TOKENS: Record<string, number> = {
  MARKET_EVENT_ALERT:     800,
  MARKET_EVENT_DISCOVERY: 300,
  PORTFOLIO_HEALTH:       400,
  INVESTMENT_OPPORTUNITY: 0,
  MONTHLY_REVIEW:         1_200,
}

// ── IN-MEMORY STATE ───────────────────────────────────────────────────────────
// Module-level, never persisted — resets on app restart.

let isGenerating = false
const failureCountPerType: Record<string, number> = {}
const lastGenerationWindow: Record<string, string> = {}
// key: `${insightType}_${window}_${date}` e.g. 'MARKET_EVENT_ALERT_A_2026-03-19'

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface SpendSummaryForAI {
  totalSpendRange: 'under_2k' | '2k_5k' | 'over_5k'
  byCategory: Record<SpendCategory, number>
  comparisonVsLastMonth: number
  anomalies: string[]
  monthYear: string
  savingsRateTrend: number[]   // [month-3, month-2, last-month]
}

export type InsightGenerationResult =
  | { success: true;  insight: Insight }
  | { success: false;
      reason: 'budget_exceeded' | 'already_generating'
            | 'api_error' | 'no_api_key' | 'rate_limited'
            | 'max_failures_reached' | 'window_already_used'
            | 'not_implemented' | 'data_insufficient'
            | 'injection_detected' }

export type MonthlyReviewResult =
  | { success: true;  review: MonthlyReview }
  | { success: false; reason: string }

// ── BUDGET FUNCTIONS ──────────────────────────────────────────────────────────

export function isWithinBudget(usage: AIUsageRecord): boolean {
  const limit = usage.tier === 'paid'
    ? PAID_MONTHLY_TOKEN_LIMIT
    : FREE_MONTHLY_TOKEN_LIMIT
  return usage.inputTokensThisMonth < limit * BUDGET_CAP_BUFFER
}

export function isMonthRollover(usage: AIUsageRecord): boolean {
  const currentMonthYear = new Date().toISOString().slice(0, 7)
  // SECURITY: if stored monthYear is in the FUTURE,
  // device clock may be manipulated — do NOT reset
  if (usage.monthYear > currentMonthYear) return false
  return usage.monthYear !== currentMonthYear
}

export function deductEstimatedTokens(
  callType: string,
  usage: AIUsageRecord
): AIUsageRecord {
  return {
    ...usage,
    inputTokensThisMonth:
      usage.inputTokensThisMonth +
      (ESTIMATED_INPUT_TOKENS[callType] ?? 0),
    lastUpdated: new Date().toISOString(),
  }
}

export function reconcileActualTokens(
  estimatedInput: number,
  actualInput: number,
  actualOutput: number,
  usage: AIUsageRecord
): AIUsageRecord {
  return {
    ...usage,
    inputTokensThisMonth:
      usage.inputTokensThisMonth - estimatedInput + actualInput,
    outputTokensThisMonth:
      usage.outputTokensThisMonth + actualOutput,
    callCount: usage.callCount + 1,
    lastUpdated: new Date().toISOString(),
  }
}

export function restoreEstimatedTokens(
  estimatedInput: number,
  usage: AIUsageRecord
): AIUsageRecord {
  return {
    ...usage,
    inputTokensThisMonth: Math.max(
      0,
      usage.inputTokensThisMonth - estimatedInput
    ),
    lastUpdated: new Date().toISOString(),
  }
}

// ── API KEY VALIDATION ────────────────────────────────────────────────────────

export function validateApiKey(key: string): boolean {
  // Anthropic keys start with 'sk-ant-' and are > 40 chars
  return key.startsWith('sk-ant-') && key.length > 40
}

// ── INTERNAL API CALL HELPER ──────────────────────────────────────────────────
// Not exported.

async function callClaudeAPI(params: {
  systemPrompt: string
  userPrompt: string
  maxTokens: number
  apiKey: string           // passed in, never stored in outer scope
  enableWebSearch: boolean
}): Promise<{
  content: string
  inputTokens: number
  outputTokens: number
} | null> {

  // apiKey is a local parameter — never assign to module scope
  // Never log it. Never include in error messages.

  try {
    const tools = params.enableWebSearch
      ? [{ type: 'web_search_20250305', name: 'web_search' }]
      : undefined

    const body: Record<string, unknown> = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: params.maxTokens,
      system: params.systemPrompt,
      messages: [{ role: 'user', content: params.userPrompt }],
    }
    if (tools) body.tools = tools

    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': params.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) return null

    const data = await response.json() as {
      content: Array<{ type: string; text?: string }>
      usage: { input_tokens: number; output_tokens: number }
    }

    const textBlock = data.content.find(b => b.type === 'text')
    if (!textBlock?.text) return null

    // Sanity check: response not suspiciously long
    if (textBlock.text.length > params.maxTokens * 8) return null

    return {
      content: textBlock.text,
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
    }
  } catch {
    // Never log the error with any request context
    // Never expose the API key in any error path
    return null
  }
}

// ── INVESTMENT OPPORTUNITY (zero API cost) ────────────────────────────────────

export function buildInvestmentOpportunityInsight(
  underfundedBucket: string,
  uninvestedAmount: number
): Insight {
  const now = new Date()
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23, 59, 59
  )

  return {
    id: `insight_INVESTMENT_OPPORTUNITY_${Date.now()}`,
    type: 'INVESTMENT_OPPORTUNITY',
    headline: enforceWordLimit(
      `${formatCurrency(uninvestedAmount, 'EUR')} uninvested this month`,
      WORD_LIMITS.INVESTMENT_OPPORTUNITY.headline
    ),
    body: enforceWordLimit(
      `Your ${underfundedBucket} bucket is furthest from target. ` +
      `Explore suggested instruments to put this to work.`,
      WORD_LIMITS.INVESTMENT_OPPORTUNITY.body
    ),
    generatedAt: now.toISOString(),
    expiresAt: endOfMonth.toISOString(),
    dismissed: false,
    dismissedAt: null,
    action: {
      label: 'Explore options',
      type: 'VIEW_SUGGESTIONS',
      payload: underfundedBucket,
    },
  }
}

// ── DISCOVERY PASS (internal) ─────────────────────────────────────────────────
// Runs before MARKET_EVENT to get session-specific sources.
// Only for portfolio tiers 2, 3, 4.

async function runDiscoveryPass(
  holdingsContextStr: string,
  activeSeedSourceNames: string,
  apiKey: string,
  usage: AIUsageRecord,
  onUsageUpdate: (u: AIUsageRecord) => void
): Promise<DiscoveredSource[]> {

  const discoveryPrompt = `
Given this holdings profile:
${holdingsContextStr}

Identify 8 additional sources NOT in this seed list:
${activeSeedSourceNames}

For each source identify:
1. Primary fund house / issuer pages for specific instruments held
2. Most recently active regulatory or analysis sources
3. Social sentiment sources with active recent discussion

Return as JSON array only:
[{
  "name": string,
  "url": string,
  "tier": 1 | 2 | 3,
  "isOfficialIssuer": boolean,
  "isRegulator": boolean,
  "parentBrand": string | null,
  "instrumentRelevance": string[]
}]

Return empty array if nothing meaningful to add.
`.trim()

  const estimated = ESTIMATED_INPUT_TOKENS.MARKET_EVENT_DISCOVERY
  const deducted = deductEstimatedTokens('MARKET_EVENT_DISCOVERY', usage)
  onUsageUpdate(deducted)

  const result = await callClaudeAPI({
    systemPrompt: 'Return only valid JSON array. No markdown. No preamble.',
    userPrompt: discoveryPrompt,
    maxTokens: MAX_TOKENS_DISCOVERY,
    apiKey,
    enableWebSearch: false,
  })

  if (!result) {
    onUsageUpdate(restoreEstimatedTokens(estimated, deducted))
    return []
  }

  onUsageUpdate(reconcileActualTokens(
    estimated, result.inputTokens, result.outputTokens, deducted
  ))

  try {
    const parsed = JSON.parse(
      result.content.replace(/```json|```/g, '').trim()
    ) as Array<{
      name: string
      url: string
      tier: SourceTier
      isOfficialIssuer: boolean
      isRegulator: boolean
      parentBrand: string | null
      instrumentRelevance: string[]
    }>

    // Build DiscoveredSource objects with quality scoring
    return parsed
      .filter(s =>
        s.url.startsWith('https://') &&
        isSafeForPrompt(s.name) &&
        isSafeForPrompt(s.url)
      )
      .map(s => {
        const domain = new URL(s.url).hostname
          .replace(/^www\./, '')
        const tldSignal: DiscoveredSource['tldSignal'] =
          domain.endsWith('.gov') || domain.endsWith('.gov.in')
            ? 'gov'
          : domain.endsWith('.edu') ? 'edu'
          : domain.endsWith('.org') ? 'org'
          : ['reddit.com', 'twitter.com', 'x.com',
             'stocktwits.com'].includes(domain) ? 'social'
          : 'commercial'

        const knownHighAuthority =
          KNOWN_HIGH_AUTHORITY_DOMAINS.includes(domain)

        const computedQualityScore = computeSourceQuality({
          domain,
          isRegulator: s.isRegulator,
          isOfficialIssuer: s.isOfficialIssuer,
          parentBrand: s.parentBrand,
          tldSignal,
          knownHighAuthority,
          useCount: 0,
          avgRelevanceScore: 0,
        })

        const discovered: DiscoveredSource = {
          id: `discovered_${domain}_${Date.now()}`,
          name: s.name,
          url: s.url,
          domain,
          tier: s.tier,
          isOfficialIssuer: s.isOfficialIssuer,
          isRegulator: s.isRegulator,
          parentBrand: s.parentBrand,
          tldSignal,
          knownHighAuthority,
          safeBrowsingPassed: true,  // assume safe — PM validates
          urlResolvable: true,        // assume resolvable — PM validates
          computedQualityScore,
          effectiveQualityScore: computedQualityScore,
          useCount: 0,
          avgRelevanceScore: 0,
          instrumentRelevance: s.instrumentRelevance,
          firstDiscovered: new Date().toISOString(),
          lastUsed: null,
          pendingReview: true,
          autoAdded: true,
          removed: false,
        }
        return discovered
      })
  } catch {
    return []
  }
}

// ── MAIN GENERATION FUNCTION ──────────────────────────────────────────────────

export default async function generateInsight(
  insightType: InsightType,
  holdingsContext: HoldingsContextForAI | null,
  spendSummary: SpendSummaryForAI | null,
  triggerResults: ReturnType<typeof evaluateAllTriggers>,
  currentUsage: AIUsageRecord,
  discoveredSources: DiscoveredSource[],
  previousMonthContext: {
    priority?: string
    watchlist?: string[]
  } | null,
  previousDismissRate: number,
  onUsageUpdate: (usage: AIUsageRecord) => void,
  onDiscoveredSourcesUpdate: (sources: DiscoveredSource[]) => void
): Promise<InsightGenerationResult> {

  // ── STEP 1: FIRE_TRAJECTORY not implemented in V1 ────────────────────────
  // Cast required: FIRE_TRAJECTORY is not in InsightType (V2 only)
  if ((insightType as string) === 'FIRE_TRAJECTORY') {
    return { success: false, reason: 'not_implemented' }
  }

  // ── STEP 2: INVESTMENT_OPPORTUNITY — zero cost ────────────────────────────
  if (insightType === 'INVESTMENT_OPPORTUNITY') {
    if (!spendSummary || !holdingsContext) {
      return { success: false, reason: 'data_insufficient' }
    }
    const growthTarget = holdingsContext.riskProfile === 'balanced' ? 60 : 80
    const underfunded = holdingsContext.bucketAllocation.growthPct < growthTarget
      ? 'Growth' : 'Stability'
    const insight = buildInvestmentOpportunityInsight(underfunded, 0)
    return { success: true, insight }
  }

  // ── STEP 3: In-memory lock ─────────────────────────────────────────────────
  if (isGenerating) {
    return { success: false, reason: 'already_generating' }
  }
  isGenerating = true

  try {

    // ── STEP 4: Generation window check ───────────────────────────────────
    const window = getCurrentGenerationWindow()
    const today = new Date().toISOString().slice(0, 10)
    const windowKey = `${insightType}_${window}_${today}`
    if (lastGenerationWindow[windowKey]) {
      return { success: false, reason: 'window_already_used' }
    }

    // ── STEP 5: Failure count check ───────────────────────────────────────
    const failKey = `${insightType}_${today}`
    if ((failureCountPerType[failKey] ?? 0) >=
        MAX_FAILURES_PER_TYPE_PER_DAY) {
      return { success: false, reason: 'max_failures_reached' }
    }

    // ── STEP 6: API key check ─────────────────────────────────────────────
    const rawKey = await storageService.get(STORAGE_KEYS.AI_API_KEY)
    if (!rawKey || !validateApiKey(rawKey.trim())) {
      return { success: false, reason: 'no_api_key' }
    }
    // Key is in local variable. Never assign to outer scope.
    const apiKey = rawKey.trim()

    // ── STEP 7: Monthly rollover check ────────────────────────────────────
    let usage = currentUsage
    if (isMonthRollover(usage)) {
      usage = {
        ...usage,
        inputTokensThisMonth: 0,
        outputTokensThisMonth: 0,
        callCount: 0,
        monthYear: new Date().toISOString().slice(0, 7),
        lastUpdated: new Date().toISOString(),
      }
      onUsageUpdate(usage)
    }

    // ── STEP 8: Budget check ──────────────────────────────────────────────
    if (!isWithinBudget(usage)) {
      return { success: false, reason: 'budget_exceeded' }
    }

    // ── STEP 9: Rate limit check ──────────────────────────────────────────
    if (usage.lastUpdated) {
      const hoursSince =
        (Date.now() - new Date(usage.lastUpdated).getTime())
        / 3_600_000
      if (hoursSince < MIN_HOURS_BETWEEN_CALLS) {
        return { success: false, reason: 'rate_limited' }
      }
    }

    // ── STEP 10: Data validation ──────────────────────────────────────────
    if (!holdingsContext) {
      return { success: false, reason: 'data_insufficient' }
    }
    if (!validateForPromptSafety(holdingsContext)) {
      failureCountPerType[failKey] =
        (failureCountPerType[failKey] ?? 0) + 1
      return { success: false, reason: 'injection_detected' }
    }

    const holdingsContextStr =
      formatHoldingsContextForPrompt(holdingsContext)

    // ── STEP 11: Get active seed sources ──────────────────────────────────
    const activeSeedSources = getActiveSeedSources({
      hasIndiaExposure: (holdingsContext.geographyExposure['india'] ?? 0) > 0,
      hasEurExposure: (holdingsContext.geographyExposure['europe'] ?? 0) > 0,
      hasUsExposure: (holdingsContext.geographyExposure['us'] ?? 0) > 0,
      hasUkExposure: (holdingsContext.geographyExposure['uk'] ?? 0) > 0,
      isNriProfile: holdingsContext.isNriProfile,
      instrumentTypes: holdingsContext.instrumentTypesHeld,
    })

    // ── STEP 12: Route to insight type ────────────────────────────────────

    if (insightType === 'MARKET_EVENT_ALERT') {

      // Discovery pass for tier 2+ portfolios
      let allDiscovered = [...discoveredSources]
      if (holdingsContext.portfolioTier >= 2) {
        const seedNames = activeSeedSources
          .map(s => s.name).join(', ')

        const newDiscovered = await runDiscoveryPass(
          holdingsContextStr,
          seedNames,
          apiKey,         // passed in, used once, not stored
          usage,
          onUsageUpdate
        )

        if (newDiscovered.length > 0) {
          const existingDomains = new Set(
            allDiscovered.map(s => s.domain)
          )
          const genuinelyNew = newDiscovered.filter(
            s => !existingDomains.has(s.domain)
          )
          allDiscovered = [...allDiscovered, ...genuinelyNew]
          onDiscoveredSourcesUpdate(allDiscovered)
        }
      }

      const sourceListStr = formatSourceListForPrompt(
        activeSeedSources,
        allDiscovered,
        holdingsContext.portfolioTier,
        holdingsContext
      )

      // Determine search window (wider if app was stale)
      const lastCheck = await storageService.get(
        STORAGE_KEYS.LAST_INSIGHT_CHECK
      )
      const hoursSinceLastCheck = lastCheck
        ? (Date.now() - new Date(lastCheck).getTime()) / 3_600_000
        : 24
      const searchWindowHours = hoursSinceLastCheck > 72
        ? Math.min(Math.round(hoursSinceLastCheck), 168)
        : 48

      const { system, user } = buildMarketEventPrompt({
        holdingsContext: holdingsContextStr,
        sourceList: sourceListStr,
        searchWindowHours,
        portfolioTier: holdingsContext.portfolioTier,
        previousDismissRate,
      })

      // Pessimistic deduction before call
      const estimated = ESTIMATED_INPUT_TOKENS.MARKET_EVENT_ALERT
      usage = deductEstimatedTokens('MARKET_EVENT_ALERT', usage)
      onUsageUpdate(usage)

      const result = await callClaudeAPI({
        systemPrompt: system,
        userPrompt: user,
        maxTokens: MAX_TOKENS_INSIGHT,
        apiKey,           // local variable — discarded after call
        enableWebSearch: true,
      })

      if (!result) {
        usage = restoreEstimatedTokens(estimated, usage)
        onUsageUpdate(usage)
        failureCountPerType[failKey] =
          (failureCountPerType[failKey] ?? 0) + 1
        return { success: false, reason: 'api_error' }
      }

      usage = reconcileActualTokens(
        estimated, result.inputTokens,
        result.outputTokens, usage
      )
      onUsageUpdate(usage)

      try {
        const cleaned = result.content
          .replace(/```json|```/g, '').trim()
        if (cleaned === 'null') {
          // Claude found nothing material — valid response
          lastGenerationWindow[windowKey] = new Date().toISOString()
          return { success: false, reason: 'data_insufficient' }
        }

        const parsed = JSON.parse(cleaned) as {
          headline: string
          body: string
          holdingType: string
          source: string
          sourceUrl: string
          sourceTier: 1 | 2 | 3
          sentiment: 'bullish' | 'bearish' | 'mixed' | 'neutral'
          confidence: 'high' | 'medium' | 'low' | 'sentiment_only'
          confidenceScore: number
          eventAgeHours: number
          forumSignal: {
            summary: string
            platforms: string[]
            directionalConsensus: number
            divergesFromInstitutional: boolean
          } | null
          retailSentimentOnly: boolean
        }

        const now = new Date()
        const insight: Insight = {
          id: `insight_MARKET_EVENT_${Date.now()}`,
          type: 'MARKET_EVENT_ALERT',
          headline: enforceWordLimit(
            parsed.headline,
            WORD_LIMITS.MARKET_EVENT_ALERT.headline
          ),
          body: enforceWordLimit(
            parsed.body,
            WORD_LIMITS.MARKET_EVENT_ALERT.body
          ),
          generatedAt: now.toISOString(),
          expiresAt: new Date(
            now.getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
          dismissed: false,
          dismissedAt: null,
          source: parsed.source,
          sourceUrl: parsed.sourceUrl,
          sentiment: parsed.sentiment,
          // sentiment_only is not a valid Insight.confidence value — omit it
          confidence: parsed.confidence !== 'sentiment_only'
            ? parsed.confidence
            : undefined,
        }

        lastGenerationWindow[windowKey] = new Date().toISOString()

        await storageService.set(
          STORAGE_KEYS.LAST_INSIGHT_CHECK,
          now.toISOString()
        )

        return { success: true, insight }

      } catch {
        failureCountPerType[failKey] =
          (failureCountPerType[failKey] ?? 0) + 1
        return { success: false, reason: 'api_error' }
      }

    } // end MARKET_EVENT_ALERT

    if (insightType === 'PORTFOLIO_HEALTH') {
      if (triggerResults.length === 0) {
        return { success: false, reason: 'data_insufficient' }
      }

      const triggersContext = triggerResults
        .map(t =>
          `${t.triggerCode} [${t.severity}]: ` +
          JSON.stringify(t.contextForPrompt)
        )
        .join('\n')

      const { system, user } = buildPortfolioHealthPrompt({
        holdingsContext: holdingsContextStr,
        triggersContext,
        previousMonthPriority: previousMonthContext?.priority,
      })

      const estimated = ESTIMATED_INPUT_TOKENS.PORTFOLIO_HEALTH
      usage = deductEstimatedTokens('PORTFOLIO_HEALTH', usage)
      onUsageUpdate(usage)

      const result = await callClaudeAPI({
        systemPrompt: system,
        userPrompt: user,
        maxTokens: MAX_TOKENS_INSIGHT,
        apiKey,
        enableWebSearch: false,
      })

      if (!result) {
        usage = restoreEstimatedTokens(estimated, usage)
        onUsageUpdate(usage)
        failureCountPerType[failKey] =
          (failureCountPerType[failKey] ?? 0) + 1
        return { success: false, reason: 'api_error' }
      }

      usage = reconcileActualTokens(
        estimated, result.inputTokens,
        result.outputTokens, usage
      )
      onUsageUpdate(usage)

      try {
        const parsed = JSON.parse(
          result.content.replace(/```json|```/g, '').trim()
        ) as {
          headline: string
          body: string
          action: {
            label: string
            type: 'VIEW_HOLDING' | 'VIEW_SUGGESTIONS' | 'VIEW_FIRE'
            payload: string
          } | null
        }

        const now = new Date()
        const insight: Insight = {
          id: `insight_PORTFOLIO_HEALTH_${Date.now()}`,
          type: 'PORTFOLIO_HEALTH',
          headline: enforceWordLimit(
            parsed.headline,
            WORD_LIMITS.PORTFOLIO_HEALTH.headline
          ),
          body: enforceWordLimit(
            parsed.body,
            WORD_LIMITS.PORTFOLIO_HEALTH.body
          ),
          generatedAt: now.toISOString(),
          expiresAt: new Date(
            now.getTime() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),  // 7 days
          dismissed: false,
          dismissedAt: null,
          action: parsed.action ?? undefined,
        }

        lastGenerationWindow[windowKey] = new Date().toISOString()
        return { success: true, insight }

      } catch {
        failureCountPerType[failKey] =
          (failureCountPerType[failKey] ?? 0) + 1
        return { success: false, reason: 'api_error' }
      }
    } // end PORTFOLIO_HEALTH

    return { success: false, reason: 'api_error' }

  } finally {
    isGenerating = false
    // apiKey local variable goes out of scope here — garbage collected
  }
}

// ── MONTHLY REVIEW GENERATION ─────────────────────────────────────────────────

export async function generateMonthlyReview(
  holdingsContext: HoldingsContextForAI,
  spendSummary: SpendSummaryForAI,
  protectionMonths: number,
  investmentGapPct: number,
  mortgageStepDownOccurred: boolean,
  dataMonthsAvailable: { spend: number; portfolio: number },
  previousMonthContext: {
    priority: string
    watchlist: string[]
  } | null,
  currentUsage: AIUsageRecord,
  onUsageUpdate: (usage: AIUsageRecord) => void
): Promise<MonthlyReviewResult> {

  if (!validateForPromptSafety(holdingsContext)) {
    return { success: false, reason: 'injection_detected' }
  }

  if (isGenerating) {
    return { success: false, reason: 'already_generating' }
  }
  isGenerating = true

  try {
    const rawKey = await storageService.get(STORAGE_KEYS.AI_API_KEY)
    if (!rawKey || !validateApiKey(rawKey.trim())) {
      return { success: false, reason: 'no_api_key' }
    }
    const apiKey = rawKey.trim()

    let usage = currentUsage
    if (isMonthRollover(usage)) {
      usage = {
        ...usage,
        inputTokensThisMonth: 0,
        outputTokensThisMonth: 0,
        callCount: 0,
        monthYear: new Date().toISOString().slice(0, 7),
        lastUpdated: new Date().toISOString(),
      }
      onUsageUpdate(usage)
    }

    if (!isWithinBudget(usage)) {
      return { success: false, reason: 'budget_exceeded' }
    }

    const holdingsContextStr =
      formatHoldingsContextForPrompt(holdingsContext)

    // Build spend context string (category differences vs avg)
    const spendContextLines = Object.entries(spendSummary.byCategory)
      .map(([cat, amt]) =>
        `  ${cat}: ${amt > 0 ? '+' : ''}${Math.round(amt)}`
      )
      .join('\n')

    const { system, user } = buildMonthlyReviewPrompt({
      holdingsContext: holdingsContextStr,
      spendContext: spendContextLines,
      savingsRateTrend: spendSummary.savingsRateTrend,
      protectionMonths,
      investmentGapPct,
      mortgageStepDownOccurred,
      dataMonthsAvailable,
      previousMonthSummary: previousMonthContext
        ? {
            priority: previousMonthContext.priority,
            watchlist: previousMonthContext.watchlist,
          }
        : undefined,
    })

    const estimated = ESTIMATED_INPUT_TOKENS.MONTHLY_REVIEW
    usage = deductEstimatedTokens('MONTHLY_REVIEW', usage)
    onUsageUpdate(usage)

    const result = await callClaudeAPI({
      systemPrompt: system,
      userPrompt: user,
      maxTokens: MAX_TOKENS_MONTHLY_REVIEW,
      apiKey,
      enableWebSearch: false,
    })

    if (!result) {
      usage = restoreEstimatedTokens(estimated, usage)
      onUsageUpdate(usage)
      return { success: false, reason: 'api_error' }
    }

    usage = reconcileActualTokens(
      estimated, result.inputTokens,
      result.outputTokens, usage
    )
    onUsageUpdate(usage)

    try {
      const parsed = JSON.parse(
        result.content.replace(/```json|```/g, '').trim()
      ) as {
        whereYouStand: string
        howMoneyIsWorking: {
          growth: string | null
          stability: string | null
          locked: string | null
          protection: string | null
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

      const now = new Date()

      const review: MonthlyReview = {
        monthYear: now.toISOString().slice(0, 7),
        generatedAt: now.toISOString(),
        viewed: false,
        whereYouStand: parsed.whereYouStand,
        // Store type requires non-nullable strings — coerce nulls to ''
        howMoneyIsWorking: {
          growth:     parsed.howMoneyIsWorking.growth     ?? '',
          stability:  parsed.howMoneyIsWorking.stability  ?? '',
          locked:     parsed.howMoneyIsWorking.locked     ?? '',
          protection: parsed.howMoneyIsWorking.protection ?? '',
        },
        thisMonthsPriority: parsed.thisMonthsPriority,
        fireUpdate: parsed.fireUpdate,
        nextMonthWatchlist: parsed.nextMonthWatchlist.slice(0, 3),
      }

      return { success: true, review }

    } catch {
      return { success: false, reason: 'parse_error' }
    }

  } finally {
    isGenerating = false
  }
}

// Re-export for callers that need ranking
export { rankSources }
