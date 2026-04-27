# Kāshe — Session 15 Handoff Document
*Session 14 → Session 15*
*Date: TBD (after Session 14 fully committed and verified)*
*This session completes remaining wiring tickets (W-06/W-07/W-08),
then builds the full Vehicle Intelligence Engine (VI-01 through VI-10).*

---

## HOW TO USE THIS DOCUMENT

You are a senior React Native engineer + fintech domain expert helping
Anand build Kāshe — a personal finance app for globally mobile
working professionals. Target user: any globally mobile professional
in IN, UK, EU, USA — NOT India-specific.

Anand is a PM with strong product instincts and is a coding beginner.
One ticket at a time. No assumptions. No skipping ahead.

**Read in this exact order before writing any code:**
1. CLAUDE-state.md
2. CLAUDE-filetree.md
3. This file
4. CLAUDE-decisions.md (section 4b + new section 19)
5. engineering-rules.md

---

## HOW WE WORK

1. Claude writes Claude Code prompt in planning chat
2. Anand pastes into Claude Code terminal (Code tab, kashe project)
3. Preview at localhost:8081 — screenshot shared back
4. Claude reviews screenshot thoroughly before approving
5. Claude gives exact git commands
6. Anand runs manually in normal terminal — NEVER through Claude Code
7. Commit confirmed → next ticket

---

## CRITICAL CONTEXT: WHAT CHANGED IN SESSION 14

### Vehicle Intelligence Engine — THE CORE PRODUCT

Session 14 was an architecture and documentation session.
The Vehicle Intelligence Engine is the reason Kāshe is different from
every other finance app. It surfaces cross-border tax facts for users
managing money across India, UK, Netherlands, US, and Germany simultaneously.

**What was built in Session 14:**
Six reference documents (now in project root):
- vehicle-rules-IN.md — complete India investment tax rules
- vehicle-rules-GB.md — complete UK investment tax rules
- vehicle-rules-NL.md — complete Netherlands investment tax rules (Box 3)
- vehicle-rules-US.md — complete US investment tax rules (PFIC, state taxes)
- vehicle-rules-DE.md — complete Germany investment tax rules
- vehicle-rules-XBORDER.md — cross-border interaction matrix (the product differentiator)
- VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md — annual review checklist

**What needs to be built in Session 15 (VI-01 through VI-10):**
The TypeScript implementation of those documents, plus profile changes,
portfolio holding changes, new triggers T13-T30, and the Tax Profile onboarding screen.

**The user story:**
Anand and his wife are Dutch citizens with Indian investments.
Their beta users include UK citizens with US holdings, and an Indian citizen in Germany.
When they upload their portfolios, Kāshe should surface:
- "Your Indian mutual funds are included in Dutch Box 3 wealth tax"
- "Your NRE account interest is tax-free in India but included in Box 3 in the Netherlands"
- "Your ELSS lock-in expires in 45 days"
- "Your crypto has been held 10 months in Germany — 2 months to tax-free"
This is V1, not V2. This is the beta.

---

## REMAINING WIRING TICKETS (complete before VI block)

### W-06: Wire useInstrumentCatalogue → InstrumentDiscoverySection

File: components/invest/InstrumentDiscoverySection.tsx

Currently: imports directly from constants/instrumentCatalogue.ts
After: uses useInstrumentCatalogue() hook

Small change. Value: V2 hook internals can change with zero component impact.

```
Commit: [W-06] InstrumentDiscoverySection — via hook
```

---

### W-07: Wire householdStore → RiskProfileCard

File: components/invest/RiskProfileCard.tsx

Currently: local state, lost on restart.
After: persists to householdStore. Read riskProfile on mount.

On confirm: call setRiskProfile() on householdStore.
If changed from 'balanced' default: trackMilestoneReached({ milestone: 'risk_profile_actively_set' })
On mount: read from store for initial selection state.

```
Commit: [W-07] RiskProfileCard — persists to householdStore
```

---

### W-08: Real Data Stress Test

**Not a code ticket. Structured observation.**

Files to test (have ready):
1. ABN Amro personal (TXT tab-delimited)
2. ABN Amro joint → check dedup
3. HDFC personal (CSV or XLSX)
4. HDFC joint → check fuzzy dedup
5. SBI (XLSX)
6. DeGiro (CSV) → should auto-route to portfolio
7. Aditya Birla Capital (XLSX)
8. HDFC Securities (XLSX)

For each, check: institution detected? RouteConfidence? Tier 2 pre-selection? Count? Duplicates?
After confirm: UserFinancialProfile updated? financialVehicles[], portfolioTier, dataMonthsSpend.

Any institutions that fail → fix INSTITUTION_REGISTRY entries before W-09.
No commit.

---

### W-09: Wire UserFinancialProfile → holdingsContextBuilder

File: services/holdingsContextBuilder.ts

Currently: re-derives geographyExposure, currencyExposure, portfolioTier from raw holdings.
After: reads from householdStore.financialProfile.

Update buildHoldingsContext() to accept UserFinancialProfile alongside raw holdings.
Remove redundant derivation code.

Wire update chain: after addHolding/addHoldings/updateHolding/setBucketOverride/setProtection
→ call userProfileService.buildUserFinancialProfile() → update householdStore.

```
Commit: [W-09] holdingsContextBuilder — reads from UserFinancialProfile
```

---

### W-10: Wire UserFinancialProfile → insightTriggers

File: constants/insightTriggers.ts

Currently: TriggerInput built ad-hoc with manually passed fields.
After: evaluateAllTriggers receives UserFinancialProfile, builds TriggerInput internally.

Add helper: buildTriggerInputFromProfile(profile, fxParams)
  fxParams: { hasInrWeakened: boolean; indiaPct: number }

evaluateAllTriggers(profile, fxParams) — simplified signature.

```
Commit: [W-10] insightTriggers — evaluates from UserFinancialProfile
```

---

## VEHICLE INTELLIGENCE TICKETS (VI-01 through VI-10)

### VI-01: constants/vehicleRules.ts (NEW FILE)

Create /constants/vehicleRules.ts

This is the TypeScript implementation of the six vehicle-rules-XX.md documents.
It is the single source of truth for all investment vehicle facts in code.

**Interfaces to implement:**

```typescript
export interface VehicleRule {
  vehicleId: string
  displayName: string
  geography: string[]               // ['IN'] | ['GB'] | ['NL'] | ['US'] | ['DE'] | ['IN','NL'] etc.
  vehicleCategory: VehicleCategory

  taxWrapper: {
    type: TaxWrapperTaxType
    annualLimit?: { amount: number; currency: string; period: 'tax_year' | 'financial_year' | 'calendar_year' }
    sharedLimitGroup?: string       // 'india_80c' | 'uk_isa' | 'india_80d'
    taxFreeGrowth: boolean
    taxFreeWithdrawal: boolean
    taxReliefRate?: 'marginal' | number
    keyFacts: string[]              // max 3, factual only, no advice
    warningFacts?: string[]         // NRI restrictions, regime checks, cross-border caveats
    crossBorderFacts?: string[]     // what happens when you move country
  }

  holdingPeriodRules?: {
    shortTermMonths: number
    taxFreeAfterMonths?: number     // DE crypto: 12, DE property: 120
    lockInMonths?: number
    lockInAgeYears?: number         // NPS: 60
    shortTermRate?: number
    longTermRate?: number
    taxFreeThreshold?: number       // India equity LTCG: 125000
    maturityMonths?: number         // SGB: 96 (8 years)
    earlyExitPenalty?: string
    maturityBenefit?: string
  }

  deadline?: {
    type: 'tax_year_end' | 'financial_year_end' | 'calendar_year_end' | 'peildatum'
    month: number
    day: number
    label: string
    daysWarningThreshold: number
  }

  crossBorderRules: {
    pficRisk: boolean               // US persons: PFIC filing required
    box3Included: boolean           // NL residents: included in Box 3
    portabilityRating: 'high' | 'medium' | 'low' | 'none' | 'unknown'
    portabilityNote?: string
    nriRestricted?: boolean
    nriRestrictedNote?: string
    figRegimeEligible?: boolean
    dtaaTreatment?: Record<string, string>  // e.g. 'IN-NL': 'interest 10% withholding cap'
  }

  tierVisibility: (1 | 2 | 3)[]
  priorityScore: number             // 1-100

  triggerFlags: {
    hasAnnualAllowance: boolean
    hasDeadline: boolean
    isEmployerMatched: boolean
    hasHoldingPeriodAlert: boolean
    hasMaturityAlert: boolean
    hasLockInAlert: boolean
    requiresRegimeCheck: boolean    // India old/new regime
    isBox3Exposed: boolean
    hasPficRisk: boolean
    hasPortabilityRisk: boolean
  }
}

export type TaxWrapperTaxType =
  | 'eee'           // PPF, ISA
  | 'eet'           // pension, 401k traditional
  | 'tee'           // Roth IRA, Roth 401k
  | 'exempt_growth' // S&S ISA (post-tax, tax-free growth + withdrawal)
  | 'deductible'    // NPS old regime, Rürup
  | 'taxed'         // GIA, NRO account
  | 'complex'       // Box 3, ELSS under new regime
  | 'conditional'   // depends on regime or circumstance
  | 'unknown'

export type VehicleCategory =
  | 'pension'
  | 'isa_wrapper'
  | 'tax_advantaged_savings'
  | 'equity_investment'
  | 'fixed_income'
  | 'property'
  | 'emergency_fund'
  | 'insurance_investment'
  | 'employer_benefit'
  | 'government_scheme'
  | 'alternative'
  | 'other'
  | 'unknown'

export type HoldingPeriodStatus =
  | 'short_term'
  | 'approaching_long_term'       // within 60 days of long-term threshold
  | 'long_term'
  | 'approaching_tax_free'        // within 60 days of full tax-free (DE crypto/property)
  | 'tax_free'
  | 'locked'
  | 'approaching_unlock'          // within 90 days of lock-in expiry
  | 'unlocked'
  | 'approaching_maturity'        // within 90 days of maturity
  | 'matured'
  | 'unknown'

export const SHARED_LIMIT_GROUPS = {
  india_80c: { total: 150000, currency: 'INR', label: 'Section 80C shared limit (₹1.5L)' },
  india_80d: { total: 25000, currency: 'INR', label: 'Section 80D health insurance (₹25k)' },
  uk_isa: { total: 20000, currency: 'GBP', label: 'UK ISA annual allowance (£20k)' },
}

// Lookup function — NEVER throws, ALWAYS returns valid category
export function getVehicleCategory(subtype: string): VehicleCategory {
  return VEHICLE_CATEGORY_MAP[subtype] ?? 'unknown'
}

export const VEHICLE_RULES: VehicleRule[] = [
  // India vehicles: ppf, elss, nps_tier1, epf, fd_taxsaver, fd_regular,
  //   nre_account, nro_account, fcnr_account, sgb, equity_mf, debt_mf_pre2023,
  //   debt_mf_post2023, scss, nsc, rbi_frsb, ulip, reit_in, invit_in
  // UK vehicles: isa_stocks_shares, isa_cash, isa_lifetime, sipp, workplace_pension,
  //   eis, seis, vct, offshore_bond, premium_bonds
  // NL vehicles: nl_etf_depot, nl_lijfrente, nl_employer_pension, nl_green_fund, nl_savings
  // US vehicles: us_401k_traditional, us_401k_roth, us_ira_traditional, us_ira_roth,
  //   us_hsa, us_529, us_i_bonds, us_gta (general taxable account)
  // DE vehicles: de_etf_depot, de_rurup, de_riester, de_bav, de_savings
  // ... full array
]
```

**Key entries to implement correctly:**
- PPF: EEE, 15yr lock-in, NRI restricted (cannot open new), Box 3 included (NL), FBAR required (US)
- ELSS: 3yr lock-in, 80C (old regime only), LTCG after lock-in, pficRisk if US person
- NRE account: tax-free IN, Box 3 included NL, taxable UK (no FTC), taxable US, taxable DE
- SGB: maturityMonths: 96, maturityBenefit: 'TAX_FREE at 8 years (Section 10(15)(iv)(h))'
- DE crypto: taxFreeAfterMonths: 12, earlyExitPenalty: 'Marginal income rate up to 47.48%'
- DE property investment: taxFreeAfterMonths: 120 (10 years), portabilityRating: 'high'
- UK ISA: EEE in UK, box3Included: true for NL residents, pficRisk: false BUT 'US does not recognise ISA wrapper'
- US 401k traditional: eet, box3Included: false (NL confirmed exclusion for US persons)
- Rürup: portabilityRating: 'none' — literally cannot be surrendered

```
Commit: [VI-01] vehicleRules.ts — complete vehicle intelligence constant
```

---

### VI-02: types/userProfile.ts additions

Add to UserFinancialProfile interface. All new fields.
Extend VEHICLE_CATEGORY_MAP with 'other' and 'unknown'.
Update getVehicleCategory() to never throw.

**New fields to add:**
```typescript
// Citizenship and tax status
citizenships: string[]             // ['IN'] | ['NL'] | ['GB'] | ['US'] | ['IN','NL'] | etc.
isUSPerson: boolean                // US citizen or green card holder
taxResidencyCountry: string        // 'IN'|'NL'|'GB'|'US'|'DE'|'other'|'unknown'
taxResidencyCountrySecondary?: string
incomePrimaryCountry: string       // 'NL'|'GB'|'US'|'IN'|'DE'|'other'|'unknown'

// Market-specific
ukResidencyStartDate?: string      // ISO date — for FIG regime eligibility
ukDomicileStatus?: 'uk' | 'non_uk' | 'unknown'
indiaTaxRegime?: 'old' | 'new' | 'unknown'
indiaResidencyStatus?: 'resident' | 'nri' | 'rnor' | 'unknown'
usState?: string                   // 'CA'|'NY'|'TX'|'FL'|'WA'|'NV'|'other'|'unknown'
deChurchTaxApplicable?: boolean

// Computed by userProfileService (added to buildUserFinancialProfile())
primaryInvestmentMarkets: string[] // derived from countryOfAsset across all holdings
crossBorderComplexityScore: number // 0-3
hasPficRisk: boolean               // isUSPerson + non-US/non-UCITS funds
figRegimeEligible: boolean         // GB resident within 4 years + 10yr non-UK prior
activeHoldingPeriodAlerts: string[]
vehiclePortabilityWarnings: string[]
```

**Default values for existing users (migration safe):**
- citizenships: []
- isUSPerson: false
- taxResidencyCountry: 'unknown'
- incomePrimaryCountry: 'unknown'
- crossBorderComplexityScore: 0
- hasPficRisk: false
- figRegimeEligible: false

**VEHICLE_CATEGORY_MAP additions:**
```typescript
// Add to existing map:
'nre_account': 'emergency_fund',
'nro_account': 'fixed_income',
'fcnr_account': 'fixed_income',
'sovereign_gold_bond': 'alternative',
'scss': 'fixed_income',
'nsc': 'fixed_income',
'rbi_frsb': 'fixed_income',
'de_bav': 'employer_benefit',
'de_rurup': 'pension',
'de_riester': 'pension',
'de_etf_depot': 'equity_investment',
'us_401k_traditional': 'pension',
'us_401k_roth': 'pension',
'us_ira_traditional': 'pension',
'us_ira_roth': 'pension',
'us_hsa': 'tax_advantaged_savings',
'us_529': 'tax_advantaged_savings',
'nl_lijfrente': 'pension',
'nl_green_investment': 'equity_investment',
'uk_eis': 'alternative',
'uk_seis': 'alternative',
'uk_vct': 'alternative',
'other': 'other',
'unknown': 'unknown',
```

Update getVehicleCategory() lookup at bottom of file:
```typescript
export function getVehicleCategory(subtype: string): VehicleCategory {
  return VEHICLE_CATEGORY_MAP[subtype as AssetSubtype] ?? 'unknown'
}
```

Update mockData.ts: add citizenships, isUSPerson, taxResidencyCountry etc. to mock profile.
Suggested mock: citizenships: ['IN'], taxResidencyCountry: 'NL', isUSPerson: false.

```
Commit: [VI-02] userProfile.ts — citizenship, tax residency, cross-border fields
```

---

### VI-03: types/portfolio.ts additions

PortfolioHolding needs new fields. purchaseDate becomes required.

**Breaking change: purchaseDate required**
Update mockData.ts first — add purchaseDate to every mock holding.
Then update type. TS compiler will catch every call site.

**New fields:**
```typescript
// Make required
purchaseDate: Date               // was optional — NOW REQUIRED
purchaseDateKnown: boolean       // false = date unknown, suppress HP alerts

// New required
countryOfAsset: string           // 'IN'|'NL'|'GB'|'US'|'DE'|'other'|'unknown'
isInsideTaxWrapper: boolean

// New optional
taxWrapperType?: TaxWrapperType  // only when isInsideTaxWrapper = true
costBasis?: number
costBasisCurrency?: string
holdingPeriodMonths?: number     // computed
holdingPeriodStatus?: HoldingPeriodStatus
maturityDate?: Date
lockInExpiry?: Date
insurancePremiumAnnual?: number
insuranceSumAssured?: number
annualInterestRate?: number
pficFlag?: boolean               // computed
box3Included?: boolean           // computed
dtaaRelevant?: boolean           // computed
```

**New TaxWrapperType enum:**
```typescript
export type TaxWrapperType =
  | 'isa_stocks_shares' | 'isa_cash' | 'isa_lifetime' | 'isa_jisa'
  | 'pension_uk' | 'sipp'
  | 'pension_us_401k_traditional' | 'pension_us_401k_roth'
  | 'pension_us_ira_traditional' | 'pension_us_ira_roth' | 'pension_us_hsa'
  | 'pension_de_bav' | 'pension_de_rurup'
  | 'pension_nl_lijfrente' | 'pension_nl_employer'
  | 'pension_in_nps' | 'pension_in_epf' | 'pension_in_ppf'
  | 'us_529'
  | 'other_tax_wrapper'
  | 'unknown'
```

**Migration for existing holdings (add to holdingsParser.ts defaults):**
- purchaseDate: new Date(0) (epoch — January 1, 1970)
- purchaseDateKnown: false
- countryOfAsset: 'unknown'
- isInsideTaxWrapper: false

```
Commit: [VI-03] portfolio.ts — purchaseDate required, countryOfAsset, tax wrapper fields
```

---

### VI-04: services/userProfileService.ts additions

Add five new computed functions. Call them inside buildUserFinancialProfile().

```typescript
// Add these functions:

export function computeCrossBorderComplexityScore(
  citizenships: string[],
  taxResidencyCountry: string,
  primaryInvestmentMarkets: string[]
): number {
  // 0: single market (NL assets only, NL resident, IN citizen)
  // 1: two markets (NL resident with IN assets)
  // 2: three+ markets OR any US person
  // 3: US person + multiple markets
  if (citizenships.includes('US') || taxResidencyCountry === 'US') {
    return primaryInvestmentMarkets.length > 1 ? 3 : 2
  }
  const uniqueMarkets = new Set([...primaryInvestmentMarkets, taxResidencyCountry])
  if (uniqueMarkets.size >= 3) return 2
  if (uniqueMarkets.size === 2) return 1
  return 0
}

export function computeHasPficRisk(
  citizenships: string[],
  isUSPerson: boolean,
  financialVehicles: string[]
): boolean {
  if (!isUSPerson && !citizenships.includes('US')) return false
  const pficVehicles = ['equity_mf', 'index_fund', 'elss', 'debt_mf', 'hybrid_mf', 'fof', 'etf']
  return pficVehicles.some(v => financialVehicles.includes(v))
}

export function computeFigRegimeEligible(
  taxResidencyCountry: string,
  ukResidencyStartDate?: string
): boolean {
  if (taxResidencyCountry !== 'GB') return false
  if (!ukResidencyStartDate) return false
  const startDate = new Date(ukResidencyStartDate)
  const now = new Date()
  const yearsSinceArrival = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return yearsSinceArrival <= 4
}

export function computeBox3IncludedHoldings(
  holdings: PortfolioHolding[],
  taxResidencyCountry: string
): string[] {
  if (taxResidencyCountry !== 'NL') return []
  // Return IDs of holdings that are Box 3 included
  // Excluded: pension_in_nps, pension_in_epf, pension_uk, pension_us_401k_*, 
  //           sipp, pension_nl_employer, pension_nl_lijfrente (until payout)
  const excludedWrappers: TaxWrapperType[] = [
    'pension_uk', 'sipp', 'pension_us_401k_traditional', 'pension_us_401k_roth',
    'pension_us_ira_traditional', 'pension_us_ira_roth', 'pension_de_bav',
    'pension_de_rurup', 'pension_nl_lijfrente', 'pension_nl_employer',
    'pension_in_nps', 'pension_in_epf'
  ]
  return holdings
    .filter(h => !h.isInsideTaxWrapper || !excludedWrappers.includes(h.taxWrapperType as TaxWrapperType))
    .filter(h => h.countryOfAsset !== 'unknown')
    .map(h => h.id)
}

export function computeVehiclePortabilityWarnings(
  financialVehicles: string[],
  taxResidencyCountry: string
): string[] {
  const warnings: string[] = []
  if (taxResidencyCountry === 'DE') {
    if (financialVehicles.includes('de_bav')) warnings.push('bav_portability_risk')
    if (financialVehicles.includes('de_rurup')) warnings.push('rurup_not_transferable')
  }
  if (taxResidencyCountry !== 'NL' && financialVehicles.includes('nl_lijfrente')) {
    warnings.push('lijfrente_nl_only')
  }
  return warnings
}
```

Also add holding period computation in buildUserFinancialProfile():
```typescript
// For each holding: compute holdingPeriodMonths from purchaseDate if purchaseDateKnown
// Set holdingPeriodStatus based on vehicleRules lookup + holdingPeriodMonths
// Set pficFlag, box3Included, dtaaRelevant on each holding
```

Update buildUserFinancialProfile() to call all new functions and populate new profile fields.

```
Commit: [VI-04] userProfileService — computed citizenship, holding period, cross-border functions
```

---

### VI-05: constants/insightTriggers.ts — T13 through T30

Add 18 new triggers after the existing T1-T12.
Each trigger follows the same pure function pattern as existing triggers.

**Pattern to follow:**
```typescript
export const T13_IN_STCG_LTCG_APPROACHING: InsightTrigger = {
  id: 'T13_IN_STCG_LTCG_APPROACHING',
  condition: (profile, _fx) => {
    if (profile.taxResidencyCountry === 'unknown') return false
    // Check holdings with countryOfAsset='IN', equity types, approaching 12-month mark
    return profile.activeHoldingPeriodAlerts.includes('india_equity_stcg_ltcg')
  },
  priority: 70,
  cooldownDays: 7,
}
```

**All 18 triggers to implement:**
T13: India equity approaching 12-month STCG/LTCG boundary
  condition: activeHoldingPeriodAlerts includes 'india_equity_stcg_ltcg'

T14: German crypto approaching 12-month tax-free
  condition: taxResidencyCountry='DE' + activeHoldingPeriodAlerts includes 'de_crypto_taxfree'

T15: German investment property approaching 10-year tax-free
  condition: taxResidencyCountry='DE' + activeHoldingPeriodAlerts includes 'de_property_taxfree'

T16: SGB approaching 8-year maturity
  condition: activeHoldingPeriodAlerts includes 'sgb_maturity'

T17: ELSS approaching 3-year lock-in expiry
  condition: activeHoldingPeriodAlerts includes 'elss_unlock'

T18: FD approaching maturity
  condition: activeHoldingPeriodAlerts includes 'fd_maturity'

T19: US holding approaching 12-month long-term boundary
  condition: isUSPerson + activeHoldingPeriodAlerts includes 'us_equity_longterm'

T20: UK ISA headroom (within 90 days of April 5)
  condition: taxResidencyCountry='GB' + financialVehicles includes ISA + daysUntilApril5 <= 90

T21: India 80C headroom (within 60 days of March 31)
  condition: indiaTaxRegime='old' + financialVehicles includes 80C vehicles + daysUntilMarch31 <= 60

T22: NL Box 3 peildatum approaching (within 60 days of Jan 1)
  condition: taxResidencyCountry='NL' + portfolio value above threshold + daysUntilJan1 <= 60

T23: US 401k employer match missing
  condition: incomePrimaryCountry='US' + !financialVehicles.includes('us_401k_*')

T24: UK pension employer match missing
  condition: incomePrimaryCountry='GB' + !financialVehicles.includes('pension_uk')

T25: India NPS employer contribution (80CCD(2))
  condition: incomePrimaryCountry='IN' + financialVehicles.includes('pension_in_nps')

T26: DE Freistellungsauftrag not filed
  condition: taxResidencyCountry='DE' + financialVehicles.includes('de_etf_depot')
  Note: Cannot detect if already filed — fire once, user can dismiss

T27: PFIC warning
  condition: hasPficRisk = true
  priority: 95 (high — this is materially important)
  cooldownDays: 30

T28: NL Box 3 foreign assets included
  condition: taxResidencyCountry='NL' + has foreign holdings (countryOfAsset != 'NL')
  priority: 80

T29: UK FIG regime window
  condition: figRegimeEligible = true + primaryInvestmentMarkets includes non-GB country
  priority: 85

T30: India new regime warning
  condition: indiaTaxRegime='unknown' AND financialVehicles includes 80C vehicles
  priority: 60

```
Commit: [VI-05] insightTriggers — T13 through T30 Vehicle Intelligence triggers
```

---

### VI-06: constants/insightPrompts.ts additions

Add market-aware context to prompt templates.
When building the prompt, include taxProfile block.
Add cross-border caveat when crossBorderComplexityScore > 0.

**New context block to add to existing prompt builder:**
```typescript
// Add to buildInsightPrompt() or equivalent:

const taxContext = profile.crossBorderComplexityScore > 0 ? `
TAX PROFILE CONTEXT:
- Tax residency: ${profile.taxResidencyCountry}
- Citizenships: ${profile.citizenships.join(', ')}
- US person (worldwide tax): ${profile.isUSPerson}
- India tax regime: ${profile.indiaTaxRegime ?? 'unknown'}
- FIG regime eligible (UK): ${profile.figRegimeEligible}
- Active warnings: ${profile.vehiclePortabilityWarnings.join(', ') || 'none'}

CROSS-BORDER ACTIVE FLAGS:
${profile.hasPficRisk ? '- PFIC risk: holds non-US funds as US person' : ''}
${profile.taxResidencyCountry === 'NL' ? '- NL Box 3: foreign assets included in wealth tax' : ''}
${profile.figRegimeEligible ? '- UK FIG regime: foreign income may be exempt (first 4 years)' : ''}
` : ''

// At end of every prompt where taxContext is non-empty, append:
const crossBorderCaveat = profile.crossBorderComplexityScore > 0
  ? '\n\nIMPORTANT: Cross-border tax rules are complex and situation-specific. Always note that the user should verify with a qualified cross-border tax advisor.'
  : ''
```

**Never:**
- Pass raw vehicleRules.ts to Claude
- Ask Claude to compute tax liability
- Include specific tax amounts in prompts

```
Commit: [VI-06] insightPrompts — market-aware tax profile context
```

---

### VI-07: services/holdingsContextBuilder.ts additions

Add cross-border context to what's sent to Claude.
This supplements the existing context builder — does not replace it.

```typescript
// Add to buildHoldingsContext() return value:
crossBorderContext: {
  taxProfile: {
    citizenships: profile.citizenships,
    taxResidencyCountry: profile.taxResidencyCountry,
    isUSPerson: profile.isUSPerson,
    indiaTaxRegime: profile.indiaTaxRegime,
    figRegimeEligible: profile.figRegimeEligible,
    crossBorderComplexityScore: profile.crossBorderComplexityScore,
  },
  holdingFlags: holdings.map(h => ({
    id: h.id,
    countryOfAsset: h.countryOfAsset,
    isInsideTaxWrapper: h.isInsideTaxWrapper,
    taxWrapperType: h.taxWrapperType,
    holdingPeriodStatus: h.holdingPeriodStatus,
    pficFlag: h.pficFlag,
    box3Included: h.box3Included,
    dtaaRelevant: h.dtaaRelevant,
  })),
  activeWarnings: profile.vehiclePortabilityWarnings,
}
```

```
Commit: [VI-07] holdingsContextBuilder — cross-border context for AI engine
```

---

### VI-08: Onboarding screen — Tax Profile (screen 2.5)

Add new onboarding screen between Location (screen 3) and Age (screen 4).
Or add as an additional section at the end of the existing onboarding flow.
Check with Anand which insertion point works best for the UX.

Screen title: "Your tax profile"
Subtitle: "Helps us surface the right insights for your situation"
Skippable: "I'll set this up later" → sets all to 'unknown' (safe default)

**Questions:**
1. "Do you hold investments in more than one country?"
   → Yes / No / Not sure
   (Yes: show country multi-select; No: skip to Q3)

2. "Which countries?" (if Yes to Q1)
   → Multi-select: India, Netherlands, UK, USA, Germany, Other

3. "What is your current tax residency?"
   → Single select: India, Netherlands, UK, USA, Germany, Other
   Pre-filled from Location screen if possible

4. "What are your citizenships?"
   → Multi-select: Indian, Dutch, British, American (US), German, Other

5. "Are you a US citizen or green card holder?"
   → Yes / No
   (Only shown if US not already selected in Q4)
   (Critical: triggers PFIC and worldwide tax logic)

6. "Which income tax regime are you on?" (only shown if India selected)
   → New regime (default, lower rates) / Old regime (more deductions) / Not sure

**Store results:**
- householdStore profile: citizenships, taxResidencyCountry, isUSPerson, indiaTaxRegime
- On complete: call userProfileService.buildUserFinancialProfile()

**Important:**
- Never block onboarding completion on this screen
- Default state (all 'unknown') = no cross-border triggers fire = safe
- Show simple, human explanation for each question — not tax jargon

```
Commit: [VI-08] Onboarding — Tax Profile screen 2.5
```

---

### VI-09 + VI-10: Wire and document

VI-09: Full end-to-end wire — verify vehicleRules drives triggers drives context drives insights.
Test with a Dutch resident + Indian MF holding → T28 should fire.
Test with a US person + Indian MF → T27 should fire.
Fix any wiring issues.

VI-10: Final MD file updates (CLAUDE-state, CLAUDE-decisions, CLAUDE-filetree, CLAUDE-bugs,
data-architecture, engineering-rules, CLAUDE-history append).

```
Commit: [VI-09] Vehicle Intelligence — full end-to-end wire verified
Commit: [VI-10] All MD files updated — Vehicle Intelligence locked
```

---

## WHAT TO WATCH FOR

**purchaseDate breaking change (VI-03):**
Making purchaseDate required will fail TypeScript for any holding created without it.
Fix mockData.ts first (add dates to all mock holdings).
Then fix holdingsParser.ts defaults (purchaseDate: new Date(0), purchaseDateKnown: false for unknowns).
Then update the type.

**countryOfAsset for existing holdings:**
All holdings from previous imports will have countryOfAsset = 'unknown'.
This is correct — no cross-border triggers fire for 'unknown' assets.
User will be prompted to confirm country when they review holdings.

**T27 PFIC trigger priority:**
Must be priority: 95 — the highest priority trigger in the system.
PFIC exposure is a serious compliance issue for US persons, not a nice-to-have insight.

**Box 3 peildatum timing:**
T22 fires within 60 days of January 1. If the user opens the app in October:
daysUntilJan1 = count days from today to next January 1.
If today IS January or February: this year's peildatum has already passed — show next year.

**The 'unknown' defaults everywhere:**
Every new field defaults to 'unknown' or false if not set.
Never let a missing profile field crash a trigger or a prompt.

---

## LOCKED DECISIONS CARRIED IN

- Vehicle Intelligence: V1, not V2. This IS the beta. Cross-border insights ship with beta.
- purchaseDate: required on PortfolioHolding from VI-03 onwards
- vehicleRules.ts: single source of truth for all vehicle facts
- Tax computation: NEVER. Surface facts only.
- Cross-border caveat: ALWAYS appended when crossBorderComplexityScore > 0
- Annual review: mandatory every April (VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md)
- All enums: must have 'unknown' or 'other' path. No throws.
- PFIC trigger: priority 95 — highest in system
- FIG regime: trigger only, never recommend to claim or not claim

---

## QUICK REFERENCE

```
Repo:     github.com/anandsandk-lab/kashe
Local:    ~/Documents/kashe
Preview:  npx expo start → w → localhost:8081
TS check: npx tsc --noEmit (9 pre-existing errors — zero new is the bar)
Node:     v25.6.1
npm:      --legacy-peer-deps always
PostHog:  eu.posthog.com, project 144615 (ANALYTICS_ENABLED = false)
```

Key files for VI tickets:
```
constants/vehicleRules.ts           ⬜ VI-01 (create)
types/userProfile.ts                ⬜ VI-02 (edit)
types/portfolio.ts                  ⬜ VI-03 (edit)
services/userProfileService.ts      ⬜ VI-04 (edit)
constants/insightTriggers.ts        ⬜ VI-05 (edit)
constants/insightPrompts.ts         ⬜ VI-06 (edit)
services/holdingsContextBuilder.ts  ⬜ VI-07 (edit)
app/(tabs or onboarding)/           ⬜ VI-08 (create)
constants/mockData.ts               ⬜ Update for VI-02 and VI-03

Reference documents (read-only):
vehicle-rules-IN.md
vehicle-rules-GB.md
vehicle-rules-NL.md
vehicle-rules-US.md
vehicle-rules-DE.md
vehicle-rules-XBORDER.md
VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md
```
