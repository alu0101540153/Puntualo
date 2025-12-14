import request from 'supertest'
import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest'

import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

const registerUser = async (payload: any) => {
  const res = await request(app).post('/api/v1/puntualo/auth/register').send(payload).expect(201)
  return { token: res.body.token, user: res.body.user }
}

const createItem = async (token: string, itemType: string, title: string) => {
  const res = await request(app)
    .post('/api/v1/puntualo/item')
    .set('Authorization', `Bearer ${token}`)
    .send({ itemType, title })
    .expect(200)
  return res.body
}

const rateItem = async (token: string, userId: string, itemId: string, itemType: string, score: number) => {
  await request(app)
    .post(`/api/v1/puntualo/users/${userId}/rate`)
    .set('Authorization', `Bearer ${token}`)
    .send({ itemId, itemType, score })
    .expect(200)
}

describe('Stats endpoints', () => {
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

  it('returns database stats and cached top-rated aggregates', async () => {
    const { token: tokenU1, user: u1 } = await registerUser({ handle: 'stats1', name: 'Stats One', email: 'stats1@example.com', password: 'secret123' })
    const { token: tokenU2, user: u2 } = await registerUser({ handle: 'stats2', name: 'Stats Two', email: 'stats2@example.com', password: 'secret123' })

    const movie = await createItem(tokenU1, 'movie', 'Movie One')
    const series = await createItem(tokenU1, 'series', 'Series One')
    const book = await createItem(tokenU1, 'book', 'Book One')

    await rateItem(tokenU1, u1._id, movie._id, 'movie', 8)
    await rateItem(tokenU2, u2._id, movie._id, 'movie', 10)
    await rateItem(tokenU1, u1._id, series._id, 'series', 6)
    await rateItem(tokenU1, u1._id, book._id, 'book', 9)

    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(Date.now() + 6 * 60 * 1000))

      const stats = await request(app).get('/api/v1/puntualo/stats').expect(200)
      expect(stats.body.users).toBe(2)
      expect(stats.body.reviews).toBe(4)
      expect(stats.body.movies).toBe(1)
      expect(stats.body.series).toBe(1)
      expect(stats.body.books).toBe(1)
      expect(stats.body.source).toBe('db')

      const top = await request(app).get('/api/v1/puntualo/stats/top-rated').expect(200)
      expect(top.body.source).toBe('cache')
      expect(top.body.data.movies[0].count).toBe(2)
      expect(top.body.data.movies[0].item._id).toBe(movie._id)
      expect(top.body.data.movies[0].avgScore).toBeCloseTo(9)
      expect(top.body.data.series[0].item._id).toBe(series._id)
      expect(top.body.data.books[0].item._id).toBe(book._id)

      const combined = await request(app).get('/api/v1/puntualo/stats/all').expect(200)
      expect(combined.body.data.totalUsers).toBe(2)
      expect(combined.body.data.totalRatings).toBe(4)
      expect(combined.body.data.top.movies[0].count).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })
})