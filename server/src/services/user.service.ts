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
    // If the user already has a rating for the same itemId, update that subdocument instead of pushing a duplicate.
    try {
      const itemId = rating.itemId
      if (!itemId) {
        // If there's no itemId, fallback to pushing (legacy behavior)
        rating.lastModified = new Date()
        return await UserModel.findByIdAndUpdate(userId, { $push: { ratedItems: rating } }, { new: true })
      }

      // Try to update existing subdocument matching itemId
      const updated = await UserModel.findOneAndUpdate(
        { _id: userId, 'ratedItems.itemId': itemId },
        { $set: {
            'ratedItems.$.score': rating.score,
            'ratedItems.$.comment': rating.comment || '',
            'ratedItems.$.status': rating.status || 'watching',
            'ratedItems.$.itemType': rating.itemType || 'book',
            'ratedItems.$.lastModified': new Date()
          }
        },
        { new: true }
      )

      if (updated) return updated

      // not found -> push as new
      rating.lastModified = new Date()
      return await UserModel.findByIdAndUpdate(userId, { $push: { ratedItems: rating } }, { new: true })
    } catch (err) {
      // fallback to original behavior on error
      rating.lastModified = new Date()
      return await UserModel.findByIdAndUpdate(userId, { $push: { ratedItems: rating } }, { new: true })
    }
  }
  ,
  getRatings: async (userId: string, order: string = 'desc') => {
    // Devuelve los ratedItems del usuario con el item poblado
    // order: 'desc' => más reciente primero, 'asc' => más antiguo primero
    const user = await UserModel.findById(userId).populate('ratedItems.itemId').lean()
    if (!user) return []
    const items = (user.ratedItems || []) as any[]

    // Normalize order and sort by lastModified (fallback to createdAt/_id if needed)
    const dir = order === 'asc' ? 1 : -1
    items.sort((a: any, b: any) => {
      const ta = a && a.lastModified ? new Date(a.lastModified).getTime() : 0
      const tb = b && b.lastModified ? new Date(b.lastModified).getTime() : 0
      // If both timestamps are zero, keep original order
      return dir * (ta - tb)
    })

    return items
  }
  ,
  removeRating: async (userId: string, ratingId: string) => {
    // Remove a ratedItems subdocument by its _id
    const updated = await UserModel.findByIdAndUpdate(userId, { $pull: { ratedItems: { _id: ratingId } } }, { new: true })
    return updated
  }
  ,
  deleteRating: async (userId: string, ratingId: string) => {
    // Elimina un ratedItem por su _id dentro del array
    return await UserModel.findByIdAndUpdate(userId, { $pull: { ratedItems: { _id: ratingId } } }, { new: true })
  }
}
