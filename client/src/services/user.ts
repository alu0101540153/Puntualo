import api from './api'

export async function addRating(userId: string, payload: any) {
  return api.apiFetch(`/users/${userId}/rate`, { method: 'POST', body: payload, auth: true })
}

export async function getMyRatings(userId: string) {
  return api.apiFetch(`/users/${userId}/ratings`, { auth: true })
}


export async function updateUser(userId: string, payload: FormData | Record<string, any>) {
  // Accept either JSON or FormData (for avatar upload). apiFetch handles FormData correctly.
  return api.apiFetch(`/users/${userId}`, { method: 'PATCH', body: payload as any, auth: true })
}

export async function deleteRating(userId: string, ratingId: string) {
  return api.apiFetch(`/users/${userId}/ratings/${ratingId}`, { method: 'DELETE', auth: true })
}

export default { addRating, getMyRatings, updateUser, deleteRating }
