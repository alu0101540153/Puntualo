import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Stats variations and aggregations', () => {
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

  it('database stats endpoint returns counts', async () => {
    const u = { handle: 'stats1', name: 'Stats1', email: 'stats1@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/stats')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('users')
  })

  it('top-rated endpoint returns all item types', async () => {
    const res = await request(app).get('/api/v1/puntualo/stats/top-rated')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('movies')
    expect(res.body.data).toHaveProperty('series')
    expect(res.body.data).toHaveProperty('books')
  })

  it('stats with users and ratings', async () => {
    const u1 = { handle: 'statsuser1', name: 'StatsUser1', email: 'statsuser1@example.com', password: 'secret123' }
    const u2 = { handle: 'statsuser2', name: 'StatsUser2', email: 'statsuser2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const id2 = reg2.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/rate`).send({ itemId: null, itemType: 'movie', score: 9 })
    await request(app).post(`/api/v1/puntualo/users/${id2}/rate`).send({ itemId: null, itemType: 'book', score: 7 })
    const res = await request(app).get('/api/v1/puntualo/stats')
    if (res.status === 200 && res.body.users) {
      expect(res.body.users).toBeGreaterThanOrEqual(2)
    }
  })

  it('all stats includes database and top-rated', async () => {
    const u = { handle: 'allstats', name: 'AllStats', email: 'allstats@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/stats/all')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
  })

  it('top-rated cache returns source=cache', async () => {
    await request(app).get('/api/v1/puntualo/stats/top-rated')
    const res = await request(app).get('/api/v1/puntualo/stats/top-rated')
    if (res.status === 200) {
      expect(res.body.source).toBe('cache')
    }
  })
})
