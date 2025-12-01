import { Response, Request } from 'express'
import { notificationService } from '../services'

export const notificationController = {
  // Obtener todas las notificaciones del usuario autenticado
  getAll: async (req: Request, res: Response) => {
    try {
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const unreadOnly = req.query.unreadOnly === 'true'
      const notifications = await notificationService.getAll(me.id, unreadOnly)
      return res.json(notifications)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Obtener notificaciones no leídas
  getUnread: async (req: Request, res: Response) => {
    try {
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const notifications = await notificationService.getUnread(me.id)
      return res.json(notifications)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Contar notificaciones no leídas
  countUnread: async (req: Request, res: Response) => {
    try {
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const count = await notificationService.countUnread(me.id)
      return res.json({ count })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Marcar una notificación como leída
  markAsRead: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const notification = await notificationService.markAsRead(id, me.id)
      return res.json(notification)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (req: Request, res: Response) => {
    try {
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const result = await notificationService.markAllAsRead(me.id)
      return res.json(result)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Eliminar una notificación
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const result = await notificationService.delete(id, me.id)
      return res.json(result)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
}
