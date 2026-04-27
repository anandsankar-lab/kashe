## VEHICLE INTELLIGENCE KNOWN LIMITATIONS — added Session 14

(Add these to the 🟢 Deferred by design section of CLAUDE-bugs.md)

45. PFIC computation: flags risk, does not compute Form 8621 liability.
    US persons with Indian MFs: T27 fires, but actual PFIC tax exposure is not computed.
    V2: integrate PFIC calculation tool or external advisor referral.

46. US state taxes: CA, NY, TX, FL, WA covered by usState field.
    Other US states show 'check your state' fallback.
    V2: complete 50-state coverage.

47. India RNOR status: 'rnor' captured in indiaResidencyStatus but complex
    RNOR-specific rules not fully surfaced in V1. RNOR users see standard NRI insights.
    V2: full RNOR treatment.

48. UK domicile: ukDomicileStatus captured but IHT planning computation not done.
    V2: IHT exposure modelling.

49. Dual residency: taxResidencyCountrySecondary captured but interaction with
    primary country not computed. Split-year residency rules not surfaced.
    Specialist advice caveat always shown for users with secondary residency.

50. German church tax: deChurchTaxApplicable flag present but 8-9% not
    added to displayed effective Abgeltungsteuer rate. V2: include in display.

51. 30% ruling individual tracking: field not tracked in V1 (insufficient
    data to determine eligibility). NL residents with 30% ruling may see
    slightly off Box 3 context until they confirm status.

52. Cross-border pension transfer rules: bAV, Rürup, lijfrente portability
    flagged with warnings. Specific cross-border rules on transfer not surfaced.
    Always "verify with specialist" caveat.

53. purchaseDate migration for existing holdings: Holdings imported before VI-03
    will have purchaseDate = undefined. Migration script in VI-03 sets
    purchaseDateKnown = false for all existing holdings without a date.
    No holding period alerts fire for these holdings until date is confirmed.

54. countryOfAsset for existing holdings: defaults to 'unknown' for holdings
    imported before VI-03. No cross-border triggers fire for 'unknown' assets.
    User prompted to confirm on next app open.

55. VEHICLE_INTELLIGENCE_ANNUAL_REVIEW.md: First review due April 2027.
    All figures verified April 2026 during document creation.
    Calendar reminder required — stale rules are worse than no rules.
