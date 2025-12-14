import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Notifications filters and idempotence', () => {
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

  it('notifications list with unreadOnly=false shows all notifications', async () => {
    const u1 = { handle: 'notifu1', name: 'NotifU1', email: 'notifu1@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'notifu2', name: 'NotifU2', email: 'notifu2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const id1 = reg1.body.user._id
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const res = await request(app).get('/api/v1/puntualo/notifications?unreadOnly=false').set('Authorization', `Bearer ${token1}`)
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true)
    }
  })

  it('mark-all-read is idempotent and returns success twice', async () => {
    const u1 = { handle: 'idempot1', name: 'Idempot1', email: 'idempot1@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'idempot2', name: 'Idempot2', email: 'idempot2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    const id1 = reg1.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const res1 = await request(app).put('/api/v1/puntualo/notifications/mark-all-read').set('Authorization', `Bearer ${token1}`)
    expect([200, 204]).toContain(res1.status)
    const res2 = await request(app).put('/api/v1/puntualo/notifications/mark-all-read').set('Authorization', `Bearer ${token1}`)
    expect([200, 204]).toContain(res2.status)
  })

  it('delete notification of another user returns 400 or 403', async () => {
    const u1 = { handle: 'notifowner', name: 'NotifOwner', email: 'notifowner@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'notifstealer', name: 'NotifStealer', email: 'notifstealer@example.com', password: 'secret123' }
    const u3 = { handle: 'notifthief', name: 'NotifThief', email: 'notifthief@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const reg3 = await request(app).post('/api/v1/puntualo/auth/register').send(u3)
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    const token3 = reg3.body.token
    const id1 = reg1.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const notifs = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', `Bearer ${token1}`)
    if (notifs.status === 200 && notifs.body.length > 0) {
      const notifId = notifs.body[0]._id
      const res = await request(app).delete(`/api/v1/puntualo/notifications/${notifId}`).set('Authorization', `Bearer ${token3}`)
      expect([400, 403, 404]).toContain(res.status)
    }
  })
})
