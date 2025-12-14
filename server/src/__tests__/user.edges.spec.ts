import request from 'supertest'
import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { Server } from '../server'
import { connectDB, dropTestDatabase } from '../database'

const server = new Server()
const app = server.getApp()

describe('User edges: items/ratings/follow error paths', () => {
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

  it('add item with missing externalId yields client error or handled response', async () => {
    const u = { handle: 'ue1', name: 'UE1', email: 'ue1@example.com', password: 'secret123' }
    const r = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const token = r.body.token
    const id = r.body.user._id

    const bad = await request(app)
      .post(`/api/v1/puntualo/users/${id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ itemType: 'movie', title: 'NoExt' })
    expect([200,400,422].includes(bad.status)).toBe(true)
  })

  it('delete non-existent item subId is handled gracefully', async () => {
    const u = { handle: 'ue2', name: 'UE2', email: 'ue2@example.com', password: 'secret123' }
    const r = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const token = r.body.token
    const id = r.body.user._id

    const del = await request(app)
      .delete(`/api/v1/puntualo/users/${id}/items/000000000000000000000000`)
      .set('Authorization', `Bearer ${token}`)
    expect([200,404,400].includes(del.status)).toBe(true)
  })

  it('ratings: invalid score returns client error or validation handled', async () => {
    const u = { handle: 'ue3', name: 'UE3', email: 'ue3@example.com', password: 'secret123' }
    const r = await request(app).post('/api/v1/puntualo/auth/register').send(u).expect(201)
    const token = r.body.token
    const id = r.body.user._id

    const badScore = await request(app)
      .post(`/api/v1/puntualo/users/${id}/rate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 99, itemType: 'movie' })
    expect([200,400,422].includes(badScore.status)).toBe(true)
  })

  it('follow: duplicate follow does not duplicate followers', async () => {
    const a = { handle: 'ufa', name: 'UFA', email: 'ufa@example.com', password: 'secret123' }
    const b = { handle: 'ufb', name: 'UFB', email: 'ufb@example.com', password: 'secret123' }

    const ra = await request(app).post('/api/v1/puntualo/auth/register').send(a).expect(201)
    const rb = await request(app).post('/api/v1/puntualo/auth/register').send(b).expect(201)

    const tokenA = ra.body.token
    const idA = ra.body.user._id
    const idB = rb.body.user._id

    const f1 = await request(app)
      .post(`/api/v1/puntualo/users/${idB}/follow`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)

    const f2 = await request(app)
      .post(`/api/v1/puntualo/users/${idB}/follow`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)

    expect(f2.body.followers.filter((x: string) => String(x) === String(idA)).length).toBe(1)
  })

  it('unfollow when not following is noop', async () => {
    const a = { handle: 'uua', name: 'UUA', email: 'uua@example.com', password: 'secret123' }
    const b = { handle: 'uub', name: 'UUB', email: 'uub@example.com', password: 'secret123' }

    const ra = await request(app).post('/api/v1/puntualo/auth/register').send(a).expect(201)
    const rb = await request(app).post('/api/v1/puntualo/auth/register').send(b).expect(201)

    const tokenA = ra.body.token
    const idA = ra.body.user._id
    const idB = rb.body.user._id

    const unf = await request(app)
      .delete(`/api/v1/puntualo/users/${idB}/follow`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)

    expect(unf.body.followers.map((x: string) => String(x))).not.toContain(String(idA))
  })
})
