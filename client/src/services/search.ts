import api from './api'

type SearchOpts = {
  sortBy?: 'relevance' | 'rating' | 'year'
  order?: 'asc' | 'desc'
  year?: number | null
  genre?: string | null
}

function buildQuery(params: Record<string, any>) {
  const q = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`).join('&')
  return q ? `?${q}` : ''
}

export async function searchBooks(title: string, page = 1, opts: SearchOpts = {}) {
  const params: Record<string, any> = { title, page }
  if (opts.sortBy) params.sortBy = opts.sortBy
  if (opts.order) params.order = opts.order
  if (opts.year) params.year = opts.year
  if (opts.genre) params.genre = opts.genre
  const q = buildQuery(params)
  return api.apiFetch(`/search/books${q}`)
}

export async function searchMovies(title: string, page = 1, opts: SearchOpts = {}) {
  const params: Record<string, any> = { title, page }
  if (opts.sortBy) params.sortBy = opts.sortBy
  if (opts.order) params.order = opts.order
  if (opts.year) params.year = opts.year
  if (opts.genre) params.genre = opts.genre
  const q = buildQuery(params)
  return api.apiFetch(`/search/movies${q}`)
}

export async function searchSeries(title: string, page = 1, opts: SearchOpts = {}) {
  const params: Record<string, any> = { title, page }
  if (opts.sortBy) params.sortBy = opts.sortBy
  if (opts.order) params.order = opts.order
  if (opts.year) params.year = opts.year
  if (opts.genre) params.genre = opts.genre
  const q = buildQuery(params)
  return api.apiFetch(`/search/series${q}`)
}

export async function searchFriends(handle: string, page = 1, opts: SearchOpts = {}) {
  const params: Record<string, any> = { handle, page }
  if (opts.sortBy) params.sortBy = opts.sortBy
  if (opts.order) params.order = opts.order
  const q = buildQuery(params)
  return api.apiFetch(`/search/friends${q}`)
}

export default { searchBooks, searchMovies, searchSeries }
