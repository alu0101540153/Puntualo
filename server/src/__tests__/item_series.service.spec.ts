import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('axios', () => ({ default: { get: vi.fn() } }))
import axios from 'axios'

// Mock config to provide TMDB_API_KEY
vi.mock('../config', () => ({ TMDB_API_KEY: 'TEST_KEY' }))

// Mock itemService used inside SeriesService
vi.mock('../services/item.service', () => ({
  itemService: {
    findByExternalId: vi.fn(),
    create: vi.fn(),
  }
}))

import { itemService } from '../services/item.service'
import { SeriesService } from '../services/item_series.service'

describe('SeriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searchShowsByTitle requires TMDB_API_KEY', async () => {
    vi.resetModules()
    vi.doMock('../config', () => ({ TMDB_API_KEY: '' }))
    const { SeriesService: SS2 } = await import('../services/item_series.service')
    await expect(SS2.searchShowsByTitle('abc')).rejects.toThrow('TMDB_API_KEY is required')
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('searchShowsByTitle maps results for search', async () => {
    ;(axios.get as any).mockResolvedValue({ data: {
      results: Array.from({ length: 20 }).map((_, i) => ({ id: i+1, name: `S${i+1}`, genre_ids: [35], poster_path: '/p.jpg', overview: '', first_air_date: '2021-01-01' })),
      total_pages: 3,
      total_results: 60
    } })
    const res = await SeriesService.searchShowsByTitle('title', 1)
    expect(res.items.length).toBe(10)
    expect(res.items[0]).toHaveProperty('id')
    expect(res.total).toBeGreaterThan(0)
  })

  it('searchShowsByTitle uses discover when empty title', async () => {
    ;(axios.get as any).mockResolvedValue({ data: {
      results: Array.from({ length: 20 }).map((_, i) => ({ id: i+1, name: `S${i+1}`, genre_ids: [35] })),
      total_pages: 1,
      total_results: 20
    } })
    const res = await SeriesService.searchShowsByTitle('', 2)
    expect(res.items.length).toBe(10)
    expect(res.total).toBe(20)
  })

  it('fetchShowByTmdbId returns from DB when exists', async () => {
    ;(itemService.findByExternalId as any).mockResolvedValue({ _id: 'existing' })
    const res = await SeriesService.fetchShowByTmdbId('321')
    expect(res.fromDb).toBe(true)
    expect(res.item).toEqual({ _id: 'existing' })
  })

  it('fetchShowByTmdbId hits TMDB and creates when not existing', async () => {
    ;(itemService.findByExternalId as any).mockResolvedValue(null)
    ;(axios.get as any).mockResolvedValue({ data: {
      id: 321,
      name: 'Show',
      poster_path: '/p.jpg',
      overview: 'desc',
      first_air_date: '2021-01-01',
      number_of_seasons: 2,
      networks: [{ name: 'Net' }],
      genres: [{ name: 'Comedy' }],
      credits: { cast: [{ name: 'A' }] }
    } })
    ;(itemService.create as any).mockResolvedValue({ _id: 'new' })

    const res = await SeriesService.fetchShowByTmdbId('321')
    expect(axios.get).toHaveBeenCalled()
    expect(itemService.create).toHaveBeenCalled()
    expect(res.item).toEqual({ _id: 'new' })
    expect(res.fromDb).toBe(false)
  })
})
