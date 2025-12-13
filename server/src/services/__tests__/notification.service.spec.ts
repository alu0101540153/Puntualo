import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notificationService } from '../notification.service'
import { NotificationModel } from '../../models'

vi.mock('../../models')

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should get all notifications for user', async () => {
      const mockNotifications = [
        { _id: '1', user: 'user1', message: 'Notification 1', read: false },
        { _id: '2', user: 'user1', message: 'Notification 2', read: true }
      ]
      vi.mocked(NotificationModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockNotifications)
      } as any)

      const result = await notificationService.getAll('user1', false)

      expect(NotificationModel.find).toHaveBeenCalledWith({ user: 'user1' })
      expect(result).toEqual(mockNotifications)
    })

    it('should get only unread notifications', async () => {
      const mockNotifications = [
        { _id: '1', user: 'user1', message: 'Unread', read: false }
      ]
      vi.mocked(NotificationModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockNotifications)
      } as any)

      const result = await notificationService.getAll('user1', true)

      expect(NotificationModel.find).toHaveBeenCalledWith({ user: 'user1', read: false })
      expect(result).toEqual(mockNotifications)
    })
  })

  describe('getUnread', () => {
    it('should get unread notifications', async () => {
      const mockNotifications = [
        { _id: '1', user: 'user1', message: 'Unread', read: false }
      ]
      vi.mocked(NotificationModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockNotifications)
      } as any)

      const result = await notificationService.getUnread('user1')

      expect(NotificationModel.find).toHaveBeenCalledWith({ user: 'user1', read: false })
      expect(result).toEqual(mockNotifications)
    })
  })

  describe('countUnread', () => {
    it('should count unread notifications', async () => {
      vi.mocked(NotificationModel.countDocuments).mockResolvedValue(5)

      const result = await notificationService.countUnread('user1')

      expect(NotificationModel.countDocuments).toHaveBeenCalledWith({ user: 'user1', read: false })
      expect(result).toBe(5)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        _id: '123',
        read: false,
        save: vi.fn().mockResolvedValue({ _id: '123', read: true })
      }
      vi.mocked(NotificationModel.findById).mockResolvedValue(mockNotification as any)

      const result = await notificationService.markAsRead('123')

      expect(NotificationModel.findById).toHaveBeenCalledWith('123')
      expect(mockNotification.save).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete notification', async () => {
      const mockResult = { deletedCount: 1 }
      vi.mocked(NotificationModel.deleteOne).mockResolvedValue(mockResult as any)

      const result = await notificationService.delete('123')

      expect(NotificationModel.deleteOne).toHaveBeenCalledWith({ _id: '123' })
      expect(result).toEqual(mockResult)
    })
  })
})
