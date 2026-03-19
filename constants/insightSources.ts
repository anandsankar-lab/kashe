// ── TYPES ─────────────────────────────────────────────────────────────────────

export type SourceTier = 1 | 2 | 3

export type SourceActiveWhen =
  | 'always'
  | 'india_exposure'
  | 'eur_exposure'
  | 'us_exposure'
  | 'uk_exposure'
  | 'nri_profile'        // baseCountry !== 'IN' + India exposure > 0
  | 'employer_rsu'
  | 'eu_etf'
  | 'in_mutual_fund'
  | 'pension'
  | 'alternative'
  | 'crypto'

export interface SeedSource {
  id: string             // unique, stable, used for dedup
  name: string
  url: string
  domain: string         // root domain only, e.g. 'sebi.gov.in'
  tier: SourceTier
  geography: 'IN' | 'NL' | 'EU' | 'US' | 'UK' | 'GLOBAL'
  activeWhen: SourceActiveWhen[]  // one source can have multiple
  isRegulator: boolean
  isOfficialIssuer: boolean
  instrumentTypes?: string[]      // assetSubtype values
  lastVerified: string            // 'YYYY-MM-DD'
  notes?: string
}

export interface DiscoveredSource {
  id: string
  name: string
  url: string
  domain: string
  tier: SourceTier

  // Computed at discovery time (free signals — no API needed)
  isOfficialIssuer: boolean
  isRegulator: boolean
  parentBrand: string | null   // 'PPFAS' for blog.ppfas.com
  tldSignal: 'gov' | 'org' | 'edu' | 'social' | 'commercial' | 'unknown'
  knownHighAuthority: boolean  // in KNOWN_HIGH_AUTHORITY_DOMAINS list
  safeBrowsingPassed: boolean  // Google Safe Browsing result
  urlResolvable: boolean       // HTTP 200 confirmed

  // Computed quality score from signals above
  computedQualityScore: number  // 0–100, calculated not assigned

  // PM-enriched (set during weekly review — not at runtime)
  similarWebGlobalRank?: number
  googleNewsIndexed?: boolean
  pmQualityAdjustment?: number        // -15 to +15
  pmVerifiedQualityScore?: number     // final after PM review

  // Effective score used in all ranking:
  // pmVerifiedQualityScore if reviewed, else computedQualityScore
  effectiveQualityScore: number

  // Usage signals — improve over time
  useCount: number
  avgRelevanceScore: number           // 0–100, updated per insight
  instrumentRelevance: string[]       // tickers/ISINs this covers

  // Lifecycle
  firstDiscovered: string             // ISO string
  lastUsed: string | null
  pendingReview: boolean
  autoAdded: boolean
  removed: boolean                    // soft delete
}

// ── KNOWN HIGH AUTHORITY DOMAINS ──────────────────────────────────────────────
// Hardcoded allowlist — always high authority.
// No API needed. PM-verified manually.

export const KNOWN_HIGH_AUTHORITY_DOMAINS: string[] = [
  // Global wire + financial press
  'reuters.com', 'bloomberg.com', 'ft.com', 'wsj.com',
  'apnews.com', 'economist.com',

  // India — Tier 1 regulators + authoritative press
  'sebi.gov.in', 'rbi.org.in', 'amfiindia.com',
  'nseindia.com', 'bseindia.com', 'epfindia.gov.in',
  'pib.gov.in',
  'economictimes.com', 'businessstandard.com', 'livemint.com',

  // India — Tier 2 analysis
  'capitalmind.in', 'freefincal.com',
  'valueresearchonline.com', 'morningstar.in',
  'zerodha.com', 'crisil.com',

  // NRI-specific
  'sbnri.com', 'cleartax.in',

  // Europe / NL — Tier 1 regulators
  'ecb.europa.eu', 'dnb.nl', 'afm.nl',
  'euronext.com',

  // Europe — Tier 2 analysis
  'justetf.com', 'curvo.eu', 'iex.nl',
  'thepoorswiss.com', 'trackinsight.com',
  'mijngeldzaken.nl',

  // US — Tier 1
  'sec.gov', 'federalreserve.gov',

  // UK — Tier 1
  'fca.org.uk', 'bankofengland.co.uk',

  // Global ratings + research
  'spglobal.com', 'moodys.com', 'morningstar.com',
]

// ── QUALITY COMPUTATION ────────────────────────────────────────────────────────
// Called at source discovery time. No external API. Free signals only.

export function computeSourceQuality(source: {
  domain: string
  isRegulator: boolean
  isOfficialIssuer: boolean
  parentBrand: string | null
  tldSignal: string
  knownHighAuthority: boolean
  useCount: number
  avgRelevanceScore: number
}): number {
  // Highest trust — never below these floors
  if (source.isRegulator) return Math.min(100, 95 + source.useCount)
  if (source.isOfficialIssuer) return Math.min(100, 90 + source.useCount)
  if (source.parentBrand) return Math.min(100, 85 + source.useCount)
  if (source.knownHighAuthority) return Math.min(100, 80 + source.useCount)

  // TLD signals
  let base = 30
  if (source.tldSignal === 'gov') base = 88
  else if (source.tldSignal === 'edu') base = 68
  else if (source.tldSignal === 'org') base = 52
  else if (source.tldSignal === 'social') base = 40
  else if (source.tldSignal === 'commercial') base = 35

  // Usage lift: each use adds 0.5, relevance score adds up to 10
  const usageLift = Math.min(10, source.useCount * 0.5)
  const relevanceLift = (source.avgRelevanceScore / 100) * 10

  return Math.min(100, Math.round(base + usageLift + relevanceLift))
}

// ── SOURCE RANKING ─────────────────────────────────────────────────────────────
// Used when selecting which sources to search.

export function rankSources(
  sources: DiscoveredSource[]
): DiscoveredSource[] {
  return sources
    .filter(s =>
      !s.removed &&
      s.safeBrowsingPassed &&
      s.urlResolvable
    )
    .sort((a, b) => {
      // Regulators always first
      if (a.isRegulator !== b.isRegulator)
        return a.isRegulator ? -1 : 1
      // Official issuers second
      if (a.isOfficialIssuer !== b.isOfficialIssuer)
        return a.isOfficialIssuer ? -1 : 1
      // Then by effective quality score
      return b.effectiveQualityScore - a.effectiveQualityScore
    })
}

// ── SEED SOURCES ───────────────────────────────────────────────────────────────
// PM-curated, quarterly reviewed.
// Last reviewed: March 2026. Next review: June 2026.

export const SEED_SOURCES: SeedSource[] = [

  // ── GLOBAL (always searched) ─────────────────────────────────────────────
  { id: 'g_reuters',
    name: 'Reuters Wire', url: 'https://www.reuters.com/finance',
    domain: 'reuters.com', tier: 1, geography: 'GLOBAL',
    activeWhen: ['always'], isRegulator: false, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  { id: 'g_bloomberg',
    name: 'Bloomberg', url: 'https://www.bloomberg.com/markets',
    domain: 'bloomberg.com', tier: 1, geography: 'GLOBAL',
    activeWhen: ['always'], isRegulator: false, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  { id: 'g_ft',
    name: 'Financial Times', url: 'https://www.ft.com/markets',
    domain: 'ft.com', tier: 1, geography: 'GLOBAL',
    activeWhen: ['always'], isRegulator: false, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  { id: 'g_morningstar',
    name: 'Morningstar', url: 'https://www.morningstar.com',
    domain: 'morningstar.com', tier: 1, geography: 'GLOBAL',
    activeWhen: ['always'], isRegulator: false, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  { id: 'g_spglobal',
    name: 'S&P Global', url: 'https://www.spglobal.com/ratings',
    domain: 'spglobal.com', tier: 1, geography: 'GLOBAL',
    activeWhen: ['always'], isRegulator: false, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  // ── INDIA (searched when India exposure > 0%) ─────────────────────────────
  { id: 'in_sebi',
    name: 'SEBI', url: 'https://www.sebi.gov.in',
    domain: 'sebi.gov.in', tier: 1, geography: 'IN',
    activeWhen: ['india_exposure'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19',
    notes: 'Primary Indian capital markets regulator' },

  { id: 'in_rbi',
    name: 'RBI', url: 'https://www.rbi.org.in',
    domain: 'rbi.org.in', tier: 1, geography: 'IN',
    activeWhen: ['india_exposure', 'nri_profile'],
    isRegulator: true, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  { id: 'in_amfi',
    name: 'AMFI', url: 'https://www.amfiindia.com',
    domain: 'amfiindia.com', tier: 1, geography: 'IN',
    activeWhen: ['in_mutual_fund'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'in_nse',
    name: 'NSE Announcements',
    url: 'https://www.nseindia.com/companies-listing/corporate-filings/announcements',
    domain: 'nseindia.com', tier: 1, geography: 'IN',
    activeWhen: ['india_exposure'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'in_bse',
    name: 'BSE Announcements',
    url: 'https://www.bseindia.com/corporates/ann.html',
    domain: 'bseindia.com', tier: 1, geography: 'IN',
    activeWhen: ['india_exposure'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'in_epfo',
    name: 'EPFO', url: 'https://www.epfindia.gov.in',
    domain: 'epfindia.gov.in', tier: 1, geography: 'IN',
    activeWhen: ['pension'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19',
    notes: 'EPF rate changes and circulars' },

  { id: 'in_mof',
    name: 'Ministry of Finance (India)',
    url: 'https://pib.gov.in/allRel.aspx',
    domain: 'pib.gov.in', tier: 1, geography: 'IN',
    activeWhen: ['india_exposure', 'pension'],
    isRegulator: true, isOfficialIssuer: false,
    lastVerified: '2026-03-19',
    notes: 'PPF, NSC, small savings rate circulars' },

  { id: 'in_et',
    name: 'Economic Times Markets',
    url: 'https://economictimes.indiatimes.com/markets',
    domain: 'economictimes.com', tier: 1, geography: 'IN',
    activeWhen: ['india_exposure'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'in_bs',
    name: 'Business Standard',
    url: 'https://www.business-standard.com/finance',
    domain: 'businessstandard.com', tier: 1, geography: 'IN',
    activeWhen: ['india_exposure'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'in_mint',
    name: 'Mint', url: 'https://www.livemint.com/market',
    domain: 'livemint.com', tier: 1, geography: 'IN',
    activeWhen: ['india_exposure'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'in_capitalmind',
    name: 'Capitalmind',
    url: 'https://www.capitalmind.in',
    domain: 'capitalmind.in', tier: 2, geography: 'IN',
    activeWhen: ['india_exposure', 'in_mutual_fund'],
    isRegulator: false, isOfficialIssuer: false,
    lastVerified: '2026-03-19',
    notes: 'Deepak Shenoy. Best Indian market analysis.' },

  { id: 'in_freefincal',
    name: 'Freefincal',
    url: 'https://freefincal.com',
    domain: 'freefincal.com', tier: 2, geography: 'IN',
    activeWhen: ['in_mutual_fund', 'pension'],
    isRegulator: false, isOfficialIssuer: false,
    lastVerified: '2026-03-19',
    notes: 'Best Indian MF analysis. M. Pattabiraman.' },

  { id: 'in_valueresearch',
    name: 'Value Research Online',
    url: 'https://www.valueresearchonline.com',
    domain: 'valueresearchonline.com', tier: 2, geography: 'IN',
    activeWhen: ['in_mutual_fund'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'in_morningstar',
    name: 'Morningstar India',
    url: 'https://www.morningstar.in',
    domain: 'morningstar.in', tier: 2, geography: 'IN',
    activeWhen: ['in_mutual_fund'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'in_crisil',
    name: 'CRISIL Research',
    url: 'https://www.crisil.com/en/home/our-businesses/research.html',
    domain: 'crisil.com', tier: 2, geography: 'IN',
    activeWhen: ['in_mutual_fund', 'india_exposure'],
    isRegulator: false, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  // ── NRI-SPECIFIC (India exposure + non-India resident) ────────────────────
  { id: 'nri_rbi_fema',
    name: 'RBI FEMA Notifications',
    url: 'https://rbi.org.in/Scripts/NotificationUser.aspx',
    domain: 'rbi.org.in', tier: 1, geography: 'IN',
    activeWhen: ['nri_profile'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19',
    notes: 'NRE/NRO repatriation rules, FEMA circulars' },

  { id: 'nri_sebi_guidelines',
    name: 'SEBI NRI Guidelines',
    url: 'https://www.sebi.gov.in/legal/master-circulars.html',
    domain: 'sebi.gov.in', tier: 1, geography: 'IN',
    activeWhen: ['nri_profile'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'nri_sbnri',
    name: 'SBNRI',
    url: 'https://sbnri.com/blog',
    domain: 'sbnri.com', tier: 2, geography: 'IN',
    activeWhen: ['nri_profile'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19',
    notes: 'Best NRI-specific financial content' },

  { id: 'nri_cleartax',
    name: 'Cleartax NRI',
    url: 'https://cleartax.in/s/nri-income-tax',
    domain: 'cleartax.in', tier: 2, geography: 'IN',
    activeWhen: ['nri_profile'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  // ── NETHERLANDS / EUROPE ──────────────────────────────────────────────────
  { id: 'eu_ecb',
    name: 'European Central Bank',
    url: 'https://www.ecb.europa.eu/press/pr/html/index.en.html',
    domain: 'ecb.europa.eu', tier: 1, geography: 'EU',
    activeWhen: ['eur_exposure'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'nl_dnb',
    name: 'De Nederlandsche Bank',
    url: 'https://www.dnb.nl/en/news',
    domain: 'dnb.nl', tier: 1, geography: 'NL',
    activeWhen: ['eur_exposure', 'pension'],
    isRegulator: true, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  { id: 'nl_afm',
    name: 'AFM (Netherlands)',
    url: 'https://www.afm.nl/en/nieuws',
    domain: 'afm.nl', tier: 1, geography: 'NL',
    activeWhen: ['eur_exposure'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'eu_euronext',
    name: 'Euronext Product Notices',
    url: 'https://www.euronext.com/en/products/etfs',
    domain: 'euronext.com', tier: 1, geography: 'EU',
    activeWhen: ['eu_etf', 'eur_exposure'],
    isRegulator: true, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  { id: 'eu_justetf',
    name: 'justETF',
    url: 'https://www.justetf.com/en/news',
    domain: 'justetf.com', tier: 2, geography: 'EU',
    activeWhen: ['eu_etf'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19',
    notes: 'Best EU ETF analysis. Tracking difference data.' },

  { id: 'eu_curvo',
    name: 'Curvo',
    url: 'https://curvo.eu/blog',
    domain: 'curvo.eu', tier: 2, geography: 'EU',
    activeWhen: ['eu_etf'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19',
    notes: 'UCITS ETF focus. Excellent EU-specific analysis.' },

  { id: 'nl_iex',
    name: 'IEX.nl',
    url: 'https://www.iex.nl',
    domain: 'iex.nl', tier: 2, geography: 'NL',
    activeWhen: ['eur_exposure'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19',
    notes: 'Dutch financial news. Directly relevant for NL residents.' },

  { id: 'eu_thepoorswiss',
    name: 'The Poor Swiss',
    url: 'https://thepoorswiss.com',
    domain: 'thepoorswiss.com', tier: 2, geography: 'EU',
    activeWhen: ['eu_etf'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  // ── UNITED STATES ─────────────────────────────────────────────────────────
  { id: 'us_fed',
    name: 'Federal Reserve',
    url: 'https://www.federalreserve.gov/newsevents.htm',
    domain: 'federalreserve.gov', tier: 1, geography: 'US',
    activeWhen: ['us_exposure'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'us_sec',
    name: 'SEC EDGAR',
    url: 'https://www.sec.gov/cgi-bin/browse-edgar',
    domain: 'sec.gov', tier: 1, geography: 'US',
    activeWhen: ['us_exposure', 'employer_rsu'],
    isRegulator: true, isOfficialIssuer: false,
    lastVerified: '2026-03-19' },

  { id: 'us_wsj',
    name: 'Wall Street Journal',
    url: 'https://www.wsj.com/news/markets',
    domain: 'wsj.com', tier: 1, geography: 'US',
    activeWhen: ['us_exposure'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  // ── UNITED KINGDOM ────────────────────────────────────────────────────────
  { id: 'uk_boe',
    name: 'Bank of England',
    url: 'https://www.bankofengland.co.uk/news',
    domain: 'bankofengland.co.uk', tier: 1, geography: 'UK',
    activeWhen: ['uk_exposure'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 'uk_fca',
    name: 'FCA',
    url: 'https://www.fca.org.uk/news',
    domain: 'fca.org.uk', tier: 1, geography: 'UK',
    activeWhen: ['uk_exposure'], isRegulator: true,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  // ── SOCIAL SENTIMENT (Tier 3) ─────────────────────────────────────────────
  { id: 't3_india_investments',
    name: 'r/IndiaInvestments',
    url: 'https://www.reddit.com/r/IndiaInvestments',
    domain: 'reddit.com', tier: 3, geography: 'IN',
    activeWhen: ['india_exposure'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19',
    notes: 'High signal-to-noise for Indian retail investors' },

  { id: 't3_dutch_fire',
    name: 'r/DutchFIRE',
    url: 'https://www.reddit.com/r/DutchFIRE',
    domain: 'reddit.com', tier: 3, geography: 'NL',
    activeWhen: ['eur_exposure'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 't3_europe_fire',
    name: 'r/EuropeFIRE',
    url: 'https://www.reddit.com/r/EuropeFIRE',
    domain: 'reddit.com', tier: 3, geography: 'EU',
    activeWhen: ['eur_exposure'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 't3_bogleheads',
    name: 'r/Bogleheads',
    url: 'https://www.reddit.com/r/Bogleheads',
    domain: 'reddit.com', tier: 3, geography: 'GLOBAL',
    activeWhen: ['eu_etf'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },

  { id: 't3_mutualfunds_in',
    name: 'r/mutualfunds (India)',
    url: 'https://www.reddit.com/r/mutualfunds',
    domain: 'reddit.com', tier: 3, geography: 'IN',
    activeWhen: ['in_mutual_fund'], isRegulator: false,
    isOfficialIssuer: false, lastVerified: '2026-03-19' },
]

// ── ACTIVE SEED SOURCE HELPER ──────────────────────────────────────────────────
// Get active seed sources for this user's profile.

export function getActiveSeedSources(params: {
  hasIndiaExposure: boolean
  hasEurExposure: boolean
  hasUsExposure: boolean
  hasUkExposure: boolean
  isNriProfile: boolean
  instrumentTypes: string[]
}): SeedSource[] {
  return SEED_SOURCES.filter(source => {
    return source.activeWhen.some(condition => {
      switch (condition) {
        case 'always': return true
        case 'india_exposure': return params.hasIndiaExposure
        case 'eur_exposure': return params.hasEurExposure
        case 'us_exposure': return params.hasUsExposure
        case 'uk_exposure': return params.hasUkExposure
        case 'nri_profile': return params.isNriProfile
        case 'employer_rsu':
          return params.instrumentTypes.includes('employer_rsu') ||
                 params.instrumentTypes.includes('employer_espp')
        case 'eu_etf':
          return params.instrumentTypes.includes('eu_etf') ||
                 params.instrumentTypes.includes('in_mutual_fund')
        case 'in_mutual_fund':
          return params.instrumentTypes.includes('in_mutual_fund') ||
                 params.instrumentTypes.includes('active_mutual_fund')
        case 'pension':
          return params.instrumentTypes.includes('eu_pension') ||
                 params.instrumentTypes.includes('in_epf') ||
                 params.instrumentTypes.includes('in_nps') ||
                 params.instrumentTypes.includes('in_ppf') ||
                 params.instrumentTypes.includes('uk_sipp') ||
                 params.instrumentTypes.includes('us_401k')
        case 'alternative':
          return params.instrumentTypes.includes('alternative_general')
        case 'crypto':
          return params.instrumentTypes.includes('crypto_general')
        default: return false
      }
    })
  })
}
