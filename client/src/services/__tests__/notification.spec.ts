import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAllNotifications,
  getUnreadNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../notification'

vi.mock('../api', () => ({
  default: {
    apiFetch: vi.fn()
  }
}))

import api from '../api'

describe('notification service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllNotifications', () => {
    it('fetches all notifications', async () => {
      const mockNotifications = [
        { _id: '1', message: 'Test 1', read: false },
        { _id: '2', message: 'Test 2', read: true }
      ]
      vi.mocked(api.apiFetch).mockResolvedValue(mockNotifications)
      const result = await getAllNotifications()
      expect(api.apiFetch).toHaveBeenCalledWith('/notifications', { auth: true })
      expect(result).toEqual(mockNotifications)
    })

    it('fetches only unread when unreadOnly is true', async () => {
      vi.mocked(api.apiFetch).mockResolvedValue([])
      await getAllNotifications(true)
      expect(api.apiFetch).toHaveBeenCalledWith('/notifications?unreadOnly=true', { auth: true })
    })
  })

  describe('getUnreadNotifications', () => {
    it('fetches unread notifications', async () => {
      const mockNotifications = [{ _id: '1', message: 'Unread', read: false }]
      vi.mocked(api.apiFetch).mockResolvedValue(mockNotifications)
      const result = await getUnreadNotifications()
      expect(api.apiFetch).toHaveBeenCalledWith('/notifications/unread', { auth: true })
      expect(result).toEqual(mockNotifications)
    })
  })

  describe('countUnreadNotifications', () => {
    it('fetches count of unread notifications', async () => {
      vi.mocked(api.apiFetch).mockResolvedValue({ count: 5 })
      const result = await countUnreadNotifications()
      expect(api.apiFetch).toHaveBeenCalledWith('/notifications/count', { auth: true })
      expect(result).toEqual({ count: 5 })
    })
  })

  describe('markNotificationAsRead', () => {
    it('marks notification as read', async () => {
      const notificationId = '123'
      const mockNotification = { _id: notificationId, read: true }
      vi.mocked(api.apiFetch).mockResolvedValue(mockNotification)
      const result = await markNotificationAsRead(notificationId)
      expect(api.apiFetch).toHaveBeenCalledWith(`/notifications/${notificationId}/read`, {
        method: 'PUT',
        auth: true
      })
      expect(result).toEqual(mockNotification)
    })
  })

  describe('markAllNotificationsAsRead', () => {
    it('marks all notifications as read', async () => {
      vi.mocked(api.apiFetch).mockResolvedValue({ message: 'All marked as read' })
      const result = await markAllNotificationsAsRead()
      expect(api.apiFetch).toHaveBeenCalledWith('/notifications/mark-all-read', {
        method: 'PUT',
        auth: true
      })
      expect(result).toEqual({ message: 'All marked as read' })
    })
  })

  describe('deleteNotification', () => {
    it('deletes notification', async () => {
      const notificationId = '123'
      vi.mocked(api.apiFetch).mockResolvedValue({ message: 'Deleted' })
      const result = await deleteNotification(notificationId)
      expect(api.apiFetch).toHaveBeenCalledWith(`/notifications/${notificationId}`, {
        method: 'DELETE',
        auth: true
      })
      expect(result).toEqual({ message: 'Deleted' })
    })
  })
})
