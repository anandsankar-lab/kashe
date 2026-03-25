// /services/ingestion/securityPipeline.ts
// Security and sanitisation pipeline for ingested data.
// Moved from csvParser.ts and adapted for the new ingestion types.

import { normaliseMerchant } from '../spendCategoriser'
import type { SpendTransaction, PortfolioHolding } from './types'

// ── INJECTION DETECTION ───────────────────────────────────────────────────────

const INJECTION_PATTERNS: RegExp[] = [
  /<script[\s>]/i,
  /<\/script>/i,
  /javascript:/i,
  /on\w+\s*=/i,               // onclick=, onerror=, etc.
  /DROP\s+TABLE/i,
  /SELECT\s+\*/i,
  /--\s/,
  /\/\*/,
  /\*\//,
  /;\s*DROP/i,
  /;\s*SELECT/i,
  /;\s*INSERT/i,
  /;\s*UPDATE/i,
  /;\s*DELETE/i,
  /UNION\s+SELECT/i,
  /xp_cmdshell/i,
]

export function isSafeValue(value: string): boolean {
  return !INJECTION_PATTERNS.some(pattern => pattern.test(value))
}

// ── PII MASKING ───────────────────────────────────────────────────────────────

export function maskAccountNumber(value: string): string {
  // Replaces 8+ digit sequences with ····XXXX (last 4 digits retained)
  return value.replace(/\b\d{8,}\b/g, (m) => '····' + m.slice(-4))
}

export function normaliseDescription(raw: string): string {
  return raw
    // 1. Account numbers (8+ digits) → ····XXXX (last 4)
    .replace(/\b\d{8,}\b/g, (m) => '····' + m.slice(-4))
    // 2. IBANs → ····XXXX (last 4)
    .replace(/[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7,}/g, (m) => '····' + m.slice(-4))
    // 3. BSN (Dutch tax number) → removed
    .replace(/\bBSN:?\s*\d{8,9}\b/gi, '')
    // 4. PAN (Indian tax ID: 5 letters + 4 digits + 1 letter) → removed
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '')
    // 5. Aadhaar (4 digits space 4 digits space 4 digits) → removed
    .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '')
}

// ── TRANSACTION SANITISATION ──────────────────────────────────────────────────

export function sanitiseTransaction(raw: SpendTransaction): SpendTransaction {
  const sanitisedDescription = normaliseDescription(raw.description)
  const sanitisedRawDescription = normaliseDescription(raw.rawDescription)

  // Merchant = sanitised description, first 60 chars
  const merchant = sanitisedDescription.slice(0, 60)

  // MerchantNorm via spendCategoriser
  const merchantNorm = normaliseMerchant(sanitisedDescription)

  return {
    ...raw,
    description: sanitisedDescription,
    rawDescription: sanitisedRawDescription,
    merchant,
    merchantNorm,
  }
}

// ── HOLDING SANITISATION ──────────────────────────────────────────────────────

export function sanitiseHolding(raw: Partial<PortfolioHolding>): PortfolioHolding {
  const sanitisedName = raw.name ? normaliseDescription(raw.name) : 'Unknown Instrument'

  return {
    id: raw.id ?? '',
    name: sanitisedName,
    ticker: raw.ticker,
    isin: raw.isin,
    assetClass: raw.assetClass ?? 'equity',
    assetSubtype: raw.assetSubtype ?? 'eu_etf',
    taxWrapper: raw.taxWrapper,
    bucket: raw.bucket ?? 'GROWTH',
    bucketOverride: raw.bucketOverride,
    geography: raw.geography ?? 'other',
    currentValue: raw.currentValue ?? 0,
    currency: raw.currency ?? 'EUR',
    valueInBaseCurrency: raw.valueInBaseCurrency ?? 0,
    dailyChangePercent: raw.dailyChangePercent,
    purchasePrice: raw.purchasePrice,
    quantity: raw.quantity,
    lastUpdated: raw.lastUpdated ?? new Date().toISOString().slice(0, 10),
    freshnessStatus: raw.freshnessStatus ?? 'stale',
    isProtection: raw.isProtection,
    avgMonthlySpend: raw.avgMonthlySpend,
    unlockDate: raw.unlockDate,
    lockedReason: raw.lockedReason,
    projectedRate: raw.projectedRate,
    domicile: raw.domicile,
    vestingDate: raw.vestingDate,
    unvested: raw.unvested,
  }
}
