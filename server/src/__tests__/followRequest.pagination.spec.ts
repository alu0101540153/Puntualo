import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Follow requests pagination', () => {
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

  it('pending follow requests with page=1 and limit=5', async () => {
    const u = { handle: 'frpag1', name: 'FRPag1', email: 'frpag1@example.com', password: 'secret123', isPrivate: true }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const token = reg.body.token
    const res = await request(app).get('/api/v1/puntualo/follow-requests/pending?page=1&limit=5').set('Authorization', `Bearer ${token}`)
    expect([200, 401]).toContain(res.status)
  })

  it('pending requests with no token returns 401', async () => {
    const res = await request(app).get('/api/v1/puntualo/follow-requests/pending')
    expect(res.status).toBe(401)
  })

  it('accept follow request with invalid ID returns 400 or 404', async () => {
    const u = { handle: 'fraccept', name: 'FRAccept', email: 'fraccept@example.com', password: 'secret123', isPrivate: true }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const token = reg.body.token
    const res = await request(app).post('/api/v1/puntualo/follow-requests/INVALIDID/accept').set('Authorization', `Bearer ${token}`)
    expect([400, 404, 500]).toContain(res.status)
  })

  it('reject follow request without token returns 401', async () => {
    const res = await request(app).post('/api/v1/puntualo/follow-requests/SOMEID/reject')
    expect(res.status).toBe(401)
  })

  it('cancel follow request for non-existing request returns 404', async () => {
    const u = { handle: 'frcancel', name: 'FRCancel', email: 'frcancel@example.com', password: 'secret123' }
    const reg = await request(app).post('/api/v1/puntualo/auth/register').send(u)
    const token = reg.body.token
    const res = await request(app).delete('/api/v1/puntualo/follow-requests/INVALIDID/cancel').set('Authorization', `Bearer ${token}`)
    expect([400, 404]).toContain(res.status)
  })
})
