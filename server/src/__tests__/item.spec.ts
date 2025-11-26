import request from 'supertest'
import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Item endpoints', () => {
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

  it('rejects creating item without auth and allows with auth', async () => {
    const u = { handle: 'it1', name: 'It1', email: 'it1@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const token = reg.body.token

    await request(app).post('/api/v1/puntualo/item').send({ itemType: 'movie', title: 'NoAuth' }).expect(401)

    const ok = await request(app)
      .post('/api/v1/puntualo/item')
      .set('Authorization', `Bearer ${token}`)
      .send({ itemType: 'movie', title: 'WithAuth' })
      .expect(200)

    expect(ok.body.title).toBe('WithAuth')
  })
})
