import type { ScanResult } from '../../api/types'
import { Alert, Card } from '../ui'
import { ExtractedDetails } from './ExtractedDetails'
import { FormatPanel } from './FormatPanel'
import { ResponsibilitiesPanel } from './ResponsibilitiesPanel'
import { ScoreBreakdown } from './ScoreBreakdown'
import { ScoreGauge } from './ScoreGauge'
import { SkillsPanel } from './SkillsPanel'
import { SuggestionsPanel } from './SuggestionsPanel'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export function ScanReport({ scan }: { scan: ScanResult }) {
  const { ats, profile, requirements, format_report: format } = scan
  if (!ats || !profile || !requirements || !format) {
    return <Alert tone="error" title="This report is incomplete." />
  }

  const must = ats.skills.filter((s) => s.required)
  const mustFound = must.filter((s) => s.matched).length
  const years = profile.experience_years
  const required = requirements.min_years_experience

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <ScoreGauge total={ats.total} band={ats.band} />
          <div className="w-full flex-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">ATS match for</p>
            <h1 className="text-xl font-semibold">{requirements.title ?? 'this job'}</h1>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Must-have skills" value={must.length ? `${mustFound} / ${must.length}` : '—'} />
              <Stat
                label="Experience"
                value={years !== null ? `${years} yrs${required !== null ? ` / ${required}+` : ''}` : '—'}
              />
              <Stat label="ATS formatting" value={`${format.format_score}/100`} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <SuggestionsPanel
            suggestions={scan.suggestions}
            unavailableReason={scan.status === 'partial' ? (scan.error ?? null) : null}
          />
          <ResponsibilitiesPanel items={ats.responsibilities} />
        </div>
        <div className="space-y-6">
          <ScoreBreakdown components={ats.components} />
          <SkillsPanel skills={ats.skills} />
          <FormatPanel report={format} />
        </div>
      </div>

      <ExtractedDetails profile={profile} requirements={requirements} />
    </div>
  )
}
