import { NotificationModel } from '../models'

export const notificationService = {
  // Obtener todas las notificaciones de un usuario
  getAll: async (userId: string, unreadOnly: boolean = false) => {
    const filter: any = { recipient: userId }
    
    if (unreadOnly) {
      filter.read = false
    }

    const notifications = await NotificationModel.find(filter)
      .populate('sender', 'name handle avatarBgColor')
      .sort({ createdAt: -1 })
      .lean()

    // Convertir relatedId a string si existe
    return notifications.map((notif: any) => ({
      ...notif,
      relatedId: notif.relatedId ? notif.relatedId.toString() : undefined
    }))
  },

  // Obtener notificaciones no leídas
  getUnread: async (userId: string) => {
    return await notificationService.getAll(userId, true)
  },

  // Contar notificaciones no leídas
  countUnread: async (userId: string) => {
    return await NotificationModel.countDocuments({
      recipient: userId,
      read: false
    })
  },

  // Marcar una notificación como leída
  markAsRead: async (notificationId: string, userId: string) => {
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      recipient: userId
    })

    if (!notification) {
      throw new Error('Notificación no encontrada')
    }

    notification.read = true
    await notification.save()

    return notification
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (userId: string) => {
    await NotificationModel.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    )

    return { message: 'Todas las notificaciones marcadas como leídas' }
  },

  // Eliminar una notificación
  delete: async (notificationId: string, userId: string) => {
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      recipient: userId
    })

    if (!notification) {
      throw new Error('Notificación no encontrada')
    }

    await NotificationModel.findByIdAndDelete(notificationId)

    return { message: 'Notificación eliminada' }
  },

  // Crear una notificación (uso interno)
  create: async (data: {
    recipient: string
    sender?: string
    type: 'follow_request' | 'follow_accepted' | 'follow_rejected'
    message: string
    relatedId?: string
  }) => {
    return await NotificationModel.create(data)
  }
}
