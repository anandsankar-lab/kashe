// ─────────────────────────────────────────────────────────────
// Kāshe Instrument Type System
// Three separate concepts: regulatory regime, account wrapper,
// instrument type. Never conflate them.
// Every union type ends with | 'other' so nothing is ever
// unclassifiable. Unknown is always valid.
// ─────────────────────────────────────────────────────────────

// ─── 1. REGULATORY REGIME ────────────────────────────────────
// The legal framework the instrument is issued under.
// Determines investor protections and cross-border access.

export type RegulatoryRegime =
  // EU / European
  | 'UCITS'           // EU fund passport — cross-border accessible
  | 'AIFMD'          // EU alternative investment fund
  | 'ELTIF'          // EU long-term investment fund
  | 'AFM'            // Netherlands Authority for Financial Markets
  | 'FSMA'           // Belgium Financial Services & Markets Authority
  | 'BaFin'          // Germany Bundesanstalt für Finanzdienstleistungsaufsicht
  | 'AMF'            // France Autorité des marchés financiers
  | 'CBI'            // Ireland Central Bank
  | 'FCA'            // UK Financial Conduct Authority
  // US
  | 'SEC'            // US Securities and Exchange Commission
  | 'FINRA'          // US Financial Industry Regulatory Authority
  | 'CFTC'           // US Commodity Futures Trading Commission
  // India
  | 'SEBI'           // Securities and Exchange Board of India
  | 'IRDAI'          // Insurance Regulatory and Development Authority of India
  | 'RBI'            // Reserve Bank of India (NRE/NRO/FCNR accounts)
  | 'EPFO'           // Employees Provident Fund Organisation
  | 'PFRDA'          // Pension Fund Regulatory and Development Authority (NPS)
  | 'MoF_IN'         // India Ministry of Finance (PPF, NSC, KVP, Sukanya)
  // Market infrastructure
  | 'exchange_listed' // Listed on regulated exchange — no fund wrapper
  // Catch-all
  | 'unregulated'    // Crowdfunding, angel, crypto, P2P — explicit flag
  | 'other'          // Known regulated but regime not listed above
  | 'unknown'        // User-entered holding, regime not yet determined

// ─── 2. ACCOUNT WRAPPER ──────────────────────────────────────
// The tax or account structure the instrument sits inside.
// One instrument can be eligible for multiple wrappers.
// 'taxable' = standard brokerage account, no special treatment.

export type AccountWrapper =
  // United Kingdom
  | 'ISA'                   // Stocks & Shares ISA — £20k/yr, tax-free
  | 'Cash_ISA'              // Cash ISA — £20k/yr allowance
  | 'LISA'                  // Lifetime ISA — £4k/yr + 25% govt bonus
  | 'JISA'                  // Junior ISA — for children
  | 'SIPP'                  // Self-Invested Personal Pension
  | 'workplace_pension_GB'  // UK workplace / employer pension
  // United States
  | 'Roth_IRA'              // $7k/yr, post-tax, tax-free growth & withdrawal
  | 'Traditional_IRA'       // $7k/yr, pre-tax, taxable on withdrawal
  | '401k_traditional'      // Employer plan, pre-tax
  | '401k_roth'             // Employer plan, post-tax
  | '403b'                  // Non-profit employer plan
  | 'HSA'                   // Health Savings Account — triple tax advantage
  | '529'                   // Education savings — tax-free for edu expenses
  | 'taxable_brokerage_US'  // Standard US brokerage, no wrapper
  // India
  | 'PPF'                   // Public Provident Fund — 15yr, EEE, ₹1.5L/yr
  | 'EPF'                   // Employees Provident Fund — mandatory
  | 'VPF'                   // Voluntary Provident Fund — additional EPF
  | 'NPS_tier1'             // National Pension — locked till 60
  | 'NPS_tier2'             // National Pension — flexible withdrawal
  | 'ELSS'                  // Equity Linked Saving Scheme — 3yr lock, 80C
  | 'NSC'                   // National Savings Certificate — 5yr, 80C
  | 'KVP'                   // Kisan Vikas Patra — doubles in ~115 months
  | 'SSY'                   // Sukanya Samriddhi Yojana — girl child scheme
  | 'NRE'                   // Non-Resident External — tax-free in India
  | 'NRO'                   // Non-Resident Ordinary — taxable in India
  | 'FCNR'                  // Foreign Currency Non-Resident — FD in forex
  | 'RFC'                   // Resident Foreign Currency — on return to India
  | 'SNRR'                  // Special Non-Resident Rupee — business purpose
  | 'PIS'                   // Portfolio Investment Scheme — NRI equity trading
  // Netherlands
  | 'Pension_NL'            // Occupational pension via pensioenfonds
  | 'Lijfrente_NL'          // Voluntary annuity — tax-deductible premiums
  | 'box3_NL'               // Dutch Box 3 wealth tax — savings & investments
  // Germany
  | 'bAV_DE'                // Betriebliche Altersvorsorge — employer pension
  | 'Riester_DE'            // Riester-Rente — state-subsidised pension
  | 'Rürup_DE'              // Basis-Rente — self-employed pension
  // Belgium
  | 'Pensioensparen_BE'     // Pension saving fund — tax reduction ~30%
  | 'Langetermijnsparen_BE' // Long-term saving — tax reduction
  | 'workplace_pension_BE'  // Belgian employer pension (groepsverzekering)
  // Universal
  | 'taxable'               // Standard account — no special wrapper
  | 'other'                 // Known wrapper not listed
  | 'unknown'               // Not yet determined

// ─── 3. INSTRUMENT TYPE ──────────────────────────────────────
// What the instrument actually is — granular enough to drive
// display icons, suggestion logic, and risk calculation.

export type InstrumentType =
  // ── Funds ──
  | 'etf'                    // Exchange-traded fund (any type)
  | 'index_fund'             // Non-exchange-traded index fund
  | 'active_mutual_fund'     // Actively managed mutual fund
  | 'fund_of_funds'          // Fund that holds other funds
  | 'target_date_fund'       // Lifecycle / target retirement fund
  | 'balanced_fund'          // Mixed equity + bond fund
  | 'bond_etf'               // Bond-focused ETF
  | 'bond_fund'              // Non-exchange-traded bond fund
  | 'commodity_etf'          // Gold, silver, oil, agriculture ETF
  | 'reit_etf'               // Real estate ETF
  | 'money_market_fund'      // Cash-like, near-instant redemption
  | 'liquid_fund'            // India liquid MF — T+1 redemption
  | 'debt_fund'              // India debt mutual fund (various durations)
  // ── Direct Equity ──
  | 'direct_equity'          // Stocks via regulated broker (delivery)
  | 'fractional_equity'      // Fractional shares (DeGiro, Trading 212)
  | 'adr_gdr'                // ADR/GDR — foreign stock on local exchange
  | 'employer_rsu'           // Restricted Stock Units
  | 'employer_espp'          // Employee Stock Purchase Plan
  | 'employer_stock_option'  // Options granted by employer (vested/unvested)
  | 'ipo_allotment'          // IPO shares pending listing
  // ── Fixed Income ──
  | 'direct_govt_bond'       // Direct gilt, T-bill, G-sec, OLO, Bund
  | 'direct_corporate_bond'  // Corporate bond or NCD (direct holding)
  | 'direct_psu_bond'        // India PSU / infrastructure bond
  | 'fixed_deposit'          // Bank FD, NRE FD, FCNR deposit
  | 'recurring_deposit'      // India RD — monthly contribution
  | 'govt_savings_scheme'    // PPF, NSC, KVP, Premium Bonds, I Bonds
  | 'sukuk'                  // Islamic bond
  // ── Cash & Near-Cash ──
  | 'current_account'        // Checking / current account
  | 'savings_account'        // Savings account / HYSA
  | 'nre_account'            // NRE savings — tax-free in India
  | 'nro_account'            // NRO savings — taxable in India
  | 'fcnr_deposit'           // Foreign currency fixed deposit (NRI)
  | 'foreign_cash'           // Physical foreign currency held
  // ── Retirement Wrappers ──
  | 'pension_scheme'         // Employer pension, EPF, bAV, NPS
  | 'annuity'                // Fixed or variable annuity / lijfrente
  | 'retirement_account'     // Roth IRA, 401k, SIPP — self-directed
  // ── Insurance-linked ──
  | 'ulip'                   // Unit Linked Insurance Plan (India)
  | 'endowment_policy'       // Traditional LIC / insurance endowment
  | 'term_insurance'         // Pure term — no investment value
  // ── Alternatives ──
  | 'equity_crowdfunding'    // Crowdcube, Seedrs, Republic, WeFunder
  | 'revenue_based_finance'  // Capchase, Clearco — revenue-share
  | 'angel_investment'       // Informal pre-seed, SAFEs, convertible notes
  | 'venture_fund'           // VC fund LP position
  | 'private_equity'         // PE fund LP position
  | 'hedge_fund'             // Hedge fund position
  | 'p2p_lending'            // Mintos, October, Lendahand, Funding Circle
  | 'impact_bond'            // Triodos, Lendahand fixed-return bonds
  | 'crypto_spot'            // BTC, ETH etc — spot holding
  | 'crypto_staking'         // Staked crypto (locked yield)
  | 'crypto_etf'             // Spot BTC/ETH ETF (US SEC-approved)
  | 'nft'                    // Non-fungible token (speculative)
  | 'commodity_direct'       // Physical gold, silver, SGBs
  | 'reit_direct'            // Direct REIT (not fund-wrapped)
  | 'infrastructure_fund'    // Listed infrastructure investment trust
  // ── Derivatives (track only, never suggest) ──
  | 'stock_options'          // Listed call/put options
  | 'futures'                // Futures contracts
  | 'structured_product'     // Capital-protected notes, autocallables
  // ── Catch-all ──
  | 'other'                  // Valid investment, type not listed
  | 'unknown'                // User-entered, not yet classified

// ─── 4. GEOGRAPHY ────────────────────────────────────────────

export type GeographyCode =
  // Europe
  | 'NL' | 'BE' | 'DE' | 'LU' | 'IE' | 'FR' | 'AT'
  | 'CH' | 'SE' | 'NO' | 'DK' | 'FI' | 'ES' | 'IT'
  | 'PT' | 'PL' | 'CZ' | 'HU'
  // Asia
  | 'IN' | 'SG' | 'HK' | 'JP' | 'AE' | 'SA'
  // Anglo
  | 'US' | 'GB' | 'CA' | 'AU' | 'NZ'
  // Blocs
  | 'GLOBAL_EU'   // UCITS — accessible to all EU residents
  | 'GLOBAL'      // Accessible via international broker anywhere
  | 'unknown'     // Geography not yet determined

// ─── 5. RISK ─────────────────────────────────────────────────

export type RiskTier =
  | 'capital_guaranteed'  // Govt-backed, no market risk (PPF, Premium Bonds)
  | 'very_low'            // Money market, HYSA, liquid funds
  | 'low'                 // Short-duration bond funds, FDs
  | 'medium_low'          // Broad bond funds, balanced funds
  | 'medium'              // Diversified equity index funds, ETFs
  | 'medium_high'         // Regional or thematic ETFs, active funds
  | 'high'                // Concentrated equity, small-cap, EM
  | 'very_high'           // Direct equity, crypto, leveraged
  | 'illiquid'            // Crowdfunding, angel, VC, PE — no exit guarantee
  | 'unknown'             // Not yet assessed

export type LiquidityHorizon =
  | 'instant'     // Same-day, 24/7 (savings account, crypto spot)
  | 't_plus_1'    // Next business day (most ETFs, liquid MFs)
  | 't_plus_2'    // Standard T+2 equity settlement
  | 't_plus_3'    // T+3 (some bond markets)
  | 'days_7'      // Up to 7 days (some MFs, FDs with notice)
  | 'days_30'     // Up to 30 days
  | 'months_3'    // 3-month notice or lock
  | 'months_6'    // 6-month lock
  | 'months_12'   // 1-year lock (ELSS partial, some FDs)
  | 'year_1'      // 1-year lock (ELSS partial, some FDs)
  | 'years_3'     // 3-year lock (ELSS full lock-in)
  | 'years_5'     // 5-year lock (NSC, tax-saver FD)
  | 'years_15'    // 15-year (PPF maturity)
  | 'until_retirement' // EPF, NPS, pension schemes
  | 'unknown'     // Crowdfunding, angel, VC — no guaranteed exit

// ─── 6. PLATFORM ─────────────────────────────────────────────

export type PlatformName =
  // EU brokers
  | 'DeGiro' | 'IBKR' | 'Scalable Capital' | 'Trade Republic'
  | 'Bolero' | 'Keytrade' | 'Bux' | 'Saxo' | 'Swissquote'
  | 'Comdirect' | 'DKB' | 'Flatex' | 'ING_DE' | 'ING_NL'
  | 'Rabobank' | 'ABN_Amro' | 'Triodos' | 'LYNX' | 'Easybroker'
  // India
  | 'Zerodha' | 'Zerodha_Coin' | 'Groww' | 'Kuvera'
  | 'MFCentral' | 'Paytm_Money' | 'INDmoney' | 'ET_Money'
  | 'HDFC_Securities' | 'ICICI_Direct' | 'SBI_Securities'
  | 'Axis_Direct' | 'Kotak_Securities' | 'Angel_One'
  // UK
  | 'Vanguard_UK' | 'Hargreaves_Lansdown' | 'AJ_Bell'
  | 'Freetrade' | 'Trading_212' | 'InvestEngine' | 'Moneybox'
  // US
  | 'Fidelity' | 'Vanguard_US' | 'Schwab' | 'IBKR_US'
  | 'Robinhood' | 'E_Trade' | 'Merrill_Edge' | 'TDAmeritrade'
  // Crowdfunding & alternatives
  | 'Crowdcube' | 'Seedrs' | 'Republic' | 'Lendahand'
  | 'Mintos' | 'October' | 'Funding_Circle'
  // Direct / govt
  | 'TreasuryDirect'   // US I Bonds
  | 'NS_and_I'         // UK Premium Bonds
  | 'RBI_Retail_Direct' // India G-Secs direct
  | 'EPFO_portal'      // India EPF
  | 'NSDL_CRA'         // India NPS
  | 'Post_Office_IN'   // India PPF / NSC / KVP
  | 'employer'         // Employer-routed (pension, RSU, ESPP)
  | 'bank_direct'      // Direct with bank (FD, savings)
  | 'other'            // Valid platform not listed
  | 'unknown'

export interface PlatformAccess {
  name: PlatformName
  geographies: GeographyCode[]
  notes?: string
}

// ─── 7. CATALOGUE ROLE ───────────────────────────────────────

export type CatalogueRole =
  | 'suggest'      // Show in InstrumentDiscoverySection
  | 'track_only'   // Recordable in portfolio — never suggested
  | 'educational'  // Show in FinancialEducationSection only

// ─── 8. CATALOGUE ENTRY ──────────────────────────────────────

export type InstrumentBucket = 'GROWTH' | 'STABILITY' | 'LOCKED'
export type DiscoveryTier = 0 | 1 | 2 | 3

export interface InstrumentCatalogueEntry {
  // Identity
  id: string
  name: string
  ticker?: string
  isin?: string

  // Classification
  type: InstrumentType
  bucket: InstrumentBucket
  tier: DiscoveryTier
  role: CatalogueRole

  // Geography & regulation
  residenceGeographies: GeographyCode[]
  domicile: GeographyCode
  regulatoryRegime: RegulatoryRegime
  eligibleWrappers: AccountWrapper[]

  // Access
  currency: string
  platforms: PlatformAccess[]

  // Copy
  description: string     // one sentence, plain language
  why: string             // "worth exploring" framing, never buy/sell

  // Cost
  expenseRatio?: string   // informational only
  terFootnote: boolean    // show "verify TER before investing"

  // Risk
  riskTier: RiskTier
  liquidityHorizon: LiquidityHorizon
  riskWarning?: string    // required for very_high + illiquid + unregulated

  // Metadata
  tags: string[]
  addedAt: string         // ISO date
  isActive: boolean       // false = soft-deleted, never hard-delete
}

// ─── 9. HELPERS ──────────────────────────────────────────────

// Types that should NEVER appear in suggestions
export const TRACK_ONLY_TYPES: InstrumentType[] = [
  'equity_crowdfunding',
  'angel_investment',
  'venture_fund',
  'private_equity',
  'hedge_fund',
  'nft',
  'stock_options',
  'futures',
  'structured_product',
  'term_insurance',
  'endowment_policy',
  'ulip',
  'employer_rsu',
  'employer_espp',
  'employer_stock_option',
  'ipo_allotment',
  'foreign_cash',
  'other',
  'unknown',
]

// Types that carry mandatory risk warnings
export const HIGH_RISK_TYPES: InstrumentType[] = [
  'equity_crowdfunding',
  'angel_investment',
  'venture_fund',
  'private_equity',
  'crypto_spot',
  'crypto_staking',
  'nft',
  'p2p_lending',
  'direct_corporate_bond',
  'revenue_based_finance',
]
