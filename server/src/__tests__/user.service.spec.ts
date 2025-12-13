import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as userServiceModule from '../services/user.service'
import type { Model } from 'mongoose'

const fakeUser: any = {_id: 'u1', handle: 'user', name: 'User', follows: [], ratedItems: [], items: []}

const findMock = vi.fn()
const findOneMock = vi.fn()
const findByIdMock = vi.fn()
const findByIdAndUpdateMock = vi.fn()
const findByIdAndDeleteMock = vi.fn()
const findOneAndUpdateMock = vi.fn()
const countDocumentsMock = vi.fn()
const aggregateMock = vi.fn()
const createMock = vi.fn()

vi.mock('../models', () => ({
  UserModel: {
    find: (...args: any[]) => findMock(...args),
    findOne: (...args: any[]) => findOneMock(...args),
    findById: (...args: any[]) => findByIdMock(...args),
    findByIdAndUpdate: (...args: any[]) => findByIdAndUpdateMock(...args),
    findByIdAndDelete: (...args: any[]) => findByIdAndDeleteMock(...args),
    findOneAndUpdate: (...args: any[]) => findOneAndUpdateMock(...args),
    countDocuments: (...args: any[]) => countDocumentsMock(...args),
    aggregate: (...args: any[]) => aggregateMock(...args),
    create: (...args: any[]) => createMock(...args),
  } as unknown as Model<any>
}))

const service = userServiceModule.userService

beforeEach(() => {
  vi.clearAllMocks()
  findMock.mockResolvedValue([fakeUser])
  findByIdAndUpdateMock.mockResolvedValue(fakeUser)
  findByIdAndDeleteMock.mockResolvedValue(fakeUser)
  findOneAndUpdateMock.mockResolvedValue(null)
  findOneMock.mockResolvedValue(null)
  countDocumentsMock.mockResolvedValue(0)
  aggregateMock.mockResolvedValue([{ metadata: [{ total: 0 }], data: [] }])
  createMock.mockResolvedValue(fakeUser)
  findByIdMock.mockReturnValue({
    populate: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(fakeUser)
  })
})

describe('user.service basic CRUD', () => {
  it('create hashes password and stores', async () => {
    const res = await service.create({ email: 'a@test.com', password: 'pwd' })
    expect(createMock).toHaveBeenCalled()
    expect(res).toBe(fakeUser)
  })

  it('update throws conflict when handle exists', async () => {
    findOneMock.mockResolvedValueOnce({ _id: 'other' })
    await expect(service.update('u1', { handle: 'dup' })).rejects.toThrow(/handle/i)
  })
})

describe('user.service follow/unfollow', () => {
  it('returns same user when follower equals target', async () => {
    findByIdMock.mockResolvedValue(fakeUser)
    const res = await service.followUser('u1', 'u1')
    expect(res).toBe(fakeUser)
  })

  it('calls findByIdAndUpdate for follow/unfollow', async () => {
    await service.followUser('u1', 'u2')
    expect(findByIdAndUpdateMock).toHaveBeenCalled()
    await service.unfollowUser('u1', 'u2')
    expect(findByIdAndUpdateMock).toHaveBeenCalledTimes(2)
  })
})

describe('user.service ratings', () => {
  it('updates existing rating if present', async () => {
    findOneAndUpdateMock.mockResolvedValueOnce({ updated: true })
    const res = await service.addRating('u1', { itemId: 'i1', score: 8 })
    expect(res).toEqual({ updated: true })
    expect(findOneAndUpdateMock).toHaveBeenCalled()
  })

  it('pushes new rating when not found', async () => {
    findOneAndUpdateMock.mockResolvedValueOnce(null)
    await service.addRating('u1', { itemId: 'i2', score: 7 })
    expect(findByIdAndUpdateMock).toHaveBeenCalled()
  })

  it('sorts getRatings by score asc when requested', async () => {
    findByIdMock.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({ ratedItems: [
        { score: 9, lastModified: '2020-01-01' },
        { score: 5, lastModified: '2020-01-02' }
      ] })
    })
    const res = await service.getRatings('u1', 'score', 'asc')
    expect(res[0].score).toBe(5)
  })
})

describe('user.service items & feed', () => {
  it('addItemToUser pushes item', async () => {
    await service.addItemToUser('u1', { title: 'x' })
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith('u1', expect.objectContaining({ $push: { items: expect.any(Object) } }), expect.any(Object))
  })

  it('removeItemFromUser pulls item', async () => {
    await service.removeItemFromUser('u1', 'itemSub')
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith('u1', { $pull: { items: { _id: 'itemSub' } } }, { new: true })
  })

  it('getFeed returns aggregated items', async () => {
    findByIdMock.mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: 'u1', follows: ['507f1f77bcf86cd799439011'] }) })
    aggregateMock.mockResolvedValue([{ metadata: [{ total: 1 }], data: [{ item: 1 }] }])
    const res = await service.getFeed('u1', 1, 10)
    expect(res.total).toBe(1)
    expect(res.items.length).toBe(1)
  })
})

describe('user.service getRatings deleteRating', () => {
  it('deleteRating delegates to findByIdAndUpdate', async () => {
    await service.deleteRating('u1', 'r1')
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith('u1', { $pull: { ratedItems: { _id: 'r1' } } }, { new: true })
  })
})
