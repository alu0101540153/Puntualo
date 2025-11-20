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

export async function createItem(payload: any) {
  // Creación de item en backend (requiere auth token)
  return api.apiFetch(`/item`, { method: 'POST', body: payload, auth: true })
}
