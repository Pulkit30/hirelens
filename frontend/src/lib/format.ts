import type { ATSScore, ComponentScore, ScanStage } from '../api/types'
import type { Tone } from '../components/ui'

export type Band = ATSScore['band']

export const BAND_LABEL: Record<Band, string> = {
  strong: 'Strong match',
  good: 'Good match',
  weak: 'Weak match',
}

export const COMPONENT_LABEL: Record<ComponentScore['name'], string> = {
  keywords: 'Skills & keywords',
  semantic: 'Experience relevance',
  experience: 'Years of experience',
  title: 'Job title',
  education: 'Education',
  format: 'ATS formatting',
}

export const COMPONENT_HELP: Record<ComponentScore['name'], string> = {
  keywords: 'Must-have and nice-to-have skills from the job, found in your resume.',
  semantic: 'How closely your experience lines match what the job asks you to do.',
  experience: 'Your years of experience against the minimum the job states.',
  title: 'How close your job titles are to this role (seniority ignored).',
  education: 'Your degree level against the requirement.',
  format: 'How reliably an applicant tracking system can read your file.',
}

/** Pipeline stages in order, as shown in the progress view. */
export const STAGES: { stage: ScanStage; label: string }[] = [
  { stage: 'parsing', label: 'Reading your resume and the job description' },
  { stage: 'extracting', label: 'Understanding skills, experience and requirements' },
  { stage: 'scoring', label: 'Scoring the match' },
  { stage: 'suggesting', label: 'Writing improvement suggestions' },
]

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Colour for a 0-100 score, using the same thresholds as the score bands. */
export function scoreTone(score: number): Tone {
  if (score >= 75) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}
