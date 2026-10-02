import clsx from 'clsx'
import { Check, Loader2 } from 'lucide-react'

import type { ScanResult } from '../api/types'
import { STAGES } from '../lib/format'
import { Card, Meter } from './ui'

export function ScanProgress({ scan }: { scan: ScanResult }) {
  const currentIndex = STAGES.findIndex((s) => s.stage === scan.stage)

  return (
    <Card title="Analysing your resume" description="This usually takes 15–30 seconds.">
      <Meter value={scan.progress} label="Scan progress" />
      <ol className="mt-5 space-y-3">
        {STAGES.map(({ stage, label }, index) => {
          const done = currentIndex > index || scan.stage === 'done'
          const active = index === currentIndex
          return (
            <li key={stage} className="flex items-center gap-3 text-sm">
              <span
                className={clsx(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  done && 'bg-emerald-500 text-white',
                  active && 'bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-300',
                  !done && !active && 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800',
                )}
              >
                {done ? (
                  <Check aria-hidden className="size-3.5" />
                ) : active ? (
                  <Loader2 aria-hidden className="size-3.5 animate-spin" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </span>
              <span
                className={clsx(
                  done && 'text-zinc-500 dark:text-zinc-400',
                  active && 'font-medium',
                  !done && !active && 'text-zinc-400 dark:text-zinc-500',
                )}
              >
                {label}
                {active && <span className="sr-only"> (in progress)</span>}
                {done && <span className="sr-only"> (done)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
