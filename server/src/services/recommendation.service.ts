import { UserModel, ItemModel } from '../models'
import mongoose from 'mongoose'

// Recommendation service using @asymmetrik/akin if available, otherwise fallback
export const recommendationService = {
  // options: { page?: number, limit?: number }
  getRecommendationsForUser: async (userId: string, options: any = {}) => {
    const page = Math.max(1, Number(options.page || 1) || 1)
    const limit = Math.max(1, Number(options.limit || 20) || 20)
    const desiredLimit = page * limit

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
    // If we reached here, we have a full ordered list of recommendations in recommendedItemIdsFull
    const total = (recommendedItemIdsFull && recommendedItemIdsFull.length) ? recommendedItemIdsFull.length : 0

    // Pagination slice
    const offset = Math.max(0, (page - 1) * limit)
    const pageIds = (recommendedItemIdsFull || []).slice(offset, offset + limit)

    // Load item documents for the page preserving order
    const objectIds = pageIds.map(id => {
      try { return new mongoose.Types.ObjectId(id) } catch (e) { return id }
    })

    const items = await ItemModel.find({ _id: { $in: objectIds } }).lean()
    const itemsById: Record<string, any> = {}
    for (const it of items) itemsById[String(it._id)] = it

    const ordered = pageIds.map(id => itemsById[id]).filter(Boolean)

    return { items: ordered, total, page, limit }
  }
}

export default recommendationService
