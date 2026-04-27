## 19. VEHICLE INTELLIGENCE ENGINE — LOCKED (Session 14, 27 April 2026)

The Vehicle Intelligence Engine is the core product differentiator.
It surfaces factual, deadline-aware, market-specific context for every
holding, based on the user's citizenship, tax residency, and asset location.
No other personal finance app does this for globally mobile professionals.

### Source of truth

**vehicle-rules-IN/GB/NL/US/DE/XBORDER.md** — six reference documents.
Written with double self-confirmation as investment expert per market.
Reviewed annually using VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md.

**constants/vehicleRules.ts** — TypeScript implementation of those documents.
The ONLY place investment vehicle facts live in code.
Never hardcode vehicle-specific rules in components, hooks, prompts, or triggers.

### Locked data model decisions

**citizenships: string[]** — required on UserFinancialProfile.
Why: US citizenship means worldwide taxation regardless of residency.
Indian citizenship means NRI status rules and PPF/SCSS restrictions.
These cannot be inferred from tax residency alone.

**isUSPerson: boolean** — required on UserFinancialProfile.
Why: US citizens and green card holders face PFIC rules, worldwide US income tax,
and ISA wrappers that are not recognised by the IRS. This is a binary flag, not inferred.

**taxResidencyCountry: string** — required.
Why: Determines which domestic rules apply (Box 3, CGT, income tax bands).
Different from citizenship. Indian citizen + Dutch tax resident = NL rules primary.

**incomePrimaryCountry: string** — required.
Why: Determines pension access (401k, employer pension, NPS employer contribution).

**purchaseDate: Date** — required on every PortfolioHolding (was optional).
Why: Entire holding period engine depends on it.
For historical imports without date: set purchaseDateKnown = false.
NEVER fire holding period alerts when purchaseDateKnown = false.

**countryOfAsset: string** — required on every PortfolioHolding.
Why: Determines Box 3 inclusion, PFIC risk, DTAA relevance.
'IN' | 'NL' | 'GB' | 'US' | 'DE' | 'other' | 'unknown'

**isInsideTaxWrapper: boolean** — required on every PortfolioHolding.
Why: ISA-wrapped holdings are not Box 3 included. 401k excluded from Dutch Box 3.
Wrappers completely change cross-border treatment.

### How vehicleRules.ts enters the insight engine

vehicleRules.ts is NOT passed directly to Claude.
It feeds the engine through four channels only:
1. insightTriggers.ts — when to fire (T1-T30)
2. holdingsContextBuilder.ts — what structured context to send Claude
3. insightSources.ts — which seed sources to search
4. educationCatalogue.ts — which articles to surface

Claude receives sanitised, structured context — never the raw rules object.

### The 'other' and 'unknown' rule

Every classification field must have an 'other' or 'unknown' path.
No enum, map, or lookup may return undefined or throw for unrecognised input.
VEHICLE_CATEGORY_MAP: getVehicleCategory() returns 'unknown' for unrecognised subtypes. Never throws.
No trigger fires when relevant classification is 'unknown'.
No insight references a vehicle category of 'unknown'.

### Locked engineering rules for Vehicle Intelligence

RULE V1: Never compute tax liability.
  Surface facts only. Never say "you owe X in tax" or "this saves you Y".
  Example correct: "STCG rate is 20% for equity held under 12 months in India."
  Example wrong: "You would pay approximately ₹15,000 on this gain."

RULE V2: Cross-border insights always carry a caveat.
  Any insight involving two countries must include:
  "Cross-border tax is complex — verify with a qualified advisor for your situation."

RULE V3: purchaseDate required. purchaseDateKnown = false when unknown.
  NEVER fire holding period alerts when purchaseDateKnown = false.

RULE V4: Citizenship drives logic, not residency alone.
  US person in Amsterdam: US worldwide tax STILL applies.
  Never assume single-country rules for US persons.

RULE V5: Unknown India regime = no 80C triggers.
  If indiaTaxRegime = 'unknown', never fire 80C headroom triggers (T21).
  Fire T30 (India new regime warning) instead.

RULE V6: vehicleRules.ts is the single source of truth for all vehicle facts.
  Never hardcode vehicle-specific facts anywhere else.

RULE V7: Annual review is mandatory every April.
  VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md must be completed.
  Stale tax rules are worse than no rules — they give false confidence.
  Commit format: [ANNUAL] Vehicle Intelligence review — all figures verified April XXXX.

RULE V8: Every enum and classification map must have 'unknown' or 'other'.
  No lookup ever returns undefined. No lookup ever throws.
  This applies to: VehicleCategory, TaxWrapperType, HoldingPeriodStatus,
  TaxWrapperTaxType, taxResidencyCountry, countryOfAsset, citizenships, usState.

### Known V1 limitations (by design)

These are NOT bugs. They are intentional scope boundaries for beta:
- PFIC computation: flags risk, does not compute Form 8621 liability.
- State-level US taxes: CA, NY, TX, FL, WA covered. Other states show 'check your state'.
- India RNOR status: captured but complex interaction not fully surfaced.
- UK domicile: captured but IHT computation not done.
- Dual residency: secondary tax country captured, interaction not computed.
- 30% ruling individual status: not tracked (insufficient data in V1).
- German church tax: flag present, not computed.
- Cross-border pension transfer: flagged, specific rules not surfaced.
- Actual tax computation: deliberately excluded from all of V1.
