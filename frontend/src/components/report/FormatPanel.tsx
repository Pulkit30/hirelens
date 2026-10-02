import { CheckCircle2 } from 'lucide-react'

import type { FormatReport } from '../../api/types'
import { Badge, Card } from '../ui'

const SEVERITY_TONE = { critical: 'red', warning: 'amber', info: 'neutral' } as const

export function FormatPanel({ report }: { report: FormatReport }) {
  return (
    <Card
      title="ATS formatting"
      description="How reliably an applicant tracking system can read your file."
      action={<span className="text-sm font-semibold tabular-nums">{report.format_score}/100</span>}
    >
      {report.issues.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 aria-hidden className="size-4" />
          No formatting problems found.
        </p>
      ) : (
        <ul className="space-y-3">
          {report.issues.map((issue) => (
            <li key={issue.code} className="text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={SEVERITY_TONE[issue.severity]}>{issue.severity}</Badge>
                <span className="font-medium">{issue.message}</span>
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">{issue.suggestion}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
