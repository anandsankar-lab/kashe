// /services/ingestion/deduplicator.ts
// Deduplication logic extracted from csvParser.ts.

import type { SpendTransaction } from '../../types/spend'

// ── NORMALISE DESCRIPTION ─────────────────────────────────────────────────────

function normaliseDescription(desc: string): string {
  return desc
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[/\-_.,#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── COMPOUND KEY ──────────────────────────────────────────────────────────────

function compoundKey(t: SpendTransaction): string {
  const dateStr = t.date instanceof Date ? t.date.toISOString().slice(0, 10) : String(t.date)
  return `${Math.abs(t.amount)}|${dateStr}|${normaliseDescription(t.description)}`
}

// ── DEDUPLICATION ─────────────────────────────────────────────────────────────

export function deduplicateTransactions(
  incoming: SpendTransaction[],
  existing: SpendTransaction[],
): {
  unique: SpendTransaction[]
  duplicatesSkipped: number
} {
  const unique: SpendTransaction[] = []
  let duplicatesSkipped = 0

  // Priority 1: match by id (bank-assigned reference id when deterministic)
  const existingIds = new Set(existing.map(t => t.id))
  // Priority 2: match by amount + date + normalisedDescription
  const existingCompoundKeys = new Set(existing.map(compoundKey))

  for (const txn of incoming) {
    if (existingIds.has(txn.id)) {
      duplicatesSkipped++
      continue
    }

    if (existingCompoundKeys.has(compoundKey(txn))) {
      duplicatesSkipped++
      continue
    }

    unique.push(txn)
  }

  return { unique, duplicatesSkipped }
}
