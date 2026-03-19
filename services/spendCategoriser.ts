import type { SpendCategory } from '../types/spend'
import { MERCHANT_KEYWORDS } from '../constants/merchantKeywords'

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface MerchantOverride {
  merchantNorm: string
  category: SpendCategory
  correctedAt: Date
  correctionCount: number
}

export interface CategorizationResult {
  category: SpendCategory
  confidence: number
  layer: 1 | 2 | 3
  merchantNorm: string
}

export interface PendingCategorization {
  transactionId: string
  merchantNorm: string
  description: string
  failedAttempts: number
}

// ── VALID CATEGORIES (for AI response validation) ─────────────────────────────

const VALID_CATEGORIES: SpendCategory[] = [
  'housing', 'groceries', 'eating_out', 'transport', 'health',
  'personal_care', 'subscriptions', 'utilities', 'shopping', 'travel',
  'education', 'insurance', 'childcare', 'gifts_giving', 'income',
  'investment_transfer', 'transfer', 'other',
]

// ── LAYER 0: MERCHANT NORMALISATION ───────────────────────────────────────────

export function normaliseMerchant(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
    .slice(0, 40)
}

// ── LAYER 1 + USER OVERRIDE (synchronous categorise) ─────────────────────────

export function categorise(
  description: string,
  merchantOverrides: MerchantOverride[],
  geography: 'NL' | 'IN' | 'EU' | 'GLOBAL',
): CategorizationResult {
  const merchantNorm = normaliseMerchant(description)

  // Step 2: User corrections always win (DEC-01)
  const override = merchantOverrides.find((o) => o.merchantNorm === merchantNorm)
  if (override) {
    return {
      category: override.category,
      confidence: 1.0,
      layer: 3,
      merchantNorm,
    }
  }

  // Step 3: Keyword rules — geography-specific first, then GLOBAL
  const geographyMap = MERCHANT_KEYWORDS[geography]
  for (const [cat, keywords] of Object.entries(geographyMap) as [SpendCategory, string[]][]) {
    for (const keyword of keywords) {
      if (merchantNorm.includes(keyword)) {
        return { category: cat, confidence: 1.0, layer: 1, merchantNorm }
      }
    }
  }

  if (geography !== 'GLOBAL') {
    const globalMap = MERCHANT_KEYWORDS['GLOBAL']
    for (const [cat, keywords] of Object.entries(globalMap) as [SpendCategory, string[]][]) {
      for (const keyword of keywords) {
        if (merchantNorm.includes(keyword)) {
          return { category: cat, confidence: 1.0, layer: 1, merchantNorm }
        }
      }
    }
  }

  // Step 4: No match — signal store to queue Layer 2
  return { category: 'other', confidence: 0.0, layer: 1, merchantNorm }
}

// ── LAYER 2: AI CATEGORISATION ────────────────────────────────────────────────

export async function categoriseViaAI(
  _transactionId: string,
  description: string,
  merchantNorm: string,
  apiKey: string,
): Promise<CategorizationResult> {
  const fallback: CategorizationResult = {
    category: 'other',
    confidence: 0.3,
    layer: 2,
    merchantNorm,
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        system: 'You are a spend categoriser for a personal finance app. Respond only with a JSON object. No explanation. No markdown.',
        messages: [
          {
            role: 'user',
            content: `Categorise this bank transaction into exactly one category.\nTransaction: ${description}\nNormalised merchant: ${merchantNorm}\n\nValid categories: housing, groceries, eating_out, transport, family, health, personal_care, subscriptions, utilities, shopping, travel, education, insurance, gifts_giving, income, investment_transfer, transfer, other\n\nRespond with only this JSON:\n{ "category": "<category>", "confidence": <0.0-1.0> }`,
          },
        ],
      }),
    })

    if (!response.ok) {
      return fallback
    }

    const data = (await response.json()) as {
      content: { type: string; text: string }[]
    }

    const text = data.content?.[0]?.text
    if (!text) return fallback

    const parsed = JSON.parse(text) as { category: string; confidence: number }

    if (
      typeof parsed.category !== 'string' ||
      typeof parsed.confidence !== 'number' ||
      !VALID_CATEGORIES.includes(parsed.category as SpendCategory)
    ) {
      return fallback
    }

    return {
      category: parsed.category as SpendCategory,
      confidence: parsed.confidence,
      layer: 2,
      merchantNorm,
    }
  } catch {
    return fallback
  }
}

// ── LAYER 3: USER CORRECTION ─────────────────────────────────────────────────

export function applyUserCorrection(
  merchantNorm: string,
  newCategory: SpendCategory,
  existingOverrides: MerchantOverride[],
): MerchantOverride[] {
  const existingIndex = existingOverrides.findIndex((o) => o.merchantNorm === merchantNorm)

  if (existingIndex !== -1) {
    const existing = existingOverrides[existingIndex]
    const updated: MerchantOverride = {
      ...existing,
      category: newCategory,
      correctedAt: new Date(),
      correctionCount: existing.correctionCount + 1,
    }

    if (updated.correctionCount >= 5) {
      console.log('[Layer 1 promotion candidate]', merchantNorm, newCategory)
    }

    return [
      ...existingOverrides.slice(0, existingIndex),
      updated,
      ...existingOverrides.slice(existingIndex + 1),
    ]
  }

  const newOverride: MerchantOverride = {
    merchantNorm,
    category: newCategory,
    correctedAt: new Date(),
    correctionCount: 1,
  }

  return [...existingOverrides, newOverride]
}

// ── DEFAULT EXPORT ────────────────────────────────────────────────────────────

export default {
  normaliseMerchant,
  categorise,
  categoriseViaAI,
  applyUserCorrection,
}
