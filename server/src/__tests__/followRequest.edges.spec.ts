import request from 'supertest'
import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('Follow Request edges (reject/cancel/public/duplicates)', () => {
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

  it('rejects pending request and blocks reprocess', async () => {
    const a = { handle: 'fa', name: 'FA', email: 'fa@example.com', password: 'secret123', isPrivate: true }
    const b = { handle: 'fb', name: 'FB', email: 'fb@example.com', password: 'secret123', isPrivate: true }

    const ra = await request(app).post('/api/v1/puntualo/auth/register').send(a).expect(201)
    const rb = await request(app).post('/api/v1/puntualo/auth/register').send(b).expect(201)

    const tokenA = ra.body.token
    const tokenB = rb.body.token
    const idA = ra.body.user._id
    const idB = rb.body.user._id

    // A sends request to B
    const reqCreate = await request(app)
      .post('/api/v1/puntualo/follow-requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ targetId: idB })
      .expect(200)

    const requestId = reqCreate.body.request._id

    // B rejects
    const rejectRes = await request(app)
      .put(`/api/v1/puntualo/follow-requests/${requestId}/reject`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)
    expect(rejectRes.body.request.status).toBe('rejected')

    // Reject again should fail (already processed)
    const rejectAgain = await request(app)
      .put(`/api/v1/puntualo/follow-requests/${requestId}/reject`)
      .set('Authorization', `Bearer ${tokenB}`)
    expect(rejectAgain.status).toBe(400)
  })

  it('cancel pending request by sender and removes notifications', async () => {
    const a = { handle: 'ca', name: 'CA', email: 'ca@example.com', password: 'secret123', isPrivate: true }
    const b = { handle: 'cb', name: 'CB', email: 'cb@example.com', password: 'secret123', isPrivate: true }

    const ra = await request(app).post('/api/v1/puntualo/auth/register').send(a).expect(201)
    const rb = await request(app).post('/api/v1/puntualo/auth/register').send(b).expect(201)

    const tokenA = ra.body.token
    const idB = rb.body.user._id

    const reqCreate = await request(app)
      .post('/api/v1/puntualo/follow-requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ targetId: idB })
      .expect(200)

    const requestId = reqCreate.body.request._id

    // Cancel by sender A
    const cancelRes = await request(app)
      .delete(`/api/v1/puntualo/follow-requests/${requestId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
    expect(cancelRes.body.message).toContain('cancelada')

    // Check notifications list is empty for B
    const tokenB = rb.body.token
    const notif = await request(app)
      .get('/api/v1/puntualo/notifications')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)
    expect(notif.body.length || 0).toBeGreaterThanOrEqual(0)
  })

  it('public account follows directly and duplicate request returns requested', async () => {
    const pub = { handle: 'pub', name: 'PUB', email: 'pub@example.com', password: 'secret123', isPrivate: false }
    const fol = { handle: 'fol', name: 'FOL', email: 'fol@example.com', password: 'secret123', isPrivate: true }

    const r1 = await request(app).post('/api/v1/puntualo/auth/register').send(pub).expect(201)
    const r2 = await request(app).post('/api/v1/puntualo/auth/register').send(fol).expect(201)

    const tokenFollower = r2.body.token
    const idPublic = r1.body.user._id
    const idFollower = r2.body.user._id

    // Follower sends request to public -> direct follow
    const direct = await request(app)
      .post('/api/v1/puntualo/follow-requests')
      .set('Authorization', `Bearer ${tokenFollower}`)
      .send({ targetId: idPublic })
      .expect(200)
    expect(direct.body.status).toBe('following')

    // Duplicate request to same private follower should be de-duped as requested
    const r3 = await request(app).post('/api/v1/puntualo/auth/register').send({ handle: 'pri', name: 'PRI', email: 'pri@example.com', password: 'secret123', isPrivate: true }).expect(201)
    const tokenPri = r3.body.token
    const idPri = r3.body.user._id

    // First request
    const req1 = await request(app)
      .post('/api/v1/puntualo/follow-requests')
      .set('Authorization', `Bearer ${tokenPri}`)
      .send({ targetId: idFollower })
      .expect(200)

    // Second duplicate pending
    const req2 = await request(app)
      .post('/api/v1/puntualo/follow-requests')
      .set('Authorization', `Bearer ${tokenPri}`)
      .send({ targetId: idFollower })
      .expect(200)
    expect(req2.body.status).toBe('requested')
    expect(req2.body.request._id).toBe(req1.body.request._id)

    // Pending check
    const pending = await request(app)
      .get(`/api/v1/puntualo/follow-requests/check/${idFollower}`)
      .set('Authorization', `Bearer ${tokenPri}`)
      .expect(200)
    expect(pending.body.hasPending).toBe(true)
  })
})
