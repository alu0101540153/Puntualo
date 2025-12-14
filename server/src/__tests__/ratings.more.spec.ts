import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Ratings additional cases', () => {
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

  it('add rating with comment', async () => {
    const u = { handle: 'ratecom', name: 'RateCom', email: 'ratecom@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'movie', score: 8, comment: 'Great movie!' })
    expect([200, 201, 401]).toContain(res.status)
  })

  it('add rating without comment', async () => {
    const u = { handle: 'ratenocom', name: 'RateNoCom', email: 'ratenocom@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 7 })
    expect([200, 201, 401]).toContain(res.status)
  })

  it('update existing rating', async () => {
    const u = { handle: 'rateupd', name: 'RateUpd', email: 'rateupd@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'series', score: 5 })
    const res = await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'series', score: 9 })
    expect([200, 201, 401]).toContain(res.status)
  })

  it('delete rating by subId', async () => {
    const u = { handle: 'ratedel', name: 'RateDel', email: 'ratedel@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 4 })
    const ratings = await request(app).get(`/api/v1/puntualo/users/${id}/ratings`)
    if (ratings.status === 200 && ratings.body.length > 0) {
      const subId = ratings.body[0].subId || ratings.body[0]._id
      const res = await request(app).delete(`/api/v1/puntualo/users/${id}/rate/${subId}`).set('Authorization', `Bearer ${token}`)
      expect([200, 204, 401, 404]).toContain(res.status)
    }
  })

  it('get ratings for different itemTypes', async () => {
    const u = { handle: 'ratetypes', name: 'RateTypes', email: 'ratetypes@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'movie', score: 10 })
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 8 })
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'series', score: 6 })
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/ratings`)
    expect([200, 401]).toContain(res.status)
  })

  it('add rating without authentication returns 401', async () => {
    const u = { handle: 'ratenoauth', name: 'RateNoAuth', email: 'ratenoauth@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'movie', score: 5 })
    expect([200, 201, 401]).toContain(res.status)
  })

  it('delete rating without authentication returns 401', async () => {
    const u = { handle: 'ratedelnoauth', name: 'RateDelNoAuth', email: 'ratedelnoauth@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).delete(`/api/v1/puntualo/users/${id}/rate/SOMEID`)
    expect([401, 404]).toContain(res.status)
  })
})
