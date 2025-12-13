import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => ({ default: { get: vi.fn() } }))
import axios from 'axios'

// Mock config to provide TMDB_API_KEY
vi.mock('../config', () => ({ TMDB_API_KEY: 'TEST_KEY' }))

// Mock itemService used inside MovieService
vi.mock('../services/item.service', () => ({
  itemService: {
    findByExternalId: vi.fn(),
    create: vi.fn(),
  }
}))

import { itemService } from '../services/item.service'
import { MovieService } from '../services/item_movie.service'

describe('MovieService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searchMoviesByTitle requires TMDB_API_KEY', async () => {
    vi.resetModules()
    vi.doMock('../config', () => ({ TMDB_API_KEY: '' }))
    const { MovieService: MS2 } = await import('../services/item_movie.service')
    await expect(MS2.searchMoviesByTitle('abc')).rejects.toThrow('TMDB_API_KEY is required')
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('searchMoviesByTitle maps results and paginates', async () => {
    ;(axios.get as any).mockResolvedValue({ data: {
      results: Array.from({ length: 20 }).map((_, i) => ({ id: i+1, title: `T${i+1}`, genre_ids: [28], poster_path: '/p.jpg', overview: '', release_date: '2020-01-01' })),
      total_pages: 2,
      total_results: 40
    } })

    const res = await MovieService.searchMoviesByTitle('abc', 1)
    expect(res.items.length).toBe(10)
    expect(res.items[0]).toHaveProperty('id')
    expect(res.total).toBeGreaterThan(0)
  })

  it('searchMoviesByTitle discover when no title', async () => {
    ;(axios.get as any).mockResolvedValue({ data: {
      results: Array.from({ length: 20 }).map((_, i) => ({ id: i+1, title: `T${i+1}`, genre_ids: [28] })),
      total_pages: 1,
      total_results: 20
    } })

    const res = await MovieService.searchMoviesByTitle('', 2)
    expect(res.items.length).toBe(10)
    expect(res.total).toBe(20)
  })

  it('fetchMovieByTmdbId returns from DB when exists', async () => {
    ;(itemService.findByExternalId as any).mockResolvedValue({ _id: 'it1' })
    const res = await MovieService.fetchMovieByTmdbId('123')
    expect(res.fromDb).toBe(true)
    expect(res.item).toEqual({ _id: 'it1' })
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('fetchMovieByTmdbId hits TMDB and creates item when not existing', async () => {
    ;(itemService.findByExternalId as any).mockResolvedValue(null)
    ;(axios.get as any).mockResolvedValue({ data: {
      id: 123,
      title: 'Movie',
      poster_path: '/p.jpg',
      overview: 'desc',
      release_date: '2020-01-01',
      genres: [{ name: 'Action' }],
      credits: { cast: [{ name: 'A' }, { name: 'B' }] }
    } })
    ;(itemService.create as any).mockResolvedValue({ _id: 'new' })

    const res = await MovieService.fetchMovieByTmdbId('123')
    expect(axios.get).toHaveBeenCalled()
    expect(itemService.create).toHaveBeenCalled()
    expect(res.item).toEqual({ _id: 'new' })
    expect(res.fromDb).toBe(false)
  })
})
