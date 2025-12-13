import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getStats, getCommonItemsBetweenUsers } from '../stats'

vi.mock('../api', () => ({
  default: {
    apiFetch: vi.fn()
  }
}))

import api from '../api'

describe('stats service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStats', () => {
    it('fetches stats for a user', async () => {
      const userId = '123'
      const mockStats = {
        totalRatings: 50,
        averageRating: 4.2,
        totalItems: 100,
        totalFriends: 25
      }
      vi.mocked(api.apiFetch).mockResolvedValue(mockStats)
      
      const result = await getStats(userId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(`/stats/${userId}`)
      expect(result).toEqual(mockStats)
    })
  })

  describe('getCommonItemsBetweenUsers', () => {
    it('fetches common items between two users', async () => {
      const user1Id = '123'
      const user2Id = '456'
      const mockCommonItems = [
        { _id: '1', title: 'Common Movie 1' },
        { _id: '2', title: 'Common Book 1' }
      ]
      vi.mocked(api.apiFetch).mockResolvedValue(mockCommonItems)
      
      const result = await getCommonItemsBetweenUsers(user1Id, user2Id)
      
      expect(api.apiFetch).toHaveBeenCalledWith(`/stats/common/${user1Id}/${user2Id}`)
      expect(result).toEqual(mockCommonItems)
    })
  })
})
