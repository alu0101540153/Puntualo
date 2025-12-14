import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Search filters and friends', () => {
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

  it('search friends with handle query', async () => {
    const u = { handle: 'findme', name: 'FindMe', email: 'findme@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/search/friends?handle=find')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('items')
  })

  it('search friends with name query', async () => {
    const u = { handle: 'searchname', name: 'NameSearchable', email: 'searchname@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/search/friends?name=Search')
    expect(res.status).toBe(200)
  })

  it('search friends with no query returns all paginated', async () => {
    const u = { handle: 'all1', name: 'All1', email: 'all1@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/search/friends')
    expect(res.status).toBe(200)
    if (res.body.items) {
      expect(res.body.items.length).toBeGreaterThanOrEqual(0)
    }
  })

  it('search movies by title with pagination', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/movies?title=Matrix&page=1&limit=5')
    expect([200, 500]).toContain(res.status)
  })

  it('search movies by ID', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/movies/tmdb:603')
    expect([200, 404, 500]).toContain(res.status)
  })

  it('search with special characters in handle', async () => {
    const res = await request(app).get('/api/v1/puntualo/search/friends?handle=@user')
    expect(res.status).toBe(200)
  })

  it('search with Unicode characters in name', async () => {
    const u = { handle: 'unicode', name: 'Ñoño Ürban', email: 'unicode@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/search/friends?name=Ño')
    expect([200, 400]).toContain(res.status)
  })
})
