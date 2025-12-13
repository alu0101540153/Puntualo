import { describe, it, expect, vi, beforeEach } from 'vitest'
import { followRequestService } from '../services/followRequest.service'

// Mock models used inside the service
vi.mock('../models', () => {
  const FollowRequestModel = {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    find: vi.fn(),
  } as any

  const NotificationModel = {
    create: vi.fn(),
    deleteMany: vi.fn(),
  } as any

  const UserModel = {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  } as any

  return { FollowRequestModel, NotificationModel, UserModel }
})

// Import mocked models (vi.mock above replaces this import)
import { FollowRequestModel, NotificationModel, UserModel } from '../models'

describe('followRequest.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create: follows immediately when target is public', async () => {
    UserModel.findById.mockResolvedValue({ _id: 'to', isPrivate: false })

    const res = await followRequestService.create('from', 'to')

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(2)
    expect(res.status).toBe('following')
  })

  it('create: creates request and notification when target is private', async () => {
    UserModel.findById.mockResolvedValueOnce({ _id: 'to', isPrivate: true })
    FollowRequestModel.findOne.mockResolvedValueOnce(null)
    FollowRequestModel.create.mockResolvedValueOnce({ _id: 'req1', from: 'from', to: 'to', status: 'pending' })
    // findById(...).select('name handle') chain
    UserModel.findById.mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ _id: 'from', name: 'From', handle: 'from' }) })

    const res = await followRequestService.create('from', 'to')

    expect(FollowRequestModel.create).toHaveBeenCalled()
    expect(NotificationModel.create).toHaveBeenCalled()
    expect(res.status).toBe('requested')
  })

  it('create: returns requested if pending already exists', async () => {
    UserModel.findById.mockResolvedValueOnce({ _id: 'to', isPrivate: true })
    FollowRequestModel.findOne.mockResolvedValueOnce({ _id: 'reqExisting', status: 'pending' })

    const res = await followRequestService.create('from', 'to')

    expect(res.status).toBe('requested')
    expect(res.request._id).toBe('reqExisting')
  })

  it('accept: updates request and creates notifications', async () => {
    const doc = { _id: 'req1', from: 'from', to: 'to', status: 'pending', save: vi.fn() }
    FollowRequestModel.findById.mockResolvedValueOnce(doc)
    // Chain select for both lookups
    UserModel.findById
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ _id: 'to', name: 'To', handle: 'to' }) })
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ _id: 'from', name: 'From', handle: 'from' }) })

    const res = await followRequestService.accept('req1', 'to')

    expect(doc.save).toHaveBeenCalled()
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(2)
    expect(NotificationModel.create).toHaveBeenCalledTimes(2)
    expect(res.message).toBe('Solicitud aceptada')
  })

  it('reject: updates request to rejected', async () => {
    const doc = { _id: 'req1', from: 'from', to: 'to', status: 'pending', save: vi.fn() }
    FollowRequestModel.findById.mockResolvedValueOnce(doc)

    const res = await followRequestService.reject('req1', 'to')

    expect(doc.save).toHaveBeenCalled()
    expect(res.message).toBe('Solicitud rechazada')
  })

  it('getPendingRequests: returns populated list', async () => {
    const chain = { populate: vi.fn().mockReturnThis(), sort: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([{ _id: 'r1' }]) }
    FollowRequestModel.find.mockReturnValue(chain)

    const res = await followRequestService.getPendingRequests('to')
    expect(Array.isArray(res)).toBe(true)
    expect(res[0]._id).toBe('r1')
  })

  it('getSentRequests: returns populated list', async () => {
    const chain = { populate: vi.fn().mockReturnThis(), sort: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([{ _id: 'r2' }]) }
    FollowRequestModel.find.mockReturnValue(chain)

    const res = await followRequestService.getSentRequests('from')
    expect(Array.isArray(res)).toBe(true)
    expect(res[0]._id).toBe('r2')
  })

  it('cancel: deletes request and related notifications', async () => {
    const doc = { _id: 'req1', from: 'from', to: 'to', status: 'pending' }
    FollowRequestModel.findById.mockResolvedValueOnce(doc)

    const res = await followRequestService.cancel('req1', 'from')

    expect(FollowRequestModel.findByIdAndDelete).toHaveBeenCalledWith('req1')
    expect(NotificationModel.deleteMany).toHaveBeenCalledWith({ relatedId: 'req1' })
    expect(res.message).toBe('Solicitud cancelada')
  })
})
