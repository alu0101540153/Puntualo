import api from './api'

export async function searchBooks(title: string, page = 1) {
  const q = `?title=${encodeURIComponent(title)}&page=${page}`
  return api.apiFetch(`/search/books${q}`)
}

export async function searchMovies(title: string, page = 1) {
  const q = `?title=${encodeURIComponent(title)}&page=${page}`
  return api.apiFetch(`/search/movies${q}`)
}

export async function searchSeries(title: string, page = 1) {
  const q = `?title=${encodeURIComponent(title)}&page=${page}`
  return api.apiFetch(`/search/series${q}`)
}

export async function searchFriends(handle: string, page = 1) {
  const q = `?handle=${encodeURIComponent(handle)}&page=${page}`
  return api.apiFetch(`/search/friends${q}`)
}

export default { searchBooks, searchMovies, searchSeries }
