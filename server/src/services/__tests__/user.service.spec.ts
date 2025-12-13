import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService } from '../user.service'
import { UserModel } from '../../models'

vi.mock('../../models')
vi.mock('argon2')

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should get all users', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com' },
        { _id: '2', name: 'User 2', email: 'user2@example.com' }
      ]
      vi.mocked(UserModel.find).mockResolvedValue(mockUsers as any)

      const result = await userService.getAll()

      expect(UserModel.find).toHaveBeenCalled()
      expect(result).toEqual(mockUsers)
    })
  })

  describe('getById', () => {
    it('should get user by id', async () => {
      const mockUser = { _id: '123', name: 'Test User', email: 'test@example.com' }
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any)

      const result = await userService.getById('123')

      expect(UserModel.findById).toHaveBeenCalledWith('123')
      expect(result).toEqual(mockUser)
    })

    it('should return null for non-existent user', async () => {
      vi.mocked(UserModel.findById).mockResolvedValue(null)

      const result = await userService.getById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        handle: 'newuser'
      }
      const mockUser = { _id: '123', ...userData }
      vi.mocked(UserModel.prototype.save).mockResolvedValue(mockUser as any)

      const result = await userService.create(userData)

      expect(result).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update user', async () => {
      const mockUser = {
        _id: '123',
        name: 'Original Name',
        save: vi.fn().mockResolvedValue({ _id: '123', name: 'Updated Name' })
      }
      vi.mocked(UserModel.findById).mockResolvedValue(mockUser as any)

      const result = await userService.update('123', { name: 'Updated Name' })

      expect(UserModel.findById).toHaveBeenCalledWith('123')
      expect(mockUser.save).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete user', async () => {
      const mockResult = { deletedCount: 1 }
      vi.mocked(UserModel.deleteOne).mockResolvedValue(mockResult as any)

      const result = await userService.delete('123')

      expect(UserModel.deleteOne).toHaveBeenCalledWith({ _id: '123' })
      expect(result).toEqual(mockResult)
    })
  })
})
