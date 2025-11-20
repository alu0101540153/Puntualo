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

export default { addRating, getMyRatings, updateUser, deleteRating }
