import api from './api'
import { getUser } from './auth'

export async function getMyFollows(userId: string) {
  return api.apiFetch(`/users/${userId}/follows`, { auth: true })
}

export default { getMyFollows }
