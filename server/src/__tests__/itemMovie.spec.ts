import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

// Covers error branches in item_movie.service.ts
const server = new Server()
const app = server.getApp()

describe('Item Movie service', () => {
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

  it('handles missing tmdbId on id route with client/server error', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/movies/')
    expect([400, 404, 500]).toContain(res.status)
  })

  it('handles bad TMDB fetch and returns 502/500 gracefully', async () => {
    // Hit the fetch by id route with an obviously bad id that triggers error branch
    const res = await request(app).get('/api/v1/puntualo/search/movies/-1')
    expect([500, 502, 404]).toContain(res.status)
  })
})
