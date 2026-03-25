// /services/ingestion/deduplicator.ts
// Deduplication logic extracted from csvParser.ts.

import type { SpendTransaction } from '../../types/spend'
import type { ProbableDuplicate } from './types'

// ── DICE COEFFICIENT ──────────────────────────────────────────────────────────

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

// ── COMPOUND KEY ──────────────────────────────────────────────────────────────

function compoundKey(t: SpendTransaction): string {
  const dateStr = t.date instanceof Date ? t.date.toISOString().slice(0, 10) : String(t.date)
  return `${dateStr}|${Math.abs(t.amount)}|${t.description.slice(0, 20).toLowerCase().trim()}`
}

// ── DEDUPLICATION ─────────────────────────────────────────────────────────────

export function deduplicateTransactions(
  incoming: SpendTransaction[],
  existing: SpendTransaction[],
): {
  unique: SpendTransaction[]
  duplicatesSkipped: number
  probableDuplicates: ProbableDuplicate[]
} {
  const unique: SpendTransaction[] = []
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
