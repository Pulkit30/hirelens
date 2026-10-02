import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { ApiError, getScan, scanEventsUrl } from '../api/client'
import { isFinal, type ScanProgress, type ScanResult } from '../api/types'

const POLL_FALLBACK_MS = 2000

export const scanKey = (id: string) => ['scan', id] as const

/**
 * A scan and its live progress.
 *
 * While the scan runs, progress arrives over Server-Sent Events and is merged into the
 * cached result; on `done` the full report is fetched. If the event stream fails (e.g. a
 * proxy that buffers responses), it falls back to polling.
 */
export function useScan(id: string) {
  const queryClient = useQueryClient()
  const [streamFailed, setStreamFailed] = useState(false)

  const query = useQuery({
    queryKey: scanKey(id),
    queryFn: () => getScan(id),
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
    refetchInterval: (q) => {
      const status = q.state.data?.status
      return streamFailed && status && !isFinal(status) ? POLL_FALLBACK_MS : false
    },
  })

  const running = query.data !== undefined && !isFinal(query.data.status)

  useEffect(() => {
    if (!running || streamFailed) return
    const source = new EventSource(scanEventsUrl(id))
    // Fetch the full report once the scan is over. A final status is not merged into the
    // cache: that would end `running` and close this stream before the report is fetched.
    const finish = () => {
      source.close()
      void queryClient.invalidateQueries({ queryKey: scanKey(id) })
    }

    source.addEventListener('progress', (event) => {
      const progress = JSON.parse((event as MessageEvent).data) as ScanProgress
      if (isFinal(progress.status)) {
        finish()
        return
      }
      queryClient.setQueryData<ScanResult>(scanKey(id), (old) => (old ? { ...old, ...progress } : old))
    })
    source.addEventListener('done', finish)
    source.onerror = () => {
      source.close()
      setStreamFailed(true)
      void queryClient.invalidateQueries({ queryKey: scanKey(id) })
    }
    return () => source.close()
  }, [id, running, streamFailed, queryClient])

  return query
}
