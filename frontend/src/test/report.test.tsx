import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScanReport } from '../components/report/ScanReport'
import { completedScan } from './fixtures'

describe('ScanReport', () => {
  it('shows the total, band and headline stats', () => {
    render(<ScanReport scan={completedScan()} />)
    expect(screen.getByLabelText('ATS score 78 out of 100')).toBeInTheDocument()
    expect(screen.getByText('Strong match')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Backend Engineer' })).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument() // must-have skills found
    expect(screen.getByText('4 yrs / 3+')).toBeInTheDocument()
  })

  it('marks matched and missing skills, missing first', () => {
    render(<ScanReport scan={completedScan()} />)
    const mustHave = screen.getByText('Must-have').closest('div')!
    const chips = within(mustHave).getAllByRole('listitem')
    expect(chips[0]).toHaveTextContent('Go— missing')
    expect(within(mustHave).getByText('2 of 3 found')).toBeInTheDocument()
    expect(screen.getByText(/in text/)).toBeInTheDocument() // Kubernetes found only in text
  })

  it('shows not-applicable components without a bar', () => {
    render(<ScanReport scan={completedScan()} />)
    expect(screen.getByText('Not applicable')).toBeInTheDocument()
    expect(screen.queryByRole('meter', { name: 'Education score' })).not.toBeInTheDocument()
    expect(screen.getByRole('meter', { name: 'Skills & keywords score' })).toHaveAttribute('aria-valuenow', '85')
  })

  it('renders suggestions with example rewrites', () => {
    render(<ScanReport scan={completedScan()} />)
    expect(screen.getByText('Strong backend fit; Go is the main gap.')).toBeInTheDocument()
    expect(screen.getByText('Show Go if you have used it')).toBeInTheDocument()
    expect(screen.getByText('Example rewrite')).toBeInTheDocument()
  })

  it('explains missing suggestions on a partial scan', () => {
    const scan = completedScan({ status: 'partial', suggestions: null, error: 'The LLM is rate limited' })
    render(<ScanReport scan={scan} />)
    expect(screen.getByText('Suggestions are unavailable for this scan')).toBeInTheDocument()
    expect(screen.getByText(/The LLM is rate limited/)).toBeInTheDocument()
    expect(screen.getByLabelText('ATS score 78 out of 100')).toBeInTheDocument() // score still shown
  })

  it('shows formatting issues and responsibility evidence', () => {
    render(<ScanReport scan={completedScan()} />)
    expect(screen.getByText('Multi-column layout detected.')).toBeInTheDocument()
    expect(screen.getByText(/Built REST APIs in FastAPI for 1M users/, { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('No clear match in your resume.')).toBeInTheDocument()
  })
})
