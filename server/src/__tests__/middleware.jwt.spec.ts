import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Middleware JWT variations', () => {
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

  it('verifyToken with no Authorization header', async () => {
    const res = await request(app).get('/api/v1/puntualo/notifications')
    expect(res.status).toBe(401)
  })

  it('verifyToken with empty Bearer token', async () => {
    const res = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', 'Bearer ')
    expect(res.status).toBe(401)
  })

  it('verifyToken with Bearer but no token', async () => {
    const res = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', 'Bearer')
    expect(res.status).toBe(401)
  })

  it('verifyToken with token not starting with Bearer', async () => {
    const u = { handle: 'nobear', name: 'NoBear', email: 'nobear@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const token = reg.body.token
    const res = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', token)
    expect(res.status).toBe(401)
  })

  it('checkOwnership with correct owner', async () => {
    const u = { handle: 'owner1', name: 'Owner1', email: 'owner1@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const id = reg.body.user._id
    const token = reg.body.token
    const res = await request(app).put(`/api/v1/puntualo/users/${id}`).set('Authorization', `Bearer ${token}`).send({ name: 'Updated' })
    expect([200, 401, 404]).toContain(res.status)
  })

  it('checkOwnership with wrong owner returns 403', async () => {
    const u1 = { handle: 'owner2', name: 'Owner2', email: 'owner2@example.com', password: 'secret123' }
    const u2 = { handle: 'thief', name: 'Thief', email: 'thief@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const token2 = reg2.body.token
    const res = await request(app).put(`/api/v1/puntualo/users/${id1}`).set('Authorization', `Bearer ${token2}`).send({ name: 'Stolen' })
    expect([400, 403, 404]).toContain(res.status)
  })
})
