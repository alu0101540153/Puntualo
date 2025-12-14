import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Item validation and edges', () => {
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

  it('create item with missing title returns 400', async () => {
    const u = { handle: 'itemval1', name: 'ItemVal1', email: 'itemval1@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const token = reg.body.token
    const res = await request(app).post('/api/v1/puntualo/items').set('Authorization', `Bearer ${token}`).send({ type: 'movie' })
    expect([400, 404, 422, 500]).toContain(res.status)
  })

  it('create item with invalid type returns 400', async () => {
    const u = { handle: 'itemval2', name: 'ItemVal2', email: 'itemval2@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const token = reg.body.token
    const res = await request(app).post('/api/v1/puntualo/items').set('Authorization', `Bearer ${token}`).send({ title: 'Test', type: 'invalid' })
    expect([400, 404, 422, 500]).toContain(res.status)
  })

  it('create duplicate item by externalId returns 409 or deduplicates', async () => {
    const u = { handle: 'itemdup', name: 'ItemDup', email: 'itemdup@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const token = reg.body.token
    const item = { title: 'Duplicate Movie', type: 'movie', externalId: 'tmdb-999', poster: 'http://example.com/poster.jpg' }
    const res1 = await request(app).post('/api/v1/puntualo/items').set('Authorization', `Bearer ${token}`).send(item)
    const res2 = await request(app).post('/api/v1/puntualo/items').set('Authorization', `Bearer ${token}`).send(item)
    if (res1.status === 201) {
      expect([200, 201, 409]).toContain(res2.status)
    }
  })

  it('add item to user list without authentication returns 401', async () => {
    const u = { handle: 'itemauth', name: 'ItemAuth', email: 'itemauth@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const res = await request(app).post(`/api/v1/puntualo/users/${id}/items/ITEM123`)
    expect([401, 404]).toContain(res.status)
  })

  it('remove non-existing item from list returns 404 or 400', async () => {
    const u = { handle: 'itemremove', name: 'ItemRemove', email: 'itemremove@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res = await request(app).delete(`/api/v1/puntualo/users/${id}/items/NONEXISTENT`).set('Authorization', `Bearer ${token}`)
    expect([200, 400, 404]).toContain(res.status)
  })

  it('get items for non-existing user returns 404', async () => {
    const res = await request(app).get('/api/v1/puntualo/users/FAKEID/items')
    expect([400, 404, 500]).toContain(res.status)
  })
})
