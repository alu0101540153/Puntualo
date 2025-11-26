import { vi } from 'vitest'
import axios from 'axios'
import mongoose from 'mongoose'
import request from 'supertest'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

vi.mock('axios')

const mockedAxios = axios as unknown as { get: vi.Mock }

describe('Search endpoints (mocking external APIs)', () => {
  beforeAll(async () => {
    await connectDB()
  })

  beforeEach(async () => {
    await dropTestDatabase()
    vi.resetAllMocks()
  })

  afterAll(async () => {
    await dropTestDatabase()
    await mongoose.connection.close()
  })

  it('search movies returns paginated items (mocked TMDB)', async () => {
  process.env.TMDB_API_KEY = 'fake'
  // ensure modules re-load so TMDB-related services read the TMDB_API_KEY
  vi.resetModules()
  const server = new (await import('../server')).Server()
  const app = server.getApp()
    // create fake tmdb result with 20 items
    const results = Array.from({ length: 20 }).map((_, i) => ({ id: i + 1, title: `Movie ${i + 1}`, poster_path: null }))
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { results, total_results: 20 } })

    const res = await request(app).get('/api/v1/puntualo/search/movies?title=test&page=1').expect(200)
    expect(res.body.items).toBeDefined()
    expect(res.body.items.length).toBe(10)
  })

  it('fetch movie by tmdb id stores and returns item', async () => {
  process.env.TMDB_API_KEY = 'fake'
  vi.resetModules()
  const server = new (await import('../server')).Server()
  const app = server.getApp()
    // tmdb detail response
    const tmdb = { id: 999, title: 'Big Movie', poster_path: null, overview: 'x', genres: [{ name: 'G' }], credits: { cast: [{ name: 'A' }] } }
    mockedAxios.get = vi.fn().mockResolvedValue({ data: tmdb })

  const res = await request(app).post('/api/v1/puntualo/search/movies/999').expect(201)
    // Should return created item
    expect(res.body.item).toBeDefined()
    expect(res.body.item.externalId).toBe(String(tmdb.id))
  })
})
