import api from './api'

// Public fetch of a user's friends (follows). The server exposes /users/:id/friends
// so anyone can view another user's friends list for public profiles.
export async function getMyFollows(userId: string) {
  return api.apiFetch(`/users/${userId}/friends`)
}

export default { getMyFollows }
