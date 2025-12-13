import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  addRating,
  getMyRatings,
  updateUser,
  deleteRating,
  followUser,
  unfollowUser,
  getUserById,
  addItemToUser,
  removeItemFromUser,
  getFeed
} from '../user'

vi.mock('../api', () => ({
  default: {
    apiFetch: vi.fn()
  }
}))

import api from '../api'

describe('user service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addRating', () => {
    it('adds a rating for a user', async () => {
      const userId = '123'
      const payload = { itemId: 'item1', score: 5, review: 'Great!' }
      vi.mocked(api.apiFetch).mockResolvedValue({ success: true })
      
      await addRating(userId, payload)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}/rate`,
        { method: 'POST', body: payload, auth: true }
      )
    })
  })

  describe('getMyRatings', () => {
    it('fetches ratings for a user with default sort', async () => {
      const userId = '123'
      const mockRatings = [{ _id: '1', score: 5 }]
      vi.mocked(api.apiFetch).mockResolvedValue(mockRatings)
      
      const result = await getMyRatings(userId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}/ratings?sortBy=date&order=desc`,
        { auth: true }
      )
      expect(result).toEqual(mockRatings)
    })

    it('fetches ratings with custom sort and order', async () => {
      const userId = '123'
      vi.mocked(api.apiFetch).mockResolvedValue([])
      
      await getMyRatings(userId, 'score', 'asc')
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}/ratings?sortBy=score&order=asc`,
        { auth: true }
      )
    })
  })

  describe('updateUser', () => {
    it('updates user with JSON payload', async () => {
      const userId = '123'
      const payload = { name: 'New Name' }
      vi.mocked(api.apiFetch).mockResolvedValue({ success: true })
      
      await updateUser(userId, payload)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}`,
        { method: 'PATCH', body: payload, auth: true }
      )
    })

    it('updates user with FormData payload', async () => {
      const userId = '123'
      const formData = new FormData()
      formData.append('name', 'New Name')
      vi.mocked(api.apiFetch).mockResolvedValue({ success: true })
      
      await updateUser(userId, formData)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}`,
        { method: 'PATCH', body: formData, auth: true }
      )
    })
  })

  describe('deleteRating', () => {
    it('deletes a rating', async () => {
      const userId = '123'
      const ratingId = '456'
      vi.mocked(api.apiFetch).mockResolvedValue({ success: true })
      
      await deleteRating(userId, ratingId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}/ratings/${ratingId}`,
        { method: 'DELETE', auth: true }
      )
    })
  })

  describe('followUser', () => {
    it('follows a user', async () => {
      const targetUserId = '456'
      vi.mocked(api.apiFetch).mockResolvedValue({ success: true })
      
      await followUser(targetUserId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${targetUserId}/follow`,
        { method: 'POST', auth: true }
      )
    })
  })

  describe('unfollowUser', () => {
    it('unfollows a user', async () => {
      const targetUserId = '456'
      vi.mocked(api.apiFetch).mockResolvedValue({ success: true })
      
      await unfollowUser(targetUserId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${targetUserId}/follow`,
        { method: 'DELETE', auth: true }
      )
    })
  })

  describe('getUserById', () => {
    it('fetches user by id', async () => {
      const userId = '123'
      const mockUser = { _id: userId, name: 'John' }
      vi.mocked(api.apiFetch).mockResolvedValue(mockUser)
      
      const result = await getUserById(userId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(`/users/${userId}`)
      expect(result).toEqual(mockUser)
    })
  })

  describe('addItemToUser', () => {
    it('adds an item to user', async () => {
      const userId = '123'
      const payload = { itemId: 'item1', itemType: 'movie' }
      vi.mocked(api.apiFetch).mockResolvedValue({ success: true })
      
      await addItemToUser(userId, payload)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}/items`,
        { method: 'POST', body: payload, auth: true }
      )
    })
  })

  describe('removeItemFromUser', () => {
    it('removes an item from user', async () => {
      const userId = '123'
      const itemSubId = 'sub456'
      vi.mocked(api.apiFetch).mockResolvedValue({ success: true })
      
      await removeItemFromUser(userId, itemSubId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}/items/${encodeURIComponent(itemSubId)}`,
        { method: 'DELETE', auth: true }
      )
    })
  })

  describe('getFeed', () => {
    it('fetches user feed with default params', async () => {
      const userId = '123'
      const mockFeed = [{ _id: '1', activity: 'rated' }]
      vi.mocked(api.apiFetch).mockResolvedValue(mockFeed)
      
      const result = await getFeed(userId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}/feed?page=1&limit=20`,
        { auth: true }
      )
      expect(result).toEqual(mockFeed)
    })

    it('fetches user feed with custom params', async () => {
      const userId = '123'
      vi.mocked(api.apiFetch).mockResolvedValue([])
      
      await getFeed(userId, 2, 10)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/users/${userId}/feed?page=2&limit=10`,
        { auth: true }
      )
    })
  })
})
