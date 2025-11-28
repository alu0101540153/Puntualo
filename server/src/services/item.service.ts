import { ItemModel } from '../models'
import { ItemType } from '../models/enums'
import { UserModel } from '../models'
import mongoose from 'mongoose'

export const itemService = {
  getAll: async()=>{
    return await ItemModel.find();
  },


  findByExternalId: async (externalId: string, itemType?: ItemType | string) => {
    const query: any = { externalId };
    if (itemType) {
      query.itemType = itemType;
    }
    return await ItemModel.findOne(query);
  },

  create: async(entity: object)=>{
    return await ItemModel.create(entity);
  },

  update: async(id:string, body:object)=>{
    return await ItemModel.findByIdAndUpdate(id, body);
  },
  
  getById: async(id:string)=>{
    return await ItemModel.findById(id);
  },
  delete: async(id:string)=>{
    return await ItemModel.findByIdAndDelete(id);
  }
  ,
  // Devuelve las puntuaciones que los usuarios que sigue `userId` le han puesto al item `itemId`
  getFriendsRatingsForItem: async (userId: string, itemId: string) => {
    // Obtener el documento del usuario para leer follows
    const user = await UserModel.findById(userId).lean()
    if (!user) return []

    const rawFollows = (user.follows || []) as any[]
    const followsAsStrings = rawFollows
      .map((f: any) => {
        if (!f) return null
        if (typeof f === 'string') return f
        if (typeof f === 'object' && (f._id || f.id)) return String(f._id || f.id)
        return String(f)
      })
      .filter((v): v is string => Boolean(v))

    const followObjectIds = followsAsStrings
      .map((id: string) => {
        try { return new mongoose.Types.ObjectId(id) } catch (e) { return null }
      })
      .filter((v): v is mongoose.Types.ObjectId => Boolean(v))

    if (followObjectIds.length === 0) return []

    // Aggregation: seleccionar usuarios seguidos, unwind ratedItems, filtrar por itemId
    const pipeline: any[] = [
      { $match: { _id: { $in: followObjectIds } } },
      { $project: { name: 1, handle: 1, avatarBgColor: 1, ratedItems: 1 } },
      { $unwind: '$ratedItems' },
      { $replaceRoot: { newRoot: { $mergeObjects: [ '$ratedItems', { user: { _id: '$_id', name: '$name', handle: '$handle', avatarBgColor: '$avatarBgColor' } } ] } } },
      { $match: { itemId: (function(){ try { return new mongoose.Types.ObjectId(itemId) } catch(e){ return itemId } })() } },
      { $sort: { lastModified: -1 } }
    ]

    const result = await (UserModel as any).aggregate(pipeline)
    return result || []
  }
}
