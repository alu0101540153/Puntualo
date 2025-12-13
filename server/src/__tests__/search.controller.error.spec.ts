import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'

const bookServiceMock = { searchBooksByTitle: vi.fn(), fetchBookByGoogleId: vi.fn() }
const movieServiceMock = { searchMoviesByTitle: vi.fn(), fetchMovieByTmdbId: vi.fn() }
const seriesServiceMock = { searchShowsByTitle: vi.fn(), fetchShowByTmdbId: vi.fn() }
const userModelMock: any = { countDocuments: vi.fn(), find: vi.fn() }

vi.mock('../services', () => ({
  BookService: bookServiceMock,
  MovieService: movieServiceMock,
  SeriesService: seriesServiceMock
}))
vi.mock('../models', () => ({ UserModel: userModelMock }))

const searchController = await import('../controllers/search.controller').then(m => m.searchController)

const mockRes = () => {
  const res: any = {}
  res.statusCode = 200
  res.status = vi.fn((code: number) => { res.statusCode = code; return res })
  res.json = vi.fn((data: any) => { res.body = data; return res })
  return res as Response & { body?: any }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('search.controller error branches', () => {
  it('searchBooks catches error and returns 500', async () => {
    const res = mockRes()
    bookServiceMock.searchBooksByTitle.mockRejectedValueOnce(new Error('api fail'))
    await searchController.searchBooks({ query: { title: 'test' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.body.message).toBe('api fail')
  })

  it('searchMovies catches error and returns 500', async () => {
    const res = mockRes()
    movieServiceMock.searchMoviesByTitle.mockRejectedValueOnce(new Error('tmdb fail'))
    await searchController.searchMovies({ query: { title: 'x' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('fetchBook returns 400 when googleId missing', async () => {
    const res = mockRes()
    await searchController.fetchBook({ params: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('fetchBook catches error and returns 500', async () => {
    const res = mockRes()
    bookServiceMock.fetchBookByGoogleId.mockRejectedValueOnce(new Error('fail'))
    await searchController.fetchBook({ params: { googleId: 'x' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('fetchMovie returns 400 when tmdbId missing', async () => {
    const res = mockRes()
    await searchController.fetchMovie({ params: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('fetchMovie catches error and returns 500', async () => {
    const res = mockRes()
    movieServiceMock.fetchMovieByTmdbId.mockRejectedValueOnce(new Error('fail'))
    await searchController.fetchMovie({ params: { tmdbId: '999' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('searchSeries returns 400 when title missing', async () => {
    const res = mockRes()
    await searchController.searchSeries({ query: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('searchSeries catches error and returns 500', async () => {
    const res = mockRes()
    seriesServiceMock.searchShowsByTitle.mockRejectedValueOnce(new Error('fail'))
    await searchController.searchSeries({ query: { title: 'test' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('fetchSeries returns 400 when tmdbId missing', async () => {
    const res = mockRes()
    await searchController.fetchSeries({ params: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('fetchSeries catches error and returns 500', async () => {
    const res = mockRes()
    seriesServiceMock.fetchShowByTmdbId.mockRejectedValueOnce(new Error('fail'))
    await searchController.fetchSeries({ params: { tmdbId: '111' } } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('searchFriends catches error and returns 500', async () => {
    const res = mockRes()
    userModelMock.countDocuments.mockRejectedValueOnce(new Error('db fail'))
    await searchController.searchFriends({ query: {} } as unknown as Request, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })
})
