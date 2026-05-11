// /services/ingestion/pdfExtractor.ts
// Sends PDF base64 to Claude Haiku and maps the response to RawRow[].

import storageService, { STORAGE_KEYS } from '../storageService'
import type { RawRow, PdfExtractionResult, PdfBudget } from './types'

const PDF_MONTHLY_CALL_CAP = 50

const SYSTEM_PROMPT = `You are a financial document parser. Extract all financial transactions or holdings from this document and return ONLY a valid JSON array. No preamble, no explanation, no markdown.

For bank/spending transactions, return:
[{ "date": "YYYY-MM-DD", "description": "string", "amount": number, "currency": "ISO 4217", "balance": "string (optional)" }]

For investment holdings, return:
[{ "name": "string", "isin": "string (if present, else '')", "quantity": number, "price": number, "value": number, "currency": "ISO 4217", "type": "string (e.g. mutual_fund, stock, bond, etf)" }]

If the document contains both, return the dominant type.
If you cannot extract structured data, return: []`

// ── BUDGET HELPERS ─────────────────────────────────────────────────────────────

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

async function loadBudget(): Promise<PdfBudget> {
  try {
    const raw = await storageService.get(STORAGE_KEYS.PDF_EXTRACTION_BUDGET)
    if (!raw) return { monthKey: currentMonthKey(), tokensUsed: 0, callsCount: 0 }
    const parsed = JSON.parse(raw) as PdfBudget
    // Reset on new month
    if (parsed.monthKey !== currentMonthKey()) {
      return { monthKey: currentMonthKey(), tokensUsed: 0, callsCount: 0 }
    }
    return parsed
  } catch {
    return { monthKey: currentMonthKey(), tokensUsed: 0, callsCount: 0 }
  }
}

async function saveBudget(budget: PdfBudget): Promise<void> {
  await storageService.set(STORAGE_KEYS.PDF_EXTRACTION_BUDGET, JSON.stringify(budget))
}

// ── RESPONSE PARSING ───────────────────────────────────────────────────────────

type SpendRow = { date: string; description: string; amount: number; currency: string; balance?: string }
type HoldingRow = { name: string; isin: string; quantity: number; price: number; value: number; currency: string; type: string }

function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
}

function isSpendRow(row: unknown): row is SpendRow {
  if (typeof row !== 'object' || row === null) return false
  const r = row as Record<string, unknown>
  return typeof r['date'] === 'string' &&
    typeof r['description'] === 'string' &&
    typeof r['amount'] === 'number' &&
    typeof r['currency'] === 'string'
}

function isHoldingRow(row: unknown): row is HoldingRow {
  if (typeof row !== 'object' || row === null) return false
  const r = row as Record<string, unknown>
  return typeof r['name'] === 'string' &&
    typeof r['value'] === 'number' &&
    typeof r['currency'] === 'string'
}

function spendRowToRaw(row: SpendRow): RawRow {
  const raw: RawRow = {
    date: row.date,
    description: row.description,
    amount: String(row.amount),
    currency: row.currency,
  }
  if (row.balance !== undefined) raw['balance'] = row.balance
  return raw
}

function holdingRowToRaw(row: HoldingRow): RawRow {
  return {
    name: row.name,
    isin: row.isin ?? '',
    quantity: String(row.quantity ?? 0),
    price: String(row.price ?? 0),
    value: String(row.value),
    currency: row.currency,
    type: row.type ?? '',
  }
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────────

export async function extractFromPdf(base64: string): Promise<PdfExtractionResult> {
  // 1. Budget check
  const budget = await loadBudget()
  if (budget.callsCount >= PDF_MONTHLY_CALL_CAP) {
    return { success: false, error: 'budget_exceeded' }
  }

  // 2. API key
  const rawKey = await storageService.get(STORAGE_KEYS.AI_API_KEY)
  if (!rawKey || !rawKey.trim().startsWith('sk-ant-') || rawKey.trim().length <= 40) {
    return { success: false, error: 'extraction_failed' }
  }
  const apiKey = rawKey.trim()

  // 3. Call Haiku with PDF document
  let responseText: string
  let inputTokens = 0
  let outputTokens = 0

  try {
    const body = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
          ],
        },
      ],
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) return { success: false, error: 'extraction_failed' }

    const data = await response.json() as {
      content: Array<{ type: string; text?: string }>
      usage: { input_tokens: number; output_tokens: number }
    }

    const textBlock = data.content.find(b => b.type === 'text')
    if (!textBlock?.text) return { success: false, error: 'extraction_failed' }

    responseText = textBlock.text
    inputTokens = data.usage.input_tokens
    outputTokens = data.usage.output_tokens
  } catch {
    return { success: false, error: 'extraction_failed' }
  }

  // 4. Update budget after successful call
  await saveBudget({
    monthKey: currentMonthKey(),
    tokensUsed: budget.tokensUsed + inputTokens + outputTokens,
    callsCount: budget.callsCount + 1,
  })

  // 5. Parse JSON response
  let parsed: unknown
  try {
    parsed = JSON.parse(stripMarkdownFences(responseText))
  } catch {
    return { success: false, error: 'extraction_failed' }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { success: false, error: 'no_data_found' }
  }

  // 6. Determine extraction type and map to RawRow[]
  const firstRow = parsed[0]

  if (isSpendRow(firstRow)) {
    const rows: RawRow[] = []
    for (const item of parsed) {
      if (isSpendRow(item)) rows.push(spendRowToRaw(item))
    }
    if (rows.length === 0) return { success: false, error: 'no_data_found' }
    return { success: true, rows, extractionType: 'spend' }
  }

  if (isHoldingRow(firstRow)) {
    const rows: RawRow[] = []
    for (const item of parsed) {
      if (isHoldingRow(item)) rows.push(holdingRowToRaw(item))
    }
    if (rows.length === 0) return { success: false, error: 'no_data_found' }
    return { success: true, rows, extractionType: 'portfolio' }
  }

  return { success: false, error: 'no_data_found' }
}
