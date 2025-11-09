import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { userService } from '../services'

export const authController = {
  // Login existente
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      const user = await authService.login(email, password)
      res.json(user)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  // Nuevo: register -> crea un usuario usando userService.create
  register: async (req: Request, res: Response) => {
    try {
      const data = await userService.create(req.body)
      // No devolvemos el hash de la contraseña (userService lo guarda hasheada)
      const obj = data.toObject ? data.toObject() : data
      if (obj.password) delete obj.password
      res.status(201).json(obj)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
}
