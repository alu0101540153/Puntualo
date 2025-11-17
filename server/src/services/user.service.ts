import { UserModel } from '../models'
import argon2 from 'argon2'

export const userService = {
  getAll: async () => {
    return await UserModel.find()
  },

  create: async (entity: any) => {
    // 🔒 Hasheamos la contraseña antes de guardar
    if (entity.password) {
      entity.password = await argon2.hash(entity.password)
    }
    return await UserModel.create(entity)
  },

  update: async (id: string, body: any) => {
    // Si hay contraseña nueva, también la hasheamos
    if (body.password) {
      body.password = await argon2.hash(body.password)
    }
    return await UserModel.findByIdAndUpdate(id, body, { new: true, runValidators: true })
  },

  delete: async (id: string) => {
    return await UserModel.findByIdAndDelete(id)
  },
  
  addRating: async (userId: string, rating: any) => {
    // rating: { itemId, itemType, score, comment?, status? }
    return await UserModel.findByIdAndUpdate(userId, { $push: { ratedItems: rating } }, { new: true })
  }
  ,
  getRatings: async (userId: string) => {
    // Devuelve los ratedItems del usuario con el item poblado
    const user = await UserModel.findById(userId).populate('ratedItems.itemId').lean()
    if (!user) return []
    return (user.ratedItems || [])
  }
}
