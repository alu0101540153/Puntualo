import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Stats cache behavior', () => {
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

  it('top-rated endpoint returns consistently on multiple calls', async () => {
    const u = { handle: 'statuser1', name: 'StatUser1', email: 'statuser1@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res1 = await request(app).get('/api/v1/puntualo/stats/top-rated')
    expect(res1.status).toBe(200)
    const res2 = await request(app).get('/api/v1/puntualo/stats/top-rated')
    expect(res2.status).toBe(200)
    expect(res2.body.data).toEqual(res1.body.data)
    expect(res2.body.source).toBe('cache')
  })

  it('all stats endpoint returns combined structure', async () => {
    const u = { handle: 'statuser2', name: 'StatUser2', email: 'statuser2@example.com', password: 'secret123' }
    await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const res = await request(app).get('/api/v1/puntualo/stats/all')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('totalUsers')
    expect(typeof res.body.data.totalUsers).toBe('number')
  })
})
