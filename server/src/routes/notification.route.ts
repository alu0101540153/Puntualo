import { Router } from 'express'
import { notificationController } from '../controllers'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// Obtener todas las notificaciones (puede filtrar por ?unreadOnly=true)
router.get('/', notificationController.getAll)

// Obtener solo notificaciones no leídas
router.get('/unread', notificationController.getUnread)

// Contar notificaciones no leídas
router.get('/count', notificationController.countUnread)

// Marcar todas como leídas
router.put('/mark-all-read', notificationController.markAllAsRead)

// Marcar una notificación como leída
router.put('/:id/read', notificationController.markAsRead)

// Eliminar una notificación
router.delete('/:id', notificationController.delete)

export default router
