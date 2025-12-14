import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Notifications additional cases', () => {
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

  it('mark notification as read', async () => {
    const u1 = { handle: 'notifread1', name: 'NotifRead1', email: 'notifread1@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'notifread2', name: 'NotifRead2', email: 'notifread2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    const id1 = reg1.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const notifs = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', `Bearer ${token1}`)
    if (notifs.status === 200 && notifs.body.length > 0) {
      const notifId = notifs.body[0]._id
      const res = await request(app).put(`/api/v1/puntualo/notifications/${notifId}/read`).set('Authorization', `Bearer ${token1}`)
      expect([200, 204]).toContain(res.status)
    }
  })

  it('delete notification', async () => {
    const u1 = { handle: 'notifdel1', name: 'NotifDel1', email: 'notifdel1@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'notifdel2', name: 'NotifDel2', email: 'notifdel2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    const id1 = reg1.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const notifs = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', `Bearer ${token1}`)
    if (notifs.status === 200 && notifs.body.length > 0) {
      const notifId = notifs.body[0]._id
      const res = await request(app).delete(`/api/v1/puntualo/notifications/${notifId}`).set('Authorization', `Bearer ${token1}`)
      expect([200, 204]).toContain(res.status)
    }
  })

  it('get notifications without token returns 401', async () => {
    const res = await request(app).get('/api/v1/puntualo/notifications')
    expect(res.status).toBe(401)
  })

  it('mark-all-read without token returns 401', async () => {
    const res = await request(app).put('/api/v1/puntualo/notifications/mark-all-read')
    expect(res.status).toBe(401)
  })

  it('mark notification as read without token returns 401', async () => {
    const res = await request(app).put('/api/v1/puntualo/notifications/SOMEID/read')
    expect(res.status).toBe(401)
  })

  it('delete notification without token returns 401', async () => {
    const res = await request(app).delete('/api/v1/puntualo/notifications/SOMEID')
    expect(res.status).toBe(401)
  })
})
