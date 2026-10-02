import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { BAND_LABEL, formatDate } from '../lib/format'
import { listRecentScans } from '../lib/recentScans'
import { Card } from './ui'

const BAND_DOT = { strong: 'bg-emerald-500', good: 'bg-amber-500', weak: 'bg-rose-500' } as const

export function RecentScans() {
  const [scans] = useState(listRecentScans)
  if (scans.length === 0) return null

  return (
    <Card title="Your recent scans" description="Saved in this browser only.">
      <ul className="-mx-2 divide-y divide-zinc-100 dark:divide-zinc-800">
        {scans.map((scan) => (
          <li key={scan.id}>
            <Link
              to={`/scans/${scan.id}`}
              className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <span
                className={clsx('size-2.5 shrink-0 rounded-full', scan.band ? BAND_DOT[scan.band] : 'bg-zinc-300')}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{scan.jobTitle ?? scan.resumeName ?? 'Scan'}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {scan.resumeName} · {formatDate(scan.createdAt)}
                </p>
              </div>
              {scan.total !== undefined && scan.band && (
                <span className="shrink-0 text-sm tabular-nums" title={BAND_LABEL[scan.band]}>
                  {scan.total}
                </span>
              )}
              <ChevronRight aria-hidden className="size-4 shrink-0 text-zinc-400" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
