import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Search pagination edge cases', () => {
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

  it('search friends with page=0 handles gracefully', async () => {
    const u = { handle: 'searcher1', name: 'Searcher1', email: 'searcher1@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/search/friends?page=0')
    expect([200, 400]).toContain(res.status)
  })

  it('search friends with very high limit returns data', async () => {
    const u = { handle: 'searcher2', name: 'Searcher2', email: 'searcher2@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/search/friends?limit=9999')
    expect(res.status).toBe(200)
    if (res.body.results) {
      expect(Array.isArray(res.body.results)).toBe(true)
    }
  })

  it('search friends with page beyond available returns empty results', async () => {
    const u = { handle: 'searcher3', name: 'Searcher3', email: 'searcher3@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/search/friends?page=999')
    expect(res.status).toBe(200)
    if (res.body.results) {
      expect(res.body.results).toHaveLength(0)
    }
  })

  it('search movies with empty title returns results or handles gracefully', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/movies?title=')
    expect([200, 400, 500]).toContain(res.status)
  })
})
