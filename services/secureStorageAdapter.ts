import { Platform } from 'react-native'
import type { StateStorage } from 'zustand/middleware'
import storageService, { StorageError } from './storageService'

const secureStorageAdapter: StateStorage = {
  async getItem(name: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      const value = localStorage.getItem(name)
      return value
    }
    try {
      return await storageService.get(name)
    } catch (err) {
      console.error('[secureStorageAdapter] getItem failed:', err)
      return null
    }
  },

  async setItem(name: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value)
      return
    }
    try {
      await storageService.set(name, value)
    } catch (err) {
      if (err instanceof StorageError) {
        throw err
      }
      throw new StorageError(
        `Kāshe couldn't save your data securely. Please free up space on your device and try again.`,
        err,
      )
    }
  },

  async removeItem(name: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name)
      return
    }
    try {
      await storageService.delete(name)
    } catch (err) {
      if (err instanceof StorageError) {
        throw err
      }
      throw new StorageError(
        `Kāshe couldn't delete your data securely. Please try again.`,
        err,
      )
    }
  },
}

export default secureStorageAdapter
