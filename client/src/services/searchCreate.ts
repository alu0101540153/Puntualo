import api from './api'

// Endpoints on the server that fetch external resource and store into items collection
export async function createBookByGoogleId(googleId: string) {
  return api.apiFetch(`/search/books/${googleId}`, { method: 'POST' })
}

export async function createMovieByTmdbId(tmdbId: string) {
  return api.apiFetch(`/search/movies/${tmdbId}`, { method: 'POST' })
}

export async function createSeriesByTmdbId(tmdbId: string) {
  return api.apiFetch(`/search/series/${tmdbId}`, { method: 'POST' })
}

export default { createBookByGoogleId, createMovieByTmdbId, createSeriesByTmdbId }
