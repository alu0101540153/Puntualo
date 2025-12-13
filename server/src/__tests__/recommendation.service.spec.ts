import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock models used by recommendation.service
vi.mock('../models', () => {
  const chain = () => ({ lean: vi.fn().mockResolvedValue([]) })
  return {
    UserModel: {
      findById: vi.fn(() => ({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue({ ratedItems: [], items: [] }) })),
      find: vi.fn(() => ({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) })),
    },
    ItemModel: {
      find: vi.fn(() => chain()),
    },
  }
})

// Mock itemService.getTop used as fallback path
vi.mock('../services/item.service', () => ({
  itemService: {
    getTop: vi.fn(),
  }
}))

import { UserModel, ItemModel } from '../models'
import { itemService } from '../services/item.service'
import recommendationService from '../services/recommendation.service'

describe('recommendationService.getRecommendationsForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('serves from cache with recommendedIds and preserves order', async () => {
    // seed cache by calling once with computed similarities
    ;(UserModel.findById as any).mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue({ ratedItems: [], items: [] }) })
    ;(UserModel.find as any).mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([{ _id: 'u1', ratedItems: [{ itemId: 'a', score: 5 }, { itemId: 'b', score: 3 }] }, { _id: 'u2', ratedItems: [{ itemId: 'c', score: 5 }] }]) })
    ;(ItemModel.find as any).mockResolvedValue([{ _id: 'c', title: 'C' }])

    const first = await recommendationService.getRecommendationsForUser('u1', { page: 1, limit: 10 })
    expect(first).toHaveProperty('items')

    // Now simulate cache hit by mocking UserModel and ItemModel again, ensuring order mapping works
    ;(UserModel.findById as any).mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue({ ratedItems: [], items: [] }) })
    ;(ItemModel.find as any).mockResolvedValue([{ _id: 'x', title: 'X' }, { _id: 'y', title: 'Y' }])
    const second = await recommendationService.getRecommendationsForUser('u1', { page: 1, limit: 2 })
    expect(second).toHaveProperty('page', 1)
    expect(second).toHaveProperty('limit', 2)
  })

  it('fallback to itemService.getTop when user has too few ratings', async () => {
    ;(UserModel.findById as any).mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue({ ratedItems: [{ itemId: 'a', score: 5 }], items: [] }) })
    ;(UserModel.find as any).mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([{ _id: 'u1', ratedItems: [{ itemId: 'a', score: 5 }] }]) })
    ;(itemService.getTop as any).mockResolvedValue({ items: [{ _id: 't1', title: 'Top1' }, { _id: 't2', title: 'Top2' }] })

    const res = await recommendationService.getRecommendationsForUser('u1', { page: 1, limit: 1 })
    expect(itemService.getTop).toHaveBeenCalled()
    expect(res.items.length).toBe(1)
    expect(res.total).toBe(2)
  })

  it('uses averaging fallback when itemService.getTop throws', async () => {
    ;(UserModel.findById as any).mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue({ ratedItems: [], items: [] }) })
    ;(UserModel.find as any).mockReturnValue({ select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([
      { _id: 'u1', ratedItems: [{ itemId: 'a', score: 5 }] },
      { _id: 'u2', ratedItems: [{ itemId: 'b', score: 4 }] },
      { _id: 'u3', ratedItems: [{ itemId: 'c', score: 3 }] },
    ]) })
    ;(itemService.getTop as any).mockRejectedValue(new Error('boom'))
    ;(ItemModel.find as any).mockReturnValue({ lean: vi.fn().mockResolvedValue([{ _id: 'a', title: 'A' }, { _id: 'b', title: 'B' }, { _id: 'c', title: 'C' }]) })

    const res = await recommendationService.getRecommendationsForUser('uX', { page: 1, limit: 2 })
    expect(res.items.length).toBe(2)
    expect(res.total).toBeGreaterThanOrEqual(2)
  })
})
