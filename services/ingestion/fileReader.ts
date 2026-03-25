// /services/ingestion/fileReader.ts
// Raw file content → RawRow[]
// Knows about file formats only. No financial logic.

import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { FileType, RawRow } from './types'

export function detectFileType(filename: string): FileType {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx'
  if (lower.endsWith('.txt') || lower.endsWith('.tab')) return 'txt'
  return 'csv'
}

function normaliseHeaders(row: Record<string, string>): Record<string, string> {
  const normalised: Record<string, string> = {}
  for (const [key, value] of Object.entries(row)) {
    normalised[key.trim().toLowerCase()] = value
  }
  return normalised
}

export function readFile(content: string, fileType: FileType): RawRow[] {
  try {
    if (fileType === 'xlsx') {
      const workbook = XLSX.read(content, { type: 'base64' })
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) throw new Error('No sheets found')
      const worksheet = workbook.Sheets[firstSheetName]
      if (!worksheet) throw new Error('Sheet not found')
      const raw = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: '' })
      if (raw.length < 2) return []
      const headers = (raw[0] as string[]).map((h: string) => String(h).trim().toLowerCase())
      const rows: RawRow[] = []
      for (let i = 1; i < raw.length; i++) {
        const cells = raw[i] as string[]
        const row: RawRow = {}
        headers.forEach((h, idx) => {
          row[h] = String(cells[idx] ?? '')
        })
        // Skip completely empty rows
        if (Object.values(row).some(v => v.trim() !== '')) {
          rows.push(row)
        }
      }
      return rows
    }

    // CSV and TXT — Papa Parse with auto-detect delimiter
    const result = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      delimiter: '',
    })

    return (result.data as Record<string, string>[]).map(normaliseHeaders)
  } catch {
    throw { errorCode: 'UNSUPPORTED_FORMAT' as const }
  }
}
