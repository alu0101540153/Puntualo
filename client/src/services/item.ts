import api from './api'

export async function getItemById(id: string) {
  return api.apiFetch(`/item/${id}`)
}

export default { getItemById }

export async function getAllItems() {
  return api.apiFetch(`/item`)
}

// keep default export convenience
export { getItemById as defaultGetItem }

export async function getRecommendationsForUser(userId: string) {
  return api.apiFetch(`/item/recommendations/${userId}`)
}

export async function getTopItems(type: string = 'movie', limit: number = 8) {
  // Try a dedicated endpoint, otherwise fall back to fetching all items and sorting by score
  try {
    return api.apiFetch(`/item/top?type=${encodeURIComponent(type)}&limit=${encodeURIComponent(String(limit))}`)
  } catch (e) {
    try {
      // fallback to all items and client-side filter (may be large)
      const all: any = await api.apiFetch(`/item`)
      const items = Array.isArray(all) ? all : (all && all.items) || []
      const filtered = items.filter((it: any) => {
        const t = (it.itemType || (it.data && it.data.type) || '').toString().toLowerCase()
        if (!type) return true
        if (type === 'movie') return t.includes('movie') || t.includes('film')
        if (type === 'series') return t.includes('series') || t.includes('tv')
        if (type === 'book') return t.includes('book') || t.includes('lib')
        return true
      })
      // sort by score/rating fields if present
      filtered.sort((a: any, b: any) => {
        const sa = (a.score ?? a.rating ?? 0)
        const sb = (b.score ?? b.rating ?? 0)
        return Number(sb) - Number(sa)
      })
      return { items: filtered.slice(0, limit) }
    } catch (err) {
      // last resort: empty
      return { items: [] }
    }
  }
}

export async function getGlobalTop(limit: number = 5) {
  // Try a server-provided global top endpoint first
  try {
    const res: any = await api.apiFetch(`/item/top?limit=${encodeURIComponent(String(limit))}`)
    if (res) {
      if (Array.isArray(res)) return { items: res.slice(0, limit) }
      if (Array.isArray(res.items)) return { items: res.items.slice(0, limit) }
    }
  } catch (e) {
    // ignore and fall back
  }

  // Fall back: fetch all items and sort by score/rating across types
  try {
    const all: any = await api.apiFetch(`/item`)
    const items = Array.isArray(all) ? all : (all && all.items) || []
    items.sort((a: any, b: any) => {
      const sa = Number(a.score ?? a.rating ?? 0)
      const sb = Number(b.score ?? b.rating ?? 0)
      return sb - sa
    })
    return { items: items.slice(0, limit) }
  } catch (e) {
    return { items: [] }
  }
}

export async function getFriendsRatings(itemId: string, page: number = 1, limit: number = 8) {
  // This endpoint requires authentication (returns ratings from users the requester follows)
  return api.apiFetch(`/item/${itemId}/friends-ratings?page=${page}&limit=${limit}`, { auth: true })
}

export async function createItem(payload: any) {
  // Creación de item en backend (requiere auth token)
  return api.apiFetch(`/item`, { method: 'POST', body: payload, auth: true })
}
