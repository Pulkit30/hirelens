import { afterEach, describe, expect, it, vi } from 'vitest'

import { addRecentScan, listRecentScans, removeRecentScan, updateRecentScan } from '../lib/recentScans'

const scan = (id: string) => ({ id, resumeName: `${id}.pdf`, createdAt: '2026-10-02T10:00:00Z' })

afterEach(() => vi.restoreAllMocks())

describe('recent scans', () => {
  it('adds newest first, without duplicates', () => {
    addRecentScan(scan('a'))
    addRecentScan(scan('b'))
    addRecentScan(scan('a'))
    expect(listRecentScans().map((s) => s.id)).toEqual(['a', 'b'])
  })

  it('keeps at most 20', () => {
    for (let i = 0; i < 25; i++) addRecentScan(scan(String(i)))
    expect(listRecentScans()).toHaveLength(20)
    expect(listRecentScans()[0].id).toBe('24')
  })

  it('updates and removes', () => {
    addRecentScan(scan('a'))
    updateRecentScan('a', { total: 80, band: 'strong' })
    expect(listRecentScans()[0]).toMatchObject({ total: 80, band: 'strong' })
    removeRecentScan('a')
    expect(listRecentScans()).toEqual([])
  })

  it('survives broken or blocked storage', () => {
    localStorage.setItem('hirelens.recentScans', '{not json')
    expect(listRecentScans()).toEqual([])
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => addRecentScan(scan('a'))).not.toThrow()
  })
})
