import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { userService, sendRegisterEmail } from '../services'

export const authController = {
  // Login existente
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      // result: { user, token }
      res.json(result)
    } catch (error: any) {
      // Map known auth errors to 401
      const msg = error?.message || 'Login error'
      if (msg.toLowerCase().includes('no encontrado') || msg.toLowerCase().includes('contrase')) {
        return res.status(401).json({ message: msg })
      }
      res.status(400).json({ message: msg })
    }
  },

  // Nuevo: register -> crea un usuario usando userService.create
  register: async (req: Request, res: Response) => {
    try {
      const data = await userService.create(req.body)
      // No devolvemos el hash de la contraseña (userService lo guarda hasheada)
      const obj = data.toObject ? data.toObject() : data
      if (obj.password) delete obj.password
      // Generar token para el usuario recién creado
      const token = authService.generateToken(data)
      res.status(201).json({ user: obj, token })

      // Envío de email de bienvenida en background (no bloquea la respuesta)
      if (obj && obj.email) {
        const displayName = (obj as any).name || (obj as any).handle || (obj as any).username || '';
        void sendRegisterEmail(obj.email, displayName);
      }
    } catch (error: any) {
      // Handle mongoose duplicate key errors
      const msg = error?.message || 'Registration error'
      if (error && error.code === 11000) {
        // parse which field
        const field = Object.keys(error.keyValue || {})[0]
        let message = `${field} already exists`
        // Provide friendly Spanish messages for common duplicated fields
        if (field === 'email') message = 'Ya existe un usuario registrado con ese correo electrónico.'
        else if (field === 'handle' || field === 'username') message = 'El nombre de usuario ya está en uso.'
        else if (field === 'name') message = 'El nombre ya está en uso.'
        return res.status(409).json({ message, field })
      }
      return res.status(400).json({ message: msg })
    }
  }
}
