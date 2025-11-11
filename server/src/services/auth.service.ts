import { UserModel } from '../models'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config'

export const authService = {
  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email })
    if (!user) throw new Error('Usuario no encontrado')

    const validPassword = await argon2.verify(user.password, password)
    if (!validPassword) throw new Error('Contraseña incorrecta')

    // Devuelve el usuario sin el hash de la contraseña
    const { password: _, ...safeUser } = user.toObject()

    // Generar token JWT
    const payload = { id: user._id.toString(), email: user.email }
  const token = jwt.sign(payload as any, JWT_SECRET as unknown as string, { expiresIn: JWT_EXPIRES_IN as unknown as string } as any)

    return { user: safeUser, token }
  },

  // Utilidad para generar token a partir de un usuario (doc o plain object)
  generateToken(user: any) {
    const id = user._id ? user._id.toString() : user.id || user._id
    const email = user.email
    const payload = { id, email }
  return jwt.sign(payload as any, JWT_SECRET as unknown as string, { expiresIn: JWT_EXPIRES_IN as unknown as string } as any)
  }
}
