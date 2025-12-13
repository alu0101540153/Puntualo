import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { itemController } from '../item.controller'
import { itemService } from '../../services'

vi.mock('../../services')

describe('itemController', () => {
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

  describe('getAllItem', () => {
    it('should return all items', async () => {
      const mockItems = [
        { _id: '1', title: 'Item 1' },
        { _id: '2', title: 'Item 2' }
      ]
      vi.mocked(itemService.getAll).mockResolvedValue(mockItems as any)

      await itemController.getAllItem(mockReq as Request, mockRes as Response)

      expect(itemService.getAll).toHaveBeenCalled()
      expect(jsonMock).toHaveBeenCalledWith(mockItems)
    })

    it('should return 400 on error', async () => {
      const error = new Error('Database error')
      vi.mocked(itemService.getAll).mockRejectedValue(error)

      await itemController.getAllItem(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Database error' })
    })
  })

  describe('create', () => {
    it('should create an item', async () => {
      mockReq.body = { title: 'New Item', type: 'movie' }
      const mockItem = { _id: '1', ...mockReq.body }
      vi.mocked(itemService.create).mockResolvedValue(mockItem as any)

      await itemController.create(mockReq as Request, mockRes as Response)

      expect(itemService.create).toHaveBeenCalledWith(mockReq.body)
      expect(jsonMock).toHaveBeenCalledWith(mockItem)
    })

    it('should return 400 on error', async () => {
      mockReq.body = { title: 'Invalid' }
      const error = new Error('Validation failed')
      vi.mocked(itemService.create).mockRejectedValue(error)

      await itemController.create(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('update', () => {
    it('should update an item', async () => {
      mockReq.params = { id: '123' }
      mockReq.body = { title: 'Updated Title' }
      const mockItem = { _id: '123', title: 'Updated Title' }
      vi.mocked(itemService.update).mockResolvedValue(mockItem as any)

      await itemController.update(mockReq as Request, mockRes as Response)

      expect(itemService.update).toHaveBeenCalledWith('123', mockReq.body)
      expect(jsonMock).toHaveBeenCalledWith(mockItem)
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123' }
      const error = new Error('Update failed')
      vi.mocked(itemService.update).mockRejectedValue(error)

      await itemController.update(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('delete', () => {
    it('should delete an item', async () => {
      mockReq.params = { id: '123' }
      const mockResult = { message: 'Item deleted' }
      vi.mocked(itemService.delete).mockResolvedValue(mockResult as any)

      await itemController.delete(mockReq as Request, mockRes as Response)

      expect(itemService.delete).toHaveBeenCalledWith('123')
      expect(jsonMock).toHaveBeenCalledWith(mockResult)
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123' }
      const error = new Error('Delete failed')
      vi.mocked(itemService.delete).mockRejectedValue(error)

      await itemController.delete(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('getById', () => {
    it('should get item by id', async () => {
      mockReq.params = { id: '123' }
      const mockItem = { _id: '123', title: 'Test Item' }
      vi.mocked(itemService.getById).mockResolvedValue(mockItem as any)

      await itemController.getById(mockReq as Request, mockRes as Response)

      expect(itemService.getById).toHaveBeenCalledWith('123')
      expect(jsonMock).toHaveBeenCalledWith(mockItem)
    })

    it('should return 404 if item not found', async () => {
      mockReq.params = { id: '123' }
      vi.mocked(itemService.getById).mockResolvedValue(null as any)

      await itemController.getById(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Item not found' })
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123' }
      const error = new Error('Get item failed')
      vi.mocked(itemService.getById).mockRejectedValue(error)

      await itemController.getById(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('getFriendsRatings', () => {
    it('should get friends ratings for item', async () => {
      mockReq.params = { id: '123' }
      ;(mockReq as any).user = { id: 'user1' }
      const mockRatings = [{ userId: 'friend1', score: 5 }]
      vi.mocked(itemService.getFriendsRatingsForItem).mockResolvedValue(mockRatings as any)

      await itemController.getFriendsRatings(mockReq as Request, mockRes as Response)

      expect(itemService.getFriendsRatingsForItem).toHaveBeenCalledWith('user1', '123')
      expect(jsonMock).toHaveBeenCalledWith({ items: mockRatings, total: 1 })
    })

    it('should return 401 if not authenticated', async () => {
      mockReq.params = { id: '123' }

      await itemController.getFriendsRatings(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Not authenticated' })
    })

    it('should return 400 if item id missing', async () => {
      ;(mockReq as any).user = { id: 'user1' }

      await itemController.getFriendsRatings(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Item id required' })
    })

    it('should return 400 on error', async () => {
      mockReq.params = { id: '123' }
      ;(mockReq as any).user = { id: 'user1' }
      const error = new Error('Get ratings failed')
      vi.mocked(itemService.getFriendsRatingsForItem).mockRejectedValue(error)

      await itemController.getFriendsRatings(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('getTop', () => {
    it('should get top items with default params', async () => {
      const mockItems = [{ _id: '1', title: 'Top Item', score: 9.5 }]
      vi.mocked(itemService.getTop).mockResolvedValue(mockItems as any)

      await itemController.getTop(mockReq as Request, mockRes as Response)

      expect(itemService.getTop).toHaveBeenCalledWith(undefined, 5)
      expect(jsonMock).toHaveBeenCalledWith(mockItems)
    })

    it('should get top items with custom params', async () => {
      mockReq.query = { type: 'movie', limit: '10' }
      const mockItems = [{ _id: '1', title: 'Top Movie', score: 9.0 }]
      vi.mocked(itemService.getTop).mockResolvedValue(mockItems as any)

      await itemController.getTop(mockReq as Request, mockRes as Response)

      expect(itemService.getTop).toHaveBeenCalledWith('movie', 10)
      expect(jsonMock).toHaveBeenCalledWith(mockItems)
    })

    it('should return 400 on error', async () => {
      const error = new Error('Get top items failed')
      vi.mocked(itemService.getTop).mockRejectedValue(error)

      await itemController.getTop(mockReq as Request, mockRes as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Get top items failed' })
    })
  })
})
