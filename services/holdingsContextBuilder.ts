// Builds HoldingsContextForAI from store data.
// Deterministic lookup logic — no Claude calls.
// Maps ISIN/ticker to issuer IR page and primary regulator.
// This is what we send to Claude — specific identifiers,
// percentages, never absolute values.

import type { PortfolioHolding } from '../types/portfolio'
import {
  type SeedSource,
  type DiscoveredSource,
  getActiveSeedSources,
  rankSources,
} from '../constants/insightSources'
import { isSafeForPrompt } from '../constants/insightPrompts'

// Re-export for callers that need only the helper
export { getActiveSeedSources }

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface HoldingIdentifier {
  ticker?: string
  isin?: string
  name?: string
  assetSubtype: string
  geography: string
  bucketPct: number        // % of total portfolio — NOT absolute value
  isOfficialIssuerKnown: boolean
  officialIssuerUrl?: string  // if known
}

export interface HoldingsContextForAI {
  holdings: HoldingIdentifier[]
  bucketAllocation: {
    growthPct: number
    stabilityPct: number
    lockedPct: number
  }
  currencyExposure: Record<string, number>  // e.g. { EUR: 55, INR: 30, USD: 15 }
  geographyExposure: Record<string, number> // e.g. { europe: 55, india: 30 }
  totalPositionRange: 'under_25k' | '25k_100k' | '100k_500k' | 'over_500k'
  portfolioTier: 1 | 2 | 3 | 4
  isNriProfile: boolean
  riskProfile: string
  instrumentTypesHeld: string[]
  // NEVER includes: absolute values, account numbers,
  //                 purchase prices, transaction history
}

// Holdings with optional ISIN field (future data may include it)
type HoldingInput = PortfolioHolding & { isin?: string }

// ── ISIN → ISSUER IR URL LOOKUP ───────────────────────────────────────────────
// Deterministic. PM extends quarterly.

const ISSUER_IR_URLS: Record<string, {
  name: string
  url: string
  parentBrand: string
}> = {
  // Vanguard Europe ETFs
  'IE00B3RBWM25': {
    name: 'Vanguard FTSE All-World (VWRL)',
    url: 'https://www.vanguard.co.uk/professional/product/mf/equity/9505/ftse-all-world-ucits-etf',
    parentBrand: 'Vanguard',
  },
  'IE00BK5BQT80': {
    name: 'Vanguard FTSE All-World (VWCE)',
    url: 'https://www.vanguard.co.uk/professional/product/etf/equity/9679/ftse-all-world-ucits-etf-usd-accumulating',
    parentBrand: 'Vanguard',
  },

  // iShares
  'IE00B4L5Y983': {
    name: 'iShares Core MSCI World',
    url: 'https://www.ishares.com/uk/individual/en/products/251882/ishares-msci-world-ucits-etf-acc-fund',
    parentBrand: 'iShares',
  },

  // Indian MFs (AMFI scheme codes as proxy — extend as needed)
  // PPFAS
  'INF879O01019': {
    name: 'Parag Parikh Flexi Cap Fund',
    url: 'https://www.ppfas.com/mutual-fund/parag-parikh-flexi-cap-fund',
    parentBrand: 'PPFAS',
  },

  // HDFC
  'INF179K01VQ9': {
    name: 'HDFC Flexi Cap Fund',
    url: 'https://www.hdfcfund.com/our-products/equity/hdfc-flexi-cap-fund',
    parentBrand: 'HDFC AMC',
  },

  // Mirae
  'INF769K01010': {
    name: 'Mirae Asset Large Cap Fund',
    url: 'https://miraeassetmf.co.in/schemes/equity-funds/mirae-asset-large-cap-fund',
    parentBrand: 'Mirae Asset',
  },
}

// ── TICKER → ISSUER IR URL LOOKUP ─────────────────────────────────────────────

const TICKER_IR_URLS: Record<string, {
  name: string
  irUrl: string
  secEdgarUrl?: string
  parentBrand: string
}> = {
  'INFY': {
    name: 'Infosys',
    irUrl: 'https://www.infosys.com/investors.html',
    secEdgarUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=INFY',
    parentBrand: 'Infosys',
  },
  'TCS': {
    name: 'Tata Consultancy Services',
    irUrl: 'https://www.tcs.com/investor-relations',
    parentBrand: 'TCS',
  },
  'AAPL': {
    name: 'Apple Inc',
    irUrl: 'https://investor.apple.com',
    secEdgarUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL',
    parentBrand: 'Apple',
  },
  'MSFT': {
    name: 'Microsoft',
    irUrl: 'https://www.microsoft.com/en-us/investor',
    secEdgarUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=MSFT',
    parentBrand: 'Microsoft',
  },
  'GOOGL': {
    name: 'Alphabet',
    irUrl: 'https://abc.xyz/investor',
    secEdgarUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=GOOGL',
    parentBrand: 'Alphabet',
  },
}

// ── BUILD HOLDINGS CONTEXT ────────────────────────────────────────────────────

export function buildHoldingsContext(
  holdings: PortfolioHolding[],
  financialPosition: number,
  riskProfile: string,
  profile: { baseCountry: string; baseCurrency: string }
): HoldingsContextForAI {

  const total = financialPosition > 0 ? financialPosition : 1

  // Map holdings to identifiers — percentages only, no absolutes
  const holdingIdentifiers: HoldingIdentifier[] = holdings.map(h => {
    const hExt = h as HoldingInput
    const pct = (h.currentValue / total) * 100

    const issuerFromISIN = hExt.isin
      ? ISSUER_IR_URLS[hExt.isin] : undefined
    const issuerFromTicker = h.ticker
      ? TICKER_IR_URLS[h.ticker] : undefined
    const issuer = issuerFromISIN ?? issuerFromTicker

    return {
      ticker: h.ticker,
      isin: hExt.isin,
      name: h.name,
      assetSubtype: h.assetSubtype,
      geography: h.geography,
      bucketPct: Math.round(pct * 10) / 10,
      isOfficialIssuerKnown: !!issuer,
      officialIssuerUrl: issuer
        ? ('url' in issuer ? issuer.url : issuer.irUrl)
        : undefined,
    }
  })

  // Bucket allocation percentages
  const growthSum = holdings
    .filter(h => h.bucket === 'GROWTH')
    .reduce((s, h) => s + h.currentValue, 0)
  const stabilitySum = holdings
    .filter(h => h.bucket === 'STABILITY')
    .reduce((s, h) => s + h.currentValue, 0)
  const lockedSum = holdings
    .filter(h => h.bucket === 'LOCKED')
    .reduce((s, h) => s + h.currentValue, 0)

  // Geography exposure percentages
  const geographyGroups: Record<string, number> = {}
  holdings.forEach(h => {
    geographyGroups[h.geography] =
      (geographyGroups[h.geography] ?? 0) + h.currentValue
  })
  const geographyExposure: Record<string, number> = {}
  Object.entries(geographyGroups).forEach(([geo, val]) => {
    geographyExposure[geo] = Math.round((val / total) * 100)
  })

  // Currency exposure percentages
  const currencyGroups: Record<string, number> = {}
  holdings.forEach(h => {
    currencyGroups[h.currency] =
      (currencyGroups[h.currency] ?? 0) + h.currentValue
  })
  const currencyExposure: Record<string, number> = {}
  Object.entries(currencyGroups).forEach(([cur, val]) => {
    currencyExposure[cur] = Math.round((val / total) * 100)
  })

  // Portfolio tier based on position range
  const portfolioTier: 1 | 2 | 3 | 4 =
    financialPosition < 25_000 ? 1
    : financialPosition < 100_000 ? 2
    : financialPosition < 500_000 ? 3
    : 4

  const totalPositionRange: HoldingsContextForAI['totalPositionRange'] =
    financialPosition < 25_000 ? 'under_25k'
    : financialPosition < 100_000 ? '25k_100k'
    : financialPosition < 500_000 ? '100k_500k'
    : 'over_500k'

  const isNriProfile =
    profile.baseCountry !== 'IN' &&
    (geographyExposure['india'] ?? 0) > 0

  const instrumentTypesHeld = [
    ...new Set(holdings.map(h => h.assetSubtype))
  ]

  return {
    holdings: holdingIdentifiers,
    bucketAllocation: {
      growthPct: Math.round((growthSum / total) * 100),
      stabilityPct: Math.round((stabilitySum / total) * 100),
      lockedPct: Math.round((lockedSum / total) * 100),
    },
    currencyExposure,
    geographyExposure,
    totalPositionRange,
    portfolioTier,
    isNriProfile,
    riskProfile,
    instrumentTypesHeld,
  }
}

// ── FORMAT FOR PROMPT ─────────────────────────────────────────────────────────
// Format HoldingsContextForAI as a prompt-ready string.

export function formatHoldingsContextForPrompt(
  ctx: HoldingsContextForAI
): string {
  const lines: string[] = []

  lines.push(`Portfolio tier: ${ctx.portfolioTier} (${ctx.totalPositionRange})`)
  lines.push(`Risk profile: ${ctx.riskProfile}`)
  lines.push(`NRI profile: ${ctx.isNriProfile}`)
  lines.push('')
  lines.push('Bucket allocation:')
  lines.push(`  Growth:    ${ctx.bucketAllocation.growthPct}%`)
  lines.push(`  Stability: ${ctx.bucketAllocation.stabilityPct}%`)
  lines.push(`  Locked:    ${ctx.bucketAllocation.lockedPct}%`)
  lines.push('')
  lines.push('Geography exposure:')
  Object.entries(ctx.geographyExposure).forEach(([geo, pct]) => {
    lines.push(`  ${geo}: ${pct}%`)
  })
  lines.push('')
  lines.push('Currency exposure:')
  Object.entries(ctx.currencyExposure).forEach(([cur, pct]) => {
    lines.push(`  ${cur}: ${pct}%`)
  })
  lines.push('')
  lines.push('Holdings (identifiers only, % of portfolio):')
  ctx.holdings.forEach(h => {
    const id = h.isin ?? h.ticker ?? h.assetSubtype
    const issuer = h.isOfficialIssuerKnown ? ' [issuer source known]' : ''
    lines.push(`  ${id} — ${h.assetSubtype} — ${h.geography} — ${h.bucketPct}%${issuer}`)
  })
  lines.push('')
  lines.push('Instrument types held:')
  lines.push(`  ${ctx.instrumentTypesHeld.join(', ')}`)

  return lines.join('\n')
}

// ── FORMAT SOURCE LIST FOR PROMPT ─────────────────────────────────────────────
// Build the source list string for the discovery prompt.

export function formatSourceListForPrompt(
  activeSeedSources: SeedSource[],
  discoveredSources: DiscoveredSource[],
  portfolioTier: 1 | 2 | 3 | 4,
  holdingsContext: HoldingsContextForAI
): string {
  const tierCap = portfolioTier === 1 ? 3
    : portfolioTier === 2 ? 6
    : portfolioTier === 3 ? 10
    : 14

  // Combine seed + ranked discovered
  const ranked = rankSources(discoveredSources)

  type SourceEntry = {
    name: string
    url: string
    tier: 1 | 2 | 3
    effectiveQualityScore: number
  }

  const allSources: SourceEntry[] = [
    ...activeSeedSources.map(s => ({
      name: s.name,
      url: s.url,
      tier: s.tier,
      effectiveQualityScore: s.isRegulator ? 95 : 80,
    })),
    ...ranked.map(s => ({
      name: s.name,
      url: s.url,
      tier: s.tier,
      effectiveQualityScore: s.effectiveQualityScore,
    })),
  ]

  // Add official issuer sources for known holdings
  const issuerSources: SourceEntry[] = holdingsContext.holdings
    .filter(h => h.isOfficialIssuerKnown && h.officialIssuerUrl)
    .map(h => ({
      name: `${h.name ?? h.ticker ?? h.isin} (Official Issuer)`,
      url: h.officialIssuerUrl as string,
      tier: 1 as const,
      effectiveQualityScore: 90,
    }))

  const combined = [
    ...issuerSources,       // Issuer sources always included
    ...allSources,
  ].slice(0, tierCap)

  return combined
    .map((s, i) =>
      `${i + 1}. [Tier ${s.tier}] ${s.name} — ${s.url}`
    )
    .join('\n')
}

// ── VALIDATE FOR PROMPT SAFETY ────────────────────────────────────────────────
// Validate all string fields for prompt injection before building any prompt.

export function validateForPromptSafety(
  ctx: HoldingsContextForAI
): boolean {
  for (const h of ctx.holdings) {
    if (h.name && !isSafeForPrompt(h.name)) return false
    if (h.ticker && !isSafeForPrompt(h.ticker)) return false
  }
  return true
}
