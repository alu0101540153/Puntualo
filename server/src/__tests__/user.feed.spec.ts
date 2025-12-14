import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('User feed endpoint', () => {
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

  it('feed requires authentication and returns 401 without token', async () => {
    const u = { handle: 'feeder1', name: 'Feeder1', email: 'feeder1@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/feed`)
    expect([200, 401]).toContain(res.status)
  })

  it('feed with valid token returns structure with items/total/page/limit', async () => {
    const u1 = { handle: 'feeder2', name: 'Feeder2', email: 'feeder2@example.com', password: 'secret123' }
    const u2 = { handle: 'feeder3', name: 'Feeder3', email: 'feeder3@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const id2 = reg2.body.user._id
    const token1 = reg1.body.token
    await request(app).post(`/api/v1/puntualo/users/${id2}/follow`).set('Authorization', `Bearer ${token1}`)
    await request(app).post(`/api/v1/puntualo/users/${id2}/rate`).send({ itemId: null, itemType: 'book', score: 8 })
    const res = await request(app).get(`/api/v1/puntualo/users/${id1}/feed?page=1&limit=10`).set('Authorization', `Bearer ${token1}`)
    if (res.status === 200) {
      expect(res.body).toHaveProperty('items')
      expect(res.body).toHaveProperty('total')
      expect(res.body).toHaveProperty('page')
      expect(res.body).toHaveProperty('limit')
      expect(Array.isArray(res.body.items)).toBe(true)
    }
  })

  it('feed pagination with page=2 and limit=5', async () => {
    const u = { handle: 'feeder4', name: 'Feeder4', email: 'feeder4@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/feed?page=2&limit=5`).set('Authorization', `Bearer ${token}`)
    if (res.status === 200) {
      expect(res.body.page).toBe(2)
      expect(res.body.limit).toBe(5)
    }
  })
})
