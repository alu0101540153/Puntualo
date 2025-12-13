import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  searchBooks, 
  searchMovies, 
  searchSeries, 
  searchFriends 
} from '../search'

vi.mock('../api', () => ({
  default: {
    apiFetch: vi.fn()
  }
}))

import api from '../api'

describe('search service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchBooks', () => {
    it('searches for books with title', async () => {
      const mockResults = [{ _id: '1', title: 'Book 1' }]
      vi.mocked(api.apiFetch).mockResolvedValue({ results: mockResults })
      const result = await searchBooks('Test Book', 1)
      expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('/search/books'))
      expect(result).toEqual({ results: mockResults })
    })

    it('includes page parameter', async () => {
      vi.mocked(api.apiFetch).mockResolvedValue({ results: [] })
      await searchBooks('Test', 2)
      expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('page=2'))
    })

    it('includes filters from opts', async () => {
      vi.mocked(api.apiFetch).mockResolvedValue({ results: [] })
      await searchBooks('Test', 1, { genre: 'fiction' })
      expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('genre=fiction'))
    })
  })

  describe('searchMovies', () => {
    it('searches for movies with title', async () => {
      const mockResults = [{ _id: '1', title: 'Movie 1' }]
      vi.mocked(api.apiFetch).mockResolvedValue({ results: mockResults })
      const result = await searchMovies('Test Movie', 1)
      expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('/search/movies'))
      expect(result).toEqual({ results: mockResults })
    })

    it('includes page parameter', async () => {
      vi.mocked(api.apiFetch).mockResolvedValue({ results: [] })
      await searchMovies('Test', 3)
      expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('page=3'))
    })
  })

  describe('searchSeries', () => {
    it('searches for series with title', async () => {
      const mockResults = [{ _id: '1', title: 'Series 1' }]
      vi.mocked(api.apiFetch).mockResolvedValue({ results: mockResults })
      const result = await searchSeries('Test Series', 1)
      expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('/search/series'))
      expect(result).toEqual({ results: mockResults })
    })
  })

  describe('searchFriends', () => {
    it('searches for friends by handle', async () => {
      const mockResults = [{ _id: '1', handle: 'user1' }]
      vi.mocked(api.apiFetch).mockResolvedValue({ results: mockResults })
      const result = await searchFriends('user1', 1)
      expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('/search/friends'))
      expect(result).toEqual({ results: mockResults })
    })

    it('includes page parameter', async () => {
      vi.mocked(api.apiFetch).mockResolvedValue({ results: [] })
      await searchFriends('test', 2)
      expect(api.apiFetch).toHaveBeenCalledWith(expect.stringContaining('page=2'))
    })
  })
})
