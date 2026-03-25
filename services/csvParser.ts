// Deprecated shim — use /services/ingestion instead
// Retained for backward compatibility. Will be removed in a future cleanup pass.

export { ingestFile as default } from './ingestion'
export type {
  ParseResult,
  ParseSuccess,
  ParseError,
  RouteDetectionResult,
  Tier1Route,
  Tier2AccountType,
  SupportedInstitution,
  ColumnMapping,
  ParseConfidence,
  ImportAuditData,
  ProbableDuplicate,
} from './ingestion'
