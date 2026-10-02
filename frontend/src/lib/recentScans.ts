// Scans this browser started, kept in localStorage so people can find them again.
// There are no accounts yet (Phase 8), so the browser is the only place that knows
// which scans are "yours". Storage can be unavailable (private mode, blocked site data):
// every access is guarded and the app works without it.

export interface RecentScan {
  id: string
  resumeName: string | null
  createdAt: string // ISO
  total?: number
  band?: 'strong' | 'good' | 'weak'
  jobTitle?: string | null
}

const KEY = 'hirelens.recentScans'
const MAX = 20

function read(): RecentScan[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as RecentScan[]) : []
  } catch {
    return []
  }
}

function write(scans: RecentScan[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(scans.slice(0, MAX)))
  } catch {
    // Storage full or blocked: recent scans are a convenience, not required.
  }
}

export function listRecentScans(): RecentScan[] {
  return read()
}

export function addRecentScan(scan: RecentScan): void {
  write([scan, ...read().filter((s) => s.id !== scan.id)])
}

export function updateRecentScan(id: string, changes: Partial<RecentScan>): void {
  const scans = read()
  const index = scans.findIndex((s) => s.id === id)
  if (index === -1) return
  const updated = { ...scans[index], ...changes }
  if (JSON.stringify(updated) === JSON.stringify(scans[index])) return
  scans[index] = updated
  write(scans)
}

export function removeRecentScan(id: string): void {
  write(read().filter((s) => s.id !== id))
}
