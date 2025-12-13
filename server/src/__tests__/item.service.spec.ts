import { describe, it, expect, vi, beforeEach } from 'vitest'
import mongoose from 'mongoose'

// Mock models used inside item.service
vi.mock('../models', () => {
  const findMock = vi.fn()
  const findOneMock = vi.fn()
  const createMock = vi.fn()
  const findByIdAndUpdateMock = vi.fn()
  const findByIdMock = vi.fn()
  const findByIdAndDeleteMock = vi.fn()
  const aggregateMock = vi.fn()

  const ItemModel = {
    find: findMock,
    findOne: findOneMock,
    create: createMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
    findById: findByIdMock,
    findByIdAndDelete: findByIdAndDeleteMock,
  } as any

  const UserModel = {
    findById: vi.fn(),
    aggregate: aggregateMock,
  } as any

  return { ItemModel, UserModel }
})

import { ItemModel } from '../models'
import { UserModel } from '../models'
import { itemService } from '../services/item.service'

describe('itemService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll returns ItemModel.find()', async () => {
    ;(ItemModel.find as any).mockResolvedValue([{ id: 1 }])
    const res = await itemService.getAll()
    expect(ItemModel.find).toHaveBeenCalledTimes(1)
    expect(res).toEqual([{ id: 1 }])
  })

  it('findByExternalId without type', async () => {
    ;(ItemModel.findOne as any).mockResolvedValue({ id: 'x' })
    const res = await itemService.findByExternalId('abc')
    expect(ItemModel.findOne).toHaveBeenCalledWith({ externalId: 'abc' })
    expect(res).toEqual({ id: 'x' })
  })

  it('findByExternalId with type', async () => {
    ;(ItemModel.findOne as any).mockResolvedValue({ id: 'x' })
    const res = await itemService.findByExternalId('abc', 'movie')
    expect(ItemModel.findOne).toHaveBeenCalledWith({ externalId: 'abc', itemType: 'movie' })
    expect(res).toEqual({ id: 'x' })
  })

  it('create calls ItemModel.create', async () => {
    ;(ItemModel.create as any).mockResolvedValue({ _id: '1' })
    const res = await itemService.create({ a: 1 })
    expect(ItemModel.create).toHaveBeenCalledWith({ a: 1 })
    expect(res).toEqual({ _id: '1' })
  })

  it('update calls ItemModel.findByIdAndUpdate', async () => {
    ;(ItemModel.findByIdAndUpdate as any).mockResolvedValue({ _id: '1', a: 2 })
    const res = await itemService.update('1', { a: 2 })
    expect(ItemModel.findByIdAndUpdate).toHaveBeenCalledWith('1', { a: 2 })
    expect(res).toEqual({ _id: '1', a: 2 })
  })

  it('getById calls ItemModel.findById', async () => {
    ;(ItemModel.findById as any).mockResolvedValue({ _id: '1' })
    const res = await itemService.getById('1')
    expect(ItemModel.findById).toHaveBeenCalledWith('1')
    expect(res).toEqual({ _id: '1' })
  })

  it('delete calls ItemModel.findByIdAndDelete', async () => {
    ;(ItemModel.findByIdAndDelete as any).mockResolvedValue({ _id: '1' })
    const res = await itemService.delete('1')
    expect(ItemModel.findByIdAndDelete).toHaveBeenCalledWith('1')
    expect(res).toEqual({ _id: '1' })
  })

  it('getFriendsRatingsForItem returns [] when user not found', async () => {
    ;(UserModel.findById as any).mockReturnValue({ lean: () => Promise.resolve(null) })
    const res = await itemService.getFriendsRatingsForItem('u1', 'it1')
    expect(res).toEqual([])
  })

  it('getFriendsRatingsForItem handles following list and aggregates', async () => {
    const followedId = new mongoose.Types.ObjectId()
    ;(UserModel.findById as any).mockReturnValue({
      lean: () => Promise.resolve({ _id: 'u1', following: [followedId.toString()] })
    })
    ;(UserModel.aggregate as any).mockResolvedValue([
      { itemId: 'it1', score: 4, user: { _id: followedId } }
    ])

    const res = await itemService.getFriendsRatingsForItem('u1', 'it1')
    expect(UserModel.aggregate).toHaveBeenCalledTimes(1)
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBe(1)
  })

  it('getFriendsRatingsForItem returns [] when no valid follows', async () => {
    ;(UserModel.findById as any).mockReturnValue({ lean: () => Promise.resolve({ _id: 'u1', following: ['invalid'] }) })
    const res = await itemService.getFriendsRatingsForItem('u1', 'it1')
    expect(res).toEqual([])
  })

  it('getTop returns aggregated items and maps fields', async () => {
    ;(UserModel.aggregate as any).mockResolvedValue([
      {
        _id: new mongoose.Types.ObjectId(),
        avgScore: 4.3333,
        count: 3,
        item: { _id: 'it1', title: 'Title', data: { title: 'Title' }, itemType: 'movie' }
      }
    ])
    const res = await itemService.getTop(undefined, 5)
    expect(UserModel.aggregate).toHaveBeenCalledTimes(1)
    expect(res.items[0].score).toBe(4.3)
    expect(res.items[0].votes).toBe(3)
  })

  it('getTop with type filters by regex', async () => {
    ;(UserModel.aggregate as any).mockResolvedValue([])
    const res = await itemService.getTop('book', 2)
    expect(UserModel.aggregate).toHaveBeenCalledTimes(1)
    expect(res.items).toEqual([])
  })
})
