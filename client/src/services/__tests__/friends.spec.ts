import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getMyFollows } from '../friends'

vi.mock('../api', () => ({
  default: {
    apiFetch: vi.fn()
  }
}))

import api from '../api'

describe('friends service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMyFollows', () => {
    it('fetches friends for a user', async () => {
      const userId = '123'
      const mockFriends = [
        { _id: '1', name: 'Friend 1' },
        { _id: '2', name: 'Friend 2' }
      ]
      vi.mocked(api.apiFetch).mockResolvedValue(mockFriends)
      
      const result = await getMyFollows(userId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(`/users/${userId}/friends`)
      expect(result).toEqual(mockFriends)
    })

    it('handles empty friends list', async () => {
      vi.mocked(api.apiFetch).mockResolvedValue([])
      const result = await getMyFollows('456')
      expect(result).toEqual([])
    })
  })
})
