import { Router } from 'express'
import { followRequestController } from '../controllers'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// Crear solicitud de seguimiento (o seguir directamente si es público)
router.post('/', followRequestController.create)

// Obtener solicitudes pendientes recibidas
router.get('/pending', followRequestController.getPendingRequests)

// Obtener solicitudes enviadas
router.get('/sent', followRequestController.getSentRequests)

// Verificar si existe una solicitud pendiente
router.get('/check/:targetId', followRequestController.checkPendingRequest)

// Aceptar una solicitud
router.put('/:id/accept', followRequestController.accept)

// Rechazar una solicitud
router.put('/:id/reject', followRequestController.reject)

// Cancelar una solicitud enviada
router.delete('/:id', followRequestController.cancel)

export default router
