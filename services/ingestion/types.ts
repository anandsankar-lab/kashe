// /services/ingestion/types.ts
// Single source of truth for all ingestion types.

import type { SpendTransaction } from '../../types/spend'
import type { PortfolioHolding, AssetSubtype } from '../../types/portfolio'

// ── INSTITUTION ───────────────────────────────────────────────────────────────

export type SupportedInstitution =
  // NL
  | 'ABN_AMRO'
  | 'ING_NL'
  | 'ING'
  | 'RABOBANK'
  | 'BUNQ'
  | 'SNS_BANK'
  | 'N26'
  | 'REVOLUT'
  | 'WISE'
  // UK
  | 'BARCLAYS'
  | 'HSBC'
  | 'HSBC_UK'
  | 'MONZO'
  | 'LLOYDS'
  | 'NATWEST'
  | 'STARLING'
  // EU
  | 'DEGIRO'
  // US
  | 'CHASE'
  | 'SCHWAB'
  | 'CHARLES_SCHWAB'
  | 'IBKR'
  | 'INTERACTIVE_BROKERS'
  | 'BANK_OF_AMERICA'
  | 'WELLS_FARGO'
  | 'CITI'
  | 'CAPITAL_ONE'
  | 'FIDELITY'
  | 'VANGUARD'
  // IN — spend
  | 'HDFC_BANK'
  | 'ICICI_BANK'
  | 'SBI'
  | 'AXIS_BANK'
  | 'KOTAK'
  | 'KOTAK_BANK'
  // IN — portfolio
  | 'HDFC_SECURITIES'
  | 'ADITYA_BIRLA'
  | 'ADITYA_BIRLA_CAPITAL'
  | 'ZERODHA'
  | 'GROWW'
  | 'UPSTOX'
  | 'ANGEL_ONE'
  | 'SBI_MF'
  | 'MIRAE_ASSET'
  | 'UNKNOWN'

// ── FILE FORMAT ───────────────────────────────────────────────────────────────

export type FileType = 'csv' | 'txt' | 'xlsx'

// ── RAW ROW ───────────────────────────────────────────────────────────────────

export type RawRow = Record<string, string>

// ── COLUMN MAPPING ────────────────────────────────────────────────────────────

export interface ColumnMapping {
  // Spend columns
  dateColumn: string
  amountColumn: string
  debitCreditColumn: string | null
  descriptionColumn: string
  currencyColumn: string | null
  referenceColumn: string | null
  debitIndicator: string | null
  creditIndicator: string | null
  amountFormat: 'european' | 'standard' | 'signed'
  // Portfolio columns (null when not present)
  isinColumn: string | null
  tickerColumn: string | null
  nameColumn: string | null
  quantityColumn: string | null
  priceColumn: string | null
  valueColumn: string | null
}

// ── PARSE CONFIDENCE ──────────────────────────────────────────────────────────

export interface ParseConfidence {
  tier1Complete: boolean
  tier2Score: number
  tier3Score: number
  overallScore: number
  detectedInstitution: SupportedInstitution
  columnMapping: ColumnMapping
  missingFields: string[]
  warnings: string[]
}

// ── ROUTE DETECTION ───────────────────────────────────────────────────────────

export type Tier1Route = 'spend' | 'portfolio'

export type Tier2AccountType =
  | 'savings_account'
  | 'current_account'
  | 'credit_card'
  | 'joint_account'
  | 'brokerage'
  | 'mutual_fund_folio'
  | 'retirement'
  | 'fixed_deposit_account'
  | 'other_investment'

export type RouteConfidence = 'high' | 'medium' | 'low' | 'unknown'

export interface RouteDetectionResult {
  tier1Route: Tier1Route
  tier2Suggestion: Tier2AccountType | null
  confidence: RouteConfidence
  detectedInstitution: SupportedInstitution
  signals: string[]
}

// ── AUDIT ─────────────────────────────────────────────────────────────────────

export interface ImportAuditData {
  institution: SupportedInstitution
  transactionCount: number
  duplicatesSkipped: number
  layer2Queued: number
  parseConfidence: number
  probableDuplicatesFound: number
  holdingCount: number
  pendingCategorizationCount: number
  tier1Route: Tier1Route
  tier2AccountType: Tier2AccountType | null
}

// ── PARSE RESULT ──────────────────────────────────────────────────────────────

export interface ProbableDuplicate {
  incoming: SpendTransaction
  existing: SpendTransaction
  similarityScore: number
}

export interface ParseSuccess {
  success: true
  institution: SupportedInstitution
  transactions: SpendTransaction[]
  holdings: PortfolioHolding[]
  pendingHoldings: PortfolioHolding[]
  duplicatesSkipped: number
  probableDuplicates: ProbableDuplicate[]
  accountLabel: string
  currency: string
  confidence: ParseConfidence
  auditData: ImportAuditData
  routeDetection: RouteDetectionResult
  fileType: FileType
}

export type ParseErrorCode =
  | 'FILE_EMPTY'
  | 'TIER1_FIELDS_MISSING'
  | 'NO_TRANSACTIONS_FOUND'
  | 'PARSE_FAILED'
  | 'ATOMIC_ROLLBACK'
  | 'UNSUPPORTED_FORMAT'

export interface ParseError {
  success: false
  institution: SupportedInstitution | 'UNKNOWN'
  errorCode: ParseErrorCode
  errorMessage: string
  missingTier1Fields?: string[]
  supportedFormats: string[]
  requestSupportUrl: string
}

export type ParseResult = ParseSuccess | ParseError

// ── INGESTION INPUT ───────────────────────────────────────────────────────────

export interface IngestionInput {
  content: string
  fileType: FileType
  filename: string
  dataSourceId: string
  profileId: string
  householdId: string
  existingTransactions: SpendTransaction[]
}

// ── INSTITUTION HINT (legacy — used by column detector) ───────────────────────

export interface InstitutionHint {
  institution: SupportedInstitution
  headerPatterns: string[]
  amountFormat: 'european' | 'standard' | 'signed'
}

export type TierLevel = 1 | 2 | 3 | 4

// Re-export portfolio types used widely in ingestion
export type { SpendTransaction, PortfolioHolding, AssetSubtype }
