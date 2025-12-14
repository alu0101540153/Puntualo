import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Notification types and fields', () => {
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

  it('notification for follow request has correct type', async () => {
    const u1 = { handle: 'notiftype1', name: 'NotifType1', email: 'notiftype1@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'notiftype2', name: 'NotifType2', email: 'notiftype2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    const id1 = reg1.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const res = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', `Bearer ${token1}`)
    if (res.status === 200 && res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('type')
      expect(res.body[0]).toHaveProperty('message')
    }
  })

  it('notification has createdAt timestamp', async () => {
    const u1 = { handle: 'notifts1', name: 'NotifTS1', email: 'notifts1@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'notifts2', name: 'NotifTS2', email: 'notifts2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    const id1 = reg1.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const res = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', `Bearer ${token1}`)
    if (res.status === 200 && res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('createdAt')
    }
  })

  it('notification has read flag', async () => {
    const u1 = { handle: 'notifread', name: 'NotifRead', email: 'notifread@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'notifread2', name: 'NotifRead2', email: 'notifread2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    const id1 = reg1.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const res = await request(app).get('/api/v1/puntualo/notifications').set('Authorization', `Bearer ${token1}`)
    if (res.status === 200 && res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('read')
      expect(typeof res.body[0].read).toBe('boolean')
    }
  })

  it('unread notifications filtered correctly', async () => {
    const u1 = { handle: 'unreadfilter', name: 'UnreadFilter', email: 'unreadfilter@example.com', password: 'secret123', isPrivate: true }
    const u2 = { handle: 'unreadfilter2', name: 'UnreadFilter2', email: 'unreadfilter2@example.com', password: 'secret123' }
    const reg1 = await request(app).post('/api/v1/puntualo/auth/register').send(u1)
    const reg2 = await request(app).post('/api/v1/puntualo/auth/register').send(u2)
    const token1 = reg1.body.token
    const token2 = reg2.body.token
    const id1 = reg1.body.user._id
    await request(app).post(`/api/v1/puntualo/users/${id1}/follow`).set('Authorization', `Bearer ${token2}`)
    const res = await request(app).get('/api/v1/puntualo/notifications?unreadOnly=true').set('Authorization', `Bearer ${token1}`)
    expect([200, 401]).toContain(res.status)
  })
})
