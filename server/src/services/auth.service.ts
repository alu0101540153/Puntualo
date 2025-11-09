import { UserModel } from '../models'
import argon2 from 'argon2'

export const authService = {
  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email })
    if (!user) throw new Error('Usuario no encontrado')

    const validPassword = await argon2.verify(user.password, password)
    if (!validPassword) throw new Error('Contraseña incorrecta')

    // Devuelve el usuario sin el hash de la contraseña
    const { password: _, ...safeUser } = user.toObject()
    return safeUser
  }
}
