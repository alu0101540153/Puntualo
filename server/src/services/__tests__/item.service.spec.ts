import { describe, it, expect, vi, beforeEach } from 'vitest'
import { itemService } from '../item.service'
import { ItemModel } from '../../models'

vi.mock('../../models')

describe('itemService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should get all items', async () => {
      const mockItems = [
        { _id: '1', title: 'Item 1', itemType: 'movie' },
        { _id: '2', title: 'Item 2', itemType: 'book' }
      ]
      vi.mocked(ItemModel.find).mockResolvedValue(mockItems as any)

      const result = await itemService.getAll()

      expect(ItemModel.find).toHaveBeenCalled()
      expect(result).toEqual(mockItems)
    })
  })

  describe('getById', () => {
    it('should get item by id', async () => {
      const mockItem = { _id: '123', title: 'Test Movie', itemType: 'movie' }
      vi.mocked(ItemModel.findById).mockResolvedValue(mockItem as any)

      const result = await itemService.getById('123')

      expect(ItemModel.findById).toHaveBeenCalledWith('123')
      expect(result).toEqual(mockItem)
    })

    it('should return null for non-existent item', async () => {
      vi.mocked(ItemModel.findById).mockResolvedValue(null)

      const result = await itemService.getById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new item', async () => {
      const itemData = {
        title: 'New Movie',
        itemType: 'movie',
        externalId: 'tmdb123'
      }
      const mockItem = { _id: '123', ...itemData }
      vi.mocked(ItemModel.prototype.save).mockResolvedValue(mockItem as any)

      const result = await itemService.create(itemData)

      expect(result).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update item', async () => {
      const mockItem = {
        _id: '123',
        title: 'Original Title',
        save: vi.fn().mockResolvedValue({ _id: '123', title: 'Updated Title' })
      }
      vi.mocked(ItemModel.findById).mockResolvedValue(mockItem as any)

      const result = await itemService.update('123', { title: 'Updated Title' })

      expect(ItemModel.findById).toHaveBeenCalledWith('123')
      expect(mockItem.save).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete item', async () => {
      const mockResult = { deletedCount: 1 }
      vi.mocked(ItemModel.deleteOne).mockResolvedValue(mockResult as any)

      const result = await itemService.delete('123')

      expect(ItemModel.deleteOne).toHaveBeenCalledWith({ _id: '123' })
      expect(result).toEqual(mockResult)
    })
  })
})
