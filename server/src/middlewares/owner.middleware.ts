import { Request, Response, NextFunction } from 'express'

// Middleware para comprobar que el usuario autenticado es el propietario
export const checkOwnership = (req: Request, res: Response, next: NextFunction) => {
  const authUser = (req as any).user
  const targetId = req.params.id || req.body.id

  if (!authUser) {
    return res.status(401).json({ message: 'No autenticado' })
  }

  // Si no hay id objetivo en params/body, no podemos comprobar ownership -> 400
  if (!targetId) {
    return res.status(400).json({ message: 'Missing target id to check ownership' })
  }

  if (authUser.id !== String(targetId)) {
    return res.status(403).json({ message: 'Forbidden: no eres el propietario' })
  }

  return next()
}
