// /services/ingestion/holdingsParser.ts
// Portfolio holdings ingestion path.

import type { RawRow, ColumnMapping, SupportedInstitution } from './types'
import type { PortfolioHolding, AssetSubtype, AssetClass, BucketType, Geography } from '../../types/portfolio'
import { DEFAULT_BUCKET } from '../../types/portfolio'
import { getInstitution } from './institutionRegistry'
import { normaliseDescription } from './securityPipeline'

// ── HELPERS ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function assetClassFromSubtype(subtype: AssetSubtype): AssetClass {
  const map: Record<AssetSubtype, AssetClass> = {
    in_mutual_fund: 'equity',
    in_debt_fund: 'fixed_income',
    in_direct_equity: 'equity',
    in_nre_nro: 'cash',
    in_ppf: 'retirement',
    in_epf: 'retirement',
    in_nps: 'retirement',
    in_fd: 'cash',
    in_nsc: 'fixed_income',
    in_bonds: 'fixed_income',
    eu_etf: 'equity',
    eu_direct_equity: 'equity',
    eu_pension: 'retirement',
    eu_savings: 'cash',
    uk_isa: 'equity',
    uk_cash_isa: 'cash',
    uk_sipp: 'retirement',
    uk_lisa: 'retirement',
    uk_direct_equity: 'equity',
    uk_premium_bonds: 'cash',
    us_401k: 'retirement',
    us_roth_401k: 'retirement',
    us_ira: 'retirement',
    us_roth_ira: 'retirement',
    us_brokerage: 'equity',
    us_hsa: 'retirement',
    us_529: 'retirement',
    employer_rsu: 'equity',
    employer_espp: 'equity',
    crypto_general: 'crypto',
    alternative_general: 'alternative',
    cash_general: 'cash',
  }
  return map[subtype] ?? 'equity'
}

function detectAssetSubtype(
  isin: string | undefined,
  nameHint: string,
  instrumentTypeHint: string,
): AssetSubtype | null {
  const lower = (instrumentTypeHint + ' ' + nameHint).toLowerCase()

  // From instrument type column first
  if (lower.includes('etf')) return 'eu_etf'
  if (lower.includes('nps')) return 'in_nps'
  if (lower.includes('ppf')) return 'in_ppf'
  if (lower.includes('epf') || lower.includes(' pf ')) return 'in_epf'
  if (lower.includes('mutual fund') || lower.includes(' mf ') || lower.includes('fund')) return 'in_mutual_fund'
  if (lower.includes('bond')) return 'in_bonds'
  if (lower.includes('equity') || lower.includes('stock') || lower.includes('share')) return 'in_direct_equity'

  // From ISIN prefix
  if (isin && isin.length >= 2) {
    const prefix = isin.slice(0, 2).toUpperCase()
    if (prefix === 'IE') return 'eu_etf'
    if (prefix === 'LU') return 'in_mutual_fund'
    if (prefix === 'US') return 'us_brokerage'
    if (prefix === 'IN') return 'in_direct_equity'
    if (prefix === 'GB') return 'uk_direct_equity'
    if (prefix === 'DE' || prefix === 'FR' || prefix === 'NL') return 'eu_direct_equity'
  }

  return null
}

function institutionGeographyToHolding(geo: 'NL' | 'IN' | 'UK' | 'US' | 'EU' | 'GLOBAL'): Geography {
  if (geo === 'IN') return 'india'
  if (geo === 'NL' || geo === 'EU') return 'europe'
  if (geo === 'UK') return 'uk'
  if (geo === 'US') return 'us'
  return 'other'
}

// ── MAIN PARSER ───────────────────────────────────────────────────────────────

export function parseHoldings(
  rows: RawRow[],
  mapping: ColumnMapping,
  profileId: string,
  householdId: string,
  institution: SupportedInstitution,
): { holdings: PortfolioHolding[]; pendingHoldings: PortfolioHolding[] } {
  const holdings: PortfolioHolding[] = []
  const pendingHoldings: PortfolioHolding[] = []
  const def = getInstitution(institution)
  const institutionGeo = def.geography

  for (const row of rows) {
    try {
      const name = normaliseDescription(
        (mapping.nameColumn ? row[mapping.nameColumn] : '') ?? ''
      ).trim()
      if (!name) continue

      const isin = mapping.isinColumn ? (row[mapping.isinColumn] ?? '').trim() : undefined
      const ticker = mapping.tickerColumn ? (row[mapping.tickerColumn] ?? '').trim() : undefined
      const quantityRaw = mapping.quantityColumn ? (row[mapping.quantityColumn] ?? '') : ''
      const priceRaw = mapping.priceColumn ? (row[mapping.priceColumn] ?? '') : ''
      const valueRaw = mapping.valueColumn ? (row[mapping.valueColumn] ?? '') : ''
      const currencyRaw = mapping.currencyColumn ? (row[mapping.currencyColumn] ?? '').trim() : ''

      const quantity = parseFloat(quantityRaw.replace(/[,\s]/g, '')) || undefined
      const purchasePrice = parseFloat(priceRaw.replace(/[,\s]/g, '')) || undefined
      const currentValue = parseFloat(valueRaw.replace(/[,\s]/g, '')) || 0

      const currency = currencyRaw || (institutionGeo === 'IN' ? 'INR' : institutionGeo === 'UK' ? 'GBP' : institutionGeo === 'US' ? 'USD' : 'EUR')

      // Try instrument type column (description or dedicated)
      const instrumentHint = (mapping.descriptionColumn ? row[mapping.descriptionColumn] : '') ?? ''

      const detectedSubtype = detectAssetSubtype(isin || undefined, name, instrumentHint)
      const assetSubtype: AssetSubtype = detectedSubtype ?? 'cash_general'
      const bucket: BucketType = DEFAULT_BUCKET[assetSubtype]
      const assetClass: AssetClass = assetClassFromSubtype(assetSubtype)

      // Geography from ISIN or institution
      let geography: Geography = institutionGeographyToHolding(institutionGeo)
      if (isin && isin.length >= 2) {
        const prefix = isin.slice(0, 2).toUpperCase()
        const isinGeoMap: Record<string, Geography> = {
          IE: 'europe', LU: 'europe', DE: 'europe', FR: 'europe', NL: 'europe',
          US: 'us', GB: 'uk', IN: 'india',
        }
        geography = isinGeoMap[prefix] ?? geography
      }

      const holding: PortfolioHolding = {
        id: generateId(),
        name,
        ticker: ticker || undefined,
        isin: isin || undefined,
        assetClass,
        assetSubtype,
        bucket,
        geography,
        currentValue,
        currency,
        valueInBaseCurrency: currentValue,
        quantity,
        purchasePrice,
        lastUpdated: new Date().toISOString().slice(0, 10),
        freshnessStatus: 'fresh',
      }

      if (detectedSubtype !== null) {
        holdings.push(holding)
      } else {
        pendingHoldings.push(holding)
      }
    } catch {
      // skip malformed row
    }
  }

  return { holdings, pendingHoldings }
}
