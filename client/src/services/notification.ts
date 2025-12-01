import api from './api'

export interface Notification {
  _id: string
  recipient: string
  sender?: {
    _id: string
    name: string
    handle: string
    avatarBgColor?: string
  }
  type: 'follow_request' | 'follow_accepted' | 'follow_rejected'
  message: string
  read: boolean
  relatedId?: string
  createdAt: string
}

// Obtener todas las notificaciones (puede filtrar por ?unreadOnly=true)
export async function getAllNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
  const query = unreadOnly ? '?unreadOnly=true' : ''
  return api.apiFetch(`/notifications${query}`, { auth: true })
}

// Obtener solo notificaciones no leídas
export async function getUnreadNotifications(): Promise<Notification[]> {
  return api.apiFetch('/notifications/unread', { auth: true })
}

// Contar notificaciones no leídas
export async function countUnreadNotifications(): Promise<{ count: number }> {
  return api.apiFetch('/notifications/count', { auth: true })
}

// Marcar una notificación como leída
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return api.apiFetch(`/notifications/${notificationId}/read`, {
    method: 'PUT',
    auth: true
  })
}

// Marcar todas las notificaciones como leídas
export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  return api.apiFetch('/notifications/mark-all-read', {
    method: 'PUT',
    auth: true
  })
}

// Eliminar una notificación
export async function deleteNotification(notificationId: string): Promise<{ message: string }> {
  return api.apiFetch(`/notifications/${notificationId}`, {
    method: 'DELETE',
    auth: true
  })
}

export default {
  getAllNotifications,
  getUnreadNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
}
