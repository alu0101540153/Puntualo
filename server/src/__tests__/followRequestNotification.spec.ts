import request from 'supertest'
import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'

import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'
import { NotificationModel } from '../models'

const server = new Server()
const app = server.getApp()

const registerUser = async (payload: any) => {
  const res = await request(app).post('/api/v1/puntualo/auth/register').send(payload).expect(201)
  return { token: res.body.token, user: res.body.user }
}

describe('Follow requests and notifications', () => {
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

  it('handles follow request flow for private accounts and delivers notifications', async () => {
    const { token: tokenAlice, user: alice } = await registerUser({ handle: 'alice', name: 'Alice', email: 'alice@example.com', password: 'secret123' })
    const { token: tokenBob, user: bob } = await registerUser({ handle: 'bob', name: 'Bob', email: 'bob@example.com', password: 'secret123', isPrivate: true })

    const created = await request(app)
      .post('/api/v1/puntualo/follow-requests')
      .set('Authorization', `Bearer ${tokenAlice}`)
      .send({ targetId: bob._id })
      .expect(200)

    expect(created.body.status).toBe('requested')
    expect(created.body.request.status).toBe('pending')

    const followersBefore = await request(app).get(`/api/v1/puntualo/users/${bob._id}/followers`).expect(200)
    expect(followersBefore.body.length).toBe(0)

    const pending = await request(app)
      .get('/api/v1/puntualo/follow-requests/pending')
      .set('Authorization', `Bearer ${tokenBob}`)
      .expect(200)

    expect(pending.body.length).toBe(1)
    expect(pending.body[0].from.handle).toBe(alice.handle)
    const requestId = pending.body[0]._id

    const bobNotifications = await request(app)
      .get('/api/v1/puntualo/notifications')
      .query({ unreadOnly: 'true' })
      .set('Authorization', `Bearer ${tokenBob}`)
      .expect(200)

    expect(bobNotifications.body.length).toBe(1)
    expect(bobNotifications.body[0].type).toBe('follow_request')

    const accepted = await request(app)
      .put(`/api/v1/puntualo/follow-requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${tokenBob}`)
      .expect(200)

    expect(accepted.body.request.status).toBe('accepted')

    const followersAfter = await request(app).get(`/api/v1/puntualo/users/${bob._id}/followers`).expect(200)
    expect(followersAfter.body.some((f: any) => String(f._id) === String(alice._id))).toBe(true)

    const aliceFollowing = await request(app).get(`/api/v1/puntualo/users/${alice._id}/following`).expect(200)
    expect(aliceFollowing.body.some((f: any) => String(f._id) === String(bob._id))).toBe(true)

    const pendingAfter = await request(app)
      .get(`/api/v1/puntualo/follow-requests/check/${bob._id}`)
      .set('Authorization', `Bearer ${tokenAlice}`)
      .expect(200)

    expect(pendingAfter.body.hasPending).toBe(false)

    const aliceNotifications = await request(app)
      .get('/api/v1/puntualo/notifications')
      .set('Authorization', `Bearer ${tokenAlice}`)
      .expect(200)

    const aliceHasAccepted = aliceNotifications.body.some((n: any) => n.type === 'follow_accepted' && String(n.recipient) === String(alice._id))
    expect(aliceHasAccepted).toBe(true)
  })

  it('marks, counts and deletes notifications respecting ownership', async () => {
    const { token: tokenCarol, user: carol } = await registerUser({ handle: 'carol', name: 'Carol', email: 'carol@example.com', password: 'secret123' })
    const { token: tokenDave } = await registerUser({ handle: 'dave', name: 'Dave', email: 'dave@example.com', password: 'secret123' })

    const n1 = await NotificationModel.create({ recipient: carol._id, type: 'follow_request', message: 'Req 1' })
    const n2 = await NotificationModel.create({ recipient: carol._id, type: 'follow_accepted', message: 'Acc 2' })

    const unread = await request(app)
      .get('/api/v1/puntualo/notifications/unread')
      .set('Authorization', `Bearer ${tokenCarol}`)
      .expect(200)

    expect(unread.body.length).toBe(2)

    const count = await request(app)
      .get('/api/v1/puntualo/notifications/count')
      .set('Authorization', `Bearer ${tokenCarol}`)
      .expect(200)

    expect(count.body.count).toBe(2)

    const marked = await request(app)
      .put(`/api/v1/puntualo/notifications/${n1._id}/read`)
      .set('Authorization', `Bearer ${tokenCarol}`)
      .expect(200)

    expect(marked.body.read).toBe(true)

    const countAfterOne = await request(app)
      .get('/api/v1/puntualo/notifications/count')
      .set('Authorization', `Bearer ${tokenCarol}`)
      .expect(200)

    expect(countAfterOne.body.count).toBe(1)

    await request(app)
      .put('/api/v1/puntualo/notifications/mark-all-read')
      .set('Authorization', `Bearer ${tokenCarol}`)
      .expect(200)

    const countAfterAll = await request(app)
      .get('/api/v1/puntualo/notifications/count')
      .set('Authorization', `Bearer ${tokenCarol}`)
      .expect(200)

    expect(countAfterAll.body.count).toBe(0)

    await request(app)
      .delete(`/api/v1/puntualo/notifications/${n2._id}`)
      .set('Authorization', `Bearer ${tokenDave}`)
      .expect(400)

    await request(app)
      .delete(`/api/v1/puntualo/notifications/${n2._id}`)
      .set('Authorization', `Bearer ${tokenCarol}`)
      .expect(200)
  })
})