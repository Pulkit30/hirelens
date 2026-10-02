import type { ResponsibilityMatch } from '../../api/types'
import { scoreTone } from '../../lib/format'
import { Card, Meter } from '../ui'

export function ResponsibilitiesPanel({ items }: { items: ResponsibilityMatch[] }) {
  if (items.length === 0) return null
  return (
    <Card
      title="Experience vs responsibilities"
      description="For each responsibility in the job, the line in your resume that matches it best."
    >
      <ul className="space-y-5">
        {items.map((item) => (
          <li key={item.responsibility}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{item.responsibility}</p>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{Math.round(item.score)}</span>
            </div>
            <Meter value={item.score} tone={scoreTone(item.score)} label={`Coverage of: ${item.responsibility}`} />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {item.best_evidence ? (
                <>
                  <span className="text-zinc-500 dark:text-zinc-400">Best match: </span>“{item.best_evidence}”
                </>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400">No clear match in your resume.</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
