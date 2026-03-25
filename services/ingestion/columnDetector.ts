// /services/ingestion/columnDetector.ts
// Smart column detection — uses INSTITUTION_REGISTRY for institution fingerprinting
// and a scoring algorithm for spend + portfolio column detection.

import { INSTITUTION_REGISTRY } from './institutionRegistry'
import type {
  RawRow,
  ColumnMapping,
  ParseConfidence,
  SupportedInstitution,
  RouteConfidence,
} from './types'

// ── INTERNAL TYPES ────────────────────────────────────────────────────────────

type SpendFieldType = 'date' | 'amount' | 'debitCredit' | 'description' | 'currency' | 'reference'
type PortfolioFieldType = 'isin' | 'ticker' | 'name' | 'quantity' | 'price' | 'value'
type FieldType = SpendFieldType | PortfolioFieldType

// ── DATE PARSING (minimal, for sample probing) ────────────────────────────────

const MONTH_NAMES: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function parseDate(raw: string): Date | null {
  if (!raw || raw.trim() === '') return null
  const s = raw.trim()

  if (/^\d{8}$/.test(s)) {
    const yyyy = parseInt(s.slice(0, 4), 10)
    const mm = parseInt(s.slice(4, 6), 10) - 1
    const dd = parseInt(s.slice(6, 8), 10)
    return new Date(yyyy, mm, dd)
  }

  const dmyDash = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s)
  if (dmyDash) {
    return new Date(parseInt(dmyDash[3], 10), parseInt(dmyDash[2], 10) - 1, parseInt(dmyDash[1], 10))
  }

  const dmySlash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
  if (dmySlash) {
    return new Date(parseInt(dmySlash[3], 10), parseInt(dmySlash[2], 10) - 1, parseInt(dmySlash[1], 10))
  }

  const ymd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s)
  if (ymd) {
    return new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10))
  }

  const dMonY = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(s)
  if (dMonY) {
    const monthIdx = MONTH_NAMES[dMonY[2].toLowerCase()]
    if (monthIdx !== undefined) {
      return new Date(parseInt(dMonY[3], 10), monthIdx, parseInt(dMonY[1], 10))
    }
  }

  return null
}

// ── INSTITUTION DETECTION ─────────────────────────────────────────────────────

function detectInstitution(
  headers: string[],
  sampleRows: RawRow[],
): { institution: SupportedInstitution; institutionConfidence: RouteConfidence } {
  const normHeaders = headers.map(h => h.toLowerCase().trim())

  // Flatten all sample cell values for content fingerprint matching
  const sampleValues: string[] = sampleRows.flatMap(row => Object.values(row)).map(v => v.toLowerCase())

  let bestInstitution: SupportedInstitution = 'UNKNOWN'
  let bestScore = 0
  let bestConfidence: RouteConfidence = 'low'

  for (const def of Object.values(INSTITUTION_REGISTRY)) {
    if (!def || def.id === 'UNKNOWN') continue

    const columnScore = def.columnFingerprints.filter(fp =>
      normHeaders.some(h => h.includes(fp.toLowerCase()))
    ).length

    const contentScore = def.contentFingerprints.filter(fp =>
      sampleValues.some(v => v.includes(fp.toLowerCase()))
    ).length

    const totalScore = columnScore + contentScore

    if (totalScore <= 0) continue

    let confidence: RouteConfidence
    if (totalScore >= def.minFingerprintsForHigh) {
      confidence = 'high'
    } else if (totalScore >= def.minFingerprintsForHigh / 2) {
      confidence = 'medium'
    } else {
      confidence = 'low'
    }

    if (
      totalScore > bestScore ||
      (totalScore === bestScore && confidence === 'high' && bestConfidence !== 'high') ||
      (totalScore === bestScore && confidence === 'medium' && bestConfidence === 'low')
    ) {
      bestScore = totalScore
      bestInstitution = def.id
      bestConfidence = confidence
    }
  }

  if (bestScore === 0) {
    return { institution: 'UNKNOWN', institutionConfidence: 'low' }
  }

  return { institution: bestInstitution, institutionConfidence: bestConfidence }
}

// ── COLUMN MAPPING DETECTION ──────────────────────────────────────────────────

export function detectColumnMapping(rows: RawRow[]): {
  mapping: ColumnMapping
  confidence: ParseConfidence
  institution: SupportedInstitution
  institutionConfidence: RouteConfidence
} {
  if (rows.length === 0) {
    const emptyMapping: ColumnMapping = {
      dateColumn: '',
      amountColumn: '',
      debitCreditColumn: null,
      descriptionColumn: '',
      currencyColumn: null,
      referenceColumn: null,
      debitIndicator: null,
      creditIndicator: null,
      amountFormat: 'standard',
      isinColumn: null,
      tickerColumn: null,
      nameColumn: null,
      quantityColumn: null,
      priceColumn: null,
      valueColumn: null,
    }
    return {
      mapping: emptyMapping,
      confidence: {
        tier1Complete: false,
        tier2Score: 0,
        tier3Score: 0,
        overallScore: 0,
        detectedInstitution: 'UNKNOWN',
        columnMapping: emptyMapping,
        missingFields: ['date', 'amount', 'debit/credit direction'],
        warnings: ['no rows provided'],
      },
      institution: 'UNKNOWN',
      institutionConfidence: 'low',
    }
  }

  // Step 1: Extract headers from first row's keys
  const headers = Object.keys(rows[0])

  // Step 2: Take up to 5 sample rows
  const sampleRows = rows.slice(0, 5)

  // Step 3: Detect institution via INSTITUTION_REGISTRY
  const { institution, institutionConfidence } = detectInstitution(headers, sampleRows)

  const warnings: string[] = []
  const missingFields: string[] = []

  if (institution === 'UNKNOWN') {
    warnings.push('bank not recognised — using generic parser')
  }

  // Step 4: Normalise headers
  const normHeaders = headers.map(h => h.toLowerCase().trim())
  const colCount = headers.length

  // Pre-compute average string lengths for description detection
  const avgLengths: number[] = Array.from({ length: colCount }, (_, i) => {
    const colKey = headers[i]
    if (!colKey) return 0
    const vals = sampleRows.map(row => row[colKey] ?? '').filter(v => v !== '')
    return vals.length === 0 ? 0 : vals.reduce((sum, v) => sum + v.length, 0) / vals.length
  })
  const maxAvgLen = avgLengths.length > 0 ? Math.max(...avgLengths) : 0

  // Score matrix: spend + portfolio fields
  const scoreMatrix: Array<Record<SpendFieldType, number> & Record<PortfolioFieldType, number>> =
    Array.from({ length: colCount }, () => ({
      date: 0,
      amount: 0,
      debitCredit: 0,
      description: 0,
      currency: 0,
      reference: 0,
      isin: 0,
      ticker: 0,
      name: 0,
      quantity: 0,
      price: 0,
      value: 0,
    }))

  for (let i = 0; i < colCount; i++) {
    const header = normHeaders[i] ?? ''
    const colKey = headers[i]
    const sampleVals = colKey
      ? sampleRows.map(row => row[colKey] ?? '').filter(v => v.trim() !== '')
      : []

    // DATE
    if (['date', 'datum', 'dat', 'time', 'when'].some(k => header.includes(k))) {
      scoreMatrix[i].date = 0.6
    }
    if (sampleVals.length > 0 && sampleVals.every(v => parseDate(v) !== null)) {
      scoreMatrix[i].date = Math.max(scoreMatrix[i].date, 1.0)
    }

    // AMOUNT
    if (['amount', 'bedrag', 'amt', 'money'].some(k => header.includes(k))) {
      scoreMatrix[i].amount = 0.6
    }
    // Note: 'value', 'waarde', 'debit', 'credit' also overlap with portfolio fields;
    // we still score them but portfolio fields will win via their own scoring
    if (['waarde', 'debit', 'credit'].some(k => header === k)) {
      scoreMatrix[i].amount = Math.max(scoreMatrix[i].amount, 0.6)
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
    if (['description', 'omschrijving', 'naam', 'merchant', 'narration', 'particulars', 'mededelingen', 'details'].some(k => header.includes(k))) {
      scoreMatrix[i].description = 0.6
    }
    // 'name' overlaps with portfolio; give lower score here
    if (header === 'name') {
      scoreMatrix[i].description = Math.max(scoreMatrix[i].description, 0.4)
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
    if (['reference', 'ref', 'transaction id', 'order id', 'cheque', 'kenmerk'].some(k => header.includes(k))) {
      scoreMatrix[i].reference = 0.6
    }
    if (header === 'id' && !header.includes('order') && !header.includes('transaction')) {
      scoreMatrix[i].reference = Math.max(scoreMatrix[i].reference, 0.5)
    }
    const allUnique = new Set(sampleVals).size === sampleVals.length && sampleVals.length >= 2
    if (sampleVals.length > 0 && allUnique && sampleVals.every(v => /^[a-zA-Z0-9\-_/]+$/.test(v.trim()))) {
      scoreMatrix[i].reference = Math.max(scoreMatrix[i].reference, 0.8)
    }

    // ── PORTFOLIO FIELDS ──────────────────────────────────────────────────────

    // ISIN
    if (header.includes('isin')) {
      scoreMatrix[i].isin = 0.8
    }
    if (sampleVals.length > 0 && sampleVals.every(v => /^[A-Z]{2}[A-Z0-9]{10}$/.test(v.trim()))) {
      scoreMatrix[i].isin = 1.0
    }

    // TICKER / SYMBOL
    if (['ticker', 'symbol', 'trading symbol', 'scrip', 'nse:', 'bse:'].some(k => header.includes(k))) {
      scoreMatrix[i].ticker = 0.8
    }

    // NAME / PRODUCT / INSTRUMENT / SCHEME
    if (['product', 'instrument', 'scheme name', 'scheme', 'scrip name', 'investment name', 'financial instrument'].some(k => header.includes(k))) {
      scoreMatrix[i].name = 0.8
    }
    if (['name'].some(k => header === k)) {
      scoreMatrix[i].name = Math.max(scoreMatrix[i].name, 0.5)
    }

    // QUANTITY / UNITS / SHARES / ANTAL / AANTAL
    if (['quantity', 'units', 'shares', 'antal', 'aantal', 'qty'].some(k => header.includes(k))) {
      scoreMatrix[i].quantity = 0.8
    }

    // PRICE / NAV / KOERS / LTP / AVG PRICE
    if (['price', 'nav', 'koers', 'ltp', 'avg price', 'average price', 'average nav', 'avg. cost', 'buy average', 'avg rate', 'mkt rate', 'last price', 'share price', 'current price', 'purchase nav', 'current nav', 'market price'].some(k => header.includes(k))) {
      scoreMatrix[i].price = 0.8
    }

    // VALUE / MARKET VALUE / CURRENT VALUE / WAARDE
    if (['market value', 'current value', 'mkt value', 'local value', 'total value', 'invested value', 'cost value', 'invested amount', 'cost basis', 'cur. val', 'current value'].some(k => header.includes(k))) {
      scoreMatrix[i].value = 0.8
    }
    if (header === 'waarde' || header === 'value') {
      scoreMatrix[i].value = Math.max(scoreMatrix[i].value, 0.6)
    }
  }

  // Step 5: Assign best-scoring column to each field type (greedy, no reuse)
  const assignedCols = new Set<number>()
  const fieldAssignments: Partial<Record<FieldType, number>> = {}

  const allFieldTypes: FieldType[] = [
    'date', 'amount', 'debitCredit', 'description', 'currency', 'reference',
    'isin', 'ticker', 'name', 'quantity', 'price', 'value',
  ]

  const candidates: Array<{ field: FieldType; col: number; score: number }> = []
  for (let i = 0; i < colCount; i++) {
    const scores = scoreMatrix[i]
    if (!scores) continue
    for (const field of allFieldTypes) {
      const score = scores[field]
      if (score > 0) {
        candidates.push({ field, col: i, score })
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score)

  for (const { field, col } of candidates) {
    if (fieldAssignments[field] === undefined && !assignedCols.has(col)) {
      fieldAssignments[field] = col
      assignedCols.add(col)
    }
  }

  // Step 6: Detect amount format
  const institutionDef = INSTITUTION_REGISTRY[institution]
  // Infer from institution geography if available
  let amountFormat: 'european' | 'standard' | 'signed' = 'standard'
  if (institutionDef && institutionDef.geography === 'NL') {
    amountFormat = 'european'
  }

  if (fieldAssignments.amount !== undefined) {
    const amtColIdx = fieldAssignments.amount
    const amtColKey = headers[amtColIdx]
    const amtVals = amtColKey
      ? sampleRows.map(r => r[amtColKey] ?? '').filter(v => v !== '')
      : []
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

  // Step 7: Detect debit/credit encoding
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
      const dcIdx = fieldAssignments.debitCredit
      debitCreditColumn = headers[dcIdx] ?? null
      const dcColKey = headers[dcIdx]
      const flagVals = dcColKey
        ? sampleRows.map(r => r[dcColKey] ?? '').filter(v => v.trim() !== '').map(v => v.trim())
        : []
      const uniqueFlags = [...new Set(flagVals)]
      if (uniqueFlags.length >= 2) {
        debitIndicator = uniqueFlags[0] ?? null
        creditIndicator = uniqueFlags[1] ?? null
      } else if (uniqueFlags.length === 1) {
        debitIndicator = uniqueFlags[0] ?? null
      }
    } else {
      amountFormat = 'signed'
    }
  }

  // Step 8: Build ColumnMapping
  const dateColName = fieldAssignments.date !== undefined ? (headers[fieldAssignments.date] ?? '') : ''
  const amountColName = fieldAssignments.amount !== undefined ? (headers[fieldAssignments.amount] ?? '') : ''
  const descColName = fieldAssignments.description !== undefined ? (headers[fieldAssignments.description] ?? '') : ''
  const currColName = fieldAssignments.currency !== undefined ? (headers[fieldAssignments.currency] ?? null) : null
  const refColName = fieldAssignments.reference !== undefined ? (headers[fieldAssignments.reference] ?? null) : null

  const isinColName = fieldAssignments.isin !== undefined ? (headers[fieldAssignments.isin] ?? null) : null
  const tickerColName = fieldAssignments.ticker !== undefined ? (headers[fieldAssignments.ticker] ?? null) : null
  const nameColName = fieldAssignments.name !== undefined ? (headers[fieldAssignments.name] ?? null) : null
  const quantityColName = fieldAssignments.quantity !== undefined ? (headers[fieldAssignments.quantity] ?? null) : null
  const priceColName = fieldAssignments.price !== undefined ? (headers[fieldAssignments.price] ?? null) : null
  const valueColName = fieldAssignments.value !== undefined ? (headers[fieldAssignments.value] ?? null) : null

  const mapping: ColumnMapping = {
    dateColumn: dateColName,
    amountColumn: amountColName,
    debitCreditColumn,
    descriptionColumn: descColName,
    currencyColumn: currColName,
    referenceColumn: refColName,
    debitIndicator,
    creditIndicator,
    amountFormat,
    isinColumn: isinColName,
    tickerColumn: tickerColName,
    nameColumn: nameColName,
    quantityColumn: quantityColName,
    priceColumn: priceColName,
    valueColumn: valueColName,
  }

  // Step 9: Compute ParseConfidence
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

  const confidence: ParseConfidence = {
    tier1Complete,
    tier2Score,
    tier3Score,
    overallScore,
    detectedInstitution: institution,
    columnMapping: mapping,
    missingFields,
    warnings,
  }

  return { mapping, confidence, institution, institutionConfidence }
}
