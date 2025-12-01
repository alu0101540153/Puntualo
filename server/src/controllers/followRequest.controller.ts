import { Response, Request } from 'express'
import { followRequestService } from '../services'

export const followRequestController = {
  // Crear una solicitud de seguimiento o seguir directamente si es público
  create: async (req: Request, res: Response) => {
    try {
      const { targetId } = req.body
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      if (!targetId) {
        return res.status(400).json({ message: 'El ID del usuario destino es requerido' })
      }

      const result = await followRequestService.create(me.id, targetId)
      return res.json(result)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Aceptar una solicitud de seguimiento
  accept: async (req: Request, res: Response) => {
    try {
      const { id } = req.params // ID de la solicitud
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const result = await followRequestService.accept(id, me.id)
      return res.json(result)
    } catch (error: any) {
      console.error('Error en accept:', error)
      res.status(400).json({ message: error.message })
    }
  },

  // Rechazar una solicitud de seguimiento
  reject: async (req: Request, res: Response) => {
    try {
      const { id } = req.params // ID de la solicitud
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const result = await followRequestService.reject(id, me.id)
      return res.json(result)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Cancelar una solicitud enviada
  cancel: async (req: Request, res: Response) => {
    try {
      const { id } = req.params // ID de la solicitud
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const result = await followRequestService.cancel(id, me.id)
      return res.json(result)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Obtener solicitudes pendientes recibidas
  getPendingRequests: async (req: Request, res: Response) => {
    try {
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const requests = await followRequestService.getPendingRequests(me.id)
      return res.json(requests)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Obtener solicitudes enviadas
  getSentRequests: async (req: Request, res: Response) => {
    try {
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const requests = await followRequestService.getSentRequests(me.id)
      return res.json(requests)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Verificar si existe una solicitud pendiente
  checkPendingRequest: async (req: Request, res: Response) => {
    try {
      const { targetId } = req.params
      const me = (req as any).user
      
      if (!me || !me.id) {
        return res.status(401).json({ message: 'No autenticado' })
      }

      const hasPending = await followRequestService.checkPendingRequest(me.id, targetId)
      return res.json({ hasPending })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
}
