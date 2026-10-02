import type { ScanCreated, ScanResult } from './types'

/** Empty in development (Vite proxies /api); set VITE_API_URL if the API is elsewhere. */
export const API_BASE: string = import.meta.env.VITE_API_URL ?? ''

/** The backend's error body: {"error": {"code", "message", "details"}}. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: Record<string, unknown>

  constructor(status: number, code: string, message: string, details: Record<string, unknown> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, init)
  } catch {
    throw new ApiError(0, 'network_error', 'Cannot reach the HireLens server. Is it running?')
  }
  if (response.ok) {
    return (response.status === 204 ? undefined : await response.json()) as T
  }
  const body = await response.json().catch(() => null)
  const error = body?.error
  if (error?.message) {
    throw new ApiError(response.status, error.code ?? 'error', error.message, error.details ?? {})
  }
  // FastAPI's own errors (e.g. an unknown route) use {"detail": ...}.
  const detail = typeof body?.detail === 'string' ? body.detail : response.statusText
  throw new ApiError(response.status, 'error', detail || 'Request failed')
}

export type JobDescriptionInput = { text: string } | { file: File }

export function createScan(resume: File, jd: JobDescriptionInput): Promise<ScanCreated> {
  const form = new FormData()
  form.append('resume', resume)
  if ('text' in jd) form.append('jd_text', jd.text)
  else form.append('jd_file', jd.file)
  return request<ScanCreated>('/api/scans', { method: 'POST', body: form })
}

export function getScan(id: string): Promise<ScanResult> {
  return request<ScanResult>(`/api/scans/${encodeURIComponent(id)}`)
}

export function deleteScan(id: string): Promise<void> {
  return request<void>(`/api/scans/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function scanEventsUrl(id: string): string {
  return `${API_BASE}/api/scans/${encodeURIComponent(id)}/events`
}
