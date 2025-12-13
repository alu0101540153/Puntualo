import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notificationService } from '../services/notification.service'

vi.mock('../models', () => {
  const NotificationModel = {
    find: vi.fn(),
    countDocuments: vi.fn(),
    findOne: vi.fn(),
    updateMany: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  } as any
  return { NotificationModel }
})

import { NotificationModel } from '../models'

describe('notification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll: returns all and maps relatedId to string', async () => {
    const chain = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        { _id: 'n1', recipient: 'u', relatedId: { toString: () => 'r1' } },
        { _id: 'n2', recipient: 'u', relatedId: undefined },
      ]),
    }
    NotificationModel.find.mockReturnValue(chain)

    const res = await notificationService.getAll('u')
    expect(res[0].relatedId).toBe('r1')
    expect(res[1].relatedId).toBeUndefined()
  })

  it('getAll: applies unreadOnly filter', async () => {
    const chain = { populate: vi.fn().mockReturnThis(), sort: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) }
    NotificationModel.find.mockReturnValue(chain)
    await notificationService.getAll('u', true)
    expect(NotificationModel.find).toHaveBeenCalledWith({ recipient: 'u', read: false })
  })

  it('getUnread: delegates to getAll with unreadOnly', async () => {
    const chain = { populate: vi.fn().mockReturnThis(), sort: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) }
    NotificationModel.find.mockReturnValue(chain)
    const res = await notificationService.getUnread('u')
    expect(Array.isArray(res)).toBe(true)
  })

  it('countUnread: counts unread notifications', async () => {
    NotificationModel.countDocuments.mockResolvedValue(5)
    const count = await notificationService.countUnread('u')
    expect(count).toBe(5)
    expect(NotificationModel.countDocuments).toHaveBeenCalledWith({ recipient: 'u', read: false })
  })

  it('markAsRead: marks one as read', async () => {
    const doc = { _id: 'n1', recipient: 'u', read: false, save: vi.fn() }
    NotificationModel.findOne.mockResolvedValue(doc)
    const res = await notificationService.markAsRead('n1', 'u')
    expect(doc.save).toHaveBeenCalled()
    expect(res.read).toBe(true)
  })

  it('markAllAsRead: updates all unread to read', async () => {
    const res = await notificationService.markAllAsRead('u')
    expect(NotificationModel.updateMany).toHaveBeenCalledWith({ recipient: 'u', read: false }, { $set: { read: true } })
    expect(res.message).toBe('Todas las notificaciones marcadas como leídas')
  })

  it('delete: removes one notification', async () => {
    const doc = { _id: 'n1', recipient: 'u' }
    NotificationModel.findOne.mockResolvedValue(doc)
    const res = await notificationService.delete('n1', 'u')
    expect(NotificationModel.findByIdAndDelete).toHaveBeenCalledWith('n1')
    expect(res.message).toBe('Notificación eliminada')
  })

  it('create: creates a notification', async () => {
    NotificationModel.create.mockResolvedValue({ _id: 'n1' })
    const res = await notificationService.create({ recipient: 'u', sender: 's', type: 'follow_request', message: 'hola' })
    expect(NotificationModel.create).toHaveBeenCalled()
    expect(res._id).toBe('n1')
  })
})
