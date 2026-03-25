// /services/ingestion/transactionParser.ts
// Transaction parsing logic extracted from csvParser.ts.

import { sanitiseTransaction } from './securityPipeline'
import type { SpendTransaction } from '../../types/spend'
import type { RawRow, ColumnMapping } from './types'

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const MONTH_NAMES: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

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

// ── CURRENCY INFERENCE ────────────────────────────────────────────────────────

function inferCurrency(geography: 'NL' | 'IN' | 'EU' | 'UK' | 'US' | 'GLOBAL'): string {
  if (geography === 'NL' || geography === 'EU') return 'EUR'
  if (geography === 'UK') return 'GBP'
  if (geography === 'US') return 'USD'
  if (geography === 'IN') return 'INR'
  return 'EUR'
}

// ── TRANSACTION PARSER ────────────────────────────────────────────────────────

export function parseTransactions(
  rows: RawRow[],
  mapping: ColumnMapping,
  dataSourceId: string,
  profileId: string,
  householdId: string,
  geography: 'NL' | 'IN' | 'EU' | 'UK' | 'US' | 'GLOBAL',
): SpendTransaction[] {
  const transactions: SpendTransaction[] = []

  const decimalFmt: 'european' | 'standard' =
    mapping.amountFormat === 'european' ? 'european' : 'standard'

  const geoField: 'india' | 'europe' | 'other' =
    geography === 'IN' ? 'india'
    : geography === 'NL' || geography === 'EU' ? 'europe'
    : 'other'

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    if (row === undefined) continue

    try {
      // 1. Parse date
      const rawDate = row[mapping.dateColumn] ?? ''
      const date = parseDate(rawDate)
      if (date === null) continue

      // 2. Parse amount and determine isDebit
      let amount: number
      let isDebit: boolean

      const isTwoColCase =
        mapping.amountFormat === 'signed' && mapping.debitCreditColumn !== null

      if (isTwoColCase) {
        const debitRaw = row[mapping.amountColumn] ?? ''
        const creditRaw = row[mapping.debitCreditColumn!] ?? ''
        const debitAmt = parseAmount(debitRaw, decimalFmt)
        const creditAmt = parseAmount(creditRaw, decimalFmt)
        isDebit = debitAmt > 0
        amount = isDebit ? debitAmt : creditAmt
      } else if (mapping.debitCreditColumn !== null) {
        amount = parseAmount(row[mapping.amountColumn] ?? '', decimalFmt)
        const flagValue = (row[mapping.debitCreditColumn] ?? '').trim().toLowerCase()
        isDebit = flagValue === (mapping.debitIndicator?.toLowerCase() ?? '')
      } else {
        const rawAmt = row[mapping.amountColumn] ?? ''
        const parsedAmt = parseAmount(rawAmt, decimalFmt)
        const originalStr = rawAmt.trim()
        const isNegative = originalStr.startsWith('-')
        isDebit = isNegative || (mapping.amountFormat === 'signed' && isNegative)
        amount = parsedAmt
      }

      // 3. Skip rows with zero amount
      if (amount === 0) continue

      // 4. Currency
      const currency: string = mapping.currencyColumn !== null
        ? (row[mapping.currencyColumn] ?? '').trim() || inferCurrency(geography)
        : inferCurrency(geography)

      // 5. Reference ID
      const referenceId =
        mapping.referenceColumn !== null
          ? (row[mapping.referenceColumn] ?? '').trim() || undefined
          : undefined

      // 6. Raw description
      const rawDescriptionValue = mapping.descriptionColumn
        ? (row[mapping.descriptionColumn] ?? '')
        : ''

      // 7. Build a partial SpendTransaction and apply sanitiseTransaction
      const partial: SpendTransaction = {
        id: `txn_${dataSourceId}_${index}_${Date.now()}`,
        dataSourceId,
        profileId,
        householdId,
        date,
        amount: isDebit ? -Math.abs(amount) : Math.abs(amount),
        currency,
        merchant: rawDescriptionValue.slice(0, 60),
        description: rawDescriptionValue,
        rawDescription: rawDescriptionValue,
        merchantNorm: '',
        category: 'other',
        subcategory: undefined,
        geography: geoField,
        ownership: 'personal',
        isRecurring: false,
        recurringGroupId: undefined,
        isExcluded: false,
        dataSource: 'CSV',
        importedAt: new Date(),
        tags: [],
        currencyOriginal: currency,
        amountOriginal: Math.abs(amount),
        fxRateApplied: null,
        ...(referenceId !== undefined ? { id: referenceId } : {}),
      }

      // Re-apply id correctly (referenceId was used incorrectly above — fix below)
      partial.id = `txn_${dataSourceId}_${index}_${Date.now()}`

      // 8. Apply security pipeline sanitisation
      const sanitised = sanitiseTransaction(partial)

      transactions.push(sanitised)
    } catch {
      // skip malformed row
    }
  }

  return transactions
}
