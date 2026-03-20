import { STORAGE_KEYS } from './storageService'
import storageService from './storageService'
import type { SpendCategory } from '../types/spend'
import type { RiskProfileType } from '../store/householdStore'
import type { InsightType } from '../store/insightsStore'
import type { SupportedInstitution } from './csvParser'
import Posthog from 'posthog-react-native'

// ─────────────────────────────────────────────────────
// FLIP THIS TO true AFTER ANAND REVIEWS THE EVENT LIST
// Every posthog.capture() call is wrapped with this flag.
// Nothing fires until this is true.
// ─────────────────────────────────────────────────────
const ANALYTICS_ENABLED = false

// ── ANONYMOUS DISTINCT ID ─────────────────────────────────────────────────────

export async function getOrCreateDistinctId(): Promise<string> {
  const stored = await storageService.get(STORAGE_KEYS.ANALYTICS_DISTINCT_ID)
  if (stored) return stored

  // Generate UUID — use crypto.randomUUID() if available,
  // fall back to timestamp-based UUID v4
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  await storageService.set(STORAGE_KEYS.ANALYTICS_DISTINCT_ID, id)
  return id
}

// ── POSTHOG INITIALISATION ────────────────────────────────────────────────────

const POSTHOG_API_KEY = 'phc_placeholder'
// Replace with real PostHog project API key before beta
// Never commit a real key — use environment variable in V1b

let posthog: InstanceType<typeof Posthog> | null = null

async function getPosthog(): Promise<InstanceType<typeof Posthog> | null> {
  if (!ANALYTICS_ENABLED) return null
  if (posthog) return posthog

  const distinctId = await getOrCreateDistinctId()
  posthog = new Posthog(POSTHOG_API_KEY, {
    host: 'https://eu.posthog.com', // EU data residency
    disabled: !ANALYTICS_ENABLED,
  })
  posthog.identify(distinctId)
  return posthog
}

// ── LOOP 1 — Catalogue freshness ─────────────────────────────────────────────

export async function trackInstrumentTapped(params: {
  bucket: string
  riskTier: string
  geography: string
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('instrument_tapped', {
      bucket: params.bucket,
      risk_tier: params.riskTier,
      geography: params.geography,
    })
  } catch { /* silent */ }
}

export async function trackInstrumentAdded(params: {
  bucket: string
  riskTier: string
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('instrument_added', {
      bucket: params.bucket,
      risk_tier: params.riskTier,
    })
  } catch { /* silent */ }
}

export async function trackInstrumentSkipped(params: {
  bucket: string
  position: number
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('instrument_skipped', {
      bucket: params.bucket,
      position: params.position,
    })
  } catch { /* silent */ }
}

// ── LOOP 2 — Spend accuracy ───────────────────────────────────────────────────

export async function trackCategoryCorrection(params: {
  fromCategory: SpendCategory
  toCategory: SpendCategory
  patternKnown: boolean   // true = Layer 1 had a prior keyword match
  correctionCount: number
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('category_correction', {
      from_category: params.fromCategory,
      to_category: params.toCategory,
      pattern_known: params.patternKnown,
      correction_count: params.correctionCount,
      // NEVER: transaction amount, description, or raw payee string
    })
  } catch { /* silent */ }
}

// ── LOOP 3 — AI insight quality ───────────────────────────────────────────────

export async function trackInsightViewed(params: {
  insightType: InsightType
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('insight_viewed', {
      insight_type: params.insightType,
    })
  } catch { /* silent */ }
}

export async function trackInsightActioned(params: {
  insightType: InsightType
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('insight_actioned', {
      insight_type: params.insightType,
    })
  } catch { /* silent */ }
}

export async function trackInsightDismissed(params: {
  insightType: InsightType
  timeVisibleMs: number
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('insight_dismissed', {
      insight_type: params.insightType,
      time_visible_ms: params.timeVisibleMs,
    })
  } catch { /* silent */ }
}

export async function trackMonthlyReviewOpened(params: {
  month: string // 'YYYY-MM' — not a specific date
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('monthly_review_opened', {
      month: params.month,
    })
  } catch { /* silent */ }
}

export async function trackMonthlyReviewSectionRead(params: {
  section:
    | 'whereYouStand'
    | 'howMoneyWorking'
    | 'priority'
    | 'fireUpdate'
    | 'watchlist'
  month: string
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('monthly_review_section_read', {
      section: params.section,
      month: params.month,
    })
  } catch { /* silent */ }
}

// ── LOOP 4 — CSV upload signal ────────────────────────────────────────────────

export async function trackCsvUploaded(params: {
  institution: SupportedInstitution
  transactionCount: number
  parseConfidence: number // overallScore 0–1
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('csv_uploaded', {
      institution: params.institution,
      transaction_count: params.transactionCount,
      parse_confidence: Math.round(params.parseConfidence * 100),
      // NEVER: file contents, account numbers, amounts
    })
  } catch { /* silent */ }
}

// ── GENERAL ───────────────────────────────────────────────────────────────────

export async function trackScreenViewed(params: {
  screen: string
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('screen_viewed', {
      screen: params.screen,
    })
  } catch { /* silent */ }
}

export async function trackRiskProfileSet(params: {
  profile: RiskProfileType
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('risk_profile_set', {
      profile: params.profile,
    })
  } catch { /* silent */ }
}

export async function trackAppOpened(params: {
  hasData: boolean
  onboardingComplete: boolean
}): Promise<void> {
  if (!ANALYTICS_ENABLED) return
  try {
    const ph = await getPosthog()
    ph?.capture('app_opened', {
      has_data: params.hasData,
      onboarding_complete: params.onboardingComplete,
      // NEVER: any financial data on app open
    })
  } catch { /* silent */ }
}

// ── DEFAULT EXPORT ────────────────────────────────────────────────────────────

export default {
  trackInstrumentTapped,
  trackInstrumentAdded,
  trackInstrumentSkipped,
  trackCategoryCorrection,
  trackInsightViewed,
  trackInsightActioned,
  trackInsightDismissed,
  trackMonthlyReviewOpened,
  trackMonthlyReviewSectionRead,
  trackCsvUploaded,
  trackScreenViewed,
  trackRiskProfileSet,
  trackAppOpened,
  getOrCreateDistinctId,
}
