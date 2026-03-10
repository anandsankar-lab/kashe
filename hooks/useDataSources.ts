import { MOCK_DATA_SOURCES } from '../constants/mockData';
import { DataSource } from '../types/spend';

export function useDataSources(): { sources: DataSource[] } {
  // TODO Session 06: replace with real store
  return { sources: MOCK_DATA_SOURCES };
}
