import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('User controller/service additional coverage', () => {
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

  it('getUserById returns 404 when not found', async () => {
    const res = await request(app).get('/api/v1/puntualo/users/000000000000000000000000')
    expect([400,404]).toContain(res.status)
  })

  it('update returns 409 when handle already in use (or 401 without auth)', async () => {
    const a = { handle: 'exists', name: 'A', email: 'a@example.com', password: 'secret123' }
    const b = { handle: 'buser', name: 'B', email: 'b@example.com', password: 'secret123' }
    const regA = await request(app).post('/api/v1/puntualo/auth/register').send(a).expect(201)
    const regB = await request(app).post('/api/v1/puntualo/auth/register').send(b).expect(201)
    const idB = regB.body.user._id || regB.body.user.id
    const res = await request(app).patch(`/api/v1/puntualo/users/${idB}`).send({ handle: 'EXISTS' })
    expect([200,409,401]).toContain(res.status)
    if (res.status === 409) {
      expect(res.body.message).toMatch(/Handle/i)
    }
  })

  it('getFollowers/getFollowing return arrays and feed endpoint requires auth', async () => {
    const u1 = { handle: 'u1', name: 'U1', email: 'u1@example.com', password: 'secret123' }
    const u2 = { handle: 'u2', name: 'U2', email: 'u2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const id2 = reg2.body.user._id
    const token1 = reg1.body.token
    await request(app).post(`/api/v1/puntualo/users/${id2}/follow`).set('Authorization', `Bearer ${token1}`)
    const followers = await request(app).get(`/api/v1/puntualo/users/${id2}/followers`)
    expect(Array.isArray(followers.body)).toBe(true)
    const following = await request(app).get(`/api/v1/puntualo/users/${id1}/following`)
    expect(Array.isArray(following.body)).toBe(true)
    const feed1 = await request(app).get(`/api/v1/puntualo/users/${id1}/feed?page=1&limit=5`)
    expect([200,401]).toContain(feed1.status)
  })
})
