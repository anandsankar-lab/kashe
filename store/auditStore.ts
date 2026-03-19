import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import secureStorageAdapter from '../services/secureStorageAdapter'
import { STORAGE_KEYS } from '../services/storageService'
import type { SupportedInstitution } from '../services/csvParser'

// ── LOCAL TYPES ───────────────────────────────────────────────────────────────

export interface ImportAuditEvent {
  id: string
  profileId: string
  householdId: string
  timestamp: string
  institution: SupportedInstitution
  transactionCount: number
  duplicatesSkipped: number
  probableDuplicatesFound: number
  layer2Queued: number
  parseConfidence: number
  status: 'success' | 'failed'
  errorCode?: string
}

// ── STATE SHAPE ───────────────────────────────────────────────────────────────

interface AuditState {
  events: ImportAuditEvent[]
}

interface AuditActions {
  logImport(event: ImportAuditEvent): void
  clearAuditLog(): void
}

type AuditStore = AuditState & AuditActions

// ── STORE ─────────────────────────────────────────────────────────────────────

const useAuditStore = create<AuditStore>()(
  persist(
    (set) => ({
      events: [],

      logImport(event) {
        set((state) => {
          const appended = [...state.events, event]
          return {
            events: appended.length > 100 ? appended.slice(appended.length - 100) : appended,
          }
        })
      },

      clearAuditLog() {
        set({ events: [] })
      },
    }),
    {
      name: STORAGE_KEYS.SPEND_STORE + '_audit',
      storage: createJSONStorage(() => secureStorageAdapter),
    },
  ),
)

export default useAuditStore
