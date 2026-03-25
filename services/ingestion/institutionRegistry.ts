// /services/ingestion/institutionRegistry.ts
// Single source of truth for all institution knowledge.

import type { SupportedInstitution, Tier1Route, Tier2AccountType, RouteConfidence } from './types'

export interface InstitutionDefinition {
  id: SupportedInstitution
  displayName: string
  tier1Route: Tier1Route
  tier2Default: Tier2AccountType
  geography: 'NL' | 'IN' | 'UK' | 'US' | 'EU' | 'GLOBAL'
  columnFingerprints: string[]
  contentFingerprints: string[]
  minFingerprintsForHigh: number
}

export const INSTITUTION_REGISTRY: Partial<Record<SupportedInstitution, InstitutionDefinition>> = {
  ABN_AMRO: {
    id: 'ABN_AMRO', displayName: 'ABN Amro',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'NL',
    columnFingerprints: ['af bij', 'tegenrekening', 'naam', 'omschrijving', 'bedrag', 'mutatiecode', 'valutadatum'],
    contentFingerprints: ['ABNANL', 'abnamro', 'abn amro'],
    minFingerprintsForHigh: 3,
  },
  ING: {
    id: 'ING', displayName: 'ING',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'NL',
    columnFingerprints: ['datum', 'naam / omschrijving', 'rekening', 'tegenrekening', 'code', 'af bij', 'bedrag (eur)', 'mutatiesoort', 'mededelingen'],
    contentFingerprints: ['INGBNL', 'ing bank'],
    minFingerprintsForHigh: 4,
  },
  ING_NL: {
    id: 'ING_NL', displayName: 'ING',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'NL',
    columnFingerprints: ['af/bij', 'naam / omschrijving', 'rekening', 'mededelingen'],
    contentFingerprints: ['INGBNL', 'ing bank'],
    minFingerprintsForHigh: 3,
  },
  RABOBANK: {
    id: 'RABOBANK', displayName: 'Rabobank',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'NL',
    columnFingerprints: ['iban/bban', 'munt', 'bic', 'volgnr', 'datum', 'rentedatum', 'bedrag', 'saldo na trn', 'naam tegenpartij', 'omschrijving-1'],
    contentFingerprints: ['RABONL', 'rabobank'],
    minFingerprintsForHigh: 4,
  },
  BUNQ: {
    id: 'BUNQ', displayName: 'bunq',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'NL',
    columnFingerprints: ['date', 'amount', 'account', 'counterpart name', 'description'],
    contentFingerprints: ['bunq'],
    minFingerprintsForHigh: 2,
  },
  REVOLUT: {
    id: 'REVOLUT', displayName: 'Revolut',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'GLOBAL',
    columnFingerprints: ['started date', 'completed date', 'description', 'amount', 'fee', 'currency', 'state', 'balance'],
    contentFingerprints: ['revolut'],
    minFingerprintsForHigh: 4,
  },
  WISE: {
    id: 'WISE', displayName: 'Wise',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'GLOBAL',
    columnFingerprints: ['transferwise', 'source currency', 'target currency', 'exchange rate', 'transferid'],
    contentFingerprints: ['wise', 'transferwise'],
    minFingerprintsForHigh: 2,
  },
  HDFC_BANK: {
    id: 'HDFC_BANK', displayName: 'HDFC Bank',
    tier1Route: 'spend', tier2Default: 'savings_account', geography: 'IN',
    columnFingerprints: ['date', 'narration', 'value dat', 'debit amount', 'credit amount', 'chq/ref number', 'closing balance'],
    contentFingerprints: ['HDFC', 'hdfc bank'],
    minFingerprintsForHigh: 3,
  },
  SBI: {
    id: 'SBI', displayName: 'State Bank of India',
    tier1Route: 'spend', tier2Default: 'savings_account', geography: 'IN',
    columnFingerprints: ['txn date', 'value date', 'description', 'ref no./cheque no.', 'debit', 'credit', 'balance'],
    contentFingerprints: ['SBI', 'state bank', 'sbi yono'],
    minFingerprintsForHigh: 3,
  },
  ICICI_BANK: {
    id: 'ICICI_BANK', displayName: 'ICICI Bank',
    tier1Route: 'spend', tier2Default: 'savings_account', geography: 'IN',
    columnFingerprints: ['transaction date', 'value date', 'particulars', 'cheque number', 'amount deposited', 'amount withdrawn', 'balance'],
    contentFingerprints: ['ICICI', 'icici bank'],
    minFingerprintsForHigh: 3,
  },
  AXIS_BANK: {
    id: 'AXIS_BANK', displayName: 'Axis Bank',
    tier1Route: 'spend', tier2Default: 'savings_account', geography: 'IN',
    columnFingerprints: ['tran date', 'particulars', 'chq no', 'debit', 'credit', 'balance'],
    contentFingerprints: ['AXIS', 'axis bank', 'UTIB0'],
    minFingerprintsForHigh: 3,
  },
  KOTAK_BANK: {
    id: 'KOTAK_BANK', displayName: 'Kotak Bank',
    tier1Route: 'spend', tier2Default: 'savings_account', geography: 'IN',
    columnFingerprints: ['transaction date', 'description', 'chq / ref no.', 'debit', 'credit', 'balance'],
    contentFingerprints: ['KOTAK', 'kotak mahindra', 'KKBK'],
    minFingerprintsForHigh: 3,
  },
  KOTAK: {
    id: 'KOTAK', displayName: 'Kotak Bank',
    tier1Route: 'spend', tier2Default: 'savings_account', geography: 'IN',
    columnFingerprints: ['transaction date', 'description', 'debit', 'credit', 'balance'],
    contentFingerprints: ['kotak', 'KKBK'],
    minFingerprintsForHigh: 3,
  },
  BARCLAYS: {
    id: 'BARCLAYS', displayName: 'Barclays',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'UK',
    columnFingerprints: ['number', 'date', 'account', 'amount', 'subcategory', 'memo'],
    contentFingerprints: ['barclays', 'BUKBGB'],
    minFingerprintsForHigh: 3,
  },
  LLOYDS: {
    id: 'LLOYDS', displayName: 'Lloyds Bank',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'UK',
    columnFingerprints: ['transaction date', 'transaction type', 'sort code', 'account number', 'transaction description', 'debit amount', 'credit amount', 'balance'],
    contentFingerprints: ['lloyds', 'LOYDGB'],
    minFingerprintsForHigh: 3,
  },
  HSBC_UK: {
    id: 'HSBC_UK', displayName: 'HSBC UK',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'UK',
    columnFingerprints: ['date', 'description', 'amount', 'type', 'balance'],
    contentFingerprints: ['hsbc', 'HBUK', 'MIDLGB'],
    minFingerprintsForHigh: 2,
  },
  NATWEST: {
    id: 'NATWEST', displayName: 'NatWest',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'UK',
    columnFingerprints: ['date', 'transaction type', 'description', 'value', 'balance', 'account name', 'account number'],
    contentFingerprints: ['natwest', 'NWBKGB'],
    minFingerprintsForHigh: 3,
  },
  MONZO: {
    id: 'MONZO', displayName: 'Monzo',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'UK',
    columnFingerprints: ['transaction id', 'date', 'time', 'type', 'name', 'emoji', 'category', 'amount', 'currency', 'local amount', 'local currency', 'notes and #tags', 'address', 'receipt'],
    contentFingerprints: ['monzo', 'mondo'],
    minFingerprintsForHigh: 5,
  },
  STARLING: {
    id: 'STARLING', displayName: 'Starling Bank',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'UK',
    columnFingerprints: ['date', 'counter party', 'reference', 'type', 'amount (gbp)', 'balance (gbp)', 'spending category'],
    contentFingerprints: ['starling', 'SRLGGB'],
    minFingerprintsForHigh: 3,
  },
  CHASE: {
    id: 'CHASE', displayName: 'Chase',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'US',
    columnFingerprints: ['details', 'posting date', 'description', 'amount', 'type', 'balance', 'check or slip #'],
    contentFingerprints: ['chase', 'jpmorgan', 'CHASUS'],
    minFingerprintsForHigh: 3,
  },
  BANK_OF_AMERICA: {
    id: 'BANK_OF_AMERICA', displayName: 'Bank of America',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'US',
    columnFingerprints: ['posted date', 'reference number', 'payee', 'address', 'amount'],
    contentFingerprints: ['bank of america', 'bofa', 'BOFAUS'],
    minFingerprintsForHigh: 3,
  },
  WELLS_FARGO: {
    id: 'WELLS_FARGO', displayName: 'Wells Fargo',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'US',
    columnFingerprints: ['date', 'amount', 'asterisk', 'check number', 'description'],
    contentFingerprints: ['wells fargo', 'WFBIUS'],
    minFingerprintsForHigh: 2,
  },
  CITI: {
    id: 'CITI', displayName: 'Citi',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'US',
    columnFingerprints: ['status', 'date', 'description', 'debit', 'credit'],
    contentFingerprints: ['citibank', 'citi', 'CITIUS'],
    minFingerprintsForHigh: 3,
  },
  CAPITAL_ONE: {
    id: 'CAPITAL_ONE', displayName: 'Capital One',
    tier1Route: 'spend', tier2Default: 'credit_card', geography: 'US',
    columnFingerprints: ['transaction date', 'posted date', 'card no.', 'description', 'category', 'debit', 'credit'],
    contentFingerprints: ['capital one', 'COEOUS'],
    minFingerprintsForHigh: 3,
  },
  DEGIRO: {
    id: 'DEGIRO', displayName: 'DeGiro',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'EU',
    columnFingerprints: ['product', 'isin', 'reference exchange', 'venue', 'quantity', 'price', 'local value', 'value', 'exchange rate', 'transaction costs', 'total', 'order id'],
    contentFingerprints: ['degiro', 'flatex'],
    minFingerprintsForHigh: 4,
  },
  HDFC_SECURITIES: {
    id: 'HDFC_SECURITIES', displayName: 'HDFC Securities',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'IN',
    columnFingerprints: ['symbol', 'isin', 'series', 'quantity', 'average price', 'current price', 'current value', 'gain/loss'],
    contentFingerprints: ['hdfc securities', 'hdfc sec', 'hdfcsec'],
    minFingerprintsForHigh: 3,
  },
  ZERODHA: {
    id: 'ZERODHA', displayName: 'Zerodha',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'IN',
    columnFingerprints: ['isin', 'instrument', 'quantity', 'avg. cost', 'ltp', 'cur. val', 'p&l', 'net chg', 'day chg'],
    contentFingerprints: ['zerodha', 'kite', 'NSE:', 'BSE:'],
    minFingerprintsForHigh: 3,
  },
  GROWW: {
    id: 'GROWW', displayName: 'Groww',
    tier1Route: 'portfolio', tier2Default: 'mutual_fund_folio', geography: 'IN',
    columnFingerprints: ['scheme name', 'folio number', 'units', 'average nav', 'current nav', 'invested value', 'current value', 'returns'],
    contentFingerprints: ['groww', 'nextbillion'],
    minFingerprintsForHigh: 3,
  },
  UPSTOX: {
    id: 'UPSTOX', displayName: 'Upstox',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'IN',
    columnFingerprints: ['trading symbol', 'isin', 'exchange', 'quantity', 'buy average', 'ltp', 'current value', 'p&l'],
    contentFingerprints: ['upstox', 'rksv'],
    minFingerprintsForHigh: 3,
  },
  ANGEL_ONE: {
    id: 'ANGEL_ONE', displayName: 'Angel One',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'IN',
    columnFingerprints: ['scrip name', 'isin', 'qty', 'avg rate', 'mkt rate', 'mkt value', 'gain/loss'],
    contentFingerprints: ['angel one', 'angel broking', 'angelone'],
    minFingerprintsForHigh: 3,
  },
  ADITYA_BIRLA_CAPITAL: {
    id: 'ADITYA_BIRLA_CAPITAL', displayName: 'Aditya Birla Capital',
    tier1Route: 'portfolio', tier2Default: 'mutual_fund_folio', geography: 'IN',
    columnFingerprints: ['scheme name', 'folio no', 'units', 'nav', 'current value', 'invested amount', 'gain/loss'],
    contentFingerprints: ['aditya birla', 'abcmf', 'birla sun life'],
    minFingerprintsForHigh: 3,
  },
  ADITYA_BIRLA: {
    id: 'ADITYA_BIRLA', displayName: 'Aditya Birla Capital',
    tier1Route: 'portfolio', tier2Default: 'mutual_fund_folio', geography: 'IN',
    columnFingerprints: ['scheme name', 'folio', 'nav', 'units', 'purchase date'],
    contentFingerprints: ['aditya birla', 'abcmf'],
    minFingerprintsForHigh: 3,
  },
  SBI_MF: {
    id: 'SBI_MF', displayName: 'SBI Mutual Fund',
    tier1Route: 'portfolio', tier2Default: 'mutual_fund_folio', geography: 'IN',
    columnFingerprints: ['scheme name', 'folio number', 'units', 'purchase nav', 'current nav', 'market value'],
    contentFingerprints: ['sbi mutual fund', 'sbimf', 'sbi mf'],
    minFingerprintsForHigh: 3,
  },
  MIRAE_ASSET: {
    id: 'MIRAE_ASSET', displayName: 'Mirae Asset',
    tier1Route: 'portfolio', tier2Default: 'mutual_fund_folio', geography: 'IN',
    columnFingerprints: ['scheme name', 'folio', 'units', 'nav', 'current value', 'cost value'],
    contentFingerprints: ['mirae asset', 'mirae'],
    minFingerprintsForHigh: 3,
  },
  FIDELITY: {
    id: 'FIDELITY', displayName: 'Fidelity',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'US',
    columnFingerprints: ['account name', 'account number', 'symbol', 'description', 'quantity', 'last price', 'current value', 'cost basis total'],
    contentFingerprints: ['fidelity', 'fmr llc', 'FIDUS'],
    minFingerprintsForHigh: 3,
  },
  CHARLES_SCHWAB: {
    id: 'CHARLES_SCHWAB', displayName: 'Charles Schwab',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'US',
    columnFingerprints: ['symbol', 'description', 'quantity', 'price', 'market value', 'day change', '% of account'],
    contentFingerprints: ['charles schwab', 'schwab', 'SCHW'],
    minFingerprintsForHigh: 3,
  },
  VANGUARD: {
    id: 'VANGUARD', displayName: 'Vanguard',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'US',
    columnFingerprints: ['investment name', 'symbol', 'shares', 'share price', 'total value', 'change', '% of portfolio'],
    contentFingerprints: ['vanguard', 'VGUS'],
    minFingerprintsForHigh: 3,
  },
  INTERACTIVE_BROKERS: {
    id: 'INTERACTIVE_BROKERS', displayName: 'Interactive Brokers',
    tier1Route: 'portfolio', tier2Default: 'brokerage', geography: 'US',
    columnFingerprints: ['financial instrument', 'quantity', 'mult', 'position', 'market price', 'market value', 'average price', 'unrealized p&l', 'realized p&l'],
    contentFingerprints: ['interactive brokers', 'ibkr', 'IBKRUS'],
    minFingerprintsForHigh: 3,
  },
  UNKNOWN: {
    id: 'UNKNOWN', displayName: 'Unknown Institution',
    tier1Route: 'spend', tier2Default: 'current_account', geography: 'GLOBAL',
    columnFingerprints: [],
    contentFingerprints: [],
    minFingerprintsForHigh: 999,
  },
}

const UNKNOWN_DEFINITION: InstitutionDefinition = {
  id: 'UNKNOWN', displayName: 'Unknown Institution',
  tier1Route: 'spend', tier2Default: 'current_account', geography: 'GLOBAL',
  columnFingerprints: [], contentFingerprints: [], minFingerprintsForHigh: 999,
}

export function getInstitution(id: SupportedInstitution): InstitutionDefinition {
  return INSTITUTION_REGISTRY[id] ?? UNKNOWN_DEFINITION
}

export function getSpendInstitutions(): SupportedInstitution[] {
  return (Object.values(INSTITUTION_REGISTRY) as InstitutionDefinition[])
    .filter(d => d.tier1Route === 'spend')
    .map(d => d.id)
}

export function getPortfolioInstitutions(): SupportedInstitution[] {
  return (Object.values(INSTITUTION_REGISTRY) as InstitutionDefinition[])
    .filter(d => d.tier1Route === 'portfolio')
    .map(d => d.id)
}
