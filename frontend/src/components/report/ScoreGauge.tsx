import clsx from 'clsx'

import { BAND_LABEL, type Band } from '../../lib/format'

const BAND_STROKE: Record<Band, string> = {
  strong: 'stroke-emerald-500',
  good: 'stroke-amber-500',
  weak: 'stroke-rose-500',
}

const BAND_TEXT: Record<Band, string> = {
  strong: 'text-emerald-700 dark:text-emerald-300',
  good: 'text-amber-700 dark:text-amber-300',
  weak: 'text-rose-700 dark:text-rose-300',
}

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ScoreGauge({ total, band }: { total: number; band: Band }) {
  const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, total)) / 100)
  return (
    <div className="flex flex-col items-center">
      <div className="relative size-36">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" className="stroke-zinc-100 dark:stroke-zinc-800" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={clsx('transition-[stroke-dashoffset] duration-700', BAND_STROKE[band])}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tabular-nums" aria-label={`ATS score ${total} out of 100`}>
            {total}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">out of 100</span>
        </div>
      </div>
      <p className={clsx('mt-2 text-sm font-semibold', BAND_TEXT[band])}>{BAND_LABEL[band]}</p>
    </div>
  )
}
