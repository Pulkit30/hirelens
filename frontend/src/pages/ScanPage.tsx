import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { ApiError, deleteScan } from '../api/client'
import { isFinal } from '../api/types'
import { ScanReport } from '../components/report/ScanReport'
import { ScanProgress } from '../components/ScanProgress'
import { Alert, Button, Card } from '../components/ui'
import { scanKey, useScan } from '../hooks/useScan'
import { removeRecentScan, updateRecentScan } from '../lib/recentScans'

const FAILURE_HELP: Record<string, string> = {
  document_parse_error: 'Check that the resume is a text-based PDF or DOCX (not a scan or photo).',
  llm_unavailable: 'The AI service is not available right now. Please try again in a moment.',
  interrupted: 'The server restarted while this scan was running.',
}

function DeleteButton({ id }: { id: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const remove = useMutation({
    mutationFn: () => deleteScan(id),
    onSuccess: () => {
      removeRecentScan(id)
      queryClient.removeQueries({ queryKey: scanKey(id) })
      navigate('/')
    },
  })

  if (!confirming) {
    return (
      <Button variant="secondary" onClick={() => setConfirming(true)}>
        <Trash2 aria-hidden className="size-4" />
        Delete scan
      </Button>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-300">Delete this scan and its files?</span>
      <Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>
        {remove.isPending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        Delete
      </Button>
      <Button variant="secondary" onClick={() => setConfirming(false)} disabled={remove.isPending}>
        Cancel
      </Button>
      {remove.isError && (
        <span role="alert" className="text-sm text-rose-600">
          {remove.error instanceof ApiError ? remove.error.message : 'Could not delete the scan.'}
        </span>
      )}
    </div>
  )
}

export function ScanPage() {
  const { id = '' } = useParams()
  const { data: scan, error, isPending, isFetching } = useScan(id)

  // Remember the outcome in "recent scans", or forget scans that no longer exist.
  useEffect(() => {
    if (error instanceof ApiError && error.status === 404) removeRecentScan(id)
    if (scan?.ats) {
      updateRecentScan(id, {
        total: scan.ats.total,
        band: scan.ats.band,
        jobTitle: scan.requirements?.title ?? null,
      })
    }
  }, [id, scan, error])

  let content
  if (isPending) {
    content = (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 aria-hidden className="size-4 animate-spin" /> Loading scan…
      </div>
    )
  } else if (error) {
    const notFound = error instanceof ApiError && error.status === 404
    content = (
      <Alert tone="error" title={notFound ? 'Scan not found' : 'Could not load this scan'}>
        {notFound
          ? 'It may have been deleted, or the link is wrong.'
          : error instanceof ApiError
            ? error.message
            : 'Please refresh the page.'}
      </Alert>
    )
  } else if (!isFinal(scan.status)) {
    content = <ScanProgress scan={scan} />
  } else if (scan.status === 'failed') {
    content = (
      <Card>
        <Alert tone="error" title="This scan failed">
          <p>{scan.error}</p>
          {scan.error_code && FAILURE_HELP[scan.error_code] && <p className="mt-1">{FAILURE_HELP[scan.error_code]}</p>}
        </Alert>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline dark:text-brand-400"
        >
          Start a new scan
        </Link>
      </Card>
    )
  } else if (!scan.ats && isFetching) {
    // Finished, but the full report is still being fetched.
    content = (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 aria-hidden className="size-4 animate-spin" /> Preparing your report…
      </div>
    )
  } else {
    content = <ScanReport scan={scan} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft aria-hidden className="size-4" /> New scan
        </Link>
        {scan && isFinal(scan.status) && <DeleteButton id={id} />}
      </div>
      {content}
    </div>
  )
}
