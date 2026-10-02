import type { ComponentScore } from '../../api/types'
import { COMPONENT_HELP, COMPONENT_LABEL, scoreTone } from '../../lib/format'
import { Card, Meter } from '../ui'

export function ScoreBreakdown({ components }: { components: ComponentScore[] }) {
  const ordered = [...components].sort((a, b) => b.weight - a.weight)
  return (
    <Card title="Score breakdown" description="Each part is scored 0–100 and weighted into your total.">
      <ul className="space-y-5">
        {ordered.map((component) => (
          <li key={component.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium" title={COMPONENT_HELP[component.name]}>
                  {COMPONENT_LABEL[component.name]}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{component.summary}</p>
              </div>
              <div className="shrink-0 text-right">
                {component.score === null ? (
                  <span className="text-sm text-zinc-400">Not applicable</span>
                ) : (
                  <span className="text-sm font-semibold tabular-nums">{Math.round(component.score)}</span>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {component.score === null ? 'weight shared' : `${Math.round(component.weight)}% weight`}
                </p>
              </div>
            </div>
            {component.score !== null && (
              <Meter
                value={component.score}
                tone={scoreTone(component.score)}
                label={`${COMPONENT_LABEL[component.name]} score`}
              />
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}
