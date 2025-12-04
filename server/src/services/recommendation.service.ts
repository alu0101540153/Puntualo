import { UserModel, ItemModel } from '../models'
import { itemService } from './item.service'
import mongoose from 'mongoose'

// In-memory cache for recommendations: maps userId -> { recommendedIds?|fallbackItems?, updatedAt }
const recCache: Map<string, { recommendedIds?: string[]; fallbackItems?: any[]; updatedAt: number }> = new Map()

// Recommendation service using @asymmetrik/akin if available, otherwise fallback
export const recommendationService = {
  // options: { page?: number, limit?: number }
  getRecommendationsForUser: async (userId: string, options: any = {}) => {
    const page = Math.max(1, Number(options.page || 1) || 1)
    const limit = Math.max(1, Number(options.limit || 20) || 20)
    const desiredLimit = page * limit
    const bypass = Boolean(options._bypassBackgroundCache)
    const cachedEntry = recCache.get(String(userId))
    const offset = Math.max(0, (page - 1) * limit)

    // Load target user's seen items (both ratedItems and items) to exclude them
    const targetUser = await UserModel.findById(userId).select('ratedItems items').lean()
    const seenSet = new Set<string>()
    let extraSeenFromUser: string[] = []
    if (targetUser) {
      const rated = (targetUser.ratedItems || []) as any[]
      for (const r of rated) if (r && r.itemId) seenSet.add(String(r.itemId))
      const owned = (targetUser.items || []) as any[]
      for (const it of owned) if (it && it.itemId) seenSet.add(String(it.itemId))
      extraSeenFromUser = []
      for (const it of owned) if (it && it.itemId) extraSeenFromUser.push(String(it.itemId))
    }

    if (!bypass && cachedEntry) {
      // Serve from cache: either recommendedIds or fallbackItems
      if (cachedEntry.recommendedIds && cachedEntry.recommendedIds.length > 0) {
        // filter out any ids the user already saw
        const filteredIds = cachedEntry.recommendedIds.filter(id => !seenSet.has(String(id)))
        const pageIds = filteredIds.slice(offset, offset + limit)
        const objectIds = pageIds.map(id => { try { return new mongoose.Types.ObjectId(id) } catch (e) { return id } })
        const items = await ItemModel.find({ _id: { $in: objectIds } }).lean()
        const itemsById: Record<string, any> = {}
        for (const it of items) itemsById[String(it._id)] = it
        const ordered = pageIds.map(id => itemsById[id]).filter(Boolean)
        const total = filteredIds.length
        return { items: ordered, total, page, limit, cached: true }
      }

      if (cachedEntry.fallbackItems && cachedEntry.fallbackItems.length > 0) {
        // filter fallback items by seen
        const filteredFallback = cachedEntry.fallbackItems.filter((it: any) => it && it._id && !seenSet.has(String(it._id)))
        const pageItems = filteredFallback.slice(offset, offset + limit)
        const total = filteredFallback.length
        return { items: pageItems, topBooks: [], total, page, limit, cached: true }
      }
    }

    // Load all users' ratings
    const users = await UserModel.find().select('ratedItems').lean()

    // Build a flat array of { userId, itemId, score }
    const ratings: Array<{ userId: string; itemId: string; score: number }> = []
    for (const u of users) {
      const uid = (u._id || u.id) ? String(u._id || u.id) : undefined
      if (!uid) continue
      const rated = (u.ratedItems || []) as any[]
      for (const r of rated) {
        if (!r || !r.itemId) continue
        const score = (typeof r.score !== 'undefined' && r.score !== null) ? Number(r.score) : null
        if (score === null || Number.isNaN(score)) continue
        ratings.push({ userId: uid, itemId: String(r.itemId), score })
      }
    }

    // Implement user-based collaborative filtering (Pearson similarity)
    // Build user -> (item -> score) map
    const userRatingsMap: Record<string, Record<string, number>> = {}
    for (const u of users) {
      const uid = (u._id || u.id) ? String(u._id || u.id) : undefined
      if (!uid) continue
      userRatingsMap[uid] = {}
      const rated = (u.ratedItems || []) as any[]
      for (const r of rated) {
        if (!r || !r.itemId) continue
        const score = (typeof r.score !== 'undefined' && r.score !== null) ? Number(r.score) : null
        if (score === null || Number.isNaN(score)) continue
        userRatingsMap[uid][String(r.itemId)] = score
      }
    }

    const targetRatings = userRatingsMap[String(userId)] || {}

    // similarity function: Pearson correlation over co-rated items
    function pearson(u: Record<string, number>, v: Record<string, number>): number {
      const common: string[] = []
      for (const k of Object.keys(u)) if (v.hasOwnProperty(k)) common.push(k)
      const n = common.length
      if (n === 0) return 0
      let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0
      for (const k of common) {
        const a = u[k]
        const b = v[k]
        sum1 += a
        sum2 += b
        sum1Sq += a * a
        sum2Sq += b * b
        pSum += a * b
      }
      const num = pSum - (sum1 * sum2 / n)
      const den = Math.sqrt((sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n))
      if (den === 0) return 0
      return num / den
    }

    // compute similarity between target and other users
    const similarities: Array<{ userId: string; sim: number }> = []
    for (const uid of Object.keys(userRatingsMap)) {
      if (uid === String(userId)) continue
      const sim = pearson(targetRatings, userRatingsMap[uid])
      if (!isFinite(sim) || Math.abs(sim) < 1e-9) continue
      similarities.push({ userId: uid, sim })
    }

    // sort neighbors by similarity desc
    similarities.sort((a, b) => b.sim - a.sim)

    // choose top K neighbors (configurable)
    const K = Number(options.neighbors || 30)
    const neighbors = similarities.slice(0, K)

    // aggregate candidate items from neighbors weighted by similarity
    const scores: Record<string, { weightedSum: number; weightSum: number }> = {}
    const targetItemSet = new Set(Object.keys(targetRatings))
    for (const id of extraSeenFromUser) targetItemSet.add(id)
    for (const nb of neighbors) {
      const nbRatings = userRatingsMap[nb.userId] || {}
      for (const itemId of Object.keys(nbRatings)) {
        if (targetItemSet.has(itemId)) continue // exclude items already rated by target
        if (!scores[itemId]) scores[itemId] = { weightedSum: 0, weightSum: 0 }
        scores[itemId].weightedSum += nb.sim * nbRatings[itemId]
        scores[itemId].weightSum += Math.abs(nb.sim)
      }
    }

    // compute final score per item
    const scoredItems = Object.keys(scores).map(id => {
      const rec = scores[id]
      const score = rec.weightSum > 0 ? rec.weightedSum / rec.weightSum : 0
      return { id, score }
    })

    // sort by score desc
    scoredItems.sort((a, b) => b.score - a.score)

    const recommendedItemIdsFull = scoredItems.map(s => s.id)

    // If user has too few rated items or collaborative recommendations are empty,
    // fallback to top-rated items across all types (fused). Default minRatings = 2
    const userRatedCount = Object.keys(targetRatings).length
    const MIN_RATINGS = Number(options.minRatings || 2)

    // Helper: pagination (moved earlier)

    if (userRatedCount < MIN_RATINGS || (recommendedItemIdsFull.length || 0) < 1) {
      // If user has too few ratings, use existing itemService.getTop()
      // itemService.getTop() returns fused items across types when no type is provided
      try {
        const top = await itemService.getTop(undefined, Math.max(desiredLimit, limit))
        const allTop = (top && top.items) ? top.items : []
        // filter out seen items before caching/returning
        const filteredTop = allTop.filter((it: any) => it && it._id && !seenSet.has(String(it._id)))
        // store filtered top list in cache
        recCache.set(String(userId), { fallbackItems: filteredTop, updatedAt: Date.now() })
        const total = filteredTop.length
        const pageItems = filteredTop.slice(offset, offset + limit)
        return { items: pageItems, topBooks: [], total, page, limit }
      } catch (e) {
        // fallback to original averaging logic if itemService fails
        const agg: Record<string, { sum: number; count: number }> = {}
        for (const r of ratings) {
          if (!r || !r.itemId) continue
          const id = String(r.itemId)
          if (!agg[id]) agg[id] = { sum: 0, count: 0 }
          agg[id].sum += Number(r.score || 0)
          agg[id].count += 1
        }

        const avgItems = Object.keys(agg).map(id => ({ id, avg: agg[id].sum / agg[id].count, count: agg[id].count }))
        avgItems.sort((a, b) => b.avg - a.avg)
        const targetItemSetLocal = new Set(Object.keys(targetRatings))
        const candidateIds = avgItems.map(a => a.id).filter(id => !targetItemSetLocal.has(id))
        const fetchCount = Math.max(desiredLimit * 3, limit + 10)
        const fetchSlice = candidateIds.slice(0, fetchCount)
        const fetchObjectIds = fetchSlice.map(id => { try { return new mongoose.Types.ObjectId(id) } catch (e) { return id } })
        const found = await ItemModel.find({ _id: { $in: fetchObjectIds } }).lean()
        const foundById: Record<string, any> = {}
        for (const it of found) foundById[String(it._id)] = it
        let orderedFallbackAll = fetchSlice.map(id => foundById[id]).filter(Boolean)
        // filter out any items the user already saw
        orderedFallbackAll = orderedFallbackAll.filter((it: any) => it && it._id && !seenSet.has(String(it._id)))
        // cache fallback items
        recCache.set(String(userId), { fallbackItems: orderedFallbackAll, updatedAt: Date.now() })
        const total = orderedFallbackAll.length
        const pageItems = orderedFallbackAll.slice(offset, offset + limit)
        return { items: pageItems, topBooks: [], total, page, limit }
      }
    }

    // If we reached here, we have a full ordered list of recommendations in recommendedItemIdsFull
    // Filter out seen items before pagination and caching
    const filteredRecommendedIds = recommendedItemIdsFull.filter(id => !seenSet.has(String(id)))
    const total = (filteredRecommendedIds && filteredRecommendedIds.length) ? filteredRecommendedIds.length : 0

    // Pagination slice
    const pageIds = (filteredRecommendedIds || []).slice(offset, offset + limit)

    // Load item documents for the page preserving order
    const objectIds = pageIds.map(id => {
      try { return new mongoose.Types.ObjectId(id) } catch (e) { return id }
    })

    const items = await ItemModel.find({ _id: { $in: objectIds } }).lean()
    const itemsById: Record<string, any> = {}
    for (const it of items) itemsById[String(it._id)] = it

    const ordered = pageIds.map(id => itemsById[id]).filter(Boolean)

    // cache full ordered ids for user so background refresh / subsequent requests can paginate
    recCache.set(String(userId), { recommendedIds: filteredRecommendedIds, updatedAt: Date.now() })

    return { items: ordered, total, page, limit }
  }
}

export default recommendationService

// Background refresher: recompute recommendations for all users every minute
const RECOMPUTE_INTERVAL_MS = 60 * 1000
async function refreshAllRecommendations() {
  try {
    const users = await UserModel.find().select('_id').lean()
    for (const u of users) {
      const uid = (u && (u._id || u.id)) ? String(u._id || u.id) : undefined
      if (!uid) continue
      try {
        // request recomputation bypassing cache so function recalculates and stores result
        await (recommendationService as any).getRecommendationsForUser(uid, { page: 1, limit: 50, _bypassBackgroundCache: true })
      } catch (e) {
        // ignore per-user errors
      }
    }
  } catch (e) {
    // ignore
  }
}

// Start periodic refresh
setInterval(() => { void refreshAllRecommendations() }, RECOMPUTE_INTERVAL_MS)
// Run an initial refresh in background
void refreshAllRecommendations()
