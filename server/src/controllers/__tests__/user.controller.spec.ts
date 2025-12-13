import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { userController } from '../user.controller'
import { userService } from '../../services'

vi.mock('../../services')

describe('userController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    mockReq = {
      body: {},
      params: {},
      query: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  describe('getAllUser', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1' },
        { _id: '2', name: 'User 2' }
      ]
      vi.mocked(userService.getAll).mockResolvedValue(mockUsers as any)

      await userController.getAllUser(mockReq as Request, mockRes as Response)

      expect(userService.getAll).toHaveBeenCalled()
      expect(jsonMock).toHaveBeenCalledWith(mockUsers)
    })

    it('should return 400 on error', async () => {
      const error = new Error('Database error')
      vi.mocked(userService.getAll).mockRejectedValue(error)

      await userController.getAllUser(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Database error' })
    })
  })

  describe('create', () => {
    it('should create a user', async () => {
      mockReq.body = { name: 'New User', email: 'new@example.com' }
      const mockUser = { _id: '1', ...mockReq.body }
      vi.mocked(userService.create).mockResolvedValue(mockUser as any)

      await userController.create(mockReq as Request, mockRes as Response)

      expect(userService.create).toHaveBeenCalledWith(mockReq.body)
      expect(jsonMock).toHaveBeenCalledWith(mockUser)
    })

    it('should return 400 on error', async () => {
      mockReq.body = { email: 'invalid' }
      const error = new Error('Validation failed')
      vi.mocked(userService.create).mockRejectedValue(error)

      await userController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      mockReq.params = { id: '123' }
      mockReq.body = { name: 'Updated Name' }
      const mockUser = { _id: '123', name: 'Updated Name' }
      vi.mocked(userService.update).mockResolvedValue(mockUser as any)

      await userController.update(mockReq as Request, mockRes as Response)

      expect(userService.update).toHaveBeenCalledWith('123', mockReq.body)
      expect(jsonMock).toHaveBeenCalledWith(mockUser)
    })

    it('should return 401 for unauthorized error', async () => {
      mockReq.params = { id: '123' }
      mockReq.body = { password: 'wrong' }
      const error: any = new Error('Contraseña incorrecta')
      error.name = 'UnauthorizedError'
      vi.mocked(userService.update).mockRejectedValue(error)

      await userController.update(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Contraseña incorrecta' })
    })

    it('should return 409 for conflict error', async () => {
      mockReq.params = { id: '123' }
      mockReq.body = { handle: 'existinghandle' }
      const error: any = new Error('Handle ya en uso')
      error.name = 'ConflictError'
      vi.mocked(userService.update).mockRejectedValue(error)

      await userController.update(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(409)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Handle ya en uso' })
    })

    it('should return 400 for other errors', async () => {
      mockReq.params = { id: '123' }
      const error = new Error('Update failed')
      vi.mocked(userService.update).mockRejectedValue(error)

      await userController.update(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      mockReq.params = { id: '123' }
      const mockResult = { message: 'User deleted' }
      vi.mocked(userService.delete).mockResolvedValue(mockResult as any)

      await userController.delete(mockReq as Request, mockRes as Response)

      expect(userService.delete).toHaveBeenCalledWith('123')
      expect(jsonMock).toHaveBeenCalledWith(mockResult)
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123' }
      const error = new Error('Delete failed')
      vi.mocked(userService.delete).mockRejectedValue(error)

      await userController.delete(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('addRating', () => {
    it('should add a rating', async () => {
      mockReq.params = { id: '123' }
      mockReq.body = { itemId: 'item1', score: 5, review: 'Great!' }
      const mockResult = { success: true }
      vi.mocked(userService.addRating).mockResolvedValue(mockResult as any)

      await userController.addRating(mockReq as Request, mockRes as Response)

      expect(userService.addRating).toHaveBeenCalledWith('123', mockReq.body)
      expect(jsonMock).toHaveBeenCalledWith(mockResult)
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123' }
      const error = new Error('Rating failed')
      vi.mocked(userService.addRating).mockRejectedValue(error)

      await userController.addRating(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('getRatings', () => {
    it('should get ratings with default sort', async () => {
      mockReq.params = { id: '123' }
      const mockRatings = [{ _id: '1', score: 5 }]
      vi.mocked(userService.getRatings).mockResolvedValue(mockRatings as any)

      await userController.getRatings(mockReq as Request, mockRes as Response)

      expect(userService.getRatings).toHaveBeenCalledWith('123', 'date', 'desc')
      expect(jsonMock).toHaveBeenCalledWith(mockRatings)
    })

    it('should get ratings with custom sort', async () => {
      mockReq.params = { id: '123' }
      mockReq.query = { sortBy: 'score', order: 'asc' }
      const mockRatings = [{ _id: '1', score: 3 }]
      vi.mocked(userService.getRatings).mockResolvedValue(mockRatings as any)

      await userController.getRatings(mockReq as Request, mockRes as Response)

      expect(userService.getRatings).toHaveBeenCalledWith('123', 'score', 'asc')
      expect(jsonMock).toHaveBeenCalledWith(mockRatings)
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123' }
      const error = new Error('Get ratings failed')
      vi.mocked(userService.getRatings).mockRejectedValue(error)

      await userController.getRatings(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('deleteRating', () => {
    it('should delete a rating', async () => {
      mockReq.params = { id: '123', ratingId: '456' }
      const mockResult = { success: true }
      vi.mocked(userService.removeRating).mockResolvedValue(mockResult as any)

      await userController.deleteRating(mockReq as Request, mockRes as Response)

      expect(userService.removeRating).toHaveBeenCalledWith('123', '456')
      expect(jsonMock).toHaveBeenCalledWith(mockResult)
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123', ratingId: '456' }
      const error = new Error('Delete rating failed')
      vi.mocked(userService.removeRating).mockRejectedValue(error)

      await userController.deleteRating(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('getUserById', () => {
    it('should get user by id', async () => {
      mockReq.params = { id: '123' }
      const mockUser = { _id: '123', name: 'Test User' }
      vi.mocked(userService.getById).mockResolvedValue(mockUser as any)

      await userController.getUserById(mockReq as Request, mockRes as Response)

      expect(userService.getById).toHaveBeenCalledWith('123')
      expect(jsonMock).toHaveBeenCalledWith(mockUser)
    })

    it('should return 404 if user not found', async () => {
      mockReq.params = { id: '123' }
      vi.mocked(userService.getById).mockResolvedValue(null as any)

      await userController.getUserById(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'User not found' })
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123' }
      const error = new Error('Get user failed')
      vi.mocked(userService.getById).mockRejectedValue(error)

      await userController.getUserById(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })
})
