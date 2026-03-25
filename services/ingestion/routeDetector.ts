// /services/ingestion/routeDetector.ts
// Determines whether a parsed CSV file routes to spend or portfolio.

import { getInstitution } from './institutionRegistry'
import type { SupportedInstitution, RouteConfidence, ColumnMapping, RouteDetectionResult, Tier2AccountType } from './types'

export function detectRoute(
  institution: SupportedInstitution,
  institutionConfidence: RouteConfidence,
  mapping: ColumnMapping,
): RouteDetectionResult {
  // Step A: institution-based (high or medium confidence)
  if (institutionConfidence === 'high' || institutionConfidence === 'medium') {
    const def = getInstitution(institution)
    return {
      tier1Route: def.tier1Route,
      tier2Suggestion: def.tier2Default,
      confidence: institutionConfidence,
      detectedInstitution: institution,
      signals: [`Institution ${def.displayName} identified`],
    }
  }

  // Step B: column-based fallback
  const portfolioSignals = [
    'isin', 'ticker', 'symbol', 'cusip',
    'quantity', 'units', 'shares', 'aantal',
    'koers', 'price', 'nav', 'ltp', 'avg price',
    'product', 'instrument', 'scheme name',
    'market value', 'current value', 'mkt value',
  ]
  const spendSignals = [
    'debit', 'credit', 'af bij', 'bedrag',
    'merchant', 'payee', 'naam', 'description',
    'balance', 'saldo', 'closing balance',
    'narration', 'particulars', 'omschrijving',
  ]

  const allColumns = [
    mapping.dateColumn,
    mapping.amountColumn,
    mapping.debitCreditColumn ?? '',
    mapping.descriptionColumn,
    mapping.currencyColumn ?? '',
    mapping.referenceColumn ?? '',
    mapping.isinColumn ?? '',
    mapping.tickerColumn ?? '',
    mapping.nameColumn ?? '',
    mapping.quantityColumn ?? '',
    mapping.priceColumn ?? '',
    mapping.valueColumn ?? '',
  ].filter(c => c !== '').map(c => c.toLowerCase())

  const portfolioScore = allColumns.filter(col =>
    portfolioSignals.some(sig => col.includes(sig))
  ).length

  const spendScore = allColumns.filter(col =>
    spendSignals.some(sig => col.includes(sig))
  ).length

  if (portfolioScore >= 3 && portfolioScore > spendScore) {
    return {
      tier1Route: 'portfolio',
      tier2Suggestion: 'brokerage',
      confidence: 'medium',
      detectedInstitution: 'UNKNOWN',
      signals: [`${portfolioScore} portfolio column signals detected`],
    }
  }

  if (spendScore >= 2 && spendScore > portfolioScore) {
    return {
      tier1Route: 'spend',
      tier2Suggestion: 'current_account',
      confidence: 'medium',
      detectedInstitution: 'UNKNOWN',
      signals: [`${spendScore} spend column signals detected`],
    }
  }

  return {
    tier1Route: 'spend',
    tier2Suggestion: null,
    confidence: 'unknown',
    detectedInstitution: 'UNKNOWN',
    signals: ['Could not determine account type — user confirmation required'],
  }
}
