import api from './api'

export async function addRating(userId: string, payload: any) {
  return api.apiFetch(`/users/${userId}/rate`, { method: 'POST', body: payload, auth: true })
}

export async function getMyRatings(userId: string) {
  return api.apiFetch(`/users/${userId}/ratings`, { auth: true })
}

export default { addRating, getMyRatings }
