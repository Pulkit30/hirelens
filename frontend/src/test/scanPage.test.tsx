import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ScanResult } from '../api/types'
import { ScanPage } from '../pages/ScanPage'
import { completedScan } from './fixtures'

/** Minimal EventSource stand-in: tests push server events with `emit`. */
class FakeEventSource {
  static instances: FakeEventSource[] = []
  readonly url: string
  closed = false
  onerror: (() => void) | null = null
  private listeners = new Map<string, ((event: MessageEvent) => void)[]>()

  constructor(url: string) {
    this.url = url
    FakeEventSource.instances.push(this)
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener])
  }

  close() {
    this.closed = true
  }

  emit(type: string, data: object) {
    if (this.closed) return // a closed EventSource receives nothing
    for (const listener of this.listeners.get(type) ?? []) {
      listener(new MessageEvent(type, { data: JSON.stringify(data) }))
    }
  }
}

const ID = 'a'.repeat(32)

function running(stage: ScanResult['stage'], progress: number): ScanResult {
  return completedScan({
    status: 'processing', stage, progress, ats: null, suggestions: null,
    profile: null, requirements: null, format_report: null, completed_at: null,
  }) // prettier-ignore
}

function respondWith(...bodies: ScanResult[]) {
  const fetchMock = vi.fn()
  for (const body of bodies) {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 200 }))
  }
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderScanPage() {
  const router = createMemoryRouter([{ path: '/scans/:id', element: <ScanPage /> }], {
    initialEntries: [`/scans/${ID}`],
  })
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

const finalEvent = { id: ID, status: 'completed', stage: 'done', progress: 100, error: null, error_code: null }

beforeEach(() => {
  FakeEventSource.instances = []
  vi.stubGlobal('EventSource', FakeEventSource)
})
afterEach(() => vi.unstubAllGlobals())

describe('ScanPage live progress', () => {
  it('follows progress and shows the report when the scan finishes', async () => {
    const fetchMock = respondWith(running('parsing', 15), completedScan({ id: ID }))
    renderScanPage()

    expect(await screen.findByText('Analysing your resume')).toBeInTheDocument()
    const stream = FakeEventSource.instances[0]
    expect(stream.url).toBe(`/api/scans/${ID}/events`)

    act(() => stream.emit('progress', { ...finalEvent, status: 'processing', stage: 'scoring', progress: 70 }))
    // TanStack Query notifies components asynchronously.
    await waitFor(() =>
      expect(screen.getByRole('meter', { name: 'Scan progress' })).toHaveAttribute('aria-valuenow', '70'),
    )

    // The server sends the final status as a `progress` event, then `done`, in separate network
    // reads, so React re-renders in between. The report must load even if that re-render
    // closes the stream before `done` arrives (a real bug: the page stayed without a report).
    act(() => stream.emit('progress', finalEvent))
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)))
    act(() => stream.emit('done', finalEvent))

    expect(await screen.findByLabelText('ATS score 78 out of 100')).toBeInTheDocument()
    expect(stream.closed).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falls back to polling when the stream fails', async () => {
    respondWith(running('extracting', 35), completedScan({ id: ID }))
    renderScanPage()
    await screen.findByText('Analysing your resume')

    act(() => FakeEventSource.instances[0].onerror?.())

    expect(await screen.findByLabelText('ATS score 78 out of 100')).toBeInTheDocument()
  })

  it('shows a failed scan with help', async () => {
    respondWith(
      completedScan({
        id: ID, status: 'failed', ats: null, error: 'No readable text in this resume',
        error_code: 'document_parse_error',
      }), // prettier-ignore
    )
    renderScanPage()
    expect(await screen.findByText('This scan failed')).toBeInTheDocument()
    expect(screen.getByText(/text-based PDF or DOCX/)).toBeInTheDocument()
    expect(FakeEventSource.instances).toHaveLength(0) // nothing to follow
  })
})
