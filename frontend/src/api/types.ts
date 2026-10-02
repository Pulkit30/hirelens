// Friendly names for the generated API types. Regenerate the schema after backend changes:
// `npm run gen:api`.
import type { components } from './schema'

type Schemas = components['schemas']

export type ScanCreated = Schemas['ScanCreated']
export type ScanResult = Schemas['ScanResult']
/** Sent on the SSE stream (not part of the OpenAPI schema): a subset of ScanResult. */
export type ScanProgress = Pick<ScanResult, 'id' | 'status' | 'stage' | 'progress' | 'error' | 'error_code'>
export type ScanStatus = ScanResult['status']
export type ScanStage = ScanResult['stage']

export type ATSScore = Schemas['ATSScore']
export type ComponentScore = Schemas['ComponentScore']
export type SkillMatch = Schemas['SkillMatch']
export type ResponsibilityMatch = Schemas['ResponsibilityMatch']
export type Suggestions = Schemas['Suggestions']
export type Suggestion = Schemas['Suggestion']
export type FormatReport = Schemas['FormatReport']
export type FormatIssue = Schemas['FormatIssue']
export type ResumeProfile = Schemas['ResumeProfile']
export type JobRequirements = Schemas['JobRequirements']

export const FINAL_STATUSES: ReadonlySet<ScanStatus> = new Set(['completed', 'partial', 'failed'])

export function isFinal(status: ScanStatus): boolean {
  return FINAL_STATUSES.has(status)
}
