import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createFollowRequest,
  getPendingRequests as getPendingFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest
} from '../followRequest'

vi.mock('../api', () => ({
  default: {
    apiFetch: vi.fn()
  }
}))

import api from '../api'

describe('followRequest service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createFollowRequest', () => {
    it('creates a follow request', async () => {
      const targetId = '456'
      const mockResponse = { success: true, request: { _id: '789' } }
      vi.mocked(api.apiFetch).mockResolvedValue(mockResponse)
      
      const result = await createFollowRequest(targetId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        '/follow-requests',
        { method: 'POST', body: { targetId }, auth: true }
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getPendingFollowRequests', () => {
    it('fetches pending follow requests', async () => {
      const mockRequests = [
        { _id: '1', from: 'user1', status: 'pending' },
        { _id: '2', from: 'user2', status: 'pending' }
      ]
      vi.mocked(api.apiFetch).mockResolvedValue(mockRequests)
      
      const result = await getPendingFollowRequests()
      
      expect(api.apiFetch).toHaveBeenCalledWith('/follow-requests/pending', { auth: true })
      expect(result).toEqual(mockRequests)
    })
  })

  describe('acceptFollowRequest', () => {
    it('accepts a follow request', async () => {
      const requestId = '123'
      const mockResponse = { success: true }
      vi.mocked(api.apiFetch).mockResolvedValue(mockResponse)
      
      const result = await acceptFollowRequest(requestId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/follow-requests/${requestId}/accept`,
        { method: 'PUT', auth: true }
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('rejectFollowRequest', () => {
    it('rejects a follow request', async () => {
      const requestId = '123'
      const mockResponse = { success: true }
      vi.mocked(api.apiFetch).mockResolvedValue(mockResponse)
      
      const result = await rejectFollowRequest(requestId)
      
      expect(api.apiFetch).toHaveBeenCalledWith(
        `/follow-requests/${requestId}/reject`,
        { method: 'PUT', auth: true }
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
