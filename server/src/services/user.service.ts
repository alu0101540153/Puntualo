import { UserModel } from '../models'
import argon2 from 'argon2'
import mongoose from 'mongoose'

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
    // Si quieren cambiar la contraseña con verificación
    if (body.currentPassword && body.newPassword) {
      await userService.changePassword(id, body.currentPassword, body.newPassword)
      // Eliminar estos campos del body para que no se procesen más
      delete body.currentPassword
      delete body.newPassword
    }

    // Si nos envían un nuevo handle (username), comprobar unicidad antes de actualizar
    if (body.handle) {
      const normalizedHandle = String(body.handle).toLowerCase().trim()
      const exists = await UserModel.findOne({ handle: normalizedHandle, _id: { $ne: id } })
      if (exists) {
        const err: any = new Error('Handle ya en uso por otro usuario')
        err.name = 'ConflictError'
        err.field = 'handle'
        throw err
      }
      // normalizamos el handle para que coincida con el esquema (lowercase, trim)
      body.handle = normalizedHandle
    }

    // Si hay contraseña nueva sin verificación (esto es para mantener compatibilidad),
    // también la hasheamos
    if (body.password) {
      body.password = await argon2.hash(body.password)
    }

    return await UserModel.findByIdAndUpdate(id, body, { new: true, runValidators: true })
  },

  delete: async (id: string) => {
    return await UserModel.findByIdAndDelete(id)
  },

  // Nueva lógica de seguimiento separada
  followUser: async (followerId: string, targetId: string) => {
    if (followerId === targetId) return await UserModel.findById(followerId)
    
    // Añadir targetId a following del follower
    await UserModel.findByIdAndUpdate(
      followerId,
      { $addToSet: { following: targetId } },
      { new: true }
    )
    
    // Añadir followerId a followers del target
    return await UserModel.findByIdAndUpdate(
      targetId,
      { $addToSet: { followers: followerId } },
      { new: true }
    )
  },

  unfollowUser: async (followerId: string, targetId: string) => {
    // Remover targetId de following del follower
    await UserModel.findByIdAndUpdate(
      followerId,
      { $pull: { following: targetId } },
      { new: true }
    )
    
    // Remover followerId de followers del target
    return await UserModel.findByIdAndUpdate(
      targetId,
      { $pull: { followers: followerId } },
      { new: true }
    )
  },

  // Obtener seguidores de un usuario
  getFollowers: async (userId: string) => {
    const user = await UserModel.findById(userId)
      .populate('followers', 'name handle avatarBgColor')
      .lean()
    if (!user) return []
    return (user.followers || []) as any[]
  },

  // Obtener usuarios seguidos por un usuario
  getFollowing: async (userId: string) => {
    const user = await UserModel.findById(userId)
      .populate('following', 'name handle avatarBgColor')
      .lean()
    if (!user) return []
    return (user.following || []) as any[]
  },

  // Mantener getFollows por compatibilidad (devuelve following)
  getFollows: async (id: string) => {
    return await userService.getFollowing(id)
  },

  // Cambiar contraseña verificando la actual
  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await UserModel.findById(userId)
    if (!user) {
      const err: any = new Error('Usuario no encontrado')
      err.name = 'NotFoundError'
      throw err
    }

    // Verificar contraseña actual
    const isValid = await argon2.verify(user.password, currentPassword)
    if (!isValid) {
      const err: any = new Error('La contraseña actual no es correcta')
      err.name = 'UnauthorizedError'
      throw err
    }

    // Hashear y actualizar nueva contraseña
    user.password = await argon2.hash(newPassword)
    await user.save()
    
    return user
  },

  addItemToUser: async (userId: string, item: any) => {
    // item: { itemId?, externalId?, itemType?, title? }
    const doc = {
      itemId: item.itemId || null,
      externalId: item.externalId || null,
      itemType: item.itemType || null,
      title: item.title || '',
      addedAt: new Date()
    }
    return await UserModel.findByIdAndUpdate(userId, { $push: { items: doc } }, { new: true })
  },

  removeItemFromUser: async (userId: string, itemSubId: string) => {
    // itemSubId is the _id of the subdocument in user.items
    return await UserModel.findByIdAndUpdate(userId, { $pull: { items: { _id: itemSubId } } }, { new: true })
  },
  getById: async (id: string) => {
    // Populate related item documents so public profile views have titles/covers available.
    // Populate both ratedItems.itemId and items.itemId (if present).
    return await UserModel.findById(id)
      .select('-password')
      .populate('ratedItems.itemId')
      .populate('items.itemId')
      .lean()
  },

  getFeed: async (userId: string, page: number = 1, limit: number = 20) => {
    // Obtiene el feed para un usuario: todas las puntuaciones realizadas por los usuarios
    // que el usuario sigue (following). Devuelve items ordenados por fecha descendente
    // y paginados, incluyendo datos básicos del usuario que puntuó y el item poblado.
    const user = await UserModel.findById(userId).lean()
    if (!user) return { items: [], total: 0, page, limit }

    // Normalizar los IDs de los seguidos en forma segura (string/ObjectId/populado)
    const rawFollowing = (user.following || []) as any[]
    const followingAsStrings = rawFollowing
      .map((f: any) => {
        if (!f) return null
        if (typeof f === 'string') return f
        if (typeof f === 'object' && (f._id || f.id)) return String(f._id || f.id)
        return String(f)
      })
      .filter((v): v is string => Boolean(v))

    // Convertir a ObjectId sólo los que sean válidos; ignorar valores inválidos
    const followObjectIds = followingAsStrings
      .map((id: string) => {
        try {
          return new mongoose.Types.ObjectId(id)
        } catch (e) {
          return null
        }
      })
      .filter((v): v is mongoose.Types.ObjectId => Boolean(v))

    if (followObjectIds.length === 0) return { items: [], total: 0, page, limit }

    const skip = Math.max(0, page - 1) * limit

    // Aggregation: seleccionar usuarios seguidos, unwind ratedItems, añadir datos del usuario,
    // hacer lookup al Item para poblar información, ordenar por lastModified y paginar.
    const pipeline: any[] = [
      { $match: { _id: { $in: followObjectIds } } },
      { $project: { name: 1, handle: 1, avatarBgColor: 1, ratedItems: 1 } },
      { $unwind: '$ratedItems' },
      { $replaceRoot: { newRoot: { $mergeObjects: [ '$ratedItems', { user: { _id: '$_id', name: '$name', handle: '$handle', avatarBgColor: '$avatarBgColor' } } ] } } },
      { $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
      } },
      { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
      { $sort: { lastModified: -1 } },
      { $facet: {
          metadata: [ { $count: 'total' } ],
          data: [ { $skip: skip }, { $limit: limit } ]
      } }
    ]

    // Ejecutar aggregation directamente en la colección
    const result = await (UserModel as any).aggregate(pipeline)

    const total = (result && result[0] && result[0].metadata && result[0].metadata[0]) ? result[0].metadata[0].total : 0
    const items = (result && result[0] && result[0].data) ? result[0].data : []

    return { items, total, page, limit }
  }
  ,
  addRating: async (userId: string, rating: any) => {
    // rating: { itemId, itemType, score, comment?, status? }
    try {
      // Only normalize score when it's provided and non-empty
      if (typeof rating.score !== 'undefined' && rating.score !== null && String(rating.score).trim() !== '') {
        const s = Number(rating.score)
        if (!isNaN(s)) {
          let normalized = Math.round(s * 10) / 10
          if (normalized < 0) normalized = 0
          if (normalized > 10) normalized = 10
          rating.score = normalized
        } else {
          // invalid numeric value: remove the score so it won't be stored as 0
          delete rating.score
        }
      } else {
        // no score provided: ensure it's not present
        if (rating.hasOwnProperty('score')) delete rating.score
      }
    } catch (e) {
      if (rating.hasOwnProperty('score')) delete rating.score
    }
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
  getRatings: async (userId: string, sortBy: string = 'date', order: string = 'desc') => {
    // Devuelve los ratedItems del usuario con el item poblado
    // sortBy: 'date'|'score'. order: 'desc'|'asc'
    const user = await UserModel.findById(userId).populate('ratedItems.itemId').lean()
    if (!user) return []
    const items = (user.ratedItems || []) as any[]

    // Determine sort direction
    const dir = order === 'asc' ? 1 : -1

    if (sortBy === 'score') {
      // Sort by numeric score
      items.sort((a: any, b: any) => {
        const sa = (a && a.score != null) ? Number(a.score) : 0
        const sb = (b && b.score != null) ? Number(b.score) : 0
        return dir * (sa - sb)
      })
    } else {
      // Default: sort by lastModified date (fallback to 0)
      items.sort((a: any, b: any) => {
        const ta = a && a.lastModified ? new Date(a.lastModified).getTime() : 0
        const tb = b && b.lastModified ? new Date(b.lastModified).getTime() : 0
        return dir * (ta - tb)
      })
    }

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
