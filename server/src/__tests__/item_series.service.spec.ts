import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { itemService } from '../services/item.service'
import { ItemType } from '../models/enums'

type MockAxios = typeof axios & { get: ReturnType<typeof vi.fn> }
const mockedAxios = axios as MockAxios

vi.mock('axios', () => {
  const get = vi.fn()
  return { default: { get }, get }
})

vi.mock('../services/item.service', () => ({
  itemService: {
    findByExternalId: vi.fn(),
    create: vi.fn()
  }
}))

const findByExternalId = itemService.findByExternalId as unknown as ReturnType<typeof vi.fn>
const createItem = itemService.create as unknown as ReturnType<typeof vi.fn>

describe('SeriesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.TMDB_API_KEY
  })

  it('throws when TMDB_API_KEY missing on search', async () => {
    const { SeriesService } = await import('../services/item_series.service')
    await expect(SeriesService.searchShowsByTitle('x', 1)).rejects.toThrow(/TMDB_API_KEY/)
  })

  it('searchShowsByTitle maps results when API key set', async () => {
    process.env.TMDB_API_KEY = 'key'
    vi.resetModules()
    const { SeriesService } = await import('../services/item_series.service')
    mockedAxios.get.mockResolvedValue({ data: { total_results: 2, results: [
      { id: 1, name: 'S1', poster_path: '/p1' },
      { id: 2, name: 'S2', poster_path: null },
    ] } })

    const res = await SeriesService.searchShowsByTitle('x', 1)
    expect(res.items.length).toBeGreaterThan(0)
    expect(mockedAxios.get).toHaveBeenCalled()
  })

  it('returns existing series when found by external id', async () => {
    process.env.TMDB_API_KEY = 'key'
    vi.resetModules()
    const { SeriesService } = await import('../services/item_series.service')
    findByExternalId.mockResolvedValue({ _id: 's1', title: 'Existing' })
    const res = await SeriesService.fetchShowByTmdbId('10')
    expect(res.fromDb).toBe(true)
    expect(createItem).not.toHaveBeenCalled()
  })

  it('creates series when not found', async () => {
    process.env.TMDB_API_KEY = 'key'
    vi.resetModules()
    const { SeriesService } = await import('../services/item_series.service')
    findByExternalId.mockResolvedValue(null)
    mockedAxios.get.mockResolvedValue({ data: {
      id: 10,
      name: 'My Show',
      overview: 'desc',
      genres: [{ name: 'Drama' }],
      credits: { cast: [{ name: 'A' }] },
      poster_path: '/p1',
      number_of_seasons: 3,
      first_air_date: '2020-01-01',
      networks: [{ name: 'Net' }]
    } })
    createItem.mockResolvedValue({ _id: 'new' })

    const res = await SeriesService.fetchShowByTmdbId('10')
    expect(res.item).toEqual({ _id: 'new' })
    expect(createItem).toHaveBeenCalled()
    const payload = createItem.mock.calls[0][0]
    expect(payload.itemType).toBe(ItemType.SERIES)
    expect(payload.externalId).toBe('10')
  })
})
