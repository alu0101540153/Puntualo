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

// --- Top-rated cache & endpoint ---

// in-memory cache for top-rated items
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
let topRatedCache: { data: any | null; lastUpdated: number } = { data: null, lastUpdated: 0 }

async function computeTopRated() {
  // Aggregate ratings from users, compute avg per item, join item data and facet by type
  const pipeline: any[] = [
    { $unwind: '$ratedItems' },
    { $group: { _id: '$ratedItems.itemId', avgScore: { $avg: '$ratedItems.score' }, count: { $sum: 1 } } },
    { $lookup: { from: 'items', localField: '_id', foreignField: '_id', as: 'item' } },
    { $unwind: '$item' },
    { $project: {
      itemId: '$_id',
      avgScore: 1,
      count: 1,
      // include the full item document so the endpoint can return all item fields
      item: '$item'
    } },
    { $facet: {
      // Order by number of reviews (count) first, use avgScore as tiebreaker
      movies: [ { $match: { 'item.itemType': ItemType.MOVIE } }, { $sort: { count: -1, avgScore: -1 } }, { $limit: 10 } ],
      series: [ { $match: { 'item.itemType': ItemType.SERIES } }, { $sort: { count: -1, avgScore: -1 } }, { $limit: 10 } ],
      books: [ { $match: { 'item.itemType': ItemType.BOOK } }, { $sort: { count: -1, avgScore: -1 } }, { $limit: 10 } ]
    } }
  ]

  const result = await UserModel.aggregate(pipeline)
  // aggregation returns an array with single object containing facets
  return (result && result[0]) ? result[0] : { movies: [], series: [], books: [] }
}

async function refreshTopRated() {
  try {
    const data = await computeTopRated()
    topRatedCache = { data, lastUpdated: Date.now() }
  } catch (e: any) {
    // avoid throwing during scheduled refresh
    // eslint-disable-next-line no-console
    console.error('Error refreshing top-rated cache', e?.message || e)
  }
}

// schedule periodic refresh
refreshTopRated()
setInterval(refreshTopRated, CACHE_TTL)

export const getTopRated = async (_req: Request, res: Response) => {
  try {
    // if cache is empty or expired, compute now (but we also have scheduled refresh)
    const now = Date.now()
    if (!topRatedCache.data || (now - topRatedCache.lastUpdated) > CACHE_TTL) {
      await refreshTopRated()
    }

    return res.json({ source: 'cache', checkedAt: new Date().toISOString(), data: topRatedCache.data })
  } catch (e: any) {
    return res.status(500).json({ message: e.message || 'Error computing top rated' })
  }
}

// --- Combined cached payload: all users, all reviews, and top-rated lists ---

let combinedCache: { data: any | null; lastUpdated: number } = { data: null, lastUpdated: 0 }

async function computeAllReviews() {
  // Produce flattened reviews with user info and populated item
  const pipeline: any[] = [
    { $project: { name: 1, handle: 1, avatarBgColor: 1, ratedItems: 1 } },
    { $unwind: '$ratedItems' },
    { $replaceRoot: { newRoot: { $mergeObjects: [ '$ratedItems', { user: { _id: '$_id', name: '$name', handle: '$handle', avatarBgColor: '$avatarBgColor' } } ] } } },
    { $lookup: { from: 'items', localField: 'itemId', foreignField: '_id', as: 'item' } },
    { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
    { $sort: { lastModified: -1 } }
  ]

  const result = await (UserModel as any).aggregate(pipeline)
  return result || []
}

async function computeCombined() {
  // parallel: total users, total ratings, top-rated lists
  const ratingsPipeline: any[] = [
    { $project: { ratedCount: { $size: { $ifNull: ['$ratedItems', []] } } } },
    { $group: { _id: null, total: { $sum: '$ratedCount' } } }
  ]

  const [totalUsers, ratingsAgg, top] = await Promise.all([
    UserModel.countDocuments(),
    (UserModel as any).aggregate(ratingsPipeline),
    computeTopRated()
  ])

  const totalRatings = (ratingsAgg && ratingsAgg[0] && ratingsAgg[0].total) ? ratingsAgg[0].total : 0

  return { totalUsers, totalRatings, top }
}

async function refreshCombined() {
  try {
    const data = await computeCombined()
    combinedCache = { data, lastUpdated: Date.now() }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Error refreshing combined stats cache', e?.message || e)
  }
}

// schedule periodic refresh for combined cache as well
refreshCombined()
setInterval(refreshCombined, CACHE_TTL)

export const getCombinedStats = async (_req: Request, res: Response) => {
  try {
    const now = Date.now()
    if (!combinedCache.data || (now - combinedCache.lastUpdated) > CACHE_TTL) {
      await refreshCombined()
    }

    return res.json({ source: 'cache', checkedAt: new Date().toISOString(), data: combinedCache.data })
  } catch (e: any) {
    return res.status(500).json({ message: e.message || 'Error computing combined stats' })
  }
}
