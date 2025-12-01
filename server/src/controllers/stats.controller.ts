import { Request, Response } from 'express'
import { UserModel, ItemModel } from '../models'
import { ItemType } from '../models/enums'

export const statsController = {
  // Devuelve conteos agregados: users, reviews, y conteos por tipo (películas/series/libros)
  getStats: async (_req: Request, res: Response) => {
    try {
      const users = await UserModel.countDocuments()

      const agg: any = await UserModel.aggregate([
        { $project: { ratedCount: { $size: { $ifNull: ['$ratedItems', []] } } } },
        { $group: { _id: null, total: { $sum: '$ratedCount' } } }
      ])

      const reviews = (agg && agg[0] && agg[0].total) ? agg[0].total : 0

      // Count items by type using the canonical `itemType` field and fallback to data.type
      const movies = await ItemModel.countDocuments({ $or: [ { itemType: ItemType.MOVIE }, { 'data.type': 'movie' } ] })
      const series = await ItemModel.countDocuments({ $or: [ { itemType: ItemType.SERIES }, { 'data.type': 'series' } ] })
      const books = await ItemModel.countDocuments({ $or: [ { itemType: ItemType.BOOK }, { 'data.type': 'book' } ] })

      // indicate the stats were computed from the database and include a timestamp
      return res.json({ users, reviews, movies, series, books, source: 'db', checkedAt: new Date().toISOString() })
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Error computing stats' })
    }
  }
}

export default statsController
