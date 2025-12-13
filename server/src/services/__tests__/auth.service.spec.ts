import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../auth.service'
import { UserModel } from '../../models'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

vi.mock('../../models')
vi.mock('argon2')
vi.mock('jsonwebtoken')

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        toObject: () => ({ _id: '123', email: 'test@example.com', name: 'Test User' })
      }
      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any)
      vi.mocked(argon2.verify).mockResolvedValue(true)
      vi.mocked(jwt.sign).mockReturnValue('test-token' as any)

      const result = await authService.login('test@example.com', 'password123')

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' })
      expect(argon2.verify).toHaveBeenCalledWith('hashedpassword', 'password123')
      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('token')
    })

    it('should throw error for invalid email', async () => {
      vi.mocked(UserModel.findOne).mockResolvedValue(null)

      await expect(authService.login('invalid@example.com', 'password')).rejects.toThrow()
    })

    it('should throw error for invalid password', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedpassword'
      }
      vi.mocked(UserModel.findOne).mockResolvedValue(mockUser as any)
      vi.mocked(argon2.verify).mockResolvedValue(false)

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow()
    })
  })

  describe('generateToken', () => {
    it('should generate JWT token', () => {
      const mockUser = { _id: '123', email: 'test@example.com' }
      vi.mocked(jwt.sign).mockReturnValue('generated-token' as any)

      const token = authService.generateToken(mockUser as any)

      expect(jwt.sign).toHaveBeenCalled()
      expect(token).toBe('generated-token')
    })
  })
})
