import clsx from 'clsx'
import { Check, X } from 'lucide-react'

import type { SkillMatch } from '../../api/types'
import { Card } from '../ui'

function SkillChip({ match }: { match: SkillMatch }) {
  const viaText = match.matched && match.source === 'text'
  return (
    <li
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm',
        match.matched
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
          : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200',
      )}
      title={
        viaText
          ? 'Found in your resume text, but not listed as a skill. Consider adding it to your skills section.'
          : undefined
      }
    >
      {match.matched ? <Check aria-hidden className="size-3.5" /> : <X aria-hidden className="size-3.5" />}
      <span>{match.requirement}</span>
      {match.matched && match.matched_with && !match.requirement.includes(match.matched_with) && (
        <span className="opacity-70">({match.matched_with})</span>
      )}
      {viaText && <span className="opacity-70">· in text</span>}
      <span className="sr-only">{match.matched ? '— found' : '— missing'}</span>
    </li>
  )
}

function Group({ title, matches }: { title: string; matches: SkillMatch[] }) {
  if (matches.length === 0) return null
  const found = matches.filter((m) => m.matched).length
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">
        {title}{' '}
        <span className="font-normal text-zinc-500 dark:text-zinc-400">
          {found} of {matches.length} found
        </span>
      </h3>
      <ul className="flex flex-wrap gap-2">
        {/* Missing first: they are what the reader needs to act on. */}
        {[...matches]
          .sort((a, b) => Number(a.matched) - Number(b.matched))
          .map((m) => (
            <SkillChip key={`${m.required}-${m.requirement}`} match={m} />
          ))}
      </ul>
    </div>
  )
}

export function SkillsPanel({ skills }: { skills: SkillMatch[] }) {
  if (skills.length === 0) {
    return (
      <Card title="Skills">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">The job description lists no specific skills.</p>
      </Card>
    )
  }
  return (
    <Card title="Skills" description="Skills the job asks for, and whether your resume shows them.">
      <div className="space-y-5">
        <Group title="Must-have" matches={skills.filter((s) => s.required)} />
        <Group title="Nice-to-have" matches={skills.filter((s) => !s.required)} />
      </div>
    </Card>
  )
}
