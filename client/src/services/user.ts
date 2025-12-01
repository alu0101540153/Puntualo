import api from './api'

export async function addRating(userId: string, payload: any) {
  return api.apiFetch(`/users/${userId}/rate`, { method: 'POST', body: payload, auth: true })
}

export async function getMyRatings(userId: string, sortBy: 'date' | 'score' = 'date', order: 'asc' | 'desc' = 'desc') {
  // sortBy: 'date'|'score', order: 'desc' => más reciente/alto primero, 'asc' => más antiguo/bajo primero
  const qs = `?sortBy=${encodeURIComponent(sortBy)}&order=${encodeURIComponent(order)}`
  return api.apiFetch(`/users/${userId}/ratings${qs}`, { auth: true })
}


export async function updateUser(userId: string, payload: FormData | Record<string, any>) {
  // Accept either JSON or FormData (for avatar upload). apiFetch handles FormData correctly.
  return api.apiFetch(`/users/${userId}`, { method: 'PATCH', body: payload as any, auth: true })
}

export async function deleteRating(userId: string, ratingId: string) {
  return api.apiFetch(`/users/${userId}/ratings/${ratingId}`, { method: 'DELETE', auth: true })
}

export async function followUser(targetUserId: string) {
  // current user token will be attached by apiFetch when auth:true
  return api.apiFetch(`/users/${targetUserId}/follow`, { method: 'POST', auth: true })
}

export async function unfollowUser(targetUserId: string) {
  return api.apiFetch(`/users/${targetUserId}/follow`, { method: 'DELETE', auth: true })
}

export async function getUserById(userId: string) {
  return api.apiFetch(`/users/${userId}`)
}

export async function addItemToUser(userId: string, payload: any) {
  // payload: { itemId?, externalId?, itemType?, title? }
  return api.apiFetch(`/users/${userId}/items`, { method: 'POST', body: payload, auth: true })
}

export async function removeItemFromUser(userId: string, itemSubId: string) {
  return api.apiFetch(`/users/${userId}/items/${encodeURIComponent(String(itemSubId))}`, { method: 'DELETE', auth: true })
}

export async function getFeed(userId: string, page: number = 1, limit: number = 20) {
  const qs = `?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  // This endpoint returns user-specific data and may require the auth token
  return api.apiFetch(`/users/${userId}/feed${qs}`, { auth: true })
}

export default { addRating, getMyRatings, updateUser, deleteRating, addItemToUser, removeItemFromUser, getUserById }

// Obtener seguidores de un usuario
export async function getFollowers(userId: string) {
  return api.apiFetch(`/users/${userId}/followers`)
}

// Obtener usuarios seguidos por un usuario
export async function getFollowing(userId: string) {
  return api.apiFetch(`/users/${userId}/following`)
}
