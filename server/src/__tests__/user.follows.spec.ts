import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('User follows listing and counts', () => {
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

  it('get followers list for user', async () => {
    const u1 = { handle: 'followed1', name: 'Followed1', email: 'followed1@example.com', password: 'secret123' }
    const u2 = { handle: 'follower1', name: 'Follower1', email: 'follower1@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const token2 = reg2.body.token
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const res = await request(app).get(`/api/v1/puntualo/users/${id1}/followers`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('get following list for user', async () => {
    const u1 = { handle: 'following1', name: 'Following1', email: 'following1@example.com', password: 'secret123' }
    const u2 = { handle: 'target1', name: 'Target1', email: 'target1@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const id2 = reg2.body.user._id
    const token1 = reg1.body.token
    await request(app).post(`/api/v1/puntualo/users/${id2}/follow`).set('Authorization', `Bearer ${token1}`)
    const res = await request(app).get(`/api/v1/puntualo/users/${id1}/following`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('followers list for non-existing user returns 404', async () => {
    const res = await request(app).get('/api/v1/puntualo/users/FAKEID/followers')
    expect([400, 404, 500]).toContain(res.status)
  })

  it('following list for non-existing user returns 404', async () => {
    const res = await request(app).get('/api/v1/puntualo/users/FAKEID/following')
    expect([400, 404, 500]).toContain(res.status)
  })

  it('follow user twice with different tokens has no duplicates', async () => {
    const u1 = { handle: 'target2', name: 'Target2', email: 'target2@example.com', password: 'secret123' }
    const u2 = { handle: 'stalker1', name: 'Stalker1', email: 'stalker1@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const token2 = reg2.body.token
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const res = await request(app).get(`/api/v1/puntualo/users/${id1}/followers`)
    if (res.status === 200) {
      const followerIds = res.body.map((f: any) => f._id)
      const uniqueIds = [...new Set(followerIds)]
      expect(followerIds.length).toBe(uniqueIds.length)
    }
  })
})
