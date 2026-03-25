// /services/ingestion/index.ts
// Single public entry point for all file ingestion.

import * as fileReader from './fileReader'
import * as columnDetector from './columnDetector'
import * as routeDetector from './routeDetector'
import * as transactionParser from './transactionParser'
import * as holdingsParser from './holdingsParser'
import * as deduplicator from './deduplicator'
import type {
  IngestionInput, ParseResult, ParseSuccess, ParseError,
  ImportAuditData, SupportedInstitution,
} from './types'

const SUPPORTED_FORMATS = [
  'ABN Amro: Internet Banking → Download transactions → CSV',
  'ING: Mijn ING → Betaalrekening → Download → CSV',
  'Revolut: Profile → Statements → CSV',
  'Wise: Home → Statement → Download CSV',
  'HDFC Bank: NetBanking → My Accounts → Download → CSV',
  'SBI: OnlineSBI → Account Statement → Download CSV',
  'DeGiro: Portfolio → Account → Export → CSV',
  'Zerodha: Console → Reports → Tradebook → CSV',
]
const REQUEST_SUPPORT_URL = 'https://forms.gle/kashe-bank-request'

function makeError(
  errorCode: ParseError['errorCode'],
  errorMessage: string,
  institution: SupportedInstitution | 'UNKNOWN' = 'UNKNOWN',
  missingTier1Fields?: string[],
): ParseError {
  return {
    success: false,
    institution,
    errorCode,
    errorMessage,
    missingTier1Fields,
    supportedFormats: SUPPORTED_FORMATS,
    requestSupportUrl: REQUEST_SUPPORT_URL,
  }
}

function institutionDisplayName(inst: SupportedInstitution): string {
  const names: Partial<Record<SupportedInstitution, string>> = {
    ABN_AMRO: 'ABN Amro', ING_NL: 'ING', ING: 'ING', RABOBANK: 'Rabobank',
    BUNQ: 'Bunq', SNS_BANK: 'SNS Bank', N26: 'N26', REVOLUT: 'Revolut', WISE: 'Wise',
    DEGIRO: 'DeGiro', IBKR: 'IBKR', INTERACTIVE_BROKERS: 'Interactive Brokers',
    HDFC_BANK: 'HDFC Bank', HDFC_SECURITIES: 'HDFC Securities',
    ICICI_BANK: 'ICICI Bank', SBI: 'SBI', AXIS_BANK: 'Axis Bank',
    KOTAK: 'Kotak', KOTAK_BANK: 'Kotak Bank',
    ADITYA_BIRLA: 'Aditya Birla', ADITYA_BIRLA_CAPITAL: 'Aditya Birla Capital',
    ZERODHA: 'Zerodha', GROWW: 'Groww', UPSTOX: 'Upstox', ANGEL_ONE: 'Angel One',
    SBI_MF: 'SBI MF', MIRAE_ASSET: 'Mirae Asset',
    BARCLAYS: 'Barclays', HSBC: 'HSBC', HSBC_UK: 'HSBC UK',
    MONZO: 'Monzo', LLOYDS: 'Lloyds', NATWEST: 'NatWest', STARLING: 'Starling',
    CHASE: 'Chase', SCHWAB: 'Schwab', CHARLES_SCHWAB: 'Charles Schwab',
    BANK_OF_AMERICA: 'Bank of America', WELLS_FARGO: 'Wells Fargo',
    CITI: 'Citi', CAPITAL_ONE: 'Capital One', FIDELITY: 'Fidelity', VANGUARD: 'Vanguard',
    UNKNOWN: 'Unknown Bank',
  }
  return names[inst] ?? inst.replace(/_/g, ' ')
}

function deriveGeography(inst: SupportedInstitution): 'NL' | 'IN' | 'EU' | 'UK' | 'US' | 'GLOBAL' {
  const NL = ['ABN_AMRO', 'ING_NL', 'ING', 'RABOBANK', 'BUNQ', 'SNS_BANK', 'N26']
  const IN = ['HDFC_BANK', 'ICICI_BANK', 'SBI', 'AXIS_BANK', 'KOTAK', 'KOTAK_BANK',
              'HDFC_SECURITIES', 'ADITYA_BIRLA', 'ADITYA_BIRLA_CAPITAL',
              'ZERODHA', 'GROWW', 'UPSTOX', 'ANGEL_ONE', 'SBI_MF', 'MIRAE_ASSET']
  const UK = ['BARCLAYS', 'HSBC', 'HSBC_UK', 'MONZO', 'LLOYDS', 'NATWEST', 'STARLING']
  const US = ['CHASE', 'SCHWAB', 'CHARLES_SCHWAB', 'IBKR', 'INTERACTIVE_BROKERS',
              'BANK_OF_AMERICA', 'WELLS_FARGO', 'CITI', 'CAPITAL_ONE', 'FIDELITY', 'VANGUARD']
  if ((NL as string[]).includes(inst)) return 'NL'
  if ((IN as string[]).includes(inst)) return 'IN'
  if ((UK as string[]).includes(inst)) return 'UK'
  if ((US as string[]).includes(inst)) return 'US'
  return 'GLOBAL'
}

export async function ingestFile(input: IngestionInput): Promise<ParseResult> {
  try {
    // Stage 1: Read file → rows
    let rows: ReturnType<typeof fileReader.readFile>
    try {
      rows = fileReader.readFile(input.content, input.fileType)
    } catch {
      return makeError('UNSUPPORTED_FORMAT', 'Could not read this file format. Please export as CSV and try again.')
    }

    if (rows.length === 0) {
      return makeError('FILE_EMPTY', 'The file is empty. Please export your transactions and try again.')
    }

    // Stage 2: Detect columns + institution
    const { mapping, confidence, institution, institutionConfidence } =
      columnDetector.detectColumnMapping(rows)

    if (!confidence.tier1Complete) {
      return makeError(
        'TIER1_FIELDS_MISSING',
        "We couldn't find the date or amount columns in this file.",
        institution,
        confidence.missingFields,
      )
    }

    // Stage 3: Detect route
    const route = routeDetector.detectRoute(institution, institutionConfidence, mapping)

    // Build account label
    let accountLabel = institutionDisplayName(institution)
    const firstRow = rows[0]
    if (firstRow !== undefined) {
      for (const value of Object.values(firstRow)) {
        if (typeof value === 'string' && /\d{8,}/.test(value)) {
          const match = /\d{8,}/.exec(value)
          if (match !== null) {
            accountLabel = `${institutionDisplayName(institution)} ····${match[0].slice(-4)}`
            break
          }
        }
      }
    }

    // Stage 4a: Spend path
    if (route.tier1Route === 'spend') {
      const geography = deriveGeography(institution)
      const transactions = transactionParser.parseTransactions(
        rows, mapping, input.dataSourceId, input.profileId, input.householdId, geography,
      )

      if (transactions.length === 0) {
        return makeError('NO_TRANSACTIONS_FOUND', 'No valid transactions could be parsed from this file.', institution)
      }

      const { unique, duplicatesSkipped, probableDuplicates } =
        deduplicator.deduplicateTransactions(transactions, input.existingTransactions)

      const auditData: ImportAuditData = {
        institution,
        transactionCount: unique.length,
        duplicatesSkipped,
        probableDuplicatesFound: probableDuplicates.length,
        layer2Queued: 0,
        parseConfidence: confidence.overallScore,
        holdingCount: 0,
        pendingCategorizationCount: 0,
        tier1Route: 'spend',
        tier2AccountType: route.tier2Suggestion,
      }

      const result: ParseSuccess = {
        success: true,
        institution,
        transactions: unique,
        holdings: [],
        pendingHoldings: [],
        duplicatesSkipped,
        probableDuplicates,
        accountLabel,
        currency: unique[0]?.currency ?? 'EUR',
        confidence,
        auditData,
        routeDetection: route,
        fileType: input.fileType,
      }
      return result
    }

    // Stage 4b: Portfolio path
    const { holdings, pendingHoldings } = holdingsParser.parseHoldings(
      rows, mapping, input.profileId, input.householdId, institution,
    )

    if (holdings.length === 0 && pendingHoldings.length === 0) {
      return makeError('NO_TRANSACTIONS_FOUND', 'No holdings could be parsed from this file.', institution)
    }

    const auditData: ImportAuditData = {
      institution,
      transactionCount: 0,
      duplicatesSkipped: 0,
      probableDuplicatesFound: 0,
      layer2Queued: 0,
      parseConfidence: confidence.overallScore,
      holdingCount: holdings.length,
      pendingCategorizationCount: pendingHoldings.length,
      tier1Route: 'portfolio',
      tier2AccountType: route.tier2Suggestion,
    }

    const result: ParseSuccess = {
      success: true,
      institution,
      transactions: [],
      holdings,
      pendingHoldings,
      duplicatesSkipped: 0,
      probableDuplicates: [],
      accountLabel,
      currency: 'EUR',
      confidence,
      auditData,
      routeDetection: route,
      fileType: input.fileType,
    }
    return result

  } catch {
    return makeError('ATOMIC_ROLLBACK', 'Import failed and was rolled back. Please try again.')
  }
}

// Re-export types for consumers
export type {
  ParseResult, ParseSuccess, ParseError,
  IngestionInput, RouteDetectionResult,
  Tier1Route, Tier2AccountType, RouteConfidence,
  FileType, SupportedInstitution,
  ColumnMapping, ParseConfidence, ImportAuditData, ProbableDuplicate,
} from './types'

export { detectFileType } from './fileReader'
