## VEHICLE INTELLIGENCE ADDITIONS — Session 14/15

### New reference documents (project root /docs)

```
vehicle-rules-IN.md              ✅ Session 14 — India market rules
vehicle-rules-GB.md              ✅ Session 14 — UK market rules
vehicle-rules-NL.md              ✅ Session 14 — Netherlands market rules
vehicle-rules-US.md              ✅ Session 14 — USA market rules
vehicle-rules-DE.md              ✅ Session 14 — Germany market rules
vehicle-rules-XBORDER.md         ✅ Session 14 — Cross-border interaction matrix
VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md  ✅ Session 14 — Annual review checklist
```

### New code files (to be built VI-01 through VI-10)

```
/constants/vehicleRules.ts        ⬜ VI-01 — VehicleRule[], VEHICLE_RULES constant
                                           TaxWrapperTaxType, VehicleCategory enums
                                           SHARED_LIMIT_GROUPS constant
                                           getVehicleCategory() — never throws, returns 'unknown'

/types/userProfile.ts             ⬜ VI-02 — ADDITIONS to UserFinancialProfile:
                                           citizenships: string[]
                                           isUSPerson: boolean
                                           taxResidencyCountry: string
                                           taxResidencyCountrySecondary?: string
                                           incomePrimaryCountry: string
                                           ukResidencyStartDate?: string
                                           ukDomicileStatus?: 'uk'|'non_uk'|'unknown'
                                           indiaTaxRegime?: 'old'|'new'|'unknown'
                                           indiaResidencyStatus?: 'resident'|'nri'|'rnor'|'unknown'
                                           usState?: string
                                           deChurchTaxApplicable?: boolean
                                           primaryInvestmentMarkets: string[] (computed)
                                           crossBorderComplexityScore: number (computed)
                                           hasPficRisk: boolean (computed)
                                           figRegimeEligible: boolean (computed)
                                           activeHoldingPeriodAlerts: string[] (computed)
                                           vehiclePortabilityWarnings: string[] (computed)
                                           VEHICLE_CATEGORY_MAP: 'other' and 'unknown' added

/types/portfolio.ts               ⬜ VI-03 — CHANGES to PortfolioHolding:
                                           purchaseDate: Date (required — was optional)
                                           purchaseDateKnown: boolean (new)
                                           countryOfAsset: string (new — required)
                                           isInsideTaxWrapper: boolean (new — required)
                                           taxWrapperType?: TaxWrapperType (new enum)
                                           costBasis?: number (new)
                                           costBasisCurrency?: string (new)
                                           holdingPeriodMonths?: number (computed)
                                           holdingPeriodStatus?: HoldingPeriodStatus (new enum)
                                           maturityDate?: Date (new)
                                           lockInExpiry?: Date (new)
                                           insurancePremiumAnnual?: number (new)
                                           insuranceSumAssured?: number (new)
                                           annualInterestRate?: number (new)
                                           pficFlag?: boolean (computed)
                                           box3Included?: boolean (computed)
                                           dtaaRelevant?: boolean (computed)
                                           NEW ENUMS: TaxWrapperType (18 values)
                                                      HoldingPeriodStatus (11 values)

/services/userProfileService.ts   ⬜ VI-04 — NEW computed functions:
                                           computeCrossBorderComplexityScore()
                                           computeHoldingPeriodStatuses()
                                           computeHasPficRisk()
                                           computeBox3IncludedHoldings()
                                           computeFigRegimeEligible()
                                           computeVehiclePortabilityWarnings()
                                           Update buildUserFinancialProfile() for new fields

/constants/insightTriggers.ts     ⬜ VI-05 — ADD T13 through T30:
                                           T13: IN STCG→LTCG boundary approaching
                                           T14: DE crypto approaching 12-month tax-free
                                           T15: DE property approaching 10-year tax-free
                                           T16: SGB approaching 8-year maturity
                                           T17: ELSS lock-in expiring
                                           T18: FD approaching maturity
                                           T19: US holding approaching long-term
                                           T20: UK ISA headroom (April 5 deadline)
                                           T21: India 80C headroom (March 31)
                                           T22: NL Box 3 peildatum approaching
                                           T23: US 401k employer match missing
                                           T24: UK pension employer match missing
                                           T25: India NPS employer contribution
                                           T26: DE Freistellungsauftrag not filed
                                           T27: PFIC warning (US person + Indian MFs)
                                           T28: NL Box 3 foreign assets included
                                           T29: UK FIG regime window
                                           T30: India new regime warning

/constants/insightPrompts.ts      ⬜ VI-06 — Market-aware prompt template variants:
                                           Add taxProfile context block to all prompts
                                           NL-specific framing (Box 3)
                                           US person framing (PFIC, worldwide tax)
                                           FIG regime framing (UK new arrivals)
                                           Cross-border caveat when score > 0

/services/holdingsContextBuilder.ts ⬜ VI-07 — Add to context sent to Claude:
                                           taxProfile: { citizenships, taxResidencyCountry,
                                             isUSPerson, indiaTaxRegime, figRegimeEligible,
                                             crossBorderComplexityScore }
                                           holdingFlags: per-holding cross-border flags
                                           activeWarnings: string[]

/app/(tabs or onboarding)/        ⬜ VI-08 — Tax Profile screen (onboarding step 2.5):
                                           "Do you hold investments in more than one country?"
                                           "What is your tax residency?"
                                           "What are your citizenships?"
                                           "Are you a US citizen or green card holder?"
                                           "Which income tax regime are you on?" (India only)
                                           Skippable — defaults to 'unknown' (safe)

[holdingsContextBuilder full      ⬜ VI-09 — Wire vehicleRules into context builder
 wire to vehicleRules]                    So vehicle-specific facts reach AI prompt

[All MD files                     ⬜ VI-10 — Final Vehicle Intelligence documentation lock
 final update]
```

### Files MODIFIED in VI-02 and VI-03

Existing files with new fields added:
```
/types/userProfile.ts             — additions only, no removals
/types/portfolio.ts               — purchaseDate becomes required (breaking change — needs mock data update)
/services/userProfileService.ts   — additions only
/constants/insightTriggers.ts     — T13-T30 added (T1-T12 unchanged)
/constants/insightPrompts.ts      — additions only
/services/holdingsContextBuilder.ts — additions only
```
