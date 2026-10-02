import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { listRecentScans } from '../lib/recentScans'
import { NewScanPage } from '../pages/NewScanPage'

const JD = Array.from({ length: 25 }, (_, i) => `word${i}`).join(' ')

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <NewScanPage /> },
      { path: '/scans/:id', element: <p>scan page</p> },
    ],
    { initialEntries: ['/'] },
  )
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

const resumeFile = () => new File(['%PDF-1.7 resume'], 'resume.pdf', { type: 'application/pdf' })

afterEach(() => vi.unstubAllGlobals())

describe('NewScanPage', () => {
  it('enables the button only with a resume and a long enough JD', async () => {
    const user = userEvent.setup()
    renderPage()
    const submit = screen.getByRole('button', { name: 'Scan my resume' })
    expect(submit).toBeDisabled()

    await user.upload(screen.getByLabelText(/Drop your resume here/), resumeFile())
    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText('Job description'), 'too short')
    expect(screen.getByText(/at least 20 words/)).toBeInTheDocument()
    expect(submit).toBeDisabled()

    await user.clear(screen.getByLabelText('Job description'))
    await user.type(screen.getByLabelText('Job description'), JD)
    expect(submit).toBeEnabled()
  })

  it('rejects unsupported files before upload', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderPage()
    await user.upload(screen.getByLabelText(/Drop your resume here/), new File(['x'], 'old.doc'))
    expect(screen.getByRole('alert')).toHaveTextContent('Old .doc files are not supported')
  })

  it('starts a scan, remembers it and opens the scan page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'abc123', status: 'queued', stage: 'uploaded', progress: 5 }), {
        status: 202,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const router = renderPage()

    await user.upload(screen.getByLabelText(/Drop your resume here/), resumeFile())
    await user.type(screen.getByLabelText('Job description'), JD)
    await user.click(screen.getByRole('button', { name: 'Scan my resume' }))

    expect(await screen.findByText('scan page')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/scans/abc123')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/scans')
    const body = init.body as FormData
    expect((body.get('resume') as File).name).toBe('resume.pdf')
    expect(body.get('jd_text')).toBe(JD)
    expect(listRecentScans()[0]).toMatchObject({ id: 'abc123', resumeName: 'resume.pdf' })
  })

  it('shows the API error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'rate_limited', message: 'Too many scans; try again in 60 seconds', details: {} } }),
          { status: 429 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderPage()
    await user.upload(screen.getByLabelText(/Drop your resume here/), resumeFile())
    await user.type(screen.getByLabelText('Job description'), JD)
    await user.click(screen.getByRole('button', { name: 'Scan my resume' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many scans; try again in 60 seconds')
  })
})
