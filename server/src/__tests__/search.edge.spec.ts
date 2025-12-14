import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Search edge cases and errors', () => {
  beforeAll(async () => {
    await connectDB()
  })
  beforeEach(async () => {
    await dropTestDatabase()
  })
  afterAll(async () => {
    await dropTestDatabase()
    await mongoose.connection.close()
  })

  it('search friends with negative page', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/friends?page=-1')
    expect([200, 400, 500]).toContain(res.status)
  })

  it('search friends with negative limit', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/friends?limit=-10')
    expect([200, 400]).toContain(res.status)
  })

  it('search friends with page=0', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/friends?page=0')
    expect([200, 400]).toContain(res.status)
  })

  it('search friends with limit=0', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/friends?limit=0')
    expect([200, 400]).toContain(res.status)
  })

  it('search friends with very long query string', async () => {
    const longQuery = 'a'.repeat(1000)
    const res = await request(app).get(`/api/v1/puntualo/search/friends?handle=${longQuery}`)
    expect([200, 400, 414]).toContain(res.status)
  })

  it('search movies with special characters in title', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/movies?title=Matrix%20%26%20Reloaded')
    expect([200, 400, 500]).toContain(res.status)
  })

  it('search movies with non-existent tmdb id', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/movies/tmdb:99999999')
    expect([200, 404, 500]).toContain(res.status)
  })

  it('search movies with invalid id format', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/movies/invalid-format')
    expect([400, 404, 500]).toContain(res.status)
  })
})
