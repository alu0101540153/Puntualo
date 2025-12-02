import api from './api'

export async function getUserCount() {
  const tries = ['/stats', '/stats/site', '/users/count', '/admin/stats']
  const result: any = {}
  for (const t of tries) {
    try {
      const res: any = await api.apiFetch(t)
      // try endpoint
      if (!res) continue
      if (res.source) result.source = res.source
      if (res.checkedAt) result.checkedAt = res.checkedAt
      // if the server explicitly signals the stats are computed from DB, include that
      if (res.source === 'db' || res.checkedAt) {
        if (typeof res.users === 'number') result.users = res.users
        if (typeof res.reviews === 'number') result.reviews = res.reviews
        if (res.source) result.source = res.source
        if (res.checkedAt) result.checkedAt = res.checkedAt
        if (typeof res.movies === 'number') result.movies = res.movies
        if (typeof res.series === 'number') result.series = res.series
        if (typeof res.books === 'number') result.books = res.books
        // attach meta so caller can check the verification
        result._verified = true
        result._checkedAt = res.checkedAt || null
        return result
      }
      // try common shapes
      if (typeof res.count === 'number') return res.count
      if (typeof res.users === 'number') return res.users
      if (typeof res.totalUsers === 'number') return res.totalUsers
    } catch (e) {
      // ignore and continue to next try
    }
  }
  return 0
}

export async function getRecentReviews(limit = 6) {
  const tries = ['/reviews/recent', `/reviews?limit=${limit}`, `/ratings/recent?limit=${limit}`, `/ratings?limit=${limit}`]
  for (const t of tries) {
    try {
      const res: any = await api.apiFetch(t)
      if (!res) continue
      if (Array.isArray(res)) return res.slice(0, limit)
      if (Array.isArray(res.items)) return res.items.slice(0, limit)
    } catch (e) {
      // ignore and try next endpoint
    }
  }
  return []
}

export async function getCounts() {
  // Return total users, total reviews and counts by type (best-effort)
  const result: any = { users: 0, reviews: 0, movies: 0, series: 0, books: 0 }
  // include the new aggregated endpoint if available
  const tries = ['/stats/all', '/stats', '/stats/site', '/admin/stats', '/counts', '/site/stats']
  for (const t of tries) {
    try {
      console.log(`🔍 Trying endpoint: ${t}`)
      const res: any = await api.apiFetch(t)
      console.log(`✅ Response from ${t}:`, res)
      if (!res) continue
      // New endpoint shape may be { source, checkedAt, data: { totalUsers, totalRatings, top: {...} } }
      if (res.data) {
        console.log('📦 res.data found:', res.data)
        if (typeof res.data.totalUsers === 'number') {
          result.users = res.data.totalUsers
          console.log('👥 Set users to:', result.users)
        }
        if (typeof res.data.totalRatings === 'number') {
          result.reviews = res.data.totalRatings
          console.log('⭐ Set reviews to:', result.reviews)
        }
        // preserve raw top lists if present so UI can reuse without extra requests
        if (res.data.top) result.top = res.data.top
        // also accept legacy names
        if (typeof res.data.totalReviews === 'number' && !result.reviews) result.reviews = res.data.totalReviews
        if (typeof res.data.total === 'number' && !result.reviews) result.reviews = res.data.total
      }
      if (typeof res.users === 'number') result.users = res.users
      if (typeof res.count === 'number') {
        // ambiguous 'count' field
        if (!result.reviews) result.reviews = res.count
      }
      if (typeof res.reviews === 'number') result.reviews = res.reviews
      if (typeof res.totalReviews === 'number') result.reviews = res.totalReviews
      if (typeof res.totalUsers === 'number') result.users = res.totalUsers
      // try type-specific keys
      if (typeof res.movies === 'number') result.movies = res.movies
      if (typeof res.series === 'number') result.series = res.series
      if (typeof res.books === 'number') result.books = res.books
      if (typeof res.booksCount === 'number') result.books = res.booksCount
      if (typeof res.movieCount === 'number') result.movies = res.movieCount
      if (typeof res.seriesCount === 'number') result.series = res.seriesCount
      // if we found both, break early
      if (result.users && result.reviews) {
        console.log('✅ Found both users and reviews, returning:', result)
        return result
      }
    } catch (e) {
      console.error(`❌ Error fetching ${t}:`, e)
      // ignore
    }
  }

  console.log('🔄 Didn\'t find complete data, trying review endpoints...')
  // Try explicit review-count endpoints
  const rtries = ['/reviews/count', '/ratings/count', '/reviews/stats']
  for (const t of rtries) {
    try {
      const res: any = await api.apiFetch(t)
      // review try
      if (!res) continue
      if (typeof res.count === 'number') result.reviews = res.count
      if (typeof res.total === 'number') result.reviews = res.total
      if (result.reviews) break
    } catch (e) {}
  }

  // Try users count endpoints
  const utrys = ['/users/count', '/user/count']
  for (const t of utrys) {
    try {
      const res: any = await api.apiFetch(t)
      // users try
      if (!res) continue
      if (typeof res.count === 'number') result.users = res.count
      if (typeof res.total === 'number') result.users = res.total
      if (result.users) break
    } catch (e) {}
  }

  // try type-specific endpoints
  const ttries = ['/counts/types', '/stats/types', '/items/counts', '/items/stats']
  for (const t of ttries) {
    try {
      const res: any = await api.apiFetch(t)
      // types try
      if (!res) continue
      if (typeof res.movies === 'number') result.movies = res.movies
      if (typeof res.series === 'number') result.series = res.series
      if (typeof res.books === 'number') result.books = res.books
      if (typeof res.movieCount === 'number') result.movies = res.movieCount
      if (typeof res.seriesCount === 'number') result.series = res.seriesCount
      if (typeof res.booksCount === 'number') result.books = res.booksCount
      // if any found, return early
      if (result.movies || result.series || result.books) return result
    } catch (e) {}
  }

  // final result
  return result
}

export default { getUserCount, getRecentReviews }

// --- Direct, single-purpose getters (less efficient, multiple GETs) ---
export async function getUsersCountDirect(): Promise<number> {
  const tries = ['/users/count', '/user/count', '/users/counts', '/stats', '/stats/site']
  for (const t of tries) {
    try {
      const res: any = await api.apiFetch(t)
      if (!res) continue
      if (res.data && typeof res.data.totalUsers === 'number') return res.data.totalUsers
      if (res.data && typeof res.data.totalRatings === 'number') return res.data.totalRatings
      if (typeof res.count === 'number') return res.count
      if (typeof res.users === 'number') return res.users
      if (typeof res.total === 'number') return res.total
      if (typeof res.totalUsers === 'number') return res.totalUsers
    } catch (e) {
      // ignore and try next
    }
  }
  return 0
}

export async function getReviewsCountDirect(): Promise<number> {
  const tries = ['/reviews/count', '/ratings/count', '/reviews/stats', '/stats']
  for (const t of tries) {
    try {
      const res: any = await api.apiFetch(t)
      if (!res) continue
      if (res.data && typeof res.data.totalRatings === 'number') return res.data.totalRatings
      if (typeof res.count === 'number') return res.count
      if (typeof res.total === 'number') return res.total
      if (typeof res.reviews === 'number') return res.reviews
      if (typeof res.totalReviews === 'number') return res.totalReviews
    } catch (e) {
      // ignore
    }
  }
  return 0
}

export async function getItemsCountByType(type: string): Promise<number> {
  // try common endpoints that accept a type param or specific routes
  const tries = [`/items/count?type=${type}`, `/items/counts?type=${type}`, `/items/counts`, `/items/stats`, `/counts/types`]
  for (const t of tries) {
    try {
      const res: any = await api.apiFetch(t)
      if (!res) continue
      // if endpoint returns numeric directly
      if (typeof res === 'number') return res
      // if endpoint returns object with counts
      if (typeof res.count === 'number') return res.count
      if (typeof res[type] === 'number') return res[type]
      if (res.counts && typeof res.counts[type] === 'number') return res.counts[type]
      if (res.totals && typeof res.totals[type] === 'number') return res.totals[type]
    } catch (e) {
      // ignore
    }
  }
  return 0
}

export async function getTopRated(): Promise<any> {
  try {
    const res: any = await api.apiFetch('/stats/top-rated')
    // expected shape: { data: { movies: [], series: [], books: [] }, source, checkedAt }
    if (!res) return { movies: [], series: [], books: [] }
    if (res.data) return res.data
    // legacy: accept direct object
    if (res.movies || res.series || res.books) return { movies: res.movies || [], series: res.series || [], books: res.books || [] }
    return { movies: [], series: [], books: [] }
  } catch (e) {
    return { movies: [], series: [], books: [] }
  }
}
