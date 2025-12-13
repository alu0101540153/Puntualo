import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerUser, loginUser, saveAuth, getUser, getToken } from '../auth'

// Mock apiFetch
vi.mock('../api', () => ({
  apiFetch: vi.fn()
}))

import { apiFetch } from '../api'

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('registerUser', () => {
    it('calls apiFetch with correct parameters', async () => {
      const payload = {
        name: 'John Doe',
        handle: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      }
      vi.mocked(apiFetch).mockResolvedValue({ success: true })
      await registerUser(payload)
      expect(apiFetch).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        body: payload
      })
    })
  })

  describe('loginUser', () => {
    it('calls apiFetch with correct parameters', async () => {
      const payload = {
        email: 'john@example.com',
        password: 'password123'
      }
      vi.mocked(apiFetch).mockResolvedValue({ success: true })
      await loginUser(payload)
      expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: payload
      })
    })
  })

  describe('saveAuth', () => {
    it('saves user and token to localStorage', () => {
      const user = { _id: '1', name: 'John', email: 'john@example.com' }
      const token = 'test-token-123'
      saveAuth(user, token)
      expect(localStorage.getItem('token')).toBe(token)
      expect(localStorage.getItem('user')).toBe(JSON.stringify(user))
    })
  })

  describe('getUser', () => {
    it('retrieves user from localStorage', () => {
      const user = { _id: '1', name: 'John', email: 'john@example.com' }
      localStorage.setItem('user', JSON.stringify(user))
      const result = getUser()
      expect(result).toEqual(user)
    })

    it('returns null if no user in localStorage', () => {
      const result = getUser()
      expect(result).toBeNull()
    })

    it('returns null if JSON parsing fails', () => {
      localStorage.setItem('user', 'invalid-json')
      const result = getUser()
      expect(result).toBeNull()
    })
  })

  describe('getToken', () => {
    it('retrieves token from localStorage', () => {
      const token = 'test-token-123'
      localStorage.setItem('token', token)
      const result = getToken()
      expect(result).toBe(token)
    })

    it('returns null if no token in localStorage', () => {
      const result = getToken()
      expect(result).toBeNull()
    })
  })
})
