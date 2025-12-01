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
  ,
  // Devuelve top items global (avg score y count) opcionalmente filtrado por tipo
  getTop: async (type?: string, limit: number = 5) => {
    // pipeline sobre la colección de usuarios para agregar puntuaciones
    const pipeline: any[] = [
      { $unwind: { path: '$ratedItems', preserveNullAndEmptyArrays: false } },
      { $project: { itemId: '$ratedItems.itemId', score: '$ratedItems.score', itemType: '$ratedItems.itemType', lastModified: '$ratedItems.lastModified' } }
    ]
    if (type) {
      pipeline.push({ $match: { itemType: { $regex: new RegExp(type, 'i') } } })
    }
    pipeline.push(
      { $group: { _id: '$itemId', avgScore: { $avg: '$score' }, count: { $sum: 1 }, latest: { $max: '$lastModified' } } },
      { $sort: { avgScore: -1, count: -1 } },
      { $limit: limit },
      { $lookup: { from: 'items', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, itemId: '$_id', avgScore: 1, count: 1, latest: 1, item: 1 } }
    )

    const agg = await (UserModel as any).aggregate(pipeline)
    // normalize to { items: [{ ...item, avgScore, count }] }
    const items = (agg || []).map((row: any) => ({
      _id: row.item && row.item._id,
      title: row.item && (row.item.title || (row.item.data && row.item.data.title)),
      data: row.item && row.item.data,
      itemType: row.item && row.item.itemType,
      score: Number((row.avgScore || 0).toFixed(1)),
      votes: row.count || 0
    }))
    return { items }
  }
}
