import * as SecureStore from 'expo-secure-store'

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'StorageError'
  }
}

export const STORAGE_KEYS = {
  AUTH_TOKEN:            'kashe_auth_token',
  USER_PROFILE:          'kashe_user_profile',
  ONBOARDING_COMPLETE:   'kashe_onboarding_complete',
  RISK_PROFILE:          'kashe_risk_profile',
  AI_API_KEY:            'kashe_ai_api_key',
  ACTIVE_PROFILE_ID:     'kashe_active_profile_id',
  LAST_INSIGHT_CHECK:    'kashe_last_insight_check',
  SPEND_STORE:           'kashe_spend_store',
  PORTFOLIO_STORE:       'kashe_portfolio_store',
  INSIGHTS_STORE:        'kashe_insights_store',
  HOUSEHOLD_STORE:       'kashe_household_store',
  MERCHANT_OVERRIDES:    'kashe_merchant_overrides',
  RETRY_QUEUE:           'kashe_retry_queue',
  AI_USAGE:              'kashe_ai_usage',
  ANALYTICS_DISTINCT_ID: 'kashe_analytics_distinct_id',
} as const

const storageService = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key)
    } catch (err) {
      throw new StorageError(
        `Kāshe couldn't read your data securely. Please try again.`,
        err,
      )
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch (err) {
      throw new StorageError(
        `Kāshe couldn't save your data securely. Please free up space on your device and try again.`,
        err,
      )
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (err) {
      throw new StorageError(
        `Kāshe couldn't delete your data securely. Please try again.`,
        err,
      )
    }
  },

  async clear(): Promise<void> {
    let firstError: unknown = null
    for (const key of Object.values(STORAGE_KEYS)) {
      try {
        await SecureStore.deleteItemAsync(key)
      } catch (err) {
        if (firstError === null) {
          firstError = err
        }
      }
    }
    if (firstError !== null) {
      throw new StorageError(
        `Kāshe couldn't fully clear your data. Please try again.`,
        firstError,
      )
    }
  },
}

export default storageService
