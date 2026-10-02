import { Lightbulb } from 'lucide-react'

import type { Suggestion, Suggestions } from '../../api/types'
import { Alert, Badge, Card } from '../ui'

const PRIORITY_TONE = { high: 'red', medium: 'amber', low: 'neutral' } as const

function SuggestionItem({ suggestion }: { suggestion: Suggestion }) {
  return (
    <li className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone={PRIORITY_TONE[suggestion.priority]}>{suggestion.priority} priority</Badge>
        <Badge>{suggestion.category}</Badge>
      </div>
      <h3 className="font-medium">{suggestion.title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{suggestion.detail}</p>
      {suggestion.example && (
        <blockquote className="mt-3 border-l-2 border-brand-400 bg-brand-50/60 py-2 pr-3 pl-3 text-sm dark:bg-brand-950/30">
          <span className="mb-0.5 block text-xs font-medium text-brand-700 dark:text-brand-300">Example rewrite</span>
          {suggestion.example}
        </blockquote>
      )}
    </li>
  )
}

export function SuggestionsPanel({
  suggestions,
  unavailableReason,
}: {
  suggestions: Suggestions | null
  unavailableReason: string | null
}) {
  return (
    <Card
      title={
        <span className="inline-flex items-center gap-2">
          <Lightbulb aria-hidden className="size-4 text-amber-500" />
          How to improve
        </span>
      }
      description="AI suggestions based on this job. They never ask you to claim experience you don't have."
    >
      {!suggestions ? (
        <Alert tone="warning" title="Suggestions are unavailable for this scan">
          {unavailableReason ?? 'The suggestion step did not complete.'} Your score is still complete.
        </Alert>
      ) : (
        <>
          <p className="mb-4 text-sm leading-relaxed">{suggestions.overview}</p>
          {suggestions.suggestions.length > 0 ? (
            <ol className="space-y-3">
              {suggestions.suggestions.map((s, i) => (
                <SuggestionItem key={i} suggestion={s} />
              ))}
            </ol>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Nothing important to change for this job.</p>
          )}
        </>
      )}
    </Card>
  )
}
