import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getItemById,
  getAllItems,
  getRecommendationsForUser,
  getTopItems
} from '../item'

vi.mock('../api', () => ({
  default: {
    apiFetch: vi.fn()
  }
}))

import api from '../api'

describe('item service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getItemById', () => {
    it('fetches item by id', async () => {
      const itemId = '123'
      const mockItem = { _id: itemId, title: 'Test Movie' }
      vi.mocked(api.apiFetch).mockResolvedValue(mockItem)
      
      const result = await getItemById(itemId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(`/item/${itemId}`)
      expect(result).toEqual(mockItem)
    })
  })

  describe('getAllItems', () => {
    it('fetches all items', async () => {
      const mockItems = [
        { _id: '1', title: 'Item 1' },
        { _id: '2', title: 'Item 2' }
      ]
      vi.mocked(api.apiFetch).mockResolvedValue(mockItems)
      
      const result = await getAllItems()
      
      expect(api.apiFetch).toHaveBeenCalledWith('/item')
      expect(result).toEqual(mockItems)
    })
  })

  describe('getRecommendationsForUser', () => {
    it('fetches recommendations for a user', async () => {
      const userId = '123'
      const mockRecommendations = [
        { _id: '1', title: 'Recommended 1' },
        { _id: '2', title: 'Recommended 2' }
      ]
      vi.mocked(api.apiFetch).mockResolvedValue(mockRecommendations)
      
      const result = await getRecommendationsForUser(userId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(`/item/recommendations/${userId}`)
      expect(result).toEqual(mockRecommendations)
    })
  })

  describe('getTopItems', () => {
    it('fetches top items with default params', async () => {
      const mockItems = { items: [{ _id: '1', title: 'Top Movie' }] }
      vi.mocked(api.apiFetch).mockResolvedValue(mockItems)
      
      const result = await getTopItems()
      
      expect(api.apiFetch).toHaveBeenCalledWith('/item/top?type=movie&limit=8')
      expect(result).toEqual(mockItems)
    })

    it('fetches top items with custom type and limit', async () => {
      const mockItems = { items: [{ _id: '1', title: 'Top Book' }] }
      vi.mocked(api.apiFetch).mockResolvedValue(mockItems)
      
      const result = await getTopItems('book', 5)
      
      expect(api.apiFetch).toHaveBeenCalledWith('/item/top?type=book&limit=5')
      expect(result).toEqual(mockItems)
    })

    it('falls back to filtering all items on error', async () => {
      const mockAllItems = [
        { _id: '1', title: 'Movie 1', itemType: 'movie', score: 8.5 },
        { _id: '2', title: 'Movie 2', itemType: 'movie', score: 9.0 },
        { _id: '3', title: 'Book 1', itemType: 'book', score: 7.5 }
      ]
      let callCount = 0
      vi.mocked(api.apiFetch).mockImplementation(async () => {
        callCount++
        if (callCount === 1) {
          throw new Error('Top endpoint not available')
        }
        return mockAllItems
      })
      
      const result = await getTopItems('movie', 2)
      
      expect(result.items).toHaveLength(2)
      expect(result.items[0].title).toBe('Movie 2') // highest score first
    })

    it('returns empty array on complete failure', async () => {
      vi.mocked(api.apiFetch).mockRejectedValue(new Error('All endpoints failed'))
      
      const result = await getTopItems()
      expect(result).toBeDefined()
      expect(result.items).toEqual([])
    })
  })
})
