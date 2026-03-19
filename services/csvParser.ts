import Papa from 'papaparse'
import { normaliseMerchant } from './spendCategoriser'
import type { SpendTransaction as Transaction, SpendCategory } from '../types/spend'

// ── EXPORTED TYPES ────────────────────────────────────────────────────────────

export type SupportedInstitution =
  | 'ABN_AMRO'
  | 'ING_NL'
  | 'RABOBANK'
  | 'BUNQ'
  | 'SNS_BANK'
  | 'N26'
  | 'REVOLUT'
  | 'WISE'
  | 'DEGIRO'
  | 'IBKR'
  | 'HDFC_BANK'
  | 'HDFC_SECURITIES'
  | 'ICICI_BANK'
  | 'SBI'
  | 'AXIS_BANK'
  | 'KOTAK'
  | 'ADITYA_BIRLA'
  | 'ZERODHA'
  | 'GROWW'
  | 'BARCLAYS'
  | 'HSBC'
  | 'MONZO'
  | 'CHASE'
  | 'SCHWAB'
  | 'UNKNOWN'

export interface ColumnMapping {
  dateColumn: string
  amountColumn: string
  debitCreditColumn: string | null  // null if amount is signed; credit col name if two-col case
  descriptionColumn: string
  currencyColumn: string | null     // null if inferred
  referenceColumn: string | null    // transaction ID if present
  debitIndicator: string | null     // e.g. 'Af', 'Dr', 'D', '-'
  creditIndicator: string | null    // e.g. 'Bij', 'Cr', 'C', '+'
  amountFormat: 'european' | 'standard' | 'signed'
  // european: 1.234,56
  // standard: 1,234.56
  // signed: negative = debit (or two-col: debitCreditColumn holds credit column name)
}

export interface ParseConfidence {
  tier1Complete: boolean
  // tier1: date + amount + debit/credit direction
  // if false: hard fail, return ParseError

  tier2Score: number          // 0–1, fraction of tier2 fields found
  // tier2 fields: currency, description

  tier3Score: number          // 0–1, fraction of tier3 fields found
  // tier3 fields: reference

  overallScore: number
  // tier1 = blocking (not included in score)
  // overallScore = (tier2Score * 0.7) + (tier3Score * 0.3)

  detectedInstitution: SupportedInstitution
  columnMapping: ColumnMapping
  missingFields: string[]
  warnings: string[]
}

export interface ImportAuditData {
  institution: SupportedInstitution
  transactionCount: number
  duplicatesSkipped: number
  layer2Queued: number        // transactions with confidence 0.0
  parseConfidence: number     // overallScore
  probableDuplicatesFound: number
}

export interface ParseSuccess {
  success: true
  institution: SupportedInstitution
  transactions: Transaction[]
  duplicatesSkipped: number
  probableDuplicates: ProbableDuplicate[]
  accountLabel: string
  currency: string
  confidence: ParseConfidence
  auditData: ImportAuditData
}

export interface ParseError {
  success: false
  institution: SupportedInstitution | 'UNKNOWN'
  errorCode:
    | 'FILE_EMPTY'
    | 'TIER1_FIELDS_MISSING'
    | 'NO_TRANSACTIONS_FOUND'
    | 'PARSE_FAILED'
    | 'ATOMIC_ROLLBACK'
  errorMessage: string
  missingTier1Fields?: string[]
  supportedFormats: string[]
  requestSupportUrl: string
}

export type ParseResult = ParseSuccess | ParseError

export interface ProbableDuplicate {
  incoming: Transaction
  existing: Transaction
  similarityScore: number   // 0–1
}

// ── INTERNAL TYPES ────────────────────────────────────────────────────────────

interface RawTransaction {
  date: string
  amount: number
  currency: string
  description: string
  rawDescription: string
  isDebit: boolean
  referenceId?: string
  accountNumber?: string
}

interface SanitisedFields {
  amount: number              // negative if debit
  currency: string
  merchant: string
  description: string
  rawDescription: string
  merchantNorm: string
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

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

// ── INSTITUTION HINTS ─────────────────────────────────────────────────────────

const INSTITUTION_HINTS: Array<{
  institution: SupportedInstitution
  headerPatterns: string[]
  amountFormat: 'european' | 'standard' | 'signed'
}> = [
  {
    institution: 'ABN_AMRO',
    headerPatterns: ['af bij', 'tegenrekening', 'naam / omschrijving', 'bedrag (eur)', 'mutatieSoort'],
    amountFormat: 'european',
  },
  {
    institution: 'ING_NL',
    headerPatterns: ['af/bij', 'naam / omschrijving', 'rekening', 'mededelingen'],
    amountFormat: 'european',
  },
  {
    institution: 'REVOLUT',
    headerPatterns: ['started date', 'completed date', 'money out', 'money in'],
    amountFormat: 'standard',
  },
  {
    institution: 'WISE',
    headerPatterns: ['transferwise', 'source currency', 'target currency', 'exchange rate'],
    amountFormat: 'standard',
  },
  {
    institution: 'HDFC_BANK',
    headerPatterns: ['withdrawal amt', 'deposit amt', 'closing balance', 'chq./ref.no.'],
    amountFormat: 'standard',
  },
  {
    institution: 'SBI',
    headerPatterns: ['txn date', 'ref no./cheque no.', 'debit', 'credit', 'balance'],
    amountFormat: 'standard',
  },
  {
    institution: 'DEGIRO',
    headerPatterns: ['isin', 'product', 'aantal', 'koers', 'waarde', 'datum'],
    amountFormat: 'european',
  },
  {
    institution: 'ZERODHA',
    headerPatterns: ['symbol', 'isin', 'quantity', 'trade date', 'order id'],
    amountFormat: 'standard',
  },
  {
    institution: 'ADITYA_BIRLA',
    headerPatterns: ['scheme name', 'folio', 'nav', 'units', 'purchase date'],
    amountFormat: 'standard',
  },
]

// ── INSTITUTION SETS ──────────────────────────────────────────────────────────

const NL_INSTITUTIONS: SupportedInstitution[] = ['ABN_AMRO', 'ING_NL', 'RABOBANK', 'BUNQ', 'SNS_BANK']
const IN_INSTITUTIONS: SupportedInstitution[] = ['HDFC_BANK', 'ICICI_BANK', 'SBI', 'AXIS_BANK', 'KOTAK', 'ADITYA_BIRLA']
const INDIAN_BANK_INSTITUTIONS: SupportedInstitution[] = ['SBI', 'HDFC_BANK', 'ICICI_BANK', 'AXIS_BANK', 'KOTAK']

// ── AMOUNT PARSING ────────────────────────────────────────────────────────────

export function parseAmount(raw: string, format: 'european' | 'standard'): number {
  if (!raw || raw.trim() === '') return 0
  let cleaned = raw.trim().replace(/[€£$₹]/g, '').trim()
  if (format === 'european') {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    cleaned = cleaned.replace(/,/g, '')
  }
  const result = parseFloat(cleaned)
  return isNaN(result) ? 0 : Math.abs(result)
}

// ── DATE PARSING ──────────────────────────────────────────────────────────────

const MONTH_NAMES: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

export function parseDate(raw: string): Date | null {
  if (!raw || raw.trim() === '') return null
  const s = raw.trim()

  // YYYYMMDD
  if (/^\d{8}$/.test(s)) {
    const yyyy = parseInt(s.slice(0, 4), 10)
    const mm = parseInt(s.slice(4, 6), 10) - 1
    const dd = parseInt(s.slice(6, 8), 10)
    return new Date(yyyy, mm, dd)
  }

  // DD-MM-YYYY
  const dmyDash = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s)
  if (dmyDash) {
    return new Date(parseInt(dmyDash[3], 10), parseInt(dmyDash[2], 10) - 1, parseInt(dmyDash[1], 10))
  }

  // DD/MM/YYYY
  const dmySlash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
  if (dmySlash) {
    return new Date(parseInt(dmySlash[3], 10), parseInt(dmySlash[2], 10) - 1, parseInt(dmySlash[1], 10))
  }

  // MM/DD/YYYY — same pattern, tried after DD/MM/YYYY
  const mdySlash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
  if (mdySlash) {
    return new Date(parseInt(mdySlash[3], 10), parseInt(mdySlash[1], 10) - 1, parseInt(mdySlash[2], 10))
  }

  // YYYY-MM-DD
  const ymd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s)
  if (ymd) {
    return new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10))
  }

  // DD MMM YYYY
  const dMonY = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(s)
  if (dMonY) {
    const monthIdx = MONTH_NAMES[dMonY[2].toLowerCase()]
    if (monthIdx !== undefined) {
      return new Date(parseInt(dMonY[3], 10), monthIdx, parseInt(dMonY[1], 10))
    }
  }

  return null
}

// ── SECURITY PIPELINE ─────────────────────────────────────────────────────────

export function sanitiseTransaction(raw: RawTransaction): SanitisedFields {
  function applyMasks(text: string): string {
    return text
      // 1. Account numbers → last 4 digits
      .replace(/\b\d{8,}\b/g, (m) => '····' + m.slice(-4))
      // 2. IBANs → masked
      .replace(/[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7,}/g, (m) => '····' + m.slice(-4))
      // 3. BSN → removed
      .replace(/\bBSN:?\s*\d{8,9}\b/gi, '')
      // 4. PAN → removed
      .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '')
      // 5. Aadhaar → removed
      .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '')
  }

  const sanitisedDescription = applyMasks(raw.description)
  const sanitisedRawDescription = applyMasks(raw.rawDescription)

  // 6. Apply sign
  const amount = raw.isDebit ? -Math.abs(raw.amount) : Math.abs(raw.amount)

  // 7. Merchant = sanitised description, first 60 chars
  const merchant = sanitisedDescription.slice(0, 60)

  // 8. MerchantNorm
  const merchantNorm = normaliseMerchant(sanitisedDescription)

  return {
    amount,
    currency: raw.currency,
    merchant,
    description: sanitisedDescription,
    rawDescription: sanitisedRawDescription,
    merchantNorm,
  }
}

// ── SMART FIELD DETECTOR ──────────────────────────────────────────────────────

type FieldType = 'date' | 'amount' | 'debitCredit' | 'description' | 'currency' | 'reference'

export function detectColumnMapping(
  headers: string[],
  sampleRows: string[][],
): ParseConfidence {
  const warnings: string[] = []
  const missingFields: string[] = []

  // Step 1: Normalise headers
  const normHeaders = headers.map(h => h.toLowerCase().trim())

  // Step 2: Detect institution
  let detectedInstitution: SupportedInstitution = 'UNKNOWN'
  let bestMatchCount = 0

  for (const hint of INSTITUTION_HINTS) {
    const matchCount = hint.headerPatterns.filter(p =>
      normHeaders.some(h => h.includes(p.toLowerCase()))
    ).length
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount
      detectedInstitution = hint.institution
    }
  }

  if (detectedInstitution === 'UNKNOWN') {
    warnings.push('bank not recognised — using generic parser')
  }

  // Step 3: Score each column for field type
  const colCount = headers.length

  // Pre-compute average string lengths for description detection
  const avgLengths: number[] = Array.from({ length: colCount }, (_, i) => {
    const vals = sampleRows.map(row => row[i] ?? '').filter(v => v !== '')
    return vals.length === 0 ? 0 : vals.reduce((sum, v) => sum + v.length, 0) / vals.length
  })
  const maxAvgLen = avgLengths.length > 0 ? Math.max(...avgLengths) : 0

  const scoreMatrix: Array<Record<FieldType, number>> = Array.from(
    { length: colCount },
    () => ({ date: 0, amount: 0, debitCredit: 0, description: 0, currency: 0, reference: 0 }),
  )

  for (let i = 0; i < colCount; i++) {
    const header = normHeaders[i] ?? ''
    const sampleVals = sampleRows.map(row => row[i] ?? '').filter(v => v.trim() !== '')

    // DATE
    if (['date', 'datum', 'dat', 'time', 'when'].some(k => header.includes(k))) {
      scoreMatrix[i].date = 0.6
    }
    if (sampleVals.length > 0 && sampleVals.every(v => parseDate(v) !== null)) {
      scoreMatrix[i].date = Math.max(scoreMatrix[i].date, 1.0)
    }

    // AMOUNT
    if (['amount', 'bedrag', 'amt', 'value', 'waarde', 'debit', 'credit', 'money'].some(k => header.includes(k))) {
      scoreMatrix[i].amount = 0.6
    }
    if (sampleVals.length > 0 && sampleVals.every(v => {
      const cleaned = v.replace(/[,. €£$₹\s\-+]/g, '')
      return cleaned !== '' && !isNaN(Number(cleaned))
    })) {
      scoreMatrix[i].amount = Math.max(scoreMatrix[i].amount, 1.0)
    }

    // DEBIT_CREDIT_FLAG
    if (['af bij', 'af/bij', 'type', 'dc', 'dr/cr', 'code', 'flag'].some(k => header.includes(k))) {
      scoreMatrix[i].debitCredit = 0.6
    }
    const uniqueVals = new Set(sampleVals.map(v => v.trim()))
    if (sampleVals.length > 0 && uniqueVals.size <= 5 && [...uniqueVals].every(v => v.length <= 10)) {
      scoreMatrix[i].debitCredit = Math.max(scoreMatrix[i].debitCredit, 0.9)
    }

    // DESCRIPTION
    if (['description', 'omschrijving', 'naam', 'name', 'merchant', 'narration', 'particulars', 'mededelingen', 'details'].some(k => header.includes(k))) {
      scoreMatrix[i].description = 0.6
    }
    if (maxAvgLen > 0 && avgLengths[i] === maxAvgLen) {
      scoreMatrix[i].description = Math.max(scoreMatrix[i].description, 0.8)
    }

    // CURRENCY
    if (['currency', 'valuta', 'munt'].some(k => header.includes(k))) {
      scoreMatrix[i].currency = 0.6
    }
    if (sampleVals.length > 0 && sampleVals.every(v => /^[A-Z]{3}$/.test(v.trim()))) {
      scoreMatrix[i].currency = Math.max(scoreMatrix[i].currency, 1.0)
    }

    // REFERENCE
    if (['reference', 'ref', 'id', 'transaction id', 'order id', 'cheque', 'kenmerk'].some(k => header.includes(k))) {
      scoreMatrix[i].reference = 0.6
    }
    const allUnique = new Set(sampleVals).size === sampleVals.length && sampleVals.length >= 2
    if (sampleVals.length > 0 && allUnique && sampleVals.every(v => /^[a-zA-Z0-9\-_/]+$/.test(v.trim()))) {
      scoreMatrix[i].reference = Math.max(scoreMatrix[i].reference, 0.8)
    }
  }

  // Step 4: Assign best-scoring column to each field type (greedy, no reuse)
  const assignedCols = new Set<number>()
  const fieldAssignments: Partial<Record<FieldType, number>> = {}

  // Build sorted candidates list
  const candidates: Array<{ field: FieldType; col: number; score: number }> = []
  for (let i = 0; i < colCount; i++) {
    const scores = scoreMatrix[i]
    if (scores === undefined) continue
    for (const field of Object.keys(scores) as FieldType[]) {
      const score = scores[field]
      if (score > 0) {
        candidates.push({ field, col: i, score })
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score)

  for (const { field, col, score: _score } of candidates) {
    if (fieldAssignments[field] === undefined && !assignedCols.has(col)) {
      fieldAssignments[field] = col
      assignedCols.add(col)
    }
  }

  // Step 5: Detect amount format
  const institutionHint = INSTITUTION_HINTS.find(h => h.institution === detectedInstitution)
  let amountFormat: 'european' | 'standard' | 'signed' = institutionHint?.amountFormat ?? 'standard'

  if (!institutionHint && fieldAssignments.amount !== undefined) {
    const amtColIdx = fieldAssignments.amount
    const amtVals = sampleRows.map(r => r[amtColIdx] ?? '').filter(v => v !== '')
    if (amtVals.length > 0) {
      const sample = amtVals[0] ?? ''
      const hasComma = amtVals.some(v => v.includes(','))
      const hasPeriod = amtVals.some(v => v.includes('.'))
      if (hasComma && hasPeriod) {
        const lastComma = sample.lastIndexOf(',')
        const lastPeriod = sample.lastIndexOf('.')
        amountFormat = lastComma > lastPeriod ? 'european' : 'standard'
      } else if (hasComma && !hasPeriod) {
        amountFormat = 'european'
      } else {
        amountFormat = 'standard'
      }
    }
  }

  // Step 6: Detect debit/credit encoding
  let debitCreditColumn: string | null = null
  let debitIndicator: string | null = null
  let creditIndicator: string | null = null
  let hasSeparateAmountCols = false

  if (fieldAssignments.amount !== undefined) {
    // Check for a second unassigned column that scores >= 0.6 as amount (two-col case)
    for (let i = 0; i < colCount; i++) {
      const colScores = scoreMatrix[i]
      if (
        i !== fieldAssignments.amount &&
        !assignedCols.has(i) &&
        colScores !== undefined &&
        colScores.amount >= 0.6
      ) {
        // Two-column case: debit col = amountColumn, credit col = debitCreditColumn
        debitCreditColumn = headers[i] ?? null
        amountFormat = 'signed'
        hasSeparateAmountCols = true
        assignedCols.add(i)
        break
      }
    }
  }

  if (!hasSeparateAmountCols) {
    if (fieldAssignments.debitCredit !== undefined) {
      // Single amount + flag column
      const dcIdx = fieldAssignments.debitCredit
      debitCreditColumn = headers[dcIdx] ?? null
      const flagVals = sampleRows
        .map(r => r[dcIdx] ?? '')
        .filter(v => v.trim() !== '')
        .map(v => v.trim())
      const uniqueFlags = [...new Set(flagVals)]
      if (uniqueFlags.length >= 2) {
        debitIndicator = uniqueFlags[0] ?? null
        creditIndicator = uniqueFlags[1] ?? null
      } else if (uniqueFlags.length === 1) {
        debitIndicator = uniqueFlags[0] ?? null
      }
    } else {
      // Signed amount — no flag column
      amountFormat = 'signed'
    }
  }

  // Step 7: Build ColumnMapping
  const dateColName = fieldAssignments.date !== undefined ? (headers[fieldAssignments.date] ?? '') : ''
  const amountColName = fieldAssignments.amount !== undefined ? (headers[fieldAssignments.amount] ?? '') : ''
  const descColName = fieldAssignments.description !== undefined ? (headers[fieldAssignments.description] ?? '') : ''
  const currColName = fieldAssignments.currency !== undefined ? (headers[fieldAssignments.currency] ?? null) : null
  const refColName = fieldAssignments.reference !== undefined ? (headers[fieldAssignments.reference] ?? null) : null

  const columnMapping: ColumnMapping = {
    dateColumn: dateColName,
    amountColumn: amountColName,
    debitCreditColumn,
    descriptionColumn: descColName,
    currencyColumn: currColName,
    referenceColumn: refColName,
    debitIndicator,
    creditIndicator,
    amountFormat,
  }

  // Step 8: Compute ParseConfidence
  const tier1Complete =
    dateColName !== '' &&
    amountColName !== '' &&
    (debitCreditColumn !== null || amountFormat === 'signed' || hasSeparateAmountCols)

  if (!tier1Complete) {
    if (dateColName === '') missingFields.push('date')
    if (amountColName === '') missingFields.push('amount')
    if (debitCreditColumn === null && amountFormat !== 'signed') missingFields.push('debit/credit direction')
  }

  const tier2Found = [
    fieldAssignments.currency !== undefined,
    fieldAssignments.description !== undefined,
  ].filter(Boolean).length
  const tier2Score = tier2Found / 2

  const tier3Found = [fieldAssignments.reference !== undefined].filter(Boolean).length
  const tier3Score = tier3Found / 1

  const overallScore = tier2Score * 0.7 + tier3Score * 0.3

  if (fieldAssignments.currency === undefined) {
    warnings.push('currency inferred as EUR')
    missingFields.push('currency')
  }
  if (fieldAssignments.reference === undefined) {
    warnings.push('using compound deduplication key')
    missingFields.push('reference')
  }
  if (fieldAssignments.description === undefined) {
    missingFields.push('description')
  }

  return {
    tier1Complete,
    tier2Score,
    tier3Score,
    overallScore,
    detectedInstitution,
    columnMapping,
    missingFields,
    warnings,
  }
}

// ── DEDUPLICATION ─────────────────────────────────────────────────────────────

function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1.0
  if (a.length < 2 || b.length < 2) return 0.0

  const bigramSet = (s: string): Set<string> => {
    const set = new Set<string>()
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.slice(i, i + 2))
    }
    return set
  }

  const aSet = bigramSet(a)
  const bSet = bigramSet(b)

  let intersectionCount = 0
  for (const bigram of aSet) {
    if (bSet.has(bigram)) intersectionCount++
  }

  if (aSet.size + bSet.size === 0) return 0.0
  return (2 * intersectionCount) / (aSet.size + bSet.size)
}

function compoundKey(t: Transaction): string {
  const dateStr = t.date instanceof Date ? t.date.toISOString().slice(0, 10) : String(t.date)
  return `${dateStr}|${Math.abs(t.amount)}|${t.description.slice(0, 20).toLowerCase().trim()}`
}

export function deduplicateTransactions(
  incoming: Transaction[],
  existing: Transaction[],
): {
  unique: Transaction[]
  duplicatesSkipped: number
  probableDuplicates: ProbableDuplicate[]
} {
  const unique: Transaction[] = []
  let duplicatesSkipped = 0
  const probableDuplicates: ProbableDuplicate[] = []

  // Build key sets from existing
  const existingCompoundKeys = new Set(existing.map(compoundKey))

  // Apply fuzzy matching for Indian bank imports (geography as proxy)
  const applyFuzzy = incoming.length > 0 && incoming[0]?.geography === 'india'

  for (const txn of incoming) {
    const cKey = compoundKey(txn)

    if (existingCompoundKeys.has(cKey)) {
      duplicatesSkipped++
      continue
    }

    // Fuzzy match for Indian banks
    if (applyFuzzy) {
      const txnDate = txn.date instanceof Date ? txn.date.toISOString().slice(0, 10) : String(txn.date)
      const fuzzyMatch = existing.find(ex => {
        const exDate = ex.date instanceof Date ? ex.date.toISOString().slice(0, 10) : String(ex.date)
        if (txnDate !== exDate) return false
        if (Math.abs(txn.amount) !== Math.abs(ex.amount)) return false
        const similarity = diceCoefficient(
          txn.description.toLowerCase(),
          ex.description.toLowerCase(),
        )
        return similarity > 0.8
      })

      if (fuzzyMatch !== undefined) {
        const similarity = diceCoefficient(
          txn.description.toLowerCase(),
          fuzzyMatch.description.toLowerCase(),
        )
        probableDuplicates.push({ incoming: txn, existing: fuzzyMatch, similarityScore: similarity })
        continue
      }
    }

    unique.push(txn)
  }

  return { unique, duplicatesSkipped, probableDuplicates }
}

// ── GENERIC ROW PARSER ────────────────────────────────────────────────────────

export function parseRow(
  row: Record<string, string>,
  mapping: ColumnMapping,
  dataSourceId: string,
  profileId: string,
  householdId: string,
  institution: SupportedInstitution,
  index: number,
): Transaction | null {
  try {
    // Date parsing
    const rawDate = row[mapping.dateColumn] ?? ''
    const date = parseDate(rawDate)
    if (date === null) return null

    // Amount parsing
    const decimalFmt: 'european' | 'standard' =
      mapping.amountFormat === 'european' ? 'european' : 'standard'

    let amount: number
    let isDebit: boolean

    const isTwoColCase =
      mapping.amountFormat === 'signed' && mapping.debitCreditColumn !== null

    if (isTwoColCase) {
      // Separate debit + credit columns
      const debitRaw = row[mapping.amountColumn] ?? ''
      const creditRaw = row[mapping.debitCreditColumn!] ?? ''
      const debitAmt = parseAmount(debitRaw, decimalFmt)
      const creditAmt = parseAmount(creditRaw, decimalFmt)
      isDebit = debitAmt > 0
      amount = isDebit ? debitAmt : creditAmt
    } else if (mapping.debitCreditColumn !== null) {
      // Single amount + flag column
      amount = parseAmount(row[mapping.amountColumn] ?? '', decimalFmt)
      const flagValue = (row[mapping.debitCreditColumn] ?? '').trim().toLowerCase()
      isDebit = flagValue === (mapping.debitIndicator?.toLowerCase() ?? '')
    } else {
      // Signed amount
      const rawAmt = row[mapping.amountColumn] ?? ''
      const parsedAmt = parseAmount(rawAmt, decimalFmt)
      // Check original for sign
      const originalStr = rawAmt.trim()
      const isNegative = originalStr.startsWith('-')
      isDebit = isNegative || (mapping.amountFormat === 'signed' && isNegative)
      amount = parsedAmt
    }

    if (amount === 0) return null

    // Currency
    let currency: string
    if (mapping.currencyColumn !== null) {
      currency = (row[mapping.currencyColumn] ?? '').trim() || 'EUR'
    } else if (NL_INSTITUTIONS.includes(institution)) {
      currency = 'EUR'
    } else if (IN_INSTITUTIONS.includes(institution)) {
      currency = 'INR'
    } else {
      currency = 'EUR'
    }

    // Reference ID
    const referenceId =
      mapping.referenceColumn !== null
        ? (row[mapping.referenceColumn] ?? '').trim() || undefined
        : undefined

    // Description
    const rawDescriptionValue = mapping.descriptionColumn
      ? (row[mapping.descriptionColumn] ?? '')
      : ''

    const rawTxn: RawTransaction = {
      date: rawDate,
      amount,
      currency,
      description: rawDescriptionValue,
      rawDescription: rawDescriptionValue,
      isDebit,
      referenceId,
    }

    const sanitised = sanitiseTransaction(rawTxn)

    // Geography
    const geography: 'india' | 'europe' | 'other' = NL_INSTITUTIONS.includes(institution)
      ? 'europe'
      : IN_INSTITUTIONS.includes(institution)
        ? 'india'
        : 'other'

    const transaction: Transaction = {
      id: `txn_${dataSourceId}_${index}_${Date.now()}`,
      dataSourceId,
      profileId,
      householdId,
      date,
      amount: sanitised.amount,
      currency: sanitised.currency,
      currencyOriginal: sanitised.currency,
      amountOriginal: Math.abs(sanitised.amount),
      fxRateApplied: null,
      merchant: sanitised.merchant,
      description: sanitised.description,
      rawDescription: sanitised.rawDescription,
      merchantNorm: sanitised.merchantNorm,
      category: 'other' as SpendCategory,
      subcategory: undefined,
      geography,
      ownership: 'personal',
      isRecurring: false,
      recurringGroupId: undefined,
      isExcluded: false,
      dataSource: 'CSV',
      importedAt: new Date(),
      tags: [],
    }

    return transaction
  } catch {
    return null
  }
}

// ── INTERNAL HELPER ───────────────────────────────────────────────────────────

function institutionDisplayName(inst: SupportedInstitution): string {
  const names: Record<SupportedInstitution, string> = {
    ABN_AMRO: 'ABN Amro',
    ING_NL: 'ING',
    RABOBANK: 'Rabobank',
    BUNQ: 'Bunq',
    SNS_BANK: 'SNS Bank',
    N26: 'N26',
    REVOLUT: 'Revolut',
    WISE: 'Wise',
    DEGIRO: 'DeGiro',
    IBKR: 'IBKR',
    HDFC_BANK: 'HDFC Bank',
    HDFC_SECURITIES: 'HDFC Securities',
    ICICI_BANK: 'ICICI Bank',
    SBI: 'SBI',
    AXIS_BANK: 'Axis Bank',
    KOTAK: 'Kotak',
    ADITYA_BIRLA: 'Aditya Birla',
    ZERODHA: 'Zerodha',
    GROWW: 'Groww',
    BARCLAYS: 'Barclays',
    HSBC: 'HSBC',
    MONZO: 'Monzo',
    CHASE: 'Chase',
    SCHWAB: 'Schwab',
    UNKNOWN: 'Unknown Bank',
  }
  return names[inst]
}

// ── MAIN PARSER ───────────────────────────────────────────────────────────────

export default async function parseCSV(
  csvContent: string,
  dataSourceId: string,
  profileId: string,
  householdId: string,
  existingTransactions: Transaction[],
): Promise<ParseResult> {
  try {
    // Step 1: Empty check
    if (csvContent.trim() === '') {
      return {
        success: false,
        institution: 'UNKNOWN',
        errorCode: 'FILE_EMPTY',
        errorMessage: 'The file is empty. Please export your transactions and try again.',
        supportedFormats: SUPPORTED_FORMATS,
        requestSupportUrl: REQUEST_SUPPORT_URL,
      }
    }

    // Step 2: Parse with Papa Parse
    const result = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    })

    const rows = result.data
    const headers = result.meta.fields ?? []

    if (headers.length === 0 || rows.length === 0) {
      return {
        success: false,
        institution: 'UNKNOWN',
        errorCode: 'NO_TRANSACTIONS_FOUND',
        errorMessage: 'No transactions were found in this file. Please check the file format.',
        supportedFormats: SUPPORTED_FORMATS,
        requestSupportUrl: REQUEST_SUPPORT_URL,
      }
    }

    // Step 3: Detect column mapping
    const sampleRows = rows.slice(0, 5).map(r => headers.map(h => r[h] ?? ''))
    const confidence = detectColumnMapping(headers, sampleRows)

    if (!confidence.tier1Complete) {
      return {
        success: false,
        institution: confidence.detectedInstitution,
        errorCode: 'TIER1_FIELDS_MISSING',
        errorMessage:
          "We couldn't find the date or amount columns in this file.",
        missingTier1Fields: confidence.missingFields,
        supportedFormats: SUPPORTED_FORMATS,
        requestSupportUrl: REQUEST_SUPPORT_URL,
      }
    }

    // Step 4: Parse all rows
    const transactions: Transaction[] = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (row === undefined) continue
      const parsed = parseRow(
        row,
        confidence.columnMapping,
        dataSourceId,
        profileId,
        householdId,
        confidence.detectedInstitution,
        i,
      )
      if (parsed !== null) {
        transactions.push(parsed)
      }
    }

    if (transactions.length === 0) {
      return {
        success: false,
        institution: confidence.detectedInstitution,
        errorCode: 'NO_TRANSACTIONS_FOUND',
        errorMessage: 'No valid transactions could be parsed from this file.',
        supportedFormats: SUPPORTED_FORMATS,
        requestSupportUrl: REQUEST_SUPPORT_URL,
      }
    }

    // Step 5: Deduplicate
    const { unique, duplicatesSkipped, probableDuplicates } =
      deduplicateTransactions(transactions, existingTransactions)

    // Step 6: Build account label
    let accountLabel = institutionDisplayName(confidence.detectedInstitution)
    const firstRow = rows[0]
    if (firstRow !== undefined) {
      for (const value of Object.values(firstRow)) {
        if (typeof value === 'string' && /\d{8,}/.test(value)) {
          const match = /\d{8,}/.exec(value)
          if (match !== null) {
            const last4 = match[0].slice(-4)
            accountLabel = `${institutionDisplayName(confidence.detectedInstitution)} ····${last4}`
            break
          }
        }
      }
    }

    // Step 7: Build audit data
    const auditData: ImportAuditData = {
      institution: confidence.detectedInstitution,
      transactionCount: unique.length,
      duplicatesSkipped,
      layer2Queued: unique.filter(t => t.category === 'other').length,
      parseConfidence: confidence.overallScore,
      probableDuplicatesFound: probableDuplicates.length,
    }

    // Step 8: Return ParseSuccess
    return {
      success: true,
      institution: confidence.detectedInstitution,
      transactions: unique,
      duplicatesSkipped,
      probableDuplicates,
      accountLabel,
      currency: unique[0]?.currency ?? 'EUR',
      confidence,
      auditData,
    }
  } catch {
    return {
      success: false,
      institution: 'UNKNOWN',
      errorCode: 'ATOMIC_ROLLBACK',
      errorMessage: 'Import failed and was rolled back. Please try again.',
      supportedFormats: SUPPORTED_FORMATS,
      requestSupportUrl: REQUEST_SUPPORT_URL,
    }
  }
}
