export const ASSET_TYPE_LABELS: Record<string, string> = {
  in_mutual_fund:      'Mutual Fund',
  in_debt_fund:        'Debt Fund',
  in_direct_equity:    'Direct Equity',
  in_nre_nro:          'NRE/NRO Account',
  in_ppf:              'PPF',
  in_epf:              'EPF',
  in_nps:              'NPS',
  in_fd:               'Fixed Deposit',
  in_nsc:              'NSC',
  in_bonds:            'Bonds',
  eu_etf:              'ETF',
  eu_direct_equity:    'Direct Equity',
  eu_pension:          'Pension Fund',
  eu_savings:          'Savings Account',
  uk_isa:              'ISA',
  uk_cash_isa:         'Cash ISA',
  uk_sipp:             'SIPP',
  uk_lisa:             'LISA',
  uk_direct_equity:    'Direct Equity',
  uk_premium_bonds:    'Premium Bonds',
  us_401k:             '401(k)',
  us_roth_401k:        'Roth 401(k)',
  us_ira:              'IRA',
  us_roth_ira:         'Roth IRA',
  us_brokerage:        'Brokerage Account',
  us_hsa:              'HSA',
  us_529:              '529 Plan',
  employer_rsu:        'RSU',
  employer_espp:       'ESPP',
  crypto_general:      'Crypto',
  alternative_general: 'Private Investment',
  cash_general:        'Cash',
}

export const GEOGRAPHY_LABELS: Record<string, string> = {
  india:   'India',
  europe:  'Europe',
  us:      'US',
  uk:      'UK',
  global:  'Global',
  uae:     'UAE',
  other:   'Global',
}

export function getAssetTypeLabel(subtype: string): string {
  return ASSET_TYPE_LABELS[subtype] ?? subtype
}

export function getGeographyLabel(geography: string): string {
  return GEOGRAPHY_LABELS[geography] ?? geography
}
