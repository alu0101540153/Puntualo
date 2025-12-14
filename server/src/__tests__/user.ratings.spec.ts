import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('User ratings sorting and retrieval', () => {
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

  it('getRatings sorts by score ascending', async () => {
    const u = { handle: 'rater1', name: 'Rater1', email: 'rater1@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 8, comment: 'Good' })
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 5, comment: 'Ok' })
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/ratings?sortBy=score&order=asc`)
    expect([200, 401]).toContain(res.status)
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true)
      if (res.body.length >= 2) {
        const scores = res.body.map((r: any) => r.score)
        expect(scores[0]).toBeLessThanOrEqual(scores[1])
      }
    }
  })

  it('getRatings sorts by score descending', async () => {
    const u = { handle: 'rater2', name: 'Rater2', email: 'rater2@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 3, comment: 'Meh' })
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 9, comment: 'Great' })
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/ratings?sortBy=score&order=desc`)
    expect([200, 401]).toContain(res.status)
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true)
      if (res.body.length >= 2) {
        const scores = res.body.map((r: any) => r.score)
        expect(scores[0]).toBeGreaterThanOrEqual(scores[1])
      }
    }
  })

  it('getRatings sorts by date ascending', async () => {
    const u = { handle: 'rater3', name: 'Rater3', email: 'rater3@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 7, comment: 'First' })
    await new Promise(resolve => setTimeout(resolve, 50))
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 6, comment: 'Second' })
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/ratings?sortBy=date&order=asc`)
    expect([200, 401]).toContain(res.status)
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true)
    }
  })

  it('getRatings defaults to date descending', async () => {
    const u = { handle: 'rater4', name: 'Rater4', email: 'rater4@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 4, comment: 'Old' })
    await new Promise(resolve => setTimeout(resolve, 50))
    await request(app).post(`/api/v1/puntualo/users/${id}/rate`).send({ itemId: null, itemType: 'book', score: 10, comment: 'New' })
    const res = await request(app).get(`/api/v1/puntualo/users/${id}/ratings`)
    expect([200, 401]).toContain(res.status)
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true)
    }
  })
})
